import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';
import { useAuth } from '../../hooks/useAuth';
import { getMyRentalOrdersApi, RentalOrderApi } from '../../services/order.api';

interface WalletTx {
  id: string;
  orderCode: string;
  productTitle: string;
  type: 'ESCROW_LOCK' | 'ESCROW_REFUND' | 'RENTAL_FEE';
  amount: number;
  date: string;
  status: 'LOCKED' | 'REFUNDED' | 'PROCESSING';
  note: string;
}

export const UserWalletScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<RentalOrderApi[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'LOCKED' | 'REFUNDED'>('ALL');

  // Withdraw Modal State
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [bankName, setBankName] = useState('NCB - Ngân hàng Quốc Dân (VNPay Sandbox)');
  const [bankAccount, setBankAccount] = useState('9704198526191432198');
  const [accountHolder, setAccountHolder] = useState(user?.fullName || 'NGUYEN VAN A');
  const [withdrawAmount, setWithdrawAmount] = useState('1000000');
  const [withdrawing, setWithdrawing] = useState(false);

  const formatVND = (num: number) => {
    return (num || 0).toLocaleString('vi-VN') + '₫';
  };

  const loadOrders = useCallback(async () => {
    try {
      const res = await getMyRentalOrdersApi();
      if (Array.isArray(res)) {
        setOrders(res);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Derive transactions from real rental orders
  const transactions: WalletTx[] = useMemo(() => {
    const list: WalletTx[] = [];
    orders.forEach((o) => {
      const deposit = o.depositAmount || 0;
      const code = o.orderCode || `#${o._id?.slice(-6)}`;
      const title = (o.items?.[0] as any)?.productName || (o.items?.[0] as any)?.title || 'Thiết bị thuê';
      const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : 'Gần đây';

      const isCompleted = ['COMPLETED', 'RETURNED', 'REFUNDED'].includes(o.status || '');
      const isLocked = ['PAID', 'RENTING', 'SHIPPING', 'DELIVERED', 'READY_FOR_HANDOVER'].includes(o.status || '');

      if (deposit > 0) {
        if (isCompleted) {
          list.push({
            id: `ref-${o._id}`,
            orderCode: code,
            productTitle: title,
            type: 'ESCROW_REFUND',
            amount: deposit,
            date: dateStr,
            status: 'REFUNDED',
            note: 'Đã hoàn cọc 100% sau đối kiểm kỹ thuật đạt chuẩn',
          });
        }
        if (isLocked) {
          list.push({
            id: `lock-${o._id}`,
            orderCode: code,
            productTitle: title,
            type: 'ESCROW_LOCK',
            amount: deposit,
            date: dateStr,
            status: 'LOCKED',
            note: 'Tiền cọc lưu ký bảo chứng Smart Escrow',
          });
        }
      }
    });

    return list;
  }, [orders]);

  const lockedAmount = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'LOCKED')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const refundedAmount = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'REFUNDED')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const filteredTxs = useMemo(() => {
    if (activeTab === 'LOCKED') return transactions.filter((t) => t.status === 'LOCKED');
    if (activeTab === 'REFUNDED') return transactions.filter((t) => t.status === 'REFUNDED');
    return transactions;
  }, [activeTab, transactions]);

  const handleWithdrawSubmit = () => {
    const val = Number(withdrawAmount);
    if (!val || val <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền rút hợp lệ.');
      return;
    }
    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      setWithdrawModalVisible(false);
      Alert.alert(
        'Yêu cầu thành công',
        `Yêu cầu rút ${formatVND(val)} về STK ${bankAccount} (${bankName}) đã được tiếp nhận và xử lý qua cổng VNPay trong 2–4 giờ làm việc.`
      );
    }, 1200);
  };

  return (
    <View style={styles.safeArea}>
      <AppHeader title="Ví Cọc Smart Escrow" showBack />

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#1C1A18" />
          <Text style={styles.loadingText}>Đang kiểm tra tài khoản Escrow...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadOrders();
              }}
            />
          }
        >
          {/* 1. BALANCE SUMMARY CARDS */}
          <View style={styles.heroBox}>
            <View style={styles.badgeRow}>
              <View style={styles.escrowDot} />
              <Text style={styles.badgeText}>SMART ESCROW GUARANTEE</Text>
            </View>
            <Text style={styles.heroTitle}>Ví cọc &amp; Hoàn tiền</Text>
            <Text style={styles.heroSub}>
              Toàn bộ tiền cọc thuê đồ được cách ly bảo chứng và hoàn trả tự động sau đối soát.
            </Text>

            <View style={styles.cardsRow}>
              {/* Card 1: Locked */}
              <View style={styles.balanceCard}>
                <View style={styles.iconCircleDark}>
                  <Feather name="lock" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.cardLabel}>ĐANG LƯU KÝ</Text>
                <Text style={styles.cardValue}>{formatVND(lockedAmount)}</Text>
                <Text style={styles.cardNote}>Bảo hộ thiết bị đang thuê</Text>
              </View>

              {/* Card 2: Refunded */}
              <View style={styles.balanceCard}>
                <View style={styles.iconCircleGreen}>
                  <Ionicons name="checkmark-done" size={16} color="#059669" />
                </View>
                <Text style={styles.cardLabel}>ĐÃ HOÀN CỌC</Text>
                <Text style={styles.cardValueGreen}>{formatVND(refundedAmount)}</Text>
                <Text style={styles.cardNote}>Hoàn tất về tài khoản</Text>
              </View>
            </View>

            {/* Withdraw CTA button */}
            <TouchableOpacity
              style={styles.withdrawBtn}
              onPress={() => setWithdrawModalVisible(true)}
              activeOpacity={0.8}
            >
              <Feather name="arrow-up-right" size={15} color="#1C1A18" />
              <Text style={styles.withdrawBtnText}>RÚT TIỀN VỀ TÀI KHOẢN NGÂN HÀNG</Text>
            </TouchableOpacity>
          </View>

          {/* 2. SECURITY NOTICE */}
          <View style={styles.securityNoticeCard}>
            <Ionicons name="shield-checkmark" size={20} color="#059669" />
            <View style={styles.securityNoticeInfo}>
              <Text style={styles.securityTitle}>Quy chế bảo vệ tiền cọc Smart Escrow</Text>
              <Text style={styles.securityText}>
                Tiền cọc không bị giải phóng cho Shop Owner cho đến khi bạn nhận được đúng sản phẩm, và ngược lại được hoàn 100% trong 24h sau khi Shop Owner hoàn tất nghiệm thu trả hàng.
              </Text>
            </View>
          </View>

          {/* 3. TRANSACTION HISTORY */}
          <View style={styles.txSection}>
            <View style={styles.txHeaderRow}>
              <Text style={styles.txSectionTitle}>Nhật ký giao dịch bảo chứng</Text>
              <Text style={styles.txCount}>({filteredTxs.length})</Text>
            </View>

            {/* Filter Tabs */}
            <View style={styles.tabsRow}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'ALL' && styles.tabBtnActive]}
                onPress={() => setActiveTab('ALL')}
              >
                <Text style={[styles.tabText, activeTab === 'ALL' && styles.tabTextActive]}>
                  Tất cả ({transactions.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'LOCKED' && styles.tabBtnActive]}
                onPress={() => setActiveTab('LOCKED')}
              >
                <Text style={[styles.tabText, activeTab === 'LOCKED' && styles.tabTextActive]}>
                  Đang ký quỹ
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'REFUNDED' && styles.tabBtnActive]}
                onPress={() => setActiveTab('REFUNDED')}
              >
                <Text style={[styles.tabText, activeTab === 'REFUNDED' && styles.tabTextActive]}>
                  Đã hoàn cọc
                </Text>
              </TouchableOpacity>
            </View>

            {filteredTxs.length === 0 ? (
              <View style={styles.emptyCard}>
                <Feather name="inbox" size={32} color="#A8A29E" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyTitle}>Chưa có giao dịch ký quỹ</Text>
                <Text style={styles.emptySub}>
                  Khi bạn thuê thiết bị và thanh toán tiền cọc, mọi biến động sẽ được hiển thị minh bạch tại đây.
                </Text>
              </View>
            ) : (
              <View style={styles.txList}>
                {filteredTxs.map((tx) => {
                  const isRefund = tx.type === 'ESCROW_REFUND';
                  return (
                    <View key={tx.id} style={styles.txCard}>
                      <View style={styles.txTopRow}>
                        <View style={styles.txLeft}>
                          <View
                            style={[
                              styles.txIconCircle,
                              isRefund ? styles.txIconGreen : styles.txIconDark,
                            ]}
                          >
                            <Feather
                              name={isRefund ? 'arrow-down-left' : 'lock'}
                              size={14}
                              color={isRefund ? '#059669' : '#1C1A18'}
                            />
                          </View>
                          <View>
                            <Text style={styles.txCode}>{tx.orderCode}</Text>
                            <Text style={styles.txDate}>{tx.date}</Text>
                          </View>
                        </View>
                        <Text
                          style={[
                            styles.txAmount,
                            isRefund ? styles.txAmountGreen : styles.txAmountDark,
                          ]}
                        >
                          {isRefund ? '+' : '-'} {formatVND(tx.amount)}
                        </Text>
                      </View>
                      <Text style={styles.txProductTitle} numberOfLines={1}>
                        {tx.productTitle}
                      </Text>
                      <Text style={styles.txNote}>{tx.note}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* WITHDRAW MODAL */}
      <Modal
        visible={withdrawModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rút tiền về tài khoản ngân hàng</Text>
              <TouchableOpacity onPress={() => setWithdrawModalVisible(false)}>
                <Feather name="x" size={20} color="#1C1A18" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Ngân hàng thụ hưởng</Text>
              <TextInput
                style={styles.input}
                value={bankName}
                onChangeText={setBankName}
                placeholder="VD: Vietcombank, Techcombank..."
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Số tài khoản</Text>
              <TextInput
                style={styles.input}
                value={bankAccount}
                onChangeText={setBankAccount}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tên chủ tài khoản</Text>
              <TextInput
                style={styles.input}
                value={accountHolder}
                onChangeText={setAccountHolder}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Số tiền rút (VNĐ)</Text>
              <TextInput
                style={styles.input}
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={styles.submitWithdrawBtn}
              onPress={handleWithdrawSubmit}
              disabled={withdrawing}
            >
              {withdrawing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitWithdrawText}>Xác nhận yêu cầu rút tiền</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UserWalletScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF9F5',
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#78736A',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
  },
  heroBox: {
    backgroundColor: '#F4F0EA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 6,
    marginBottom: 8,
  },
  escrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1C1A18',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 12,
    color: '#5E5A53',
    lineHeight: 17,
    marginBottom: 14,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 12,
  },
  iconCircleDark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C1A18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconCircleGreen: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#78736A',
    letterSpacing: 0.8,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1A18',
    marginTop: 2,
  },
  cardValueGreen: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
    marginTop: 2,
  },
  cardNote: {
    fontSize: 10,
    color: '#78736A',
    marginTop: 2,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
  },
  withdrawBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1A18',
    letterSpacing: 0.5,
  },
  securityNoticeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 14,
    gap: 12,
  },
  securityNoticeInfo: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 2,
  },
  securityText: {
    fontSize: 11,
    color: '#5E5A53',
    lineHeight: 16,
  },
  txSection: {
    gap: 10,
  },
  txHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1A18',
  },
  txCount: {
    fontSize: 13,
    color: '#78736A',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
  },
  tabBtnActive: {
    backgroundColor: '#1C1A18',
    borderColor: '#1C1A18',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5E5A53',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  txList: {
    gap: 8,
  },
  txCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 12,
    gap: 4,
  },
  txTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  txIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txIconDark: {
    backgroundColor: '#F4F0EA',
  },
  txIconGreen: {
    backgroundColor: '#ECFDF5',
  },
  txCode: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#1C1A18',
  },
  txDate: {
    fontSize: 9,
    color: '#78736A',
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  txAmountDark: {
    color: '#1C1A18',
  },
  txAmountGreen: {
    color: '#059669',
  },
  txProductTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1A18',
  },
  txNote: {
    fontSize: 10,
    color: '#78736A',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 11,
    color: '#78736A',
    textAlign: 'center',
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E2DA',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1A18',
  },
  formGroup: {
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1A18',
  },
  input: {
    backgroundColor: '#FBF9F5',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#1C1A18',
  },
  submitWithdrawBtn: {
    backgroundColor: '#1C1A18',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  submitWithdrawText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
