import { Router } from "express";
import { prisma } from "../../libs/prisma";

const router = Router();

/**
 * @swagger
 * /exception:
 *   post:
 *     tags:
 *       - Exception
 *     summary: Create a new exception
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Exception'
 *     responses:
 *       201:
 *         description: Exception created successfully
 *       500:
 *         description: Server error
 */
router.post("", async (req, res) => {
  try {
    const data = req.body;
    const created = await prisma.exception.create({
      data,
      include: {
        execution: {
          include: {
            procedure: true,
            user: true
          }
        }
      }
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to create exception", details: error });
  }
});

/**
 * @swagger
 * /exception:
 *   get:
 *     tags:
 *       - Exception
 *     summary: Get all exceptions
 *     responses:
 *       200:
 *         description: List of exceptions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exception'
 *       500:
 *         description: Server error
 */
router.get("", async (req, res) => {
  try {
    const exceptions = await prisma.exception.findMany({
      include: {
        execution: {
          include: {
            procedure: true,
            user: true
          }
        }
      }
    });
    res.json(exceptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve exceptions", details: error });
  }
});

/**
 * @swagger
 * /exception/{id}:
 *   get:
 *     tags:
 *       - Exception
 *     summary: Get an exception by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exception found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exception'
 *       404:
 *         description: Exception not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.exception.findUnique({
      where: { id },
      include: {
        execution: {
          include: {
            procedure: true,
            user: true
          }
        }
      }
    });
    if (!item) {
      return res.status(404).json({ error: "Exception not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve exception", details: error });
  }
});

/**
 * @swagger
 * /exception/{id}:
 *   put:
 *     tags:
 *       - Exception
 *     summary: Update an exception
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
 *             $ref: '#/components/schemas/Exception'
 *     responses:
 *       200:
 *         description: Exception updated successfully
 *       404:
 *         description: Exception not found
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.exception.update({
      where: { id },
      data,
      include: {
        execution: {
          include: {
            procedure: true,
            user: true
          }
        }
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update exception", details: error });
  }
});

/**
 * @swagger
 * /exception/{id}:
 *   delete:
 *     tags:
 *       - Exception
 *     summary: Delete an exception
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Exception deleted successfully
 *       404:
 *         description: Exception not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.exception.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete exception", details: error });
  }
});

export default router; 