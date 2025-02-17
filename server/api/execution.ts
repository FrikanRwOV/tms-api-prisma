import { Router } from "express";
import { prisma } from "../../libs/prisma";

const router = Router();

/**
 * @swagger
 * /execution:
 *   post:
 *     tags:
 *       - Execution
 *     summary: Create a new execution
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Execution'
 *     responses:
 *       201:
 *         description: Execution created successfully
 *       500:
 *         description: Server error
 */
router.post("", async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - User not found" });
    }
  
    // First check if the procedure exists
    const procedureExists = await prisma.procedure.findUnique({
      where: { id: data.procedureId },
    });
   
    if (!procedureExists) {
      console.log("Procedure not found");
      return res.status(404).json({
        error: "Procedure not found",
        details: `No procedure found with ID: ${data.procedureId}`,
      });
    }

    const inputData = {
      procedure: {
        connect: {
          id: data.procedureId,
        },
      },
      status: 'COMPLETED',
      responses: data.responses,
      user: {
        connect: {
          id: userId,
        },
      },
    };

    const created = await prisma.execution.create({
      data: inputData,
      include: {
        procedure: true,
        user: true,
        exceptions: true,
      },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating execution:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Unique constraint violation",
        field: error.meta?.target?.[0],
        details: error.message,
      });
    }

    if (error.name === "PrismaClientValidationError") {
      return res.status(400).json({
        error: "Validation error",
        details: error.message,
      });
    }

    res.status(500).json({
      error: "Failed to create execution",
      type: error.name,
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /execution:
 *   get:
 *     tags:
 *       - Execution
 *     summary: Get all executions with pagination, search, and filters
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
 *           enum: [IN_PROGRESS, COMPLETED, CANCELLED]
 *         description: Filter by execution status
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: procedureId
 *         schema:
 *           type: string
 *         description: Filter by procedure ID
 *     responses:
 *       200:
 *         description: List of executions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Execution'
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
 *                     userId:
 *                       type: string
 *                     procedureId:
 *                       type: string
 *       500:
 *         description: Server error
 */
router.get("", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const status = req.query.status as string;
    const userId = req.query.userId as string;
    const procedureId = req.query.procedureId as string;

    const where: any = {};

    if (status) {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }
    if (procedureId) {
      where.procedureId = procedureId;
    }

    const [totalCount, executions] = await Promise.all([
      prisma.execution.count({ where }),
      prisma.execution.findMany({
        where,
        skip,
        take: limit,
        include: {
          procedure: true,
          user: true,
          exceptions: true,
        },
        orderBy: {
          startTime: "desc",
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: executions,
      metadata: {
        totalCount,
        currentPage: page,
        totalPages,
        limit,
        status: status || undefined,
        userId: userId || undefined,
        procedureId: procedureId || undefined,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to retrieve executions", details: error });
  }
});

/**
 * @swagger
 * /execution/{id}:
 *   get:
 *     tags:
 *       - Execution
 *     summary: Get an execution by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Execution found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Execution'
 *       404:
 *         description: Execution not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const execution = await prisma.execution.findUnique({
      where: { id },
      include: {
        procedure: true,
        user: true,
        exceptions: true,
      },
    });

    if (!execution) {
      return res.status(404).json({ error: "Execution not found" });
    }

    res.json(execution);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to retrieve execution", details: error });
  }
});

/**
 * @swagger
 * /execution/{id}:
 *   put:
 *     tags:
 *       - Execution
 *     summary: Update an execution
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
 *             $ref: '#/components/schemas/Execution'
 *     responses:
 *       200:
 *         description: Execution updated successfully
 *       404:
 *         description: Execution not found
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updated = await prisma.execution.update({
      where: { id },
      data,
      include: {
        procedure: true,
        user: true,
        exceptions: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating execution:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Record not found",
        details: error.message,
      });
    }

    if (error.name === "PrismaClientValidationError") {
      return res.status(400).json({
        error: "Validation error",
        details: error.message,
      });
    }

    res.status(500).json({
      error: "Failed to update execution",
      type: error.name,
      details: error.message,
    });
  }
});

export default router;
