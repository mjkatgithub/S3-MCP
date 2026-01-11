module.exports = {
  default: {
    loader: ["ts-node/esm"],
    import: ["tests/setup.ts", "tests/steps/**/*.ts"],
    paths: ["tests/features/**/*.feature"],
    format: ["progress"],
    tags: "not @integration"
  },
  integration: {
    loader: ["ts-node/esm"],
    import: ["tests/setup.ts", "tests/steps/**/*.ts"],
    paths: ["tests/features/**/*.feature"],
    format: ["progress"],
    tags: "@integration"
  }
};
