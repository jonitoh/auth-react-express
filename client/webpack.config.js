const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require('dotenv-webpack');
const path = require("path");

module.exports = env => { 
  console.error('config_path', env.config_path);
  return {
    entry: "./src/index.tsx",
    mode: "development",
    devServer: {
      port: 3000,
      open: true,
      hot: true
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "public/index.html",
        hash: true,
        filename: '../dist/index.html'
      }),
      new Dotenv({
        path: `${env.config_path}`,
      })
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.js$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      alias: {
        "@components": path.resolve(__dirname, "src/components"),
      },
      extensions: [".tsx", ".ts", ".js", ".json"],
    }
  }
};
