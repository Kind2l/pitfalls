const path = require(`path`);

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src/"),
      "@Components": path.resolve(__dirname, "src/components"),
      "@Pages": path.resolve(__dirname, "src/pages"),
      "@Auth": path.resolve(__dirname, "src/auth"),
      "@Images": path.resolve(__dirname, "src/images"),
      "@Styles": path.resolve(__dirname, "src/styles"),
    },
  },
};
