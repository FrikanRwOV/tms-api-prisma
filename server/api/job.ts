import { Router } from "express";
import { prisma } from "../../libs/prisma";
import { SiteClassification } from "@prisma/client";

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
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - User not found" });
    }

    const mobileData = req.body;
  
    // Validate shaft exists
    if (!mobileData.shaft) {

      return res.status(400).json({ error: "Shaft ID is required" });
    }

    const shaft = await prisma.shaft.findUnique({
      where: { id: String(mobileData.shaft) }
    });

    if (!shaft) {
      return res.status(404).json({ 
        error: "Shaft not found",
        details: `No shaft exists with ID: ${mobileData.shaft}`
      });
    }

    // Transform mobile data format to match Prisma schema
    const data = {
      title: `${mobileData.jobType} - ${mobileData.loadBay || ' '}`,
      description: mobileData.notes || "No description provided",
      requester: {
        connect: {
          id: String(userId)
        }
      },
      priority: "MEDIUM",
      status: "PENDING",
      preferredCollectionTime: mobileData.timing.preferredCollectionTime,
      siteClassification: SiteClassification.GREEN,
      jobType: mobileData.jobType,
      estimatedTonnage: parseFloat(mobileData.estimatedTonnage) || 0,
      loadBay: mobileData.loadBay,
      shaft: {
        connect: {
          id: String(mobileData.shaft)
        }
      },
      client: {
        connect: {
          id: String(mobileData.client)
        }
      },
      attachments: {
        create: mobileData.attachments?.map(att => ({
          fileUrl: att.url,
          fileType: att.key.split('.')[1]
        })) || []
      }
    };

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
    console.error('Error creating job:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: "Unique constraint violation",
        field: error.meta?.target?.[0],
        details: error.message
      });
    }
    
    if (error.name === 'PrismaClientValidationError') {
      return res.status(400).json({
        error: "Validation error on prisma schema",
        details: error.message
      });
    }

    res.status(500).json({
      error: "Failed to create job",
      type: error.name,
      details: error.message
    });
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
          client: true,
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
 * /job/requested:
 *   get:
 *     tags:
 *       - Job
 *     summary: Get jobs where the user is the requester
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PLANNED, BLOCKED, IN_PROGRESS, COMPLETED, CANCELLED]
 *         description: Filter by job status
 *     responses:
 *       200:
 *         description: List of requested jobs retrieved successfully
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
 *                     status:
 *                       type: string
 *       401:
 *         description: Unauthorized - User not found
 *       500:
 *         description: Server error
 */
router.get("/requested", async (req, res) => {
  try {
    const userId = req.user?.id; // Assuming you have user info in request from auth middleware
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - User not found" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const where: any = {
      requesterId: userId
    };

    if (status) {
      where.status = status;
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
        status: status || undefined
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve requested jobs", details: error });
  }
});

export default router; 

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
    console.error('Error updating job:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: "Record not found",
        details: error.message
      });
    }

    if (error.name === 'PrismaClientValidationError') {
      return res.status(400).json({
        error: "Validation error",
        details: error.message
      });
    }

    res.status(500).json({
      error: "Failed to update job",
      type: error.name,
      details: error.message
    });
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
    console.error('Error deleting job:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: "Record not found",
        details: error.message
      });
    }

    res.status(500).json({
      error: "Failed to delete job",
      type: error.name,
      details: error.message
    });
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
    console.error('Error adding comment:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: "Unique constraint violation",
        field: error.meta?.target?.[0],
        details: error.message
      });
    }
    
    if (error.name === 'PrismaClientValidationError') {
      return res.status(400).json({
        error: "Validation error",
        details: error.message
      });
    }

    res.status(500).json({
      error: "Failed to add comment",
      type: error.name,
      details: error.message
    });
  }
});

