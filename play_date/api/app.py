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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
