import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  topic: string;
  orderId: string;
  message: string;
}

export const ContactScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [copied, setCopied] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    phone: '',
    topic: 'rent',
    orderId: '',
    message: '',
  });

  const topics = [
    { key: 'rent', label: 'Dịch vụ RENT (Thuê đồ)' },
    { key: 'thrift', label: 'Dịch vụ THRIFT (Mua sắm)' },
    { key: 'payment', label: 'Thanh toán VNPay & Hoàn cọc' },
    { key: 'logistics', label: 'Vận chuyển & Đóng gói' },
    { key: 'kyc', label: 'Định danh KYC & Hạn mức' },
    { key: 'other', label: 'Chủ đề khác' },
  ];

  const handleCopyEmail = () => {
    // In React Native we can show copied toast/feedback
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ email để chúng tôi phản hồi.');
      return;
    }
    if (!formData.message.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung cần hỗ trợ.');
      return;
    }
    setIsSuccess(true);
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      topic: 'rent',
      orderId: '',
      message: '',
    });
    setIsSuccess(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <AppHeader title="Liên Hệ Hỗ Trợ" showBack />

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
            <TouchableOpacity onPress={() => navigation.navigate('HowItWorks')}>
              <Text style={styles.breadcrumbLink}>Hệ sinh thái</Text>
            </TouchableOpacity>
            <Text style={styles.breadcrumbSep}>/</Text>
            <Text style={styles.breadcrumbCurrent}>Liên hệ hỗ trợ</Text>
          </View>

          {/* 2. HERO HEADER */}
          <View style={styles.heroBox}>
            <View style={styles.heroBadge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>HỖ TRỢ · LIÊN HỆ TRỰC TIẾP</Text>
            </View>
            <Text style={styles.heroTitle}>Liên hệ ReUse Hub</Text>
            <Text style={styles.heroSubtitle}>
              Bạn có câu hỏi về thuê, mua, thanh toán hoặc đơn hàng? Đội ngũ hỗ trợ chuyên sâu của ReUse Hub sẵn sàng giải đáp và đồng hành cùng hành trình tuần hoàn của bạn.
            </Text>
          </View>

          {/* 3. SUPPORT INFO CHANNELS */}
          <View style={styles.sectionBlock}>
            <Text style={styles.blockTitle}>Chúng tôi có thể giúp gì cho bạn?</Text>
            <Text style={styles.blockDesc}>
              ReUse Hub tiếp nhận mọi thắc mắc từ khách hàng cá nhân, đại diện doanh nghiệp, và các chủ sở hữu thiết bị (Shop Owner) tham gia mạng lưới ký gửi tuần hoàn.
            </Text>

            <View style={styles.channelCardsList}>
              {/* Email */}
              <View style={styles.channelCard}>
                <View style={styles.channelIconBox}>
                  <Feather name="mail" size={18} color="#1C1A18" />
                </View>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelPre}>HỘP THƯ HỖ TRỢ</Text>
                  <TouchableOpacity onPress={() => Linking.openURL('mailto:support@reusehub.com')}>
                    <Text style={styles.channelMainTextBold}>support@reusehub.com</Text>
                  </TouchableOpacity>
                  <Text style={styles.channelSub}>Phản hồi nhanh trong 2–4 giờ</Text>
                </View>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={handleCopyEmail}
                  activeOpacity={0.7}
                >
                  <Text style={styles.copyBtnText}>{copied ? 'Đã sao chép' : 'Copy'}</Text>
                </TouchableOpacity>
              </View>

              {/* Phone */}
              <View style={styles.channelCard}>
                <View style={styles.channelIconBox}>
                  <Feather name="phone-call" size={18} color="#1C1A18" />
                </View>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelPre}>TỔNG ĐÀI CONCIERGE</Text>
                  <TouchableOpacity onPress={() => Linking.openURL('tel:+842873008899')}>
                    <Text style={styles.channelMainTextBold}>+84 (0) 28 7300 8899</Text>
                  </TouchableOpacity>
                  <Text style={styles.channelSub}>Bàn làm việc giám sát giao nhận</Text>
                </View>
              </View>

              {/* Hours */}
              <View style={styles.channelCard}>
                <View style={styles.channelIconBox}>
                  <Feather name="clock" size={18} color="#1C1A18" />
                </View>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelPre}>KHUNG GIỜ HOẠT ĐỘNG</Text>
                  <Text style={styles.channelMainText}>Thứ Hai – Thứ Sáu: <Text style={styles.boldDark}>08:00 – 17:30</Text></Text>
                  <Text style={styles.channelMainText}>Thứ Bảy: <Text style={styles.boldDark}>08:30 – 12:30</Text></Text>
                  <Text style={styles.channelSub}>Chủ Nhật: Trực tin nhắn khẩn cấp qua kênh Escrow</Text>
                </View>
              </View>

              {/* Hub locations */}
              <View style={styles.channelCard}>
                <View style={styles.channelIconBox}>
                  <Feather name="map-pin" size={18} color="#1C1A18" />
                </View>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelPre}>TRẠM ĐỐI SOÁT & GIAO NHẬN</Text>
                  <Text style={styles.channelMainText}><Text style={styles.boldDark}>Hub TP.HCM: </Text>Hub A-12, Thảo Điền, TP. Thủ Đức</Text>
                  <Text style={styles.channelMainText}><Text style={styles.boldDark}>Hub Hà Nội: </Text>Hub 24, Phố Tràng Tiền, Q. Hoàn Kiếm</Text>
                </View>
              </View>
            </View>

            {/* Priority Topic Card */}
            <View style={styles.priorityBox}>
              <View style={styles.priorityHeaderRow}>
                <View style={styles.priorityDot} />
                <Text style={styles.priorityTitle}>CÁC NHÓM CHỦ ĐỀ ĐƯỢC HỖ TRỢ ƯU TIÊN</Text>
              </View>
              <View style={styles.priorityList}>
                {[
                  { title: 'Dịch vụ RENT:', desc: 'Điều chỉnh lịch thuê, hoàn cọc Escrow, kiểm tra thiết bị' },
                  { title: 'Dịch vụ THRIFT:', desc: 'Nhật ký kiểm định Audit Bench, chính sách hoàn trả 72h' },
                  { title: 'Thanh toán VNPay:', desc: 'Tra cứu mã giao dịch, hóa đơn VAT công ty' },
                  { title: 'Vận chuyển & Giao nhận:', desc: 'Tình trạng đóng thùng và bàn giao niêm phong' },
                  { title: 'Định danh KYC:', desc: 'Mở rộng hạn mức bảo lãnh thiết bị cao cấp' },
                ].map((item, idx) => (
                  <View key={idx} style={styles.priorityItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#059669" />
                    <Text style={styles.priorityText}>
                      <Text style={styles.boldDark}>{item.title} </Text>
                      {item.desc}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* 4. CONTACT FORM BOX */}
          <View style={styles.formCard}>
            {isSuccess ? (
              <View style={styles.successBox}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark" size={32} color="#059669" />
                </View>
                <Text style={styles.successTitle}>Yêu Cầu Đã Được Tiếp Nhận!</Text>
                <Text style={styles.successDesc}>
                  Cảm ơn bạn đã liên hệ ReUse Hub. Đội ngũ chuyên viên sẽ kiểm tra nội dung và phản hồi qua email <Text style={styles.boldDark}>{formData.email}</Text> trong vòng 2–4 giờ làm việc.
                </Text>
                <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                  <Text style={styles.resetBtnText}>Gửi yêu cầu khác</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.formTitle}>Gửi yêu cầu hỗ trợ</Text>
                <Text style={styles.formSubtitle}>
                  Khách vãng lai và thành viên đều có thể gửi tin nhắn mà không bắt buộc đăng nhập trước.
                </Text>

                {/* Field: Full Name */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Họ và tên *</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor="#A8A29E"
                    value={formData.fullName}
                    onChangeText={(val) => setFormData((prev) => ({ ...prev, fullName: val }))}
                  />
                </View>

                {/* Field: Email */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Địa chỉ Email *</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="name@example.com"
                    placeholderTextColor="#A8A29E"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.email}
                    onChangeText={(val) => setFormData((prev) => ({ ...prev, email: val }))}
                  />
                </View>

                {/* Field: Phone */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Số điện thoại</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="0908 123 456"
                    placeholderTextColor="#A8A29E"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(val) => setFormData((prev) => ({ ...prev, phone: val }))}
                  />
                </View>

                {/* Field: Topic Selector */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Chủ đề yêu cầu *</Text>
                  <View style={styles.topicChips}>
                    {topics.map((t) => {
                      const isSelected = formData.topic === t.key;
                      return (
                        <TouchableOpacity
                          key={t.key}
                          style={[styles.topicChip, isSelected && styles.topicChipSelected]}
                          onPress={() => setFormData((prev) => ({ ...prev, topic: t.key }))}
                        >
                          <Text
                            style={[
                              styles.topicChipText,
                              isSelected && styles.topicChipTextSelected,
                            ]}
                          >
                            {t.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Field: Order Code */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Mã đơn hàng (Nếu có)</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="VD: RENT-8921 hoặc THRIFT-4102"
                    placeholderTextColor="#A8A29E"
                    autoCapitalize="characters"
                    value={formData.orderId}
                    onChangeText={(val) => setFormData((prev) => ({ ...prev, orderId: val }))}
                  />
                </View>

                {/* Field: Message */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Nội dung chi tiết *</Text>
                  <TextInput
                    style={[styles.inputField, styles.textAreaField]}
                    placeholder="Mô tả cụ thể vấn đề hoặc nội dung cần giải đáp..."
                    placeholderTextColor="#A8A29E"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={formData.message}
                    onChangeText={(val) => setFormData((prev) => ({ ...prev, message: val }))}
                  />
                </View>

                {/* Submit button */}
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitBtnText}>Gửi yêu cầu hỗ trợ</Text>
                  <Feather name="arrow-right" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 5. FAQ PROMPT BOX */}
          <View style={styles.faqPromptCard}>
            <Text style={styles.promptIcon}>💡</Text>
            <View style={styles.promptInfo}>
              <Text style={styles.promptTitle}>Bạn muốn tìm câu trả lời tức thì?</Text>
              <Text style={styles.promptDesc}>
                Hơn 30 câu hỏi về tiền cọc, quy trình vận chuyển, tiêu chuẩn vệ sinh đã được giải đáp chi tiết trong mục Hỏi & Đáp.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('FAQ')}
                style={styles.promptLinkWrap}
              >
                <Text style={styles.promptLink}>Xem câu hỏi thường gặp FAQ →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ContactScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF9F5',
  },
  keyboardContainer: {
    flex: 1,
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
  breadcrumbSep: {
    fontSize: 12,
    color: '#D6D3D1',
  },
  breadcrumbCurrent: {
    fontSize: 12,
    color: '#1C1A18',
    fontWeight: '600',
  },
  heroBox: {
    backgroundColor: '#F4F0EA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 18,
    marginBottom: 18,
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
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1C1A18',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1C1A18',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#5E5A53',
    lineHeight: 18,
  },
  boldDark: {
    fontWeight: '700',
    color: '#1C1A18',
  },
  sectionBlock: {
    marginBottom: 20,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 4,
  },
  blockDesc: {
    fontSize: 12,
    color: '#5E5A53',
    lineHeight: 18,
    marginBottom: 14,
  },
  channelCardsList: {
    gap: 10,
    marginBottom: 16,
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 12,
    gap: 12,
  },
  channelIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FBF9F5',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelInfo: {
    flex: 1,
  },
  channelPre: {
    fontSize: 9,
    fontWeight: '700',
    color: '#78736A',
    letterSpacing: 0.8,
  },
  channelMainTextBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
    marginTop: 2,
  },
  channelMainText: {
    fontSize: 12,
    color: '#1C1A18',
    marginTop: 2,
    lineHeight: 16,
  },
  channelSub: {
    fontSize: 11,
    color: '#78736A',
    marginTop: 2,
  },
  copyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    alignSelf: 'flex-start',
  },
  copyBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5E5A53',
  },
  priorityBox: {
    backgroundColor: '#F4F0EA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 14,
  },
  priorityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1C1A18',
  },
  priorityTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1C1A18',
    letterSpacing: 0.8,
  },
  priorityList: {
    gap: 8,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  priorityText: {
    flex: 1,
    fontSize: 11,
    color: '#5E5A53',
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 18,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 12,
    color: '#78736A',
    lineHeight: 17,
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1A18',
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: '#FBF9F5',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1C1A18',
  },
  textAreaField: {
    minHeight: 90,
  },
  topicChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  topicChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FBF9F5',
    borderWidth: 1,
    borderColor: '#E7E2DA',
  },
  topicChipSelected: {
    backgroundColor: '#1C1A18',
    borderColor: '#1C1A18',
  },
  topicChipText: {
    fontSize: 11,
    color: '#5E5A53',
  },
  topicChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1A18',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 6,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 12,
    color: '#5E5A53',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  resetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F4F0EA',
    borderWidth: 1,
    borderColor: '#E7E2DA',
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
  },
  faqPromptCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 16,
    gap: 12,
  },
  promptIcon: {
    fontSize: 22,
  },
  promptInfo: {
    flex: 1,
  },
  promptTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 4,
  },
  promptDesc: {
    fontSize: 11,
    color: '#78736A',
    lineHeight: 16,
    marginBottom: 8,
  },
  promptLinkWrap: {
    alignSelf: 'flex-start',
  },
  promptLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
    textDecorationLine: 'underline',
  },
});
