import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getPublicThriftListingByIdApi,
  deleteThriftListingApi,
  type ThriftListingItemApi,
} from '../../../services/thrift.api';
import { normalizeImageUrl } from '../../../utils/imageUrl';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ShopThriftListingDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<ThriftListingItemApi | null>(null);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const data = await getPublicThriftListingByIdApi(id);
      if (data) {
        setListing(data);
      }
    } catch (err) {
      console.warn('Lỗi tải chi tiết món thanh lý:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xóa mục đăng THRIFT',
      'Bạn có chắc chắn muốn xóa bài đăng thanh lý này? Thao tác này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa ngay',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteThriftListingApi(id);
              Alert.alert('Thành công', 'Đã xóa bài đăng bán thanh lý.');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Lỗi', err.response?.data?.message || 'Không thể xóa mục đăng.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#1C1A18" />
        <Text style={styles.loadingText}>Đang tải thông tin sản phẩm...</Text>
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <Feather name="alert-circle" size={48} color="#A8A29E" />
        <Text style={styles.notFoundText}>Không tìm thấy thông tin sản phẩm</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = listing.images && listing.images.length > 0
    ? listing.images.map(img => normalizeImageUrl(img))
    : ['https://placehold.co/600x400'];

  const categoryName = typeof listing.categoryId === 'object' && listing.categoryId
    ? (listing.categoryId as any).name
    : 'Thời trang thanh lý';

  const isSold = listing.status === 'SOLD';
  const isFromRental = listing.sourceType === 'RENTAL_PRODUCT' || listing.sourceType === 'FROM_RENTAL';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={22} color="#1C1A18" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Chi tiết tin đăng THRIFT
        </Text>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => navigation.navigate('EditThriftListing', { id })}
        >
          <Feather name="edit-2" size={20} color="#1C1A18" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Image */}
        <View style={styles.imageGalleryContainer}>
          <Image
            source={{ uri: images[selectedImgIndex] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          {/* Status Badge */}
          <View style={styles.badgeOverlay}>
            <View
              style={[
                styles.statusBadge,
                listing.status === 'APPROVED' && styles.statusBadgeApproved,
                listing.status === 'PENDING' && styles.statusBadgePending,
                listing.status === 'SOLD' && styles.statusBadgeSold,
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {listing.status === 'APPROVED' ? 'Đã duyệt' : listing.status === 'PENDING' ? 'Chờ duyệt' : listing.status === 'SOLD' ? 'Đã bán (SOLD)' : listing.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Thumbnail Carousel */}
        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbScroll}
          >
            {images.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedImgIndex(idx)}
                style={[
                  styles.thumbWrapper,
                  selectedImgIndex === idx && styles.thumbWrapperActive,
                ]}
              >
                <Image source={{ uri: img }} style={styles.thumbImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Details Card */}
        <View style={styles.contentSection}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryBadge}>{categoryName}</Text>
            {isFromRental && (
              <View style={styles.sourceTag}>
                <Ionicons name="repeat" size={12} color="#15803D" />
                <Text style={styles.sourceTagText}>Second Life (Từ kho RENT)</Text>
              </View>
            )}
          </View>

          <Text style={styles.productTitle}>{listing.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceValue}>
              {(listing.price || 0).toLocaleString('vi-VN')} ₫
            </Text>
            {listing.originalPrice && listing.originalPrice > listing.price && (
              <Text style={styles.originalPrice}>
                {listing.originalPrice.toLocaleString('vi-VN')} ₫
              </Text>
            )}
          </View>

          {/* Escrow Guarantee Pill */}
          <View style={styles.escrowBanner}>
            <Ionicons name="shield-checkmark" size={18} color="#15803D" />
            <Text style={styles.escrowBannerText}>
              Bảo chứng Smart Escrow 72h kiểm tra độc lập trước khi giải ngân ví Shop
            </Text>
          </View>

          {/* Condition & Spec Badges */}
          <View style={styles.specsGrid}>
            <View style={styles.specCard}>
              <Text style={styles.specLabel}>Tình trạng hiện vật</Text>
              <Text style={styles.specValue}>{listing.condition || 'Rất tốt (98%)'}</Text>
            </View>
            <View style={styles.specCard}>
              <Text style={styles.specLabel}>Mã định danh SKU</Text>
              <Text style={styles.specValue}>#{listing._id.slice(-8).toUpperCase()}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.infoBlock}>
            <Text style={styles.blockTitle}>Mô tả chi tiết & Hồ sơ lưu ký</Text>
            <Text style={styles.descriptionText}>
              {listing.description || 'Không có mô tả chi tiết cho sản phẩm này.'}
            </Text>
          </View>

          {/* Audit Protocol */}
          <View style={styles.auditBlock}>
            <View style={styles.auditHeader}>
              <MaterialCommunityIcons name="seal" size={20} color="#78736A" />
              <Text style={styles.auditTitle}>Tiêu chuẩn xác thực Circular Archive</Text>
            </View>
            <Text style={styles.auditDesc}>
              Sản phẩm đã được kiểm định thủ công bởi curator xưởng, tiệt trùng công nghệ Ozone & UV-C trước khi niêm chì bảo đảm gửi tới người mua.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <>
              <Feather name="trash-2" size={18} color="#DC2626" />
              <Text style={styles.deleteBtnText}>Xóa tin</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('EditThriftListing', { id })}
        >
          <Feather name="edit-3" size={18} color="#FFFFFF" />
          <Text style={styles.editBtnText}>Chỉnh sửa bài đăng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ShopThriftListingDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FAF8F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#78736A',
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1A18',
    marginTop: 12,
  },
  backBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1C1A18',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAF8F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1A18',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageGalleryContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.85,
    backgroundColor: '#E7E5E4',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#78736A',
  },
  statusBadgeApproved: {
    backgroundColor: '#15803D',
  },
  statusBadgePending: {
    backgroundColor: '#D97706',
  },
  statusBadgeSold: {
    backgroundColor: '#6B7280',
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  thumbScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  thumbWrapper: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbWrapperActive: {
    borderColor: '#1C1A18',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  contentSection: {
    padding: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78736A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sourceTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 12,
    lineHeight: 28,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 16,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1A18',
  },
  originalPrice: {
    fontSize: 15,
    color: '#A8A29E',
    textDecorationLine: 'line-through',
  },
  escrowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  escrowBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
    lineHeight: 18,
  },
  specsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  specCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  specLabel: {
    fontSize: 11,
    color: '#78736A',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1A18',
  },
  infoBlock: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    marginBottom: 16,
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#44403C',
    lineHeight: 22,
  },
  auditBlock: {
    backgroundColor: '#F5F5F4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  auditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  auditTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
  },
  auditDesc: {
    fontSize: 12,
    color: '#78736A',
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E7E5E4',
    paddingTop: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 12,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingVertical: 14,
  },
  deleteBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  editBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1C1A18',
    borderRadius: 10,
    paddingVertical: 14,
  },
  editBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
