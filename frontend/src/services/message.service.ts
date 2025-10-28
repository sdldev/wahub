import api from './api';

export interface SendTextMessageRequest {
  session: string;
  to: string;
  text: string;
}

export interface SendImageMessageRequest {
  session: string;
  to: string;
  text: string;
  image_url: string;
  is_group?: boolean;
}

export interface SendDocumentMessageRequest {
  session: string;
  to: string;
  text: string;
  document_url: string;
  document_name: string;
  is_group?: boolean;
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

  // Send sticker
  sendSticker: async (data: {
    session: string;
    to: string;
    image_url: string;
    is_group?: boolean;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/message/send-sticker', data);
    return response.data;
  },

  // Get queue status
  getQueueStatus: async (session: string): Promise<QueueStatus> => {
    const response = await api.get(`/message/queue-status?session=${session}`);
    return response.data;
  },
};
