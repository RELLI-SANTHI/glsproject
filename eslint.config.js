// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...tseslint.configs.stylistic, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: ['app', 'gls'],
          style: 'camelCase'
        }
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: ['app', 'gls'],
          style: 'kebab-case'
        }
      ],
      quotes: [2, 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      semi: 'error',
      'space-in-parens': 'off',
      'space-before-function-paren': 'off',
      'space-before-blocks': 'warn',
      'spaced-comment': 'warn',
      'no-multi-spaces': 'warn',
      'no-trailing-spaces': 'warn',
      'newline-before-return': 'warn',
      'no-empty-function': 'warn',
      'max-lines-per-function': ['warn', 40],
      'max-nested-callbacks': ['warn', 4],
      'max-params': ['warn', 7],
      'arrow-parens': 'warn',
      'arrow-spacing': 'warn',
      'function-paren-newline': 'off',
      curly: 'warn',
      'max-len': ['warn', { code: 160 }]
    }
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {}
  }
);
