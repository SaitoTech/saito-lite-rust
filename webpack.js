const path = require("path");
const webpack = require("webpack");

let [entry_path, output_path, output_filename] = process.argv.slice(2);



console.log(entry_path);
console.log(output_path);
console.log(output_filename);

// const __dirname = path.resolve();
let devtool = undefined;
devtool = "eval";

entrypoint = entry_path;
outputfile = output_filename;
let outputpath = output_path;

webpack({
  optimization: {
    minimize: true,
  },
  target: "web",
  devServer: {
    static: `./${output_path}`,
   hot: true,
  },

  // node: {
  //     fs: "empty",
  // },
  externals: [
    {
      archiver: "archiver"
    },
    {
      "stun": "stun"
    },
    {
      child_process: "child_process"
    },
    {
      nodemailer: "nodemailer"
    },
    {
      jimp: "jimp"
    },
    {
      "image-resolve": "image-resolver"
    },
    {
      sqlite: "sqlite"
    },
    {
      unzipper: "unzipper"
    },
    {
      webpack: "webpack"
    },
    // /^(image-resolver|\$)$/i,
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
  // Path to your entry point. From this file Webpack will begin his work
  entry: ["babel-polyfill", path.resolve(__dirname, entrypoint)],
  output: {
    path: outputpath,
    filename: outputfile
//    path: path.resolve(__dirname, "./../web/saito"),
//    filename: outputfile
  },
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    //extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
    fallback: {
      "fs": false,
      "tls": false,
      "net": false,
      "path": require.resolve("path-browserify"),
      "zlib": false,
      "http": false,
      "https": false,
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer"),
      "crypto": require.resolve("crypto-browserify"),
      "crypto-browserify": require.resolve("crypto-browserify")
    }
  },
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /(node_modules)/
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        test: /\.js$/,
        use: [
          "source-map-loader",
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
              sourceMaps: true
            }
          }
        ],
        exclude: /(node_modules)/
      },
      {
        test: /\.mjs$/,
        exclude: /(node_modules)/,
        type: "javascript/auto"
      },
      {
        test: /html$/,
        exclude: [/(mods)/, /(email)/]
      },
      // {
      //     test: /\.js$/,
      //     exclude: /(node_modules)/,
      //     use: {
      //         loader: 'babel-loader',
      //         options: {
      //             presets: ['@babel/preset-env'],
      //             sourceMaps:true
      //         }
      //     }
      // },
      // Emscripten JS files define a global. With `exports-loader` we can
      // load these files correctly (provided the global’s name is the same
      // as the file name).
      {
        test: /quirc\.js$/,
        loader: "exports-loader"
      },
      // wasm files should not be processed but just be emitted and we want
      // to have their public URL.
      {
        test: /quirc\.wasm$/,
        type: "javascript/auto",
        loader: "file-loader",
        options: {
          publicPath: "dist/"
        }
      },
      {
        test: /\.wasm$/,
        type: "asset/inline",
      },
      {
        test: /\.zip$/,
        exclude: [
          path.resolve(__dirname, "../mods/appstore/bundler"),
          path.resolve(__dirname, "../mods/appstore/mods")
        ]
      }
    ]
  },
  plugins: [
    // Work around for Buffer is undefined:
    // https://github.com/webpack/changelog-v5/issues/10
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"]
    }),
    new webpack.ProvidePlugin({
      process: "process/browser"
    })
    // new CircularDependencyPlugin({
    //     // exclude detection of files based on a RegExp
    //     exclude: /a\.js|node_modules/,
    //     // include specific files based on a RegExp
    //     include: /lib/,
    //     // add errors to webpack instead of warnings
    //     failOnError: false,
    //     // allow import cycles that include an asyncronous import,
    //     // e.g. via import(/* webpackMode: "weak" */ './file.js')
    //     allowAsyncCycles: false,
    //     // set the current working directory for displaying module paths
    //     cwd: process.cwd(),
    // })
  ],
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true
  },
  mode: "production",
  devtool: devtool

}, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.log(err);
    if (stats) {
      let info = stats.toJson();
      console.log(info.errors);
    }
  }
  //
  // Done processing
  //
  console.log("Bundle Success!");
});


