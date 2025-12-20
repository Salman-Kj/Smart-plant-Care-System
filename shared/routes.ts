import { z } from 'zod';
import { insertUserSchema, insertPlantSchema, insertGardenerSchema, insertOrderSchema, users, plants, gardeners, orders, diseaseLogs } from './schema';

// Shared error schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  serverError: z.object({
    message: z.string(),
  }),
};

// Simulated AI Input
export const detectDiseaseInput = z.object({
  imageUrl: z.string(),
  imageName: z.string().optional(), // Used for the rule-based simulation
});

export const diseaseResponse = z.object({
  name: z.string(),
  cause: z.string(),
  solution: z.string(),
  medicine: z.string(),
});

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.object({ message: z.string() }),
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    }
  },
  plants: {
    list: {
      method: 'GET' as const,
      path: '/api/plants',
      responses: {
        200: z.array(z.custom<typeof plants.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/plants',
      input: insertPlantSchema,
      responses: {
        201: z.custom<typeof plants.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/plants/:id',
      responses: {
        200: z.custom<typeof plants.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  },
  gardeners: {
    list: {
      method: 'GET' as const,
      path: '/api/gardeners',
      responses: {
        200: z.array(z.custom<typeof gardeners.$inferSelect>()),
      }
    },
    hire: { // Simple "hire" request
      method: 'POST' as const,
      path: '/api/gardeners/:id/hire',
      input: z.object({ date: z.string(), hours: z.number() }),
      responses: {
        200: z.object({ message: z.string(), bookingId: z.number().optional() }),
      }
    }
  },
  disease: {
    detect: {
      method: 'POST' as const,
      path: '/api/disease/detect',
      input: detectDiseaseInput,
      responses: {
        200: diseaseResponse,
      }
    },
    history: {
      method: 'GET' as const,
      path: '/api/disease/history',
      responses: {
        200: z.array(z.custom<typeof diseaseLogs.$inferSelect>()),
      }
    }
  },
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders',
      input: insertOrderSchema,
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
      }
    },
    list: {
      method: 'GET' as const,
      path: '/api/orders',
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect>()),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
