import { z } from 'zod';
import { insertUserSchema, insertPlantSchema, insertGardenerSchema, insertOrderSchema, insertMessageSchema, users, plants, gardeners, orders, diseaseLogs, bookings, messages } from './schema';

export type { InsertUser, InsertPlant, Order } from './schema';

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
      input: z.object({ username: z.string(), password: z.string(), role: z.enum(["user", "gardener", "admin"]) }),
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
      input: z.object({
        dateTime: z.string().optional(),
        date: z.string().optional(),
        hours: z.number(),
        userId: z.number().optional(),
        userName: z.string().optional(),
        userEmail: z.string().optional(),
        userPhone: z.string().optional(),
        userAddress: z.string().optional(),
        bookingTime: z.string().optional(),
        message: z.string().optional(),
      }),
      responses: {
        200: z.object({ message: z.string(), bookingId: z.number().optional() }),
      }
    }
  },
  bookings: {
    list: {
      method: 'GET' as const,
      path: '/api/bookings',
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect & { gardenerName?: string }>()),
      }
    },
    pay: {
      method: 'POST' as const,
      path: '/api/bookings/:id/pay',
      input: z.object({ paymentMethod: z.enum(['card', 'wallet', 'cod']).optional() }),
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
        400: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      }
    },
    remove: {
      method: 'DELETE' as const,
      path: '/api/bookings/:id',
      responses: {
        200: z.object({ message: z.string() }),
      }
    }
  },
  profile: {
    get: {
      method: "GET" as const,
      path: "/api/profile",
      responses: {
        200: z.object({
          fullName: z.string().nullable().optional(),
          email: z.string().nullable().optional(),
          phone: z.string().nullable().optional(),
          address: z.string().nullable().optional(),
          profileImage: z.string().nullable().optional(),
        }),
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/profile",
      input: z.object({
        fullName: z.string().min(1).max(120).optional(),
        phone: z.string().max(40).optional().nullable(),
        address: z.string().max(300).optional().nullable(),
        profileImage: z.string().optional().nullable(),
      }),
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    changePassword: {
      method: "PUT" as const,
      path: "/api/profile/password",
      input: z.object({
        oldPassword: z.string().min(1),
        newPassword: z.string().min(6),
      }),
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
  },
  gardenerBookings: {
    list: {
      method: 'GET' as const,
      path: '/api/gardener/bookings',
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect & { userName?: string }>()),
      }
    },
    accept: {
      method: 'POST' as const,
      path: '/api/gardener/booking/:id/accept',
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
      }
    },
    reject: {
      method: 'POST' as const,
      path: '/api/gardener/booking/:id/reject',
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
      }
    },
    complete: {
      method: 'POST' as const,
      path: '/api/gardener/booking/:id/complete',
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
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
  },
  cart: {
    list: {
      method: 'GET' as const,
      path: '/api/cart',
      responses: {
        200: z.array(z.any()), // Simplified for combined cartItem + plant
      }
    },
    add: {
      method: 'POST' as const,
      path: '/api/cart',
      input: z.object({ plantId: z.number(), quantity: z.number().optional() }),
      responses: {
        201: z.any(),
      }
    },
    addStore: {
      method: 'POST' as const,
      path: '/api/cart/store-item',
      input: z.object({
        name: z.string(),
        price: z.number(),
        imageUrl: z.string(),
        category: z.string(),
        description: z.string().optional(),
      }),
      responses: {
        201: z.any(),
      }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/cart/:plantId',
      input: z.object({ quantity: z.number() }),
      responses: {
        200: z.any(),
      }
    },
    remove: {
      method: 'DELETE' as const,
      path: '/api/cart/:plantId',
      responses: {
        200: z.object({ message: z.string() }),
      }
    }
  },
  messages: {
    create: {
      method: 'POST' as const,
      path: '/api/messages',
      input: insertMessageSchema,
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    getForBooking: {
      method: 'GET' as const,
      path: '/api/messages/booking/:bookingId',
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect & { senderName: string; receiverName: string }>()),
      }
    },
    getForUser: {
      method: 'GET' as const,
      path: '/api/messages',
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect & { senderName: string; receiverName: string; bookingId: number }>()),
      }
    },
    markRead: {
      method: 'PUT' as const,
      path: '/api/messages/:id/read',
      responses: {
        200: z.custom<typeof messages.$inferSelect>(),
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
