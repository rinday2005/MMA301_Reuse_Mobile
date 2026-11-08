import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminHeader from '../../components/layout/AdminHeader';
import {
  getAllShopsApi,
  getShopDetailAdminApi,
  reviewShopKycApi,
  toggleUserLockApi,
  respondUserAppealApi,
  ShopOwnerItem,
} from '../../services/admin.api';
import { normalizeImageUrl } from '../../utils/imageUrl';
import { formatCurrency } from '../../utils/formatCurrency';

type QuickFilterTab =
  | 'ALL'
  | 'ACTIVE'
  | 'LOCKED'
  | 'APPEALS'
  | 'KYC_APPROVED'
  | 'KYC_PENDING'
  | 'KYC_UNVERIFIED';

const FILTER_TABS: { key: QuickFilterTab; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'ACTIVE', label: 'Hoạt động' },
  { key: 'LOCKED', label: 'Đang khóa' },
  { key: 'APPEALS', label: 'Khiếu nại' },
  { key: 'KYC_APPROVED', label: 'KYC Đã duyệt' },
  { key: 'KYC_PENDING', label: 'KYC Chờ duyệt' },
  { key: 'KYC_UNVERIFIED', label: 'Chưa KYC' },
];

export const ShopManagementScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [shops, setShops] = useState<ShopOwnerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<QuickFilterTab>('ALL');

  // Detail Modal
  const [inspectingShop, setInspectingShop] = useState<ShopOwnerItem | null>(null);
  const [inspectingDetail, setInspectingDetail] = useState<{
    rentProducts: Record<string, unknown>[];
    thriftListings: Record<string, unknown>[];
    recentOrders: Record<string, unknown>[];
    kycRecord?: Record<string, unknown> | null;
  } | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [detailModalTab, setDetailModalTab] = useState<'INFO' | 'KYC' | 'PRODUCTS'>('INFO');

  // Lock Modal
  const [lockingShop, setLockingShop] = useState<ShopOwnerItem | null>(null);
  const [lockReason, setLockReason] = useState<string>(
    'Tài khoản Cửa hàng bị tạm khóa để kiểm tra chất lượng sản phẩm và rà soát giao dịch'
  );
  const [isSubmittingLock, setIsSubmittingLock] = useState<boolean>(false);

  // Appeal Modal
  const [appealShop, setAppealShop] = useState<ShopOwnerItem | null>(null);
  const [adminReply, setAdminReply] = useState<string>(
    'Ban Quản trị ReUse Hub đã xem xét hồ sơ giải trình của Cửa hàng và xác minh hợp lệ. Quyền kinh doanh và đăng bài đã được khôi phục.'
  );
  const [unlockDecision, setUnlockDecision] = useState<boolean>(true);
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState<boolean>(false);

  // Review KYC Modal
  const [reviewingKycShop, setReviewingKycShop] = useState<ShopOwnerItem | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // Preview Image Modal
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const loadShops = useCallback(async () => {
    try {
      const data = await getAllShopsApi();
      setShops(data || []);
    } catch (err) {
      console.warn('Lỗi tải danh sách Shop:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  const onRefresh = () => {
    setRefreshing(true);
    loadShops();
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = shops.length;
    const lockedCount = shops.filter(
      (s) => s.isLocked || s.status === 'lock' || s.status === 'locked'
    ).length;
    const activeCount = total - lockedCount;
    const appealsCount = shops.filter(
      (s) =>
        Boolean(s.isLocked || s.status === 'lock' || s.status === 'locked') &&
        Boolean(s.lockAppeal && s.lockAppeal.status === 'PENDING')
    ).length;
    const approvedKyc = shops.filter((s) => s.kycStatus === 'APPROVED').length;
    const pendingKyc = shops.filter((s) => s.kycStatus === 'PENDING').length;
    const totalProducts = shops.reduce((acc, s) => acc + (s.totalProducts || 0), 0);

    return {
      total,
      activeCount,
      lockedCount,
      appealsCount,
      approvedKyc,
      pendingKyc,
      totalProducts,
    };
  }, [shops]);

  // Filtered Shops
  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      const isLocked = Boolean(shop.isLocked) || shop.status === 'lock' || shop.status === 'locked';
      const hasPendingAppeal = isLocked && Boolean(shop.lockAppeal && shop.lockAppeal.status === 'PENDING');

      if (activeTab === 'ACTIVE' && isLocked) return false;
      if (activeTab === 'LOCKED' && !isLocked) return false;
      if (activeTab === 'APPEALS' && !hasPendingAppeal) return false;
      if (activeTab === 'KYC_APPROVED' && shop.kycStatus !== 'APPROVED') return false;
      if (activeTab === 'KYC_PENDING' && shop.kycStatus !== 'PENDING') return false;
      if (
        activeTab === 'KYC_UNVERIFIED' &&
        shop.kycStatus !== null &&
        shop.kycStatus !== undefined &&
        shop.kycStatus !== 'REJECTED'
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (shop.shopProfile?.shopName || '').toLowerCase().includes(q);
        const matchOwner = (shop.fullName || '').toLowerCase().includes(q);
        const matchEmail = (shop.email || '').toLowerCase().includes(q);
        const matchPhone = (shop.phoneNumber || '').toLowerCase().includes(q);
        const matchCity = (shop.shopProfile?.cityRegion || shop.address?.province || '').toLowerCase().includes(q);

        if (!matchName && !matchOwner && !matchEmail && !matchPhone && !matchCity) {
          return false;
        }
      }

      return true;
    });
  }, [shops, activeTab, searchQuery]);

  // Handle open shop detail
  const handleOpenDetail = async (shop: ShopOwnerItem) => {
    setInspectingShop(shop);
    setDetailModalTab('INFO');
    setIsLoadingDetail(true);
    try {
      const res = await getShopDetailAdminApi(shop._id);
      setInspectingDetail({
        rentProducts: res.rentProducts || [],
        thriftListings: res.thriftListings || [],
        recentOrders: res.recentOrders || [],
        kycRecord: (res as any).kycRecord || null,
      });
    } catch {
      setInspectingDetail({
        rentProducts: [],
        thriftListings: [],
        recentOrders: [],
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Direct unlock
  const handleDirectUnlock = (shop: ShopOwnerItem) => {
    Alert.alert(
      'Mở khóa Shop',
      `Bạn có chắc chắn muốn mở khóa kinh doanh cho Cửa hàng "${shop.shopProfile?.shopName || shop.fullName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Mở khóa ngay',
          onPress: async () => {
            try {
              await toggleUserLockApi(shop._id, false);
              setShops((prev) =>
                prev.map((s) =>
                  s._id === shop._id ? { ...s, status: 'ACTIVE', isLocked: false, lockReason: '' } : s
                )
              );
              if (inspectingShop && inspectingShop._id === shop._id) {
                setInspectingShop((prev) =>
                  prev ? { ...prev, status: 'ACTIVE', isLocked: false, lockReason: '' } : null
                );
              }
              Alert.alert('Thành công', 'Đã mở khóa tài khoản Cửa hàng thành công!');
            } catch (err: any) {
              Alert.alert('Lỗi', err?.response?.data?.message || err?.message || 'Không thể mở khóa lúc này.');
            }
          },
        },
      ]
    );
  };

  // Confirm Lock
  const handleConfirmLock = async () => {
    if (!lockingShop) return;
    setIsSubmittingLock(true);
    try {
      await toggleUserLockApi(lockingShop._id, true, lockReason);
      setShops((prev) =>
        prev.map((s) =>
          s._id === lockingShop._id
            ? {
                ...s,
                status: 'lock',
                isLocked: true,
                lockReason,
                lockedAt: new Date().toISOString(),
                lockAppeal: null,
              }
            : s
        )
      );
      if (inspectingShop && inspectingShop._id === lockingShop._id) {
        setInspectingShop((prev) =>
          prev
            ? {
                ...prev,
                status: 'lock',
                isLocked: true,
                lockReason,
                lockedAt: new Date().toISOString(),
                lockAppeal: null,
              }
            : null
        );
      }
      setLockingShop(null);
      Alert.alert('Thành công', 'Đã tạm khóa tài khoản Shop thành công!');
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || err?.message || 'Không thể khóa tài khoản lúc này.');
    } finally {
      setIsSubmittingLock(false);
    }
  };

  // Submit appeal reply
  const handleSubmitAppeal = async () => {
    if (!appealShop) return;
    setIsSubmittingAppeal(true);
    try {
      await respondUserAppealApi(appealShop._id, {
        adminReply,
        unlock: unlockDecision,
      });

      setShops((prev) =>
        prev.map((s) => {
          if (s._id !== appealShop._id) return s;
          return {
            ...s,
            status: unlockDecision ? 'ACTIVE' : s.status,
            isLocked: unlockDecision ? false : s.isLocked,
            lockAppeal: s.lockAppeal
              ? {
                  ...s.lockAppeal,
                  status: unlockDecision ? 'RESOLVED' : 'REJECTED',
                  reply: adminReply,
                  respondedAt: new Date().toISOString(),
                }
              : null,
          };
        })
      );

      if (inspectingShop && inspectingShop._id === appealShop._id) {
        setInspectingShop((prev) =>
          prev
            ? {
                ...prev,
                status: unlockDecision ? 'ACTIVE' : prev.status,
                isLocked: unlockDecision ? false : prev.isLocked,
                lockAppeal: prev.lockAppeal
                  ? {
                      ...prev.lockAppeal,
                      status: unlockDecision ? 'RESOLVED' : 'REJECTED',
                      reply: adminReply,
                      respondedAt: new Date().toISOString(),
                    }
                  : null,
              }
            : null
        );
      }

      setAppealShop(null);
      Alert.alert(
        'Thành công',
        unlockDecision
          ? 'Đã duyệt khiếu nại và mở khóa tài khoản Shop thành công!'
          : 'Đã từ chối khiếu nại mở khóa.'
      );
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || err?.message || 'Không thể xử lý khiếu nại.');
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  // Quick KYC Review
  const handleReviewKyc = async (status: 'APPROVED' | 'REJECTED') => {
    if (!reviewingKycShop) return;
    if (status === 'REJECTED' && !rejectionReasonInput.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập lý do từ chối hồ sơ KYC.');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await reviewShopKycApi(reviewingKycShop._id, {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReasonInput.trim() : undefined,
      });

      setShops((prev) =>
        prev.map((s) => (s._id === reviewingKycShop._id ? { ...s, kycStatus: status } : s))
      );
      if (inspectingShop && inspectingShop._id === reviewingKycShop._id) {
        setInspectingShop((prev) => (prev ? { ...prev, kycStatus: status } : null));
      }

      setReviewingKycShop(null);
      setRejectionReasonInput('');
      Alert.alert(
        'Thành công',
        status === 'APPROVED'
          ? 'Đã phê duyệt KYC Cửa hàng thành công!'
          : 'Đã từ chối hồ sơ KYC và gửi lý do tới Shop Owner.'
      );
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || err?.message || 'Không thể cập nhật trạng thái KYC.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <View style={styles.container}>
      <AdminHeader
        title="Quản lý Shop Owner"
        subtitle="Giám sát đối tác kinh doanh, kiểm duyệt KYC và xử lý tài khoản"
      />

      <FlatList
        data={filteredShops}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Metric Cards Row */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.metricsRow}
            >
              <View style={[styles.metricCard, { borderLeftColor: '#3B82F6' }]}>
                <Text style={styles.metricLabel}>Tổng Shop</Text>
                <Text style={styles.metricVal}>{metrics.total}</Text>
                <Text style={styles.metricSub}>Đối tác ReUse Hub</Text>
              </View>

              <View style={[styles.metricCard, { borderLeftColor: '#10B981' }]}>
                <Text style={styles.metricLabel}>Hoạt động</Text>
                <Text style={[styles.metricVal, { color: '#059669' }]}>{metrics.activeCount}</Text>
                <Text style={styles.metricSub}>Đang kinh doanh</Text>
              </View>

              <View style={[styles.metricCard, { borderLeftColor: '#EF4444' }]}>
                <Text style={styles.metricLabel}>Đang khóa</Text>
                <Text style={[styles.metricVal, { color: '#DC2626' }]}>{metrics.lockedCount}</Text>
                <Text style={styles.metricSub}>Cần rà soát</Text>
              </View>

              <View style={[styles.metricCard, { borderLeftColor: '#F59E0B' }]}>
                <Text style={styles.metricLabel}>Khiếu nại</Text>
                <Text style={[styles.metricVal, { color: '#D97706' }]}>{metrics.appealsCount}</Text>
                <Text style={styles.metricSub}>Chờ xem xét</Text>
              </View>

              <View style={[styles.metricCard, { borderLeftColor: '#8B5CF6' }]}>
                <Text style={styles.metricLabel}>KYC Đã duyệt</Text>
                <Text style={[styles.metricVal, { color: '#7C3AED' }]}>{metrics.approvedKyc}</Text>
                <Text style={styles.metricSub}>Xác thực CCCD</Text>
              </View>

              <View style={[styles.metricCard, { borderLeftColor: '#EC4899' }]}>
                <Text style={styles.metricLabel}>KYC Chờ duyệt</Text>
                <Text style={[styles.metricVal, { color: '#DB2777' }]}>{metrics.pendingKyc}</Text>
                <Text style={styles.metricSub}>Cần thẩm định</Text>
              </View>
            </ScrollView>

            {/* Search Input */}
            <View style={styles.searchWrap}>
              <Feather name="search" size={16} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm theo tên shop, chủ shop, email, SĐT, tỉnh thành..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Feather name="x" size={16} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Filter Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsWrap}
            >
              {FILTER_TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                    onPress={() => setActiveTab(tab.key)}
                  >
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        }
        renderItem={({ item }) => {
          const isLocked = Boolean(item.isLocked) || item.status === 'lock' || item.status === 'locked';
          const hasPendingAppeal = isLocked && Boolean(item.lockAppeal && item.lockAppeal.status === 'PENDING');
          const shopName = item.shopProfile?.shopName || item.fullName || 'Cửa hàng ReUse';
          const city = item.shopProfile?.cityRegion || item.address?.province || 'Chưa cập nhật';
          const rentCount = item.totalRentProducts || 0;
          const thriftCount = item.totalThriftProducts || 0;
          const totalOrders = item.completedOrdersCount || 0;

          return (
            <View style={styles.shopCard}>
              {/* Header row */}
              <View style={styles.shopCardHeader}>
                <View style={styles.avatarWrap}>
                  {item.avatarUrl || item.shopProfile?.coverUrl ? (
                    <Image
                      source={{ uri: normalizeImageUrl(item.avatarUrl || item.shopProfile?.coverUrl || '') }}
                      style={styles.avatarImg}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarInitial}>
                        {(shopName || 'S').slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.shopMainInfo}>
                  <View style={styles.shopTitleRow}>
                    <Text style={styles.shopTitle} numberOfLines={1}>
                      {shopName}
                    </Text>
                    <View style={styles.shopRoleBadge}>
                      <Text style={styles.shopRoleText}>SHOP</Text>
                    </View>
                  </View>

                  <Text style={styles.ownerSubText} numberOfLines={1}>
                    Chủ sở hữu: <Text style={{ fontWeight: '600', color: '#1E293B' }}>{item.fullName}</Text>
                  </Text>
                  <Text style={styles.contactSubText} numberOfLines={1}>
                    {item.email} {item.phoneNumber ? `· ${item.phoneNumber}` : ''}
                  </Text>
                  <Text style={styles.citySubText} numberOfLines={1}>
                    <Feather name="map-pin" size={11} color="#64748B" /> {city}
                  </Text>
                </View>
              </View>

              {/* Status Badges Row */}
              <View style={styles.badgesRow}>
                {/* Lock Status */}
                {isLocked ? (
                  <View style={[styles.badgePill, styles.badgeRed]}>
                    <Feather name="lock" size={11} color="#DC2626" />
                    <Text style={[styles.badgeText, { color: '#DC2626' }]}>ĐANG BỊ KHÓA</Text>
                  </View>
                ) : (
                  <View style={[styles.badgePill, styles.badgeGreen]}>
                    <Feather name="check-circle" size={11} color="#059669" />
                    <Text style={[styles.badgeText, { color: '#059669' }]}>HOẠT ĐỘNG</Text>
                  </View>
                )}

                {/* KYC Status */}
                {item.kycStatus === 'APPROVED' ? (
                  <View style={[styles.badgePill, styles.badgePurple]}>
                    <Ionicons name="shield-checkmark" size={12} color="#7C3AED" />
                    <Text style={[styles.badgeText, { color: '#7C3AED' }]}>ĐÃ DUYỆT KYC</Text>
                  </View>
                ) : item.kycStatus === 'PENDING' ? (
                  <View style={[styles.badgePill, styles.badgeOrange]}>
                    <Feather name="clock" size={11} color="#D97706" />
                    <Text style={[styles.badgeText, { color: '#D97706' }]}>CHỜ DUYỆT KYC</Text>
                  </View>
                ) : (
                  <View style={[styles.badgePill, styles.badgeGray]}>
                    <Feather name="help-circle" size={11} color="#64748B" />
                    <Text style={[styles.badgeText, { color: '#64748B' }]}>CHƯA XÁC MINH</Text>
                  </View>
                )}

                {/* Appeal alert */}
                {hasPendingAppeal && (
                  <View style={[styles.badgePill, styles.badgeAmber]}>
                    <Feather name="alert-circle" size={11} color="#B45309" />
                    <Text style={[styles.badgeText, { color: '#B45309' }]}>CÓ KHIẾU NẠI</Text>
                  </View>
                )}
              </View>

              {/* Stats Bar */}
              <View style={styles.statsBar}>
                <View style={styles.statCol}>
                  <Text style={styles.statNum}>{rentCount}</Text>
                  <Text style={styles.statLbl}>Đồ RENT</Text>
                </View>
                <View style={styles.statDiv} />
                <View style={styles.statCol}>
                  <Text style={styles.statNum}>{thriftCount}</Text>
                  <Text style={styles.statLbl}>Đồ THRIFT</Text>
                </View>
                <View style={styles.statDiv} />
                <View style={styles.statCol}>
                  <Text style={styles.statNum}>{totalOrders}</Text>
                  <Text style={styles.statLbl}>Đơn hàng</Text>
                </View>
                {item.walletBalance !== undefined && (
                  <>
                    <View style={styles.statDiv} />
                    <View style={styles.statCol}>
                      <Text style={[styles.statNum, { color: '#059669', fontSize: 13 }]}>
                        {formatCurrency(item.walletBalance)}
                      </Text>
                      <Text style={styles.statLbl}>Số dư ví</Text>
                    </View>
                  </>
                )}
              </View>

              {/* Action Buttons Row */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  onPress={() => handleOpenDetail(item)}
                >
                  <Feather name="eye" size={13} color="#334155" />
                  <Text style={styles.actionBtnSecondaryText}>Chi tiết</Text>
                </TouchableOpacity>

                {item.kycStatus === 'PENDING' && (
                  <TouchableOpacity
                    style={[styles.actionBtnSecondary, { borderColor: '#DDD6FE', backgroundColor: '#F5F3FF' }]}
                    onPress={() => setReviewingKycShop(item)}
                  >
                    <Ionicons name="shield-checkmark-outline" size={13} color="#7C3AED" />
                    <Text style={[styles.actionBtnSecondaryText, { color: '#7C3AED' }]}>Duyệt KYC</Text>
                  </TouchableOpacity>
                )}

                {hasPendingAppeal && (
                  <TouchableOpacity
                    style={[styles.actionBtnSecondary, { borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }]}
                    onPress={() => setAppealShop(item)}
                  >
                    <Feather name="message-square" size={13} color="#D97706" />
                    <Text style={[styles.actionBtnSecondaryText, { color: '#D97706' }]}>Xem khiếu nại</Text>
                  </TouchableOpacity>
                )}

                {isLocked ? (
                  <TouchableOpacity
                    style={[styles.actionBtnSecondary, { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' }]}
                    onPress={() => handleDirectUnlock(item)}
                  >
                    <Feather name="unlock" size={13} color="#059669" />
                    <Text style={[styles.actionBtnSecondaryText, { color: '#059669' }]}>Mở khóa</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionBtnSecondary, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}
                    onPress={() => setLockingShop(item)}
                  >
                    <Feather name="lock" size={13} color="#DC2626" />
                    <Text style={[styles.actionBtnSecondaryText, { color: '#DC2626' }]}>Khóa shop</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="storefront-remove-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Không tìm thấy cửa hàng nào</Text>
              <Text style={styles.emptySub}>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái</Text>
            </View>
          ) : (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color="#1E293B" />
              <Text style={styles.loadingText}>Đang nạp danh sách đối tác Shop Owner...</Text>
            </View>
          )
        }
      />

      {/* ================= MODAL CHI TIẾT SHOP ================= */}
      <Modal
        visible={Boolean(inspectingShop)}
        animationType="slide"
        onRequestClose={() => setInspectingShop(null)}
      >
        <SafeAreaView style={styles.modalFullRoot} edges={['top', 'bottom']}>
          {/* Modal Header */}
          <View style={styles.modalHeaderTop}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.modalMainTitle} numberOfLines={1}>
                {inspectingShop?.shopProfile?.shopName || inspectingShop?.fullName}
              </Text>
              <Text style={styles.modalMainSub}>Hồ sơ đối tác kinh doanh & thẩm định</Text>
            </View>
            <TouchableOpacity
              onPress={() => setInspectingShop(null)}
              style={styles.modalCloseBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Feather name="x" size={22} color="#1E293B" />
            </TouchableOpacity>
          </View>

          {/* Modal Tabs */}
          <View style={styles.modalTabsBar}>
            <TouchableOpacity
              style={[styles.modalTabBtn, detailModalTab === 'INFO' && styles.modalTabBtnActive]}
              onPress={() => setDetailModalTab('INFO')}
            >
              <Text
                style={[styles.modalTabBtnText, detailModalTab === 'INFO' && styles.modalTabBtnTextActive]}
              >
                Thông tin chung
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalTabBtn, detailModalTab === 'KYC' && styles.modalTabBtnActive]}
              onPress={() => setDetailModalTab('KYC')}
            >
              <Text
                style={[styles.modalTabBtnText, detailModalTab === 'KYC' && styles.modalTabBtnTextActive]}
              >
                Hồ sơ KYC
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalTabBtn, detailModalTab === 'PRODUCTS' && styles.modalTabBtnActive]}
              onPress={() => setDetailModalTab('PRODUCTS')}
            >
              <Text
                style={[styles.modalTabBtnText, detailModalTab === 'PRODUCTS' && styles.modalTabBtnTextActive]}
              >
                Sản phẩm & Đơn ({inspectingDetail ? inspectingDetail.rentProducts.length + inspectingDetail.thriftListings.length : 0})
              </Text>
            </TouchableOpacity>
          </View>

          {isLoadingDetail ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color="#1E293B" />
              <Text style={styles.loadingText}>Đang tải chi tiết hồ sơ cửa hàng...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {detailModalTab === 'INFO' && (
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionHeaderTitle}>Thông tin Cửa hàng</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Tên thương mại:</Text>
                    <Text style={styles.infoVal}>
                      {inspectingShop?.shopProfile?.shopName || 'Chưa đặt tên shop'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Chủ đại diện:</Text>
                    <Text style={styles.infoVal}>{inspectingShop?.fullName}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Email:</Text>
                    <Text style={styles.infoVal}>{inspectingShop?.email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Số điện thoại:</Text>
                    <Text style={styles.infoVal}>{inspectingShop?.phoneNumber || 'Chưa cập nhật'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Khu vực / Tỉnh thành:</Text>
                    <Text style={styles.infoVal}>
                      {inspectingShop?.shopProfile?.cityRegion || inspectingShop?.address?.province || 'Toàn quốc'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Địa chỉ kho / xuất hàng:</Text>
                    <Text style={styles.infoVal}>
                      {inspectingShop?.shopProfile?.businessAddress || inspectingShop?.address?.detail || 'Chưa khai báo'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Mô tả / Giới thiệu:</Text>
                    <Text style={styles.infoVal}>
                      {inspectingShop?.shopProfile?.description || 'Chưa có mô tả cửa hàng'}
                    </Text>
                  </View>
                  {inspectingShop?.lockReason ? (
                    <View style={[styles.infoRow, { backgroundColor: '#FEF2F2', padding: 8, borderRadius: 6 }]}>
                      <Text style={[styles.infoKey, { color: '#DC2626' }]}>Lý do khóa:</Text>
                      <Text style={[styles.infoVal, { color: '#DC2626' }]}>{inspectingShop.lockReason}</Text>
                    </View>
                  ) : null}
                </View>
              )}

              {detailModalTab === 'KYC' && (
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionHeaderTitle}>Xác minh Căn cước công dân (KYC)</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Trạng thái KYC:</Text>
                    <Text
                      style={[
                        styles.infoVal,
                        inspectingShop?.kycStatus === 'APPROVED'
                          ? { color: '#059669', fontWeight: '700' }
                          : inspectingShop?.kycStatus === 'PENDING'
                          ? { color: '#D97706', fontWeight: '700' }
                          : { color: '#64748B' },
                      ]}
                    >
                      {inspectingShop?.kycStatus === 'APPROVED'
                        ? 'ĐÃ DUYỆT HỢP CHUẨN'
                        : inspectingShop?.kycStatus === 'PENDING'
                        ? 'CHỜ BAN QUẢN TRỊ DUYỆT'
                        : 'CHƯA GỬI HỒ SƠ KYC'}
                    </Text>
                  </View>

                  {inspectingShop?.kycRecord?.idCardNumber || inspectingShop?.kyc?.citizenId ? (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoKey}>Số CCCD/CMND:</Text>
                      <Text style={[styles.infoVal, { fontWeight: '700' }]}>
                        {inspectingShop?.kycRecord?.idCardNumber || inspectingShop?.kyc?.citizenId}
                      </Text>
                    </View>
                  ) : null}

                  {inspectingShop?.kycRecord?.dob || inspectingShop?.kyc?.dob ? (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoKey}>Ngày sinh:</Text>
                      <Text style={styles.infoVal}>
                        {inspectingShop?.kycRecord?.dob || inspectingShop?.kyc?.dob}
                      </Text>
                    </View>
                  ) : null}

                  {inspectingShop?.kycRecord?.residentAddress || inspectingShop?.kyc?.residentAddress ? (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoKey}>Địa chỉ thường trú:</Text>
                      <Text style={styles.infoVal}>
                        {inspectingShop?.kycRecord?.residentAddress || inspectingShop?.kyc?.residentAddress}
                      </Text>
                    </View>
                  ) : null}

                  {/* CCCD Images */}
                  <View style={{ marginTop: 14 }}>
                    <Text style={styles.fieldSubTitle}>Ảnh chụp Căn cước công dân:</Text>
                    <View style={styles.cccdRow}>
                      <TouchableOpacity
                        style={styles.cccdBox}
                        onPress={() => {
                          const url =
                            inspectingShop?.kycRecord?.frontImageUrl ||
                            inspectingShop?.kyc?.cardFrontUrl;
                          if (url) setPreviewImageUrl(url);
                        }}
                      >
                        <Text style={styles.cccdLabel}>MẶT TRƯỚC CCCD</Text>
                        {inspectingShop?.kycRecord?.frontImageUrl || inspectingShop?.kyc?.cardFrontUrl ? (
                          <Image
                            source={{
                              uri: normalizeImageUrl(
                                inspectingShop?.kycRecord?.frontImageUrl ||
                                  inspectingShop?.kyc?.cardFrontUrl ||
                                  ''
                              ),
                            }}
                            style={styles.cccdImg}
                          />
                        ) : (
                          <View style={styles.cccdEmpty}>
                            <Feather name="image" size={24} color="#CBD5E1" />
                            <Text style={styles.cccdEmptyText}>Chưa có ảnh</Text>
                          </View>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cccdBox}
                        onPress={() => {
                          const url =
                            inspectingShop?.kycRecord?.backImageUrl ||
                            inspectingShop?.kyc?.cardBackUrl;
                          if (url) setPreviewImageUrl(url);
                        }}
                      >
                        <Text style={styles.cccdLabel}>MẶT SAU CCCD</Text>
                        {inspectingShop?.kycRecord?.backImageUrl || inspectingShop?.kyc?.cardBackUrl ? (
                          <Image
                            source={{
                              uri: normalizeImageUrl(
                                inspectingShop?.kycRecord?.backImageUrl ||
                                  inspectingShop?.kyc?.cardBackUrl ||
                                  ''
                              ),
                            }}
                            style={styles.cccdImg}
                          />
                        ) : (
                          <View style={styles.cccdEmpty}>
                            <Feather name="image" size={24} color="#CBD5E1" />
                            <Text style={styles.cccdEmptyText}>Chưa có ảnh</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* KYC Action in modal */}
                  {inspectingShop?.kycStatus === 'PENDING' && (
                    <View style={styles.modalKycActionRow}>
                      <TouchableOpacity
                        style={[styles.modalActionBtn, { backgroundColor: '#10B981' }]}
                        onPress={() => {
                          setReviewingKycShop(inspectingShop);
                        }}
                      >
                        <Feather name="check" size={15} color="#FFF" />
                        <Text style={styles.modalActionBtnText}>Duyệt hồ sơ KYC ngay</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {detailModalTab === 'PRODUCTS' && (
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionHeaderTitle}>Sản phẩm RENT & THRIFT của Shop</Text>
                  {inspectingDetail && inspectingDetail.rentProducts.length > 0 ? (
                    <View style={{ marginBottom: 16 }}>
                      <Text style={styles.subListTitle}>Sản phẩm Cho Thuê RENT ({inspectingDetail.rentProducts.length}):</Text>
                      {inspectingDetail.rentProducts.slice(0, 10).map((p: any, i) => (
                        <View key={p._id || i} style={styles.miniItemRow}>
                          <Text style={styles.miniItemName} numberOfLines={1}>
                            • {p.name}
                          </Text>
                          <Text style={styles.miniItemPrice}>
                            {formatCurrency(p.pricePerDay || p.price)}/ngày
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {inspectingDetail && inspectingDetail.thriftListings.length > 0 ? (
                    <View style={{ marginBottom: 16 }}>
                      <Text style={styles.subListTitle}>Mặt hàng Bán đứt THRIFT ({inspectingDetail.thriftListings.length}):</Text>
                      {inspectingDetail.thriftListings.slice(0, 10).map((t: any, i) => (
                        <View key={t._id || i} style={styles.miniItemRow}>
                          <Text style={styles.miniItemName} numberOfLines={1}>
                            • {t.name || t.title}
                          </Text>
                          <Text style={[styles.miniItemPrice, { color: '#7C3AED' }]}>
                            {formatCurrency(t.price)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {(!inspectingDetail || (inspectingDetail.rentProducts.length === 0 && inspectingDetail.thriftListings.length === 0)) && (
                    <Text style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginVertical: 20 }}>
                      Cửa hàng hiện chưa niêm yết sản phẩm nào trên sàn.
                    </Text>
                  )}
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* ================= MODAL KHÓA SHOP ================= */}
      <Modal
        visible={Boolean(lockingShop)}
        transparent
        animationType="fade"
        onRequestClose={() => setLockingShop(null)}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogCard}>
            <View style={styles.dialogHeader}>
              <Feather name="alert-triangle" size={20} color="#DC2626" />
              <Text style={styles.dialogTitle}>Khóa Tài Khoản Cửa Hàng</Text>
            </View>
            <Text style={styles.dialogSubtitle}>
              Khi khóa, Cửa hàng sẽ bị tạm ngừng quyền đăng sản phẩm và hiển thị trên sàn tìm kiếm.
            </Text>

            <Text style={styles.inputLabel}>Lý do tạm khóa:</Text>
            <TextInput
              style={styles.dialogInput}
              multiline
              numberOfLines={3}
              value={lockReason}
              onChangeText={setLockReason}
              placeholder="Nhập lý do khóa gửi tới chủ cửa hàng..."
            />

            <View style={styles.dialogBtnRow}>
              <TouchableOpacity
                style={styles.dialogCancelBtn}
                onPress={() => setLockingShop(null)}
                disabled={isSubmittingLock}
              >
                <Text style={styles.dialogCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dialogConfirmBtn, { backgroundColor: '#DC2626' }]}
                onPress={handleConfirmLock}
                disabled={isSubmittingLock}
              >
                {isSubmittingLock ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.dialogConfirmText}>Xác nhận khóa</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL PHẢN HỒI KHIẾU NẠI ================= */}
      <Modal
        visible={Boolean(appealShop)}
        transparent
        animationType="fade"
        onRequestClose={() => setAppealShop(null)}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogCard}>
            <View style={styles.dialogHeader}>
              <Feather name="message-square" size={20} color="#D97706" />
              <Text style={styles.dialogTitle}>Xử lý Khiếu nại Mở khóa</Text>
            </View>

            <View style={styles.appealBox}>
              <Text style={styles.appealBoxTitle}>Nội dung giải trình của Shop:</Text>
              <Text style={styles.appealBoxContent}>
                {appealShop?.lockAppeal?.question || 'Cửa hàng đề nghị Ban Quản trị xem xét mở lại quyền hoạt động.'}
              </Text>
            </View>

            <Text style={styles.inputLabel}>Quyết định xử lý:</Text>
            <View style={styles.decisionRow}>
              <TouchableOpacity
                style={[styles.decisionBtn, unlockDecision && styles.decisionBtnActiveGreen]}
                onPress={() => setUnlockDecision(true)}
              >
                <Feather name="check-circle" size={14} color={unlockDecision ? '#059669' : '#64748B'} />
                <Text style={[styles.decisionText, unlockDecision && { color: '#059669', fontWeight: '700' }]}>
                  Chấp thuận & Mở khóa
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.decisionBtn, !unlockDecision && styles.decisionBtnActiveRed]}
                onPress={() => setUnlockDecision(false)}
              >
                <Feather name="x-circle" size={14} color={!unlockDecision ? '#DC2626' : '#64748B'} />
                <Text style={[styles.decisionText, !unlockDecision && { color: '#DC2626', fontWeight: '700' }]}>
                  Bác đơn khiếu nại
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Phản hồi gửi Cửa hàng:</Text>
            <TextInput
              style={styles.dialogInput}
              multiline
              numberOfLines={3}
              value={adminReply}
              onChangeText={setAdminReply}
            />

            <View style={styles.dialogBtnRow}>
              <TouchableOpacity
                style={styles.dialogCancelBtn}
                onPress={() => setAppealShop(null)}
                disabled={isSubmittingAppeal}
              >
                <Text style={styles.dialogCancelText}>Đóng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dialogConfirmBtn, { backgroundColor: unlockDecision ? '#059669' : '#DC2626' }]}
                onPress={handleSubmitAppeal}
                disabled={isSubmittingAppeal}
              >
                {isSubmittingAppeal ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.dialogConfirmText}>Gửi phản hồi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL DUYỆT KYC ================= */}
      <Modal
        visible={Boolean(reviewingKycShop)}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewingKycShop(null)}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogCard}>
            <View style={styles.dialogHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#7C3AED" />
              <Text style={styles.dialogTitle}>Thẩm định KYC Cửa hàng</Text>
            </View>
            <Text style={styles.dialogSubtitle}>
              Xác minh tính chính danh căn cước của Shop "{reviewingKycShop?.shopProfile?.shopName || reviewingKycShop?.fullName}"
            </Text>

            <Text style={styles.inputLabel}>Lý do từ chối (nếu không đạt chuẩn):</Text>
            <TextInput
              style={styles.dialogInput}
              multiline
              numberOfLines={2}
              value={rejectionReasonInput}
              onChangeText={setRejectionReasonInput}
              placeholder="VD: Ảnh CCCD bị mờ, lóa sáng hoặc số CCCD không khớp..."
            />

            <View style={styles.dialogBtnRow}>
              <TouchableOpacity
                style={[styles.dialogConfirmBtn, { backgroundColor: '#DC2626' }]}
                onPress={() => handleReviewKyc('REJECTED')}
                disabled={isSubmittingReview}
              >
                <Text style={styles.dialogConfirmText}>Từ chối</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dialogConfirmBtn, { backgroundColor: '#059669' }]}
                onPress={() => handleReviewKyc('APPROVED')}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.dialogConfirmText}>Duyệt hợp chuẩn</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL PREVIEW ẢNH ================= */}
      <Modal
        visible={Boolean(previewImageUrl)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImageUrl(null)}
      >
        <View style={styles.previewImageOverlay}>
          <TouchableOpacity
            style={[styles.previewCloseBtn, { top: Math.max(insets.top + 10, 50) }]}
            onPress={() => setPreviewImageUrl(null)}
          >
            <Feather name="x" size={24} color="#FFF" />
          </TouchableOpacity>
          {previewImageUrl ? (
            <Image
              source={{ uri: normalizeImageUrl(previewImageUrl) }}
              style={styles.fullPreviewImg}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
};

export default ShopManagementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    paddingBottom: 40,
  },
  metricsRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 125,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 2,
  },
  metricSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  tabsWrap: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  shopCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  shopCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  shopMainInfo: {
    flex: 1,
  },
  shopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  shopTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  shopRoleBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shopRoleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
  },
  ownerSubText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  contactSubText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  citySubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeGreen: {
    backgroundColor: '#ECFDF5',
  },
  badgeRed: {
    backgroundColor: '#FEF2F2',
  },
  badgePurple: {
    backgroundColor: '#F5F3FF',
  },
  badgeOrange: {
    backgroundColor: '#FFFBEB',
  },
  badgeGray: {
    backgroundColor: '#F1F5F9',
  },
  badgeAmber: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  statLbl: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  statDiv: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionBtnSecondaryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  centerLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  // Modal Full
  modalFullRoot: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalMainSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalTabsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  modalTabBtnActive: {
    borderBottomColor: '#0F172A',
  },
  modalTabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  modalTabBtnTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  modalScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoKey: {
    width: 130,
    fontSize: 12,
    color: '#64748B',
  },
  infoVal: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '500',
  },
  fieldSubTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  cccdRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cccdBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    alignItems: 'center',
  },
  cccdLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  cccdImg: {
    width: '100%',
    height: 90,
    borderRadius: 6,
    resizeMode: 'cover',
  },
  cccdEmpty: {
    width: '100%',
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cccdEmptyText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  modalKycActionRow: {
    marginTop: 16,
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subListTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  miniItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  miniItemName: {
    flex: 1,
    fontSize: 12,
    color: '#1E293B',
    marginRight: 8,
  },
  miniItemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  // Dialogs
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  dialogSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  dialogInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    color: '#0F172A',
    textAlignVertical: 'top',
  },
  dialogBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  dialogCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  dialogCancelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  dialogConfirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dialogConfirmText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  appealBox: {
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 10,
  },
  appealBoxTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 4,
  },
  appealBoxContent: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 16,
  },
  decisionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  decisionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  decisionBtnActiveGreen: {
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  decisionBtnActiveRed: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  decisionText: {
    fontSize: 11,
    color: '#64748B',
  },
  // Preview
  previewImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  fullPreviewImg: {
    width: '92%',
    height: '75%',
  },
});

