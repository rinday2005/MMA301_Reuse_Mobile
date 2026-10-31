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
          { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 24) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ========================================================= */}
        {/* TOP SECTION: FORM ĐĂNG NHẬP (LÊN ĐẦU THEO CHUẨN MOBILE)  */}
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
              <Text style={styles.errorAlertTitle}>Xác thực thất bại</Text>
              <Text style={styles.errorAlertMessage}>{apiError}</Text>
            </View>
          )}

          {/* Alert: Login Success */}
          {loginSuccess && (
            <View style={styles.successAlert}>
              <Text style={styles.successAlertTitle}>Đăng nhập thành công</Text>
              <Text style={styles.successAlertMessage}>
                Đang chuyển hướng đến tài khoản của bạn...
              </Text>
            </View>
          )}

          {/* Email Field */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Địa chỉ Email</Text>
              {!!emailError && <Text style={styles.fieldErrorText}>{emailError}</Text>}
            </View>
            <View style={[styles.inputBox, !!emailError && styles.inputBoxError]}>
              <Text style={styles.atSignPrefix}>@</Text>
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
              <Text style={styles.lockSignPrefix}>*</Text>
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
                <Text style={styles.passwordToggleText}>{showPassword ? 'Ẩn' : 'Hiện'}</Text>
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
                {rememberMe && <Text style={styles.checkboxCheck}>✓</Text>}
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
              <Text style={styles.submitButtonText}>ĐĂNG NHẬP →</Text>
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
        </View>

        {/* ========================================================= */}
        {/* BOTTOM SECTION: HÌNH ẢNH & THÔNG TIN TUẦN HOÀN (NHƯ WEB) */}
        {/* ========================================================= */}
        <View style={styles.showcaseCard}>
          {/* Protocol Tags */}
          <View style={styles.showcaseHeaderRow}>
            <View style={styles.circleTag}>
              <View style={styles.circleDot} />
              <Text style={styles.circleTagText}>CIRCULAR ARCHIVE № 108</Text>
            </View>
            <Text style={styles.custodyTagText}>CUSTODY PROTOCOL</Text>
          </View>

          {/* Title & Description */}
          <Text style={styles.showcaseTitle}>
            Curated custody for timeless tools
          </Text>
          <Text style={styles.showcaseDescription}>
            Chuyển từ tiêu dùng nhanh sang quản lý thời trang bền vững, ReUse Hub kéo dài vòng đời trang phục thông qua các giao thức bảo quản nghiêm ngặt, giảm thiểu tác động đến môi trường.
          </Text>

          {/* Showcase Image */}
          <View style={styles.imageWrapper}>
            <Image
              source={require('../../../assets/images/login.jpg')}
              style={styles.showcaseImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlayBadge}>
              <View style={styles.badgeShieldDot} />
              <Text style={styles.imageBadgeText}>PRESERVED HERITAGE ITEM #RH-7740</Text>
            </View>
          </View>

          {/* Eco Impact Stats */}
          <View style={styles.ecoStatCard}>
            <View style={styles.ecoStatIconBox}>
              <Text style={styles.ecoStatIcon}>🌿</Text>
            </View>
            <View style={styles.ecoStatContent}>
              <Text style={styles.ecoStatTitle}>4.2 kg CO₂ Saved</Text>
              <Text style={styles.ecoStatSubtitle}>
                Tính toán dựa trên mỗi lần thuê trang phục so với sản xuất sản phẩm mới.
              </Text>
            </View>
          </View>

          {/* Index Row */}
          <View style={styles.indexMetaRow}>
            <Text style={styles.indexMetaText}>CHỈ SỐ TUẦN HOÀN: 98.4%</Text>
            <Text style={styles.indexMetaText}>AUDITED 2026</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

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
    marginBottom: 18,
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
    lineHeight: 19,
  },
  errorAlert: {
    backgroundColor: '#FFDAD6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
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
    marginBottom: 16,
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
  lockSignPrefix: {
    fontSize: 16,
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
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
    borderColor: '#78716C',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
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
  rememberText: {
    fontSize: 12,
    color: '#44403C',
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#576151',
    textDecorationLine: 'underline',
  },
  submitButton: {
    backgroundColor: '#141310',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  registerPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
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
    marginBottom: 12,
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
    marginBottom: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(20, 19, 16, 0.75)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  badgeShieldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D8E3CE',
  },
  imageBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  ecoStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFE9DE',
    padding: 12,
    borderRadius: 10,
    gap: 12,
    marginBottom: 12,
  },
  ecoStatIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#D8E3CE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ecoStatIcon: {
    fontSize: 16,
  },
  ecoStatContent: {
    flex: 1,
  },
  ecoStatTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C18',
    marginBottom: 2,
  },
  ecoStatSubtitle: {
    fontSize: 11,
    color: '#57534E',
    lineHeight: 15,
  },
  indexMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  indexMetaText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#78716C',
    letterSpacing: 0.5,
  },
});
