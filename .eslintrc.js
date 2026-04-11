/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.next/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': 'warn',
    },
  },
];
