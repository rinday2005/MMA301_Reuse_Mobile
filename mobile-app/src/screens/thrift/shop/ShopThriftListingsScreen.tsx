import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { ShopHeader } from '../../../components/layout/ShopHeader';
import {
  getShopThriftListingsApi,
  deleteThriftListingApi,
  updateThriftListingApi,
  ThriftListingItemApi,
} from '../../../services/thrift.api';
import { formatCurrency } from '../../../utils/formatCurrency';
import { normalizeImageUrl } from '../../../utils/imageUrl';

type ListingTab = 'ALL' | 'APPROVED' | 'PENDING' | 'HIDDEN' | 'SOLD';

const TABS: { key: ListingTab; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'APPROVED', label: 'Đang bán' },
  { key: 'PENDING', label: 'Chờ duyệt' },
  { key: 'HIDDEN', label: 'Đang ẩn' },
  { key: 'SOLD', label: 'Đã bán' },
];

export const ShopThriftListingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [listings, setListings] = useState<ThriftListingItemApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ListingTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadListings = useCallback(async () => {
    try {
      const res = await getShopThriftListingsApi();
      setListings(Array.isArray(res) ? res : []);
    } catch (err) {
      console.warn('Lỗi tải danh sách THRIFT của shop:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const onRefresh = () => {
    setRefreshing(true);
    loadListings();
  };

  const handleToggleHide = async (item: ThriftListingItemApi) => {
    const isCurrentlyHidden = item.status === 'HIDDEN';
    const nextStatus = isCurrentlyHidden ? 'APPROVED' : 'HIDDEN';
    try {
      await updateThriftListingApi(item._id, { status: nextStatus });
      setListings((prev) =>
        prev.map((l) => (l._id === item._id ? { ...l, status: nextStatus } : l))
      );
      Alert.alert(
        'Thành công',
        nextStatus === 'HIDDEN'
          ? `Đã ẩn bài đăng "${item.name || item.title}" khỏi sàn thanh lý.`
          : `Đã mở hiển thị bài đăng "${item.name || item.title}" trở lại trên sàn.`
      );
    } catch {
      Alert.alert('Lỗi', 'Không thể thay đổi trạng thái bài đăng lúc này.');
    }
  };

  const handleDelete = (item: ThriftListingItemApi) => {
    Alert.alert(
      'Xóa tin thanh lý',
      `Bạn có chắc chắn muốn xóa bài đăng "${item.name || item.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteThriftListingApi(item._id);
              Alert.alert('Thành công', 'Đã xóa tin đăng thanh lý.');
              setListings((prev) => prev.filter((l) => l._id !== item._id));
            } catch {
              Alert.alert('Lỗi', 'Không thể xóa tin đăng lúc này.');
            }
          },
        },
      ]
    );
  };

  const filteredListings = useMemo(() => {
    let list = [...listings];

    if (activeTab !== 'ALL') {
      if (activeTab === 'APPROVED') {
        list = list.filter((l) => l.status === 'APPROVED' && (l.quantity ?? 1) > 0);
      } else if (activeTab === 'PENDING') {
        list = list.filter((l) => l.status === 'PENDING_APPROVAL' || l.status === 'PENDING');
      } else if (activeTab === 'HIDDEN') {
        list = list.filter((l) => l.status === 'HIDDEN');
      } else if (activeTab === 'SOLD') {
        list = list.filter((l) => l.status === 'SOLD' || (l.quantity !== undefined && l.quantity <= 0));
      }
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((l) => {
        const title = (l.name || l.title || '').toLowerCase();
        return title.includes(q) || l._id.toLowerCase().includes(q);
      });
    }

    return list;
  }, [listings, activeTab, searchQuery]);

  return (
    <View style={styles.container}>
      <ShopHeader />

      {/* Search & Add */}
      <View style={styles.topBar}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#78736A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên món đồ..."
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

        <TouchableOpacity
          style={styles.createBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('CreateThriftListing')}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.createBtnText}>Đăng bán</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {TABS.map((t) => {
            const isActive = activeTab === t.key;
            let count = 0;
            if (t.key === 'ALL') count = listings.length;
            else if (t.key === 'APPROVED') count = listings.filter((l) => l.status === 'APPROVED' && (l.quantity ?? 1) > 0).length;
            else if (t.key === 'PENDING') count = listings.filter((l) => l.status === 'PENDING_APPROVAL' || l.status === 'PENDING').length;
            else if (t.key === 'HIDDEN') count = listings.filter((l) => l.status === 'HIDDEN').length;
            else if (t.key === 'SOLD') count = listings.filter((l) => l.status === 'SOLD' || (l.quantity !== undefined && l.quantity <= 0)).length;

            return (
              <TouchableOpacity
                key={t.key}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => setActiveTab(t.key)}
              >
                <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                  {t.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#1C1A18" />
          <Text style={styles.loadingText}>Đang tải danh sách đồ thanh lý...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredListings.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="tag" size={40} color="#D6D3D1" />
              <Text style={styles.emptyTitle}>Chưa có bài đăng thanh lý nào</Text>
              <Text style={styles.emptySub}>Bấm nút "Đăng bán" phía trên để niêm yết hiện vật THRIFT đầu tiên.</Text>
            </View>
          ) : (
            filteredListings.map((item) => {
              const title = item.name || item.title || 'Sản phẩm THRIFT';
              const price = Number(item.price) || 0;
              const img = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : '';
              const isSold = item.status === 'SOLD' || (item.quantity !== undefined && item.quantity <= 0);

              return (
                <View key={item._id} style={styles.listingCard}>
                  <View style={styles.cardTopRow}>
                    <Image source={{ uri: normalizeImageUrl(img) }} style={styles.thumbImg} />

                    <View style={styles.infoCol}>
                      <View style={styles.tagRow}>
                        <View style={styles.sourceTag}>
                          <Text style={styles.sourceTagText}>
                            {item.sourceType === 'FROM_RENTAL' ? 'TỪ RENT' : 'ĐỒ ĐÃ QUA SỬ DỤNG'}
                          </Text>
                        </View>
                        {item.status === 'HIDDEN' ? (
                          <View style={[styles.badge, styles.badgeGray]}>
                            <Text style={styles.badgeGrayText}>ĐANG ẨN</Text>
                          </View>
                        ) : isSold ? (
                          <View style={[styles.badge, styles.badgeGray]}>
                            <Text style={styles.badgeGrayText}>ĐÃ BÁN</Text>
                          </View>
                        ) : (
                          <View style={[styles.badge, styles.badgeGreen]}>
                            <Text style={styles.badgeGreenText}>ĐANG BÁN</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.listingTitle} numberOfLines={2}>{title}</Text>
                      <Text style={styles.conditionText}>
                        Tình trạng: {item.condition || 'Rất tốt (95%)'} · Kho: {item.quantity ?? 1} món
                      </Text>

                      <View style={styles.pricingRow}>
                        <Text style={styles.priceVal}>{formatCurrency(price)}</Text>
                        {item.originalPrice ? (
                          <Text style={styles.originalPriceVal}>{formatCurrency(Number(item.originalPrice))}</Text>
                        ) : null}
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.actionBtnSmall}
                      onPress={() => navigation.navigate('ShopThriftListingDetail', { id: item._id, listing: item })}
                    >
                      <Feather name="eye" size={13} color="#57534E" />
                      <Text style={styles.actionBtnTextSmall}>Chi tiết</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnSmall}
                      onPress={() => navigation.navigate('EditThriftListing', { id: item._id, listing: item })}
                    >
                      <Feather name="edit-2" size={13} color="#57534E" />
                      <Text style={styles.actionBtnTextSmall}>Sửa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnSmall}
                      onPress={() => handleToggleHide(item)}
                    >
                      <Feather name={item.status === 'HIDDEN' ? 'eye' : 'eye-off'} size={13} color="#57534E" />
                      <Text style={styles.actionBtnTextSmall}>{item.status === 'HIDDEN' ? 'Hiện' : 'Ẩn'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtnSmall, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
                      onPress={() => handleDelete(item)}
                    >
                      <Feather name="trash-2" size={13} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default ShopThriftListingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  topBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 42,
    borderWidth: 1,
    borderColor: '#EFECE6',
    gap: 6,
  },
  searchInput: { flex: 1, fontSize: 12, color: '#1C1A18' },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 4,
  },
  createBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  tabsWrap: { borderBottomWidth: 1, borderBottomColor: '#EBE5D8' },
  tabsScroll: { paddingHorizontal: 14, paddingVertical: 6, gap: 6 },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBE5D8',
  },
  tabBtnActive: { backgroundColor: '#1C1A18', borderColor: '#1C1A18' },
  tabBtnText: { fontSize: 11, fontWeight: '700', color: '#78736A' },
  tabBtnTextActive: { color: '#FAF7F2' },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  loadingText: { fontSize: 13, color: '#78736A' },
  listContent: { padding: 16, paddingBottom: 40 },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#EFECE6',
    marginTop: 20,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: '#1C1A18', marginTop: 6 },
  emptySub: { fontSize: 12, color: '#78736A', textAlign: 'center', lineHeight: 16 },
  listingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  cardTopRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  thumbImg: { width: 76, height: 76, borderRadius: 10, backgroundColor: '#F5F2EB' },
  infoCol: { flex: 1 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  sourceTag: {
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EBE5D8',
  },
  sourceTagText: { fontSize: 9, fontWeight: '800', color: '#78736A' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeGreen: { backgroundColor: '#DCFCE7' },
  badgeGreenText: { color: '#15803D', fontSize: 9, fontWeight: '800' },
  badgeGray: { backgroundColor: '#F5F5F4' },
  badgeGrayText: { color: '#78716C', fontSize: 9, fontWeight: '800' },
  listingTitle: { fontSize: 13, fontWeight: '700', color: '#1C1A18', lineHeight: 18 },
  conditionText: { fontSize: 11, color: '#78736A', marginTop: 2 },
  pricingRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 },
  priceVal: { fontSize: 14, fontWeight: '800', color: '#15803D' },
  originalPriceVal: { fontSize: 11, color: '#A8A29E', textDecorationLine: 'line-through' },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F2EB',
  },
  actionBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D6D3D1',
  },
  actionBtnTextSmall: { fontSize: 11, fontWeight: '700', color: '#57534E' },
});
