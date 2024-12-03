import express from "express";
const serverless = require("serverless-http");

import userRoutes from "./server/api/user";
import jobRoutes from "./server/api/jobs";
import vehicleRoutes from "./server/api/vehicles";

const app = express();
app.use(express.json());

app.use("/user", userRoutes);
app.use("/jobs", jobRoutes);
app.use("/vehicles", vehicleRoutes);

// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });

exports.handler = serverless(app);
