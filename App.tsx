import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {
  LaunchProps,
  RootNavigator,
} from './src/navigation/RootNavigator';
import {store} from './src/store/store';

const queryClient = new QueryClient();

type AppProps = LaunchProps;

function App(props: AppProps) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" />
          <RootNavigator
            launchProps={{
              visualTest: props.visualTest,
              visualScreen: props.visualScreen,
              e2eForceCartFailure: props.e2eForceCartFailure,
            }}
          />
        </SafeAreaProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;