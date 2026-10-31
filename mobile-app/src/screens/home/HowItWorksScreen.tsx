import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';
import { RENT_STEPS, THRIFT_STEPS } from '../../data/home/howItWorksData';

export const HowItWorksScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'RENT' | 'THRIFT'>('RENT');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader title="Cách Hoạt Động" showBack />

      {/* Tab Switcher */}
      <View style={styles.tabBarContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'RENT' && styles.tabBtnActive]}
          onPress={() => setActiveTab('RENT')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'RENT' && styles.tabBtnTextActive]}>
            01 · Dịch vụ RENT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'THRIFT' && styles.tabBtnActive]}
          onPress={() => setActiveTab('THRIFT')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'THRIFT' && styles.tabBtnTextActive]}>
            02 · Dịch vụ THRIFT
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. BREADCRUMBS */}
        <View style={styles.breadcrumb}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={styles.breadcrumbLink}>Trang chủ</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumbSep}>/</Text>
          <Text style={styles.breadcrumbMuted}>Hệ sinh thái</Text>
          <Text style={styles.breadcrumbSep}>/</Text>
          <Text style={styles.breadcrumbCurrent}>Cách hoạt động</Text>
        </View>

        {/* 2. HERO SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <View style={styles.heroDot} />
            <Text style={styles.heroBadgeText}>HOW REUSE HUB WORKS · NỀN TẢNG TUẦN HOÀN MINH BẠCH</Text>
          </View>
          <Text style={styles.heroTitle}>
            Thuê khi cần.{'\n'}
            Trả lại.{'\n'}
            <Text style={styles.heroTitleItalic}>Cho sản phẩm thêm vòng đời.</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Một cách đơn giản hơn để sử dụng những món đồ bạn không nhất thiết phải sở hữu. Từ các thiết bị quang học chính xác, đồ dã ngoại thực chiến đến thời trang lưu trữ cao cấp — tất cả đều được thẩm định và quản lý vòng đời chuyên nghiệp.
          </Text>

          <View style={styles.heroBtns}>
            <TouchableOpacity
              style={styles.heroBtnDark}
              onPress={() => navigation.navigate('RentTab')}
            >
              <Text style={styles.heroBtnDarkText}>Khám phá dịch vụ RENT</Text>
              <Feather name="arrow-right" size={14} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroBtnLight}
              onPress={() => navigation.navigate('ThriftTab')}
            >
              <Text style={styles.heroBtnLightText}>Tìm hiểu kho đồ THRIFT</Text>
              <Feather name="shopping-bag" size={14} color="#1C1A18" />
            </TouchableOpacity>
          </View>

          {/* Metrics Row */}
          <View style={styles.metricsGrid}>
            {[
              { val: '10 Bước', sub: 'RENT minh bạch, khép kín' },
              { val: '100% Hoàn', sub: 'Cọc qua Smart Escrow' },
              { val: 'Chuẩn y tế', sub: 'Khử trùng & Audit Bench' },
              { val: 'Ủy quyền', sub: '100% từ Shop Owner' },
            ].map((m, idx) => (
              <View key={idx} style={styles.metricCard}>
                <Text style={styles.metricVal}>{m.val}</Text>
                <Text style={styles.metricSub}>{m.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Steps Intro Header */}
        <View style={styles.introCard}>
          <Text style={styles.introPre}>QUY TRÌNH TIÊU CHUẨN</Text>
          <Text style={styles.introTitle}>
            {activeTab === 'RENT'
              ? '01 · Dịch vụ Thuê RENT — 10 Bước chuẩn xác từ chọn đồ đến hoàn tiền cọc'
              : '02 · Dịch vụ THRIFT — 6 Bước sở hữu vĩnh viễn đồ tuyển chọn'}
          </Text>
          <Text style={styles.introDesc}>
            {activeTab === 'RENT'
              ? 'Quy trình thuê khép kín bảo vệ tài sản và minh bạch tài chính tối đa cho cả người thuê lẫn Shop Owner ủy quyền.'
              : 'Sản phẩm THRIFT sở hữu vĩnh viễn, được thẩm định tình trạng thực tế và kiểm tra tem niêm phong.'}
          </Text>
        </View>

        {/* Steps List */}
        {activeTab === 'RENT' ? (
          <View style={styles.stepsList}>
            {RENT_STEPS.map((step, idx) => (
              <View
                key={idx}
                style={[styles.stepCard, step.dark && styles.stepCardDark]}
              >
                <View style={styles.stepHeaderRow}>
                  <View style={[styles.stepNumCircle, step.dark && styles.stepNumCircleDark]}>
                    <Text style={[styles.stepNumText, step.dark && styles.stepNumTextDark]}>
                      {step.num}
                    </Text>
                  </View>
                  <View style={[styles.stepTagBadge, step.dark && styles.stepTagBadgeDark]}>
                    <Text style={[styles.stepTagText, step.dark && styles.stepTagTextDark]}>
                      {step.tag}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.stepCardTitle, step.dark && styles.stepCardTitleDark]}>
                  {step.title}
                </Text>
                <Text style={[styles.stepCardDesc, step.dark && styles.stepCardDescDark]}>
                  {step.desc}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.stepsList}>
            {THRIFT_STEPS.map((step, idx) => (
              <View key={idx} style={styles.stepCard}>
                <View style={styles.stepHeaderRow}>
                  <View style={styles.stepNumCircle}>
                    <Text style={styles.stepNumText}>0{step.num}</Text>
                  </View>
                  <View style={styles.stepTagBadge}>
                    <Text style={styles.stepTagText}>Bước {step.num}</Text>
                  </View>
                </View>
                <Text style={styles.stepCardTitle}>{step.title}</Text>
                <Text style={styles.stepCardDesc}>{step.desc}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 03 - Mô hình tuần hoàn khép kín matching Screenshot 2 */}
        <View style={styles.richSection}>
          <Text style={styles.richPre}>03 · MÔ HÌNH TUẦN HOÀN KHÉP KÍN</Text>
          <Text style={styles.richTitle}>Không rác thải, tối ưu giá trị sử dụng</Text>
          <Text style={styles.richDesc}>
            Khi một sản phẩm RENT hết vòng đời cho thuê nhưng vẫn còn chất lượng tốt, chủ shop có thể chuyển sang sàn THRIFT để thanh lý với giá ưu đãi, mở ra vòng đời thứ hai thay vì loại bỏ.
          </Text>

          <View style={styles.flowCard}>
            <View style={styles.flowRow}>
              <View style={styles.flowStep}>
                <Text style={styles.flowTag}>VÒNG 1: RENT</Text>
                <Text style={styles.flowHeading}>Cho thuê ngắn hạn</Text>
                <Text style={styles.flowText}>Phục vụ sự kiện, du lịch, tác nghiệp với chi phí 10-15% giá gốc.</Text>
              </View>
              <Feather name="arrow-right" size={20} color="#71717A" style={{ alignSelf: 'center' }} />
              <View style={styles.flowStep}>
                <Text style={styles.flowTag}>VÒNG 2: THRIFT</Text>
                <Text style={styles.flowHeading}>Thanh lý tuyển chọn</Text>
                <Text style={styles.flowText}>Sở hữu vĩnh viễn đồ secondhand cao cấp sau kiểm định.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 04 - Cơ chế Giỏ hàng thông minh matching Screenshot 2 */}
        <View style={styles.richSection}>
          <Text style={styles.richPre}>04 · CƠ CHẾ GIỎ HÀNG THÔNG MINH</Text>
          <Text style={styles.richTitle}>Tự động phân tách đơn hàng</Text>
          <Text style={styles.richDesc}>
            Bạn có thể bỏ cả đồ RENT và đồ THRIFT của nhiều chủ shop vào chung một giỏ hàng. Hệ thống tự động phân tách:
          </Text>
          <View style={styles.bulletBox}>
            <Text style={styles.bulletItem}>• <Text style={styles.boldDark}>Đơn RENT:</Text> Yêu cầu ký quỹ Escrow bảo chứng cọc.</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.boldDark}>Đơn THRIFT:</Text> Thanh toán trực tiếp và nhận hàng vĩnh viễn.</Text>
          </View>
        </View>

        {/* 05 - Bảng cấu trúc chi phí & Thanh toán matching Screenshot 2 */}
        <View style={styles.richSection}>
          <Text style={styles.richPre}>05 · BẢNG CẤU TRÚC CHI PHÍ</Text>
          <Text style={styles.richTitle}>Minh bạch 100% không phí ẩn</Text>

          <View style={styles.costTable}>
            <View style={styles.costCol}>
              <Text style={styles.costColHeader}>Đơn thuê RENT</Text>
              <Text style={styles.costColItem}>• Phí thuê theo ngày niêm yết</Text>
              <Text style={styles.costColItem}>• Phí vận chuyển 2 chiều</Text>
              <Text style={styles.costColItem}>• Tiền cọc Escrow (Hoàn 100%)</Text>
            </View>
            <View style={styles.costColDivider} />
            <View style={styles.costCol}>
              <Text style={styles.costColHeader}>Đơn mua THRIFT</Text>
              <Text style={styles.costColItem}>• Giá sản phẩm niêm yết</Text>
              <Text style={styles.costColItem}>• Phí vận chuyển 1 chiều</Text>
              <Text style={styles.costColItem}>• Bảo hành 72h đổi trả</Text>
            </View>
          </View>
        </View>

        {/* 06 - Phân định vai trò matching Screenshot 2 */}
        <View style={styles.richSection}>
          <Text style={styles.richPre}>06 · PHÂN ĐỊNH VAI TRÒ TRÊN SÀN</Text>
          <Text style={styles.richTitle}>Bảo vệ tính nguyên bản của cộng đồng</Text>

          <View style={styles.roleCard}>
            <Text style={styles.roleTitle}>1. Người thuê / Người mua (User)</Text>
            <Text style={styles.roleDesc}>Tuân thủ quy chuẩn bảo quản đồ, giữ gìn nguyên vẹn ngoại quan.</Text>
          </View>

          <View style={styles.roleCard}>
            <Text style={styles.roleTitle}>2. Chủ shop (Shop Owner)</Text>
            <Text style={styles.roleDesc}>Mô tả chính xác độ mới, vệ sinh khử trùng và giao hàng đúng hạn.</Text>
          </View>

          <View style={styles.roleCard}>
            <Text style={styles.roleTitle}>3. Ban quản trị (Platform Admin)</Text>
            <Text style={styles.roleDesc}>Phê duyệt kiểm định 100% tin đăng và phân xử khiếu nại khách quan.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HowItWorksScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF9F5',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FAF8F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E2DA',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#1C1A18',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78736A',
  },
  tabBtnTextActive: {
    color: '#1C1A18',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  breadcrumbLink: {
    fontSize: 12,
    color: '#78736A',
  },
  breadcrumbMuted: {
    fontSize: 12,
    color: '#A8A29E',
  },
  breadcrumbSep: {
    fontSize: 12,
    color: '#D6D3D1',
  },
  breadcrumbCurrent: {
    fontSize: 12,
    color: '#1C1A18',
    fontWeight: '600',
  },
  heroSection: {
    padding: 18,
    backgroundColor: '#F4F0EA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    marginBottom: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 6,
    marginBottom: 10,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  heroBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1C1A18',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1A18',
    lineHeight: 32,
  },
  heroTitleItalic: {
    fontWeight: '400',
    fontStyle: 'italic',
    color: '#5E5A53',
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#5E5A53',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 14,
  },
  heroBtns: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  heroBtnDark: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1A18',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  heroBtnDarkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroBtnLight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  heroBtnLightText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1A18',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E7E2DA',
  },
  metricCard: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1A18',
  },
  metricSub: {
    fontSize: 10,
    color: '#78736A',
    marginTop: 1,
  },
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 16,
    marginBottom: 14,
  },
  introPre: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#78736A',
    letterSpacing: 1,
    marginBottom: 4,
  },
  introTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1A18',
    lineHeight: 20,
  },
  introDesc: {
    fontSize: 12,
    color: '#5E5A53',
    marginTop: 6,
    lineHeight: 17,
  },
  stepsList: {
    gap: 10,
    marginBottom: 20,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 16,
  },
  stepCardDark: {
    backgroundColor: '#1C1A18',
    borderColor: '#1C1A18',
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepNumCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F4F0EA',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumCircleDark: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1A18',
  },
  stepNumTextDark: {
    color: '#FFFFFF',
  },
  stepTagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#F4F0EA',
  },
  stepTagBadgeDark: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  stepTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5E5A53',
  },
  stepTagTextDark: {
    color: 'rgba(255,255,255,0.85)',
  },
  stepCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 4,
  },
  stepCardTitleDark: {
    color: '#FFFFFF',
  },
  stepCardDesc: {
    fontSize: 12,
    color: '#5E5A53',
    lineHeight: 17,
  },
  stepCardDescDark: {
    color: 'rgba(255,255,255,0.7)',
  },
  richSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 16,
    marginBottom: 16,
  },
  richPre: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#78736A',
    letterSpacing: 1,
    marginBottom: 4,
  },
  richTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 6,
  },
  richDesc: {
    fontSize: 12,
    color: '#5E5A53',
    lineHeight: 18,
  },
  boldDark: {
    fontWeight: '700',
    color: '#1C1A18',
  },
  flowCard: {
    backgroundColor: '#FBF9F5',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E7E2DA',
  },
  flowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  flowStep: {
    flex: 1,
  },
  flowTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  flowHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
    marginTop: 2,
  },
  flowText: {
    fontSize: 10,
    color: '#78736A',
    marginTop: 2,
    lineHeight: 14,
  },
  bulletBox: {
    backgroundColor: '#FBF9F5',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    gap: 4,
  },
  bulletItem: {
    fontSize: 11,
    color: '#5E5A53',
    lineHeight: 16,
  },
  costTable: {
    flexDirection: 'row',
    backgroundColor: '#FBF9F5',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E7E2DA',
  },
  costCol: {
    flex: 1,
    gap: 4,
  },
  costColDivider: {
    width: 1,
    backgroundColor: '#E7E2DA',
    marginHorizontal: 12,
  },
  costColHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 4,
  },
  costColItem: {
    fontSize: 11,
    color: '#5E5A53',
    lineHeight: 16,
  },
  roleCard: {
    backgroundColor: '#FBF9F5',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E7E2DA',
  },
  roleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
  },
  roleDesc: {
    fontSize: 11,
    color: '#78736A',
    marginTop: 2,
    lineHeight: 16,
  },
});
