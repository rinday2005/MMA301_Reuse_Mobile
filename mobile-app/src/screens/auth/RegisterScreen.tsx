import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { registerApi } from '../../services/auth.api';
import { isValidEmail, isValidPhone } from '../../utils/validation';

export const RegisterScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [role, setRole] = useState<'USER' | 'SHOP_OWNER'>('USER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreement, setAgreement] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Errors & Status
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [agreementError, setAgreementError] = useState('');
  const [apiError, setApiError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) {
      return { label: 'Tối thiểu 6 ký tự', level: 0 };
    }
    if (password.length < 6) {
      return { label: 'Yếu', level: 1 };
    }
    if (password.length < 10) {
      return { label: 'Tốt', level: 2 };
    }
    return { label: 'Mạnh', level: 3 };
  };

  const passwordStrength = getPasswordStrength();

  const validate = (): boolean => {
    let valid = true;
    setFullNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setAgreementError('');
    setApiError('');

    if (!fullName.trim()) {
      setFullNameError('Vui lòng nhập họ và tên');
      valid = false;
    } else if (fullName.trim().length < 2) {
      setFullNameError('Họ tên phải có ít nhất 2 ký tự');
      valid = false;
    }

    if (!email.trim()) {
      setEmailError('Vui lòng nhập email');
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Email không hợp lệ');
      valid = false;
    }

    if (phoneNumber.trim() && !isValidPhone(phoneNumber)) {
      setPhoneError('Số điện thoại không đúng định dạng');
      valid = false;
    }

    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Vui lòng xác nhận mật khẩu');
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu xác nhận không khớp');
      valid = false;
    }

    if (!agreement) {
      setAgreementError('Bạn cần đồng ý với điều khoản để tiếp tục');
      valid = false;
    }

    return valid;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');
    setRegisterSuccess(false);

    try {
      await registerApi({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        password,
        role,
      });

      setRegisterSuccess(true);

      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorCode = error.response?.data?.errorCode;
        if (errorCode === 'EMAIL_ALREADY_EXISTS') {
          setEmailError('Email này đã được đăng ký.');
          return;
        }
      }
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 24) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ========================================================= */}
        {/* TOP SECTION: FORM ĐĂNG KÝ (LÊN ĐẦU THEO CHUẨN MOBILE)     */}
        {/* ========================================================= */}
        <View style={styles.formCard}>
          {/* Header Row */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.brandBadge}>
              <View style={styles.brandIconBox}>
                <Text style={styles.brandIconText}>∞</Text>
              </View>
              <Text style={styles.brandTitle}>REUSE HUB</Text>
            </View>
            <View style={styles.portalBadge}>
              <Text style={styles.portalBadgeText}>MEMBERSHIP</Text>
            </View>
          </View>

          {/* Heading */}
          <View style={styles.headingSection}>
            <Text style={styles.headingTitle}>Đăng Kí Tài Khoản</Text>
            <Text style={styles.headingSubtitle}>
              Tham gia ReUse Hub để thuê trang phục cao cấp và trải nghiệm tủ đồ thời trang tuần hoàn.
            </Text>
          </View>

          {/* Alert: API Error */}
          {!!apiError && (
            <View style={styles.errorAlert}>
              <Text style={styles.errorAlertTitle}>Đăng ký thất bại</Text>
              <Text style={styles.errorAlertMessage}>{apiError}</Text>
            </View>
          )}

          {/* Alert: Register Success */}
          {registerSuccess && (
            <View style={styles.successAlert}>
              <Text style={styles.successAlertTitle}>Tài khoản đã được tạo thành công</Text>
              <Text style={styles.successAlertMessage}>
                Đang chuyển hướng sang màn hình đăng nhập...
              </Text>
            </View>
          )}

          {/* Field: Full Name */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>
                Họ và Tên <Text style={styles.requiredStar}>*</Text>
              </Text>
              {!!fullNameError && <Text style={styles.fieldErrorText}>{fullNameError}</Text>}
            </View>
            <View style={[styles.inputBox, !!fullNameError && styles.inputBoxError]}>
              <TextInput
                style={styles.inputField}
                placeholder="Nguyễn Văn A"
                placeholderTextColor="#A8A29E"
                value={fullName}
                onChangeText={(t) => {
                  setFullName(t);
                  if (fullNameError) setFullNameError('');
                }}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Field: Email */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>
                Địa Chỉ Email <Text style={styles.requiredStar}>*</Text>
              </Text>
              {!!emailError && <Text style={styles.fieldErrorText}>{emailError}</Text>}
            </View>
            <View style={[styles.inputBox, !!emailError && styles.inputBoxError]}>
              <Text style={styles.atSignPrefix}>@</Text>
              <TextInput
                style={styles.inputField}
                placeholder="name@example.com"
                placeholderTextColor="#A8A29E"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (emailError) setEmailError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Field: Phone Number */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Số Điện Thoại</Text>
              <Text style={styles.fieldSubLabel}>(Không bắt buộc)</Text>
            </View>
            <View style={[styles.inputBox, !!phoneError && styles.inputBoxError]}>
              <TextInput
                style={styles.inputField}
                placeholder="0901234567"
                placeholderTextColor="#A8A29E"
                value={phoneNumber}
                onChangeText={(t) => {
                  setPhoneNumber(t);
                  if (phoneError) setPhoneError('');
                }}
                keyboardType="phone-pad"
              />
            </View>
            {!!phoneError && <Text style={styles.fieldErrorTextUnder}>{phoneError}</Text>}
          </View>

          {/* Field: Password */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>
                Mật Khẩu <Text style={styles.requiredStar}>*</Text>
              </Text>
              {!!passwordError && <Text style={styles.fieldErrorText}>{passwordError}</Text>}
            </View>
            <View style={[styles.inputBox, !!passwordError && styles.inputBoxError]}>
              <TextInput
                style={styles.inputField}
                placeholder="Tối thiểu 6 ký tự"
                placeholderTextColor="#A8A29E"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (passwordError) setPasswordError('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.passwordToggleBtn}
                onPress={() => setShowPassword((p) => !p)}
                activeOpacity={0.7}
              >
                <Text style={styles.passwordToggleText}>{showPassword ? 'Ẩn' : 'Hiện'}</Text>
              </TouchableOpacity>
            </View>

            {/* Password Strength Meter */}
            <View style={styles.strengthRow}>
              <Text style={styles.strengthHeading}>Độ mạnh mật khẩu:</Text>
              <Text
                style={[
                  styles.strengthLabel,
                  passwordStrength.level === 1 && styles.strengthWeak,
                  passwordStrength.level === 2 && styles.strengthGood,
                  passwordStrength.level === 3 && styles.strengthStrong,
                ]}
              >
                {passwordStrength.label}
              </Text>
            </View>
            <View style={styles.strengthBarContainer}>
              <View
                style={[
                  styles.strengthSegment,
                  passwordStrength.level >= 1 && (passwordStrength.level === 1 ? styles.segmentWeak : styles.segmentGood),
                ]}
              />
              <View
                style={[
                  styles.strengthSegment,
                  passwordStrength.level >= 2 && styles.segmentGood,
                ]}
              />
              <View
                style={[
                  styles.strengthSegment,
                  passwordStrength.level >= 3 && styles.segmentStrong,
                ]}
              />
            </View>
          </View>

          {/* Field: Confirm Password */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>
                Xác Nhận Mật Khẩu <Text style={styles.requiredStar}>*</Text>
              </Text>
              {!!confirmPasswordError && (
                <Text style={styles.fieldErrorText}>{confirmPasswordError}</Text>
              )}
            </View>
            <View style={[styles.inputBox, !!confirmPasswordError && styles.inputBoxError]}>
              <TextInput
                style={styles.inputField}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#A8A29E"
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  if (confirmPasswordError) setConfirmPasswordError('');
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.passwordToggleBtn}
                onPress={() => setShowConfirmPassword((p) => !p)}
                activeOpacity={0.7}
              >
                <Text style={styles.passwordToggleText}>{showConfirmPassword ? 'Ẩn' : 'Hiện'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Agreement Checkbox */}
          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => {
              setAgreement((p) => !p);
              if (agreementError) setAgreementError('');
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, agreement && styles.checkboxActive]}>
              {agreement && <Text style={styles.checkboxCheck}>✓</Text>}
            </View>
            <Text style={styles.agreementText}>
              Tôi đồng ý với{' '}
              <Text style={styles.agreementLink}>Điều khoản dịch vụ</Text> và{' '}
              <Text style={styles.agreementLink}>Chính sách bảo mật</Text> của ReUse Hub.
            </Text>
          </TouchableOpacity>
          {!!agreementError && <Text style={styles.agreementErrorText}>{agreementError}</Text>}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleRegister}
            disabled={isSubmitting || registerSuccess}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.submitButtonText}>ĐANG XỬ LÝ...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>ĐĂNG KÝ TÀI KHOẢN →</Text>
            )}
          </TouchableOpacity>

          {/* Login Prompt */}
          <View style={styles.loginPromptRow}>
            <Text style={styles.promptText}>Đã có tài khoản?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
              <Text style={styles.promptLinkText}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================= */}
        {/* BOTTOM SECTION: HÌNH ẢNH & CAM KẾT CỘNG ĐỒNG (NHƯ WEB)    */}
        {/* ========================================================= */}
        <View style={styles.showcaseCard}>
          {/* Header Tag */}
          <View style={styles.showcaseHeaderRow}>
            <View style={styles.circleTag}>
              <View style={styles.circleDot} />
              <Text style={styles.circleTagText}>SỔ TAY THỜI TRANG TUẦN HOÀN</Text>
            </View>
            <Text style={styles.custodyTagText}>SERIES 18</Text>
          </View>

          {/* Heading */}
          <Text style={styles.showcaseTitle}>
            Elevating style, sharing fashion.
          </Text>
          <Text style={styles.showcaseDescription}>
            Mỗi thành viên đăng ký sẽ được tiếp cận bộ sưu tập trang phục thiết kế, phụ kiện cao cấp được bảo quản theo tiêu chuẩn chuyên nghiệp.
          </Text>

          {/* Image */}
          <View style={styles.imageWrapper}>
            <Image
              source={require('../../../assets/images/register.jpg')}
              style={styles.showcaseImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlayBadge}>
              <Text style={styles.imageBadgeSub}>BỘ SƯU TẬP MỚI · SERIES 18</Text>
              <Text style={styles.imageBadgeText}>Urbansheek & Xu Hướng Tuần Hoàn</Text>
            </View>
          </View>

          {/* Community Commitment Box */}
          <View style={styles.commitmentCard}>
            <View style={styles.commitmentHeaderRow}>
              <Text style={styles.commitmentHeaderTitle}>CAM KẾT CỘNG ĐỒNG</Text>
              <Text style={styles.commitmentHeaderRev}>REV 2026.11</Text>
            </View>

            <View style={styles.commitmentItem}>
              <Text style={styles.commitmentCheck}>✓</Text>
              <Text style={styles.commitmentText}>
                Cam kết không tăng giá đầu cơ — chi phí thuê minh bạch, chuẩn hóa và được xác thực bởi cộng đồng.
              </Text>
            </View>

            <View style={styles.commitmentItem}>
              <Text style={styles.commitmentCheck}>✓</Text>
              <Text style={styles.commitmentText}>
                Kích hoạt tự động quyền thành viên Tầng 1 đi kèm chính sách bảo vệ trang phục toàn diện.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#FDF9F2',
  },
  scrollContent: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },

  /* Form Card (Top) */
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#EFEAE1',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#141310',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#141310',
  },
  portalBadge: {
    backgroundColor: '#F7F3EC',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  portalBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#576151',
    letterSpacing: 0.5,
  },
  headingSection: {
    marginBottom: 16,
  },
  headingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C18',
    marginBottom: 6,
  },
  headingSubtitle: {
    fontSize: 13,
    color: '#57534E',
    lineHeight: 18,
  },
  roleContainer: {
    marginBottom: 16,
    backgroundColor: '#FAF8F4',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECE6DA',
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C18',
    marginBottom: 8,
  },
  roleTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  roleTab: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8D3C8',
  },
  roleTabActive: {
    backgroundColor: '#141310',
    borderColor: '#141310',
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#44403C',
  },
  roleTabTextActive: {
    color: '#FFFFFF',
  },
  roleDescription: {
    fontSize: 11,
    color: '#576151',
    lineHeight: 16,
    marginTop: 8,
  },
  errorAlert: {
    backgroundColor: '#FFDAD6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#BA1A1A',
  },
  errorAlertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#93000A',
    marginBottom: 2,
  },
  errorAlertMessage: {
    fontSize: 12,
    color: '#93000A',
  },
  successAlert: {
    backgroundColor: '#D8E3CE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#3F4A3A',
  },
  successAlertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3F4A3A',
    marginBottom: 2,
  },
  successAlertMessage: {
    fontSize: 12,
    color: '#3F4A3A',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C18',
  },
  fieldSubLabel: {
    fontSize: 11,
    color: '#78716C',
  },
  requiredStar: {
    color: '#BA1A1A',
  },
  fieldErrorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#BA1A1A',
  },
  fieldErrorTextUnder: {
    fontSize: 11,
    color: '#BA1A1A',
    marginTop: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F3EC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E2DB',
    paddingHorizontal: 12,
    height: 48,
  },
  inputBoxError: {
    borderColor: '#BA1A1A',
    backgroundColor: '#FFF8F8',
  },
  atSignPrefix: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78716C',
    marginRight: 8,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C18',
    paddingVertical: 0,
  },
  passwordToggleBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  passwordToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#576151',
  },
  strengthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  strengthHeading: {
    fontSize: 11,
    color: '#78716C',
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#78716C',
  },
  strengthWeak: {
    color: '#BA1A1A',
  },
  strengthGood: {
    color: '#576151',
  },
  strengthStrong: {
    color: '#15803D',
  },
  strengthBarContainer: {
    flexDirection: 'row',
    height: 4,
    gap: 4,
  },
  strengthSegment: {
    flex: 1,
    backgroundColor: '#EBE5D8',
    borderRadius: 2,
  },
  segmentWeak: {
    backgroundColor: '#BA1A1A',
  },
  segmentGood: {
    backgroundColor: '#576151',
  },
  segmentStrong: {
    backgroundColor: '#15803D',
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
    marginBottom: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#78716C',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#141310',
    borderColor: '#141310',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  agreementText: {
    fontSize: 12,
    color: '#44403C',
    flex: 1,
    lineHeight: 18,
  },
  agreementLink: {
    color: '#141310',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  agreementErrorText: {
    fontSize: 11,
    color: '#BA1A1A',
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#141310',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 16,
    shadowColor: '#141310',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  loginPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  promptText: {
    fontSize: 13,
    color: '#78716C',
  },
  promptLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141310',
    textDecorationLine: 'underline',
  },

  /* Showcase Section (Bottom) */
  showcaseCard: {
    backgroundColor: '#F7F3EC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EBE5D8',
    marginBottom: 20,
  },
  showcaseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  circleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EBE5D8',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  circleDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#576151',
  },
  circleTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#44403C',
    letterSpacing: 0.4,
  },
  custodyTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#78716C',
    textTransform: 'uppercase',
  },
  showcaseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#141310',
    marginBottom: 6,
    lineHeight: 26,
  },
  showcaseDescription: {
    fontSize: 12,
    color: '#57534E',
    lineHeight: 18,
    marginBottom: 14,
  },
  imageWrapper: {
    width: '100%',
    height: 190,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
    backgroundColor: '#E5E0D4',
  },
  showcaseImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(20, 19, 16, 0.75)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  imageBadgeSub: {
    fontSize: 9,
    fontWeight: '600',
    color: '#D8E3CE',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  imageBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  commitmentCard: {
    backgroundColor: '#EFE9DE',
    borderRadius: 10,
    padding: 12,
  },
  commitmentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commitmentHeaderTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1C1C18',
    letterSpacing: 0.5,
  },
  commitmentHeaderRev: {
    fontSize: 10,
    fontWeight: '700',
    color: '#576151',
  },
  commitmentItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  commitmentCheck: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#576151',
    marginTop: 1,
  },
  commitmentText: {
    fontSize: 11,
    color: '#44403C',
    lineHeight: 16,
    flex: 1,
  },
});
