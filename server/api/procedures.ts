import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateUser, authorizeRoles } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /procedures:
 *   get:
 *     tags:
 *       - Procedures
 *     summary: Get all procedures
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all procedures
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Procedure'
 *       500:
 *         description: Server error
 */
router.get('/procedures', 
  authenticateUser,
  async (req, res) => {
    try {
      const procedures = await prisma.procedure.findMany({
        include: { questions: true }
      });
      res.json(procedures);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch procedures' });
    }
});

/**
 * @swagger
 * /procedures/{id}:
 *   get:
 *     tags:
 *       - Procedures
 *     summary: Get a specific procedure
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Procedure details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Procedure'
 *       404:
 *         description: Procedure not found
 *       500:
 *         description: Server error
 */
router.get('/procedures/:id',
  authenticateUser,
  async (req, res) => {
    try {
      const procedure = await prisma.procedure.findUnique({
        where: { id: req.params.id },
        include: { questions: true }
      });
      if (!procedure) {
        return res.status(404).json({ error: 'Procedure not found' });
      }
      res.json(procedure);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch procedure' });
    }
});

/**
 * @swagger
 * /procedures:
 *   post:
 *     tags:
 *       - Procedures
 *     summary: Create a new procedure
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - type
 *               - questions
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [STANDARD, EXCEPTION]
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     answerType:
 *                       type: string
 *                       enum: [TEXT, BOOLEAN, CHOICE, FILE_UPLOAD]
 *                     choices:
 *                       type: object
 *                     order:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Procedure created successfully
 *       500:
 *         description: Server error
 */
router.post('/procedures',
  authenticateUser,
  authorizeRoles(['ADMINISTRATOR']),
  async (req, res) => {
    const { name, description, type, questions } = req.body;
    try {
      const procedure = await prisma.procedure.create({
        data: {
          name,
          description,
          type,
          questions: {
            create: questions.map((q: any) => ({
              text: q.text,
              answerType: q.answerType,
              choices: q.choices,
              order: q.order
            }))
          }
        },
        include: { questions: true }
      });
      res.status(201).json(procedure);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create procedure' });
    }
});

/**
 * @swagger
 * /executions:
 *   post:
 *     tags:
 *       - Executions
 *     summary: Start a procedure execution
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - procedureId
 *             properties:
 *               procedureId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Execution started successfully
 *       500:
 *         description: Server error
 */
router.post('/executions',
  authenticateUser,
  async (req, res) => {
    const { procedureId } = req.body;
    try {
      const execution = await prisma.execution.create({
        data: {
          procedureId,
          userId: req.user.id,
          status: 'IN_PROGRESS',
          responses: {},
        }
      });
      res.status(201).json(execution);
    } catch (error) {
      res.status(500).json({ error: 'Failed to start execution' });
    }
});

/**
 * @swagger
 * /executions/{id}:
 *   patch:
 *     tags:
 *       - Executions
 *     summary: Update execution responses
 *     security:
 *       - bearerAuth: []
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
 *               - responses
 *               - status
 *             properties:
 *               responses:
 *                 type: object
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Execution updated successfully
 *       500:
 *         description: Server error
 */
router.patch('/executions/:id',
  authenticateUser,
  async (req, res) => {
    const { responses, status } = req.body;
    try {
      const execution = await prisma.execution.update({
        where: { id: req.params.id },
        data: {
          responses,
          status,
          endTime: status === 'COMPLETED' ? new Date() : undefined
        }
      });
      res.json(execution);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update execution' });
    }
});

/**
 * @swagger
 * /exceptions:
 *   post:
 *     tags:
 *       - Exceptions
 *     summary: Log an exception
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - executionId
 *               - description
 *               - evidence
 *               - actionTaken
 *             properties:
 *               executionId:
 *                 type: string
 *               description:
 *                 type: string
 *               evidence:
 *                 type: string
 *               actionTaken:
 *                 type: string
 *     responses:
 *       201:
 *         description: Exception logged successfully
 *       500:
 *         description: Server error
 */
router.post('/exceptions',
  authenticateUser,
  async (req, res) => {
    const { executionId, description, evidence, actionTaken } = req.body;
    try {
      const exception = await prisma.exception.create({
        data: {
          executionId,
          description,
          evidence,
          actionTaken
        }
      });
      
      // If action involves maintenance booking
      if (actionTaken?.includes('maintenance')) {
        // Create maintenance record
        await prisma.maintenance.create({
          data: {
            vehicleId: req.body.vehicleId,
            description: `Maintenance required from exception: ${description}`,
            startDate: new Date(),
            status: 'scheduled'
          }
        });
      }
      
      res.status(201).json(exception);
    } catch (error) {
      res.status(500).json({ error: 'Failed to log exception' });
    }
});

/**
 * @swagger
 * /executions/{id}:
 *   get:
 *     tags:
 *       - Executions
 *     summary: Get execution details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Execution details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Execution'
 *       404:
 *         description: Execution not found
 *       500:
 *         description: Server error
 */
router.get('/executions/:id',
  authenticateUser,
  async (req, res) => {
    try {
      const execution = await prisma.execution.findUnique({
        where: { id: req.params.id },
        include: {
          procedure: { include: { questions: true } },
          exceptions: true
        }
      });
      if (!execution) {
        return res.status(404).json({ error: 'Execution not found' });
      }
      res.json(execution);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch execution' });
    }
});

export default router;
