import bcrypt from 'bcryptjs';
const SALT_ROUNDS = 10;
export class PasswordService {
    /**
     * Hash a password using bcrypt
     */
    static async hash(password) {
        return bcrypt.hash(password, SALT_ROUNDS);
    }
    /**
     * Compare a plain text password with a hashed password
     */
    static async compare(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }
    /**
     * Validate password strength
     */
    static validate(password) {
        const errors = [];
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
}
