import api from './api';

export interface MobileUploadFile {
  uri: string;
  name?: string;
  type?: string;
}

/**
 * Upload an image file to Cloudinary via backend /api/upload
 * Supports React Native file object { uri, name, type }, string URI, or Blob/File
 */
export const uploadImageApi = async (
  file: MobileUploadFile | string | any,
  folder: string = 'reuse_hub'
): Promise<string> => {
  // 1. Nếu đã là URL Cloudinary hoặc https hợp lệ, không cần upload lại
  if (typeof file === 'string') {
    const trimmed = file.trim();
    if (trimmed.startsWith('https://res.cloudinary.com')) {
      return trimmed;
    }
  }

  const formData = new FormData();
  formData.append('folder', folder);

  let fileObj: any = null;

  if (typeof file === 'string') {
    const cleanUri = file;
    const rawName = cleanUri.split('/').pop()?.split('?')[0] || `upload_${Date.now()}.jpg`;
    const cleanName = rawName.includes('.') ? rawName : `${rawName}.jpg`;

    // Suy luận MIME type an toàn
    const ext = cleanName.split('.').pop()?.toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === 'png') mimeType = 'image/png';
    else if (ext === 'webp') mimeType = 'image/webp';
    else if (ext === 'gif') mimeType = 'image/gif';
    else if (ext === 'heic' || ext === 'heif') mimeType = 'image/heic';

    fileObj = {
      uri: cleanUri,
      name: cleanName,
      type: mimeType,
    };
  } else if (file && typeof file === 'object') {
    if (file.uri) {
      const rawName = file.name || file.uri.split('/').pop()?.split('?')[0] || `upload_${Date.now()}.jpg`;
      const cleanName = rawName.includes('.') ? rawName : `${rawName}.jpg`;
      fileObj = {
        uri: file.uri,
        name: cleanName,
        type: file.type || 'image/jpeg',
      };
    } else {
      fileObj = file;
    }
  }

  if (fileObj) {
    // Đính kèm vào cả 2 key 'file' và 'image' để backend Multer luôn bắt được
    formData.append('file', fileObj as any);
    formData.append('image', fileObj as any);
  } else {
    throw new Error('Dữ liệu ảnh không hợp lệ.');
  }

  try {
    const res = await api.post('/upload', formData, {
      headers: {
        Accept: 'application/json',
      },
      transformRequest: (data) => data, // Giữ nguyên FormData boundary của React Native
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
  } catch (error: any) {
    console.error('Lỗi upload ảnh lên Cloudinary:', error?.response?.data || error?.message || error);
    throw error;
  }
};

export default uploadImageApi;
