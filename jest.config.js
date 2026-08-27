/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/domain/**/*.ts",
    "src/validation/**/*.ts",
    "src/controllers/**/*.ts",
  ],
  coverageThreshold: {
    "src/domain/**/*.ts": {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
    "src/validation/**/*.ts": {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
  coverageReporters: ["text", "lcov"],
};
