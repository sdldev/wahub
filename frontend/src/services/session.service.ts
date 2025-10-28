import api from './api';

export interface Session {
  sessionId: string;
  phoneNumber?: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionRequest {
  sessionId: string;
  phoneNumber?: string;
}

export interface QRCodeResponse {
  success: boolean;
  qr?: string;
  message?: string;
}

export const sessionService = {
  // Get all sessions
  getAllSessions: async (): Promise<Session[]> => {
    const response = await api.get('/session/list');
    return response.data.data;
  },

  // Create a new session
  createSession: async (data: CreateSessionRequest): Promise<QRCodeResponse> => {
    const response = await api.post('/session/start', {
      session: data.sessionId,
      phoneNumber: data.phoneNumber,
    });
    return response.data;
  },

  // Get QR code as image
  getQRCodeImage: async (sessionId: string): Promise<Blob> => {
    const response = await api.get(`/session/qr-image?session=${sessionId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get session status
  getSessionStatus: async (sessionId: string): Promise<Session> => {
    const response = await api.get(`/session/status?session=${sessionId}`);
    return response.data.data;
  },

  // Logout/disconnect a session
  logoutSession: async (sessionId: string): Promise<void> => {
    await api.post('/session/logout', { session: sessionId });
  },

  // Check if phone number has active session
  checkPhoneNumber: async (
    phoneNumber: string
  ): Promise<{ hasActiveSession: boolean; session?: Session }> => {
    const response = await api.post('/session/check-phone', { phoneNumber });
    return response.data;
  },

  // Cleanup inactive sessions
  cleanupSessions: async (
    hours: number = 24
  ): Promise<{ message: string; cleanedCount: number }> => {
    const response = await api.post(`/session/cleanup?hours=${hours}`);
    return response.data.data;
  },

  // Get current user session status
  getUserStatus: async (): Promise<{
    success: boolean;
    data: {
      connected: boolean;
      phoneNumber?: string;
      sessionId?: string;
      message: string;
    };
  }> => {
    const response = await api.get('/api/session/user-status');
    return response.data;
  },

  // Initialize user session (generate QR for current user)
  initializeUserSession: async (): Promise<{
    success: boolean;
    data: {
      qrCode?: string;
      sessionId: string;
      phoneNumber: string;
      message: string;
      expiresIn?: number;
      connected?: boolean;
    };
  }> => {
    const response = await api.post('/api/session/user-initialize');
    return response.data;
  },

  // Destroy user session (Admin only)
  destroyUserSession: async (data: {
    userId?: number;
    phoneNumber?: string;
    sessionId?: string;
  }): Promise<{
    success: boolean;
    data: {
      message: string;
      sessionId: string;
      phoneNumber: string;
    };
  }> => {
    const response = await api.post('/api/session/destroy-user-session', data);
    return response.data;
  },

  // Get all users with session info (Admin only)
  getAllUsersWithSessions: async (): Promise<{
    success: boolean;
    data: Array<{
      userId: number;
      sessionId: string;
      phoneNumber: string;
      status: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
  }> => {
    const response = await api.get('/api/session/admin/users');
    return response.data;
  },
};
