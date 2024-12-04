import { Router } from "express";
import { AuthService } from "../services/auth.service";

const router = Router();
const authService = new AuthService();

/**
 * @swagger
 * /auth/request-code:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request an authentication code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Auth code sent successfully
 *       400:
 *         description: Invalid request
 */
router.post("/request-code", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    const result = await authService.requestAuthCode(email);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({ message: result.message });
  } catch (error) {
    console.error("Failed to request auth code:", error);
  }
});

/**
 * @swagger
 * /auth/verify-code:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify authentication code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentication successful
 *       400:
 *         description: Invalid code or request
 */
router.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required" });
  }

  const result = await authService.verifyAuthCode(email, code);

  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json({ 
    token: result.token, 
    user: result.user,
    message: result.message 
  });
});

export default router;
