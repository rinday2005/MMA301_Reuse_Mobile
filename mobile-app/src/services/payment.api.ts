import { Linking } from 'react-native';
import api, { getServerHost } from './api';

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
  returnUrl?: string;
}

export interface CreateVnPayUrlResult {
  paymentUrl: string;
  vnpUrl: string;
  orderId?: string;
  orderCode?: string;
  totalAmount?: number;
  txnRef?: string;
}

/**
 * Calls backend /payments/create-vnpay-url and returns full result including orderId, orderCode, and paymentUrl.
 */
export const createVnPayOrderAndUrlApi = async (
  request: CreateVnPayUrlRequest | string,
  type: 'RENT' | 'THRIFT' = 'RENT'
): Promise<CreateVnPayUrlResult> => {
  const reqObj: CreateVnPayUrlRequest =
    typeof request === 'string' ? { orderId: request, type } : request;

  const mobileReturnUrl =
    reqObj.returnUrl || `${getServerHost()}/api/payments/vnpay-return?mobile=1`;

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
    returnUrl: mobileReturnUrl,
  });

  const payload = res.data?.data || res.data || {};
  const vnpUrl =
    res.data?.vnpUrl ||
    payload?.vnpUrl ||
    res.data?.paymentUrl ||
    payload?.paymentUrl ||
    '';

  if (!vnpUrl) {
    throw new Error('Không nhận được đường dẫn thanh toán từ máy chủ.');
  }

  return {
    paymentUrl: vnpUrl,
    vnpUrl,
    orderId: payload.orderId ? String(payload.orderId) : reqObj.orderId,
    orderCode: payload.orderCode || reqObj.orderCode,
    totalAmount: payload.totalAmount || reqObj.amount,
    txnRef: payload.txnRef,
  };
};

/**
 * Calls backend /payments/create-vnpay-url and returns the generated payment URL.
 */
export const createVnPayUrlApi = async (
  request: CreateVnPayUrlRequest | string,
  type: 'RENT' | 'THRIFT' = 'RENT'
): Promise<string> => {
  const result = await createVnPayOrderAndUrlApi(request, type);
  return result.paymentUrl;
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
  createVnPayOrderAndUrlApi,
  createVnPayUrlApi,
  handleVNPayPayment,
  redirectToVnPayGateway,
};
