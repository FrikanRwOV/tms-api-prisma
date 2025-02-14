import express from "express";
const serverless = require("serverless-http");

import userRoutes from "./server/api/user";
import authRoutes from "./server/api/auth";
import vehicleRoutes from "./server/api/vehicle";
import procedureRoutes from "./server/api/procedure";
import clientRoutes from "./server/api/client";
import jobRoutes from "./server/api/job";
import siteRoutes from "./server/api/site";
import areaRoutes from "./server/api/area";
import shaftRoutes from "./server/api/shaft";
import syndicateRoutes from "./server/api/syndicate";
import exceptionRoutes from "./server/api/exception";

const app = express();
app.use(express.json());

// Redirect /docs to static Swagger documentation
app.get('/docs', (req, res) => {
  const stage = process.env.STAGE || "dev";
  const bucketName = process.env.SWAGGER_BUCKET_NAME || "tms-swagger-api-dev";
  res.redirect(
    `https://${bucketName}-${stage}.s3.eu-west-1.amazonaws.com/${stage}/index.html`
  );
});

// Redirect /interfaces to static TypeScript interfaces
app.get('/interfaces', (req, res) => {
  const stage = process.env.STAGE || 'dev';
  const bucketName = process.env.SWAGGER_BUCKET_NAME || "tms-swagger-api-dev";
  res.redirect(`https://${bucketName}-${stage}.s3.eu-west-1.amazonaws.com/typescript-interfaces.ts`);
});

app.use("/auth", authRoutes);
app.use("/client", clientRoutes);
app.use("/job", jobRoutes);
app.use("/procedure", procedureRoutes);
app.use("/user", userRoutes);
app.use("/vehicle", vehicleRoutes);
app.use("/site", siteRoutes);
app.use("/area", areaRoutes);
app.use("/shaft", shaftRoutes);
app.use("/syndicate", syndicateRoutes);
app.use("/exception", exceptionRoutes);

// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });

exports.handler = serverless(app);
