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
    const data = req.body;
    const created = await prisma.client.create({
      data,
      include: {
        shafts: true,
        syndicates: true
      }
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to create client", details: error });
  }
});

/**
 * @swagger
 * /client:
 *   get:
 *     tags:
 *       - Client
 *     summary: Get all clients
 *     responses:
 *       200:
 *         description: List of clients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
 *       500:
 *         description: Server error
 */
router.get("", async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        shafts: true,
        syndicates: true
      }
    });
    res.json(clients);
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
    const updated = await prisma.client.update({
      where: { id },
      data,
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