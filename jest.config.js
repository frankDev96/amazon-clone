module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx|js)', '**/e2e/**/*.(test|spec).(ts|tsx)'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@shopify/flash-list|react-redux|@reduxjs/toolkit|redux|immer|@tanstack)/)',
  ],
};
