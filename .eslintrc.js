module.exports = {
  root: true,
  extends: [
    'airbnb',
    'plugin:flowtype/recommended',
    'prettier',
    'prettier/flowtype',
    'prettier/react',
  ],
  parser: 'babel-eslint',
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  plugins: [
    'react',
    'react-native',
    'flowtype',
    'prettier',
  ],
  rules: {
    'import/prefer-default-export': 'off',
    'import/no-named-as-default-member': 'off',
  },
  env: {
    jest: true,
  },
  globals: {
    window: true,
  },
};
