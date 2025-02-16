import { Router } from "express";
import { prisma } from "../../libs/prisma";

const router = Router();

/**
 * @swagger
 * /client:
 *   post:
 *     tags:
 *       - Client
 *     summary: Create a new client
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       201:
 *         description: Client created successfully
 *       500:
 *         description: Server error
 */
router.post("", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - User not found" });
    }

    const data = req.body;
    // Ensure array fields are properly handled
    const formattedData = {
      ...data,
      createdById: userId,
      contactNumber: Array.isArray(data.contactNumber) ? data.contactNumber : [data.contactNumber].filter(Boolean),
      whatsapp: Array.isArray(data.whatsapp) ? data.whatsapp : [data.whatsapp].filter(Boolean),
      email: Array.isArray(data.email) ? data.email : [data.email].filter(Boolean),
      potentialContactNumbers: data.potentialContactNumbers ?? false
    };

    const created = await prisma.client.create({
      data: formattedData,
      include: {
        shafts: true,
        syndicates: true,
        createdBy: true
      }
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to create client", details: error });
  }
});

/**
 * @swagger
 * /client/my-clients:
 *   get:
 *     tags:
 *       - Client
 *     summary: Get all clients created by the current user
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
 *         name: filter
 *         schema:
 *           type: string
 *         description: Filter clients by status (e.g., ACTIVE, INACTIVE)
 *     responses:
 *       200:
 *         description: List of user's clients retrieved successfully
 *       401:
 *         description: Unauthorized - User not found
 *       500:
 *         description: Server error
 */
router.get("/my-clients", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - User not found" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || '';
    const filter = req.query.filter as string | undefined;

    const where: any = {
      createdById: userId
    };

    // Add status filter if provided
    if (filter && filter !== 'all') {
      where.status = filter;
    }

    // Add search conditions if search term provided
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { idNumber: { contains: search, mode: 'insensitive' } },
        {
          contactNumber: {
            hasSome: [search]
          }
        },
        {
          email: {
            hasSome: [search]
          }
        }
      ];
    }

    const [totalCount, clients] = await Promise.all([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        include: {
          shafts: true,
          syndicates: true,
          createdBy: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: clients,
      metadata: {
        totalCount,
        currentPage: page,
        totalPages,
        limit,
        search: search || undefined,
        filter: filter || undefined
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve clients", details: error });
  }
});

/**
 * @swagger
 * /client:
 *   get:
 *     tags:
 *       - Client
 *     summary: Get all clients with pagination, search, and filters
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
 *         name: filter
 *         schema:
 *           type: string
 *         description: Filter clients by status (e.g., ACTIVE, INACTIVE)
 *       - in: query
 *         name: searchFields
 *         schema:
 *           type: string
 *           default: "firstName,lastName,email,idNumber,contactNumber"
 *         description: Comma-separated list of fields to search in
 *     responses:
 *       200:
 *         description: List of clients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Client'
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
    const filter = req.query.filter as string | undefined;
    const searchFields = (req.query.searchFields as string || 'firstName,lastName,email,idNumber,contactNumber').split(',');

    const where: any = {};

    // Add status filter if provided
    if (filter && filter !== 'all') {
      where.status = filter;
    }

    if (search) {
      where.OR = searchFields.map(field => {
        // Handle array fields differently
        if (field === 'contactNumber') {
          return {
            contactNumber: {
              hasSome: [search]
            }
          };
        }
        if (field === 'email') {
          return {
            email: {
              hasSome: [search]
            }
          };
        }
        if (field === 'whatsapp') {
          return {
            whatsapp: {
              hasSome: [search]
            }
          };
        }
        // Handle regular string fields
        return {
          [field]: {
            contains: search,
            mode: 'insensitive'
          }
        };
      });
    }

    const [totalCount, clients] = await Promise.all([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        include: {
          shafts: true,
          syndicates: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: clients,
      metadata: {
        totalCount,
        currentPage: page,
        totalPages,
        limit,
        search: search || undefined,
        searchFields,
        filter: filter || undefined
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve clients", details: error });
  }
});

/**
 * @swagger
 * /client/{id}:
 *   get:
 *     tags:
 *       - Client
 *     summary: Get a client by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       404:
 *         description: Client not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.client.findUnique({
      where: { id },
      include: {
        shafts: true,
        syndicates: true
      }
    });
    if (!item) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve client", details: error });
  }
});

/**
 * @swagger
 * /client/{id}:
 *   put:
 *     tags:
 *       - Client
 *     summary: Update a client
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
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       200:
 *         description: Client updated successfully
 *       404:
 *         description: Client not found
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    // Ensure array fields are properly handled
    const formattedData = {
      ...data,
      contactNumber: Array.isArray(data.contactNumber) ? data.contactNumber : [data.contactNumber].filter(Boolean),
      whatsapp: Array.isArray(data.whatsapp) ? data.whatsapp : [data.whatsapp].filter(Boolean),
      email: Array.isArray(data.email) ? data.email : [data.email].filter(Boolean),
      potentialContactNumbers: data.potentialContactNumbers ?? false
    };

    const updated = await prisma.client.update({
      where: { id },
      data: formattedData,
      include: {
        shafts: true,
        syndicates: true
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update client", details: error });
  }
});

/**
 * @swagger
 * /client/{id}:
 *   delete:
 *     tags:
 *       - Client
 *     summary: Delete a client
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Client deleted successfully
 *       404:
 *         description: Client not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.client.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete client", details: error });
  }
});



export default router; 