const path = require("path");

module.exports = {
  entry: {
    heredity: "./src/index.ts"
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "bundle"),
    libraryTarget: "umd",
    library: "Heredity",
    umdNamedDefine: true
  },
  resolve: {
    extensions: [".tsx", ".ts", "js"]
  },
  devtool: "source-map",
  optimization: {
    minimize: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  }
};
