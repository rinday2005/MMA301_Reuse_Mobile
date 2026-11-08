import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';
import { useAuth } from '../../hooks/useAuth';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { normalizeImageUrl } from '../../utils/imageUrl';
import { getWishlistApi } from '../../services/wishlist.api';
import {
  resolveWishlistProduct,
  registerWishlistProduct,
  type ResolvedWishlistProduct,
} from '../../services/wishlistProductResolver';

interface WishlistItemDisplay {
  id: string;
  title: string;
  price: number;
  image: string;
  type: 'RENT' | 'THRIFT';
  deposit?: number;
  category: string;
  location?: string;
  condition?: string;
}

export const WishlistScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { wishlist, wishlistCount, toggleWishlist, addToCart } = useCartWishlist();

  const isGuest = !user;
  const [filterType, setFilterType] = useState<'ALL' | 'RENT' | 'THRIFT'>('ALL');
  const [serverLoadedItems, setServerLoadedItems] = useState<Record<string, WishlistItemDisplay>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Tải danh sách chi tiết từ Server Wishlist nếu đã đăng nhập
  const fetchServerWishlist = useCallback(async () => {
    try {
      if (!user) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
      const data = await getWishlistApi();
      if (data && Array.isArray(data.items)) {
        const itemMap: Record<string, WishlistItemDisplay> = {};
        for (const it of data.items) {
          const rawProd = (it as any).item || (it as any).product || it.productId;
          const pId =
            typeof rawProd === 'object' && rawProd?._id
              ? String(rawProd._id)
              : typeof it.productId === 'object' && (it.productId as any)?._id
              ? String((it.productId as any)._id)
              : String(it.productId || (it as any).itemId || '');

          if (!pId) continue;

          const isThrift = it.productType === 'THRIFT' || (it as any).itemType === 'THRIFT';
          let title = `Sản phẩm #${pId.slice(-6)}`;
          let price = 0;
          let deposit: number | undefined = undefined;
          let image = '';
          let category = isThrift ? 'Đồ thanh lý' : 'Đồ cho thuê';
          let location = 'Toàn quốc';
          let condition = 'Grade A';

          if (typeof rawProd === 'object' && rawProd) {
            title = rawProd.name || rawProd.title || title;
            price =
              typeof rawProd.pricePerDay === 'number'
                ? rawProd.pricePerDay
                : typeof rawProd.price === 'number'
                ? rawProd.price
                : 0;
            if (typeof rawProd.depositAmount === 'number') {
              deposit = rawProd.depositAmount;
            }
            if (Array.isArray(rawProd.images) && rawProd.images.length > 0) {
              image = rawProd.images[0];
            } else if (typeof rawProd.image === 'string') {
              image = rawProd.image;
            }
            category =
              (typeof rawProd.categoryId === 'object' && rawProd.categoryId?.name) ||
              rawProd.category ||
              category;
            location = rawProd.location || location;
            condition = rawProd.condition || condition;

            // Đăng ký vào resolver cache
            registerWishlistProduct({
              id: pId,
              title,
              price,
              deposit: deposit || 0,
              image,
              mode: isThrift ? 'thrift' : 'rent',
              category,
              location,
              gradeBadge: condition,
            });
          }

          itemMap[pId] = {
            id: pId,
            title,
            price,
            image,
            type: isThrift ? 'THRIFT' : 'RENT',
            deposit,
            category,
            location,
            condition,
          };
        }
        setServerLoadedItems(itemMap);
      }
    } catch (e) {
      console.warn('Lỗi tải chi tiết wishlist:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchServerWishlist();
  }, [fetchServerWishlist]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchServerWishlist();
  };

  // Ghép nối danh sách wishlist ID với thông tin thực tế
  const allWishlistedProducts: WishlistItemDisplay[] = useMemo(() => {
    return wishlist.map((id) => {
      if (serverLoadedItems[id]) {
        return serverLoadedItems[id];
      }
      const resolved = resolveWishlistProduct(id);
      if (resolved) {
        return {
          id,
          title: resolved.title,
          price: resolved.price,
          image: resolved.image,
          type: resolved.mode === 'thrift' ? 'THRIFT' : 'RENT',
          deposit: resolved.deposit,
          category: resolved.categoryLabel || resolved.category,
          location: resolved.location,
          condition: resolved.gradeBadge,
        };
      }
      return {
        id,
        title: `Sản phẩm #${id.slice(-6)}`,
        price: 0,
        image: '',
        type: 'RENT',
        deposit: 0,
        category: 'Sản phẩm',
        location: 'Toàn quốc',
        condition: 'Grade A',
      };
    });
  }, [wishlist, serverLoadedItems]);

  const rentCount = useMemo(
    () => allWishlistedProducts.filter((p) => p.type === 'RENT').length,
    [allWishlistedProducts]
  );
  const thriftCount = useMemo(
    () => allWishlistedProducts.filter((p) => p.type === 'THRIFT').length,
    [allWishlistedProducts]
  );

  const displayedProducts = useMemo(() => {
    if (filterType === 'RENT') {
      return allWishlistedProducts.filter((p) => p.type === 'RENT');
    }
    if (filterType === 'THRIFT') {
      return allWishlistedProducts.filter((p) => p.type === 'THRIFT');
    }
    return allWishlistedProducts;
  }, [allWishlistedProducts, filterType]);

  const handleOpenDetail = (item: WishlistItemDisplay) => {
    if (item.type === 'RENT') {
      navigation.navigate('RentProductDetail', {
        productId: item.id,
        product: {
          id: item.id,
          title: item.title,
          name: item.title,
          price: item.price,
          pricePerDay: item.price,
          deposit: item.deposit,
          depositAmount: item.deposit,
          image: item.image,
          category: item.category,
          location: item.location,
        },
      });
    } else {
      navigation.navigate('ThriftDetail', {
        productId: item.id,
        product: {
          id: item.id,
          title: item.title,
          price: item.price,
          image: item.image,
          category: item.category,
          location: item.location,
          conditionLabel: item.condition,
        },
      });
    }
  };

  const handleMoveToCart = (item: WishlistItemDisplay) => {
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      mode: item.type === 'RENT' ? 'rent' : 'thrift',
      deposit: item.deposit,
    });
    toggleWishlist(item.id, item.type);
    navigation.navigate('Cart');
  };

  const handleRemove = (item: WishlistItemDisplay) => {
    toggleWishlist(item.id, item.type);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Danh Sách Yêu Thích" showBack />

      {/* Filter Tabs */}
      {wishlist.length > 0 && (
        <View style={styles.tabsBar}>
          <TouchableOpacity
            style={[styles.tabBtn, filterType === 'ALL' && styles.tabBtnActive]}
            onPress={() => setFilterType('ALL')}
          >
            <Text style={[styles.tabText, filterType === 'ALL' && styles.tabTextActive]}>
              Tất cả ({wishlist.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, filterType === 'RENT' && styles.tabBtnActive]}
            onPress={() => setFilterType('RENT')}
          >
            <Text style={[styles.tabText, filterType === 'RENT' && styles.tabTextActive]}>
              Đồ thuê ({rentCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, filterType === 'THRIFT' && styles.tabBtnActive]}
            onPress={() => setFilterType('THRIFT')}
          >
            <Text style={[styles.tabText, filterType === 'THRIFT' && styles.tabTextActive]}>
              Thanh lý ({thriftCount})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#141310" />}
      >
        {/* Guest Banner */}
        {isGuest && (
          <View style={styles.guestAlert}>
            <Feather name="alert-circle" size={16} color="#BA1A1A" />
            <View style={styles.guestAlertTextWrap}>
              <Text style={styles.guestAlertTitle}>Chế độ Khách vãng lai</Text>
              <Text style={styles.guestAlertDesc}>
                Đăng nhập để tự động lưu và đồng bộ danh sách sản phẩm yêu thích trên mọi thiết bị.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.guestLoginBtn}
              onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
            >
              <Text style={styles.guestLoginBtnText}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && wishlist.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#141310" />
            <Text style={styles.loadingText}>Đang tải danh sách yêu thích...</Text>
          </View>
        ) : wishlist.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-outline" size={42} color="#DC2626" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</Text>
            <Text style={styles.emptySubtitle}>
              Nhấn vào biểu tượng trái tim khi xem sản phẩm RENT hoặc THRIFT để lưu lại vào đây và theo dõi sau.
            </Text>
            <View style={styles.emptyBtnRow}>
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => navigation.navigate('Main', { screen: 'RentTab' })}
              >
                <Text style={styles.browseBtnText}>KHÁM PHÁ ĐỒ THUÊ</Text>
                <Feather name="arrow-right" size={14} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.browseBtn, styles.browseThriftBtn]}
                onPress={() => navigation.navigate('Main', { screen: 'ThriftTab' })}
              >
                <Text style={styles.browseThriftBtnText}>KHÁM PHÁ THANH LÝ</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : displayedProducts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="inbox" size={38} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Không có sản phẩm trong mục này</Text>
            <TouchableOpacity style={styles.resetFilterBtn} onPress={() => setFilterType('ALL')}>
              <Text style={styles.resetFilterText}>Xem tất cả ({wishlist.length})</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.itemsList}>
            {displayedProducts.map((item) => {
              const isRent = item.type === 'RENT';
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.wishCard}
                  activeOpacity={0.88}
                  onPress={() => handleOpenDetail(item)}
                >
                  <View style={styles.wishCardLeft}>
                    {item.image && item.image.trim() !== '' ? (
                      <Image
                        source={{ uri: normalizeImageUrl(item.image) }}
                        style={styles.itemImg}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.itemIconCircle}>
                        <Feather name="package" size={24} color="#576151" />
                      </View>
                    )}

                    <View style={styles.wishInfo}>
                      <View style={styles.typeBadgeRow}>
                        <View style={[styles.typeBadge, isRent ? styles.typeRent : styles.typeThrift]}>
                          <Text style={[styles.typeBadgeText, isRent ? styles.typeRentText : styles.typeThriftText]}>
                            {isRent ? 'ĐỒ THUÊ (RENT)' : 'THANH LÝ (THRIFT)'}
                          </Text>
                        </View>
                        {item.category ? (
                          <Text style={styles.categoryBadge} numberOfLines={1}>
                            {item.category}
                          </Text>
                        ) : null}
                      </View>

                      <Text style={styles.wishTitle} numberOfLines={2}>
                        {item.title}
                      </Text>

                      <View style={styles.priceContainer}>
                        {item.price > 0 ? (
                          <Text style={styles.wishPrice}>
                            {formatCurrency(item.price)}
                            {isRent ? <Text style={styles.priceUnit}> /ngày</Text> : ''}
                          </Text>
                        ) : (
                          <Text style={styles.wishPriceZero}>Liên hệ</Text>
                        )}

                        {isRent && typeof item.deposit === 'number' && item.deposit > 0 && (
                          <Text style={styles.depositText}>
                            Cọc: {formatCurrency(item.deposit)}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Right Actions */}
                  <View style={styles.actionColumn}>
                    <TouchableOpacity
                      style={styles.cartActionBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleMoveToCart(item);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather name="shopping-bag" size={15} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleRemove(item);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather name="trash-2" size={15} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF9F2',
  },
  tabsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE1',
    paddingHorizontal: 12,
  },
  tabBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#141310',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#76726B',
  },
  tabTextActive: {
    color: '#141310',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#76726B',
  },
  guestAlert: {
    flexDirection: 'row',
    backgroundColor: '#FFDAD6',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  guestAlertTextWrap: {
    flex: 1,
  },
  guestAlertTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#93000A',
  },
  guestAlertDesc: {
    fontSize: 11,
    color: '#93000A',
    marginTop: 1,
  },
  guestLoginBtn: {
    backgroundColor: '#141310',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  guestLoginBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEAE1',
    marginTop: 20,
    gap: 10,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C18',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#76726B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  emptyBtnRow: {
    flexDirection: 'column',
    width: '100%',
    gap: 8,
    marginTop: 12,
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141310',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    gap: 6,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  browseThriftBtn: {
    backgroundColor: '#F4F0EA',
    borderWidth: 1,
    borderColor: '#E8E4DC',
  },
  browseThriftBtnText: {
    color: '#141310',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  resetFilterBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
  },
  resetFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemsList: {
    gap: 12,
  },
  wishCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EFEAE1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  wishCardLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  itemImg: {
    width: 76,
    height: 76,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  itemIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 8,
    backgroundColor: '#F5EBE1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishInfo: {
    flex: 1,
    paddingRight: 6,
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeRent: {
    backgroundColor: '#E0F2FE',
  },
  typeThrift: {
    backgroundColor: '#FEF3C7',
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  typeRentText: {
    color: '#0369A1',
  },
  typeThriftText: {
    color: '#B45309',
  },
  categoryBadge: {
    fontSize: 10,
    color: '#64748B',
  },
  wishTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C18',
    marginBottom: 4,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  wishPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  wishPriceZero: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  priceUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: '#64748B',
  },
  depositText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  actionColumn: {
    flexDirection: 'column',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 6,
  },
  cartActionBtn: {
    backgroundColor: '#141310',
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
  },
});

export default WishlistScreen;
