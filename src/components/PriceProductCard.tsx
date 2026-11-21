import React from 'react';
import {Image, Pressable, StyleSheet, Text} from 'react-native';
import type {Product} from '../api/types';
import {colors, spacing} from '../theme/tokens';

type Props = {
  product: Product;
  onPress: () => void;
};

export function PriceProductCard({product, onPress}: Props) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      testID={`price-card-${product.productId}`}>
      <Image source={{uri: product.imageUrl}} style={styles.image} />
      <Text numberOfLines={2} style={styles.title}>
        {product.title}
      </Text>
      <Text style={styles.discount}>{product.discountPercent}% off</Text>
      <Text style={styles.price}>
        ₹{product.price} <Text style={styles.mrp}>₹{product.mrp}</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.cardWhite,
    margin: spacing.xs,
    padding: spacing.sm,
    borderRadius: 8,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 6,
    backgroundColor: '#EEE',
  },
  title: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  discount: {
    marginTop: spacing.xs,
    color: colors.discountRed,
    fontWeight: '700',
    fontSize: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  mrp: {
    fontSize: 13,
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
    fontWeight: '400',
  },
});