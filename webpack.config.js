const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  target: 'web',
  mode: 'production',
  entry: {
    'index': './src/web.ts',
    'index.min': './src/web.ts',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new webpack.ProgressPlugin(),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
        include: /\.min\.js$/,
      }),
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'web'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'VyaptiParser',
    umdNamedDefine: true,
  },
};

