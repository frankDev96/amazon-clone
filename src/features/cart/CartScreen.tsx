import React from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {useAppSelector} from '../../hooks/useAppDispatch';
import {colors, spacing} from '../../theme/tokens';

type Props = {
  onRetryLastError?: () => void;
};

export function CartScreen({onRetryLastError}: Props) {
  const items = useAppSelector(state => state.cart.items);
  const lastError = useAppSelector(state => state.cart.lastError);

  return (
    <View style={styles.container} testID="cart-screen">
      <Text style={styles.heading}>Cart</Text>
      {lastError ? (
        <View style={styles.errorBox}>
          <Text testID="cart-error-message">{lastError}</Text>
          {onRetryLastError ? (
            <Pressable testID="cart-retry-button" onPress={onRetryLastError}>
              <Text style={styles.retry}>Retry</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <FlatList
        data={items}
        keyExtractor={item => `${item.productId}-${item.variantId}`}
        ListEmptyComponent={
          <Text style={styles.empty} testID="cart-empty">
            Your cart is empty.
          </Text>
        }
        renderItem={({item}) => (
          <View style={styles.row} testID={`cart-line-${item.productId}`}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>
              Qty {item.quantity} · ₹{item.unitPrice}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: '#FFF',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  empty: {
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD',
  },
  title: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  errorBox: {
    backgroundColor: '#FFECEC',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  retry: {
    marginTop: spacing.sm,
    color: colors.tabActive,
    fontWeight: '700',
  },
});