const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

const webpack = require("webpack");

let minimize = true;
let devtool = undefined;
let entrypoint = "../bundler/default/apps/lite/index.ts";
let outputfile = "saito.js";
if (process.argv.includes("dev")) {
  console.log("dev mode source not minified");
  minimize = false;
  devtool = "eval";
}
if (process.argv.includes("web3")) {
  //TODO: build a separate saito.js for web3
  entrypoint = "../bundler/default/apps/lite/web3index.ts";
  outputfile = "web3saito.js";
}
webpack(
  {
    cache: {
      type: "filesystem",
    },
    optimization: {
      //set the appropriate value for minimisation
      // dev => false, prod => true
      minimize: minimize,
      minimizer: [
        new TerserPlugin({
          parallel: true,
        }),
      ],
      splitChunks: {
        chunks: "async",
        minSize: 20000,
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    },
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
    entry: ["babel-polyfill", path.resolve(__dirname, entrypoint)],
    output: {
      path: path.resolve(__dirname, "./../web/saito"),
      filename: outputfile,
    },
    resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      //extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
      extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ],
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
    experiments: {
      asyncWebAssembly: true,
      syncWebAssembly: true,
      topLevelAwait: true
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
            },
            
        }],
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
                root: path.resolve(__dirname, './build'),
                rootMode: "upward",
                presets: ["@babel/preset-env", "@babel/preset-react"],
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
        // {
        //   test: /quirc\.wasm$/,
        //   type: "javascript/auto",
        //   loader: "file-loader",
        //   options: {
        //     publicPath: "dist/",
        //   },
        // },
        {
          test: /\.wasm$/,
           type: "asset/resource",
           generator: {
             filename: 'static/zkey/[name][hash][ext]'
           }
        },
        {
          test: /\.zkey$/,
          type: "asset/resource",
          generator: {
            filename: 'static/zkey/[name][hash][ext]'
          }
        },
      
        {
          test: /\.ptau$/,
          type: "asset/resource",
          generator: {
            filename: 'static/zkey/[name][hash][ext]'
          }
        },
        {
          test: /\.circom$/,
          type: "asset/resource",
          generator: {
            filename: 'static/zkey/[name][hash][ext]'
          }
        },
     
        {
          test: /\.zip$/,
          exclude: [
            path.resolve(__dirname, "../mods/devtools/bundler"),
            path.resolve(__dirname, "../mods/devtools/mods"),
          ],
        },
        { 
          test: /\.m?js/, 
          resolve: { 
            fullySpecified: false 
          } 
        }
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
