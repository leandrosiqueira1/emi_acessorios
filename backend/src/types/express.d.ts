//backend/src/types/express.d.ts
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
  };
}
