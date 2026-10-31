import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { normalizeImageUrl } from '../../utils/imageUrl';
import { GuestAuthModal } from '../../components/common/GuestAuthModal';
import { getPublicRentProductDetailApi } from '../../services/rentProduct.api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 380;

export const RentProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { cart, addToCart, toggleWishlist, isWishlisted } = useCartWishlist();

  const productParam = route.params?.product;
  const productId = route.params?.productId || productParam?.id || productParam?._id;

  const [product, setProduct] = useState<any>(productParam || null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [rentalDays, setRentalDays] = useState(3);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'terms' | 'insurance'>('desc');
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const [guestActionText, setGuestActionText] = useState('thuê sản phẩm này');

  useEffect(() => {
    if (productId) {
      getPublicRentProductDetailApi(productId).then((res: any) => {
        if (res?.product) {
          const p = res.product;
          setProduct((prev: any) => ({
            ...prev,
            ...p,
            id: p._id || p.id,
            title: p.name || prev?.title,
            price: p.pricePerDay ?? prev?.price ?? 450000,
            pricePerDay: p.pricePerDay ?? prev?.price ?? 450000,
            depositAmount: p.depositAmount ?? prev?.depositAmount ?? 4500000,
            deposit: p.depositAmount ? formatCurrency(p.depositAmount) : prev?.deposit,
            images:
              Array.isArray(p.images) && p.images.length > 0
                ? p.images.map(normalizeImageUrl)
                : prev?.images || [normalizeImageUrl(p.image)],
            image: normalizeImageUrl(p.images?.[0] || p.image || prev?.image),
            description: p.description || prev?.description,
            rentalRules: p.rentalRules || prev?.rentalRules,
            condition: p.condition || prev?.condition,
            location: p.location || prev?.location,
            ownerName: p.ownerId?.fullName || 'ReUse Optical Tech',
          }));
        }
      });
    }
  }, [productId]);

  const images: string[] =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images
      : [product?.image || normalizeImageUrl('')];

  const currentImage = images[selectedImageIndex] || images[0];
  const isWished = product?.id ? isWishlisted(product.id) : false;

  // Rental Cost Calculations (Web Parity)
  const pricePerDay = Number(product?.pricePerDay ?? product?.price ?? 450000);
  const depositAmount = Number(product?.depositAmount ?? 4500000);
  const shippingFee = 45000;
  const rentFee = pricePerDay * rentalDays * quantity;
  const totalEstimated = rentFee + shippingFee + depositAmount;

  const handleWishlistPress = () => {
    if (!user) {
      setGuestActionText('lưu sản phẩm vào danh sách yêu thích');
      setGuestModalVisible(true);
      return;
    }
    if (product?.id) {
      toggleWishlist(product.id, 'RENT');
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      setGuestActionText('thêm sản phẩm vào giỏ hàng');
      setGuestModalVisible(true);
      return;
    }

    addToCart({
      id: product.id || productId,
      title: product.title || product.name || 'Sản phẩm thuê',
      price: pricePerDay,
      deposit: formatCurrency(depositAmount),
      image: currentImage,
      mode: 'rent',
    });

    Alert.alert('Đã thêm vào giỏ', `${product.title} đã được đưa vào giỏ hàng của bạn.`, [
      { text: 'Xem giỏ hàng', onPress: () => navigation.navigate('Cart') },
      { text: 'Tiếp tục xem', style: 'cancel' },
    ]);
  };

  const handleRentNow = () => {
    if (!user) {
      setGuestActionText('đặt thuê thiết bị / trang phục này');
      setGuestModalVisible(true);
      return;
    }

    addToCart({
      id: product.id || productId,
      title: product.title || product.name || 'Sản phẩm thuê',
      price: pricePerDay,
      deposit: formatCurrency(depositAmount),
      image: currentImage,
      mode: 'rent',
    });

    navigation.navigate('Cart');
  };

  if (!product) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Feather name="loader" size={32} color="#18181B" />
        <Text style={styles.loadingText}>Đang tải chi tiết thiết bị...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Top App Bar with Breadcrumb and Actions */}
      <SafeAreaView style={styles.topBarSafe}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={20} color="#18181B" />
          </TouchableOpacity>

          <Text style={styles.topBarTitle} numberOfLines={1}>
            Chi tiết sản phẩm RENT
          </Text>

          <View style={styles.topBarRight}>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={handleWishlistPress}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isWished ? 'heart' : 'heart-outline'}
                size={20}
                color={isWished ? '#E11D48' : '#18181B'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => navigation.navigate('Cart')}
              activeOpacity={0.8}
            >
              <Feather name="shopping-bag" size={18} color="#18181B" />
              {cart.length > 0 && (
                <View style={styles.badgeDot}>
                  <Text style={styles.badgeDotText}>{cart.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Breadcrumb matching Web */}
        <View style={styles.breadcrumbRow}>
          <Text style={styles.breadcrumbLink}>Trang chủ</Text>
          <Text style={styles.breadcrumbSlash}>/</Text>
          <Text style={styles.breadcrumbLink}>RENT</Text>
          <Text style={styles.breadcrumbSlash}>/</Text>
          <Text style={styles.breadcrumbActive} numberOfLines={1}>
            {product.title || product.name}
          </Text>
        </View>

        {/* Hero Image with Badges matching Screenshot 3 */}
        <View style={styles.heroWrapper}>
          <Image
            source={{ uri: currentImage }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Badges on Hero Image */}
          <View style={styles.heroBadgeLeft}>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
              <Text style={styles.verifiedBadgeText}>ĐÃ KIỂM ĐỊNH 100%</Text>
            </View>
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeBadgeText}>GRADE A+</Text>
            </View>
          </View>

          {/* Slide Indicator */}
          {images.length > 1 && (
            <View style={styles.imageIndicatorContainer}>
              {images.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.indicatorDot,
                    selectedImageIndex === idx && styles.indicatorDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Thumbnails Row */}
        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailRow}
          >
            {images.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedImageIndex(idx)}
                style={[
                  styles.thumbnailWrap,
                  selectedImageIndex === idx && styles.thumbnailWrapActive,
                ]}
              >
                <Image source={{ uri: img }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Main Product Info */}
        <View style={styles.bodySection}>
          {/* 3 Pillars of Safety (Bảo chứng an toàn từ ReUse Hub) */}
          <View style={styles.safetyBox}>
            <Text style={styles.safetyHeader}>Bảo chứng an toàn từ ReUse Hub</Text>
            <View style={styles.safetyItem}>
              <Ionicons name="shield-checkmark" size={15} color="#059669" />
              <Text style={styles.safetyText}>Khử trùng y tế: Giặt hấp vô trùng 100% trước khi giao</Text>
            </View>
            <View style={styles.safetyItem}>
              <Ionicons name="checkmark-done" size={15} color="#2563EB" />
              <Text style={styles.safetyText}>Kiểm định Sensor 100%: Thiết bị không bụi mốc, hoạt động hoàn hảo</Text>
            </View>
            <View style={styles.safetyItem}>
              <Ionicons name="lock-closed" size={15} color="#D97706" />
              <Text style={styles.safetyText}>Smart Escrow Ký Quỹ: Hoàn trả 100% cọc ngay khi nhận lại đồ</Text>
            </View>
          </View>

          {/* Title & Rating */}
          <Text style={styles.productTitle}>{product.title || product.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingScore}>{product.rating || 4.9}</Text>
            <Text style={styles.ratingCount}>({product.reviewCount || 24} đánh giá xác thực)</Text>
            <Text style={styles.dotSeparator}>•</Text>
            <Text style={styles.conditionText}>{product.condition || 'Tình trạng 98%'}</Text>
          </View>

          {/* Price & Deposit Summary */}
          <View style={styles.pricingCard}>
            <View style={styles.pricingCol}>
              <Text style={styles.pricingLabel}>Giá thuê ngày</Text>
              <Text style={styles.priceValue}>{formatCurrency(pricePerDay)}</Text>
              <Text style={styles.priceUnit}>/ 24 giờ</Text>
            </View>
            <View style={styles.pricingDivider} />
            <View style={styles.pricingCol}>
              <Text style={styles.pricingLabel}>Tiền cọc bảo chứng</Text>
              <Text style={styles.depositValue}>{formatCurrency(depositAmount)}</Text>
              <Text style={styles.depositNote}>(Hoàn lại 100% khi trả đồ)</Text>
            </View>
          </View>

          {/* Rental Duration & Quantity Selector (Web Parity) */}
          <View style={styles.durationCard}>
            <Text style={styles.durationTitle}>Thời gian thuê dự kiến:</Text>
            <View style={styles.durationButtonsRow}>
              {[1, 2, 3, 5, 7].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[styles.dayPill, rentalDays === days && styles.dayPillActive]}
                  onPress={() => setRentalDays(days)}
                >
                  <Text style={[styles.dayPillText, rentalDays === days && styles.dayPillTextActive]}>
                    {days} ngày
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quantity Selector */}
            <View style={styles.quantityRow}>
              <Text style={styles.quantityLabel}>Số lượng thuê:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Feather name="minus" size={14} color="#18181B" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Feather name="plus" size={14} color="#18181B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Transparent Cost Breakdown Table */}
            <View style={styles.breakdownTable}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Phí thuê ({rentalDays} ngày x {quantity}):</Text>
                <Text style={styles.breakdownValue}>{formatCurrency(rentFee)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Phí vận chuyển 2 chiều:</Text>
                <Text style={styles.breakdownValue}>{formatCurrency(shippingFee)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Tiền cọc ký quỹ (hoàn lại):</Text>
                <Text style={styles.breakdownValue}>{formatCurrency(depositAmount)}</Text>
              </View>
              <View style={styles.breakdownDivider} />
              <View style={styles.breakdownRowTotal}>
                <Text style={styles.breakdownTotalLabel}>Tổng thanh toán tạm tính:</Text>
                <Text style={styles.breakdownTotalValue}>{formatCurrency(totalEstimated)}</Text>
              </View>
            </View>
          </View>

          {/* Shop Owner Info Card */}
          <View style={styles.shopCard}>
            <View style={styles.shopAvatar}>
              <Text style={styles.shopAvatarText}>OT</Text>
            </View>
            <View style={styles.shopInfo}>
              <Text style={styles.shopName}>{product.ownerName || 'ReUse Optical Tech'}</Text>
              <View style={styles.shopBadgeRow}>
                <Ionicons name="checkmark-circle" size={12} color="#059669" />
                <Text style={styles.shopBadge}>Đối tác xác thực</Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.shopLoc}>{product.location || 'Đà Nẵng'}</Text>
              </View>
            </View>
          </View>

          {/* Tab Navigation for Specs / Terms / Insurance */}
          <View style={styles.tabHeaderRow}>
            <TouchableOpacity
              style={[styles.specTab, activeTab === 'desc' && styles.specTabActive]}
              onPress={() => setActiveTab('desc')}
            >
              <Text style={[styles.specTabText, activeTab === 'desc' && styles.specTabTextActive]}>
                MÔ TẢ PHỤ KIỆN
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.specTab, activeTab === 'terms' && styles.specTabActive]}
              onPress={() => setActiveTab('terms')}
            >
              <Text style={[styles.specTabText, activeTab === 'terms' && styles.specTabTextActive]}>
                ĐIỀU KHOẢN
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.specTab, activeTab === 'insurance' && styles.specTabActive]}
              onPress={() => setActiveTab('insurance')}
            >
              <Text style={[styles.specTabText, activeTab === 'insurance' && styles.specTabTextActive]}>
                BẢO HIỂM
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'desc' && (
            <View style={styles.tabBody}>
              <Text style={styles.tabDescription}>
                {product.description ||
                  'Sản phẩm chuyên nghiệp được thẩm định kỹ thuật 12 bước bởi ReUse Hub. Đầy đủ phụ kiện theo máy sẵn sàng tác nghiệp ngay khi nhận hàng.'}
              </Text>
              <View style={styles.accessoryBox}>
                <Text style={styles.accessoryTitle}>Bộ phụ kiện tiêu chuẩn đi kèm:</Text>
                <Text style={styles.accessoryItem}>• 01 Thân máy chính hãng nguyên bản</Text>
                <Text style={styles.accessoryItem}>• 02 Pin zin dung lượng cao &amp; Sạc đôi nhanh</Text>
                <Text style={styles.accessoryItem}>• 01 Thẻ nhớ tốc độ cao chuẩn V60</Text>
                <Text style={styles.accessoryItem}>• 01 Túi đựng chống sốc chuyên dụng</Text>
              </View>
            </View>
          )}

          {activeTab === 'terms' && (
            <View style={styles.tabBody}>
              <Text style={styles.tabDescription}>
                {product.rentalRules ||
                  '1. Khách hàng chịu trách nhiệm bảo quản nguyên vẹn ngoại quan và chức năng của máy.\n2. Trả đồ đúng hạn để nhận lại 100% tiền cọc tự động qua ví điện tử.\n3. Trường hợp sự cố kỹ thuật bất khả kháng, đối tác hỗ trợ đổi máy tương đương trong 2 giờ.'}
              </Text>
            </View>
          )}

          {activeTab === 'insurance' && (
            <View style={styles.tabBody}>
              <Text style={styles.tabDescription}>
                Mọi đơn thuê trên ReUse Hub đều được tích hợp gói bảo hiểm an tâm:
                {'\n'}• Miễn trừ trách nhiệm với hao mòn tự nhiên.
                {'\n'}• Hỗ trợ 70% chi phí sửa chữa trường hợp rơi vỡ ngoài ý muốn.
              </Text>
            </View>
          )}

          {/* 5-Step Rental Protocol matching Web */}
          <View style={styles.protocolBox}>
            <Text style={styles.protocolHeader}>Quy trình thuê - bàn giao 5 bước tại ReUse Hub</Text>
            <Text style={styles.protocolStep}>1. Chọn ngày thuê &amp; ký quỹ qua Smart Escrow an toàn</Text>
            <Text style={styles.protocolStep}>2. Nhận máy tận nơi và ký biên bản kiểm tra ngoại quan</Text>
            <Text style={styles.protocolStep}>3. Trải nghiệm tác nghiệp thoải mái theo lịch trình</Text>
            <Text style={styles.protocolStep}>4. Bàn giao lại thiết bị cho shipper của ReUse Hub</Text>
            <Text style={styles.protocolStep}>5. Hệ thống đối soát và hoàn cọc 100% trong 2 giờ</Text>
          </View>
        </View>
      </ScrollView>

      {/* Dual Sticky Action Buttons matching Web */}
      <SafeAreaView style={styles.bottomBarSafe}>
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={handleAddToCart}
            activeOpacity={0.85}
          >
            <Feather name="shopping-bag" size={17} color="#18181B" />
            <Text style={styles.addToCartText}>THÊM VÀO GIỎ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rentNowBtn}
            onPress={handleRentNow}
            activeOpacity={0.88}
          >
            <Text style={styles.rentNowText}>
              {user ? 'THUÊ NGAY' : 'THUÊ NGAY (KHÁCH)'}
            </Text>
            <Feather name="arrow-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Guest Login/Register prompt modal */}
      <GuestAuthModal
        visible={guestModalVisible}
        onClose={() => setGuestModalVisible(false)}
        actionText={guestActionText}
      />
    </View>
  );
};

export default RentProductDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#71717A',
  },
  topBarSafe: {
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181B',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4F4F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeDotText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  breadcrumbLink: {
    fontSize: 12,
    color: '#71717A',
  },
  breadcrumbSlash: {
    fontSize: 11,
    color: '#D4D4D8',
  },
  breadcrumbActive: {
    fontSize: 12,
    color: '#18181B',
    fontWeight: '600',
    flex: 1,
  },
  heroWrapper: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    backgroundColor: '#F4F4F5',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroBadgeLeft: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 4,
  },
  verifiedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  gradeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  gradeBadgeText: {
    color: '#18181B',
    fontSize: 10,
    fontWeight: '800',
  },
  imageIndicatorContainer: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  indicatorDotActive: {
    width: 14,
    backgroundColor: '#FFFFFF',
  },
  thumbnailRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  thumbnailWrap: {
    width: 54,
    height: 68,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailWrapActive: {
    borderColor: '#18181B',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  bodySection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  safetyBox: {
    backgroundColor: '#FAFAF9',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFEAE1',
    marginBottom: 14,
  },
  safetyHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#18181B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  safetyText: {
    fontSize: 12,
    color: '#52525B',
    flex: 1,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#18181B',
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    marginBottom: 14,
  },
  ratingScore: {
    fontSize: 13,
    fontWeight: '700',
    color: '#18181B',
  },
  ratingCount: {
    fontSize: 12,
    color: '#71717A',
  },
  dotSeparator: {
    fontSize: 10,
    color: '#D4D4D8',
  },
  conditionText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  pricingCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F6F1',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EBE5D8',
    marginBottom: 16,
  },
  pricingCol: {
    flex: 1,
  },
  pricingDivider: {
    width: 1,
    backgroundColor: '#E2DBD0',
    marginHorizontal: 12,
  },
  pricingLabel: {
    fontSize: 11,
    color: '#71717A',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#18181B',
    marginTop: 4,
  },
  priceUnit: {
    fontSize: 11,
    color: '#71717A',
  },
  depositValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
    marginTop: 4,
  },
  depositNote: {
    fontSize: 10,
    color: '#71717A',
  },
  durationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    marginBottom: 16,
  },
  durationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#18181B',
    marginBottom: 10,
  },
  durationButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  dayPill: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F4F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayPillActive: {
    backgroundColor: '#18181B',
  },
  dayPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#52525B',
  },
  dayPillTextActive: {
    color: '#FFFFFF',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F4F4F5',
  },
  quantityLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#18181B',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F4F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181B',
    minWidth: 18,
    textAlign: 'center',
  },
  breakdownTable: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F4F4F5',
    gap: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#71717A',
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#18181B',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#E4E4E7',
    marginVertical: 4,
  },
  breakdownRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 4,
  },
  breakdownTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#18181B',
  },
  breakdownTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#18181B',
  },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAF9',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFEAE1',
    marginBottom: 16,
    gap: 12,
  },
  shopAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181B',
  },
  shopBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  shopBadge: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  shopLoc: {
    fontSize: 11,
    color: '#71717A',
  },
  tabHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E7',
    marginBottom: 12,
  },
  specTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  specTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#18181B',
  },
  specTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 0.5,
  },
  specTabTextActive: {
    color: '#18181B',
  },
  tabBody: {
    paddingVertical: 4,
    marginBottom: 16,
  },
  tabDescription: {
    fontSize: 13,
    color: '#52525B',
    lineHeight: 20,
  },
  accessoryBox: {
    backgroundColor: '#F4F4F5',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    gap: 4,
  },
  accessoryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#18181B',
    marginBottom: 4,
  },
  accessoryItem: {
    fontSize: 12,
    color: '#52525B',
  },
  protocolBox: {
    backgroundColor: '#FAFAF9',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEAE1',
    marginTop: 6,
    gap: 6,
  },
  protocolHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#18181B',
    marginBottom: 4,
  },
  protocolStep: {
    fontSize: 11,
    color: '#71717A',
    lineHeight: 16,
  },
  bottomBarSafe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E4E4E7',
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#18181B',
    gap: 6,
  },
  addToCartText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#18181B',
  },
  rentNowBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#18181B',
    gap: 6,
  },
  rentNowText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
