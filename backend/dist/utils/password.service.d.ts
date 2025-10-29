export declare class PasswordService {
    /**
     * Hash a password using bcrypt
     */
    static hash(password: string): Promise<string>;
    /**
     * Compare a plain text password with a hashed password
     */
    static compare(password: string, hashedPassword: string): Promise<boolean>;
    /**
     * Validate password strength
     */
    static validate(password: string): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=password.service.d.ts.map