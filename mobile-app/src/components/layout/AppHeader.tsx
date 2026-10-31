import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { useDrawer } from '../../context/DrawerContext';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, showBack = false }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { cartCount, wishlistCount } = useCartWishlist();
  const { openDrawer } = useDrawer();

  return (
    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.headerContent}>
        {/* Left Action: Hamburger Menu (dấu 3 gạch) or Back button */}
        <View style={styles.leftContainer}>
          {showBack ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.iconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="arrow-left" size={22} color="#1C1C18" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={openDrawer}
              style={styles.iconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="menu" size={22} color="#1C1C18" />
            </TouchableOpacity>
          )}
        </View>

        {/* Center: Brand or Title */}
        <View style={styles.centerContainer}>
          {title ? (
            <Text style={styles.screenTitle} numberOfLines={1}>
              {title}
            </Text>
          ) : (
            <TouchableOpacity
              style={styles.brandRow}
              onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })}
            >
              <View style={styles.brandIconBox}>
                <Text style={styles.brandIconText}>∞</Text>
              </View>
              <Text style={styles.brandTitle}>REUSE HUB</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Right Actions: Wishlist & Cart & Avatar / Login */}
        <View style={styles.rightContainer}>
          {/* Wishlist */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Wishlist')}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather name="heart" size={20} color="#1C1C18" />
            {wishlistCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{wishlistCount > 9 ? '9+' : wishlistCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Cart */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Cart')}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather name="shopping-bag" size={20} color="#1C1C18" />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* User Avatar or Guest Login */}
          {user ? (
            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={() => navigation.navigate('Main', { screen: 'ProfileTab' })}
            >
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>
                    {(user.fullName || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.guestLoginPill}
              onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
            >
              <Text style={styles.guestLoginPillText}>Đăng nhập</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBE5D8',
    zIndex: 10,
  },
  headerContent: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  leftContainer: {
    width: 44,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    padding: 6,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#141310',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#141310',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: -2,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#141310',
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C18',
  },
  avatarBtn: {
    marginLeft: 2,
  },
  avatarImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E4DC',
  },
  avatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#141310',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  guestLoginPill: {
    backgroundColor: '#F4F0EA',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E4DC',
    marginLeft: 2,
  },
  guestLoginPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1A18',
  },
});

export default AppHeader;

