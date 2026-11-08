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
import { useShop } from '../../../context/ShopContext';
import { getCategoriesApi, CategoryItem } from '../../../services/category.api';
import { uploadImageToCloudinary } from '../../../utils/imageUrl';

const RENT_CONDITIONS = [
  { key: 'LIKE_NEW', label: 'Như mới (99% – Mặc diễn 1 lần, form hoàn hảo)' },
  { key: 'NEW', label: 'Mới 100% (Brand New – Nguyên tag)' },
  { key: 'GOOD', label: 'Tốt (95% – Vải mềm, không xước cúc khóa)' },
  { key: 'FAIR', label: 'Khá (90% – Có dấu vết sử dụng nhẹ)' },
];

export const CreateRentProductScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { addProduct } = useShop();

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

  // Form states
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [brand, setBrand] = useState('');
  const [sizeColor, setSizeColor] = useState('');
  const [condition, setCondition] = useState<string>(RENT_CONDITIONS[0].key);
  const [showConditionModal, setShowConditionModal] = useState<boolean>(false);
  const [accessories, setAccessories] = useState('Kèm bao bọc chống bụi và móc treo cao cấp');
  const [description, setDescription] = useState('');

  // Pricing & units
  const [pricePerDay, setPricePerDay] = useState('');
  const [deposit, setDeposit] = useState('');
  const [totalUnits, setTotalUnits] = useState('1');
  const [minDays, setMinDays] = useState('1');
  const [maxDays, setMaxDays] = useState('30');

  // Images
  const [coverImage, setCoverImage] = useState<string>('');
  const [detailImages, setDetailImages] = useState<string[]>([]);
  const [uploadingCover, setUploadingCover] = useState<boolean>(false);
  const [uploadingDetails, setUploadingDetails] = useState<boolean>(false);

  // Compliance rules
  const [ruleCleaned, setRuleCleaned] = useState(true);
  const [ruleInspected, setRuleInspected] = useState(true);
  const [rulePackaged, setRulePackaged] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  // Fetch categories from MongoDB
  useEffect(() => {
    let isMounted = true;
    getCategoriesApi()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          const rentCats = data.filter((c) => c.type === 'RENT' || c.type === 'BOTH' || c.isActive);
          const list = rentCats.length > 0 ? rentCats : data;
          setCategories(list);
          if (list[0]) {
            setSelectedCategory(list[0].name);
          }
        }
      })
      .catch((err) => {
        console.warn('Lỗi tải categories:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingCategories(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Pick Cover Image
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
          const cloudUrl = await uploadImageToCloudinary(localUri);
          if (cloudUrl) setCoverImage(cloudUrl);
        } catch {
          // keep localUri fallback
        } finally {
          setUploadingCover(false);
        }
      }
    } catch {
      setUploadingCover(false);
      Alert.alert('Lỗi', 'Không thể chọn ảnh bìa lúc này.');
    }
  };

  // Pick Detail Images
  const handlePickDetailImage = async () => {
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
        const newUris: string[] = [];
        for (const asset of res.assets) {
          if (asset.uri) {
            try {
              const cloud = await uploadImageToCloudinary(asset.uri);
              newUris.push(cloud || asset.uri);
            } catch {
              newUris.push(asset.uri);
            }
          }
        }
        setDetailImages((prev) => [...prev, ...newUris]);
        setUploadingDetails(false);
      }
    } catch {
      setUploadingDetails(false);
      Alert.alert('Lỗi', 'Không thể thêm ảnh chi tiết.');
    }
  };

  const handleRemoveDetailImage = (index: number) => {
    setDetailImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit
  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Lưu ý', 'Vui lòng nhập tên trang phục / set đồ cho thuê.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Lưu ý', 'Vui lòng chọn phân mục trang phục từ Database.');
      return;
    }
    if (!brand.trim()) {
      Alert.alert('Lưu ý', 'Vui lòng nhập thương hiệu hoặc nhà thiết kế.');
      return;
    }
    if (!sizeColor.trim()) {
      Alert.alert('Lưu ý', 'Vui lòng nhập kích cỡ (Size) và màu sắc.');
      return;
    }

    const priceNum = parseInt(pricePerDay.replace(/\D/g, ''), 10);
    if (!priceNum || priceNum < 20000) {
      Alert.alert('Lưu ý', 'Giá thuê theo ngày tối thiểu là 20.000 ₫/ngày.');
      return;
    }

    const depositNum = parseInt(deposit.replace(/\D/g, ''), 10) || Math.round(priceNum * 2.5);
    const unitsNum = parseInt(totalUnits, 10) || 1;

    if (!ruleCleaned || !ruleInspected || !rulePackaged) {
      Alert.alert('Lưu ý', 'Vui lòng đánh dấu xác nhận đầy đủ 3 cam kết bàn giao trang phục.');
      return;
    }

    setSubmitting(true);
    try {
      const sku = `RENT-${Math.floor(1000 + Math.random() * 9000)}`;
      await addProduct({
        sku,
        name: name.trim(),
        category: selectedCategory,
        brand: brand.trim(),
        pricePerDay: priceNum,
        deposit: depositNum,
        totalUnits: unitsNum,
        readyUnits: unitsNum,
        rentingUnits: 0,
        maintenanceUnits: 0,
        condition,
        location: shopProvince,
        minDays: parseInt(minDays, 10) || 1,
        maxDays: parseInt(maxDays, 10) || 30,
        description: description.trim() || `${name.trim()} - Size & Màu: ${sizeColor.trim()}`,
        rentalRules: `Phụ kiện kèm: ${accessories.trim()}. Bảo quản cẩn thận theo quy chuẩn ReUse Hub.`,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
        inspectionImages: detailImages.length > 0 ? detailImages : (coverImage ? [coverImage] : []),
      });

      Alert.alert(
        'Đăng thành công',
        `Trang phục "${name}" đã được gửi lên hệ thống và chuyển đến Admin thẩm định!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể tạo sản phẩm cho thuê.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedConditionObj =
    RENT_CONDITIONS.find((c) => c.key === condition) || RENT_CONDITIONS[0];

  return (
    <View style={styles.container}>
      <AppHeader title="Đăng Đồ Cho Thuê (RENT)" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Banner Cloudinary CDN */}
        <View style={styles.infoBanner}>
          <Feather name="cloud" size={16} color="#4D6B50" />
          <Text style={styles.infoBannerText}>
            Hình ảnh lưu trực tiếp trên <Text style={{ fontWeight: '700' }}>Cloudinary CDN</Text>, thông tin đồng bộ <Text style={{ fontWeight: '700' }}>MongoDB</Text>.
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

          {/* Cover Image */}
          <Text style={styles.label}>
            ẢNH BÌA CHÍNH (COVER IMAGE) <Text style={styles.required}>*</Text>
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
                  <Text style={styles.changeOverlayText}>Chạm để đổi ảnh</Text>
                </View>
              </View>
            ) : (
              <View style={styles.coverPlaceholder}>
                <View style={styles.coverIconCircle}>
                  <Feather name="camera" size={22} color="#576151" />
                </View>
                <Text style={styles.coverPlaceholderTitle}>Chọn ảnh bìa chính diện</Text>
                <Text style={styles.coverPlaceholderSub}>Chạm vào ô này để tải từ máy lên Cloudinary</Text>
              </View>
            )}

            {uploadingCover && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.loadingOverlayText}>Đang tải lên Cloudinary...</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Technical Angle Images */}
          <View style={styles.divider} />
          <View style={styles.subHeaderRow}>
            <Text style={styles.label}>
              ẢNH CHI TIẾT 3 GÓC CHỤP (TỐI THIỂU 3 ẢNH) <Text style={styles.required}>*</Text>
            </Text>
            <Text
              style={[
                styles.countBadge,
                detailImages.length >= 3 ? styles.countBadgeSuccess : styles.countBadgeWarning,
              ]}
            >
              Đã chọn: {detailImages.length}/3
            </Text>
          </View>
          <Text style={styles.hintText}>
            Gợi ý góc chụp: 1) Mặt sau • 2) Cận cảnh đường may, cúc áo, khóa kéo • 3) Nhãn mác xuất xứ.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.detailsScroll}>
            {detailImages.map((uri, idx) => (
              <View key={idx} style={styles.detailImageBox}>
                <Image source={{ uri }} style={styles.detailThumb} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.removeDetailBtn}
                  onPress={() => handleRemoveDetailImage(idx)}
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
              onPress={handlePickDetailImage}
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

        {/* SECTION B: Thông tin trang phục & Phân loại */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="tshirt-crew-outline" size={20} color="#576151" />
              <Text style={styles.sectionTitle}>B. Thông tin trang phục & Phân loại</Text>
            </View>
          </View>

          {/* Tên trang phục */}
          <Text style={styles.label}>
            TÊN TRANG PHỤC / SET ĐỒ CHO THUÊ <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Đầm Dạ Hội Maxi Kim Sa Ánh Bạc Cúp Ngực, Áo Dài Gấm Tơ Tằm..."
            placeholderTextColor="#9C958B"
            value={name}
            onChangeText={setName}
          />

          {/* Phân mục & Thương hiệu */}
          <Text style={styles.label}>
            PHÂN MỤC (DANH MỤC TỪ DATABASE) <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.selectorBtn}
            onPress={() => setShowCategoryModal(true)}
            activeOpacity={0.8}
          >
            <Text style={selectedCategory ? styles.selectorTextActive : styles.selectorPlaceholder}>
              {selectedCategory || (loadingCategories ? 'Đang tải danh mục...' : '-- Chọn danh mục thực tế --')}
            </Text>
            <Feather name="chevron-down" size={18} color="#7B766F" />
          </TouchableOpacity>

          <Text style={styles.label}>
            THƯƠNG HIỆU / NHÀ THIẾT KẾ <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Elise, NEM, Zara, H&M, Thiết kế may đo..."
            placeholderTextColor="#9C958B"
            value={brand}
            onChangeText={setBrand}
          />

          {/* Size & Màu sắc */}
          <Text style={styles.label}>
            KÍCH CỠ (SIZE) & MÀU SẮC <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Size M (Eo 68–72cm) • Màu Đỏ Ruby, Trắng Sữa..."
            placeholderTextColor="#9C958B"
            value={sizeColor}
            onChangeText={setSizeColor}
          />

          {/* Tình trạng trang phục */}
          <Text style={styles.label}>TÌNH TRẠNG TRANG PHỤC</Text>
          <TouchableOpacity
            style={styles.selectorBtn}
            onPress={() => setShowConditionModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.selectorTextActive}>{selectedConditionObj.label}</Text>
            <Feather name="chevron-down" size={18} color="#7B766F" />
          </TouchableOpacity>

          {/* Chi nhánh kho xuất hàng Card (Đồng bộ từ Profile Shop) */}
          <View style={styles.shopLocationCard}>
            <View style={styles.shopLocationHeader}>
              <Text style={styles.shopLocationTitle}>
                CHI NHÁNH KHO / ĐỊA ĐIỂM XUẤT HÀNG <Text style={styles.required}>*</Text>
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
              * Phí Bưu tá chuyên dụng Nanuk (2 chiều) sẽ tự động tính theo khoảng cách từ địa chỉ cửa hàng này đến địa chỉ của khách thuê.
            </Text>
          </View>

          {/* Phụ kiện / Chi tiết đi kèm set đồ */}
          <Text style={styles.label}>
            PHỤ KIỆN / CHI TIẾT ĐI KÈM SET ĐỒ <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Kèm bao bọc chống bụi và móc treo cao cấp"
            placeholderTextColor="#9C958B"
            value={accessories}
            onChangeText={setAccessories}
          />

          {/* Mô tả chất liệu, form dáng */}
          <Text style={styles.label}>
            MÔ TẢ CHẤT LIỆU, FORM DÁNG & LƯU Ý SỬ DỤNG <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholder="Mô tả cụ thể về chất vải (Lụa tơ tằm, Voan, Dạ wool, Tweed...), kiểu dáng ôm hoặc suông, số đo 3 vòng khuyến nghị và các lưu ý giữ gìn khi thuê..."
            placeholderTextColor="#9C958B"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* SECTION C: Biểu phí thuê & Quy định bàn giao */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="credit-card" size={18} color="#576151" />
              <Text style={styles.sectionTitle}>C. Biểu phí thuê & Quy định bàn giao trang phục</Text>
            </View>
          </View>

          <View style={styles.rowTwo}>
            <View style={styles.flexOne}>
              <Text style={styles.label}>
                GIÁ THUÊ / NGÀY (VND) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: 180000"
                placeholderTextColor="#9C958B"
                keyboardType="numeric"
                value={pricePerDay}
                onChangeText={setPricePerDay}
              />
            </View>

            <View style={styles.flexOne}>
              <Text style={styles.label}>
                TIỀN CỌC ESCROW (VND) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: 500000"
                placeholderTextColor="#9C958B"
                keyboardType="numeric"
                value={deposit}
                onChangeText={setDeposit}
              />
            </View>
          </View>

          <View style={styles.rowThree}>
            <View style={styles.flexOne}>
              <Text style={styles.label}>SỐ LƯỢNG KHO</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={totalUnits}
                onChangeText={setTotalUnits}
              />
            </View>
            <View style={styles.flexOne}>
              <Text style={styles.label}>NGÀY THUÊ MIN</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={minDays}
                onChangeText={setMinDays}
              />
            </View>
            <View style={styles.flexOne}>
              <Text style={styles.label}>NGÀY THUÊ MAX</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={maxDays}
                onChangeText={setMaxDays}
              />
            </View>
          </View>

          {/* Compliance Checkboxes */}
          <Text style={[styles.label, { marginTop: 12 }]}>CAM KẾT CHUẨN BỊ BÀN GIAO</Text>
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
              Xác nhận trang phục đã được giặt hấp, khử khuẩn UV-C theo tiêu chuẩn
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
              Xác nhận đã kiểm tra đường may, cúc áo, khóa kéo nguyên vẹn
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
              Đóng gói kèm bao bọc chống bụi và móc treo cao cấp ReUse Hub
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="check-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>GỬI PHÊ DUYỆT TRANG PHỤC</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Chọn Danh Mục */}
      <Modal visible={showCategoryModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Danh Mục Thực Tế (MongoDB)</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Feather name="x" size={20} color="#141310" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 350 }}>
              {categories.map((c) => {
                const isSelected = selectedCategory === c.name;
                return (
                  <TouchableOpacity
                    key={c._id}
                    style={[styles.modalItem, isSelected && styles.modalItemActive]}
                    onPress={() => {
                      setSelectedCategory(c.name);
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

      {/* Modal Chọn Tình Trạng */}
      <Modal visible={showConditionModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tình Trạng Trang Phục</Text>
              <TouchableOpacity onPress={() => setShowConditionModal(false)}>
                <Feather name="x" size={20} color="#141310" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 350 }}>
              {RENT_CONDITIONS.map((c) => {
                const isSelected = condition === c.key;
                return (
                  <TouchableOpacity
                    key={c.key}
                    style={[styles.modalItem, isSelected && styles.modalItemActive]}
                    onPress={() => {
                      setCondition(c.key);
                      setShowConditionModal(false);
                    }}
                  >
                    <Text style={[styles.modalItemText, isSelected && styles.modalItemTextActive]}>
                      {c.label}
                    </Text>
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
    minHeight: 80,
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
  shopLocationCard: {
    backgroundColor: '#F7F3EC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4DFD5',
    padding: 12,
    marginVertical: 12,
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
    color: '#576151',
    marginTop: 8,
    lineHeight: 14,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 12,
  },
  rowThree: {
    flexDirection: 'row',
    gap: 10,
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

export default CreateRentProductScreen;
