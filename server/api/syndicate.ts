import { Router } from "express";
import { prisma } from "../../libs/prisma";

const router = Router();

/**
 * @swagger
 * /syndicate:
 *   post:
 *     tags:
 *       - Syndicate
 *     summary: Create a new syndicate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Syndicate'
 *     responses:
 *       201:
 *         description: Syndicate created successfully
 *       500:
 *         description: Server error
 */
router.post("", async (req, res) => {
  try {
    const data = req.body;
    const created = await prisma.syndicate.create({
      data,
      include: {
        clients: true
      }
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to create syndicate", details: error });
  }
});

/**
 * @swagger
 * /syndicate:
 *   get:
 *     tags:
 *       - Syndicate
 *     summary: Get all syndicates with pagination, search, and filters
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
 *           default: "name"
 *         description: Comma-separated list of fields to search in
 *     responses:
 *       200:
 *         description: List of syndicates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Syndicate'
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
 *       500:
 *         description: Server error
 */
router.get("", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || '';
    const searchFields = (req.query.searchFields as string || 'name').split(',');

    const where: any = {};

    if (search) {
      where.OR = searchFields.map(field => ({
        [field]: { contains: search, mode: 'insensitive' }
      }));
    }

    const [totalCount, syndicates] = await Promise.all([
      prisma.syndicate.count({ where }),
      prisma.syndicate.findMany({
        where,
        skip,
        take: limit,
        include: {
          clients: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: syndicates,
      metadata: {
        totalCount,
        currentPage: page,
        totalPages,
        limit,
        search: search || undefined,
        searchFields
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve syndicates", details: error });
  }
});

/**
 * @swagger
 * /syndicate/{id}:
 *   get:
 *     tags:
 *       - Syndicate
 *     summary: Get a syndicate by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Syndicate found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Syndicate'
 *       404:
 *         description: Syndicate not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.syndicate.findUnique({
      where: { id },
      include: {
        clients: true
      }
    });
    if (!item) {
      return res.status(404).json({ error: "Syndicate not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve syndicate", details: error });
  }
});

/**
 * @swagger
 * /syndicate/{id}:
 *   put:
 *     tags:
 *       - Syndicate
 *     summary: Update a syndicate
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
 *             $ref: '#/components/schemas/Syndicate'
 *     responses:
 *       200:
 *         description: Syndicate updated successfully
 *       404:
 *         description: Syndicate not found
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.syndicate.update({
      where: { id },
      data,
      include: {
        clients: true
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update syndicate", details: error });
  }
});

/**
 * @swagger
 * /syndicate/{id}:
 *   delete:
 *     tags:
 *       - Syndicate
 *     summary: Delete a syndicate
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Syndicate deleted successfully
 *       404:
 *         description: Syndicate not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.syndicate.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete syndicate", details: error });
  }
});

export default router; 