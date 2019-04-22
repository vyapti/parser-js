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
    'index.node': './src/node.ts',
  },
  node: {
    fs: true,
    stream: true,
  },
};

const webConfig = {
  ...baseConfig,
  target: 'web',
  entry: {
    'index.web': './src/web.ts',
  },
};

module.exports = [nodeConfig, webConfig];
