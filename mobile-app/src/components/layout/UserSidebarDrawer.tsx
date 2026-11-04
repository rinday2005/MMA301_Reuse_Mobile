import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { useDrawer } from '../../context/DrawerContext';
import { getMyRentalOrdersApi } from '../../services/order.api';
import { getMyThriftOrdersApi } from '../../services/thriftOrder.api';
import { getKycStatusApi } from '../../services/kyc.api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.84, 340);

export const UserSidebarDrawer: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { isDrawerOpen, closeDrawer } = useDrawer();
  const { cartCount, wishlistCount } = useCartWishlist();

  const [rentCount, setRentCount] = useState<number>(0);
  const [thriftCount, setThriftCount] = useState<number>(0);
  const [kycStatus, setKycStatus] = useState<string>(user?.kycStatus || 'NOT_SUBMITTED');

  // Load real order counts & KYC status from backend
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    // 1. Rent orders
    getMyRentalOrdersApi()
      .then((res) => {
        if (!isMounted || !Array.isArray(res)) return;
        const active = res.filter((o) =>
          ['PAID', 'RENTING', 'READY_FOR_HANDOVER', 'HANDED_OVER', 'SHIPPING', 'DELIVERED'].includes(
            o.status || ''
          )
        );
        setRentCount(active.length);
      })
      .catch(() => { });

    // 2. Thrift orders
    getMyThriftOrdersApi()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : res?.orders || [];
        setThriftCount(list.length);
      })
      .catch(() => { });

    // 3. KYC status
    getKycStatusApi()
      .then((res) => {
        if (!isMounted) return;
        const s = res?.kycStatus || res?.kyc?.status || user?.kycStatus || 'NOT_SUBMITTED';
        setKycStatus(s);
      })
      .catch(() => {
        if (isMounted) setKycStatus(user?.kycStatus || 'NOT_SUBMITTED');
      });

    return () => {
      isMounted = false;
    };
  }, [user, isDrawerOpen]);

  const navigateTo = (screenName: string, params?: any) => {
    closeDrawer();
    setTimeout(() => {
      navigation.navigate(screenName, params);
    }, 150);
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            closeDrawer();
            try {
              await logout();
              navigation.navigate('Main', { screen: 'HomeTab' });
            } catch {
              // ignore
            }
          },
        },
      ]
    );
  };

  const initials = (user?.fullName || 'U')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const renderKycBadge = () => {
    const s = String(kycStatus).toUpperCase();
    if (s === 'APPROVED' || s === 'VERIFIED') {
      return (
        <View style={styles.kycBadgeApproved}>
          <Text style={styles.kycBadgeTextApproved}>ĐÃ DUYỆT</Text>
        </View>
      );
    }
    if (s === 'PENDING') {
      return (
        <View style={styles.kycBadgePending}>
          <Text style={styles.kycBadgeTextPending}>CHỜ DUYỆT</Text>
        </View>
      );
    }
    if (s === 'REJECTED') {
      return (
        <View style={styles.kycBadgeRejected}>
          <Text style={styles.kycBadgeTextRejected}>TỪ CHỐI</Text>
        </View>
      );
    }
    return (
      <View style={styles.kycBadgeNone}>
        <Text style={styles.kycBadgeTextNone}>CHƯA XÁC THỰC</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={isDrawerOpen}
      animationType="fade"
      transparent
      onRequestClose={closeDrawer}
    >
      <View style={styles.modalOverlay}>
        {/* Left-docked Drawer Panel */}
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
              <View>
                <Text style={styles.brandTitle}>REUSE HUB</Text>
                <Text style={styles.brandSubtitle}>TÀI KHOẢN KHÁCH HÀNG</Text>
              </View>
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
            {/* 1. USER PROFILE CARD */}
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => navigateTo('Profile')}
              activeOpacity={0.85}
            >
              <View style={styles.userProfileRow}>
                {user?.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={styles.userAvatarImage} />
                ) : (
                  <View style={styles.userAvatarFallback}>
                    <Text style={styles.userAvatarInitial}>{initials}</Text>
                  </View>
                )}
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user?.fullName || 'Khách hàng'}
                  </Text>
                  <Text style={styles.userEmail} numberOfLines={1}>
                    {user?.email || ''}
                  </Text>
                  <View style={styles.userRoleBadge}>
                    <View style={styles.userRoleDot} />
                    <Text style={styles.userRoleText}>Khách hàng uy tín</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* 2. GROUP 1: QUẢN LÝ TÀI KHOẢN */}
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>QUẢN LÝ TÀI KHOẢN</Text>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('UserDashboard')}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="grid" size={17} color="#1C1A18" />
                  <Text style={styles.menuItemTextBold}>Dashboard</Text>
                </View>
                <View style={styles.activeDot} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('Main', { screen: 'RentTab' })}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="flash-outline" size={17} color="#1C1A18" />
                  <Text style={styles.menuItemText}>Khám phá RENT</Text>
                </View>
                <View style={styles.badgeAmber}>
                  <Text style={styles.badgeAmberText}>HOT</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('Main', { screen: 'ThriftTab' })}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="shopping-bag" size={17} color="#1C1A18" />
                  <Text style={styles.menuItemText}>Kho đồ THRIFT</Text>
                </View>
                <View style={styles.badgeMuted}>
                  <Text style={styles.badgeMutedText}>340+</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('Main', { screen: 'CategoriesTab' })}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="layers" size={17} color="#1C1A18" />
                  <Text style={styles.menuItemText}>Categories bộ sưu tầm</Text>
                </View>
                <View style={styles.badgeMuted}>
                  <Text style={styles.badgeMutedText}>Mục</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* 3. GROUP 2: ĐƠN HÀNG & TIỆN ÍCH */}
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>ĐƠN HÀNG & TIỆN ÍCH</Text>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('UserWallet')}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="credit-card" size={17} color="#1C1A18" />
                  <Text style={styles.menuItemText}>Ví cọc & Hoàn tiền (Escrow)</Text>
                </View>
                <Feather name="chevron-right" size={15} color="#A8A29E" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('MyRentOrders')}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="clock" size={17} color="#1C1A18" />
                  <Text style={styles.menuItemText}>Đơn thuê (My Rentals)</Text>
                </View>
                <Text style={styles.badgeCounterText}>
                  {rentCount > 0 ? `${rentCount} Đang giữ` : 'Chưa có'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('MyThriftOrders')}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="package" size={17} color="#1C1A18" />
                  <Text style={styles.menuItemText}>Đơn mua THRIFT</Text>
                </View>
                <Text style={styles.badgeCounterText}>
                  {thriftCount > 0 ? `${thriftCount} Đơn` : 'Chưa có'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('Cart')}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="shopping-cart" size={17} color="#1C1A18" />
                  <Text style={styles.menuItemText}>Giỏ hàng</Text>
                </View>
                <Text style={styles.badgeCounterText}>
                  {cartCount > 0 ? `${cartCount} Món` : '0'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('Wishlist')}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="heart" size={17} color="#1C1A18" />
                  <Text style={styles.menuItemText}>Yêu thích (Wishlist)</Text>
                </View>
                <Text style={styles.badgeCounterText}>{wishlistCount}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('Chat')}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="message-square" size={17} color="#1C1A18" />
                  <Text style={styles.menuItemText}>Tin nhắn & Hỗ trợ</Text>
                </View>
                <View style={styles.badgeMuted}>
                  <Text style={styles.badgeMutedText}>Mở</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* 4. GROUP 3: TÍN NHIỆM & BẢO MẬT */}
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>TÍN NHIỆM & BẢO MẬT</Text>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('Profile')}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="user" size={17} color="#1C1A18" />
                  <Text style={styles.menuItemText}>Hồ sơ cá nhân</Text>
                </View>
                <Feather name="chevron-right" size={15} color="#A8A29E" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('CustomerKyc')}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="shield" size={17} color="#1C1A18" />
                  <Text style={styles.menuItemText}>Định danh KYC</Text>
                </View>
                {renderKycBadge()}
              </TouchableOpacity>
            </View>

            {/* 5. SMART ESCROW GUARANTEE CARD */}
            <View style={styles.escrowCard}>
              <View style={styles.escrowHead}>
                <Ionicons name="shield-checkmark" size={16} color="#059669" />
                <Text style={styles.escrowTitle}>Bảo chứng Smart Escrow</Text>
              </View>
              <Text style={styles.escrowText}>
                Tiền cọc của bạn được cách ly an toàn và hoàn trả 100% trong 24h sau khi Shop Owner hoàn tất đối kiểm.
              </Text>
            </View>

            {/* 6. LOGOUT BUTTON */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Feather name="log-out" size={16} color="#DC2626" />
              <Text style={styles.logoutBtnText}>Đăng xuất tài khoản</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Backdrop on the Right */}
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

export default UserSidebarDrawer;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdrop: {
    flex: 1,
  },
  drawerPanel: {
    height: '100%',
    backgroundColor: '#FBF9F5',
    borderRightWidth: 1,
    borderRightColor: '#E7E2DA',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E2DA',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#1C1A18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: -2,
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1A18',
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 8,
    color: '#78736A',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingTop: 14,
    paddingBottom: 32,
    gap: 16,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 14,
  },
  userProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E7E2DA',
  },
  userAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F4F0EA',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarInitial: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1A18',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
  },
  userEmail: {
    fontSize: 10,
    color: '#78736A',
    marginTop: 1,
  },
  userRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
    marginTop: 4,
  },
  userRoleDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#059669',
  },
  userRoleText: {
    fontSize: 9,
    color: '#047857',
    fontWeight: '700',
  },
  menuSection: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#78736A',
    letterSpacing: 1,
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1C1A18',
  },
  menuItemTextBold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1C1A18',
  },
  badgeAmber: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeAmberText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
  },
  badgeMuted: {
    backgroundColor: '#F4F0EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeMutedText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#78736A',
  },
  badgeCounterText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  kycBadgeApproved: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kycBadgeTextApproved: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  kycBadgePending: {
    backgroundColor: '#D97706',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kycBadgeTextPending: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  kycBadgeRejected: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kycBadgeTextRejected: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  kycBadgeNone: {
    backgroundColor: '#78736A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kycBadgeTextNone: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  escrowCard: {
    backgroundColor: '#F4F0EA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 12,
    gap: 4,
  },
  escrowHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  escrowTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1A18',
  },
  escrowText: {
    fontSize: 10,
    color: '#78736A',
    lineHeight: 14,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 8,
    marginTop: 4,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
});

