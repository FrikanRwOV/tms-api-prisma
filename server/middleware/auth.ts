import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const prisma = new PrismaClient();

async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return res.sendStatus(403);
    }

    req.user = session.user;
    next();
  } catch (error) {
    return res.sendStatus(403);
  }
}

/**
 * Middleware to check if user has required role(s)
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
function authorizeRoles(allowedRoles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: "Access forbidden", 
        message: "You don't have the required role to access this resource" 
      });
    }

    next();
  };
}

/**
 * Middleware to check if user has required permission(s)
 * @param requiredPermissions - Array of permissions required to access the route
 */
function authorizePermissions(requiredPermissions: Permission[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const hasAllPermissions = requiredPermissions.every(permission => 
      req.user?.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({ 
        error: "Access forbidden", 
        message: "You don't have the required permissions to access this resource" 
      });
    }

    next();
  };
}

// Export both middleware functions
export { authenticateToken, authorizeRoles, authorizePermissions };
