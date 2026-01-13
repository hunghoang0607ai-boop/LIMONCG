import {
  PrismaClient,
  UserRole,
  DifficultyLevel,
  ExamCategory,
  ResortRoomStatus,
  ResortRoomType,
  ResortReservationStatus,
} from '@prisma/client';
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

  // -------------------------
  // Small Resort seed data
  // -------------------------
  const existingRoomCount = await prisma.resortRoom.count();
  if (existingRoomCount === 0) {
    const roomSeed = [
      { roomNumber: '101', name: 'Garden View', type: ResortRoomType.STANDARD, capacity: 2, baseRateCents: 8900 },
      { roomNumber: '102', name: 'Pool View', type: ResortRoomType.DELUXE, capacity: 3, baseRateCents: 12900 },
      { roomNumber: '201', name: 'Family Suite', type: ResortRoomType.SUITE, capacity: 4, baseRateCents: 17900 },
    ];

    for (const r of roomSeed) {
      await prisma.resortRoom.create({
        data: {
          ...r,
          status: ResortRoomStatus.AVAILABLE,
        },
      });
    }

    console.log('✅ Resort rooms created:', roomSeed.map((r) => r.roomNumber).join(', '));

    const demoGuest = await prisma.resortGuest.create({
      data: {
        fullName: 'Demo Guest',
        email: 'guest@demo.com',
        phone: '+1-555-0100',
        notes: 'Seeded demo guest for resort module.',
      },
    });

    const room101 = await prisma.resortRoom.findUnique({ where: { roomNumber: '101' } });
    if (room101) {
      await prisma.resortReservation.create({
        data: {
          roomId: room101.id,
          guestId: demoGuest.id,
          checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          checkOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          adults: 2,
          children: 0,
          status: ResortReservationStatus.CONFIRMED,
          totalCents: 8900,
          notes: 'Seeded demo reservation.',
        },
      });
      console.log('✅ Demo reservation created for room 101');
    }
  } else {
    console.log('ℹ️ Resort rooms already exist, skipping resort seed');
  }

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
