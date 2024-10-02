// src/@types/express.d.ts

import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      ip?: string; // Add any other properties you want to include
    }
  }
}
