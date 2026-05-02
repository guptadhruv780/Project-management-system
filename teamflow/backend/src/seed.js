require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('admin123', 12);
  const memberPassword = await bcrypt.hash('member123', 12);

  const admin = await prisma.user.create({
    data: { name: 'Alex Admin', email: 'admin@teamflow.com', password: adminPassword, role: 'ADMIN' },
  });

  const member = await prisma.user.create({
    data: { name: 'Morgan Member', email: 'member@teamflow.com', password: memberPassword, role: 'MEMBER' },
  });

  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design',
      adminId: admin.id,
      members: { create: [{ userId: admin.id }, { userId: member.id }] },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App MVP',
      description: 'Build the first version of our mobile application',
      adminId: admin.id,
      members: { create: [{ userId: admin.id }, { userId: member.id }] },
    },
  });

  const now = new Date();
  const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      { title: 'Design homepage mockup', description: 'Create wireframes and high-fidelity designs', status: 'DONE', priority: 'HIGH', dueDate: pastDate, projectId: project1.id, assigneeId: member.id, createdById: admin.id },
      { title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for deployment', status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: futureDate, projectId: project1.id, assigneeId: admin.id, createdById: admin.id },
      { title: 'Write API documentation', description: 'Document all REST endpoints', status: 'TODO', priority: 'LOW', dueDate: futureDate, projectId: project1.id, assigneeId: member.id, createdById: admin.id },
      { title: 'Build user auth flow', description: 'Implement login, signup, and password reset', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: pastDate, projectId: project2.id, assigneeId: admin.id, createdById: admin.id },
      { title: 'Design app onboarding', description: 'Create onboarding screens for new users', status: 'TODO', priority: 'MEDIUM', dueDate: futureDate, projectId: project2.id, assigneeId: member.id, createdById: admin.id },
    ],
  });

  console.log('Seed data created successfully!');
  console.log('Admin: admin@teamflow.com / admin123');
  console.log('Member: member@teamflow.com / member123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
