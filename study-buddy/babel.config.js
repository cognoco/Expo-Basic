module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@screens': ['./src/screens'],
          '@components': ['./src/components'],
          '@utils': ['./src/utils'],
          '@assets': ['./src/assets'],
          '@config': ['./src/utils/config'],
          '@config/*': ['./src/utils/config/*'],
          '@content': ['./src/utils/content'],
          '@types': ['./src/types'],
          '@types/*': ['./src/types/*'],
          '@ui': ['./src/ui'],
          '@ui/*': ['./src/ui/*'],
          '@context': ['./src/context'],
          '@context/*': ['./src/context/*']
        },
        extensions: ['.ts', '.tsx', '.js', '.json']
      }],
      'react-native-reanimated/plugin' // must be last
    ]
  };
};
