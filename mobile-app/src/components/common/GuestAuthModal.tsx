import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface GuestAuthModalProps {
  visible: boolean;
  onClose: () => void;
  actionText?: string;
}

export const GuestAuthModal: React.FC<GuestAuthModalProps> = ({
  visible,
  onClose,
  actionText = 'đặt thuê hoặc mua sản phẩm này',
}) => {
  const navigation = useNavigation<any>();

  const handleLogin = () => {
    onClose();
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const handleRegister = () => {
    onClose();
    navigation.navigate('Auth', { screen: 'Register' });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalBox}>
              {/* Header Icon */}
              <View style={styles.iconCircle}>
                <Ionicons name="lock-closed" size={24} color="#141310" />
              </View>

              {/* Title */}
              <Text style={styles.title}>Yêu Cầu Đăng Nhập</Text>
              <Text style={styles.message}>
                Bạn đang duyệt ở chế độ <Text style={styles.boldText}>Khách vãng lai</Text>. Vui lòng
                đăng nhập hoặc tạo tài khoản để {actionText}.
              </Text>

              {/* Action Buttons */}
              <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.85}>
                <Text style={styles.loginBtnText}>ĐĂNG NHẬP NGAY</Text>
                <Feather name="arrow-right" size={15} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerBtn}
                onPress={handleRegister}
                activeOpacity={0.85}
              >
                <Text style={styles.registerBtnText}>Tạo tài khoản mới</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.cancelBtnText}>Để xem thêm sau</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#EFEAE1',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F4F0EA',
    borderWidth: 1,
    borderColor: '#E8E4DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C18',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: '#4A463F',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  boldText: {
    fontWeight: '700',
    color: '#141310',
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#141310',
    width: '100%',
    height: 46,
    borderRadius: 10,
    marginBottom: 10,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  registerBtn: {
    backgroundColor: '#F4F0EA',
    width: '100%',
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4DC',
    marginBottom: 12,
  },
  registerBtnText: {
    color: '#141310',
    fontSize: 13,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingVertical: 6,
  },
  cancelBtnText: {
    color: '#76726B',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});

export default GuestAuthModal;

