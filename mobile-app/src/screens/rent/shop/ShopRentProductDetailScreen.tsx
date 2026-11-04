import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { ShopHeader } from '../../../components/layout/ShopHeader';
import { useShop } from '../../../context/ShopContext';
import { formatCurrency } from '../../../utils/formatCurrency';
import { normalizeImageUrl } from '../../../utils/imageUrl';

export const ShopRentProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { products, toggleVisibility } = useShop();

  const id = route.params?.id || route.params?.sku;
  const product = products.find((p) => p.sku === id || (p as any)._id === id);

  const [activeImgIndex, setActiveImgIndex] = useState(0);

  if (!product) {
    return (
      <View style={styles.container}>
        <ShopHeader showBack />
        <View style={styles.emptyBox}>
          <Feather name="alert-circle" size={40} color="#D6D3D1" />
          <Text style={styles.emptyText}>Không tìm thấy sản phẩm #{id}</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const images = (product.inspectionImages && product.inspectionImages.length > 0)
    ? product.inspectionImages
    : [product.coverImage || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'];

  const isVisible = product.isVisible !== false;

  const handleToggleHide = async () => {
    try {
      await toggleVisibility(product.sku);
      Alert.alert(
        'Thành công',
        isVisible
          ? `Đã tạm dừng cho thuê SKU #${product.sku}. Sản phẩm đã tạm thời ẩn khỏi sàn tìm kiếm.`
          : `Đã mở cho thuê trở lại sản phẩm SKU #${product.sku}.`
      );
    } catch {
      Alert.alert('Lỗi', 'Không thể thay đổi trạng thái.');
    }
  };

  return (
    <View style={styles.container}>
      <ShopHeader showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Main Image Banner */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: normalizeImageUrl(images[activeImgIndex] || images[0]) }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <View style={styles.skuTag}>
            <Text style={styles.skuTagText}>MÃ SKU: {product.sku}</Text>
          </View>
        </View>

        {/* Thumbnail Gallery if multiple images */}
        {images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbScroll}>
            {images.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setActiveImgIndex(idx)}
                style={[styles.thumbBox, activeImgIndex === idx && styles.thumbBoxActive]}
              >
                <Image source={{ uri: normalizeImageUrl(img) }} style={styles.thumbImg} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Title & Brand */}
        <View style={styles.card}>
          <View style={styles.catRow}>
            <Text style={styles.catText}>{product.category} · {product.location || 'Toàn quốc'}</Text>
            <View style={[styles.statusBadge, isVisible ? styles.badgeGreen : styles.badgeGray]}>
              <Text style={[styles.statusBadgeText, isVisible ? styles.badgeGreenText : styles.badgeGrayText]}>
                {isVisible ? 'ĐANG HIỂN THỊ' : 'ĐANG ẨN'}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.brandText}>Thương hiệu: {product.brand || 'Chính hãng'} · Tình trạng: {product.condition || 'Như mới'}</Text>

          <View style={styles.priceRow}>
            <View style={styles.priceBlock}>
              <Text style={styles.priceLabel}>GIÁ THUÊ</Text>
              <Text style={styles.priceVal}>{formatCurrency(product.pricePerDay)}<Text style={styles.dayUnit}>/ngày</Text></Text>
            </View>
            <View style={styles.priceBlock}>
              <Text style={styles.priceLabel}>CỌC ESCROW</Text>
              <Text style={styles.depositVal}>{formatCurrency(product.deposit)}</Text>
            </View>
          </View>
        </View>

        {/* Inventory Units Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Tình trạng phân bổ hiện vật</Text>
          <View style={styles.unitsGrid}>
            <View style={styles.unitBox}>
              <Text style={styles.unitVal}>{product.totalUnits || 1}</Text>
              <Text style={styles.unitLbl}>Tổng số máy</Text>
            </View>
            <View style={styles.unitBox}>
              <Text style={[styles.unitVal, { color: '#15803D' }]}>{product.readyUnits || 0}</Text>
              <Text style={styles.unitLbl}>Sẵn sàng thuê</Text>
            </View>
            <View style={styles.unitBox}>
              <Text style={[styles.unitVal, { color: '#EA580C' }]}>{product.rentingUnits || 0}</Text>
              <Text style={styles.unitLbl}>Đang cho thuê</Text>
            </View>
            <View style={styles.unitBox}>
              <Text style={[styles.unitVal, { color: '#78736A' }]}>{product.maintenanceUnits || 0}</Text>
              <Text style={styles.unitLbl}>Bảo dưỡng</Text>
            </View>
          </View>
        </View>

        {/* Description & Rules */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Mô tả & Quy định sử dụng</Text>
          <Text style={styles.descText}>
            {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
          </Text>

          <View style={styles.divider} />
          <Text style={styles.rulesLabel}>Quy chuẩn kiểm định & Bàn giao:</Text>
          <Text style={styles.rulesText}>
            {product.rentalRules || 'Thiết bị cần được kiểm định 8 bước, khử khuẩn y tế trước khi đóng gói gửi cho khách.'}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionBtnEdit}
            onPress={() => navigation.navigate('EditRentProduct', { id: product.sku })}
          >
            <Feather name="edit" size={16} color="#1C1A18" />
            <Text style={styles.actionBtnEditText}>Chỉnh sửa thông tin</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnConvert}
            onPress={() => navigation.navigate('ConvertToThrift', { id: product.sku })}
          >
            <Feather name="repeat" size={16} color="#7E22CE" />
            <Text style={styles.actionBtnConvertText}>Chuyển sang bán THRIFT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtnPause, isVisible ? {} : { backgroundColor: '#1C1A18' }]}
            onPress={handleToggleHide}
          >
            <Feather name={isVisible ? 'pause-circle' : 'play-circle'} size={16} color={isVisible ? '#DC2626' : '#fff'} />
            <Text style={[styles.actionBtnPauseText, isVisible ? {} : { color: '#fff' }]}>
              {isVisible ? 'Tạm dừng cho thuê sản phẩm này' : 'Mở cho thuê trở lại trên sàn'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ShopRentProductDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  scroll: { paddingBottom: 40 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  emptyText: { fontSize: 14, color: '#78736A' },
  backBtn: { backgroundColor: '#1C1A18', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  backBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  imageContainer: { width: '100%', height: 260, backgroundColor: '#EBE5D8', position: 'relative' },
  mainImage: { width: '100%', height: '100%' },
  skuTag: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    backgroundColor: 'rgba(28,26,24,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skuTagText: { color: '#FAF7F2', fontSize: 10, fontWeight: '800' },
  thumbScroll: { paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  thumbBox: { width: 56, height: 56, borderRadius: 8, borderWidth: 1, borderColor: '#DFD8CC', overflow: 'hidden' },
  thumbBoxActive: { borderColor: '#1C1A18', borderWidth: 2 },
  thumbImg: { width: '100%', height: '100%' },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  catText: { fontSize: 11, fontWeight: '700', color: '#78736A' },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusBadgeText: { fontSize: 9, fontWeight: '800' },
  badgeGreen: { backgroundColor: '#DCFCE7' },
  badgeGreenText: { color: '#15803D' },
  badgeGray: { backgroundColor: '#F5F5F4' },
  badgeGrayText: { color: '#78716C' },
  title: { fontSize: 18, fontWeight: '800', color: '#1C1A18', lineHeight: 24 },
  brandText: { fontSize: 12, color: '#78736A', marginTop: 4, marginBottom: 12 },
  priceRow: {
    flexDirection: 'row',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EBE5D8',
  },
  priceBlock: { flex: 1 },
  priceLabel: { fontSize: 10, fontWeight: '800', color: '#78736A' },
  priceVal: { fontSize: 16, fontWeight: '800', color: '#15803D', marginTop: 2 },
  dayUnit: { fontSize: 11, fontWeight: 'normal', color: '#78736A' },
  depositVal: { fontSize: 15, fontWeight: '700', color: '#D97706', marginTop: 2 },
  cardSectionTitle: { fontSize: 13, fontWeight: '800', color: '#1C1A18', marginBottom: 10 },
  unitsGrid: { flexDirection: 'row', gap: 8 },
  unitBox: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBE5D8',
  },
  unitVal: { fontSize: 16, fontWeight: '800', color: '#1C1A18' },
  unitLbl: { fontSize: 9, color: '#78736A', marginTop: 2, textAlign: 'center' },
  descText: { fontSize: 13, color: '#44403C', lineHeight: 19 },
  divider: { height: 1, backgroundColor: '#F5F2EB', marginVertical: 10 },
  rulesLabel: { fontSize: 11, fontWeight: '700', color: '#1C1A18', marginBottom: 2 },
  rulesText: { fontSize: 12, color: '#57534E', lineHeight: 17 },
  actionsContainer: { paddingHorizontal: 16, marginTop: 14, gap: 10 },
  actionBtnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#1C1A18',
  },
  actionBtnEditText: { fontSize: 13, fontWeight: '800', color: '#1C1A18' },
  actionBtnConvert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FAF5FF',
    borderRadius: 12,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#D8B4FE',
  },
  actionBtnConvertText: { fontSize: 13, fontWeight: '800', color: '#7E22CE' },
  actionBtnPause: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  actionBtnPauseText: { fontSize: 13, fontWeight: '700', color: '#DC2626' },
});

