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
import { Feather, Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../../components/layout/AppHeader';
import { useShop } from '../../../context/ShopContext';
import { createThriftListingApi } from '../../../services/thrift.api';
import { formatCurrency } from '../../../utils/formatCurrency';
import { normalizeImageUrl } from '../../../utils/imageUrl';

export const ConvertToThriftScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { products } = useShop();

  const id = route.params?.id;
  const serial = route.params?.serial;
  const product = products.find((p) => p.sku === id || (p as any)._id === id);

  const [title, setTitle] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [condition, setCondition] = useState('LIKE_NEW');
  const [conditionText, setConditionText] = useState('Grade Mint (98%)');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      const orig = product.replacementValue || (product.deposit ? product.deposit * 1.5 : 10000000);
      const suggestedPrice = Math.round(orig * 0.65);

      setTitle(`[Archive] ${product.name} ${serial ? `(${serial})` : ''}`.trim());
      setOriginalPrice(String(orig));
      setSellingPrice(String(suggestedPrice));
      setDescription(
        `Hiện vật ${product.name} hoàn tất chu kỳ cho thuê chất lượng cao tại ReUse Hub. Đã qua kiểm định cơ học 8 bước, vệ sinh chiếu xạ UV-C sâu. Bảo chứng nguồn gốc 100% từ đối tác Atelier.`
      );
    }
  }, [product, serial]);

  const handleConvert = async () => {
    if (!title.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tiêu đề bài đăng THRIFT.');
      return;
    }

    const priceNum = parseInt(sellingPrice.replace(/\D/g, ''), 10);
    if (!priceNum || priceNum <= 0) {
      Alert.alert('Thông báo', 'Vui lòng nhập giá bán hợp lệ.');
      return;
    }

    setSubmitting(true);
    try {
      await createThriftListingApi({
        name: title.trim(),
        title: title.trim(),
        price: priceNum,
        originalPrice: parseInt(originalPrice.replace(/\D/g, ''), 10) || Math.round(priceNum * 1.4),
        condition,
        conditionLevel: '98',
        sourceType: 'FROM_RENTAL',
        source: 'rent',
        sourceLabel: 'Từ sản phẩm RENT',
        location: product?.location || 'Đà Nẵng',
        description: description.trim(),
        images: product?.coverImage ? [product.coverImage] : ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'],
        quantity: 1,
        status: 'APPROVED',
      });

      Alert.alert(
        'Thành công',
        'Hiện vật đã được chuyển đổi tuần hoàn sang kho bán THRIFT thành công!',
        [
          {
            text: 'Xem tin THRIFT',
            onPress: () => navigation.navigate('ShopThriftListings'),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || err?.message || 'Không thể chuyển sang THRIFT lúc này.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) {
    return (
      <View style={styles.container}>
        <AppHeader title="Chuyển sang THRIFT" showBack />
        <View style={styles.emptyBox}>
          <Feather name="alert-circle" size={40} color="#D6D3D1" />
          <Text style={styles.emptyText}>Không tìm thấy sản phẩm #{id}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Chuyển sang THRIFT" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Banner circular */}
        <View style={styles.banner}>
          <View style={styles.bannerIconBox}>
            <Text style={styles.bannerIcon}>∞</Text>
          </View>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle}>Kinh tế tuần hoàn: RENT sang THRIFT</Text>
            <Text style={styles.bannerDesc}>
              Hiện vật đã hoàn tất chu kỳ cho thuê. Định giá bán lại giúp thu hồi vốn và giảm phát thải
              ra môi trường.
            </Text>
          </View>
        </View>

        {/* Source item preview */}
        <View style={styles.sourceCard}>
          <Image
            source={{ uri: normalizeImageUrl(product.coverImage) }}
            style={styles.sourceImg}
          />
          <View style={styles.sourceInfo}>
            <Text style={styles.sourceSku}>Nguồn gốc: #{product.sku}</Text>
            <Text style={styles.sourceName}>{product.name}</Text>
            <Text style={styles.sourcePrice}>
              Định mức thuê cũ: {formatCurrency(product.pricePerDay)}/ngày
            </Text>
          </View>
        </View>

        {/* Form fields */}
        <View style={styles.formCard}>
          <Text style={styles.formSectionTitle}>Thiết lập bài đăng bán THRIFT</Text>

          <Text style={styles.label}>TIÊU ĐỀ BÀI ĐĂNG (*)</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} />

          <View style={styles.rowTwo}>
            <View style={styles.flexOne}>
              <Text style={styles.label}>GIÁ BÁN THRIFT (VNĐ) (*)</Text>
              <TextInput
                style={[styles.input, { color: '#15803D', fontWeight: '700' }]}
                keyboardType="numeric"
                value={sellingPrice}
                onChangeText={setSellingPrice}
              />
            </View>

            <View style={styles.flexOne}>
              <Text style={styles.label}>GIÁ MỚI GỐC (VNĐ)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={originalPrice}
                onChangeText={setOriginalPrice}
              />
            </View>
          </View>

          <Text style={styles.label}>TÌNH TRẠNG HIỆN VẬT KIỂM ĐỊNH</Text>
          <View style={styles.conditionRow}>
            {['Grade Mint (98%)', 'Rất tốt (95%)', 'Tốt (90%)'].map((c) => {
              const selected = conditionText === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.condChip, selected && styles.condChipActive]}
                  onPress={() => setConditionText(c)}
                >
                  <Text style={[styles.condChipText, selected && styles.condChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>MÔ TẢ HIỆN TRẠNG & BẢO HÀNH</Text>
          <TextInput
            style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitBtn}
          disabled={submitting}
          activeOpacity={0.85}
          onPress={handleConvert}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="check-circle" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Xác nhận đăng bán THRIFT</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ConvertToThriftScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  scroll: { padding: 16, paddingBottom: 40 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { fontSize: 14, color: '#78736A' },
  banner: {
    flexDirection: 'row',
    backgroundColor: '#FAF5FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  bannerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7E22CE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerIcon: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: -2 },
  bannerTextCol: { flex: 1 },
  bannerTitle: { fontSize: 13, fontWeight: '800', color: '#7E22CE' },
  bannerDesc: { fontSize: 11, color: '#6B21A8', marginTop: 2, lineHeight: 15 },
  sourceCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFECE6',
    gap: 12,
    marginBottom: 14,
  },
  sourceImg: { width: 64, height: 64, borderRadius: 10, backgroundColor: '#F5F2EB' },
  sourceInfo: { flex: 1, justifyContent: 'center' },
  sourceSku: { fontSize: 10, fontWeight: '800', color: '#78736A' },
  sourceName: { fontSize: 13, fontWeight: '700', color: '#1C1A18', marginTop: 1 },
  sourcePrice: { fontSize: 11, color: '#15803D', fontWeight: '600', marginTop: 2 },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFECE6',
    marginBottom: 16,
  },
  formSectionTitle: { fontSize: 14, fontWeight: '800', color: '#1C1A18', marginBottom: 10 },
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
  flexOne: { flex: 1 },
  conditionRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 4 },
  condChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DFD8CC',
    backgroundColor: '#FAF7F2',
  },
  condChipActive: { borderColor: '#7E22CE', backgroundColor: '#FAF5FF' },
  condChipText: { fontSize: 11, color: '#57534E', fontWeight: '600' },
  condChipTextActive: { color: '#7E22CE', fontWeight: '700' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7E22CE',
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
