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
 *     summary: Get all jobs with pagination, search, and filters
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: searchFields
 *         schema:
 *           type: string
 *           default: "title,description,location"
 *         description: Comma-separated list of fields to search in
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PLANNED, BLOCKED, IN_PROGRESS, COMPLETED, CANCELLED]
 *         description: Filter by job status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [HIGH, MEDIUM, LOW]
 *         description: Filter by priority
 *       - in: query
 *         name: assignedDriverId
 *         schema:
 *           type: string
 *         description: Filter by assigned driver
 *       - in: query
 *         name: requesterId
 *         schema:
 *           type: string
 *         description: Filter by requester
 *       - in: query
 *         name: shaftId
 *         schema:
 *           type: string
 *         description: Filter by shaft
 *     responses:
 *       200:
 *         description: List of jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     search:
 *                       type: string
 *                     searchFields:
 *                       type: array
 *                       items:
 *                         type: string
 *                     status:
 *                       type: string
 *                     priority:
 *                       type: string
 *                     assignedDriverId:
 *                       type: string
 *                     requesterId:
 *                       type: string
 *                     shaftId:
 *                       type: string
 *       500:
 *         description: Server error
 */
router.get("", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || '';
    const searchFields = (req.query.searchFields as string || 'title,description,location').split(',');
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const assignedDriverId = req.query.assignedDriverId as string;
    const requesterId = req.query.requesterId as string;
    const shaftId = req.query.shaftId as string;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assignedDriverId) {
      where.assignedDriverId = assignedDriverId;
    }

    if (requesterId) {
      where.requesterId = requesterId;
    }

    if (shaftId) {
      where.shaftId = shaftId;
    }

    if (search) {
      where.OR = searchFields.map(field => ({
        [field]: { contains: search, mode: 'insensitive' }
      }));
    }

    const [totalCount, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        include: {
          assignedDriver: true,
          requester: true,
          attachments: true,
          comments: {
            include: {
              author: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: jobs,
      metadata: {
        totalCount,
        currentPage: page,
        totalPages,
        limit,
        search: search || undefined,
        searchFields,
        status: status || undefined,
        priority: priority || undefined,
        assignedDriverId: assignedDriverId || undefined,
        requesterId: requesterId || undefined,
        shaftId: shaftId || undefined
      }
    });
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