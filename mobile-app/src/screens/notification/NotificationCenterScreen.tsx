import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';

interface NotificationItem {
  id: string;
  type: 'ORDER' | 'ESCROW' | 'KYC' | 'SYSTEM';
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

export const NotificationCenterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ORDER' | 'ESCROW' | 'KYC'>('ALL');

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n-1',
      type: 'ESCROW',
      title: 'Ký quỹ Smart Escrow thành công',
      desc: 'Tiền cọc thiết bị máy ảnh Sony A7 IV đã được bảo chứng độc lập. Cửa sổ nghiệm thu kích hoạt khi nhận hàng.',
      time: '15 phút trước',
      read: false,
    },
    {
      id: 'n-2',
      type: 'ORDER',
      title: 'Đơn thuê #RH-RNT-2026 đã sẵn sàng',
      desc: 'Shop Owner đã hoàn tất kiểm định quang học 14 bước và đóng thùng Nanuk niêm phong.',
      time: '2 giờ trước',
      read: false,
    },
    {
      id: 'n-3',
      type: 'KYC',
      title: 'Hồ sơ KYC đã được tiếp nhận',
      desc: 'Hệ thống đang đối soát dữ liệu CCCD. Hạn mức thuê cao cấp sẽ được mở ngay sau khi phê duyệt.',
      time: 'Hôm qua',
      read: true,
    },
    {
      id: 'n-4',
      type: 'ESCROW',
      title: 'Hoàn trả 100% tiền cọc #RH-RNT-1092',
      desc: 'Shop Owner đã hoàn tất đối soát trả đồ đạt chuẩn Grade A+. Tiền cọc đã giải phóng về tài khoản.',
      time: '2 ngày trước',
      read: true,
    },
  ]);

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'ALL') return true;
    return n.type === activeFilter;
  });

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const renderIcon = (type: string) => {
    if (type === 'ESCROW') return <Ionicons name="shield-checkmark" size={18} color="#059669" />;
    if (type === 'ORDER') return <Ionicons name="flash-outline" size={18} color="#1C1A18" />;
    if (type === 'KYC') return <Feather name="user-check" size={18} color="#2563EB" />;
    return <Feather name="bell" size={18} color="#78736A" />;
  };

  return (
    <View style={styles.safeArea}>
      <AppHeader title="Thông Báo" showBack />

      {/* Filter Tabs & Mark All */}
      <View style={styles.topBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'ORDER', label: 'Đơn hàng' },
            { key: 'ESCROW', label: 'Ký quỹ Escrow' },
            { key: 'KYC', label: 'Định danh KYC' },
          ].map((tab) => {
            const active = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabBtn, active && styles.tabBtnActive]}
                onPress={() => setActiveFilter(tab.key as any)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
          <Text style={styles.markAllText}>Đã đọc hết</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="bell-off" size={32} color="#A8A29E" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>Không có thông báo nào</Text>
            <Text style={styles.emptySub}>Mọi cập nhật trạng thái đơn hàng và ký quỹ sẽ hiển thị ở đây.</Text>
          </View>
        ) : (
          filtered.map((item) => (
            <View key={item.id} style={[styles.notifCard, !item.read && styles.notifUnread]}>
              <View style={styles.notifIconBox}>{renderIcon(item.type)}</View>
              <View style={styles.notifContent}>
                <View style={styles.notifHeaderRow}>
                  <Text style={styles.notifTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.notifTime}>{item.time}</Text>
                </View>
                <Text style={styles.notifDesc}>{item.desc}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default NotificationCenterScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF9F5',
  },
  topBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E2DA',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabsRow: {
    gap: 6,
  },
  tabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F4F0EA',
  },
  tabBtnActive: {
    backgroundColor: '#1C1A18',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5E5A53',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  markAllBtn: {
    paddingLeft: 8,
  },
  markAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1A18',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 8,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 12,
    gap: 10,
    position: 'relative',
  },
  notifUnread: {
    borderColor: '#1C1A18',
    backgroundColor: '#FDFBF7',
  },
  notifIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F4F0EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  notifContent: {
    flex: 1,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  notifTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
    flex: 1,
    marginRight: 8,
  },
  notifTime: {
    fontSize: 9,
    color: '#78736A',
  },
  notifDesc: {
    fontSize: 11,
    color: '#5E5A53',
    lineHeight: 16,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
    position: 'absolute',
    top: 12,
    right: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 11,
    color: '#78736A',
    textAlign: 'center',
  },
});
