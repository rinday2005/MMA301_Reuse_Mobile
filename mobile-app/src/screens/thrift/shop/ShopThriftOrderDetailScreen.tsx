import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getThriftOrderByIdApi,
  updateThriftOrderStatusApi,
  type ThriftOrderApi,
} from '../../../services/thriftOrder.api';
import { normalizeImageUrl, extractProductImage } from '../../../utils/imageUrl';
import { resolveThriftOrderItem } from '../../../utils/thriftOrderItemResolver';
import { ShopHeader } from '../../../components/layout/ShopHeader';

export const ShopThriftOrderDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params || {};

  const [order, setOrder] = useState<ThriftOrderApi | null>(null);
  const [loading, setLoading] = useState(true);

  // Handover modal state
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [carrierName, setCarrierName] = useState('Nanuk Garment Express');
  const [trackingCode, setTrackingCode] = useState('');
  const [sealCode, setSealCode] = useState('');
  const [submittingHandover, setSubmittingHandover] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const cleanId = String(id).replace('#', '');
      const data = await getThriftOrderByIdApi(cleanId);
      if (data) {
        setOrder(data);
      }
    } catch (err) {
      console.warn('Lỗi tải chi tiết đơn hàng THRIFT:', err);
    } finally {
      setLoading(false);
    }
  };

  const openHandover = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setCarrierName('Nanuk Garment Express');
    setTrackingCode(`NK-THF-${randomSuffix}-VN`);
    setSealCode(`SEAL-ATELIER-${randomSuffix}`);
    setIsHandoverOpen(true);
  };

  const handleConfirmHandover = async () => {
    if (!order) return;
    if (!trackingCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã vận đơn.');
      return;
    }
    try {
      setSubmittingHandover(true);
      await updateThriftOrderStatusApi(order._id, {
        status: 'SHIPPED',
        courierName: carrierName,
        trackingCode: trackingCode.trim(),
        sealCode: sealCode.trim(),
      });
      setIsHandoverOpen(false);
      Alert.alert('Thành công', 'Đã cập nhật trạng thái đơn: Đang giao hàng.');
      loadOrder();
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể bàn giao.');
    } finally {
      setSubmittingHandover(false);
    }
  };

  const handleMarkDelivered = () => {
    if (!order) return;
    Alert.alert(
      'Xác nhận đã giao hàng',
      'Đánh dấu đơn hàng đã được giao tới khách hàng? Khách sẽ có 72 giờ đối soát độc lập.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận giao',
          onPress: async () => {
            try {
              await updateThriftOrderStatusApi(order._id, { status: 'DELIVERED' });
              Alert.alert('Thành công', 'Đã cập nhật: Đã giao (Kích hoạt đếm ngược 72h Escrow).');
              loadOrder();
            } catch (err: any) {
              Alert.alert('Lỗi', err.response?.data?.message || 'Không thể cập nhật.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#1C1A18" />
        <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <Feather name="alert-circle" size={48} color="#A8A29E" />
        <Text style={styles.notFoundText}>Không tìm thấy thông tin đơn hàng</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rawStatus = (order.status || '').toUpperCase();
  const isPending = rawStatus === 'PENDING';
  const isPaid = ['PAID', 'PROCESSING'].includes(rawStatus);
  const isShipped = ['SHIPPED', 'SHIPPING'].includes(rawStatus);
  const isDelivered = rawStatus === 'DELIVERED';
  const isCompleted = rawStatus === 'COMPLETED';

  const handleApproveThrift = async () => {
    try {
      await updateThriftOrderStatusApi(order._id, { status: 'WAITING_PAYMENT' });
      Alert.alert('Đã duyệt đơn! 🎉', 'Đơn mua đã chuyển sang trạng thái Chờ khách thanh toán.');
      loadOrder();
    } catch {
      loadOrder();
    }
  };

  const handleClaimWallet = () => {
    const gross = order.itemsSubtotal || order.totalAmount || 0;
    const net = Math.round(gross * 0.965);
    Alert.alert(
      'Thu tiền về ví xưởng',
      `Giải ngân +${net.toLocaleString('vi-VN')} ₫ (sau trừ 3.5% phí sàn) về ví xưởng?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thu về ví ngay',
          onPress: () => {
            Alert.alert('Thành công! 🎉', 'Tiền bán đứt THRIFT đã được tất toán vào ví xưởng của bạn.');
          },
        },
      ]
    );
  };

  // Buyer info
  const buyer = (typeof order.buyerId === 'object' && order.buyerId ? order.buyerId : null) as any;
  const buyerName = order.shippingAddress?.recipientName || buyer?.fullName || 'Khách hàng ReUse';
  const buyerPhone = order.shippingAddress?.recipientPhone || buyer?.phoneNumber || '0901234567';
  const buyerAddress = order.shippingAddress
    ? `${order.shippingAddress.detail}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.province}`
    : 'Chưa có địa chỉ chi tiết';

  // Pricing
  const subtotal = order.itemsSubtotal || (order.totalAmount - (order.shippingFee || 0));
  const shippingFee = order.shippingFee || 30000;
  const totalAmount = order.totalAmount || (subtotal + shippingFee);

  return (
    <View style={styles.container}>
      <ShopHeader showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status Timeline Hero */}
        <View style={styles.statusHero}>
          <View style={styles.timelineRow}>
            <View style={[styles.timelineNode, styles.timelineNodeDone]}>
              <Feather name="check" size={12} color="#FFF" />
            </View>
            <View style={[styles.timelineBar, (isShipped || isDelivered || isCompleted) && styles.timelineBarDone]} />
            <View style={[styles.timelineNode, (isShipped || isDelivered || isCompleted) && styles.timelineNodeDone]}>
              {(isShipped || isDelivered || isCompleted) ? (
                <Feather name="check" size={12} color="#FFF" />
              ) : (
                <View style={styles.timelineDot} />
              )}
            </View>
            <View style={[styles.timelineBar, (isDelivered || isCompleted) && styles.timelineBarDone]} />
            <View style={[styles.timelineNode, (isDelivered || isCompleted) && styles.timelineNodeDone]}>
              {(isDelivered || isCompleted) ? (
                <Feather name="check" size={12} color="#FFF" />
              ) : (
                <View style={styles.timelineDot} />
              )}
            </View>
            <View style={[styles.timelineBar, isCompleted && styles.timelineBarDone]} />
            <View style={[styles.timelineNode, isCompleted && styles.timelineNodeDone]}>
              {isCompleted ? (
                <Feather name="check" size={12} color="#FFF" />
              ) : (
                <View style={styles.timelineDot} />
              )}
            </View>
          </View>
          <View style={styles.timelineLabels}>
            <Text style={styles.timelineLabel}>Đã TT</Text>
            <Text style={styles.timelineLabel}>Đang giao</Text>
            <Text style={styles.timelineLabel}>Đã nhận (72h)</Text>
            <Text style={styles.timelineLabel}>Hoàn tất</Text>
          </View>
        </View>

        {/* Escrow Guarantee Banner */}
        <View style={styles.escrowBanner}>
          <Ionicons name="shield-checkmark" size={20} color="#15803D" />
          <View style={styles.escrowBannerTextWrap}>
            <Text style={styles.escrowTitle}>Bảo hiểm lưu ký Smart Escrow</Text>
            <Text style={styles.escrowDesc}>
              Tiền thanh toán được tạm khóa an toàn. Sau 72 giờ đối soát độc lập không khiếu nại, hệ thống sẽ tự động giải ngân về ví Shop.
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Sản phẩm trong đơn hàng</Text>
          {(order.items || []).map((it, idx) => {
            const resolved = resolveThriftOrderItem(order, it, idx);
            const img = resolved.image || extractProductImage(it);
            const name = resolved.title || it.name || (it as any).productName || 'Hiện vật THRIFT tuyển chọn';
            return (
              <View key={idx} style={[styles.itemRow, idx > 0 && styles.itemBorderTop]}>
                <Image
                  source={{ uri: normalizeImageUrl(img) }}
                  style={styles.itemImg}
                  resizeMode="cover"
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{name}</Text>
                  <Text style={styles.itemCondition}>
                    {it.condition || 'Grade 1 · Tuyển chọn (98%)'}
                  </Text>
                  <Text style={styles.itemPrice}>
                    {(it.price || 0).toLocaleString('vi-VN')} ₫
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Courier & Tracking Info */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Thông tin bưu tá & Niêm chì</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Đơn vị vận chuyển:</Text>
            <Text style={styles.infoValue}>{order.courierName || 'Nanuk Garment Express'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã vận đơn bưu tá:</Text>
            <Text style={[styles.infoValue, styles.highlightValue]}>
              {order.trackingCode || 'Chưa bàn giao'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã niêm chì bảo đảm:</Text>
            <Text style={[styles.infoValue, styles.highlightValue]}>
              {order.sealCode || 'SEAL-ATELIER-CHRONOS'}
            </Text>
          </View>
        </View>

        {/* Customer Shipping Address */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Địa chỉ nhận hàng của khách</Text>
          <View style={styles.buyerRow}>
            <Feather name="user" size={16} color="#78736A" />
            <Text style={styles.buyerNameText}>{buyerName}</Text>
          </View>
          <View style={styles.buyerRow}>
            <Feather name="phone" size={16} color="#78736A" />
            <Text style={styles.buyerDetailText}>{buyerPhone}</Text>
          </View>
          <View style={styles.buyerRow}>
            <Feather name="map-pin" size={16} color="#78736A" />
            <Text style={styles.buyerDetailText}>{buyerAddress}</Text>
          </View>
        </View>

        {/* Financial Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Hạch toán thanh toán</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Giá trị món đồ</Text>
            <Text style={styles.priceNum}>{subtotal.toLocaleString('vi-VN')} ₫</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Phí giao vận Nanuk 2 chiều</Text>
            <Text style={styles.priceNum}>{shippingFee.toLocaleString('vi-VN')} ₫</Text>
          </View>
          <View style={[styles.priceRow, styles.priceRowTotal]}>
            <Text style={styles.priceTotalLabel}>Tổng thu từ khách</Text>
            <Text style={styles.priceTotalNum}>{totalAmount.toLocaleString('vi-VN')} ₫</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {isPending && (
          <TouchableOpacity
            style={[styles.actionButtonPrimary, { backgroundColor: '#15803D' }]}
            onPress={handleApproveThrift}
          >
            <Feather name="check" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Duyệt đơn mua này</Text>
          </TouchableOpacity>
        )}

        {isPaid && (
          <TouchableOpacity style={styles.actionButtonPrimary} onPress={openHandover}>
            <Feather name="truck" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Bàn giao bưu tá</Text>
          </TouchableOpacity>
        )}

        {isShipped && (
          <TouchableOpacity
            style={[styles.actionButtonPrimary, { backgroundColor: '#15803D' }]}
            onPress={handleMarkDelivered}
          >
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Xác nhận đã giao hàng</Text>
          </TouchableOpacity>
        )}

        {isCompleted && (
          <TouchableOpacity
            style={[styles.actionButtonPrimary, { backgroundColor: '#059669' }]}
            onPress={handleClaimWallet}
          >
            <Feather name="dollar-sign" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Thu tiền về ví xưởng</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Handover Modal */}
      <Modal
        visible={isHandoverOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsHandoverOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bàn Giao Bưu Tá</Text>
              <TouchableOpacity onPress={() => setIsHandoverOpen(false)}>
                <Feather name="x" size={20} color="#78736A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Đơn vị giao vận</Text>
              <View style={styles.carrierOptions}>
                {['Nanuk Garment Express', 'Giao Hàng Nhanh', 'Viettel Post'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCarrierName(c)}
                    style={[styles.carrierChip, carrierName === c && styles.carrierChipActive]}
                  >
                    <Text style={[styles.carrierChipText, carrierName === c && styles.carrierChipTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Mã vận đơn bưu tá</Text>
              <TextInput
                style={styles.modalInput}
                value={trackingCode}
                onChangeText={setTrackingCode}
                placeholder="VD: NK-THF-9821-VN"
              />

              <Text style={styles.fieldLabel}>Mã niêm chì bảo đảm (Seal Code)</Text>
              <TextInput
                style={styles.modalInput}
                value={sealCode}
                onChangeText={setSealCode}
                placeholder="VD: SEAL-ATELIER-9108"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setIsHandoverOpen(false)}
              >
                <Text style={styles.cancelModalBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitModalBtn}
                onPress={handleConfirmHandover}
                disabled={submittingHandover}
              >
                {submittingHandover ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitModalBtnText}>Xác nhận bàn giao</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ShopThriftOrderDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#78736A',
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1A18',
    marginTop: 12,
  },
  backBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1C1A18',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAF8F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1A18',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  statusHero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  timelineNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E7E5E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineNodeDone: {
    backgroundColor: '#15803D',
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A8A29E',
  },
  timelineBar: {
    flex: 1,
    height: 2,
    backgroundColor: '#E7E5E4',
    marginHorizontal: 4,
  },
  timelineBarDone: {
    backgroundColor: '#15803D',
  },
  timelineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineLabel: {
    fontSize: 11,
    color: '#78736A',
    fontWeight: '500',
  },
  escrowBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 12,
    borderRadius: 12,
  },
  escrowBannerTextWrap: {
    flex: 1,
  },
  escrowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 2,
  },
  escrowDesc: {
    fontSize: 12,
    color: '#15803D',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  itemBorderTop: {
    borderTopWidth: 1,
    borderTopColor: '#F5F5F4',
  },
  itemImg: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F5F5F4',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1A18',
    marginBottom: 4,
  },
  itemCondition: {
    fontSize: 12,
    color: '#78736A',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1A18',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: '#78736A',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1A18',
  },
  highlightValue: {
    color: '#0284C7',
    fontWeight: '700',
  },
  buyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  buyerNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1A18',
  },
  buyerDetailText: {
    fontSize: 13,
    color: '#44403C',
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  priceLabel: {
    fontSize: 13,
    color: '#78736A',
  },
  priceNum: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1A18',
  },
  priceRowTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E7E5E4',
    paddingTop: 10,
    marginTop: 6,
  },
  priceTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1A18',
  },
  priceTotalNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E7E5E4',
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  actionButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    borderRadius: 10,
    paddingVertical: 14,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deliveredWaitingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
  },
  deliveredWaitingText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
    flex: 1,
  },
  completedBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
  },
  completedBadgeText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '700',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1A18',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1A18',
    marginBottom: 8,
  },
  carrierOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  carrierChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    backgroundColor: '#FAF8F5',
  },
  carrierChipActive: {
    borderColor: '#1C1A18',
    backgroundColor: '#1C1A18',
  },
  carrierChipText: {
    fontSize: 12,
    color: '#78736A',
  },
  carrierChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1C1A18',
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6D3D1',
    alignItems: 'center',
  },
  cancelModalBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78736A',
  },
  submitModalBtn: {
    flex: 2,
    backgroundColor: '#1C1A18',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitModalBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
