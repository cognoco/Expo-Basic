module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            // Default template aliases
            '@': './',
            '@/app': './app',
            '@/components': './components',
            '@/constants': './constants',
            '@/hooks': './hooks',
            '@/assets': './assets',
            // Study Buddy aliases (will point to migrated locations)
            '@screens': './app',
            '@components': './components',
            '@utils': './lib/utils',
            '@assets': './assets',
            '@config': './lib/utils/config',
            '@content': './lib/utils/content',
            '@types': './lib/types',
            '@context': './lib/context',
            '@ui': './lib/ui',
          },
          extensions: ['.ts', '.tsx', '.js', '.json'],
        },
      ],
      'react-native-reanimated/plugin', // must be last
    ],
  };
};