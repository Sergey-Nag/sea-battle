const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (_, {mode})=> ({
  entry: './src/entry.ts',
  mode: 'development',
  devtool: mode === 'development' && 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.svg$/,
        type: "asset/inline",
        // Inline assets with the "inline" query parameter.
        resourceQuery: /inline/,
      }
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/html/index.html',
    })
  ],
  watch: mode === 'development'
});