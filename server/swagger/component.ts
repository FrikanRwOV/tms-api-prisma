export const components = {
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
  schemas: {
    User: {
      type: "object",
      properties: {
        id: { type: "string" },
        email: { type: "string" },
        name: { type: "string" },
        role: {
          type: "string",
          enum: [
            "ADMINISTRATOR",
            "TRANSPORT_MANAGER",
            "DRIVER",
            "REQUESTER",
            "WORKSHOP_MANAGER",
          ],
        },
        permissions: {
          type: "array",
          items: {
            type: "string",
          },
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    Vehicle: {
      type: "object",
      properties: {
        id: { type: "string" },
        registrationNumber: { type: "string" },
        typeId: { type: "string" },
        status: {
          type: "string",
          enum: [
            "AVAILABLE",
            "IN_TRANSIT",
            "UNDER_MAINTENANCE",
            "OUT_OF_SERVICE",
          ],
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    // Add other schemas as needed
  },
};
