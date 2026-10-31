import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';
import { getCategoriesApi, CategoryItem } from '../../services/category.api';
import { normalizeImageUrl } from '../../utils/imageUrl';

type Filter = 'all' | 'rent' | 'thrift';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tất cả danh mục' },
  { key: 'rent', label: 'Sản phẩm RENT' },
  { key: 'thrift', label: 'Sản phẩm THRIFT' },
];

export const CategoryMarketplaceScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    const list = await getCategoriesApi();
    setCategories(list);
    setFailed(list.length === 0);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories.filter((c) => {
      if (c.isActive === false) return false;
      if (filter === 'rent' && !(c.rentCount && c.rentCount > 0)) return false;
      if (filter === 'thrift' && !(c.thriftCount && c.thriftCount > 0)) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.subtitle || '').toLowerCase().includes(q) ||
        (c.code || '').toLowerCase().includes(q)
      );
    });
  }, [categories, filter, query]);

  const totalRent = categories.reduce((s, c) => s + (c.rentCount || 0), 0);
  const totalThrift = categories.reduce((s, c) => s + (c.thriftCount || 0), 0);

  const goRent = (slug: string) => navigation.navigate('RentTab', { category: slug });
  const goThrift = (slug: string) => navigation.navigate('ThriftTab', { category: slug });

  return (
    <View style={styles.container}>
      <AppHeader title="Danh Mục Tuyển Chọn" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1C1A18" />
          <Text style={styles.centerText}>Đang tải danh mục...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
        >
          <View style={styles.hero}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>CIRCULAR ARCHIVE · DANH MỤC TUẦN HOÀN</Text>
            </View>
            <Text style={styles.heroTitle}>Bộ sưu tập lưu trữ tuần hoàn</Text>
            <Text style={styles.heroSub}>
              Khám phá các phân hệ thiết bị &amp; trang phục tuyển chọn, được bảo quản theo tiêu chuẩn
              kiểm định nghiêm ngặt.
            </Text>
            <View style={styles.metrics}>
              <View style={styles.metric}>
                <Text style={styles.metricNum}>{categories.length}</Text>
                <Text style={styles.metricLabel}>Danh mục</Text>
              </View>
              <View style={styles.metricDiv} />
              <View style={styles.metric}>
                <Text style={styles.metricNum}>{totalRent}</Text>
                <Text style={styles.metricLabel}>Đồ cho thuê</Text>
              </View>
              <View style={styles.metricDiv} />
              <View style={styles.metric}>
                <Text style={styles.metricNum}>{totalThrift}</Text>
                <Text style={styles.metricLabel}>Đồ thanh lý</Text>
              </View>
            </View>
          </View>

          <View style={styles.searchWrap}>
            <View style={styles.searchBar}>
              <Feather name="search" size={16} color="#78736A" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm danh mục, mã CAT..."
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
            contentContainerStyle={styles.filters}
          >
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.filterChip, filter === f.key && styles.filterChipOn]}
              >
                <Text style={[styles.filterText, filter === f.key && styles.filterTextOn]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {visible.length === 0 ? (
            <View style={styles.center}>
              <Feather name={failed ? 'wifi-off' : 'inbox'} size={44} color="#D6D3D1" />
              <Text style={styles.emptyTitle}>
                {failed ? 'Không tải được danh mục' : 'Không có danh mục phù hợp'}
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
          ) : (
            visible.map((cat) => {
              const rentCount = cat.rentCount || 0;
              const thriftCount = cat.thriftCount || 0;
              return (
                <View key={cat._id} style={styles.card}>
                  <View style={styles.imgWrap}>
                    <Image
                      source={{ uri: normalizeImageUrl(cat.image) }}
                      style={styles.img}
                      resizeMode="cover"
                    />
                    <View style={styles.codePill}>
                      <Text style={styles.codeText}>{cat.code || 'CAT'}</Text>
                    </View>
                  </View>
                  <View style={styles.body}>
                    <Text style={styles.name}>{cat.name}</Text>
                    {cat.subtitle ? <Text style={styles.subtitle}>{cat.subtitle}</Text> : null}
                    {cat.description ? (
                      <Text style={styles.desc} numberOfLines={3}>
                        {cat.description}
                      </Text>
                    ) : null}

                    <View style={styles.badges}>
                      <View style={styles.badgeLine}>
                        <Ionicons name="shield-checkmark" size={13} color="#047857" />
                        <Text style={styles.badgeLineText} numberOfLines={1}>
                          {cat.inspectionBadge || '100% Kiểm định chất lượng'}
                        </Text>
                      </View>
                      <View style={styles.badgeLine}>
                        <Ionicons name="lock-closed" size={13} color="#B45309" />
                        <Text style={styles.badgeLineText} numberOfLines={1}>
                          {cat.escrowBadge || 'Smart Escrow bảo chứng cọc 100%'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionRent, rentCount === 0 && styles.actionOff]}
                        disabled={rentCount === 0}
                        onPress={() => goRent(cat.slug)}
                      >
                        <Text style={styles.actionRentText}>Đồ thuê ({rentCount})</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionThrift, thriftCount === 0 && styles.actionOff]}
                        disabled={thriftCount === 0}
                        onPress={() => goThrift(cat.slug)}
                      >
                        <Text style={styles.actionThriftText}>Đồ mua ({thriftCount})</Text>
                      </TouchableOpacity>
                    </View>
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

export default CategoryMarketplaceScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF9F5' },
  scroll: { paddingBottom: 40 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 70, paddingHorizontal: 32 },
  centerText: { fontSize: 12, color: '#78736A', marginTop: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: '#1C1A18', marginTop: 14 },
  retry: {
    marginTop: 16,
    backgroundColor: '#1C1A18',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 11,
  },
  retryText: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
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
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#EBE5D8',
  },
  metric: { flex: 1, alignItems: 'center' },
  metricNum: { fontSize: 18, fontWeight: '800', color: '#1C1A18' },
  metricLabel: { fontSize: 10, color: '#78736A', marginTop: 2 },
  metricDiv: { width: 1, height: 24, backgroundColor: '#EBE5D8' },
  searchWrap: { paddingHorizontal: 16, paddingTop: 14 },
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
  filters: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E7E2DA',
  },
  filterChipOn: { backgroundColor: '#1C1A18', borderColor: '#1C1A18' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#5E5A53' },
  filterTextOn: { color: '#fff', fontWeight: '800' },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    overflow: 'hidden',
  },
  imgWrap: { height: 180, backgroundColor: '#F4F0EA' },
  img: { width: '100%', height: '100%' },
  codePill: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  codeText: { fontSize: 10, fontWeight: '800', color: '#1C1A18', letterSpacing: 0.5 },
  body: { padding: 16 },
  name: { fontSize: 20, fontWeight: '800', color: '#1C1A18' },
  subtitle: { fontSize: 11, color: '#78736A', marginTop: 3, fontWeight: '600' },
  desc: { fontSize: 12, color: '#5E5A53', lineHeight: 18, marginTop: 8 },
  badges: { gap: 6, marginTop: 12 },
  badgeLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgeLineText: { flex: 1, fontSize: 11, color: '#5E5A53' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  actionBtn: { flex: 1, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  actionRent: { backgroundColor: '#1C1A18' },
  actionThrift: { backgroundColor: '#F4F0EA', borderWidth: 1, borderColor: '#E7E2DA' },
  actionOff: { opacity: 0.35 },
  actionRentText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  actionThriftText: { color: '#1C1A18', fontSize: 12, fontWeight: '800' },
});
