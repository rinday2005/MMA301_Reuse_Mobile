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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppHeader } from '../../../components/layout/AppHeader';
import { useShop } from '../../../context/ShopContext';
import { uploadImageToCloudinary, normalizeImageUrl } from '../../../utils/imageUrl';

const CATEGORIES = [
  { slug: 'camera', name: 'Camera' },
  { slug: 'shoes', name: 'Giày dép' },
  { slug: 'clothing', name: 'Quần áo' },
  { slug: 'dam-du-tiec', name: 'Đầm dự tiệc' },
  { slug: 'phu-kien', name: 'Phụ kiện' },
  { slug: 'electronics', name: 'Thiết bị điện tử' },
  { slug: 'camping', name: 'Dã ngoại & Cắm trại' },
];

const CONDITIONS = [
  { key: 'NEW', label: 'Mới 100%' },
  { key: 'LIKE_NEW', label: 'Như mới (99%)' },
  { key: 'GOOD', label: 'Tốt (90%)' },
  { key: 'FAIR', label: 'Khá (80%)' },
];

const LOCATIONS = ['Đà Nẵng', 'Hồ Chí Minh', 'Hà Nội'];

export const EditRentProductScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { products, updateProduct } = useShop();

  const sku = route.params?.id || route.params?.sku;
  const product = products.find((p) => p.sku === sku || (p as any)._id === sku);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [brand, setBrand] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [deposit, setDeposit] = useState('');
  const [replacementValue, setReplacementValue] = useState('');
  const [totalUnits, setTotalUnits] = useState('1');
  const [condition, setCondition] = useState('LIKE_NEW');
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [description, setDescription] = useState('');
  const [rentalRules, setRentalRules] = useState('');
  const [imageUri, setImageUri] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setCategory(product.category || CATEGORIES[0].name);
      setBrand(product.brand || '');
      setPricePerDay(String(product.pricePerDay || ''));
      setDeposit(String(product.deposit || ''));
      setReplacementValue(String(product.replacementValue || ''));
      setTotalUnits(String(product.totalUnits || 1));
      setCondition(product.condition || 'LIKE_NEW');
      setLocation(product.location || LOCATIONS[0]);
      setDescription(product.description || '');
      setRentalRules(product.rentalRules || '');
      setImageUri(product.coverImage || '');
    }
  }, [product]);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để đổi ảnh sản phẩm.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setUploadingImage(true);
        const localUri = result.assets[0].uri;
        setImageUri(localUri);

        try {
          const cloudUrl = await uploadImageToCloudinary(localUri);
          if (cloudUrl) setImageUri(cloudUrl);
        } catch {
          // ignore
        } finally {
          setUploadingImage(false);
        }
      }
    } catch {
      setUploadingImage(false);
      Alert.alert('Lỗi', 'Không thể chọn ảnh.');
    }
  };

  const handleUpdate = async () => {
    if (!product) return;
    if (!name.trim()) {
      Alert.alert('Thông báo', 'Tên sản phẩm không được để trống.');
      return;
    }

    const priceNum = parseInt(pricePerDay.replace(/\D/g, ''), 10);
    if (!priceNum || priceNum <= 0) {
      Alert.alert('Thông báo', 'Vui lòng nhập giá thuê/ngày hợp lệ.');
      return;
    }

    setSubmitting(true);
    try {
      await updateProduct(product.sku, {
        name: name.trim(),
        category,
        brand: brand.trim(),
        pricePerDay: priceNum,
        deposit: parseInt(deposit.replace(/\D/g, ''), 10) || product.deposit,
        replacementValue: parseInt(replacementValue.replace(/\D/g, ''), 10) || product.replacementValue,
        totalUnits: parseInt(totalUnits, 10) || product.totalUnits,
        condition,
        location,
        description: description.trim(),
        rentalRules: rentalRules.trim(),
        coverImage: imageUri || product.coverImage,
      });

      Alert.alert('Thành công', `Đã cập nhật sản phẩm ${product.sku}!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể cập nhật sản phẩm.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) {
    return (
      <View style={styles.container}>
        <AppHeader title="Chỉnh sửa sản phẩm" showBack />
        <View style={styles.emptyBox}>
          <Feather name="alert-circle" size={40} color="#D6D3D1" />
          <Text style={styles.emptyText}>Không tìm thấy sản phẩm #{sku}</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title={`Sửa SKU #${product.sku}`} showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Image Picker */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Hình ảnh đại diện</Text>
          <TouchableOpacity style={styles.imageBox} onPress={handlePickImage} activeOpacity={0.85}>
            {imageUri ? (
              <Image source={{ uri: normalizeImageUrl(imageUri) }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Feather name="upload-cloud" size={32} color="#78736A" />
                <Text style={styles.uploadText}>Chạm để đổi ảnh</Text>
              </View>
            )}
            {uploadingImage && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Basic Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>

          <Text style={styles.label}>TÊN THIẾT BỊ / TRANG PHỤC (*)</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.label}>DANH MỤC (*)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {CATEGORIES.map((c) => {
              const selected = category === c.name;
              return (
                <TouchableOpacity
                  key={c.slug}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => setCategory(c.name)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>{c.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.rowTwo}>
            <View style={styles.flexOne}>
              <Text style={styles.label}>THƯƠNG HIỆU</Text>
              <TextInput style={styles.input} value={brand} onChangeText={setBrand} />
            </View>
            <View style={styles.flexOne}>
              <Text style={styles.label}>SỐ LƯỢNG MÁY / HIỆN VẬT</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={totalUnits} onChangeText={setTotalUnits} />
            </View>
          </View>

          <Text style={styles.label}>TÌNH TRẠNG</Text>
          <View style={styles.conditionsGrid}>
            {CONDITIONS.map((c) => {
              const selected = condition === c.key;
              return (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.conditionBtn, selected && styles.conditionBtnActive]}
                  onPress={() => setCondition(c.key)}
                >
                  <Text style={[styles.conditionBtnText, selected && styles.conditionBtnTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Định giá thuê & Cọc Escrow</Text>
          <View style={styles.rowTwo}>
            <View style={styles.flexOne}>
              <Text style={styles.label}>GIÁ THUÊ / NGÀY (VNĐ)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={pricePerDay} onChangeText={setPricePerDay} />
            </View>
            <View style={styles.flexOne}>
              <Text style={styles.label}>TIỀN CỌC ESCROW (VNĐ)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={deposit} onChangeText={setDeposit} />
            </View>
          </View>
          <Text style={styles.label}>GIÁ TRỊ THAY THẾ (VNĐ)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={replacementValue} onChangeText={setReplacementValue} />
        </View>

        {/* Location & Policies */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cơ sở & Quy định</Text>
          <Text style={styles.label}>CHI NHÁNH</Text>
          <View style={styles.locRow}>
            {LOCATIONS.map((loc) => {
              const selected = location === loc;
              return (
                <TouchableOpacity
                  key={loc}
                  style={[styles.locBtn, selected && styles.locBtnActive]}
                  onPress={() => setLocation(loc)}
                >
                  <Text style={[styles.locBtnText, selected && styles.locBtnTextActive]}>{loc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>MÔ TẢ CHI TIẾT</Text>
          <TextInput
            style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>QUY ĐỊNH THUÊ</Text>
          <TextInput
            style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
            multiline
            value={rentalRules}
            onChangeText={setRentalRules}
          />
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          disabled={submitting}
          activeOpacity={0.85}
          onPress={handleUpdate}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="save" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Lưu cập nhật sản phẩm</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default EditRentProductScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  scroll: { padding: 16, paddingBottom: 40 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  emptyText: { fontSize: 14, color: '#78736A' },
  backBtn: { backgroundColor: '#1C1A18', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  backBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#1C1A18', marginBottom: 10 },
  imageBox: {
    height: 180,
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFD8CC',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: { width: '100%', height: '100%' },
  uploadPlaceholder: { alignItems: 'center', gap: 4 },
  uploadText: { fontSize: 13, fontWeight: '700', color: '#1C1A18' },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 10, fontWeight: '800', color: '#78736A', letterSpacing: 0.6, marginTop: 10, marginBottom: 6 },
  input: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#DFD8CC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1C1A18',
  },
  chipsScroll: { flexDirection: 'row', marginBottom: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#DFD8CC',
    marginRight: 6,
  },
  chipActive: { backgroundColor: '#1C1A18', borderColor: '#1C1A18' },
  chipText: { fontSize: 11, fontWeight: '600', color: '#57534E' },
  chipTextActive: { color: '#FAF7F2', fontWeight: '700' },
  rowTwo: { flexDirection: 'row', gap: 10 },
  flexOne: { flex: 1 },
  conditionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  conditionBtn: {
    flex: 1,
    minWidth: '46%',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DFD8CC',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
  },
  conditionBtnActive: { borderColor: '#1C1A18', backgroundColor: '#1C1A18' },
  conditionBtnText: { fontSize: 12, fontWeight: '600', color: '#57534E' },
  conditionBtnTextActive: { color: '#FAF7F2', fontWeight: '700' },
  locRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  locBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DFD8CC',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
  },
  locBtnActive: { borderColor: '#1C1A18', backgroundColor: '#1C1A18' },
  locBtnText: { fontSize: 12, fontWeight: '600', color: '#57534E' },
  locBtnTextActive: { color: '#FAF7F2', fontWeight: '700' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1C1A18',
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
