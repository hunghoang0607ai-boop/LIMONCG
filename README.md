# LIMONCG Marketing CRM

Hệ thống CRM (Customer Relationship Management) dành cho Marketing Agency, xây dựng với Node.js, Express, TypeScript, Prisma và React.

## Tính năng chính

- **Dashboard** - Tổng quan KPIs: contacts, pipeline value, doanh thu, tasks
- **Contacts** - Quản lý khách hàng cá nhân (leads, prospects, clients)
- **Companies** - Quản lý doanh nghiệp khách hàng
- **Pipeline (Deals)** - Kanban board quản lý cơ hội bán hàng
- **Projects** - Quản lý chiến dịch và dự án marketing
- **Tasks** - Quản lý công việc nội bộ team
- **Activities** - Nhật ký hoạt động (calls, emails, meetings)

## Tech Stack

- **Backend**: Node.js + Express + TypeScript + Prisma ORM + PostgreSQL
- **Frontend**: React 18 + TypeScript + Material UI + Redux Toolkit + Recharts
- **Database**: PostgreSQL 15

## Cài đặt nhanh

### 1. Clone & cài đặt

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Cấu hình môi trường

```bash
cp backend/.env.example backend/.env
# Chỉnh sửa DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
```

### 3. Khởi động database

```bash
docker-compose up -d postgres
```

### 4. Migrate & seed database

```bash
cd backend
npx prisma migrate dev --name init_crm
npm run prisma:seed
```

### 5. Chạy ứng dụng

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Truy cập

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1

### Tài khoản mặc định (sau khi seed)

| Email | Password | Role |
|-------|----------|------|
| admin@limoncg.com | admin123456 | Admin |
| sales@limoncg.com | sales123456 | Sales |

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | /api/v1/auth/login | Đăng nhập |
| POST | /api/v1/auth/register | Đăng ký |
| GET | /api/v1/dashboard/stats | Dashboard statistics |
| GET/POST | /api/v1/contacts | Quản lý contacts |
| GET/POST | /api/v1/companies | Quản lý companies |
| GET/POST | /api/v1/deals | Quản lý deals |
| GET | /api/v1/deals/kanban | Pipeline kanban view |
| GET/POST | /api/v1/projects | Quản lý projects |
| GET/POST | /api/v1/tasks | Quản lý tasks |
| GET/POST | /api/v1/activities | Nhật ký hoạt động |
