import { type User, type NewUser } from '../schema/users';
export declare class UserService {
    /**
     * Create a new user
     */
    static createUser(email: string, password: string, role?: 'admin' | 'user' | 'readonly'): Promise<User>;
    /**
     * Find user by email
     */
    static findByEmail(email: string): Promise<User | null>;
    /**
     * Find user by ID
     */
    static findById(id: number): Promise<User | null>;
    /**
     * Find user by API key
     */
    static findByApiKey(apiKey: string): Promise<User | null>;
    /**
     * Verify user credentials
     */
    static verifyCredentials(email: string, password: string): Promise<User | null>;
    /**
     * Update user
     */
    static updateUser(id: number, data: Partial<Omit<NewUser, 'id'>>): Promise<User>;
    /**
     * Delete user
     */
    static deleteUser(id: number): Promise<void>;
    /**
     * Regenerate API key for user
     */
    static regenerateApiKey(id: number): Promise<string>;
    /**
     * List all users (admin only)
     */
    static listUsers(): Promise<User[]>;
}
//# sourceMappingURL=user.service.d.ts.map