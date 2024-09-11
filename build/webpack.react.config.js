const path = require('path');
const webpack = require('webpack');
const glob = require('glob')

const entries = glob.sync('./mods/**/react-components/index.js').reduce((acc, file) => {
  const modName = file.split(path.sep)[1]; 


  // Assign the entry
  acc[modName] = `./${file}`
  return acc;
}, {});

console.log(entries);


module.exports = {
  optimization: {
    minimize: true
  },
  target: 'web',
  externals: [
    { archiver: 'archiver' },
    { stun: 'stun' },
    { child_process: 'child_process' },
    { nodemailer: 'nodemailer' },
    { jimp: 'jimp' },
    { 'image-resolve': 'image-resolver' },
    { sqlite: 'sqlite' },
    { unzipper: 'unzipper' },
    { webpack: 'webpack' },
    /\.txt/,
    /\.png$/,
    /\.jpg$/,
    /\.html$/,
    /\.css$/,
    /\.sql$/,
    /\.md$/,
    /\.pdf$/,
    /\.sh$/,
    /\.zip$/,
    /\/web\//,
    /\/www\//
  ],

  entry: entries,
  output: {
    filename: '[name]/web/react-bundle/react-bundle.js', 
    path: path.resolve(__dirname, '../mods'), 
  },
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    //extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
    fallback: {
      fs: false,
      tls: false,
      net: false,
      path: require.resolve('path-browserify'),
      zlib: false,
      http: false,
      https: false,
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
      crypto: require.resolve('crypto-browserify'),
      'crypto-browserify': require.resolve('crypto-browserify'),
      stun: require.resolve('stun')
    }
  },
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /(node_modules)/,
        options: {
          configFile: path.resolve(__dirname, './tsconfig.json'), 
        }
      },
      
      {
        test: /\.js$/,
        use: [
          'source-map-loader',
          {
            loader: 'babel-loader',
            options: {
              presets: ["@babel/preset-env", '@babel/preset-react'],
            },

          }
        ],
        exclude: /(node_modules)/
      },
      {
        test: /\.mjs$/,
        exclude: /(node_modules)/,
        type: 'javascript/auto'
      },
      {
        test: /html$/,
        exclude: [/(mods)/, /(email)/]
      },
      {
        test: /quirc\.js$/,
        loader: 'exports-loader'
      },
      {
        test: /quirc\.wasm$/,
        type: 'javascript/auto',
        loader: 'file-loader',
        options: {
          publicPath: 'dist/'
        }
      },
      {
        test: /\.wasm$/,
        type: 'asset/inline'
      },
      {
        test: /\.zip$/,
        exclude: [
          path.resolve(__dirname, './mods/appstore/bundler'),
          path.resolve(__dirname, './mods/appstore/mods')
        ]
      }
    ]
  },
  plugins: [
    // Work around for Buffer is undefined:
    // https://github.com/webpack/changelog-v5/issues/10
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser'
    })
  ],
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true
  },
  mode: 'production',
  devtool: undefined
},
  (err, stats) => {
    if (err || stats.hasErrors()) {
      console.log(err);
      if (stats) {
        let info = stats.toJson();
        console.log(info.errors);
      }
    } else {
      //
      // Done processing
      //

      console.log('Bundle Success!');
      post_compile();
    }
  }