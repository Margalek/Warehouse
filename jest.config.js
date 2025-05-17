/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Handle CSS Modules (if you use them, though Shadcn/UI typically doesn't rely on them heavily for components)
    '\\.css$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json', // or tsconfig.spec.json if you have a separate one
      },
    ],
  },
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,
};
