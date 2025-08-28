const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const extraNodeModules = require('node-libs-react-native');

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
    },
    sourceExts: ['js', 'json', 'ts', 'tsx', 'cjs'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);