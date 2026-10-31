import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';
import { useAuth } from '../../hooks/useAuth';
import { useCartWishlist } from '../../context/CartWishlistContext';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, token, logout, isLoading } = useAuth();
  const { cartCount, wishlistCount } = useCartWishlist();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#141310" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Hồ Sơ &amp; Tài Khoản" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!token || !user ? (
          /* ================= GUEST PROFILE ================= */
          <View>
            {/* Guest Profile Card */}
            <View style={styles.guestCard}>
              <View style={styles.guestAvatarCircle}>
                <Feather name="user" size={32} color="#576151" />
              </View>
              <Text style={styles.guestTitle}>Khách Vãng Lai</Text>
              <Text style={styles.guestSub}>
                Bạn đang duyệt app ở chế độ xem. Đăng nhập hoặc tạo tài khoản để trải nghiệm dịch vụ
                thuê đồ và mua thanh lý tuần hoàn.
              </Text>

              {/* Action Buttons */}
              <TouchableOpacity
                style={styles.primaryAuthBtn}
                onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryAuthBtnText}>ĐĂNG NHẬP TÀI KHOẢN</Text>
                <Feather name="arrow-right" size={15} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryAuthBtn}
                onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryAuthBtnText}>Tạo tài khoản mới</Text>
              </TouchableOpacity>
            </View>

            {/* Guest Info Links */}
            <View style={styles.menuCard}>
              <Text style={styles.menuSectionTitle}>Tìm hiểu thêm về ReUse Hub</Text>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigation.navigate('HowItWorks')}
              >
                <View style={styles.menuRowLeft}>
                  <Feather name="repeat" size={17} color="#4A463F" />
                  <Text style={styles.menuRowText}>Quy trình thuê &amp; mua hoạt động ra sao?</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#A8A29E" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigation.navigate('About')}
              >
                <View style={styles.menuRowLeft}>
                  <Feather name="info" size={17} color="#4A463F" />
                  <Text style={styles.menuRowText}>Về nền tảng thời trang tuần hoàn ReUse Hub</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#A8A29E" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigation.navigate('FAQ')}
              >
                <View style={styles.menuRowLeft}>
                  <Feather name="help-circle" size={17} color="#4A463F" />
                  <Text style={styles.menuRowText}>Chính sách tiền cọc &amp; hoàn tiền Escrow</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#A8A29E" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ================= LOGGED IN USER PROFILE ================= */
          <View>
            {/* User Identity Card */}
            <View style={styles.userCard}>
              <View style={styles.userTopRow}>
                {user.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={styles.avatarLarge} />
                ) : (
                  <View style={styles.avatarLargeFallback}>
                    <Text style={styles.avatarLargeText}>
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                )}
                <View style={styles.userInfoWrap}>
                  <Text style={styles.userName}>{user.fullName || 'Thành viên ReUse Hub'}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>
                      {user.role === 'ADMIN'
                        ? 'QUẢN TRỊ VIÊN'
                        : user.role === 'SHOP_OWNER'
                        ? 'CHỦ CỬA HÀNG'
                        : 'THÀNH VIÊN TẦNG 1'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Switch Role Portals */}
              {user.role === 'SHOP_OWNER' && (
                <TouchableOpacity
                  style={styles.shopPortalBtn}
                  onPress={() => navigation.navigate('Shop')}
                >
                  <Feather name="briefcase" size={15} color="#FFFFFF" />
                  <Text style={styles.shopPortalBtnText}>VÀO KÊNH QUẢN LÝ SHOP →</Text>
                </TouchableOpacity>
              )}

              {user.role === 'ADMIN' && (
                <TouchableOpacity
                  style={styles.shopPortalBtn}
                  onPress={() => navigation.navigate('Admin')}
                >
                  <Feather name="shield" size={15} color="#FFFFFF" />
                  <Text style={styles.shopPortalBtnText}>TRANG QUẢN TRỊ HỆ THỐNG →</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Metrics */}
            <View style={styles.metricsRow}>
              <TouchableOpacity
                style={styles.metricCard}
                onPress={() => navigation.navigate('Cart')}
              >
                <Text style={styles.metricNumber}>{cartCount}</Text>
                <Text style={styles.metricLabel}>Giỏ hàng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.metricCard}
                onPress={() => navigation.navigate('Wishlist')}
              >
                <Text style={styles.metricNumber}>{wishlistCount}</Text>
                <Text style={styles.metricLabel}>Đã lưu</Text>
              </TouchableOpacity>

              <View style={styles.metricCard}>
                <Text style={styles.metricNumber}>100%</Text>
                <Text style={styles.metricLabel}>Tín nhiệm</Text>
              </View>
            </View>

            {/* Navigation Menu */}
            <View style={styles.menuCard}>
              <Text style={styles.menuSectionTitle}>Tài khoản &amp; Hoạt động</Text>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigation.navigate('Cart')}
              >
                <View style={styles.menuRowLeft}>
                  <Feather name="shopping-bag" size={17} color="#4A463F" />
                  <Text style={styles.menuRowText}>Giỏ hàng của tôi</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#A8A29E" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigation.navigate('Wishlist')}
              >
                <View style={styles.menuRowLeft}>
                  <Feather name="heart" size={17} color="#4A463F" />
                  <Text style={styles.menuRowText}>Danh sách yêu thích</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#A8A29E" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigation.navigate('HowItWorks')}
              >
                <View style={styles.menuRowLeft}>
                  <Feather name="repeat" size={17} color="#4A463F" />
                  <Text style={styles.menuRowText}>Cách hoạt động</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#A8A29E" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigation.navigate('Contact')}
              >
                <View style={styles.menuRowLeft}>
                  <Feather name="mail" size={17} color="#4A463F" />
                  <Text style={styles.menuRowText}>Hỗ trợ &amp; Trợ giúp</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#A8A29E" />
              </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
              <Feather name="log-out" size={16} color="#BA1A1A" />
              <Text style={styles.logoutBtnText}>ĐĂNG XUẤT TÀI KHOẢN</Text>
            </TouchableOpacity>
          </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF9F2',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  guestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEAE1',
  },
  guestAvatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F4F0EA',
    borderWidth: 1,
    borderColor: '#E8E4DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C18',
    marginBottom: 6,
  },
  guestSub: {
    fontSize: 12,
    color: '#76726B',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 20,
  },
  primaryAuthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#141310',
    width: '100%',
    height: 46,
    borderRadius: 10,
    marginBottom: 10,
  },
  primaryAuthBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  secondaryAuthBtn: {
    backgroundColor: '#F7F3EC',
    borderWidth: 1,
    borderColor: '#E8E4DC',
    width: '100%',
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryAuthBtnText: {
    color: '#1C1C18',
    fontSize: 12,
    fontWeight: '700',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFEAE1',
    marginBottom: 14,
  },
  userTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E8E4DC',
  },
  avatarLargeFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#141310',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLargeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  userInfoWrap: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C18',
  },
  userEmail: {
    fontSize: 12,
    color: '#76726B',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#EEF2EC',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4A6B53',
    letterSpacing: 0.5,
  },
  shopPortalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#576151',
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  shopPortalBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEAE1',
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#141310',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: '#76726B',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEAE1',
    marginBottom: 14,
  },
  menuSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#76726B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F3EC',
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuRowText: {
    fontSize: 13,
    color: '#1C1C18',
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF5F4',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    height: 44,
    borderRadius: 10,
    marginTop: 4,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BA1A1A',
    letterSpacing: 0.6,
  },
});

export default ProfileScreen;
