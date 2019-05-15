module.exports = {
  'require': ['source-map-support/register', 'ts-node/register'],
  'recursive': true,
  'spec': ['test/common/**/*.test.ts', 'test/node/**/*.test.ts'],
  'watch-extensions': ['ts'],
};
