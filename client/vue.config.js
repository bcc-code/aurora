const path = require("path");

module.exports = {
    devServer: {
    disableHostCheck: true
  },
  publicPath: "/",
  outputDir: "../firebase/public/",
  chainWebpack: config => {
    config.optimization.minimize(false);
    config.plugin("copy").tap(([options]) => {
      options[0].ignore.push("**/config.json");
      return [options];
    });
  },
};
