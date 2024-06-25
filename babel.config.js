module.exports = function(api) {
  api.cache(true);
  console.log("Babel config loaded"); 
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            // '@components': './src/components',
          },
        },
      ],
    ],
  };
};
