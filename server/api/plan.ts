import { Router } from "express";
import { prisma } from "../../libs/prisma";

const router = Router();

/**
 * @swagger
 * /plan:
 *   post:
 *     tags:
 *       - Plan
 *     summary: Create a new daily plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Plan created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { date } = req.body;
    const created = await prisma.dailyPlan.create({
      data: {
        date: new Date(date),
        createdById: userId,
      },
      include: {
        assignments: {
          include: {
            equipment: true,
            job: true,
          }
        }
      }
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to create plan", details: error });
  }
});

/**
 * @swagger
 * /plan/{id}/assignments:
 *   post:
 *     tags:
 *       - Plan
 *     summary: Add assignments to a plan
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
 *             type: object
 *             required:
 *               - assignments
 *             properties:
 *               assignments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - equipmentId
 *                     - jobId
 *                     - order
 *                   properties:
 *                     equipmentId:
 *                       type: string
 *                     jobId:
 *                       type: string
 *                     order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Assignments added successfully
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Server error
 */
router.post("/:id/assignments", async (req, res) => {
  try {
    const { id } = req.params;
    const { assignments } = req.body;

    const plan = await prisma.dailyPlan.findUnique({
      where: { id }
    });

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const created = await prisma.$transaction(
      assignments.map((assignment: any) =>
        prisma.planAssignment.create({
          data: {
            planId: id,
            equipmentId: assignment.equipmentId,
            jobId: assignment.jobId,
            order: assignment.order
          }
        })
      )
    );

    // Update job statuses to PLANNED
    await prisma.job.updateMany({
      where: {
        id: {
          in: assignments.map((a: any) => a.jobId)
        }
      },
      data: {
        status: 'PLANNED'
      }
    });

    res.json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to add assignments", details: error });
  }
});

/**
 * @swagger
 * /plan/{id}/publish:
 *   post:
 *     tags:
 *       - Plan
 *     summary: Publish a daily plan
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan published successfully
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Server error
 */
router.post("/:id/publish", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.dailyPlan.update({
      where: { id },
      data: { status: 'PUBLISHED' },
      include: {
        assignments: {
          include: {
            equipment: true,
            job: true
          }
        }
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to publish plan", details: error });
  }
});

/**
 * @swagger
 * /plan/date/{date}:
 *   get:
 *     tags:
 *       - Plan
 *     summary: Get plans for a specific date
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Plans retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/date/:date", async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const plans = await prisma.dailyPlan.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        assignments: {
          include: {
            equipment: true,
            job: true
          }
        },
        createdBy: true
      }
    });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve plans", details: error });
  }
});

export default router; 