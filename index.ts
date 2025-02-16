import express from "express";
const serverless = require("serverless-http");
import cors from "cors";
import { authenticateToken } from "./server/middleware/auth";

import userRoutes from "./server/api/user";
import authRoutes from "./server/api/auth";
import equipmentRoutes from "./server/api/equipment";
import procedureRoutes from "./server/api/procedure";
import clientRoutes from "./server/api/client";
import jobRoutes from "./server/api/job";
import siteRoutes from "./server/api/site";
import areaRoutes from "./server/api/area";
import shaftRoutes from "./server/api/shaft";
import syndicateRoutes from "./server/api/syndicate";
import exceptionRoutes from "./server/api/exception";
import uploadRoutes from "./server/api/upload";
import executionRoutes from "./server/api/execution";
import planRoutes from "./server/api/plan";
const app = express();
app.use(cors());
app.use(express.json());

// Public routes (no authentication required)
app.use("/auth", authRoutes);
app.use("/docs", (req, res) => {
  const stage = process.env.STAGE || "dev";
  const bucketName = process.env.SWAGGER_BUCKET_NAME || "tms-swagger-api-dev";
  res.redirect(
    `https://${bucketName}-${stage}.s3.eu-west-1.amazonaws.com/${stage}/index.html`
  );
});
app.use("/interfaces", (req, res) => {
  const stage = process.env.STAGE || 'dev';
  const bucketName = process.env.SWAGGER_BUCKET_NAME || "tms-swagger-api-dev";
  res.redirect(`https://${bucketName}-${stage}.s3.eu-west-1.amazonaws.com/typescript-interfaces.ts`);
});
app.use("/enums", (req, res) => {
  const stage = process.env.STAGE || "dev";
  const bucketName = process.env.SWAGGER_BUCKET_NAME || "tms-swagger-api-dev";
  res.redirect(
    `https://${bucketName}-${stage}.s3.eu-west-1.amazonaws.com/enums/`
  );
});

// Protected routes (authentication required)
app.use("/client", authenticateToken, clientRoutes);
app.use("/job", authenticateToken, jobRoutes);
app.use("/procedure", authenticateToken, procedureRoutes);
app.use("/execution", authenticateToken, executionRoutes);
app.use("/user", authenticateToken, userRoutes);
app.use("/equipment", authenticateToken, equipmentRoutes);
app.use("/site", authenticateToken, siteRoutes);
app.use("/area", authenticateToken, areaRoutes);
app.use("/shaft", authenticateToken, shaftRoutes);
app.use("/syndicate", authenticateToken, syndicateRoutes);
app.use("/exception", authenticateToken, exceptionRoutes);
app.use("/upload", authenticateToken, uploadRoutes);
app.use("/plan", authenticateToken, planRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

exports.handler = serverless(app);
