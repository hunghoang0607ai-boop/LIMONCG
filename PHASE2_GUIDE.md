# 🔐 PHASE 2: AUTHENTICATION & USER MANAGEMENT - GUIDE

## ✅ COMPLETED FEATURES

### Backend APIs ✅

#### Authentication Endpoints:
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `GET /api/v1/auth/verify-email/:token` - Verify email address
- `POST /api/v1/auth/resend-verification` - Resend verification email
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `GET /api/v1/auth/me` - Get current authenticated user

#### User Management Endpoints:
- `GET /api/v1/users/me` - Get user profile
- `PUT /api/v1/users/me` - Update user profile
- `PUT /api/v1/users/me/password` - Change password
- `GET /api/v1/users/me/statistics` - Get user statistics
- `GET /api/v1/users` - Get all users (Admin only)
- `GET /api/v1/users/:id` - Get user by ID (Admin only)
- `PUT /api/v1/users/:id/role` - Update user role (Admin only)
- `POST /api/v1/users/:id/credits` - Add credits to user (Admin only)
- `DELETE /api/v1/users/:id` - Delete user (Admin only)

### Frontend Pages ✅

- ✅ **Login Page** - `/login`
- ✅ **Register Page** - `/register`
- ✅ **Verify Email Page** - `/verify-email/:token`
- ✅ **Forgot Password Page** - `/forgot-password`
- ✅ **Reset Password Page** - `/reset-password/:token`
- ✅ **Dashboard Page** - `/dashboard` (Protected)
- ✅ **Profile Page** - `/profile` (Protected)

### Core Features ✅

#### Authentication:
- ✅ JWT-based authentication (Access + Refresh tokens)
- ✅ Token auto-refresh on expiration
- ✅ Email verification flow
- ✅ Password reset flow
- ✅ Secure password hashing (bcrypt)
- ✅ Role-based access control (Student/Teacher/Admin)

#### User Management:
- ✅ User registration with email verification
- ✅ User login with JWT tokens
- ✅ User profile management
- ✅ Password change functionality
- ✅ User statistics tracking
- ✅ Admin user management

#### Email System:
- ✅ Email verification emails
- ✅ Welcome emails
- ✅ Password reset emails
- ✅ Ethereal email for testing (when SMTP not configured)

---

## 🚀 SETUP & TESTING GUIDE

### 1. Backend Setup

```bash
cd backend

# Install dependencies (if not done)
npm install

# Setup environment variables
cp .env.example .env
```

**Edit `.env` file:**
```env
# Required
DATABASE_URL=postgresql://limoncg_user:limoncg_password@localhost:5432/limoncg_db
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-long
FRONTEND_URL=http://localhost:3000

# Optional (for email - use Ethereal for testing if not set)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=LIMONCG <noreply@limoncg.com>
```

```bash
# Start database
docker-compose up -d postgres redis

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name add_auth_fields

# Seed database (creates test users)
npx prisma db seed

# Start backend server
npm run dev
```

Backend will run on: http://localhost:5000

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (if not done)
npm install

# Setup environment variables
cp .env.example .env
```

**Edit `.env` file:**
```env
VITE_API_URL=http://localhost:5000/api/v1
```

```bash
# Start frontend
npm run dev
```

Frontend will run on: http://localhost:3000

---

## 🧪 TESTING THE FEATURES

### Test Accounts (from seed):

```
Admin:
  Email: admin@limoncg.com
  Password: admin123456

Teacher:
  Email: teacher@limoncg.com
  Password: teacher123456

Student:
  Email: student@limoncg.com
  Password: student123456
```

### Test Flows:

#### 1. Registration Flow ✅
1. Go to http://localhost:3000/register
2. Fill in the form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: test123456
   - Confirm Password: test123456
3. Click "Create Account"
4. Check backend console for verification email link (Ethereal)
5. Click verification link
6. See success message and redirect to login

#### 2. Login Flow ✅
1. Go to http://localhost:3000/login
2. Enter credentials:
   - Email: student@limoncg.com
   - Password: student123456
3. Click "Sign In"
4. Should redirect to /dashboard
5. Check local storage for tokens

#### 3. Email Verification ✅
1. After registration, check backend console
2. Look for "Preview URL:" link (Ethereal email)
3. Open link in browser to see email
4. Copy verification link from email
5. Paste in browser to verify

#### 4. Forgot Password Flow ✅
1. Go to http://localhost:3000/forgot-password
2. Enter email: student@limoncg.com
3. Click "Send Reset Link"
4. Check backend console for reset link
5. Open reset link
6. Enter new password
7. Submit and login with new password

#### 5. Profile Management ✅
1. Login and go to http://localhost:3000/profile
2. Click "Edit Profile"
3. Update fields:
   - Full Name
   - Phone
   - Country
   - Date of Birth
4. Click "Save Changes"
5. Verify changes are saved

#### 6. Change Password ✅
1. On profile page, click "Change Password"
2. Enter:
   - Current Password
   - New Password
   - Confirm New Password
3. Submit
4. You'll be logged out
5. Login with new password

#### 7. Token Refresh ✅
1. Login to get access token
2. Wait for token to expire (or manually change JWT_EXPIRES_IN to 10s)
3. Make an API call
4. Token should auto-refresh
5. Request should succeed

---

## 📝 API TESTING WITH POSTMAN/THUNDER CLIENT

### 1. Register User
```http
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "New User"
}
```

### 2. Login
```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "student@limoncg.com",
  "password": "student123456"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 3. Get Current User (Protected)
```http
GET http://localhost:5000/api/v1/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 4. Update Profile (Protected)
```http
PUT http://localhost:5000/api/v1/users/me
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "fullName": "Updated Name",
  "phone": "+1234567890",
  "country": "Vietnam"
}
```

### 5. Change Password (Protected)
```http
PUT http://localhost:5000/api/v1/users/me/password
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "currentPassword": "student123456",
  "newPassword": "newpassword123"
}
```

### 6. Get User Statistics (Protected)
```http
GET http://localhost:5000/api/v1/users/me/statistics
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 7. Admin: Get All Users
```http
GET http://localhost:5000/api/v1/users?page=1&limit=10
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

### 8. Admin: Add Credits
```http
POST http://localhost:5000/api/v1/users/{userId}/credits
Authorization: Bearer ADMIN_ACCESS_TOKEN
Content-Type: application/json

{
  "amount": 50,
  "description": "Bonus credits"
}
```

---

## 🔍 TROUBLESHOOTING

### Issue: Email verification link not working
**Solution:** Check backend console for the Ethereal preview URL. If using Gmail, make sure to use App Password, not regular password.

### Issue: JWT token errors
**Solution:**
- Make sure JWT_SECRET and JWT_REFRESH_SECRET are at least 32 characters long
- Clear local storage and login again
- Check token expiration times in .env

### Issue: CORS errors
**Solution:**
- Make sure FRONTEND_URL in backend .env matches your frontend URL
- Restart backend server after changing .env

### Issue: Database connection errors
**Solution:**
- Make sure PostgreSQL is running: `docker-compose ps`
- Check DATABASE_URL in .env
- Try: `docker-compose restart postgres`

### Issue: Registration not creating user
**Solution:**
- Check backend console for errors
- Make sure Prisma client is generated: `npx prisma generate`
- Check database migrations: `npx prisma migrate status`

---

## 📊 WHAT'S NEXT - PHASE 3

Phase 3 will implement the **Credit & Payment System**:

- Credit packages
- Stripe/PayPal integration
- Credit purchase flow
- Transaction history
- Credit deduction for exams
- Refund handling
- Admin credit management

---

## 📁 FILE STRUCTURE ADDED IN PHASE 2

### Backend Files:
```
backend/src/
├── controllers/
│   ├── auth.controller.ts      ✅ Auth logic
│   └── user.controller.ts      ✅ User management
├── middleware/
│   ├── auth.ts                 ✅ JWT verification
│   └── validate.ts             ✅ Request validation
├── routes/
│   ├── auth.routes.ts          ✅ Auth endpoints
│   └── user.routes.ts          ✅ User endpoints
├── services/
│   └── email.service.ts        ✅ Email sending
└── utils/
    ├── jwt.ts                  ✅ JWT helpers
    ├── password.ts             ✅ Password hashing
    └── tokens.ts               ✅ Token generation
```

### Frontend Files:
```
frontend/src/
├── pages/
│   ├── auth/
│   │   ├── VerifyEmailPage.tsx       ✅
│   │   ├── ForgotPasswordPage.tsx    ✅
│   │   └── ResetPasswordPage.tsx     ✅
│   └── student/
│       └── ProfilePage.tsx           ✅
└── services/
    ├── auth.service.ts               ✅
    └── user.service.ts               ✅
```

---

## ✅ PHASE 2 COMPLETION CHECKLIST

- [x] JWT utility functions
- [x] Email service with Nodemailer
- [x] Auth middleware (verify JWT, check roles)
- [x] Auth controllers (register, login, logout, refresh, verify, reset)
- [x] User controllers (profile CRUD, statistics, admin functions)
- [x] Auth routes
- [x] User routes
- [x] Frontend auth API service
- [x] Frontend user API service
- [x] Email verification page
- [x] Forgot password page
- [x] Reset password page
- [x] User profile page
- [x] Route updates in App.tsx
- [x] Documentation

**Status: PHASE 2 COMPLETE ✅**

Ready for Phase 3: Credit & Payment System!
