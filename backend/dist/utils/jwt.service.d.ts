export interface JwtPayload {
    userId: number;
    email: string;
    role: 'admin' | 'user' | 'readonly';
}
export declare class JwtService {
    /**
     * Generate a JWT token
     */
    static sign(payload: JwtPayload): string;
    /**
     * Verify and decode a JWT token
     */
    static verify(token: string): JwtPayload;
    /**
     * Generate an API key
     */
    static generateApiKey(): string;
}
//# sourceMappingURL=jwt.service.d.ts.map