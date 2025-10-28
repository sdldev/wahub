import { logger } from './logger';

export class WhatsAppValidationService {
  /**
   * Validate phone number format for WhatsApp
   * @param phone Phone number to validate
   */
  static validatePhoneNumber(phone: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!phone) {
      errors.push('Phone number is required');
      return { valid: false, errors };
    }

    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');

    // Check if phone number is empty after cleaning
    if (!cleanPhone) {
      errors.push('Phone number must contain digits');
      return { valid: false, errors };
    }

    // Check length (minimum 8, maximum 15 digits according to international standards)
    if (cleanPhone.length < 8) {
      errors.push('Phone number is too short (minimum 8 digits)');
    }

    if (cleanPhone.length > 15) {
      errors.push('Phone number is too long (maximum 15 digits)');
    }

    // Check if starts with valid country code patterns
    // Indonesia: 62, Malaysia: 60, Singapore: 65, etc.
    const validCountryCodePatterns = [
      /^62\d{8,13}$/, // Indonesia (62 + 8-13 digits)
      /^60\d{8,10}$/,  // Malaysia (60 + 8-10 digits)
      /^65\d{8}$/,     // Singapore (65 + 8 digits)
      /^66\d{8,9}$/,   // Thailand (66 + 8-9 digits)
      /^1\d{10}$/,     // US/Canada (1 + 10 digits)
      /^44\d{10}$/,    // UK (44 + 10 digits)
      /^91\d{10}$/,    // India (91 + 10 digits)
    ];

    const hasValidCountryCode = validCountryCodePatterns.some(pattern => 
      pattern.test(cleanPhone)
    );

    if (!hasValidCountryCode) {
      errors.push('Phone number must include a valid country code (e.g., 62 for Indonesia)');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Format phone number for WhatsApp (ensure it starts with country code)
   * @param phone Phone number to format
   */
  static formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // If starts with 0, assume Indonesian number and replace with 62
    if (cleanPhone.startsWith('0')) {
      return '62' + cleanPhone.substring(1);
    }
    
    // If doesn't start with country code, assume Indonesian
    if (!cleanPhone.startsWith('62') && cleanPhone.length >= 8 && cleanPhone.length <= 13) {
      return '62' + cleanPhone;
    }
    
    return cleanPhone;
  }

  /**
   * Check if phone number is potentially active (basic format validation)
   * In a real implementation, this would check with WhatsApp Business API
   * @param phone Phone number to check
   */
  static async isPhoneNumberActive(phone: string): Promise<{ active: boolean; message: string }> {
    try {
      const validation = this.validatePhoneNumber(phone);
      
      if (!validation.valid) {
        return {
          active: false,
          message: validation.errors.join(', ')
        };
      }

      // TODO: Implement actual WhatsApp number verification
      // For now, we'll just validate the format
      const formattedPhone = this.formatPhoneNumber(phone);
      
      // Basic Indonesian mobile number patterns
      const indonesianMobilePatterns = [
        /^62(8[1-9])\d{6,9}$/,  // Telkomsel, XL, Indosat, etc.
        /^628(1[0-9]|2[0-9]|3[0-9]|5[0-9]|7[0-9]|9[0-9])\d{6,8}$/
      ];

      const isIndonesianMobile = indonesianMobilePatterns.some(pattern => 
        pattern.test(formattedPhone)
      );

      if (formattedPhone.startsWith('62') && !isIndonesianMobile) {
        return {
          active: false,
          message: 'Indonesian phone number format is not recognized as mobile number'
        };
      }

      return {
        active: true,
        message: 'Phone number format is valid'
      };
    } catch (error: any) {
      logger.error('Phone validation error', { phone, error: error.message });
      return {
        active: false,
        message: 'Error validating phone number'
      };
    }
  }
}