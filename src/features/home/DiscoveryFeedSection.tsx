import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {Product} from '../../api/types';
import {DiscoveryFilterBar} from '../../components/DiscoveryFilterBar';
import {DiscoveryProductCard} from '../../components/DiscoveryProductCard';
import {useAppSelector} from '../../hooks/useAppDispatch';
import {useQuickAdd} from '../../hooks/useQuickAdd';
import {colors, spacing} from '../../theme/tokens';

type Props = {
  title: string;
  products: Product[];
  onOpenProduct: (productId: string) => void;
  onQuickAddSuccess?: () => void;
  onQuickAddError?: (message: string) => void;
};

export function DiscoveryFeedSection({
  title,
  products,
  onOpenProduct,
  onQuickAddSuccess,
  onQuickAddError,
}: Props) {
  const [filters, setFilters] = useState<string[]>([]);
  const {quickAdd} = useQuickAdd();
  const pendingIds = useAppSelector(state => state.cart.pendingProductIds);

  const filtered = useMemo(() => {
    if (filters.includes('under299')) {
      return products.filter(p => p.price < 300);
    }
    return products;
  }, [filters, products]);

  const toggleFilter = (id: string) => {
    setFilters(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  return (
    <View style={styles.section} testID="discovery-feed-section">
      <Text style={styles.title}>{title}</Text>
      <DiscoveryFilterBar selected={filters} onToggle={toggleFilter} />
      <View style={styles.grid}>
        {filtered.map(product => (
          <View key={product.productId} style={styles.column}>
            <DiscoveryProductCard
              product={product}
              pending={pendingIds.includes(product.productId)}
              onPressCard={() => onOpenProduct(product.productId)}
              onQuickAdd={async () => {
                const key = `${product.productId}-${Date.now()}`;
                const result = await quickAdd(product, key);
                if (result.ok) {
                  onQuickAddSuccess?.();
                } else {
                  onQuickAddError?.(result.message);
                }
              }}
            />
          </View>
        ))}
      </View>
      {filtered.length === 0 ? (
        <Text style={styles.empty} testID="discovery-empty">
          No products match filters.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.discoveryBackground,
    paddingVertical: spacing.lg,
    borderTopWidth: 4,
    borderTopColor: colors.discoveryOrange,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
  },
  column: {
    width: '50%',
  },
  empty: {
    padding: spacing.lg,
    textAlign: 'center',
    color: colors.textSecondary,
  },
});