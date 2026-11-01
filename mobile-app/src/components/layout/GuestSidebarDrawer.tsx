import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useDrawer } from '../../context/DrawerContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);

export const GuestSidebarDrawer: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { isDrawerOpen, closeDrawer } = useDrawer();

  const navigateTo = (screenName: string, params?: any) => {
    closeDrawer();
    setTimeout(() => {
      navigation.navigate(screenName, params);
    }, 150);
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
                <Text style={styles.brandSubtitle}>CIRCULAR PLATFORM</Text>
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
            {/* 1. GUEST WELCOME CARD */}
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

              <View style={styles.guestAuthButtonsRow}>
                <TouchableOpacity
                  style={styles.guestLoginBtn}
                  onPress={() => navigateTo('Auth', { screen: 'Login' })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.guestLoginBtnText}>Đăng nhập</Text>
                  <Feather name="arrow-right" size={13} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.guestRegisterBtn}
                  onPress={() => navigateTo('Auth', { screen: 'Register' })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.guestRegisterBtnText}>Đăng ký</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Slogan */}
            <View style={styles.sloganCard}>
              <Text style={styles.sloganTitle}>Dùng nhiều hơn. Sở hữu ít hơn.</Text>
              <Text style={styles.sloganDesc}>
                Nền tảng lưu thông thiết bị quang học, thời trang và phụ kiện dã ngoại cao cấp.
              </Text>
            </View>

            {/* 2. KHÁM PHÁ THỊ TRƯỜNG */}
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>KHÁM PHÁ THỊ TRƯỜNG</Text>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('Main', { screen: 'RentTab' })}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="flash-outline" size={18} color="#1C1A18" />
                  <Text style={styles.menuItemText}>Thuê đồ RENT</Text>
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
                  <Feather name="shopping-bag" size={18} color="#1C1A18" />
                  <Text style={styles.menuItemText}>Mua sắm THRIFT</Text>
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
                  <Feather name="grid" size={18} color="#1C1A18" />
                  <Text style={styles.menuItemText}>Danh mục Categories</Text>
                </View>
                <Feather name="chevron-right" size={15} color="#A8A29E" />
              </TouchableOpacity>
            </View>

            {/* 3. HỆ SINH THÁI TUẦN HOÀN */}
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>HỆ SINH THÁI TUẦN HOÀN</Text>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('HowItWorks')}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="repeat" size={18} color="#1C1A18" />
                  <Text style={styles.menuItemText}>Cách hoạt động</Text>
                </View>
                <Feather name="chevron-right" size={15} color="#A8A29E" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('About')}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="info" size={18} color="#1C1A18" />
                  <Text style={styles.menuItemText}>Về ReUse Hub</Text>
                </View>
                <Feather name="chevron-right" size={15} color="#A8A29E" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('FAQ')}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="help-circle" size={18} color="#1C1A18" />
                  <Text style={styles.menuItemText}>Câu hỏi thường gặp FAQ</Text>
                </View>
                <Feather name="chevron-right" size={15} color="#A8A29E" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('Contact')}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="mail" size={18} color="#1C1A18" />
                  <Text style={styles.menuItemText}>Liên hệ hỗ trợ</Text>
                </View>
                <Feather name="chevron-right" size={15} color="#A8A29E" />
              </TouchableOpacity>
            </View>

            {/* Smart Escrow Notice */}
            <View style={styles.escrowCard}>
              <View style={styles.escrowHead}>
                <Ionicons name="shield-checkmark" size={16} color="#059669" />
                <Text style={styles.escrowTitle}>Bảo chứng Smart Escrow</Text>
              </View>
              <Text style={styles.escrowText}>
                100% tiền cọc được cách ly an toàn và tự động hoàn trả sau khi kiểm tra trả hàng.
              </Text>
            </View>
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

export default GuestSidebarDrawer;

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
  guestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 14,
  },
  guestProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  guestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4F0EA',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 10,
    color: '#78736A',
  },
  guestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F4F0EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
    marginTop: 3,
  },
  guestDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#78736A',
  },
  guestBadgeText: {
    fontSize: 9,
    color: '#78736A',
    fontWeight: '600',
  },
  guestAuthButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  guestLoginBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1A18',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  guestLoginBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  guestRegisterBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    paddingVertical: 8,
    borderRadius: 10,
  },
  guestRegisterBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1A18',
  },
  sloganCard: {
    backgroundColor: '#F4F0EA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 12,
  },
  sloganTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 4,
  },
  sloganDesc: {
    fontSize: 11,
    color: '#5E5A53',
    lineHeight: 15,
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
    fontWeight: '600',
    color: '#1C1A18',
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
});

