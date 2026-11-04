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
import { useDrawer } from '../../context/DrawerContext';
import { getShopRentalOrdersApi } from '../../services/order.api';
import { getShopThriftOrdersApi } from '../../services/thriftOrder.api';
import { getShopRentProductsApi } from '../../services/rentProduct.api';
import { normalizeImageUrl } from '../../utils/imageUrl';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.84, 340);

export const ShopOwnerSidebarDrawer: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { isDrawerOpen, closeDrawer } = useDrawer();

  const [pendingRentCount, setPendingRentCount] = useState<number>(0);
  const [pendingThriftCount, setPendingThriftCount] = useState<number>(0);
  const [productCount, setProductCount] = useState<number>(0);

  // Load order and product counts for badges
  useEffect(() => {
    if (!user || !isDrawerOpen) return;
    let isMounted = true;

    // 1. Rent orders
    getShopRentalOrdersApi()
      .then((res) => {
        if (!isMounted || !Array.isArray(res)) return;
        const pending = res.filter((o) =>
          ['PENDING', 'PAID', 'WAITING_PAYMENT', 'READY_FOR_HANDOVER'].includes(o.status || '')
        );
        setPendingRentCount(pending.length);
      })
      .catch(() => { });

    // 2. Thrift orders
    getShopThriftOrdersApi()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : res?.orders || [];
        const pending = list.filter((o: any) =>
          ['PROCESSING', 'PAID', 'PENDING_PAYMENT'].includes(o.status || '')
        );
        setPendingThriftCount(pending.length);
      })
      .catch(() => { });

    // 3. Rent products
    getShopRentProductsApi()
      .then((res) => {
        if (!isMounted || !Array.isArray(res)) return;
        setProductCount(res.length);
      })
      .catch(() => { });

    return () => {
      isMounted = false;
    };
  }, [user, isDrawerOpen]);

  const navigateTo = (screenName: string, params?: any) => {
    closeDrawer();
    setTimeout(() => {
      if (screenName === 'Main') {
        navigation.navigate('Main');
      } else {
        navigation.navigate('Shop', { screen: screenName, params });
      }
    }, 150);
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi Kênh người bán?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            closeDrawer();
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            } catch (err) {
              console.warn('Lỗi đăng xuất:', err);
            }
          },
        },
      ]
    );
  };

  const shopName = user?.fullName || 'ReUse Official Shop';
  const avatarUrl = normalizeImageUrl(user?.avatar || (user as any)?.avatarUrl || '');

  return (
    <Modal visible={isDrawerOpen} transparent animationType="none" onRequestClose={closeDrawer}>
      <View style={styles.modalRoot}>
        {/* Backdrop (tap outside to close) */}
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Drawer Content */}
        <View style={[styles.drawerContainer, { paddingTop: Math.max(insets.top, 16) }]}>
          {/* Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.logoRow}>
              <View style={styles.brandIconBox}>
                <Text style={styles.brandIconText}>∞</Text>
              </View>
              <Text style={styles.logoText}>ReUse Hub</Text>
              <View style={styles.ownerBadge}>
                <Text style={styles.ownerBadgeText}>SHOP OWNER</Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeDrawer} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={20} color="#78736A" />
            </TouchableOpacity>
          </View>

          {/* Shop Card */}
          <TouchableOpacity
            style={styles.profileCard}
            activeOpacity={0.85}
            onPress={() => navigateTo('ShopOwnerProfile')}
          >
            <Image
              source={{ uri: avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80' }}
              style={styles.avatar as any}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {shopName}
              </Text>
              <Text style={styles.profileEmail} numberOfLines={1}>
                {user?.email || 'shopowner@reuse.vn'}
              </Text>
              <View style={styles.verifiedRow}>
                <Ionicons name="checkmark-circle" size={13} color="#15803D" />
                <Text style={styles.verifiedText}>Đối tác kiểm định 100%</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color="#A8A29E" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuScroll}>
            {/* Group 1: QUẢN TRỊ KÊNH */}
            <Text style={styles.sectionHeader}>QUẢN TRỊ KÊNH</Text>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('ShopDashboard')}>
              <View style={styles.navLeft}>
                <Feather name="grid" size={18} color="#1C1A18" />
                <Text style={styles.navLabel}>Bảng điều khiển (Dashboard)</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#D6D3D1" />
            </TouchableOpacity>

            {/* Group 2: CHO THUÊ (RENT) */}
            <Text style={styles.sectionHeader}>CHO THUÊ (RENT)</Text>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('ManageRentProducts')}>
              <View style={styles.navLeft}>
                <Feather name="layers" size={18} color="#1C1A18" />
                <Text style={styles.navLabel}>Sản phẩm cho thuê</Text>
              </View>
              {productCount > 0 ? (
                <View style={styles.counterBadge}>
                  <Text style={styles.counterBadgeText}>{productCount}</Text>
                </View>
              ) : (
                <Feather name="chevron-right" size={16} color="#D6D3D1" />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('ShopOrders')}>
              <View style={styles.navLeft}>
                <Feather name="clipboard" size={18} color="#1C1A18" />
                <Text style={styles.navLabel}>Đơn thuê RENT</Text>
              </View>
              {pendingRentCount > 0 ? (
                <View style={[styles.counterBadge, { backgroundColor: '#EA580C' }]}>
                  <Text style={styles.counterBadgeText}>{pendingRentCount}</Text>
                </View>
              ) : (
                <Feather name="chevron-right" size={16} color="#D6D3D1" />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('InventoryDashboard')}>
              <View style={styles.navLeft}>
                <Feather name="package" size={18} color="#1C1A18" />
                <Text style={styles.navLabel}>Kho hiện vật cá thể</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#D6D3D1" />
            </TouchableOpacity>

            {/* Group 3: BÁN ĐỒ (THRIFT) */}
            <Text style={styles.sectionHeader}>BÁN ĐỒ (THRIFT)</Text>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('ShopThriftListings')}>
              <View style={styles.navLeft}>
                <Feather name="tag" size={18} color="#1C1A18" />
                <Text style={styles.navLabel}>Mục đăng THRIFT</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#D6D3D1" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('ShopThriftOrders')}>
              <View style={styles.navLeft}>
                <Feather name="truck" size={18} color="#1C1A18" />
                <Text style={styles.navLabel}>Đơn bán THRIFT</Text>
              </View>
              {pendingThriftCount > 0 ? (
                <View style={[styles.counterBadge, { backgroundColor: '#0284C7' }]}>
                  <Text style={styles.counterBadgeText}>{pendingThriftCount}</Text>
                </View>
              ) : (
                <Feather name="chevron-right" size={16} color="#D6D3D1" />
              )}
            </TouchableOpacity>

            {/* Group 4: TÀI CHÍNH & BÁO CÁO */}
            <Text style={styles.sectionHeader}>TÀI CHÍNH & BÁO CÁO</Text>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('ShopRevenue')}>
              <View style={styles.navLeft}>
                <Feather name="dollar-sign" size={18} color="#15803D" />
                <Text style={styles.navLabel}>Doanh thu & Ví Escrow</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#D6D3D1" />
            </TouchableOpacity>

            {/* Group 5: THIẾT LẬP & HỒ SƠ */}
            <Text style={styles.sectionHeader}>THIẾT LẬP & HỒ SƠ</Text>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('ShopOwnerProfile')}>
              <View style={styles.navLeft}>
                <Feather name="settings" size={18} color="#1C1A18" />
                <Text style={styles.navLabel}>Hồ sơ xưởng / Shop</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#D6D3D1" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('ShopOwnerKyc')}>
              <View style={styles.navLeft}>
                <Feather name="shield" size={18} color="#1C1A18" />
                <Text style={styles.navLabel}>Xác thực đối tác KYC</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#D6D3D1" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('ShopNotifications')}>
              <View style={styles.navLeft}>
                <Feather name="bell" size={18} color="#1C1A18" />
                <Text style={styles.navLabel}>Thông báo Kênh người bán</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#D6D3D1" />
            </TouchableOpacity>

            {/* Group 6: CHUYỂN SANG SÀN MUA SẮM */}
            <View style={styles.switchBox}>
              <TouchableOpacity style={styles.switchBtn} onPress={() => navigateTo('Main')}>
                <Feather name="external-link" size={15} color="#1C1A18" />
                <Text style={styles.switchBtnText}>Khám phá sàn mua sắm</Text>
              </TouchableOpacity>
            </View>

            {/* Đăng xuất */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Feather name="log-out" size={16} color="#DC2626" />
              <Text style={styles.logoutText}>Đăng xuất Kênh người bán</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ShopOwnerSidebarDrawer;

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawerContainer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#FAF7F2',
    borderRightWidth: 1,
    borderRightColor: '#EBE5D8',
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE5D8',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  brandIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#1C1A18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginTop: -2,
  },
  logoText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1A18',
    letterSpacing: 0.3,
  },
  ownerBadge: {
    backgroundColor: '#1C1A18',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ownerBadgeText: {
    color: '#FAF7F2',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F0ECE4',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE8DF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFD8CC',
    padding: 12,
    marginVertical: 14,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DDD5C7',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1A18',
  },
  profileEmail: {
    fontSize: 11,
    color: '#78736A',
    marginTop: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#15803D',
  },
  menuScroll: {
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#A8A29E',
    marginTop: 16,
    marginBottom: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFECE6',
    marginBottom: 6,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1A18',
  },
  counterBadge: {
    backgroundColor: '#1C1A18',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  counterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  switchBox: {
    marginTop: 16,
    marginBottom: 10,
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#EDE8DF',
    borderWidth: 1,
    borderColor: '#DFD8CC',
  },
  switchBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 4,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
});

