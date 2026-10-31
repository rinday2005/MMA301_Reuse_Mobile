import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, token, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#141310" />
      </View>
    );
  }

  // State: Guest (Not logged in)
  if (!token || !user) {
    return (
      <View style={styles.container}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarPlaceholderText}>👤</Text>
        </View>

        <Text style={styles.guestTitle}>Chưa đăng nhập</Text>
        <Text style={styles.guestSubtitle}>
          Đăng nhập hoặc đăng ký để quản lý tủ đồ, đơn thuê và danh sách yêu thích của bạn.
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>ĐĂNG NHẬP / ĐĂNG KÝ →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // State: Logged in User
  return (
    <View style={styles.container}>
      <View style={styles.userCard}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>

        <Text style={styles.userName}>{user.fullName || 'Thành viên ReUse Hub'}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            {user.role === 'ADMIN'
              ? '🛡️ Quản trị viên'
              : user.role === 'SHOP_OWNER'
                ? '🏬 Chủ cửa hàng'
                : '👤 Khách hàng'}
          </Text>
        </View>

        {user.role === 'SHOP_OWNER' && (
          <TouchableOpacity
            style={styles.switchRoleBtn}
            onPress={() => navigation.navigate('Shop')}
            activeOpacity={0.8}
          >
            <Text style={styles.switchRoleBtnText}>Vào Kênh Quản Lý Shop →</Text>
          </TouchableOpacity>
        )}

        {user.role === 'ADMIN' && (
          <TouchableOpacity
            style={styles.switchRoleBtn}
            onPress={() => navigation.navigate('Admin')}
            activeOpacity={0.8}
          >
            <Text style={styles.switchRoleBtnText}>Vào Trang Quản Trị Hệ Thống →</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={async () => {
          await logout();
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutBtnText}>Đăng Xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF9F2',
  },
  container: {
    flex: 1,
    backgroundColor: '#FDF9F2',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EBE5D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarPlaceholderText: {
    fontSize: 36,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C18',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
    maxWidth: 280,
  },
  primaryBtn: {
    backgroundColor: '#141310',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0ECE4',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  userAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#141310',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C18',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: '#EBE5D8',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A463F',
  },
  switchRoleBtn: {
    marginTop: 8,
    backgroundColor: '#F7F3EC',
    borderWidth: 1,
    borderColor: '#D8D3C8',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  switchRoleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#141310',
  },
  logoutBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BA1A1A',
    backgroundColor: '#FFF5F5',
  },
  logoutBtnText: {
    color: '#BA1A1A',
    fontSize: 13,
    fontWeight: '600',
  },
});
