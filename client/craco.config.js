const path = require(`path`);

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src/"),
      "@Components": path.resolve(__dirname, "src/components"),
      "@Pages": path.resolve(__dirname, "src/pages"),
      "@Context": path.resolve(__dirname, "src/context"),
      "@Images": path.resolve(__dirname, "src/images"),
      "@Styles": path.resolve(__dirname, "src/styles"),
    },
  },
};
