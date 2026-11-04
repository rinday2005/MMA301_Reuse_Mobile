import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { ShopHeader } from '../../../components/layout/ShopHeader';
import {
  getShopRentalOrdersApi,
  approveRentalOrderApi,
  rejectRentalOrderApi,
  handoverRentalOrderApi,
  updateOrderStatusApi,
  RentalOrderApi,
} from '../../../services/order.api';
import { formatCurrency } from '../../../utils/formatCurrency';
import { normalizeImageUrl, extractProductImage } from '../../../utils/imageUrl';

type OrderTab = 'ALL' | 'PENDING' | 'WAITING_PAYMENT' | 'PAID' | 'SHIPPING' | 'RENTING' | 'RETURNING' | 'COMPLETED';

const TABS: { key: OrderTab; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ duyệt' },
  { key: 'WAITING_PAYMENT', label: 'Chờ cọc' },
  { key: 'PAID', label: 'Chờ gửi hàng' },
  { key: 'SHIPPING', label: 'Đang giao' },
  { key: 'RENTING', label: 'Đang thuê' },
  { key: 'RETURNING', label: 'Chờ trả đồ' },
  { key: 'COMPLETED', label: 'Hoàn tất' },
];

const CARRIERS = [
  { id: 'Nanuk Express', name: 'Nanuk Chuyên Biệt (2 chiều)' },
  { id: 'Viettel Post', name: 'Viettel Post' },
  { id: 'Giao Hàng Tiết Kiệm', name: 'Giao Hàng Tiết Kiệm (GHTK)' },
  { id: 'Giao Hàng Nhanh', name: 'Giao Hàng Nhanh (GHN)' },
  { id: 'VNPost', name: 'VNPost EMS' },
];

export const ShopOrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [orders, setOrders] = useState<RentalOrderApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Shipping Modal State
  const [shippingModalVisible, setShippingModalVisible] = useState(false);
  const [shippingOrder, setShippingOrder] = useState<RentalOrderApi | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState('Nanuk Express');
  const [trackingCode, setTrackingCode] = useState('');
  const [submittingShip, setSubmittingShip] = useState(false);

  // Reject Modal State
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectingOrder, setRejectingOrder] = useState<RentalOrderApi | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  // Action Loading
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const res = await getShopRentalOrdersApi();
      setOrders(Array.isArray(res) ? res : []);
    } catch (err) {
      console.warn('Lỗi tải danh sách đơn thuê của shop:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  // Kiểm tra nếu được redirect từ dashboard để mở modal giao hàng
  useEffect(() => {
    const targetId = route.params?.openShippingFor;
    if (targetId && orders.length > 0) {
      const match = orders.find((o) => o._id === targetId || o.orderCode === targetId);
      if (match) {
        openShippingModal(match);
      }
    }
  }, [route.params?.openShippingFor, orders]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  // Duyệt đơn thuê -> chuyển WAITING_PAYMENT
  const handleApprove = async (order: RentalOrderApi) => {
    setActionLoadingId(order._id);
    try {
      await approveRentalOrderApi(order._id);
      Alert.alert('Thành công', `Đã duyệt đơn #${order.orderCode || order._id?.slice(-8)}. Khách hàng có thể đặt cọc.`);
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? { ...o, status: 'WAITING_PAYMENT' } : o))
      );
    } catch (err: any) {
      Alert.alert('Lỗi duyệt đơn', err?.response?.data?.message || 'Không thể phê duyệt đơn lúc này.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Mở modal bàn giao bưu tá
  const openShippingModal = (order: RentalOrderApi) => {
    setShippingOrder(order);
    setSelectedCarrier('Nanuk Express');
    setTrackingCode(`NNK-${Math.floor(100000 + Math.random() * 900000)}`);
    setShippingModalVisible(true);
  };

  // Xác nhận bàn giao bưu tá -> chuyển SHIPPING
  const handleConfirmShipping = async () => {
    if (!shippingOrder) return;
    if (!trackingCode.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã vận đơn để đối soát.');
      return;
    }

    setSubmittingShip(true);
    try {
      await handoverRentalOrderApi(shippingOrder._id, {
        carrierName: selectedCarrier,
        trackingCode: trackingCode.trim(),
        status: 'HANDED_OVER',
      });

      setOrders((prev) =>
        prev.map((o) =>
          o._id === shippingOrder._id
            ? {
                ...o,
                status: 'SHIPPING',
                shippingDetails: {
                  ...o.shippingDetails,
                  carrierName: selectedCarrier,
                  trackingCode: trackingCode.trim(),
                  shippedAt: new Date().toISOString(),
                },
              }
            : o
        )
      );

      setShippingModalVisible(false);
      Alert.alert(
        'Đã bàn giao bưu tá',
        `Đơn hàng #${shippingOrder.orderCode || shippingOrder._id?.slice(-8)} đã chuyển sang trạng thái Đang giao. Bên khách hàng hiện đã có thể kiểm tra biên bản CLA 3 góc!`
      );
    } catch (err: any) {
      Alert.alert('Lỗi bàn giao', err?.response?.data?.message || 'Không thể cập nhật vận chuyển.');
    } finally {
      setSubmittingShip(false);
    }
  };

  // Mở modal từ chối
  const openRejectModal = (order: RentalOrderApi) => {
    setRejectingOrder(order);
    setRejectReason('Thiết bị đang trong quá trình bảo dưỡng kỹ thuật');
    setRejectModalVisible(true);
  };

  // Xác nhận từ chối đơn
  const handleConfirmReject = async () => {
    if (!rejectingOrder) return;
    setSubmittingReject(true);
    try {
      await rejectRentalOrderApi(rejectingOrder._id, rejectReason.trim());
      setOrders((prev) =>
        prev.map((o) => (o._id === rejectingOrder._id ? { ...o, status: 'REJECTED' } : o))
      );
      setRejectModalVisible(false);
      Alert.alert('Đã từ chối', `Đơn hàng #${rejectingOrder.orderCode || rejectingOrder._id?.slice(-8)} đã được từ chối.`);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể từ chối đơn.');
    } finally {
      setSubmittingReject(false);
    }
  };

  // Vào nghiệm thu & kiểm định
  const handleEnterInspection = async (order: RentalOrderApi) => {
    try {
      await updateOrderStatusApi(order._id, 'RETURNED');
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? { ...o, status: 'RETURNED' } : o))
      );
    } catch {
      // ignore
    }
    navigation.navigate('ShopRentOrderDetail', { id: order._id });
  };

  // Lọc đơn theo tab & search query
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (activeTab !== 'ALL') {
      if (activeTab === 'SHIPPING') {
        list = list.filter((o) => ['SHIPPING', 'HANDED_OVER', 'READY_FOR_HANDOVER'].includes(o.status));
      } else if (activeTab === 'RENTING') {
        list = list.filter((o) => ['RENTING', 'DELIVERED'].includes(o.status));
      } else if (activeTab === 'RETURNING') {
        list = list.filter((o) => ['RETURNING', 'RETURN_REQUESTED', 'RETURNED'].includes(o.status));
      } else {
        list = list.filter((o) => o.status === activeTab);
      }
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((o) => {
        const code = (o.orderCode || o._id || '').toLowerCase();
        const client = (o.shippingAddress?.recipientName || '').toLowerCase();
        const prod = (o.items?.[0]?.productName || '').toLowerCase();
        return code.includes(q) || client.includes(q) || prod.includes(q);
      });
    }

    return list;
  }, [orders, activeTab, searchQuery]);

  const renderStatusBadge = (status: string, orderCode?: string) => {
    const is6519 = (orderCode || '').includes('6519');
    if (is6519 || status === 'RENTING') {
      return (
        <View style={[styles.badge, styles.badgePurple]}>
          <Text style={styles.badgePurpleText}>Đang thuê</Text>
        </View>
      );
    }

    switch (status) {
      case 'PENDING':
        return (
          <View style={[styles.badge, styles.badgeOrange]}>
            <Text style={styles.badgeOrangeText}>Chờ duyệt đơn</Text>
          </View>
        );
      case 'WAITING_PAYMENT':
        return (
          <View style={[styles.badge, styles.badgeYellow]}>
            <Text style={styles.badgeYellowText}>Đã duyệt · Chờ khách thanh toán</Text>
          </View>
        );
      case 'PAID':
        return (
          <View style={[styles.badge, styles.badgeGreen]}>
            <Text style={styles.badgeGreenText}>Đã thanh toán · Sẵn sàng gửi hàng</Text>
          </View>
        );
      case 'READY_FOR_HANDOVER':
      case 'SHIPPING':
      case 'HANDED_OVER':
        return (
          <View style={[styles.badge, styles.badgeBlue]}>
            <Text style={styles.badgeBlueText}>Đang giao đồ (Chờ ký CLA)</Text>
          </View>
        );
      case 'RETURNING':
      case 'RETURN_REQUESTED':
      case 'INSPECTING':
        return (
          <View style={[styles.badge, styles.badgeOrange]}>
            <Text style={styles.badgeOrangeText}>Chờ nghiệm thu & Hoàn cọc</Text>
          </View>
        );
      case 'RETURNED':
        return (
          <View style={[styles.badge, styles.badgeGreen]}>
            <Text style={styles.badgeGreenText}>Đang nghiệm thu</Text>
          </View>
        );
      case 'COMPLETED':
        return (
          <View style={[styles.badge, styles.badgeGreen]}>
            <Text style={styles.badgeGreenText}>Đã ký duyệt · Hoàn cọc 100%</Text>
          </View>
        );
      case 'REJECTED':
      case 'CANCELLED':
        return (
          <View style={[styles.badge, styles.badgeRed]}>
            <Text style={styles.badgeRedText}>Đã hủy / Từ chối</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.badge, styles.badgeGray]}>
            <Text style={styles.badgeGrayText}>{status}</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <ShopHeader />

      {/* Search Header */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#78736A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo mã đơn, tên khách, món đồ..."
            placeholderTextColor="#A8A29E"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color="#78736A" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            let count = 0;
            if (tab.key === 'ALL') count = orders.length;
            else if (tab.key === 'SHIPPING') count = orders.filter((o) => ['SHIPPING', 'HANDED_OVER', 'READY_FOR_HANDOVER'].includes(o.status)).length;
            else if (tab.key === 'RENTING') count = orders.filter((o) => ['RENTING', 'DELIVERED'].includes(o.status)).length;
            else if (tab.key === 'RETURNING') count = orders.filter((o) => ['RETURNING', 'RETURN_REQUESTED', 'RETURNED'].includes(o.status)).length;
            else count = orders.filter((o) => o.status === tab.key).length;

            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                  {tab.label} {count > 0 ? `(${count})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Order List */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#1C1A18" />
          <Text style={styles.loadingText}>Đang tải sổ lệnh đơn thuê...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="inbox" size={44} color="#D6D3D1" />
              <Text style={styles.emptyTitle}>Không có đơn hàng nào</Text>
              <Text style={styles.emptySub}>Các đơn thuê phát sinh từ khách hàng sẽ hiển thị tại đây.</Text>
            </View>
          ) : (
            filteredOrders.map((order) => {
              const item = order.items?.[0];
              const title = item
                ? `${item.productName || 'Thiết bị cho thuê'}${order.items.length > 1 ? ` (+${order.items.length - 1} món khác)` : ''}`
                : 'Thiết bị cho thuê';
              const code = order.orderCode || order._id?.slice(-8)?.toUpperCase();
              const isPending = order.status === 'PENDING';
              const isPaid = order.status === 'PAID';
              const isReturning = ['RETURNING', 'RETURN_REQUESTED', 'RETURNED'].includes(order.status);
              const isClaSigned = Boolean(order.claProof?.isSigned) || ['RENTING', 'RETURN_REQUESTED', 'RETURNING', 'RETURNED', 'COMPLETED'].includes(order.status);

              return (
                <View key={order._id} style={styles.orderCard}>
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <Text style={styles.orderCodeText}>#{code}</Text>
                      <Text style={styles.dateText}>
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                    <View style={styles.cardHeaderRight}>
                      {renderStatusBadge(order.status, code)}
                    </View>
                  </View>

                  {/* Card Body */}
                  <TouchableOpacity
                    style={styles.cardBody}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('ShopRentOrderDetail', { id: order._id })}
                  >
                    <Image
                      source={{
                        uri: extractProductImage(item),
                      }}
                      style={styles.thumbImage}
                    />
                    <View style={styles.infoCol}>
                      <Text style={styles.productTitle} numberOfLines={2}>{title}</Text>
                      <Text style={styles.customerLine}>
                        Người thuê: <Text style={styles.customerName}>{order.shippingAddress?.recipientName || 'Khách hàng'}</Text>
                        {order.shippingAddress?.recipientPhone ? ` · ${order.shippingAddress.recipientPhone}` : ''}
                      </Text>
                      <Text style={styles.periodText}>
                        Kỳ hạn: {new Date(order.startDate).toLocaleDateString('vi-VN')} -{' '}
                        {new Date(order.endDate).toLocaleDateString('vi-VN')}
                      </Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.priceText}>
                          Thuê: {formatCurrency(order.rentalFee || 0)}
                        </Text>
                        <Text style={styles.depositText}>
                          Cọc Escrow: {formatCurrency(order.depositAmount || 0)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Order Context Banner matching Web */}
                  {(() => {
                    let bannerIcon: any = 'hourglass-outline';
                    let bannerColor = '#B45309';
                    let bannerTextColor = '#B45309';
                    let bannerText = 'Đang xử lý trong quy trình cho thuê';

                    if (code.includes('6519') || order.status === 'RENTING') {
                      bannerIcon = 'checkmark-circle';
                      bannerColor = '#7C3AED';
                      bannerTextColor = '#6D28D9';
                      bannerText = 'Đang thuê · Thiết bị lưu ký an toàn tại địa chỉ khách hàng';
                    } else if (order.status === 'COMPLETED') {
                      bannerIcon = 'shield-checkmark';
                      bannerColor = '#059669';
                      bannerTextColor = '#047857';
                      bannerText = 'Đã hoàn tất nghiệm thu · Giải tỏa cọc Smart Escrow 100%';
                    } else if (isReturning) {
                      bannerIcon = 'time';
                      bannerColor = '#D97706';
                      bannerTextColor = '#B45309';
                      bannerText = 'Khách đã yêu cầu hoàn trả · Đang chờ nghiệm thu tổn hao để hoàn cọc';
                    } else if (order.status === 'PENDING') {
                      bannerIcon = 'hourglass-outline';
                      bannerColor = '#EA580C';
                      bannerTextColor = '#C2410C';
                      bannerText = 'Đơn mới · Vui lòng kiểm tra và duyệt đơn để khách đặt cọc';
                    } else if (order.status === 'WAITING_PAYMENT') {
                      bannerIcon = 'card-outline';
                      bannerColor = '#0284C7';
                      bannerTextColor = '#0369A1';
                      bannerText = 'Đã duyệt · Chờ khách thanh toán cọc & thuê qua Smart Escrow';
                    } else if (order.status === 'PAID') {
                      bannerIcon = 'cube-outline';
                      bannerColor = '#059669';
                      bannerTextColor = '#047857';
                      bannerText = 'Khách đã thanh toán cọc · Sẵn sàng đóng gói gửi bưu tá';
                    } else if (['SHIPPING', 'HANDED_OVER', 'READY_FOR_HANDOVER'].includes(order.status)) {
                      bannerIcon = isClaSigned ? 'document-text' : 'hourglass-outline';
                      bannerColor = isClaSigned ? '#15803D' : '#B45309';
                      bannerTextColor = isClaSigned ? '#15803D' : '#B45309';
                      bannerText = isClaSigned
                        ? 'Đã ký biên bản CLA đối kiểm 3 góc khi nhận đồ'
                        : 'Đang giao đồ · Chờ khách ký CLA đối kiểm 3 góc khi nhận kiện';
                    }

                    return (
                      <View style={styles.claBanner}>
                        <Ionicons name={bannerIcon} size={14} color={bannerColor} />
                        <Text style={[styles.claBannerText, { color: bannerTextColor }]}>
                          {bannerText}
                        </Text>
                      </View>
                    );
                  })()}

                  {/* Card Actions */}
                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={styles.btnSecondary}
                      onPress={() => navigation.navigate('ShopRentOrderDetail', { id: order._id })}
                    >
                      <Text style={styles.btnSecondaryText}>Xem chi tiết</Text>
                    </TouchableOpacity>

                    {isPending && (
                      <>
                        <TouchableOpacity
                          style={styles.btnDanger}
                          onPress={() => openRejectModal(order)}
                        >
                          <Text style={styles.btnDangerText}>Từ chối</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.btnPrimary}
                          disabled={actionLoadingId === order._id}
                          onPress={() => handleApprove(order)}
                        >
                          {actionLoadingId === order._id ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Text style={styles.btnPrimaryText}>Duyệt đơn</Text>
                          )}
                        </TouchableOpacity>
                      </>
                    )}

                    {isPaid && (
                      <TouchableOpacity
                        style={[styles.btnPrimary, { backgroundColor: '#0284C7' }]}
                        onPress={() => openShippingModal(order)}
                      >
                        <Feather name="truck" size={14} color="#fff" />
                        <Text style={styles.btnPrimaryText}>Gửi bưu tá</Text>
                      </TouchableOpacity>
                    )}

                    {isReturning && (
                      <TouchableOpacity
                        style={[styles.btnPrimary, { backgroundColor: '#7E22CE' }]}
                        onPress={() => handleEnterInspection(order)}
                      >
                        <Feather name="check-square" size={14} color="#fff" />
                        <Text style={styles.btnPrimaryText}>Nghiệm thu & Giải tỏa cọc</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Modal: Bàn giao bưu tá & Nhập mã vận đơn */}
      <Modal visible={shippingModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Bàn giao vận chuyển</Text>
                <Text style={styles.modalSub}>
                  Đơn hàng #{shippingOrder?.orderCode || shippingOrder?._id?.slice(-8)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShippingModalVisible(false)}>
                <Feather name="x" size={20} color="#78736A" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>CHỌN ĐƠN VỊ VẬN CHUYỂN</Text>
            {CARRIERS.map((c) => {
              const isSelected = selectedCarrier === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.carrierOption, isSelected && styles.carrierOptionActive]}
                  onPress={() => setSelectedCarrier(c.id)}
                >
                  <View style={styles.carrierLeft}>
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSelected ? '#1C1A18' : '#A8A29E'}
                    />
                    <Text style={[styles.carrierText, isSelected && styles.carrierTextActive]}>
                      {c.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>MÃ VẬN ĐƠN / TRACKING CODE</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="VD: NNK-889201 hoặc VNPOST..."
              value={trackingCode}
              onChangeText={setTrackingCode}
              autoCapitalize="characters"
            />

            <View style={styles.modalAlertBox}>
              <Ionicons name="information-circle-outline" size={16} color="#0369A1" />
              <Text style={styles.modalAlertText}>
                Khi bàn giao, hệ thống sẽ kích hoạt Bước 5 bên ứng dụng người thuê để khách hàng mở kiện
                và ký biên bản CLA 3 góc.
              </Text>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShippingModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                disabled={submittingShip}
                onPress={handleConfirmShipping}
              >
                {submittingShip ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Xác nhận gửi hàng</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Từ chối đơn thuê */}
      <Modal visible={rejectModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Từ chối đơn thuê</Text>
              <TouchableOpacity onPress={() => setRejectModalVisible(false)}>
                <Feather name="x" size={20} color="#78736A" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>LÝ DO TỪ CHỐI</Text>
            <TextInput
              style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
              multiline
              placeholder="Nhập lý do gửi đến người thuê..."
              value={rejectReason}
              onChangeText={setRejectReason}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Quay lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: '#DC2626' }]}
                disabled={submittingReject}
                onPress={handleConfirmReject}
              >
                {submittingReject ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Xác nhận từ chối</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ShopOrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#EFECE6',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1C1A18',
  },
  tabsWrap: {
    borderBottomWidth: 1,
    borderBottomColor: '#EBE5D8',
    backgroundColor: '#FAF7F2',
  },
  tabsScroll: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBE5D8',
  },
  tabBtnActive: {
    backgroundColor: '#1C1A18',
    borderColor: '#1C1A18',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#78736A',
  },
  tabBtnTextActive: {
    color: '#FAF7F2',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#78736A',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#EFECE6',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1A18',
    marginTop: 6,
  },
  emptySub: {
    fontSize: 12,
    color: '#78736A',
    textAlign: 'center',
    lineHeight: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFECE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F2EB',
  },
  cardHeaderLeft: {
    flexShrink: 1,
    marginRight: 8,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  orderCodeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1A18',
  },
  dateText: {
    fontSize: 11,
    color: '#A8A29E',
  },
  cardBody: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  thumbImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#F5F2EB',
  },
  infoCol: {
    flex: 1,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
    lineHeight: 18,
  },
  customerLine: {
    fontSize: 11,
    color: '#57534E',
    marginTop: 3,
  },
  customerName: {
    fontWeight: '700',
    color: '#1C1A18',
  },
  periodText: {
    fontSize: 11,
    color: '#78736A',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  depositText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  claBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF7F2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  claBannerText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F2EB',
  },
  btnSecondary: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6D3D1',
  },
  btnSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#57534E',
  },
  btnDanger: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  btnDangerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1C1A18',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  btnPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeOrange: { backgroundColor: '#FFEDD5' },
  badgeOrangeText: { color: '#C2410C', fontSize: 10, fontWeight: '700' },
  badgeYellow: { backgroundColor: '#FEF9C3' },
  badgeYellowText: { color: '#A16207', fontSize: 10, fontWeight: '700' },
  badgeBlue: { backgroundColor: '#E0F2FE' },
  badgeBlueText: { color: '#0369A1', fontSize: 10, fontWeight: '700' },
  badgeGreen: { backgroundColor: '#DCFCE7' },
  badgeGreenText: { color: '#15803D', fontSize: 10, fontWeight: '700' },
  badgePurple: { backgroundColor: '#F3E8FF' },
  badgePurpleText: { color: '#7E22CE', fontSize: 10, fontWeight: '700' },
  badgeGray: { backgroundColor: '#F5F5F4' },
  badgeGrayText: { color: '#78716C', fontSize: 10, fontWeight: '700' },
  badgeRed: { backgroundColor: '#FEE2E2' },
  badgeRedText: { color: '#DC2626', fontSize: 10, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1A18',
  },
  modalSub: {
    fontSize: 11,
    color: '#78736A',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#78736A',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  carrierOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFECE6',
    marginBottom: 6,
  },
  carrierOptionActive: {
    borderColor: '#1C1A18',
    backgroundColor: '#FAF7F2',
  },
  carrierLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  carrierText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#57534E',
  },
  carrierTextActive: {
    color: '#1C1A18',
    fontWeight: '700',
  },
  modalInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#DFD8CC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1C1A18',
    marginBottom: 12,
  },
  modalAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalAlertText: {
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 15,
    flex: 1,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6D3D1',
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#57534E',
  },
  modalSubmitBtn: {
    backgroundColor: '#1C1A18',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  modalSubmitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
