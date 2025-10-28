import CryptoJS from 'crypto-js';
// Use environment variable or generate a random secret (for dev)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
export class EncryptionService {
    /**
     * Encrypt sensitive data
     */
    static encrypt(text) {
        return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    }
    /**
     * Decrypt sensitive data
     */
    static decrypt(encryptedText) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
            return bytes.toString(CryptoJS.enc.Utf8);
        }
        catch (error) {
            throw new Error('Failed to decrypt data');
        }
    }
}
