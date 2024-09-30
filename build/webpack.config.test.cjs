const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

const webpack = require("webpack");

let minimize = false;
let devtool = undefined;
let entrypoint = "./../bundler/default/mods/dyn/dyn.js";
let outputfile = "dyn.module.js";

webpack(
  {
    // optimization: {
    //   //set the appropriate value for minimisation
    //   // dev => false, prod => true
    //   minimize: minimize,
    //   minimizer: [
    //     new TerserPlugin({
    //       parallel: true,
    //     }),
    //   ],
    //
    // },
    target: "web",
    // node: {
    //     fs: "empty",
    // },
    externals: [
      {
        archiver: "archiver",
      },
      {
        child_process: "child_process",
      },
      {
        nodemailer: "nodemailer",
      },
      {
        jimp: "jimp",
      },
      {
        "image-resolve": "image-resolver",
      },
      {
        sqlite: "sqlite",
      },
      {
        unzipper: "unzipper",
      },
      {
        webpack: "webpack",
      },
      {
        "node-turn": "node-turn",
      },
      // /^(image-resolver|\$)$/i,
      /\.txt /,
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
      /\/www\//,
    ],
    // Path to your entry point. From this file Webpack will begin his work
    entry: [path.resolve(__dirname, entrypoint)],
    output: {
      path: path.resolve(__dirname, "./../web/saito/dyn"),
      filename: outputfile,
      library:{
        name:'Dyn',
        type:'window'
      }
    },
    resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      //extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
      extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
      fallback: {
        fs: false,
        tls: false,
        net: false,
        path: require.resolve("path-browserify"),
        zlib: false,
        http: false,
        https: false,
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
        crypto: require.resolve("crypto-browserify"),
        "crypto-browserify": require.resolve("crypto-browserify"),
      },
    },
    module: {
      rules: [
        // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          exclude: /(node_modules)/,
          // exclude: [
          //   {
          //     and: [path.resolve(__dirname,"node_modules")],
          //     // TODO : remove ts loadup entirely
          //     // not: [path.resolve(__dirname,"node_modules/saito-js")]
          //   }
          // ],
          // resolve: {
          //   fullySpecified:false
          // }
          // options:{
          //   allowTsInNodeModules: true
          // }
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
                sourceMaps: false,
                cacheCompression: false,
                cacheDirectory: true,
              },
            },
          ],
          // exclude: /(node_modules)/,
          // resolve: {
          //   fullySpecified:false
          // }
        },
        {
          test: /\.mjs$/,
          exclude: /(node_modules)/,
          type: "javascript/auto",
          // resolve: {
          //   fullySpecified:false
          // }
        },
        {
          test: /html$/,
          exclude: [/(mods)/, /(email)/],
        },
        {
          test: /quirc\.js$/,
          loader: "exports-loader",
        },
        // wasm files should not be processed but just be emitted and we want
        // to have their public URL.
        {
          test: /quirc\.wasm$/,
          type: "javascript/auto",
          loader: "file-loader",
          options: {
            publicPath: "dist/",
          },
        },
        // {
        //   test: /\.wasm$/,
        //   type: "webassembly/async",
        //   loader:'file-loader'
        // },
        {
          test: /\.zip$/,
          exclude: [
            path.resolve(__dirname, "../mods/devtools/bundler"),
            path.resolve(__dirname, "../mods/devtools/mods"),
          ],
        },
      ],
    },
    plugins: [
      // Work around for Buffer is undefined:
      // https://github.com/webpack/changelog-v5/issues/10
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
      new webpack.ProvidePlugin({
        process: "process/browser",
      }),
    ],
    experiments: {
      asyncWebAssembly: true,
      // syncWebAssembly: true
    },
    mode: "production",
    devtool: devtool,
  },
  (err, stats) => {
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
  }
);
