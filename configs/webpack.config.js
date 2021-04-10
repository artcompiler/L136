const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
module.exports = () => {
  return {
    entry: {
      lexicon: './src/lexicon.js',
      viewer: './src/viewer.jsx',
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, './../dist'),
    },
    mode: 'development',
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: [{
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  "targets": "defaults"
                }],
                '@babel/preset-react'
              ]
            }
          }],
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.json$/,
          loader: 'json-loader'
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin({ cleanStaleWebpackAssets: true }),
    ],
    resolve: {
      fallback: {
        "https": require.resolve("https-browserify"),
        "https": require.resolve("stream-http"),
      }
    }
  };
};
