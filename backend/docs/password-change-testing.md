# Password Change Feature Testing

This document outlines test cases for the password change feature, particularly focusing on Google-registered users.

## Test Cases

### 1. First-time Google User Password Change

**Scenario**: A user who registered via Google is changing their password for the first time.

**Request**:
```http
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
    "new_password": "MyNewSecurePassword",
    "new_password_confirmation": "MyNewSecurePassword"
}
```

**Expected Response**:
```json
{
    "message": "Password changed successfully",
    "is_first_time": true
}
```

### 2. Google User Subsequent Password Change

**Scenario**: A Google user who has already set their password is changing it again.

**Request**:
```http
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
    "current_password": "MyCurrentPassword",
    "new_password": "MyNewSecurePassword",
    "new_password_confirmation": "MyNewSecurePassword"
}
```

**Expected Response**:
```json
{
    "message": "Password changed successfully",
    "is_first_time": false
}
```

### 3. Regular User Password Change

**Scenario**: A user who registered normally (not via Google) is changing their password.

**Request**:
```http
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
    "current_password": "MyCurrentPassword",
    "new_password": "MyNewSecurePassword",
    "new_password_confirmation": "MyNewSecurePassword"
}
```

**Expected Response**:
```json
{
    "message": "Password changed successfully",
    "is_first_time": false
}
```

### 4. Error: Missing Current Password (Non-First-Time Google User)

**Scenario**: A Google user who has already changed their password attempts to change it without providing the current password.

**Request**:
```http
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
    "new_password": "MyNewSecurePassword",
    "new_password_confirmation": "MyNewSecurePassword"
}
```

**Expected Response**:
```json
{
    "message": "The current password field is required.",
    "errors": {
        "current_password": ["The current password field is required."]
    }
}
```

### 5. Error: Incorrect Current Password

**Scenario**: User provides an incorrect current password.

**Request**:
```http
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
    "current_password": "WrongPassword",
    "new_password": "MyNewSecurePassword",
    "new_password_confirmation": "MyNewSecurePassword"
}
```

**Expected Response**:
```json
{
    "message": "Current password is incorrect",
    "errors": {
        "current_password": ["The provided password does not match our records"]
    }
}
```

### 6. Error: Password Confirmation Mismatch

**Scenario**: New password and confirmation don't match.

**Request**:
```http
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
    "current_password": "MyCurrentPassword",
    "new_password": "MyNewSecurePassword",
    "new_password_confirmation": "DifferentPassword"
}
```

**Expected Response**:
```json
{
    "message": "The new password confirmation does not match.",
    "errors": {
        "new_password": ["The new password confirmation does not match."]
    }
}
```

### 7. Error: Same Password

**Scenario**: User attempts to change to the same password they currently have.

**Request**:
```http
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
    "current_password": "MyCurrentPassword",
    "new_password": "MyCurrentPassword",
    "new_password_confirmation": "MyCurrentPassword"
}
```

**Expected Response**:
```json
{
    "message": "New password cannot be the same as your current password",
    "errors": {
        "new_password": ["New password must be different from your current password"]
    }
}
```

## Troubleshooting

If you encounter a 404 error, ensure:
1. The application is running
2. You're using the correct endpoint: `/api/auth/change-password`
3. The route is properly registered in `routes/api.php`
4. The middleware is functioning correctly
