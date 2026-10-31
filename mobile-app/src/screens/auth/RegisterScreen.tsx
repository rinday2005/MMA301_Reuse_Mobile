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
import { Feather, Ionicons } from '@expo/vector-icons';
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
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorCode = error.response?.data?.errorCode;
        if (errorCode === 'EMAIL_ALREADY_EXISTS') {
          setEmailError('Email này đã được đăng ký.');
          return;
        }
      }
      setApiError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
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
          { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 28) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ========================================================= */}
        {/* TOP SECTION: FORM ĐĂNG KÝ (LÊN ĐẦU THEO CHUẨN MOBILE)     */}
        {/* ========================================================= */}
        <View style={styles.formCard}>
          {/* Header Badge */}
          <View style={styles.headerBadgeRow}>
            <View style={styles.membershipBadge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>QUYỀN TRUY CẬP THÀNH VIÊN</Text>
            </View>
          </View>

          {/* Heading */}
          <View style={styles.headingSection}>
            <Text style={styles.headingTitle}>Đăng Ký Tài Khoản</Text>
            <Text style={styles.headingSubtitle}>
              Tham gia ReUse Hub để thuê trang phục cao cấp và trải nghiệm tủ đồ thời trang tuần hoàn.
            </Text>
          </View>

          {/* Alert: API Error */}
          {!!apiError && (
            <View style={styles.errorAlert}>
              <Feather name="alert-circle" size={18} color="#93000A" style={styles.alertIcon} />
              <View style={styles.alertTextWrap}>
                <Text style={styles.errorAlertTitle}>Đăng ký thất bại</Text>
                <Text style={styles.errorAlertMessage}>{apiError}</Text>
              </View>
            </View>
          )}

          {/* Alert: Register Success */}
          {registerSuccess && (
            <View style={styles.successAlert}>
              <Feather name="check-circle" size={18} color="#3F4A3A" style={styles.alertIcon} />
              <View style={styles.alertTextWrap}>
                <Text style={styles.successAlertTitle}>Tài khoản đã được tạo thành công</Text>
                <Text style={styles.successAlertMessage}>
                  Đang chuyển hướng sang màn hình đăng nhập...
                </Text>
              </View>
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
              <Feather name="user" size={18} color="#4A463F" style={styles.inputPrefixIcon} />
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
              <Feather name="mail" size={18} color="#4A463F" style={styles.inputPrefixIcon} />
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
              <Feather name="phone" size={18} color="#4A463F" style={styles.inputPrefixIcon} />
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
              <Feather name="lock" size={18} color="#4A463F" style={styles.inputPrefixIcon} />
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
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color="#4A463F"
                />
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
              <Feather name="lock" size={18} color="#4A463F" style={styles.inputPrefixIcon} />
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
                <Feather
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color="#4A463F"
                />
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
              {agreement && <Feather name="check" size={13} color="#FFFFFF" />}
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
              <View style={styles.submitBtnContent}>
                <Text style={styles.submitButtonText}>ĐĂNG KÝ TÀI KHOẢN</Text>
                <Feather name="arrow-right" size={16} color="#FFFFFF" style={styles.submitArrow} />
              </View>
            )}
          </TouchableOpacity>

          {/* Login Prompt */}
          <View style={styles.loginPromptRow}>
            <Text style={styles.promptText}>Đã có tài khoản?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
              <Text style={styles.promptLinkText}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================= */}
        {/* BOTTOM SECTION: EDITORIAL SHOWCASE (THỜI TRANG TUẦN HOÀN) */}
        {/* ========================================================= */}
        <View style={styles.showcaseCard}>
          {/* Badge */}
          <View style={styles.showcaseBadgeRow}>
            <Ionicons name="leaf" size={14} color="#576151" />
            <Text style={styles.showcaseBadgeText}>SỔ TAY THỜI TRANG TUẦN HOÀN</Text>
          </View>

          {/* Title & Desc */}
          <Text style={styles.showcaseTitle}>Elevating style, sharing fashion.</Text>
          <Text style={styles.showcaseDescription}>
            Mỗi thành viên đăng ký sẽ được tiếp cận bộ sưu tập trang phục thiết kế, phụ kiện cao
            cấp và thời trang hàng hiệu được chăm sóc, bảo quản theo tiêu chuẩn chuyên nghiệp.
          </Text>

          {/* Showcase Image */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../../../assets/images/register.jpg')}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlayGradient}>
              <Text style={styles.imageSeriesTag}>BỘ SƯU TẬP MỚI · SERIES 18</Text>
              <Text style={styles.imageCaption}>Urbansheek & Bộ Sưu Tập Thời Trang Xu Hướng</Text>
            </View>
          </View>

          {/* Commitments Box */}
          <View style={styles.commitmentBox}>
            <View style={styles.commitmentHeaderRow}>
              <Text style={styles.commitmentTitle}>CAM KẾT CỘNG ĐỒNG</Text>
              <Text style={styles.commitmentRevision}>REV 2026.11</Text>
            </View>

            <View style={styles.commitmentItem}>
              <Feather name="check-circle" size={14} color="#576151" style={styles.checkIcon} />
              <Text style={styles.commitmentText}>
                Cam kết không tăng giá đầu cơ — chi phí thuê minh bạch, chuẩn hóa và được xác thực
                bởi cộng đồng.
              </Text>
            </View>

            <View style={styles.commitmentItem}>
              <Feather name="check-circle" size={14} color="#576151" style={styles.checkIcon} />
              <Text style={styles.commitmentText}>
                Kích hoạt tự động quyền thành viên Tầng 1 đi kèm chính sách bảo vệ trang phục toàn
                diện.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#FDF9F2',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  // Form Card (TOP)
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#141310',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EFEAE1',
  },
  headerBadgeRow: {
    marginBottom: 12,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(216, 227, 206, 0.4)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#576151',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5B6655',
    letterSpacing: 0.8,
  },

  headingSection: {
    marginBottom: 18,
  },
  headingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#141310',
    letterSpacing: -0.3,
  },
  headingSubtitle: {
    fontSize: 13,
    color: '#4A463F',
    marginTop: 6,
    lineHeight: 18,
  },

  // Role Selection
  roleContainer: {
    marginBottom: 18,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C18',
    marginBottom: 8,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#F7F3EC',
    borderRadius: 8,
    padding: 3,
    gap: 4,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 6,
  },
  roleTabActive: {
    backgroundColor: '#141310',
    shadowColor: '#141310',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A463F',
  },
  roleTabTextActive: {
    color: '#FFFFFF',
  },
  roleDescription: {
    fontSize: 11,
    color: '#78716C',
    marginTop: 6,
    fontStyle: 'italic',
    lineHeight: 15,
  },

  // Alerts
  errorAlert: {
    flexDirection: 'row',
    backgroundColor: '#FFDAD6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  alertIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  alertTextWrap: {
    flex: 1,
  },
  errorAlertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#93000A',
  },
  errorAlertMessage: {
    fontSize: 12,
    color: '#93000A',
    marginTop: 2,
    lineHeight: 16,
  },
  successAlert: {
    flexDirection: 'row',
    backgroundColor: '#D8E3CE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  successAlertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3F4A3A',
  },
  successAlertMessage: {
    fontSize: 12,
    color: '#3F4A3A',
    marginTop: 2,
    lineHeight: 16,
  },

  // Input Fields
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
  requiredStar: {
    color: '#BA1A1A',
  },
  fieldSubLabel: {
    fontSize: 11,
    color: '#78716C',
  },
  fieldErrorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#BA1A1A',
  },
  fieldErrorTextUnder: {
    fontSize: 11,
    fontWeight: '600',
    color: '#BA1A1A',
    marginTop: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F3EC',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputBoxError: {
    borderColor: '#BA1A1A',
    backgroundColor: '#FFF5F4',
  },
  inputPrefixIcon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C18',
    height: '100%',
  },
  passwordToggleBtn: {
    padding: 6,
  },

  // Strength Meter
  strengthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  strengthHeading: {
    fontSize: 11,
    color: '#4A463F',
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
    color: '#D97706',
  },
  strengthStrong: {
    color: '#15803D',
  },
  strengthBarContainer: {
    flexDirection: 'row',
    gap: 4,
    height: 4,
    marginTop: 2,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    backgroundColor: '#E6E2DB',
    borderRadius: 2,
  },
  segmentWeak: {
    backgroundColor: '#BA1A1A',
  },
  segmentGood: {
    backgroundColor: '#D97706',
  },
  segmentStrong: {
    backgroundColor: '#15803D',
  },

  // Agreement
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 6,
    marginBottom: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#4A463F',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#141310',
    borderColor: '#141310',
  },
  agreementText: {
    flex: 1,
    fontSize: 12,
    color: '#4A463F',
    lineHeight: 18,
  },
  agreementLink: {
    color: '#141310',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  agreementErrorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#BA1A1A',
    marginBottom: 10,
  },

  // Submit Button
  submitButton: {
    backgroundColor: '#141310',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#141310',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitArrow: {
    marginLeft: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  loginPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    gap: 4,
  },
  promptText: {
    fontSize: 13,
    color: '#4A463F',
  },
  promptLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141310',
    textDecorationLine: 'underline',
  },

  // Showcase Section (BOTTOM)
  showcaseCard: {
    backgroundColor: '#F7F3EC',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ECE6DC',
  },
  showcaseBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  showcaseBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#576151',
    letterSpacing: 0.8,
  },
  showcaseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#141310',
    lineHeight: 24,
    marginBottom: 6,
  },
  showcaseDescription: {
    fontSize: 12,
    color: '#4A463F',
    lineHeight: 18,
    marginBottom: 16,
  },

  imageContainer: {
    width: '100%',
    height: 190,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EBE8E1',
    marginBottom: 14,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  imageSeriesTag: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  imageCaption: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
  },

  commitmentBox: {
    backgroundColor: 'rgba(235, 232, 225, 0.6)',
    borderRadius: 8,
    padding: 12,
  },
  commitmentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  commitmentTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#141310',
    letterSpacing: 0.6,
  },
  commitmentRevision: {
    fontSize: 11,
    fontWeight: '600',
    color: '#576151',
  },
  commitmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  checkIcon: {
    marginTop: 2,
  },
  commitmentText: {
    flex: 1,
    fontSize: 11,
    color: '#4A463F',
    lineHeight: 16,
  },
});

export default RegisterScreen;
