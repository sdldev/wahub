import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Use environment variable or generate a random secret (for dev)
const JWT_SECRET =
  process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  userId: number;
  email: string;
  role: 'admin' | 'user' | 'readonly';
}

export class JwtService {
  /**
   * Generate a JWT token
   */
  static sign(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  /**
   * Verify and decode a JWT token
   */
  static verify(token: string): JwtPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate an API key
   */
  static generateApiKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
