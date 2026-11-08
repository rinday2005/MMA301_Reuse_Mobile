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
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AdminHeader from '../../components/layout/AdminHeader';
import {
  fetchAdminUsers,
  toggleUserLockApi,
  respondUserAppealApi,
  MongoUserItem,
} from '../../services/admin.api';
import { normalizeImageUrl } from '../../utils/imageUrl';

type RoleFilter = 'ALL' | 'SHOP_OWNER' | 'USER' | 'ADMIN';
type StatusFilter = 'ALL' | 'ACTIVE' | 'LOCKED' | 'APPEAL';

export const UserManagementScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [users, setUsers] = useState<MongoUserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Lock Modal State
  const [lockingUser, setLockingUser] = useState<MongoUserItem | null>(null);
  const [lockReason, setLockReason] = useState<string>('Tài khoản có dấu hiệu vi phạm điều khoản quy chế hoặc đang bị điều tra tranh chấp');
  const [isSubmittingLock, setIsSubmittingLock] = useState<boolean>(false);

  // Appeal Modal State
  const [appealUser, setAppealUser] = useState<MongoUserItem | null>(null);
  const [adminReply, setAdminReply] = useState<string>(
    'ReUse Hub đã xem xét khiếu nại và chấp thuận mở lại quyền hoạt động cho tài khoản.'
  );
  const [unlockDecision, setUnlockDecision] = useState<boolean>(true);
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const list = await fetchAdminUsers();
      setUsers(list);
    } catch (err) {
      console.warn('Lỗi tải danh sách người dùng:', err);
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

  // Toggle user lock
  const handleToggleLock = (user: MongoUserItem) => {
    const isCurrentlyLocked =
      user.isLocked || user.status === 'LOCKED' || user.status === 'SUSPENDED' || user.status === 'lock';

    if (isCurrentlyLocked) {
      // Unlock account
      Alert.alert(
        'Mở khóa tài khoản',
        `Bạn có chắc chắn muốn mở khóa cho tài khoản ${user.fullName} (${user.email})?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Mở khóa ngay',
            onPress: async () => {
              setProcessingId(user._id);
              try {
                await toggleUserLockApi(user._id, false);
                setUsers((prev) =>
                  prev.map((u) => (u._id === user._id ? { ...u, isLocked: false, status: 'ACTIVE' } : u))
                );
                Alert.alert('Thành công', 'Đã mở khóa tài khoản thành công');
              } catch {
                Alert.alert('Lỗi', 'Không thể mở khóa tài khoản');
              } finally {
                setProcessingId(null);
              }
            },
          },
        ]
      );
    } else {
      // Open lock modal
      setLockingUser(user);
      setLockReason('Tài khoản bị tạm khóa để kiểm tra bảo mật hoặc rà soát giao dịch');
    }
  };

  const submitLock = async () => {
    if (!lockingUser) return;
    if (!lockReason.trim()) {
      Alert.alert('Lưu ý', 'Vui lòng cung cấp lý do tạm khóa tài khoản');
      return;
    }
    setIsSubmittingLock(true);
    try {
      await toggleUserLockApi(lockingUser._id, true, lockReason.trim());
      setUsers((prev) =>
        prev.map((u) =>
          u._id === lockingUser._id
            ? { ...u, isLocked: true, status: 'LOCKED', lockReason: lockReason.trim() }
            : u
        )
      );
      setLockingUser(null);
      Alert.alert('Đã khóa', 'Tài khoản người dùng đã được tạm khóa');
    } catch {
      Alert.alert('Lỗi', 'Không thể tạm khóa tài khoản');
    } finally {
      setIsSubmittingLock(false);
    }
  };

  const submitAppealResponse = async () => {
    if (!appealUser) return;
    if (!adminReply.trim()) {
      Alert.alert('Lưu ý', 'Vui lòng nhập nội dung phản hồi gửi người dùng');
      return;
    }
    setIsSubmittingAppeal(true);
    try {
      await respondUserAppealApi(appealUser._id, {
        unlock: unlockDecision,
        adminReply: adminReply.trim(),
        lockReason: unlockDecision ? '' : appealUser.lockReason || 'Tiếp tục duy trì tạm khóa',
      });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === appealUser._id
            ? {
                ...u,
                isLocked: !unlockDecision,
                status: unlockDecision ? 'ACTIVE' : 'LOCKED',
                lockAppeal: u.lockAppeal
                  ? { ...u.lockAppeal, status: unlockDecision ? 'RESOLVED' : 'REJECTED', adminReply }
                  : null,
              }
            : u
        )
      );
      setAppealUser(null);
      Alert.alert('Thành công', 'Đã phản hồi khiếu nại và thông báo cho người dùng');
    } catch {
      Alert.alert('Lỗi', 'Không thể gửi phản hồi khiếu nại');
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const isLocked = u.isLocked || u.status === 'LOCKED' || u.status === 'SUSPENDED' || u.status === 'lock';
      const hasAppeal = !!(u.lockAppeal && (u.lockAppeal.question || u.lockAppeal.submittedAt));

      // Match Role
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;

      // Match Status
      let matchStatus = true;
      if (statusFilter === 'ACTIVE') matchStatus = !isLocked;
      if (statusFilter === 'LOCKED') matchStatus = isLocked;
      if (statusFilter === 'APPEAL') matchStatus = hasAppeal;

      // Match Search
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        query === '' ||
        (u.fullName || '').toLowerCase().includes(query) ||
        (u.email || '').toLowerCase().includes(query) ||
        (u.phoneNumber || '').includes(query);

      return matchRole && matchStatus && matchSearch;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  const renderItem = ({ item }: { item: MongoUserItem }) => {
    const isLocked = item.isLocked || item.status === 'LOCKED' || item.status === 'SUSPENDED' || item.status === 'lock';
    const isShopOwner = item.role === 'SHOP_OWNER';
    const isAdmin = item.role === 'ADMIN';
    const hasAppeal = !!(item.lockAppeal && (item.lockAppeal.question || item.lockAppeal.submittedAt));

    return (
      <TouchableOpacity
        style={styles.userCard}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('UserDetail', { id: item._id, user: item })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.avatarBox,
                isAdmin && { backgroundColor: '#DC2626' },
                isShopOwner && { backgroundColor: '#1E293B' },
              ]}
            >
              <Text style={styles.avatarText}>{(item.fullName || 'RH').slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {item.fullName || 'Người dùng ReUse'}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {item.email}
              </Text>
            </View>
          </View>

          <View style={styles.badgeCol}>
            <View
              style={[
                styles.roleBadge,
                isAdmin && { backgroundColor: '#FEE2E2' },
                isShopOwner && { backgroundColor: '#FEF3C7' },
              ]}
            >
              <Text
                style={[
                  styles.roleBadgeText,
                  isAdmin && { color: '#DC2626' },
                  isShopOwner && { color: '#D97706' },
                ]}
              >
                {isAdmin ? 'ADMIN' : isShopOwner ? 'SHOP OWNER' : 'CUSTOMER'}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                isLocked ? styles.statusBadgeLocked : styles.statusBadgeActive,
              ]}
            >
              <Text style={[styles.statusText, isLocked ? styles.statusTextLocked : styles.statusTextActive]}>
                {isLocked ? 'ĐANG KHÓA' : 'HOẠT ĐỘNG'}
              </Text>
            </View>
          </View>
        </View>

        {/* Lock Reason Warning */}
        {isLocked && item.lockReason && (
          <View style={styles.lockReasonBox}>
            <Feather name="alert-circle" size={13} color="#DC2626" />
            <Text style={styles.lockReasonText} numberOfLines={2}>
              Lý do khóa: {item.lockReason}
            </Text>
          </View>
        )}

        {/* Appeal Request Notice */}
        {hasAppeal && (
          <View style={styles.appealBox}>
            <View style={styles.appealTop}>
              <MaterialIcons name="mark-email-unread" size={15} color="#D97706" />
              <Text style={styles.appealTitle}>Có đơn khiếu nại mở khóa tài khoản</Text>
            </View>
            <Text style={styles.appealContent} numberOfLines={2}>
              "{item.lockAppeal?.question || item.lockAppeal?.details}"
            </Text>
          </View>
        )}

        {/* User Card Actions */}
        <View style={styles.userActionRow}>
          <TouchableOpacity
            style={styles.detailLink}
            onPress={() => navigation.navigate('UserDetail', { id: item._id, user: item })}
          >
            <Feather name="user" size={14} color="#475569" />
            <Text style={styles.detailLinkText}>Hồ sơ chi tiết</Text>
          </TouchableOpacity>

          <View style={styles.actionBtnGroup}>
            {hasAppeal && (
              <TouchableOpacity
                style={styles.appealActionBtn}
                onPress={() => {
                  setAppealUser(item);
                  setUnlockDecision(true);
                  setAdminReply(
                    'ReUse Hub đã xác thực thông tin và chấp thuận mở lại quyền sử dụng tài khoản.'
                  );
                }}
              >
                <Feather name="message-square" size={13} color="#D97706" />
                <Text style={styles.appealActionText}>Xử lý khiếu nại</Text>
              </TouchableOpacity>
            )}

            {!isAdmin && (
              <TouchableOpacity
                style={[styles.lockToggleBtn, isLocked ? styles.unlockBtn : styles.lockBtn]}
                onPress={() => handleToggleLock(item)}
                disabled={processingId === item._id}
              >
                {processingId === item._id ? (
                  <ActivityIndicator size="small" color={isLocked ? '#16A34A' : '#DC2626'} />
                ) : (
                  <>
                    <Feather name={isLocked ? 'unlock' : 'lock'} size={13} color={isLocked ? '#16A34A' : '#DC2626'} />
                    <Text style={[styles.lockToggleText, isLocked ? { color: '#16A34A' } : { color: '#DC2626' }]}>
                      {isLocked ? 'Mở khóa' : 'Khóa nick'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AdminHeader
        showBack
        title="Quản Lý Tài Khoản Người Dùng"
        subtitle="Rà soát danh sách thành viên, kiểm soát khóa nick & giải quyết khiếu nại"
      />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
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

      {/* Role Filter Tabs */}
      <View style={styles.roleFilterRow}>
        {(['ALL', 'SHOP_OWNER', 'USER', 'ADMIN'] as RoleFilter[]).map((role) => (
          <TouchableOpacity
            key={role}
            style={[styles.roleTab, roleFilter === role && styles.roleTabActive]}
            onPress={() => setRoleFilter(role)}
          >
            <Text style={[styles.roleTabText, roleFilter === role && styles.roleTabTextActive]}>
              {role === 'ALL'
                ? 'Tất cả vai trò'
                : role === 'SHOP_OWNER'
                ? 'Shop Owner'
                : role === 'USER'
                ? 'Customer'
                : 'Admin'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.statusFilterRow}>
        {(['ALL', 'ACTIVE', 'LOCKED', 'APPEAL'] as StatusFilter[]).map((st) => (
          <TouchableOpacity
            key={st}
            style={[styles.statusTab, statusFilter === st && styles.statusTabActive]}
            onPress={() => setStatusFilter(st)}
          >
            <Text style={[styles.statusTabText, statusFilter === st && styles.statusTabTextActive]}>
              {st === 'ALL'
                ? 'Tất cả trạng thái'
                : st === 'ACTIVE'
                ? 'Đang hoạt động'
                : st === 'LOCKED'
                ? 'Đang bị khóa'
                : 'Có khiếu nại'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* User List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={styles.loadingText}>Đang nạp danh sách tài khoản từ MongoDB...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#D97706']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Không tìm thấy tài khoản</Text>
              <Text style={styles.emptySub}>Không có người dùng nào khớp với tiêu chí tìm kiếm.</Text>
            </View>
          }
        />
      )}

      {/* Lock User Modal */}
      <Modal visible={!!lockingUser} transparent animationType="fade" onRequestClose={() => setLockingUser(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạm khóa tài khoản người dùng</Text>
              <TouchableOpacity onPress={() => setLockingUser(null)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Khóa tài khoản: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{lockingUser?.fullName}</Text> (
              {lockingUser?.email})
            </Text>

            <Text style={styles.inputLabel}>Lý do khóa tài khoản (Bắt buộc gửi cho người dùng):</Text>
            <TextInput
              style={styles.modalTextArea}
              multiline
              numberOfLines={4}
              value={lockReason}
              onChangeText={setLockReason}
              placeholder="Nhập lý do cụ thể..."
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setLockingUser(null)}
                disabled={isSubmittingLock}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={submitLock}
                disabled={isSubmittingLock}
              >
                {isSubmittingLock ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>Xác nhận khóa</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Appeal Response Modal */}
      <Modal visible={!!appealUser} transparent animationType="fade" onRequestClose={() => setAppealUser(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Xử lý khiếu nại tài khoản</Text>
              <TouchableOpacity onPress={() => setAppealUser(null)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Thành viên: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{appealUser?.fullName}</Text>
            </Text>

            {/* Appeal content box */}
            <View style={styles.appealDetailBox}>
              <Text style={styles.appealDetailLabel}>Nội dung giải trình khiếu nại:</Text>
              <Text style={styles.appealDetailText}>
                "{appealUser?.lockAppeal?.question || appealUser?.lockAppeal?.details || 'Không có mô tả chi tiết'}"
              </Text>
            </View>

            {/* Decision toggle */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Mở khóa tài khoản ngay lập tức:</Text>
              <Switch
                value={unlockDecision}
                onValueChange={setUnlockDecision}
                trackColor={{ false: '#CBD5E1', true: '#BBF7D0' }}
                thumbColor={unlockDecision ? '#16A34A' : '#F1F5F9'}
              />
            </View>

            <Text style={styles.inputLabel}>Nội dung phản hồi (Gửi email trực tiếp):</Text>
            <TextInput
              style={styles.modalTextArea}
              multiline
              numberOfLines={4}
              value={adminReply}
              onChangeText={setAdminReply}
              placeholder="Nhập nội dung phản hồi..."
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAppealUser(null)}
                disabled={isSubmittingAppeal}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: unlockDecision ? '#16A34A' : '#DC2626' }]}
                onPress={submitAppealResponse}
                disabled={isSubmittingAppeal}
              >
                {isSubmittingAppeal ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>
                    {unlockDecision ? 'Chấp thuận & Mở khóa' : 'Từ chối khiếu nại'}
                  </Text>
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
  roleFilterRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 6,
  },
  roleTab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  roleTabActive: {
    backgroundColor: '#1E293B',
  },
  roleTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  roleTabTextActive: {
    color: '#FFFFFF',
  },
  statusFilterRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 6,
  },
  statusTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusTabActive: {
    borderColor: '#D97706',
    backgroundColor: '#FEF3C7',
  },
  statusTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  statusTabTextActive: {
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
  userCard: {
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  badgeCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  roleBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeActive: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeLocked: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextActive: {
    color: '#16A34A',
  },
  statusTextLocked: {
    color: '#DC2626',
  },
  lockReasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  lockReasonText: {
    fontSize: 11,
    color: '#DC2626',
    flex: 1,
  },
  appealBox: {
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  appealTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  appealTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  appealContent: {
    fontSize: 12,
    color: '#451A03',
    fontStyle: 'italic',
  },
  userActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  actionBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appealActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  appealActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  lockToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  lockBtn: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  unlockBtn: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  lockToggleText: {
    fontSize: 11,
    fontWeight: '700',
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
  appealDetailBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  appealDetailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  appealDetailText: {
    fontSize: 12,
    color: '#0F172A',
    fontStyle: 'italic',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
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

export default UserManagementScreen;
