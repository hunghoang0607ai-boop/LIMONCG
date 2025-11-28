# LIMONCG Backend API

Backend API for the LIMONCG English Exam Platform built with Node.js, Express, TypeScript, PostgreSQL, and Prisma.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start PostgreSQL and Redis:
```bash
docker-compose up -d postgres redis
```

4. Generate Prisma Client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. Seed the database (optional):
```bash
npm run prisma:seed
```

7. Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (database, redis, logger)
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types and interfaces
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app setup
│   └── index.ts         # Entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seeding
├── tests/               # Test files
└── package.json
```

## 🗄️ Database Schema

The database includes the following main entities:

- **Users**: User accounts with roles (Student, Teacher, Admin)
- **Exams**: Exam definitions with categories (IELTS, PTE, TOEIC, etc.)
- **Questions**: Question bank with multiple types
- **ExamAttempts**: Student exam sessions
- **StudentAnswers**: Individual question answers
- **CreditTransactions**: Credit purchase and usage tracking
- **PaymentOrders**: Payment processing
- **LearningPaths**: Personalized learning recommendations
- **UserStatistics**: Performance analytics

### Database Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Open Prisma Studio (DB GUI)
npm run prisma:studio

# Seed database
npm run prisma:seed
```

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `GET /api/v1/auth/verify-email/:token` - Verify email

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update current user profile
- `GET /api/v1/users/:id` - Get user by ID (admin only)
- `GET /api/v1/users` - List all users (admin only)

### Exams
- `GET /api/v1/exams` - List all available exams
- `GET /api/v1/exams/:id` - Get exam details
- `POST /api/v1/exams` - Create exam (teacher/admin)
- `PUT /api/v1/exams/:id` - Update exam (teacher/admin)
- `DELETE /api/v1/exams/:id` - Delete exam (admin)
- `POST /api/v1/exams/:id/unlock` - Unlock exam with credits

### Questions
- `GET /api/v1/exams/:examId/questions` - Get exam questions
- `POST /api/v1/exams/:examId/questions` - Add question (teacher/admin)
- `PUT /api/v1/questions/:id` - Update question (teacher/admin)
- `DELETE /api/v1/questions/:id` - Delete question (teacher/admin)

### Exam Attempts
- `POST /api/v1/attempts/start` - Start new exam attempt
- `GET /api/v1/attempts/:id` - Get attempt details
- `PUT /api/v1/attempts/:id/answer` - Submit answer
- `POST /api/v1/attempts/:id/submit` - Submit entire exam
- `GET /api/v1/attempts/:id/result` - Get exam results
- `GET /api/v1/users/me/attempts` - Get my attempt history

### Credits
- `GET /api/v1/credits/balance` - Get credit balance
- `GET /api/v1/credits/transactions` - Get transaction history
- `POST /api/v1/credits/purchase` - Purchase credits
- `POST /api/v1/credits/webhook` - Payment webhook (Stripe/PayPal)

### Learning Paths
- `GET /api/v1/learning-paths/me` - Get my learning path
- `POST /api/v1/learning-paths/generate` - Generate learning path
- `PUT /api/v1/learning-paths/me` - Update learning path

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm test -- --coverage
```

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Helmet.js for security headers
- Input validation with Zod
- CORS protection
- SQL injection prevention (Prisma ORM)

## 📝 Environment Variables

See `.env.example` for all available environment variables.

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens

## 🚢 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t limoncg-backend .

# Run with Docker Compose
docker-compose up -d
```

### Manual Deployment

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 📚 Additional Documentation

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 🐛 Troubleshooting

### Database connection errors
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Run migrations: `npm run prisma:migrate`

### Redis connection errors
- Ensure Redis is running
- Check `REDIS_URL` in `.env`

### Port already in use
- Change `PORT` in `.env`
- Or kill the process using port 5000

## 📄 License

[Your license here]
