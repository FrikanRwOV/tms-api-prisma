import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Fetch a list of all jobs with filters
router.get('/jobs', async (req, res) => {
  const { status, priority, assignedDriverId } = req.query;
  const jobs = await prisma.job.findMany({
    where: {
      status: status ? status : undefined,
      priority: priority ? priority : undefined,
      assignedDriverId: assignedDriverId ? assignedDriverId : undefined,
    },
  });
  res.json(jobs);
});

// Fetch details of a specific job
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

// Create a new job
router.post('/jobs', async (req, res) => {
  const { title, description, priority, siteClassification, assignedDriverId } = req.body;
  try {
    const job = await prisma.job.create({
      data: {
        title,
        description,
        priority,
        siteClassification,
        assignedDriverId,
      },
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ error: 'Error creating job' });
  }
});

// Update an existing job
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

// Mark a job as completed
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

// Cancel a job
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

export default router;
