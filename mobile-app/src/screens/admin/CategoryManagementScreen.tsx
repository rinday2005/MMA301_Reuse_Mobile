import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  Switch,
  ScrollView,
  Image,
} from 'react-native';
import { Feather, Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AdminHeader from '../../components/layout/AdminHeader';
import {
  fetchAdminCategoriesApi,
  createAdminCategoryApi,
  updateAdminCategoryApi,
  toggleCategoryStatusApi,
  deleteAdminCategoryApi,
  AdminCategoryItemDetail,
} from '../../services/admin.api';
import { uploadImageToCloudinary } from '../../utils/imageUrl';

type MarketFilter = 'ALL' | 'RENT' | 'THRIFT' | 'COMMON';

const ICON_PRESETS = [
  { icon: 'camera', label: 'Camera', lib: 'feather' },
  { icon: 'shoe-sneaker', label: 'Giày dép', lib: 'materialCommunity' },
  { icon: 'human-female-dance', label: 'Đầm dạ hội', lib: 'materialCommunity' },
  { icon: 'shirt-outline', label: 'Quần áo', lib: 'ionicons' },
  { icon: 'diamond-stone', label: 'Phụ kiện', lib: 'materialCommunity' },
  { icon: 'shopping-bag', label: 'Túi xách', lib: 'feather' },
  { icon: 'watch', label: 'Đồng hồ', lib: 'feather' },
  { icon: 'tent', label: 'Dã ngoại', lib: 'materialCommunity' },
  { icon: 'devices', label: 'Thiết bị', lib: 'material' },
  { icon: 'category', label: 'Mặc định', lib: 'material' },
];

export const CategoryManagementScreen: React.FC = () => {
  const [categories, setCategories] = useState<AdminCategoryItemDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [marketFilter, setMarketFilter] = useState<MarketFilter>('ALL');

  // Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategoryItemDetail | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form Fields Matching Web Category UI (Hình 4)
  const [formName, setFormName] = useState<string>('');
  const [formCode, setFormCode] = useState<string>('CAT.01');
  const [formSlug, setFormSlug] = useState<string>('your-category');
  const [formMarket, setFormMarket] = useState<'RENT' | 'THRIFT' | 'COMMON'>('COMMON');
  const [formSubtitle, setFormSubtitle] = useState<string>('Kiểm định chuẩn hóa 100% · Bảo chứng Smart Escrow');
  const [formDesc, setFormDesc] = useState<string>('');
  const [formInspectionBadge, setFormInspectionBadge] = useState<string>('100% Kiểm định chất lượng & Khử trùng UV-C');
  const [formIcon, setFormIcon] = useState<string>('category');
  const [formImage, setFormImage] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const list = await fetchAdminCategoriesApi();
      setCategories(list);
    } catch (err) {
      console.warn('Lỗi tải danh mục admin:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Name change automatically updates slug if not editing
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      const generated = val
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormSlug(generated || 'your-category');
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormCode(`CAT.${String(categories.length + 1).padStart(2, '0')}`);
    setFormSlug('your-category');
    setFormMarket('COMMON');
    setFormSubtitle('Kiểm định chuẩn hóa 100% · Bảo chứng Smart Escrow');
    setFormDesc('');
    setFormInspectionBadge('100% Kiểm định chất lượng & Khử trùng UV-C');
    setFormIcon('category');
    setFormImage('');
    setFormStatus('ACTIVE');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (cat: AdminCategoryItemDetail) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormCode(cat.code || 'CAT.01');
    setFormSlug(cat.slug.replace('/categories/', '').replace(/^\/+/, ''));
    setFormMarket(cat.market);
    setFormSubtitle(cat.subtitle || 'Kiểm định chuẩn hóa 100% · Bảo chứng Smart Escrow');
    setFormDesc(cat.description || '');
    setFormInspectionBadge(cat.inspectionBadge || '100% Kiểm định chất lượng & Khử trùng UV-C');
    setFormIcon(cat.icon || 'category');
    setFormImage(cat.image || '');
    setFormStatus(cat.status);
    setIsModalOpen(true);
  };

  // Pick & Upload image to Cloudinary
  const handlePickAndUploadImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền thư viện ảnh.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });

      if (!res.canceled && res.assets?.[0]?.uri) {
        setIsUploadingImage(true);
        const localUri = res.assets[0].uri;
        setFormImage(localUri);
        try {
          const cloudUrl = await uploadImageToCloudinary(localUri);
          if (cloudUrl) {
            setFormImage(cloudUrl);
            Alert.alert('Thành công', 'Đã tải ảnh lên Cloudinary CDN!');
          }
        } catch {
          // keep local fallback
        } finally {
          setIsUploadingImage(false);
        }
      }
    } catch {
      setIsUploadingImage(false);
      Alert.alert('Lỗi', 'Không thể chọn ảnh lúc này.');
    }
  };

  // Save (Create or Update)
  const handleSave = async () => {
    if (!formName.trim()) {
      Alert.alert('Lưu ý', 'Vui lòng nhập tên danh mục.');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        code: formCode.trim() || `CAT.${String(categories.length + 1).padStart(2, '0')}`,
        slug: formSlug.trim() || 'your-category',
        market: formMarket,
        subtitle: formSubtitle.trim(),
        description: formDesc.trim(),
        inspectionBadge: formInspectionBadge.trim(),
        icon: formIcon,
        image: formImage.trim(),
        isActive: formStatus === 'ACTIVE',
      };

      if (editingCategory) {
        await updateAdminCategoryApi(editingCategory.id, payload);
        Alert.alert('Thành công', `Đã cập nhật danh mục "${formName}"`);
      } else {
        await createAdminCategoryApi(payload);
        Alert.alert('Thành công', `Đã tạo danh mục mới "${formName}" thành công trên MongoDB & Cloudinary!`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || err?.message || 'Không thể lưu danh mục.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (item: AdminCategoryItemDetail) => {
    const nextStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await toggleCategoryStatusApi(item.id, nextStatus === 'ACTIVE');
      setCategories((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, status: nextStatus } : c))
      );
    } catch {
      Alert.alert('Lỗi', 'Không thể đổi trạng thái danh mục');
    }
  };

  // Delete
  const handleDelete = (item: AdminCategoryItemDetail) => {
    Alert.alert(
      'Xóa danh mục',
      `Bạn có chắc muốn xóa danh mục "${item.name}"? Thao tác này sẽ cập nhật trên MongoDB.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAdminCategoryApi(item.id);
              setCategories((prev) => prev.filter((c) => c.id !== item.id));
              Alert.alert('Thành công', 'Đã xóa danh mục.');
            } catch {
              Alert.alert('Lỗi', 'Không thể xóa danh mục.');
            }
          },
        },
      ]
    );
  };

  const filtered = useMemo(() => {
    return categories.filter((c) => {
      const matchMarket = marketFilter === 'ALL' || c.market === marketFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        query === '' ||
        c.name.toLowerCase().includes(query) ||
        c.slug.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query);
      return matchMarket && matchSearch;
    });
  }, [categories, marketFilter, searchQuery]);

  const renderIcon = (iconName: string, size = 18, color = '#576151') => {
    switch (iconName) {
      case 'camera':
        return <Feather name="camera" size={size} color={color} />;
      case 'shoe-sneaker':
        return <MaterialCommunityIcons name="shoe-sneaker" size={size} color={color} />;
      case 'human-female-dance':
        return <MaterialCommunityIcons name="human-female-dance" size={size} color={color} />;
      case 'shirt-outline':
        return <Ionicons name="shirt-outline" size={size} color={color} />;
      case 'diamond-stone':
        return <MaterialCommunityIcons name="diamond-stone" size={size} color={color} />;
      case 'shopping-bag':
        return <Feather name="shopping-bag" size={size} color={color} />;
      case 'watch':
        return <Feather name="watch" size={size} color={color} />;
      case 'tent':
        return <MaterialCommunityIcons name="tent" size={size} color={color} />;
      case 'devices':
        return <MaterialIcons name="devices" size={size} color={color} />;
      default:
        return <MaterialIcons name="category" size={size} color={color} />;
    }
  };

  const renderItem = ({ item }: { item: AdminCategoryItemDetail }) => {
    const isActive = item.status === 'ACTIVE';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.cardThumb} resizeMode="cover" />
            ) : (
              renderIcon(item.icon, 20, '#576151')
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              {item.code && <Text style={styles.codeBadge}>{item.code}</Text>}
            </View>
            <Text style={styles.cardSlug}>/categories/{item.slug.replace(/^\/+/, '')}</Text>
          </View>
          <View style={[styles.marketBadge, item.market === 'RENT' ? styles.bgRent : item.market === 'THRIFT' ? styles.bgThrift : styles.bgCommon]}>
            <Text style={styles.marketBadgeText}>{item.market}</Text>
          </View>
        </View>

        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>
              {item.rentItems} Rent • {item.thriftItems} Thrift
            </Text>
          </View>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.statusToggle, isActive ? styles.statusActive : styles.statusInactive]}
              onPress={() => handleToggleStatus(item)}
            >
              <View style={[styles.statusDot, isActive ? styles.dotActive : styles.dotInactive]} />
              <Text style={[styles.statusToggleText, isActive ? styles.textActive : styles.textInactive]}>
                {isActive ? 'Hoạt động' : 'Tạm dừng'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenEditModal(item)}>
              <Feather name="edit-2" size={15} color="#576151" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
              <Feather name="trash-2" size={15} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AdminHeader title="Quản Lý Danh Mục Sàn" subtitle="Đồng bộ MongoDB & Cloudinary" />

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {(['ALL', 'RENT', 'THRIFT', 'COMMON'] as MarketFilter[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, marketFilter === tab && styles.filterChipActive]}
              onPress={() => setMarketFilter(tab)}
            >
              <Text style={[styles.filterChipText, marketFilter === tab && styles.filterChipTextActive]}>
                {tab === 'ALL' ? 'Tất cả' : tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search & Add Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#7B766F" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, slug, mô tả..."
            placeholderTextColor="#9C958B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color="#7B766F" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenCreateModal}>
          <Feather name="plus" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Thêm mới</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#576151" />
          <Text style={styles.loadingText}>Đang tải danh mục từ MongoDB...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Feather name="inbox" size={40} color="#CFC9BD" />
              <Text style={styles.emptyText}>Không tìm thấy danh mục phù hợp</Text>
            </View>
          }
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL THÊM / CHỈNH SỬA DANH MỤC MỚI (MATCH WEB CATEGORY UI & HÌNH 4)       */}
      {/* ========================================================================= */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalSuperTitle}>
                  HỒ SƠ SỔ BỘ · ĐỒNG BỘ GIAO DIỆN KHÁCH HÀNG & CLOUDINARY
                </Text>
                <Text style={styles.modalMainTitle}>
                  {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsModalOpen(false)}
              >
                <Feather name="x" size={20} color="#141310" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {/* Row 1: Tên & Mã Danh Mục */}
              <View style={styles.rowTwo}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.label}>
                    TÊN DANH MỤC (HIỂN THỊ TIÊU ĐỀ CHÍNH) <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ví dụ: Camera, Giày dép, Túi xách..."
                    placeholderTextColor="#9C958B"
                    value={formName}
                    onChangeText={handleNameChange}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>MÃ DANH MỤC</Text>
                  <TextInput
                    style={[styles.input, { fontFamily: 'monospace' }]}
                    placeholder="CAT.07"
                    placeholderTextColor="#9C958B"
                    value={formCode}
                    onChangeText={(val) => setFormCode(val.toUpperCase())}
                  />
                </View>
              </View>

              {/* Row 2: Public Slug */}
              <Text style={styles.label}>
                PUBLIC SLUG (URL ĐỊNH DANH TRÊN TRANG USER) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.slugInputContainer}>
                <View style={styles.slugPrefixBox}>
                  <Text style={styles.slugPrefixText}>/categories/</Text>
                </View>
                <TextInput
                  style={styles.slugInput}
                  placeholder="your-category"
                  placeholderTextColor="#9C958B"
                  value={formSlug}
                  onChangeText={setFormSlug}
                />
              </View>

              {/* Row 3: Loại thị trường (RENT / THRIFT / COMMON) */}
              <Text style={styles.label}>
                LOẠI THỊ TRƯỜNG ÁP DỤNG (HIỂN THỊ HUY HIỆU RENT / THRIFT)
              </Text>
              <View style={styles.marketTabsRow}>
                <TouchableOpacity
                  style={[styles.marketCardBtn, formMarket === 'RENT' && styles.marketCardBtnRentActive]}
                  onPress={() => setFormMarket('RENT')}
                >
                  <Text style={[styles.marketCardTitle, formMarket === 'RENT' && styles.marketCardTitleRentActive]}>
                    RENT
                  </Text>
                  <Text style={styles.marketCardSub}>Chỉ cho thuê</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.marketCardBtn, formMarket === 'THRIFT' && styles.marketCardBtnThriftActive]}
                  onPress={() => setFormMarket('THRIFT')}
                >
                  <Text style={[styles.marketCardTitle, formMarket === 'THRIFT' && styles.marketCardTitleThriftActive]}>
                    THRIFT
                  </Text>
                  <Text style={styles.marketCardSub}>Thuần mua đứt</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.marketCardBtn, formMarket === 'COMMON' && styles.marketCardBtnCommonActive]}
                  onPress={() => setFormMarket('COMMON')}
                >
                  <Text style={[styles.marketCardTitle, formMarket === 'COMMON' && styles.marketCardTitleCommonActive]}>
                    COMMON
                  </Text>
                  <Text style={styles.marketCardSub}>Cả RENT & THRIFT</Text>
                </TouchableOpacity>
              </View>

              {/* Row 4: Thông Điệp Phụ / Điểm Nhấn */}
              <Text style={styles.label}>
                THÔNG ĐIỆP PHỤ / ĐIỂM NHẤN (HIỂN THỊ CHÂN THẺ TRANG /CATEGORIES)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Kiểm định chuẩn hóa 100% · Bảo chứng Smart Escrow"
                placeholderTextColor="#9C958B"
                value={formSubtitle}
                onChangeText={setFormSubtitle}
              />

              {/* Row 5: Mô Tả Danh Mục */}
              <Text style={styles.label}>
                MÔ TẢ DANH MỤC (HIỂN THỊ TRÊN THẺ /CATEGORIES & ĐẦU TRANG CHI TIẾT)
              </Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholder="Nhập mô tả chi tiết danh mục, dòng sản phẩm tiêu biểu và tiêu chuẩn thẩm định..."
                placeholderTextColor="#9C958B"
                value={formDesc}
                onChangeText={setFormDesc}
              />

              {/* Row 6: Nhãn Bảo Chứng Kiểm Định */}
              <Text style={styles.label}>
                NHÃN BẢO CHỨNG KIỂM ĐỊNH (HIỂN THỊ TẠI TRANG CHI TIẾT DANH MỤC)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="100% Kiểm định chất lượng & Khử trùng UV-C"
                placeholderTextColor="#9C958B"
                value={formInspectionBadge}
                onChangeText={setFormInspectionBadge}
              />

              {/* Row 7: Biểu Tượng Danh Mục (Icon Presets Grid) */}
              <Text style={styles.label}>BIỂU TƯỢNG DANH MỤC (ICON)</Text>
              <View style={styles.iconPresetsGrid}>
                {ICON_PRESETS.map((item) => {
                  const isSelected = formIcon === item.icon;
                  return (
                    <TouchableOpacity
                      key={item.icon}
                      style={[styles.iconPresetBtn, isSelected && styles.iconPresetBtnActive]}
                      onPress={() => setFormIcon(item.icon)}
                    >
                      {renderIcon(item.icon, 16, isSelected ? '#FFFFFF' : '#576151')}
                      <Text style={[styles.iconPresetLabel, isSelected && styles.iconPresetLabelActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* =================================================================== */}
              {/* PHẦN TẢI ẢNH BÌA CLOUDINARY & LIVE USER CARD PREVIEW (HÌNH 4 PHẢI) */}
              {/* =================================================================== */}
              <View style={styles.cloudinaryUploadBox}>
                <View style={styles.cloudinaryHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cloudinaryTitle}>Ảnh Bìa Danh Mục (Cloudinary)</Text>
                    <Text style={styles.cloudinarySub}>
                      Tải ảnh lên Cloudinary để hiển thị ở trang chủ & trang danh mục User
                    </Text>
                  </View>
                  {formImage.includes('cloudinary.com') && (
                    <View style={styles.cloudinaryBadge}>
                      <Text style={styles.cloudinaryBadgeText}>Cloudinary ✓</Text>
                    </View>
                  )}
                </View>

                <View style={styles.uploadBtnRow}>
                  <TouchableOpacity
                    style={styles.cloudinaryUploadBtn}
                    onPress={handlePickAndUploadImage}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Feather name="upload-cloud" size={16} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.cloudinaryUploadBtnText}>
                          {formImage ? 'Đổi Ảnh Trên Cloudinary' : 'Tải Ảnh Lên Cloudinary'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {formImage ? (
                    <TouchableOpacity
                      style={styles.deletePhotoBtn}
                      onPress={() => setFormImage('')}
                    >
                      <Feather name="trash-2" size={16} color="#DC2626" />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <Text style={styles.orUrlLabel}>Hoặc dán trực tiếp URL ảnh (Cloudinary / HTTPS):</Text>
                <TextInput
                  style={[styles.input, { fontFamily: 'monospace', fontSize: 11 }]}
                  placeholder="https://res.cloudinary.com/..."
                  placeholderTextColor="#9C958B"
                  value={formImage}
                  onChangeText={setFormImage}
                />
              </View>

              {/* LIVE USER CARD PREVIEW */}
              <View style={styles.previewContainer}>
                <View style={styles.previewHeaderRow}>
                  <Text style={styles.previewSectionTitle}>
                    XEM TRƯỚC THẺ HIỂN THỊ Ở GIAO DIỆN USER (/CATEGORIES)
                  </Text>
                  <Text style={styles.previewLiveBadge}>Live Preview</Text>
                </View>

                {/* The card representation */}
                <View style={styles.liveCard}>
                  <View style={styles.liveCardCover}>
                    {formImage ? (
                      <Image source={{ uri: formImage }} style={styles.liveCoverImg} resizeMode="cover" />
                    ) : (
                      <View style={styles.liveNoCover}>
                        {renderIcon(formIcon, 28, '#79716B')}
                        <Text style={styles.liveNoCoverText}>Chưa có ảnh bìa</Text>
                      </View>
                    )}

                    {/* Market badges top-left */}
                    <View style={styles.liveBadgesTopLeft}>
                      {formMarket === 'THRIFT' ? (
                        <View style={styles.liveBadgeThrift}>
                          <Text style={styles.liveBadgeThriftText}>Thuần THRIFT</Text>
                        </View>
                      ) : formMarket === 'RENT' ? (
                        <View style={styles.liveBadgeRent}>
                          <Text style={styles.liveBadgeRentText}>Chuyên RENT</Text>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                          <View style={styles.liveBadgeRent}>
                            <Text style={styles.liveBadgeRentText}>RENT</Text>
                          </View>
                          <View style={styles.liveBadgeCommonWhite}>
                            <Text style={styles.liveBadgeCommonWhiteText}>THRIFT</Text>
                          </View>
                        </View>
                      )}
                    </View>

                    {/* Code badge bottom-right */}
                    <View style={styles.liveCodeBadge}>
                      <Text style={styles.liveCodeBadgeText}>{formCode || 'CAT.01'}</Text>
                    </View>
                  </View>

                  <View style={styles.liveCardBody}>
                    <Text style={styles.liveCardTitle}>{formName || 'Tên danh mục'}</Text>
                    <Text style={styles.liveCardDesc} numberOfLines={2}>
                      {formDesc ||
                        'Mô tả danh mục sẽ hiển thị tại đây để khách hàng nắm rõ các dòng sản phẩm và tiêu chuẩn kiểm định.'}
                    </Text>
                    <View style={styles.liveCardFooter}>
                      <Text style={styles.liveCardSubtitle} numberOfLines={1}>
                        {formSubtitle || 'Kiểm định chuẩn hóa 100%'}
                      </Text>
                      <Text style={styles.liveCardLink}>Khám phá →</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Trạng thái niêm yết công khai Switch */}
              <View style={styles.switchBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>Trạng Thái Niêm Yết Công Khai</Text>
                  <Text style={styles.switchSub}>
                    Hiển thị trên trang chủ, trang /categories & bộ lọc sản phẩm
                  </Text>
                </View>
                <Switch
                  value={formStatus === 'ACTIVE'}
                  onValueChange={(val) => setFormStatus(val ? 'ACTIVE' : 'INACTIVE')}
                  trackColor={{ false: '#CFC5B8', true: '#48654B' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Modal Actions */}
              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => setIsModalOpen(false)}
                >
                  <Text style={styles.cancelModalBtnText}>Hủy bỏ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveModalBtn, isSaving && { opacity: 0.7 }]}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveModalBtnText}>
                      {editingCategory ? 'Lưu Thay Đổi' : 'Lưu Danh Mục'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF9F2',
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBE8E1',
    paddingVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F5F2EB',
    borderWidth: 1,
    borderColor: '#E8E4DA',
  },
  filterChipActive: {
    backgroundColor: '#141310',
    borderColor: '#141310',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#576151',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  searchBarContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4DFD5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#141310',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141310',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EBE8E1',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F7F3EC',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardThumb: {
    width: '100%',
    height: '100%',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141310',
  },
  codeBadge: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#7B766F',
    backgroundColor: '#F2EDE9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  cardSlug: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#7B766F',
    marginTop: 2,
  },
  marketBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bgRent: {
    backgroundColor: '#F7EDE2',
  },
  bgThrift: {
    backgroundColor: '#ECFDF5',
  },
  bgCommon: {
    backgroundColor: '#F2EDE9',
  },
  marketBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#141310',
  },
  cardDesc: {
    fontSize: 12,
    color: '#7B766F',
    lineHeight: 17,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F7F5ED',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 11,
    color: '#576151',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  statusActive: {
    backgroundColor: '#ECFDF5',
  },
  statusInactive: {
    backgroundColor: '#F5F5F5',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: '#10B981',
  },
  dotInactive: {
    backgroundColor: '#9CA3AF',
  },
  statusToggleText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textActive: {
    color: '#065F46',
  },
  textInactive: {
    color: '#6B7280',
  },
  actionBtn: {
    padding: 6,
    backgroundColor: '#F9F8F5',
    borderRadius: 6,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#7B766F',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    color: '#7B766F',
  },
  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  modalCard: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: '#FDF8F5',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#CFC5B8',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E2DC',
    marginBottom: 10,
  },
  modalSuperTitle: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#6C5937',
    textTransform: 'uppercase',
  },
  modalMainTitle: {
    fontFamily: 'serif',
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1B19',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: '#F2EDE9',
    borderRadius: 16,
  },
  modalScroll: {
    paddingBottom: 24,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1C1B19',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 10,
  },
  required: {
    color: '#DC2626',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CFC5B8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#1C1B19',
  },
  textarea: {
    minHeight: 60,
  },
  slugInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slugPrefixBox: {
    backgroundColor: '#F2EDE9',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: '#CFC5B8',
  },
  slugPrefixText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#4C463C',
  },
  slugInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CFC5B8',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#1C1B19',
  },
  marketTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  marketCardBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CFC5B8',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  marketCardBtnRentActive: {
    backgroundColor: '#FBEFE5',
    borderColor: '#7F5227',
  },
  marketCardBtnThriftActive: {
    backgroundColor: '#EAF8EC',
    borderColor: '#48654B',
  },
  marketCardBtnCommonActive: {
    backgroundColor: '#F5EFE3',
    borderColor: '#6C5937',
  },
  marketCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4C463C',
  },
  marketCardTitleRentActive: {
    color: '#7F5227',
  },
  marketCardTitleThriftActive: {
    color: '#48654B',
  },
  marketCardTitleCommonActive: {
    color: '#6C5937',
  },
  marketCardSub: {
    fontSize: 9,
    color: '#7E766A',
    marginTop: 2,
  },
  iconPresetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  iconPresetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CFC5B8',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 5,
  },
  iconPresetBtnActive: {
    backgroundColor: '#1C1B19',
    borderColor: '#1C1B19',
  },
  iconPresetLabel: {
    fontSize: 11,
    color: '#4C463C',
  },
  iconPresetLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cloudinaryUploadBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CFC5B8',
    padding: 12,
    marginTop: 14,
    gap: 8,
  },
  cloudinaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cloudinaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1B19',
  },
  cloudinarySub: {
    fontSize: 10,
    color: '#7E766A',
    marginTop: 1,
  },
  cloudinaryBadge: {
    backgroundColor: '#CAEBC9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  cloudinaryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#48654B',
  },
  uploadBtnRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  cloudinaryUploadBtn: {
    flex: 1,
    backgroundColor: '#1C1B19',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 9,
  },
  cloudinaryUploadBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  deletePhotoBtn: {
    padding: 9,
    backgroundColor: '#FFDAD6',
    borderRadius: 8,
  },
  orUrlLabel: {
    fontSize: 10,
    color: '#7E766A',
    marginTop: 2,
  },
  previewContainer: {
    marginTop: 14,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  previewSectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4C463C',
    textTransform: 'uppercase',
  },
  previewLiveBadge: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#6C5937',
  },
  liveCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E2DC',
    backgroundColor: '#F7F5F0',
    overflow: 'hidden',
  },
  liveCardCover: {
    height: 120,
    backgroundColor: '#E6E2DC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveCoverImg: {
    width: '100%',
    height: '100%',
  },
  liveNoCover: {
    alignItems: 'center',
    gap: 4,
  },
  liveNoCoverText: {
    fontSize: 10,
    color: '#79716B',
  },
  liveBadgesTopLeft: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  liveBadgeThrift: {
    backgroundColor: '#B45309',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  liveBadgeThriftText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  liveBadgeRent: {
    backgroundColor: 'rgba(28, 26, 24, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  liveBadgeRentText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  liveBadgeCommonWhite: {
    backgroundColor: 'rgba(251, 249, 245, 0.9)',
    borderWidth: 1,
    borderColor: '#E6E2DC',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  liveBadgeCommonWhiteText: {
    color: '#1C1A18',
    fontSize: 9,
    fontWeight: '700',
  },
  liveCodeBadge: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveCodeBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  liveCardBody: {
    padding: 12,
  },
  liveCardTitle: {
    fontFamily: 'serif',
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1A18',
  },
  liveCardDesc: {
    fontSize: 11,
    color: '#79716B',
    lineHeight: 15,
    marginVertical: 4,
  },
  liveCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E6E2DC',
    marginTop: 4,
  },
  liveCardSubtitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#79716B',
    flex: 1,
    marginRight: 6,
  },
  liveCardLink: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1C1A18',
  },
  switchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CFC5B8',
    padding: 10,
    marginTop: 12,
  },
  switchTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1B19',
  },
  switchSub: {
    fontSize: 10,
    color: '#7E766A',
    marginTop: 1,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: '#F2EDE9',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },
  cancelModalBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1B19',
  },
  saveModalBtn: {
    flex: 2,
    backgroundColor: '#1C1B19',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },
  saveModalBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default CategoryManagementScreen;
