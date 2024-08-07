const globals = require("globals");
const eslintJs = require("@eslint/js");

module.exports = [
  {
    ignores: [
      "build",
      "docs",
      "gulp-docco",
    ],
  },
  eslintJs.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',

      globals: {
        ...globals.es2015,
        ...globals.node,
        ...globals.browser,
        ...globals.jasmine,
      },
    },

    rules: {
      "curly": [
        "error",
        "all",
      ],
      "keyword-spacing": [
        "error",
        {},
      ],
      "space-before-blocks": [
        "error",
        "always",
      ],
      "wrap-iife": "error",
      "space-before-function-paren": [
        "error",
        {
          "anonymous": "ignore",
          "named": "never",
        },
      ],
      "one-var": [
        "error",
        "never",
      ],
      "no-empty": "error",
      "array-bracket-spacing": [
        "error",
        "never",
        {},
      ],
      "space-in-parens": [
        "error",
        "never",
      ],
      "comma-style": [
        "error",
        "last",
      ],
      "space-unary-ops": [
        "error",
        {
          "words": false,
          "nonwords": false,
        },
      ],
      "space-infix-ops": "error",
      "no-with": "error",
      "indent": [
        "error",
        2,
        {
          "SwitchCase": 1,
        },
      ],
      "no-mixed-spaces-and-tabs": "error",
      "no-trailing-spaces": "error",
      "comma-dangle": [
        "error",
        "always-multiline",
      ],
      "no-unused-vars": "off",
      "brace-style": [
        "error",
        "1tbs",
        {
          "allowSingleLine": true,
        },
      ],
      "eol-last": "error",
      "dot-notation": "error",
      "no-multi-str": "error",
      "key-spacing": [
        "error",
        {
          "afterColon": true,
        },
      ],
      "no-var": "error",
      "prefer-const": "error",
      "semi": "error",
      "no-console": "warn",
      "no-restricted-globals": [
        "error",
        {
          "name": "fit",
          "message": "Do not commit focused tests.",
        },
        {
          "name": "fdescribe",
          "message": "Do not commit focused tests.",
        },
      ],
    },
  },
];
