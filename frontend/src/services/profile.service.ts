import api from './api';

export interface WhatsAppProfile {
  name?: string;
  about?: string;
  profilePicUrl?: string;
  phoneNumber?: string;
}

export interface GetProfileRequest {
  session: string;
  target: string; // Must include '@s.whatsapp.net' or '@g.us'
}

export const profileService = {
  // Get WhatsApp contact profile information
  getProfile: async (data: GetProfileRequest): Promise<WhatsAppProfile> => {
    const response = await api.post('/profile', data);
    return response.data.data;
  },
};
