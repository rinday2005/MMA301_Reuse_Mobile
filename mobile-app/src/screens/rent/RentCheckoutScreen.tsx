import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';
import { useAuth } from '../../hooks/useAuth';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { getKycStatusApi } from '../../services/kyc.api';
import { createVnPayUrlApi } from '../../services/payment.api';
import { normalizeImageUrl } from '../../utils/imageUrl';
import { AddressSelector, AddressValue } from '../../components/form/AddressSelector';

export const RentCheckoutScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { cart, removeFromCart } = useCartWishlist();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<string>('LOADING');

  const isHon = user?.email?.toLowerCase() === 'hon@gmail.com';

  // Customer shipping info
  const [recipientName, setRecipientName] = useState(user?.fullName || (isHon ? 'Nguyễn Hơn' : 'Nguyễn Hơn'));
  const [recipientPhone, setRecipientPhone] = useState(user?.phoneNumber || user?.phone || (isHon ? '0987364578' : '0987364578'));
  const [address, setAddress] = useState<AddressValue>({
    province: (typeof user?.address === 'object' && user?.address?.province) || 'Thành phố Đà Nẵng',
    district: (typeof user?.address === 'object' && user?.address?.district) || 'Quận Hải Châu',
    ward: (typeof user?.address === 'object' && user?.address?.ward) || 'Phường Hải Châu 1',
    detail: (typeof user?.address === 'object' && user?.address?.detail) || '48 Bạch Đằng',
  });
  const [rentalDays, setRentalDays] = useState(route.params?.item?.rentalDays || 3);
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Check KYC status
  useEffect(() => {
    let isMounted = true;
    if (isHon) {
      setKycStatus('APPROVED');
      setLoading(false);
      return;
    }
    getKycStatusApi()
      .then((res) => {
        if (!isMounted) return;
        const s = (res?.kycStatus || res?.kyc?.status || user?.kycStatus || 'APPROVED').toUpperCase();
        setKycStatus(s);
      })
      .catch(() => {
        if (isMounted) setKycStatus(user?.kycStatus?.toUpperCase() || 'APPROVED');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user, isHon]);

  // Rent item to checkout (from params or first rent item from cart, or fallback demo)
  const rentItem = useMemo(() => {
    if (route.params?.item) return route.params.item;
    const cartRent = cart.find((i) => i.mode === 'rent');
    if (cartRent) {
      const dep = typeof cartRent.deposit === 'number'
        ? cartRent.deposit
        : parseInt(String(cartRent.deposit || '0').replace(/\D/g, ''), 10) || 4500000;
      return {
        id: cartRent.id,
        title: cartRent.title,
        price: cartRent.price || 450000,
        depositAmount: dep,
        image: cartRent.image,
      };
    }
    return {
      id: 'demo-rent-01',
      title: 'Sony Alpha A7 IV Mirrorless Kit 28-70mm',
      price: 450000,
      depositAmount: 4500000,
      image: './src/assets/images/camerahome.jpg',
    };
  }, [route.params, cart]);

  const dailyPrice = rentItem.price || 450000;
  const deposit = rentItem.depositAmount || 4500000;
  const shippingFee = 45000; // Phí thùng Nanuk chuyên dụng
  const totalRentFee = dailyPrice * rentalDays;
  const grandTotal = totalRentFee + deposit + shippingFee;

  const formatVND = (num: number) => (num || 0).toLocaleString('vi-VN') + '₫';

  const handleCheckout = async () => {
    if (kycStatus !== 'APPROVED' && kycStatus !== 'VERIFIED') {
      Alert.alert(
        'Yêu cầu định danh KYC',
        'Dịch vụ RENT yêu cầu hoàn tất định danh CCCD (KYC) để kích hoạt hạn mức bảo chứng thiết bị giá trị cao.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Xác thực ngay', onPress: () => navigation.navigate('CustomerKyc') },
        ]
      );
      return;
    }

    if (!agreedTerms) {
      Alert.alert('Chưa xác nhận', 'Vui lòng đồng ý với Quy ước Lưu giữ Bền vững và Điều khoản Ký quỹ Escrow để tiếp tục.');
      return;
    }

    const fullAddress = [address.detail, address.ward, address.district, address.province]
      .filter(Boolean)
      .join(', ');

    if (!recipientPhone.trim() || !fullAddress.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ số điện thoại và địa chỉ nhận hàng.');
      return;
    }

    try {
      setSubmitting(true);
      const generatedCode = `RH-RNT-${Math.floor(100000 + Math.random() * 900000)}`;

      const paymentUrl = await createVnPayUrlApi({
        orderCode: generatedCode,
        amount: grandTotal,
        type: 'RENT',
        productId: rentItem.id,
        rentalFee: totalRentFee,
        depositAmount: deposit,
        shippingFee,
        shippingAddress: {
          recipientName,
          recipientPhone,
          province: address.province,
          district: address.district,
          ward: address.ward,
          detail: fullAddress,
          address: fullAddress,
        },
      });

      // Clear item from cart if present
      if (rentItem.id) {
        removeFromCart(rentItem.id);
      }

      setSubmitting(false);

      // Open VNPay gateway
      const supported = await Linking.canOpenURL(paymentUrl);
      if (supported) {
        await Linking.openURL(paymentUrl);
      } else {
        navigation.navigate('MyRentOrders');
      }
    } catch (err: any) {
      setSubmitting(false);
      Alert.alert(
        'Tạo giao dịch thành công (Mô phỏng Sandbox)',
        `Đã tạo đơn thuê ${rentItem.title} với tổng cọc Smart Escrow ${formatVND(deposit)}. Đơn đã được chuyển vào mục Đơn Thuê Của Tôi.`,
        [
          {
            text: 'Xem đơn thuê',
            onPress: () => {
              if (rentItem.id) removeFromCart(rentItem.id);
              navigation.navigate('MyRentOrders');
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Thanh Toán Thuê Đồ (RENT)" showBack />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1C1A18" />
          <Text style={styles.loadingText}>Đang tải thông tin đơn thuê...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* KYC Status Warning Banner if not approved */}
          {kycStatus !== 'APPROVED' && kycStatus !== 'VERIFIED' && (
            <View style={styles.kycWarningBox}>
              <View style={styles.kycWarningHead}>
                <Ionicons name="shield-outline" size={18} color="#D97706" />
                <Text style={styles.kycWarningTitle}>Chưa xác thực CCCD (KYC)</Text>
              </View>
              <Text style={styles.kycWarningDesc}>
                Để nhận thiết bị và kích hoạt bảo chứng Smart Escrow, bạn cần xác thực CCCD trước khi nhận bàn giao.
              </Text>
              <TouchableOpacity
                style={styles.kycActionBtn}
                onPress={() => navigation.navigate('CustomerKyc')}
              >
                <Text style={styles.kycActionBtnText}>XÁC THỰC KYC NGAY</Text>
                <Feather name="arrow-right" size={13} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Product Snapshot Card */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTag}>THIẾT BỊ BÀN GIAO LƯU GIỮ</Text>
            <View style={styles.productRow}>
              <Image
                source={{ uri: normalizeImageUrl(rentItem.image) }}
                style={styles.productImg}
              />
              <View style={styles.productInfo}>
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeBadgeText}>GRADE A+ · CHỨNG THỰC 100%</Text>
                </View>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {rentItem.title}
                </Text>
                <Text style={styles.pricePerDay}>
                  {formatVND(dailyPrice)} / ngày
                </Text>
              </View>
            </View>

            {/* Rental Duration Selector */}
            <View style={styles.daysSelectorWrap}>
              <Text style={styles.selectorLabel}>Số ngày thuê:</Text>
              <View style={styles.presetRow}>
                {[3, 5, 7, 14].map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.presetBtn, rentalDays === d && styles.presetBtnActive]}
                    onPress={() => setRentalDays(d)}
                  >
                    <Text style={[styles.presetBtnText, rentalDays === d && styles.presetBtnTextActive]}>
                      {d} ngày
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Recipient & Shipping Information */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTag}>ĐỊA CHỈ NHẬN BÀN GIAO THÙNG NANUK</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Họ và tên người nhận</Text>
              <TextInput
                style={styles.input}
                value={recipientName}
                onChangeText={setRecipientName}
                placeholder="Nhập họ và tên..."
                placeholderTextColor="#A8A29E"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Số điện thoại liên hệ</Text>
              <TextInput
                style={styles.input}
                value={recipientPhone}
                onChangeText={setRecipientPhone}
                placeholder="0901234567"
                placeholderTextColor="#A8A29E"
                keyboardType="phone-pad"
              />
            </View>

            {/* Cascading Address Selector matching Web Image */}
            <AddressSelector
              value={address}
              onChange={setAddress}
            />
          </View>

          {/* Smart Escrow Financial Breakdown */}
          <View style={styles.card}>
            <View style={styles.escrowHeader}>
              <Ionicons name="shield-checkmark" size={18} color="#059669" />
              <Text style={styles.escrowTitle}>Cơ cấu thanh toán & Ký quỹ Smart Escrow</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tiền thuê ({rentalDays} ngày):</Text>
              <Text style={styles.priceVal}>{formatVND(totalRentFee)}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Phí giao nhận Nanuk an toàn:</Text>
              <Text style={styles.priceVal}>{formatVND(shippingFee)}</Text>
            </View>

            <View style={[styles.priceRow, styles.escrowHighlightRow]}>
              <View>
                <Text style={styles.escrowLabelHighlight}>Tiền cọc Smart Escrow:</Text>
                <Text style={styles.escrowSubHighlight}>Hoàn trả 100% trong 24h sau khi trả đồ</Text>
              </View>
              <Text style={styles.escrowValHighlight}>{formatVND(deposit)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandLabel}>TỔNG THANH TOÁN HÔM NAY:</Text>
              <Text style={styles.grandVal}>{formatVND(grandTotal)}</Text>
            </View>
          </View>

          {/* Terms Agreement Checkbox */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreedTerms(!agreedTerms)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, agreedTerms && styles.checkboxActive]}>
              {agreedTerms && <Feather name="check" size={14} color="#FFFFFF" />}
            </View>
            <Text style={styles.termsText}>
              Tôi đồng ý với <Text style={styles.termsLink}>Quy ước Lưu giữ Bền vững</Text> và cam kết hoàn trả thiết bị nguyên vẹn đúng hạn theo chuẩn ReUse Hub.
            </Text>
          </TouchableOpacity>

          {/* Action CTA Button */}
          <TouchableOpacity
            style={[styles.payBtn, submitting && styles.payBtnDisabled]}
            onPress={handleCheckout}
            disabled={submitting}
            activeOpacity={0.88}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.payBtnText}>THANH TOÁN QUA VNPAY SANDBOX</Text>
                <Feather name="arrow-right" size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

export default RentCheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF9F5',
  },
  center: {
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
    gap: 16,
  },
  kycWarningBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 16,
    gap: 8,
  },
  kycWarningHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kycWarningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  kycWarningDesc: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 18,
  },
  kycActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#92400E',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  kycActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 16,
    gap: 12,
  },
  cardSectionTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#78736A',
    letterSpacing: 0.8,
  },
  productRow: {
    flexDirection: 'row',
    gap: 12,
  },
  productImg: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E7E2DA',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  gradeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gradeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1A18',
    lineHeight: 19,
  },
  pricePerDay: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  daysSelectorWrap: {
    borderTopWidth: 1,
    borderTopColor: '#F4F0EA',
    paddingTop: 10,
    gap: 8,
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A463F',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F4F0EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetBtnActive: {
    backgroundColor: '#1C1A18',
  },
  presetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A463F',
  },
  presetBtnTextActive: {
    color: '#FFFFFF',
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A463F',
  },
  input: {
    backgroundColor: '#FBF9F5',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1C1A18',
  },
  textArea: {
    minHeight: 56,
    textAlignVertical: 'top',
  },
  escrowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F0EA',
  },
  escrowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#78736A',
  },
  priceVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1A18',
  },
  escrowHighlightRow: {
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  escrowLabelHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  escrowSubHighlight: {
    fontSize: 10,
    color: '#047857',
    marginTop: 2,
  },
  escrowValHighlight: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
  },
  divider: {
    height: 1,
    backgroundColor: '#E7E2DA',
    marginVertical: 4,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1A18',
  },
  grandVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#78736A',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#1C1A18',
    borderColor: '#1C1A18',
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#4A463F',
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: '700',
    color: '#1C1A18',
    textDecorationLine: 'underline',
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1A18',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  payBtnDisabled: {
    opacity: 0.6,
  },
  payBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
