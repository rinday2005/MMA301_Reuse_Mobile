import api from './api';

export interface MobileUploadFile {
  uri: string;
  name?: string;
  type?: string;
}

/**
 * Upload an image file to Cloudinary via backend /api/upload
 * Supports React Native file object { uri, name, type } or Blob/File
 */
export const uploadImageApi = async (file: MobileUploadFile | any): Promise<string> => {
  const formData = new FormData();

  if (file && file.uri) {
    const filename = file.name || file.uri.split('/').pop() || 'upload.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const mimeType = file.type || (match ? `image/${match[1]}` : 'image/jpeg');

    formData.append('file', {
      uri: file.uri,
      name: filename,
      type: mimeType,
    } as any);
  } else {
    formData.append('file', file);
    formData.append('image', file);
  }

  try {
    const res = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const payload = res.data;
    const url =
      payload?.url ||
      payload?.avatarUrl ||
      payload?.data?.url ||
      payload?.data?.secure_url ||
      payload?.data?.avatarUrl ||
      '';

    if (!url) {
      throw new Error('Không nhận được URL ảnh từ máy chủ Cloudinary');
    }

    return url;
  } catch (error) {
    console.error('Lỗi upload ảnh lên Cloudinary:', error);
    throw error;
  }
};

export default uploadImageApi;
