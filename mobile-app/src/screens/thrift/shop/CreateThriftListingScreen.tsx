import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppHeader } from '../../../components/layout/AppHeader';
import { createThriftListingApi } from '../../../services/thrift.api';
import { uploadImageApi } from '../../../services/upload.api';

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
  { label: 'Grade Mint (99%)', level: '99' },
  { label: 'Rất tốt (95%)', level: '95' },
  { label: 'Tốt (90%)', level: '90' },
  { label: 'Khá (80%)', level: '80' },
];

const LOCATIONS = ['Đà Nẵng', 'Hồ Chí Minh', 'Hà Nội'];

export const CreateThriftListingScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [sourceType, setSourceType] = useState<'MANUAL' | 'FROM_RENTAL'>('MANUAL');
  const [condition, setCondition] = useState(CONDITIONS[1].label);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [quantity, setQuantity] = useState('1');
  const [description, setDescription] = useState('');

  const [imageUri, setImageUri] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để tải ảnh thanh lý.');
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
          const cloudUrl = await uploadImageApi({ uri: localUri });
          if (cloudUrl) setImageUri(cloudUrl);
        } catch {
          // ignore
        } finally {
          setUploadingImage(false);
        }
      }
    } catch {
      setUploadingImage(false);
      Alert.alert('Lỗi', 'Không thể chọn ảnh lúc này.');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên món đồ thanh lý.');
      return;
    }

    const priceNum = parseInt(price.replace(/\D/g, ''), 10);
    if (!priceNum || priceNum <= 0) {
      Alert.alert('Thông báo', 'Vui lòng nhập giá bán hợp lệ.');
      return;
    }

    setSubmitting(true);
    try {
      await createThriftListingApi({
        name: name.trim(),
        title: name.trim(),
        price: priceNum,
        originalPrice: parseInt(originalPrice.replace(/\D/g, ''), 10) || Math.round(priceNum * 1.35),
        condition,
        conditionLevel: condition.includes('99') ? '99' : condition.includes('95') ? '95' : '90',
        sourceType,
        source: sourceType === 'FROM_RENTAL' ? 'rent' : 'used',
        sourceLabel: sourceType === 'FROM_RENTAL' ? 'Từ sản phẩm RENT' : 'Đồ đã qua sử dụng',
        location,
        quantity: parseInt(quantity, 10) || 1,
        description: description.trim(),
        images: imageUri ? [imageUri] : ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80'],
        status: 'APPROVED',
      });

      Alert.alert('Thành công', `Bài đăng "${name}" đã được niêm yết thành công trên kho THRIFT!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || err?.message || 'Không thể tạo bài đăng.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Đăng bán đồ THRIFT" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Image Box */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Hình ảnh hiện vật thực tế</Text>
          <Text style={styles.sectionSub}>Ảnh không qua bộ lọc, ghi nhận trung thực từng chi tiết vi mô.</Text>

          <TouchableOpacity style={styles.imageBox} onPress={handlePickImage} activeOpacity={0.85}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Feather name="upload-cloud" size={32} color="#78736A" />
                <Text style={styles.uploadText}>Chạm để chọn ảnh thực tế</Text>
                <Text style={styles.uploadSub}>Tự động đồng bộ lên Cloudinary</Text>
              </View>
            )}

            {uploadingImage && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Product Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thông tin bài đăng</Text>

          <Text style={styles.label}>TÊN MÓN ĐỒ THANH LÝ (*)</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: Vintage Leather Jacket hoặc Đầm Dạ Hội Sequin..."
            placeholderTextColor="#A8A29E"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>DANH MỤC</Text>
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
              <Text style={styles.label}>GIÁ BÁN (VNĐ) (*)</Text>
              <TextInput
                style={[styles.input, { color: '#15803D', fontWeight: '700' }]}
                placeholder="VD: 850000"
                placeholderTextColor="#A8A29E"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={styles.flexOne}>
              <Text style={styles.label}>GIÁ MỚI GỐC (VNĐ)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 1500000"
                placeholderTextColor="#A8A29E"
                keyboardType="numeric"
                value={originalPrice}
                onChangeText={setOriginalPrice}
              />
            </View>
          </View>

          <Text style={styles.label}>NGUỒN GỐC HIỆN VẬT</Text>
          <View style={styles.rowTwo}>
            <TouchableOpacity
              style={[styles.sourceBtn, sourceType === 'MANUAL' && styles.sourceBtnActive]}
              onPress={() => setSourceType('MANUAL')}
            >
              <Text style={[styles.sourceBtnText, sourceType === 'MANUAL' && styles.sourceBtnTextActive]}>
                Đồ đã qua sử dụng
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sourceBtn, sourceType === 'FROM_RENTAL' && styles.sourceBtnActive]}
              onPress={() => setSourceType('FROM_RENTAL')}
            >
              <Text style={[styles.sourceBtnText, sourceType === 'FROM_RENTAL' && styles.sourceBtnTextActive]}>
                Từ sản phẩm RENT
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>TÌNH TRẠNG KIỂM ĐỊNH</Text>
          <View style={styles.conditionRow}>
            {CONDITIONS.map((c) => {
              const selected = condition === c.label;
              return (
                <TouchableOpacity
                  key={c.label}
                  style={[styles.condChip, selected && styles.condChipActive]}
                  onPress={() => setCondition(c.label)}
                >
                  <Text style={[styles.condChipText, selected && styles.condChipTextActive]}>{c.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Location & Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cơ sở & Mô tả</Text>

          <Text style={styles.label}>CHI NHÁNH KHO HÀNG</Text>
          <View style={styles.rowThree}>
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

          <Text style={styles.label}>SỐ LƯỢNG MÓN ĐỒ</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />

          <Text style={styles.label}>MÔ TẢ CHI TIẾT & BẢO HÀNH UNBOXING</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            multiline
            placeholder="Nêu rõ tình trạng hiện vật, phụ kiện, chính sách 72h kiểm tra độc lập..."
            placeholderTextColor="#A8A29E"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitBtn}
          disabled={submitting}
          activeOpacity={0.85}
          onPress={handleSubmit}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="check-circle" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Niêm yết bán THRIFT</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CreateThriftListingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#1C1A18' },
  sectionSub: { fontSize: 11, color: '#78736A', marginTop: 2, marginBottom: 12 },
  imageBox: {
    height: 180,
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFD8CC',
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: { width: '100%', height: '100%' },
  uploadPlaceholder: { alignItems: 'center', gap: 4 },
  uploadText: { fontSize: 13, fontWeight: '700', color: '#1C1A18', marginTop: 4 },
  uploadSub: { fontSize: 11, color: '#78736A' },
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
  label: { fontSize: 10, fontWeight: '800', color: '#78736A', letterSpacing: 0.5, marginTop: 10, marginBottom: 6 },
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
  rowThree: { flexDirection: 'row', gap: 8 },
  flexOne: { flex: 1 },
  sourceBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DFD8CC',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
  },
  sourceBtnActive: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  sourceBtnText: { fontSize: 11, fontWeight: '600', color: '#57534E' },
  sourceBtnTextActive: { color: '#0284C7', fontWeight: '700' },
  conditionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  condChip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DFD8CC',
    backgroundColor: '#FAF7F2',
  },
  condChipActive: { borderColor: '#1C1A18', backgroundColor: '#1C1A18' },
  condChipText: { fontSize: 11, color: '#57534E', fontWeight: '600' },
  condChipTextActive: { color: '#FAF7F2', fontWeight: '700' },
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
    backgroundColor: '#0284C7',
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
