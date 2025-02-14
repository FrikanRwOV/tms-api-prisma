import { Router } from "express";
import { prisma } from "../../libs/prisma";

const router = Router();

/**
 * @swagger
 * /job:
 *   post:
 *     tags:
 *       - Job
 *     summary: Create a new job
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       201:
 *         description: Job created successfully
 *       500:
 *         description: Server error
 */
router.post("", async (req, res) => {
  try {
    const data = req.body;
    const created = await prisma.job.create({ 
      data,
      include: {
        assignedDriver: true,
        requester: true,
        attachments: true,
        comments: {
          include: {
            author: true
          }
        }
      }
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to create job", details: error });
  }
});

/**
 * @swagger
 * /job:
 *   get:
 *     tags:
 *       - Job
 *     summary: Get all jobs
 *     responses:
 *       200:
 *         description: List of jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 *       500:
 *         description: Server error
 */
router.get("", async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        assignedDriver: true,
        requester: true,
        attachments: true,
        comments: {
          include: {
            author: true
          }
        }
      }
    });
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve jobs", details: error });
  }
});

/**
 * @swagger
 * /job/{id}:
 *   get:
 *     tags:
 *       - Job
 *     summary: Get a job by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.job.findUnique({
      where: { id },
      include: {
        assignedDriver: true,
        requester: true,
        attachments: true,
        comments: {
          include: {
            author: true
          }
        }
      }
    });
    if (!item) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve job", details: error });
  }
});

/**
 * @swagger
 * /job/{id}:
 *   put:
 *     tags:
 *       - Job
 *     summary: Update a job
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.job.update({
      where: { id },
      data,
      include: {
        assignedDriver: true,
        requester: true,
        attachments: true,
        comments: {
          include: {
            author: true
          }
        }
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update job", details: error });
  }
});

/**
 * @swagger
 * /job/{id}:
 *   delete:
 *     tags:
 *       - Job
 *     summary: Delete a job
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Job deleted successfully
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.job.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete job", details: error });
  }
});

/**
 * @swagger
 * /job/{id}/comment:
 *   post:
 *     tags:
 *       - Job
 *     summary: Add a comment to a job
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               authorId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.post("/:id/comment", async (req, res) => {
  try {
    const { id } = req.params;
    const { content, authorId } = req.body;
    
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const comment = await prisma.jobComment.create({
      data: {
        content,
        authorId,
        jobId: id
      },
      include: {
        author: true
      }
    });
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment", details: error });
  }
});

export default router; 