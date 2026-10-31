import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { useDrawer } from '../../context/DrawerContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);

export const AppSidebarDrawer: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { isDrawerOpen, closeDrawer } = useDrawer();
  const { cartCount, wishlistCount } = useCartWishlist();

  const isGuest = !user;

  const navigateTo = (screenName: string, params?: any) => {
    closeDrawer();
    setTimeout(() => {
      navigation.navigate(screenName, params);
    }, 150);
  };

  const handleLogout = async () => {
    closeDrawer();
    try {
      await logout();
      navigation.navigate('Main', { screen: 'HomeTab' });
    } catch {
      // ignore
    }
  };

  return (
    <Modal
      visible={isDrawerOpen}
      animationType="fade"
      transparent
      onRequestClose={closeDrawer}
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop (tap to close) */}
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Drawer Panel */}
        <View
          style={[
            styles.drawerPanel,
            {
              width: DRAWER_WIDTH,
              paddingTop: Math.max(insets.top, 16),
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* Header Row */}
          <View style={styles.drawerHeaderRow}>
            <View style={styles.brandRow}>
              <View style={styles.brandIconBox}>
                <Text style={styles.brandIconText}>∞</Text>
              </View>
              <Text style={styles.brandTitle}>REUSE HUB</Text>
            </View>
            <TouchableOpacity
              onPress={closeDrawer}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={20} color="#4A463F" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ── 1. ACCOUNT / IDENTITY CARD ── */}
            {isGuest ? (
              /* GUEST WELCOME CARD */
              <View style={styles.guestCard}>
                <View style={styles.guestProfileRow}>
                  <View style={styles.guestAvatar}>
                    <Feather name="user" size={20} color="#576151" />
                  </View>
                  <View style={styles.guestInfo}>
                    <Text style={styles.guestTitle}>Khách vãng lai</Text>
                    <Text style={styles.guestSubtitle}>Chế độ trải nghiệm</Text>
                    <View style={styles.guestBadge}>
                      <View style={styles.guestDot} />
                      <Text style={styles.guestBadgeText}>Chưa đăng nhập</Text>
                    </View>
                  </View>
                </View>

                {/* Quick login / register buttons */}
                <View style={styles.guestAuthButtonsRow}>
                  <TouchableOpacity
                    style={styles.guestLoginBtn}
                    onPress={() => navigateTo('Auth', { screen: 'Login' })}
                  >
                    <Text style={styles.guestLoginBtnText}>Đăng nhập</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.guestRegisterBtn}
                    onPress={() => navigateTo('Auth', { screen: 'Register' })}
                  >
                    <Text style={styles.guestRegisterBtnText}>Đăng ký</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* LOGGED IN USER CARD */
              <View style={styles.userCard}>
                <View style={styles.userProfileRow}>
                  {user?.avatarUrl ? (
                    <Image source={{ uri: user.avatarUrl }} style={styles.userAvatarImage} />
                  ) : (
                    <View style={styles.userAvatarFallback}>
                      <Text style={styles.userAvatarInitial}>
                        {(user?.fullName || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.userInfo}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {user?.fullName || 'Thành viên'}
                    </Text>
                    <Text style={styles.userEmail} numberOfLines={1}>
                      {user?.email}
                    </Text>
                    <View style={styles.userRoleBadge}>
                      <View style={styles.userRoleDot} />
                      <Text style={styles.userRoleText}>
                        {user?.role === 'ADMIN'
                          ? 'QUẢN TRỊ VIÊN'
                          : user?.role === 'SHOP_OWNER'
                          ? 'CHỦ CỬA HÀNG'
                          : 'THÀNH VIÊN TẦNG 1'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* ── 2. KHÁM PHÁ DỊCH VỤ ── */}
            <View style={styles.menuGroup}>
              <Text style={styles.menuGroupTitle}>Khám phá dịch vụ</Text>

              {/* Trang chủ */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('Main', { screen: 'HomeTab' })}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="home" size={17} color="#4A463F" />
                  <Text style={styles.menuItemText}>Trang chủ</Text>
                </View>
              </TouchableOpacity>

              {/* RENT */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('Main', { screen: 'RentTab' })}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="flash-outline" size={17} color="#4A463F" />
                  <Text style={styles.menuItemText}>Khám phá RENT</Text>
                </View>
                <View style={styles.hotBadge}>
                  <Text style={styles.hotBadgeText}>HOT</Text>
                </View>
              </TouchableOpacity>

              {/* THRIFT */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('Main', { screen: 'ThriftTab' })}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="shopping-bag" size={17} color="#4A463F" />
                  <Text style={styles.menuItemText}>Kho đồ THRIFT</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>340+</Text>
                </View>
              </TouchableOpacity>

              {/* CATEGORIES */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('Main', { screen: 'CategoriesTab' })}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="grid" size={17} color="#4A463F" />
                  <Text style={styles.menuItemText}>Categories bộ sưu tầm</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>Mục</Text>
                </View>
              </TouchableOpacity>

              {/* GIỎ HÀNG */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('Cart')}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="shopping-cart" size={17} color="#4A463F" />
                  <Text style={styles.menuItemText}>Giỏ hàng tuần hoàn</Text>
                </View>
                {cartCount > 0 && (
                  <View style={styles.badgeIndicator}>
                    <Text style={styles.badgeIndicatorText}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* YÊU THÍCH */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('Wishlist')}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="heart" size={17} color="#4A463F" />
                  <Text style={styles.menuItemText}>Danh sách yêu thích</Text>
                </View>
                {wishlistCount > 0 && (
                  <View style={styles.badgeIndicator}>
                    <Text style={styles.badgeIndicatorText}>{wishlistCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* ── 3. HỆ SINH THÁI & HƯỚNG DẪN (PUBLIC INFO PAGES) ── */}
            <View style={styles.menuGroup}>
              <Text style={styles.menuGroupTitle}>Hệ sinh thái &amp; Hướng dẫn</Text>

              {/* Cách hoạt động */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('HowItWorks')}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="repeat" size={17} color="#4A463F" />
                  <Text style={styles.menuItemText}>Cách hoạt động</Text>
                </View>
                <Feather name="chevron-right" size={15} color="#A8A29E" />
              </TouchableOpacity>

              {/* Giới thiệu ReUse Hub */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('About')}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="info" size={17} color="#4A463F" />
                  <Text style={styles.menuItemText}>Giới thiệu ReUse Hub</Text>
                </View>
                <Feather name="chevron-right" size={15} color="#A8A29E" />
              </TouchableOpacity>

              {/* FAQ */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('FAQ')}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="help-circle" size={17} color="#4A463F" />
                  <Text style={styles.menuItemText}>Câu hỏi thường gặp FAQ</Text>
                </View>
                <Feather name="chevron-right" size={15} color="#A8A29E" />
              </TouchableOpacity>

              {/* Liên hệ hỗ trợ */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('Contact')}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="mail" size={17} color="#4A463F" />
                  <Text style={styles.menuItemText}>Liên hệ hỗ trợ</Text>
                </View>
                <Feather name="chevron-right" size={15} color="#A8A29E" />
              </TouchableOpacity>
            </View>

            {/* ── 4. ROLE SPECIFIC INFO BOXES ── */}
            {isGuest ? (
              <>
                {/* Member Perks Box */}
                <View style={styles.perksBox}>
                  <View style={styles.perksHeaderRow}>
                    <Ionicons name="shield-checkmark" size={15} color="#576151" />
                    <Text style={styles.perksTitle}>Đặc quyền thành viên</Text>
                  </View>
                  <Text style={styles.perksDesc}>
                    Đăng ký tài khoản để định danh KYC, tích luỹ tín nhiệm và thuê trang phục cao cấp
                    với mức đặt cọc tối thiểu.
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigateTo('Auth', { screen: 'Register' })}
                    style={styles.perksLinkRow}
                  >
                    <Text style={styles.perksLinkText}>Tạo tài khoản miễn phí</Text>
                    <Feather name="arrow-right" size={13} color="#141310" />
                  </TouchableOpacity>
                </View>

                {/* Circular Trust Box */}
                <View style={styles.trustBox}>
                  <View style={styles.perksHeaderRow}>
                    <Ionicons name="checkmark-circle" size={15} color="#576151" />
                    <Text style={styles.trustTitle}>Tuần hoàn 100% minh bạch</Text>
                  </View>
                  <Text style={styles.trustDesc}>
                    Mọi sản phẩm trên ReUse Hub đều được kiểm tra đối soát, khử khuẩn chuyên sâu và
                    bảo chứng cọc qua ví Escrow an toàn.
                  </Text>
                </View>
              </>
            ) : (
              /* LOGGED IN USER LOGOUT */
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Feather name="log-out" size={16} color="#BA1A1A" />
                <Text style={styles.logoutBtnText}>Đăng xuất tài khoản</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawerPanel: {
    backgroundColor: '#FDF9F2',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    borderRightWidth: 1,
    borderRightColor: '#EBE5D8',
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE5D8',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#141310',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandIconText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: -2,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#141310',
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },

  // Guest card
  guestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E8E4DC',
  },
  guestProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guestAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F4F0EA',
    borderWidth: 1,
    borderColor: '#E8E4DC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestInfo: {
    flex: 1,
  },
  guestTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
  },
  guestSubtitle: {
    fontSize: 11,
    color: '#76726B',
    marginTop: 1,
  },
  guestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F0EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
    gap: 4,
  },
  guestDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#8E8A82',
  },
  guestBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#76726B',
  },
  guestAuthButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0ECE4',
  },
  guestLoginBtn: {
    flex: 1,
    backgroundColor: '#1C1A18',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  guestLoginBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  guestRegisterBtn: {
    flex: 1,
    backgroundColor: '#F4F0EA',
    borderWidth: 1,
    borderColor: '#E8E4DC',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  guestRegisterBtnText: {
    color: '#1C1A18',
    fontSize: 11,
    fontWeight: '700',
  },

  // User card
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E8E4DC',
  },
  userProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E8E4DC',
  },
  userAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1C1A18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1A18',
  },
  userEmail: {
    fontSize: 11,
    color: '#76726B',
    marginTop: 1,
  },
  userRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2EC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
    gap: 4,
  },
  userRoleDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#4A6B53',
  },
  userRoleText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4A6B53',
    letterSpacing: 0.5,
  },

  // Menu Groups
  menuGroup: {
    marginBottom: 20,
  },
  menuGroupTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#76726B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1C1A18',
  },
  hotBadge: {
    backgroundColor: '#EFECE6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hotBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#76726B',
  },
  countBadge: {
    backgroundColor: '#EFECE6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  countBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#76726B',
  },
  badgeIndicator: {
    backgroundColor: '#141310',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeIndicatorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Perks & Trust
  perksBox: {
    backgroundColor: 'rgba(239, 236, 230, 0.7)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E4DC',
  },
  perksHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  perksTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1A18',
  },
  perksDesc: {
    fontSize: 11,
    color: '#76726B',
    lineHeight: 15,
  },
  perksLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  perksLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#141310',
    textDecorationLine: 'underline',
  },

  trustBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E4DC',
  },
  trustTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1A18',
  },
  trustDesc: {
    fontSize: 11,
    color: '#76726B',
    lineHeight: 15,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF5F4',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BA1A1A',
  },
});

export default AppSidebarDrawer;
