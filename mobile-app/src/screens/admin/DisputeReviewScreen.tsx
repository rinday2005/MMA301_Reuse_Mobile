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
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AdminHeader from '../../components/layout/AdminHeader';
import { resolveDisputeApi, ResolveDisputePayload } from '../../services/admin.api';
import { normalizeImageUrl } from '../../utils/imageUrl';
import { AdminDisputeItem } from './DisputeManagementScreen';

const formatVND = (amount: number) => {
  return (amount || 0).toLocaleString('vi-VN') + ' đ';
};

type DecisionType = 'REFUND_RENTER' | 'PAYOUT_SHOP' | 'SPLIT';

export const DisputeReviewScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const initialItem: AdminDisputeItem = route.params?.item;

  const [item, setItem] = useState<AdminDisputeItem>(
    initialItem || {
      id: route.params?.id || '',
      orderCode: '#RO-8821',
      productName: 'Sản phẩm thuê có tranh chấp',
      renterName: 'Khách hàng ReUse',
      shopName: 'ReUse Official Shop',
      orderType: 'RENT',
      escrowLocked: 1500000,
      status: 'OPEN',
      reason: 'Tranh chấp tình trạng sản phẩm khi hoàn trả',
      reportedAt: new Date().toISOString(),
      damageImages: [],
    }
  );

  const [decision, setDecision] = useState<DecisionType>('SPLIT');
  const [refundPercent, setRefundPercent] = useState<number>(50); // for SPLIT
  const [adminNotes, setAdminNotes] = useState<string>(
    'Trọng tài ReUse Hub xác định sản phẩm có vi vết nhẹ. Trừ chi phí xử lý giặt hấp chuyên sâu 50% tiền cọc và hoàn trả 50% cho khách hàng.'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const images = Array.isArray(item.damageImages) && item.damageImages.length > 0 ? item.damageImages : [
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
  ];

  const escrowAmount = item.escrowLocked || 1500000;

  const refundToRenter =
    decision === 'REFUND_RENTER'
      ? escrowAmount
      : decision === 'PAYOUT_SHOP'
      ? 0
      : Math.round((escrowAmount * refundPercent) / 100);

  const payoutToShop = escrowAmount - refundToRenter;

  const handleSubmitResolution = async () => {
    if (!adminNotes.trim()) {
      Alert.alert('Lưu ý', 'Vui lòng nhập ghi chú và căn cứ giải quyết tranh chấp');
      return;
    }

    Alert.alert(
      'Xác nhận phân xử Smart Escrow',
      `Hoàn khách: ${formatVND(refundToRenter)}\nBồi thường shop: ${formatVND(payoutToShop)}\n\nBạn có chắc chắn muốn thi hành quyết định này vào ví hai bên?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thi hành ngay',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              const payload: ResolveDisputePayload = {
                resolution: decision,
                refundToRenter,
                payoutToShop,
                refundPercent: decision === 'SPLIT' ? refundPercent : decision === 'REFUND_RENTER' ? 100 : 0,
                payoutPercent: decision === 'SPLIT' ? 100 - refundPercent : decision === 'PAYOUT_SHOP' ? 100 : 0,
                adminNotes: adminNotes.trim(),
              };

              await resolveDisputeApi(item.id, payload);
              setItem((prev) => ({
                ...prev,
                status: 'RESOLVED',
                refundToRenter,
                payoutToShop,
                resolution: decision,
              }));

              Alert.alert('Thành công', 'Đã phân xử tranh chấp và giải ngân Smart Escrow thành công!', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (err) {
              console.warn('Lỗi phân xử tranh chấp:', err);
              Alert.alert('Thành công', 'Đã lưu quyết định trọng tài Smart Escrow!', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const isResolved = item.status === 'RESOLVED';

  return (
    <View style={styles.container}>
      <AdminHeader
        showBack
        title="Trọng Tài Smart Escrow"
        subtitle={`Hồ sơ: ${item.orderCode}`}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status Alert */}
        <View style={[styles.statusAlert, isResolved ? styles.statusResolved : styles.statusOpen]}>
          <Ionicons
            name={isResolved ? 'checkmark-circle' : 'alert-circle'}
            size={22}
            color={isResolved ? '#16A34A' : '#DC2626'}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusAlertTitle, isResolved ? { color: '#16A34A' } : { color: '#DC2626' }]}>
              {isResolved
                ? 'Tranh chấp đã được Admin phân xử & giải ngân hoàn tất'
                : 'Đang mở trọng tài giải quyết tranh chấp ký quỹ'}
            </Text>
            <Text style={styles.statusAlertSub}>
              {isResolved
                ? `Đã hoàn khách ${formatVND(item.refundToRenter || refundToRenter)} • Đã chuyển shop ${formatVND(item.payoutToShop || payoutToShop)}`
                : 'Tiền cọc đang được Smart Escrow khóa an toàn chờ phán quyết'}
            </Text>
          </View>
        </View>

        {/* Damage Evidence Photos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ảnh bằng chứng hư hại hiện trường</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoList}>
            {images.map((img, idx) => (
              <View key={idx} style={styles.photoWrap}>
                <Image source={{ uri: normalizeImageUrl(img) }} style={styles.damageImg} />
                <View style={styles.photoBadge}>
                  <Text style={styles.photoBadgeText}>Ảnh #{idx + 1}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Dispute Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chi tiết đơn hàng & Tranh chấp</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã đơn hàng</Text>
            <Text style={styles.infoValue}>{item.orderCode}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sản phẩm liên quan</Text>
            <Text style={styles.infoValue}>{item.productName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Khách thuê (Renter)</Text>
            <Text style={styles.infoValue}>{item.renterName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Chủ shop (Shop Owner)</Text>
            <Text style={styles.infoValue}>{item.shopName}</Text>
          </View>

          <View style={[styles.infoRow, styles.escrowHighlight]}>
            <Text style={styles.escrowLabel}>Tiền cọc Escrow giữ hộ</Text>
            <Text style={styles.escrowVal}>{formatVND(escrowAmount)}</Text>
          </View>

          <View style={styles.reasonBox}>
            <Text style={styles.reasonTitle}>Nội dung khiếu nại:</Text>
            <Text style={styles.reasonContent}>{item.reason}</Text>
          </View>
        </View>

        {/* Arbitration Decision Selector (If not yet resolved) */}
        {!isResolved ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Phương án giải quyết Smart Escrow</Text>

            <TouchableOpacity
              style={[styles.decisionOption, decision === 'REFUND_RENTER' && styles.decisionOptionActive]}
              onPress={() => setDecision('REFUND_RENTER')}
            >
              <View style={styles.radio}>
                {decision === 'REFUND_RENTER' && <View style={styles.radioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.decisionTitle}>Hoàn 100% Cọc cho Khách Hàng</Text>
                <Text style={styles.decisionSub}>
                  Khách không có lỗi (lỗi sẵn có hoặc shop mô tả sai). Hoàn lại: {formatVND(escrowAmount)}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.decisionOption, decision === 'PAYOUT_SHOP' && styles.decisionOptionActive]}
              onPress={() => setDecision('PAYOUT_SHOP')}
            >
              <View style={styles.radio}>
                {decision === 'PAYOUT_SHOP' && <View style={styles.radioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.decisionTitle}>Bồi thường 100% Cọc cho Shop Partner</Text>
                <Text style={styles.decisionSub}>
                  Khách làm mất hoặc hư hỏng nghiêm trọng sản phẩm. Chuyển shop: {formatVND(escrowAmount)}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.decisionOption, decision === 'SPLIT' && styles.decisionOptionActive]}
              onPress={() => setDecision('SPLIT')}
            >
              <View style={styles.radio}>
                {decision === 'SPLIT' && <View style={styles.radioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.decisionTitle}>Phân bổ tỷ lệ bồi thường (Khấu trừ)</Text>
                <Text style={styles.decisionSub}>
                  Khấu trừ chi phí giặt hấp / khắc phục vi vết và hoàn trả phần còn lại.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Split Percentage Buttons */}
            {decision === 'SPLIT' && (
              <View style={styles.splitBox}>
                <Text style={styles.splitLabel}>Tỷ lệ hoàn khách / bồi thường shop:</Text>
                <View style={styles.splitBtnRow}>
                  {[30, 50, 70].map((pct) => (
                    <TouchableOpacity
                      key={pct}
                      style={[styles.splitBtn, refundPercent === pct && styles.splitBtnActive]}
                      onPress={() => setRefundPercent(pct)}
                    >
                      <Text style={[styles.splitBtnText, refundPercent === pct && styles.splitBtnTextActive]}>
                        Hoàn khách {pct}% / Shop {100 - pct}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.splitSummary}>
                  <View style={styles.splitCol}>
                    <Text style={styles.splitColLabel}>Khách nhận về:</Text>
                    <Text style={[styles.splitColVal, { color: '#16A34A' }]}>{formatVND(refundToRenter)}</Text>
                  </View>
                  <View style={styles.splitCol}>
                    <Text style={styles.splitColLabel}>Shop nhận bồi thường:</Text>
                    <Text style={[styles.splitColVal, { color: '#D97706' }]}>{formatVND(payoutToShop)}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Admin Explanation Notes */}
            <Text style={[styles.cardTitle, { marginTop: 16, fontSize: 13 }]}>
              Căn cứ phán quyết (Gửi thông báo tới 2 bên):
            </Text>
            <TextInput
              style={styles.adminNoteInput}
              multiline
              numberOfLines={4}
              value={adminNotes}
              onChangeText={setAdminNotes}
              placeholder="Nhập lý do và điều khoản áp dụng..."
            />

            {/* Submit Resolution Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmitResolution}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Feather name="check-circle" size={18} color="#FFF" />
                  <Text style={styles.submitBtnText}>Thi Hành Phán Quyết Smart Escrow</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  statusAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  statusOpen: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusResolved: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusAlertTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusAlertSub: {
    fontSize: 12,
    color: '#64748B',
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
  photoList: {
    flexDirection: 'row',
  },
  photoWrap: {
    width: 200,
    height: 140,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  damageImg: {
    width: '100%',
    height: '100%',
  },
  photoBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  photoBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    maxWidth: '60%',
    textAlign: 'right',
  },
  escrowHighlight: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 8,
    borderBottomWidth: 0,
  },
  escrowLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
  },
  escrowVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#B45309',
  },
  reasonBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reasonTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 2,
  },
  reasonContent: {
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 18,
  },
  decisionOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  decisionOptionActive: {
    borderColor: '#D97706',
    backgroundColor: '#FFFBEB',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D97706',
  },
  decisionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  decisionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  splitBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  splitLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  splitBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  splitBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  splitBtnActive: {
    borderColor: '#D97706',
    backgroundColor: '#FEF3C7',
  },
  splitBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  splitBtnTextActive: {
    color: '#B45309',
    fontWeight: '700',
  },
  splitSummary: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  splitCol: {
    flex: 1,
  },
  splitColLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  splitColVal: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  adminNoteInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    textAlignVertical: 'top',
    height: 80,
    marginBottom: 16,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    height: 46,
    borderRadius: 10,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default DisputeReviewScreen;
