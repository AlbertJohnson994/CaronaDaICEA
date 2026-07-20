export default {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  globals: {
    Intl: "readonly",
  },
  extends: [
    "eslint:recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    // ✅ Custom rules (examples)
    "no-unused-vars": "warn",         // warn about unused variables
    "no-console": "off",              // allow console.log
    "react/prop-types": "off",        // disable prop-types if using TS
    "react/react-in-jsx-scope": "off" // Next.js / Vite doesn’t need React in scope
  },
};
