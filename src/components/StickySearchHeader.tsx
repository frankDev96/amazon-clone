import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing} from '../theme/tokens';

type Props = {
  onPlaceholderPress?: () => void;
};

export function StickySearchHeader({onPlaceholderPress}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrapper, {paddingTop: insets.top + spacing.sm}]}>
      <Pressable
        accessibilityRole="search"
        accessibilityLabel="Search products"
        onPress={onPlaceholderPress}
        style={styles.searchBar}
        testID="sticky-search-bar">
        <Text style={styles.searchText}>Search ShopFeed</Text>
        <Text style={styles.affordance} accessibilityLabel="Camera search placeholder">
          📷
        </Text>
        <Text style={styles.affordance} accessibilityLabel="Voice search placeholder">
          🎤
        </Text>
      </Pressable>
      <Text
        style={styles.scanner}
        accessibilityLabel="Scanner placeholder"
        testID="scanner-affordance">
        ⧉
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.goldBackground,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.searchOverlay,
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  searchText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 16,
  },
  affordance: {
    fontSize: 16,
  },
  scanner: {
    fontSize: 22,
    color: colors.textPrimary,
  },
});