import React, {useEffect, useMemo, useRef} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import homeFeed from '../../../fixtures/home_feed.json';
import productsFixture from '../../../fixtures/products.json';
import type {Product} from '../../api/types';
import {PriceProductCard} from '../../components/PriceProductCard';
import {StickySearchHeader} from '../../components/StickySearchHeader';
import {colors, spacing} from '../../theme/tokens';
import {DiscoveryFeedSection} from './DiscoveryFeedSection';

type Props = {
  onOpenProduct: (productId: string) => void;
  visualTest?: boolean;
  visualScreen?: string;
  onVisualReady?: () => void;
  cartStatusMessage?: string | null;
  onQuickAddSuccess?: () => void;
  onQuickAddError?: (message: string) => void;
};

type Row =
  | {type: 'grid'; title: string; products: Product[]}
  | {type: 'discovery'; title: string; products: Product[]};

const products = productsFixture as Product[];

export function HomeScreen({
  onOpenProduct,
  visualTest,
  visualScreen,
  onVisualReady,
  cartStatusMessage,
  onQuickAddSuccess,
  onQuickAddError,
}: Props) {
  const readyLogged = useRef(false);
  const rows = useMemo<Row[]>(() => {
    return homeFeed.sections.map(section => {
      const sectionProducts = (section.items ?? [])
        .map(item => products.find(p => p.productId === item.productId))
        .filter((p): p is Product => Boolean(p));
      if (section.type === 'discovery_feed') {
        return {type: 'discovery', title: section.title ?? '', products: sectionProducts};
      }
      return {type: 'grid', title: section.title ?? '', products: sectionProducts};
    });
  }, []);

  useEffect(() => {
    if (visualTest && visualScreen === 'home_feed_top' && !readyLogged.current) {
      readyLogged.current = true;
      console.log(`VISUAL_TEST_READY screen=${visualScreen}`);
      onVisualReady?.();
    }
  }, [onVisualReady, visualScreen, visualTest]);

  return (
    <View style={styles.container} testID="home-screen">
      <StickySearchHeader />
      {cartStatusMessage ? (
        <Text style={styles.banner} testID="cart-status-banner">
          {cartStatusMessage}
        </Text>
      ) : null}
      <FlashList
        data={rows}
        // @ts-expect-error FlashList typings omit estimatedItemSize in some versions
        estimatedItemSize={320}
        keyExtractor={item => `${item.type}-${item.title}`}
        renderItem={({item}) => {
          if (item.type === 'discovery') {
            return (
              <DiscoveryFeedSection
                title={item.title}
                products={item.products}
                onOpenProduct={onOpenProduct}
                onQuickAddSuccess={onQuickAddSuccess}
                onQuickAddError={onQuickAddError}
              />
            );
          }
          return (
            <View style={styles.gridSection}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              <View style={styles.gridRow}>
                {item.products.map(product => (
                  <View key={product.productId} style={styles.gridCol}>
                    <PriceProductCard
                      product={product}
                      onPress={() => onOpenProduct(product.productId)}
                    />
                  </View>
                ))}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.goldBackground,
  },
  banner: {
    backgroundColor: '#FAD9A5',
    color: colors.textPrimary,
    padding: spacing.sm,
    textAlign: 'center',
  },
  gridSection: {
    backgroundColor: colors.cardWhite,
    margin: spacing.lg,
    borderRadius: 8,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCol: {
    flex: 1,
  },
});