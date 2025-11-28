# 🎓 LIMONCG - English Exam Platform

A comprehensive online platform for English language testing including IELTS, PTE, FLYER, MOVER, TOEIC and more.

## 📋 Features

### For Students:
- ✅ Account registration and authentication
- ✅ Free placement tests to assess current level
- ✅ Demo tests for trial
- ✅ Credit-based exam access system
- ✅ Take exams: IELTS, PTE, FLYER, MOVER, TOEIC
- ✅ Detailed results and analytics
- ✅ Personalized learning paths
- ✅ Progress tracking

### For Admins/Teachers:
- ✅ User management
- ✅ Course and lesson creation
- ✅ Exam and question bank management
- ✅ Credit pricing configuration
- ✅ Analytics and reporting
- ✅ Transaction management

## 🏗️ Technology Stack

### Backend
- Node.js 20+
- Express.js + TypeScript
- PostgreSQL (Primary Database)
- Prisma ORM
- Redis (Caching)
- JWT Authentication
- AWS S3 / Cloudinary (File Storage)

### Frontend
- React 18 + TypeScript
- Material-UI (MUI)
- Redux Toolkit + RTK Query
- React Router v6
- React Hook Form + Zod
- Recharts

### DevOps
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- ESLint + Prettier

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd LIMONCG
```

2. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Configure environment variables
```bash
# Copy example env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

4. Start with Docker Compose
```bash
docker-compose up -d
```

5. Run database migrations
```bash
cd backend
npx prisma migrate dev
```

6. Start development servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## 📁 Project Structure

```
LIMONCG/
├── backend/          # Node.js + Express backend
├── frontend/         # React frontend
├── shared/           # Shared types and utilities
├── docker-compose.yml
└── README.md
```

## 🔧 Development

### Backend API
- Development: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

### Frontend
- Development: http://localhost:3000

## 📚 Documentation

- [Backend API Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Database Schema](./backend/prisma/schema.prisma)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

[Deployment instructions will be added]

## 📝 License

[License information]

## 👥 Team

[Team information]
