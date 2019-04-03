const path = require('path');
const webpack = require('webpack');

const baseConfig = {
  mode: 'production',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
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
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    libraryExport: 'default',
    library: 'vyapti__parser',
    globalObject: 'this',
  },
};

const nodeConfig = {
  ...baseConfig,
  target: 'node',
  entry: {
    'index': './src/index.ts',
  },
  node: {
    fs: true,
  }
};

const webConfig = {
  ...baseConfig,
  target: 'web',
  entry: {
    'index.umd': './src/index.ts',
  },
  node: {
    fs: 'empty',
  },
};

module.exports = [nodeConfig, webConfig];
