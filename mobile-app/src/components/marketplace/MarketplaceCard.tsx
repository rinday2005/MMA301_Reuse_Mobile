import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/formatCurrency';
import type { MarketItem } from '../../utils/marketplaceMapper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

interface Props {
  item: MarketItem;
  wished: boolean;
  onPress: () => void;
  onToggleWishlist: () => void;
}

export const MarketplaceCard: React.FC<Props> = ({ item, wished, onPress, onToggleWishlist }) => {
  const isRent = item.mode === 'rent';
  const sold =
    item.status === 'SOLD' || (!isRent && item.quantity !== undefined && item.quantity <= 0);

  return (
    <View style={styles.card}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
          <View style={[styles.tag, isRent ? styles.tagRent : styles.tagThrift, sold && styles.tagSold]}>
            <Text style={styles.tagText}>{item.badge}</Text>
          </View>
          <TouchableOpacity style={styles.heart} onPress={onToggleWishlist} activeOpacity={0.8}>
            <Ionicons
              name={wished ? 'heart' : 'heart-outline'}
              size={16}
              color={wished ? '#E11D48' : '#1C1A18'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <View style={styles.metaRow}>
            <Text style={styles.metaCat} numberOfLines={1}>
              {item.category}
            </Text>
            <Text style={styles.metaCond} numberOfLines={1}>
              {item.condition}
            </Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          {isRent ? (
            <>
              <Text style={styles.price}>
                {formatCurrency(item.price)} <Text style={styles.unit}>/ ngày</Text>
              </Text>
              {item.deposit ? <Text style={styles.deposit}>Cọc: {item.deposit}</Text> : null}
            </>
          ) : (
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatCurrency(item.price)}</Text>
              {item.originalPrice ? (
                <Text style={styles.old}>{formatCurrency(item.originalPrice)}</Text>
              ) : null}
            </View>
          )}
          <Text style={styles.location} numberOfLines={1}>
            📍 {item.location}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.cta, sold && styles.ctaDisabled]}
        onPress={onPress}
        disabled={sold}
        activeOpacity={0.88}
      >
        <Text style={styles.ctaText}>{sold ? 'ĐÃ BÁN' : isRent ? 'ĐẶT THUÊ NGAY' : 'MUA NGAY'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    overflow: 'hidden',
  },
  imageWrap: { width: '100%', height: CARD_WIDTH * 1.12, backgroundColor: '#F4F0EA' },
  image: { width: '100%', height: '100%' },
  tag: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagRent: { backgroundColor: '#1C1A18' },
  tagThrift: { backgroundColor: '#047857' },
  tagSold: { backgroundColor: '#B91C1C' },
  tagText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  heart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.93)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { padding: 10 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginBottom: 4 },
  metaCat: { flex: 1, fontSize: 10, color: '#78736A' },
  metaCond: { fontSize: 10, color: '#047857', fontWeight: '700', maxWidth: '55%' },
  title: { fontSize: 13, fontWeight: '700', color: '#1C1A18', lineHeight: 17, minHeight: 34 },
  price: { fontSize: 14, fontWeight: '800', color: '#1C1A18', marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' },
  unit: { fontSize: 10, color: '#78736A', fontWeight: '400' },
  old: { fontSize: 11, color: '#A8A29E', textDecorationLine: 'line-through' },
  deposit: { fontSize: 10, color: '#78736A', marginTop: 2 },
  location: { fontSize: 10, color: '#A8A29E', marginTop: 4 },
  cta: {
    backgroundColor: '#1C1A18',
    height: 34,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaDisabled: { backgroundColor: '#A8A29E' },
  ctaText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
});

