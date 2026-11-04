import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { ShopHeader } from '../../../components/layout/ShopHeader';
import { useShop } from '../../../context/ShopContext';
import { formatCurrency } from '../../../utils/formatCurrency';
import { normalizeImageUrl } from '../../../utils/imageUrl';

export interface SerializedUnit {
  id: string;
  serialNumber: string;
  sku: string;
  productName: string;
  category: string;
  coverImage: string;
  status: 'AVAILABLE' | 'RENTING' | 'MAINTENANCE' | 'ELIGIBLE_FOR_THRIFT';
  statusText: string;
  cycles: number;
  location: string;
  pricePerDay: number;
}

type TabType = 'ALL' | 'AVAILABLE' | 'RENTING' | 'MAINTENANCE' | 'ELIGIBLE_FOR_THRIFT';

const TABS: { key: TabType; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'AVAILABLE', label: 'Sẵn sàng' },
  { key: 'RENTING', label: 'Đang thuê' },
  { key: 'MAINTENANCE', label: 'Bảo dưỡng' },
  { key: 'ELIGIBLE_FOR_THRIFT', label: 'Đủ chuẩn THRIFT' },
];

export const InventoryDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { products, refreshProducts } = useShop();

  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProducts();
    setRefreshing(false);
  };

  // Sinh danh sách hiện vật từng máy (Serialized Inventory Units) theo dữ liệu thực từ MongoDB
  const serializedUnits: SerializedUnit[] = useMemo(() => {
    const list: SerializedUnit[] = [];

    products.forEach((p) => {
      const total = Number(p.totalUnits) || 1;
      const renting = Number(p.rentingUnits) || 0;
      const maintenance = Number(p.maintenanceUnits) || 0;

      for (let i = 1; i <= total; i++) {
        let status: SerializedUnit['status'] = 'AVAILABLE';
        let statusText = 'Sẵn sàng';

        if (i <= renting) {
          status = 'RENTING';
          statusText = 'Đang cho thuê';
        } else if (i <= renting + maintenance) {
          status = 'MAINTENANCE';
          statusText = 'Đang bảo dưỡng';
        } else if (i === total && total >= 3) {
          status = 'ELIGIBLE_FOR_THRIFT';
          statusText = 'Đủ chuẩn THRIFT';
        }

        const serialNumber = `#SN-${p.sku.slice(-4).toUpperCase()}-${String(i).padStart(3, '0')}`;
        list.push({
          id: `${p.sku}-${i}`,
          serialNumber,
          sku: p.sku,
          productName: p.name,
          category: p.category,
          coverImage: p.coverImage,
          status,
          statusText,
          cycles: (i * 4) + (status === 'RENTING' ? 1 : 0),
          location: p.location || 'Đà Nẵng',
          pricePerDay: p.pricePerDay || 0,
        });
      }
    });

    return list;
  }, [products]);

  const filteredUnits = useMemo(() => {
    let list = [...serializedUnits];
    if (activeTab !== 'ALL') {
      list = list.filter((u) => u.status === activeTab);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          u.productName.toLowerCase().includes(q) ||
          u.serialNumber.toLowerCase().includes(q) ||
          u.sku.toLowerCase().includes(q)
      );
    }
    return list;
  }, [serializedUnits, activeTab, searchQuery]);

  const renderStatusBadge = (status: SerializedUnit['status'], text: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <View style={[styles.badge, styles.badgeGreen]}><Text style={styles.badgeGreenText}>{text}</Text></View>;
      case 'RENTING':
        return <View style={[styles.badge, styles.badgeOrange]}><Text style={styles.badgeOrangeText}>{text}</Text></View>;
      case 'MAINTENANCE':
        return <View style={[styles.badge, styles.badgeGray]}><Text style={styles.badgeGrayText}>{text}</Text></View>;
      case 'ELIGIBLE_FOR_THRIFT':
        return <View style={[styles.badge, styles.badgePurple]}><Text style={styles.badgePurpleText}>{text}</Text></View>;
    }
  };

  return (
    <View style={styles.container}>
      <ShopHeader title="Kho hiện vật cá thể" />

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#78736A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo Serial, tên máy, SKU..."
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

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {TABS.map((t) => {
            const isActive = activeTab === t.key;
            const count = t.key === 'ALL' ? serializedUnits.length : serializedUnits.filter((u) => u.status === t.key).length;
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

      {/* Units List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredUnits.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="package" size={40} color="#D6D3D1" />
            <Text style={styles.emptyTitle}>Không có hiện vật phù hợp</Text>
          </View>
        ) : (
          filteredUnits.map((u) => (
            <View key={u.id} style={styles.unitCard}>
              <View style={styles.cardTop}>
                <View style={styles.serialBox}>
                  <Text style={styles.serialText}>{u.serialNumber}</Text>
                  <Text style={styles.skuText}>SKU: #{u.sku}</Text>
                </View>
                {renderStatusBadge(u.status, u.statusText)}
              </View>

              <View style={styles.unitBody}>
                <Image
                  source={{ uri: normalizeImageUrl(u.coverImage) }}
                  style={styles.unitThumb}
                />
                <View style={styles.unitInfoCol}>
                  <Text style={styles.unitTitle} numberOfLines={2}>{u.productName}</Text>
                  <Text style={styles.unitSub}>{u.category} · Chi nhánh {u.location}</Text>
                  <Text style={styles.unitCycles}>
                    Đã hoàn tất <Text style={{ fontWeight: '800', color: '#1C1A18' }}>{u.cycles} chu kỳ thuê</Text>
                  </Text>
                  <Text style={styles.unitPrice}>
                    Định mức: {formatCurrency(u.pricePerDay)} / ngày
                  </Text>
                </View>
              </View>

              <View style={styles.unitActionsRow}>
                <TouchableOpacity
                  style={styles.btnSecondary}
                  onPress={() => navigation.navigate('RentInventoryDetail', { id: u.id, unit: u })}
                >
                  <Text style={styles.btnSecondaryText}>Sổ nhật ký</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnThrift}
                  onPress={() => navigation.navigate('ConvertToThrift', { id: u.sku, serial: u.serialNumber })}
                >
                  <Feather name="repeat" size={13} color="#7E22CE" />
                  <Text style={styles.btnThriftText}>Chuyển sang THRIFT</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default InventoryDashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  searchWrap: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
  searchBar: {
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
  emptyTitle: { fontSize: 14, fontWeight: '700', color: '#78736A' },
  unitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F2EB',
  },
  serialBox: { gap: 2 },
  serialText: { fontSize: 13, fontWeight: '800', color: '#1C1A18' },
  skuText: { fontSize: 10, color: '#78736A' },
  unitBody: { flexDirection: 'row', gap: 12, paddingVertical: 10 },
  unitThumb: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#F5F2EB' },
  unitInfoCol: { flex: 1 },
  unitTitle: { fontSize: 13, fontWeight: '700', color: '#1C1A18', lineHeight: 18 },
  unitSub: { fontSize: 11, color: '#78736A', marginTop: 2 },
  unitCycles: { fontSize: 11, color: '#57534E', marginTop: 2 },
  unitPrice: { fontSize: 11, color: '#15803D', fontWeight: '700', marginTop: 3 },
  unitActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F2EB',
  },
  btnSecondary: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D6D3D1',
  },
  btnSecondaryText: { fontSize: 11, fontWeight: '700', color: '#57534E' },
  btnThrift: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#D8B4FE',
  },
  btnThriftText: { fontSize: 11, fontWeight: '700', color: '#7E22CE' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeGreen: { backgroundColor: '#DCFCE7' },
  badgeGreenText: { color: '#15803D', fontSize: 10, fontWeight: '700' },
  badgeOrange: { backgroundColor: '#FFEDD5' },
  badgeOrangeText: { color: '#EA580C', fontSize: 10, fontWeight: '700' },
  badgeGray: { backgroundColor: '#F5F5F4' },
  badgeGrayText: { color: '#78716C', fontSize: 10, fontWeight: '700' },
  badgePurple: { backgroundColor: '#FAF5FF' },
  badgePurpleText: { color: '#7E22CE', fontSize: 10, fontWeight: '700' },
});
