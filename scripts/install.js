const fs = require('fs');
const readline = require('readline');
const path = require('path');
const webpack = require('webpack');
const { spawnSync } = require('child_process');
const sqlite3 = require('sqlite3');



/* -------------------------------------------------- */
// START COMPILE
/* -------------------------------------------------- */

console.clear();
console.log('\u001b[1;36m' + '** COMPILE SAITO **' + '\x1b[0m');

userInput(
	'\nPLEASE SELECT COMPILE TYPE [TYPE NUMBER AND PRESS ENTER] \n1. Initial (New Install)\n2. Nuke (Destroy Old Install and re-build)\n3. Recompile Build\n4. Cancel\n'
).then(function (res) {
	switch (res) {
	case '1':
		init();
		break;

	case '2':
		nuke();
		break;

	case '3':
		recompile();
		break;

	default:
		console.log(res);
	}
});

/* -------------------------------------------------- */
// INITIATE
/* -------------------------------------------------- */

function init() {
	if (fs.existsSync('../config/modules.config.js') == true) {
		console.clear();
		console.log(
			'\u001b[1;36m' + '** 1. INITIAL SAITO COMPILE **' + '\x1b[0m'
		);
		console.log(
			'It looks like you have already installed Saito. If you are '
		);
		console.log('trying to change the modules that are installed on your ');
		console.log('machine you can edit the file: ');
		console.log('');
		console.log('  ../config/modules.config.js');
		console.log('');
		console.log('and then re-run this compiler [node compile-node]');
		console.log('selecting option 3. Recompile ');
		console.log('');
		console.log('');
		console.log(
			'Continuing with this installation will delete existing data,'
		);
		console.log(
			'reset your wallet and resync the blockchain. Are you sure '
		);

		userInput('Do you wish to continue? (yes/no)').then(function (res) {
			if (res.toUpperCase() == 'Y' || res.toUpperCase() == 'YES') {
				fs.copyFileSync(
					'../config/modules.default.js',
					'../config/modules.config.js'
				);
			}

			init2();
		});
	} else {
		console.log('');
		console.log('Installing and compiling Saito with default modules...');
		console.log('');
		fs.copyFileSync(
			'config/modules.default.js',
			'config/modules.config.js'
		);

		init2();
	}
}

function init2() {
	if (fs.existsSync('../config/saito.io.conf') == true) {
		console.log('');
		console.log(
			'You can join the Saito Network and participate in development'
		);
		console.log(
			'of the public chain. Or you can setup a local node for the'
		);
		console.log('easier development and testing of applications.');
		console.log('');
		console.log('');
		console.log('Type the number of your selection and press Enter...');
		userInput(
			'\n1. Join Saito.io (saito)\n2. Local Install (Local)\n'
		).then(function (res) {
			if (res == '1') {
				fs.copyFileSync('../config/saito.io.conf', '../config/options');
			}
			nuke();
		});
	} else {
		nuke();
	}
}

/* -------------------------------------------------- */
// NUKE
/* -------------------------------------------------- */

function nuke() {
	console.clear();
	console.log(' ');
	console.log('  ');
	console.log('     _.-^^---....,,--        ');
	console.log(' _--                  --_    ');
	console.log(' <                        >) ');
	console.log(' | _                     _ | ');
	console.log('     \'\'\'--. . , ; .--\'\'\'     ');
	console.log('          | |   |            ');
	console.log('          | |   |            ');
	console.log('       \x1b[33m.-=\x1b[0m||  | |\x1b[33m=-.         ');
	console.log('        -=#$%&%$/=-\'\x1b[0m         ');
	console.log('          | ;  :|            ');
	console.log('          | |   |            ');
	console.log('    \x1b[33m.,-#%&|/#@%$|%#&#~,\x1b[0m          ');
	console.log('  -------------------------  ');
	console.log(
		'  \x1b[33mNUKING YOUR \x1b[31mSAITO \x1b[33mINSTALL\x1b[0m   '
	);
	console.log('  -------------------------  ');
	console.log('  (resetting configuration)  ');

	removeDir('built');

	console.log('\x1b[33m');
	console.log('Please Wait....');
	console.log('Compiling Typescript');

	if (process.platform === 'win32') {
		var cmd = 'npx.cmd';
	} else {
		var cmd = 'npx';
	}
	const tsc = spawnSync(cmd, ['tsc']);
	console.log('\x1b[32mCOMPLETE');
	console.log('\x1b[0m');

	reset_nonpersistent();
	reset_persistent();
	reset_bundler();

	console.log('\x1b[33m');
	console.log('Please Wait....');
	console.log('Bundling Webpack');

	webPack();
	// Webpack calls final compile
}

/* -------------------------------------------------- */
// RECOMPILE
/* -------------------------------------------------- */

function recompile() {
	console.log('');
	console.log('  -------------------------  ');
	console.log('   RE-COMPILING JAVASCRIPT   ');
	console.log('  -------------------------  ');
	console.log('  (resetting configuration)  ');
	console.log('');
	console.log('');

	if (!fs.existsSync('./config/modules.config.js')) {
		copyDir('./config/modules.default.js', './config/modules.config.js');
	}

	reset_bundler();

	webpack();
}

/* -------------------------------------------------- */
// POST COMPILE
/* -------------------------------------------------- */
function post_compile() {
	fs.copyFileSync('../lib/saito/boot.js', '../web/saito/saito2.js');

	var s1 = fs.readFileSync('../web/saito/saito.js');
	var s2 = fs.readFileSync('../web/saito/saito2.js');
	fs.writeFile('../web/saito/saito.js', s2 + s1, function (err) {
		if (err) {
			console.log('Concat failed: ' + err);
			return;
		}
		removeDir('../web/saito/saito2.js');

		console.log('Finished');
		console.log('');
		console.log('To get started run');
		console.log('npm run dev');
	});
}

/* -------------------------------------------------- */
// WEBPACK
/* -------------------------------------------------- */
// *** To do: Move this to a seperate module
// -------------------------------------------------- //

function webPack() {
	var entrypoint = './bundler/default/apps/lite/index.timestamp';
	var outputfile = 'saito.js';

	console.log(__dirname);

	webpack(
		{
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
				{ os: 'os' },
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
			// Path to your entry point. From this file Webpack will begin his work
			entry: ['babel-polyfill', path.resolve(__dirname, entrypoint)],
			output: {
				path: path.resolve(__dirname, './web/saito'),
				filename: outputfile
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
						exclude: /(node_modules)/
					},
					// All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
					{
						test: /\.(js|jsx)$/, 
						use: [
							'source-map-loader',
							{
								loader: 'babel-loader',
								options: {
									// configFile: path.resolve(__dirname, './build/babel.config.js'),           
									root: path.resolve(__dirname, './build'),
									rootMode: "upward",
									presets: ["@babel/preset-env", "@babel/preset-react"],
									sourceMaps: false,
									cacheCompression: false,
									cacheDirectory: true,
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
					// wasm files should not be processed but just be emitted and we want
					// to have their public URL.
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
							path.resolve(__dirname, './mods/devtools/bundler'),
							path.resolve(__dirname, './mods/devtools/mods')
						]
					},
					{ 
						test: /\.m?js/, 
						resolve: { 
							fullySpecified: false 
						} 
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
	);
}

/* -------------------------------------------------- */
// RESETS
/* -------------------------------------------------- */

function reset_nonpersistent() {
	createDir('../data/blocks');

	removeDir('../web/saito/saito.js');
	removeDir('../data/devtools.sq3');
	removeDir('../data/hospital.sq3');
	removeDir('../data/records.sq3');
	removeDir('../data/archive.sq3');
	removeDir('../data/explorer.sq3');
	removeDir('../data/timeclock.sq3');
	removeDir('../data/earlybirds.sq3');
	removeDir('../data/arcade.sq3');
	removeDir('../data/chat.sq3');
	removeDir('../data/database.sq3');
	removeDir('../data/bank.sq3');
	removeDir('../data/escrow.sq3');

	removeDir('../data/log.txt');

	//removeDir('data/*.sq3-journal');
	//find ./data/blocks/ -name '*.sai' | xargs rm -r
	//removeDir('data/shashmaps/*.smap
	//removeDir('data/blocks/*.zip
	//removeDir('data/blocks/*.segadd
	//removeDir('data/tmp/*.sai
	//removeDir('data/tmp/*.zip

	removeDir('../config/options');

	removeDir('mods/devtools/mods');
	createDir('mods/devtools/mods');
	removeDir('mods/devtools/bundler/mods');
	createDir('mods/devtools/bundler/mods');
	removeDir('mods/devtools/bundler/dist');
	createDir('mods/devtools/bundler/dist');
	removeDir('logs');
	createDir('logs');

	//rm -f ./mods/forum/web/img/thumbnails/*.png
	removeDir('mods/registry/web/addresses.txt');
	//rm -f ./mods/devtools/bundler/*.js
	//rm -f ./mods/devtools/bundler/*.json

	if (fs.existsSync('data/rewards.sq3')) {
		const db = new sqlite3.Database('data/rewards.sq3');
		db.run('update users set latest_tx = -1;');
	}

	if (!fs.existsSync('../config/modules.config.js')) {
		copyDir('../config/modules.default.js', '../config/modules.config.js');
	}

	if (fs.existsSync('../config/options.conf')) {
		copyDir('../config/options.conf', '../config/options');
	}
}

function reset_persistent() {
	removeDir('../data/forum.sq3');
	removeDir('../data/post.sq3');
	removeDir('../data/registry.sq3');
	removeDir('../data/rewards.sq3');
	removeDir('../data/forum.sq3');
	removeDir('../data/tutorial.sq3');
	removeDir('../web/client.options');
	createDir('../data/blocks');
}

function reset_bundler() {
	console.log('Resetting Saito to Default Modules!');
	console.log('');

	removeDir('./bundler');

	createDir('./bundler');
	createDir('./bundler/default');
	createDir('./bundler/default/mods');
	createDir('./bundler/default/lib');
	createDir('./bundler/default/config');
	createDir('./bundler/default/apps');
	createDir('./data/blocks');

	copyDir('lib', './bundler/default/lib');

	copyDir('config', './bundler/default/config');
	copyDir('apps', './bundler/default/apps');

	copy_lite_mods_to_bundler_directory();

	console.log('');
	console.log('Compiling Lite-Client JS...');

	removeDir('../bundler/default/mods/devtools/bundler/dist');

	var dirRm = getDirectories('../bundler/default/mods');
	var rmDirArr = ['web', 'sql', 'www', 'src', 'docs', 'compile'];
	var rmFileArr = [
		'DESCRIPTION.txt',
		'BUGS.txt',
		'README.txt',
		'README.md',
		'install.sh',
		'license'
	];
	for (let i = 0; i < dirRm.length; i++) {
		for (let n = 0; n < rmDirArr.length; n++) {
			removeDir('../bundler/default/mods/' + dirRm[i] + '/' + rmDirArr[n]);
		}
		for (let n = 0; n < rmFileArr.length; n++) {
			removeDir('../bundler/default/mods/' + dirRm[i] + '/' + rmFileArr[n]);
		}
	}
}

function copy_lite_mods_to_bundler_directory() {
	var liteMods = require(path.resolve('./config/modules.config.js'));

	for (let i = 0; i < liteMods.lite.length; i++) {
		var mod = liteMods.lite[i];
		var modDir = liteMods.lite[i].split('/');

		console.log('installing mod for lite-client bundling: ' + modDir[0]);
		copyDir('./mods/' + modDir[0], './bundler/default/mods/' + modDir[0]);
	}
}

/* -------------------------------------------------- */
// SHARED
/* -------------------------------------------------- */

function getDirectories(dir) {
	return fs.readdirSync(dir).filter(function (file) {
		return fs.statSync(dir + '/' + file).isDirectory();
	});
}

function createDir(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
}

function removeDir(dir) {
	fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(source, destination) {
	fs.mkdirSync(destination, { recursive: true });

	fs.readdirSync(source, { withFileTypes: true }).forEach((entry) => {
		let sourcePath = path.join(source, entry.name);
		let destinationPath = path.join(destination, entry.name);

		entry.isDirectory()
			? copyDir(sourcePath, destinationPath)
			: fs.copyFileSync(sourcePath, destinationPath);
	});
}

function userInput(query) {
	const inp = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	return new Promise((resolve) =>
		inp.question(query, function (ans) {
			inp.close();
			resolve(ans);
		})
	);
}
