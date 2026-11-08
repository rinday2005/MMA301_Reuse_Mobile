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
import { Feather, Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useDrawer } from '../../context/DrawerContext';
import { fetchAdminDashboardData } from '../../services/admin.api';
import { normalizeImageUrl } from '../../utils/imageUrl';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 340);

export const AdminSidebarDrawer: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { isDrawerOpen, closeDrawer } = useDrawer();

  const [pendingRentCount, setPendingRentCount] = useState<number>(0);
  const [pendingThriftCount, setPendingThriftCount] = useState<number>(0);
  const [pendingKycCount, setPendingKycCount] = useState<number>(0);
  const [disputeCount, setDisputeCount] = useState<number>(0);

  // Load pending counts for badges
  useEffect(() => {
    if (!user || !isDrawerOpen) return;
    let isMounted = true;

    fetchAdminDashboardData()
      .then((data) => {
        if (!isMounted) return;
        setPendingRentCount(data.metrics.pendingRentListingsCount || 0);
        setPendingThriftCount(data.metrics.pendingThriftListingsCount || 0);
        setPendingKycCount(data.metrics.pendingKycCount || 0);
        setDisputeCount(data.metrics.openDisputesCount || 0);
      })
      .catch((err) => {
        console.warn('Lỗi tải dữ liệu badge admin sidebar:', err);
      });

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
        navigation.navigate('Admin', { screen: screenName, params });
      }
    }, 150);
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi Bảng Quản trị Hệ thống?',
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
              console.warn('Lỗi đăng xuất admin:', err);
            }
          },
        },
      ]
    );
  };

  const adminName = user?.fullName || 'Hệ Thống Quản Trị';
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
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>SUPER ADMIN</Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeDrawer} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={20} color="#78736A" />
            </TouchableOpacity>
          </View>

          {/* Admin Profile Card */}
          <View style={styles.profileCard}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>AD</Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {adminName}
              </Text>
              <Text style={styles.profileEmail} numberOfLines={1}>
                {user?.email || 'admin@reuse.vn'}
              </Text>
              <View style={styles.verifiedRow}>
                <Ionicons name="shield-checkmark" size={13} color="#D97706" />
                <Text style={styles.verifiedText}>Toàn quyền Root Admin</Text>
              </View>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuScroll}>
            {/* Section 1: QUẢN TRỊ TRUNG TÂM */}
            <Text style={styles.sectionHeader}>QUẢN TRỊ TRUNG TÂM</Text>

            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('AdminDashboard')}>
              <View style={styles.navLeft}>
                <Feather name="grid" size={18} color="#1E293B" />
                <Text style={styles.navLabel}>Bảng tổng quan (Dashboard)</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('UserManagement')}>
              <View style={styles.navLeft}>
                <Feather name="users" size={18} color="#1E293B" />
                <Text style={styles.navLabel}>Quản lý tài khoản User</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('ShopManagement')}>
              <View style={styles.navLeft}>
                <Feather name="shopping-bag" size={18} color="#1E293B" />
                <Text style={styles.navLabel}>Quản lý Shop Owner</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Section 2: KIỂM DUYỆT SẢN PHẨM & TIN ĐĂNG */}
            <Text style={styles.sectionHeader}>DUYỆT & QUẢN LÝ SẢN PHẨM</Text>

            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('ListingApproval')}>
              <View style={styles.navLeft}>
                <Feather name="box" size={18} color="#1E293B" />
                <Text style={styles.navLabel}>Duyệt sản phẩm RENT</Text>
              </View>
              <View style={styles.badgeRow}>
                {pendingRentCount > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{pendingRentCount}</Text>
                  </View>
                )}
                <Feather name="chevron-right" size={16} color="#CBD5E1" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('ThriftListingApproval')}>
              <View style={styles.navLeft}>
                <Feather name="tag" size={18} color="#1E293B" />
                <Text style={styles.navLabel}>Duyệt tin thanh lý THRIFT</Text>
              </View>
              <View style={styles.badgeRow}>
                {pendingThriftCount > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{pendingThriftCount}</Text>
                  </View>
                )}
                <Feather name="chevron-right" size={16} color="#CBD5E1" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('CategoryManagement')}>
              <View style={styles.navLeft}>
                <MaterialIcons name="category" size={18} color="#1E293B" />
                <Text style={styles.navLabel}>Quản lý danh mục sàn</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Section 3: SMART ESCROW & AN TOÀN */}
            <Text style={styles.sectionHeader}>SMART ESCROW & PHÁP LÝ</Text>

            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('DisputeManagement')}>
              <View style={styles.navLeft}>
                <Feather name="alert-triangle" size={18} color="#DC2626" />
                <Text style={[styles.navLabel, { color: '#DC2626' }]}>Xử lý tranh chấp Escrow</Text>
              </View>
              <View style={styles.badgeRow}>
                {disputeCount > 0 && (
                  <View style={[styles.countBadge, { backgroundColor: '#FEE2E2' }]}>
                    <Text style={[styles.countBadgeText, { color: '#DC2626' }]}>{disputeCount}</Text>
                  </View>
                )}
                <Feather name="chevron-right" size={16} color="#CBD5E1" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('KycApproval')}>
              <View style={styles.navLeft}>
                <MaterialCommunityIcons name="card-account-details-outline" size={18} color="#1E293B" />
                <Text style={styles.navLabel}>Thẩm định KYC căn cước</Text>
              </View>
              <View style={styles.badgeRow}>
                {pendingKycCount > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{pendingKycCount}</Text>
                  </View>
                )}
                <Feather name="chevron-right" size={16} color="#CBD5E1" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('PlatformFinance')}>
              <View style={styles.navLeft}>
                <Feather name="dollar-sign" size={18} color="#15803D" />
                <Text style={styles.navLabel}>Tài chính & Phí sàn</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Section 4: HỆ THỐNG */}
            <Text style={styles.sectionHeader}>HỆ THỐNG</Text>

            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('Main')}>
              <View style={styles.navLeft}>
                <MaterialIcons name="storefront" size={18} color="#57534E" />
                <Text style={styles.navLabel}>Xem sàn khách hàng (User App)</Text>
              </View>
              <Feather name="arrow-up-right" size={16} color="#A8A29E" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.navItem, styles.logoutItem]} onPress={handleLogout}>
              <View style={styles.navLeft}>
                <Feather name="log-out" size={18} color="#DC2626" />
                <Text style={[styles.navLabel, { color: '#DC2626', fontWeight: '700' }]}>
                  Đăng xuất Quản trị
                </Text>
              </View>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawerContainer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#FDFBF7',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  logoText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  adminBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 2,
  },
  adminBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  profileEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  menuScroll: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 6,
    paddingHorizontal: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 3,
    backgroundColor: 'transparent',
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  logoutItem: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
});

export default AdminSidebarDrawer;
