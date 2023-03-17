import config from './jest.config.mjs';

const coverageConfig = {
  ...config,
  collectCoverage: true,
  collectCoverageFrom: [
    './src/**/*',
    '!./src/types/*',
    '!./src/**/types.ts',
    '!./src/**/index.ts',
    '!./src/**/*.tspec.ts',
  ],
  coverageThreshold: {
    global: { statements: 95, branches: 95 },
  },
};

export default coverageConfig;
