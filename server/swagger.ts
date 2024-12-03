import swaggerJsdoc from "swagger-jsdoc";
import { components } from "./swagger/component";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TMS API Documentation",
      version: "1.0.0",
      description: "API documentation for the Transport Management System",
    },
    components: components,
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Include all API route files
  apis: ["./server/api/*.ts", "./server/api/**/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
