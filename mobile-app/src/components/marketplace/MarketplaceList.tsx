import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppHeader } from '../layout/AppHeader';
import { GuestAuthModal } from '../common/GuestAuthModal';
import { MarketplaceCard } from './MarketplaceCard';
import { useAuth } from '../../hooks/useAuth';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { getPublicRentProductsApi } from '../../services/rentProduct.api';
import { getPublicThriftListingsApi } from '../../services/thrift.api';
import { getCategoriesApi, CategoryItem } from '../../services/category.api';
import { mapRentItem, mapThriftItem, MarketItem } from '../../utils/marketplaceMapper';

type SortKey = 'new' | 'price-asc' | 'price-desc';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'new', label: 'Mới nhất' },
  { key: 'price-asc', label: 'Giá tăng dần' },
  { key: 'price-desc', label: 'Giá giảm dần' },
];

interface Props {
  mode: 'rent' | 'thrift';
}

export const MarketplaceList: React.FC<Props> = ({ mode }) => {
  const isRent = mode === 'rent';
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { toggleWishlist, isWishlisted } = useCartWishlist();

  const [items, setItems] = useState<MarketItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('new');
  const [selectedSlug, setSelectedSlug] = useState<string>(route.params?.category || 'all');
  const [guestVisible, setGuestVisible] = useState(false);

  const load = useCallback(async () => {
    try {
      const [raw, cats] = await Promise.all([
        isRent ? getPublicRentProductsApi({ limit: 500 }) : getPublicThriftListingsApi(),
        getCategoriesApi(),
      ]);
      const list = (raw as any[]).map((r, i) => (isRent ? mapRentItem(r, i) : mapThriftItem(r, i)));
      setItems(list);
      setCategories(cats);
      setFailed(list.length === 0);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isRent]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (route.params?.category) setSelectedSlug(route.params.category);
  }, [route.params?.category]);

  // Chip danh mục lấy từ DB, chỉ giữ danh mục thuộc loại hiện tại và đếm theo dữ liệu thật
  const chips = useMemo(() => {
    const wantType = isRent ? 'RENT' : 'THRIFT';
    const base = categories
      .filter((c) => !c.type || c.type === 'BOTH' || c.type === wantType)
      .map((c) => ({
        slug: c.slug,
        label: c.name,
        count: items.filter((it) => it.categoryId === c._id || it.category === c.name).length,
      }))
      .filter((c) => c.count > 0);
    return [{ slug: 'all', label: 'Tất cả', count: items.length }, ...base];
  }, [categories, items, isRent]);

  const visible = useMemo(() => {
    let list = [...items];
    if (selectedSlug !== 'all') {
      const cat = categories.find((c) => c.slug === selectedSlug);
      list = list.filter((it) =>
        cat ? it.categoryId === cat._id || it.category === cat.name : it.categorySlug === selectedSlug
      );
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          it.category.toLowerCase().includes(q) ||
          it.location.toLowerCase().includes(q)
      );
    }
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [items, categories, selectedSlug, query, sort]);

  const openDetail = (it: MarketItem) =>
    navigation.navigate(isRent ? 'RentProductDetail' : 'ThriftDetail', {
      productId: it.id,
      product: it,
    });

  const onWishlist = (it: MarketItem) => {
    if (!user) {
      setGuestVisible(true);
      return;
    }
    toggleWishlist(it.id, isRent ? 'RENT' : 'THRIFT');
  };

  const header = (
    <View>
      <View style={styles.hero}>
        <View style={styles.heroPill}>
          <Text style={styles.heroPillText}>
            {isRent ? 'RENT MARKETPLACE · KHO ĐỒ CHO THUÊ' : 'THRIFT MARKETPLACE · KHO ĐỒ TUYỂN CHỌN'}
          </Text>
        </View>
        <Text style={styles.heroTitle}>
          {isRent ? 'Thuê những gì bạn cần' : 'Đồ cũ, giá trị mới'}
        </Text>
        <Text style={styles.heroSub}>
          {isRent
            ? 'Thuê trang phục, máy ảnh và thiết bị đã qua kiểm định, đặt cọc an toàn qua Smart Escrow.'
            : 'Sở hữu đồ đã qua sử dụng chất lượng được chứng thực. Tiết kiệm chi tiêu và giảm rác thải.'}
        </Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{items.length}</Text>
            <Text style={styles.statLabel}>{isRent ? 'Sản phẩm cho thuê' : 'Món đồ đang bán'}</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{Math.max(chips.length - 1, 0)}</Text>
            <Text style={styles.statLabel}>Danh mục</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>100%</Text>
            <Text style={styles.statLabel}>Kiểm định</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#78736A" />
          <TextInput
            style={styles.searchInput}
            placeholder={isRent ? 'Tìm máy ảnh, đầm dạ hội, giày...' : 'Tìm quần áo, camera, phụ kiện...'}
            placeholderTextColor="#A8A29E"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Feather name="x" size={16} color="#78736A" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {chips.map((c) => {
          const on = selectedSlug === c.slug;
          return (
            <TouchableOpacity
              key={c.slug}
              onPress={() => setSelectedSlug(c.slug)}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>
                {c.label} ({c.count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.sortRow}>
        <Text style={styles.resultText}>
          Hiển thị <Text style={styles.resultNum}>{visible.length}</Text> / {items.length} sản phẩm
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortChips}>
        {SORTS.map((s) => (
          <TouchableOpacity
            key={s.key}
            onPress={() => setSort(s.key)}
            style={[styles.sortChip, sort === s.key && styles.sortChipOn]}
          >
            <Text style={[styles.sortText, sort === s.key && styles.sortTextOn]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader title={isRent ? 'Rent Marketplace' : 'Thrift Marketplace'} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1C1A18" />
          <Text style={styles.centerText}>Đang tải sản phẩm từ máy chủ...</Text>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(it) => it.id}
          numColumns={2}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.list}
          ListHeaderComponent={header}
          renderItem={({ item }) => (
            <MarketplaceCard
              item={item}
              wished={isWishlisted(item.id)}
              onPress={() => openDetail(item)}
              onToggleWishlist={() => onWishlist(item)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor="#1C1A18"
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Feather name={failed ? 'wifi-off' : 'inbox'} size={44} color="#D6D3D1" />
              <Text style={styles.emptyTitle}>
                {failed ? 'Không tải được dữ liệu' : 'Không tìm thấy sản phẩm phù hợp'}
              </Text>
              <Text style={styles.centerText}>
                {failed
                  ? 'Kiểm tra backend đang chạy và kết nối mạng, rồi thử lại.'
                  : 'Thử từ khóa hoặc danh mục khác.'}
              </Text>
              {failed && (
                <TouchableOpacity
                  style={styles.retry}
                  onPress={() => {
                    setLoading(true);
                    load();
                  }}
                >
                  <Text style={styles.retryText}>THỬ LẠI</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      <GuestAuthModal
        visible={guestVisible}
        onClose={() => setGuestVisible(false)}
        actionText="lưu sản phẩm vào danh sách yêu thích"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF9F5' },
  list: { paddingBottom: 40 },
  column: { justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 14 },
  hero: {
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE5D8',
  },
  heroPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3EFE6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  heroPillText: { fontSize: 9, fontWeight: '800', color: '#78736A', letterSpacing: 0.5 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#1C1A18', lineHeight: 32 },
  heroSub: { fontSize: 12, color: '#5E5A53', lineHeight: 18, marginTop: 6 },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#EBE5D8',
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '800', color: '#1C1A18' },
  statLabel: { fontSize: 10, color: '#78736A', marginTop: 2, textAlign: 'center' },
  statDiv: { width: 1, height: 24, backgroundColor: '#EBE5D8' },
  searchRow: { paddingHorizontal: 16, paddingTop: 14 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#1C1A18', paddingVertical: 0 },
  chipRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E7E2DA',
  },
  chipOn: { backgroundColor: '#1C1A18', borderColor: '#1C1A18' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#5E5A53' },
  chipTextOn: { color: '#fff', fontWeight: '800' },
  sortRow: { paddingHorizontal: 16, paddingBottom: 6 },
  resultText: { fontSize: 12, color: '#78736A' },
  resultNum: { fontWeight: '800', color: '#1C1A18' },
  sortChips: { paddingHorizontal: 16, paddingBottom: 14, gap: 8 },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F4F0EA',
  },
  sortChipOn: { backgroundColor: '#E4DDD3' },
  sortText: { fontSize: 11, color: '#78736A', fontWeight: '600' },
  sortTextOn: { color: '#1C1A18', fontWeight: '800' },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 70, paddingHorizontal: 32 },
  centerText: { fontSize: 12, color: '#78736A', textAlign: 'center', marginTop: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: '#1C1A18', marginTop: 14 },
  retry: {
    marginTop: 16,
    backgroundColor: '#1C1A18',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 11,
  },
  retryText: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
});

