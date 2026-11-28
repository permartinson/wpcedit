import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'node_modules/', 'dev-dist/', 'coverage/', 'test-results/'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  // Accessibility rules for the templates (WCAG 2.2 AA, see Claude/fas-C.md).
  // A problem is an error, so npm run check fails on it.
  ...pluginVueA11y.configs['flat/recommended'].map((config) => ({
    ...config,
    rules: Object.fromEntries(Object.keys(config.rules ?? {}).map((rule) => [rule, 'error'])),
  })),
  {
    rules: {
      // A label around its field (as in CheckBox.vue) is enough, no id needed
      'vuejs-accessibility/label-has-for': ['error', { required: { some: ['nesting', 'id'] } }],
    },
  },
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
    // Node scripts, tests and config files
    files: ['scripts/**/*.js', 'tests/**/*.{js,mjs}', '*.config.{js,mjs}'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // The web app manifest uses snake_case names from the standard
    files: ['vite.config.mjs'],
    rules: { camelcase: 'off' },
  },
];
