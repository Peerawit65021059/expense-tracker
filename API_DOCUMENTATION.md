# Expense Tracker API Documentation

## Overview

The Expense Tracker provides both Firebase Functions (serverless) and Express.js REST API endpoints for managing personal finances. The API supports user authentication, transaction management, and financial analytics.

## Base URLs

- **Firebase Functions**: `https://asia-southeast1-{project-id}.cloudfunctions.net/`
- **Express Server**: `http://localhost:5000/api/` (development) or your deployed server URL

## Authentication

All API endpoints (except registration and login) require authentication using JWT tokens.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### POST /api/auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### GET /api/auth/profile
Get current user profile information.

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### POST /api/auth/forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

### POST /api/auth/reset-password
Reset password using reset token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

### POST /api/auth/change-password
Change password for authenticated user.

**Request Body:**
```json
{
  "currentPassword": "currentPassword123",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

### PUT /api/auth/profile
Update user profile information.

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "newemail@example.com",
    "name": "Updated Name"
  }
}
```

### POST /api/auth/send-verification
Send email verification link.

**Response:**
```json
{
  "message": "Verification email sent"
}
```

### POST /api/auth/verify-email
Verify email using verification token.

**Request Body:**
```json
{
  "token": "verification_token_here"
}
```

**Response:**
```json
{
  "message": "Email verified successfully"
}
```

### DELETE /api/auth/account
Delete user account.

**Request Body:**
```json
{
  "password": "currentPassword123"
}
```

**Response:**
```json
{
  "message": "Account deleted successfully"
}
```

### GET /api/auth/stats
Get user statistics and analytics.

**Response:**
```json
{
  "stats": {
    "totalTransactions": 25,
    "accountCreated": "2024-01-01T00:00:00.000Z",
    "emailVerified": true,
    "monthlyStats": [
      {
        "month": "2024-01",
        "transaction_count": 10,
        "total_income": 5000.00,
        "total_expenses": 3200.00
      }
    ]
  }
}
```

---

## Firebase Authentication Functions

### POST /registerUser
Register user with Firebase Authentication.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "uid": "firebase_user_id",
    "email": "user@example.com",
    "displayName": "John Doe",
    "emailVerified": false
  },
  "customToken": "firebase_custom_token"
}
```

### POST /verifyToken
Verify Firebase ID token.

**Request Body:**
```json
{
  "idToken": "firebase_id_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token verified successfully",
  "user": {
    "uid": "firebase_user_id",
    "email": "user@example.com",
    "displayName": "John Doe",
    "emailVerified": true,
    "lastLoginAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### POST /sendPasswordReset
Send password reset email via Firebase.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

### POST /sendEmailVerification
Send email verification via Firebase.

**Request Body:**
```json
{
  "idToken": "firebase_id_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verification sent successfully"
}
```

### PUT /updateUserProfile
Update user profile in Firebase.

**Request Body:**
```json
{
  "idToken": "firebase_id_token_here",
  "displayName": "Updated Name",
  "photoURL": "https://example.com/photo.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

### DELETE /deleteUserAccount
Delete user account from Firebase.

**Request Body:**
```json
{
  "idToken": "firebase_id_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

### GET /getUserProfile
Get user profile from Firebase.

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "uid": "firebase_user_id",
    "email": "user@example.com",
    "displayName": "John Doe",
    "photoURL": null,
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Transaction Endpoints

### GET /api/transactions
Get user's transactions with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)
- `type` (string): Filter by 'income' or 'expense'
- `category` (string): Filter by category
- `startDate` (string): Start date (YYYY-MM-DD)
- `endDate` (string): End date (YYYY-MM-DD)

**Response:**
```json
{
  "transactions": [
    {
      "id": 1,
      "user_id": 1,
      "type": "expense",
      "amount": 50.00,
      "category": "Food",
      "description": "Lunch at restaurant",
      "timestamp": "2024-01-15T12:00:00.000Z",
      "created_at": "2024-01-15T12:00:00.000Z",
      "updated_at": "2024-01-15T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "pages": 1
  }
}
```

### POST /api/transactions
Create a new transaction.

**Request Body:**
```json
{
  "type": "expense",
  "amount": 25.50,
  "category": "Transportation",
  "description": "Bus fare"
}
```

**Response:**
```json
{
  "message": "Transaction added successfully",
  "transaction": {
    "id": 2,
    "user_id": 1,
    "type": "expense",
    "amount": 25.50,
    "category": "Transportation",
    "description": "Bus fare",
    "timestamp": "2024-01-15T14:30:00.000Z",
    "created_at": "2024-01-15T14:30:00.000Z",
    "updated_at": "2024-01-15T14:30:00.000Z"
  }
}
```

### PUT /api/transactions/:id
Update an existing transaction.

**Request Body:**
```json
{
  "amount": 30.00,
  "description": "Updated bus fare"
}
```

**Response:**
```json
{
  "message": "Transaction updated successfully",
  "transaction": {
    "id": 2,
    "user_id": 1,
    "type": "expense",
    "amount": 30.00,
    "category": "Transportation",
    "description": "Updated bus fare",
    "timestamp": "2024-01-15T14:30:00.000Z",
    "created_at": "2024-01-15T14:30:00.000Z",
    "updated_at": "2024-01-15T14:30:00.000Z"
  }
}
```

### DELETE /api/transactions/:id
Delete a transaction.

**Response:**
```json
{
  "message": "Transaction deleted successfully"
}
```

---

## Analytics Endpoints

### GET /api/transactions/summary
Get financial summary and analytics.

**Query Parameters:**
- `startDate` (string): Start date (YYYY-MM-DD)
- `endDate` (string): End date (YYYY-MM-DD)

**Response:**
```json
{
  "totalIncome": 5000.00,
  "totalExpenses": 3200.00,
  "balance": 1800.00,
  "categoryBreakdown": {
    "Food": 800.00,
    "Transportation": 400.00,
    "Entertainment": 600.00
  }
}
```

### GET /api/categories
Get available categories for income and expenses.

**Response:**
```json
{
  "income": ["Salary", "Freelance", "Investment"],
  "expense": ["Food", "Transportation", "Entertainment", "Bills"]
}
```

---

## Firebase Functions Endpoints

### GET /getTransactions
Get user's transactions (Firebase Functions version).

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc_id_here",
      "userId": "firebase_user_id",
      "type": "expense",
      "amount": 50.00,
      "category": "Food",
      "description": "Lunch",
      "timestamp": {
        "_seconds": 1705324800,
        "_nanoseconds": 0
      }
    }
  ]
}
```

### POST /addTransaction
Add new transaction (Firebase Functions version).

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Request Body:**
```json
{
  "type": "expense",
  "amount": 25.50,
  "category": "Transportation",
  "description": "Bus fare"
}
```

### PUT /updateTransaction?id=transaction_id
Update transaction (Firebase Functions version).

### DELETE /deleteTransaction?id=transaction_id
Delete transaction (Firebase Functions version).

### GET /getTransactionSummary
Get financial summary (Firebase Functions version).

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict (e.g., user already exists)
- `500`: Internal Server Error

---

## Rate Limiting

- API requests are limited to 1000 requests per hour per user
- Firebase Functions have built-in scaling limits

---

## Data Validation

### Transaction Validation:
- `type`: Must be 'income' or 'expense'
- `amount`: Must be a positive number
- `category`: Required field
- `description`: Optional, max 500 characters

### User Validation:
- `email`: Must be valid email format
- `password`: Minimum 8 characters, must contain uppercase, lowercase, and number
- `name`: Optional, max 255 characters

---

## Environment Variables

Required environment variables for the Express server:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=expense_tracker
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
```

---

## Deployment

### Firebase Deployment:
```bash
firebase deploy --only functions,firestore,hosting
```

### Express Server Deployment:
Deploy to services like Heroku, DigitalOcean, or AWS with the environment variables configured.

---

## Testing

Use tools like Postman or curl to test the endpoints:

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

---

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- SQL injection prevention
- Rate limiting
- Firebase security rules

---

## Future Enhancements

- Password reset functionality
- Email notifications
- Budget tracking
- Financial goals
- Recurring transactions
- Data export
- Multi-currency support