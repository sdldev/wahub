import { eq } from 'drizzle-orm';
import { db } from '../index';
import { users, type User, type NewUser } from '../schema/users';
import { PasswordService } from '../../utils/password.service';
import { JwtService } from '../../utils/jwt.service';
import { WhatsAppValidationService } from '../../utils/whatsapp-validation.service';
import { dbLogger } from '../../utils/logger';

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(
    email: string,
    password: string,
    role: 'admin' | 'user' | 'readonly' = 'user',
    phone?: string,
    status: 'Active' | 'Pending' | 'Disable' = 'Pending',
    note?: string
  ): Promise<User> {
    try {
      // Validate password
      const validation = PasswordService.validate(password);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Validate phone number if provided
      let formattedPhone: string | undefined;
      if (phone) {
        const phoneValidation = WhatsAppValidationService.validatePhoneNumber(phone);
        if (!phoneValidation.valid) {
          throw new Error(`Phone validation failed: ${phoneValidation.errors.join(', ')}`);
        }
        
        // Check if phone is potentially active (disabled for testing)
        // const phoneActiveCheck = await WhatsAppValidationService.isPhoneNumberActive(phone);
        // if (!phoneActiveCheck.active) {
        //   throw new Error(`Phone number validation failed: ${phoneActiveCheck.message}`);
        // }
        
        formattedPhone = WhatsAppValidationService.formatPhoneNumber(phone);
        
        // Check if phone already exists
        const existingPhoneUser = await this.findByPhone(formattedPhone);
        if (existingPhoneUser) {
          throw new Error('Phone number already registered');
        }
      }

      // Hash password
      const hashedPassword = await PasswordService.hash(password);

      // Generate API key
      const apiKey = JwtService.generateApiKey();

      // Insert user
      dbLogger.info('Attempting to insert user', { email, formattedPhone, role, status, note });
      const result = await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          phone: formattedPhone,
          role,
          status,
          note,
          apiKey,
        });

      dbLogger.info('Insert result', { result, insertId: result?.[0]?.insertId });
      if (!result || !result[0] || !result[0].insertId) {
        throw new Error('Failed to create user - no insertId returned');
      }

      // Get the created user
      const user = await this.findById(Number(result[0].insertId));
      if (!user) {
        throw new Error('User created but could not retrieve');
      }

      dbLogger.info(`User created: ${email}`, { userId: user.id, phone: formattedPhone, status });
      return user;
    } catch (error: any) {
      dbLogger.error('Failed to create user', {
        component: 'database',
        email,
        phone,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      return user || null;
    } catch (error: any) {
      dbLogger.error('Failed to find user by email', {
        email,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Find user by phone number
   */
  static async findByPhone(phone: string): Promise<User | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);
      return user || null;
    } catch (error: any) {
      dbLogger.error('Failed to find user by phone', {
        phone,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id: number): Promise<User | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      return user || null;
    } catch (error: any) {
      dbLogger.error('Failed to find user by ID', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Find user by API key
   */
  static async findByApiKey(apiKey: string): Promise<User | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.apiKey, apiKey))
        .limit(1);
      return user || null;
    } catch (error: any) {
      dbLogger.error('Failed to find user by API key', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Verify user credentials
   */
  static async verifyCredentials(
    email: string,
    password: string
  ): Promise<User | null> {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        return null;
      }

      const isValid = await PasswordService.compare(password, user.password);
      if (!isValid) {
        return null;
      }

      return user;
    } catch (error: any) {
      dbLogger.error('Failed to verify credentials', {
        email,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update user
   */
  static async updateUser(
    id: number,
    data: Partial<Omit<NewUser, 'id'>>
  ): Promise<User> {
    try {
      // If updating password, hash it
      if (data.password) {
        const validation = PasswordService.validate(data.password);
        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }
        data.password = await PasswordService.hash(data.password);
      }

      // If updating phone, validate it
      if (data.phone) {
        const phoneValidation = WhatsAppValidationService.validatePhoneNumber(data.phone);
        if (!phoneValidation.valid) {
          throw new Error(`Phone validation failed: ${phoneValidation.errors.join(', ')}`);
        }
        
        // Phone active check disabled for testing
        // const phoneActiveCheck = await WhatsAppValidationService.isPhoneNumberActive(data.phone);
        // if (!phoneActiveCheck.active) {
        //   throw new Error(`Phone number validation failed: ${phoneActiveCheck.message}`);
        // }
        
        data.phone = WhatsAppValidationService.formatPhoneNumber(data.phone);
        
        // Check if phone already exists (excluding current user)
        const existingPhoneUser = await this.findByPhone(data.phone);
        if (existingPhoneUser && existingPhoneUser.id !== id) {
          throw new Error('Phone number already registered');
        }
      }

      const result = await db
        .update(users)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));

      if (!result || result.affectedRows === 0) {
        throw new Error('User not found');  
      }

      // Get the updated user
      const user = await this.findById(id);
      if (!user) {
        throw new Error('User updated but could not retrieve');
      }

      dbLogger.info(`User updated: ${id}`, { 
        updatedFields: Object.keys(data),
        phone: data.phone,
        status: data.status
      });
      return user;
    } catch (error: any) {
      dbLogger.error('Failed to update user', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(id: number): Promise<{ success: boolean }> {
    dbLogger.info(`Deleting user: ${id}`);
    
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const result = await db.delete(users).where(eq(users.id, id));
    
    if (!result || result.affectedRows === 0) {
      throw new Error('Failed to delete user');
    }
    
    dbLogger.info(`User deleted: ${id}`);
    return { success: true };
  }

  /**
   * Regenerate API key for user
   */
  static async regenerateApiKey(id: number): Promise<string> {
    try {
      const newApiKey = JwtService.generateApiKey();
      await db
        .update(users)
        .set({
          apiKey: newApiKey,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(users.id, id));

      dbLogger.info(`API key regenerated for user: ${id}`);
      return newApiKey;
    } catch (error: any) {
      dbLogger.error('Failed to regenerate API key', {
        id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * List all users (admin only)
   */
  static async listUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error: any) {
      dbLogger.error('Failed to list users', { error: error.message });
      throw error;
    }
  }
}
