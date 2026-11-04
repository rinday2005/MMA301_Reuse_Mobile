import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../../components/layout/AppHeader';
import { useShop } from '../../../context/ShopContext';
import { formatCurrency } from '../../../utils/formatCurrency';
import { normalizeImageUrl } from '../../../utils/imageUrl';

export const RentInventoryDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { products } = useShop();

  const unitParam = route.params?.unit;
  const unitId = route.params?.id || unitParam?.id;

  const sku = unitParam?.sku || unitId?.split('-')?.[0];
  const matchedProduct = products.find((p) => p.sku === sku);

  const productName = unitParam?.productName || matchedProduct?.name || 'Hiện vật cho thuê';
  const serialNumber = unitParam?.serialNumber || `#SN-${sku || 'INV'}-001`;
  const cycles = unitParam?.cycles || 12;
  const coverImage = unitParam?.coverImage || matchedProduct?.coverImage || '';

  return (
    <View style={styles.container}>
      <AppHeader title="Sổ nhật ký hiện vật" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header Unit Card */}
        <View style={styles.unitHeaderCard}>
          <Image
            source={{ uri: normalizeImageUrl(coverImage) }}
            style={styles.unitImage}
            resizeMode="cover"
          />
          <View style={styles.unitHeaderInfo}>
            <View style={styles.serialBadge}>
              <Text style={styles.serialBadgeText}>{serialNumber}</Text>
            </View>
            <Text style={styles.productName}>{productName}</Text>
            <Text style={styles.skuLine}>Mã danh mục gốc: #{sku || 'SKU'}</Text>
            <Text style={styles.statusLine}>
              Trạng thái: <Text style={{ color: '#15803D', fontWeight: '700' }}>Sẵn sàng lưu thông</Text>
            </Text>
          </View>
        </View>

        {/* Lifecycle Metrics */}
        <View style={styles.metricsCard}>
          <Text style={styles.cardTitle}>Chỉ số vòng đời tuần hoàn</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCol}>
              <Text style={styles.metricVal}>{cycles}</Text>
              <Text style={styles.metricLbl}>Chu kỳ thuê hoàn thành</Text>
            </View>
            <View style={styles.metricDiv} />
            <View style={styles.metricCol}>
              <Text style={[styles.metricVal, { color: '#15803D' }]}>100%</Text>
              <Text style={styles.metricLbl}>Chuẩn kiểm định UV-C</Text>
            </View>
            <View style={styles.metricDiv} />
            <View style={styles.metricCol}>
              <Text style={[styles.metricVal, { color: '#7E22CE' }]}>92%</Text>
              <Text style={styles.metricLbl}>Độ bền cơ học</Text>
            </View>
          </View>
        </View>

        {/* Inspection History Log */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lịch sử thẩm định & Khử khuẩn</Text>

          <View style={styles.logItem}>
            <View style={styles.logIconBox}>
              <Ionicons name="checkmark-circle" size={16} color="#15803D" />
            </View>
            <View style={styles.logTextCol}>
              <Text style={styles.logTitle}>Kiểm định hoàn cọc & Khử khuẩn Ozone</Text>
              <Text style={styles.logDesc}>Đạt chuẩn 8 bước ReUse Standard. Toàn bộ tính năng cơ học trơn tru, bề mặt khử trùng y tế.</Text>
              <Text style={styles.logDate}>Hôm qua · 15:30</Text>
            </View>
          </View>

          <View style={styles.logItem}>
            <View style={styles.logIconBox}>
              <Ionicons name="document-text" size={16} color="#0284C7" />
            </View>
            <View style={styles.logTextCol}>
              <Text style={styles.logTitle}>Ký kết bàn giao CLA đối kiểm</Text>
              <Text style={styles.logDesc}>Đối chứng 3 góc với người thuê: Mặt kính, khung vỏ, cáp kết nối nguyên vẹn.</Text>
              <Text style={styles.logDate}>15/10/2026 · 10:15</Text>
            </View>
          </View>
        </View>

        {/* Circular Action */}
        <View style={styles.actionCard}>
          <Text style={styles.actionCardTitle}>Chuyển tiếp vòng đời THRIFT</Text>
          <Text style={styles.actionCardDesc}>
            Khi hiện vật hoàn tất định mức cho thuê, bạn có thể chuyển tiếp hiện vật sang niêm yết bán
            THRIFT để thu hồi vốn và tái tạo sản phẩm cho người sưu tầm.
          </Text>
          <TouchableOpacity
            style={styles.convertBtn}
            onPress={() => navigation.navigate('ConvertToThrift', { id: sku, serial: serialNumber })}
          >
            <Feather name="repeat" size={16} color="#fff" />
            <Text style={styles.convertBtnText}>Định giá & Chuyển sang THRIFT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default RentInventoryDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  scroll: { padding: 16, paddingBottom: 40 },
  unitHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#EFECE6',
    marginBottom: 12,
  },
  unitImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#F5F2EB' },
  unitHeaderInfo: { flex: 1 },
  serialBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1C1A18',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  serialBadgeText: { color: '#FAF7F2', fontSize: 10, fontWeight: '800' },
  productName: { fontSize: 14, fontWeight: '800', color: '#1C1A18' },
  skuLine: { fontSize: 11, color: '#78736A', marginTop: 2 },
  statusLine: { fontSize: 11, color: '#57534E', marginTop: 3 },
  metricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFECE6',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 13, fontWeight: '800', color: '#1C1A18', marginBottom: 10 },
  metricsGrid: { flexDirection: 'row', backgroundColor: '#FAF7F2', borderRadius: 10, padding: 10, alignItems: 'center' },
  metricCol: { flex: 1, alignItems: 'center' },
  metricDiv: { width: 1, height: 24, backgroundColor: '#EBE5D8' },
  metricVal: { fontSize: 16, fontWeight: '800', color: '#1C1A18' },
  metricLbl: { fontSize: 9, color: '#78736A', marginTop: 2, textAlign: 'center' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFECE6',
    marginBottom: 12,
  },
  logItem: { flexDirection: 'row', gap: 10, paddingVertical: 8 },
  logIconBox: { marginTop: 2 },
  logTextCol: { flex: 1 },
  logTitle: { fontSize: 12, fontWeight: '700', color: '#1C1A18' },
  logDesc: { fontSize: 11, color: '#57534E', marginTop: 2, lineHeight: 15 },
  logDate: { fontSize: 10, color: '#A8A29E', marginTop: 3 },
  actionCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  actionCardTitle: { fontSize: 14, fontWeight: '800', color: '#7E22CE', marginBottom: 4 },
  actionCardDesc: { fontSize: 11, color: '#6B21A8', lineHeight: 16, marginBottom: 12 },
  convertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7E22CE',
    paddingVertical: 12,
    borderRadius: 10,
  },
  convertBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});
