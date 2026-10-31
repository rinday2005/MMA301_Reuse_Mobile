import api from './api';
import { MobileUploadFile } from './upload.api';

export interface UserProfileResponse {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
}

export const uploadAvatarApi = async (file: MobileUploadFile | any): Promise<string> => {
  const formData = new FormData();

  if (file && file.uri) {
    const filename = file.name || file.uri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const mimeType = file.type || (match ? `image/${match[1]}` : 'image/jpeg');

    const filePayload = {
      uri: file.uri,
      name: filename,
      type: mimeType,
    } as any;

    formData.append('avatar', filePayload);
    formData.append('file', filePayload);
    formData.append('image', filePayload);
  } else {
    formData.append('avatar', file);
    formData.append('file', file);
    formData.append('image', file);
  }

  try {
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return (
      response.data?.data?.avatarUrl ||
      response.data?.data?.url ||
      response.data?.avatarUrl ||
      response.data?.url ||
      response.data?.data?.secure_url ||
      response.data?.secure_url ||
      ''
    );
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number } };
    if (axiosErr.response?.status === 404) {
      const altResponse = await api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return (
        altResponse.data?.data?.avatarUrl ||
        altResponse.data?.data?.url ||
        altResponse.data?.avatarUrl ||
        altResponse.data?.url ||
        altResponse.data?.data?.secure_url ||
        altResponse.data?.secure_url ||
        ''
      );
    }
    throw err;
  }
};

export const updateProfileApi = async (data: Record<string, unknown>) => {
  const response = await api.put('/users/profile', data);
  return response.data?.data || response.data;
};

export default {
  uploadAvatarApi,
  updateProfileApi,
};
