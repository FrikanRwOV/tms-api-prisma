import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @openapi
 * /api/jobs:
 *   get:
 *     tags:
 *       - Jobs
 *     summary: Get all jobs
 *     description: Retrieve a list of jobs with optional filters
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter jobs by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter jobs by priority
 *       - in: query
 *         name: assignedDriverId
 *         schema:
 *           type: string
 *         description: Filter jobs by assigned driver
 *     responses:
 *       200:
 *         description: List of jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 */
router.get('/', async (req, res) => {
  const { status, priority, assignedDriverId } = req.query;
  const jobs = await prisma.job.findMany({
    where: {
      status: status ? status : undefined,
      priority: priority ? priority : undefined,
      assignedDriverId: assignedDriverId ? assignedDriverId : undefined,
    },
    include: {
      assignedDriver: true,
    },
  });
  res.json(jobs);
});

/**
 * @openapi
 * /api/jobs/{id}:
 *   get:
 *     tags:
 *       - Jobs
 *     summary: Get a job by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 */
router.get('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  const job = await prisma.job.findUnique({
    where: { id },
  });
  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ error: 'Job not found' });
  }
});

/**
 * @openapi
 * /api/jobs:
 *   post:
 *     tags:
 *       - Jobs
 *     summary: Create a new job
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *               siteClassification:
 *                 type: string
 *               assignedDriverId:
 *                 type: string
 *               requesterId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Error creating job
 */
router.post('/jobs', async (req, res) => {
  const { title, description, priority, siteClassification, assignedDriverId } = req.body;
  
  // Validate required fields
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  // Validate priority if provided
  if (priority && !['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority value. Must be LOW, MEDIUM, or HIGH' });
  }

  try {
    // Check if assigned driver exists if provided
    if (assignedDriverId) {
      const driver = await prisma.driver.findUnique({
        where: { id: assignedDriverId },
      });
      if (!driver) {
        return res.status(400).json({ error: 'Assigned driver not found' });
      }
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        priority,
        siteClassification,
        assignedDriverId,
        status: 'PENDING', // Set default status
      },
    });
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'A job with this title already exists' });
    } else if (error.code === 'P2003') {
      res.status(400).json({ error: 'Invalid reference to related record' });
    } else {
      res.status(500).json({ error: 'Internal server error while creating job' });
    }
  }
});

/**
 * @openapi
 * /api/jobs/{id}:
 *   put:
 *     tags:
 *       - Jobs
 *     summary: Update a job
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               assignedDriverId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Error updating job
 */
router.put('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  const { status, assignedDriverId } = req.body;
  try {
    const job = await prisma.job.update({
      where: { id },
      data: {
        status,
        assignedDriverId,
      },
    });
    res.json(job);
  } catch (error) {
    res.status(400).json({ error: 'Error updating job' });
  }
});

/**
 * @openapi
 * /api/jobs/{id}/complete:
 *   post:
 *     tags:
 *       - Jobs
 *     summary: Mark a job as completed
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job marked as completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Error completing job
 */
router.post('/jobs/:id/complete', async (req, res) => {
  const { id } = req.params;
  try {
    const job = await prisma.job.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });
    res.json(job);
  } catch (error) {
    res.status(400).json({ error: 'Error completing job' });
  }
});

/**
 * @openapi
 * /api/jobs/{id}/cancel:
 *   post:
 *     tags:
 *       - Jobs
 *     summary: Cancel a job
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Error cancelling job
 */
router.post('/jobs/:id/cancel', async (req, res) => {
  const { id } = req.params;
  try {
    const job = await prisma.job.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
    res.json(job);
  } catch (error) {
    res.status(400).json({ error: 'Error cancelling job' });
  }
});

/**
 * @openapi
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED]
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *         siteClassification:
 *           type: string
 *         assignedDriverId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export default router;
