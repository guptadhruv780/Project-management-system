const express = require('express');
const { body, query, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();


// GET /api/tasks?projectId=&status=&priority=
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { projectId, status, priority } = req.query;

    if (!projectId) {
      return res.status(400).json({ message: 'projectId query parameter is required.' });
    }

    const isMember = await prisma.projectMember.findFirst({
      where: { projectId, userId: req.user.id },
    });
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this project.' });
    }

    const where = { projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
});

// POST /api/tasks — create task
router.post(
  '/',
  authMiddleware,
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { title, description, priority, dueDate, projectId, assigneeId } = req.body;

      const isMember = await prisma.projectMember.findFirst({
        where: { projectId, userId: req.user.id },
      });
      if (!isMember) {
        return res.status(403).json({ message: 'You are not a member of this project.' });
      }

      if (assigneeId) {
        const assigneeMember = await prisma.projectMember.findFirst({
          where: { projectId, userId: assigneeId },
        });
        if (!assigneeMember) {
          return res.status(400).json({ message: 'Assignee is not a member of this project.' });
        }
      }

      const task = await prisma.task.create({
        data: {
          title,
          description: description || null,
          priority: priority || 'MEDIUM',
          dueDate: dueDate ? new Date(dueDate) : null,
          projectId,
          assigneeId: assigneeId || null,
          createdById: req.user.id,
        },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });

      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create task.' });
    }
  }
);

// PUT /api/tasks/:id — update task
router.put(
  '/:id',
  authMiddleware,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const task = await prisma.task.findUnique({ where: { id: req.params.id } });
      if (!task) {
        return res.status(404).json({ message: 'Task not found.' });
      }

      const isMember = await prisma.projectMember.findFirst({
        where: { projectId: task.projectId, userId: req.user.id },
      });
      if (!isMember) {
        return res.status(403).json({ message: 'You are not a member of this project.' });
      }

      const { title, description, status, priority, dueDate, assigneeId } = req.body;

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      if (priority !== undefined) updateData.priority = priority;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
      if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;

      const updated = await prisma.task.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update task.' });
    }
  }
);

// DELETE /api/tasks/:id — delete task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const isAdmin = task.project.adminId === req.user.id;
    const isCreator = task.createdById === req.user.id;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: 'Only the project admin or task creator can delete this task.' });
    }

    await prisma.task.delete({ where: { id: req.params.id } });

    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task.' });
  }
});

module.exports = router;
