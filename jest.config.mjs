const config = {
  testEnvironment: 'node',
  transform: {
    '\\.([jt]sx?)$': ['babel-jest'],
  },
  collectCoverage: false,
};

export default config;
