import { Router } from "express";
import { prisma } from "../../libs/prisma";

const router = Router();

/**
 * @swagger
 * /equipment:
 *   post:
 *     tags:
 *       - Equipment
 *     summary: Create new equipment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Equipment'
 *     responses:
 *       201:
 *         description: Equipment created successfully
 *       500:
 *         description: Server error
 */
router.post("", async (req, res) => {
  try {
    const data = req.body;
    const created = await prisma.equipment.create({
      data,
      include: {
        type: true,
        telematics: true,
        maintenanceRecords: true
      }
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to create equipment", details: error });
  }
});

/**
 * @swagger
 * /equipment:
 *   get:
 *     tags:
 *       - Equipment
 *     summary: Get all equipment with pagination, search, and filters
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
 *           default: "registrationNumber,type.name"
 *         description: Comma-separated list of fields to search in
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, IN_TRANSIT, UNDER_MAINTENANCE, OUT_OF_SERVICE]
 *         description: Filter by equipment status
 *       - in: query
 *         name: typeId
 *         schema:
 *           type: string
 *         description: Filter by equipment type ID
 *     responses:
 *       200:
 *         description: List of equipment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Equipment'
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
 *                     typeId:
 *                       type: string
 *       500:
 *         description: Server error
 */
router.get("", async (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get search and filter parameters
    const search = (req.query.search as string) || '';
    const searchFields = (req.query.searchFields as string || 'registrationNumber,type.name').split(',');
    const status = req.query.status as string;
    const typeId = req.query.typeId as string;

    // Build where clause
    const where: any = {};

    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    // Add type filter if provided
    if (typeId) {
      where.typeId = typeId;
    }

    // Add search conditions if search term provided
    if (search) {
      where.OR = [
        { registrationNumber: { contains: search, mode: 'insensitive' } },
        { type: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Get total count and paginated results in parallel
    const [totalCount, equipment] = await Promise.all([
      prisma.equipment.count({ where }),
      prisma.equipment.findMany({
        where,
        skip,
        take: limit,
        include: {
          type: true,
          telematics: true,
          maintenanceRecords: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: equipment,
      metadata: {
        totalCount,
        currentPage: page,
        totalPages,
        limit,
        search: search || undefined,
        searchFields,
        status: status || undefined,
        typeId: typeId || undefined
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve equipment", details: error });
  }
});

// ... Update all other endpoints similarly ...

export default router; 