import { PrismaClient, User } from "@prisma/client";
import jwt from "jsonwebtoken";
import { sendEmail } from "./email.service";

const prisma = new PrismaClient();

export class AuthService {
  private generateAuthCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
      expiresIn: "24h",
    });
  }

  async requestAuthCode(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.role !== "DRIVER" && user.role !== "REQUESTER") {
      return { 
        success: false, 
        message: "Only drivers and requesters can use auth codes" 
      };
    }

    const authCode = this.generateAuthCode();
    const authCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { authCode, authCodeExpires },
    });

    // Send auth code via email
    try {
      await sendEmail({
        to: email,
        subject: "Your Authentication Code",
        body: `
          <h1>Authentication Code</h1>
          <p>Your authentication code is: <strong>${authCode}</strong></p>
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request this code, please ignore this email.</p>
        `,
      });
    } catch (error) {
      console.error("Failed to send auth code email:", error);
      return { success: false, message: "Failed to send authentication code" };
    }

    return { success: true, message: "Auth code sent successfully" };
  }

  async verifyAuthCode(
    email: string,
    code: string
  ): Promise<{ success: boolean; token?: string; message: string }> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (!user.authCode || !user.authCodeExpires) {
      return { success: false, message: "No auth code requested" };
    }

    if (new Date() > user.authCodeExpires) {
      return { success: false, message: "Auth code expired" };
    }

    if (user.authCode !== code) {
      return { success: false, message: "Invalid auth code" };
    }

    // Clear the auth code after successful verification
    await prisma.user.update({
      where: { id: user.id },
      data: { authCode: null, authCodeExpires: null },
    });

    const token = this.generateToken(user.id);
    return { success: true, token, message: "Authentication successful" };
  }
}
