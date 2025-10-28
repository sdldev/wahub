import api from './api';

export interface SendTextMessageRequest {
  session: string;
  to: string;
  text: string;
}

export interface SendImageMessageRequest {
  session: string;
  to: string;
  image: string;
  caption?: string;
}

export interface SendDocumentMessageRequest {
  session: string;
  to: string;
  document: string;
  filename?: string;
}

export interface Message {
  id: number;
  sessionId: string;
  from: string;
  to: string;
  content: string;
  type: 'text' | 'image' | 'document' | 'sticker';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  retryCount: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QueueStatus {
  session: string;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  isProcessing: boolean;
}

export const messageService = {
  // Send text message
  sendText: async (
    data: SendTextMessageRequest
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/message/send-text', data);
    return response.data;
  },

  // Send image message
  sendImage: async (
    data: SendImageMessageRequest
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/message/send-image', data);
    return response.data;
  },

  // Send document message
  sendDocument: async (
    data: SendDocumentMessageRequest
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/message/send-document', data);
    return response.data;
  },

  // Get queue status
  getQueueStatus: async (session: string): Promise<QueueStatus> => {
    const response = await api.get(`/message/queue-status?session=${session}`);
    return response.data;
  },

  // Clear queue
  clearQueue: async (session: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/message/clear-queue', { session });
    return response.data;
  },

  // Get message history (placeholder - would need backend endpoint)
  getMessageHistory: async (session?: string): Promise<Message[]> => {
    // TODO: Implement when backend endpoint is available
    const params = session ? `?session=${session}` : '';
    const response = await api.get(`/message/history${params}`);
    return response.data.data || [];
  },
};
