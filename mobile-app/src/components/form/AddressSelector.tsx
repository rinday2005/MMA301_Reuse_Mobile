import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export type AddressValue = {
  province: string;
  district: string;
  ward: string;
  detail: string;
};

type AddressSelectorProps = {
  value?: AddressValue;
  onChange?: (val: AddressValue) => void;
};

type AdminUnit = {
  code: number;
  name: string;
};

const OPEN_API_URL = 'https://provinces.open-api.vn/api/v1';

// Offline fallback administrative data for key regions
const FALLBACK_PROVINCES: AdminUnit[] = [
  { code: 48, name: 'Thành phố Đà Nẵng' },
  { code: 79, name: 'Thành phố Hồ Chí Minh' },
  { code: 1, name: 'Thành phố Hà Nội' },
  { code: 92, name: 'Thành phố Cần Thơ' },
  { code: 31, name: 'Thành phố Hải Phòng' },
  { code: 49, name: 'Tỉnh Quảng Nam' },
  { code: 46, name: 'Tỉnh Thừa Thiên Huế' },
  { code: 56, name: 'Tỉnh Khánh Hòa' },
  { code: 68, name: 'Tỉnh Lâm Đồng' },
  { code: 74, name: 'Tỉnh Bình Dương' },
];

const FALLBACK_DISTRICTS: Record<number, AdminUnit[]> = {
  48: [
    { code: 490, name: 'Quận Hải Châu' },
    { code: 491, name: 'Quận Thanh Khê' },
    { code: 492, name: 'Quận Sơn Trà' },
    { code: 493, name: 'Quận Ngũ Hành Sơn' },
    { code: 494, name: 'Quận Liên Chiểu' },
    { code: 495, name: 'Quận Cẩm Lệ' },
    { code: 497, name: 'Huyện Hòa Vang' },
  ],
  79: [
    { code: 760, name: 'Quận 1' },
    { code: 761, name: 'Quận 12' },
    { code: 769, name: 'Thành phố Thủ Đức' },
    { code: 770, name: 'Quận 3' },
    { code: 771, name: 'Quận 10' },
    { code: 774, name: 'Quận Phú Nhuận' },
    { code: 775, name: 'Quận Bình Thạnh' },
    { code: 778, name: 'Quận 7' },
  ],
  1: [
    { code: 1, name: 'Quận Ba Đình' },
    { code: 2, name: 'Quận Hoàn Kiếm' },
    { code: 3, name: 'Quận Tây Hồ' },
    { code: 4, name: 'Quận Long Biên' },
    { code: 5, name: 'Quận Cầu Giấy' },
    { code: 6, name: 'Quận Đống Đa' },
    { code: 7, name: 'Quận Hai Bà Trưng' },
  ],
};

const FALLBACK_WARDS: Record<number, AdminUnit[]> = {
  490: [
    { code: 20194, name: 'Phường Hải Châu 1' },
    { code: 20197, name: 'Phường Hải Châu 2' },
    { code: 20200, name: 'Phường Thạch Thang' },
    { code: 20203, name: 'Phường Thanh Bình' },
    { code: 20206, name: 'Phường Thuận Phước' },
    { code: 20209, name: 'Phường Hòa Thuận Đông' },
    { code: 20212, name: 'Phường Nam Dương' },
    { code: 20215, name: 'Phường Phước Ninh' },
    { code: 20218, name: 'Phường Bình Thuận' },
  ],
  760: [
    { code: 26734, name: 'Phường Bến Nghé' },
    { code: 26737, name: 'Phường Bến Thành' },
    { code: 26740, name: 'Phường Cầu Kho' },
    { code: 26743, name: 'Phường Cầu Ông Lãnh' },
    { code: 26746, name: 'Phường Cô Giang' },
  ],
};

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  value = {
    province: 'Thành phố Đà Nẵng',
    district: 'Quận Hải Châu',
    ward: 'Phường Hải Châu 1',
    detail: '48 Bạch Đằng',
  },
  onChange,
}) => {
  const [address, setAddress] = useState<AddressValue>(value);

  const [provinces, setProvinces] = useState<AdminUnit[]>(FALLBACK_PROVINCES);
  const [districts, setDistricts] = useState<AdminUnit[]>([]);
  const [wards, setWards] = useState<AdminUnit[]>([]);

  const [provinceCode, setProvinceCode] = useState<number | null>(48);
  const [districtCode, setDistrictCode] = useState<number | null>(490);

  const [pickerModalType, setPickerModalType] = useState<'province' | 'district' | 'ward' | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync internal state with external value props
  useEffect(() => {
    if (value) {
      setAddress(value);
    }
  }, [value.province, value.district, value.ward, value.detail]);

  // Fetch online provinces
  useEffect(() => {
    let isMounted = true;
    axios
      .get<AdminUnit[]>(`${OPEN_API_URL}/p/`, { timeout: 4000 })
      .then((res) => {
        if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
          setProvinces(res.data);
          // Match initial province code
          const matched = res.data.find((p) => p.name === address.province);
          if (matched) {
            setProvinceCode(matched.code);
          }
        }
      })
      .catch(() => {
        // Fallback already pre-set
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch districts when provinceCode changes
  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      return;
    }
    let isMounted = true;
    setLoading(true);

    axios
      .get<{ districts: AdminUnit[] }>(`${OPEN_API_URL}/p/${provinceCode}?depth=2`, { timeout: 4000 })
      .then((res) => {
        if (isMounted && res.data?.districts) {
          setDistricts(res.data.districts);
          const matched = res.data.districts.find((d) => d.name === address.district);
          if (matched) {
            setDistrictCode(matched.code);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setDistricts(FALLBACK_DISTRICTS[provinceCode] || []);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [provinceCode]);

  // Fetch wards when districtCode changes
  useEffect(() => {
    if (!districtCode) {
      setWards([]);
      return;
    }
    let isMounted = true;
    setLoading(true);

    axios
      .get<{ wards: AdminUnit[] }>(`${OPEN_API_URL}/d/${districtCode}?depth=2`, { timeout: 4000 })
      .then((res) => {
        if (isMounted && res.data?.wards) {
          setWards(res.data.wards);
        }
      })
      .catch(() => {
        if (isMounted) {
          setWards(FALLBACK_WARDS[districtCode] || []);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [districtCode]);

  const update = (newAddr: AddressValue) => {
    setAddress(newAddr);
    onChange?.(newAddr);
  };

  const handleSelectProvince = (p: AdminUnit) => {
    setProvinceCode(p.code);
    setDistrictCode(null);
    setDistricts(FALLBACK_DISTRICTS[p.code] || []);
    setWards([]);
    setPickerModalType(null);
    setSearchFilter('');

    update({
      province: p.name,
      district: '',
      ward: '',
      detail: address.detail,
    });
  };

  const handleSelectDistrict = (d: AdminUnit) => {
    setDistrictCode(d.code);
    setWards(FALLBACK_WARDS[d.code] || []);
    setPickerModalType(null);
    setSearchFilter('');

    update({
      ...address,
      district: d.name,
      ward: '',
    });
  };

  const handleSelectWard = (w: AdminUnit) => {
    setPickerModalType(null);
    setSearchFilter('');

    update({
      ...address,
      ward: w.name,
    });
  };

  const handleDetailChange = (detailText: string) => {
    update({
      ...address,
      detail: detailText,
    });
  };

  const pickerItems = useMemo(() => {
    let source: AdminUnit[] = [];
    if (pickerModalType === 'province') source = provinces;
    else if (pickerModalType === 'district') source = districts;
    else if (pickerModalType === 'ward') source = wards;

    if (!searchFilter.trim()) return source;
    const q = searchFilter.toLowerCase().trim();
    return source.filter((item) => item.name.toLowerCase().includes(q));
  }, [pickerModalType, provinces, districts, wards, searchFilter]);

  const modalTitle =
    pickerModalType === 'province'
      ? 'Chọn Tỉnh / Thành Phố'
      : pickerModalType === 'district'
      ? 'Chọn Quận / Huyện'
      : 'Chọn Phường / Xã';

  return (
    <View style={styles.card}>
      {/* Badge Verified Address */}
      <View style={styles.badgeRow}>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedBadgeText}>VERIFIED ADDRESS</Text>
        </View>
      </View>

      <Text style={styles.title}>Delivery Address</Text>
      <Text style={styles.subtitle}>
        Select your province, district and ward, then enter the detailed street address.
      </Text>

      {/* Row 1: Province & District */}
      <View style={styles.gridRow}>
        {/* Field: Province */}
        <View style={styles.fieldCol}>
          <Text style={styles.fieldLabel}>Province / City</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setPickerModalType('province')}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.dropdownBtnText, !address.province && styles.dropdownBtnPlaceholder]}
              numberOfLines={1}
            >
              {address.province || 'Chọn Tỉnh/Thành'}
            </Text>
            <Feather name="chevron-down" size={16} color="#78736A" />
          </TouchableOpacity>
        </View>

        {/* Field: District */}
        <View style={styles.fieldCol}>
          <Text style={styles.fieldLabel}>District</Text>
          <TouchableOpacity
            style={[styles.dropdownBtn, !address.province && styles.dropdownBtnDisabled]}
            onPress={() => {
              if (address.province) setPickerModalType('district');
            }}
            disabled={!address.province}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.dropdownBtnText, !address.district && styles.dropdownBtnPlaceholder]}
              numberOfLines={1}
            >
              {address.district || 'Chọn Quận/Huyện'}
            </Text>
            <Feather name="chevron-down" size={16} color="#78736A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Row 2: Ward & Street Address */}
      <View style={styles.gridRow}>
        {/* Field: Ward */}
        <View style={styles.fieldCol}>
          <Text style={styles.fieldLabel}>Ward / Commune</Text>
          <TouchableOpacity
            style={[styles.dropdownBtn, !address.district && styles.dropdownBtnDisabled]}
            onPress={() => {
              if (address.district) setPickerModalType('ward');
            }}
            disabled={!address.district}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.dropdownBtnText, !address.ward && styles.dropdownBtnPlaceholder]}
              numberOfLines={1}
            >
              {address.ward || 'Chọn Phường/Xã'}
            </Text>
            <Feather name="chevron-down" size={16} color="#78736A" />
          </TouchableOpacity>
        </View>

        {/* Field: Street Address Detail */}
        <View style={styles.fieldCol}>
          <Text style={styles.fieldLabel}>Street Address</Text>
          <TextInput
            style={styles.textInput}
            value={address.detail}
            onChangeText={handleDetailChange}
            placeholder="Số nhà, tên đường..."
            placeholderTextColor="#A8A29E"
          />
        </View>
      </View>

      {/* Cascading Notice Box */}
      <View style={styles.noticeBox}>
        <View style={styles.noticeIconWrap}>
          <Ionicons name="checkmark-circle" size={20} color="#059669" />
        </View>
        <View style={styles.noticeContent}>
          <Text style={styles.noticeTitle}>Cascading address verification</Text>
          <Text style={styles.noticeDesc}>
            Changing Province resets District and Ward. Changing District resets Ward to keep the
            address hierarchy consistent.
          </Text>
        </View>
      </View>

      {/* Modal Picker for Selecting Province / District / Ward */}
      <Modal
        visible={pickerModalType !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerModalType(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleText}>{modalTitle}</Text>
              <TouchableOpacity
                onPress={() => {
                  setPickerModalType(null);
                  setSearchFilter('');
                }}
              >
                <Feather name="x" size={22} color="#1C1A18" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchRow}>
              <Feather name="search" size={16} color="#78736A" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm nhanh..."
                placeholderTextColor="#A8A29E"
                value={searchFilter}
                onChangeText={setSearchFilter}
                autoCorrect={false}
              />
              {!!searchFilter && (
                <TouchableOpacity onPress={() => setSearchFilter('')}>
                  <Feather name="x-circle" size={16} color="#A8A29E" />
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#1C1A18" />
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
              </View>
            ) : pickerItems.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Không tìm thấy kết quả phù hợp</Text>
              </View>
            ) : (
              <FlatList
                data={pickerItems}
                keyExtractor={(item) => String(item.code)}
                renderItem={({ item }) => {
                  const isSelected =
                    (pickerModalType === 'province' && item.name === address.province) ||
                    (pickerModalType === 'district' && item.name === address.district) ||
                    (pickerModalType === 'ward' && item.name === address.ward);

                  return (
                    <TouchableOpacity
                      style={[styles.itemRow, isSelected && styles.itemRowSelected]}
                      onPress={() => {
                        if (pickerModalType === 'province') handleSelectProvince(item);
                        else if (pickerModalType === 'district') handleSelectDistrict(item);
                        else if (pickerModalType === 'ward') handleSelectWard(item);
                      }}
                    >
                      <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                        {item.name}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark" size={18} color="#059669" />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  verifiedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#141B2B',
    marginBottom: 4,
    fontFamily: 'serif',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 18,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  fieldCol: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#141B2B',
    marginBottom: 6,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  dropdownBtnDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  dropdownBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#141B2B',
    flex: 1,
  },
  dropdownBtnPlaceholder: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    color: '#141B2B',
    minHeight: 44,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 14,
    padding: 12,
    marginTop: 6,
    gap: 10,
  },
  noticeIconWrap: {
    marginTop: 2,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 2,
  },
  noticeDesc: {
    fontSize: 11,
    color: '#15803D',
    lineHeight: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    padding: 16,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1A18',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1C1A18',
    padding: 0,
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemRowSelected: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
  },
  itemText: {
    fontSize: 13,
    color: '#1F2937',
  },
  itemTextSelected: {
    fontWeight: '700',
    color: '#059669',
  },
});
export default AddressSelector;
