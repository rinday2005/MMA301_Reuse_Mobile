import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';
import { GuestAuthModal } from '../../components/common/GuestAuthModal';
import { MarketplaceCard } from '../../components/marketplace/MarketplaceCard';
import { useAuth } from '../../hooks/useAuth';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { normalizeImageUrl } from '../../utils/imageUrl';
import { mapRentItem, mapThriftItem, MarketItem } from '../../utils/marketplaceMapper';
import { getPublicRentProductsApi } from '../../services/rentProduct.api';
import { getPublicThriftListingsApi } from '../../services/thrift.api';
import { getCategoriesApi, CategoryItem } from '../../services/category.api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_IMG = normalizeImageUrl('./src/assets/images/dashboard.jpg');

// Ảnh danh mục ở trang chủ web (cùng bộ ảnh), số lượng lấy từ DB
const HOME_CATEGORY_IMAGES: Record<string, string> = {
  camera: 'camerahome.jpg',
  shoes: 'shoeshome.jpg',
  'dam-du-tiec': 'partydresshome.jpg',
  clothing: 'clotheshome.jpg',
  'phu-kien': 'accessoryhome.jpg',
};

const LOOP_STEPS = [
  {
    no: '01 / NHẬP HÀNG & THẨM ĐỊNH',
    title: 'Kiểm tra đầu vào',
    desc: 'Sản phẩm từ đối tác được đánh giá cảm quan, kiểm tra chức năng quang học/cơ học và khử trùng sinh học.',
    foot: 'Tiêu chuẩn chuẩn hóa 100%',
  },
  {
    no: '02 / CHO THUÊ RENT',
    title: 'Tối đa vòng quay',
    desc: 'Khách hàng đặt thuê theo nhu cầu thực tế với chính sách cọc minh bạch và hoàn tiền nhanh sau kiểm tra.',
    foot: 'Trung bình 8 – 15 chu kỳ thuê',
  },
  {
    no: '03 / BẢO DƯỠNG & SPA',
    title: 'Phục hồi chuyên sâu',
    desc: 'Sau mỗi lượt sử dụng, sản phẩm được làm sạch, hiệu chuẩn máy hoặc bảo dưỡng da để duy trì phẩm chất gốc.',
    foot: 'Bảo dưỡng sau mỗi lượt trả',
  },
  {
    no: '04 / CHUYỂN TIẾP THRIFT',
    title: 'Vòng đời mới',
    desc: 'Khi kết thúc chu kỳ cho thuê, sản phẩm được bán đứt với mức giá ưu đãi, loại bỏ hoàn toàn việc thải bỏ.',
    foot: 'Giảm thiểu 100% rác thải rắn',
  },
];

const USE_STEPS = [
  { no: '01', title: 'Tìm & Chọn món đồ', desc: 'Lựa chọn giữa thuê theo ngày (RENT) hoặc mua đứt đồ đã qua sử dụng (THRIFT) trên hệ thống.' },
  { no: '02', title: 'Xác nhận & Nhận hàng', desc: 'Chủ shop xác nhận tình trạng, giao hàng kèm biên bản niêm phong và tem kiểm định chất lượng.' },
  { no: '03', title: 'Trải nghiệm & Sử dụng', desc: 'Tự do sử dụng cho sự kiện, chuyến đi hoặc công việc với sự hỗ trợ kỹ thuật trực tuyến liên tục.' },
  { no: '04', title: 'Trả đồ hoặc Giữ lại', desc: 'Trả đồ nhẹ nhàng qua bưu cục hoàn cọc trong 24h, hoặc mua lại trực tiếp nếu bạn muốn sở hữu lâu dài.' },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { toggleWishlist, isWishlisted } = useCartWishlist();

  const [rent, setRent] = useState<MarketItem[]>([]);
  const [thrift, setThrift] = useState<MarketItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [guestVisible, setGuestVisible] = useState(false);

  const load = useCallback(async () => {
    const [r, t, c] = await Promise.all([
      getPublicRentProductsApi({ limit: 4 }),
      getPublicThriftListingsApi(),
      getCategoriesApi(),
    ]);
    setRent(r.slice(0, 4).map((x, i) => mapRentItem(x, i)));
    setThrift(
      t
        .filter((x: any) => x.status !== 'SOLD')
        .slice(0, 4)
        .map((x, i) => mapThriftItem(x, i))
    );
    setCategories(c.filter((x) => x.isActive !== false));
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onWishlist = (it: MarketItem) => {
    if (!user) {
      setGuestVisible(true);
      return;
    }
    toggleWishlist(it.id, it.mode === 'rent' ? 'RENT' : 'THRIFT');
  };

  const goDetail = (it: MarketItem) =>
    navigation.navigate(it.mode === 'rent' ? 'RentProductDetail' : 'ThriftDetail', {
      productId: it.id,
      product: it,
    });

  const renderGrid = (list: MarketItem[]) => (
    <View style={styles.grid}>
      {list.map((it) => (
        <MarketplaceCard
          key={it.id}
          item={it}
          wished={isWishlisted(it.id)}
          onPress={() => goDetail(it)}
          onToggleWishlist={() => onWishlist(it)}
        />
      ))}
    </View>
  );

  const sectionHead = (kicker: string, title: string, link: string, onLink: () => void) => (
    <View style={styles.secHead}>
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.secTitle}>{title}</Text>
      <TouchableOpacity style={styles.secLinkRow} onPress={onLink}>
        <Text style={styles.secLink}>{link}</Text>
        <Feather name="arrow-right" size={14} color="#1C1A18" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.announce}>
        <Ionicons name="shield-checkmark" size={13} color="#fff" />
        <Text style={styles.announceText} numberOfLines={1}>
          Thuê an tâm với Smart Escrow: ký quỹ an toàn, hoàn cọc tự động
        </Text>
      </View>
      <AppHeader />

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
        {/* 1. HERO */}
        <View style={styles.hero}>
          <View style={styles.pill}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText}>KINH TẾ TUẦN HOÀN · RENT & THRIFT MARKETPLACE</Text>
          </View>
          <Text style={styles.heroTitle}>Dùng nhiều hơn.</Text>
          <Text style={[styles.heroTitle, styles.heroItalic]}>Sở hữu ít hơn.</Text>
          <Text style={styles.heroSub}>
            Nền tảng lưu thông sản phẩm cao cấp: Thuê trang phục, máy ảnh và thiết bị dã ngoại khi bạn
            cần ngắn hạn; hoặc sở hữu lại đồ đã qua sử dụng với chất lượng được chứng thực nghiêm ngặt.
          </Text>
          <View style={styles.heroBtns}>
            <TouchableOpacity style={styles.btnDark} onPress={() => navigation.navigate('RentTab')}>
              <Text style={styles.btnDarkText}>KHÁM PHÁ RENT</Text>
              <Feather name="arrow-right" size={14} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnLight} onPress={() => navigation.navigate('ThriftTab')}>
              <Text style={styles.btnLightText}>MUA ĐỒ THRIFT</Text>
              <Feather name="shopping-bag" size={14} color="#1C1A18" />
            </TouchableOpacity>
          </View>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>10,000+</Text>
              <Text style={styles.statLabel}>Sản phẩm lưu thông</Text>
            </View>
            <View style={styles.statLine} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>100%</Text>
              <Text style={styles.statLabel}>Kiểm định chuẩn hóa</Text>
            </View>
            <View style={styles.statLine} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>0 Rác thải</Text>
              <Text style={styles.statLabel}>Mục tiêu trọn đời</Text>
            </View>
          </View>

          <View style={styles.heroImgWrap}>
            <Image source={{ uri: HERO_IMG }} style={styles.heroImg} resizeMode="cover" />
            <View style={styles.heroTags}>
              <View style={styles.tagDark}>
                <Text style={styles.tagDarkText}>RENT</Text>
              </View>
              <View style={styles.tagLight}>
                <Text style={styles.tagLightText}>THRIFT</Text>
              </View>
            </View>
            <View style={styles.heroNote}>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroNoteKicker}>QUY CHUẨN THẨM ĐỊNH</Text>
                <Text style={styles.heroNoteText}>Chứng thực nguồn gốc & vệ sinh y tế</Text>
              </View>
              <Ionicons name="checkmark-circle" size={22} color="#1C1A18" />
            </View>
          </View>
        </View>

        {/* 2. DANH MỤC (DB) */}
        <View style={styles.section}>
          {sectionHead('DANH MỤC TUẦN HOÀN', 'Khám phá theo nhu cầu', 'Xem tất cả danh mục', () =>
            navigation.navigate('CategoriesTab')
          )}
          {loading ? (
            <ActivityIndicator color="#1C1A18" style={{ marginVertical: 24 }} />
          ) : (
            <View style={styles.catGrid}>
              {categories.slice(0, 6).map((c) => {
                const homeImg = HOME_CATEGORY_IMAGES[c.slug];
                const uri = homeImg
                  ? normalizeImageUrl(`./src/assets/images/${homeImg}`)
                  : normalizeImageUrl(c.image);
                const total = (c.rentCount || 0) + (c.thriftCount || 0);
                return (
                  <TouchableOpacity
                    key={c._id}
                    style={styles.catCard}
                    activeOpacity={0.9}
                    onPress={() =>
                      navigation.navigate(
                        (c.rentCount || 0) > 0 ? 'RentTab' : 'ThriftTab',
                        { category: c.slug }
                      )
                    }
                  >
                    <View style={styles.catImgWrap}>
                      <Image source={{ uri }} style={styles.catImg} resizeMode="cover" />
                    </View>
                    <Text style={styles.catName} numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text style={styles.catCount} numberOfLines={1}>
                      {total} sản phẩm
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* 3. RENT (DB) */}
        <View style={[styles.section, styles.sectionTint]}>
          {sectionHead(
            '01 · BỘ SƯU TẬP CHO THUÊ',
            'Thuê những gì bạn chỉ cần dùng ngắn hạn',
            'Xem tất cả sản phẩm RENT',
            () => navigation.navigate('RentTab')
          )}
          {loading ? <ActivityIndicator color="#1C1A18" style={{ marginVertical: 24 }} /> : renderGrid(rent)}
        </View>

        {/* 4. THRIFT (DB) */}
        <View style={styles.section}>
          {sectionHead(
            '02 · BỘ SƯU TẬP TÁI SỬ DỤNG',
            'Cho những món đồ chất lượng một vòng đời mới',
            'Xem tất cả sản phẩm THRIFT',
            () => navigation.navigate('ThriftTab')
          )}
          {loading ? <ActivityIndicator color="#1C1A18" style={{ marginVertical: 24 }} /> : renderGrid(thrift)}
        </View>

        {/* 5. MÔ HÌNH TUẦN HOÀN */}
        <View style={[styles.section, styles.sectionTint]}>
          <Text style={styles.kicker}>MÔ HÌNH TUẦN HOÀN KHÉP KÍN</Text>
          <Text style={styles.secTitleBig}>Hành trình tuần hoàn của một sản phẩm</Text>
          <Text style={styles.para}>
            Mỗi sản phẩm khi đưa vào hệ thống đều được cấp mã định danh để giám sát vòng đời: từ cho
            thuê ngắn hạn, trả hàng kiểm định, cho đến sang nhượng THRIFT cho chủ nhân tiếp theo.
          </Text>
          {LOOP_STEPS.map((s) => (
            <View key={s.no} style={styles.loopCard}>
              <Text style={styles.loopNo}>{s.no}</Text>
              <Text style={styles.loopTitle}>{s.title}</Text>
              <Text style={styles.loopDesc}>{s.desc}</Text>
              <View style={styles.loopFoot}>
                <Text style={styles.loopFootText}>{s.foot}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 6. QUY TRÌNH 4 BƯỚC */}
        <View style={styles.section}>
          <Text style={styles.kicker}>QUY TRÌNH SỬ DỤNG</Text>
          <Text style={styles.secTitleBig}>Trải nghiệm tinh giản trong 4 bước</Text>
          <View style={{ marginTop: 14 }}>
            {USE_STEPS.map((s) => (
              <View key={s.no} style={styles.useStep}>
                <Text style={styles.useNo}>{s.no}</Text>
                <Text style={styles.useTitle}>{s.title}</Text>
                <Text style={styles.useDesc}>{s.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 7. CTA */}
        <View style={styles.cta}>
          <View style={styles.ctaIcon}>
            <Text style={styles.ctaIconText}>∞</Text>
          </View>
          <Text style={styles.ctaTitle}>Sẵn sàng gia nhập cộng đồng tiêu dùng bền vững?</Text>
          <Text style={styles.ctaSub}>
            Khám phá hàng ngàn sản phẩm được chia sẻ và tái sử dụng mỗi ngày. Tiết kiệm chi phí, giải
            phóng không gian sống và cùng giảm thiểu phát thải rác.
          </Text>
          <TouchableOpacity style={styles.ctaBtnWhite} onPress={() => navigation.navigate('RentTab')}>
            <Text style={styles.ctaBtnWhiteText}>BẮT ĐẦU THUÊ NGAY</Text>
            <Feather name="arrow-right" size={14} color="#1C1A18" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaBtnOutline} onPress={() => navigation.navigate('ThriftTab')}>
            <Text style={styles.ctaBtnOutlineText}>XEM KHO HÀNG THRIFT</Text>
          </TouchableOpacity>
          {!user && (
            <TouchableOpacity
              style={styles.ctaRegister}
              onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
            >
              <Text style={styles.ctaRegisterText}>Tạo tài khoản miễn phí →</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <GuestAuthModal
        visible={guestVisible}
        onClose={() => setGuestVisible(false)}
        actionText="lưu sản phẩm vào danh sách yêu thích"
      />
    </View>
  );
};

export default HomeScreen;

const INK = '#1C1A18';
const MUTED = '#78736A';
const LINE = '#E7E2DA';
const CAT_W = (SCREEN_WIDTH - 32 - 24) / 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF9F5' },
  scroll: { paddingBottom: 40 },
  announce: {
    backgroundColor: INK,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  announceText: { color: '#E7E2DA', fontSize: 11, fontWeight: '500' },

  hero: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 26, borderBottomWidth: 1, borderBottomColor: LINE },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#F4F0EA',
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 14,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: INK },
  pillText: { fontSize: 9, fontWeight: '800', color: INK, letterSpacing: 0.5 },
  heroTitle: { fontSize: 38, fontWeight: '700', color: INK, lineHeight: 44, fontFamily: 'serif' },
  heroItalic: { fontStyle: 'italic', fontWeight: '400' },
  heroSub: { fontSize: 14, color: '#5E5A53', lineHeight: 22, marginTop: 12 },
  heroBtns: { flexDirection: 'row', gap: 10, marginTop: 18 },
  btnDark: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: INK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnDarkText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  btnLight: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: LINE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnLightText: { color: INK, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: LINE,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 17, fontWeight: '800', color: INK, fontFamily: 'serif' },
  statLabel: { fontSize: 10, color: MUTED, marginTop: 2, textAlign: 'center' },
  statLine: { width: 1, height: 28, backgroundColor: LINE },
  heroImgWrap: {
    marginTop: 22,
    height: SCREEN_WIDTH * 1.05,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#fff',
  },
  heroImg: { width: '100%', height: '100%' },
  heroTags: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', gap: 8 },
  tagDark: { backgroundColor: INK, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 4 },
  tagDarkText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  tagLight: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagLightText: { color: INK, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroNote: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 6,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroNoteKicker: { fontSize: 9, fontWeight: '800', color: MUTED, letterSpacing: 0.8 },
  heroNoteText: { fontSize: 12, fontWeight: '700', color: INK, marginTop: 2 },

  section: { paddingHorizontal: 16, paddingVertical: 30 },
  sectionTint: { backgroundColor: 'rgba(244,240,234,0.55)', borderTopWidth: 1, borderBottomWidth: 1, borderColor: LINE },
  secHead: { marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: LINE },
  kicker: { fontSize: 10, fontWeight: '800', color: MUTED, letterSpacing: 1 },
  secTitle: { fontSize: 22, fontWeight: '700', color: INK, marginTop: 4, lineHeight: 28, fontFamily: 'serif' },
  secTitleBig: { fontSize: 25, fontWeight: '700', color: INK, marginTop: 4, lineHeight: 31, fontFamily: 'serif' },
  secLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  secLink: { fontSize: 11, fontWeight: '800', color: INK, letterSpacing: 0.5 },
  para: { fontSize: 13, color: '#5E5A53', lineHeight: 20, marginTop: 10, marginBottom: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },

  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  catCard: {
    width: '31.8%',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: LINE,
    padding: 6,
  },
  catImgWrap: { aspectRatio: 1, borderRadius: 6, overflow: 'hidden', backgroundColor: '#F4F0EA', marginBottom: 6 },
  catImg: { width: '100%', height: '100%' },
  catName: { fontSize: 11, fontWeight: '700', color: INK },
  catCount: { fontSize: 9, color: MUTED, marginTop: 1 },

  loopCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: LINE,
    padding: 18,
    marginTop: 12,
  },
  loopNo: { fontSize: 11, fontWeight: '800', color: MUTED, fontFamily: 'monospace' },
  loopTitle: { fontSize: 18, fontWeight: '700', color: INK, marginTop: 10, fontFamily: 'serif' },
  loopDesc: { fontSize: 12, color: '#5E5A53', lineHeight: 19, marginTop: 6 },
  loopFoot: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: LINE },
  loopFootText: { fontSize: 11, fontWeight: '700', color: INK },

  useStep: { borderTopWidth: 1, borderTopColor: INK, paddingTop: 14, paddingBottom: 22 },
  useNo: { fontSize: 12, fontWeight: '800', color: INK, fontFamily: 'monospace' },
  useTitle: { fontSize: 15, fontWeight: '700', color: INK, marginTop: 6 },
  useDesc: { fontSize: 12, color: '#5E5A53', lineHeight: 19, marginTop: 5 },

  cta: {
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: INK,
    borderRadius: 14,
    padding: 26,
    alignItems: 'center',
  },
  ctaIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  ctaIconText: { color: '#fff', fontSize: 22 },
  ctaTitle: { color: '#FBF9F5', fontSize: 24, fontWeight: '700', textAlign: 'center', lineHeight: 30, fontFamily: 'serif' },
  ctaSub: { color: 'rgba(231,226,218,0.85)', fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 12 },
  ctaBtnWhite: {
    marginTop: 20,
    height: 46,
    alignSelf: 'stretch',
    borderRadius: 23,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ctaBtnWhiteText: { color: INK, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  ctaBtnOutline: {
    marginTop: 10,
    height: 46,
    alignSelf: 'stretch',
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnOutlineText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  ctaRegister: { marginTop: 16 },
  ctaRegisterText: { color: '#D5DFC3', fontSize: 12, fontWeight: '700' },
});
