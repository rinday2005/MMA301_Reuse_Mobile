import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';
import { FAQ_SECTIONS } from '../../data/home/faqData';
import type { FaqSectionData } from '../../data/home/faqData';

export const FAQScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ 'rent-1': true });

  const filterTabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'rent', label: 'Thuê đồ RENT', count: 8 },
    { key: 'thrift', label: 'Mua sắm THRIFT', count: 5 },
    { key: 'payment', label: 'Thanh toán & Cọc', count: 4 },
    { key: 'logistics', label: 'Vận chuyển', count: 2 },
    { key: 'cart', label: 'Giỏ hàng & Đơn', count: 2 },
    { key: 'account', label: 'Tài khoản & KYC', count: 4 },
    { key: 'shopowner', label: 'Cửa hàng Shop Owner', count: 4 },
    { key: 'circular', label: 'Tuần hoàn ReUse', count: 1 },
  ];

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredSections = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return FAQ_SECTIONS.map((section) => {
      if (activeFilter !== 'all' && section.category !== activeFilter) {
        return null;
      }

      if (!query) {
        return section;
      }

      const matchingItems = section.items.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
      );

      if (matchingItems.length === 0) {
        return null;
      }

      return {
        ...section,
        items: matchingItems,
      };
    }).filter((s): s is FaqSectionData => s !== null);
  }, [activeFilter, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader title="Câu Hỏi Thường Gặp (FAQ)" showBack />

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
          <Text style={styles.breadcrumbCurrent}>Câu hỏi thường gặp (FAQ)</Text>
        </View>

        {/* 2. HERO BOX */}
        <View style={styles.heroBox}>
          <View style={styles.heroBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>HỖ TRỢ · TRUNG TÂM GIẢI ĐÁP</Text>
          </View>

          <Text style={styles.heroTitle}>Câu hỏi thường gặp</Text>
          <Text style={styles.heroSubtitle}>
            Những điều bạn cần biết về thuê, mua và tái sử dụng.
          </Text>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color="#78736A" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm câu hỏi theo từ khóa (tiền cọc, VNPay...)"
              placeholderTextColor="#A8A29E"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x" size={16} color="#78736A" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 3. CATEGORY PILLS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContainer}
        >
          {filterTabs.map((pill) => {
            const isActive = activeFilter === pill.key;
            return (
              <TouchableOpacity
                key={pill.key}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setActiveFilter(pill.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {pill.label}
                </Text>
                {pill.count !== undefined && (
                  <Text style={[styles.pillCount, isActive && styles.pillCountActive]}>
                    {' '}({pill.count})
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 4. FAQ SECTIONS ACCORDION */}
        <View style={styles.sectionsContainer}>
          {filteredSections.length === 0 ? (
            <View style={styles.emptyBox}>
              <Feather name="help-circle" size={32} color="#A8A29E" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyText}>
                Không tìm thấy câu hỏi phù hợp với từ khóa "{searchQuery}".
              </Text>
            </View>
          ) : (
            filteredSections.map((section) => (
              <View key={section.id} style={styles.sectionWrap}>
                {/* Section Header */}
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionNumberBadge}>
                    <Text style={styles.sectionNumberText}>{section.number}</Text>
                  </View>
                  <View style={styles.sectionTitleBlock}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <Text style={styles.sectionDesc}>{section.description}</Text>
                  </View>
                </View>

                {/* Section Items */}
                <View style={styles.itemsWrap}>
                  {section.items.map((item) => {
                    const isOpen = Boolean(openItems[item.id] || searchQuery.trim().length > 2);
                    return (
                      <View key={item.id} style={styles.faqCard}>
                        <TouchableOpacity
                          style={styles.faqCardHeader}
                          onPress={() => toggleItem(item.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.faqQuestion, isOpen && styles.faqQuestionOpen]}>
                            {item.question}
                          </Text>
                          <Feather
                            name={isOpen ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color={isOpen ? '#1C1A18' : '#78736A'}
                          />
                        </TouchableOpacity>

                        {isOpen && (
                          <View style={styles.faqAnswerBox}>
                            <Text style={styles.faqAnswerText}>{item.answer}</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </View>

        {/* 5. CTA CARD AT BOTTOM */}
        <View style={styles.bottomCtaCard}>
          <Text style={styles.ctaPre}>KẾT NỐI VỚI CHUYÊN VIÊN</Text>
          <Text style={styles.ctaTitle}>Bạn vẫn cần hỗ trợ?</Text>
          <Text style={styles.ctaDesc}>
            Đội ngũ chuyên viên tư vấn của ReUse Hub luôn sẵn sàng giải đáp mọi thắc mắc về điều
            khoản thuê, hợp đồng và quy trình bảo chứng.
          </Text>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Contact')}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaButtonText}>Liên hệ ReUse Hub</Text>
            <Feather name="arrow-right" size={14} color="#1C1A18" />
          </TouchableOpacity>

          <View style={styles.ctaLinksRow}>
            <TouchableOpacity onPress={() => navigation.navigate('HowItWorks')}>
              <Text style={styles.ctaLinkText}>Xem Cách hoạt động</Text>
            </TouchableOpacity>
            <Text style={styles.ctaLinkDot}>·</Text>
            <TouchableOpacity onPress={() => navigation.navigate('About')}>
              <Text style={styles.ctaLinkText}>Về ReUse Hub</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF9F5',
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
    fontWeight: '500',
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
    marginBottom: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E2DA',
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
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBF9F5',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#1C1A18',
    paddingVertical: 0,
  },
  pillsContainer: {
    paddingBottom: 14,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: '#1C1A18',
    borderColor: '#1C1A18',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#5E5A53',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  pillCount: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#78736A',
  },
  pillCountActive: {
    color: '#E7E2DA',
  },
  sectionsContainer: {
    marginTop: 6,
    gap: 20,
  },
  sectionWrap: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E2DA',
    paddingBottom: 10,
  },
  sectionNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#1C1A18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitleBlock: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1A18',
  },
  sectionDesc: {
    fontSize: 11,
    color: '#78736A',
    marginTop: 1,
  },
  itemsWrap: {
    gap: 8,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    overflow: 'hidden',
  },
  faqCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1A18',
    lineHeight: 18,
  },
  faqQuestionOpen: {
    color: '#1C1A18',
    fontWeight: '700',
  },
  faqAnswerBox: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F4F0EA',
  },
  faqAnswerText: {
    fontSize: 12,
    color: '#5E5A53',
    lineHeight: 18,
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#78736A',
    textAlign: 'center',
  },
  bottomCtaCard: {
    backgroundColor: '#1C1A18',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginTop: 24,
  },
  ctaPre: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#A8A29E',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  ctaDesc: {
    fontSize: 12,
    color: '#D6D3D1',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    marginBottom: 14,
  },
  ctaButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1A18',
  },
  ctaLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaLinkText: {
    fontSize: 11,
    color: '#A8A29E',
    textDecorationLine: 'underline',
  },
  ctaLinkDot: {
    fontSize: 11,
    color: '#78736A',
  },
});
