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
import {
  getPublicThriftListingByIdApi,
  updateThriftListingApi,
  ThriftListingItemApi,
} from '../../../services/thrift.api';
import { uploadImageApi } from '../../../services/upload.api';
import { normalizeImageUrl } from '../../../utils/imageUrl';

const CONDITIONS = [
  { label: 'Grade Mint (99%)', level: '99' },
  { label: 'Rất tốt (95%)', level: '95' },
  { label: 'Tốt (90%)', level: '90' },
  { label: 'Khá (80%)', level: '80' },
];

const LOCATIONS = ['Đà Nẵng', 'Hồ Chí Minh', 'Hà Nội'];

export const EditThriftListingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const listingId = route.params?.id || route.params?.listing?._id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [condition, setCondition] = useState(CONDITIONS[1].label);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [quantity, setQuantity] = useState('1');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      if (!listingId) {
        setLoading(false);
        return;
      }
      try {
        let data: any = route.params?.listing;
        if (!data) {
          data = await getPublicThriftListingByIdApi(listingId);
        }
        if (data && isMounted) {
          setName(data.name || data.title || '');
          setPrice(String(data.price || ''));
          setOriginalPrice(String(data.originalPrice || ''));
          setCondition(data.condition || CONDITIONS[1].label);
          setLocation(data.location || LOCATIONS[0]);
          setQuantity(String(data.quantity ?? 1));
          setDescription(data.description || '');
          const img = Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : '';
          setImageUri(img);
        }
      } catch (err) {
        console.warn('Lỗi tải tin THRIFT:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [listingId, route.params?.listing]);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh.');
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
    }
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Thông báo', 'Tên món đồ không được để trống.');
      return;
    }
    const priceNum = parseInt(price.replace(/\D/g, ''), 10);
    if (!priceNum || priceNum <= 0) {
      Alert.alert('Thông báo', 'Vui lòng nhập giá bán hợp lệ.');
      return;
    }

    setSubmitting(true);
    try {
      await updateThriftListingApi(listingId, {
        name: name.trim(),
        title: name.trim(),
        price: priceNum,
        originalPrice: parseInt(originalPrice.replace(/\D/g, ''), 10) || Math.round(priceNum * 1.35),
        condition,
        location,
        quantity: parseInt(quantity, 10) || 1,
        description: description.trim(),
        images: imageUri ? [imageUri] : [],
      });

      Alert.alert('Thành công', 'Đã cập nhật bài đăng THRIFT!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || err?.message || 'Không thể cập nhật tin đăng.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#1C1A18" />
        <Text style={styles.loadingText}>Đang tải chi tiết tin đăng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Sửa tin THRIFT" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Image Box */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Hình ảnh hiện vật</Text>
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

        {/* Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thông tin bài đăng</Text>

          <Text style={styles.label}>TÊN MÓN ĐỒ (*)</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <View style={styles.rowTwo}>
            <View style={styles.flexOne}>
              <Text style={styles.label}>GIÁ BÁN (VNĐ) (*)</Text>
              <TextInput
                style={[styles.input, { color: '#15803D', fontWeight: '700' }]}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>
            <View style={styles.flexOne}>
              <Text style={styles.label}>GIÁ MỚI GỐC (VNĐ)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={originalPrice} onChangeText={setOriginalPrice} />
            </View>
          </View>

          <Text style={styles.label}>TÌNH TRẠNG</Text>
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

        {/* Location & Quantity */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cơ sở & Tồn kho</Text>
          <Text style={styles.label}>CHI NHÁNH</Text>
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
          <TextInput style={styles.input} keyboardType="numeric" value={quantity} onChangeText={setQuantity} />

          <Text style={styles.label}>MÔ TẢ CHI TIẾT</Text>
          <TextInput
            style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} disabled={submitting} activeOpacity={0.85} onPress={handleUpdate}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="save" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Lưu cập nhật</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default EditThriftListingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  loadingText: { fontSize: 13, color: '#78736A' },
  scroll: { padding: 16, paddingBottom: 40 },
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
  rowTwo: { flexDirection: 'row', gap: 10 },
  rowThree: { flexDirection: 'row', gap: 8 },
  flexOne: { flex: 1 },
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
