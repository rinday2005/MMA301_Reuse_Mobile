import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getShopProfileApi, updateShopProfileApi, type ShopProfileData } from '../../services/shop.api';
import { uploadImageApi } from '../../services/upload.api';
import AddressSelector, { type AddressValue } from '../../components/form/AddressSelector';
import { normalizeImageUrl } from '../../utils/imageUrl';

export const ShopOwnerProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form Fields
  const [shopName, setShopName] = useState('Atelier Chronos & Optics Ltd.');
  const [ownerName, setOwnerName] = useState('Phạm Thùy Dương');
  const [roleTitle, setRoleTitle] = useState('Master Curator & Archival Custodian');
  const [primaryEmail, setPrimaryEmail] = useState('shopowner@reuse.vn');
  const [phoneNumber, setPhoneNumber] = useState('0901234567');
  const [addressLine, setAddressLine] = useState('123 Lê Lợi, Phường Bến Nghé, Quận 1');
  const [cityRegion, setCityRegion] = useState('Ho Chi Minh City, Vietnam');
  const [specialization, setSpecialization] = useState(
    'Xưởng lưu ký & cho thuê trang phục, phụ kiện thời trang cao cấp tuần hoàn.'
  );
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
  );

  useEffect(() => {
    loadShopProfile();
  }, []);

  const loadShopProfile = async () => {
    try {
      setLoading(true);
      const data = await getShopProfileApi();
      if (data) {
        if (data.shopName) setShopName(data.shopName);
        if (data.ownerName) setOwnerName(data.ownerName);
        if (data.email) setPrimaryEmail(data.email);
        if (data.phoneNumber) setPhoneNumber(data.phoneNumber);
        if (data.address) setAddressLine(data.address);
        if (data.cityRegion) setCityRegion(data.cityRegion);
        if (data.roleTitle) setRoleTitle(data.roleTitle);
        if (data.specialization || data.description) {
          setSpecialization(data.specialization || data.description || '');
        }
        if (data.avatarUrl) {
          setAvatarUrl(data.avatarUrl);
        }
      }
    } catch (err) {
      console.warn('Lỗi nạp hồ sơ Shop từ DB:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePickAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để cập nhật ảnh đại diện.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadingAvatar(true);
        const localUri = result.assets[0].uri;
        const uploadedUrl = await uploadImageApi({ uri: localUri });
        setAvatarUrl(uploadedUrl);
        Alert.alert('Thành công', 'Đã tải lên ảnh đại diện mới.');
      }
    } catch (err) {
      console.warn('Lỗi tải ảnh:', err);
      Alert.alert('Lỗi', 'Không thể tải lên ảnh đại diện.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!shopName.trim()) {
      Alert.alert('Lỗi', 'Tên xưởng / shop không được để trống.');
      return;
    }
    if (!ownerName.trim()) {
      Alert.alert('Lỗi', 'Tên chủ sở hữu không được để trống.');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Lỗi', 'Số điện thoại không được để trống.');
      return;
    }

    try {
      setSaving(true);
      await updateShopProfileApi({
        shopName: shopName.trim(),
        ownerName: ownerName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: addressLine.trim(),
        cityRegion: cityRegion.trim(),
        specialization: specialization.trim(),
        roleTitle: roleTitle.trim(),
        avatarUrl,
      });
      Alert.alert('Thành công', 'Đã cập nhật thông tin hồ sơ xưởng vào cơ sở dữ liệu.');
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể cập nhật hồ sơ.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#1C1A18" />
        <Text style={styles.loadingText}>Đang nạp hồ sơ xưởng...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={22} color="#1C1A18" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ Xưởng / Shop</Text>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => navigation.navigate('ShopOwnerKyc')}
        >
          <Feather name="shield" size={18} color="#15803D" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Avatar Hero Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: normalizeImageUrl(avatarUrl) }}
              style={styles.avatarImg}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.avatarEditBadge}
              onPress={handlePickAvatar}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Feather name="camera" size={14} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.shopNameTitle}>{shopName}</Text>
          <Text style={styles.ownerSubtitle}>{ownerName} · {roleTitle}</Text>
          <View style={styles.kycTagRow}>
            <Ionicons name="checkmark-circle" size={14} color="#15803D" />
            <Text style={styles.kycTagText}>Đã xác thực đối tác Atelier Protocol</Text>
          </View>
        </View>

        {/* Form Sections */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>Thông tin pháp nhân & Chủ xưởng</Text>

          <Text style={styles.label}>Tên thương hiệu / Xưởng</Text>
          <TextInput
            style={styles.input}
            value={shopName}
            onChangeText={setShopName}
            placeholder="Nhập tên shop / xưởng"
          />

          <Text style={styles.label}>Họ và tên chủ sở hữu</Text>
          <TextInput
            style={styles.input}
            value={ownerName}
            onChangeText={setOwnerName}
            placeholder="Nhập họ tên chủ shop"
          />

          <Text style={styles.label}>Chức danh curator / Phân vai</Text>
          <TextInput
            style={styles.input}
            value={roleTitle}
            onChangeText={setRoleTitle}
            placeholder="VD: Master Curator & Archival Custodian"
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>Liên hệ & Thông báo</Text>

          <Text style={styles.label}>Email chính (Tài khoản Shop)</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={primaryEmail}
            editable={false}
          />

          <Text style={styles.label}>Số điện thoại điều phối đơn</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="VD: 0901234567"
            keyboardType="phone-pad"
          />
        </View>

        {/* Address Selector Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>Địa chỉ xưởng lưu ký & Bàn giao hàng</Text>
          <AddressSelector
            value={{
              province: 'Thành phố Hồ Chí Minh',
              district: 'Quận 1',
              ward: 'Phường Bến Nghé',
              detail: addressLine,
            }}
            onChange={(val: AddressValue) => {
              setAddressLine(val.detail);
              setCityRegion(`${val.ward}, ${val.district}, ${val.province}`);
            }}
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>Giới thiệu & Chuyên môn lưu ký</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={specialization}
            onChangeText={setSpecialization}
            placeholder="Mô tả tiêu chuẩn chất lượng, quy trình khử trùng, lưu kho của shop..."
            multiline
            numberOfLines={4}
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSaveProfile}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Feather name="check" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Lưu thay đổi hồ sơ</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ShopOwnerProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#78736A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAF8F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1A18',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 100,
  },
  avatarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImg: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#F5F5F4',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1C1A18',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  shopNameTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 4,
  },
  ownerSubtitle: {
    fontSize: 13,
    color: '#78736A',
    marginBottom: 8,
  },
  kycTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  kycTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1A18',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78736A',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1C1A18',
    marginBottom: 14,
  },
  disabledInput: {
    backgroundColor: '#F5F5F4',
    color: '#78736A',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E7E5E4',
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1C1A18',
    borderRadius: 10,
    paddingVertical: 14,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
