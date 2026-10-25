import { getPublicRentProductDetailApi, getPublicRentProductsApi } from '../services/rentProduct.api';

export interface ResolvedRentProductInfo {
  id: string;
  name: string;
  image: string;
  pricePerDay: number;
  deposit: number;
  condition?: string;
  location?: string;
}

/** True when the string looks like a raw MongoDB ObjectId (24 hex chars). */
export const isObjectIdLike = (value?: string | null): boolean =>
  !!value && /^[0-9a-fA-F]{24}$/.test(String(value).trim());

/** A title is "unusable" when empty, a raw ObjectId, or a generic placeholder. */
export const isUnusableItemTitle = (title?: string | null): boolean => {
  const t = (title || '').trim();
  if (!t) return true;
  if (isObjectIdLike(t)) return true;
  if (t.includes('Đơn hàng Thuê') || t.includes('RH-RNT-')) return true;
  if (/^Sản phẩm thuê #?\d+/i.test(t)) return true;
  return false;
};

const cache = new Map<string, ResolvedRentProductInfo | null>();

/**
 * Fetch real product data (name, image, price, deposit) from backend for the given ids.
 * Only ObjectId-like ids are queried. Results are cached per session.
 */
export const resolveRentProductsByIds = async (
  ids: Array<string | undefined | null>
): Promise<Map<string, ResolvedRentProductInfo>> => {
  const result = new Map<string, ResolvedRentProductInfo>();
  const uniqueIds = Array.from(new Set(ids.map((i) => String(i || '').trim()).filter(isObjectIdLike)));

  await Promise.all(
    uniqueIds.map(async (pid) => {
      if (cache.has(pid)) {
        const hit = cache.get(pid);
        if (hit) result.set(pid, hit);
        return;
      }
      let p: Record<string, unknown> | null;
      try {
        const data = (await getPublicRentProductDetailApi(pid)) as
          | { product?: Record<string, unknown> }
          | Record<string, unknown>
          | null;
        p = ((data as { product?: Record<string, unknown> } | null)?.product || data) as Record<
          string,
          unknown
        > | null;
      } catch {
        p = null;
      }
      if (!p || typeof p.name !== 'string' || !p.name) {
        // Fallback: look the product up in the public list
        try {
          const list = (await getPublicRentProductsApi({ limit: 500 })) as unknown as Array<
            Record<string, unknown>
          >;
          p = list.find((x) => String(x._id) === pid) || null;
        } catch {
          p = null;
        }
      }
      if (!p || typeof p.name !== 'string' || !p.name) {
        cache.set(pid, null);
        return;
      }
      const images = Array.isArray(p.images) ? (p.images as string[]) : [];
      const info: ResolvedRentProductInfo = {
        id: pid,
        name: p.name as string,
        image: images[0] || '',
        pricePerDay: Number(p.pricePerDay) || 0,
        deposit: Number(p.depositAmount) || 0,
        condition: typeof p.condition === 'string' ? p.condition : undefined,
        location: typeof p.location === 'string' ? p.location : undefined,
      };
      cache.set(pid, info);
      result.set(pid, info);
    })
  );

  return result;
};
