# Authentication Troubleshooting Guide

## Error: "Token validation failed, removing stored token"

This error occurs when the React Native app cannot validate the stored JWT token with the server. Here are the most common causes and solutions:

### 1. **Server Not Running** ⚠️
**Problem**: Your backend server is not running on port 5000.

**Solution**:
```bash
# Navigate to your server directory
cd path/to/your/server

# Start the server (adjust command based on your setup)
npm start
# or
node server.js
# or
python app.py
```

**Verify**: Check that you see server startup logs and it's listening on port 5000.

### 2. **Network Connectivity Issues** 🌐
**Problem**: React Native can't reach `localhost:5000` from the emulator/device.

**Solutions by Platform**:

#### Android Emulator:
```typescript
// In src/services/api.ts, use:
const API_BASE_URL = 'http://10.0.2.2:5000';
```

#### iOS Simulator:
```typescript
// In src/services/api.ts, use:
const API_BASE_URL = 'http://localhost:5000';
```

#### Physical Device:
```typescript
// Replace YOUR_COMPUTER_IP with your actual IP address
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5000';
```

**Find Your Computer's IP**:
- **Windows**: `ipconfig` (look for IPv4 Address)
- **Mac/Linux**: `ifconfig` or `ip addr show`

### 3. **Server Endpoint Issues** 🔧
**Problem**: Server doesn't have the correct authentication endpoints.

**Required Endpoints**:
- `GET /auth/me` - Validate token and return user info
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout (optional)

**Expected Response Format**:
```json
// GET /auth/me success response
{
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "user@example.com",
    "displayName": "Display Name"
  }
}

// Error response
{
  "error": "Token expired"
}
```

### 4. **Token Format Issues** 🔑
**Problem**: Server expects different token format or header.

**Check Token Header**:
The app sends tokens as: `Authorization: Bearer <token>`

**Server Validation**:
```javascript
// Example Express.js middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

### 5. **CORS Issues** 🚫
**Problem**: Server blocks requests from React Native app.

**Solution** (Express.js example):
```javascript
const cors = require('cors');
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));
```

## Quick Debugging Steps

### Step 1: Add Test Component
Add the `AuthTestComponent` to any screen temporarily:

```tsx
import AuthTestComponent from '../components/AuthTestComponent';

// In your render method:
<AuthTestComponent />
```

### Step 2: Test Server Connection
1. Use "Test Server Connection" button
2. Check console logs for detailed error messages
3. Verify server is reachable

### Step 3: Check Token
1. Use "Check Token" button to see if token exists
2. Use "Test Token Validation" to test server validation
3. Check console logs for API request/response details

### Step 4: Monitor Console Logs
Look for these log messages:
```
AuthContext: Checking for stored token...
API Request: GET http://10.0.2.2:5000/auth/me
API Response: 200 OK
AuthContext: Token is valid, logging user in automatically
```

## Common Error Messages

### "Network request failed"
- **Cause**: Can't reach server
- **Fix**: Check server is running and URL is correct

### "HTTP 401: Unauthorized"
- **Cause**: Token is expired or invalid
- **Fix**: Login again to get new token

### "HTTP 404: Not Found"
- **Cause**: Server endpoint doesn't exist
- **Fix**: Implement `/auth/me` endpoint on server

### "HTTP 500: Internal Server Error"
- **Cause**: Server error during token validation
- **Fix**: Check server logs for detailed error

## Environment-Specific Solutions

### Development Environment
```typescript
// src/services/api.ts
const API_BASE_URL = __DEV__
  ? Platform.OS === 'android' 
    ? 'http://10.0.2.2:5000'  // Android emulator
    : 'http://localhost:5000'  // iOS simulator
  : 'https://your-production-api.com';
```

### Production Environment
- Use HTTPS URLs
- Implement proper error handling
- Add retry logic for network failures

## Testing Checklist

- [ ] Server is running on port 5000
- [ ] Server has `/auth/me` endpoint
- [ ] Server accepts `Bearer` token format
- [ ] CORS is configured correctly
- [ ] Network connectivity works
- [ ] Token is stored correctly
- [ ] Token validation returns user object

## Still Having Issues?

1. **Check Server Logs**: Look for incoming requests and errors
2. **Use Network Inspector**: Enable network debugging in React Native
3. **Test with Postman**: Manually test your API endpoints
4. **Check Firewall**: Ensure port 5000 is not blocked
5. **Try Different URLs**: Test with your computer's IP address

## Quick Fix Commands

```bash
# Check if server is running
curl http://localhost:5000/health

# Test auth endpoint manually
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/auth/me

# Find your IP address
# Windows:
ipconfig
# Mac/Linux:
ifconfig | grep inet
```

Remember to replace `YOUR_TOKEN` with an actual JWT token from your app's storage.
