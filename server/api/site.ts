import { Router } from "express";
import { prisma } from "../../libs/prisma";

const router = Router();

/**
 * @swagger
 * /site:
 *   post:
 *     tags:
 *       - Site
 *     summary: Create a new site
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Site'
 *     responses:
 *       201:
 *         description: Site created successfully
 *       500:
 *         description: Server error
 */
router.post("", async (req, res) => {
  try {
    const data = req.body;
    const created = await prisma.site.create({
      data,
      include: {
        areas: {
          include: {
            shafts: true
          }
        }
      }
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to create site", details: error });
  }
});

/**
 * @swagger
 * /site:
 *   get:
 *     tags:
 *       - Site
 *     summary: Get all sites
 *     responses:
 *       200:
 *         description: List of sites retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Site'
 *       500:
 *         description: Server error
 */
router.get("", async (req, res) => {
  try {
    const sites = await prisma.site.findMany({
      include: {
        areas: {
          include: {
            shafts: true
          }
        }
      }
    });
    res.json(sites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve sites", details: error });
  }
});

/**
 * @swagger
 * /site/{id}:
 *   get:
 *     tags:
 *       - Site
 *     summary: Get a site by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Site found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Site'
 *       404:
 *         description: Site not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.site.findUnique({
      where: { id },
      include: {
        areas: {
          include: {
            shafts: true
          }
        }
      }
    });
    if (!item) {
      return res.status(404).json({ error: "Site not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve site", details: error });
  }
});

/**
 * @swagger
 * /site/{id}:
 *   put:
 *     tags:
 *       - Site
 *     summary: Update a site
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
 *             $ref: '#/components/schemas/Site'
 *     responses:
 *       200:
 *         description: Site updated successfully
 *       404:
 *         description: Site not found
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.site.update({
      where: { id },
      data,
      include: {
        areas: {
          include: {
            shafts: true
          }
        }
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update site", details: error });
  }
});

/**
 * @swagger
 * /site/{id}:
 *   delete:
 *     tags:
 *       - Site
 *     summary: Delete a site
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Site deleted successfully
 *       404:
 *         description: Site not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.site.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete site", details: error });
  }
});

export default router; 