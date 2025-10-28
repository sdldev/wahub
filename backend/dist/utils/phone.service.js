import { logger } from './logger';
/**
 * Phone number validation and normalization service
 */
export class PhoneService {
    /**
     * Normalize phone number to international format
     * Removes all non-digit characters and ensures it starts with country code
     */
    static normalize(phoneNumber) {
        // Remove all non-digit characters
        const normalized = phoneNumber.replace(/\D/g, '');
        // If number doesn't start with country code, we'll keep it as is
        // Different countries have different formats, so we normalize consistently
        return normalized;
    }
    /**
     * Validate phone number format
     * Basic validation to ensure it's a valid phone number
     */
    static isValid(phoneNumber) {
        if (!phoneNumber)
            return false;
        const normalized = this.normalize(phoneNumber);
        // Basic validation: should have at least 10 digits and max 15 digits (E.164 format)
        if (normalized.length < 10 || normalized.length > 15) {
            return false;
        }
        return true;
    }
    /**
     * Extract phone number from WhatsApp session ID or JID format
     * WhatsApp uses format like: 6281234567890@s.whatsapp.net
     */
    static extractFromJid(jid) {
        try {
            if (!jid)
                return null;
            // Remove @s.whatsapp.net or @c.us suffix
            const cleaned = jid.split('@')[0];
            if (!cleaned)
                return null;
            // Validate the extracted number
            if (this.isValid(cleaned)) {
                return this.normalize(cleaned);
            }
            return null;
        }
        catch (error) {
            logger.error('Failed to extract phone number from JID', { jid, error });
            return null;
        }
    }
    /**
     * Compare two phone numbers for equality (after normalization)
     */
    static areEqual(phone1, phone2) {
        if (!phone1 || !phone2)
            return false;
        const normalized1 = this.normalize(phone1);
        const normalized2 = this.normalize(phone2);
        return normalized1 === normalized2;
    }
    /**
     * Format phone number for display
     * Returns formatted number with + prefix
     */
    static format(phoneNumber) {
        const normalized = this.normalize(phoneNumber);
        return `+${normalized}`;
    }
}
