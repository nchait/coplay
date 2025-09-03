# Docker API Troubleshooting Guide

## "Failed to fetch" Error with Docker Backend

When your API is running in Docker and you get "failed to fetch" errors, here are the steps to diagnose and fix the issue:

## 1. Verify Docker Container is Running

```bash
# Check if your API container is running
docker ps

# You should see something like:
# CONTAINER ID   IMAGE     COMMAND       CREATED       STATUS       PORTS                    NAMES
# abc123def456   api       "python..."   2 hours ago   Up 2 hours   0.0.0.0:5000->5000/tcp   api-container
```

If you don't see your container:

```bash
# Start your Docker services
cd play_date/api
docker-compose up -d

# Check logs if there are issues
docker-compose logs
```

## 2. Test Server Connectivity from Host

```bash
# Test if the server responds on localhost:5000
curl http://localhost:5000/health

# If that fails, try:
curl http://127.0.0.1:5000/health

# Test the auth endpoint specifically
curl http://localhost:5000/auth/me
# Should return: {"msg": "Missing Authorization Header"}
```

## 3. Check Docker Port Mapping

Your `docker-compose.yml` should have:

```yaml
services:
  api:
    ports:
      - "5000:5000"  # This maps host port 5000 to container port 5000
```

## 4. Platform-Specific Solutions

### iOS Simulator
- **URL**: `http://localhost:5000`
- **Why**: iOS simulator shares the host network

### Android Emulator
- **URL**: `http://10.0.2.2:5000`
- **Why**: `10.0.2.2` is the special IP that maps to the host's localhost

### Physical Device
- **URL**: `http://YOUR_COMPUTER_IP:5000`
- **Find IP**: 
  ```bash
  # Windows
  ipconfig
  
  # Mac/Linux
  ifconfig | grep inet
  ```

## 5. Common Docker Issues

### Container Not Starting
```bash
# Check container logs
docker-compose logs api

# Common issues:
# - Port already in use
# - Environment variables missing
# - Database connection failed
```

### Port Already in Use
```bash
# Find what's using port 5000
lsof -i :5000

# Kill the process if needed
kill -9 <PID>

# Or use a different port in docker-compose.yml
ports:
  - "5001:5000"  # Use port 5001 on host
```

### Network Issues
```bash
# Check Docker networks
docker network ls

# Inspect the network
docker network inspect <network_name>
```

## 6. React Native Specific Fixes

### Update API Configuration
The app now automatically detects the platform and uses the correct URL:

```typescript
// This is already implemented in src/services/api.ts
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';  // Android emulator
  } else {
    return 'http://localhost:5000';  // iOS simulator
  }
};
```

### Clear React Native Cache
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Or for Expo
expo start -c
```

## 7. Testing Steps

### Step 1: Verify Docker
```bash
cd play_date/api
docker-compose ps
# Should show running containers
```

### Step 2: Test from Terminal
```bash
# Test health endpoint
curl http://localhost:5000/health

# Test auth endpoint (should return auth error, not connection error)
curl http://localhost:5000/auth/me
```

### Step 3: Test from React Native
Add the `AuthTestComponent` to your app and use:
- "Test Server Connection" button
- Check console logs for detailed errors

### Step 4: Check Logs
```bash
# API container logs
docker-compose logs api

# React Native logs
npx react-native log-android  # Android
npx react-native log-ios      # iOS
```

## 8. Quick Fixes

### Fix 1: Restart Everything
```bash
# Stop all containers
docker-compose down

# Start fresh
docker-compose up -d

# Restart React Native
npx react-native start --reset-cache
```

### Fix 2: Check Firewall
```bash
# Make sure port 5000 is not blocked
# Windows: Check Windows Firewall
# Mac: System Preferences > Security & Privacy > Firewall
# Linux: sudo ufw status
```

### Fix 3: Use Computer IP
If localhost doesn't work, find your computer's IP:

```bash
# Get your IP address
ipconfig getifaddr en0  # Mac
hostname -I             # Linux
ipconfig               # Windows
```

Then update the API URL to use your actual IP address.

## 9. Environment Variables

Make sure your Docker container has the right environment variables:

```yaml
# docker-compose.yml
services:
  api:
    environment:
      - FLASK_ENV=development
      - DATABASE_URL=sqlite:///app.db
      - JWT_SECRET_KEY=your-secret-key
```

## 10. CORS Configuration

Your Flask app should have CORS enabled (which it does):

```python
from flask_cors import CORS
CORS(app)  # This allows all origins in development
```

## Debugging Checklist

- [ ] Docker container is running (`docker ps`)
- [ ] Port 5000 is mapped correctly in docker-compose.yml
- [ ] Server responds to `curl http://localhost:5000/health`
- [ ] React Native is using correct URL for platform
- [ ] No firewall blocking port 5000
- [ ] CORS is enabled in Flask app
- [ ] JWT_SECRET_KEY is set in environment

## Still Not Working?

1. **Check Docker logs**: `docker-compose logs api`
2. **Try different port**: Change to 5001 in docker-compose.yml
3. **Use computer IP**: Replace localhost with your actual IP
4. **Test with Postman**: Verify API works outside React Native
5. **Check React Native logs**: Look for specific error messages

The most common issue is platform-specific URL problems, which should now be fixed with the automatic platform detection.
