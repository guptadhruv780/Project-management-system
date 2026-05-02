const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/seed', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  
  try {
    // 1. Create a dummy project
    const project = await prisma.project.create({
      data: {
        name: 'Sample Project (Dummy)',
        description: 'This is a sample project created automatically to help you get started.',
        adminId: userId,
        members: { create: { userId: userId } }
      }
    });

    // 2. Create some dummy tasks
    await prisma.task.createMany({
      data: [
        {
          title: 'Explore TeamFlow',
          description: 'Check out the dashboard and project views',
          status: 'DONE',
          priority: 'LOW',
          projectId: project.id,
          createdById: userId,
          assigneeId: userId
        },
        {
          title: 'Create your first real project',
          description: 'Head to the Projects page and click + New Project',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          projectId: project.id,
          createdById: userId,
          assigneeId: userId
        },
        {
          title: 'Invite your team members',
          description: 'Add your team emails to your projects',
          status: 'TODO',
          priority: 'HIGH',
          projectId: project.id,
          createdById: userId,
          assigneeId: userId
        }
      ]
    });

    res.json({ message: 'Dummy data seeded successfully!' });
  } catch (error) {
    console.error('Seed failed', error);
    res.status(500).json({ message: 'Failed to seed dummy data.' });
  }
});

module.exports = router;
