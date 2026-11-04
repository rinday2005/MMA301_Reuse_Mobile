import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface ShopNotif {
  id: string;
  category: 'orders' | 'listings' | 'messages' | 'escrow';
  typeBadge: 'RENT' | 'THRIFT' | 'ESCROW' | 'CHAT';
  isUnread: boolean;
  timeAgo: string;
  title: string;
  description: string;
  actionText: string;
  screenTarget: string;
  params?: any;
}

const INITIAL_SHOP_NOTIFICATIONS: ShopNotif[] = [
  {
    id: 'notif-1',
    category: 'listings',
    typeBadge: 'RENT',
    isUnread: true,
    timeAgo: '15 phút trước',
    title: 'Sản phẩm RENT được phê duyệt kiểm định',
    description: 'Sản phẩm cho thuê Canon EOS R6 Mark II đã được Admin kiểm duyệt và xuất bản công khai lên sàn RENT.',
    actionText: 'Quản lý đồ thuê',
    screenTarget: 'ManageRentProducts',
  },
  {
    id: 'notif-2',
    category: 'orders',
    typeBadge: 'RENT',
    isUnread: true,
    timeAgo: '1 giờ trước',
    title: 'Đơn thuê RENT mới cần duyệt',
    description: 'Khách hàng vừa đặt đơn thuê mới #RN-ORD-9042 (Thời hạn 3 ngày, ký quỹ Smart Escrow: 1.305.000 ₫).',
    actionText: 'Xử lý đơn thuê',
    screenTarget: 'ShopOrders',
  },
  {
    id: 'notif-3',
    category: 'orders',
    typeBadge: 'RENT',
    isUnread: false,
    timeAgo: 'Hôm qua',
    title: 'Yêu cầu hoàn trả đồ từ khách hàng',
    description: 'Khách hàng yêu cầu trả đồ cho đơn #RN-ORD-8991. Bưu tá Nanuk đã nhận kiện hàng và chuyển về xưởng nghiệm thu.',
    actionText: 'Nghiệm thu & Giải tỏa cọc',
    screenTarget: 'ShopOrders',
  },
  {
    id: 'notif-4',
    category: 'orders',
    typeBadge: 'THRIFT',
    isUnread: true,
    timeAgo: '3 giờ trước',
    title: 'Đơn mua đứt THRIFT mới',
    description: 'Đơn mua hàng thanh lý mới #TO-1793368595257 (880.000 ₫). Vui lòng kẹp chì niêm phong và bàn giao bưu tá.',
    actionText: 'Bàn giao bưu tá',
    screenTarget: 'ShopThriftOrders',
  },
  {
    id: 'notif-5',
    category: 'escrow',
    typeBadge: 'ESCROW',
    isUnread: false,
    timeAgo: '2 ngày trước',
    title: 'Giải ngân hoàn tất ký quỹ Escrow',
    description: 'Đơn hàng THRIFT #TO-1792994374278 đã hết 72h đối soát thành công. Hệ thống đã giải ngân 995.000 ₫ về số dư ví xưởng.',
    actionText: 'Xem ví Escrow',
    screenTarget: 'ShopRevenue',
  },
];

type CategoryFilter = 'all' | 'orders' | 'listings' | 'escrow';

export const ShopNotificationsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const [notifications, setNotifications] = useState<ShopNotif[]>(INITIAL_SHOP_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const handlePressNotif = (notif: ShopNotif) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isUnread: false } : n))
    );
    navigation.navigate(notif.screenTarget, notif.params);
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.category === activeFilter;
  });

  const renderBadge = (type: 'RENT' | 'THRIFT' | 'ESCROW' | 'CHAT') => {
    switch (type) {
      case 'RENT':
        return (
          <View style={[styles.typeBadge, { backgroundColor: '#FFF7ED' }]}>
            <Text style={[styles.typeBadgeText, { color: '#EA580C' }]}>RENT</Text>
          </View>
        );
      case 'THRIFT':
        return (
          <View style={[styles.typeBadge, { backgroundColor: '#F0F9FF' }]}>
            <Text style={[styles.typeBadgeText, { color: '#0284C7' }]}>THRIFT</Text>
          </View>
        );
      case 'ESCROW':
        return (
          <View style={[styles.typeBadge, { backgroundColor: '#F0FDF4' }]}>
            <Text style={[styles.typeBadgeText, { color: '#15803D' }]}>ESCROW</Text>
          </View>
        );
      default:
        return (
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{type}</Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={22} color="#1C1A18" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo Shop Owner</Text>
        <TouchableOpacity style={styles.headerBackBtn} onPress={handleMarkAllRead}>
          <Feather name="check-circle" size={18} color="#15803D" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'orders', label: 'Đơn hàng' },
            { key: 'listings', label: 'Sản phẩm & Kho' },
            { key: 'escrow', label: 'Ký quỹ & Ví' },
          ].map((tab) => {
            const active = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveFilter(tab.key as any)}
                style={[styles.tabChip, active && styles.tabChipActive]}
              >
                <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notifCard, item.isUnread && styles.notifCardUnread]}
            activeOpacity={0.8}
            onPress={() => handlePressNotif(item)}
          >
            <View style={styles.notifHeader}>
              <View style={styles.notifHeaderLeft}>
                {renderBadge(item.typeBadge)}
                <Text style={styles.timeText}>{item.timeAgo}</Text>
              </View>
              {item.isUnread && <View style={styles.unreadDot} />}
            </View>

            <Text style={styles.notifTitle}>{item.title}</Text>
            <Text style={styles.notifDesc}>{item.description}</Text>

            <View style={styles.actionRow}>
              <Text style={styles.actionText}>{item.actionText} →</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ShopNotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAF8F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1A18',
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
    backgroundColor: '#FAF8F5',
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F5F5F4',
  },
  tabChipActive: {
    backgroundColor: '#1C1A18',
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78736A',
  },
  tabChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  notifCardUnread: {
    backgroundColor: '#FEFCE8',
    borderColor: '#FEF08A',
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notifHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#F5F5F4',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    color: '#A8A29E',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EA580C',
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 4,
  },
  notifDesc: {
    fontSize: 13,
    color: '#57534E',
    lineHeight: 18,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
  },
});
