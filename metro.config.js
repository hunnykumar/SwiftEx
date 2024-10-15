const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const extraNodeModules = require('node-libs-react-native');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    extraNodeModules: {
      ...extraNodeModules,
      events: require.resolve('events/'),
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('react-native-crypto'),
      randomBytes: require.resolve('react-native-randombytes'),
      buffer: require.resolve('buffer/'),
      fs: require.resolve('react-native-level-fs'),
      // For https, we'll use fetch or axios, so no need for require('https')
    },
    sourceExts: ['js', 'json', 'ts', 'tsx', 'cjs'], // Support for CommonJS modules
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
