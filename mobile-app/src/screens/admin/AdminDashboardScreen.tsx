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
import { Feather, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminHeader from '../../components/layout/AdminHeader';
import {
  fetchAdminDashboardData,
  approveRentListingApi,
  rejectRentListingApi,
  approveThriftListingApi,
  rejectThriftListingApi,
  AdminDashboardData,
  RentListingItem,
  ThriftListingItem,
} from '../../services/admin.api';
import { normalizeImageUrl } from '../../utils/imageUrl';

const formatVND = (amount: number) => {
  return (amount || 0).toLocaleString('vi-VN') + ' đ';
};

export const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetchAdminDashboardData();
      setData(res);
    } catch (err) {
      console.warn('Lỗi tải dữ liệu admin dashboard:', err);
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

  const handleApproveRent = async (item: RentListingItem) => {
    setProcessingId(item.id);
    try {
      await approveRentListingApi(item.id);
      Alert.alert('Thành công', `Đã duyệt sản phẩm RENT: "${item.name}"`);
      loadData();
    } catch {
      Alert.alert('Lỗi', 'Không thể duyệt sản phẩm');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRent = (item: RentListingItem) => {
    Alert.prompt
      ? Alert.prompt(
          'Từ chối sản phẩm RENT',
          'Vui lòng nhập lý do từ chối gửi Shop Owner:',
          async (reason) => {
            if (!reason || !reason.trim()) return;
            setProcessingId(item.id);
            try {
              await rejectRentListingApi(item.id, reason.trim());
              Alert.alert('Thành công', 'Đã từ chối sản phẩm');
              loadData();
            } catch {
              Alert.alert('Lỗi', 'Không thể từ chối');
            } finally {
              setProcessingId(null);
            }
          }
        )
      : (async () => {
          setProcessingId(item.id);
          try {
            await rejectRentListingApi(item.id, 'Hình ảnh hoặc thông tin sản phẩm không đáp ứng tiêu chuẩn kiểm định');
            Alert.alert('Đã từ chối', 'Đã từ chối sản phẩm kiểm định.');
            loadData();
          } catch {
            Alert.alert('Lỗi', 'Không thể từ chối');
          } finally {
            setProcessingId(null);
          }
        })();
  };

  const handleApproveThrift = async (item: ThriftListingItem) => {
    setProcessingId(item.id);
    try {
      await approveThriftListingApi(item.id);
      Alert.alert('Thành công', `Đã duyệt tin thanh lý: "${item.name}"`);
      loadData();
    } catch {
      Alert.alert('Lỗi', 'Không thể duyệt tin thanh lý');
    } finally {
      setProcessingId(null);
    }
  };

  const metrics = data?.metrics || {
    totalUsers: 0,
    weeklyNewUsers: 0,
    pendingKycCount: 0,
    urgentKycCount: 0,
    pendingRentListingsCount: 0,
    rentAverageSlaHours: 0,
    pendingThriftListingsCount: 0,
    openDisputesCount: 0,
    lockedEscrowAmount: 0,
    totalPlatformRevenue: 0,
    monthlyVolume: 0,
  };

  const pendingRent = data?.rentApprovalList?.filter((l) => l.status === 'PENDING') || [];
  const pendingThrift = data?.thriftApprovalList?.filter((l) => l.status === 'PENDING') || [];

  return (
    <View style={styles.container}>
      <AdminHeader title="Bảng Điều Khiển Hệ Thống" subtitle="Trung tâm kiểm duyệt & điều phối sàn ReUse Hub" />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={styles.loadingText}>Đang tải dữ liệu từ MongoDB...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#D97706']} />}
        >
          {/* Section 1: KPI Metrics Grid */}
          <View style={styles.metricsGrid}>
            {/* Card 1: Users */}
            <TouchableOpacity
              style={styles.metricCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('UserManagement')}
            >
              <View style={[styles.metricIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Feather name="users" size={20} color="#2563EB" />
              </View>
              <Text style={styles.metricValue}>{metrics.totalUsers}</Text>
              <Text style={styles.metricLabel}>Tổng người dùng</Text>
              <Text style={styles.metricSub}>MongoDB Synced</Text>
            </TouchableOpacity>

            {/* Card 2: Pending RENT */}
            <TouchableOpacity
              style={styles.metricCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ListingApproval')}
            >
              <View style={[styles.metricIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Feather name="box" size={20} color="#D97706" />
              </View>
              <Text style={[styles.metricValue, { color: '#D97706' }]}>{metrics.pendingRentListingsCount}</Text>
              <Text style={styles.metricLabel}>Duyệt RENT</Text>
              <Text style={styles.metricSub}>Chờ kiểm định</Text>
            </TouchableOpacity>

            {/* Card 3: Pending THRIFT */}
            <TouchableOpacity
              style={styles.metricCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ThriftListingApproval')}
            >
              <View style={[styles.metricIconBox, { backgroundColor: '#F0FDF4' }]}>
                <Feather name="tag" size={20} color="#16A34A" />
              </View>
              <Text style={[styles.metricValue, { color: '#16A34A' }]}>{metrics.pendingThriftListingsCount}</Text>
              <Text style={styles.metricLabel}>Duyệt THRIFT</Text>
              <Text style={styles.metricSub}>Ký gửi & thanh lý</Text>
            </TouchableOpacity>

            {/* Card 4: Open Disputes */}
            <TouchableOpacity
              style={styles.metricCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('DisputeManagement')}
            >
              <View style={[styles.metricIconBox, { backgroundColor: '#FEE2E2' }]}>
                <Feather name="alert-triangle" size={20} color="#DC2626" />
              </View>
              <Text style={[styles.metricValue, { color: '#DC2626' }]}>{metrics.openDisputesCount}</Text>
              <Text style={styles.metricLabel}>Tranh chấp Escrow</Text>
              <Text style={styles.metricSub}>Cần trọng tài xử lý</Text>
            </TouchableOpacity>
          </View>

          {/* Section 2: Platform Finance Highlight */}
          <TouchableOpacity
            style={styles.financeBanner}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('PlatformFinance')}
          >
            <View style={styles.financeHeader}>
              <View style={styles.financeTitleGroup}>
                <MaterialIcons name="account-balance" size={20} color="#F59E0B" />
                <Text style={styles.financeTitle}>TÀI CHÍNH SMART ESCROW</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#94A3B8" />
            </View>

            <View style={styles.financeRow}>
              <View style={styles.financeCol}>
                <Text style={styles.financeLabel}>Tổng doanh thu nền tảng</Text>
                <Text style={styles.financeValue}>{formatVND(metrics.totalPlatformRevenue)}</Text>
              </View>
              <View style={[styles.financeCol, styles.financeColBorder]}>
                <Text style={styles.financeLabel}>Qũy Escrow đang bảo chứng</Text>
                <Text style={[styles.financeValue, { color: '#10B981' }]}>
                  {formatVND(metrics.lockedEscrowAmount || 3900000)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Section 3: Quick Navigation Actions */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Lối tắt quản trị nghiệp vụ</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => navigation.navigate('ListingApproval')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FFFBEB' }]}>
                <Feather name="check-circle" size={22} color="#D97706" />
              </View>
              <Text style={styles.quickActionTitle}>Duyệt RENT</Text>
              <Text style={styles.quickActionCount}>{metrics.pendingRentListingsCount} chờ duyệt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => navigation.navigate('ThriftListingApproval')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#ECFDF5' }]}>
                <Feather name="shopping-bag" size={22} color="#059669" />
              </View>
              <Text style={styles.quickActionTitle}>Duyệt THRIFT</Text>
              <Text style={styles.quickActionCount}>{metrics.pendingThriftListingsCount} chờ duyệt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => navigation.navigate('DisputeManagement')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FEF2F2' }]}>
                <Feather name="shield" size={22} color="#DC2626" />
              </View>
              <Text style={styles.quickActionTitle}>Tranh chấp</Text>
              <Text style={styles.quickActionCount}>{metrics.openDisputesCount} hồ sơ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => navigation.navigate('UserManagement')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#EFF6FF' }]}>
                <Feather name="user-check" size={22} color="#2563EB" />
              </View>
              <Text style={styles.quickActionTitle}>Quản lý User</Text>
              <Text style={styles.quickActionCount}>{metrics.totalUsers} thành viên</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => navigation.navigate('ShopManagement')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#F0FDF4' }]}>
                <Feather name="briefcase" size={22} color="#16A34A" />
              </View>
              <Text style={styles.quickActionTitle}>Quản lý Shop</Text>
              <Text style={styles.quickActionCount}>Đối tác & KYC</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => navigation.navigate('KycApproval')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FDF4FF' }]}>
                <MaterialCommunityIcons name="card-account-details-outline" size={22} color="#9333EA" />
              </View>
              <Text style={styles.quickActionTitle}>Thẩm định KYC</Text>
              <Text style={styles.quickActionCount}>{metrics.pendingKycCount} hồ sơ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => navigation.navigate('CategoryManagement')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#F8FAFC' }]}>
                <MaterialIcons name="category" size={22} color="#475569" />
              </View>
              <Text style={styles.quickActionTitle}>Danh mục</Text>
              <Text style={styles.quickActionCount}>Sàn lưu ký</Text>
            </TouchableOpacity>
          </View>

          {/* Section 4: Hàng đợi duyệt sản phẩm RENT (Chờ duyệt) */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <Text style={styles.sectionTitle}>Hàng đợi duyệt RENT</Text>
              <View style={styles.pillBadge}>
                <Text style={styles.pillBadgeText}>{pendingRent.length} chờ duyệt</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ListingApproval')}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {pendingRent.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-done-circle-outline" size={40} color="#10B981" />
              <Text style={styles.emptyTitle}>Hàng đợi RENT trống</Text>
              <Text style={styles.emptySub}>Toàn bộ sản phẩm cho thuê đã được phê duyệt hợp chuẩn.</Text>
            </View>
          ) : (
            pendingRent.slice(0, 3).map((item) => (
              <View key={item.id} style={styles.approvalCard}>
                <View style={styles.approvalTop}>
                  <Image
                    source={{
                      uri: normalizeImageUrl(item.images[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400'),
                    }}
                    style={styles.itemImage}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemShop}>Chủ sở hữu: {item.ownerName}</Text>
                    <View style={styles.itemMetaRow}>
                      <Text style={styles.itemPrice}>{formatVND(item.pricePerDay)}/ngày</Text>
                      <Text style={styles.itemDeposit}>Cọc: {formatVND(item.depositAmount)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardActionRow}>
                  <TouchableOpacity
                    style={[styles.btnOutline, styles.btnReject]}
                    onPress={() => handleRejectRent(item)}
                    disabled={processingId === item.id}
                  >
                    <Feather name="x" size={15} color="#DC2626" />
                    <Text style={styles.btnRejectText}>Từ chối</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btnSolid, styles.btnApprove]}
                    onPress={() => handleApproveRent(item)}
                    disabled={processingId === item.id}
                  >
                    {processingId === item.id ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Feather name="check" size={15} color="#FFF" />
                        <Text style={styles.btnApproveText}>Duyệt ngay</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnDetails}
                    onPress={() => navigation.navigate('RentReview', { id: item.id, item })}
                  >
                    <Feather name="eye" size={15} color="#475569" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {/* Section 5: Hàng đợi duyệt tin THRIFT */}
          <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
            <View style={styles.sectionTitleGroup}>
              <Text style={styles.sectionTitle}>Hàng đợi duyệt THRIFT</Text>
              <View style={[styles.pillBadge, { backgroundColor: '#ECFDF5' }]}>
                <Text style={[styles.pillBadgeText, { color: '#059669' }]}>
                  {pendingThrift.length} chờ duyệt
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ThriftListingApproval')}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {pendingThrift.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-done-circle-outline" size={40} color="#059669" />
              <Text style={styles.emptyTitle}>Hàng đợi THRIFT trống</Text>
              <Text style={styles.emptySub}>Không có tin đăng ký gửi thanh lý nào đang chờ thẩm định.</Text>
            </View>
          ) : (
            pendingThrift.slice(0, 3).map((item) => (
              <View key={item.id} style={styles.approvalCard}>
                <View style={styles.approvalTop}>
                  <Image
                    source={{
                      uri: normalizeImageUrl(item.images[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'),
                    }}
                    style={styles.itemImage}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemShop}>Người bán: {item.sellerName}</Text>
                    <View style={styles.itemMetaRow}>
                      <Text style={[styles.itemPrice, { color: '#059669' }]}>{formatVND(item.price)}</Text>
                      <View style={styles.conditionTag}>
                        <Text style={styles.conditionText}>{item.condition}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.cardActionRow}>
                  <TouchableOpacity
                    style={[styles.btnOutline, styles.btnReject]}
                    onPress={() => {
                      Alert.prompt
                        ? Alert.prompt('Từ chối tin THRIFT', 'Lý do từ chối:', async (reason) => {
                            if (!reason || !reason.trim()) return;
                            setProcessingId(item.id);
                            try {
                              await rejectThriftListingApi(item.id, reason.trim());
                              Alert.alert('Thành công', 'Đã từ chối tin');
                              loadData();
                            } finally {
                              setProcessingId(null);
                            }
                          })
                        : rejectThriftListingApi(item.id, 'Chưa đủ chứng nhận kiểm định').then(() => {
                            Alert.alert('Đã từ chối', 'Đã từ chối tin');
                            loadData();
                          });
                    }}
                    disabled={processingId === item.id}
                  >
                    <Feather name="x" size={15} color="#DC2626" />
                    <Text style={styles.btnRejectText}>Từ chối</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btnSolid, { backgroundColor: '#059669' }]}
                    onPress={() => handleApproveThrift(item)}
                    disabled={processingId === item.id}
                  >
                    {processingId === item.id ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Feather name="check" size={15} color="#FFF" />
                        <Text style={styles.btnApproveText}>Duyệt ngay</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnDetails}
                    onPress={() => navigation.navigate('ThriftReview', { id: item.id, item })}
                  >
                    <Feather name="eye" size={15} color="#475569" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
  },
  scrollContent: {
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  metricIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  metricSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  financeBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  financeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  financeTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  financeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.6,
  },
  financeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  financeCol: {
    flex: 1,
  },
  financeColBorder: {
    borderLeftWidth: 1,
    borderLeftColor: '#334155',
    paddingLeft: 14,
  },
  financeLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  financeValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  pillBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  quickActionBtn: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  quickActionCount: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  approvalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  approvalTop: {
    flexDirection: 'row',
    gap: 12,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  itemShop: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706',
  },
  itemDeposit: {
    fontSize: 11,
    color: '#64748B',
  },
  conditionTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  btnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnReject: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  btnRejectText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  btnSolid: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 34,
    borderRadius: 8,
  },
  btnApprove: {
    backgroundColor: '#D97706',
  },
  btnApproveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  btnDetails: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AdminDashboardScreen;
