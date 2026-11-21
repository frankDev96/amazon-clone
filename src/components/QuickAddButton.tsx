import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {colors} from '../theme/tokens';

type Props = {
  productId: string;
  pending?: boolean;
  onPress: () => void;
};

export function QuickAddButton({productId, pending, onPress}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Quick add product ${productId}`}
      testID={`quick-add-${productId}`}
      onPress={e => {
        e.stopPropagation?.();
        onPress();
      }}
      style={styles.button}
      disabled={pending}>
      {pending ? (
        <ActivityIndicator size="small" color={colors.textPrimary} />
      ) : (
        <Text style={styles.plus}>+</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.quickAddYellow,
    borderWidth: 1,
    borderColor: colors.quickAddBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: -2,
  },
});