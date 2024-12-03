import { Router } from "express";
import prisma from "../libs/prisma";
import { VehicleStatus } from "@prisma/client";
import authenticateToken from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /vehicles:
 *   get:
 *     tags:
 *       - Vehicles
 *     summary: Get all vehicles with optional filters
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by vehicle type ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by vehicle status
 *     responses:
 *       200:
 *         description: A list of vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehicle'
 *       500:
 *         description: Failed to fetch vehicles
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { type, status } = req.query;
    const filters: any = {};

    if (type) filters.typeId = type;
    if (status) filters.status = status as VehicleStatus;

    const vehicles = await prisma.vehicle.findMany({
      where: filters,
      include: {
        type: true,
        telematics: true,
      },
    });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vehicles", details: error });
  }
});

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     tags:
 *       - Vehicles
 *     summary: Get specific vehicle by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicle'
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Failed to fetch vehicle
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        type: true,
        telematics: true,
        maintenanceRecords: true,
      },
    });

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vehicle", details: error });
  }
});

/**
 * @swagger
 * /vehicles:
 *   post:
 *     tags:
 *       - Vehicles
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
 *         description: Failed to create vehicle
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    const vehicle = await prisma.vehicle.create({
      data: {
        registrationNumber: data.registrationNumber,
        typeId: data.typeId,
        status: data.status || "AVAILABLE",
        telematics: data.telematics ? {
          create: data.telematics
        } : undefined
      },
      include: {
        type: true,
        telematics: true,
      },
    });
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: "Failed to create vehicle", details: error });
  }
});

/**
 * @swagger
 * /vehicles/{id}:
 *   put:
 *     tags:
 *       - Vehicles
 *     summary: Update a vehicle
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The vehicle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vehicle'
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 *       500:
 *         description: Failed to update vehicle
 */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        registrationNumber: data.registrationNumber,
        typeId: data.typeId,
        status: data.status,
        telematics: data.telematics ? {
          update: data.telematics
        } : undefined
      },
      include: {
        type: true,
        telematics: true,
      },
    });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: "Failed to update vehicle", details: error });
  }
});

/**
 * @swagger
 * /vehicles/{id}:
 *   delete:
 *     tags:
 *       - Vehicles
 *     summary: Delete a vehicle
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The vehicle ID
 *     responses:
 *       204:
 *         description: Vehicle deleted successfully
 *       500:
 *         description: Failed to delete vehicle
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.vehicle.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete vehicle", details: error });
  }
});

/**
 * @swagger
 * /vehicles/types:
 *   get:
 *     tags:
 *       - Vehicle Types
 *     summary: Get all vehicle types
 *     responses:
 *       200:
 *         description: A list of vehicle types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VehicleType'
 *       500:
 *         description: Failed to fetch vehicle types
 */
router.get("/types", authenticateToken, async (req, res) => {
  try {
    const types = await prisma.vehicleType.findMany();
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vehicle types", details: error });
  }
});

/**
 * @swagger
 * /vehicles/types:
 *   post:
 *     tags:
 *       - Vehicle Types
 *     summary: Create a new vehicle type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VehicleType'
 *     responses:
 *       201:
 *         description: Vehicle type created successfully
 *       500:
 *         description: Failed to create vehicle type
 */
router.post("/types", authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    const type = await prisma.vehicleType.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
    res.status(201).json(type);
  } catch (error) {
    res.status(500).json({ error: "Failed to create vehicle type", details: error });
  }
});

/**
 * @swagger
 * /vehicles/types/{id}:
 *   put:
 *     tags:
 *       - Vehicle Types
 *     summary: Update a vehicle type
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The vehicle type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VehicleType'
 *     responses:
 *       200:
 *         description: Vehicle type updated successfully
 *       500:
 *         description: Failed to update vehicle type
 */
router.put("/types/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const type = await prisma.vehicleType.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    });
    res.json(type);
  } catch (error) {
    res.status(500).json({ error: "Failed to update vehicle type", details: error });
  }
});

/**
 * @swagger
 * /vehicles/types/{id}:
 *   delete:
 *     tags:
 *       - Vehicle Types
 *     summary: Delete a vehicle type
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The vehicle type ID
 *     responses:
 *       204:
 *         description: Vehicle type deleted successfully
 *       500:
 *         description: Failed to delete vehicle type
 */
router.delete("/types/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.vehicleType.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete vehicle type", details: error });
  }
});

export default router;
