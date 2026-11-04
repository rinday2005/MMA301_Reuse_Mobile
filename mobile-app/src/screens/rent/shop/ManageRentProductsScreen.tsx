import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { ShopHeader } from '../../../components/layout/ShopHeader';
import { useShop, ShopProductItem } from '../../../context/ShopContext';
import { formatCurrency } from '../../../utils/formatCurrency';
import { normalizeImageUrl } from '../../../utils/imageUrl';

type StatusFilter = 'ALL' | 'READY' | 'RENTING' | 'PENDING' | 'HIDDEN';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'READY', label: 'Sẵn sàng' },
  { key: 'RENTING', label: 'Đang thuê' },
  { key: 'PENDING', label: 'Chờ duyệt' },
  { key: 'HIDDEN', label: 'Đang ẩn' },
];

export const ManageRentProductsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { products, refreshProducts, toggleVisibility, deleteProduct } = useShop();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProducts();
    setRefreshing(false);
  };

  const handleToggleHide = async (sku: string, currentVisible: boolean) => {
    try {
      await toggleVisibility(sku);
      Alert.alert(
        'Thành công',
        currentVisible
          ? `Đã ẩn sản phẩm ${sku} khỏi sàn tìm kiếm công khai.`
          : `Đã mở hiển thị sản phẩm ${sku} trở lại trên sàn.`
      );
    } catch {
      Alert.alert('Lỗi', 'Không thể thay đổi trạng thái hiển thị.');
    }
  };

  const handleDelete = (item: ShopProductItem) => {
    Alert.alert(
      'Xóa sản phẩm',
      `Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm "${item.name}" (SKU: ${item.sku})? Hành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(item.sku);
              Alert.alert('Thành công', `Đã xóa sản phẩm ${item.sku}.`);
            } catch {
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm lúc này.');
            }
          },
        },
      ]
    );
  };

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'READY') {
        list = list.filter((p) => p.isVisible !== false && (p.readyUnits || 0) > 0);
      } else if (statusFilter === 'RENTING') {
        list = list.filter((p) => (p.rentingUnits || 0) > 0);
      } else if (statusFilter === 'PENDING') {
        list = list.filter((p) => p.approvalStatus === 'PENDING' || p.approvalStatus === 'PENDING_APPROVAL');
      } else if (statusFilter === 'HIDDEN') {
        list = list.filter((p) => p.isVisible === false);
      }
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [products, statusFilter, searchQuery]);

  return (
    <View style={styles.container}>
      <ShopHeader title="Sản phẩm cho thuê RENT" />

      {/* Header Search & Create */}
      <View style={styles.topBar}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#78736A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên thiết bị, SKU..."
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
          onPress={() => navigation.navigate('CreateRentProduct')}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.createBtnText}>Thêm món mới</Text>
        </TouchableOpacity>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {STATUS_FILTERS.map((f) => {
            const isActive = statusFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => setStatusFilter(f.key)}
              >
                <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Product List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="layers" size={40} color="#D6D3D1" />
            <Text style={styles.emptyTitle}>Chưa có sản phẩm cho thuê nào</Text>
            <Text style={styles.emptySub}>Bấm nút "Thêm món mới" phía trên để niêm yết thiết bị hoặc trang phục đầu tiên.</Text>
          </View>
        ) : (
          filteredProducts.map((p) => {
            const isApproved = p.approvalStatus === 'APPROVED';
            const isVisible = p.isVisible !== false;

            return (
              <View key={p.sku} style={styles.productCard}>
                <View style={styles.cardTopRow}>
                  <Image
                    source={{
                      uri: normalizeImageUrl(
                        p.coverImage || p.inspectionImages?.[0] || ''
                      ),
                    }}
                    style={styles.thumbImg}
                  />

                  <View style={styles.infoCol}>
                    <View style={styles.skuRow}>
                      <Text style={styles.skuText}>#{p.sku}</Text>
                      {isApproved ? (
                        <View style={[styles.badge, styles.badgeGreen]}>
                          <Text style={styles.badgeGreenText}>Đã duyệt</Text>
                        </View>
                      ) : (
                        <View style={[styles.badge, styles.badgeOrange]}>
                          <Text style={styles.badgeOrangeText}>Chờ duyệt</Text>
                        </View>
                      )}
                      {!isVisible && (
                        <View style={[styles.badge, styles.badgeGray]}>
                          <Text style={styles.badgeGrayText}>Đang ẩn</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.productTitle} numberOfLines={2}>{p.name}</Text>
                    <Text style={styles.categoryLabel}>{p.category} · {p.location || 'Toàn quốc'}</Text>

                    <View style={styles.pricingRow}>
                      <Text style={styles.pricePerDay}>{formatCurrency(p.pricePerDay)}/ngày</Text>
                      <Text style={styles.depositText}>Cọc: {formatCurrency(p.deposit)}</Text>
                    </View>
                  </View>
                </View>

                {/* Units Status Bar */}
                <View style={styles.unitsBar}>
                  <View style={styles.unitCol}>
                    <Text style={styles.unitNum}>{p.totalUnits || 1}</Text>
                    <Text style={styles.unitLbl}>Số lượng</Text>
                  </View>
                  <View style={styles.unitDiv} />
                  <View style={styles.unitCol}>
                    <Text style={[styles.unitNum, { color: '#15803D' }]}>{p.readyUnits || 0}</Text>
                    <Text style={styles.unitLbl}>Sẵn sàng</Text>
                  </View>
                  <View style={styles.unitDiv} />
                  <View style={styles.unitCol}>
                    <Text style={[styles.unitNum, { color: '#EA580C' }]}>{p.rentingUnits || 0}</Text>
                    <Text style={styles.unitLbl}>Đang cho thuê</Text>
                  </View>
                  <View style={styles.unitDiv} />
                  <View style={styles.unitCol}>
                    <Text style={[styles.unitNum, { color: '#78736A' }]}>{p.maintenanceUnits || 0}</Text>
                    <Text style={styles.unitLbl}>Bảo dưỡng</Text>
                  </View>
                </View>

                {/* Card Actions */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.actionBtnSmall}
                    onPress={() => navigation.navigate('ShopRentProductDetail', { id: p.sku })}
                  >
                    <Feather name="eye" size={13} color="#57534E" />
                    <Text style={styles.actionBtnTextSmall}>Chi tiết</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnSmall}
                    onPress={() => navigation.navigate('EditRentProduct', { id: p.sku })}
                  >
                    <Feather name="edit-2" size={13} color="#57534E" />
                    <Text style={styles.actionBtnTextSmall}>Sửa</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnSmall}
                    onPress={() => handleToggleHide(p.sku, isVisible)}
                  >
                    <Feather name={isVisible ? 'eye-off' : 'eye'} size={13} color="#57534E" />
                    <Text style={styles.actionBtnTextSmall}>{isVisible ? 'Ẩn' : 'Hiện'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtnSmall, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
                    onPress={() => handleDelete(p)}
                  >
                    <Feather name="trash-2" size={13} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default ManageRentProductsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
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
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#1C1A18',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1A18',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 4,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tabsWrap: {
    borderBottomWidth: 1,
    borderBottomColor: '#EBE5D8',
    backgroundColor: '#FAF7F2',
  },
  tabsScroll: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBE5D8',
  },
  tabBtnActive: {
    backgroundColor: '#1C1A18',
    borderColor: '#1C1A18',
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78736A',
  },
  tabBtnTextActive: {
    color: '#FAF7F2',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
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
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1A18',
    marginTop: 6,
  },
  emptySub: {
    fontSize: 12,
    color: '#78736A',
    textAlign: 'center',
    lineHeight: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFECE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  thumbImg: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#F5F2EB',
  },
  infoCol: {
    flex: 1,
  },
  skuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  skuText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#78736A',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
    lineHeight: 18,
  },
  categoryLabel: {
    fontSize: 11,
    color: '#78736A',
    marginTop: 2,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  pricePerDay: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  depositText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  unitsBar: {
    flexDirection: 'row',
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  unitCol: {
    flex: 1,
    alignItems: 'center',
  },
  unitDiv: {
    width: 1,
    height: 18,
    backgroundColor: '#EBE5D8',
  },
  unitNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1A18',
  },
  unitLbl: {
    fontSize: 9,
    color: '#78736A',
    marginTop: 1,
  },
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
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D6D3D1',
  },
  actionBtnTextSmall: {
    fontSize: 11,
    fontWeight: '700',
    color: '#57534E',
  },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeGreen: { backgroundColor: '#DCFCE7' },
  badgeGreenText: { color: '#15803D', fontSize: 9, fontWeight: '700' },
  badgeOrange: { backgroundColor: '#FFEDD5' },
  badgeOrangeText: { color: '#EA580C', fontSize: 9, fontWeight: '700' },
  badgeGray: { backgroundColor: '#F5F5F4' },
  badgeGrayText: { color: '#78716C', fontSize: 9, fontWeight: '700' },
});
