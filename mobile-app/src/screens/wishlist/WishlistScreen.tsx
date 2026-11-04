import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';
import { useAuth } from '../../hooks/useAuth';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { RENT_PRODUCTS } from '../../data/rent/marketplaceData';
import { THRIFT_PRODUCTS } from '../../data/thrift/thriftMarketplaceData';
import { normalizeImageUrl } from '../../utils/imageUrl';

const KNOWN_MONGO_PRODUCTS: Record<string, { title: string; price: number; image: string; type: 'RENT' | 'THRIFT'; deposit?: number; category: string }> = {
  '6acee0804c6e5d97a2389e4f': {
    title: 'Sony Alpha A7 IV Kit',
    price: 450000,
    deposit: 2000000,
    image: './src/assets/images/camerahome.jpg',
    type: 'RENT',
    category: 'Camera',
  },
  '6acee0804c6e5d97a2389e50': {
    title: 'Party Dress Thiết Kế Tối Giản',
    price: 180000,
    deposit: 800000,
    image: './src/assets/images/partydresshome.jpg',
    type: 'RENT',
    category: 'Đầm dự tiệc',
  },
  '6acee0804c6e5d97a2389e51': {
    title: 'Classic Sneakers Da Thật Archive',
    price: 150000,
    deposit: 600000,
    image: './src/assets/images/shoeshome.jpg',
    type: 'RENT',
    category: 'Giày dép',
  },
  '6acee0804c6e5d97a2389e52': {
    title: 'Đầm Dạ Hội Lụa Satin Cao Cấp Dáng Xòe',
    price: 250000,
    deposit: 1000000,
    image: './src/assets/images/partydress4.jpg',
    type: 'RENT',
    category: 'Đầm dự tiệc',
  },
  '6acee0804c6e5d97a2389e53': {
    title: 'Canon EOS R6 Mark II Mirrorless',
    price: 500000,
    deposit: 2500000,
    image: './src/assets/images/camerahome.jpg',
    type: 'RENT',
    category: 'Camera',
  },
  '6acee0804c6e5d97a2389e54': {
    title: 'Áo Khoác Dạ Wool Dáng Dài Cao Cấp',
    price: 220000,
    deposit: 900000,
    image: './src/assets/images/partydresshome.jpg',
    type: 'RENT',
    category: 'Quần áo',
  },
  '6ad286f6f507857852155c62': {
    title: 'Giày Sandal Cao Gót Quai Mảnh Ánh Kim Dự Tiệc',
    price: 160000,
    deposit: 800000,
    image: './src/assets/images/shoeshome.jpg',
    type: 'RENT',
    category: 'Giày dép',
  },
};

export const WishlistScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { wishlist, wishlistCount, toggleWishlist, addToCart } = useCartWishlist();

  const isGuest = !user;

  // Resolve product info by ID
  const wishlistedProducts = wishlist.map((id) => {
    const mongoItem = KNOWN_MONGO_PRODUCTS[id];
    if (mongoItem) {
      return {
        id,
        title: mongoItem.title,
        price: mongoItem.price,
        image: mongoItem.image,
        type: mongoItem.type,
        deposit: mongoItem.deposit,
        category: mongoItem.category,
      };
    }
    const rentItem = RENT_PRODUCTS.find((p) => p.id === id);
    if (rentItem) {
      return {
        id,
        title: rentItem.title || rentItem.name || 'Sản phẩm thuê',
        price: rentItem.price,
        image: rentItem.image || './src/assets/images/camerahome.jpg',
        type: 'RENT' as const,
        deposit: rentItem.deposit,
        category: rentItem.categoryLabel || rentItem.category,
      };
    }
    const thriftItem = THRIFT_PRODUCTS.find((p) => p.id === id);
    if (thriftItem) {
      return {
        id,
        title: thriftItem.title || thriftItem.name || 'Sản phẩm thanh lý',
        price: thriftItem.price,
        image: thriftItem.image || './src/assets/images/shoeshome.jpg',
        type: 'THRIFT' as const,
        deposit: undefined,
        category: thriftItem.categoryLabel || thriftItem.category,
      };
    }
    return {
      id,
      title: `Sản phẩm #${id.slice(-6)}`,
      price: 180000,
      image: './src/assets/images/shoeshome.jpg',
      type: 'RENT' as const,
      deposit: 800000,
      category: 'Lưu trữ',
    };
  });

  const handleMoveToCart = (item: (typeof wishlistedProducts)[0]) => {
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

  return (
    <View style={styles.container}>
      <AppHeader title="Danh Sách Yêu Thích" showBack />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Guest Banner */}
        {isGuest && (
          <View style={styles.guestAlert}>
            <Feather name="alert-circle" size={16} color="#BA1A1A" />
            <View style={styles.guestAlertTextWrap}>
              <Text style={styles.guestAlertTitle}>Chế độ Khách vãng lai</Text>
              <Text style={styles.guestAlertDesc}>
                Đăng nhập để đồng bộ danh sách sản phẩm yêu thích trên mọi thiết bị.
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

        {wishlistCount === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="heart" size={48} color="#A8A29E" />
            <Text style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</Text>
            <Text style={styles.emptySubtitle}>
              Nhấn vào biểu tượng trái tim khi xem sản phẩm để lưu lại vào đây và theo dõi sau.
            </Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => navigation.navigate('Main', { screen: 'RentTab' })}
            >
              <Text style={styles.browseBtnText}>KHÁM PHÁ DANH MỤC THUÊ</Text>
              <Feather name="arrow-right" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.itemsList}>
            {wishlistedProducts.map((item) => (
              <View key={item.id} style={styles.wishCard}>
                <View style={styles.wishCardLeft}>
                  {item.image ? (
                    <Image source={{ uri: normalizeImageUrl(item.image) }} style={styles.itemImg} resizeMode="cover" />
                  ) : (
                    <View style={styles.itemIconCircle}>
                      <Feather name="package" size={20} color="#576151" />
                    </View>
                  )}
                  <View style={styles.wishInfo}>
                    <View style={styles.typeBadgeRow}>
                      <Text style={styles.wishTypeBadge}>
                        {item.type === 'RENT' ? 'ĐỒ THUÊ (RENT)' : 'THANH LÝ (THRIFT)'}
                      </Text>
                    </View>
                    <Text style={styles.wishTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    {item.price > 0 && (
                      <Text style={styles.wishPrice}>
                        {formatCurrency(item.price)}
                        {item.type === 'RENT' ? '/ngày' : ''}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Actions: Move to cart & remove */}
                <View style={styles.actionColumn}>
                  <TouchableOpacity
                    style={styles.cartActionBtn}
                    onPress={() => handleMoveToCart(item)}
                  >
                    <Feather name="shopping-bag" size={14} color="#FFFFFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => toggleWishlist(item.id, item.type)}
                  >
                    <Feather name="trash-2" size={15} color="#BA1A1A" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEAE1',
    marginTop: 20,
    gap: 10,
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
    lineHeight: 17,
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#141310',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  itemsList: {
    gap: 10,
  },
  wishCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFEAE1',
    gap: 10,
  },
  wishCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  itemImg: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#EBE8E1',
  },
  itemIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#F4F0EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishInfo: {
    flex: 1,
  },
  typeBadgeRow: {
    marginBottom: 2,
  },
  wishTypeBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#576151',
    letterSpacing: 0.5,
  },
  wishTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C18',
    lineHeight: 18,
  },
  wishPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#141310',
    marginTop: 2,
  },
  actionColumn: {
    alignItems: 'center',
    gap: 8,
  },
  cartActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#141310',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    padding: 6,
  },
});

export default WishlistScreen;
