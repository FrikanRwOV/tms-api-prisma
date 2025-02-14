import { schemas } from './schemas';

export const components = {
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
  schemas: {
    ...schemas,
    Date: {
      type: "string",
      format: "date-time",
    },
    JsonValue: {
      type: "object",
      additionalProperties: true,
    },
  },
};
