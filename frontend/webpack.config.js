const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          '@react-navigation',
          'query-string',
          'color',
          'decode-uri-component',
          'split-on-first',
          'filter-obj',
        ],
      },
    },
    argv
  );

  // Strictly fix "export not found" warnings by suppressing them for known problematic third-party packages.
  // These warnings are common in the Expo/React Navigation/Reanimated ecosystem due to mixed CJS/ESM modules
  // and legacy code paths in library internals that are scanned but not executed.
  config.ignoreWarnings = [
    (warning) =>
      warning.message.includes("export 'default' (imported as 'color') was not found in 'color'") ||
      warning.message.includes("export 'default' (imported as 'Color') was not found in 'color'") ||
      warning.message.includes("export 'stringify' (imported as 'queryString') was not found in 'query-string'") ||
      warning.message.includes("export 'parse' (imported as 'queryString') was not found in 'query-string'") ||
      warning.message.includes("react-native-reanimated") ||
      warning.message.includes("@react-navigation/drawer") ||
      warning.message.includes("@react-navigation/bottom-tabs") ||
      warning.message.includes("@react-navigation/core"),
  ];

  config.output.publicPath = '/app/';

  return config;
};
