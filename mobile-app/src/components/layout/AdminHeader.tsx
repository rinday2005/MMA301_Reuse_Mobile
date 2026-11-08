import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useDrawer } from '../../context/DrawerContext';
import { useAuth } from '../../hooks/useAuth';
import { normalizeImageUrl } from '../../utils/imageUrl';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { openDrawer } = useDrawer();
  const { user } = useAuth();

  const avatarUrl = normalizeImageUrl(user?.avatar || (user as any)?.avatarUrl || '');

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 44 : 28) }]}>
      <View style={styles.headerContent}>
        {/* Left: Drawer Toggle / Back + Admin Badge */}
        <View style={styles.leftGroup}>
          {showBack ? (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="arrow-left" size={20} color="#1C1A18" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={openDrawer}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="menu" size={20} color="#1C1A18" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.adminBadgeBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AdminDashboard')}
          >
            <MaterialIcons name="shield" size={15} color="#D97706" />
            <Text style={styles.roleBadgeText}>HỆ THỐNG QUẢN TRỊ</Text>
          </TouchableOpacity>
        </View>

        {/* Right: Custom Action OR Xem Sàn + Notifications + Avatar */}
        <View style={styles.rightGroup}>
          {rightAction ? (
            rightAction
          ) : (
            <>
              {/* Xem sàn */}
              <TouchableOpacity
                style={styles.marketBtn}
                onPress={() => navigation.navigate('Main')}
                activeOpacity={0.75}
              >
                <MaterialIcons name="storefront" size={15} color="#57534E" />
                <Text style={styles.marketBtnText}>Xem sàn</Text>
              </TouchableOpacity>

              {/* Thông báo */}
              <TouchableOpacity
                style={styles.iconBtnSmall}
                onPress={() => navigation.navigate('NotificationCenter')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="bell" size={18} color="#57534E" />
                <View style={styles.unreadDot} />
              </TouchableOpacity>

              {/* Avatar Profile */}
              <TouchableOpacity
                style={styles.avatarBtn}
                onPress={() => navigation.navigate('UserManagement')}
                activeOpacity={0.8}
              >
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitial}>AD</Text>
                  </View>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {title ? (
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.pageSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FDFBF7',
    borderBottomWidth: 1,
    borderBottomColor: '#EFECE6',
    paddingBottom: 10,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 48,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F5F2EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  adminBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roleBadgeText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  marketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  marketBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#44403C',
  },
  iconBtnSmall: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  avatarBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#D97706',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  titleRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 2,
  },
  pageTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 2,
  },
});

export default AdminHeader;

