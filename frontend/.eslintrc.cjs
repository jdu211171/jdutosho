/**
 * This is intended to be a basic starting point for linting in your app.
 * It relies on recommended configs out of the box for simplicity, but you can
 * and should modify this configuration to best suit your team's needs.
 */

/** @type {import('eslint').Linter.Config} */
module.exports = {
	root: true,
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	env: {
		browser: true,
		commonjs: true,
		es6: true,
	},
	ignorePatterns: ['!**/.server', '!**/.client', 'app/components/ui/'],

	// Base config
	extends: ['eslint:recommended'],

	overrides: [
		// React and JSX
		{
			files: ['**/*.{js,jsx,ts,tsx}'],
			plugins: ['react', 'jsx-a11y', 'prettier'],
			extends: [
				'plugin:react/recommended',
				'plugin:react/jsx-runtime',
				'plugin:react-hooks/recommended',
				'plugin:jsx-a11y/recommended',
				'plugin:prettier/recommended',
			],
			rules: {
				'react/jsx-key': 'error',
				'prettier/prettier': ['error', {}, { usePrettierrc: true }],
			},
			settings: {
				react: {
					version: 'detect',
				},
				formComponents: ['Form'],
				linkComponents: [
					{ name: 'Link', linkAttribute: 'to' },
					{ name: 'NavLink', linkAttribute: 'to' },
				],
				'import/resolver': {
					typescript: {
						project: './tsconfig.json', // Explicit path to tsconfig.json
						alwaysTryTypes: true, // Tries type declarations
					},
					node: {
						extensions: ['.ts', '.tsx'],
					},
				},
			},
		},

		// TypeScript
		{
			files: ['**/*.{ts,tsx}'],
			plugins: ['@typescript-eslint', 'import', 'prettier'],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				project: ['./tsconfig.json'],
				tsconfigRootDir: __dirname,
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
			plugins: ['@typescript-eslint', 'import'],
			rules: {
				'@typescript-eslint/no-unused-vars': ['error'],
				'@typescript-eslint/no-explicit-any': 'off',
				'@typescript-eslint/consistent-type-imports': 'error',
				'@typescript-eslint/no-floating-promises': 'error',
				'@typescript-eslint/no-misused-promises': 'error',
				'prettier/prettier': ['error', {}, { usePrettierrc: true }],
				'linebreak-style': ['error', 'unix'],
			},
			extends: [
				'plugin:@typescript-eslint/recommended',
				'plugin:import/recommended',
				'plugin:import/typescript',
				'plugin:prettier/recommended',
			],
			settings: {
				'import/internal-regex': '^~/',
				'import/resolver': {
					node: {
						extensions: ['.ts', '.tsx'],
					},
					typescript: {
						project: './tsconfig.json',
						alwaysTryTypes: true,
					},
				},
			},
		},

		// Node-specific settings
		{
			files: ['.eslintrc.cjs'],
			env: {
				node: true,
			},
		},
	],
}
