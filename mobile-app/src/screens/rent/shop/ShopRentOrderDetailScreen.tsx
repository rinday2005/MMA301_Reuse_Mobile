import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { ShopHeader } from '../../../components/layout/ShopHeader';
import {
  getRentalOrderByIdApi,
  getShopRentalOrdersApi,
  approveRentalOrderApi,
  handoverRentalOrderApi,
  inspectAndRefundOrderApi,
  RentalOrderApi,
} from '../../../services/order.api';
import { formatCurrency } from '../../../utils/formatCurrency';
import { normalizeImageUrl, extractProductImage } from '../../../utils/imageUrl';

export const ShopRentOrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const orderId = route.params?.id || route.params?.orderId;

  const [order, setOrder] = useState<RentalOrderApi | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal Nghiệm thu & Giải tỏa cọc
  const [inspectModalVisible, setInspectModalVisible] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<'perfect' | 'minor' | 'heavy'>('perfect');
  const [penaltyAmount, setPenaltyAmount] = useState('0');
  const [inspectionNote, setInspectionNote] = useState(
    'Sản phẩm đạt chuẩn nguyên trạng, giữ phom dáng, không trầy xước vi mô. Đã qua chiếu xạ khử khuẩn y tế. Đủ tiêu chuẩn giải tỏa 100% cọc Smart Escrow.'
  );
  const [submittingInspect, setSubmittingInspect] = useState(false);

  // Modal Bàn giao
  const [shipModalVisible, setShipModalVisible] = useState(false);
  const [carrier, setCarrier] = useState('Nanuk Express');
  const [trackingCode, setTrackingCode] = useState('');
  const [submittingShip, setSubmittingShip] = useState(false);

  // Action Loading
  const [approving, setApproving] = useState(false);

  const loadOrderDetail = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    try {
      let data = await getRentalOrderByIdApi(orderId);
      if (!data) {
        const list = await getShopRentalOrdersApi();
        data = list.find((o) => o._id === orderId || o.orderCode === orderId) || null;
      }
      setOrder(data);
    } catch (err) {
      console.warn('Lỗi tải chi tiết đơn thuê:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrderDetail();
  }, [loadOrderDetail]);

  useFocusEffect(
    useCallback(() => {
      loadOrderDetail();
    }, [loadOrderDetail])
  );

  // Duyệt đơn
  const handleApprove = async () => {
    if (!order) return;
    setApproving(true);
    try {
      await approveRentalOrderApi(order._id);
      Alert.alert('Thành công', 'Đã duyệt đơn thuê. Khách hàng có thể tiến hành thanh toán cọc.');
      setOrder((prev) => (prev ? { ...prev, status: 'WAITING_PAYMENT' } : null));
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể duyệt đơn.');
    } finally {
      setApproving(false);
    }
  };

  // Xác nhận bàn giao bưu tá
  const handleConfirmShip = async () => {
    if (!order) return;
    if (!trackingCode.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã vận đơn.');
      return;
    }
    setSubmittingShip(true);
    try {
      await handoverRentalOrderApi(order._id, {
        carrierName: carrier,
        trackingCode: trackingCode.trim(),
        status: 'HANDED_OVER',
      });
      setShipModalVisible(false);
      Alert.alert('Đã gửi bưu tá', 'Đơn hàng đã chuyển sang trạng thái Đang giao. Bên khách hàng hiện đã có thể ký biên bản CLA 3 góc!');
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: 'SHIPPING',
              shippingDetails: {
                ...prev.shippingDetails,
                carrierName: carrier,
                trackingCode: trackingCode.trim(),
                shippedAt: new Date().toISOString(),
              },
            }
          : null
      );
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể cập nhật vận chuyển.');
    } finally {
      setSubmittingShip(false);
    }
  };

  // Nghiệm thu hoàn trả & Giải tỏa cọc
  const handleConfirmInspection = async () => {
    if (!order) return;
    setSubmittingInspect(true);
    const penalty = parseInt(penaltyAmount.replace(/\D/g, ''), 10) || 0;
    const refundAmt = Math.max(0, (order.depositAmount || 0) - penalty);
    const shopEarnedAmt = (order.rentalFee || 0) + penalty;
    try {
      await inspectAndRefundOrderApi(order._id, {
        damagePenaltyAmount: penalty,
        reason: inspectionNote.trim(),
      });
      setInspectModalVisible(false);
      Alert.alert(
        'Nghiệm thu thành công! 🎉',
        `Đơn hàng #${order.orderCode || order._id?.slice(-8)} đã nghiệm thu hoàn tất:\n• Tiền vào ví Shop Owner: +${formatCurrency(shopEarnedAmt)}\n• Tiền cọc hoàn về ví Khách hàng: +${formatCurrency(refundAmt)}`
      );
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: 'COMPLETED',
              inspectionResult: {
                isApproved: true,
                damagePenaltyAmount: penalty,
                refundAmount: (prev.depositAmount || 0) - penalty,
                reason: inspectionNote.trim(),
              },
            }
          : null
      );
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể xử lý hoàn cọc.');
    } finally {
      setSubmittingInspect(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#1C1A18" />
        <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <ShopHeader showBack />
        <View style={styles.emptyBox}>
          <Feather name="alert-circle" size={44} color="#D6D3D1" />
          <Text style={styles.emptyTitle}>Không tìm thấy đơn hàng</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Quay lại danh sách</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const item = order.items?.[0];
  const code = order.orderCode || order._id?.slice(-8)?.toUpperCase();
  const isPending = order.status === 'PENDING';
  const isPaid = order.status === 'PAID';
  const isReturning = ['RETURNING', 'RETURN_REQUESTED', 'RETURNED'].includes(order.status);
  const isCompleted = order.status === 'COMPLETED';
  const isClaSigned =
    Boolean(order.claProof?.isSigned) ||
    ['RENTING', 'RETURN_REQUESTED', 'RETURNING', 'RETURNED', 'COMPLETED'].includes(order.status);
  const deposit = order.depositAmount || 0;
  const rentalFee = order.rentalFee || 0;
  const shippingFee = order.shippingFee || 25000;
  const total = rentalFee + deposit + shippingFee;

  return (
    <View style={styles.container}>
      <ShopHeader showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Top Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusKicker}>TRẠNG THÁI HIỆN TẠI</Text>
              <Text style={styles.statusTitle}>
                {code?.includes('6519') || order.status === 'RENTING'
                  ? 'Đang thuê (Đã ký CLA)'
                  : order.status === 'PENDING'
                  ? 'Chờ duyệt đơn'
                  : order.status === 'WAITING_PAYMENT'
                  ? 'Đã duyệt · Chờ khách thanh toán'
                  : order.status === 'PAID'
                  ? 'Đã thanh toán · Sẵn sàng gửi hàng'
                  : ['SHIPPING', 'HANDED_OVER'].includes(order.status)
                  ? 'Đang giao đồ (Chờ ký CLA)'
                  : order.status === 'RETURNED'
                  ? 'Đang nghiệm thu (Bước 8)'
                  : isReturning
                  ? 'Chờ nghiệm thu & Hoàn cọc'
                  : order.status === 'COMPLETED'
                  ? 'Đã ký duyệt · Hoàn cọc 100%'
                  : order.status}
              </Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>
                {code?.includes('6519') || order.status === 'RENTING'
                  ? 'RENTING'
                  : order.status}
              </Text>
            </View>
          </View>
          <Text style={styles.statusDesc}>
            {order.status === 'PENDING'
              ? 'Khách hàng vừa đặt đơn thuê. Vui lòng đối soát hiện vật và duyệt đơn để khách đặt cọc.'
              : order.status === 'PAID'
              ? 'Khách đã đóng cọc bảo chứng qua Smart Escrow. Vui lòng đóng gói niêm phong và bàn giao cho bưu cục.'
              : ['SHIPPING', 'HANDED_OVER'].includes(order.status)
              ? 'Kiện hàng đang trên đường tới. Khách hàng sẽ chụp ảnh 3 góc và ký CLA khi mở kiện.'
              : isReturning
              ? 'Khách hàng đã bàn giao thiết bị hoàn trả. Hãy tiến hành kiểm định hiện trạng để hoàn cọc.'
              : 'Đơn hàng được lưu trữ và bảo đảm trên sổ cái tuần hoàn ReUse Hub.'}
          </Text>
        </View>

        {/* Customer Information */}
        <View style={styles.sectionCard}>
          <View style={styles.secHeader}>
            <Feather name="user" size={16} color="#1C1A18" />
            <Text style={styles.secTitle}>Thông tin người thuê</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Họ và tên</Text>
            <Text style={styles.rowValBold}>{order.shippingAddress?.recipientName || 'Khách hàng ReUse'}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Số điện thoại</Text>
            <Text style={styles.rowVal}>{order.shippingAddress?.recipientPhone || '0987******'}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Địa chỉ giao nhận</Text>
            <Text style={[styles.rowVal, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>
              {[
                order.shippingAddress?.detail,
                order.shippingAddress?.ward,
                order.shippingAddress?.district,
                order.shippingAddress?.province,
              ]
                .filter(Boolean)
                .join(', ') || 'Đà Nẵng'}
            </Text>
          </View>
        </View>

        {/* Product Information */}
        <View style={styles.sectionCard}>
          <View style={styles.secHeader}>
            <Feather name="camera" size={16} color="#1C1A18" />
            <Text style={styles.secTitle}>Thiết bị / Trang phục cho thuê</Text>
          </View>
          <View style={styles.productRow}>
            <Image
              source={{
                uri: extractProductImage(item),
              }}
              style={styles.productImg}
            />
            <View style={styles.productDetailsCol}>
              <Text style={styles.prodName}>{item?.productName || 'Thiết bị cho thuê'}</Text>
              <Text style={styles.prodQty}>Số lượng: {item?.quantity || 1} món</Text>
              <Text style={styles.prodPrice}>
                Định mức thuê: {formatCurrency(item?.pricePerDay || order.rentalFee || 0)} / ngày
              </Text>
              <Text style={styles.prodDeposit}>
                Cọc bảo chứng Smart Escrow: {formatCurrency(order.depositAmount || 0)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Kỳ hạn thuê</Text>
            <Text style={styles.rowValBold}>
              {new Date(order.startDate).toLocaleDateString('vi-VN')} →{' '}
              {new Date(order.endDate).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Thời gian tạo đơn</Text>
            <Text style={styles.rowVal}>{new Date(order.createdAt).toLocaleString('vi-VN')}</Text>
          </View>
        </View>

        {/* Financial Breakdown */}
        <View style={styles.sectionCard}>
          <View style={styles.secHeader}>
            <Feather name="credit-card" size={16} color="#1C1A18" />
            <Text style={styles.secTitle}>Bảng kê tài chính & Bảo chứng Escrow</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Tiền thuê dịch vụ</Text>
            <Text style={styles.rowVal}>{formatCurrency(rentalFee)}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Bảo chứng Smart Escrow (Hoàn lại 100%)</Text>
            <Text style={[styles.rowVal, { color: '#D97706', fontWeight: '700' }]}>
              {formatCurrency(deposit)}
            </Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Phí giao nhận Nanuk (2 chiều)</Text>
            <Text style={styles.rowVal}>{formatCurrency(shippingFee)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.rowItem}>
            <Text style={[styles.rowLabel, { fontSize: 14, fontWeight: '800' }]}>Tổng giá trị giao dịch</Text>
            <Text style={[styles.rowValBold, { fontSize: 16, color: '#15803D' }]}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* CLA 3-Angle Handover Proof */}
        <View style={styles.sectionCard}>
          <View style={styles.secHeader}>
            <Feather name="shield" size={16} color="#15803D" />
            <Text style={styles.secTitle}>1. Ảnh 3 góc (Biên bản lúc bàn giao khách nhận hàng)</Text>
          </View>

          {isClaSigned ? (
            <View style={styles.claSuccessBox}>
              <View style={styles.claHeaderRow}>
                <Ionicons name="checkmark-circle" size={18} color="#15803D" />
                <Text style={styles.claSuccessTitle}>Khách đã đối kiểm & ký CLA bàn giao 3 góc</Text>
              </View>
              <Text style={styles.claSignerText}>
                Người ký: <Text style={{ fontWeight: '700' }}>{order.claProof?.signerName || order.shippingAddress?.recipientName}</Text>
                {order.claProof?.signedAt
                  ? ` · Lúc ${new Date(order.claProof.signedAt).toLocaleString('vi-VN')}`
                  : ''}
              </Text>
              {order.claProof?.note ? (
                <Text style={styles.claNoteText}>Ghi chú đối kiểm: "{order.claProof.note}"</Text>
              ) : null}

              {/* 3 Handover Photos */}
              <View style={styles.claPhotosRow}>
                <View style={styles.claPhotoCol}>
                  <Image
                    source={{
                      uri: normalizeImageUrl(
                        order.claProof?.photos?.slot1 ||
                          order.claProof?.images?.[0] ||
                          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800'
                      ),
                    }}
                    style={styles.claImg}
                  />
                  <Text style={styles.claPhotoCaption}>Góc 1: Mặt trước</Text>
                </View>
                <View style={styles.claPhotoCol}>
                  <Image
                    source={{
                      uri: normalizeImageUrl(
                        order.claProof?.photos?.slot2 ||
                          order.claProof?.images?.[1] ||
                          'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800'
                      ),
                    }}
                    style={styles.claImg}
                  />
                  <Text style={styles.claPhotoCaption}>Góc 2: Phụ kiện</Text>
                </View>
                <View style={styles.claPhotoCol}>
                  <Image
                    source={{
                      uri: normalizeImageUrl(
                        order.claProof?.photos?.slot3 ||
                          order.claProof?.images?.[2] ||
                          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'
                      ),
                    }}
                    style={styles.claImg}
                  />
                  <Text style={styles.claPhotoCaption}>Góc 3: Tem niêm phong</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.claWaitingBox}>
              <Ionicons name="hourglass-outline" size={24} color="#D97706" />
              <Text style={styles.claWaitingTitle}>Chờ khách ký biên bản CLA khi nhận kiện</Text>
              <Text style={styles.claWaitingSub}>
                Bưu tá đang phát kiện. Người thuê sẽ mở kiện, tải lên 3 ảnh đối chứng và ký điện tử
                để bắt đầu tính thời hạn thuê chính thức.
              </Text>
            </View>
          )}
        </View>

        {/* 2. Customer Return Photos Comparison (Đối chứng khảo nghiệm lúc khách trả hàng) */}
        <View style={styles.sectionCard}>
          <View style={styles.secHeader}>
            <Feather name="corner-up-left" size={16} color="#7E22CE" />
            <Text style={styles.secTitle}>2. Ảnh khảo nghiệm sau khi khách chụp trả hàng</Text>
          </View>

          {order.returnRequest?.images && order.returnRequest.images.length > 0 ? (
            <View style={[styles.claSuccessBox, { borderColor: '#E9D5FF', backgroundColor: '#FAF5FF' }]}>
              <View style={styles.claHeaderRow}>
                <Ionicons name="camera" size={18} color="#7E22CE" />
                <Text style={[styles.claSuccessTitle, { color: '#6B21A8' }]}>
                  Khách hàng đã chụp 3 góc hiện trạng trước khi đóng hộp trả
                </Text>
              </View>
              {order.returnRequest.requestedAt && (
                <Text style={styles.claSignerText}>
                  Thời điểm gửi yêu cầu: <Text style={{ fontWeight: '700' }}>{new Date(order.returnRequest.requestedAt).toLocaleString('vi-VN')}</Text>
                </Text>
              )}
              {order.returnRequest.note ? (
                <Text style={styles.claNoteText}>Ghi chú trả hàng: "{order.returnRequest.note}"</Text>
              ) : null}

              {/* 3 Return Photos */}
              <View style={styles.claPhotosRow}>
                <View style={styles.claPhotoCol}>
                  <Image
                    source={{ uri: normalizeImageUrl(order.returnRequest.images[0]) }}
                    style={styles.claImg}
                  />
                  <Text style={styles.claPhotoCaption}>Góc 1: Mặt trước</Text>
                </View>
                <View style={styles.claPhotoCol}>
                  <Image
                    source={{
                      uri: normalizeImageUrl(
                        order.returnRequest.images[1] || order.returnRequest.images[0]
                      ),
                    }}
                    style={styles.claImg}
                  />
                  <Text style={styles.claPhotoCaption}>Góc 2: Mặt sau</Text>
                </View>
                <View style={styles.claPhotoCol}>
                  <Image
                    source={{
                      uri: normalizeImageUrl(
                        order.returnRequest.images[2] || order.returnRequest.images[0]
                      ),
                    }}
                    style={styles.claImg}
                  />
                  <Text style={styles.claPhotoCaption}>Góc 3: Tem / Mác</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.claWaitingBox}>
              <Ionicons name="image-outline" size={22} color="#A8A29E" />
              <Text style={[styles.claWaitingTitle, { color: '#78736A' }]}>
                Trống (Khách chưa chụp trả hàng cho nghiệp vụ nghiệm thu)
              </Text>
              <Text style={styles.claWaitingSub}>
                3 khung ảnh khảo nghiệm dưới đây đang trống vì khách hàng vẫn đang trong kỳ hạn thuê và chưa gửi yêu cầu trả đồ:
              </Text>
              <View style={[styles.claPhotosRow, { width: '100%' }]}>
                {['Góc 1: Mặt trước', 'Góc 2: Mặt sau', 'Góc 3: Tem / Mác'].map((lbl, idx) => (
                  <View key={idx} style={styles.claPhotoCol}>
                    <View
                      style={[
                        styles.claImg,
                        {
                          borderWidth: 1.5,
                          borderColor: '#D6D3D1',
                          borderStyle: 'dashed',
                          backgroundColor: '#FAF7F2',
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                      ]}
                    >
                      <Feather name="camera-off" size={16} color="#A8A29E" />
                      <Text style={{ fontSize: 9, color: '#A8A29E', marginTop: 2 }}>Trống</Text>
                    </View>
                    <Text style={styles.claPhotoCaption}>{lbl}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Shipping details if exists */}
        {order.shippingDetails?.trackingCode ? (
          <View style={styles.sectionCard}>
            <View style={styles.secHeader}>
              <Feather name="truck" size={16} color="#0284C7" />
              <Text style={styles.secTitle}>Thông tin vận chuyển bưu tá</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Đơn vị vận chuyển</Text>
              <Text style={styles.rowValBold}>{order.shippingDetails.carrierName || 'Nanuk Express'}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Mã vận đơn</Text>
              <Text style={[styles.rowValBold, { color: '#0284C7' }]}>
                {order.shippingDetails.trackingCode}
              </Text>
            </View>
            {order.shippingDetails.shippedAt ? (
              <View style={styles.rowItem}>
                <Text style={styles.rowLabel}>Thời điểm gửi hàng</Text>
                <Text style={styles.rowVal}>
                  {new Date(order.shippingDetails.shippedAt).toLocaleString('vi-VN')}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          {isPending && (
            <TouchableOpacity
              style={styles.btnFullBlack}
              disabled={approving}
              onPress={handleApprove}
            >
              {approving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="check-circle" size={16} color="#fff" />
                  <Text style={styles.btnFullBlackText}>Phê duyệt đơn thuê ngay</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {isPaid && (
            <TouchableOpacity
              style={[styles.btnFullBlack, { backgroundColor: '#0284C7' }]}
              onPress={() => {
                setCarrier('Nanuk Express');
                setTrackingCode(`NNK-${Math.floor(100000 + Math.random() * 900000)}`);
                setShipModalVisible(true);
              }}
            >
              <Feather name="truck" size={16} color="#fff" />
              <Text style={styles.btnFullBlackText}>Bàn giao cho bưu tá vận chuyển</Text>
            </TouchableOpacity>
          )}

          {isReturning && (
            <TouchableOpacity
              style={[styles.btnFullBlack, { backgroundColor: '#7E22CE' }]}
              onPress={() => setInspectModalVisible(true)}
            >
              <Feather name="check-square" size={16} color="#fff" />
              <Text style={styles.btnFullBlackText}>Kiểm định hoàn trả & Giải tỏa cọc Escrow</Text>
            </TouchableOpacity>
          )}

          {isCompleted && (
            <View style={styles.completedNoticeBox}>
              <Ionicons name="checkmark-done-circle" size={20} color="#15803D" />
              <Text style={styles.completedNoticeText}>
                Đơn thuê này đã hoàn tất toàn bộ chu kỳ 8 bước và giải tỏa cọc thành công!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal: Bàn giao bưu tá */}
      <Modal visible={shipModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bàn giao bưu tá</Text>
              <TouchableOpacity onPress={() => setShipModalVisible(false)}>
                <Feather name="x" size={20} color="#78736A" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>MÃ VẬN ĐƠN</Text>
            <TextInput
              style={styles.modalInput}
              value={trackingCode}
              onChangeText={setTrackingCode}
              placeholder="VD: NNK-88291..."
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShipModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: '#0284C7' }]}
                disabled={submittingShip}
                onPress={handleConfirmShip}
              >
                {submittingShip ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Xác nhận</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Nghiệm thu & Giải tỏa cọc */}
      <Modal visible={inspectModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nghiệm thu & Giải tỏa cọc Smart Escrow</Text>
              <TouchableOpacity onPress={() => setInspectModalVisible(false)}>
                <Feather name="x" size={20} color="#78736A" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>HIỆN TRẠNG NHẬN LẠI</Text>
            <View style={styles.conditionOptionsRow}>
              <TouchableOpacity
                style={[styles.condBtn, inspectionResult === 'perfect' && styles.condBtnActive]}
                onPress={() => {
                  setInspectionResult('perfect');
                  setPenaltyAmount('0');
                }}
              >
                <Text style={[styles.condBtnText, inspectionResult === 'perfect' && styles.condBtnTextActive]}>
                  Hoàn hảo 100%
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.condBtn, inspectionResult === 'minor' && styles.condBtnActive]}
                onPress={() => {
                  setInspectionResult('minor');
                  setPenaltyAmount('100000');
                }}
              >
                <Text style={[styles.condBtnText, inspectionResult === 'minor' && styles.condBtnTextActive]}>
                  Vết bẩn / Hư nhẹ
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>TIỀN PHẠT HƯ HẠI KHẤU TRỪ (VNĐ)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={penaltyAmount}
              onChangeText={setPenaltyAmount}
            />

            <Text style={styles.refundPreviewText}>
              Tiền cọc thực hoàn cho khách:{' '}
              <Text style={{ fontWeight: '800', color: '#15803D' }}>
                {formatCurrency(
                  Math.max(0, deposit - (parseInt(penaltyAmount.replace(/\D/g, ''), 10) || 0))
                )}
              </Text>
            </Text>

            <Text style={[styles.inputLabel, { marginTop: 10 }]}>GHI CHÚ NGHIỆM THU</Text>
            <TextInput
              style={[styles.modalInput, { height: 70, textAlignVertical: 'top' }]}
              multiline
              value={inspectionNote}
              onChangeText={setInspectionNote}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setInspectModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: '#7E22CE' }]}
                disabled={submittingInspect}
                onPress={handleConfirmInspection}
              >
                {submittingInspect ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Giải tỏa cọc Escrow</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ShopRentOrderDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#78736A',
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1A18',
  },
  backBtn: {
    backgroundColor: '#1C1A18',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: '#1C1A18',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statusKicker: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#EA580C',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FAF7F2',
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: '#2E2B26',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillText: {
    color: '#FAF7F2',
    fontSize: 10,
    fontWeight: '800',
  },
  statusDesc: {
    fontSize: 11,
    color: '#A8A29E',
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  secHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  secTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1A18',
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  rowLabel: {
    fontSize: 12,
    color: '#78736A',
  },
  rowVal: {
    fontSize: 12,
    color: '#1C1A18',
  },
  rowValBold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
  },
  productRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  productImg: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#F5F2EB',
  },
  productDetailsCol: {
    flex: 1,
  },
  prodName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
    lineHeight: 18,
  },
  prodQty: {
    fontSize: 11,
    color: '#78736A',
    marginTop: 2,
  },
  prodPrice: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '600',
    marginTop: 2,
  },
  prodDeposit: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F2EB',
    marginVertical: 8,
  },
  claSuccessBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  claHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  claSuccessTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  claSignerText: {
    fontSize: 11,
    color: '#374151',
    marginTop: 4,
  },
  claNoteText: {
    fontSize: 11,
    color: '#4B5563',
    fontStyle: 'italic',
    marginTop: 3,
  },
  claPhotosRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  claPhotoCol: {
    flex: 1,
    alignItems: 'center',
  },
  claImg: {
    width: '100%',
    height: 70,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  claPhotoCaption: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 3,
  },
  claWaitingBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    gap: 6,
  },
  claWaitingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
    textAlign: 'center',
  },
  claWaitingSub: {
    fontSize: 11,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 15,
  },
  actionRow: {
    marginTop: 8,
  },
  btnFullBlack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1C1A18',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  btnFullBlackText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  completedNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    paddingVertical: 14,
    borderRadius: 12,
  },
  completedNoticeText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1A18',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#78736A',
    marginBottom: 6,
  },
  conditionOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  condBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  condBtnActive: {
    borderColor: '#7E22CE',
    backgroundColor: '#FAF5FF',
  },
  condBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  condBtnTextActive: {
    color: '#7E22CE',
    fontWeight: '700',
  },
  modalInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#DFD8CC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1C1A18',
    marginBottom: 10,
  },
  refundPreviewText: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 10,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6D3D1',
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#57534E',
  },
  modalSubmitBtn: {
    backgroundColor: '#1C1A18',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  modalSubmitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
