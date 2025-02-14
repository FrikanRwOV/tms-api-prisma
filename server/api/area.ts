import { Router } from "express";
import { prisma } from "../../libs/prisma";

const router = Router();

/**
 * @swagger
 * /area:
 *   post:
 *     tags:
 *       - Area
 *     summary: Create a new area
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Area'
 *     responses:
 *       201:
 *         description: Area created successfully
 *       500:
 *         description: Server error
 */
router.post("", async (req, res) => {
  try {
    const data = req.body;
    const created = await prisma.area.create({
      data,
      include: {
        site: true,
        shafts: true
      }
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to create area", details: error });
  }
});

/**
 * @swagger
 * /area:
 *   get:
 *     tags:
 *       - Area
 *     summary: Get all areas with pagination, search, and filters
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
 *           default: "name,site.name"
 *         description: Comma-separated list of fields to search in
 *       - in: query
 *         name: siteId
 *         schema:
 *           type: string
 *         description: Filter by site ID
 *     responses:
 *       200:
 *         description: List of areas retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Area'
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
 *                     siteId:
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
    const searchFields = (req.query.searchFields as string || 'name,site.name').split(',');
    const siteId = req.query.siteId as string;

    const where: any = {};

    if (siteId) {
      where.siteId = siteId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { site: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [totalCount, areas] = await Promise.all([
      prisma.area.count({ where }),
      prisma.area.findMany({
        where,
        skip,
        take: limit,
        include: {
          site: true,
          shafts: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: areas,
      metadata: {
        totalCount,
        currentPage: page,
        totalPages,
        limit,
        search: search || undefined,
        searchFields,
        siteId: siteId || undefined
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve areas", details: error });
  }
});

/**
 * @swagger
 * /area/{id}:
 *   get:
 *     tags:
 *       - Area
 *     summary: Get an area by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Area found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Area'
 *       404:
 *         description: Area not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.area.findUnique({
      where: { id },
      include: {
        site: true,
        shafts: true
      }
    });
    if (!item) {
      return res.status(404).json({ error: "Area not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve area", details: error });
  }
});

/**
 * @swagger
 * /area/{id}:
 *   put:
 *     tags:
 *       - Area
 *     summary: Update an area
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
 *             $ref: '#/components/schemas/Area'
 *     responses:
 *       200:
 *         description: Area updated successfully
 *       404:
 *         description: Area not found
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.area.update({
      where: { id },
      data,
      include: {
        site: true,
        shafts: true
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update area", details: error });
  }
});

/**
 * @swagger
 * /area/{id}:
 *   delete:
 *     tags:
 *       - Area
 *     summary: Delete an area
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Area deleted successfully
 *       404:
 *         description: Area not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.area.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete area", details: error });
  }
});

export default router; 