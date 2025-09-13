from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import bcrypt

db = SQLAlchemy()

def init_db(app):
    """Initialize database with Flask app"""
    db.init_app(app)
    
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created successfully!")

# User model
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)
    age = db.Column(db.Integer, nullable=True)
    bio = db.Column(db.Text, nullable=True)
    city = db.Column(db.String(100), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    interests = db.Column(db.JSON, nullable=True)  # Store as JSON array
    photos = db.Column(db.JSON, nullable=True)     # Store photo URLs as JSON array
    preferences = db.Column(db.JSON, nullable=True) # Store preferences as JSON
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def set_password(self, password):
        """Hash and set password"""
        if password:
            password_bytes = password.encode('utf-8')
            salt = bcrypt.gensalt()
            self.password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')

    def check_password(self, password):
        """Check if provided password matches hash"""
        if not self.password_hash or not password:
            return False
        password_bytes = password.encode('utf-8')
        hash_bytes = self.password_hash.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hash_bytes)

    def to_dict(self, include_sensitive=False):
        """Convert user object to dictionary"""
        user_dict = {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'age': self.age,
            'bio': self.bio,
            'city': self.city,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'interests': self.interests or [],
            'photos': self.photos or [],
            'preferences': self.preferences or {},
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

        # Only include sensitive data if explicitly requested (for debugging)
        if include_sensitive:
            user_dict['has_password'] = bool(self.password_hash)

        return user_dict

    def to_public_dict(self):
        """Convert user object to public dictionary (for matching/discovery)"""
        return {
            'id': self.id,
            'name': self.name,
            'age': self.age,
            'bio': self.bio,
            'city': self.city,
            'interests': self.interests or [],
            'photos': self.photos or []
        }

    def __repr__(self):
        return f'<User {self.email}>'

# Game Session model
class GameSession(db.Model):
    __tablename__ = 'game_sessions'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID
    match_id = db.Column(db.String(36), nullable=True)  # Optional match ID
    game_type = db.Column(db.String(50), nullable=False)  # PuzzleConnect, GuessAndDraw, etc.
    players = db.Column(db.JSON, nullable=False)  # Array of player IDs
    status = db.Column(db.String(20), default='waiting', nullable=False)  # waiting, active, completed, abandoned
    game_data = db.Column(db.JSON, nullable=True)  # Game-specific data
    result = db.Column(db.JSON, nullable=True)     # Game result data
    started_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        """Convert game session object to dictionary"""
        return {
            'id': self.id,
            'matchId': self.match_id,
            'gameType': self.game_type,
            'players': self.players or [],
            'status': self.status,
            'gameData': self.game_data or {},
            'result': self.result or {},
            'startedAt': self.started_at.isoformat() if self.started_at else None,
            'completedAt': self.completed_at.isoformat() if self.completed_at else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<GameSession {self.id}>'

# Match model
class Match(db.Model):
    __tablename__ = 'matches'
    
    id = db.Column(db.Integer, primary_key=True)
    user1_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='pending', nullable=False)  # pending, matched, expired
    compatibility_score = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    matched_at = db.Column(db.DateTime, nullable=True)
    expires_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    user1 = db.relationship('User', foreign_keys=[user1_id], backref='matches_as_user1')
    user2 = db.relationship('User', foreign_keys=[user2_id], backref='matches_as_user2')
    
    def to_dict(self):
        """Convert match object to dictionary"""
        return {
            'id': self.id,
            'user1_id': self.user1_id,
            'user2_id': self.user2_id,
            'status': self.status,
            'compatibility_score': self.compatibility_score,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'matched_at': self.matched_at.isoformat() if self.matched_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }
    
    def __repr__(self):
        return f'<Match {self.user1_id}-{self.user2_id}>'
