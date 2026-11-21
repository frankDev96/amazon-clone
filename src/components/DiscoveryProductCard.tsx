import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {Product} from '../api/types';
import {colors, spacing} from '../theme/tokens';
import {QuickAddButton} from './QuickAddButton';

type Props = {
  product: Product;
  pending?: boolean;
  onPressCard: () => void;
  onQuickAdd: () => void;
};

export function DiscoveryProductCard({
  product,
  pending,
  onPressCard,
  onQuickAdd,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPressCard}
      style={styles.card}
      testID={`discovery-card-${product.productId}`}>
      <View style={styles.imageWrap}>
        <Image source={{uri: product.imageUrl}} style={styles.image} />
        <QuickAddButton
          productId={product.productId}
          pending={pending}
          onPress={onQuickAdd}
        />
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {product.title}
      </Text>
      <View style={styles.badgeRow}>
        <Text style={styles.discount}>{product.discountPercent}% off</Text>
        {product.dealLabel ? (
          <Text style={styles.dealLabel}>{product.dealLabel}</Text>
        ) : null}
      </View>
      <Text style={styles.price}>
        ₹{product.price}{' '}
        <Text style={styles.mrp}>₹{product.mrp}</Text>
      </Text>
      {product.deliveryLabel ? (
        <Text style={styles.meta} testID={`prime-delivery-${product.productId}`}>
          Prime · {product.deliveryLabel}
        </Text>
      ) : null}
      {product.popularityLabel ? (
        <Text style={styles.meta}>{product.popularityLabel}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.cardWhite,
    borderRadius: 8,
    padding: spacing.sm,
    margin: spacing.xs,
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    marginBottom: spacing.sm,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#EEE',
  },
  title: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
    flexWrap: 'wrap',
  },
  discount: {
    backgroundColor: colors.discountRed,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dealLabel: {
    fontSize: 12,
    color: colors.discountRed,
    fontWeight: '600',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  mrp: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '400',
  },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});