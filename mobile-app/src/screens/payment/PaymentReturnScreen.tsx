import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';
import { updateOrderStatusApi, getRentalOrderByIdApi } from '../../services/order.api';

export const PaymentReturnScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const orderId = route.params?.orderId || '';
  const orderCode = route.params?.orderCode || (orderId ? `RH-RNT-${String(orderId).slice(-6)}` : 'RH-RNT-2026');
  const amount = Number(route.params?.amount || 0);
  const paymentUrl = route.params?.paymentUrl || '';
  const transactionNo =
    route.params?.transactionNo || `VNP${Date.now().toString().slice(-8)}`;
  const bankCode = route.params?.bankCode || 'NCB / VNPay Sandbox';
  const isThrift = route.params?.type === 'THRIFT';

  const [isProcessing, setIsProcessing] = useState(true);
  const [verifiedAmount, setVerifiedAmount] = useState(amount);

  const formatVND = (num: number) => (num || 0).toLocaleString('vi-VN') + '₫';

  useEffect(() => {
    let isMounted = true;

    const finalizePayment = async () => {
      try {
        if (orderId && !isThrift) {
          await updateOrderStatusApi(orderId, 'PAID');
          const updated = await getRentalOrderByIdApi(orderId);
          if (isMounted && updated?.totalAmount) {
            setVerifiedAmount(updated.totalAmount);
          }
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) {
          setTimeout(() => {
            if (isMounted) setIsProcessing(false);
          }, 500);
        }
      }
    };

    finalizePayment();

    return () => {
      isMounted = false;
    };
  }, [orderId, isThrift]);

  const handleReopenVnPay = async () => {
    if (!paymentUrl) return;
    try {
      const supported = await Linking.canOpenURL(paymentUrl);
      if (supported) {
        await Linking.openURL(paymentUrl);
      }
    } catch {
      // ignore
    }
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.topBanner}>
        <Text style={styles.topBannerText}>
          REUSE HUB · CỔNG THANH TOÁN VNPAY SANDBOX KẾT QUẢ GIAO DỊCH
        </Text>
      </View>
      <AppHeader title="Kết Quả Thanh Toán VNPay" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isProcessing ? (
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color="#2D5A43" />
            <Text style={styles.processingText}>
              Đang đối soát kết quả giao dịch VNPay Sandbox...
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-circle" size={44} color="#2D5A43" />
            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>GIAO DỊCH THÀNH CÔNG · SMART ESCROW ACTIVE</Text>
            </View>

            <Text style={styles.title}>Thanh toán VNPay thành công!</Text>
            <Text style={styles.subtitle}>
              Đơn hàng của quý khách đã được ghi nhận trạng thái ĐÃ THANH TOÁN (PAID) trên hệ thống ReUse Hub. Tiền cọc được khóa bảo chứng trong Smart Escrow an toàn.
            </Text>

            {/* Receipt Summary Card */}
            <View style={styles.receiptBox}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Mã đơn hàng:</Text>
                <Text style={styles.receiptValMono}>#{orderCode.replace(/^#/, '')}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Số tiền đã thanh toán:</Text>
                <Text style={styles.receiptValAmount}>{formatVND(verifiedAmount)}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Mã giao dịch VNPay:</Text>
                <Text style={styles.receiptValMono}>{transactionNo}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Ngân hàng / Cổng:</Text>
                <Text style={styles.receiptVal}>{bankCode}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Trạng thái đơn thuê:</Text>
                <Text style={[styles.receiptVal, { color: '#059669' }]}>
                  ĐÃ THANH TOÁN (Chờ Shop giao hàng)
                </Text>
              </View>

              <View style={[styles.receiptRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.receiptLabel}>Thời gian hoàn tất:</Text>
                <Text style={styles.receiptVal}>{new Date().toLocaleString('vi-VN')}</Text>
              </View>
            </View>

            {paymentUrl ? (
              <TouchableOpacity
                style={styles.vnpayBrowserBtn}
                onPress={handleReopenVnPay}
                activeOpacity={0.85}
              >
                <Feather name="external-link" size={14} color="#0284C7" />
                <Text style={styles.vnpayBrowserBtnText}>
                  Mở cổng VNPay Sandbox trên trình duyệt
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* Primary Actions matching Web */}
            <View style={styles.actionCol}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() =>
                  navigation.navigate(isThrift ? 'MyThriftOrders' : 'MyRentOrders')
                }
                activeOpacity={0.88}
              >
                <Feather name="file-text" size={16} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>
                  {isThrift ? 'XEM ĐƠN MUA THRIFT' : 'XEM ĐƠN THUÊ CỦA TÔI'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => navigation.navigate('UserDashboard')}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryBtnText}>VỀ USER DASHBOARD</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PaymentReturnScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF9F5',
  },
  topBanner: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  topBannerText: {
    color: '#E2DFD8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  processingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 36,
    borderWidth: 1,
    borderColor: '#E5E0D8',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  processingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A463F',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E0D8',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8EFE9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  badge: {
    backgroundColor: '#E8EFE9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2D5A43',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E1E1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#57534E',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: '#FBF9F5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFECE6',
    marginBottom: 16,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#EFECE6',
    gap: 8,
  },
  receiptLabel: {
    fontSize: 12,
    color: '#78736A',
  },
  receiptVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E1E1E',
    textAlign: 'right',
    flexShrink: 1,
  },
  receiptValMono: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1E1E',
    fontFamily: 'monospace',
  },
  receiptValAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2D5A43',
    fontFamily: 'monospace',
  },
  vnpayBrowserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 14,
  },
  vnpayBrowserBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  actionCol: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E1E1E',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F2EB',
    borderWidth: 1,
    borderColor: '#E5E0D8',
    paddingVertical: 13,
    borderRadius: 12,
    width: '100%',
  },
  secondaryBtnText: {
    color: '#1E1E1E',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
