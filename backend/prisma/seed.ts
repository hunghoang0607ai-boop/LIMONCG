import { PrismaClient, UserRole, DifficultyLevel, ExamCategory } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@limoncg.com' },
    update: {},
    create: {
      email: 'admin@limoncg.com',
      passwordHash: adminPassword,
      fullName: 'Admin User',
      role: UserRole.ADMIN,
      isEmailVerified: true,
      credits: 1000,
      currentLevel: DifficultyLevel.C2,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create teacher user
  const teacherPassword = await bcrypt.hash('teacher123456', 10);
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@limoncg.com' },
    update: {},
    create: {
      email: 'teacher@limoncg.com',
      passwordHash: teacherPassword,
      fullName: 'Teacher User',
      role: UserRole.TEACHER,
      isEmailVerified: true,
      credits: 500,
      currentLevel: DifficultyLevel.C1,
    },
  });
  console.log('✅ Teacher user created:', teacher.email);

  // Create student user
  const studentPassword = await bcrypt.hash('student123456', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@limoncg.com' },
    update: {},
    create: {
      email: 'student@limoncg.com',
      passwordHash: studentPassword,
      fullName: 'Student User',
      role: UserRole.STUDENT,
      isEmailVerified: true,
      credits: 50,
      currentLevel: DifficultyLevel.B1,
    },
  });
  console.log('✅ Student user created:', student.email);

  // Create a demo IELTS exam
  const demoExam = await prisma.exam.create({
    data: {
      category: ExamCategory.IELTS,
      title: 'IELTS Academic Reading Practice Test - Demo',
      description: 'Free demo test to experience IELTS Academic Reading format with 3 passages and 40 questions.',
      difficultyLevel: DifficultyLevel.B2,
      durationMinutes: 60,
      creditCost: 0,
      isDemo: true,
      isPlacementTest: false,
      totalQuestions: 10, // Simplified for demo
      passingScore: 60,
      isPublished: true,
      createdById: teacher.id,
    },
  });
  console.log('✅ Demo exam created:', demoExam.title);

  // Create placement test
  const placementTest = await prisma.exam.create({
    data: {
      category: ExamCategory.IELTS,
      title: 'English Level Placement Test',
      description: 'Take this free test to determine your current English proficiency level (A1-C2).',
      difficultyLevel: DifficultyLevel.B1,
      durationMinutes: 30,
      creditCost: 0,
      isDemo: false,
      isPlacementTest: true,
      totalQuestions: 20,
      passingScore: 50,
      isPublished: true,
      createdById: teacher.id,
    },
  });
  console.log('✅ Placement test created:', placementTest.title);

  // Create a paid IELTS exam
  const paidExam = await prisma.exam.create({
    data: {
      category: ExamCategory.IELTS,
      title: 'IELTS Academic Full Practice Test 1',
      description: 'Complete IELTS Academic test with Reading, Writing, Listening, and Speaking sections.',
      difficultyLevel: DifficultyLevel.B2,
      durationMinutes: 180,
      creditCost: 10,
      isDemo: false,
      isPlacementTest: false,
      totalQuestions: 40,
      passingScore: 60,
      isPublished: true,
      createdById: teacher.id,
    },
  });
  console.log('✅ Paid exam created:', paidExam.title);

  console.log('✅ Database seed completed!');
  console.log('\n📝 Test accounts:');
  console.log('Admin: admin@limoncg.com / admin123456');
  console.log('Teacher: teacher@limoncg.com / teacher123456');
  console.log('Student: student@limoncg.com / student123456');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
