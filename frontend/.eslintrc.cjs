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
	ignorePatterns: ['!**/.server', '!**/.client'],

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
				'prettier/prettier': 'error',
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
					typescript: {},
				},
			},
		},

		// TypeScript
		{
			files: ['**/*.{ts,tsx}'],
			plugins: ['@typescript-eslint', 'import', 'prettier'],
			parser: '@typescript-eslint/parser',
			rules: {
				'@typescript-eslint/no-unused-vars': ['error'],
				'@typescript-eslint/explicit-function-return-type': [
					'warn',
					{
						allowExpressions: true,
						allowTypedFunctionExpressions: true,
					},
				],
				'@typescript-eslint/no-explicit-any': 'warn',
				'@typescript-eslint/consistent-type-imports': 'error',
				'@typescript-eslint/no-floating-promises': 'error',
				'@typescript-eslint/no-misused-promises': 'error',
				'prettier/prettier': 'error',
			},
			settings: {
				'import/internal-regex': '^~/',
				'import/resolver': {
					node: {
						extensions: ['.ts', '.tsx'],
					},
					typescript: {
						alwaysTryTypes: true,
					},
				},
			},
			extends: [
				'plugin:@typescript-eslint/recommended',
				'plugin:import/recommended',
				'plugin:import/typescript',
				'plugin:prettier/recommended',
			],
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
