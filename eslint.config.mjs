import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'node_modules/', 'dev-dist/'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    rules: {
      // Same naming standard as the WPCEdit.js library. Only warns for now.
      camelcase: ['warn', { properties: 'always', ignoreDestructuring: true, ignoreImports: true }],
    },
  },
  {
    // Node scripts and config files
    files: ['scripts/**/*.js', '*.config.{js,mjs}'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // The web app manifest uses snake_case names from the standard
    files: ['vite.config.mjs'],
    rules: { camelcase: 'off' },
  },
];
