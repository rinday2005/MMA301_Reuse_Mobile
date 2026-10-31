import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';
import {
  ABOUT_STATS,
  ABOUT_CIRCULAR_STEPS,
  ABOUT_CUSTOMER_BENEFITS,
  ABOUT_SHOP_BENEFITS,
} from '../../data/home/aboutData';

export const AboutScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader title="Giới Thiệu (About ReUse Hub)" showBack />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. BREADCRUMBS */}
        <View style={styles.breadcrumb}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={styles.breadcrumbLink}>Trang chủ</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumbSep}>/</Text>
          <Text style={styles.breadcrumbMuted}>Hệ sinh thái</Text>
          <Text style={styles.breadcrumbSep}>/</Text>
          <Text style={styles.breadcrumbCurrent}>Giới thiệu</Text>
        </View>

        {/* 2. HERO SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>VỀ REUSE HUB</Text>
          </View>

          <Text style={styles.heroTitle}>
            Mỗi món đồ đều có thể có thêm một vòng đời.
          </Text>

          <Text style={styles.heroSubtitle}>
            ReUse Hub kết nối{' '}
            <Text style={styles.boldDark}>RENT</Text> và{' '}
            <Text style={styles.boldDark}>THRIFT</Text> trong một mô hình sử dụng
            tuần hoàn khép kín, bền vững và nhân bản.
          </Text>

          {/* 4 Stats Grid */}
          <View style={styles.statsGrid}>
            {ABOUT_STATS.map((stat, idx) => (
              <View key={idx} style={styles.statCard}>
                <Text style={styles.statVal}>{stat.val}</Text>
                <Text style={styles.statSub}>{stat.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 3. REUSE HUB LÀ GÌ? */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionPre}>ĐỊNH VỊ NỀN TẢNG</Text>
          <Text style={styles.sectionTitle}>ReUse Hub là gì?</Text>
          <Text style={styles.sectionPara}>
            ReUse Hub là marketplace nơi người dùng có thể thuê những sản phẩm mình chỉ cần dùng trong thời gian ngắn, hoặc mua những sản phẩm đã qua sử dụng vẫn còn nhiều giá trị.
          </Text>
          <Text style={styles.sectionParaSecondary}>
            Chúng tôi tái định nghĩa cách tiếp cận thiết bị và phong cách sống: thay vì chạy đua mua sắm sở hữu dẫn đến lãng phí, các sản phẩm tinh tuyển từ máy ảnh cao cấp, trang phục sự kiện đến phụ kiện dã ngoại được luân chuyển có kiểm soát qua bàn tay của những người thực sự trân trọng giá trị sử dụng của nó.
          </Text>

          {/* 3 Value Checkmarks */}
          <View style={styles.checkList}>
            {[
              'Kiểm định chất lượng 14 bước nghiêm ngặt trước mỗi lần chuyển giao',
              'Đồng bộ đóng gói hộp cứng chống va đập và quy trình bàn giao có bảo hiểm',
              'Tự động hóa thanh toán và hoàn trả tiền cọc không cần thương lượng thủ công',
            ].map((text, idx) => (
              <View key={idx} style={styles.checkItem}>
                <View style={styles.checkIconCircle}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
                <Text style={styles.checkText}>{text}</Text>
              </View>
            ))}
          </View>

          {/* 3 Showcase Visual Cards */}
          <View style={styles.showcaseGrid}>
            {/* Card 1 Wide */}
            <View style={styles.showcaseCardWide}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
                }}
                style={styles.showcaseImgWide}
              />
              <View style={styles.showcaseOverlay}>
                <Text style={styles.showcaseTag}>THIẾT BỊ QUANG HỌC & SÁNG TẠO</Text>
                <Text style={styles.showcaseHeading}>Máy ảnh Mirrorless & Ống kính Archival</Text>
                <Text style={styles.showcaseDesc}>Trải nghiệm thiết bị đắt tiền cho các dự án mà không cần mua đứt.</Text>
              </View>
            </View>

            {/* Card 2 & 3 */}
            <View style={styles.showcaseRow}>
              <View style={styles.showcaseCardHalf}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
                  }}
                  style={styles.showcaseImgHalf}
                />
                <View style={styles.showcaseOverlay}>
                  <Text style={styles.showcaseTag}>THỜI TRANG & SỰ KIỆN</Text>
                  <Text style={styles.showcaseHeadingSmall}>Trang phục cao cấp</Text>
                  <Text style={styles.showcaseDescSmall}>Khử trùng y tế chuẩn xác.</Text>
                </View>
              </View>

              <View style={styles.showcaseCardHalf}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
                  }}
                  style={styles.showcaseImgHalf}
                />
                <View style={styles.showcaseOverlay}>
                  <Text style={styles.showcaseTag}>SNEAKERS & GIÀY</Text>
                  <Text style={styles.showcaseHeadingSmall}>Đôi giày cho vòng đời mới</Text>
                  <Text style={styles.showcaseDescSmall}>Sẵn sàng đồng hành bền bỉ.</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 4. MÔ HÌNH TUẦN HOÀN 6 BƯỚC */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionPre}>KIẾN TRÚC VẬN HÀNH KHÉP KÍN</Text>
          <Text style={styles.sectionTitle}>Mô hình tuần hoàn của ReUse Hub</Text>
          <Text style={styles.sectionPara}>
            Sau khi được trả về, sản phẩm có thể tiếp tục được cho thuê hoặc chuyển sang THRIFT nếu đủ điều kiện.
          </Text>

          <View style={styles.stepsGrid}>
            {ABOUT_CIRCULAR_STEPS.map((step) => {
              const isDark = step.variant === 'dark';
              const isEmerald = step.variant === 'emerald';
              const isAmber = step.variant === 'amber';
              return (
                <View
                  key={step.num}
                  style={[
                    styles.stepBox,
                    isDark && styles.stepBoxDark,
                    isEmerald && styles.stepBoxEmerald,
                    isAmber && styles.stepBoxAmber,
                  ]}
                >
                  <View
                    style={[
                      styles.stepNumBadge,
                      isDark && styles.stepNumBadgeDark,
                      isEmerald && styles.stepNumBadgeEmerald,
                      isAmber && styles.stepNumBadgeAmber,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNumText,
                        isDark && styles.stepNumTextDark,
                        isEmerald && styles.stepNumTextWhite,
                        isAmber && styles.stepNumTextWhite,
                      ]}
                    >
                      {step.num}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.stepBoxTitle,
                      isDark && styles.stepBoxTitleDark,
                      isEmerald && styles.stepBoxTitleEmerald,
                      isAmber && styles.stepBoxTitleAmber,
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text
                    style={[
                      styles.stepBoxDesc,
                      isDark && styles.stepBoxDescDark,
                      isEmerald && styles.stepBoxDescEmerald,
                      isAmber && styles.stepBoxDescAmber,
                    ]}
                  >
                    {step.desc}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Second-Life Note */}
          <View style={styles.secondLifeBox}>
            <Ionicons name="leaf" size={18} color="#059669" />
            <Text style={styles.secondLifeText}>
              <Text style={styles.boldDark}>Quy chế Second-Life: </Text>
              Khi sản phẩm hoàn thành chu kỳ thuê hoặc người dùng muốn sở hữu vĩnh viễn, sản phẩm được chuyển sang THRIFT với giá tối ưu và hồ sơ kiểm định minh bạch.
            </Text>
          </View>
        </View>

        {/* 5. HAI VAI TRÒ */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionPre}>ĐỐI TƯỢNG ĐỒNG HÀNH</Text>
          <Text style={styles.sectionTitle}>Hai vai trò tạo nên nền kinh tế tuần hoàn</Text>

          {/* Role 1: Customer */}
          <View style={styles.roleCardLight}>
            <View style={styles.roleIconCircle}>
              <Feather name="user" size={18} color="#1C1A18" />
            </View>
            <Text style={styles.rolePreTag}>DÀNH CHO KHÁCH HÀNG</Text>
            <Text style={styles.roleCardTitle}>Dành cho bạn</Text>
            <Text style={styles.roleCardSubtitle}>
              Tự do trải nghiệm mọi thiết bị đỉnh cao mà không bị ràng buộc bởi chi phí sở hữu cồng kềnh hay nỗi lo mất giá qua năm tháng.
            </Text>

            <View style={styles.roleBenefits}>
              {ABOUT_CUSTOMER_BENEFITS.map((b, i) => (
                <View key={i} style={styles.roleBenefitItem}>
                  <View style={styles.roleCheckCircle}>
                    <Text style={styles.roleCheck}>✓</Text>
                  </View>
                  <Text style={styles.roleBenefitText}>
                    <Text style={styles.boldDark}>{b.title} </Text>
                    {b.desc}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Role 2: Shop Owner */}
          <View style={styles.roleCardDark}>
            <View style={styles.roleIconCircleDark}>
              <Feather name="shopping-bag" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.rolePreTagAmber}>ĐỐI TÁC CUNG ỨNG ỦY QUYỀN</Text>
            <Text style={styles.roleCardTitleWhite}>Dành cho Shop Owner</Text>
            <Text style={styles.roleCardSubtitleLight}>
              Chuyên môn hóa khâu quản lý tài sản, kiểm định kỹ thuật và duy trì chất lượng dịch vụ đồng bộ trên toàn nền tảng ReUse Hub.
            </Text>

            <View style={styles.roleBenefits}>
              {ABOUT_SHOP_BENEFITS.map((b, i) => (
                <View key={i} style={styles.roleBenefitItem}>
                  <View style={styles.roleCheckCircleDark}>
                    <Text style={styles.roleCheckDark}>✓</Text>
                  </View>
                  <Text style={styles.roleBenefitTextWhite}>
                    <Text style={styles.boldWhite}>{b.title} </Text>
                    {b.desc}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 6. TẦM NHÌN & SỨ MỆNH CTA */}
        <View style={styles.missionCard}>
          <View style={styles.quoteCircle}>
            <MaterialCommunityIcons name="format-quote-close" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.missionPre}>TẦM NHÌN VÀ SỨ MỆNH</Text>
          <Text style={styles.missionQuote}>
            "Biến việc tái sử dụng thành một phần tự nhiên của cuộc sống hằng ngày."
          </Text>
          <Text style={styles.missionDesc}>
            ReUse Hub tin rằng tương lai của tiêu dùng không nằm ở việc sở hữu thật nhiều, mà ở khả năng tối ưu hóa giá trị của từng sản phẩm. Mỗi lần bạn chọn thuê một món đồ hoặc mua lại một thiết bị đã qua sử dụng, bạn đang góp phần kéo dài hành trình của nó và giảm thiểu dấu chân sinh thái trên Trái Đất.
          </Text>

          <View style={styles.missionBtns}>
            <TouchableOpacity
              style={styles.missionBtnPrimary}
              onPress={() => navigation.navigate('RentTab')}
              activeOpacity={0.8}
            >
              <Text style={styles.missionBtnPrimaryText}>Khám phá RENT</Text>
              <Feather name="arrow-right" size={14} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.missionBtnSecondary}
              onPress={() => navigation.navigate('ThriftTab')}
              activeOpacity={0.8}
            >
              <Text style={styles.missionBtnSecondaryText}>Mua đồ THRIFT</Text>
              <Feather name="shopping-bag" size={14} color="#1C1A18" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 6,
  },
  breadcrumbLink: {
    fontSize: 12,
    color: '#7D756D',
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
    marginBottom: 20,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F3EFEA',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 6,
    marginBottom: 10,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1C1A18',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#7D756D',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1918',
    lineHeight: 34,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#7D756D',
    lineHeight: 20,
    marginBottom: 16,
  },
  boldDark: {
    fontWeight: '700',
    color: '#1A1918',
  },
  boldWhite: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E8E2D9',
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    padding: 12,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1918',
  },
  statSub: {
    fontSize: 11,
    color: '#7D756D',
    marginTop: 2,
    lineHeight: 15,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    padding: 18,
    marginBottom: 20,
  },
  sectionPre: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#7D756D',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1918',
    marginBottom: 8,
  },
  sectionPara: {
    fontSize: 13,
    color: '#7D756D',
    lineHeight: 19,
    marginBottom: 6,
  },
  sectionParaSecondary: {
    fontSize: 12,
    color: '#7D756D',
    lineHeight: 18,
    marginBottom: 14,
  },
  checkList: {
    gap: 8,
    marginBottom: 16,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3EFEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1A1918',
  },
  checkText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1918',
    lineHeight: 17,
  },
  showcaseGrid: {
    gap: 10,
    marginTop: 6,
  },
  showcaseCardWide: {
    borderRadius: 14,
    overflow: 'hidden',
    height: 180,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E8E2D9',
  },
  showcaseImgWide: {
    width: '100%',
    height: '100%',
  },
  showcaseOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  showcaseTag: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FCD34D',
    letterSpacing: 0.8,
  },
  showcaseHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  showcaseHeadingSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  showcaseDesc: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
  },
  showcaseDescSmall: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
  },
  showcaseRow: {
    flexDirection: 'row',
    gap: 10,
  },
  showcaseCardHalf: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    height: 140,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E8E2D9',
  },
  showcaseImgHalf: {
    width: '100%',
    height: '100%',
  },
  stepsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  stepBox: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    padding: 12,
    alignItems: 'center',
    textAlign: 'center',
  },
  stepBoxDark: {
    backgroundColor: '#1A1918',
    borderColor: '#1A1918',
  },
  stepBoxEmerald: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  stepBoxAmber: {
    backgroundColor: '#FEFCE8',
    borderColor: '#FEF08A',
  },
  stepNumBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F3EFEA',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepNumBadgeDark: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  stepNumBadgeEmerald: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  stepNumBadgeAmber: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  stepNumText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1A1918',
  },
  stepNumTextDark: {
    color: '#1A1918',
  },
  stepNumTextWhite: {
    color: '#FFFFFF',
  },
  stepBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1918',
  },
  stepBoxTitleDark: {
    color: '#FFFFFF',
  },
  stepBoxTitleEmerald: {
    color: '#065F46',
  },
  stepBoxTitleAmber: {
    color: '#92400E',
  },
  stepBoxDesc: {
    fontSize: 10,
    color: '#7D756D',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
  stepBoxDescDark: {
    color: 'rgba(255,255,255,0.7)',
  },
  stepBoxDescEmerald: {
    color: '#047857',
  },
  stepBoxDescAmber: {
    color: '#B45309',
  },
  secondLifeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E2D9',
  },
  secondLifeText: {
    flex: 1,
    fontSize: 11,
    color: '#7D756D',
    lineHeight: 16,
  },
  roleCardLight: {
    backgroundColor: '#FAF8F5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    padding: 16,
    marginTop: 10,
  },
  roleIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  rolePreTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#7D756D',
    letterSpacing: 0.8,
  },
  roleCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1918',
    marginTop: 2,
    marginBottom: 4,
  },
  roleCardSubtitle: {
    fontSize: 12,
    color: '#7D756D',
    lineHeight: 17,
    marginBottom: 12,
  },
  roleBenefits: {
    gap: 8,
  },
  roleBenefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  roleCheckCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  roleCheck: {
    fontSize: 9,
    fontWeight: '800',
    color: '#065F46',
  },
  roleBenefitText: {
    flex: 1,
    fontSize: 12,
    color: '#1A1918',
    lineHeight: 17,
  },
  roleCardDark: {
    backgroundColor: '#1A1918',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  roleIconCircleDark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  rolePreTagAmber: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FCD34D',
    letterSpacing: 0.8,
  },
  roleCardTitleWhite: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
    marginBottom: 4,
  },
  roleCardSubtitleLight: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 17,
    marginBottom: 12,
  },
  roleCheckCircleDark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  roleCheckDark: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  roleBenefitTextWhite: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 17,
  },
  missionCard: {
    backgroundColor: '#F3EFEA',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    padding: 22,
    alignItems: 'center',
  },
  quoteCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1918',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  missionPre: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#7D756D',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  missionQuote: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1918',
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 10,
  },
  missionDesc: {
    fontSize: 12,
    color: '#7D756D',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  missionBtns: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  missionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1918',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  missionBtnPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  missionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  missionBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1918',
  },
});
