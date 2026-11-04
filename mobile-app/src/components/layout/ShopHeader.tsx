import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useDrawer } from '../../context/DrawerContext';
import { useAuth } from '../../hooks/useAuth';
import { normalizeImageUrl } from '../../utils/imageUrl';

interface ShopHeaderProps {
  title?: string;
  showBack?: boolean;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({ title, showBack = false }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { openDrawer } = useDrawer();
  const { user } = useAuth();

  const shopName = user?.fullName || 'ReUse Official Shop';
  const avatarUrl = normalizeImageUrl(user?.avatar || (user as any)?.avatarUrl || '');

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 44 : 28) }]}>
      <View style={styles.headerContent}>
        {/* Left: Drawer Toggle / Back + Brand Logo */}
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
            onPress={() => navigation.navigate('ShopDashboard')}
          >
            <MaterialIcons name="admin-panel-settings" size={15} color="#E87A5D" />
            <Text style={styles.roleBadgeText}>KÊNH QUẢN TRỊ</Text>
          </TouchableOpacity>
        </View>

        {/* Right: Xem sàn + Thông báo + Avatar Profile */}
        <View style={styles.rightGroup}>
          {/* Xem sàn */}
          <TouchableOpacity
            style={styles.marketBtn}
            onPress={() => navigation.navigate('Main')}
            activeOpacity={0.75}
          >
            <MaterialIcons name="storefront" size={16} color="#57534E" />
            <Text style={styles.marketBtnText}>Xem sàn</Text>
          </TouchableOpacity>

          {/* Thông báo */}
          <TouchableOpacity
            style={styles.iconBtnSmall}
            onPress={() => navigation.navigate('ShopNotifications')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="bell" size={18} color="#57534E" />
            <View style={styles.unreadDot} />
          </TouchableOpacity>

          {/* Avatar Profile */}
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('ShopOwnerProfile')}
            activeOpacity={0.8}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="storefront" size={14} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {title ? (
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default ShopHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FDF9F2',
    borderBottomWidth: 1,
    borderBottomColor: '#EBE5D8',
    paddingBottom: 8,
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
    flex: 1,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EDE8DF',
    borderWidth: 1,
    borderColor: '#DDD8CE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#141310',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },
  roleBadgeText: {
    color: '#E87A5D',
    fontSize: 10,
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
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#DDD8CE',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  marketBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#57534E',
  },
  iconBtnSmall: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#EDE8DF',
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
    backgroundColor: '#E11D48',
  },
  avatarBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DDD8CE',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#141310',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 2,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#141310',
    letterSpacing: -0.3,
  },
});

