import express from "express";
const serverless = require("serverless-http");

import userRoutes from "./server/api/user";
import jobRoutes from "./server/api/jobs";
import vehicleRoutes from "./server/api/vehicles";

const app = express();
app.use(express.json());

// Redirect /docs to static Swagger documentation
app.get('/docs', (req, res) => {
  const stage = process.env.STAGE || "dev";
  const bucketName = process.env.SWAGGER_BUCKET_NAME || "tms-api-swagger-docs";
  res.redirect(
    `https://${bucketName}-${stage}.s3.eu-west-1.amazonaws.com/${stage}/index.html`
  );
});


app.use("/user", userRoutes);
app.use("/jobs", jobRoutes);
app.use("/vehicles", vehicleRoutes);

// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });

exports.handler = serverless(app);
