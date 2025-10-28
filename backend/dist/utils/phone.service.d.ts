/**
 * Phone number validation and normalization service
 */
export declare class PhoneService {
    /**
     * Normalize phone number to international format
     * Removes all non-digit characters and ensures it starts with country code
     */
    static normalize(phoneNumber: string): string;
    /**
     * Validate phone number format
     * Basic validation to ensure it's a valid phone number
     */
    static isValid(phoneNumber: string): boolean;
    /**
     * Extract phone number from WhatsApp session ID or JID format
     * WhatsApp uses format like: 6281234567890@s.whatsapp.net
     */
    static extractFromJid(jid: string): string | null;
    /**
     * Compare two phone numbers for equality (after normalization)
     */
    static areEqual(phone1: string, phone2: string): boolean;
    /**
     * Format phone number for display
     * Returns formatted number with + prefix
     */
    static format(phoneNumber: string): string;
}
//# sourceMappingURL=phone.service.d.ts.map