import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { getRentalOrderByIdApi, RentalOrderApi } from '../../services/order.api';
import { normalizeImageUrl } from '../../utils/imageUrl';
import { storage } from '../../utils/storage';

const SAMPLE_HON_ORDER: any = {
  _id: '6acee0804c6e5d97a2389e99',
  orderCode: 'RH-RNT-2026-6519',
  userId: 'hon-id',
  customerName: 'Nguyễn Văn Hơn',
  customerPhone: '0708091060',
  customerAddress: '48 Bạch Đằng, Phường Hải Châu 1, Quận Hải Châu, Thành phố Đà Nẵng',
  startDate: '30/10/2026',
  endDate: '02/11/2026',
  rentalDays: 3,
  rentalFee: 480000,
  depositAmount: 800000,
  shippingFee: 25000,
  totalAmount: 1305000,
  status: 'SHIPPING',
  claSigned: false,
  items: [
    {
      productId: 'item-fsh-6519',
      productName: 'Giày Sandal Cao Gót Quai Mảnh Ánh Kim Dự Tiệc',
      imageUrl: './src/assets/images/shoeshome.jpg',
      price: 160000,
      depositAmount: 800000,
      quantity: 1,
      sku: 'SKU-FSH-6519-01',
      grade: 'GRADE A+',
      archiveCode: '#6519-1',
      provider: 'ReUse Partner Vault · Kiểm định chất lượng 8 bước ReUse Standard',
    } as any,
  ],
  createdAt: '2026-10-30T08:00:00.000Z',
};

export const RentOrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const orderId = route.params?.id || '';
  const initialOrder = route.params?.order || null;

  const [loading, setLoading] = useState(!initialOrder);
  const [order, setOrder] = useState<RentalOrderApi | null>(initialOrder);

  const formatVND = (num: number) => {
    return (num || 0).toLocaleString('vi-VN') + '₫';
  };

  const loadOrderDetail = useCallback(async () => {
    if (!orderId) {
      if (initialOrder) {
        setOrder(initialOrder);
      } else {
        setOrder(SAMPLE_HON_ORDER);
      }
      setLoading(false);
      return;
    }
    try {
      const res = await getRentalOrderByIdApi(orderId);
      if (res) {
        setOrder(res);
      } else if (!order) {
        setOrder(initialOrder || SAMPLE_HON_ORDER);
      }
    } catch {
      if (!order) {
        setOrder(initialOrder || SAMPLE_HON_ORDER);
      }
    } finally {
      setLoading(false);
    }
  }, [orderId, initialOrder, order]);

  useEffect(() => {
    loadOrderDetail();
  }, [loadOrderDetail]);

  const item = order?.items?.[0] as any;
  const itemTitle = item?.productName || item?.title || 'Thiết bị thuê ReUse';
  const itemImg = normalizeImageUrl(item?.imageUrl || item?.image || './src/assets/images/camerahome.jpg');
  const orderCode = order?.orderCode || `#${orderId.slice(-6)}`;
  const deposit = order?.depositAmount || Number(item?.depositAmount) || 0;
  const total = order?.totalAmount || 0;
  const rentalFee = order?.rentalFee || (total > deposit ? total - deposit - 25000 : 0);
  const shippingFee = order?.shippingFee || 25000;
  const days = order?.rentalDays || 1;

  const startStr = order?.startDate ? new Date(order.startDate).toLocaleDateString('vi-VN') : '30/10/2026';
  const endStr = order?.endDate ? new Date(order.endDate).toLocaleDateString('vi-VN') : '02/11/2026';

  const orderKey = order?._id || order?.orderCode || orderId;
  const hasClaSigned = (order as any)?.claSigned || Boolean(storage.getSync(`cla_signed_${orderKey}`));
  const rawStatus = (order?.status || '').toUpperCase();
  const isDeliveredWaitingSign = ['SHIPPING', 'DELIVERED', 'READY_FOR_HANDOVER'].includes(rawStatus) && !hasClaSigned;
  const isRentingActual = rawStatus === 'RENTING' || (['SHIPPING', 'DELIVERED'].includes(rawStatus) && hasClaSigned);

  const handleRentAgain = () => {
    const prodId = item?.productId || item?.id || 'item-fsh-6519';
    navigation.navigate('RentProductDetail', {
      id: prodId,
      item: {
        id: prodId,
        title: itemTitle,
        price: item?.price || (rentalFee / days) || 160000,
        deposit: deposit,
        image: itemImg,
      },
    });
  };

  const handleSignCla = () => {
    storage.setSync(`cla_signed_${orderKey}`, 'true');
    setOrder((prev) => (prev ? { ...prev, claSigned: true, status: 'RENTING' } : null));
    Alert.alert(
      'Ký biên bản thành công! 🎉',
      'Đã hoàn tất ký biên bản CLA bàn giao. Đơn hàng chính thức chuyển sang Bước 6: Đang thuê.'
    );
  };

  return (
    <View style={styles.safeArea}>
      <AppHeader title={`Chi Tiết ${orderCode}`} showBack />

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#1C1A18" />
          <Text style={styles.loadingText}>Đang tải chi tiết đơn thuê...</Text>
        </View>
      ) : !order ? (
        <View style={styles.emptyCenter}>
          <Feather name="alert-circle" size={36} color="#DC2626" style={{ marginBottom: 8 }} />
          <Text style={styles.emptyTitle}>Không tìm thấy đơn thuê</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>Quay lại danh sách</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* 1. STATUS HEADER */}
          <View style={styles.headerBox}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.orderCode}>{orderCode}</Text>
                <Text style={styles.orderDate}>
                  Tạo ngày {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                </Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{order.status || 'PAID'}</Text>
              </View>
            </View>

            {/* Smart Escrow Notice */}
            <View style={styles.escrowNotice}>
              <Ionicons name="shield-checkmark" size={18} color="#059669" />
              <View style={styles.escrowNoticeTextWrap}>
                <Text style={styles.escrowNoticeTitle}>Ký quỹ Smart Escrow: {formatVND(deposit)}</Text>
                <Text style={styles.escrowNoticeDesc}>
                  Được bảo chứng độc lập. Tiền cọc được tự động giải phóng hoàn trả 100% trong 24h sau khi Shop Owner hoàn tất đối soát trả hàng.
                </Text>
              </View>
            </View>
          </View>

          {/* 2. PRODUCT ITEM CARD */}
          <View style={styles.card}>
            <Text style={styles.cardSectionPre}>THIẾT BỊ BÀN GIAO</Text>
            <View style={styles.productRow}>
              <Image source={{ uri: itemImg }} style={styles.productImg} />
              <View style={styles.productInfo}>
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeBadgeText}>GRADE A+ 95%</Text>
                </View>
                <Text style={styles.productTitle}>{itemTitle}</Text>
                <Text style={styles.productPeriod}>Chu kỳ: {startStr} – {endStr} ({days} ngày)</Text>
              </View>
            </View>

            {/* Verification & Accessories Checklist */}
            <View style={styles.checklistWrap}>
              <Text style={styles.checklistHead}>PHỤ KIỆN BÀN GIAO &amp; NIÊM PHONG:</Text>
              {[
                'Thùng chống sốc Nanuk/Pelican có seal niêm phong',
                'Hồ sơ kiểm định quang học/cảm biến Audit Bench 100%',
                'Khử trùng y tế buồng tia UV-C trước khi đóng gói',
              ].map((text, idx) => (
                <View key={idx} style={styles.checkItem}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={styles.checkText}>{text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 3. FINANCIAL BREAKDOWN */}
          <View style={styles.card}>
            <Text style={styles.cardSectionPre}>BẢNG CẤU TRÚC TÀI CHÍNH</Text>
            <Text style={styles.cardTitle}>Chi tiết chi phí &amp; Ký quỹ</Text>

            <View style={styles.costTable}>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Phí thuê ({days} ngày)</Text>
                <Text style={styles.costValue}>{formatVND(rentalFee)}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Vận chuyển 2 chiều (Chuyên dụng)</Text>
                <Text style={styles.costValue}>{formatVND(shippingFee)}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabelHighlight}>Tiền cọc Smart Escrow (Hoàn 100%)</Text>
                <Text style={styles.costValueGreen}>{formatVND(deposit)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.costRowTotal}>
                <Text style={styles.totalLabel}>Tổng thanh toán ban đầu</Text>
                <Text style={styles.totalValue}>{formatVND(total)}</Text>
              </View>
            </View>
          </View>

          {/* 4. ACTIONS */}
          <View style={styles.actionsWrap}>
            {isDeliveredWaitingSign ? (
              <TouchableOpacity
                style={styles.actionBtnClaOrange}
                onPress={handleSignCla}
                activeOpacity={0.88}
              >
                <Feather name="edit-3" size={16} color="#FFFFFF" />
                <Text style={styles.actionBtnPrimaryText}>Ký đơn hàng để bắt đầu thuê</Text>
              </TouchableOpacity>
            ) : isRentingActual ? (
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={() =>
                  navigation.navigate('ReturnRequest', {
                    id: order?._id || order?.orderCode || orderId,
                  })
                }
              >
                <Text style={styles.actionBtnPrimaryText}>Báo trả đồ / Hoàn cọc Escrow</Text>
                <Feather name="arrow-right" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={handleRentAgain}
              activeOpacity={0.85}
            >
              <Feather name="repeat" size={16} color="#1C1A18" />
              <Text style={styles.actionBtnSecondaryText}>Thuê lại sản phẩm này</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => navigation.navigate('Chat')}
            >
              <Feather name="message-square" size={16} color="#1C1A18" />
              <Text style={styles.actionBtnSecondaryText}>Nhắn tin hỗ trợ kỹ thuật</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default RentOrderDetailScreen;

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
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCode: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#1C1A18',
  },
  orderDate: {
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
  escrowNotice: {
    flexDirection: 'row',
    backgroundColor: '#F4F0EA',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  escrowNoticeTextWrap: {
    flex: 1,
  },
  escrowNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 2,
  },
  escrowNoticeDesc: {
    fontSize: 11,
    color: '#5E5A53',
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 16,
    gap: 10,
  },
  cardSectionPre: {
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
  productImg: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#F4F0EA',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  gradeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F4F0EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  gradeBadgeText: {
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
  productPeriod: {
    fontSize: 11,
    color: '#78736A',
    marginTop: 2,
  },
  checklistWrap: {
    backgroundColor: '#FBF9F5',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    gap: 6,
    marginTop: 4,
  },
  checklistHead: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#78736A',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkText: {
    fontSize: 11,
    color: '#1C1A18',
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
  costLabelHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  costValueGreen: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
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
  actionBtnClaOrange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
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
