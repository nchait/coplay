#!/bin/bash

# Script to restart the API with the JWT fixes

echo "🔄 Restarting PlayDate API with JWT fixes..."

# Stop the current containers
echo "📦 Stopping Docker containers..."
docker-compose down

# Rebuild and start the containers
echo "🏗️  Rebuilding and starting containers..."
docker-compose up -d --build

# Wait a moment for the container to start
echo "⏳ Waiting for container to start..."
sleep 5

# Test if the API is responding
echo "🧪 Testing API connectivity..."
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ API is running successfully at http://localhost:5000"
    echo "🔑 JWT token creation has been fixed (user ID now converted to string)"
    echo "📱 Your React Native app should now be able to validate tokens properly"
else
    echo "❌ API is not responding. Check the logs:"
    echo "   docker-compose logs api"
fi

echo ""
echo "📋 Next steps:"
echo "1. Test login in your React Native app"
echo "2. Close and reopen the app to test persistent auth"
echo "3. Check console logs for 'Token is valid, logging user in automatically'"
echo ""
echo "🐛 If you still have issues, check:"
echo "   docker-compose logs api"
echo "   docker ps"
