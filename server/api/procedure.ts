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
 *     summary: Get all procedures
 *     responses:
 *       200:
 *         description: List of procedures retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Procedure'
 *       500:
 *         description: Server error
 */
router.get("", async (req, res) => {
  try {
    const procedures = await prisma.procedure.findMany({
      include: {
        questions: {
          orderBy: {
            order: 'asc'
          }
        },
        executions: true,
      },
    });
    res.json(procedures);
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