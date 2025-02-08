const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
// const saitoJs = require('saito-js');

const webpack = require("webpack");

let minimize = false;
let devtool = undefined;
// let entrypoint = "./../bundler/default/mods/debug/debug.js";
//let entrypoint = "./../mods/twilight/twilight.js";
let entrypoint = "./../mods/settlers/settlers.js";
//let entrypoint = "./../mods/tmp_mod/solitrio.js";
let outputfile = "dyn.module.js";


if (process.argv.indexOf("entrypoint")) {
  let app_path = ((process.argv[2]).split("--entrypoint="))[1];
  console.log('app_path:', app_path);
  entrypoint = `./../tmp_mod/${app_path}`;
}

console.log('entrypoint:',entrypoint);

webpack(
  {
    optimization: {
      //set the appropriate value for minimisation
      // dev => false, prod => true
      minimize: minimize,
      minimizer: [
        new TerserPlugin({
          parallel: true,
        }),
      ],
    },
    target: "web",
    // node: {
    //     fs: "empty",
    // },
    externalsType:'global',
    // externalsPresets:{
    //   web:true
    // },
    externals:{
      "saito-js":"saito-js",
      "saito-js/lib/transaction":"saito-js/lib/transaction",
      "saito-js/lib":"saito-js/lib",
      "saito-js/lib/slip":"saito-js/lib/slip",
      "saito-js/lib/block":"saito-js/lib/block",
    },
    // Path to your entry point. From this file Webpack will begin his work
    entry: [path.resolve(__dirname, entrypoint)],
    output: {
      path: path.resolve(__dirname, "./../build/dyn/web"),
      filename: outputfile,
      library:{
        name:'Dyn',
        type:'window'
      }
    },
    resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      //extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
      extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js",".template.js"],
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
        // "saito-js":false,
        // "saito-wasm":require.resolve("saito-wasm"),
      },
    },
    module: {
      rules: [
        // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
        {
          test: /\.tsx?$/,
          exclude: /(node_modules)/,
          use: [{
            loader: 'ts-loader',
            options: {
                configFile:path.resolve(__dirname, "../build/tsconfig.json")
            }
          }]
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
          exclude: /(node_modules)/,
        },
        {
          test: /\.mjs$/,
          exclude: /(node_modules)/,
          // type: "javascript/auto",
          use: [
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
        },
        {
          test: /html$/,
          exclude: [/(mods)/, /(email)/],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          // use: [{
          //   loader: 'file-loader',
          //   options: {}
          // }],
          type: "asset/inline"
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
      // syncWebAssembly: true,
      outputModule:true,
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