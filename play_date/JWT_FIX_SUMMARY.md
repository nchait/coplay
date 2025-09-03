# JWT Token Validation Fix

## Problem Identified ✅

The error **"Subject must be a string"** was caused by Flask-JWT-Extended expecting the JWT subject (`sub` claim) to be a string, but your code was passing an integer (the user's database ID).

## Root Cause 🔍

In your Flask API (`app.py`), when creating JWT tokens:

```python
# BEFORE (causing the error):
access_token = create_access_token(identity=user.id)  # user.id is an integer
```

Flask-JWT-Extended requires the `identity` parameter to be a string, but `user.id` from your database is an integer (primary key).

## Fix Applied 🛠️

### 1. Updated Token Creation
Changed both registration and login endpoints to convert user ID to string:

```python
# AFTER (fixed):
access_token = create_access_token(identity=str(user.id))  # Convert to string
```

### 2. Updated Token Validation
Updated all places where `get_jwt_identity()` is used to convert back to integer:

```python
# BEFORE:
current_user_id = get_jwt_identity()  # This is now a string

# AFTER:
current_user_id = int(get_jwt_identity())  # Convert back to int for database queries
```

## Files Modified 📝

### `play_date/api/app.py`
- **Line 84**: Registration endpoint - convert user ID to string for JWT
- **Line 111**: Login endpoint - convert user ID to string for JWT  
- **Line 125**: `/auth/me` endpoint - convert JWT identity back to int
- **Line 193**: User update endpoint - convert JWT identity back to int
- **Line 249**: User delete endpoint - convert JWT identity back to int

## How to Apply the Fix 🚀

### Option 1: Use the Restart Script
```bash
cd play_date/api
./restart-api.sh
```

### Option 2: Manual Restart
```bash
cd play_date/api
docker-compose down
docker-compose up -d --build
```

### Option 3: Just Restart (if you've already made the changes)
```bash
cd play_date/api
docker-compose restart
```

## Testing the Fix 🧪

### 1. Test API Directly
```bash
# Test health endpoint
curl http://localhost:5000/health

# Test login (should work now)
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test token validation with returned token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/auth/me
```

### 2. Test in React Native App
1. **Login**: Try logging in normally
2. **Token Validation**: Should no longer see "Subject must be a string" error
3. **Persistent Auth**: Close and reopen app - should auto-login
4. **Console Logs**: Should see "Token is valid, logging user in automatically"

## Expected Behavior After Fix ✨

### Login Flow:
1. User enters credentials
2. Server creates JWT with string user ID
3. Token stored in React Native AsyncStorage
4. Login successful ✅

### Auto-Login Flow:
1. App starts and shows loading screen
2. Checks AsyncStorage for stored token
3. Validates token with server (`/auth/me`)
4. Server successfully validates string subject
5. Returns user data
6. App automatically logs user in ✅

## Verification Checklist ☑️

- [ ] Docker container restarted with new code
- [ ] API responds to `curl http://localhost:5000/health`
- [ ] Login works in React Native app
- [ ] No more "Subject must be a string" errors
- [ ] Token validation succeeds
- [ ] Persistent auth works (close/reopen app)
- [ ] Console shows successful auto-login logs

## Why This Happened 🤔

This is a common issue when working with Flask-JWT-Extended and database primary keys:

1. **Database IDs are integers** - Most databases use integer primary keys
2. **JWT spec expects strings** - The JWT specification requires the `sub` claim to be a string
3. **Flask-JWT-Extended enforces this** - The library validates that the subject is a string

The fix is simple but easy to miss: always convert the user ID to a string when creating tokens, and convert back to int when querying the database.

## Future Prevention 🛡️

To prevent this in the future:

1. **Always use `str(user.id)`** when creating JWT tokens
2. **Always use `int(get_jwt_identity())`** when querying by user ID
3. **Test token validation** after any JWT-related changes
4. **Use type hints** to make the string/int conversion explicit

```python
def create_user_token(user_id: int) -> str:
    """Create JWT token for user (converts int ID to string for JWT)"""
    return create_access_token(identity=str(user_id))

def get_current_user_id() -> int:
    """Get current user ID from JWT (converts string back to int)"""
    return int(get_jwt_identity())
```

## Summary 📋

The **"Subject must be a string"** error is now fixed by:
- ✅ Converting user IDs to strings when creating JWT tokens
- ✅ Converting JWT identity back to integers for database queries
- ✅ Maintaining backward compatibility with existing database structure

Your persistent authentication should now work perfectly! 🎉
