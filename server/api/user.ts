import { Router } from "express";
import {prisma} from "../../libs/prisma";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - firstName
 *         - lastName
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         email:
 *           type: string
 *           format: email
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         middleName:
 *           type: string
 *         idNumber:
 *           type: string
 *         contactNumber:
 *           type: string
 *         whatsapp:
 *           type: string
 *         address:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [ADMINISTRATOR, TRANSPORT_MANAGER, DRIVER, REQUESTER, WORKSHOP_MANAGER]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /user:
 *   post:
 *     tags:
 *       - User
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *       500:
 *         description: Server error
 */
router.post("", async (req, res) => {
  try {
    const data = req.body;
    const created = await prisma.user.create({ data });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user", details: error });
  }
});

/**
 * @swagger
 * /user:
 *   get:
 *     tags:
 *       - User
 *     summary: Get all users with pagination, search, and filters
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
 *           default: "firstName,lastName,email,contactNumber"
 *         description: Comma-separated list of fields to search in
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMINISTRATOR, TRANSPORT_MANAGER, DRIVER, REQUESTER, WORKSHOP_MANAGER]
 *         description: Filter by user role
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
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
 *                     role:
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
    const searchFields = (req.query.searchFields as string || 'firstName,lastName,email,contactNumber').split(',');
    const role = req.query.role as string;

    // Build where clause
    const where: any = {};

    // Add role filter if provided
    if (role) {
      where.role = role;
    }

    // Add search conditions if search term provided
    if (search) {
      where.OR = searchFields.map(field => ({
        [field]: { contains: search, mode: 'insensitive' }
      }));
    }

    // Get total count and paginated results in parallel
    const [totalCount, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: users,
      metadata: {
        totalCount,
        currentPage: page,
        totalPages,
        limit,
        search: search || undefined,
        searchFields,
        role: role || undefined
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve users", details: error });
  }
});

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     tags:
 *       - User
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.user.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: "user not found" });
    } else {
      res.json(item);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve user", details: error });
  }
});

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     tags:
 *       - User
 *     summary: Update a user
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
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.user.update({ where: { id }, data });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user", details: error });
  }
});

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     tags:
 *       - User
 *     summary: Delete a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user", details: error });
  }
});

export default router;
