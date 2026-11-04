import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getKycStatusApi, type UserKycResponse } from '../../services/kyc.api';
import { getShopProfileApi, type ShopProfileData } from '../../services/shop.api';

export const ShopOwnerKycScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [kycData, setKycData] = useState<UserKycResponse | null>(null);
  const [shopProfile, setShopProfile] = useState<ShopProfileData | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kycRes, shopRes] = await Promise.allSettled([
        getKycStatusApi(),
        getShopProfileApi(),
      ]);
      if (kycRes.status === 'fulfilled') setKycData(kycRes.value);
      if (shopRes.status === 'fulfilled') setShopProfile(shopRes.value);
    } catch (err) {
      console.warn('Lỗi nạp KYC shop:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#1C1A18" />
        <Text style={styles.loadingText}>Đang tải chứng nhận đối tác xưởng...</Text>
      </View>
    );
  }

  const ownerName = shopProfile?.ownerName || kycData?.kyc?.fullName || 'Phạm Thùy Dương';
  const shopName = shopProfile?.shopName || 'Atelier Chronos & Optics Ltd.';
  const citizenId = kycData?.kyc?.citizenId || '079198008899';
  const address = shopProfile?.address || '123 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={22} color="#1C1A18" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác thực Đối tác (KYC)</Text>
        <TouchableOpacity style={styles.headerBackBtn} onPress={loadData}>
          <Feather name="rotate-cw" size={18} color="#1C1A18" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Compliance Hero */}
        <View style={styles.heroCard}>
          <View style={styles.protocolBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#15803D" />
            <Text style={styles.protocolBadgeText}>Atelier Compliance Protocol 4.2</Text>
          </View>
          <Text style={styles.heroTitle}>Chứng Nhận Đối Tác Lưu Ký</Text>
          <Text style={styles.heroDesc}>
            Xác thực định danh pháp nhân, năng lực thẩm định quang học & lưu kho tuần hoàn tiêu chuẩn ReUse Standard.
          </Text>

          <TouchableOpacity
            style={styles.downloadCertBtn}
            onPress={() => setIsCertModalOpen(true)}
          >
            <MaterialCommunityIcons name="certificate" size={18} color="#FFFFFF" />
            <Text style={styles.downloadCertBtnText}>Xem chứng chỉ số Atelier</Text>
          </TouchableOpacity>
        </View>

        {/* Governance Principle Banner */}
        <View style={styles.govBanner}>
          <View style={styles.govIconBox}>
            <MaterialCommunityIcons name="bank" size={24} color="#1C1A18" />
          </View>
          <View style={styles.govContent}>
            <Text style={styles.govTitle}>Quy chuẩn Định danh Bất biến</Text>
            <Text style={styles.govText}>
              Xác thực KYC ấn định vĩnh viễn phân quyền tài khoản là{' '}
              <Text style={styles.boldText}>SHOP_OWNER</Text> — toàn quyền quản lý kho cho thuê, đăng bán thanh lý & tài khoản đối soát Escrow.
            </Text>
          </View>
        </View>

        {/* KYC Credentials Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hồ sơ định danh pháp lý</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Tên pháp nhân</Text>
            <Text style={styles.value}>{shopName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Chủ đại diện pháp luật</Text>
            <Text style={styles.value}>{ownerName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Số CCCD / Mã định danh</Text>
            <Text style={[styles.value, styles.monoValue]}>{citizenId}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Cấp bậc đối tác</Text>
            <View style={styles.tierBadge}>
              <Text style={styles.tierBadgeText}>TIER 2 · ĐỐI TÁC TIN CẬY</Text>
            </View>
          </View>

          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.label}>Địa chỉ cơ sở xưởng</Text>
            <Text style={styles.value}>{address}</Text>
          </View>
        </View>

        {/* Audit Bench Specs */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Năng lực kiểm định & Tiêu chuẩn kho</Text>
          <View style={styles.checkItem}>
            <Ionicons name="checkmark-circle" size={18} color="#15803D" />
            <Text style={styles.checkText}>Hệ thống tiệt trùng Ozone & đèn cực tím UV-C</Text>
          </View>
          <View style={styles.checkItem}>
            <Ionicons name="checkmark-circle" size={18} color="#15803D" />
            <Text style={styles.checkText}>Quy chuẩn đóng gói thùng chống sốc Nanuk</Text>
          </View>
          <View style={styles.checkItem}>
            <Ionicons name="checkmark-circle" size={18} color="#15803D" />
            <Text style={styles.checkText}>Biên bản kiểm tra 3 góc CLA điện tử có chữ ký số</Text>
          </View>
        </View>
      </ScrollView>

      {/* Certificate Modal */}
      <Modal
        visible={isCertModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCertModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.certCard}>
            <View style={styles.certHeader}>
              <MaterialCommunityIcons name="seal" size={32} color="#15803D" />
              <Text style={styles.certBrand}>REUSE HUB CIRCULAR ATELIER</Text>
              <Text style={styles.certNum}>CERTIFICATE ID: #ATELIER-2024-VN-901</Text>
            </View>

            <View style={styles.certDivider} />

            <Text style={styles.certBody}>
              Chứng nhận pháp nhân <Text style={styles.boldText}>{shopName}</Text> (Chủ xưởng:{' '}
              <Text style={styles.boldText}>{ownerName}</Text>) đạt đầy đủ các tiêu chí đối tác lưu ký & thẩm định hiện vật cao cấp.
            </Text>

            <View style={styles.certSealBox}>
              <Ionicons name="shield-checkmark" size={24} color="#15803D" />
              <Text style={styles.certSealText}>VERIFIED BY REUSE GOVERNANCE BOARD</Text>
            </View>

            <TouchableOpacity
              style={styles.closeCertBtn}
              onPress={() => setIsCertModalOpen(false)}
            >
              <Text style={styles.closeCertBtnText}>Đóng chứng thư</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ShopOwnerKycScreen;

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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#78736A',
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
  headerBackBtn: {
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
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  protocolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  protocolBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1A18',
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 13,
    color: '#78736A',
    lineHeight: 20,
    marginBottom: 16,
  },
  downloadCertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1C1A18',
    borderRadius: 10,
    paddingVertical: 12,
  },
  downloadCertBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  govBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F5F5F4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  govIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#E7E5E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  govContent: {
    flex: 1,
  },
  govTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 4,
  },
  govText: {
    fontSize: 12,
    color: '#57534E',
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: '#1C1A18',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 12,
  },
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4',
  },
  label: {
    fontSize: 11,
    color: '#78736A',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1A18',
  },
  monoValue: {
    fontFamily: 'Courier',
    letterSpacing: 1,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 2,
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  checkText: {
    fontSize: 13,
    color: '#44403C',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  certCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  certHeader: {
    alignItems: 'center',
    gap: 6,
  },
  certBrand: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1A18',
    letterSpacing: 1,
  },
  certNum: {
    fontSize: 11,
    color: '#78736A',
    fontWeight: '600',
  },
  certDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E7E5E4',
    marginVertical: 16,
  },
  certBody: {
    fontSize: 13,
    color: '#44403C',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  certSealBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  certSealText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  closeCertBtn: {
    width: '100%',
    backgroundColor: '#1C1A18',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeCertBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
