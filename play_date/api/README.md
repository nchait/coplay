# PlayDate Flask API

A Flask REST API with PostgreSQL database and Docker support for the PlayDate project.

## Features

- RESTful API endpoints for user management and authentication
- PostgreSQL database with SQLAlchemy ORM
- CORS enabled for frontend integration
- Docker containerization with multi-service setup
- Health check endpoints with database connectivity
- Production-ready with Gunicorn
- Database migrations and initialization

## API Endpoints

### General
- `GET /` - Welcome message and API info
- `GET /health` - Health check endpoint with database status

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### User Management
- `GET /users` - Get all active users
- `GET /users/<id>` - Get user by ID
- `POST /users` - Create new user (alternative to register)
- `PUT /users/<id>` - Update user profile
- `DELETE /users/<id>` - Soft delete user (deactivate)

## Quick Start

### Using Docker Compose (Recommended)

1. Build and run the containers:
```bash
docker-compose up --build
```

2. The services will be available at:
   - API: `http://localhost:5000`
   - PostgreSQL: `localhost:5432`

3. The database will be automatically initialized with the required tables

### Using Docker directly

1. Build the image:
```bash
docker build -t playdate-api .
```

2. Run the container:
```bash
docker run -p 5000:5000 playdate-api
```

### Local Development (without Docker)

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```

## Testing the API

Test the endpoints using curl:

```bash
# Get all users
curl http://localhost:5000/users

# Create a new user
curl -X POST http://localhost:5000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Get user by ID
curl http://localhost:5000/users/1

# Update user
curl -X PUT http://localhost:5000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "email": "jane@example.com"}'

# Delete user
curl -X DELETE http://localhost:5000/users/1
```

## Environment Variables

- `PORT` - Port to run the application (default: 5000)
- `FLASK_DEBUG` - Enable debug mode (default: False)

## Project Structure

```
playdate/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── Dockerfile         # Docker configuration
├── docker-compose.yml # Docker Compose configuration
├── .dockerignore      # Docker ignore file
└── README.md          # This file
```
