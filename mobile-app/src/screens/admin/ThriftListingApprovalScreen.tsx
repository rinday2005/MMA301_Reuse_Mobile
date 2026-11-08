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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import AdminHeader from '../../components/layout/AdminHeader';
import {
  fetchAdminDashboardData,
  approveThriftListingApi,
  rejectThriftListingApi,
  ThriftListingItem,
} from '../../services/admin.api';
import { normalizeImageUrl } from '../../utils/imageUrl';

type StatusTab = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

const formatVND = (amount: number) => {
  return (amount || 0).toLocaleString('vi-VN') + ' đ';
};

export const ThriftListingApprovalScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [listings, setListings] = useState<ThriftListingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<StatusTab>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Reject Modal State
  const [rejectingItem, setRejectingItem] = useState<ThriftListingItem | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isSubmittingReject, setIsSubmittingReject] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchAdminDashboardData();
      const pending = data.thriftApprovalList || [];
      const catalog = data.thriftCatalogList || [];
      const combined = [...pending, ...catalog.filter((c) => !pending.some((p) => p.id === c.id))];
      setListings(combined);
    } catch (err) {
      console.warn('Lỗi tải danh sách sản phẩm THRIFT:', err);
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

  const handleApprove = async (item: ThriftListingItem) => {
    setProcessingId(item.id);
    try {
      await approveThriftListingApi(item.id);
      setListings((prev) =>
        prev.map((l) => (l.id === item.id ? { ...l, status: 'APPROVED' as const } : l))
      );
      Alert.alert('Thành công', `Đã duyệt tin đăng thanh lý "${item.name}"`);
    } catch {
      Alert.alert('Lỗi', 'Không thể phê duyệt tin');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (item: ThriftListingItem) => {
    setRejectingItem(item);
    setRejectReason('Tình trạng thực tế không đúng với mô tả hoặc hình ảnh chưa rõ tem mác.');
  };

  const submitReject = async () => {
    if (!rejectingItem) return;
    if (!rejectReason.trim()) {
      Alert.alert('Lưu ý', 'Vui lòng cung cấp lý do từ chối');
      return;
    }
    setIsSubmittingReject(true);
    try {
      await rejectThriftListingApi(rejectingItem.id, rejectReason.trim());
      setListings((prev) =>
        prev.map((l) =>
          l.id === rejectingItem.id
            ? { ...l, status: 'REJECTED' as const, rejectionReason: rejectReason.trim() }
            : l
        )
      );
      setRejectingItem(null);
      Alert.alert('Đã từ chối', 'Đã gửi phản hồi từ chối tới người bán');
    } catch {
      Alert.alert('Lỗi', 'Không thể từ chối tin');
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchTab = currentTab === 'ALL' || item.status === currentTab;
      const matchSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [listings, currentTab, searchQuery]);

  const pendingCount = listings.filter((l) => l.status === 'PENDING').length;
  const approvedCount = listings.filter((l) => l.status === 'APPROVED').length;
  const rejectedCount = listings.filter((l) => l.status === 'REJECTED').length;

  const renderItem = ({ item }: { item: ThriftListingItem }) => {
    const isPending = item.status === 'PENDING';
    const isApproved = item.status === 'APPROVED';
    const isRejected = item.status === 'REJECTED';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ThriftReview', { id: item.id, item })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.skuBadge}>
            <Text style={styles.skuText}>#RH-THF-{item.id.slice(-5).toUpperCase()}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              isApproved && styles.statusBadgeApproved,
              isPending && styles.statusBadgePending,
              isRejected && styles.statusBadgeRejected,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isApproved && styles.statusTextApproved,
                isPending && styles.statusTextPending,
                isRejected && styles.statusTextRejected,
              ]}
            >
              {isApproved ? 'Đã duyệt' : isPending ? 'Chờ duyệt' : 'Từ chối'}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Image
            source={{
              uri: normalizeImageUrl(item.images[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'),
            }}
            style={styles.productImage}
          />
          <View style={styles.bodyInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.sellerText}>Người bán: {item.sellerName}</Text>
            <Text style={styles.categoryText}>Nguồn: {item.source}</Text>

            <View style={styles.pricingRow}>
              <Text style={styles.priceValue}>{formatVND(item.price)}</Text>
              <View style={styles.conditionBadge}>
                <Text style={styles.conditionText}>{item.condition}</Text>
              </View>
            </View>
          </View>
        </View>

        {isRejected && item.rejectionReason && (
          <View style={styles.rejectionBox}>
            <Feather name="alert-circle" size={13} color="#DC2626" />
            <Text style={styles.rejectionText} numberOfLines={2}>
              Lý do từ chối: {item.rejectionReason}
            </Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => navigation.navigate('ThriftReview', { id: item.id, item })}
          >
            <Feather name="eye" size={14} color="#475569" />
            <Text style={styles.detailBtnText}>Chi tiết thẩm định</Text>
          </TouchableOpacity>

          {isPending && (
            <View style={styles.actionButtonGroup}>
              <TouchableOpacity
                style={styles.actionRejectBtn}
                onPress={() => openRejectModal(item)}
                disabled={processingId === item.id}
              >
                <Feather name="x" size={14} color="#DC2626" />
                <Text style={styles.actionRejectText}>Từ chối</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionApproveBtn}
                onPress={() => handleApprove(item)}
                disabled={processingId === item.id}
              >
                {processingId === item.id ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Feather name="check" size={14} color="#FFF" />
                    <Text style={styles.actionApproveText}>Duyệt</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AdminHeader
        showBack
        title="Duyệt Tin Thanh Lý (THRIFT)"
        subtitle="Kiểm tra độ mới, chứng thực nguồn gốc và thẩm định vi vết"
      />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên đồ thanh lý, người bán, nguồn gốc..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'ALL' && styles.tabItemActive]}
          onPress={() => setCurrentTab('ALL')}
        >
          <Text style={[styles.tabText, currentTab === 'ALL' && styles.tabTextActive]}>
            Tất cả ({listings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'PENDING' && styles.tabItemActive]}
          onPress={() => setCurrentTab('PENDING')}
        >
          <Text style={[styles.tabText, currentTab === 'PENDING' && styles.tabTextActive]}>
            Chờ duyệt ({pendingCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'APPROVED' && styles.tabItemActive]}
          onPress={() => setCurrentTab('APPROVED')}
        >
          <Text style={[styles.tabText, currentTab === 'APPROVED' && styles.tabTextActive]}>
            Đã duyệt ({approvedCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'REJECTED' && styles.tabItemActive]}
          onPress={() => setCurrentTab('REJECTED')}
        >
          <Text style={[styles.tabText, currentTab === 'REJECTED' && styles.tabTextActive]}>
            Từ chối ({rejectedCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Đang tải danh sách đồ thanh lý...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredListings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetags-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Không có tin thanh lý nào</Text>
              <Text style={styles.emptySub}>Không tìm thấy mục đăng phù hợp với bộ lọc hiện tại.</Text>
            </View>
          }
        />
      )}

      {/* Rejection Modal */}
      <Modal visible={!!rejectingItem} transparent animationType="fade" onRequestClose={() => setRejectingItem(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Từ chối tin đăng THRIFT</Text>
              <TouchableOpacity onPress={() => setRejectingItem(null)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Mục đăng: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{rejectingItem?.name}</Text>
            </Text>

            <Text style={styles.inputLabel}>Lý do từ chối phê duyệt:</Text>
            <TextInput
              style={styles.modalTextArea}
              multiline
              numberOfLines={4}
              placeholder="Nhập lý do cụ thể gửi người bán..."
              value={rejectReason}
              onChangeText={setRejectReason}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setRejectingItem(null)}
                disabled={isSubmittingReject}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={submitReject}
                disabled={isSubmittingReject}
              >
                {isSubmittingReject ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>Xác nhận từ chối</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#059669',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 10,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  skuBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  skuText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeApproved: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextApproved: {
    color: '#16A34A',
  },
  statusTextPending: {
    color: '#D97706',
  },
  statusTextRejected: {
    color: '#DC2626',
  },
  cardBody: {
    flexDirection: 'row',
    gap: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  bodyInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  sellerText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  categoryText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  conditionBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  conditionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  rejectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  rejectionText: {
    fontSize: 11,
    color: '#DC2626',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  detailBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  actionButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionRejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  actionRejectText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  actionApproveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#059669',
  },
  actionApproveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  modalTextArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    textAlignVertical: 'top',
    height: 90,
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  modalConfirmBtn: {
    flex: 1.5,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default ThriftListingApprovalScreen;
