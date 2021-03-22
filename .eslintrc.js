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
  plugins: ['react', 'react-native', 'flowtype', 'prettier'],
  rules: {
    'import/prefer-default-export': 'off',
    'import/no-named-as-default-member': 'off',
    'jsx-a11y/label-has-associated-control': 0,
    'no-console': 0,
    'no-underscore-dangle': 0,
    'react/jsx-filename-extension': 0,
    'react/jsx-props-no-spreading': 0,
    'react/require-default-props': 0,
  },
  globals: {
    window: true,
    document: true,
  },
};
