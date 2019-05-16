const webpack = require("webpack");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = {
  mode: "production",
  output: {
    filename: "bundle.min.js"
  },
  devtool: false,
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: "babel-loader"
      }
    }, {
      test: [/\.vert$/, /\.frag$/],
      use: "file-loader"
    }, {
      test: /\.(gif|png|jpe?g|svg|xml)$/i,
      use: "file-loader"
    }, {
      test: /\.csv$/,
      use: "file-loader"
    }]
  },
  plugins: [
    new CleanWebpackPlugin(["dist"], {
      root: path.resolve(__dirname, "../")
    }),
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true)
    }),
    new HtmlWebpackPlugin({
      template: "./index.html"
    })
  ],
  performance: {
    maxEntrypointSize: 900000,
    maxAssetSize: 900000
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false
          }
        }
      })
    ]
  },
};