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
 *     summary: Get all syndicates
 *     responses:
 *       200:
 *         description: List of syndicates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Syndicate'
 *       500:
 *         description: Server error
 */
router.get("", async (req, res) => {
  try {
    const syndicates = await prisma.syndicate.findMany({
      include: {
        clients: true
      }
    });
    res.json(syndicates);
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