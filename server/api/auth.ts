import { prisma } from "../../libs/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dayjs from "dayjs"; // Add this import
import crypto from "crypto";
import { sendEmail } from "../helpers/email";
import { emailRegex } from "../utils/regex";
import { sendDiscordError } from "../helpers/discord";
import { otpEmail } from "../helpers/email-templates/ts/otp";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return res.status(400).json({ error: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );
    const expiresAt = dayjs().add(1, "day").toDate();

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    res.json({ token });
  } catch (error) {
    await sendDiscordError(error as Error);
    res.status(500).json({ error: "Failed to login" });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (token) {
      await prisma.session.delete({ where: { token } });
    }
    res.sendStatus(200);
  } catch (error) {
    await sendDiscordError(error as Error);
    res.status(500).json({ error: "Failed to log out" });
  }
});

/**
 * @swagger
 * /auth/mobile/login:
 *   post:
 *     tags:
 *       - Mobile Authentication
 *     summary: Mobile login endpoint supporting multiple auth methods
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loginMethod
 *             properties:
 *               loginMethod:
 *                 type: string
 *                 enum: [password, apple, google]
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               idToken:
 *                 type: string
 *               user:
 *                 type: object
 *     responses:
 *       200:
 *         description: Login successful or OTP sent
 *       400:
 *         description: Invalid credentials or user not found
 *       500:
 *         description: Failed to process login request
 */
router.post("/mobile/login", async (req, res) => {
  try {
    const { loginMethod, email, password, idToken, user } = req.body;

    if (!loginMethod) {
      return res.status(400).json({ error: "Login method is required" });
    }

    switch (loginMethod) {
      case "password": {
        if (!email || !password) {
          return res
            .status(400)
            .json({ error: "Email and password are required" });
        }
        if (!emailRegex.test(email)) {
          return res.status(400).json({ error: "Invalid email format" });
        }

        // Check if mobile user exists
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user || !user.password) {
          console.log("User not found");
          return res.status(400).json({ error: "User not found" });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(400).json({ error: "Invalid credentials" });
        }

        // Generate token and create session
        const token = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET as string,
          { expiresIn: "1d" }
        );
        const expiresAt = dayjs().add(1, "day").toDate();

        await prisma.session.create({
          data: {
            token,
            userId: user.id,
            expiresAt,
          },
        });

        return res.json({ token });
      }

      default:
        return res.status(400).json({ error: "Invalid login method" });
    }
  } catch (error) {
    console.log("login error", error);
    res.status(500).json({ error: "Failed to process login request" });
  }
});

/**
 * @swagger
 * /auth/mobile/logout:
 *   post:
 *     tags:
 *       - Mobile Authentication
 *     summary: Mobile logout endpoint
 *     responses:
 *       200:
 *         description: Mobile logout successful
 */
router.post("/mobile/logout", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (token) {
      await prisma.session.delete({ where: { token } });
    }
    res.send("mobile");
  } catch (error) {
    console.log("logout error", error);
    res.status(500).json({ error: "Failed to log out" });
  }
});

/**
 * @swagger
 * /auth/forgot-password/request:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request password reset code
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
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset code sent successfully
 *       400:
 *         description: User not found
 *       500:
 *         description: Failed to send reset code
 */
router.post("/forgot-password/request", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Generate 6-digit reset code
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = dayjs().add(30, "minutes").toDate();

    // Store reset code in database
    await prisma.verificationCode.create({
      data: {
        email,
        code: resetCode,
        type: "PASSWORD_RESET",
        expiresAt,
      },
    });

    const emailTemplate = otpEmail(resetCode);
    await sendEmail({
      to: email,
      body: emailTemplate,
      subject: "Password Reset Code",
    });

    res.json({ message: "Password reset code sent successfully" });
  } catch (error) {
    console.log("forgot password error", error);
    res.status(500).json({ error: "Failed to send reset code" });
  }
});

/**
 * @swagger
 * /auth/forgot-password/reset:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset password with verification code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired code
 *       500:
 *         description: Failed to reset password
 */
router.post("/forgot-password/reset", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    // Verify reset code
    const verification = await prisma.verificationCode.findFirst({
      where: {
        code,
        email,
        expiresAt: {
          gt: new Date(),
        },
        type: "PASSWORD_RESET",
      },
    });
    console.log(verification);

    if (!verification) {
      return res.status(400).json({ error: "Invalid or expired reset code" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete used verification code
    await prisma.verificationCode.delete({
      where: { id: verification.id },
    });

    // Invalidate all existing sessions for this user
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.session.deleteMany({
        where: { userId: user.id },
      });
    }

    res.json({ message: "Password reset successful" });
  } catch (error) {
    await sendDiscordError(error as Error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

/**
 * @swagger
 * /auth/mobile/forgot-password/request:
 *   post:
 *     tags:
 *       - Mobile Authentication
 *     summary: Request mobile password reset OTP
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
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset OTP sent successfully
 *       400:
 *         description: Mobile user not found
 *       500:
 *         description: Failed to send reset OTP
 */
router.post("/mobile/forgot-password/request", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if mobile user exists
    const user = await prisma.user.findUnique({
      where: {
        email,
        role: "MOBILE_USER",
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Mobile user not found" });
    }

    // Generate 5-digit OTP
    const otp = crypto.randomInt(10000, 99999).toString();
    const expiresAt = dayjs().add(20, "minutes").toDate();

    // Store OTP in database
    await prisma.verificationCode.create({
      data: {
        email,
        code: otp,
        type: "MOBILE_PASSWORD_RESET",
        expiresAt,
      },
    });

    const emailTemplate = otpEmail(otp);
    await sendEmail({
      to: email,
      body: emailTemplate,
      subject: "OTP Code",
    });

    res.json({ message: "Password reset code sent successfully" });
  } catch (error) {
    await sendDiscordError(error as Error);
    res.status(500).json({ error: "Failed to send reset code" });
  }
});

/**
 * @swagger
 * /auth/mobile/forgot-password/verify:
 *   post:
 *     tags:
 *       - Mobile Authentication
 *     summary: Verify mobile password reset OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Failed to verify OTP
 */
router.post("/mobile/forgot-password/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const verification = await prisma.verificationCode.findFirst({
      where: {
        email,
        code: otp,
        type: "MOBILE_PASSWORD_RESET",
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verification) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Update emailVerified status
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    res.json({ valid: true });
  } catch (error) {
    await sendDiscordError(error as Error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

/**
 * @swagger
 * /auth/mobile/forgot-password/reset:
 *   post:
 *     tags:
 *       - Mobile Authentication
 *     summary: Complete mobile password reset with OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Failed to reset password
 */
router.post("/mobile/forgot-password/reset", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Verify reset code
    const verification = await prisma.verificationCode.findFirst({
      where: {
        email,
        code: otp,
        type: "MOBILE_PASSWORD_RESET",
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verification) {
      throw new Error("Invalid or expired reset code");
    }

    // Find mobile user
    const user = await prisma.user.findUnique({
      where: {
        email,
        role: "MOBILE_USER",
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Mobile user not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete used verification code
    await prisma.verificationCode.delete({
      where: { id: verification.id },
    });

    // Invalidate all existing sessions for this user
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Generate new token for automatic login
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );
    const expiresAt = dayjs().add(1, "day").toDate();

    // Create new session
    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    res.json({ token });
  } catch (error) {
    await sendDiscordError(error as Error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

/**
 * @swagger
 * /auth/mobile/update-password:
 *   post:
 *     tags:
 *       - Mobile Authentication
 *     summary: Update mobile user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid current password
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to update password
 */
router.post("/mobile/update-password", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current and new passwords are required" });
    }

    // Verify session and get user
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || !session.user || session.expiresAt < new Date()) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      session.user.password || ""
    );
    if (!isValidPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    // Invalidate all other sessions for this user
    await prisma.session.deleteMany({
      where: {
        userId: session.user.id,
        NOT: { token },
      },
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    await sendDiscordError(error as Error);
    res.status(500).json({ error: "Failed to update password" });
  }
});

/**
 * @swagger
 * /mobile/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 role:
 *                   type: string
 *                 trade:
 *                   type: string
 *                 dateOfBirth:
 *                   type: string
 *                   format: date
 *                 mobileNumber:
 *                   type: string
 *                 postalCode:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to retrieve user details
 */
router.get("/mobile/me", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || !session.user || session.expiresAt < new Date()) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const { password, ...userDetails } = session.user;
    res.json(userDetails);
  } catch (error) {
    await sendDiscordError(error as Error);
    res.status(500).json({ error: "Failed to retrieve user details" });
  }
});

export default router;
