import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminHeader from '../../components/layout/AdminHeader';
import { approveKycApi, rejectKycApi, KycApplicantItem } from '../../services/admin.api';
import { normalizeImageUrl } from '../../utils/imageUrl';

export const KycReviewScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const initialItem: KycApplicantItem = route.params?.item;

  const [item, setItem] = useState<KycApplicantItem>(
    initialItem || {
      id: route.params?.id || '',
      fullName: 'Ứng viên định danh KYC',
      initials: 'CC',
      email: 'user@reuse.vn',
      docType: 'Căn cước công dân gắn chip (CCCD)',
      tier: 'Shop Partner Tier',
      isUrgent: false,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      frontImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      backImageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=600',
    }
  );

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>(
    'Ảnh mặt sau Căn cước công dân bị lóa ánh đèn flash tại cụm mã vạch MRZ.'
  );

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await approveKycApi(item.id);
      setItem((prev) => ({ ...prev, status: 'APPROVED' }));
      Alert.alert('Thành công', 'Đã phê duyệt hồ sơ định danh KYC thành công!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Lỗi', 'Không thể duyệt hồ sơ');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng cung cấp lý do từ chối');
      return;
    }
    setIsProcessing(true);
    try {
      await rejectKycApi(item.id, rejectReason.trim());
      setItem((prev) => ({ ...prev, status: 'REJECTED', rejectionReason: rejectReason.trim() }));
      setShowRejectModal(false);
      Alert.alert('Đã từ chối', 'Đã từ chối hồ sơ định danh KYC', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Lỗi', 'Không thể từ chối hồ sơ');
    } finally {
      setIsProcessing(false);
    }
  };

  const isApproved = item.status === 'APPROVED';
  const isPending = item.status === 'PENDING';
  const isRejected = item.status === 'REJECTED';

  return (
    <View style={styles.container}>
      <AdminHeader
        showBack
        title="Thẩm Tra CCCD Gắn Chip"
        subtitle={`Hồ sơ: #${item.id.slice(-6).toUpperCase()}`}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status Alert */}
        <View
          style={[
            styles.statusBanner,
            isApproved && styles.statusBannerApproved,
            isPending && styles.statusBannerPending,
            isRejected && styles.statusBannerRejected,
          ]}
        >
          <Ionicons
            name={isApproved ? 'shield-checkmark' : isPending ? 'time' : 'alert-circle'}
            size={22}
            color={isApproved ? '#16A34A' : isPending ? '#D97706' : '#DC2626'}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.statusBannerTitle,
                isApproved && { color: '#16A34A' },
                isPending && { color: '#D97706' },
                isRejected && { color: '#DC2626' },
              ]}
            >
              {isApproved
                ? 'Hồ sơ đã được phê duyệt xác thực CCCD'
                : isPending
                ? 'Đang chờ Quản trị viên đối chiếu dữ liệu'
                : 'Hồ sơ KYC đã bị từ chối'}
            </Text>
            {isRejected && item.rejectionReason && (
              <Text style={styles.rejectionReasonText}>Lý do: {item.rejectionReason}</Text>
            )}
          </View>
        </View>

        {/* CCCD Front & Back Photos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ảnh Căn Cước Công Dân (2 Mặt)</Text>

          <Text style={styles.photoLabel}>Mặt trước (Ảnh chân dung & Thông tin cá nhân):</Text>
          <View style={styles.idCardWrap}>
            <Image
              source={{
                uri: normalizeImageUrl(
                  item.frontImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'
                ),
              }}
              style={styles.idCardImg}
              resizeMode="cover"
            />
          </View>

          <Text style={[styles.photoLabel, { marginTop: 14 }]}>Mặt sau (Mã QR & Cụm vi mạch MRZ):</Text>
          <View style={styles.idCardWrap}>
            <Image
              source={{
                uri: normalizeImageUrl(
                  item.backImageUrl || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=600'
                ),
              }}
              style={styles.idCardImg}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Applicant Extracted Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin ứng viên đối chiếu</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Họ và tên</Text>
            <Text style={styles.infoValue}>{item.fullName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số Căn cước công dân</Text>
            <Text style={[styles.infoValue, { color: '#2563EB', fontWeight: '800' }]}>
              {item.idCardNumber || 'Chưa cập nhật'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày tháng năm sinh</Text>
            <Text style={styles.infoValue}>{item.dob || 'Chưa cập nhật'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nơi thường trú</Text>
            <Text style={styles.infoValue}>{item.residentAddress || 'Chưa cập nhật'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email đăng ký</Text>
            <Text style={styles.infoValue}>{item.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số điện thoại</Text>
            <Text style={styles.infoValue}>{item.phoneNumber || '0901234567'}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Cấp đối tác đề xuất</Text>
            <Text style={[styles.infoValue, { color: '#D97706', fontWeight: '800' }]}>{item.tier}</Text>
          </View>
        </View>

        {/* Verification Checklist */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tiêu chí kiểm định pháp lý</Text>
          <View style={styles.checkItem}>
            <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
            <Text style={styles.checkText}>Hình ảnh không bị che khuất 4 góc thẻ căn cước</Text>
          </View>
          <View style={styles.checkItem}>
            <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
            <Text style={styles.checkText}>Mã số định danh 12 số rõ ràng, trùng khớp thông tin tài khoản</Text>
          </View>
          <View style={styles.checkItem}>
            <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
            <Text style={styles.checkText}>Không có dấu hiệu chỉnh sửa kỹ thuật số hay photoshop</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.btnOutline, styles.btnRejectBottom]}
          onPress={() => setShowRejectModal(true)}
          disabled={isProcessing}
        >
          <Feather name="x-circle" size={18} color="#DC2626" />
          <Text style={styles.btnRejectBottomText}>Từ chối</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnSolid, styles.btnApproveBottom]}
          onPress={handleApprove}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Feather name="shield" size={18} color="#FFF" />
              <Text style={styles.btnApproveBottomText}>Phê duyệt định danh</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Rejection Modal */}
      <Modal visible={showRejectModal} transparent animationType="fade" onRequestClose={() => setShowRejectModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Từ chối hồ sơ định danh</Text>
              <TouchableOpacity onPress={() => setShowRejectModal(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Lý do từ chối (Gửi thông báo tới người dùng):</Text>
            <TextInput
              style={styles.modalTextArea}
              multiline
              numberOfLines={4}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Nhập lý do..."
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowRejectModal(false)}
                disabled={isProcessing}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleReject}
                disabled={isProcessing}
              >
                {isProcessing ? (
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
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  statusBannerApproved: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusBannerPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusBannerRejected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  rejectionReasonText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  photoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  idCardWrap: {
    width: '100%',
    height: 190,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  idCardImg: {
    width: '100%',
    height: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
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
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  checkText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 8,
  },
  btnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnRejectBottom: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  btnRejectBottomText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  btnSolid: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 10,
  },
  btnApproveBottom: {
    backgroundColor: '#D97706',
  },
  btnApproveBottomText: {
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

export default KycReviewScreen;
