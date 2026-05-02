const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    let projectIds = [];

    if (isAdmin) {
      // Admin sees ALL projects
      const allProjects = await prisma.project.findMany({ select: { id: true } });
      projectIds = allProjects.map(p => p.id);
    } else {
      // Members only see their projects
      const userProjects = await prisma.projectMember.findMany({
        where: { userId: req.user.id },
        select: { projectId: true },
      });
      projectIds = userProjects.map((p) => p.projectId);
    }

    if (projectIds.length === 0) {
      return res.json({
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
        overdueTasks: 0,
        completionRate: 0,
        recentTasks: [],
        tasksByProject: [],
      });
    }

    // 2. Fetch everything in parallel
    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      recentTasks,
      projectGrouping,
      projectNames
    ] = await Promise.all([
      prisma.task.count({ where: { projectId: { in: projectIds } } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: 'DONE' } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: 'TODO' } }),
      prisma.task.count({ 
        where: { 
          projectId: { in: projectIds }, 
          status: { not: 'DONE' },
          dueDate: { lt: new Date() }
        } 
      }),
      prisma.task.findMany({
        where: { projectId: { in: projectIds } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { name: true } },
          assignee: { select: { id: true, name: true, email: true } },
        }
      }),
      prisma.task.groupBy({
        by: ['projectId', 'status'],
        where: { projectId: { in: projectIds } },
        _count: { _all: true }
      }),
      prisma.project.findMany({
        where: { id: { in: projectIds } },
        select: { id: true, name: true }
      })
    ]);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const projectMap = {};
    projectNames.forEach(p => {
      projectMap[p.id] = { name: p.name, total: 0, completed: 0, inProgress: 0, todo: 0 };
    });

    projectGrouping.forEach(group => {
      const p = projectMap[group.projectId];
      if (p) {
        const count = group._count._all;
        p.total += count;
        if (group.status === 'DONE') p.completed = count;
        if (group.status === 'IN_PROGRESS') p.inProgress = count;
        if (group.status === 'TODO') p.todo = count;
      }
    });

    res.json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      completionRate,
      recentTasks: recentTasks.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        projectName: t.project.name,
        assignee: t.assignee,
        dueDate: t.dueDate,
        createdAt: t.createdAt,
      })),
      tasksByProject: Object.values(projectMap),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats.' });
  }
});

module.exports = router;
