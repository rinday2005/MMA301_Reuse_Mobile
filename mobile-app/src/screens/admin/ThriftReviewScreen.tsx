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
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AdminHeader from '../../components/layout/AdminHeader';
import {
  approveThriftListingApi,
  rejectThriftListingApi,
  ThriftListingItem,
} from '../../services/admin.api';
import { normalizeImageUrl } from '../../utils/imageUrl';

const formatVND = (amount: number) => {
  return (amount || 0).toLocaleString('vi-VN') + ' đ';
};

export const ThriftReviewScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const initialItem: ThriftListingItem = route.params?.item;

  const [item, setItem] = useState<ThriftListingItem>(
    initialItem || {
      id: route.params?.id || '',
      slug: 'thrift-review',
      name: 'Chi tiết sản phẩm thanh lý',
      sellerName: 'Chủ sở hữu ký gửi',
      categoryName: 'Đồ thanh lý cao cấp',
      price: 250000,
      images: [],
      condition: 'LIKE_NEW',
      source: 'Ký gửi cá nhân',
      hasCertificate: true,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      timeDisplay: 'Chờ duyệt',
    }
  );

  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Reject Modal
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('Sản phẩm có vết sờn chưa được chụp rõ hoặc giá bán chưa hợp lý.');

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await approveThriftListingApi(item.id);
      setItem((prev) => ({ ...prev, status: 'APPROVED' }));
      Alert.alert('Thành công', 'Đã phê duyệt tin thanh lý!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Lỗi', 'Không thể duyệt tin thanh lý');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
      return;
    }
    setIsProcessing(true);
    try {
      await rejectThriftListingApi(item.id, rejectReason.trim());
      setItem((prev) => ({ ...prev, status: 'REJECTED', rejectionReason: rejectReason.trim() }));
      setShowRejectModal(false);
      Alert.alert('Đã từ chối', 'Đã từ chối tin thanh lý', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Lỗi', 'Không thể từ chối tin');
    } finally {
      setIsProcessing(false);
    }
  };

  const images = Array.isArray(item.images) && item.images.length > 0 ? item.images : [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600',
  ];

  const isPending = item.status === 'PENDING';
  const isApproved = item.status === 'APPROVED';
  const isRejected = item.status === 'REJECTED';

  return (
    <View style={styles.container}>
      <AdminHeader showBack title="Thẩm Định Tin THRIFT" subtitle={`Mã tin: #RH-THF-${item.id.slice(-5).toUpperCase()}`} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Image View */}
        <View style={styles.imageCard}>
          <Image
            source={{ uri: normalizeImageUrl(images[activeImgIndex] || images[0]) }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          {images.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailList}>
              {images.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setActiveImgIndex(idx)}
                  style={[styles.thumbnailWrap, activeImgIndex === idx && styles.thumbnailActive]}
                >
                  <Image source={{ uri: normalizeImageUrl(img) }} style={styles.thumbnailImg} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Status Alert Banner */}
        <View
          style={[
            styles.statusBanner,
            isApproved && styles.statusBannerApproved,
            isPending && styles.statusBannerPending,
            isRejected && styles.statusBannerRejected,
          ]}
        >
          <View style={styles.statusBannerLeft}>
            <Ionicons
              name={isApproved ? 'checkmark-circle' : isPending ? 'time' : 'alert-circle'}
              size={22}
              color={isApproved ? '#16A34A' : isPending ? '#D97706' : '#DC2626'}
            />
            <View>
              <Text
                style={[
                  styles.statusBannerTitle,
                  isApproved && { color: '#16A34A' },
                  isPending && { color: '#D97706' },
                  isRejected && { color: '#DC2626' },
                ]}
              >
                {isApproved
                  ? 'Tin đăng đã được duyệt & hiển thị trên sàn THRIFT'
                  : isPending
                  ? 'Đang chờ Quản trị viên thẩm định'
                  : 'Tin đăng bị từ chối'}
              </Text>
              {isRejected && item.rejectionReason && (
                <Text style={styles.rejectionReasonText}>Lý do: {item.rejectionReason}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.productTitle}>{item.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.categoryName}</Text>
            </View>
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionBadgeText}>Độ mới: {item.condition}</Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Giá bán thanh lý đề xuất</Text>
            <Text style={styles.priceValue}>{formatVND(item.price)}</Text>
            <Text style={styles.commissionNote}>Phí giao dịch sàn: 3.5% (được khấu trừ khi hoàn tất)</Text>
          </View>
        </View>

        {/* Seller Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardSectionTitle}>Thông tin người bán / nguồn hàng</Text>
          <View style={styles.shopRow}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerAvatarText}>SE</Text>
            </View>
            <View style={styles.shopDetails}>
              <Text style={styles.shopName}>{item.sellerName}</Text>
              <Text style={styles.sourceText}>Nguồn gốc: {item.source}</Text>
            </View>
            <View style={styles.verifiedTag}>
              <Ionicons name="ribbon-outline" size={13} color="#059669" />
              <Text style={styles.verifiedTagText}>Chứng nhận ReUse</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.infoCard}>
          <Text style={styles.cardSectionTitle}>Mô tả tình trạng từ người bán</Text>
          <Text style={styles.descText}>
            {item.description || 'Chưa có thông tin mô tả chi tiết từ người bán.'}
          </Text>
        </View>

        {/* Checklist thẩm định tiêu chuẩn ISO */}
        <View style={styles.infoCard}>
          <Text style={styles.cardSectionTitle}>Tiêu chuẩn thẩm định ký gửi THRIFT</Text>
          <View style={styles.checkItem}>
            <Ionicons name="checkmark-circle" size={16} color="#059669" />
            <Text style={styles.checkText}>Đã kiểm tra tem nhãn nguyên bản, không hàng giả</Text>
          </View>
          <View style={styles.checkItem}>
            <Ionicons name="checkmark-circle" size={16} color="#059669" />
            <Text style={styles.checkText}>Độ mới đạt chuẩn trên 85% hoặc đã qua giặt hấp</Text>
          </View>
          <View style={styles.checkItem}>
            <Ionicons name="checkmark-circle" size={16} color="#059669" />
            <Text style={styles.checkText}>Hình ảnh trung thực, chụp rõ mọi góc cạnh</Text>
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
              <Feather name="check-circle" size={18} color="#FFF" />
              <Text style={styles.btnApproveBottomText}>Phê duyệt đăng bán</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal Rejection Reason */}
      <Modal visible={showRejectModal} transparent animationType="fade" onRequestClose={() => setShowRejectModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Từ chối tin đăng THRIFT</Text>
              <TouchableOpacity onPress={() => setShowRejectModal(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>Nhập phản hồi chi tiết để người bán chỉnh sửa:</Text>
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
  imageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mainImage: {
    width: '100%',
    height: 260,
    backgroundColor: '#F1F5F9',
  },
  thumbnailList: {
    padding: 10,
    flexDirection: 'row',
    gap: 8,
  },
  thumbnailWrap: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 8,
  },
  thumbnailActive: {
    borderColor: '#059669',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  statusBanner: {
    borderRadius: 12,
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
  statusBannerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  statusBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  rejectionReasonText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 3,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  conditionBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  conditionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  priceContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  priceLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#059669',
    marginTop: 2,
  },
  commissionNote: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sellerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerAvatarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  shopDetails: {
    flex: 1,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  sourceText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  descText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
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
    backgroundColor: '#059669',
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
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
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

export default ThriftReviewScreen;
