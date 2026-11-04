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
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';
import { useAuth } from '../../hooks/useAuth';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { getMyRentalOrdersApi, RentalOrderApi } from '../../services/order.api';
import { getMyThriftOrdersApi, ThriftOrderApi } from '../../services/thriftOrder.api';
import { getKycStatusApi } from '../../services/kyc.api';
import {
  CIRCULAR_LIFECYCLE_STEPS,
  RECOMMENDED_DASHBOARD_ITEMS,
} from '../../data/home/userDashboardData';
import { normalizeImageUrl } from '../../utils/imageUrl';
import { resolveThriftOrderItem } from '../../utils/thriftOrderItemResolver';

export const UserDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { wishlist, wishlistCount, toggleWishlist } = useCartWishlist();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rentOrders, setRentOrders] = useState<RentalOrderApi[]>([]);
  const [thriftOrders, setThriftOrders] = useState<ThriftOrderApi[]>([]);
  const [kycStatus, setKycStatus] = useState<string>(user?.kycStatus || 'NOT_SUBMITTED');

  const formatVND = (num: number) => {
    return (num || 0).toLocaleString('vi-VN') + '₫';
  };

  const loadDashboardData = useCallback(async () => {
    try {
      const [rentRes, thriftRes, kycRes] = await Promise.all([
        getMyRentalOrdersApi().catch(() => []),
        getMyThriftOrdersApi().catch(() => []),
        getKycStatusApi().catch(() => null),
      ]);

      if (Array.isArray(rentRes)) {
        setRentOrders(rentRes);
      }
      if (Array.isArray(thriftRes)) {
        setThriftOrders(thriftRes);
      } else if (thriftRes?.orders && Array.isArray(thriftRes.orders)) {
        setThriftOrders(thriftRes.orders);
      }

      if (kycRes) {
        setKycStatus(kycRes.kycStatus || kycRes.kyc?.status || user?.kycStatus || 'NOT_SUBMITTED');
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Active rental computations
  const activeRentals = useMemo(() => {
    return rentOrders.filter((o) =>
      ['PAID', 'RENTING', 'READY_FOR_HANDOVER', 'HANDED_OVER', 'SHIPPING', 'DELIVERED'].includes(
        o.status || ''
      )
    );
  }, [rentOrders]);

  const activeRental = activeRentals.length > 0 ? activeRentals[0] : null;

  const activeRentalComputed = useMemo(() => {
    if (!activeRental) return null;
    const rawItem = activeRental.items?.[0] as any;
    const title = rawItem?.productName || rawItem?.title || `Thiết bị thuê (${activeRental.orderCode || 'RH-RNT'})`;
    const image = normalizeImageUrl(rawItem?.imageUrl || rawItem?.image || './src/assets/images/camerahome.jpg');
    const deposit = activeRental.depositAmount || Number(rawItem?.depositAmount) || 0;

    const now = Date.now();
    const start = activeRental.startDate ? new Date(activeRental.startDate).getTime() : now;
    const end = activeRental.endDate ? new Date(activeRental.endDate).getTime() : now + 86400000 * 3;
    const totalDuration = Math.max(1, end - start);
    const elapsed = Math.max(0, Math.min(totalDuration, now - start));
    const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
    const remainingDays = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

    const startStr = activeRental.startDate ? new Date(activeRental.startDate).toLocaleDateString('vi-VN') : 'Hôm nay';
    const endStr = activeRental.endDate ? new Date(activeRental.endDate).toLocaleDateString('vi-VN') : 'Đang cập nhật';

    let statusLabel = 'Đang lưu giữ';
    if (activeRental.status === 'PAID') statusLabel = 'Đã thanh toán · Chờ giao';
    else if (activeRental.status === 'SHIPPING') statusLabel = 'Đang vận chuyển';
    else if (activeRental.status === 'RENTING') statusLabel = `Đang lưu giữ (còn ${remainingDays} ngày)`;

    return {
      orderId: activeRental._id || activeRental.orderCode,
      code: activeRental.orderCode || `#${activeRental._id?.slice(-6)}`,
      title,
      image,
      deposit,
      period: `${startStr} – ${endStr}`,
      remainingDays,
      statusLabel,
      progressPercent,
    };
  }, [activeRental]);

  // Total escrow deposit across active rentals
  const totalEscrowLocked = useMemo(() => {
    return activeRentals.reduce((sum, o) => sum + (o.depositAmount || 0), 0);
  }, [activeRentals]);

  const displayName = user?.fullName || 'Khách hàng';

  return (
    <View style={styles.safeArea}>
      <AppHeader title="Dashboard Cá Nhân" />

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#1C1A18" />
          <Text style={styles.loadingText}>Đang tải dữ liệu tài khoản...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadDashboardData();
              }}
            />
          }
        >
          {/* 1. WELCOME HERO BANNER */}
          <View style={styles.welcomeHero}>
            <View style={styles.welcomePill}>
              <View style={styles.welcomeDot} />
              <Text style={styles.welcomePillText}>TÀI KHOẢN TUẦN HOÀN CHÍNH THỨC</Text>
            </View>
            <Text style={styles.welcomeTitle}>Xin chào, {displayName}!</Text>
            <Text style={styles.welcomeSubtitle}>
              Tổng quan hành trình tuần hoàn, thiết bị đang lưu giữ và số dư tiền cọc Smart Escrow.
            </Text>

            {/* Quick Metrics Grid */}
            <View style={styles.statsGrid}>
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => navigation.navigate('MyRentOrders')}
                activeOpacity={0.8}
              >
                <Text style={styles.statVal}>{activeRentals.length}</Text>
                <Text style={styles.statLabel}>Đơn RENT đang giữ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statCard}
                onPress={() => navigation.navigate('MyThriftOrders')}
                activeOpacity={0.8}
              >
                <Text style={styles.statVal}>{thriftOrders.length}</Text>
                <Text style={styles.statLabel}>Đơn mua THRIFT</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statCard}
                onPress={() => navigation.navigate('UserWallet')}
                activeOpacity={0.8}
              >
                <Text style={styles.statValBold}>
                  {totalEscrowLocked > 0 ? formatVND(totalEscrowLocked) : '0₫'}
                </Text>
                <Text style={styles.statLabel}>Cọc Smart Escrow</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statCard}
                onPress={() => navigation.navigate('CustomerKyc')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.statValSmall,
                    kycStatus === 'APPROVED' ? styles.kycGreen : styles.kycAmber,
                  ]}
                >
                  {kycStatus === 'APPROVED' ? 'ĐÃ DUYỆT' : 'CHỜ DUYỆT'}
                </Text>
                <Text style={styles.statLabel}>Định danh KYC</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. ACTIVE RENTAL CARD (THIẾT BỊ ĐANG THUÊ) */}
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionPre}>01 · THIẾT BỊ ĐANG TRONG KỲ THUÊ</Text>
                <Text style={styles.sectionTitle}>Thiết bị đang lưu giữ</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('MyRentOrders')}
                style={styles.headerLink}
              >
                <Text style={styles.headerLinkText}>Xem tất cả ({rentOrders.length})</Text>
                <Feather name="arrow-right" size={13} color="#1C1A18" />
              </TouchableOpacity>
            </View>

            {activeRentalComputed ? (
              <View style={styles.activeCard}>
                <View style={styles.activeTopRow}>
                  <Image source={{ uri: activeRentalComputed.image }} style={styles.activeThumb} />
                  <View style={styles.activeInfo}>
                    <View style={styles.codeRow}>
                      <Text style={styles.activeCode}>{activeRentalComputed.code}</Text>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>
                          {activeRentalComputed.statusLabel}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.activeTitle} numberOfLines={2}>
                      {activeRentalComputed.title}
                    </Text>
                    <Text style={styles.activePeriod}>{activeRentalComputed.period}</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Tiến độ chu kỳ thuê</Text>
                    <Text style={styles.progressDays}>
                      Còn {activeRentalComputed.remainingDays} ngày
                    </Text>
                  </View>
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${activeRentalComputed.progressPercent}%` },
                      ]}
                    />
                  </View>
                </View>

                {/* Escrow note */}
                <View style={styles.activeEscrowRow}>
                  <View style={styles.activeEscrowInfo}>
                    <Text style={styles.escrowSub}>Tiền cọc bảo chứng Escrow:</Text>
                    <Text style={styles.escrowVal}>
                      {formatVND(activeRentalComputed.deposit)}
                    </Text>
                  </View>
                  <View style={styles.escrowBadge}>
                    <Ionicons name="shield-checkmark" size={13} color="#059669" />
                    <Text style={styles.escrowBadgeText}>Bảo hộ 100%</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.activeActionsRow}>
                  <TouchableOpacity
                    style={styles.actionBtnDetail}
                    onPress={() =>
                      navigation.navigate('RentOrderDetail', {
                        id: activeRentalComputed.orderId,
                      })
                    }
                  >
                    <Text style={styles.actionBtnDetailText}>Chi tiết đơn</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnReturn}
                    onPress={() =>
                      navigation.navigate('ReturnRequest', {
                        id: activeRentalComputed.orderId,
                      })
                    }
                  >
                    <Text style={styles.actionBtnReturnText}>Báo trả đồ / Hoàn cọc</Text>
                    <Feather name="arrow-right" size={13} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="flash-outline" size={32} color="#A8A29E" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyTitle}>Chưa có thiết bị nào đang thuê</Text>
                <Text style={styles.emptySubtitle}>
                  Khám phá các máy ảnh mirrorless, ống kính và đồ dã ngoại tinh tuyển ngay.
                </Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate('Main', { screen: 'RentTab' })}
                >
                  <Text style={styles.emptyBtnText}>Khám phá đồ RENT →</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 3. RECENT THRIFT ORDERS */}
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionPre}>02 · ĐƠN HÀNG THRIFT GẦN ĐÂY</Text>
                <Text style={styles.sectionTitle}>Sở hữu vĩnh viễn đồ tuyển chọn</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('MyThriftOrders')}
                style={styles.headerLink}
              >
                <Text style={styles.headerLinkText}>Xem tất cả ({thriftOrders.length})</Text>
                <Feather name="arrow-right" size={13} color="#1C1A18" />
              </TouchableOpacity>
            </View>

            {thriftOrders.length > 0 ? (
              <View style={styles.thriftList}>
                {thriftOrders.slice(0, 3).map((order) => {
                  const item = order.items?.[0] as any;
                  const resolved = resolveThriftOrderItem(order, item);
                  const itemTitle = resolved.title;
                  const itemImg = resolved.image;
                  const itemPrice = order.totalAmount || item?.price || resolved.price || 0;

                  return (
                    <TouchableOpacity
                      key={order._id || order.orderCode}
                      style={styles.thriftCard}
                      onPress={() =>
                        navigation.navigate('ThriftOrderDetail', {
                          id: order._id || order.orderCode,
                        })
                      }
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: itemImg }} style={styles.thriftThumb} />
                      <View style={styles.thriftInfo}>
                        <View style={styles.codeRow}>
                          <Text style={styles.activeCode}>{order.orderCode || `#${order._id?.slice(-6)}`}</Text>
                          <View style={styles.thriftStatusBadge}>
                            <Text style={styles.thriftStatusText}>
                              {order.status === 'DELIVERED' ? 'ĐÃ NHẬN HÀNG' : 'ĐANG XỬ LÝ'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.thriftTitle} numberOfLines={1}>
                          {itemTitle}
                        </Text>
                        <Text style={styles.thriftPrice}>{formatVND(itemPrice)}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Feather name="shopping-bag" size={32} color="#A8A29E" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyTitle}>Chưa có đơn hàng THRIFT nào</Text>
                <Text style={styles.emptySubtitle}>
                  Khám phá kho đồ thời trang, máy ảnh cũ và giày lưu trữ có hồ sơ kiểm định.
                </Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate('Main', { screen: 'ThriftTab' })}
                >
                  <Text style={styles.emptyBtnText}>Xem kho đồ THRIFT →</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 4. CIRCULAR LIFECYCLE STEPS */}
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionPre}>03 · KIẾN TRÚC TUẦN HOÀN</Text>
            <Text style={styles.sectionTitle}>Hành trình luân chuyển khép kín</Text>
            <View style={styles.loopStepsRow}>
              {CIRCULAR_LIFECYCLE_STEPS.map((step) => (
                <View
                  key={step.step}
                  style={[styles.loopStepCard, step.isHighlight && styles.loopStepHighlight]}
                >
                  <Text style={styles.loopStepNum}>0{step.step}</Text>
                  <Text style={styles.loopStepTitle}>{step.title}</Text>
                  <Text style={styles.loopStepDesc}>{step.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 5. RECOMMENDED ITEMS */}
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionPre}>04 · GỢI Ý DÀNH CHO BẠN</Text>
            <Text style={styles.sectionTitle}>Thiết bị được đề xuất tuần hoàn</Text>

            <View style={styles.recsGrid}>
              {RECOMMENDED_DASHBOARD_ITEMS.slice(0, 4).map((rec) => (
                <View key={rec.id} style={styles.recCard}>
                  <Image source={{ uri: rec.image }} style={styles.recImg} />
                  <View style={styles.recBody}>
                    <View style={styles.recBadge}>
                      <Text style={styles.recBadgeText}>{rec.mode.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.recTitle} numberOfLines={1}>
                      {rec.title}
                    </Text>
                    <Text style={styles.recPrice}>
                      {formatVND(rec.price)}
                      {rec.priceUnit ? ` / ${rec.priceUnit}` : ''}
                    </Text>
                    <TouchableOpacity
                      style={styles.recBtn}
                      onPress={() =>
                        navigation.navigate(
                          rec.mode === 'rent' ? 'RentTab' : 'ThriftTab'
                        )
                      }
                    >
                      <Text style={styles.recBtnText}>
                        {rec.mode === 'rent' ? 'Thuê ngay' : 'Mua ngay'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default UserDashboardScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF9F5',
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#78736A',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 20,
  },
  welcomeHero: {
    backgroundColor: '#F4F0EA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 18,
  },
  welcomePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 6,
    marginBottom: 8,
  },
  welcomeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  welcomePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1C1A18',
    letterSpacing: 0.8,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: '#5E5A53',
    lineHeight: 17,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    borderRadius: 12,
    padding: 12,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1A18',
  },
  statValBold: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1A18',
  },
  statValSmall: {
    fontSize: 12,
    fontWeight: '800',
  },
  kycGreen: {
    color: '#059669',
  },
  kycAmber: {
    color: '#D97706',
  },
  statLabel: {
    fontSize: 10,
    color: '#78736A',
    marginTop: 2,
  },
  sectionWrap: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E2DA',
  },
  sectionPre: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#78736A',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1A18',
    marginTop: 2,
  },
  headerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1A18',
  },
  activeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 14,
    gap: 12,
  },
  activeTopRow: {
    flexDirection: 'row',
    gap: 12,
  },
  activeThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#F4F0EA',
  },
  activeInfo: {
    flex: 1,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  activeCode: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#78736A',
  },
  statusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  activeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
    lineHeight: 17,
  },
  activePeriod: {
    fontSize: 10,
    color: '#78736A',
    marginTop: 2,
  },
  progressContainer: {
    backgroundColor: '#FBF9F5',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E7E2DA',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 10,
    color: '#78736A',
    fontWeight: '600',
  },
  progressDays: {
    fontSize: 10,
    color: '#1C1A18',
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E7E2DA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1C1A18',
    borderRadius: 3,
  },
  activeEscrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F4F0EA',
  },
  activeEscrowInfo: {
    gap: 1,
  },
  escrowSub: {
    fontSize: 10,
    color: '#78736A',
  },
  escrowVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1A18',
  },
  escrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  escrowBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  activeActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnDetail: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    paddingVertical: 9,
    borderRadius: 10,
  },
  actionBtnDetailText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1A18',
  },
  actionBtnReturn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1A18',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnReturnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#78736A',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 12,
  },
  emptyBtn: {
    backgroundColor: '#1C1A18',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  thriftList: {
    gap: 8,
  },
  thriftCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 10,
    gap: 10,
  },
  thriftThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F4F0EA',
  },
  thriftInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  thriftStatusBadge: {
    backgroundColor: '#F4F0EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  thriftStatusText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#78736A',
  },
  thriftTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
    marginTop: 2,
  },
  thriftPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1A18',
    marginTop: 2,
  },
  loopStepsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  loopStepCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 12,
  },
  loopStepHighlight: {
    backgroundColor: '#F4F0EA',
  },
  loopStepNum: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1A18',
    fontFamily: 'monospace',
  },
  loopStepTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
    marginTop: 4,
  },
  loopStepDesc: {
    fontSize: 10,
    color: '#78736A',
    marginTop: 2,
    lineHeight: 14,
  },
  recsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  recCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    overflow: 'hidden',
  },
  recImg: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F4F0EA',
  },
  recBody: {
    padding: 10,
  },
  recBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1C1A18',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  recBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  recTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
  },
  recPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1A18',
    marginTop: 2,
    marginBottom: 8,
  },
  recBtn: {
    alignItems: 'center',
    backgroundColor: '#F4F0EA',
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E7E2DA',
  },
  recBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1C1A18',
  },
});
