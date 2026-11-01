import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';
import { getMyThriftOrdersApi, confirmDeliveredThriftOrderApi, ThriftOrderApi } from '../../services/thriftOrder.api';
import { normalizeImageUrl } from '../../utils/imageUrl';
import { resolveThriftOrderItem } from '../../utils/thriftOrderItemResolver';

export const MyThriftOrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<ThriftOrderApi[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const formatVND = (num: number) => {
    return (num || 0).toLocaleString('vi-VN') + '₫';
  };

  const loadOrders = useCallback(async () => {
    try {
      const res = await getMyThriftOrdersApi();
      if (Array.isArray(res)) {
        setOrders(res);
      } else if (res?.orders && Array.isArray(res.orders)) {
        setOrders(res.orders);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const status = (o.status || '').toUpperCase();
      if (activeTab === 'PROCESSING') {
        if (!['PENDING', 'WAITING_PAYMENT', 'PAID', 'CONFIRMED', 'PREPARING', 'PROCESSING', 'SHIPPING', 'SHIPPED'].includes(status)) {
          return false;
        }
      } else if (activeTab === 'DELIVERED') {
        if (!['DELIVERED', 'COMPLETED'].includes(status)) return false;
      } else if (activeTab === 'CANCELLED') {
        if (!['CANCELLED', 'DISPUTED'].includes(status)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const code = (o.orderCode || o._id || '').toLowerCase();
        const itemInfo = resolveThriftOrderItem(o, o.items?.[0]);
        if (!code.includes(q) && !itemInfo.title.toLowerCase().includes(q)) return false;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  const handleConfirmReceived = (orderId: string) => {
    Alert.alert(
      'Xác nhận nhận hàng',
      'Bạn đã kiểm tra và nhận đầy đủ sản phẩm THRIFT nguyên seal?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              await confirmDeliveredThriftOrderApi(orderId);
              Alert.alert('Thành công', 'Đơn hàng đã được cập nhật trạng thái Đã nhận.');
              loadOrders();
            } catch {
              loadOrders();
            }
          },
        },
      ]
    );
  };

  const renderStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'DELIVERED' || s === 'COMPLETED') {
      return (
        <View style={styles.badgeGreen}>
          <Text style={styles.badgeTextGreen}>ĐÃ NHẬN HÀNG</Text>
        </View>
      );
    }
    if (s === 'SHIPPED') {
      return (
        <View style={styles.badgeAmber}>
          <Text style={styles.badgeTextAmber}>ĐANG GIAO</Text>
        </View>
      );
    }
    if (s === 'PROCESSING' || s === 'PAID') {
      return (
        <View style={styles.badgeBlue}>
          <Text style={styles.badgeTextBlue}>ĐANG XỬ LÝ</Text>
        </View>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <View style={styles.badgeRed}>
          <Text style={styles.badgeTextRed}>ĐÃ HỦY</Text>
        </View>
      );
    }
    return (
      <View style={styles.badgeMuted}>
        <Text style={styles.badgeTextMuted}>{s}</Text>
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      <AppHeader title="Đơn Mua THRIFT" showBack />

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#1C1A18" />
          <Text style={styles.loadingText}>Đang tải danh sách đơn THRIFT...</Text>
        </View>
      ) : (
        <View style={styles.container}>
          {/* Search Box */}
          <View style={styles.searchWrap}>
            <View style={styles.searchBox}>
              <Feather name="search" size={16} color="#78736A" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm mã đơn THRIFT hoặc tên đồ..."
                placeholderTextColor="#A8A29E"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Feather name="x" size={16} color="#78736A" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScrollView}
            contentContainerStyle={styles.tabsContainer}
          >
            {[
              { key: 'ALL', label: `Tất cả (${orders.length})` },
              { key: 'PROCESSING', label: 'Đang xử lý' },
              { key: 'DELIVERED', label: 'Đã nhận hàng' },
              { key: 'CANCELLED', label: 'Đã hủy' },
            ].map((tab) => {
              const active = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabBtn, active && styles.tabBtnActive]}
                  onPress={() => setActiveTab(tab.key as any)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Order Cards */}
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  loadOrders();
                }}
              />
            }
          >
            {filteredOrders.length === 0 ? (
              <View style={styles.emptyCard}>
                <Feather name="shopping-bag" size={36} color="#A8A29E" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyTitle}>Chưa có đơn mua THRIFT nào</Text>
                <Text style={styles.emptySub}>
                  Sở hữu vĩnh viễn các thiết bị secondhand cao cấp đã qua thẩm định 100%.
                </Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate('Main', { screen: 'ThriftTab' })}
                >
                  <Text style={styles.emptyBtnText}>Khám phá kho THRIFT →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredOrders.map((order) => {
                const item = order.items?.[0] as any;
                const resolved = resolveThriftOrderItem(order, item);
                const itemTitle = resolved.title;
                const itemImg = resolved.image;
                const itemCondition = resolved.condition;
                const orderCode = order.orderCode || `#${order._id?.slice(-6)}`;
                const total = order.totalAmount || item?.price || resolved.price || 0;
                const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '';
                const canConfirm = ['SHIPPED', 'DELIVERED'].includes(order.status || '');

                return (
                  <View key={order._id || order.orderCode} style={styles.orderCard}>
                    <View style={styles.orderHeaderRow}>
                      <View style={styles.orderCodeWrap}>
                        <Text style={styles.orderCodeText}>{orderCode}</Text>
                        <Text style={styles.orderDateText}>{dateStr}</Text>
                      </View>
                      {renderStatusBadge(order.status || '')}
                    </View>

                    <View style={styles.orderBodyRow}>
                      <Image source={{ uri: itemImg }} style={styles.productThumb} resizeMode="cover" />
                      <View style={styles.productInfo}>
                        <Text style={styles.productTitle} numberOfLines={2}>
                          {itemTitle}
                        </Text>
                        <View style={styles.badge1of1}>
                          <Text style={styles.badge1of1Text}>{itemCondition}</Text>
                        </View>
                        <Text style={styles.productPrice}>{formatVND(total)}</Text>
                      </View>
                    </View>

                    {/* Warranty Tag */}
                    <View style={styles.warrantyBox}>
                      <Ionicons name="shield-checkmark" size={13} color="#059669" />
                      <Text style={styles.warrantyText}>
                        Bảo đảm 72h kiểm tra độc lập · Đầy đủ hồ sơ xuất xứ Audit Bench
                      </Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.actionBtnDetail}
                        onPress={() =>
                          navigation.navigate('ThriftOrderDetail', {
                            id: order._id || order.orderCode,
                            order: order,
                          })
                        }
                      >
                        <Text style={styles.actionBtnDetailText}>Xem chi tiết</Text>
                      </TouchableOpacity>

                      {canConfirm && order.status !== 'DELIVERED' && (
                        <TouchableOpacity
                          style={styles.actionBtnConfirm}
                          onPress={() => handleConfirmReceived(order._id || order.orderCode)}
                        >
                          <Text style={styles.actionBtnConfirmText}>Đã nhận hàng</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.actionBtnBuyAgain}
                        onPress={() => navigation.navigate('Main', { screen: 'ThriftTab' })}
                      >
                        <Text style={styles.actionBtnBuyAgainText}>Mua thêm</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default MyThriftOrdersScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF9F5',
  },
  container: {
    flex: 1,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#78736A',
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#1C1A18',
  },
  tabsScrollView: {
    flexGrow: 0,
    marginBottom: 6,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabBtn: {
    minHeight: 38,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#1C1A18',
    borderColor: '#1C1A18',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5E5A53',
    lineHeight: 18,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 14,
    gap: 10,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F0EA',
  },
  orderCodeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderCodeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#1C1A18',
  },
  orderDateText: {
    fontSize: 10,
    color: '#78736A',
  },
  badgeGreen: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTextGreen: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  badgeBlue: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTextBlue: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
  },
  badgeAmber: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTextAmber: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  badgeRed: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTextRed: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
  },
  badgeMuted: {
    backgroundColor: '#F4F0EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTextMuted: {
    fontSize: 9,
    fontWeight: '700',
    color: '#78736A',
  },
  orderBodyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  productThumb: {
    width: 68,
    height: 68,
    borderRadius: 8,
    backgroundColor: '#F4F0EA',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
    lineHeight: 17,
  },
  badge1of1: {
    alignSelf: 'flex-start',
    backgroundColor: '#F4F0EA',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 3,
  },
  badge1of1Text: {
    fontSize: 8,
    fontWeight: '800',
    color: '#1C1A18',
    letterSpacing: 0.5,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1A18',
    marginTop: 4,
  },
  warrantyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FBF9F5',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  warrantyText: {
    fontSize: 9,
    color: '#5E5A53',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  actionBtnDetail: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnDetailText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1A18',
  },
  actionBtnConfirm: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1A18',
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnConfirmText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnBuyAgain: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F0EA',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnBuyAgainText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1A18',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 32,
    alignItems: 'center',
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
    lineHeight: 16,
    marginBottom: 14,
  },
  emptyBtn: {
    backgroundColor: '#1C1A18',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  emptyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
