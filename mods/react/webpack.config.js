const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',  // Entry point for React
  output: {
    path: path.resolve(__dirname, 'react/react-bundle'),  // Output to react-bundle folder
    filename: 'react-bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,  // Transpile JS/JSX
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  resolve: {
    fallback: {
      "path": require.resolve("path-browserify"),  // Polyfill for `path`
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',  // HTML template
      filename: 'index.html',  // Output HTML file
    }),
  ],
  mode: 'development',
  devServer: {
    contentBase: path.join(__dirname, 'react/react-bundle'),  // Serve content from bundle folder
    port: 9000,
  },
};
