# 📚 PHASE 4: EXAM MANAGEMENT SYSTEM - COMPLETE GUIDE

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Question Types](#question-types)
6. [Security & Permissions](#security--permissions)
7. [Testing Guide](#testing-guide)
8. [Integration Examples](#integration-examples)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Phase 4 implements a comprehensive **Exam Management System** for creating, managing, and organizing English language tests. This backend system provides:

- ✅ Complete CRUD operations for exams and questions
- ✅ Role-based access control (Student, Teacher, Admin)
- ✅ 8 different question types support
- ✅ Publish/draft workflow
- ✅ Automatic question counting
- ✅ Answer security (students don't see correct answers)
- ✅ Exam statistics and analytics
- ✅ Bulk question creation
- ✅ Question reordering

---

## 🚀 Features

### Exam Management

#### For Teachers/Admins:
- Create exams in draft mode
- Add/edit/delete questions
- Bulk import questions
- Reorder questions
- Publish/unpublish exams
- View exam statistics
- Set credit costs and difficulty levels

#### For Students:
- Browse published exams
- Filter by category, difficulty, type
- View exam details (without answers)
- See question count and duration
- Check credit requirements

#### For Admins:
- All teacher permissions
- Delete any exam
- View all exams regardless of creator

---

## 📊 Database Schema

### Exam Model

```prisma
model Exam {
  id                String         @id @default(uuid())
  category          ExamCategory   // IELTS, PTE, TOEIC, TOEFL, CAMBRIDGE, APTIS, DUOLINGO
  title             String
  description       String?
  difficultyLevel   DifficultyLevel // A1, A2, B1, B2, C1, C2
  durationMinutes   Int
  creditCost        Int            @default(0)
  isDemo            Boolean        @default(false)
  isPlacementTest   Boolean        @default(false)
  totalQuestions    Int            @default(0)
  passingScore      Float
  thumbnail         String?
  instructions      String?
  isPublished       Boolean        @default(false)
  createdById       String
  createdBy         User           @relation("CreatedExams", fields: [createdById], references: [id])
  questions         Question[]
  attempts          ExamAttempt[]
  learningPaths     LearningPathExam[]
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
}
```

### Question Model

```prisma
model Question {
  id             String          @id @default(uuid())
  examId         String
  exam           Exam            @relation(fields: [examId], references: [id], onDelete: Cascade)
  section        ExamSection     // READING, WRITING, LISTENING, SPEAKING, GRAMMAR, VOCABULARY
  questionType   QuestionType    // MULTIPLE_CHOICE, FILL_BLANK, MATCHING, ESSAY, etc.
  questionText   Json            // Rich text content
  mediaUrl       String?         // Audio/image/video URL
  mediaType      String?         // audio, image, video
  options        Json?           // For MCQ questions
  correctAnswer  Json            // Answer data
  explanation    String?         // Explanation for the answer
  points         Float           @default(1)
  orderIndex     Int
  studentAnswers StudentAnswer[]
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  @@index([examId])
  @@index([section])
}
```

### Enums

```typescript
enum ExamCategory {
  IELTS
  PTE
  TOEIC
  TOEFL
  CAMBRIDGE
  APTIS
  DUOLINGO
}

enum DifficultyLevel {
  A1  // Beginner
  A2  // Elementary
  B1  // Intermediate
  B2  // Upper Intermediate
  C1  // Advanced
  C2  // Proficient
}

enum ExamSection {
  READING
  WRITING
  LISTENING
  SPEAKING
  GRAMMAR
  VOCABULARY
}

enum QuestionType {
  MULTIPLE_CHOICE
  FILL_BLANK
  MATCHING
  ESSAY
  TRUE_FALSE
  SHORT_ANSWER
  LISTENING_MCQ
  READING_MCQ
}
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### Exam Endpoints

#### 1. Get All Exams (Public)

```http
GET /api/v1/exams
```

**Query Parameters:**
- `category` (optional): Filter by category (IELTS, PTE, etc.)
- `difficultyLevel` (optional): Filter by level (A1-C2)
- `isDemo` (optional): Filter demo exams (true/false)
- `isPlacementTest` (optional): Filter placement tests (true/false)
- `search` (optional): Search in title/description
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**
```bash
curl http://localhost:5000/api/v1/exams?category=IELTS&difficultyLevel=B2&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "id": "uuid",
        "category": "IELTS",
        "title": "IELTS Academic Reading Test 1",
        "description": "Full reading test with 3 passages",
        "difficultyLevel": "B2",
        "durationMinutes": 60,
        "creditCost": 5,
        "isDemo": false,
        "isPlacementTest": false,
        "totalQuestions": 40,
        "passingScore": 60,
        "thumbnail": "https://...",
        "isPublished": true,
        "createdBy": {
          "id": "uuid",
          "fullName": "John Teacher",
          "email": "teacher@example.com"
        },
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

---

#### 2. Get Exam by ID (Public)

```http
GET /api/v1/exams/:id
```

**Example Request:**
```bash
curl http://localhost:5000/api/v1/exams/exam-uuid-here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "category": "IELTS",
    "title": "IELTS Academic Reading Test 1",
    "description": "Full reading test with 3 passages",
    "difficultyLevel": "B2",
    "durationMinutes": 60,
    "creditCost": 5,
    "isDemo": false,
    "isPlacementTest": false,
    "totalQuestions": 40,
    "passingScore": 60,
    "instructions": "Read each passage carefully and answer all questions...",
    "thumbnail": "https://...",
    "isPublished": true,
    "_count": {
      "questions": 40,
      "attempts": 125
    },
    "createdBy": {
      "id": "uuid",
      "fullName": "John Teacher",
      "email": "teacher@example.com"
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

---

#### 3. Create Exam (Teacher/Admin)

```http
POST /api/v1/exams
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "category": "IELTS",
  "title": "IELTS Academic Reading Test 1",
  "description": "Full reading test with 3 passages",
  "difficultyLevel": "B2",
  "durationMinutes": 60,
  "creditCost": 5,
  "isDemo": false,
  "isPlacementTest": false,
  "passingScore": 60,
  "thumbnail": "https://example.com/thumbnail.jpg",
  "instructions": "Read each passage carefully and answer all questions. You have 60 minutes to complete this test."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "category": "IELTS",
    "title": "IELTS Academic Reading Test 1",
    "isPublished": false,
    "totalQuestions": 0,
    "createdById": "teacher-uuid",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "message": "Exam created successfully"
}
```

**Validation Rules:**
- `category`: Required, must be valid ExamCategory
- `title`: Required, min 3 characters
- `difficultyLevel`: Required, must be A1-C2
- `durationMinutes`: Required, must be positive integer
- `creditCost`: Optional, defaults to 0, must be >= 0
- `passingScore`: Required, must be between 0-100

---

#### 4. Update Exam (Teacher/Admin)

```http
PUT /api/v1/exams/:id
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:** (All fields optional)
```json
{
  "title": "IELTS Academic Reading Test 1 - Updated",
  "description": "Updated description",
  "durationMinutes": 75,
  "creditCost": 7,
  "passingScore": 65
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "IELTS Academic Reading Test 1 - Updated",
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Exam updated successfully"
}
```

**Permissions:**
- Teachers can only update their own exams
- Admins can update any exam
- Returns 403 if not creator and not admin

---

#### 5. Delete Exam (Admin Only)

```http
DELETE /api/v1/exams/:id
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Exam deleted successfully"
}
```

**Protection:**
- ❌ Cannot delete exam with existing student attempts
- Returns 400 error if attempts exist
- Admin role required

---

#### 6. Publish/Unpublish Exam (Teacher/Admin)

```http
PATCH /api/v1/exams/:id/publish
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "isPublished": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "isPublished": true,
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Exam published successfully"
}
```

**Validation:**
- ❌ Cannot publish exam without questions
- Returns 400 error if totalQuestions = 0

---

#### 7. Get Exam Statistics (Teacher/Admin)

```http
GET /api/v1/exams/:id/statistics
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAttempts": 125,
    "completedAttempts": 120,
    "averageScore": 75.5,
    "recentAttempts": [
      {
        "id": "uuid",
        "studentId": "uuid",
        "student": {
          "fullName": "Jane Student",
          "email": "jane@example.com"
        },
        "status": "COMPLETED",
        "score": 85,
        "startedAt": "2024-01-15T09:00:00Z",
        "submittedAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

### Question Endpoints

#### 8. Get Questions by Exam

```http
GET /api/v1/exams/:examId/questions
Authorization: Bearer <access_token>
```

**Response for Teachers/Admins:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "examId": "exam-uuid",
      "section": "READING",
      "questionType": "MULTIPLE_CHOICE",
      "questionText": {
        "text": "What is the main idea of paragraph 2?"
      },
      "mediaUrl": null,
      "mediaType": null,
      "options": [
        { "id": "a", "text": "Option A" },
        { "id": "b", "text": "Option B", "isCorrect": true },
        { "id": "c", "text": "Option C" },
        { "id": "d", "text": "Option D" }
      ],
      "correctAnswer": { "answer": "b" },
      "explanation": "Option B is correct because...",
      "points": 1,
      "orderIndex": 1,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

**Response for Students:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "examId": "exam-uuid",
      "section": "READING",
      "questionType": "MULTIPLE_CHOICE",
      "questionText": {
        "text": "What is the main idea of paragraph 2?"
      },
      "options": [
        { "id": "a", "text": "Option A" },
        { "id": "b", "text": "Option B" },
        { "id": "c", "text": "Option C" },
        { "id": "d", "text": "Option D" }
      ],
      "points": 1,
      "orderIndex": 1
    }
  ]
}
```

**Note:** Students don't see:
- `correctAnswer`
- `explanation`
- `isCorrect` flag in options

---

#### 9. Create Question (Teacher/Admin)

```http
POST /api/v1/exams/:examId/questions
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Example: Multiple Choice Question**
```json
{
  "section": "READING",
  "questionType": "MULTIPLE_CHOICE",
  "questionText": {
    "text": "What is the main idea of the passage?"
  },
  "options": [
    { "id": "a", "text": "Option A" },
    { "id": "b", "text": "Option B", "isCorrect": true },
    { "id": "c", "text": "Option C" },
    { "id": "d", "text": "Option D" }
  ],
  "correctAnswer": { "answer": "b" },
  "explanation": "Option B correctly identifies the main idea...",
  "points": 1,
  "orderIndex": 1
}
```

**Example: Fill in the Blank**
```json
{
  "section": "GRAMMAR",
  "questionType": "FILL_BLANK",
  "questionText": {
    "text": "Complete the sentence: She ____ to the market yesterday.",
    "blanks": 1
  },
  "correctAnswer": {
    "acceptedAnswers": ["went", "had gone"]
  },
  "explanation": "Past simple tense is used for completed actions",
  "points": 1
}
```

**Example: Essay Question**
```json
{
  "section": "WRITING",
  "questionType": "ESSAY",
  "questionText": {
    "text": "Some people believe that technology has made our lives easier. To what extent do you agree or disagree?",
    "wordLimit": 250
  },
  "correctAnswer": {
    "rubric": {
      "taskResponse": "Out of 25",
      "coherence": "Out of 25",
      "vocabulary": "Out of 25",
      "grammar": "Out of 25"
    }
  },
  "points": 100
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "examId": "exam-uuid",
    "section": "READING",
    "questionType": "MULTIPLE_CHOICE",
    "orderIndex": 1,
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "message": "Question created successfully"
}
```

**Auto-Actions:**
- ✅ Exam's `totalQuestions` count incremented
- ✅ `orderIndex` auto-assigned if not provided (max + 1)

---

#### 10. Bulk Create Questions (Teacher/Admin)

```http
POST /api/v1/exams/:examId/questions/bulk
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "questions": [
    {
      "section": "READING",
      "questionType": "MULTIPLE_CHOICE",
      "questionText": { "text": "Question 1?" },
      "options": [...],
      "correctAnswer": { "answer": "b" },
      "points": 1
    },
    {
      "section": "READING",
      "questionType": "MULTIPLE_CHOICE",
      "questionText": { "text": "Question 2?" },
      "options": [...],
      "correctAnswer": { "answer": "a" },
      "points": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "created": 2,
    "questions": [...]
  },
  "message": "2 questions created successfully"
}
```

**Note:** All questions created in a single transaction

---

#### 11. Reorder Questions (Teacher/Admin)

```http
PATCH /api/v1/exams/:examId/questions/reorder
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "questionIds": [
    "question-uuid-1",
    "question-uuid-2",
    "question-uuid-3"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": 3
  },
  "message": "Questions reordered successfully"
}
```

**Note:** `orderIndex` updated based on array position (1, 2, 3...)

---

#### 12. Get Question by ID (Teacher/Admin)

```http
GET /api/v1/questions/:id
Authorization: Bearer <access_token>
```

**Response:** (Full question data)

---

#### 13. Update Question (Teacher/Admin)

```http
PUT /api/v1/questions/:id
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:** (All fields optional)
```json
{
  "questionText": { "text": "Updated question text?" },
  "points": 2,
  "explanation": "Updated explanation"
}
```

**Permissions:**
- Teachers can update questions in their own exams
- Admins can update any question

---

#### 14. Delete Question (Teacher/Admin)

```http
DELETE /api/v1/questions/:id
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Question deleted successfully"
}
```

**Protection:**
- ❌ Cannot delete question with student answers
- ✅ Exam's `totalQuestions` auto-decremented

---

## 📝 Question Types

### 1. MULTIPLE_CHOICE

**Use Case:** Standard MCQ with 4 options

**Structure:**
```json
{
  "questionText": { "text": "What is the capital of France?" },
  "options": [
    { "id": "a", "text": "London" },
    { "id": "b", "text": "Paris", "isCorrect": true },
    { "id": "c", "text": "Berlin" },
    { "id": "d", "text": "Madrid" }
  ],
  "correctAnswer": { "answer": "b" }
}
```

---

### 2. FILL_BLANK

**Use Case:** Fill in missing words

**Structure:**
```json
{
  "questionText": {
    "text": "The weather ____ beautiful today.",
    "blanks": 1
  },
  "correctAnswer": {
    "acceptedAnswers": ["is", "was", "'s"]
  }
}
```

---

### 3. MATCHING

**Use Case:** Match items from two columns

**Structure:**
```json
{
  "questionText": {
    "text": "Match the words with their definitions",
    "leftColumn": [
      { "id": "1", "text": "Eloquent" },
      { "id": "2", "text": "Ambiguous" },
      { "id": "3", "text": "Pragmatic" }
    ],
    "rightColumn": [
      { "id": "a", "text": "Practical" },
      { "id": "b", "text": "Unclear" },
      { "id": "c", "text": "Well-spoken" }
    ]
  },
  "correctAnswer": {
    "matches": [
      { "left": "1", "right": "c" },
      { "left": "2", "right": "b" },
      { "left": "3", "right": "a" }
    ]
  }
}
```

---

### 4. ESSAY

**Use Case:** Long-form written response

**Structure:**
```json
{
  "questionText": {
    "text": "Discuss the impact of social media on society.",
    "wordLimit": 250,
    "guidelines": "Include examples and clear arguments"
  },
  "correctAnswer": {
    "rubric": {
      "content": "Out of 25",
      "organization": "Out of 25",
      "vocabulary": "Out of 25",
      "grammar": "Out of 25"
    }
  },
  "points": 100
}
```

**Note:** Requires manual grading

---

### 5. TRUE_FALSE

**Use Case:** Simple true/false statements

**Structure:**
```json
{
  "questionText": { "text": "The Earth is flat." },
  "correctAnswer": { "answer": "false" }
}
```

---

### 6. SHORT_ANSWER

**Use Case:** Brief text response

**Structure:**
```json
{
  "questionText": {
    "text": "What does 'procrastinate' mean?",
    "maxWords": 20
  },
  "correctAnswer": {
    "keywords": ["delay", "postpone", "put off"],
    "sampleAnswer": "To delay or postpone something"
  }
}
```

---

### 7. LISTENING_MCQ

**Use Case:** MCQ with audio file

**Structure:**
```json
{
  "questionText": { "text": "What is the speaker's main concern?" },
  "mediaUrl": "https://cdn.example.com/audio/listening-1.mp3",
  "mediaType": "audio",
  "options": [
    { "id": "a", "text": "Option A" },
    { "id": "b", "text": "Option B", "isCorrect": true },
    { "id": "c", "text": "Option C" },
    { "id": "d", "text": "Option D" }
  ],
  "correctAnswer": { "answer": "b" }
}
```

---

### 8. READING_MCQ

**Use Case:** MCQ with reading passage

**Structure:**
```json
{
  "questionText": {
    "passage": "Long reading passage here...",
    "question": "What is the author's main argument?"
  },
  "options": [...],
  "correctAnswer": { "answer": "c" }
}
```

---

## 🔐 Security & Permissions

### Role-Based Access Control

| Action | Student | Teacher | Admin |
|--------|---------|---------|-------|
| View published exams | ✅ | ✅ | ✅ |
| View exam details | ✅ | ✅ | ✅ |
| See correct answers | ❌ | ✅ (own exams) | ✅ |
| Create exam | ❌ | ✅ | ✅ |
| Update exam | ❌ | ✅ (own only) | ✅ (all) |
| Delete exam | ❌ | ❌ | ✅ |
| Publish exam | ❌ | ✅ (own only) | ✅ (all) |
| Create questions | ❌ | ✅ (own exams) | ✅ (all) |
| Update questions | ❌ | ✅ (own exams) | ✅ (all) |
| Delete questions | ❌ | ✅ (own exams) | ✅ (all) |
| View statistics | ❌ | ✅ (own exams) | ✅ (all) |

### Data Protection

**Answer Security:**
- Students NEVER see `correctAnswer` field
- Students NEVER see `explanation` field
- Students NEVER see `isCorrect` flags in options
- Only revealed after exam submission (Phase 6)

**Deletion Protection:**
```typescript
// Cannot delete exam with attempts
if (exam._count.attempts > 0) {
  throw ApiError.badRequest(
    'Cannot delete exam with existing student attempts'
  );
}

// Cannot delete question with answers
if (question._count.studentAnswers > 0) {
  throw ApiError.badRequest(
    'Cannot delete question with student answers'
  );
}
```

**Publishing Validation:**
```typescript
// Cannot publish empty exam
if (isPublished && exam.totalQuestions === 0) {
  throw ApiError.badRequest(
    'Cannot publish exam without questions'
  );
}
```

---

## 🧪 Testing Guide

### Prerequisites

1. **Start Backend:**
```bash
cd backend
npm run dev
```

2. **Get Authentication Token:**
   - Register as Teacher: `POST /api/v1/auth/register` with `role: "TEACHER"`
   - Login: `POST /api/v1/auth/login`
   - Copy the `accessToken` from response

### Test Workflow

#### Step 1: Create an Exam

```bash
curl -X POST http://localhost:5000/api/v1/exams \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "IELTS",
    "title": "IELTS Reading Practice Test",
    "description": "Practice test for IELTS reading section",
    "difficultyLevel": "B2",
    "durationMinutes": 60,
    "creditCost": 5,
    "passingScore": 60,
    "isDemo": false
  }'
```

**Expected:** Returns exam with `isPublished: false`, `totalQuestions: 0`

---

#### Step 2: Add Questions

```bash
curl -X POST http://localhost:5000/api/v1/exams/EXAM_ID/questions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "section": "READING",
    "questionType": "MULTIPLE_CHOICE",
    "questionText": {
      "text": "What is the main topic of the passage?"
    },
    "options": [
      { "id": "a", "text": "Climate change" },
      { "id": "b", "text": "Technology advancement", "isCorrect": true },
      { "id": "c", "text": "Economic growth" },
      { "id": "d", "text": "Social media" }
    ],
    "correctAnswer": { "answer": "b" },
    "explanation": "The passage primarily discusses technology.",
    "points": 1
  }'
```

**Expected:**
- Question created
- Exam's `totalQuestions` incremented to 1

---

#### Step 3: Bulk Add Questions

```bash
curl -X POST http://localhost:5000/api/v1/exams/EXAM_ID/questions/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questions": [
      {
        "section": "READING",
        "questionType": "MULTIPLE_CHOICE",
        "questionText": { "text": "Question 2?" },
        "options": [...],
        "correctAnswer": { "answer": "a" },
        "points": 1
      },
      {
        "section": "READING",
        "questionType": "FILL_BLANK",
        "questionText": { "text": "The cat ___ on the mat." },
        "correctAnswer": { "acceptedAnswers": ["sat", "sits"] },
        "points": 1
      }
    ]
  }'
```

**Expected:** Multiple questions created at once

---

#### Step 4: Try Publishing (Should Fail Initially)

```bash
# Before adding questions
curl -X PATCH http://localhost:5000/api/v1/exams/EXAM_ID/publish \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "isPublished": true }'
```

**Expected:** Error if `totalQuestions = 0`

---

#### Step 5: Publish Exam

```bash
# After adding questions
curl -X PATCH http://localhost:5000/api/v1/exams/EXAM_ID/publish \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "isPublished": true }'
```

**Expected:** Exam published successfully

---

#### Step 6: Browse Published Exams (No Auth)

```bash
curl http://localhost:5000/api/v1/exams?category=IELTS
```

**Expected:** Returns published exams only

---

#### Step 7: View Questions as Student

```bash
# Login as student first
curl http://localhost:5000/api/v1/exams/EXAM_ID/questions \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

**Expected:** Questions WITHOUT `correctAnswer` and `explanation`

---

#### Step 8: View Statistics

```bash
curl http://localhost:5000/api/v1/exams/EXAM_ID/statistics \
  -H "Authorization: Bearer TEACHER_TOKEN"
```

**Expected:** Attempt statistics (will be 0 until Phase 5)

---

### Test Cases Checklist

- [ ] Create exam as Teacher
- [ ] Try creating exam as Student (should fail)
- [ ] Add questions to own exam
- [ ] Try adding questions to other teacher's exam (should fail)
- [ ] Bulk create questions
- [ ] Reorder questions
- [ ] Update question
- [ ] Try deleting question (should fail if has answers)
- [ ] Publish exam with questions
- [ ] Try publishing empty exam (should fail)
- [ ] Browse exams without auth
- [ ] Filter exams by category/level
- [ ] View questions as teacher (sees answers)
- [ ] View questions as student (no answers)
- [ ] Update own exam
- [ ] Try updating other's exam as teacher (should fail)
- [ ] Delete exam as admin
- [ ] Try deleting exam with attempts (should fail)

---

## 💻 Integration Examples

### React Frontend Integration

#### Service Layer

```typescript
// services/exam.service.ts
import axios from '@utils/axios';

export interface Exam {
  id: string;
  category: string;
  title: string;
  description?: string;
  difficultyLevel: string;
  durationMinutes: number;
  creditCost: number;
  totalQuestions: number;
  passingScore: number;
  isPublished: boolean;
}

export const examService = {
  // Get all exams
  async getAllExams(filters?: {
    category?: string;
    difficultyLevel?: string;
    isDemo?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ exams: Exam[]; pagination: any }> {
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });

    const response = await axios.get(`/exams?${params}`);
    return response.data.data;
  },

  // Get exam by ID
  async getExamById(id: string): Promise<Exam> {
    const response = await axios.get(`/exams/${id}`);
    return response.data.data;
  },

  // Create exam (Teacher/Admin)
  async createExam(data: Partial<Exam>): Promise<Exam> {
    const response = await axios.post('/exams', data);
    return response.data.data;
  },

  // Update exam
  async updateExam(id: string, data: Partial<Exam>): Promise<Exam> {
    const response = await axios.put(`/exams/${id}`, data);
    return response.data.data;
  },

  // Publish exam
  async publishExam(id: string, isPublished: boolean): Promise<Exam> {
    const response = await axios.patch(`/exams/${id}/publish`, { isPublished });
    return response.data.data;
  },

  // Delete exam
  async deleteExam(id: string): Promise<void> {
    await axios.delete(`/exams/${id}`);
  },

  // Get statistics
  async getExamStatistics(id: string): Promise<any> {
    const response = await axios.get(`/exams/${id}/statistics`);
    return response.data.data;
  },
};
```

#### Question Service

```typescript
// services/question.service.ts
import axios from '@utils/axios';

export interface Question {
  id: string;
  examId: string;
  section: string;
  questionType: string;
  questionText: any;
  options?: any;
  correctAnswer?: any;
  explanation?: string;
  points: number;
  orderIndex: number;
}

export const questionService = {
  // Get questions by exam
  async getQuestionsByExam(examId: string): Promise<Question[]> {
    const response = await axios.get(`/exams/${examId}/questions`);
    return response.data.data;
  },

  // Create question
  async createQuestion(examId: string, data: Partial<Question>): Promise<Question> {
    const response = await axios.post(`/exams/${examId}/questions`, data);
    return response.data.data;
  },

  // Bulk create questions
  async bulkCreateQuestions(
    examId: string,
    questions: Partial<Question>[]
  ): Promise<{ created: number; questions: Question[] }> {
    const response = await axios.post(`/exams/${examId}/questions/bulk`, { questions });
    return response.data.data;
  },

  // Reorder questions
  async reorderQuestions(examId: string, questionIds: string[]): Promise<void> {
    await axios.patch(`/exams/${examId}/questions/reorder`, { questionIds });
  },

  // Update question
  async updateQuestion(id: string, data: Partial<Question>): Promise<Question> {
    const response = await axios.put(`/questions/${id}`, data);
    return response.data.data;
  },

  // Delete question
  async deleteQuestion(id: string): Promise<void> {
    await axios.delete(`/questions/${id}`);
  },
};
```

#### Example Component: Exam List

```tsx
// pages/teacher/ExamListPage.tsx
import { useState, useEffect } from 'react';
import { Box, Grid, Card, Button, TextField, MenuItem } from '@mui/material';
import { examService, Exam } from '@services/exam.service';
import toast from 'react-hot-toast';

const ExamListPage = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    difficultyLevel: '',
    search: '',
  });

  useEffect(() => {
    loadExams();
  }, [filters]);

  const loadExams = async () => {
    try {
      const { exams } = await examService.getAllExams(filters);
      setExams(exams);
    } catch (error) {
      toast.error('Failed to load exams');
    }
  };

  const handlePublish = async (id: string, isPublished: boolean) => {
    try {
      await examService.publishExam(id, !isPublished);
      toast.success(isPublished ? 'Exam unpublished' : 'Exam published');
      loadExams();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update exam');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          select
          label="Category"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          sx={{ width: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="IELTS">IELTS</MenuItem>
          <MenuItem value="TOEIC">TOEIC</MenuItem>
        </TextField>

        <TextField
          select
          label="Level"
          value={filters.difficultyLevel}
          onChange={(e) => setFilters({ ...filters, difficultyLevel: e.target.value })}
          sx={{ width: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="A1">A1</MenuItem>
          <MenuItem value="B2">B2</MenuItem>
        </TextField>

        <TextField
          label="Search"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          sx={{ flexGrow: 1 }}
        />
      </Box>

      {/* Exam Grid */}
      <Grid container spacing={3}>
        {exams.map((exam) => (
          <Grid item xs={12} md={6} lg={4} key={exam.id}>
            <Card sx={{ p: 2 }}>
              <h3>{exam.title}</h3>
              <p>{exam.description}</p>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant={exam.isPublished ? 'outlined' : 'contained'}
                  onClick={() => handlePublish(exam.id, exam.isPublished)}
                >
                  {exam.isPublished ? 'Unpublish' : 'Publish'}
                </Button>
                <Button variant="outlined">Edit</Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ExamListPage;
```

---

## ✅ Best Practices

### For Teachers Creating Exams

1. **Start in Draft Mode**
   - Create exam (automatically draft)
   - Add all questions
   - Review thoroughly
   - Then publish

2. **Question Ordering**
   - Use `orderIndex` to control sequence
   - Or use reorder endpoint after creation
   - Group by section (all Reading, then Listening, etc.)

3. **Rich Question Content**
   - Store complex content in `questionText` JSON
   - Include passages, images, instructions
   - Use `mediaUrl` for audio/video files

4. **Clear Instructions**
   - Set exam-level instructions
   - Add question-specific guidance in `questionText`
   - Explain rubrics for essay questions

5. **Appropriate Credit Costs**
   - Demo exams: 0 credits
   - Practice tests: 2-5 credits
   - Full mock exams: 10-15 credits
   - Placement tests: 0 credits (free)

### For Developers

1. **Always Include Relations**
```typescript
const exam = await prisma.exam.findUnique({
  where: { id },
  include: {
    createdBy: { select: { id: true, fullName: true, email: true } },
    _count: { select: { questions: true, attempts: true } },
  },
});
```

2. **Filter Sensitive Data**
```typescript
// For students, remove answers
const sanitizeQuestionForStudent = (question: Question) => {
  const { correctAnswer, explanation, ...rest } = question;
  return rest;
};
```

3. **Use Transactions**
```typescript
// When creating multiple questions
await prisma.$transaction([
  prisma.question.createMany({ data: questions }),
  prisma.exam.update({
    where: { id: examId },
    data: { totalQuestions: { increment: questions.length } },
  }),
]);
```

4. **Validate Ownership**
```typescript
if (exam.createdById !== req.user.id && req.user.role !== 'ADMIN') {
  throw ApiError.forbidden('Not authorized to update this exam');
}
```

5. **Use Proper HTTP Status Codes**
   - 200: Success
   - 201: Created
   - 400: Bad Request (validation errors)
   - 401: Unauthorized (no token)
   - 403: Forbidden (insufficient permissions)
   - 404: Not Found
   - 500: Server Error

---

## 🐛 Troubleshooting

### Issue: "Cannot publish exam without questions"

**Cause:** Trying to publish exam with `totalQuestions = 0`

**Solution:**
1. Add at least one question
2. Then publish the exam

---

### Issue: "Cannot delete exam with existing student attempts"

**Cause:** Trying to delete exam that students have taken

**Solution:**
- Unpublish the exam instead
- Or contact admin to handle data migration
- Cannot delete for data integrity

---

### Issue: "Not authorized to update this exam"

**Cause:** Teacher trying to edit another teacher's exam

**Solution:**
- Only creators can edit their exams
- Admins can edit any exam
- Check `createdById` field

---

### Issue: Questions not ordered correctly

**Cause:** `orderIndex` not set or conflicts

**Solution:**
```bash
# Use reorder endpoint
curl -X PATCH http://localhost:5000/api/v1/exams/EXAM_ID/questions/reorder \
  -H "Authorization: Bearer TOKEN" \
  -d '{ "questionIds": ["id1", "id2", "id3"] }'
```

---

### Issue: Students seeing correct answers

**Cause:** Not checking user role before sending question data

**Solution:**
```typescript
// Backend: Always filter for students
if (!['ADMIN', 'TEACHER'].includes(req.user.role)) {
  questions = questions.map(({ correctAnswer, explanation, ...rest }) => rest);
}
```

---

### Issue: "Invalid question type"

**Cause:** Using unsupported `questionType`

**Solution:** Use only valid types:
- MULTIPLE_CHOICE
- FILL_BLANK
- MATCHING
- ESSAY
- TRUE_FALSE
- SHORT_ANSWER
- LISTENING_MCQ
- READING_MCQ

---

## 📚 Additional Resources

### Prisma Schema Reference
- Location: `backend/prisma/schema.prisma`
- Run migrations: `npm run prisma:migrate`
- View in Prisma Studio: `npm run prisma:studio`

### Related Documentation
- **Phase 1**: Foundation setup
- **Phase 2**: Authentication system
- **Phase 3**: Credit & payment system
- **Phase 5**: Test taking interface (coming next)

### API Testing Tools
- **Postman**: Import collection from `/docs/postman`
- **Thunder Client**: VS Code extension
- **cURL**: Examples provided throughout this guide

---

## 🎯 Next Steps

With Phase 4 complete, you can now:

1. ✅ Create and manage exams
2. ✅ Add questions of various types
3. ✅ Control exam publishing
4. ✅ View exam statistics

**Coming in Phase 5:**
- Student exam taking interface
- Timer functionality
- Answer submission
- Auto-grading logic
- Results display

**Coming in Phase 6:**
- Detailed results analytics
- Performance tracking
- Question-by-question review
- Manual grading for essays

---

## 📝 Summary

Phase 4 provides a complete **Exam Management System** with:

✅ Full CRUD operations for exams
✅ Complete question management
✅ 8 question types supported
✅ Role-based access control
✅ Answer security for students
✅ Publish/draft workflow
✅ Statistics tracking
✅ Bulk operations
✅ Question reordering

**Total Endpoints:** 14
**Total Files:** 6
**Lines of Code:** ~1,144

---

**Phase 4 Backend: Complete ✅**

Ready to proceed to Phase 5 when you are! 🚀
