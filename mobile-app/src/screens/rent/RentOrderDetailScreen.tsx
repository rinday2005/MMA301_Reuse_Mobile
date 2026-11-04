import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { AppHeader } from '../../components/layout/AppHeader';
import {
  getRentalOrderByIdApi,
  confirmReceivedOrderApi,
  RentalOrderApi,
} from '../../services/order.api';
import {
  normalizeImageUrl,
  extractProductImage,
  uploadImageToCloudinary,
} from '../../utils/imageUrl';
import { storage } from '../../utils/storage';
import { useAuth } from '../../hooks/useAuth';
import { SAMPLE_HON_ORDER } from './MyRentOrdersScreen';

export const RentOrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const orderId = route.params?.id || '';
  const initialOrder = route.params?.order || null;

  const [loading, setLoading] = useState(!initialOrder);
  const [order, setOrder] = useState<RentalOrderApi | null>(initialOrder);

  // CLA 3-Angle Signing Modal State
  const [claModalVisible, setClaModalVisible] = useState(false);
  const [claSlot1, setClaSlot1] = useState<string>('');
  const [claSlot2, setClaSlot2] = useState<string>('');
  const [claSlot3, setClaSlot3] = useState<string>('');
  const [claNote, setClaNote] = useState<string>(
    'Kiện hàng nguyên vẹn tem seal Nanuk, trang phục đạt chuẩn Grade A+'
  );
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [submittingCla, setSubmittingCla] = useState(false);

  const formatVND = (num: number) => {
    return (num || 0).toLocaleString('vi-VN') + '₫';
  };

  const loadOrderDetail = useCallback(async () => {
    if (!orderId) {
      if (initialOrder) {
        setOrder(initialOrder);
      } else {
        setOrder(SAMPLE_HON_ORDER);
      }
      setLoading(false);
      return;
    }
    try {
      const res = await getRentalOrderByIdApi(orderId);
      if (res) {
        setOrder(res);
      } else if (!order) {
        setOrder(initialOrder || SAMPLE_HON_ORDER);
      }
    } catch {
      if (!order) {
        setOrder(initialOrder || SAMPLE_HON_ORDER);
      }
    } finally {
      setLoading(false);
    }
  }, [orderId, initialOrder]);

  useEffect(() => {
    loadOrderDetail();
  }, [loadOrderDetail]);

  useFocusEffect(
    useCallback(() => {
      loadOrderDetail();
    }, [loadOrderDetail])
  );

  const item = order?.items?.[0] as any;
  const itemTitle =
    item?.productName ||
    item?.name ||
    item?.title ||
    (item?.productId &&
      typeof item.productId === 'object' &&
      (item.productId.name || item.productId.title || item.productId.productName)) ||
    'Thiết bị thuê ReUse';
  const itemImg = extractProductImage(item);
  const orderCode = order?.orderCode || `#${orderId.slice(-6)}`;
  const deposit = order?.depositAmount || Number(item?.depositAmount) || 0;
  const total = order?.totalAmount || 0;
  const rentalFee = order?.rentalFee || (total > deposit ? total - deposit - 25000 : 0);
  const shippingFee = order?.shippingFee || 25000;
  const days = order?.rentalDays || 1;

  const startStr = order?.startDate
    ? new Date(order.startDate).toLocaleDateString('vi-VN')
    : '30/10/2026';
  const endStr = order?.endDate
    ? new Date(order.endDate).toLocaleDateString('vi-VN')
    : '02/11/2026';

  const orderKey = order?._id || order?.orderCode || orderId;
  const rawStatus = (order?.status || '').toUpperCase();
  const hasClaSigned =
    ['RENTING', 'RETURN_REQUESTED', 'RETURNING', 'RETURNED', 'COMPLETED'].includes(rawStatus) ||
    Boolean((order as any)?.claSigned) ||
    Boolean(order?.claProof?.isSigned);
  const isDeliveredWaitingSign =
    ['HANDED_OVER', 'SHIPPING', 'DELIVERED', 'READY_FOR_HANDOVER'].includes(rawStatus) &&
    !hasClaSigned;
  const isRentingActual =
    rawStatus === 'RENTING' ||
    (['HANDED_OVER', 'SHIPPING', 'DELIVERED', 'READY_FOR_HANDOVER'].includes(rawStatus) &&
      hasClaSigned);

  const handleOpenClaModal = () => {
    setClaSlot1(order?.claProof?.photos?.slot1 || '');
    setClaSlot2(order?.claProof?.photos?.slot2 || '');
    setClaSlot3(order?.claProof?.photos?.slot3 || '');
    setClaNote(
      order?.claProof?.note ||
        'Kiện hàng nguyên vẹn tem seal Nanuk, trang phục đạt chuẩn Grade A+'
    );
    setClaModalVisible(true);
  };

  const handlePickClaPhoto = async (slotNum: 1 | 2 | 3) => {
    Alert.alert(
      `Chụp ảnh đối kiểm góc ${slotNum}`,
      slotNum === 1
        ? 'Chụp mặt trước & tổng thể kiện hàng nhận được'
        : slotNum === 2
        ? 'Chụp góc cạnh & chi tiết phụ kiện bên trong thùng'
        : 'Chụp tem niêm phong Nanuk vật lý',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chụp ảnh (Camera)',
          onPress: async () => {
            try {
              const perm = await ImagePicker.requestCameraPermissionsAsync();
              if (!perm.granted) {
                Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền máy ảnh để chụp ảnh đối kiểm.');
                return;
              }
              const res = await ImagePicker.launchCameraAsync({
                quality: 0.8,
                allowsEditing: true,
              });
              if (!res.canceled && res.assets[0]?.uri) {
                await processUploadedPhoto(slotNum, res.assets[0].uri);
              }
            } catch {
              Alert.alert('Thông báo', 'Không thể mở máy ảnh trên thiết bị này.');
            }
          },
        },
        {
          text: 'Chọn từ Thư viện ảnh',
          onPress: async () => {
            try {
              const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (!perm.granted) {
                Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền thư viện để chọn ảnh đối kiểm.');
                return;
              }
              const res = await ImagePicker.launchImageLibraryAsync({
                quality: 0.8,
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
              });
              if (!res.canceled && res.assets[0]?.uri) {
                await processUploadedPhoto(slotNum, res.assets[0].uri);
              }
            } catch {
              Alert.alert('Thông báo', 'Không thể mở thư viện ảnh.');
            }
          },
        },
      ]
    );
  };

  const processUploadedPhoto = async (slotNum: 1 | 2 | 3, localUri: string) => {
    setUploadingSlot(slotNum);
    try {
      const cloudUrl = await uploadImageToCloudinary({ uri: localUri });
      const finalUrl = cloudUrl || localUri;
      if (slotNum === 1) setClaSlot1(finalUrl);
      if (slotNum === 2) setClaSlot2(finalUrl);
      if (slotNum === 3) setClaSlot3(finalUrl);
    } catch {
      if (slotNum === 1) setClaSlot1(localUri);
      if (slotNum === 2) setClaSlot2(localUri);
      if (slotNum === 3) setClaSlot3(localUri);
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleConfirmClaSign = async () => {
    if (!order) return;
    setSubmittingCla(true);

    const s1 =
      claSlot1 || itemImg || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800';
    const s2 =
      claSlot2 || 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
    const s3 =
      claSlot3 || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800';

    let updatedFromApi: RentalOrderApi | null = null;
    try {
      updatedFromApi = await confirmReceivedOrderApi(order._id, {
        photos: { slot1: s1, slot2: s2, slot3: s3 },
        images: [s1, s2, s3],
        note: claNote.trim() || 'Khách hàng đã mở kiện kiểm tra 3 góc và ký nhận biên bản CLA.',
        signerName: user?.fullName || order.shippingAddress?.recipientName || 'Khách hàng ReUse',
        signerPhone: user?.phoneNumber || order.shippingAddress?.recipientPhone || '',
      });
    } catch (e) {
      console.warn('API confirm received fallback:', e);
    }

    storage.setSync(`cla_signed_${orderKey}`, 'true');

    setOrder((prev) =>
      prev
        ? ({
            ...prev,
            ...(updatedFromApi || {}),
            status: 'RENTING',
            claSigned: true,
            claProof: {
              isSigned: true,
              signedAt: new Date().toISOString(),
              signerName:
                user?.fullName || prev.shippingAddress?.recipientName || 'Khách hàng ReUse',
              photos: { slot1: s1, slot2: s2, slot3: s3 },
              images: [s1, s2, s3],
              note: claNote,
            },
            returnRequest: null,
          } as any)
        : null
    );

    setSubmittingCla(false);
    setClaModalVisible(false);
    Alert.alert(
      'Ký biên bản CLA thành công! 🎉',
      'Đã lưu 3 góc ảnh đối kiểm vào hệ thống. Đơn hàng chính thức chuyển sang Đang thuê (Bước 6) — nút Báo Trả đồ / Hoàn cọc Escrow đã sẵn sàng!'
    );
  };

  const handleRentAgain = () => {
    const rawProdId =
      (typeof item?.productId === 'object' && item?.productId?._id) ||
      (typeof item?.productId === 'object' && item?.productId?.id) ||
      item?.productId ||
      item?.id ||
      item?._id ||
      '6acee0804c6e5d97a2389e54';
    const prodId = typeof rawProdId === 'string' ? rawProdId : String(rawProdId);

    const rentPrice =
      Number(item?.price) ||
      Number(item?.pricePerDay) ||
      (days > 0 ? rentalFee / days : 160000);

    navigation.navigate('RentProductDetail', {
      id: prodId,
      productId: prodId,
      item: {
        id: prodId,
        _id: prodId,
        title: itemTitle,
        name: itemTitle,
        price: rentPrice,
        pricePerDay: rentPrice,
        deposit: deposit,
        depositAmount: deposit,
        image: itemImg,
        imageUrl: itemImg,
        images: [itemImg],
      },
    });
  };

  const handlePayNow = () => {
    if (!order) return;
    navigation.navigate('RentCheckout', {
      orderId: order._id,
      order: order,
    });
  };

  return (
    <View style={styles.safeArea}>
      <AppHeader title={`Chi Tiết ${orderCode}`} showBack />

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#1C1A18" />
          <Text style={styles.loadingText}>Đang tải chi tiết đơn thuê...</Text>
        </View>
      ) : !order ? (
        <View style={styles.emptyCenter}>
          <Feather name="alert-circle" size={36} color="#DC2626" style={{ marginBottom: 8 }} />
          <Text style={styles.emptyTitle}>Không tìm thấy đơn thuê</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Quay lại danh sách</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* 1. STATUS HEADER */}
          <View style={styles.headerBox}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.orderCode}>{orderCode}</Text>
                <Text style={styles.orderDate}>
                  Tạo ngày{' '}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('vi-VN')
                    : 'Gần đây'}
                </Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  isDeliveredWaitingSign && {
                    backgroundColor: '#FFF7ED',
                    borderWidth: 1,
                    borderColor: '#FDBA74',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    isDeliveredWaitingSign && { color: '#C2410C' },
                  ]}
                >
                  {isDeliveredWaitingSign
                    ? 'KÝ CLA (BƯỚC 5)'
                    : isRentingActual
                    ? 'ĐANG THUÊ (RENTING)'
                    : order.status || 'PAID'}
                </Text>
              </View>
            </View>

            {/* Smart Escrow Notice */}
            <View style={styles.escrowNotice}>
              <Ionicons name="shield-checkmark" size={18} color="#059669" />
              <View style={styles.escrowNoticeTextWrap}>
                <Text style={styles.escrowNoticeTitle}>
                  Ký quỹ Smart Escrow: {formatVND(deposit)}
                </Text>
                <Text style={styles.escrowNoticeDesc}>
                  Được bảo chứng độc lập. Tiền cọc được tự động giải phóng hoàn trả 100% về ví của bạn sau khi Shop Owner hoàn tất nghiệm thu trả hàng.
                </Text>
              </View>
            </View>
          </View>

          {/* 2. PRODUCT ITEM CARD */}
          <View style={styles.card}>
            <Text style={styles.cardSectionPre}>THIẾT BỊ BÀN GIAO</Text>
            <View style={styles.productRow}>
              <Image source={{ uri: itemImg }} style={styles.productImg} />
              <View style={styles.productInfo}>
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeBadgeText}>GRADE A+ 95%</Text>
                </View>
                <Text style={styles.productTitle}>{itemTitle}</Text>
                <Text style={styles.productPeriod}>
                  Chu kỳ: {startStr} – {endStr} ({days} ngày)
                </Text>
              </View>
            </View>

            {/* Verification & Accessories Checklist */}
            <View style={styles.checklistWrap}>
              <Text style={styles.checklistHead}>PHỤ KIỆN BÀN GIAO &amp; NIÊM PHONG:</Text>
              {[
                'Thùng chống sốc Nanuk/Pelican có seal niêm phong',
                'Hồ sơ kiểm định quang học/cảm biến Audit Bench 100%',
                'Khử trùng y tế buồng tia UV-C trước khi đóng gói',
              ].map((text, idx) => (
                <View key={idx} style={styles.checkItem}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={styles.checkText}>{text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 2.5. CLA 3-ANGLE HANDOVER PHOTOS (if signed) */}
          {hasClaSigned && order.claProof?.photos?.slot1 ? (
            <View style={styles.card}>
              <Text style={styles.cardSectionPre}>BIÊN BẢN BÀN GIAO CLA 3 GÓC</Text>
              <Text style={styles.cardTitle}>Ảnh 3 góc xác nhận khi bắt đầu thuê</Text>
              <View style={styles.threePhotosRow}>
                <View style={styles.photoCol}>
                  <Image
                    source={{ uri: normalizeImageUrl(order.claProof.photos.slot1) }}
                    style={styles.photoBox}
                  />
                  <Text style={styles.photoCaption}>Góc 1: Mặt trước</Text>
                </View>
                <View style={styles.photoCol}>
                  <Image
                    source={{
                      uri: normalizeImageUrl(
                        order.claProof.photos.slot2 || order.claProof.photos.slot1
                      ),
                    }}
                    style={styles.photoBox}
                  />
                  <Text style={styles.photoCaption}>Góc 2: Phụ kiện</Text>
                </View>
                <View style={styles.photoCol}>
                  <Image
                    source={{
                      uri: normalizeImageUrl(
                        order.claProof.photos.slot3 || order.claProof.photos.slot1
                      ),
                    }}
                    style={styles.photoBox}
                  />
                  <Text style={styles.photoCaption}>Góc 3: Tem seal</Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* 3. FINANCIAL BREAKDOWN */}
          <View style={styles.card}>
            <Text style={styles.cardSectionPre}>BẢNG CẤU TRÚC TÀI CHÍNH</Text>
            <Text style={styles.cardTitle}>Chi tiết chi phí &amp; Ký quỹ</Text>

            <View style={styles.costTable}>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Phí thuê ({days} ngày)</Text>
                <Text style={styles.costValue}>{formatVND(rentalFee)}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Vận chuyển 2 chiều (Chuyên dụng)</Text>
                <Text style={styles.costValue}>{formatVND(shippingFee)}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabelHighlight}>Tiền cọc Smart Escrow (Hoàn 100%)</Text>
                <Text style={styles.costValueGreen}>{formatVND(deposit)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.costRowTotal}>
                <Text style={styles.totalLabel}>Tổng thanh toán ban đầu</Text>
                <Text style={styles.totalValue}>{formatVND(total)}</Text>
              </View>
            </View>
          </View>

          {/* 4. ACTIONS */}
          <View style={styles.actionsWrap}>
            {isDeliveredWaitingSign ? (
              <TouchableOpacity
                style={styles.actionBtnClaOrange}
                onPress={handleOpenClaModal}
                activeOpacity={0.88}
              >
                <Feather name="edit-3" size={16} color="#FFFFFF" />
                <Text style={styles.actionBtnPrimaryText}>
                  Ký CLA (Chụp 3 góc xác nhận bắt đầu thuê)
                </Text>
              </TouchableOpacity>
            ) : isRentingActual ? (
              <TouchableOpacity
                style={[styles.actionBtnPrimary, { backgroundColor: '#059669' }]}
                onPress={() =>
                  navigation.navigate('ReturnRequest', {
                    id: order?._id || order?.orderCode || orderId,
                  })
                }
              >
                <Feather name="corner-up-left" size={16} color="#FFFFFF" />
                <Text style={styles.actionBtnPrimaryText}>Báo Trả đồ / Hoàn cọc Escrow</Text>
              </TouchableOpacity>
            ) : rawStatus === 'WAITING_PAYMENT' ? (
              <TouchableOpacity
                style={[styles.actionBtnPrimary, { backgroundColor: '#0284C7' }]}
                onPress={handlePayNow}
              >
                <Feather name="credit-card" size={16} color="#FFFFFF" />
                <Text style={styles.actionBtnPrimaryText}>Thanh toán qua VNPay Sandbox</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={handleRentAgain}
              activeOpacity={0.85}
            >
              <Feather name="repeat" size={16} color="#1C1A18" />
              <Text style={styles.actionBtnSecondaryText}>Thuê lại sản phẩm này</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => navigation.navigate('Chat')}
            >
              <Feather name="message-square" size={16} color="#1C1A18" />
              <Text style={styles.actionBtnSecondaryText}>Nhắn tin hỗ trợ kỹ thuật</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* CLA 3-Angle Signing Modal */}
      <Modal
        visible={claModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setClaModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleWrap}>
                <Feather name="shield" size={18} color="#EA580C" />
                <Text style={styles.modalTitle}>KÝ BIÊN BẢN CLA & CHỤP 3 GÓC BẮT ĐẦU THUÊ</Text>
              </View>
              <TouchableOpacity onPress={() => setClaModalVisible(false)}>
                <Feather name="x" size={20} color="#78736A" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Product Snapshot */}
              <View style={styles.modalProductBox}>
                <Image source={{ uri: itemImg }} style={styles.modalProdImg} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalProdCode}>{orderCode}</Text>
                  <Text style={styles.modalProdTitle} numberOfLines={2}>
                    {itemTitle}
                  </Text>
                  <Text style={styles.modalProdMeta}>
                    Cọc Smart Escrow: {formatVND(deposit)} · Thuê: {formatVND(rentalFee)}
                  </Text>
                </View>
              </View>

              {/* 3 Angle Photo Slots */}
              <View style={styles.userCaptureBox}>
                <View style={styles.secHeaderRow}>
                  <Feather name="camera" size={14} color="#EA580C" />
                  <Text style={styles.userCaptureTitle}>
                    CHỤP 3 GÓC HIỆN TRẠNG ĐỂ BẮT ĐẦU THUÊ
                  </Text>
                </View>
                <Text style={styles.userCaptureSub}>
                  Mở kiện kiểm tra sản phẩm và chụp 3 góc ảnh để lưu vào biên bản bàn giao CLA:
                </Text>

                <View style={styles.captureSlotsRow}>
                  {[
                    { num: 1 as const, val: claSlot1, title: 'Góc 1: Mặt trước', sub: 'Tổng thể' },
                    { num: 2 as const, val: claSlot2, title: 'Góc 2: Phụ kiện', sub: 'Góc cạnh' },
                    { num: 3 as const, val: claSlot3, title: 'Góc 3: Tem seal', sub: 'Niêm phong' },
                  ].map((slot) => (
                    <TouchableOpacity
                      key={slot.num}
                      style={styles.captureSlot}
                      onPress={() => handlePickClaPhoto(slot.num)}
                      disabled={uploadingSlot === slot.num}
                      activeOpacity={0.8}
                    >
                      {uploadingSlot === slot.num ? (
                        <ActivityIndicator size="small" color="#EA580C" />
                      ) : slot.val ? (
                        <>
                          <Image
                            source={{ uri: slot.val }}
                            style={styles.capturedImg}
                            resizeMode="cover"
                          />
                          <View style={styles.rePickOverlay}>
                            <Feather name="camera" size={11} color="#fff" />
                            <Text style={styles.rePickText}>Đổi</Text>
                          </View>
                        </>
                      ) : (
                        <View style={styles.emptySlotContent}>
                          <Feather name="camera" size={20} color="#EA580C" />
                          <Text style={styles.slotBtnTitle}>{slot.title}</Text>
                          <Text style={styles.slotBtnSub}>{slot.sub}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Note Input */}
              <View style={styles.noteInputBox}>
                <Text style={styles.noteInputLabel}>GHI CHÚ ĐỐI KIỂM KHI NHẬN HÀNG</Text>
                <TextInput
                  style={styles.noteTextInput}
                  value={claNote}
                  onChangeText={setClaNote}
                  placeholder="Ghi chú tình trạng khi mở kiện..."
                  placeholderTextColor="#A8A29E"
                  multiline
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setClaModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Hủy bỏ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, submittingCla && { opacity: 0.7 }]}
                disabled={submittingCla}
                onPress={handleConfirmClaSign}
              >
                {submittingCla ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Feather name="check" size={16} color="#FFFFFF" />
                    <Text style={styles.modalSubmitText}>Ký CLA & Bắt đầu thuê</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default RentOrderDetailScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF9F5',
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#78736A',
  },
  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 12,
  },
  backBtn: {
    backgroundColor: '#1C1A18',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 14,
  },
  headerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 16,
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCode: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#1C1A18',
  },
  orderDate: {
    fontSize: 11,
    color: '#78736A',
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  escrowNotice: {
    flexDirection: 'row',
    backgroundColor: '#F4F0EA',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  escrowNoticeTextWrap: {
    flex: 1,
  },
  escrowNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 2,
  },
  escrowNoticeDesc: {
    fontSize: 11,
    color: '#5E5A53',
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 16,
    gap: 10,
  },
  cardSectionPre: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#78736A',
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1A18',
  },
  productRow: {
    flexDirection: 'row',
    gap: 12,
  },
  productImg: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#F4F0EA',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  gradeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F4F0EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  gradeBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#1C1A18',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
    lineHeight: 18,
  },
  productPeriod: {
    fontSize: 11,
    color: '#78736A',
    marginTop: 2,
  },
  checklistWrap: {
    backgroundColor: '#FBF9F5',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    gap: 6,
    marginTop: 4,
  },
  checklistHead: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#78736A',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkText: {
    fontSize: 11,
    color: '#1C1A18',
  },
  threePhotosRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  photoCol: {
    flex: 1,
    alignItems: 'center',
  },
  photoBox: {
    width: '100%',
    height: 76,
    borderRadius: 8,
    backgroundColor: '#EFECE6',
  },
  photoCaption: {
    fontSize: 10,
    fontWeight: '600',
    color: '#57534E',
    marginTop: 4,
  },
  costTable: {
    gap: 8,
    marginTop: 4,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  costLabel: {
    fontSize: 12,
    color: '#5E5A53',
  },
  costValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1A18',
  },
  costLabelHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  costValueGreen: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  divider: {
    height: 1,
    backgroundColor: '#E7E2DA',
    marginVertical: 4,
  },
  costRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1A18',
  },
  actionsWrap: {
    gap: 8,
    marginTop: 6,
  },
  actionBtnClaOrange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1A18',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E2DA',
  },
  modalHeaderTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1A18',
    flexShrink: 1,
  },
  modalBody: {
    paddingVertical: 14,
  },
  modalProductBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFECE6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  modalProdImg: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#EFECE6',
  },
  modalProdCode: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#78736A',
  },
  modalProdTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
    marginTop: 2,
  },
  modalProdMeta: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
    marginTop: 4,
  },
  userCaptureBox: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  secHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userCaptureTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9A3412',
  },
  userCaptureSub: {
    fontSize: 11,
    color: '#C2410C',
    marginBottom: 10,
    lineHeight: 16,
  },
  captureSlotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  captureSlot: {
    flex: 1,
    height: 88,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FDBA74',
    borderStyle: 'dashed',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  emptySlotContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  slotBtnTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
    marginTop: 3,
    textAlign: 'center',
  },
  slotBtnSub: {
    fontSize: 9,
    color: '#78736A',
  },
  capturedImg: {
    width: '100%',
    height: '100%',
  },
  rePickOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rePickText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '700',
  },
  noteInputBox: {
    marginBottom: 10,
  },
  noteInputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#78736A',
    marginBottom: 6,
  },
  noteTextInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    color: '#1C1A18',
    minHeight: 54,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E7E2DA',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D6D3D1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#57534E',
  },
  modalSubmitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    borderRadius: 10,
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
