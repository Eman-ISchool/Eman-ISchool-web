const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset({
  tsconfig: "tsconfig.test.json",
}).transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "<rootDir>/tests/unit/**/*.spec.ts",
    "<rootDir>/src/__tests__/**/*.test.ts",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/.auto-claude/", "/.worktrees/"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};