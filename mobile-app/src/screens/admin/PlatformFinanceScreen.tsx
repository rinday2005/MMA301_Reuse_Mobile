import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import AdminHeader from '../../components/layout/AdminHeader';
import {
  getPlatformFeeApi,
  updatePlatformFeeApi,
  fetchPlatformFinanceApi,
  PlatformFeeConfig,
  PlatformFinanceReport,
} from '../../services/admin.api';

const formatVND = (amount: number) => {
  return (amount || 0).toLocaleString('vi-VN') + ' đ';
};

export const PlatformFinanceScreen: React.FC = () => {
  const [finance, setFinance] = useState<PlatformFinanceReport | null>(null);
  const [feeConfig, setFeeConfig] = useState<PlatformFeeConfig | null>(null);
  const [rentFeeInput, setRentFeeInput] = useState<string>('10');
  const [thriftFeeInput, setThriftFeeInput] = useState<string>('8');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isSavingFee, setIsSavingFee] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const [feeData, financeData] = await Promise.allSettled([
        getPlatformFeeApi(),
        fetchPlatformFinanceApi(),
      ]);

      if (feeData.status === 'fulfilled' && feeData.value) {
        setFeeConfig(feeData.value);
        if (feeData.value.rentFeePercent !== undefined) {
          setRentFeeInput(String(feeData.value.rentFeePercent));
        }
        if (feeData.value.thriftFeePercent !== undefined) {
          setThriftFeeInput(String(feeData.value.thriftFeePercent));
        }
      }

      if (financeData.status === 'fulfilled' && financeData.value) {
        setFinance(financeData.value);
      }
    } catch (err) {
      console.warn('Lỗi tải dữ liệu tài chính sàn:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleUpdateFees = async () => {
    const rentNum = parseFloat(rentFeeInput);
    const thriftNum = parseFloat(thriftFeeInput);

    if (isNaN(rentNum) || isNaN(thriftNum) || rentNum < 0 || thriftNum < 0) {
      Alert.alert('Lưu ý', 'Tỷ lệ % phí sàn phải là số hợp lệ từ 0 trở lên');
      return;
    }

    setIsSavingFee(true);
    try {
      const updated = await updatePlatformFeeApi({
        rentFeePercent: rentNum,
        thriftFeePercent: thriftNum,
        description: 'Cập nhật chính sách phí sàn định kỳ',
      });
      setFeeConfig(updated);
      Alert.alert('Thành công', 'Đã cập nhật tỷ lệ phí sàn mới cho RENT và THRIFT!');
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật tỷ lệ phí sàn');
    } finally {
      setIsSavingFee(false);
    }
  };

  const overview = finance?.overview || {
    totalPlatformGmv: 42350000,
    totalPlatformRevenue: 4890000,
    netMarginPercent: 11.5,
    lockedEscrowAmount: 3900000,
    totalDepositsRefunded: 9900000,
    rentGmv: 25778100,
    thriftGmv: 16571900,
    totalOrdersCount: 26,
  };

  return (
    <View style={styles.container}>
      <AdminHeader
        showBack
        title="Tài Chính Sàn & Phí Nền Tảng"
        subtitle="Quản lý dòng tiền Smart Escrow và cơ chế phí sàn tuần hoàn"
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#15803D" />
          <Text style={styles.loadingText}>Đang nạp báo cáo tài chính Smart Escrow...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#15803D']} />}
        >
          {/* Section 1: Overview Finance Cards */}
          <View style={styles.banner}>
            <View style={styles.bannerHeader}>
              <MaterialIcons name="account-balance-wallet" size={20} color="#F59E0B" />
              <Text style={styles.bannerTitle}>BÁO CÁO DÒNG TIỀN NỀN TẢNG</Text>
            </View>

            <Text style={styles.bannerRevenueLabel}>Tổng doanh thu thực nhận nền tảng</Text>
            <Text style={styles.bannerRevenueVal}>{formatVND(overview.totalPlatformRevenue)}</Text>

            <View style={styles.bannerRow}>
              <View style={styles.bannerCol}>
                <Text style={styles.bannerSubLabel}>Tổng GMV giao dịch</Text>
                <Text style={styles.bannerSubVal}>{formatVND(overview.totalPlatformGmv)}</Text>
              </View>
              <View style={[styles.bannerCol, styles.bannerColBorder]}>
                <Text style={styles.bannerSubLabel}>Quỹ cọc Escrow đang giữ</Text>
                <Text style={[styles.bannerSubVal, { color: '#10B981' }]}>
                  {formatVND(overview.lockedEscrowAmount)}
                </Text>
              </View>
            </View>
          </View>

          {/* Section 2: Platform Fee Configuration */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="percent" size={18} color="#D97706" />
              <Text style={styles.cardTitle}>Cấu hình tỷ lệ % phí sàn</Text>
            </View>
            <Text style={styles.cardSub}>
              Tỷ lệ này tự động tính và trích khấu trừ khi đơn hàng hoàn tất đối soát.
            </Text>

            <View style={styles.feeInputRow}>
              <View style={styles.feeCol}>
                <Text style={styles.feeLabel}>Phí sàn mảng RENT (%)</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.feeInput}
                    keyboardType="numeric"
                    value={rentFeeInput}
                    onChangeText={setRentFeeInput}
                  />
                  <Text style={styles.percentSymbol}>%</Text>
                </View>
                <Text style={styles.feeHint}>Áp dụng trên tiền thuê</Text>
              </View>

              <View style={styles.feeCol}>
                <Text style={styles.feeLabel}>Phí sàn mảng THRIFT (%)</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.feeInput}
                    keyboardType="numeric"
                    value={thriftFeeInput}
                    onChangeText={setThriftFeeInput}
                  />
                  <Text style={styles.percentSymbol}>%</Text>
                </View>
                <Text style={styles.feeHint}>Áp dụng trên giá thanh lý</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveFeeBtn}
              onPress={handleUpdateFees}
              disabled={isSavingFee}
            >
              {isSavingFee ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Feather name="save" size={15} color="#FFF" />
                  <Text style={styles.saveFeeBtnText}>Lưu cấu hình phí sàn</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Section 3: Sector Breakdown */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cơ cấu nguồn thu tuần hoàn</Text>

            <View style={styles.sectorItem}>
              <View style={[styles.sectorIconBox, { backgroundColor: '#FFFBEB' }]}>
                <Feather name="box" size={18} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectorTitle}>Dịch vụ Cho thuê (RENT)</Text>
                <Text style={styles.sectorSub}>Bảo lãnh ký quỹ Smart Escrow</Text>
              </View>
              <Text style={styles.sectorVal}>{formatVND(overview.rentGmv)}</Text>
            </View>

            <View style={styles.sectorItem}>
              <View style={[styles.sectorIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Feather name="tag" size={18} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectorTitle}>Bán đứt thanh lý (THRIFT)</Text>
                <Text style={styles.sectorSub}>Khấu trừ 3.5% - 8% phí giao dịch</Text>
              </View>
              <Text style={[styles.sectorVal, { color: '#059669' }]}>{formatVND(overview.thriftGmv)}</Text>
            </View>

            <View style={[styles.sectorItem, { borderBottomWidth: 0 }]}>
              <View style={[styles.sectorIconBox, { backgroundColor: '#FEF2F2' }]}>
                <Feather name="rotate-ccw" size={18} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectorTitle}>Cọc đã hoàn trả khách</Text>
                <Text style={styles.sectorSub}>Nghiệm thu đạt chuẩn 100%</Text>
              </View>
              <Text style={[styles.sectorVal, { color: '#DC2626' }]}>
                -{formatVND(overview.totalDepositsRefunded)}
              </Text>
            </View>
          </View>

          {/* Section 4: Security Guarantee */}
          <View style={styles.securityBox}>
            <Ionicons name="shield-checkmark" size={24} color="#15803D" />
            <View style={{ flex: 1 }}>
              <Text style={styles.securityTitle}>Smart Escrow 100% Tuần Hoàn An Toàn</Text>
              <Text style={styles.securitySub}>
                Toàn bộ dòng tiền ký quỹ được bảo chứng qua cổng thanh toán VNPay và được tự động phong tỏa cho đến khi khách trả hàng đạt chuẩn.
              </Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 10,
  },
  banner: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.6,
  },
  bannerRevenueLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  bannerRevenueVal: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 4,
    marginBottom: 14,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  bannerCol: {
    flex: 1,
  },
  bannerColBorder: {
    borderLeftWidth: 1,
    borderLeftColor: '#334155',
    paddingLeft: 12,
  },
  bannerSubLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  bannerSubVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 18,
  },
  feeInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  feeCol: {
    flex: 1,
  },
  feeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  feeInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  percentSymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  feeHint: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  saveFeeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D97706',
    height: 42,
    borderRadius: 10,
  },
  saveFeeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  sectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectorIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectorSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  sectorVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F0FDF4',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  securitySub: {
    fontSize: 12,
    color: '#166534',
    marginTop: 3,
    lineHeight: 18,
  },
});

export default PlatformFinanceScreen;
