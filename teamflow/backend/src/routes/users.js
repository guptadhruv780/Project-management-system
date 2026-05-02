const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const router = express.Router();

// GET /api/users — get all users
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

// GET /api/users/project/:projectId — members list
router.get('/project/:projectId', authMiddleware, async (req, res) => {
  try {
    const members = await prisma.projectMember.findMany({
      where: { projectId: req.params.projectId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    res.json(members.map((m) => m.user));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project members.' });
  }
});

// GET /api/users/me — get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user.' });
  }
});

// PUT /api/users/me — update current user
router.put(
  '/me',
  authMiddleware,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const updateData = {};
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.password) {
        updateData.password = await bcrypt.hash(req.body.password, 12);
      }

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        select: { id: true, name: true, email: true, role: true },
      });

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user.' });
    }
  }
);

// DELETE /api/users/:id — delete user (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can delete users.' });
    }

    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own account here.' });
    }

    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user.' });
  }
});

module.exports = router;
