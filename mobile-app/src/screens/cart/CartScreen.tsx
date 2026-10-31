import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';
import { useAuth } from '../../hooks/useAuth';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { formatCurrency } from '../../utils/formatCurrency';

export const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const {
    cart,
    cartCount,
    removeFromCart,
    clearCart,
  } = useCartWishlist();

  const isGuest = !user;

  const rentItems = cart.filter((item) => item.mode === 'rent');
  const thriftItems = cart.filter((item) => item.mode !== 'rent');

  // Calculate totals
  const rentTotal = rentItems.reduce((acc, item) => acc + (item.price || 0), 0);
  const rentDepositTotal = rentItems.reduce((acc, item) => {
    const dep = typeof item.deposit === 'number'
      ? item.deposit
      : parseInt(String(item.deposit || '0').replace(/\D/g, ''), 10) || 0;
    return acc + dep;
  }, 0);
  const thriftTotal = thriftItems.reduce((acc, item) => acc + (item.price || 0), 0);
  const grandTotal = rentTotal + rentDepositTotal + thriftTotal;

  return (
    <View style={styles.container}>
      <AppHeader title="Giỏ Hàng Tuần Hoàn" showBack />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Guest Warning */}
        {isGuest && (
          <View style={styles.guestAlert}>
            <Feather name="alert-circle" size={16} color="#BA1A1A" />
            <View style={styles.guestAlertTextWrap}>
              <Text style={styles.guestAlertTitle}>Chế độ Khách vãng lai</Text>
              <Text style={styles.guestAlertDesc}>
                Bạn cần đăng nhập tài khoản để xác nhận thanh toán đơn thuê và đơn mua thanh lý.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.guestLoginBtn}
              onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
            >
              <Text style={styles.guestLoginBtnText}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        )}

        {cartCount === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="shopping-bag" size={48} color="#A8A29E" />
            <Text style={styles.emptyTitle}>Giỏ hàng của bạn đang trống</Text>
            <Text style={styles.emptySubtitle}>
              Khám phá ngay hàng trăm thiết bị và trang phục tuyển chọn sẵn sàng phục vụ bạn.
            </Text>
            <TouchableOpacity
              style={styles.shopNowBtn}
              onPress={() => navigation.navigate('Main', { screen: 'RentTab' })}
            >
              <Text style={styles.shopNowBtnText}>KHÁM PHÁ ĐỒ THUÊ (RENT)</Text>
              <Feather name="arrow-right" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* RENT Items Section */}
            {rentItems.length > 0 && (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="flash" size={16} color="#3F4A3A" />
                  <Text style={styles.sectionTitle}>Đơn Thuê Ngắn Hạn (RENT)</Text>
                  <View style={styles.countTag}>
                    <Text style={styles.countTagText}>{rentItems.length}</Text>
                  </View>
                </View>

                {rentItems.map((item) => (
                  <View key={item.id} style={styles.cartItem}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.itemImg} resizeMode="cover" />
                    ) : (
                      <View style={styles.itemImgFallback}>
                        <Feather name="image" size={24} color="#A8A29E" />
                      </View>
                    )}
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.title || 'Sản phẩm thuê'}
                      </Text>
                      <Text style={styles.itemPrice}>
                        Giá thuê: {formatCurrency(item.price || 0)}
                      </Text>
                      {item.deposit ? (
                        <Text style={styles.itemDeposit}>
                          Cọc Escrow: {typeof item.deposit === 'number' ? formatCurrency(item.deposit) : item.deposit}
                        </Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removeFromCart(item.id)}
                    >
                      <Feather name="trash-2" size={16} color="#BA1A1A" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* THRIFT Items Section */}
            {thriftItems.length > 0 && (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionTitleRow}>
                  <Feather name="shopping-bag" size={16} color="#141310" />
                  <Text style={styles.sectionTitle}>Đơn Mua Dứt Điểm (THRIFT)</Text>
                  <View style={styles.countTag}>
                    <Text style={styles.countTagText}>{thriftItems.length}</Text>
                  </View>
                </View>

                {thriftItems.map((item) => (
                  <View key={item.id} style={styles.cartItem}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.itemImg} resizeMode="cover" />
                    ) : (
                      <View style={styles.itemImgFallback}>
                        <Feather name="image" size={24} color="#A8A29E" />
                      </View>
                    )}
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.title || 'Sản phẩm thanh lý'}
                      </Text>
                      <Text style={styles.itemPrice}>
                        Giá bán: {formatCurrency(item.price || 0)}
                      </Text>
                      <Text style={styles.thriftBadgeNote}>Bảo hành 72h đổi trả</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removeFromCart(item.id)}
                    >
                      <Feather name="trash-2" size={16} color="#BA1A1A" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Order Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Tổng Kết Đơn Hàng</Text>

              {rentTotal > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tổng phí thuê (RENT):</Text>
                  <Text style={styles.summaryVal}>{formatCurrency(rentTotal)}</Text>
                </View>
              )}

              {rentDepositTotal > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tiền cọc bảo chứng (Hoàn 100%):</Text>
                  <Text style={styles.summaryVal}>{formatCurrency(rentDepositTotal)}</Text>
                </View>
              )}

              {thriftTotal > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tổng tiền mua (THRIFT):</Text>
                  <Text style={styles.summaryVal}>{formatCurrency(thriftTotal)}</Text>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.summaryRowGrand}>
                <Text style={styles.grandLabel}>TỔNG CỘNG:</Text>
                <Text style={styles.grandVal}>{formatCurrency(grandTotal)}</Text>
              </View>

              {/* Checkout Button */}
              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() => {
                  if (isGuest) {
                    navigation.navigate('Auth', { screen: 'Login' });
                  } else {
                    alert('Chuyển sang bước chọn địa chỉ giao nhận và thanh toán VNPay!');
                  }
                }}
                activeOpacity={0.88}
              >
                <Text style={styles.checkoutBtnText}>
                  {isGuest ? 'ĐĂNG NHẬP ĐỂ THANH TOÁN' : 'TIẾN HÀNH ĐẶT HÀNG →'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF9F2',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  guestAlert: {
    flexDirection: 'row',
    backgroundColor: '#FFDAD6',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  guestAlertTextWrap: {
    flex: 1,
  },
  guestAlertTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#93000A',
  },
  guestAlertDesc: {
    fontSize: 11,
    color: '#93000A',
    marginTop: 1,
  },
  guestLoginBtn: {
    backgroundColor: '#141310',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  guestLoginBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEAE1',
    marginTop: 20,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C18',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#76726B',
    textAlign: 'center',
    lineHeight: 17,
  },
  shopNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#141310',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  shopNowBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionWrap: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C18',
  },
  countTag: {
    backgroundColor: '#EFECE6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  countTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4A463F',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFEAE1',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  itemImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#EBE8E1',
  },
  itemImgFallback: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#EBE8E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C18',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#141310',
  },
  itemDeposit: {
    fontSize: 11,
    color: '#576151',
    marginTop: 1,
  },
  thriftBadgeNote: {
    fontSize: 10,
    color: '#3F4A3A',
    backgroundColor: '#D8E3CE',
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 2,
  },
  removeBtn: {
    padding: 8,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEAE1',
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C18',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#76726B',
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C18',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0ECE4',
    marginVertical: 10,
  },
  summaryRowGrand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  grandLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1C18',
  },
  grandVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#141310',
  },
  checkoutBtn: {
    backgroundColor: '#141310',
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});

export default CartScreen;
