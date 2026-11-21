import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import productsFixture from '../../../fixtures/products.json';
import type {Product} from '../../api/types';
import {spacing} from '../../theme/tokens';

type Props = {
  productId: string;
};

const products = productsFixture as Product[];

export function ProductDetailScreen({productId}: Props) {
  const product = products.find(p => p.productId === productId);
  return (
    <View style={styles.container} testID="product-detail-screen">
      <Text style={styles.heading}>Product details (stub)</Text>
      <Text>{product?.title ?? productId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
});