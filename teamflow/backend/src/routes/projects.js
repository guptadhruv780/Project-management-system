const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();


// GET /api/projects — get user's projects
router.get('/', authMiddleware, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const projects = await prisma.project.findMany({
      where: isAdmin ? {} : {
        OR: [
          { adminId: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        tasks: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      adminId: p.adminId,
      createdAt: p.createdAt,
      memberCount: p.members.length,
      members: p.members.map((m) => m.user),
      totalTasks: p.tasks.length,
      completedTasks: p.tasks.filter((t) => t.status === 'DONE').length,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects.' });
  }
});

// POST /api/projects — create project (Admin only)
router.post(
  '/',
  authMiddleware,
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
  ],
  async (req, res) => {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Only administrators can create projects.' });
      }
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { name, description, memberIds } = req.body;

      const project = await prisma.project.create({
        data: {
          name,
          description: description || null,
          adminId: req.user.id,
          members: {
            create: [
              { userId: req.user.id },
              ...(memberIds || [])
                .filter(id => id !== req.user.id)
                .map(id => ({ userId: id }))
            ],
          },
        },
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
      });

      res.status(201).json({
        id: project.id,
        name: project.name,
        description: project.description,
        adminId: project.adminId,
        createdAt: project.createdAt,
        memberCount: project.members.length,
        members: project.members.map((m) => m.user),
        totalTasks: 0,
        completedTasks: 0,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to create project.' });
    }
  }
);

// PUT /api/projects/:id — edit project (Admin only)
router.put(
  '/:id',
  authMiddleware,
  [
    body('name').optional().trim().notEmpty().withMessage('Project name cannot be empty'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const project = await prisma.project.findUnique({ where: { id: req.params.id } });
      if (!project) {
        return res.status(404).json({ message: 'Project not found.' });
      }

      if (project.adminId !== req.user.id) {
        return res.status(403).json({ message: 'Only the project admin can edit this project.' });
      }

      const { name, description } = req.body;

      const updated = await prisma.project.update({
        where: { id: req.params.id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
        },
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update project.' });
    }
  }
);

// DELETE /api/projects/:id — delete project (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.adminId !== req.user.id) {
      return res.status(403).json({ message: 'Only the project admin can delete this project.' });
    }

    await prisma.project.delete({ where: { id: req.params.id } });

    res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project.' });
  }
});

// POST /api/projects/:id/members — add member by email
router.post(
  '/:id/members',
  authMiddleware,
  [
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const project = await prisma.project.findUnique({ where: { id: req.params.id } });
      if (!project) {
        return res.status(404).json({ message: 'Project not found.' });
      }

      if (project.adminId !== req.user.id) {
        return res.status(403).json({ message: 'Only the project admin can add members.' });
      }

      const user = await prisma.user.findUnique({ where: { email: req.body.email } });
      if (!user) {
        return res.status(404).json({ message: 'User with this email not found.' });
      }

      const existingMember = await prisma.projectMember.findFirst({
        where: { projectId: req.params.id, userId: user.id },
      });
      if (existingMember) {
        return res.status(400).json({ message: 'User is already a member of this project.' });
      }

      await prisma.projectMember.create({
        data: { projectId: req.params.id, userId: user.id },
      });

      res.status(201).json({
        message: 'Member added successfully.',
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to add member.' });
    }
  }
);

// POST /api/projects/:id/sync-members — replace all members
router.post('/:id/sync-members', authMiddleware, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    if (project.adminId !== req.user.id) return res.status(403).json({ message: 'Only admin can manage members.' });

    const { memberIds } = req.body;
    
    // Ensure admin is always in the list
    const finalIds = Array.from(new Set([req.user.id, ...(memberIds || [])]));

    await prisma.$transaction([
      prisma.projectMember.deleteMany({ where: { projectId: req.params.id } }),
      prisma.projectMember.createMany({
        data: finalIds.map(id => ({ projectId: req.params.id, userId: id }))
      })
    ]);

    res.json({ message: 'Members synced successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to sync members.' });
  }
});

module.exports = router;
