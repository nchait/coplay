from flask_socketio import SocketIO, emit, join_room, leave_room, disconnect
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
from datetime import datetime
from database import db, GameSession, User
import uuid

# Initialize SocketIO
socketio = SocketIO(cors_allowed_origins="*")

# Store active connections and game sessions
active_connections = {}  # {player_id: session_id}
game_sessions = {}  # {session_id: {players: [], game_data: {}, status: 'waiting'}}

@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')
    emit('connected', {'message': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')
    player_id = None
    
    # Find player ID from active connections
    for pid, sid in active_connections.items():
        if sid == request.sid:
            player_id = pid
            break
    
    if player_id:
        # Remove from active connections
        if player_id in active_connections:
            session_id = active_connections[player_id]
            del active_connections[player_id]
            
            # Handle player leaving game session
            if session_id in game_sessions:
                game_sessions[session_id]['players'] = [
                    p for p in game_sessions[session_id]['players'] 
                    if p['id'] != player_id
                ]
                
                # Notify other players
                emit('player_leave', {
                    'playerId': player_id,
                    'reason': 'disconnect'
                }, room=session_id)
                
                # Clean up empty sessions
                if not game_sessions[session_id]['players']:
                    del game_sessions[session_id]

@socketio.on('join_session')
def handle_join_session(data):
    try:
        session_id = data.get('sessionId')
        player_id = data.get('playerId')
        player_name = data.get('playerName', 'Player')
        
        if not session_id or not player_id:
            emit('error', {'message': 'Missing sessionId or playerId'})
            return
        
        # Store connection
        active_connections[player_id] = request.sid
        
        # Join room
        join_room(session_id)
        
        # Initialize or update game session
        if session_id not in game_sessions:
            game_sessions[session_id] = {
                'players': [],
                'game_data': None,
                'status': 'waiting',
                'created_at': datetime.now().isoformat()
            }
        
        # Add player to session
        player_info = {
            'id': player_id,
            'name': player_name,
            'isReady': False,
            'isConnected': True,
            'joined_at': datetime.now().isoformat()
        }
        
        # Check if player already exists in session
        existing_player = None
        for p in game_sessions[session_id]['players']:
            if p['id'] == player_id:
                existing_player = p
                break
        
        if existing_player:
            # Update existing player
            existing_player['isConnected'] = True
            existing_player['joined_at'] = datetime.now().isoformat()
        else:
            # Add new player
            game_sessions[session_id]['players'].append(player_info)
        
        # Notify all players in session
        emit('player_join', player_info, room=session_id)
        
        # Send current session state to the joining player
        emit('session_state', {
            'sessionId': session_id,
            'players': game_sessions[session_id]['players'],
            'gameData': game_sessions[session_id]['game_data'],
            'status': game_sessions[session_id]['status']
        })
        
        print(f'Player {player_id} joined session {session_id}')
        
    except Exception as e:
        print(f'Error in join_session: {str(e)}')
        emit('error', {'message': 'Failed to join session'})

@socketio.on('leave_session')
def handle_leave_session(data):
    try:
        session_id = data.get('sessionId')
        player_id = data.get('playerId')
        
        if not session_id or not player_id:
            emit('error', {'message': 'Missing sessionId or playerId'})
            return
        
        # Remove from active connections
        if player_id in active_connections:
            del active_connections[player_id]
        
        # Leave room
        leave_room(session_id)
        
        # Remove player from session
        if session_id in game_sessions:
            game_sessions[session_id]['players'] = [
                p for p in game_sessions[session_id]['players'] 
                if p['id'] != player_id
            ]
            
            # Notify other players
            emit('player_leave', {
                'playerId': player_id,
                'reason': 'leave'
            }, room=session_id)
            
            # Clean up empty sessions
            if not game_sessions[session_id]['players']:
                del game_sessions[session_id]
        
        print(f'Player {player_id} left session {session_id}')
        
    except Exception as e:
        print(f'Error in leave_session: {str(e)}')
        emit('error', {'message': 'Failed to leave session'})

@socketio.on('player_ready')
def handle_player_ready(data):
    try:
        session_id = data.get('sessionId')
        player_id = data.get('playerId')
        is_ready = data.get('isReady', False)
        
        if not session_id or not player_id:
            emit('error', {'message': 'Missing sessionId or playerId'})
            return
        
        # Update player ready status
        if session_id in game_sessions:
            for player in game_sessions[session_id]['players']:
                if player['id'] == player_id:
                    player['isReady'] = is_ready
                    break
            
            # Notify all players
            emit('player_ready', {
                'playerId': player_id,
                'isReady': is_ready
            }, room=session_id)
        
        print(f'Player {player_id} ready status: {is_ready}')
        
    except Exception as e:
        print(f'Error in player_ready: {str(e)}')
        emit('error', {'message': 'Failed to update ready status'})

@socketio.on('game_update')
def handle_game_update(data):
    try:
        session_id = data.get('sessionId')
        player_id = data.get('playerId')
        game_data = data.get('gameData')
        player_action = data.get('playerAction')
        
        if not session_id or not player_id or not game_data:
            emit('error', {'message': 'Missing required data'})
            return
        
        # Update game data in session
        if session_id in game_sessions:
            game_sessions[session_id]['game_data'] = game_data
            game_sessions[session_id]['status'] = 'active'
            
            # Broadcast to all players in session (except sender)
            emit('game_update', {
                'gameData': game_data,
                'playerAction': player_action,
                'timestamp': datetime.now().isoformat()
            }, room=session_id, include_self=False)
        
        print(f'Game update from player {player_id} in session {session_id}')
        
    except Exception as e:
        print(f'Error in game_update: {str(e)}')
        emit('error', {'message': 'Failed to update game'})

@socketio.on('communication')
def handle_communication(data):
    try:
        session_id = data.get('sessionId')
        player_id = data.get('playerId')
        message = data.get('message')
        message_type = data.get('messageType', 'instruction')
        to_player = data.get('toPlayer')
        
        if not session_id or not player_id or not message:
            emit('error', {'message': 'Missing required data'})
            return
        
        # Broadcast communication to session
        emit('communication', {
            'message': message,
            'fromPlayer': player_id,
            'toPlayer': to_player,
            'messageType': message_type,
            'timestamp': datetime.now().isoformat()
        }, room=session_id)
        
        print(f'Communication from player {player_id} in session {session_id}')
        
    except Exception as e:
        print(f'Error in communication: {str(e)}')
        emit('error', {'message': 'Failed to send communication'})

@socketio.on('heartbeat')
def handle_heartbeat(data):
    try:
        player_id = data.get('playerId')
        timestamp = data.get('timestamp')
        
        if player_id in active_connections:
            # Update last seen time
            for session_id, session in game_sessions.items():
                for player in session['players']:
                    if player['id'] == player_id:
                        player['last_seen'] = datetime.now().isoformat()
                        break
        
        # Respond with pong
        emit('pong', {'timestamp': datetime.now().isoformat()})
        
    except Exception as e:
        print(f'Error in heartbeat: {str(e)}')

@socketio.on('create_session')
def handle_create_session(data):
    try:
        game_type = data.get('gameType')
        player_id = data.get('playerId')
        player_name = data.get('playerName', 'Player')
        
        if not game_type or not player_id:
            emit('error', {'message': 'Missing gameType or playerId'})
            return
        
        # Create new session
        session_id = f"session-{uuid.uuid4().hex[:8]}"
        
        game_sessions[session_id] = {
            'players': [{
                'id': player_id,
                'name': player_name,
                'isReady': False,
                'isConnected': True,
                'joined_at': datetime.now().isoformat()
            }],
            'game_data': None,
            'status': 'waiting',
            'game_type': game_type,
            'created_at': datetime.now().isoformat()
        }
        
        # Store connection
        active_connections[player_id] = request.sid
        
        # Join room
        join_room(session_id)
        
        # Send session created response
        emit('session_created', {
            'sessionId': session_id,
            'gameType': game_type,
            'players': game_sessions[session_id]['players']
        })
        
        print(f'Session {session_id} created by player {player_id}')
        
    except Exception as e:
        print(f'Error in create_session: {str(e)}')
        emit('error', {'message': 'Failed to create session'})

def get_active_sessions():
    """Get list of active game sessions"""
    return {
        session_id: {
            'gameType': session['game_type'],
            'players': len(session['players']),
            'maxPlayers': 2,
            'status': session['status'],
            'createdAt': session['created_at']
        }
        for session_id, session in game_sessions.items()
    }
