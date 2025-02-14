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
 *     summary: Get all shafts
 *     responses:
 *       200:
 *         description: List of shafts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shaft'
 *       500:
 *         description: Server error
 */
router.get("", async (req, res) => {
  try {
    const shafts = await prisma.shaft.findMany({
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
    res.json(shafts);
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