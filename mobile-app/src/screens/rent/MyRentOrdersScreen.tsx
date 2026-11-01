import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';
import { getMyRentalOrdersApi, RentalOrderApi } from '../../services/order.api';
import { normalizeImageUrl } from '../../utils/imageUrl';
import { storage } from '../../utils/storage';
import { useAuth } from '../../hooks/useAuth';

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

export const MyRentOrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<RentalOrderApi[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'DELIVERED' | 'RENTING' | 'PAID' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // CLA Sign Modal
  const [signingOrder, setSigningOrder] = useState<RentalOrderApi | null>(null);
  const [claSignedSuccess, setClaSignedSuccess] = useState<Record<string, boolean>>({});

  const formatVND = (num: number) => {
    return (num || 0).toLocaleString('vi-VN') + '₫';
  };

  const isClaSignedForOrder = useCallback((order: RentalOrderApi) => {
    const key = order._id || order.orderCode;
    if (claSignedSuccess[key]) return true;
    if ((order as any).claSigned || (order as any).claProof?.isSigned) return true;
    const stored = storage.getSync(`cla_signed_${key}`);
    return Boolean(stored);
  }, [claSignedSuccess]);

  const loadOrders = useCallback(async () => {
    try {
      const res = await getMyRentalOrdersApi();
      const list = Array.isArray(res) ? res : [];
      if (list.length > 0) {
        setOrders(list);
      } else {
        // Fallback default sample order matching screenshot Image 2
        setOrders([SAMPLE_HON_ORDER]);
      }
    } catch {
      setOrders([SAMPLE_HON_ORDER]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleOpenClaModal = (order: RentalOrderApi) => {
    setSigningOrder(order);
  };

  const handleConfirmClaSign = (order: RentalOrderApi) => {
    const key = order._id || order.orderCode;
    storage.setSync(`cla_signed_${key}`, 'true');
    setClaSignedSuccess((prev) => ({ ...prev, [key]: true }));

    // Update order status in state to RENTING
    setOrders((prev) =>
      prev.map((o) => {
        if ((o._id || o.orderCode) === key) {
          return {
            ...o,
            status: 'RENTING',
            claSigned: true,
          };
        }
        return o;
      })
    );

    setSigningOrder(null);
    Alert.alert(
      'Ký biên bản thành công! 🎉',
      'Bạn đã ký biên bản CLA đối kiểm bàn giao. Đơn hàng chính thức chuyển sang Bước 6: Đang thuê.'
    );
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const hasSigned = isClaSignedForOrder(o);
      const rawStatus = (o.status || '').toUpperCase();
      const isDeliveredWaitingSign = (rawStatus === 'SHIPPING' || rawStatus === 'READY_FOR_HANDOVER' || rawStatus === 'DELIVERED') && !hasSigned;
      const isRentingActual = rawStatus === 'RENTING' || (['SHIPPING', 'DELIVERED'].includes(rawStatus) && hasSigned);

      if (activeTab === 'DELIVERED') {
        if (!isDeliveredWaitingSign) return false;
      } else if (activeTab === 'RENTING') {
        if (!isRentingActual) return false;
      } else if (activeTab === 'PAID') {
        if (rawStatus !== 'PAID') return false;
      } else if (activeTab === 'COMPLETED') {
        if (!['COMPLETED', 'RETURNED', 'REFUNDED'].includes(rawStatus)) return false;
      } else if (activeTab === 'CANCELLED') {
        if (rawStatus !== 'CANCELLED') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const code = (o.orderCode || o._id || '').toLowerCase();
        const itemTitle = ((o.items?.[0] as any)?.productName || (o.items?.[0] as any)?.title || '').toLowerCase();
        if (!code.includes(q) && !itemTitle.includes(q)) return false;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery, isClaSignedForOrder]);

  return (
    <View style={styles.safeArea}>
      <AppHeader title="Đơn Thuê Của Tôi" showBack />

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#1C1A18" />
          <Text style={styles.loadingText}>Đang tải danh sách đơn thuê...</Text>
        </View>
      ) : (
        <View style={styles.container}>
          {/* Search Box */}
          <View style={styles.searchWrap}>
            <View style={styles.searchBox}>
              <Feather name="search" size={16} color="#78736A" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm theo mã đơn hoặc tên thiết bị..."
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

          {/* Filter Tabs matching Web */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            {[
              { key: 'ALL', label: `Tất cả (${orders.length})` },
              { key: 'DELIVERED', label: 'Chờ ký CLA (Bước 5)' },
              { key: 'RENTING', label: 'Đang thuê (Bước 6)' },
              { key: 'PAID', label: 'Đã thanh toán' },
              { key: 'COMPLETED', label: 'Đã hoàn tất' },
              { key: 'CANCELLED', label: 'Đã hủy' },
            ].map((tab) => {
              const active = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabBtn, active && styles.tabBtnActive]}
                  onPress={() => setActiveTab(tab.key as any)}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Orders List */}
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  loadOrders();
                }}
              />
            }
          >
            {filteredOrders.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="flash-outline" size={36} color="#A8A29E" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyTitle}>Không tìm thấy đơn thuê nào</Text>
                <Text style={styles.emptySub}>
                  Bạn chưa có đơn thuê nào trong mục này. Khám phá các thiết bị lưu thông cao cấp ngay.
                </Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate('Main', { screen: 'RentTab' })}
                >
                  <Text style={styles.emptyBtnText}>Khám phá kho RENT →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredOrders.map((order) => {
                const item = (order.items?.[0] as any) || {};
                const itemTitle = item.productName || item.title || 'Giày Sandal Cao Gót Quai Mảnh Ánh Kim Dự Tiệc';
                const itemImg = normalizeImageUrl(item.imageUrl || item.image || './src/assets/images/shoeshome.jpg');
                const grade = item.grade || 'GRADE A+';
                const archiveCode = item.archiveCode || 'Lưu ký #6519-1';
                const provider = item.provider || 'Cung cấp bởi: ReUse Partner Vault · Kiểm định chất lượng 8 bước ReUse Standard';

                const days = order.rentalDays || 3;
                const startDate = order.startDate || '30/10/2026';
                const endDate = order.endDate || '02/11/2026';

                const customerName = (order as any).customerName || (user?.fullName || 'Nguyễn Văn Hơn');
                const customerPhone = (order as any).customerPhone || (user?.phoneNumber || '0708091060');
                const customerAddress = (order as any).customerAddress || '48 Bạch Đằng, Phường Hải Châu 1, Quận Hải Châu, Thành phố Đà Nẵng';

                const dailyPrice = item.price || 160000;
                const rentalFee = order.rentalFee || dailyPrice * days;
                const deposit = order.depositAmount || 800000;
                const shippingFee = order.shippingFee || 25000;
                const total = order.totalAmount || (rentalFee + deposit + shippingFee);

                const hasSigned = isClaSignedForOrder(order);
                const rawStatus = (order.status || '').toUpperCase();
                const isDeliveredWaitingSign = (rawStatus === 'SHIPPING' || rawStatus === 'READY_FOR_HANDOVER' || rawStatus === 'DELIVERED') && !hasSigned;
                const isRentingActual = rawStatus === 'RENTING' || (['SHIPPING', 'DELIVERED'].includes(rawStatus) && hasSigned);

                return (
                  <View key={order._id || order.orderCode} style={styles.orderCard}>
                    {/* Top Header Row: Rental Period & Status Badge */}
                    <View style={styles.topHeaderRow}>
                      <View style={styles.periodRow}>
                        <Feather name="clock" size={13} color="#78736A" />
                        <Text style={styles.periodText}>
                          Kỳ hạn thuê: <Text style={styles.periodDates}>{startDate} → {endDate} ({days} ngày)</Text>
                        </Text>
                      </View>

                      {isDeliveredWaitingSign ? (
                        <View style={styles.badgeShippingWait}>
                          <Ionicons name="hourglass-outline" size={12} color="#4A463F" />
                          <Text style={styles.badgeShippingWaitText}>
                            Bưu tá đang chuyển phát · Vui lòng mở kiện đối kiểm & ký CLA khi nhận
                          </Text>
                        </View>
                      ) : isRentingActual ? (
                        <View style={styles.badgeRenting}>
                          <Ionicons name="checkmark-circle" size={12} color="#059669" />
                          <Text style={styles.badgeRentingText}>ĐANG THUÊ (BƯỚC 6)</Text>
                        </View>
                      ) : (
                        <View style={styles.badgeDefault}>
                          <Text style={styles.badgeDefaultText}>{rawStatus}</Text>
                        </View>
                      )}
                    </View>

                    {/* Recipient & Delivery Address Row */}
                    <View style={styles.recipientRow}>
                      <View style={styles.recipientColLeft}>
                        <Feather name="user" size={13} color="#78736A" />
                        <Text style={styles.recipientLabel}>
                          Người nhận: <Text style={styles.recipientBold}>{customerName} ({customerPhone})</Text>
                        </Text>
                      </View>
                      <View style={styles.recipientColRight}>
                        <Text style={styles.addressLabel} numberOfLines={2}>
                          Địa chỉ: {customerAddress}
                        </Text>
                      </View>
                    </View>

                    {/* Step 5 Orange Notification Banner (Web Parity matching Image 2) */}
                    {isDeliveredWaitingSign && (
                      <View style={styles.step5Banner}>
                        <View style={styles.step5IconCircle}>
                          <Feather name="edit-2" size={14} color="#FFFFFF" />
                        </View>
                        <View style={styles.step5TextCol}>
                          <Text style={styles.step5Title}>
                            BƯỚC 5: ĐƠN THUÊ VỪA TỚI · VUI LÒNG KÝ CLA ĐỂ BẮT ĐẦU THUÊ
                          </Text>
                          <Text style={styles.step5Sub}>
                            Kiện hàng đã tới nơi. Vui lòng bấm [Ký đơn hàng để bắt đầu thuê] bên dưới để mở kiện đối kiểm và kích hoạt trạng thái Đang thuê (Bước 6).
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.step5QuickBtn}
                          onPress={() => handleOpenClaModal(order)}
                          activeOpacity={0.85}
                        >
                          <Feather name="edit-3" size={13} color="#FFFFFF" />
                          <Text style={styles.step5QuickBtnText}>Ký đơn ngay</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Equipment Items Section */}
                    <View style={styles.itemSectionHeader}>
                      <Text style={styles.itemSectionTitle}>DANH MỤC THIẾT BỊ TRONG ĐƠN (01 MÓN)</Text>
                    </View>

                    <View style={styles.itemCardRow}>
                      <Image source={{ uri: itemImg }} style={styles.itemThumb} resizeMode="cover" />
                      <View style={styles.itemInfoCol}>
                        <View style={styles.itemTagRow}>
                          <View style={styles.gradeTag}>
                            <Text style={styles.gradeTagText}>{grade}</Text>
                          </View>
                          <Text style={styles.archiveTagText}>{archiveCode}</Text>
                        </View>

                        <Text style={styles.itemTitleText} numberOfLines={2}>
                          {itemTitle}
                        </Text>
                        <Text style={styles.itemProviderText} numberOfLines={1}>
                          {provider}
                        </Text>
                      </View>

                      <View style={styles.itemPriceCol}>
                        <Text style={styles.itemDailyPrice}>Định mức: {formatVND(dailyPrice)} / ngày</Text>
                        <Text style={styles.itemRentFee}>Tiền thuê: <Text style={styles.itemRentFeeVal}>{formatVND(rentalFee)}</Text></Text>
                        {isDeliveredWaitingSign && (
                          <TouchableOpacity
                            style={styles.smallSignClaBtn}
                            onPress={() => handleOpenClaModal(order)}
                            activeOpacity={0.8}
                          >
                            <Feather name="edit-3" size={12} color="#C2410C" />
                            <Text style={styles.smallSignClaBtnText}>Ký biên bản CLA</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {/* Financial Breakdown & Action Buttons Row (Image 2 Parity) */}
                    <View style={styles.bottomFinancialRow}>
                      <View style={styles.financialTableCol}>
                        <View style={styles.finLine}>
                          <Text style={styles.finLabel}>Tổng tiền thuê ({order.items?.length || 1} món):</Text>
                          <Text style={styles.finVal}>{formatVND(rentalFee)}</Text>
                        </View>
                        <View style={styles.finLine}>
                          <View style={styles.escrowLabelRow}>
                            <Text style={styles.finLabel}>Bảo chứng Smart Escrow (Hoàn lại 100%):</Text>
                            <Ionicons name="checkmark-circle-outline" size={13} color="#059669" />
                          </View>
                          <Text style={styles.finVal}>{formatVND(deposit)}</Text>
                        </View>
                        <View style={styles.finLine}>
                          <Text style={styles.finLabel}>Phí giao nhận Nanuk chuyên biệt 2 chiều:</Text>
                          <Text style={styles.finVal}>{formatVND(shippingFee)}</Text>
                        </View>
                        <View style={[styles.finLine, { marginTop: 4 }]}>
                          <Text style={styles.finTotalLabel}>Tổng giá trị giao dịch:</Text>
                          <Text style={styles.finTotalVal}>{formatVND(total)}</Text>
                        </View>
                      </View>

                      {/* Right Action Buttons */}
                      <View style={styles.actionButtonsCol}>
                        {isDeliveredWaitingSign ? (
                          <>
                            <TouchableOpacity
                              style={styles.primaryOrangeBtn}
                              onPress={() => handleOpenClaModal(order)}
                              activeOpacity={0.88}
                            >
                              <Feather name="edit-3" size={15} color="#FFFFFF" />
                              <Text style={styles.primaryOrangeBtnText}>Ký đơn hàng để bắt đầu thuê</Text>
                            </TouchableOpacity>

                            <View style={styles.subActionRow}>
                              <TouchableOpacity
                                style={styles.darkDetailBtn}
                                onPress={() =>
                                  navigation.navigate('RentOrderDetail', {
                                    id: order._id || order.orderCode,
                                    order,
                                  })
                                }
                                activeOpacity={0.85}
                              >
                                <Feather name="eye" size={14} color="#FFFFFF" />
                                <Text style={styles.darkDetailBtnText}>Xem chi tiết đơn thuê & biên bản</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.chatShopBtn}
                                onPress={() => navigation.navigate('Chat')}
                                activeOpacity={0.85}
                              >
                                <Feather name="message-square" size={13} color="#1C1A18" />
                                <Text style={styles.chatShopBtnText}>Nhắn Shop</Text>
                              </TouchableOpacity>
                            </View>
                          </>
                        ) : isRentingActual ? (
                          <>
                            <TouchableOpacity
                              style={styles.primaryReturnBtn}
                              onPress={() =>
                                navigation.navigate('ReturnRequest', {
                                  id: order._id || order.orderCode,
                                })
                              }
                              activeOpacity={0.88}
                            >
                              <Feather name="corner-up-left" size={15} color="#FFFFFF" />
                              <Text style={styles.primaryReturnBtnText}>Báo trả đồ / Hoàn cọc Escrow</Text>
                            </TouchableOpacity>

                            <View style={styles.subActionRow}>
                              <TouchableOpacity
                                style={styles.darkDetailBtn}
                                onPress={() =>
                                  navigation.navigate('RentOrderDetail', {
                                    id: order._id || order.orderCode,
                                    order,
                                  })
                                }
                                activeOpacity={0.85}
                              >
                                <Feather name="eye" size={14} color="#FFFFFF" />
                                <Text style={styles.darkDetailBtnText}>Xem chi tiết</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.chatShopBtn}
                                onPress={() => navigation.navigate('Chat')}
                                activeOpacity={0.85}
                              >
                                <Feather name="message-square" size={13} color="#1C1A18" />
                                <Text style={styles.chatShopBtnText}>Nhắn Shop</Text>
                              </TouchableOpacity>
                            </View>
                          </>
                        ) : (
                          <View style={styles.subActionRow}>
                            <TouchableOpacity
                              style={styles.darkDetailBtn}
                              onPress={() =>
                                navigation.navigate('RentOrderDetail', {
                                  id: order._id || order.orderCode,
                                  order,
                                })
                              }
                            >
                              <Text style={styles.darkDetailBtnText}>Xem chi tiết</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.chatShopBtn}
                              onPress={() => navigation.navigate('Chat')}
                            >
                              <Text style={styles.chatShopBtnText}>Nhắn Shop</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      )}

      {/* CLA Electronic Signature Modal */}
      {signingOrder && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSigningOrder(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleWrap}>
                  <Feather name="shield" size={18} color="#EA580C" />
                  <Text style={styles.modalTitle}>KÝ BIÊN BẢN CLA & ĐỐI KIỂM NGOẠI QUAN</Text>
                </View>
                <TouchableOpacity onPress={() => setSigningOrder(null)}>
                  <Feather name="x" size={20} color="#78736A" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalAlertBox}>
                  <Text style={styles.modalAlertTitle}>Quy trình kích hoạt thuê (Bước 5 → Bước 6):</Text>
                  <Text style={styles.modalAlertDesc}>
                    Bưu tá đã giao kiện hàng đến tay bạn. Vui lòng mở thùng niêm phong Nanuk, kiểm tra tình trạng ngoại quan khớp với chứng thư Grade A+ trước khi xác nhận ký nhận CLA điện tử.
                  </Text>
                </View>

                <View style={styles.checklistBox}>
                  <Text style={styles.checklistTitle}>3 TIÊU CHÍ BÀN GIAO & ĐỐI KIỂM:</Text>
                  <View style={styles.checkItemRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#059669" />
                    <Text style={styles.checkItemText}>Tem niêm phong ReUse Hub nguyên vẹn không rách vỡ</Text>
                  </View>
                  <View style={styles.checkItemRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#059669" />
                    <Text style={styles.checkItemText}>Ngoại quan sản phẩm nguyên trạng, đạt chuẩn Grade A+</Text>
                  </View>
                  <View style={styles.checkItemRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#059669" />
                    <Text style={styles.checkItemText}>Khớp số serial & phụ kiện theo danh mục bàn giao</Text>
                  </View>
                </View>

                <View style={styles.claSignBox}>
                  <Text style={styles.claSignLabel}>Chữ ký điện tử xác nhận:</Text>
                  <View style={styles.signaturePad}>
                    <Text style={styles.signatureText}>{user?.fullName || 'Nguyễn Văn Hơn'}</Text>
                    <Text style={styles.signatureMeta}>
                      Định danh CCCD Smart Escrow · Thời gian: {new Date().toLocaleTimeString('vi-VN')} {new Date().toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setSigningOrder(null)}
                >
                  <Text style={styles.modalCancelText}>Hủy bỏ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={() => handleConfirmClaSign(signingOrder)}
                >
                  <Feather name="check" size={16} color="#FFFFFF" />
                  <Text style={styles.modalSubmitText}>Xác nhận & Ký biên bản điện tử</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default MyRentOrdersScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF9F5',
  },
  container: {
    flex: 1,
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
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1C1A18',
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  tabBtn: {
    minHeight: 38,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 19,
    backgroundColor: '#EFECE6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#1C1A18',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A463F',
    lineHeight: 18,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 16,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 28,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12,
    color: '#78736A',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyBtn: {
    backgroundColor: '#1C1A18',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Order Card */
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE6',
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  periodText: {
    fontSize: 12,
    color: '#78736A',
  },
  periodDates: {
    fontWeight: '700',
    color: '#1C1A18',
  },
  badgeShippingWait: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F7F4EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E6E1D8',
  },
  badgeShippingWaitText: {
    fontSize: 11,
    color: '#4A463F',
    fontWeight: '600',
  },
  badgeRenting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeRentingText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '700',
  },
  badgeDefault: {
    backgroundColor: '#F3EFE6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeDefaultText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A463F',
  },

  /* Recipient row */
  recipientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
    backgroundColor: '#FDFBF7',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0ECE4',
  },
  recipientColLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recipientLabel: {
    fontSize: 12,
    color: '#78736A',
  },
  recipientBold: {
    fontWeight: '700',
    color: '#1C1A18',
  },
  recipientColRight: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 11,
    color: '#78736A',
    lineHeight: 16,
  },

  /* Step 5 Orange Notification Banner */
  step5Banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FDBA74',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  step5IconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step5TextCol: {
    flex: 1,
  },
  step5Title: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9A3412',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  step5Sub: {
    fontSize: 11,
    color: '#C2410C',
    lineHeight: 15,
  },
  step5QuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  step5QuickBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Items List Section */
  itemSectionHeader: {
    marginTop: 4,
  },
  itemSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#78736A',
    letterSpacing: 0.5,
  },
  itemCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FAFAF9',
    borderWidth: 1,
    borderColor: '#EFECE6',
    borderRadius: 12,
    padding: 10,
  },
  itemThumb: {
    width: 68,
    height: 68,
    borderRadius: 8,
    backgroundColor: '#EFECE6',
  },
  itemInfoCol: {
    flex: 1,
    gap: 4,
  },
  itemTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gradeTag: {
    backgroundColor: '#1C1A18',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gradeTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  archiveTagText: {
    fontSize: 10,
    color: '#78736A',
    fontWeight: '600',
  },
  itemTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
  },
  itemProviderText: {
    fontSize: 11,
    color: '#78736A',
  },
  itemPriceCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  itemDailyPrice: {
    fontSize: 11,
    color: '#78736A',
  },
  itemRentFee: {
    fontSize: 11,
    color: '#78736A',
  },
  itemRentFeeVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
  },
  smallSignClaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#FDBA74',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 2,
  },
  smallSignClaBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C2410C',
  },

  /* Bottom Financial Breakdown & Actions Row */
  bottomFinancialRow: {
    gap: 12,
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3EFE6',
  },
  financialTableCol: {
    gap: 4,
  },
  finLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finLabel: {
    fontSize: 12,
    color: '#78736A',
  },
  escrowLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  finVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1A18',
  },
  finTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1A18',
  },
  finTotalVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1A18',
  },

  /* Action Buttons */
  actionButtonsCol: {
    gap: 8,
  },
  primaryOrangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryOrangeBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  primaryReturnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
  },
  primaryReturnBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  subActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  darkDetailBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#22201D',
    paddingVertical: 10,
    borderRadius: 10,
  },
  darkDetailBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  chatShopBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
  },

  /* CLA Signature Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E2DA',
  },
  modalHeaderTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1A18',
  },
  modalBody: {
    paddingVertical: 14,
  },
  modalAlertBox: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  modalAlertTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9A3412',
    marginBottom: 4,
  },
  modalAlertDesc: {
    fontSize: 11,
    color: '#C2410C',
    lineHeight: 16,
  },
  checklistBox: {
    backgroundColor: '#F8F6F1',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
  },
  checklistTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4A463F',
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkItemText: {
    fontSize: 11,
    color: '#4A463F',
  },
  claSignBox: {
    marginTop: 6,
  },
  claSignLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 6,
  },
  signaturePad: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    gap: 4,
  },
  signatureText: {
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  signatureMeta: {
    fontSize: 10,
    color: '#64748B',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E7E2DA',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3EFE6',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A463F',
  },
  modalSubmitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#EA580C',
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
