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
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail } from '../../utils/validation';

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setApiError('');

    if (!email.trim()) {
      setEmailError('Vui lòng nhập email');
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Email không hợp lệ');
      valid = false;
    }

    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');
    setLoginSuccess(false);

    try {
      const user = await login({
        email: email.trim(),
        password,
      });

      setLoginSuccess(true);

      setTimeout(() => {
        if (user.role === 'ADMIN') {
          navigation.replace('Admin');
        } else if (user.role === 'SHOP_OWNER') {
          navigation.replace('Shop');
        } else {
          navigation.replace('Main');
        }
      }, 600);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Email hoặc mật khẩu không chính xác.';
      setApiError(msg);
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
        {/* TOP SECTION: FORM ĐĂNG NHẬP                               */}
        {/* ========================================================= */}
        <View style={styles.formCard}>
          {/* Header Bar */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.brandBadge}>
              <View style={styles.brandIconBox}>
                <Text style={styles.brandIconText}>∞</Text>
              </View>
              <Text style={styles.brandTitle}>REUSE HUB</Text>
            </View>
            <View style={styles.portalBadge}>
              <Text style={styles.portalBadgeText}>PORTAL ACCESS</Text>
            </View>
          </View>

          {/* Heading */}
          <View style={styles.headingSection}>
            <Text style={styles.headingTitle}>Chào mừng trở lại</Text>
            <Text style={styles.headingSubtitle}>
              Vui lòng nhập thông tin đăng nhập để truy cập tài khoản và tủ đồ tuần hoàn của bạn.
            </Text>
          </View>

          {/* Alert: API Error */}
          {!!apiError && (
            <View style={styles.errorAlert}>
              <Feather name="alert-circle" size={18} color="#93000A" style={styles.alertIcon} />
              <View style={styles.alertTextWrap}>
                <Text style={styles.errorAlertTitle}>Xác thực thất bại</Text>
                <Text style={styles.errorAlertMessage}>{apiError}</Text>
              </View>
            </View>
          )}

          {/* Alert: Login Success */}
          {loginSuccess && (
            <View style={styles.successAlert}>
              <Feather name="check-circle" size={18} color="#3F4A3A" style={styles.alertIcon} />
              <View style={styles.alertTextWrap}>
                <Text style={styles.successAlertTitle}>Đăng nhập thành công</Text>
                <Text style={styles.successAlertMessage}>
                  Đang chuyển hướng đến tài khoản của bạn...
                </Text>
              </View>
            </View>
          )}

          {/* Email Field */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Địa chỉ Email</Text>
              {!!emailError && <Text style={styles.fieldErrorText}>{emailError}</Text>}
            </View>
            <View style={[styles.inputBox, !!emailError && styles.inputBoxError]}>
              <Feather name="mail" size={18} color="#4A463F" style={styles.inputPrefixIcon} />
              <TextInput
                style={styles.inputField}
                placeholder="curator@reusehub.org"
                placeholderTextColor="#A8A29E"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Mật Khẩu</Text>
              {!!passwordError && <Text style={styles.fieldErrorText}>{passwordError}</Text>}
            </View>
            <View style={[styles.inputBox, !!passwordError && styles.inputBoxError]}>
              <Feather name="lock" size={18} color="#4A463F" style={styles.inputPrefixIcon} />
              <TextInput
                style={styles.inputField}
                placeholder="••••••••••••"
                placeholderTextColor="#A8A29E"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.passwordToggleBtn}
                onPress={() => setShowPassword((prev) => !prev)}
                activeOpacity={0.7}
              >
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color="#4A463F"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Options Row */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberOption}
              onPress={() => setRememberMe((prev) => !prev)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Feather name="check" size={13} color="#FFFFFF" />}
              </View>
              <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting || loginSuccess}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.submitButtonText}>ĐANG ĐĂNG NHẬP...</Text>
              </View>
            ) : (
              <View style={styles.submitBtnContent}>
                <Text style={styles.submitButtonText}>ĐĂNG NHẬP</Text>
                <Feather name="arrow-right" size={16} color="#FFFFFF" style={styles.submitArrow} />
              </View>
            )}
          </TouchableOpacity>

          {/* Switch to Register */}
          <View style={styles.registerPromptRow}>
            <Text style={styles.promptText}>Chưa có tài khoản?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.promptLinkText}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>

          {/* Security footnote */}
          <View style={styles.securityFootnoteRow}>
            <View style={styles.securityDot} />
            <Text style={styles.securityText}>Phiên Được Mã Hóa</Text>
          </View>
        </View>

        {/* ========================================================= */}
        {/* BOTTOM SECTION: EDITORIAL SHOWCASE                        */}
        {/* ========================================================= */}
        <View style={styles.showcaseCard}>
          {/* Top badges */}
          <View style={styles.showcaseTopRow}>
            <View style={styles.archiveBadge}>
              <View style={styles.archiveDot} />
              <Text style={styles.archiveBadgeText}>CIRCULAR ARCHIVE Nº 108</Text>
            </View>
            <Text style={styles.protocolBadgeText}>QUY TRÌNH CHĂM SÓC</Text>
          </View>

          {/* Editorial Title */}
          <Text style={styles.showcaseTitle}>
            A circular wardrobe for timeless style.
          </Text>
          <Text style={styles.showcaseDescription}>
            Chuyển từ tiêu dùng nhanh sang quản lý thời trang bền vững, ReUse Hub kéo dài vòng
            đời trang phục thông qua các giao thức giặt sấy, bảo quản được duy trì nghiêm ngặt.
          </Text>

          {/* Hero Image with Badge */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../../../assets/images/login.jpg')}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlayGradient}>
              <View style={styles.imageBadge}>
                <Feather name="shield" size={13} color="#FFFFFF" />
                <Text style={styles.imageBadgeText}>Phong Cách Tuần Hoàn #RH-7740</Text>
              </View>
            </View>
          </View>

          {/* Eco Stat Box */}
          <View style={styles.ecoStatCard}>
            <View style={styles.ecoIconCircle}>
              <Ionicons name="leaf" size={18} color="#3F4A3A" />
            </View>
            <View style={styles.ecoStatInfo}>
              <Text style={styles.ecoStatTitle}>Tiết kiệm 4,2 kg CO₂</Text>
              <Text style={styles.ecoStatSubtitle}>
                Tính toán dựa trên mỗi lần thuê trang phục so với sản xuất sản phẩm mới
              </Text>
            </View>
          </View>

          {/* Audit Footer */}
          <View style={styles.auditRow}>
            <Text style={styles.auditText}>CHỈ SỐ TUẦN HOÀN: 98,4%</Text>
            <Text style={styles.auditText}>KIỂM TOÁN 2026</Text>
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#141310',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: -2,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#141310',
  },
  portalBadge: {
    backgroundColor: '#F7F3EC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  portalBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4A463F',
    letterSpacing: 0.8,
  },

  headingSection: {
    marginBottom: 20,
  },
  headingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1C18',
    letterSpacing: -0.3,
  },
  headingSubtitle: {
    fontSize: 13,
    color: '#4A463F',
    marginTop: 6,
    lineHeight: 18,
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
    marginBottom: 16,
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
  fieldErrorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#BA1A1A',
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

  // Options
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 20,
  },
  rememberOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  },
  checkboxActive: {
    backgroundColor: '#141310',
    borderColor: '#141310',
  },
  rememberText: {
    fontSize: 12,
    color: '#1C1C18',
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#576151',
    textDecorationLine: 'underline',
  },

  // Submit Button
  submitButton: {
    backgroundColor: '#141310',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
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

  // Switch prompt
  registerPromptRow: {
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

  // Security Footnote
  securityFootnoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0ECE4',
    gap: 6,
  },
  securityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#576151',
  },
  securityText: {
    fontSize: 11,
    color: '#4A463F',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
  showcaseTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  archiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1EDE6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 6,
  },
  archiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4A463F',
  },
  archiveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4A463F',
    letterSpacing: 0.6,
  },
  protocolBadgeText: {
    fontSize: 10,
    color: '#4A463F',
    letterSpacing: 0.5,
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  imageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  imageBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  ecoStatCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(241, 237, 230, 0.85)',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  ecoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D8E3CE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ecoStatInfo: {
    flex: 1,
  },
  ecoStatTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C18',
  },
  ecoStatSubtitle: {
    fontSize: 11,
    color: '#4A463F',
    marginTop: 2,
    lineHeight: 15,
  },

  auditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 2,
  },
  auditText: {
    fontSize: 10,
    color: '#4A463F',
    letterSpacing: 0.6,
  },
});

export default LoginScreen;
