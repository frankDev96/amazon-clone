import React, {useState} from 'react';
import {Text} from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {setCartApiForceFailure} from '../api/cartApi';
import {CartScreen} from '../features/cart/CartScreen';
import {HomeScreen} from '../features/home/HomeScreen';
import {ProductDetailScreen} from '../features/product/ProductDetailScreen';
import {useAppSelector} from '../hooks/useAppDispatch';
import {selectCartCount} from '../store/cartSlice';
import {colors} from '../theme/tokens';

export type RootStackParamList = {
  Tabs: undefined;
  ProductDetail: {productId: string};
};

export type RootTabParamList = {
  Home: undefined;
  You: undefined;
  Wallet: undefined;
  Cart: undefined;
  Menu: undefined;
  Rufus: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

export type LaunchProps = {
  visualTest?: boolean;
  visualScreen?: string;
  e2eForceCartFailure?: boolean;
};

function PlaceholderTab({label}: {label: string}) {
  return <Text style={{padding: 24}}>{label} (placeholder)</Text>;
}

function HomeTab({launchProps}: {launchProps: LaunchProps}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  return (
    <HomeScreen
      visualTest={launchProps.visualTest}
      visualScreen={launchProps.visualScreen}
      cartStatusMessage={statusMessage}
      onOpenProduct={productId =>
        navigation.navigate('ProductDetail', {productId})
      }
      onQuickAddSuccess={() => setStatusMessage(null)}
      onQuickAddError={message => setStatusMessage(message)}
    />
  );
}

function Tabs({launchProps}: {launchProps: LaunchProps}) {
  const cartCount = useAppSelector(selectCartCount);

  React.useEffect(() => {
    if (launchProps.e2eForceCartFailure) {
      setCartApiForceFailure(true);
    }
  }, [launchProps.e2eForceCartFailure]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
      }}>
      <Tab.Screen name="Home">
        {() => <HomeTab launchProps={launchProps} />}
      </Tab.Screen>
      <Tab.Screen name="You">
        {() => <PlaceholderTab label="You" />}
      </Tab.Screen>
      <Tab.Screen name="Wallet">
        {() => <PlaceholderTab label="Wallet" />}
      </Tab.Screen>
      <Tab.Screen
        name="Cart"
        options={{
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}>
        {() => (
          <CartScreen
            onRetryLastError={() => {
              setCartApiForceFailure(false);
            }}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Menu">
        {() => <PlaceholderTab label="Menu" />}
      </Tab.Screen>
      <Tab.Screen name="Rufus">
        {() => <PlaceholderTab label="Rufus AI (placeholder)" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export function RootNavigator({launchProps}: {launchProps: LaunchProps}) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: true}}>
        <Stack.Screen name="Tabs" options={{headerShown: false}}>
          {() => <Tabs launchProps={launchProps} />}
        </Stack.Screen>
        <Stack.Screen name="ProductDetail">
          {({route}) => (
            <ProductDetailScreen productId={route.params.productId} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}