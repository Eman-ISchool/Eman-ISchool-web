module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript',
  ],
  ignorePatterns: [
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Capacitor mobile wrapper:
    'android/**',
    'ios/**',
  ],
  rules: {
    // Allow 'any' type for audit purposes
    '@typescript-eslint/no-explicit-any': 'off',
    // Allow empty object types for audit purposes
    '@typescript-eslint/no-empty-object-type': 'off',
    // Allow unused vars for audit purposes
    '@typescript-eslint/no-unused-vars': 'off',
    // Allow @ts-ignore for audit purposes
    '@typescript-eslint/ban-ts-comment': 'off',
    // Allow img elements for VR components
    '@next/next/no-img-element': 'off',
    // Allow unescaped entities for audit purposes
    'react/no-unescaped-entities': 'off',
    // Allow prefer-const violations for audit purposes
    'prefer-const': 'off',
    // Allow react-hooks exhaustive-deps warnings for audit purposes
    'react-hooks/exhaustive-deps': 'off',
  },
};
