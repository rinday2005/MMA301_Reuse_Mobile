import { Image } from 'react-native';
import { getServerHost } from '../services/api';
import { uploadImageApi } from '../services/upload.api';

const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80';

/**
 * Bản đồ 58 ảnh tĩnh có sẵn trong bundle của ứng dụng (assets/images).
 * Giúp hiển thị ảnh tức thì (0ms) trên cả iPhone, Android thật và Android Studio Emulator
 * mà không bị phụ thuộc tốc độ mạng hoặc lỗi 304 Not Modified.
 */
const LOCAL_ASSET_IMAGES: Record<string, any> = {
  'accessory1.jpg': require('../../assets/images/accessory1.jpg'),
  'accessory2.jpg': require('../../assets/images/accessory2.jpg'),
  'accessory3.jpg': require('../../assets/images/accessory3.jpg'),
  'accessory4.jpg': require('../../assets/images/accessory4.jpg'),
  'accessory5.jpg': require('../../assets/images/accessory5.jpg'),
  'accessory6.jpg': require('../../assets/images/accessory6.jpg'),
  'accessory7.jpg': require('../../assets/images/accessory7.jpg'),
  'accessory8.jpg': require('../../assets/images/accessory8.jpg'),
  'accessorycategory.jpg': require('../../assets/images/accessorycategory.jpg'),
  'accessoryhome.jpg': require('../../assets/images/accessoryhome.jpg'),
  'camera1.jpg': require('../../assets/images/camera1.jpg'),
  'camera2.jpg': require('../../assets/images/camera2.jpg'),
  'camera3.jpg': require('../../assets/images/camera3.jpg'),
  'camera4.jpg': require('../../assets/images/camera4.jpg'),
  'camera5.jpg': require('../../assets/images/camera5.jpg'),
  'camera6.jpg': require('../../assets/images/camera6.jpg'),
  'camera7.jpg': require('../../assets/images/camera7.jpg'),
  'cameracategory.jpg': require('../../assets/images/cameracategory.jpg'),
  'camerahome.jpg': require('../../assets/images/camerahome.jpg'),
  'canonr6.jpg': require('../../assets/images/canonr6.jpg'),
  'canonrf.jpg': require('../../assets/images/CanonRF.jpg'),
  'CanonRF.jpg': require('../../assets/images/CanonRF.jpg'),
  'clothes1.jpg': require('../../assets/images/clothes1.jpg'),
  'clothes2.jpg': require('../../assets/images/clothes2.jpg'),
  'clothes3.jpg': require('../../assets/images/clothes3.jpg'),
  'clothes4.jpg': require('../../assets/images/clothes4.jpg'),
  'clothescategory.jpg': require('../../assets/images/clothescategory.jpg'),
  'clotheshome.jpg': require('../../assets/images/clotheshome.jpg'),
  'dashboard.jpg': require('../../assets/images/dashboard.jpg'),
  'djirs3.jpg': require('../../assets/images/DJIRS3.jpg'),
  'DJIRS3.jpg': require('../../assets/images/DJIRS3.jpg'),
  'dresscategory.jpg': require('../../assets/images/dresscategory.jpg'),
  'eoscamerahome.jpg': require('../../assets/images/eoscamerahome.jpg'),
  'fujifilmhome.jpg': require('../../assets/images/fujifilmhome.jpg'),
  'fujifilmtx5.jpg': require('../../assets/images/fujifilmtx5.jpg'),
  'hairaccessory.jpg': require('../../assets/images/hairaccessory.jpg'),
  'jimmychooaveline.jpg': require('../../assets/images/JimmyChooAveline.jpg'),
  'JimmyChooAveline.jpg': require('../../assets/images/JimmyChooAveline.jpg'),
  'login.jpg': require('../../assets/images/login.jpg'),
  'logo.jpg': require('../../assets/images/logo.jpg'),
  'partydress1.jpg': require('../../assets/images/partydress1.jpg'),
  'partydress2.jpg': require('../../assets/images/partydress2.jpg'),
  'partydress3.jpg': require('../../assets/images/partydress3.jpg'),
  'partydress4.jpg': require('../../assets/images/partydress4.jpg'),
  'partydress5.jpg': require('../../assets/images/partydress5.jpg'),
  'partydress7.jpg': require('../../assets/images/partydress7.jpg'),
  'partydresshome.jpg': require('../../assets/images/partydresshome.jpg'),
  'register.jpg': require('../../assets/images/register.jpg'),
  'setclothhome.jpg': require('../../assets/images/setclothhome.jpg'),
  'shoes1.jpg': require('../../assets/images/shoes1.jpg'),
  'shoes2.jpg': require('../../assets/images/shoes2.jpg'),
  'shoes3.jpg': require('../../assets/images/shoes3.jpg'),
  'shoes4.jpg': require('../../assets/images/shoes4.jpg'),
  'shoescategory.jpg': require('../../assets/images/shoescategory.jpg'),
  'shoeshome.jpg': require('../../assets/images/shoeshome.jpg'),
  'shoesrent.jpg': require('../../assets/images/shoesrent.jpg'),
  'silkdresshome.jpg': require('../../assets/images/silkdresshome.jpg'),
  'sneaker1.jpg': require('../../assets/images/sneaker1.jpg'),
  'sneakerhome.jpg': require('../../assets/images/sneakerhome.jpg'),
  'sonyfe.jpg': require('../../assets/images/sonyfe.jpg'),
  'sonyhome.jpg': require('../../assets/images/sonyhome.jpg'),
};

const resolvedUriCache: Record<string, string> = {};

function resolveLocalAssetUri(filename: string): string | null {
  if (!filename) return null;
  const cleanName = filename.split('?')[0].split('#')[0].trim();
  if (resolvedUriCache[cleanName]) {
    return resolvedUriCache[cleanName];
  }
  const assetModule = LOCAL_ASSET_IMAGES[cleanName] || LOCAL_ASSET_IMAGES[cleanName.toLowerCase()];
  if (!assetModule) return null;
  try {
    const resolved = Image.resolveAssetSource(assetModule);
    if (resolved && resolved.uri) {
      resolvedUriCache[cleanName] = resolved.uri;
      return resolved.uri;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Trả về require(...) bundle tĩnh nếu ảnh có trong assets (hiển thị tức thì 0ms, không phụ thuộc mạng),
 * hoặc { uri: url } nếu là ảnh Cloudinary/HTTPS từ xa.
 */
export function getImageSource(url?: string): any {
  if (!url || typeof url !== 'string') {
    return { uri: DEFAULT_FALLBACK_IMAGE };
  }
  const cleanFilename = url.trim().split(/[/|\\]/).pop()?.split('?')[0].split('#')[0].trim() || '';
  const localModule = LOCAL_ASSET_IMAGES[cleanFilename] || LOCAL_ASSET_IMAGES[cleanFilename.toLowerCase()];
  if (localModule) {
    return localModule;
  }
  return { uri: normalizeImageUrl(url) };
}

/**
 * Upload helper alias to Cloudinary via backend
 */
export const uploadImageToCloudinary = uploadImageApi;

/**
 * Normalizes image URLs for React Native Mobile App.
 * 1. Nếu tên file nằm trong bộ ảnh local (assets/images) -> trả về URI bundle nội bộ (hiển thị tức thì 0ms).
 * 2. Cloudinary / HTTPS URLs -> giữ nguyên.
 * 3. Relative URLs khác -> trỏ về serverHost.
 */
export function normalizeImageUrl(url?: string): string {
  if (!url || typeof url !== 'string') return DEFAULT_FALLBACK_IMAGE;
  let trimmed = url.trim();
  if (!trimmed) return DEFAULT_FALLBACK_IMAGE;

  // Upgrade HTTP Cloudinary to HTTPS to avoid Android cleartext block
  if (trimmed.startsWith('http://res.cloudinary.com/')) {
    trimmed = trimmed.replace('http://', 'https://');
  }

  // Kiểm tra nếu đường dẫn trỏ tới file ảnh có sẵn trong assets/images
  const cleanFilename = trimmed.split(/[/|\\]/).pop() || '';
  if (
    cleanFilename &&
    (!/^(https?:\/\/|file:\/\/|data:image\/|blob:)/i.test(trimmed) ||
      trimmed.includes('/images/') ||
      trimmed.includes('/assets/images/'))
  ) {
    const localUri = resolveLocalAssetUri(cleanFilename);
    if (localUri) {
      return localUri;
    }
  }

  // If already a full web URL (http:// or https://), local file (file://), or base64 data URL
  if (/^(https?:\/\/|file:\/\/|data:image\/|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  const serverHost = getServerHost();

  // If path contains src/assets/images/ (e.g. ./src/assets/images/foo.jpg)
  if (trimmed.includes('src/assets/images/')) {
    const filename = trimmed.split('src/assets/images/').pop() || '';
    const localUri = resolveLocalAssetUri(filename);
    if (localUri) return localUri;
    return `${serverHost}/images/${filename.replace(/^\/+/, '')}`;
  }

  // If path starts with ./ or ../
  if (trimmed.startsWith('./')) {
    const clean = trimmed.slice(2).replace(/^images\//, '');
    const localUri = resolveLocalAssetUri(clean);
    if (localUri) return localUri;
    return `${serverHost}/images/${clean}`;
  }
  if (trimmed.startsWith('../')) {
    const clean = trimmed.replace(/^(\.\.\/)+/, '').replace(/^images\//, '');
    const localUri = resolveLocalAssetUri(clean);
    if (localUri) return localUri;
    return `${serverHost}/images/${clean}`;
  }

  // Root-relative path (e.g. /uploads/... or /images/...)
  if (trimmed.startsWith('/images/')) {
    return `${serverHost}${trimmed}`;
  }

  if (trimmed.startsWith('/')) {
    return `${serverHost}${trimmed}`;
  }

  if (cleanFilename) {
    return `${serverHost}/images/${cleanFilename}`;
  }

  return `${serverHost}/${trimmed}`;
}

/**
 * Robustly extracts the primary product/order image from MongoDB schemas:
 * checks item.imageUrl, item.images[0], item.productId.images[0], etc.
 */
export function extractProductImage(item?: any): string {
  if (!item) return DEFAULT_FALLBACK_IMAGE;

  const candidate =
    (Array.isArray(item.images) && item.images.length > 0 && item.images[0]) ||
    item.imageUrl ||
    item.image ||
    item.productImage ||
    item.coverImage ||
    (item.productId && typeof item.productId === 'object' && Array.isArray(item.productId.images) && item.productId.images[0]) ||
    (item.productId && typeof item.productId === 'object' && item.productId.imageUrl) ||
    (item.productId && typeof item.productId === 'object' && item.productId.image) ||
    (item.productId && typeof item.productId === 'object' && item.productId.coverImage) ||
    (item.listingId && typeof item.listingId === 'object' && Array.isArray(item.listingId.images) && item.listingId.images[0]) ||
    (item.listingId && typeof item.listingId === 'object' && item.listingId.imageUrl) ||
    (item.listingId && typeof item.listingId === 'object' && item.listingId.image) ||
    (item.product && typeof item.product === 'object' && Array.isArray(item.product.images) && item.product.images[0]) ||
    (item.product && typeof item.product === 'object' && item.product.imageUrl) ||
    (item.product && typeof item.product === 'object' && item.product.image) ||
    '';

  return normalizeImageUrl(candidate);
}
