import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AdminHeader from '../../components/layout/AdminHeader';
import {
  toggleUserLockApi,
  respondUserAppealApi,
  MongoUserItem,
} from '../../services/admin.api';

export const UserDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const initialUser: MongoUserItem = route.params?.user;

  const [user, setUser] = useState<MongoUserItem>(
    initialUser || {
      _id: route.params?.id || '',
      fullName: 'Người dùng ReUse',
      email: 'user@reuse.vn',
      role: 'USER',
      status: 'ACTIVE',
      isLocked: false,
    }
  );

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Lock Modal
  const [showLockModal, setShowLockModal] = useState<boolean>(false);
  const [lockReason, setLockReason] = useState<string>('Tài khoản bị tạm khóa để kiểm tra bảo mật hoặc rà soát giao dịch');

  // Appeal Modal
  const [showAppealModal, setShowAppealModal] = useState<boolean>(false);
  const [adminReply, setAdminReply] = useState<string>(
    'ReUse Hub đã xem xét khiếu nại và chấp thuận mở lại quyền hoạt động cho tài khoản.'
  );
  const [unlockDecision, setUnlockDecision] = useState<boolean>(true);

  const isLocked =
    user.isLocked || user.status === 'LOCKED' || user.status === 'SUSPENDED' || user.status === 'lock';
  const hasAppeal = !!(user.lockAppeal && (user.lockAppeal.question || user.lockAppeal.submittedAt));

  const handleUnlock = () => {
    Alert.alert(
      'Mở khóa tài khoản',
      `Bạn có chắc muốn mở khóa cho tài khoản ${user.fullName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Mở khóa',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await toggleUserLockApi(user._id, false);
              setUser((prev) => ({ ...prev, isLocked: false, status: 'ACTIVE', lockReason: '' }));
              Alert.alert('Thành công', 'Đã mở khóa tài khoản người dùng.');
            } catch {
              Alert.alert('Lỗi', 'Không thể mở khóa tài khoản.');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const submitLock = async () => {
    if (!lockReason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do tạm khóa');
      return;
    }
    setIsProcessing(true);
    try {
      await toggleUserLockApi(user._id, true, lockReason.trim());
      setUser((prev) => ({
        ...prev,
        isLocked: true,
        status: 'LOCKED',
        lockReason: lockReason.trim(),
        lockedAt: new Date().toISOString(),
      }));
      setShowLockModal(false);
      Alert.alert('Đã khóa', 'Đã tạm khóa tài khoản thành công.');
    } catch {
      Alert.alert('Lỗi', 'Không thể tạm khóa tài khoản.');
    } finally {
      setIsProcessing(false);
    }
  };

  const submitAppealResponse = async () => {
    if (!adminReply.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung phản hồi.');
      return;
    }
    setIsProcessing(true);
    try {
      await respondUserAppealApi(user._id, {
        unlock: unlockDecision,
        adminReply: adminReply.trim(),
        lockReason: unlockDecision ? '' : user.lockReason,
      });
      setUser((prev) => ({
        ...prev,
        isLocked: !unlockDecision,
        status: unlockDecision ? 'ACTIVE' : 'LOCKED',
        lockAppeal: prev.lockAppeal
          ? { ...prev.lockAppeal, status: unlockDecision ? 'RESOLVED' : 'REJECTED', adminReply }
          : null,
      }));
      setShowAppealModal(false);
      Alert.alert('Thành công', 'Đã phản hồi khiếu nại thành công!');
    } catch {
      Alert.alert('Lỗi', 'Không thể phản hồi khiếu nại.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <AdminHeader
        showBack
        title="Chi Tiết Hồ Sơ Người Dùng"
        subtitle={`ID: #${user._id.slice(-6).toUpperCase()}`}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{(user.fullName || 'RH').slice(0, 2).toUpperCase()}</Text>
          </View>
          <Text style={styles.fullName}>{user.fullName}</Text>
          <Text style={styles.email}>{user.email}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user.role}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                isLocked ? styles.statusBadgeLocked : styles.statusBadgeActive,
              ]}
            >
              <Text style={[styles.statusText, isLocked ? styles.statusTextLocked : styles.statusTextActive]}>
                {isLocked ? 'TÀI KHOẢN ĐANG KHÓA' : 'HOẠT ĐỘNG'}
              </Text>
            </View>
          </View>
        </View>

        {/* Lock Warning Card */}
        {isLocked && (
          <View style={styles.lockCard}>
            <View style={styles.lockCardHeader}>
              <Feather name="shield-off" size={18} color="#DC2626" />
              <Text style={styles.lockCardTitle}>Tài khoản đang bị tạm khóa</Text>
            </View>
            <Text style={styles.lockCardReason}>
              Lý do: <Text style={{ fontWeight: '700' }}>{user.lockReason || 'Vi phạm điều khoản hoặc bảo mật'}</Text>
            </Text>
            {user.lockedAt && (
              <Text style={styles.lockCardTime}>
                Thời gian khóa: {new Date(user.lockedAt).toLocaleString('vi-VN')}
              </Text>
            )}
          </View>
        )}

        {/* Appeal Card */}
        {hasAppeal && (
          <View style={styles.appealCard}>
            <View style={styles.appealCardHeader}>
              <MaterialIcons name="mail-outline" size={18} color="#D97706" />
              <Text style={styles.appealCardTitle}>Đơn khiếu nại mở khóa tài khoản</Text>
            </View>
            <Text style={styles.appealCardDesc}>
              "{user.lockAppeal?.question || user.lockAppeal?.details}"
            </Text>
            {user.lockAppeal?.submittedAt && (
              <Text style={styles.appealCardTime}>
                Gửi lúc: {new Date(user.lockAppeal.submittedAt).toLocaleString('vi-VN')}
              </Text>
            )}

            {user.lockAppeal?.adminReply && (
              <View style={styles.adminRepliedBox}>
                <Text style={styles.adminRepliedTitle}>Phản hồi trước đó của Admin:</Text>
                <Text style={styles.adminRepliedContent}>"{user.lockAppeal.adminReply}"</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.openAppealBtn}
              onPress={() => setShowAppealModal(true)}
            >
              <Feather name="edit-3" size={15} color="#FFF" />
              <Text style={styles.openAppealBtnText}>Phản hồi đơn khiếu nại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Contact Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardSectionTitle}>Thông tin liên hệ & định danh</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số điện thoại</Text>
            <Text style={styles.infoValue}>{user.phoneNumber || 'Chưa cập nhật'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Địa chỉ cư trú</Text>
            <Text style={styles.infoValue}>
              {user.address
                ? `${user.address.detail || ''}, ${user.address.ward || ''}, ${user.address.district || ''}, ${user.address.province || ''}`
                : 'Chưa cập nhật'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trạng thái định danh KYC</Text>
            <View style={styles.kycBadge}>
              <Ionicons
                name={user.kycStatus === 'APPROVED' ? 'shield-checkmark' : 'shield-outline'}
                size={14}
                color={user.kycStatus === 'APPROVED' ? '#16A34A' : '#D97706'}
              />
              <Text
                style={[
                  styles.kycBadgeText,
                  user.kycStatus === 'APPROVED' ? { color: '#16A34A' } : { color: '#D97706' },
                ]}
              >
                {user.kycStatus || 'CHƯA ĐỊNH DANH'}
              </Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Ngày gia nhập</Text>
            <Text style={styles.infoValue}>
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '10/2026'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {user.role !== 'ADMIN' && (
          <View style={styles.actionCard}>
            <Text style={styles.cardSectionTitle}>Quyền quản trị tài khoản</Text>

            {isLocked ? (
              <TouchableOpacity
                style={[styles.btnAction, styles.btnUnlock]}
                onPress={handleUnlock}
                disabled={isProcessing}
              >
                <Feather name="unlock" size={16} color="#FFF" />
                <Text style={styles.btnActionText}>Mở khóa tài khoản người dùng</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.btnAction, styles.btnLock]}
                onPress={() => setShowLockModal(true)}
                disabled={isProcessing}
              >
                <Feather name="lock" size={16} color="#FFF" />
                <Text style={styles.btnActionText}>Tạm khóa tài khoản người dùng</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Lock Account Modal */}
      <Modal visible={showLockModal} transparent animationType="fade" onRequestClose={() => setShowLockModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạm khóa tài khoản</Text>
              <TouchableOpacity onPress={() => setShowLockModal(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Khóa thành viên: <Text style={{ fontWeight: '700' }}>{user.fullName}</Text>
            </Text>

            <Text style={styles.inputLabel}>Lý do tạm khóa tài khoản:</Text>
            <TextInput
              style={styles.modalTextArea}
              multiline
              numberOfLines={4}
              value={lockReason}
              onChangeText={setLockReason}
              placeholder="Nhập lý do..."
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowLockModal(false)}
                disabled={isProcessing}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={submitLock}
                disabled={isProcessing}
              >
                {isProcessing ? (
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
      <Modal visible={showAppealModal} transparent animationType="fade" onRequestClose={() => setShowAppealModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Phản hồi khiếu nại tài khoản</Text>
              <TouchableOpacity onPress={() => setShowAppealModal(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Quyết định mở khóa tài khoản:</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Mở khóa tài khoản ngay:</Text>
              <Switch
                value={unlockDecision}
                onValueChange={setUnlockDecision}
                trackColor={{ false: '#CBD5E1', true: '#BBF7D0' }}
                thumbColor={unlockDecision ? '#16A34A' : '#F1F5F9'}
              />
            </View>

            <Text style={styles.inputLabel}>Nội dung phản hồi chính thức (Email):</Text>
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
                onPress={() => setShowAppealModal(false)}
                disabled={isProcessing}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: unlockDecision ? '#16A34A' : '#DC2626' }]}
                onPress={submitAppealResponse}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>Gửi phản hồi</Text>
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
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLargeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  fullName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  email: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  roleBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeActive: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeLocked: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusTextActive: {
    color: '#16A34A',
  },
  statusTextLocked: {
    color: '#DC2626',
  },
  lockCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  lockCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  lockCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  lockCardReason: {
    fontSize: 13,
    color: '#7F1D1D',
  },
  lockCardTime: {
    fontSize: 11,
    color: '#991B1B',
    marginTop: 4,
  },
  appealCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  appealCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  appealCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
  },
  appealCardDesc: {
    fontSize: 13,
    color: '#451A03',
    fontStyle: 'italic',
  },
  appealCardTime: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 4,
  },
  adminRepliedBox: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  adminRepliedTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  adminRepliedContent: {
    fontSize: 12,
    color: '#78350F',
    marginTop: 2,
  },
  openAppealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D97706',
    borderRadius: 8,
    height: 38,
    marginTop: 12,
  },
  openAppealBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    maxWidth: '60%',
    textAlign: 'right',
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kycBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 10,
  },
  btnLock: {
    backgroundColor: '#DC2626',
  },
  btnUnlock: {
    backgroundColor: '#16A34A',
  },
  btnActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
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

export default UserDetailScreen;
