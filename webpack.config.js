const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: path.join(__dirname, "main.js"),
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.js"
  },
  mode: "development",
  devServer: {
    hot: true,
    port: 8000,
    open: true,
    compress: true
  },
  // 插件
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./index.html"
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, "./static"),
        to: path.resolve(__dirname, "./dist/static")
      }
    ]),
    new CleanWebpackPlugin()
  ],
  // loader
  module: {
    rules: []
  }
};
