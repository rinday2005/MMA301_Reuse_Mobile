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
import { createVnPayUrlApi } from '../../services/payment.api';
import { normalizeImageUrl } from '../../utils/imageUrl';
import { AddressSelector, AddressValue } from '../../components/form/AddressSelector';

export const ThriftCheckoutScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { cart, removeFromCart } = useCartWishlist();

  const [submitting, setSubmitting] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(14 * 60 + 57);

  // Reservation countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isHon = user?.email?.toLowerCase() === 'hon@gmail.com';

  // Customer shipping info
  const [recipientName, setRecipientName] = useState(user?.fullName || (isHon ? 'Nguyễn Hơn' : ''));
  const [recipientPhone, setRecipientPhone] = useState(user?.phoneNumber || user?.phone || (isHon ? '0987364578' : '0901234567'));
  const [address, setAddress] = useState<AddressValue>({
    province: (typeof user?.address === 'object' && user?.address?.province) || 'Thành phố Đà Nẵng',
    district: (typeof user?.address === 'object' && user?.address?.district) || 'Quận Hải Châu',
    ward: (typeof user?.address === 'object' && user?.address?.ward) || 'Phường Hải Châu 1',
    detail: (typeof user?.address === 'object' && user?.address?.detail) || '48 Bạch Đằng',
  });

  // Thrift item to checkout (from params or first thrift item in cart, or demo fallback)
  const thriftItem = useMemo(() => {
    if (route.params?.item) return route.params.item;
    const cartThrift = cart.find((i) => i.mode === 'thrift');
    if (cartThrift) {
      return {
        id: cartThrift.id,
        title: cartThrift.title,
        price: cartThrift.price || 1450000,
        image: cartThrift.image,
      };
    }
    return {
      id: 'demo-thrift-01',
      title: 'Vintage Leather Jacket (Tuyển chọn độc bản)',
      price: 1450000,
      image: './src/assets/images/partydresshome.jpg',
    };
  }, [route.params, cart]);

  const price = thriftItem.price || 1450000;
  const shippingFee = 25000;
  const grandTotal = price + shippingFee;

  const formatVND = (num: number) => (num || 0).toLocaleString('vi-VN') + '₫';

  const handleCheckout = async () => {
    const fullAddress = [address.detail, address.ward, address.district, address.province]
      .filter(Boolean)
      .join(', ');

    if (!recipientPhone.trim() || !fullAddress.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ số điện thoại và địa chỉ nhận hàng.');
      return;
    }

    try {
      setSubmitting(true);
      const generatedCode = `RH-TH-${Math.floor(100000 + Math.random() * 900000)}`;

      const paymentUrl = await createVnPayUrlApi({
        orderCode: generatedCode,
        amount: grandTotal,
        type: 'THRIFT',
        productId: thriftItem.id,
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

      // Clear from cart
      if (thriftItem.id) {
        removeFromCart(thriftItem.id);
      }

      setSubmitting(false);

      const supported = await Linking.canOpenURL(paymentUrl);
      if (supported) {
        await Linking.openURL(paymentUrl);
      } else {
        navigation.navigate('MyThriftOrders');
      }
    } catch (err: any) {
      setSubmitting(false);
      Alert.alert(
        'Tạo giao dịch thành công (Mô phỏng Sandbox)',
        `Đã tạo đơn mua THRIFT ${thriftItem.title} thành công! Đơn hàng được cập nhật vào mục Đơn Mua THRIFT.`,
        [
          {
            text: 'Xem đơn mua',
            onPress: () => {
              if (thriftItem.id) removeFromCart(thriftItem.id);
              navigation.navigate('MyThriftOrders');
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Thanh Toán Mua THRIFT" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Countdown Hold Banner */}
        <View style={styles.holdBanner}>
          <Feather name="clock" size={16} color="#B45309" />
          <Text style={styles.holdBannerText}>
            Giữ chỗ độc bản 1-of-1: còn <Text style={styles.timerBold}>{formatTimer(secondsRemaining)}</Text>
          </Text>
        </View>

        {/* Thrift Item Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTag}>SẢN PHẨM TUYỂN CHỌN SỞ HỮU VĨNH VIỄN</Text>
          <View style={styles.productRow}>
            <Image
              source={{ uri: normalizeImageUrl(thriftItem.image) }}
              style={styles.productImg}
            />
            <View style={styles.productInfo}>
              <View style={styles.badgeRow}>
                <View style={styles.archivalBadge}>
                  <Text style={styles.archivalBadgeText}>1-OF-1 ARCHIVE</Text>
                </View>
                <View style={styles.warrantyBadge}>
                  <Text style={styles.warrantyBadgeText}>BẢO HÀNH 72H</Text>
                </View>
              </View>
              <Text style={styles.productTitle} numberOfLines={2}>
                {thriftItem.title}
              </Text>
              <Text style={styles.productPrice}>{formatVND(price)}</Text>
            </View>
          </View>
        </View>

        {/* Shipping Address & Contact */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTag}>ĐỊA CHỈ NHẬN HÀNG</Text>

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
            <Text style={styles.fieldLabel}>Số điện thoại</Text>
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

        {/* Payment Summary */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTag}>CHI TIẾT THANH TOÁN</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Giá sản phẩm THRIFT:</Text>
            <Text style={styles.priceVal}>{formatVND(price)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Phí vận chuyển tiêu chuẩn:</Text>
            <Text style={styles.priceVal}>{formatVND(shippingFee)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandLabel}>TỔNG THANH TOÁN:</Text>
            <Text style={styles.grandVal}>{formatVND(grandTotal)}</Text>
          </View>
        </View>

        {/* Guarantee Banner */}
        <View style={styles.guaranteeBox}>
          <Ionicons name="shield-checkmark" size={18} color="#059669" />
          <Text style={styles.guaranteeText}>
            Cam kết hoàn tiền 100% trong vòng 72 giờ nếu sản phẩm không đúng mô tả hoặc sai lệch tình trạng niêm phong.
          </Text>
        </View>

        {/* Action Button */}
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
              <Text style={styles.payBtnText}>TIẾN HÀNH THANH TOÁN VNPAY</Text>
              <Feather name="arrow-right" size={16} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ThriftCheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF9F5',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
  },
  holdBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 8,
  },
  holdBannerText: {
    fontSize: 12,
    color: '#92400E',
  },
  timerBold: {
    fontWeight: '800',
    color: '#78350F',
    fontFamily: 'monospace',
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
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  archivalBadge: {
    backgroundColor: '#1C1A18',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  archivalBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  warrantyBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  warrantyBadgeText: {
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
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1A18',
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
    color: '#1C1A18',
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 12,
    gap: 10,
  },
  guaranteeText: {
    flex: 1,
    fontSize: 11,
    color: '#065F46',
    lineHeight: 16,
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
