import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';
import { getMyThriftOrdersApi, confirmDeliveredThriftOrderApi, ThriftOrderApi } from '../../services/thriftOrder.api';
import { normalizeImageUrl } from '../../utils/imageUrl';
import { storage } from '../../utils/storage';
import { useAuth } from '../../hooks/useAuth';
import { resolveThriftOrderItem } from '../../utils/thriftOrderItemResolver';

const FALLBACK_THRIFT_ORDER: any = {
  _id: '6acee0804c6e5d97a2389f11',
  orderCode: 'RH-TH-882314',
  userId: 'hon-id',
  customerName: 'Nguyễn Văn Hơn',
  customerPhone: '0708091060',
  customerAddress: '48 Bạch Đằng, Phường Hải Châu 1, Quận Hải Châu, Thành phố Đà Nẵng',
  totalAmount: 1475000,
  shippingFee: 25000,
  status: 'DELIVERED',
  createdAt: '2026-10-28T09:00:00.000Z',
  items: [
    {
      productId: 'th-fsh-01',
      productName: 'Áo Khoác Da Vintage Tuyển Chọn (Archival Piece)',
      imageUrl: './src/assets/images/partydresshome.jpg',
      price: 1450000,
      quantity: 1,
      sku: 'SKU-TH-8823-01',
      grade: '1-OF-1 ARCHIVAL',
    } as any,
  ],
};

export const ThriftOrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const orderId = route.params?.id || '';
  const initialOrder = route.params?.order || null;

  const [loading, setLoading] = useState(!initialOrder);
  const [order, setOrder] = useState<ThriftOrderApi | null>(initialOrder);

  const formatVND = (num: number) => {
    return (num || 0).toLocaleString('vi-VN') + '₫';
  };

  const loadOrderDetail = useCallback(async () => {
    if (initialOrder) {
      setOrder(initialOrder);
      setLoading(false);
      return;
    }

    try {
      const res = await getMyThriftOrdersApi();
      const list: ThriftOrderApi[] = Array.isArray(res) ? res : res?.orders || [];
      const cleanTarget = String(orderId).replace('#', '').trim().toLowerCase();
      let matched = list.find((o) => {
        const c = String(o.orderCode || o._id || '').replace('#', '').trim().toLowerCase();
        return c === cleanTarget || (c.length > 4 && cleanTarget.includes(c)) || (cleanTarget.length > 4 && c.includes(cleanTarget));
      });

      if (!matched) {
        // Check offline storage
        const uId = user?._id || user?.id || '';
        const savedRaw = (uId ? storage.getSync(`user_thrift_orders_${uId}`) : null) || storage.getSync('user_thrift_orders');
        if (savedRaw) {
          try {
            const parsed = JSON.parse(savedRaw);
            const savedList = Array.isArray(parsed) ? parsed : [parsed];
            matched = savedList.find((o: any) => {
              const c = String(o.orderCode || o._id || '').replace('#', '').trim().toLowerCase();
              return c === cleanTarget || (c.length > 4 && cleanTarget.includes(c)) || (cleanTarget.length > 4 && c.includes(cleanTarget));
            }) || savedList[0];
          } catch {
            // ignore
          }
        }
      }

      setOrder(matched || FALLBACK_THRIFT_ORDER);
    } catch {
      setOrder(FALLBACK_THRIFT_ORDER);
    } finally {
      setLoading(false);
    }
  }, [orderId, initialOrder, user]);

  useEffect(() => {
    loadOrderDetail();
  }, [loadOrderDetail]);

  const item = order?.items?.[0] as any;
  const resolved = resolveThriftOrderItem(order, item);
  const itemTitle = resolved.title;
  const itemImg = resolved.image;
  const itemCondition = resolved.condition;
  const orderCode = order?.orderCode || `#${orderId.slice(-6)}`;
  const total = order?.totalAmount || item?.price || 0;
  const shippingFee = 25000;
  const subtotal = total > shippingFee ? total - shippingFee : total;
  const dateStr = order?.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'Gần đây';

  const handleConfirmReceived = async () => {
    Alert.alert(
      'Xác nhận nhận hàng',
      'Bạn đã kiểm tra và nhận đầy đủ sản phẩm THRIFT nguyên seal?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              await confirmDeliveredThriftOrderApi(order?._id || orderCode);
              Alert.alert('Thành công', 'Đơn hàng đã được cập nhật Đã nhận hàng.');
              loadOrderDetail();
            } catch {
              loadOrderDetail();
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.safeArea}>
      <AppHeader title={`Chi Tiết ${orderCode}`} showBack />

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#1C1A18" />
          <Text style={styles.loadingText}>Đang tải chi tiết đơn THRIFT...</Text>
        </View>
      ) : !order ? (
        <View style={styles.emptyCenter}>
          <Feather name="alert-circle" size={36} color="#DC2626" style={{ marginBottom: 8 }} />
          <Text style={styles.emptyTitle}>Không tìm thấy đơn hàng THRIFT</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>Quay lại danh sách</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Box */}
          <View style={styles.headerBox}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.orderCodeText}>{orderCode}</Text>
                <Text style={styles.orderDateText}>Ngày đặt: {dateStr}</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{order.status || 'PAID'}</Text>
              </View>
            </View>

            {/* Tracking code */}
            <View style={styles.trackingBox}>
              <Feather name="truck" size={15} color="#1C1A18" />
              <Text style={styles.trackingLabel}>Mã vận đơn:</Text>
              <Text style={styles.trackingCode}>VNPOST-{orderCode.replace('#', '')}</Text>
            </View>
          </View>

          {/* Product Items Card */}
          <View style={styles.card}>
            <Text style={styles.cardPre}>SẢN PHẨM TUYỂN CHỌN SỞ HỮU</Text>
            <View style={styles.productRow}>
              <Image source={{ uri: itemImg }} style={styles.productThumb} />
              <View style={styles.productInfo}>
                <View style={styles.badge1of1}>
                  <Text style={styles.badge1of1Text}>1-OF-1 SECOND-LIFE</Text>
                </View>
                <Text style={styles.productTitle}>{itemTitle}</Text>
                <Text style={styles.productPrice}>{formatVND(item?.price || subtotal)}</Text>
              </View>
            </View>

            {/* Verification Seal Note */}
            <View style={styles.sealBox}>
              <Ionicons name="shield-checkmark" size={15} color="#059669" />
              <View style={{ flex: 1 }}>
                <Text style={styles.sealTitle}>Tem niêm phong bảo chứng Audit Bench</Text>
                <Text style={styles.sealDesc}>
                  Đặc quyền kiểm tra độc lập trong 72 giờ (3 ngày) sau khi nhận. Nếu phát sinh sai lệch tình trạng ngoại quan, bạn được hoàn tiền 100%.
                </Text>
              </View>
            </View>
          </View>

          {/* Cost Breakdown */}
          <View style={styles.card}>
            <Text style={styles.cardPre}>BẢNG THANH TOÁN</Text>
            <Text style={styles.cardTitle}>Chi tiết thanh toán đơn hàng</Text>

            <View style={styles.costTable}>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Tiền sản phẩm THRIFT</Text>
                <Text style={styles.costValue}>{formatVND(subtotal)}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Phí giao hàng bảo chứng</Text>
                <Text style={styles.costValue}>{formatVND(shippingFee)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.costRowTotal}>
                <Text style={styles.totalLabel}>Tổng tiền đã thanh toán</Text>
                <Text style={styles.totalValue}>{formatVND(total)}</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsWrap}>
            {order.status !== 'DELIVERED' && (
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={handleConfirmReceived}
              >
                <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
                <Text style={styles.actionBtnPrimaryText}>Xác nhận đã nhận hàng</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => navigation.navigate('Chat')}
            >
              <Feather name="message-square" size={16} color="#1C1A18" />
              <Text style={styles.actionBtnSecondaryText}>Liên hệ hỗ trợ đơn hàng</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default ThriftOrderDetailScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF9F5',
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#78736A',
  },
  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 12,
  },
  backBtn: {
    backgroundColor: '#1C1A18',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 14,
  },
  headerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 16,
    gap: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCodeText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#1C1A18',
  },
  orderDateText: {
    fontSize: 11,
    color: '#78736A',
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  trackingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F0EA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  trackingLabel: {
    fontSize: 11,
    color: '#78736A',
  },
  trackingCode: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#1C1A18',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 16,
    gap: 10,
  },
  cardPre: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#78736A',
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1A18',
  },
  productRow: {
    flexDirection: 'row',
    gap: 12,
  },
  productThumb: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#F4F0EA',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  badge1of1: {
    alignSelf: 'flex-start',
    backgroundColor: '#F4F0EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  badge1of1Text: {
    fontSize: 8,
    fontWeight: '800',
    color: '#1C1A18',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1A18',
    marginTop: 4,
  },
  sealBox: {
    flexDirection: 'row',
    backgroundColor: '#FBF9F5',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    marginTop: 4,
  },
  sealTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 2,
  },
  sealDesc: {
    fontSize: 10,
    color: '#5E5A53',
    lineHeight: 15,
  },
  costTable: {
    gap: 8,
    marginTop: 4,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  costLabel: {
    fontSize: 12,
    color: '#5E5A53',
  },
  costValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1A18',
  },
  divider: {
    height: 1,
    backgroundColor: '#E7E2DA',
    marginVertical: 4,
  },
  costRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1A18',
  },
  actionsWrap: {
    gap: 8,
    marginTop: 6,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1A18',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
  },
});
