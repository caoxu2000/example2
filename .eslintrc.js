module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true
  },
  extends: ['standard'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    quotes: ['warn', 'single'],
    semi: ['warn', 'never'],
    camelcase: 'warn',
    'space-before-function-paren': 'off',
    'no-empty-function': 'error',
    'no-unused-expressions': 'warn',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
        trailingComma: 'none'
      }
    ]
  }
}
