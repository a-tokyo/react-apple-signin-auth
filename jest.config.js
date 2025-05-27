module.exports = {
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['./node_modules/', './dist/'],
  modulePathIgnorePatterns: ['./dist/'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,}',
    '!**/node_modules/**',
    '!**/__flow__/**',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['lcov', 'json', 'text'],
  coverageThreshold: {
    global: {
      // @TODO push up over time
      branches: 66,
      functions: 71,
      lines: 77,
      statements: 77,
    },
  },
  setupFiles: ['./jest/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/jest/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg)$': '<rootDir>/jest/__mocks__/fileMock.js',
  },
};
