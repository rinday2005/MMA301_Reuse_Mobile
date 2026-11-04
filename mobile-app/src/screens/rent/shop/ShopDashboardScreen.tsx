import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { ShopHeader } from '../../../components/layout/ShopHeader';
import { useAuth } from '../../../hooks/useAuth';
import { getShopRentalOrdersApi, approveRentalOrderApi, RentalOrderApi } from '../../../services/order.api';
import { getShopThriftOrdersApi } from '../../../services/thriftOrder.api';
import { getShopRentProductsApi } from '../../../services/rentProduct.api';
import { getShopRevenueApi, ShopRevenueData } from '../../../services/shop.api';
import { formatCurrency } from '../../../utils/formatCurrency';
import { normalizeImageUrl, extractProductImage } from '../../../utils/imageUrl';

export const ShopDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rentOrders, setRentOrders] = useState<RentalOrderApi[]>([]);
  const [thriftOrders, setThriftOrders] = useState<any[]>([]);
  const [rentProducts, setRentProducts] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<ShopRevenueData | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [rOrders, tOrders, rProducts, rev] = await Promise.all([
        getShopRentalOrdersApi(),
        getShopThriftOrdersApi(),
        getShopRentProductsApi(),
        getShopRevenueApi().catch(() => null),
      ]);

      setRentOrders(Array.isArray(rOrders) ? rOrders : []);
      const tList = Array.isArray(tOrders) ? tOrders : (tOrders as any)?.orders || [];
      setThriftOrders(tList);
      setRentProducts(Array.isArray(rProducts) ? rProducts : []);
      if (rev) setRevenueData(rev);
    } catch (err) {
      console.warn('Lỗi khi tải dữ liệu Shop Dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleApproveOrder = async (orderId: string, orderCode?: string) => {
    setApprovingId(orderId);
    try {
      await approveRentalOrderApi(orderId);
      Alert.alert('Thành công', `Đã duyệt đơn thuê ${orderCode || orderId}. Khách hàng có thể tiến hành thanh toán cọc.`);
      setRentOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: 'WAITING_PAYMENT' } : o))
      );
    } catch (err: any) {
      Alert.alert('Thông báo', err?.response?.data?.message || 'Không thể phê duyệt đơn lúc này.');
    } finally {
      setApprovingId(null);
    }
  };

  // Tính toán số liệu thống kê
  const pendingRentCount = rentOrders.filter((o) =>
    ['PENDING', 'WAITING_PAYMENT', 'PAID', 'READY_FOR_HANDOVER'].includes(o.status)
  ).length;

  const activeRentCount = rentOrders.filter((o) =>
    ['SHIPPING', 'HANDED_OVER', 'RENTING', 'DELIVERED'].includes(o.status)
  ).length;

  const pendingThriftCount = thriftOrders.filter((o) =>
    ['PENDING_PAYMENT', 'PAID', 'PROCESSING'].includes(o.status)
  ).length;

  const totalRevenue = revenueData?.summary?.totalRevenue ||
    rentOrders
      .filter((o) => o.status === 'COMPLETED' || o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + (o.rentalFee || 0), 0) +
    thriftOrders
      .filter((o) => o.status === 'COMPLETED' || o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + (o.totalAmount || o.itemsSubtotal || 0), 0);

  const shopName = user?.fullName || 'ReUse Official Shop';

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <View style={[styles.badge, styles.badgeOrange]}><Text style={styles.badgeOrangeText}>Chờ duyệt</Text></View>;
      case 'WAITING_PAYMENT':
        return <View style={[styles.badge, styles.badgeYellow]}><Text style={styles.badgeYellowText}>Chờ thanh toán</Text></View>;
      case 'PAID':
        return <View style={[styles.badge, styles.badgeBlue]}><Text style={styles.badgeBlueText}>Đã cọc · Chờ gửi</Text></View>;
      case 'READY_FOR_HANDOVER':
      case 'SHIPPING':
      case 'HANDED_OVER':
        return <View style={[styles.badge, styles.badgeBlue]}><Text style={styles.badgeBlueText}>Đang giao</Text></View>;
      case 'RENTING':
      case 'DELIVERED':
        return <View style={[styles.badge, styles.badgeGreen]}><Text style={styles.badgeGreenText}>Đang thuê</Text></View>;
      case 'RETURNING':
      case 'RETURN_REQUESTED':
        return <View style={[styles.badge, styles.badgePurple]}><Text style={styles.badgePurpleText}>Chờ kiểm định trả</Text></View>;
      case 'COMPLETED':
        return <View style={[styles.badge, styles.badgeGray]}><Text style={styles.badgeGrayText}>Hoàn tất</Text></View>;
      default:
        return <View style={[styles.badge, styles.badgeGray]}><Text style={styles.badgeGrayText}>{status}</Text></View>;
    }
  };

  return (
    <View style={styles.container}>
      <ShopHeader />

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#1C1A18" />
          <Text style={styles.loadingText}>Đang tải thông tin xưởng...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Shop Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heroTitleCol}>
                <View style={styles.rolePill}>
                  <Text style={styles.rolePillText}>CHỦ XƯỞNG BẢO CHỨNG</Text>
                </View>
                <Text style={styles.shopName} numberOfLines={1}>{shopName}</Text>
                <Text style={styles.shopSub}>Mã xưởng đối tác: #{user?.id?.slice(-6)?.toUpperCase() || 'SHOP-01'}</Text>
              </View>
              <View style={styles.verifiedBox}>
                <Ionicons name="shield-checkmark" size={18} color="#15803D" />
                <Text style={styles.verifiedText}>Đã thẩm định</Text>
              </View>
            </View>

            {/* Quick Metrics */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricVal}>{formatCurrency(totalRevenue)}</Text>
                <Text style={styles.metricLbl}>Doanh thu ghi nhận</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={[styles.metricVal, { color: '#EA580C' }]}>{pendingRentCount}</Text>
                <Text style={styles.metricLbl}>Đơn RENT chờ xử lý</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={[styles.metricVal, { color: '#0284C7' }]}>{pendingThriftCount}</Text>
                <Text style={styles.metricLbl}>Đơn THRIFT mới</Text>
              </View>
            </View>
          </View>

          {/* Quick Shortcuts */}
          <Text style={styles.sectionHeading}>THAO TÁC NHANH</Text>
          <View style={styles.shortcutsGrid}>
            <TouchableOpacity
              style={styles.shortcutBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('CreateRentProduct')}
            >
              <View style={[styles.shortcutIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Feather name="plus-circle" size={20} color="#D97706" />
              </View>
              <Text style={styles.shortcutTitle}>Đăng đồ RENT</Text>
              <Text style={styles.shortcutSub}>Thêm sản phẩm cho thuê</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shortcutBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('CreateThriftListing')}
            >
              <View style={[styles.shortcutIconBox, { backgroundColor: '#E0F2FE' }]}>
                <Feather name="tag" size={20} color="#0284C7" />
              </View>
              <Text style={styles.shortcutTitle}>Đăng bán THRIFT</Text>
              <Text style={styles.shortcutSub}>Niêm yết đồ thanh lý</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shortcutBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ShopOrders')}
            >
              <View style={[styles.shortcutIconBox, { backgroundColor: '#FFEDD5' }]}>
                <Feather name="clipboard" size={20} color="#EA580C" />
              </View>
              <Text style={styles.shortcutTitle}>Đơn thuê RENT</Text>
              <Text style={styles.shortcutSub}>{rentOrders.length} đơn lưu trữ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shortcutBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('InventoryDashboard')}
            >
              <View style={[styles.shortcutIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Feather name="package" size={20} color="#15803D" />
              </View>
              <Text style={styles.shortcutTitle}>Kho hiện vật</Text>
              <Text style={styles.shortcutSub}>Mã định danh Serial</Text>
            </TouchableOpacity>
          </View>

          {/* Circular Economy Status Banner */}
          <View style={styles.circularBanner}>
            <View style={styles.circIconBox}>
              <Text style={styles.circIcon}>∞</Text>
            </View>
            <View style={styles.circTextCol}>
              <Text style={styles.circTitle}>Mô hình kinh tế tuần hoàn ReUse Hub</Text>
              <Text style={styles.circDesc}>
                Sản phẩm sau khi đạt ngưỡng khấu hao hoặc hoàn tất dịch vụ RENT có thể chuyển tiếp sang
                kho bán THRIFT 1 chạm nhằm tối ưu dòng tiền và giảm phát thải.
              </Text>
            </View>
          </View>

          {/* Section: Đơn thuê cần duyệt hoặc gửi hàng */}
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.secKicker}>DỊCH VỤ RENT</Text>
              <Text style={styles.secTitle}>Đơn thuê gần đây</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ShopOrders')}>
              <Text style={styles.viewAllText}>Xem tất cả ({rentOrders.length}) →</Text>
            </TouchableOpacity>
          </View>

          {rentOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="inbox" size={32} color="#D6D3D1" />
              <Text style={styles.emptyText}>Chưa có đơn hàng cho thuê nào</Text>
            </View>
          ) : (
            rentOrders.slice(0, 5).map((order) => {
              const item = order.items?.[0];
              const title = item?.productName || 'Thiết bị cho thuê';
              const code = order.orderCode || order._id?.slice(-8)?.toUpperCase();
              const isPending = order.status === 'PENDING';
              const isPaid = order.status === 'PAID';

              return (
                <View key={order._id} style={styles.orderCard}>
                  <View style={styles.orderCardHeader}>
                    <View style={styles.codeRow}>
                      <Text style={styles.orderCode}>#{code}</Text>
                      {renderStatusBadge(order.status)}
                    </View>
                    <Text style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>

                  <View style={styles.orderBodyRow}>
                    <Image
                      source={{
                        uri: extractProductImage(item || order),
                      }}
                      style={styles.productThumb}
                    />
                    <View style={styles.orderDetailCol}>
                      <Text style={styles.productName} numberOfLines={2}>{title}</Text>
                      <Text style={styles.renterName}>
                        Khách: {order.shippingAddress?.recipientName || 'Khách hàng ReUse'}
                      </Text>
                      <Text style={styles.orderPeriod}>
                        Hạn thuê: {new Date(order.startDate).toLocaleDateString('vi-VN')} -{' '}
                        {new Date(order.endDate).toLocaleDateString('vi-VN')}
                      </Text>
                      <Text style={styles.orderPrice}>
                        Tiền thuê: {formatCurrency(order.rentalFee || 0)} · Cọc:{' '}
                        {formatCurrency(order.depositAmount || 0)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderCardFooter}>
                    <TouchableOpacity
                      style={styles.detailBtn}
                      onPress={() => navigation.navigate('ShopRentOrderDetail', { id: order._id })}
                    >
                      <Text style={styles.detailBtnText}>Chi tiết đơn & CLA</Text>
                    </TouchableOpacity>

                    {isPending && (
                      <TouchableOpacity
                        style={styles.approveBtn}
                        disabled={approvingId === order._id}
                        onPress={() => handleApproveOrder(order._id, code)}
                      >
                        {approvingId === order._id ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.approveBtnText}>Duyệt đơn ngay</Text>
                        )}
                      </TouchableOpacity>
                    )}

                    {isPaid && (
                      <TouchableOpacity
                        style={styles.shipBtn}
                        onPress={() => navigation.navigate('ShopOrders', { openShippingFor: order._id })}
                      >
                        <Text style={styles.shipBtnText}>Bàn giao bưu tá</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}

          {/* Section: Đơn THRIFT gần đây */}
          <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
            <View>
              <Text style={styles.secKicker}>DỊCH VỤ THRIFT</Text>
              <Text style={styles.secTitle}>Đơn bán thanh lý gần đây</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ShopThriftOrders')}>
              <Text style={styles.viewAllText}>Xem tất cả ({thriftOrders.length}) →</Text>
            </TouchableOpacity>
          </View>

          {thriftOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="shopping-bag" size={32} color="#D6D3D1" />
              <Text style={styles.emptyText}>Chưa có đơn bán đồ thanh lý nào</Text>
            </View>
          ) : (
            thriftOrders.slice(0, 3).map((to) => (
              <View key={to._id || to.id} style={styles.thriftOrderCard}>
                <View style={styles.orderCardHeader}>
                  <Text style={styles.orderCode}>#{to.orderCode || to._id?.slice(-8)?.toUpperCase()}</Text>
                  <View style={[styles.badge, styles.badgeBlue]}>
                    <Text style={styles.badgeBlueText}>{to.status || 'PAID'}</Text>
                  </View>
                </View>
                <Text style={styles.thriftItemTitle}>
                  {to.items?.[0]?.name || to.items?.[0]?.productName || 'Sản phẩm THRIFT'}
                </Text>
                <View style={styles.thriftFooter}>
                  <Text style={styles.thriftPrice}>
                    Giá trị: {formatCurrency(to.totalAmount || to.itemsSubtotal || 0)}
                  </Text>
                  <TouchableOpacity
                    style={styles.thriftDetailLink}
                    onPress={() => navigation.navigate('ShopThriftOrderDetail', { id: to._id || to.id })}
                  >
                    <Text style={styles.thriftDetailLinkText}>Quản lý đơn →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default ShopDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#1C1A18',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  heroTitleCol: {
    flex: 1,
  },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#3E3A33',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  rolePillText: {
    color: '#FAF7F2',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  shopName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FAF7F2',
  },
  shopSub: {
    fontSize: 11,
    color: '#A8A29E',
    marginTop: 2,
  },
  verifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(21, 128, 61, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#272421',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#3E3A33',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FAF7F2',
  },
  metricLbl: {
    fontSize: 10,
    color: '#A8A29E',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#78736A',
    marginBottom: 10,
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  shortcutBtn: {
    width: '48.4%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFECE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  shortcutIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  shortcutTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1A18',
  },
  shortcutSub: {
    fontSize: 11,
    color: '#78736A',
    marginTop: 2,
  },
  circularBanner: {
    flexDirection: 'row',
    backgroundColor: '#EBE5D8',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 12,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#DDD6C6',
  },
  circIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1A18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: -2,
  },
  circTextCol: {
    flex: 1,
  },
  circTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1A18',
  },
  circDesc: {
    fontSize: 11,
    color: '#57534E',
    marginTop: 2,
    lineHeight: 15,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  secKicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#EA580C',
  },
  secTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1A18',
    marginTop: 1,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  emptyText: {
    fontSize: 12,
    color: '#A8A29E',
    fontWeight: '600',
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
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F2EB',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1A18',
  },
  orderDate: {
    fontSize: 11,
    color: '#A8A29E',
  },
  orderBodyRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  productThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#F5F2EB',
  },
  orderDetailCol: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
    lineHeight: 18,
  },
  renterName: {
    fontSize: 11,
    color: '#57534E',
    marginTop: 3,
  },
  orderPeriod: {
    fontSize: 11,
    color: '#78736A',
    marginTop: 2,
  },
  orderPrice: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
    marginTop: 3,
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F2EB',
  },
  detailBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6D3D1',
  },
  detailBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#57534E',
  },
  approveBtn: {
    backgroundColor: '#1C1A18',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  approveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shipBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  shipBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  thriftOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  thriftItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
    marginVertical: 8,
  },
  thriftFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F2EB',
  },
  thriftPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  thriftDetailLink: {
    paddingVertical: 4,
  },
  thriftDetailLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
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
});
