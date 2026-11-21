/* eslint-env jest */
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const {View} = require('react-native');
  const inset = {top: 0, right: 0, bottom: 0, left: 0};
  const SafeAreaInsetsContext = React.createContext(inset);
  const SafeAreaFrameContext = React.createContext({
    x: 0,
    y: 0,
    width: 390,
    height: 844,
  });
  return {
    SafeAreaInsetsContext,
    SafeAreaFrameContext,
    SafeAreaProvider: ({children}) =>
      React.createElement(
        SafeAreaInsetsContext.Provider,
        {value: inset},
        React.createElement(SafeAreaFrameContext.Provider, {
          value: {x: 0, y: 0, width: 390, height: 844},
          children,
        }),
      ),
    SafeAreaView: View,
    useSafeAreaInsets: () => inset,
    initialWindowMetrics: {
      frame: {x: 0, y: 0, width: 390, height: 844},
      insets: inset,
    },
  };
});

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  screensEnabled: jest.fn(() => false),
}));

jest.mock('@shopify/flash-list', () => {
  const React = require('react');
  const {FlatList} = require('react-native');
  return {
    FlashList: props => React.createElement(FlatList, props),
  };
});