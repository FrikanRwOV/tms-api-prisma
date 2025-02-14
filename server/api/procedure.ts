import { Router } from "express";
import { prisma } from "../../libs/prisma";

const router = Router();

/**
 * @swagger
 * /procedure:
 *   post:
 *     tags:
 *       - Procedure
 *     summary: Create a new procedure
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Procedure'
 *     responses:
 *       201:
 *         description: Procedure created successfully
 *       500:
 *         description: Server error
 */
router.post("", async (req, res) => {
  try {
    const data = req.body;
    const created = await prisma.procedure.create({ 
      data,
      include: {
        questions: true,
        executions: true,
      }
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to create procedure", details: error });
  }
});

/**
 * @swagger
 * /procedure:
 *   get:
 *     tags:
 *       - Procedure
 *     summary: Get all procedures with pagination, search, and filters
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
 *           default: "name,description"
 *         description: Comma-separated list of fields to search in
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [STANDARD, EXCEPTION]
 *         description: Filter by procedure type
 *     responses:
 *       200:
 *         description: List of procedures retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Procedure'
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
 *                     type:
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
    const searchFields = (req.query.searchFields as string || 'name,description').split(',');
    const type = req.query.type as string;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = searchFields.map(field => ({
        [field]: { contains: search, mode: 'insensitive' }
      }));
    }

    const [totalCount, procedures] = await Promise.all([
      prisma.procedure.count({ where }),
      prisma.procedure.findMany({
        where,
        skip,
        take: limit,
        include: {
          questions: {
            orderBy: {
              order: 'asc'
            }
          },
          executions: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: procedures,
      metadata: {
        totalCount,
        currentPage: page,
        totalPages,
        limit,
        search: search || undefined,
        searchFields,
        type: type || undefined
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve procedures", details: error });
  }
});

/**
 * @swagger
 * /procedure/{id}:
 *   get:
 *     tags:
 *       - Procedure
 *     summary: Get a procedure by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Procedure found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Procedure'
 *       404:
 *         description: Procedure not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.procedure.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: {
            order: 'asc'
          }
        },
        executions: true,
      },
    });
    if (!item) {
      return res.status(404).json({ error: "Procedure not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve procedure", details: error });
  }
});

/**
 * @swagger
 * /procedure/{id}:
 *   put:
 *     tags:
 *       - Procedure
 *     summary: Update a procedure
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
 *             $ref: '#/components/schemas/Procedure'
 *     responses:
 *       200:
 *         description: Procedure updated successfully
 *       404:
 *         description: Procedure not found
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.procedure.update({
      where: { id },
      data,
      include: {
        questions: {
          orderBy: {
            order: 'asc'
          }
        },
        executions: true,
      },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update procedure", details: error });
  }
});

/**
 * @swagger
 * /procedure/{id}:
 *   delete:
 *     tags:
 *       - Procedure
 *     summary: Delete a procedure
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Procedure deleted successfully
 *       404:
 *         description: Procedure not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.procedure.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete procedure", details: error });
  }
});

export default router; 