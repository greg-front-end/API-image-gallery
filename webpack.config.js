const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'development',
  entry: './index.js',
  output: {
    filename: 'index.bundle.js',
  },
  plugins: [
    new Dotenv()
  ]
};