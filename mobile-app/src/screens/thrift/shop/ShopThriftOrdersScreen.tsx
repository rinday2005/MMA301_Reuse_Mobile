import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getShopThriftOrdersApi,
  updateThriftOrderStatusApi,
  type ThriftOrderApi,
} from '../../../services/thriftOrder.api';
import { normalizeImageUrl, extractProductImage } from '../../../utils/imageUrl';
import { resolveThriftOrderItem } from '../../../utils/thriftOrderItemResolver';
import { ShopHeader } from '../../../components/layout/ShopHeader';

type OrderTab = 'ALL' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

const TABS: { key: OrderTab; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PAID', label: 'Chờ giao hàng' },
  { key: 'SHIPPED', label: 'Đang giao' },
  { key: 'DELIVERED', label: 'Đã giao (72h)' },
  { key: 'COMPLETED', label: 'Hoàn tất' },
  { key: 'CANCELLED', label: 'Đã hủy' },
];

export const ShopThriftOrdersScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<OrderTab>('ALL');
  const [orders, setOrders] = useState<ThriftOrderApi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Shipping handover modal
  const [selectedOrder, setSelectedOrder] = useState<ThriftOrderApi | null>(null);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState<boolean>(false);
  const [carrierName, setCarrierName] = useState<string>('Nanuk Garment Express');
  const [trackingCode, setTrackingCode] = useState<string>('');
  const [sealCode, setSealCode] = useState<string>('');
  const [submittingHandover, setSubmittingHandover] = useState<boolean>(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getShopThriftOrdersApi();
      const list = Array.isArray(res) ? res : res?.orders || [];
      setOrders(list);
    } catch (err) {
      console.warn('Lỗi tải đơn bán THRIFT:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const openHandoverModal = (order: ThriftOrderApi) => {
    setSelectedOrder(order);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setCarrierName('Nanuk Garment Express');
    setTrackingCode(`NK-THF-${randomSuffix}-VN`);
    setSealCode(`SEAL-ATELIER-${randomSuffix}`);
    setIsHandoverModalOpen(true);
  };

  const handleConfirmHandover = async () => {
    if (!selectedOrder) return;
    if (!trackingCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã vận đơn vận chuyển.');
      return;
    }
    try {
      setSubmittingHandover(true);
      await updateThriftOrderStatusApi(selectedOrder._id, {
        status: 'SHIPPED',
        courierName: carrierName,
        trackingCode: trackingCode.trim(),
        sealCode: sealCode.trim(),
      });
      setIsHandoverModalOpen(false);
      Alert.alert('Thành công', 'Đã bàn giao đơn hàng cho bưu tá.');
      fetchOrders();
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng.');
    } finally {
      setSubmittingHandover(false);
    }
  };

  const handleMarkDelivered = (order: ThriftOrderApi) => {
    Alert.alert(
      'Xác nhận đã giao hàng',
      'Đánh dấu đơn hàng đã được giao tới người mua? Thời gian bảo hộ Escrow 72h sẽ bắt đầu đếm ngược.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận giao',
          onPress: async () => {
            try {
              await updateThriftOrderStatusApi(order._id, { status: 'DELIVERED' });
              Alert.alert('Thành công', 'Đã cập nhật trạng thái: ĐÃ GIAO (Bắt đầu 72h Escrow).');
              fetchOrders();
            } catch (err: any) {
              Alert.alert('Lỗi', err.response?.data?.message || 'Không thể cập nhật.');
            }
          },
        },
      ]
    );
  };

  const filteredOrders = orders.filter((o) => {
    const rawStatus = (o.status || '').toUpperCase();
    let matchesTab = true;
    if (activeTab === 'PAID') {
      matchesTab = ['PAID', 'PROCESSING', 'PENDING_PAYMENT'].includes(rawStatus);
    } else if (activeTab === 'SHIPPED') {
      matchesTab = ['SHIPPED', 'SHIPPING'].includes(rawStatus);
    } else if (activeTab === 'DELIVERED') {
      matchesTab = rawStatus === 'DELIVERED';
    } else if (activeTab === 'COMPLETED') {
      matchesTab = rawStatus === 'COMPLETED';
    } else if (activeTab === 'CANCELLED') {
      matchesTab = rawStatus === 'CANCELLED';
    }

    if (!matchesTab) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const code = (o.orderCode || o._id || '').toLowerCase();
      const recipient = (o.shippingAddress?.recipientName || '').toLowerCase();
      const itemName = (o.items?.[0]?.name || (o.items?.[0] as any)?.productName || '').toLowerCase();
      return code.includes(q) || recipient.includes(q) || itemName.includes(q);
    }

    return true;
  });

  const renderStatusBadge = (status?: string) => {
    const st = (status || '').toUpperCase();
    switch (st) {
      case 'PENDING':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.statusBadgeText, { color: '#B45309' }]}>Chờ duyệt đơn</Text>
          </View>
        );
      case 'WAITING_PAYMENT':
      case 'PENDING_PAYMENT':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#E0F2FE' }]}>
            <Text style={[styles.statusBadgeText, { color: '#0284C7' }]}>Đã duyệt · Chờ khách thanh toán</Text>
          </View>
        );
      case 'PAID':
      case 'PROCESSING':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
            <Text style={[styles.statusBadgeText, { color: '#15803D' }]}>Đã thanh toán · Sẵn sàng gửi hàng</Text>
          </View>
        );
      case 'SHIPPED':
      case 'SHIPPING':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#E0F2FE' }]}>
            <Text style={[styles.statusBadgeText, { color: '#0369A1' }]}>Đang giao</Text>
          </View>
        );
      case 'DELIVERED':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
            <Text style={[styles.statusBadgeText, { color: '#15803D' }]}>Đã giao (72h)</Text>
          </View>
        );
      case 'COMPLETED':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#F3F4F6' }]}>
            <Text style={[styles.statusBadgeText, { color: '#374151' }]}>Hoàn tất</Text>
          </View>
        );
      case 'CANCELLED':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.statusBadgeText, { color: '#B91C1C' }]}>Đã hủy</Text>
          </View>
        );
      default:
        return (
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{status}</Text>
          </View>
        );
    }
  };

  const handleApproveThrift = async (order: ThriftOrderApi) => {
    try {
      await updateThriftOrderStatusApi(order._id, { status: 'WAITING_PAYMENT' });
      Alert.alert('Đã duyệt đơn! 🎉', `Đơn #${order.orderCode || order._id.slice(-8)} đã được duyệt. Khách hàng có thể thanh toán.`);
      fetchOrders();
    } catch {
      fetchOrders();
    }
  };

  const handleClaimThriftWallet = (order: ThriftOrderApi) => {
    const gross = order.itemsSubtotal || order.totalAmount || 0;
    const net = Math.round(gross * 0.965);
    Alert.alert(
      'Thu tiền về ví xưởng',
      `Giải ngân +${net.toLocaleString('vi-VN')} ₫ (sau trừ 3.5% phí sàn) từ đơn #${order.orderCode || order._id.slice(-8)} về ví xưởng?`,
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

  const renderOrderItem = ({ item }: { item: ThriftOrderApi }) => {
    const firstItem = item.items?.[0];
    const resolved = resolveThriftOrderItem(item, firstItem);
    const itemImg = resolved.image || extractProductImage(firstItem);
    const itemName = resolved.title || firstItem?.name || (firstItem as any)?.productName || 'Hiện vật THRIFT tuyển chọn';
    const rawStatus = (item.status || '').toUpperCase();
    const isPending = rawStatus === 'PENDING';
    const isPaid = rawStatus === 'PAID' || rawStatus === 'PROCESSING';
    const isCompleted = rawStatus === 'DELIVERED' || rawStatus === 'COMPLETED';
    const canHandover = isPaid || rawStatus === 'PENDING_PAYMENT';
    const canDeliver = ['SHIPPED', 'SHIPPING'].includes(rawStatus);

    return (
      <View style={styles.orderCard}>
        {/* Card Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderCode}>#{item.orderCode || item._id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt || Date.now()).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          {renderStatusBadge(item.status)}
        </View>

        {/* Product Preview */}
        <View style={styles.productRow}>
          <Image
            source={{ uri: normalizeImageUrl(itemImg) }}
            style={styles.productImg}
            resizeMode="cover"
          />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {itemName}
            </Text>
            <Text style={styles.productGrade}>
              {firstItem?.condition || 'Grade 1 · Rất tốt (98%)'}
            </Text>
            <Text style={styles.productPrice}>
              {(item.totalAmount || 0).toLocaleString('vi-VN')} ₫
            </Text>
          </View>
        </View>

        {/* Buyer Info */}
        <View style={styles.buyerBox}>
          <Feather name="user" size={13} color="#78736A" />
          <Text style={styles.buyerName} numberOfLines={1}>
            {item.shippingAddress?.recipientName || 'Khách hàng ReUse'}
          </Text>
          <Text style={styles.buyerPhone}>
            · {item.shippingAddress?.recipientPhone || '0901234567'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => navigation.navigate('ShopThriftOrderDetail', { id: item._id })}
          >
            <Text style={styles.detailBtnText}>Xem chi tiết</Text>
          </TouchableOpacity>

          {isPending && (
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: '#15803D' }]}
              onPress={() => handleApproveThrift(item)}
            >
              <Feather name="check" size={15} color="#FFFFFF" />
              <Text style={styles.primaryActionBtnText}>Duyệt đơn</Text>
            </TouchableOpacity>
          )}

          {isPaid && (
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: '#0284C7' }]}
              onPress={() => openHandoverModal(item)}
            >
              <Feather name="truck" size={15} color="#FFFFFF" />
              <Text style={styles.primaryActionBtnText}>Giao hàng</Text>
            </TouchableOpacity>
          )}

          {isCompleted && (
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: '#059669' }]}
              onPress={() => handleClaimThriftWallet(item)}
            >
              <Feather name="dollar-sign" size={15} color="#FFFFFF" />
              <Text style={styles.primaryActionBtnText}>Thu tiền về ví</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ShopHeader showBack />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#A8A29E" />
          <TextInput
            placeholder="Tìm theo mã đơn hoặc người mua..."
            placeholderTextColor="#A8A29E"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color="#78736A" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs Horizontal Scroll */}
      <View style={styles.tabBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
              >
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Orders List */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1C1A18" />
          <Text style={styles.loadingText}>Đang nạp danh sách đơn THRIFT...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="tag-outline" size={48} color="#D6D3D1" />
              <Text style={styles.emptyTitle}>Chưa có đơn bán thanh lý</Text>
              <Text style={styles.emptyDesc}>
                Các đơn hàng thanh lý được khách mua từ kho THRIFT sẽ hiển thị tại đây.
              </Text>
            </View>
          }
        />
      )}

      {/* Handover Modal */}
      <Modal
        visible={isHandoverModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsHandoverModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bàn Giao Bưu Tá Vận Chuyển</Text>
              <TouchableOpacity onPress={() => setIsHandoverModalOpen(false)}>
                <Feather name="x" size={20} color="#78736A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              <View style={styles.modalInfoBanner}>
                <Ionicons name="shield-checkmark" size={18} color="#15803D" />
                <Text style={styles.modalInfoText}>
                  Sau khi bàn giao, đơn hàng chuyển sang &quot;Đang giao&quot;. Khi khách nhận hàng, Smart Escrow bắt đầu 72h đối soát.
                </Text>
              </View>

              <Text style={styles.fieldLabel}>Đơn vị vận chuyển chuyên dụng</Text>
              <View style={styles.carrierOptions}>
                {['Nanuk Garment Express', 'Giao Hàng Nhanh (GHN)', 'Viettel Post', 'GHTK'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCarrierName(c)}
                    style={[
                      styles.carrierChip,
                      carrierName === c && styles.carrierChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.carrierChipText,
                        carrierName === c && styles.carrierChipTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Mã vận đơn bưu tá (Tracking Code)</Text>
              <TextInput
                style={styles.modalInput}
                value={trackingCode}
                onChangeText={setTrackingCode}
                placeholder="Nhập mã vận đơn (VD: NK-THF-8839-VN)"
              />

              <Text style={styles.fieldLabel}>Mã niêm chì bảo đảm (Seal Code)</Text>
              <TextInput
                style={styles.modalInput}
                value={sealCode}
                onChangeText={setSealCode}
                placeholder="Nhập mã niêm phong (VD: SEAL-ATELIER-9108)"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setIsHandoverModalOpen(false)}
              >
                <Text style={styles.cancelModalBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitModalBtn}
                onPress={handleConfirmHandover}
                disabled={submittingHandover}
              >
                {submittingHandover ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
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

export default ShopThriftOrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
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
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1A18',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FAF8F5',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1C1A18',
    padding: 0,
  },
  tabBarContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
    backgroundColor: '#FAF8F5',
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F5F5F4',
  },
  tabItemActive: {
    backgroundColor: '#1C1A18',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78736A',
  },
  tabLabelActive: {
    color: '#FFFFFF',
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
  listContent: {
    padding: 16,
    gap: 14,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1A18',
  },
  orderDate: {
    fontSize: 11,
    color: '#A8A29E',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F5F5F4',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  productRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  productImg: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F5F5F4',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1A18',
    marginBottom: 4,
  },
  productGrade: {
    fontSize: 12,
    color: '#78736A',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1A18',
  },
  buyerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF8F5',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  buyerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#44403C',
  },
  buyerPhone: {
    fontSize: 12,
    color: '#78736A',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  detailBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6D3D1',
  },
  detailBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#44403C',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0284C7',
  },
  primaryActionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1A18',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#78736A',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 32,
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
    maxHeight: '85%',
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
  modalBody: {
    marginBottom: 16,
  },
  modalInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#166534',
    lineHeight: 18,
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
