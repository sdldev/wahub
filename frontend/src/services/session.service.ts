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
};
