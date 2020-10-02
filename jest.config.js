module.exports = {
  testPathIgnorePatterns: ['./node_modules/', './dist/'],
  modulePathIgnorePatterns: ['./dist/'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,}',
    '!**/node_modules/**',
    '!**/__flow__/**',
  ],
  coverageDirectory: './coverage',
  coverageThreshold: {
    global: {
      // @TODO push up over time
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20,
    },
  },
  setupFilesAfterEnv: ['./jest/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/jest/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg)$': '<rootDir>/jest/__mocks__/fileMock.js',
  },
};
