module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@screens': './study-buddy/src/screens',
          '@components': './study-buddy/src/components',
          '@utils': './study-buddy/src/utils',
          '@assets': './study-buddy/src/assets',
          '@config': './study-buddy/src/utils/config',
          '@content': './study-buddy/src/utils/content',
          '@types': './study-buddy/src/types',
          '@ui': './study-buddy/src/ui',
          '@context': './study-buddy/src/context'
        },
        extensions: ['.ts', '.tsx', '.js', '.json']
      }],
      'react-native-reanimated/plugin' // must be last
    ]
  };
};