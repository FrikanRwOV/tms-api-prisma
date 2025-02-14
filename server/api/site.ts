import { Router } from "express";
import { prisma } from "../../libs/prisma";

const router = Router();

/**
 * @swagger
 * /site:
 *   post:
 *     tags:
 *       - Site
 *     summary: Create a new site
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Site'
 *     responses:
 *       201:
 *         description: Site created successfully
 *       500:
 *         description: Server error
 */
router.post("", async (req, res) => {
  try {
    const data = req.body;
    const created = await prisma.site.create({
      data,
      include: {
        areas: {
          include: {
            shafts: true
          }
        }
      }
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to create site", details: error });
  }
});

/**
 * @swagger
 * /site:
 *   get:
 *     tags:
 *       - Site
 *     summary: Get all sites with pagination, search, and filters
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
 *           default: "name,address"
 *         description: Comma-separated list of fields to search in
 *     responses:
 *       200:
 *         description: List of sites retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Site'
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
    const searchFields = (req.query.searchFields as string || 'name,address').split(',');

    const where: any = {};

    if (search) {
      where.OR = searchFields.map(field => ({
        [field]: { contains: search, mode: 'insensitive' }
      }));
    }

    const [totalCount, sites] = await Promise.all([
      prisma.site.count({ where }),
      prisma.site.findMany({
        where,
        skip,
        take: limit,
        include: {
          areas: {
            include: {
              shafts: true
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
      data: sites,
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
    res.status(500).json({ error: "Failed to retrieve sites", details: error });
  }
});

/**
 * @swagger
 * /site/{id}:
 *   get:
 *     tags:
 *       - Site
 *     summary: Get a site by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Site found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Site'
 *       404:
 *         description: Site not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.site.findUnique({
      where: { id },
      include: {
        areas: {
          include: {
            shafts: true
          }
        }
      }
    });
    if (!item) {
      return res.status(404).json({ error: "Site not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve site", details: error });
  }
});

/**
 * @swagger
 * /site/{id}:
 *   put:
 *     tags:
 *       - Site
 *     summary: Update a site
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
 *             $ref: '#/components/schemas/Site'
 *     responses:
 *       200:
 *         description: Site updated successfully
 *       404:
 *         description: Site not found
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.site.update({
      where: { id },
      data,
      include: {
        areas: {
          include: {
            shafts: true
          }
        }
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update site", details: error });
  }
});

/**
 * @swagger
 * /site/{id}:
 *   delete:
 *     tags:
 *       - Site
 *     summary: Delete a site
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Site deleted successfully
 *       404:
 *         description: Site not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.site.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete site", details: error });
  }
});

export default router; 