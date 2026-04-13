import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CRM database...');

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@limoncg.com' },
    update: {},
    create: {
      email: 'admin@limoncg.com',
      passwordHash,
      fullName: 'Admin CRM',
      role: 'ADMIN',
      department: 'Management',
    },
  });

  const sales = await prisma.user.upsert({
    where: { email: 'sales@limoncg.com' },
    update: {},
    create: {
      email: 'sales@limoncg.com',
      passwordHash: await bcrypt.hash('sales123456', 10),
      fullName: 'Nguyễn Văn Sales',
      role: 'SALES',
      department: 'Sales',
    },
  });

  // Sample companies
  const company1 = await prisma.company.upsert({
    where: { id: 'comp-001' },
    update: {},
    create: {
      id: 'comp-001',
      name: 'TechViet Solutions',
      industry: 'Công nghệ thông tin',
      website: 'https://techviet.vn',
      city: 'Hà Nội',
      country: 'Vietnam',
      size: 'MEDIUM',
      revenue: 5000000000,
    },
  });

  const company2 = await prisma.company.upsert({
    where: { id: 'comp-002' },
    update: {},
    create: {
      id: 'comp-002',
      name: 'Thương mại Đại Phát',
      industry: 'Thương mại',
      city: 'TP.HCM',
      country: 'Vietnam',
      size: 'SMALL',
    },
  });

  // Sample contacts
  const contact1 = await prisma.contact.upsert({
    where: { id: 'cont-001' },
    update: {},
    create: {
      id: 'cont-001',
      firstName: 'Minh',
      lastName: 'Trần',
      email: 'minh.tran@techviet.vn',
      phone: '0901234567',
      jobTitle: 'CEO',
      status: 'CLIENT',
      source: 'REFERRAL',
      companyId: company1.id,
      assignedToId: sales.id,
    },
  });

  const contact2 = await prisma.contact.upsert({
    where: { id: 'cont-002' },
    update: {},
    create: {
      id: 'cont-002',
      firstName: 'Hoa',
      lastName: 'Nguyễn',
      email: 'hoa.nguyen@daiphat.vn',
      phone: '0912345678',
      jobTitle: 'Marketing Manager',
      status: 'LEAD',
      source: 'WEBSITE',
      companyId: company2.id,
      assignedToId: sales.id,
    },
  });

  // Sample deals
  await prisma.deal.upsert({
    where: { id: 'deal-001' },
    update: {},
    create: {
      id: 'deal-001',
      title: 'Campaign Marketing Q2 2024 - TechViet',
      value: 150000000,
      currency: 'VND',
      stage: 'PROPOSAL',
      probability: 60,
      contactId: contact1.id,
      companyId: company1.id,
      assignedToId: sales.id,
    },
  });

  await prisma.deal.upsert({
    where: { id: 'deal-002' },
    update: {},
    create: {
      id: 'deal-002',
      title: 'Social Media Package - Đại Phát',
      value: 50000000,
      currency: 'VND',
      stage: 'QUALIFICATION',
      probability: 30,
      contactId: contact2.id,
      companyId: company2.id,
      assignedToId: sales.id,
    },
  });

  // Sample project
  await prisma.project.upsert({
    where: { id: 'proj-001' },
    update: {},
    create: {
      id: 'proj-001',
      name: 'Rebrand TechViet 2024',
      description: 'Dự án thiết kế lại thương hiệu toàn bộ cho TechViet Solutions',
      status: 'IN_PROGRESS',
      budget: 200000000,
      spent: 80000000,
      companyId: company1.id,
      managerId: admin.id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-06-30'),
      tags: ['branding', 'design', 'marketing'],
    },
  });

  // Sample tasks
  await prisma.task.createMany({
    data: [
      { title: 'Gửi báo giá cho TechViet', priority: 'HIGH', status: 'TODO', assignedToId: sales.id, contactId: contact1.id, dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      { title: 'Follow up với Hoa Nguyễn', priority: 'MEDIUM', status: 'TODO', assignedToId: sales.id, contactId: contact2.id },
      { title: 'Chuẩn bị deck thuyết trình', priority: 'URGENT', status: 'IN_PROGRESS', assignedToId: admin.id },
    ],
    skipDuplicates: true,
  });

  // Sample activity
  await prisma.activity.create({
    data: {
      type: 'CALL',
      subject: 'Trao đổi về yêu cầu campaign Q2',
      description: 'Đã gọi điện cho anh Minh, thống nhất sẽ gửi báo giá trước ngày 15/01',
      duration: 30,
      completedAt: new Date(),
      contactId: contact1.id,
      createdById: sales.id,
    },
  });

  console.log('Seed completed!');
  console.log('Login: admin@limoncg.com / admin123456');
  console.log('Or: sales@limoncg.com / sales123456');
}

main().catch(console.error).finally(() => prisma.$disconnect());
