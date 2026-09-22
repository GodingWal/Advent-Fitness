// Expo Metro config: keep the volt-api backend (and its node_modules)
// out of the mobile bundler's watch/haste map.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : []),
  /volt-api\/.*/,
];

module.exports = config;
