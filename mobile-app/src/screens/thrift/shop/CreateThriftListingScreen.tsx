import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppHeader } from '../../../components/layout/AppHeader';
import { useAuth } from '../../../hooks/useAuth';
import { createThriftListingApi } from '../../../services/thrift.api';
import { getCategoriesApi, CategoryItem } from '../../../services/category.api';
import { uploadImageToCloudinary } from '../../../utils/imageUrl';

const DEFAULT_PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', 'FreeSize'];

const THRIFT_CONDITIONS = [
  { key: 'like_new', label: 'Like New (98% – 99%)', desc: 'Nguyên bản, không vết ố rách, form hoàn hảo' },
  { key: 'good', label: 'Good (90% – 97%)', desc: 'Đã qua sử dụng ít lần, vải mềm sạch sẽ' },
  { key: 'fair', label: 'Fair (80% – 89%)', desc: 'Có vết thời gian hoặc dấu giặt sấy nhẹ' },
];

export const CreateThriftListingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  // Shop Location synced from Profile
  const shopProvince =
    user?.address?.province ||
    (user as any)?.shopProfile?.cityRegion ||
    'Hồ Chí Minh';
  const shopAddress =
    (user as any)?.shopProfile?.businessAddress ||
    user?.address?.detail ||
    'Địa chỉ kinh doanh đã đăng ký';

  // Categories from MongoDB
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);

  // Form State - Circular Origin (Mục B)
  const [originSource, setOriginSource] = useState<'rental_archive' | 'shop_direct'>('rental_archive');

  // Form State - Product Info (Mục C)
  const [listingTitle, setListingTitle] = useState('');
  const [category, setCategory] = useState('');
  const [brandOrigin, setBrandOrigin] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M']);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [sizeColor, setSizeColor] = useState('');
  const [skuCode, setSkuCode] = useState(`TH-CLO-${Date.now().toString().slice(-6)}`);

  // Condition & Pricing
  const [conditionGrade, setConditionGrade] = useState<'like_new' | 'good' | 'fair'>('like_new');
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [priceInput, setPriceInput] = useState('');
  const [originalPriceInput, setOriginalPriceInput] = useState('');
  const [forensicNotes, setForensicNotes] = useState('');

  // Images
  const [coverImage, setCoverImage] = useState<string>('');
  const [detailPhotos, setDetailPhotos] = useState<string[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingDetails, setUploadingDetails] = useState(false);

  // Commitments
  const [ruleCleaned, setRuleCleaned] = useState(true);
  const [ruleInspected, setRuleInspected] = useState(true);
  const [rulePackaged, setRulePackaged] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  // Load MongoDB Categories
  useEffect(() => {
    let isMounted = true;
    getCategoriesApi()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setCategories(data);
          if (data[0]) {
            setCategory(data[0].name);
          }
        }
      })
      .catch((err) => {
        console.warn('Lỗi tải danh mục THRIFT:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingCategories(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Size pills toggle
  const toggleSize = (sz: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sz) ? prev.filter((item) => item !== sz) : [...prev, sz]
    );
  };

  const handleAddCustomSize = () => {
    const trimmed = customSizeInput.trim().toUpperCase();
    if (trimmed && !selectedSizes.includes(trimmed)) {
      setSelectedSizes((prev) => [...prev, trimmed]);
    }
    setCustomSizeInput('');
  };

  // Pick Cover Photo
  const handlePickCoverImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền thư viện ảnh.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        setUploadingCover(true);
        const localUri = res.assets[0].uri;
        setCoverImage(localUri);
        try {
          const cloud = await uploadImageToCloudinary(localUri);
          if (cloud) setCoverImage(cloud);
        } catch {
          // fallback localUri
        } finally {
          setUploadingCover(false);
        }
      }
    } catch {
      setUploadingCover(false);
      Alert.alert('Lỗi', 'Không thể chọn ảnh lúc này.');
    }
  };

  // Pick Detail Photos
  const handlePickDetailImages = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền thư viện ảnh.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.85,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setUploadingDetails(true);
        const urls: string[] = [];
        for (const asset of res.assets) {
          if (asset.uri) {
            try {
              const cloud = await uploadImageToCloudinary(asset.uri);
              urls.push(cloud || asset.uri);
            } catch {
              urls.push(asset.uri);
            }
          }
        }
        setDetailPhotos((prev) => [...prev, ...urls]);
        setUploadingDetails(false);
      }
    } catch {
      setUploadingDetails(false);
      Alert.alert('Lỗi', 'Không thể thêm ảnh chi tiết.');
    }
  };

  const handleRemoveDetail = (index: number) => {
    setDetailPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Submit Listing
  const handleSubmit = async () => {
    if (!listingTitle.trim() || listingTitle.trim().length < 4) {
      Alert.alert('Lưu ý', 'Vui lòng nhập tên trang phục THRIFT (tối thiểu 4 ký tự).');
      return;
    }
    if (!category.trim()) {
      Alert.alert('Lưu ý', 'Vui lòng chọn phân mục trang phục từ Database.');
      return;
    }

    const priceNum = parseInt(priceInput.replace(/\D/g, ''), 10);
    if (!priceNum || priceNum < 20000) {
      Alert.alert('Lưu ý', 'Vui lòng nhập giá bán đứt THRIFT hợp lệ (tối thiểu 20.000 ₫).');
      return;
    }

    if (!ruleCleaned || !ruleInspected || !rulePackaged) {
      Alert.alert('Lưu ý', 'Vui lòng đánh dấu xác nhận đầy đủ 3 cam kết chuẩn bị & bàn giao trang phục.');
      return;
    }

    setSubmitting(true);
    try {
      const matchedCat = categories.find((c) => c.name === category || c._id === category) || categories[0];
      const allImages = [coverImage, ...detailPhotos].filter(Boolean);

      await createThriftListingApi({
        name: listingTitle.trim(),
        title: listingTitle.trim(),
        price: priceNum,
        originalPrice: parseInt(originalPriceInput.replace(/\D/g, ''), 10) || Math.round(priceNum * 1.35),
        condition: conditionGrade.toUpperCase(),
        conditionLevel: conditionGrade === 'like_new' ? '99' : conditionGrade === 'good' ? '95' : '85',
        sourceType: originSource === 'rental_archive' ? 'FROM_RENTAL' : 'MANUAL',
        source: originSource === 'rental_archive' ? 'rent' : 'consignment',
        sourceLabel:
          originSource === 'rental_archive'
            ? 'Chuyển giao từ Kho RENT (Second Life Item)'
            : 'Kho xưởng ký gửi (Consignment)',
        location: shopProvince,
        categoryId: matchedCat?._id || '67c000000000000000000001',
        description: forensicNotes.trim() || `${listingTitle.trim()} - Sizes: ${selectedSizes.join(', ')} - SKU: ${skuCode}`,
        images: allImages.length > 0 ? allImages : ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80'],
        status: 'PENDING_APPROVAL',
      });

      Alert.alert(
        'Đăng thành công',
        `Sản phẩm THRIFT "${listingTitle}" đã được gửi lên hệ thống và chuyển đến Admin phê duyệt!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || err?.message || 'Không thể tạo bài đăng THRIFT.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedConditionObj =
    THRIFT_CONDITIONS.find((c) => c.key === conditionGrade) || THRIFT_CONDITIONS[0];

  return (
    <View style={styles.container}>
      <AppHeader title="Đăng Bán Đồ THRIFT" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Banner Cloudinary CDN */}
        <View style={styles.infoBanner}>
          <Feather name="shield" size={16} color="#4D6B50" />
          <Text style={styles.infoBannerText}>
            Hình ảnh lưu trên <Text style={{ fontWeight: '700' }}>Cloudinary CDN</Text>, thông tin đồng bộ <Text style={{ fontWeight: '700' }}>MongoDB</Text> thẩm định bài đăng.
          </Text>
        </View>

        {/* SECTION A: Hình ảnh trang phục & Thẩm định chi tiết */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="image" size={18} color="#576151" />
              <Text style={styles.sectionTitle}>A. Hình ảnh trang phục & Thẩm định chi tiết</Text>
            </View>
            <View style={styles.cdnBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.cdnBadgeText}>Cloudinary CDN</Text>
            </View>
          </View>

          {/* Cover image */}
          <Text style={styles.label}>
            ẢNH BÌA CHÍNH DIỆN (COVER IMAGE) <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.coverBox}
            onPress={handlePickCoverImage}
            activeOpacity={0.85}
            disabled={uploadingCover}
          >
            {coverImage ? (
              <View style={styles.coverPreviewContainer}>
                <Image source={{ uri: coverImage }} style={styles.coverPreview} resizeMode="cover" />
                <View style={styles.changeOverlay}>
                  <Text style={styles.changeOverlayText}>Chạm để đổi ảnh bìa</Text>
                </View>
              </View>
            ) : (
              <View style={styles.coverPlaceholder}>
                <View style={styles.coverIconCircle}>
                  <Feather name="camera" size={22} color="#576151" />
                </View>
                <Text style={styles.coverPlaceholderTitle}>Tải ảnh bìa chính diện</Text>
                <Text style={styles.coverPlaceholderSub}>Ảnh đại diện hiển thị nổi bật trên sàn THRIFT</Text>
              </View>
            )}

            {uploadingCover && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.loadingOverlayText}>Đang tải lên Cloudinary...</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Detail angles */}
          <View style={styles.divider} />
          <View style={styles.subHeaderRow}>
            <Text style={styles.label}>
              BỘ ẢNH GÓC CHỤP CHI TIẾT (TỐI THIỂU 3 GÓC) <Text style={styles.required}>*</Text>
            </Text>
            <Text
              style={[
                styles.countBadge,
                detailPhotos.length >= 3 ? styles.countBadgeSuccess : styles.countBadgeWarning,
              ]}
            >
              {detailPhotos.length} ảnh đã nạp
            </Text>
          </View>
          <Text style={styles.hintText}>
            Gợi ý: Mặt trước, Mặt sau, Cận cảnh chất vải, Đường may hoặc Nhãn tag để Admin thẩm định.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.detailsScroll}>
            {detailPhotos.map((uri, idx) => (
              <View key={idx} style={styles.detailImageBox}>
                <Image source={{ uri }} style={styles.detailThumb} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.removeDetailBtn}
                  onPress={() => handleRemoveDetail(idx)}
                >
                  <Feather name="x" size={12} color="#fff" />
                </TouchableOpacity>
                <View style={styles.detailBadge}>
                  <Text style={styles.detailBadgeText}>Góc {idx + 1}</Text>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addDetailBox}
              onPress={handlePickDetailImages}
              disabled={uploadingDetails}
            >
              {uploadingDetails ? (
                <ActivityIndicator size="small" color="#576151" />
              ) : (
                <>
                  <Feather name="plus-circle" size={24} color="#576151" />
                  <Text style={styles.addDetailText}>+ Thêm góc ảnh</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* SECTION B: Nguồn gốc tuần hoàn (Circular Origin) - Khớp Hình 2 */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="recycle" size={20} color="#576151" />
              <Text style={styles.sectionTitle}>B. Nguồn gốc tuần hoàn (Circular Origin)</Text>
            </View>
            <View style={styles.greenTag}>
              <Text style={styles.greenTagText}>Tiêu chuẩn ReUse Hub</Text>
            </View>
          </View>

          {/* 2 Radio Cards */}
          <TouchableOpacity
            style={[
              styles.originCard,
              originSource === 'rental_archive' && styles.originCardActive,
            ]}
            onPress={() => setOriginSource('rental_archive')}
            activeOpacity={0.85}
          >
            <View style={styles.originHeader}>
              <Text style={styles.originTitle}>Chuyển giao từ Kho RENT</Text>
              <Ionicons
                name={originSource === 'rental_archive' ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={originSource === 'rental_archive' ? '#576151' : '#9C958B'}
              />
            </View>
            <Text style={styles.originDesc}>
              Second Life Item — Trang phục hoàn tất chu kỳ cho thuê chất lượng cao, đã bảo dưỡng để bán đứt.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.originCard,
              originSource === 'shop_direct' && styles.originCardActive,
            ]}
            onPress={() => setOriginSource('shop_direct')}
            activeOpacity={0.85}
          >
            <View style={styles.originHeader}>
              <Text style={styles.originTitle}>Kho xưởng ký gửi (Consignment)</Text>
              <Ionicons
                name={originSource === 'shop_direct' ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={originSource === 'shop_direct' ? '#576151' : '#9C958B'}
              />
            </View>
            <Text style={styles.originDesc}>
              Trang phục thời trang sưu tầm hoặc ký gửi bảo chứng độc lập từ bộ sưu tập cá nhân / atelier.
            </Text>
          </TouchableOpacity>

          {/* Verification note underneath */}
          <View style={styles.verifiedBox}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#576151" />
            <Text style={styles.verifiedText}>
              {originSource === 'rental_archive'
                ? 'Hiện vật liên kết mã chu kỳ cho thuê trong kho RENT. Mức độ khấu hao và lý lịch giặt hấp được xác thực tự động.'
                : 'Trang phục ký gửi độc lập. Admin sẽ đối chiếu nhãn tag thương hiệu và kiểm định chất liệu vải vật lý.'}
            </Text>
          </View>
        </View>

        {/* SECTION C: Thông tin trang phục & Phân loại - Khớp Hình 3 */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="tshirt-crew-outline" size={20} color="#576151" />
              <Text style={styles.sectionTitle}>C. Thông tin trang phục & Phân loại</Text>
            </View>
          </View>

          {/* Tên trang phục bán đứt */}
          <Text style={styles.label}>
            TÊN TRANG PHỤC BÁN ĐỨT (LISTING TITLE) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Đầm Dạ Hội Lụa Satin Cúp Ngực Phối Ren Cao Cấp..."
            placeholderTextColor="#9C958B"
            value={listingTitle}
            onChangeText={setListingTitle}
          />

          {/* Phân mục & Thương hiệu */}
          <View style={styles.rowTwo}>
            <View style={styles.flexOne}>
              <Text style={styles.label}>
                PHÂN MỤC TRANG PHỤC <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.selectorBtn}
                onPress={() => setShowCategoryModal(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={category ? styles.selectorTextActive : styles.selectorPlaceholder}
                  numberOfLines={1}
                >
                  {category || (loadingCategories ? 'Đang tải...' : '-- Chọn phân mục --')}
                </Text>
                <Feather name="chevron-down" size={16} color="#7B766F" />
              </TouchableOpacity>
            </View>

            <View style={styles.flexOne}>
              <Text style={styles.label}>THƯƠNG HIỆU / NHÀ THIẾT KẾ</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Chanel, Dior, Thiết kế..."
                placeholderTextColor="#9C958B"
                value={brandOrigin}
                onChangeText={setBrandOrigin}
              />
            </View>
          </View>

          {/* KÍCH CỠ BÁN (SIZES AVAILABLE) - Khớp Hình 3 */}
          <View style={styles.sizesBox}>
            <View style={styles.sizesHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="maximize-2" size={14} color="#576151" />
                <Text style={styles.sizesTitle}>
                  KÍCH CỠ BÁN (SIZES AVAILABLE) <Text style={styles.required}>*</Text>
                </Text>
              </View>
              <Text style={styles.sizesSub}>Chọn các size có sẵn để khách chọn ở trang chi tiết sản phẩm</Text>
            </View>

            {/* Size Pills */}
            <View style={styles.sizesPillsContainer}>
              {DEFAULT_PRESET_SIZES.map((sz) => {
                const isSelected = selectedSizes.includes(sz);
                return (
                  <TouchableOpacity
                    key={sz}
                    style={[styles.sizePill, isSelected && styles.sizePillActive]}
                    onPress={() => toggleSize(sz)}
                  >
                    <Text style={[styles.sizePillText, isSelected && styles.sizePillTextActive]}>
                      {isSelected ? `✓ ${sz}` : sz}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* Custom sizes added */}
              {selectedSizes
                .filter((sz) => !DEFAULT_PRESET_SIZES.includes(sz))
                .map((customSz) => (
                  <TouchableOpacity
                    key={customSz}
                    style={[styles.sizePill, styles.sizePillActive]}
                    onPress={() => toggleSize(customSz)}
                  >
                    <Text style={[styles.sizePillText, styles.sizePillTextActive]}>
                      ✓ {customSz} ✕
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>

            {/* Input thêm size khác */}
            <View style={styles.addCustomSizeRow}>
              <TextInput
                style={styles.customSizeInput}
                placeholder="Thêm size khác (vd: 39, 40...)"
                placeholderTextColor="#9C958B"
                value={customSizeInput}
                onChangeText={setCustomSizeInput}
                onSubmitEditing={handleAddCustomSize}
              />
              <TouchableOpacity style={styles.addCustomSizeBtn} onPress={handleAddCustomSize}>
                <Text style={styles.addCustomSizeBtnText}>+ Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Màu sắc & SKU */}
          <View style={styles.rowTwo}>
            <View style={styles.flexOne}>
              <Text style={styles.label}>MÀU SẮC & CHẤT LIỆU (MÔ TẢ PHỤ)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Màu Nâu Vintage, Lụa Satin..."
                placeholderTextColor="#9C958B"
                value={sizeColor}
                onChangeText={setSizeColor}
              />
            </View>

            <View style={styles.flexOne}>
              <Text style={styles.label}>MÃ SKU PHÂN LOẠI XƯỞNG</Text>
              <TextInput
                style={[styles.input, { fontFamily: 'monospace' }]}
                value={skuCode}
                onChangeText={setSkuCode}
              />
            </View>
          </View>

          {/* Kho xuất hàng Card (Đồng bộ từ Profile Shop) - Khớp Hình 3 */}
          <View style={styles.shopLocationCard}>
            <View style={styles.shopLocationHeader}>
              <Text style={styles.shopLocationTitle}>
                KHO XUẤT HÀNG <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.syncedBadge}>
                <Ionicons name="storefront-outline" size={12} color="#2D6A4F" />
                <Text style={styles.syncedBadgeText}>Đồng bộ từ Profile Shop</Text>
              </View>
            </View>

            <View style={styles.locationInnerBox}>
              <View style={styles.locationLeft}>
                <Ionicons name="location-sharp" size={20} color="#576151" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.locationCity}>{shopProvince}</Text>
                  <Text style={styles.locationStreet} numberOfLines={1}>
                    {shopAddress}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile')}
                style={styles.updateLocationLink}
              >
                <Text style={styles.updateLocationText}>Cập nhật</Text>
                <Feather name="external-link" size={12} color="#576151" />
              </TouchableOpacity>
            </View>

            <Text style={styles.locationFootnote}>
              Hệ thống tự động tính cước vận chuyển giao nhận bảo chứng tới người mua dựa trên địa chỉ cửa hàng này.
            </Text>
          </View>
        </View>

        {/* SECTION D: Giá bán & Tình trạng */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="tag" size={18} color="#576151" />
              <Text style={styles.sectionTitle}>D. Định giá & Báo cáo tình trạng vi vết</Text>
            </View>
          </View>

          <View style={styles.rowTwo}>
            <View style={styles.flexOne}>
              <Text style={styles.label}>
                GIÁ BÁN ĐỨT THRIFT (VND) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: 350000"
                placeholderTextColor="#9C958B"
                keyboardType="numeric"
                value={priceInput}
                onChangeText={setPriceInput}
              />
            </View>

            <View style={styles.flexOne}>
              <Text style={styles.label}>GIÁ GỐC THAM CHIẾU (VND)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: 890000"
                placeholderTextColor="#9C958B"
                keyboardType="numeric"
                value={originalPriceInput}
                onChangeText={setOriginalPriceInput}
              />
            </View>
          </View>

          <Text style={styles.label}>CẤP ĐỘ TÌNH TRẠNG (CONDITION GRADE)</Text>
          <TouchableOpacity
            style={styles.selectorBtn}
            onPress={() => setShowConditionModal(true)}
            activeOpacity={0.8}
          >
            <View>
              <Text style={styles.selectorTextActive}>{selectedConditionObj.label}</Text>
              <Text style={{ fontSize: 11, color: '#7B766F', marginTop: 2 }}>{selectedConditionObj.desc}</Text>
            </View>
            <Feather name="chevron-down" size={18} color="#7B766F" />
          </TouchableOpacity>

          <Text style={styles.label}>BÁO CÁO THẨM ĐỊNH & GHI CHÚ CHẤT LIỆU</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholder="Mô tả cụ thể về chất liệu vải, độ bóng, độ sờn và các chi tiết kiểm định quang học..."
            placeholderTextColor="#9C958B"
            value={forensicNotes}
            onChangeText={setForensicNotes}
          />

          {/* 3 Cam kết kiểm định */}
          <Text style={[styles.label, { marginTop: 12 }]}>CAM KẾT KIỂM ĐỊNH CHẤT LƯỢNG</Text>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setRuleCleaned(!ruleCleaned)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={ruleCleaned ? 'checkbox' : 'square-outline'}
              size={20}
              color={ruleCleaned ? '#141310' : '#9C958B'}
            />
            <Text style={styles.checkboxLabel}>
              Xác nhận trang phục đã được xử lý giặt khô, khử khuẩn UV-C
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setRuleInspected(!ruleInspected)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={ruleInspected ? 'checkbox' : 'square-outline'}
              size={20}
              color={ruleInspected ? '#141310' : '#9C958B'}
            />
            <Text style={styles.checkboxLabel}>
              Xác nhận kiểm tra kỹ lưỡng đường kim mũi chỉ, nhãn mác rõ ràng
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setRulePackaged(!rulePackaged)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={rulePackaged ? 'checkbox' : 'square-outline'}
              size={20}
              color={rulePackaged ? '#141310' : '#9C958B'}
            />
            <Text style={styles.checkboxLabel}>
              Đóng gói bảo chứng với tem niêm phong ReUse Hub
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="shield" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>GỬI PHÊ DUYỆT THRIFT LISTING</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Category */}
      <Modal visible={showCategoryModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Phân Mục (MongoDB)</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Feather name="x" size={20} color="#141310" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 350 }}>
              {categories.map((c) => {
                const isSelected = category === c.name;
                return (
                  <TouchableOpacity
                    key={c._id}
                    style={[styles.modalItem, isSelected && styles.modalItemActive]}
                    onPress={() => {
                      setCategory(c.name);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text style={[styles.modalItemText, isSelected && styles.modalItemTextActive]}>
                      {c.name}
                    </Text>
                    {isSelected && <Feather name="check" size={16} color="#141310" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Condition */}
      <Modal visible={showConditionModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Cấp Độ Tình Trạng</Text>
              <TouchableOpacity onPress={() => setShowConditionModal(false)}>
                <Feather name="x" size={20} color="#141310" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 350 }}>
              {THRIFT_CONDITIONS.map((c) => {
                const isSelected = conditionGrade === c.key;
                return (
                  <TouchableOpacity
                    key={c.key}
                    style={[styles.modalItem, isSelected && styles.modalItemActive]}
                    onPress={() => {
                      setConditionGrade(c.key as any);
                      setShowConditionModal(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalItemText, isSelected && styles.modalItemTextActive]}>
                        {c.label}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#7B766F', marginTop: 2 }}>{c.desc}</Text>
                    </View>
                    {isSelected && <Feather name="check" size={16} color="#141310" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF9F2',
  },
  scroll: {
    padding: 16,
    paddingBottom: 48,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF3EC',
    borderWidth: 1,
    borderColor: '#D4E0D2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#344535',
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EBE8E1',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1EEE7',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sectionTitle: {
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: '700',
    color: '#141310',
  },
  greenTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  greenTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  cdnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  cdnBadgeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#065F46',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#141310',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 10,
  },
  required: {
    color: '#DC2626',
  },
  input: {
    backgroundColor: '#FBF9F4',
    borderWidth: 1,
    borderColor: '#E4DFD5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#141310',
  },
  textarea: {
    minHeight: 70,
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FBF9F4',
    borderWidth: 1,
    borderColor: '#E4DFD5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  selectorTextActive: {
    fontSize: 13,
    fontWeight: '600',
    color: '#141310',
  },
  selectorPlaceholder: {
    fontSize: 13,
    color: '#9C958B',
  },
  coverBox: {
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4CEC3',
    borderStyle: 'dashed',
    backgroundColor: '#FBF9F4',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPreviewContainer: {
    width: '100%',
    height: '100%',
  },
  coverPreview: {
    width: '100%',
    height: '100%',
  },
  changeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  changeOverlayText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  coverPlaceholder: {
    alignItems: 'center',
    padding: 16,
  },
  coverIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  coverPlaceholderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141310',
    marginBottom: 2,
  },
  coverPlaceholderSub: {
    fontSize: 11,
    color: '#7B766F',
  },
  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingOverlayText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1EEE7',
    marginVertical: 14,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countBadge: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countBadgeSuccess: {
    backgroundColor: '#ECFDF5',
    color: '#065F46',
  },
  countBadgeWarning: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  hintText: {
    fontSize: 11,
    color: '#7B766F',
    marginBottom: 10,
  },
  detailsScroll: {
    flexDirection: 'row',
  },
  detailImageBox: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CFC9BD',
    backgroundColor: '#F7F3EC',
  },
  detailThumb: {
    width: '100%',
    height: '100%',
  },
  removeDetailBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#DC2626',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  detailBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  addDetailBox: {
    width: 90,
    height: 90,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CFC9BD',
    borderStyle: 'dashed',
    backgroundColor: '#FAF8F4',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  addDetailText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#576151',
  },
  originCard: {
    backgroundColor: '#FBF9F4',
    borderWidth: 1,
    borderColor: '#EBE8E1',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  originCardActive: {
    backgroundColor: '#F7F5ED',
    borderColor: '#576151',
  },
  originHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  originTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141310',
  },
  originDesc: {
    fontSize: 11,
    color: '#7B766F',
    lineHeight: 16,
  },
  verifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBF9F4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EBE8E1',
    padding: 10,
    marginTop: 4,
    gap: 8,
  },
  verifiedText: {
    flex: 1,
    fontSize: 11,
    color: '#7B766F',
    lineHeight: 16,
  },
  sizesBox: {
    backgroundColor: '#FBF9F4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4DFD5',
    padding: 12,
    marginTop: 10,
  },
  sizesHeader: {
    marginBottom: 8,
  },
  sizesTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#141310',
    textTransform: 'uppercase',
  },
  sizesSub: {
    fontSize: 10,
    color: '#7B766F',
    marginTop: 2,
  },
  sizesPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  sizePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4DFD5',
  },
  sizePillActive: {
    backgroundColor: '#141310',
    borderColor: '#141310',
  },
  sizePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#576151',
  },
  sizePillTextActive: {
    color: '#FFFFFF',
  },
  addCustomSizeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  customSizeInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4DFD5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: '#141310',
  },
  addCustomSizeBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4DFD5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  addCustomSizeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#141310',
  },
  shopLocationCard: {
    backgroundColor: '#F7F3EC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4DFD5',
    padding: 12,
    marginTop: 12,
  },
  shopLocationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  shopLocationTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#141310',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  syncedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  syncedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  locationInnerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CFC9BD',
    padding: 10,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationCity: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141310',
  },
  locationStreet: {
    fontSize: 11,
    color: '#7B766F',
    marginTop: 1,
  },
  updateLocationLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  updateLocationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#576151',
    textDecorationLine: 'underline',
  },
  locationFootnote: {
    fontSize: 10,
    color: '#7B766F',
    marginTop: 8,
    lineHeight: 14,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 12,
  },
  flexOne: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    gap: 8,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: '#141310',
    lineHeight: 18,
  },
  submitBtn: {
    backgroundColor: '#141310',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    maxHeight: 450,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1EEE7',
    paddingBottom: 12,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#141310',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F5ED',
  },
  modalItemActive: {
    backgroundColor: '#F7F5ED',
  },
  modalItemText: {
    fontSize: 13,
    color: '#141310',
  },
  modalItemTextActive: {
    fontWeight: '700',
  },
});

export default CreateThriftListingScreen;
