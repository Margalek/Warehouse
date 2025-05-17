/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.ts', '@testing-library/jest-dom'],
  // extensionsToTreatAsEsm: ['.ts', '.tsx'], // Removed for CJS target
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Handle CSS Modules (if you use them, though Shadcn/UI typically doesn't rely on them heavily for components)
    '\\.css$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json', // Point to the new Jest-specific tsconfig
      },
    ],
  },
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,
};
