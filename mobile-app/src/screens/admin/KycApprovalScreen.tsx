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
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminHeader from '../../components/layout/AdminHeader';
import {
  fetchAdminKycListApi,
  approveKycApi,
  rejectKycApi,
  KycApplicantItem,
} from '../../services/admin.api';
import { normalizeImageUrl } from '../../utils/imageUrl';

type KycStatusTab = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export const KycApprovalScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [records, setRecords] = useState<KycApplicantItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<KycStatusTab>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Reject Modal
  const [rejectingItem, setRejectingItem] = useState<KycApplicantItem | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Ảnh mặt trước hoặc sau Căn cước công dân bị lóa sáng hoặc mất góc.');
  const [isSubmittingReject, setIsSubmittingReject] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const list = await fetchAdminKycListApi();
      setRecords(list);
    } catch (err) {
      console.warn('Lỗi tải danh sách hồ sơ KYC:', err);
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

  const handleApprove = async (item: KycApplicantItem) => {
    setProcessingId(item.id);
    try {
      await approveKycApi(item.id);
      setRecords((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, status: 'APPROVED' as const } : r))
      );
      Alert.alert('Thành công', `Đã duyệt định danh KYC cho ${item.fullName}`);
    } catch {
      Alert.alert('Lỗi', 'Không thể duyệt KYC');
    } finally {
      setProcessingId(null);
    }
  };

  const submitReject = async () => {
    if (!rejectingItem) return;
    if (!rejectReason.trim()) {
      Alert.alert('Lưu ý', 'Vui lòng cung cấp lý do từ chối');
      return;
    }
    setIsSubmittingReject(true);
    try {
      await rejectKycApi(rejectingItem.id, rejectReason.trim());
      setRecords((prev) =>
        prev.map((r) =>
          r.id === rejectingItem.id
            ? { ...r, status: 'REJECTED' as const, rejectionReason: rejectReason.trim() }
            : r
        )
      );
      setRejectingItem(null);
      Alert.alert('Đã từ chối', 'Đã từ chối hồ sơ KYC');
    } catch {
      Alert.alert('Lỗi', 'Không thể từ chối hồ sơ');
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchTab = currentTab === 'ALL' || r.status === currentTab;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        query === '' ||
        r.fullName.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query) ||
        (r.idCardNumber || '').includes(query);
      return matchTab && matchSearch;
    });
  }, [records, currentTab, searchQuery]);

  const pendingCount = records.filter((r) => r.status === 'PENDING').length;
  const approvedCount = records.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = records.filter((r) => r.status === 'REJECTED').length;

  const renderItem = ({ item }: { item: KycApplicantItem }) => {
    const isPending = item.status === 'PENDING';
    const isApproved = item.status === 'APPROVED';
    const isRejected = item.status === 'REJECTED';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('KycReview', { id: item.id, item })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>{item.initials || 'CC'}</Text>
            </View>
            <View>
              <Text style={styles.applicantName}>{item.fullName}</Text>
              <Text style={styles.applicantEmail}>{item.email}</Text>
            </View>
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
              {isApproved ? 'ĐÃ DUYỆT' : isPending ? 'CHỜ THẨM ĐỊNH' : 'TỪ CHỐI'}
            </Text>
          </View>
        </View>

        <View style={styles.docInfoRow}>
          <View style={styles.docCol}>
            <Text style={styles.docLabel}>Số CCCD gắn chip</Text>
            <Text style={styles.docValue}>{item.idCardNumber || 'Chưa cập nhật'}</Text>
          </View>
          <View style={styles.docCol}>
            <Text style={styles.docLabel}>Cấp đối tác (Tier)</Text>
            <Text style={[styles.docValue, { color: '#D97706' }]}>{item.tier}</Text>
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
            style={styles.inspectBtn}
            onPress={() => navigation.navigate('KycReview', { id: item.id, item })}
          >
            <Feather name="eye" size={14} color="#475569" />
            <Text style={styles.inspectBtnText}>Xem ảnh CCCD 2 mặt</Text>
          </TouchableOpacity>

          {isPending && (
            <View style={styles.actionGroup}>
              <TouchableOpacity
                style={styles.btnReject}
                onPress={() => {
                  setRejectingItem(item);
                  setRejectReason('Ảnh CCCD bị mờ số hoặc lóa ánh đèn flash.');
                }}
                disabled={processingId === item.id}
              >
                <Feather name="x" size={13} color="#DC2626" />
                <Text style={styles.btnRejectText}>Từ chối</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnApprove}
                onPress={() => handleApprove(item)}
                disabled={processingId === item.id}
              >
                {processingId === item.id ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Feather name="check" size={13} color="#FFF" />
                    <Text style={styles.btnApproveText}>Duyệt KYC</Text>
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
        title="Thẩm Định Định Danh (KYC)"
        subtitle="Xác thực Căn cước công dân gắn chip để nâng hạn mức & mở Shop"
      />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo họ tên, email hoặc số CCCD..."
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
            Tất cả ({records.length})
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

      {/* Records List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={styles.loadingText}>Đang nạp hồ sơ CCCD từ MongoDB...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#D97706']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="card-account-details-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Không có hồ sơ nào</Text>
              <Text style={styles.emptySub}>Không tìm thấy hồ sơ định danh KYC theo bộ lọc hiện tại.</Text>
            </View>
          }
        />
      )}

      {/* Reject Modal */}
      <Modal visible={!!rejectingItem} transparent animationType="fade" onRequestClose={() => setRejectingItem(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Từ chối hồ sơ KYC</Text>
              <TouchableOpacity onPress={() => setRejectingItem(null)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Ứng viên: <Text style={{ fontWeight: '700' }}>{rejectingItem?.fullName}</Text>
            </Text>

            <Text style={styles.inputLabel}>Lý do từ chối hồ sơ định danh:</Text>
            <TextInput
              style={styles.modalTextArea}
              multiline
              numberOfLines={4}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Nhập lý do chi tiết..."
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
                  <Text style={styles.modalConfirmText}>Gửi từ chối</Text>
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
    borderBottomColor: '#D97706',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#D97706',
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
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  applicantName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  applicantEmail: {
    fontSize: 12,
    color: '#64748B',
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
    fontSize: 10,
    fontWeight: '800',
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
  docInfoRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docCol: {
    flex: 1,
  },
  docLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  docValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
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
  inspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inspectBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnReject: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  btnRejectText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  btnApprove: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#D97706',
  },
  btnApproveText: {
    fontSize: 11,
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

export default KycApprovalScreen;
