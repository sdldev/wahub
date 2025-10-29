import jwt from 'jsonwebtoken';
import crypto from 'crypto';
// Use environment variable or generate a random secret (for dev)
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export class JwtService {
    /**
     * Generate a JWT token
     */
    static sign(payload) {
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });
    }
    /**
     * Verify and decode a JWT token
     */
    static verify(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        }
        catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
    /**
     * Generate an API key
     */
    static generateApiKey() {
        return crypto.randomBytes(32).toString('hex');
    }
}
