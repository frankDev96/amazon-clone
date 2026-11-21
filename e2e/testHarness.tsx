import React, {useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import {Provider} from 'react-redux';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {setCartApiForceFailure} from '../src/api/cartApi';
import {CartScreen} from '../src/features/cart/CartScreen';
import {HomeScreen} from '../src/features/home/HomeScreen';
import {store} from '../src/store/store';

const queryClient = new QueryClient();

type Props = {
  forceCartFailure?: boolean;
};

export function ShoppingTestHarness({forceCartFailure}: Props) {
  const [tab, setTab] = useState<'home' | 'cart'>('home');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  React.useEffect(() => {
    setCartApiForceFailure(Boolean(forceCartFailure));
  }, [forceCartFailure]);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <View style={{flex: 1}}>
          <View style={{flexDirection: 'row', gap: 12, padding: 8}}>
            <Pressable onPress={() => setTab('home')} testID="tab-home">
              <Text>Home</Text>
            </Pressable>
            <Pressable onPress={() => setTab('cart')} testID="tab-cart">
              <Text>Cart</Text>
            </Pressable>
          </View>
          {tab === 'home' ? (
            <HomeScreen
              onOpenProduct={() => undefined}
              cartStatusMessage={statusMessage}
              onQuickAddSuccess={() => setStatusMessage(null)}
              onQuickAddError={message => setStatusMessage(message)}
            />
          ) : (
            <CartScreen
              onRetryLastError={() => {
                setCartApiForceFailure(false);
                setStatusMessage(null);
              }}
            />
          )}
        </View>
      </QueryClientProvider>
    </Provider>
  );
}