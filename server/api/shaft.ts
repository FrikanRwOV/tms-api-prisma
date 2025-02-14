import { Router } from "express";
import { prisma } from "../../libs/prisma";

const router = Router();

/**
 * @swagger
 * /shaft:
 *   post:
 *     tags:
 *       - Shaft
 *     summary: Create a new shaft
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Shaft'
 *     responses:
 *       201:
 *         description: Shaft created successfully
 *       500:
 *         description: Server error
 */
router.post("", async (req, res) => {
  try {
    const data = req.body;
    const created = await prisma.shaft.create({
      data,
      include: {
        area: {
          include: {
            site: true
          }
        },
        client: true,
        jobs: true
      }
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to create shaft", details: error });
  }
});

/**
 * @swagger
 * /shaft:
 *   get:
 *     tags:
 *       - Shaft
 *     summary: Get all shafts with pagination, search, and filters
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
 *           default: "name,area.name,area.site.name"
 *         description: Comma-separated list of fields to search in
 *       - in: query
 *         name: areaId
 *         schema:
 *           type: string
 *         description: Filter by area ID
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filter by client ID
 *     responses:
 *       200:
 *         description: List of shafts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Shaft'
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
 *                     areaId:
 *                       type: string
 *                     clientId:
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
    const searchFields = (req.query.searchFields as string || 'name,area.name,area.site.name').split(',');
    const areaId = req.query.areaId as string;
    const clientId = req.query.clientId as string;

    const where: any = {};

    if (areaId) {
      where.areaId = areaId;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { area: { name: { contains: search, mode: 'insensitive' } } },
        { area: { site: { name: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    const [totalCount, shafts] = await Promise.all([
      prisma.shaft.count({ where }),
      prisma.shaft.findMany({
        where,
        skip,
        take: limit,
        include: {
          area: {
            include: {
              site: true
            }
          },
          client: true,
          jobs: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: shafts,
      metadata: {
        totalCount,
        currentPage: page,
        totalPages,
        limit,
        search: search || undefined,
        searchFields,
        areaId: areaId || undefined,
        clientId: clientId || undefined
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve shafts", details: error });
  }
});

/**
 * @swagger
 * /shaft/{id}:
 *   get:
 *     tags:
 *       - Shaft
 *     summary: Get a shaft by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shaft found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shaft'
 *       404:
 *         description: Shaft not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.shaft.findUnique({
      where: { id },
      include: {
        area: {
          include: {
            site: true
          }
        },
        client: true,
        jobs: true
      }
    });
    if (!item) {
      return res.status(404).json({ error: "Shaft not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve shaft", details: error });
  }
});

/**
 * @swagger
 * /shaft/{id}:
 *   put:
 *     tags:
 *       - Shaft
 *     summary: Update a shaft
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
 *             $ref: '#/components/schemas/Shaft'
 *     responses:
 *       200:
 *         description: Shaft updated successfully
 *       404:
 *         description: Shaft not found
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.shaft.update({
      where: { id },
      data,
      include: {
        area: {
          include: {
            site: true
          }
        },
        client: true,
        jobs: true
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update shaft", details: error });
  }
});

/**
 * @swagger
 * /shaft/{id}:
 *   delete:
 *     tags:
 *       - Shaft
 *     summary: Delete a shaft
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Shaft deleted successfully
 *       404:
 *         description: Shaft not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.shaft.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete shaft", details: error });
  }
});

export default router; 