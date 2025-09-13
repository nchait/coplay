from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from dotenv import load_dotenv
import os
from datetime import timedelta
from database import db, init_db, User, GameSession, Match

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://playdate_user:playdate_password@db:5432/playdate_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# JWT configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)  # Token expires in 7 days

# Initialize extensions
jwt = JWTManager(app)
init_db(app)

@app.route('/')
def hello():
    return jsonify({
        "message": "Welcome to PlayDate API!",
        "version": "1.0.0",
        "status": "running"
    })

@app.route('/health')
def health_check():
    try:
        # Test database connection
        from sqlalchemy import text
        db.session.execute(text('SELECT 1'))
        return jsonify({"status": "healthy", "database": "connected"}), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "database": "disconnected", "error": str(e)}), 503

# Authentication endpoints
@app.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Name, email, and password are required"}), 400

        # Validate password strength
        password = data['password']
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters long"}), 400

        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({"error": "User with this email already exists"}), 409

        new_user = User(
            name=data['name'],
            email=data['email'],
            age=data.get('age'),
            bio=data.get('bio', ''),
            city=data.get('city'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            interests=data.get('interests', []),
            photos=data.get('photos', []),
            preferences=data.get('preferences', {})
        )

        # Set password hash
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        # Create access token (convert ID to string for JWT)
        access_token = create_access_token(identity=str(new_user.id))

        return jsonify({
            "message": "User registered successfully",
            "user": new_user.to_dict(),
            "access_token": access_token
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email and password are required"}), 400

        user = User.query.filter_by(email=data['email'], is_active=True).first()
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        # Check password
        if not user.check_password(data['password']):
            return jsonify({"error": "Invalid email or password"}), 401

        # Create access token (convert ID to string for JWT)
        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            "message": "Login successful",
            "user": user.to_dict(),
            "access_token": access_token
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user_id = int(get_jwt_identity())  # Convert string back to int
        user = User.query.filter_by(id=current_user_id, is_active=True).first()

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "user": user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/users', methods=['GET'])
def get_users():
    try:
        users = User.query.filter_by(is_active=True).all()
        return jsonify({"users": [user.to_dict() for user in users]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = User.query.filter_by(id=user_id, is_active=True).first()
        if user:
            return jsonify({"user": user.to_dict()})
        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'email' not in data:
            return jsonify({"error": "Name and email are required"}), 400

        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({"error": "User with this email already exists"}), 409

        new_user = User(
            name=data['name'],
            email=data['email'],
            age=data.get('age'),
            bio=data.get('bio'),
            city=data.get('city'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            interests=data.get('interests', []),
            photos=data.get('photos', []),
            preferences=data.get('preferences', {})
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"user": new_user.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    try:
        current_user_id = int(get_jwt_identity())  # Convert string back to int

        # Users can only update their own profile
        if current_user_id != user_id:
            return jsonify({"error": "You can only update your own profile"}), 403

        user = User.query.filter_by(id=user_id, is_active=True).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Update user fields
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            # Check if email is already taken by another user
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({"error": "Email already taken"}), 409
            user.email = data['email']
        if 'password' in data:
            # Update password
            new_password = data['password']
            if len(new_password) < 6:
                return jsonify({"error": "Password must be at least 6 characters long"}), 400
            user.set_password(new_password)
        if 'age' in data:
            user.age = data['age']
        if 'bio' in data:
            user.bio = data['bio']
        if 'city' in data:
            user.city = data['city']
        if 'latitude' in data:
            user.latitude = data['latitude']
        if 'longitude' in data:
            user.longitude = data['longitude']
        if 'interests' in data:
            user.interests = data['interests']
        if 'photos' in data:
            user.photos = data['photos']
        if 'preferences' in data:
            user.preferences = data['preferences']

        db.session.commit()
        return jsonify({"user": user.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    try:
        current_user_id = int(get_jwt_identity())  # Convert string back to int

        # Users can only delete their own account
        if current_user_id != user_id:
            return jsonify({"error": "You can only delete your own account"}), 403

        user = User.query.filter_by(id=user_id, is_active=True).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Soft delete - set is_active to False
        user.is_active = False
        db.session.commit()

        return jsonify({"message": "Account deactivated successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Game Session Management Endpoints
@app.route('/games/sessions', methods=['POST'])
@jwt_required()
def create_game_session():
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or 'gameType' not in data:
            return jsonify({"error": "Game type is required"}), 400
        
        # Create new game session
        new_session = GameSession(
            match_id=data.get('matchId', f'match-{current_user_id}'),
            game_type=data['gameType'],
            players=[str(current_user_id)],
            status='waiting',
            game_data=data.get('gameData', {})
        )
        
        db.session.add(new_session)
        db.session.commit()
        
        return jsonify({
            "message": "Game session created successfully",
            "session": new_session.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/games/sessions/<session_id>', methods=['GET'])
@jwt_required()
def get_game_session(session_id):
    try:
        session = GameSession.query.filter_by(id=session_id).first()
        if not session:
            return jsonify({"error": "Game session not found"}), 404
        
        return jsonify({"session": session.to_dict()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/games/sessions/<session_id>/join', methods=['POST'])
@jwt_required()
def join_game_session(session_id):
    try:
        current_user_id = int(get_jwt_identity())
        session = GameSession.query.filter_by(id=session_id).first()
        
        if not session:
            return jsonify({"error": "Game session not found"}), 404
        
        if len(session.players) >= 2:
            return jsonify({"error": "Game session is full"}), 400
        
        if str(current_user_id) not in session.players:
            session.players.append(str(current_user_id))
            db.session.commit()
        
        return jsonify({
            "message": "Joined game session successfully",
            "session": session.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/games/sessions/<session_id>/leave', methods=['POST'])
@jwt_required()
def leave_game_session(session_id):
    try:
        current_user_id = int(get_jwt_identity())
        session = GameSession.query.filter_by(id=session_id).first()
        
        if not session:
            return jsonify({"error": "Game session not found"}), 404
        
        if str(current_user_id) in session.players:
            session.players.remove(str(current_user_id))
            db.session.commit()
        
        return jsonify({"message": "Left game session successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/games/sessions/<session_id>/state', methods=['PUT'])
@jwt_required()
def update_game_state(session_id):
    try:
        current_user_id = int(get_jwt_identity())
        session = GameSession.query.filter_by(id=session_id).first()
        
        if not session:
            return jsonify({"error": "Game session not found"}), 404
        
        if str(current_user_id) not in session.players:
            return jsonify({"error": "You are not part of this game session"}), 403
        
        data = request.get_json()
        if not data or 'gameData' not in data:
            return jsonify({"error": "Game data is required"}), 400
        
        # Update game data
        session.game_data = data['gameData']
        if data.get('status'):
            session.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            "message": "Game state updated successfully",
            "session": session.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/games/sessions/active', methods=['GET'])
def get_active_game_sessions():
    try:
        # Simple implementation without WebSocket
        sessions = GameSession.query.filter_by(status='waiting').all()
        active_sessions = {
            session.id: {
                'gameType': session.game_type,
                'players': len(session.players),
                'maxPlayers': 2,
                'status': session.status,
                'createdAt': session.created_at.isoformat() if session.created_at else None
            }
            for session in sessions
        }
        return jsonify({"sessions": active_sessions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    try:
        current_user_id = get_jwt_identity()
        
        # Get all users except the current user
        users = User.query.filter(User.id != current_user_id).all()
        
        user_list = []
        for user in users:
            user_list.append({
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'isOnline': True,  # For now, assume all users are online
                'lastSeen': user.created_at.isoformat() if user.created_at else None
            })
        
        return jsonify({"users": user_list})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/games/challenge', methods=['POST'])
@jwt_required()
def send_game_challenge():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        challenged_user_id = data.get('challengedUserId')
        game_type = data.get('gameType')
        
        if not challenged_user_id or not game_type:
            return jsonify({"error": "Missing required fields"}), 400
        
        # Check if challenged user exists
        challenged_user = User.query.get(challenged_user_id)
        if not challenged_user:
            return jsonify({"error": "User not found"}), 404
        
        # Check if there's already a pending challenge between these users
        existing_challenge = GameSession.query.filter(
            GameSession.challenger_id == current_user_id,
            GameSession.challenged_id == challenged_user_id,
            GameSession.status == 'pending'
        ).first()
        
        if existing_challenge:
            return jsonify({"error": "Challenge already sent"}), 400
        
        # Create a new game session with pending status
        game_session = GameSession(
            game_type=game_type,
            status='pending',
            challenger_id=current_user_id,
            challenged_id=challenged_user_id
        )
        
        db.session.add(game_session)
        db.session.commit()
        
        return jsonify({
            "message": "Challenge sent successfully",
            "sessionId": game_session.id,
            "challengedUser": {
                "id": challenged_user.id,
                "name": challenged_user.name
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/games/challenge/<int:session_id>/respond', methods=['POST'])
@jwt_required()
def respond_to_challenge(session_id):
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        response = data.get('response')  # 'accept' or 'decline'
        
        if response not in ['accept', 'decline']:
            return jsonify({"error": "Invalid response. Must be 'accept' or 'decline'"}), 400
        
        # Find the game session
        game_session = GameSession.query.get(session_id)
        if not game_session:
            return jsonify({"error": "Game session not found"}), 404
        
        # Check if current user is the challenged user
        if game_session.challenged_id != current_user_id:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Check if session is still pending
        if game_session.status != 'pending':
            return jsonify({"error": "Challenge already responded to"}), 400
        
        if response == 'accept':
            # Accept the challenge - create the actual game session
            game_session.status = 'waiting'
            game_session.players = [game_session.challenger_id, game_session.challenged_id]
            
            db.session.commit()
            
            return jsonify({
                "message": "Challenge accepted",
                "sessionId": game_session.id,
                "gameType": game_session.game_type
            })
        else:
            # Decline the challenge
            game_session.status = 'declined'
            db.session.commit()
            
            return jsonify({
                "message": "Challenge declined"
            })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/games/challenges/pending', methods=['GET'])
@jwt_required()
def get_pending_challenges():
    try:
        current_user_id = get_jwt_identity()
        
        # Get challenges sent by current user
        sent_challenges = GameSession.query.filter(
            GameSession.challenger_id == current_user_id,
            GameSession.status == 'pending'
        ).all()
        
        # Get challenges received by current user
        received_challenges = GameSession.query.filter(
            GameSession.challenged_id == current_user_id,
            GameSession.status == 'pending'
        ).all()
        
        def format_challenge(challenge, is_sent=False):
            challenger = User.query.get(challenge.challenger_id)
            challenged = User.query.get(challenge.challenged_id)
            
            return {
                'sessionId': challenge.id,
                'gameType': challenge.game_type,
                'isSent': is_sent,
                'challenger': {
                    'id': challenger.id,
                    'name': challenger.name
                } if challenger else None,
                'challenged': {
                    'id': challenged.id,
                    'name': challenged.name
                } if challenged else None,
                'createdAt': challenge.created_at.isoformat() if challenge.created_at else None
            }
        
        return jsonify({
            "sentChallenges": [format_challenge(c, True) for c in sent_challenges],
            "receivedChallenges": [format_challenge(c, False) for c in received_challenges]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
