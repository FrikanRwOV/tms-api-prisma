import { Router } from "express";
import { prisma } from "../../libs/prisma";

const router = Router();

/**
 * @swagger
 * /vehicle:
 *   post:
 *     tags:
 *       - Vehicle
 *     summary: Create a new vehicle
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vehicle'
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 *       500:
 *         description: Server error
 */
router.post("", async (req, res) => {
  try {
    const data = req.body;
    const created = await prisma.vehicle.create({ data });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to create vehicle", details: error });
  }
});

/**
 * @swagger
 * /vehicle:
 *   get:
 *     tags:
 *       - Vehicle
 *     summary: Get all vehicles
 *     responses:
 *       200:
 *         description: List of vehicles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehicle'
 *       500:
 *         description: Server error
 */
router.get("", async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        type: true,
        telematics: true,
        maintenanceRecords: true,
      },
    });
    res.json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve vehicles", details: error });
  }
});

/**
 * @swagger
 * /vehicle/{id}:
 *   get:
 *     tags:
 *       - Vehicle
 *     summary: Get a vehicle by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vehicle found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicle'
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        type: true,
        telematics: true,
        maintenanceRecords: true,
      },
    });
    if (!item) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve vehicle", details: error });
  }
});

/**
 * @swagger
 * /vehicle/{id}:
 *   put:
 *     tags:
 *       - Vehicle
 *     summary: Update a vehicle
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
 *             $ref: '#/components/schemas/Vehicle'
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.vehicle.update({
      where: { id },
      data,
      include: {
        type: true,
        telematics: true,
        maintenanceRecords: true,
      },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update vehicle", details: error });
  }
});

/**
 * @swagger
 * /vehicle/{id}:
 *   delete:
 *     tags:
 *       - Vehicle
 *     summary: Delete a vehicle
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Vehicle deleted successfully
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.vehicle.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete vehicle", details: error });
  }
});

export default router;