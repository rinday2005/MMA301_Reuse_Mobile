import { Linking } from 'react-native';
import api from './api';
import { storage } from '../utils/storage';

export interface CreateVnPayUrlRequest {
  orderId?: string;
  orderCode?: string;
  amount?: number;
  type?: 'RENT' | 'THRIFT';
  productId?: string;
  startDate?: string;
  endDate?: string;
  items?: unknown[];
  shippingAddress?: unknown;
  rentalFee?: number;
  depositAmount?: number;
  shippingFee?: number;
}

/**
 * Calls backend /payments/create-vnpay-url and returns the generated payment URL.
 */
export const createVnPayUrlApi = async (
  request: CreateVnPayUrlRequest | string,
  type: 'RENT' | 'THRIFT' = 'RENT'
): Promise<string> => {
  const reqObj: CreateVnPayUrlRequest =
    typeof request === 'string' ? { orderId: request, type } : request;

  const res = await api.post('/payments/create-vnpay-url', {
    orderId: reqObj.orderId,
    orderCode: reqObj.orderCode,
    amount: reqObj.amount,
    type: reqObj.type || type,
    productId: reqObj.productId,
    startDate: reqObj.startDate,
    endDate: reqObj.endDate,
    items: reqObj.items,
    shippingAddress: reqObj.shippingAddress,
    rentalFee: reqObj.rentalFee,
    depositAmount: reqObj.depositAmount,
    shippingFee: reqObj.shippingFee,
  });

  const vnpUrl =
    res.data?.vnpUrl ||
    res.data?.data?.vnpUrl ||
    res.data?.paymentUrl ||
    res.data?.data?.paymentUrl ||
    '';

  if (!vnpUrl) {
    throw new Error('Không nhận được đường dẫn thanh toán từ máy chủ.');
  }

  return vnpUrl;
};

/**
 * Mobile payment handler: creates VNPay URL and opens via device browser or in-app browser.
 */
export const handleVNPayPayment = async (
  request: CreateVnPayUrlRequest | string,
  type: 'RENT' | 'THRIFT' = 'RENT'
): Promise<string> => {
  const vnpUrl = await createVnPayUrlApi(request, type);
  const supported = await Linking.canOpenURL(vnpUrl);
  if (supported) {
    await Linking.openURL(vnpUrl);
  }
  return vnpUrl;
};

export const redirectToVnPayGateway = async (
  request: CreateVnPayUrlRequest
): Promise<string> => {
  return handleVNPayPayment(request, request.type || 'RENT');
};

export default {
  createVnPayUrlApi,
  handleVNPayPayment,
  redirectToVnPayGateway,
};
