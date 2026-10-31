import React, { useState, useMemo, useEffect } from 'react';
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
import { getPublicThriftListingByIdApi } from '../../services/thrift.api';
import {
  getThriftProductDetail,
  THRIFT_RELATED_PRODUCTS,
} from '../../data/thrift/thriftDetailData';
import type { ThriftProductDetail } from '../../data/thrift/thriftDetailData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GALLERY_HEIGHT = SCREEN_WIDTH * 0.85;
const RELATED_WIDTH = (SCREEN_WIDTH - 44) / 2;

type InfoTab = 'desc' | 'audit' | 'origin' | 'shipping';

const TABS: { key: InfoTab; label: string }[] = [
  { key: 'desc', label: 'Mô tả' },
  { key: 'audit', label: 'Kiểm định' },
  { key: 'origin', label: 'Nguồn gốc' },
  { key: 'shipping', label: 'Vận chuyển' },
];

const CAMERA_REGEX = /canon|sony|nikon|fujifilm|dji|leica|lumix/i;

export const ThriftDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { cart, addToCart, toggleWishlist, isWishlisted } = useCartWishlist();

  const productParam = route.params?.product;
  const id: string | undefined =
    route.params?.productId || productParam?.id || productParam?._id;

  const baseProduct: ThriftProductDetail = useMemo(() => getThriftProductDetail(id), [id]);
  const [dbProduct, setDbProduct] = useState<Partial<ThriftProductDetail> | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [activeThumb, setActiveThumb] = useState(0);
  const [selectedSize, setSelectedSize] = useState('L');
  const [activeTab, setActiveTab] = useState<InfoTab>('desc');
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const [guestActionText, setGuestActionText] = useState('mua sản phẩm này');

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    getPublicThriftListingByIdApi(id).then((data: any) => {
      if (!mounted || !data) return;
      const name: string = data.name || '';
      const isCamera = CAMERA_REGEX.test(name) || data.category === 'camera';
      const catName =
        typeof data.categoryId === 'object' ? data.categoryId?.name : undefined;
      setDbProduct({
        id: data._id,
        title: name || undefined,
        price: data.price,
        quantity: data.quantity,
        status: data.status,
        sourceType: data.sourceType,
        sizes: isCamera ? [] : data.sizes || ['S', 'M', 'L', 'XL'],
        size: isCamera ? undefined : data.size || 'L',
        conditionLabel: data.condition || undefined,
        location: data.location || undefined,
        categoryLabel: catName || undefined,
        descriptionPoints: data.description ? [data.description] : undefined,
      });
      if (Array.isArray(data.images) && data.images.length > 0) {
        setImages(data.images.map((u: string) => normalizeImageUrl(u)));
      }
      if (data.size) setSelectedSize(data.size);
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  const product: ThriftProductDetail = useMemo(() => {
    // Dữ liệu từ trang danh sách (đã có sẵn) -> hiển thị ngay, tránh màn hình trống
    const fromList: Partial<ThriftProductDetail> = productParam
      ? {
          title: productParam.title || productParam.name,
          price: productParam.price,
          originalPrice: productParam.originalPrice,
          conditionLabel: productParam.condition,
          location: productParam.location,
          categoryLabel: productParam.category,
        }
      : {};
    const clean = <T extends object>(o: T) =>
      Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== '')) as T;
    return {
      ...baseProduct,
      ...clean(fromList),
      ...clean(dbProduct || {}),
      id: dbProduct?.id || id || baseProduct.id,
    } as ThriftProductDetail;
  }, [baseProduct, dbProduct, productParam, id]);

  const gallery: string[] = useMemo(() => {
    if (images.length > 0) return images;
    if (productParam?.images?.length) return productParam.images.map(normalizeImageUrl);
    const base = [product.mainImage, ...product.thumbnails.map((t) => t.src)].filter(Boolean);
    return base.map((u) => normalizeImageUrl(u));
  }, [images, productParam, product]);

  const activeImage = gallery[activeThumb] || gallery[0] || normalizeImageUrl('');
  const isSoldOut =
    product.status === 'SOLD' || (product.quantity !== undefined && product.quantity <= 0);
  const isRentalSource = product.sourceType === 'RENTAL_PRODUCT' || product.source === 'rent';
  const isCamera =
    product.category === 'camera' ||
    (product.categoryLabel || '').toLowerCase().includes('camera') ||
    (product.categoryLabel || '').toLowerCase().includes('máy ảnh') ||
    CAMERA_REGEX.test(product.title);
  const showSizeSelector =
    !isCamera && Array.isArray(product.sizes) && product.sizes.length > 0;
  const wished = isWishlisted(product.id);
  const gradeMatch = product.conditionLabel?.match(/\d+%/)?.[0] ?? '95%';

  const requireAuth = (actionText: string, onOk: () => void) => {
    if (!user) {
      setGuestActionText(actionText);
      setGuestModalVisible(true);
      return;
    }
    onOk();
  };

  const buildCartItem = () => ({
    id: product.id,
    title: product.title,
    price: product.price,
    image: activeImage,
    mode: 'thrift' as const,
    location: product.location,
    categoryLabel: product.categoryLabel,
    gradeBadge: product.conditionLabel,
    quantity: 1,
    size: showSizeSelector ? selectedSize : undefined,
  });

  const handleBuyNow = () =>
    requireAuth(`mua ngay "${product.title}"`, () => {
      addToCart(buildCartItem() as any);
      navigation.navigate('Cart');
    });

  const handleAddToCart = () =>
    requireAuth('thêm sản phẩm vào giỏ hàng', () => {
      addToCart(buildCartItem() as any);
      Alert.alert('Đã thêm vào giỏ', `${product.title} đã được thêm vào giỏ hàng.`, [
        { text: 'Xem giỏ hàng', onPress: () => navigation.navigate('Cart') },
        { text: 'Tiếp tục xem', style: 'cancel' },
      ]);
    });

  const handleWishlist = () =>
    requireAuth('lưu sản phẩm vào danh sách yêu thích', () =>
      toggleWishlist(product.id, 'THRIFT')
    );

  const handleChat = () =>
    requireAuth(`chat với Shop Owner về "${product.title}"`, () =>
      Alert.alert('Chat', 'Tính năng chat với Shop Owner sẽ sớm được hỗ trợ trên ứng dụng.')
    );

  const related = THRIFT_RELATED_PRODUCTS.filter((r) => r.id !== product.id).slice(0, 4);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Top bar */}
      <SafeAreaView edges={['top']} style={styles.topBarSafe}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={20} color="#1C1A18" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            Chi tiết THRIFT
          </Text>
          <View style={styles.topBarRight}>
            <TouchableOpacity style={styles.iconCircle} onPress={handleWishlist}>
              <Ionicons
                name={wished ? 'heart' : 'heart-outline'}
                size={20}
                color={wished ? '#E11D48' : '#1C1A18'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => navigation.navigate('Cart')}
            >
              <Feather name="shopping-bag" size={18} color="#1C1A18" />
              {cart.length > 0 && (
                <View style={styles.badgeDot}>
                  <Text style={styles.badgeDotText}>{cart.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Breadcrumb */}
        <View style={styles.breadcrumb}>
          <Text style={styles.bcLink} onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })}>
            Trang chủ
          </Text>
          <Text style={styles.bcSep}>›</Text>
          <Text style={styles.bcLink} onPress={() => navigation.navigate('Main', { screen: 'ThriftTab' })}>
            THRIFT
          </Text>
          <Text style={styles.bcSep}>›</Text>
          <Text style={styles.bcCurrent} numberOfLines={1}>
            {product.title}
          </Text>
        </View>

        {/* Gallery */}
        <View style={styles.galleryCard}>
          <View style={styles.galleryFrame}>
            <Image source={{ uri: activeImage }} style={styles.galleryImage} resizeMode="cover" />
            <View style={styles.galleryBadges}>
              <View style={styles.auditBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#B4C292" />
                <Text style={styles.auditBadgeText}>ĐÃ THẨM ĐỊNH {gradeMatch}</Text>
              </View>
              <View style={styles.sourceBadge}>
                <Text style={styles.sourceBadgeText}>{product.sourceLabel}</Text>
              </View>
            </View>
            <View style={styles.galleryFooter}>
              <Text style={styles.specimenText} numberOfLines={1}>
                Mã định danh: {product.specimenCode}
              </Text>
              <View style={styles.sealRow}>
                <View style={styles.sealDot} />
                <Text style={styles.sealText}>Tem niêm phong ReUse Hub</Text>
              </View>
            </View>
          </View>
        </View>

        {gallery.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbRow}
          >
            {gallery.map((src, i) => (
              <TouchableOpacity
                key={`${src}-${i}`}
                onPress={() => setActiveThumb(i)}
                style={[styles.thumb, activeThumb === i && styles.thumbActive]}
              >
                <Image source={{ uri: src }} style={styles.thumbImg} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Photo note */}
        <View style={styles.noteCard}>
          <View style={styles.noteIcon}>
            <Feather name="camera" size={16} color="#1C1A18" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.noteTitle}>Cam kết ảnh chụp thực tế 100%</Text>
            <Text style={styles.noteText}>
              Tất cả hình ảnh phản ánh chính xác tình trạng thực tế của sản phẩm. Bảo chứng kiểm tra
              72h khi unboxing.
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.body}>
          <View style={styles.metaRow}>
            <Text style={styles.metaCategory}>{product.categoryLabel}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Feather name="map-pin" size={12} color="#78736A" />
            <Text style={styles.metaLocation}>{product.location}</Text>
          </View>

          <View style={styles.originPill}>
            <Text style={styles.originPillText}>Nguồn gốc: {product.sourceLabel}</Text>
          </View>

          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.subtitle}>{product.subtitle}</Text>

          <View style={styles.condRow}>
            <View style={styles.condPill}>
              <Text style={styles.condLabel}>Tình trạng:</Text>
              <Text style={styles.condValue}>{product.conditionLabel}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingScore}>{product.rating.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({product.reviewCount} đánh giá)</Text>
            </View>
          </View>

          {/* Pricing card */}
          <View style={styles.priceCard}>
            <View style={styles.priceTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.priceKicker}>GIÁ MUA TRỌN GÓI SỞ HỮU</Text>
                <View style={styles.priceLine}>
                  <Text style={styles.priceMain}>{formatCurrency(product.price)}</Text>
                  {product.originalPrice > 0 && (
                    <Text style={styles.priceOld}>{formatCurrency(product.originalPrice)}</Text>
                  )}
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={styles.discountPill}>
                  <Text style={styles.discountText}>{product.discountNote}</Text>
                </View>
                <Text style={styles.vatText}>Đã gồm VAT & chứng nhận</Text>
              </View>
            </View>

            <View style={styles.verifiedBox}>
              <View style={styles.verifiedAvatar}>
                <Text style={styles.verifiedAvatarText}>SO</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.verifiedName}>{product.verifiedBy}</Text>
                <Text style={styles.verifiedRole}>{product.verifiedByRole}</Text>
              </View>
              <View style={styles.verifiedTag}>
                <Text style={styles.verifiedTagText}>✓ Được kiểm chứng</Text>
              </View>
            </View>

            <View style={styles.reassureGrid}>
              {product.reassurancePoints.map((p, i) => (
                <View key={i} style={styles.reassureItem}>
                  <Feather name="check" size={13} color="#1C1A18" />
                  <Text style={styles.reassureText}>{p}</Text>
                </View>
              ))}
            </View>

            {showSizeSelector && (
              <View style={styles.sizeBlock}>
                <View style={styles.sizeHeader}>
                  <Text style={styles.sizeLabel}>
                    CHỌN KÍCH CỠ / SIZE: <Text style={styles.sizeValue}>{selectedSize}</Text>
                  </Text>
                  <Text style={styles.sizeHint}>Form chuẩn Atelier</Text>
                </View>
                <View style={styles.sizeRow}>
                  {(product.sizes || []).map((s) => {
                    const on = selectedSize === s;
                    return (
                      <TouchableOpacity
                        key={s}
                        disabled={isSoldOut}
                        onPress={() => setSelectedSize(s)}
                        style={[styles.sizeBtn, on && styles.sizeBtnOn, isSoldOut && { opacity: 0.4 }]}
                      >
                        <Text style={[styles.sizeBtnText, on && styles.sizeBtnTextOn]}>{s}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <View style={styles.stockBox}>
              <Text style={styles.stockLabel}>
                {isRentalSource ? 'Hiện vật tuần hoàn Second-Life:' : 'Số lượng tồn kho:'}
              </Text>
              <View style={[styles.stockPill, isSoldOut && styles.stockPillOut]}>
                <Text style={[styles.stockPillText, isSoldOut && styles.stockPillTextOut]}>
                  {isSoldOut ? 'Đã bán hết' : `Còn ${product.quantity ?? 5} sản phẩm`}
                </Text>
              </View>
            </View>

            <View style={styles.ctaRow}>
              <TouchableOpacity
                style={[styles.ctaPrimary, isSoldOut && { opacity: 0.5 }]}
                onPress={handleBuyNow}
                disabled={isSoldOut}
                activeOpacity={0.88}
              >
                <Ionicons name="flash" size={15} color="#FFFFFF" />
                <Text style={styles.ctaPrimaryText}>MUA NGAY</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ctaSecondary, isSoldOut && { opacity: 0.5 }]}
                onPress={handleAddToCart}
                disabled={isSoldOut}
                activeOpacity={0.88}
              >
                <Feather name="shopping-bag" size={15} color="#1C1A18" />
                <Text style={styles.ctaSecondaryText}>THÊM VÀO GIỎ</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.ctaRow}>
              <TouchableOpacity
                style={[styles.ghostBtn, wished && styles.ghostBtnOn]}
                onPress={handleWishlist}
              >
                <Ionicons
                  name={wished ? 'heart' : 'heart-outline'}
                  size={15}
                  color={wished ? '#E11D48' : '#78736A'}
                />
                <Text style={[styles.ghostText, wished && { color: '#E11D48' }]}>
                  {wished ? 'Đã lưu' : 'Lưu yêu thích'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={handleChat}>
                <Ionicons name="chatbubble-ellipses-outline" size={15} color="#78736A" />
                <Text style={styles.ghostText}>Chat với Shop</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.uniqueNote}>
              * Mặt hàng độc bản (Unique Specimen 1/1). Khi người khác hoàn tất thanh toán, sản phẩm
              sẽ tự động đóng niêm yết.
            </Text>
          </View>

          {/* Circular callout */}
          <View style={styles.circularCard}>
            <Text style={styles.circularEmoji}>🔄</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.circularTitle}>Vòng đời tuần hoàn khép kín</Text>
              <Text style={styles.circularText}>{product.circularOriginNote}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsCard}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {TABS.map((t) => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setActiveTab(t.key)}
                style={[styles.tabBtn, activeTab === t.key && styles.tabBtnOn]}
              >
                <Text style={[styles.tabText, activeTab === t.key && styles.tabTextOn]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.tabBody}>
            {activeTab === 'desc' && (
              <View style={{ gap: 10 }}>
                <Text style={styles.tabHeading}>Mô tả sản phẩm</Text>
                {product.descriptionPoints.map((p, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{p}</Text>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'audit' && (
              <View style={{ gap: 10 }}>
                <Text style={styles.tabHeading}>Chi tiết tình trạng (Audit Bench)</Text>
                <View style={styles.auditBox}>
                  {product.auditRows.map((row, i) => (
                    <View key={i} style={[styles.auditRow, i > 0 && styles.auditRowBorder]}>
                      <Text style={styles.auditLabel}>{row.label}</Text>
                      <Text style={[styles.auditValue, row.mono && styles.mono]}>{row.value}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.auditNote}>{product.auditNote}</Text>
              </View>
            )}

            {activeTab === 'origin' && (
              <View style={{ gap: 10 }}>
                <Text style={styles.tabHeading}>Nguồn gốc & Lịch sử ReUse</Text>
                <View style={styles.originBox}>
                  <Text style={styles.originBoxTitle}>Quy chế chuyển đổi Second-Life:</Text>
                  <Text style={styles.originBoxText}>{product.circularOriginNote}</Text>
                </View>
                {product.rentalCycles > 0 && (
                  <Text style={styles.bulletText}>
                    Sản phẩm đã phục vụ{' '}
                    <Text style={{ fontWeight: '700', color: '#1C1A18' }}>
                      {product.rentalCycles} kỳ thuê
                    </Text>{' '}
                    ngắn hạn trước khi chuyển sang THRIFT.
                  </Text>
                )}
              </View>
            )}

            {activeTab === 'shipping' && (
              <View style={{ gap: 10 }}>
                <Text style={styles.tabHeading}>Thông tin vận chuyển & Nhận hàng</Text>
                {product.shippingPoints.map((p, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Feather name="truck" size={13} color="#1C1A18" style={{ marginTop: 2 }} />
                    <Text style={styles.bulletText}>{p}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Related */}
        {related.length > 0 && (
          <View style={styles.relatedSection}>
            <View style={styles.relatedHeader}>
              <View>
                <Text style={styles.relatedKicker}>GỢI Ý TƯƠNG ĐỒNG</Text>
                <Text style={styles.relatedTitle}>Có thể bạn cũng thích</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Main', { screen: 'ThriftTab' })}
              >
                <Text style={styles.relatedAll}>Xem tất cả →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.relatedGrid}>
              {related.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={styles.relatedCard}
                  activeOpacity={0.88}
                  onPress={() => navigation.push('ThriftDetail', { productId: r.id })}
                >
                  <View style={styles.relatedImgWrap}>
                    <Image
                      source={{ uri: normalizeImageUrl(r.image) }}
                      style={styles.relatedImg}
                      resizeMode="cover"
                    />
                    <View style={styles.relatedSrc}>
                      <Text style={styles.relatedSrcText}>{r.sourceLabel}</Text>
                    </View>
                    <View style={styles.relatedCond}>
                      <Text style={styles.relatedCondText}>{r.condition}</Text>
                    </View>
                  </View>
                  <View style={styles.relatedInfo}>
                    <Text style={styles.relatedCat} numberOfLines={1}>
                      {r.categoryLabel} · {r.location}
                    </Text>
                    <Text style={styles.relatedName} numberOfLines={1}>
                      {r.title}
                    </Text>
                    <View style={styles.relatedBottom}>
                      <View>
                        <Text style={styles.relatedPriceKicker}>GIÁ MUA TRỌN GÓI</Text>
                        <Text style={styles.relatedPrice}>{formatCurrency(r.price)}</Text>
                      </View>
                      <View style={styles.relatedBtn}>
                        <Text style={styles.relatedBtnText}>Xem</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky bottom bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomSafe}>
        <View style={styles.bottomBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bottomKicker}>GIÁ MUA TRỌN GÓI</Text>
            <Text style={styles.bottomPrice}>{formatCurrency(product.price)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.bottomBtn, isSoldOut && { opacity: 0.5 }]}
            onPress={handleBuyNow}
            disabled={isSoldOut}
            activeOpacity={0.88}
          >
            <Text style={styles.bottomBtnText}>
              {isSoldOut ? 'ĐÃ BÁN HẾT' : user ? 'MUA NGAY' : 'ĐĂNG NHẬP ĐỂ MUA'}
            </Text>
            <Feather name="arrow-right" size={15} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <GuestAuthModal
        visible={guestModalVisible}
        onClose={() => setGuestModalVisible(false)}
        actionText={guestActionText}
      />
    </View>
  );
};

export default ThriftDetailScreen;

const INK = '#1C1A18';
const MUTED = '#78736A';
const LINE = '#E7E2DA';
const CREAM = '#FBF9F5';
const SAND = '#F4F0EA';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  scrollContent: { paddingBottom: 110 },

  topBarSafe: { backgroundColor: CREAM },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
    fontSize: 15,
    fontWeight: '700',
    color: INK,
  },
  topBarRight: { flexDirection: 'row', gap: 8 },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: SAND,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeDotText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bcLink: { fontSize: 12, color: MUTED },
  bcSep: { fontSize: 12, color: LINE },
  bcCurrent: { flex: 1, fontSize: 12, color: INK, fontWeight: '600' },

  galleryCard: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: LINE,
    padding: 8,
  },
  galleryFrame: {
    height: GALLERY_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: SAND,
  },
  galleryImage: { width: '100%', height: '100%' },
  galleryBadges: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  auditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: INK,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  auditBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  sourceBadge: {
    backgroundColor: 'rgba(244,239,234,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: LINE,
  },
  sourceBadgeText: { color: INK, fontSize: 10, fontWeight: '600' },
  galleryFooter: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.62)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  specimenText: { flex: 1, color: 'rgba(255,255,255,0.9)', fontSize: 10 },
  sealRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sealDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#B4C292' },
  sealText: { color: '#D5DFC3', fontSize: 10 },

  thumbRow: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: SAND,
    padding: 3,
  },
  thumbActive: { borderWidth: 2, borderColor: INK },
  thumbImg: { width: '100%', height: '100%', borderRadius: 8 },

  noteCard: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: LINE,
    padding: 12,
  },
  noteIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: SAND,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteTitle: { fontSize: 12, fontWeight: '700', color: INK },
  noteText: { fontSize: 11, color: MUTED, lineHeight: 16, marginTop: 2 },

  body: { paddingHorizontal: 16, paddingTop: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaCategory: { fontSize: 11, fontWeight: '800', color: MUTED, letterSpacing: 0.6 },
  metaDot: { color: LINE },
  metaLocation: { fontSize: 12, color: MUTED },
  originPill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#F4EFEA',
    borderWidth: 1,
    borderColor: LINE,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  originPillText: { fontSize: 11, fontWeight: '600', color: INK },
  title: { fontSize: 24, fontWeight: '800', color: INK, lineHeight: 30, marginTop: 10 },
  subtitle: { fontSize: 13, color: MUTED, lineHeight: 19, marginTop: 6 },
  condRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  condPill: {
    flexDirection: 'row',
    gap: 5,
    backgroundColor: SAND,
    borderWidth: 1,
    borderColor: LINE,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  condLabel: { fontSize: 12, color: MUTED, fontWeight: '500' },
  condValue: { fontSize: 12, color: INK, fontWeight: '800' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingScore: { fontSize: 13, fontWeight: '700', color: INK },
  ratingCount: { fontSize: 12, color: MUTED },

  priceCard: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: LINE,
    padding: 16,
    gap: 14,
  },
  priceTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  priceKicker: { fontSize: 10, fontWeight: '800', color: MUTED, letterSpacing: 0.6 },
  priceLine: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 3, flexWrap: 'wrap' },
  priceMain: { fontSize: 26, fontWeight: '800', color: INK },
  priceOld: { fontSize: 12, color: MUTED, textDecorationLine: 'line-through' },
  discountPill: {
    backgroundColor: SAND,
    borderWidth: 1,
    borderColor: LINE,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: { fontSize: 10, fontWeight: '700', color: INK },
  vatText: { fontSize: 10, color: MUTED, marginTop: 4 },

  verifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(244,240,234,0.7)',
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 12,
    padding: 10,
  },
  verifiedAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedAvatarText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  verifiedName: { fontSize: 12, fontWeight: '700', color: INK },
  verifiedRole: { fontSize: 10, color: MUTED },
  verifiedTag: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  verifiedTagText: { fontSize: 10, fontWeight: '700', color: '#047857' },

  reassureGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 },
  reassureItem: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 6 },
  reassureText: { flex: 1, fontSize: 11, color: MUTED },

  sizeBlock: { gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: LINE },
  sizeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sizeLabel: { fontSize: 11, fontWeight: '800', color: MUTED, letterSpacing: 0.4 },
  sizeValue: { color: INK, fontSize: 12 },
  sizeHint: { fontSize: 10, color: MUTED },
  sizeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sizeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#fff',
  },
  sizeBtnOn: { backgroundColor: INK, borderColor: INK },
  sizeBtnText: { fontSize: 12, fontWeight: '800', color: '#5E5A53' },
  sizeBtnTextOn: { color: '#fff' },

  stockBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(244,240,234,0.6)',
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  stockLabel: { flex: 1, fontSize: 12, color: '#5E5A53' },
  stockPill: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stockPillOut: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  stockPillText: { fontSize: 11, fontWeight: '700', color: '#065F46' },
  stockPillTextOut: { color: '#B91C1C' },

  ctaRow: { flexDirection: 'row', gap: 10 },
  ctaPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: INK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ctaPrimaryText: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.6 },
  ctaSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: SAND,
    borderWidth: 1,
    borderColor: LINE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ctaSecondaryText: { color: INK, fontSize: 12, fontWeight: '800', letterSpacing: 0.6 },
  ghostBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: LINE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ghostBtnOn: { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' },
  ghostText: { fontSize: 12, fontWeight: '600', color: MUTED },
  uniqueNote: {
    fontSize: 11,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: LINE,
  },

  circularCard: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    backgroundColor: '#F3EFE9',
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 14,
    padding: 14,
  },
  circularEmoji: { fontSize: 20 },
  circularTitle: { fontSize: 12, fontWeight: '800', color: INK, marginBottom: 2 },
  circularText: { fontSize: 11, color: MUTED, lineHeight: 17 },

  tabsCard: {
    marginHorizontal: 16,
    marginTop: 22,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: LINE,
    overflow: 'hidden',
  },
  tabsRow: { borderBottomWidth: 1, borderBottomColor: LINE },
  tabBtn: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnOn: { borderBottomColor: INK },
  tabText: { fontSize: 12, fontWeight: '600', color: MUTED },
  tabTextOn: { color: INK, fontWeight: '800' },
  tabBody: { padding: 18 },
  tabHeading: { fontSize: 14, fontWeight: '800', color: INK },
  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bullet: { color: INK, fontWeight: '800', marginTop: 1 },
  bulletText: { flex: 1, fontSize: 12, color: MUTED, lineHeight: 19 },
  auditBox: {
    backgroundColor: 'rgba(244,240,234,0.5)',
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 12,
  },
  auditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  auditRowBorder: { borderTopWidth: 1, borderTopColor: LINE },
  auditLabel: { flex: 1, fontSize: 12, color: MUTED },
  auditValue: { flex: 1, textAlign: 'right', fontSize: 12, fontWeight: '700', color: INK },
  mono: { fontFamily: 'monospace' },
  auditNote: { fontSize: 11, fontStyle: 'italic', color: MUTED, lineHeight: 16 },
  originBox: {
    backgroundColor: 'rgba(244,240,234,0.8)',
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 12,
    padding: 14,
  },
  originBoxTitle: { fontSize: 12, fontWeight: '800', color: INK, marginBottom: 6 },
  originBoxText: { fontSize: 11, color: MUTED, lineHeight: 17 },

  relatedSection: { marginTop: 26, paddingHorizontal: 16 },
  relatedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    marginBottom: 14,
  },
  relatedKicker: { fontSize: 10, fontWeight: '800', color: MUTED, letterSpacing: 0.6 },
  relatedTitle: { fontSize: 18, fontWeight: '800', color: INK, marginTop: 2 },
  relatedAll: { fontSize: 12, fontWeight: '700', color: INK },
  relatedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  relatedCard: {
    width: RELATED_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: LINE,
    padding: 8,
  },
  relatedImgWrap: {
    height: RELATED_WIDTH * 0.8,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: SAND,
  },
  relatedImg: { width: '100%', height: '100%' },
  relatedSrc: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(244,239,234,0.92)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  relatedSrcText: { fontSize: 9, fontWeight: '600', color: INK },
  relatedCond: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: INK,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  relatedCondText: { fontSize: 9, fontWeight: '800', color: '#fff' },
  relatedInfo: { paddingTop: 8, paddingHorizontal: 2 },
  relatedCat: { fontSize: 9, fontWeight: '800', color: MUTED, letterSpacing: 0.3 },
  relatedName: { fontSize: 12, fontWeight: '800', color: INK, marginTop: 2 },
  relatedBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(231,226,218,0.6)',
  },
  relatedPriceKicker: { fontSize: 8, fontWeight: '700', color: MUTED },
  relatedPrice: { fontSize: 12, fontWeight: '800', color: INK },
  relatedBtn: {
    backgroundColor: INK,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  relatedBtnText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  bottomSafe: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: LINE,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bottomKicker: { fontSize: 9, fontWeight: '800', color: MUTED, letterSpacing: 0.5 },
  bottomPrice: { fontSize: 18, fontWeight: '800', color: INK },
  bottomBtn: {
    flex: 1.3,
    height: 48,
    borderRadius: 24,
    backgroundColor: INK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bottomBtnText: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
});
