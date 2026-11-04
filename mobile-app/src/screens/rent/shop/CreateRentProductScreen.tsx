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
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppHeader } from '../../../components/layout/AppHeader';
import { useShop } from '../../../context/ShopContext';
import { uploadImageToCloudinary } from '../../../utils/imageUrl';

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

export const CreateRentProductScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { addProduct } = useShop();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [brand, setBrand] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [deposit, setDeposit] = useState('');
  const [replacementValue, setReplacementValue] = useState('');
  const [totalUnits, setTotalUnits] = useState('1');
  const [condition, setCondition] = useState('LIKE_NEW');
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [minDays, setMinDays] = useState('1');
  const [maxDays, setMaxDays] = useState('30');
  const [description, setDescription] = useState('');
  const [rentalRules, setRentalRules] = useState(
    'Bảo quản thiết bị cẩn thận trong quá trình sử dụng. Khi nhận kiện, người thuê vui lòng chụp ảnh 3 góc và ký biên bản CLA đối kiểm.'
  );

  const [imageUri, setImageUri] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Chọn ảnh từ thư viện
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để tải ảnh sản phẩm.');
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

        // Upload lên Cloudinary
        try {
          const cloudUrl = await uploadImageToCloudinary(localUri);
          if (cloudUrl) {
            setImageUri(cloudUrl);
          }
        } catch {
          // Giữ localUri nếu offline
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
      Alert.alert('Thông báo', 'Vui lòng nhập tên sản phẩm cho thuê.');
      return;
    }

    const priceNum = parseInt(pricePerDay.replace(/\D/g, ''), 10);
    if (!priceNum || priceNum <= 0) {
      Alert.alert('Thông báo', 'Vui lòng nhập giá thuê/ngày hợp lệ.');
      return;
    }

    const depositNum = parseInt(deposit.replace(/\D/g, ''), 10) || Math.round(priceNum * 2.5);
    const unitsNum = parseInt(totalUnits, 10) || 1;

    setSubmitting(true);
    try {
      const sku = `RENT-${Math.floor(1000 + Math.random() * 9000)}`;
      await addProduct({
        sku,
        name: name.trim(),
        category,
        brand: brand.trim() || 'Chính hãng',
        pricePerDay: priceNum,
        deposit: depositNum,
        replacementValue: parseInt(replacementValue.replace(/\D/g, ''), 10) || depositNum * 1.5,
        totalUnits: unitsNum,
        readyUnits: unitsNum,
        rentingUnits: 0,
        maintenanceUnits: 0,
        condition,
        location,
        minDays: parseInt(minDays, 10) || 1,
        maxDays: parseInt(maxDays, 10) || 30,
        description: description.trim(),
        rentalRules: rentalRules.trim(),
        coverImage: imageUri || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
        inspectionImages: imageUri ? [imageUri] : [],
      });

      Alert.alert(
        'Thành công',
        `Sản phẩm "${name}" đã được tạo thành công với mã SKU: ${sku}!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể tạo sản phẩm lúc này.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Thêm đồ RENT mới" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Image Picker Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Hình ảnh đại diện sản phẩm</Text>
          <Text style={styles.sectionSub}>Ảnh sẽ được kiểm định chất lượng hiển thị trên sàn.</Text>

          <TouchableOpacity style={styles.imageBox} onPress={handlePickImage} activeOpacity={0.85}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Feather name="upload-cloud" size={32} color="#78736A" />
                <Text style={styles.uploadText}>Chạm để chọn ảnh từ thư viện</Text>
                <Text style={styles.uploadSub}>Tự động đồng bộ lên Cloudinary</Text>
              </View>
            )}

            {uploadingImage && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.uploadOverlayText}>Đang tải ảnh...</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

          <Text style={styles.label}>TÊN THIẾT BỊ / TRANG PHỤC (*)</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: Sony Alpha A7 IV Kit hoặc Đầm Dạ Hội Lụa Satin..."
            placeholderTextColor="#A8A29E"
            value={name}
            onChangeText={setName}
          />

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
              <TextInput
                style={styles.input}
                placeholder="VD: Sony, Canon, Atelier..."
                placeholderTextColor="#A8A29E"
                value={brand}
                onChangeText={setBrand}
              />
            </View>

            <View style={styles.flexOne}>
              <Text style={styles.label}>SỐ LƯỢNG MÁY / HIỆN VẬT</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={totalUnits}
                onChangeText={setTotalUnits}
              />
            </View>
          </View>

          <Text style={styles.label}>TÌNH TRẠNG HIỆN TẠI</Text>
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

        {/* Pricing & Deposit */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Định giá thuê & Cọc bảo chứng Smart Escrow</Text>

          <View style={styles.rowTwo}>
            <View style={styles.flexOne}>
              <Text style={styles.label}>GIÁ THUÊ / NGÀY (VNĐ) (*)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 350000"
                placeholderTextColor="#A8A29E"
                keyboardType="numeric"
                value={pricePerDay}
                onChangeText={setPricePerDay}
              />
            </View>

            <View style={styles.flexOne}>
              <Text style={styles.label}>TIỀN CỌC ESCROW (VNĐ)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 1500000"
                placeholderTextColor="#A8A29E"
                keyboardType="numeric"
                value={deposit}
                onChangeText={setDeposit}
              />
            </View>
          </View>

          <Text style={styles.label}>GIÁ TRỊ THAY THẾ KHI HỎNG HOÀN TOÀN (VNĐ)</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: 15000000"
            placeholderTextColor="#A8A29E"
            keyboardType="numeric"
            value={replacementValue}
            onChangeText={setReplacementValue}
          />
        </View>

        {/* Location & Policy */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cơ sở & Quy định cho thuê</Text>

          <Text style={styles.label}>CHI NHÁNH BẢO QUẢN THIẾT BỊ</Text>
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

          <Text style={styles.label}>MÔ TẢ CHI TIẾT SẢN PHẨM</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            multiline
            placeholder="Nêu rõ tình trạng linh kiện, phụ kiện kèm theo, thông số kỹ thuật..."
            placeholderTextColor="#A8A29E"
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>QUY ĐỊNH THUÊ & KIỂM TRA ĐỐI KIỂM</Text>
          <TextInput
            style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
            multiline
            placeholder="Yêu cầu kiểm tra khi nhận hàng, hướng dẫn bảo quản..."
            placeholderTextColor="#A8A29E"
            value={rentalRules}
            onChangeText={setRentalRules}
          />
        </View>

        {/* Submit Button */}
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
              <Text style={styles.submitBtnText}>Niêm yết sản phẩm cho thuê</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CreateRentProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1A18',
  },
  sectionSub: {
    fontSize: 11,
    color: '#78736A',
    marginTop: 2,
    marginBottom: 12,
  },
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
  previewImage: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    gap: 4,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
    marginTop: 4,
  },
  uploadSub: {
    fontSize: 11,
    color: '#78736A',
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadOverlayText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#78736A',
    letterSpacing: 0.6,
    marginTop: 10,
    marginBottom: 6,
  },
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
  chipsScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#DFD8CC',
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: '#1C1A18',
    borderColor: '#1C1A18',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#57534E',
  },
  chipTextActive: {
    color: '#FAF7F2',
    fontWeight: '700',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  flexOne: {
    flex: 1,
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
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
  conditionBtnActive: {
    borderColor: '#1C1A18',
    backgroundColor: '#1C1A18',
  },
  conditionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#57534E',
  },
  conditionBtnTextActive: {
    color: '#FAF7F2',
    fontWeight: '700',
  },
  locRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  locBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DFD8CC',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
  },
  locBtnActive: {
    borderColor: '#1C1A18',
    backgroundColor: '#1C1A18',
  },
  locBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#57534E',
  },
  locBtnTextActive: {
    color: '#FAF7F2',
    fontWeight: '700',
  },
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
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
