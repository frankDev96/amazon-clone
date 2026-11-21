import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text} from 'react-native';
import {colors, spacing} from '../theme/tokens';

const CHIPS = [
  {id: 'categories', label: 'Categories ▾'},
  {id: 'value', label: 'Value picks'},
  {id: 'bestsellers', label: 'Bestsellers'},
  {id: 'under299', label: 'Under ₹299'},
];

type Props = {
  selected: string[];
  onToggle: (id: string) => void;
};

export function DiscoveryFilterBar({selected, onToggle}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
      contentContainerStyle={styles.content}
      testID="discovery-filter-bar">
      {CHIPS.map(chip => {
        const active = selected.includes(chip.id);
        return (
          <Pressable
            key={chip.id}
            testID={`filter-chip-${chip.id}`}
            onPress={() => onToggle(chip.id)}
            style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: colors.cardWhite,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  chipActive: {
    borderColor: colors.textPrimary,
    backgroundColor: '#FFF8E7',
  },
  chipText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  chipTextActive: {
    fontWeight: '700',
  },
});