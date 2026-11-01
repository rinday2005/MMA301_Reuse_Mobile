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
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';
import { getRentalOrderByIdApi, RentalOrderApi } from '../../services/order.api';
import { normalizeImageUrl } from '../../utils/imageUrl';

export const ReturnRequestScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const orderId = route.params?.id || '';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<RentalOrderApi | null>(null);
  const [returnMethod, setReturnMethod] = useState<'SHIPPER' | 'HUB'>('SHIPPER');
  const [isSuccess, setIsSuccess] = useState(false);

  const formatVND = (num: number) => {
    return (num || 0).toLocaleString('vi-VN') + '₫';
  };

  const loadOrderDetail = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    try {
      const res = await getRentalOrderByIdApi(orderId);
      if (res) {
        setOrder(res);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrderDetail();
  }, [loadOrderDetail]);

  const item = order?.items?.[0] as any;
  const itemTitle = item?.productName || item?.title || 'Thiết bị thuê ReUse';
  const itemImg = normalizeImageUrl(item?.imageUrl || item?.image || './src/assets/images/camerahome.jpg');
  const orderCode = order?.orderCode || `#${orderId.slice(-6)}`;
  const deposit = order?.depositAmount || Number(item?.depositAmount) || 0;

  const handleSubmitReturn = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <View style={styles.safeArea}>
      <AppHeader title="Trả Thiết Bị & Hoàn Cọc" showBack />

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#1C1A18" />
          <Text style={styles.loadingText}>Đang tải thông tin hoàn cọc...</Text>
        </View>
      ) : isSuccess ? (
        <View style={styles.successCenter}>
          <View style={styles.successIconBox}>
            <Ionicons name="checkmark-circle" size={48} color="#059669" />
          </View>
          <Text style={styles.successTitle}>Yêu Cầu Đã Được Tiếp Nhận!</Text>
          <Text style={styles.successDesc}>
            {returnMethod === 'SHIPPER'
              ? 'Đơn vị vận chuyển chuyên dụng sẽ liên hệ lấy hàng trong vòng 2–4 giờ. Vui lòng đóng nắp thùng Nanuk và dán tem niêm phong đi kèm.'
              : 'Vui lòng mang thiết bị tới Hub ReUse TP.HCM (Thảo Điền, TP. Thủ Đức) hoặc Hub Hà Nội (Tràng Tiền, Q. Hoàn Kiếm) trong giờ hành chính.'}
          </Text>
          <Text style={styles.successEscrowNote}>
            Tiền cọc <Text style={styles.boldDark}>{formatVND(deposit)}</Text> sẽ được hệ thống Smart Escrow tự động hoàn trả 100% về tài khoản sau khi Shop Owner hoàn tất nghiệm thu 14 bước.
          </Text>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.navigate('MyRentOrders')}
          >
            <Text style={styles.doneBtnText}>Về danh sách đơn thuê</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Order Snapshot */}
          <View style={styles.snapshotCard}>
            <Image source={{ uri: itemImg }} style={styles.snapshotThumb} />
            <View style={styles.snapshotInfo}>
              <Text style={styles.snapshotCode}>{orderCode}</Text>
              <Text style={styles.snapshotTitle} numberOfLines={2}>
                {itemTitle}
              </Text>
              <Text style={styles.snapshotDeposit}>
                Tiền cọc Smart Escrow: <Text style={styles.depositHighlight}>{formatVND(deposit)}</Text>
              </Text>
            </View>
          </View>

          {/* Return Method Choice */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionPre}>PHƯƠNG THỨC BÀN GIAO TRẢ HÀNG</Text>
            <Text style={styles.sectionTitle}>Chọn hình thức hoàn trả</Text>

            <TouchableOpacity
              style={[styles.methodOption, returnMethod === 'SHIPPER' && styles.methodOptionActive]}
              onPress={() => setReturnMethod('SHIPPER')}
            >
              <View style={styles.radioOuter}>
                {returnMethod === 'SHIPPER' && <View style={styles.radioInner} />}
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Shipper lấy hàng tận nơi (Khuyên dùng)</Text>
                <Text style={styles.methodDesc}>
                  Shipper công nghệ có bảo hiểm sẽ tới lấy hàng tận nơi theo địa chỉ bạn đã nhận đồ.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.methodOption, returnMethod === 'HUB' && styles.methodOptionActive]}
              onPress={() => setReturnMethod('HUB')}
            >
              <View style={styles.radioOuter}>
                {returnMethod === 'HUB' && <View style={styles.radioInner} />}
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Trả hàng trực tiếp tại Trạm Hub ReUse</Text>
                <Text style={styles.methodDesc}>
                  Bàn giao tại Hub A-12 Thảo Điền (TP.HCM) hoặc Hub 24 Tràng Tiền (Hà Nội) để kiểm định lấy cọc ngay.
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Audit Bench & Escrow Process */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionPre}>QUY CHUẨN KIỂM ĐỊNH AUDIT BENCH</Text>
            <Text style={styles.sectionTitle}>Quy trình đối soát &amp; Hoàn cọc 100%</Text>

            <View style={styles.stepsList}>
              {[
                { num: '01', title: 'Đóng gói thùng niêm phong', desc: 'Đặt đủ thân máy, ống kính và phụ kiện theo biên bản bàn giao ban đầu.' },
                { num: '02', title: 'Kiểm tra kỹ thuật 14 bước', desc: 'Shop Owner kiểm tra cảm biến, cơ học quang học và vệ sinh buồng UV-C.' },
                { num: '03', title: 'Giải phóng tiền cọc tự động', desc: 'Smart Escrow tự động hoàn trả 100% tiền cọc về tài khoản của bạn.' },
              ].map((s) => (
                <View key={s.num} style={styles.stepRow}>
                  <View style={styles.stepNumBox}>
                    <Text style={styles.stepNumText}>{s.num}</Text>
                  </View>
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepTitle}>{s.title}</Text>
                    <Text style={styles.stepDesc}>{s.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Submit Return */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmitReturn}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>XÁC NHẬN YÊU CẦU HOÀN TRẢ ĐỒ</Text>
                <Feather name="arrow-right" size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

export default ReturnRequestScreen;

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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 14,
  },
  snapshotCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 14,
    gap: 12,
  },
  snapshotThumb: {
    width: 68,
    height: 68,
    borderRadius: 8,
    backgroundColor: '#F4F0EA',
  },
  snapshotInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  snapshotCode: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#78736A',
    marginBottom: 2,
  },
  snapshotTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
    lineHeight: 17,
  },
  snapshotDeposit: {
    fontSize: 11,
    color: '#78736A',
    marginTop: 4,
  },
  depositHighlight: {
    fontWeight: '800',
    color: '#059669',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 16,
    gap: 10,
  },
  sectionPre: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#78736A',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1A18',
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FBF9F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 12,
    gap: 10,
  },
  methodOptionActive: {
    borderColor: '#1C1A18',
    backgroundColor: '#FFFFFF',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#1C1A18',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1C1A18',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
  },
  methodDesc: {
    fontSize: 10,
    color: '#78736A',
    marginTop: 2,
    lineHeight: 14,
  },
  stepsList: {
    gap: 10,
    marginTop: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepNumBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F4F0EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1C1A18',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
  },
  stepDesc: {
    fontSize: 10,
    color: '#78736A',
    marginTop: 1,
    lineHeight: 14,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1A18',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  successCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  successIconBox: {
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1A18',
  },
  successDesc: {
    fontSize: 12,
    color: '#5E5A53',
    textAlign: 'center',
    lineHeight: 18,
  },
  successEscrowNote: {
    fontSize: 11,
    color: '#78736A',
    textAlign: 'center',
    backgroundColor: '#F4F0EA',
    padding: 12,
    borderRadius: 12,
    lineHeight: 16,
  },
  boldDark: {
    fontWeight: '700',
    color: '#1C1A18',
  },
  doneBtn: {
    backgroundColor: '#1C1A18',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  doneBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
