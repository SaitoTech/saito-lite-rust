const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const SaitoCamera = require('../../lib/saito/ui/saito-camera/saito-camera');
const SaitoMain = require('./lib/main');
const SaitoMenu = require('./lib/menu');
const RedSquareSidebar = require('./lib/sidebar');
const Tweet = require('./lib/tweet');
const fetch = require('node-fetch');
const HTMLParser = require('node-html-parser');
const prettify = require('html-prettify');
const redsquareHome = require('./index');
const Post = require('./lib/post');
const Transaction = require('../../lib/saito/transaction').default;
const PeerService = require('saito-js/lib/peer_service').default;

/*
 * lib/main.js:    this.app.connection.on("redsquare-home-render-request", () => {      // renders main tweets
 * lib/main.js:    this.app.connection.on("redsquare-tweet-render-request", (tweet) => {   // renders tweet onto page, at bottom
 * lib/main.js:    this.app.connection.on("redsquare-profile-render-request", () => {     // renders profile
 * lib/main.js:    this.app.connection.on("redsquare-notifications-render-request", () => {   // renders notifications
 * lib/main.js:    this.app.connection.on("redsquare-component-render-request", (obj) => {    // renders other modules into .saito-main
 */

////////////////////////////////////////////
//
// RedSquare is now entirely dependent on Archive for TX storage
// This may create some lingering issues because having a dedicated DB
// allowed us to surface important information. For reference, the original
// schema is:
/*

  tweets (
    id      INTEGER,
    tx      TEXT,
    sig       VARCHAR(99),
    publickey     VARCHAR(99),
    thread_id     VARCHAR(99),
    parent_id     VARCHAR(99),
    `text`    TEXT,
    link      TEXT,
    link_properties TEXT,
    type      INTEGER,
    processed   INTEGER,
    flagged     INTEGER,
    moderated     INTEGER,
    has_images      INTEGER,
    tx_size   INTEGER,
    num_likes     INTEGER,
    num_retweets    INTEGER,
    num_replies     INTEGER,
    created_at    INTEGER,
    updated_at    INTEGER,
    UNIQUE    (id),
    UNIQUE    (sig),
    PRIMARY KEY     (id ASC)
  );
*/

class RedSquare extends ModTemplate {
	constructor(app) {
		super(app);
		this.appname = 'Red Square';
		this.name = 'RedSquare';
		this.slug = 'redsquare';
		this.description = 'Open Source Twitter-clone for the Saito Network';
		this.categories = 'Social Entertainment';
		this.icon_fa = 'fas fa-square-full';

		this.publicKey = '';

		this.debug = false;

		this.tweets = [];
		this.tweets_sigs_hmap = {};
		this.unknown_children = [];

		this.peers = [];

		this.tweet_count = 0;
		this.liked_tweets = [];
		this.retweeted_tweets = [];
		this.replied_tweets = [];

		this.notifications = [];
		this.notifications_sigs_hmap = {};

		//
		// set by main
		//
		this.manager = '';

		this.possibleHome = 1;

		//
		// is this a notification?
		//
		this.notifications_earliest_ts = new Date().getTime();
		this.notifications_last_viewed_ts = 0;
		this.notifications_number_unviewed = 0;

		this.tweets_latest_ts = 0;
		this.tweets_earliest_ts = new Date().getTime();

		this.allowed_upload_types = ['image/png', 'image/jpg', 'image/jpeg'];

		this.postScripts = ['/saito/lib/emoji-picker/emoji-picker.js'];

		this.styles = ['/saito/saito.css', '/redsquare/style.css'];

		this.social = {
			twitter_card: 'summary',
			twitter_site: '@SaitoOfficial',
			twitter_creator: '@SaitoOfficial',
			twitter_title: '🟥 Saito Red Square',
			twitter_url: 'https://saito.io/redsquare/',
			twitter_description: 'Saito RedSquare - Web3 Social.',
			twitter_image:
				'https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png',
			og_title: '🟥 Saito Red Square',
			og_url: 'https://saito.io/redsquare',
			og_type: 'website',
			og_description: 'Peer to peer social and more',
			og_site_name: '🟥 Saito Red Square',
			og_image:
				'https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png',
			og_image_url:
				'https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png',
			og_image_secure_url:
				'https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png'
		};

		this.theme_options = {
			lite: 'fa-solid fa-sun',
			dark: 'fa-solid fa-moon',
			sangre: 'fa-solid fa-droplet'
		};

		return this;
	}

	returnServices() {
		let services = [];
		services.push(
			new PeerService(null, 'redsquare', 'RedSquare Tweet Archive')
		);
		return services;
	}

	/////////////////////////////////
	// inter-module communications //
	/////////////////////////////////
	respondTo(type = '', obj) {
		let this_mod = this;
		if (type === 'user-menu') {
			return {
				text: `View ${
					obj?.publicKey && obj.publicKey === this.publicKey
						? 'My '
						: ''
				}Profile`,
				icon: 'fa fa-user',
				callback: function (app, publicKey) {
					if (
						app.modules.returnActiveModule().returnName() ==
						'Red Square'
					) {
						app.connection.emit(
							'redsquare-profile-render-request',
							publicKey
						);
						window.history.pushState(
							{},
							document.title,
							'/' + this_mod.slug + `/?user_id=${publicKey}`
						);
					} else {
						window.location = `/redsquare/?user_id=${publicKey}`;
					}
				}
			};
		}
		if (type === 'saito-header') {
			let x = [];
			if (!this.browser_active) {
				x.push({
					text: 'RedSquare',
					icon: 'fa-solid fa-square',
					rank: 20,
					callback: function (app, id) {
						window.location = '/redsquare';
					}
				});
			}

			if (
				(this.app.browser.isMobileBrowser() ||
					window.innerWidth < 600) &&
				this.browser_active
			) {
				x.push({
					text: 'RedSquare Home',
					icon: 'fa-solid fa-house',
					rank: 21,
					callback: function (app, id) {
						document.querySelector('.redsquare-menu-home').click();
					}
				});
				x.push({
					text: 'Notifications',
					icon: 'fas fa-bell',
					rank: 23,
					callback: function (app, id) {
						document
							.querySelector('.redsquare-menu-notifications')
							.click();
					},
					event: function (id) {
						this_mod.app.connection.on(
							'redsquare-update-notification-hamburger',
							(unread) => {
								let elem = document.getElementById(id);
								//console.log("Redsquare notifications event, update", elem);
								if (elem) {
									if (unread) {
										if (
											elem.querySelector(
												'.saito-notification-dot'
											)
										) {
											elem.querySelector(
												'.saito-notification-dot'
											).innerHTML = unread;
										} else {
											this_mod.app.browser.addElementToId(
												`<div class="saito-notification-dot">${unread}</div>`,
												id
											);
										}
									} else {
										if (
											elem.querySelector(
												'.saito-notification-dot'
											)
										) {
											elem.querySelector(
												'.saito-notification-dot'
											).remove();
										}
									}
								}
							}
						);
					}
				});
				x.push({
					text: 'Profile',
					icon: 'fas fa-user',
					rank: 26,
					callback: function (app, id) {
						document
							.querySelector('.redsquare-menu-profile')
							.click();
					}
				});
			}

			/*x.push({
        text: "Camera",
        icon: "fas fa-camera",
        rank: 27,
        callback: function (app, id) {
          let camera = new SaitoCamera(app, this_mod);
          camera.render();
        }
      });
      */
			return x;
		}

		if (type === 'saito-floating-menu') {
			let x = [];
			x.push({
				text: 'Tweet',
				icon: 'fa-solid fa-pen',
				allowed_mods: ['redsquare'],
				disallowed_mods: ['arcade'],
				rank: 10,
				callback: function (app, id) {
					let post = new Post(app, this_mod);
					post.render();
				}
			});

			x.push({
				text: 'Tweet Camera',
				icon: 'fas fa-camera',
				allowed_mods: ['redsquare'],
				disallowed_mods: ['arcade'],
				rank: 20,
				callback: function (app, id) {
					let post = new Post(app, this_mod);
					let camera = new SaitoCamera(app, this_mod, (img) => {
						post.render();
						post.addImg(img);
					});
					camera.render();
				}
			});

			x.push({
				text: 'Tweet Image',
				icon: 'fas fa-image',
				allowed_mods: ['redsquare'],
				disallowed_mods: ['arcade'],
				rank: 30,
				callback: function (app, id) {
					let post = new Post(app, this_mod);
					post.render();
					post.triggerClick('#hidden_file_element_tweet-overlay');
				}
			});
			return x;
		}

		if (type == 'game-menu') {
			this.attachStyleSheets();
			super.render(this.app, this);
			return {
				id: 'game-social',
				text: 'Social',
				submenus: [
					{
						parent: 'game-social',
						text: 'Tweet',
						id: 'game-tweet',
						class: 'game-tweet',
						callback: function (app, game_mod) {
							game_mod.menu.hideSubMenus();
							let post = new Post(app, this_mod);
							post.render();
						}
					}
				]
			};
		}

		return null;
	}

	////////////////////
	// initialization //
	////////////////////
	//
	// this function runs whenever the browser or application is loaded. note that
	// at this point we probably do not have any network connections to any peers
	// so most of the work is pre-network init.
	//
	async initialize(app) {
		//
		// database setup etc.
		//
		await super.initialize(app);

		this.publicKey = await app.wallet.getPublicKey();

		//
		// fetch content from options file
		//
		this.loadOptions();

		if (app.BROWSER == 0) {
			// We don't need to do anything here ...
			// We used to update the tweets cache
			// The service node doesn't keep any tweets in memory,
			// but it may be a good idea in the future to do a quick load of the 10 most recent tweets here
			// And have the service node process the addTweet function (with a lot of pruning), to keep the most
			// recent tweets in memory, ready to serve up on a page load request...
		} else {
			//Add myself as a peer...
			this.addPeer('localhost');

			//
			// New browser fetch from server cache
			//
			if (this.browser_active) {
				if (this.tweet_count == 0) {
					try {
						//Prefer our locally cached tweets to the webServer ones
						if (window?.tweets?.length > 0) {
							console.log(
								'REDSQUARE: Using Server Cached Tweets'
							);
							for (let z = 0; z < window.tweets.length; z++) {
								//console.log(window.tweets[z]);
								let newtx = new Transaction();
								newtx.deserialize_from_web(
									this.app,
									window.tweets[z]
								);
								//console.log(newtx);
								this.addTweet(newtx, 'server_cache');
							}
						}
					} catch (err) {
						console.log(
							'error in initial redsquare post fetch: ' + err
						);
					}
					this.tweet_count = 1;
					this.saveOptions();
				} else {
					console.log(
						'REDSQUARE: Ignoring Server Cached Tweets for My Local Archive'
					);
				}
			}
		}

		// check tweets in pending txs
		try {
			let user_id = this.app.browser.returnURLParameter('user_id');
			let tweet_id = this.app.browser.returnURLParameter('tweet_id');
			if (!tweet_id || !user_id) {
				let pending = await app.wallet.getPendingTxs();
				for (let i = 0; i < pending.length; i++) {
					let tx = pending[i];
					let txmsg = tx.returnMessage();
					if (txmsg && txmsg.module == this.name) {
						if (txmsg.request === 'create tweet') {
							//this.addNotification(tx);
							this.addTweet(tx, 'pending_tx');
						}
					}
				}
			}
		} catch (err) {
			console.error('Error while checking pending txs: ');
			console.error(err);
		}

		//
		// Add auto-polling for new tweets, on a 5 minute interval
		// 1000 * 60 * 5

		if (this.browser_active) {
			setInterval(() => {
				this.loadTweets('later', (tx_count) => {
					this.app.connection.emit(
						'redsquare-home-postcache-render-request',
						tx_count
					);
				});
			}, 300000);
		}
	}

	////////////
	// render //
	////////////
	//
	// browsers run this to render the page. this also runs before the network is
	// likely functional, so it focuses on writing the components to the screen rather
	// that fetching content.
	//
	// content is loaded from the local cache, and then the "loading new tweets" indicator
	// is enabled, and when onPeerServiceUp() triggers we run a postcache-render-request
	// to update the page if it is in a state where that is permitted.
	//
	async render() {
		//
		// browsers only!
		//
		if (!this.app.BROWSER) {
			return;
		}
		new Date().getTime();
		//
		// default to dark mode
		//
		if (this.app.options.theme) {
			let theme = this.app.options.theme[this.slug];
			if (theme != null) {
				this.app.browser.switchTheme(theme);
			}
		}

		//
		// create and render components
		//
		if (this.main == null) {
			this.main = new SaitoMain(this.app, this);
			this.header = new SaitoHeader(this.app, this);
			await this.header.initialize(this.app);
			this.menu = new SaitoMenu(this.app, this, '.saito-sidebar.left');
			this.sidebar = new RedSquareSidebar(
				this.app,
				this,
				'.saito-sidebar.right'
			);
			this.manager = this.main.manager;

			this.addComponent(this.header);
			this.addComponent(this.main);
			this.addComponent(this.menu);
			this.addComponent(this.sidebar);

			//
			// chat manager can insert itself into left-sidebar if exists
			//
			for (const mod of this.app.modules.returnModulesRespondingTo(
				'chat-manager'
			)) {
				let cm = mod.respondTo('chat-manager');
				cm.container = '.saito-sidebar.left';
				cm.render_manager_to_screen = 1;
				this.addComponent(cm);
			}
		}

		await super.render();
		this.rendered = true;

		this.loadLocalTweets();
	}

	/////////////////////
	// peer management //
	/////////////////////
	addPeer(peer) {
		//For "localhost"
		let publicKey = peer?.publicKey || this.publicKey;

		let peer_idx = -1;

		for (let i = 0; i < this.peers.length; i++) {
			if (this.peers[i].publicKey === publicKey) {
				peer_idx = i;
			}
		}
		if (peer_idx == -1) {
			this.peers.push({
				peer: peer,
				publicKey: publicKey,
				tweets_earliest_ts: new Date().getTime(),
				tweets_latest_ts: 0,
				tweets_limit: 30
			});
		} else {
			this.peers[peer_idx].peer = peer;
		}
	}

	////////////////////////
	// when peer connects //
	////////////////////////
	async onPeerServiceUp(app, peer, service = {}) {
		//
		// avoid network overhead if in other apps
		//
		if (!this.browser_active) {
			return;
		}

		//
		// redsquare -- load tweets
		//
		if (service.service === 'archive') {
			//
			// or fetch tweets (load tweets "earlier")
			//
			this.addPeer(peer, 'tweets');

			//
			// if viewing a specific tweet
			//
			let tweet_id = this.app.browser.returnURLParameter('tweet_id');
			if (tweet_id) {
				console.log('REDSQUARE: Load tweet on onPeerServiceUp');
				this.loadTweetWithSig(tweet_id, (txs) => {
					for (let z = 0; z < txs.length; z++) {
						this.addTweet(txs[z], 'url_sig');
					}
					let tweet = this.returnTweet(tweet_id);
					this.app.connection.emit(
						'redsquare-tweet-render-request',
						tweet
					);
				});

				return;
			}

			//
			// render user profile
			//
			let user_id = this.app.browser.returnURLParameter('user_id');
			if (user_id != '') {
				this.app.connection.emit(
					'redsquare-profile-render-request',
					user_id
				);
				return;
			}

			// check url hash
			let hash = window.location.hash;
			if (hash) {
				switch (hash) {
				case '#notifications':
					this.app.connection.emit(
						'redsquare-notifications-render-request'
					);
					break;
				case '#profile':
					this.app.connection.emit(
						'redsquare-profile-render-request'
					);
					break;
				default:
					break;
				}
			}

			this.app.connection.emit('redsquare-insert-loading-message');
			this.loadTweets('later', (tx_count) => {
				// Add code here

				for (let i = 0; i < this.peers.length; i++) {
					if (this.peers[i].publicKey !== this.publicKey) {
						if (
							this.peers[i].tweets_earliest_ts >
							this.tweets_latest_ts
						) {
							console.log(
								'RS: WARNING -- there is a time gap from what was fetched'
							);
						}
					}
				}
				this.app.connection.emit(
					'redsquare-home-postcache-render-request',
					tx_count
				);
			});
		}
	}

	///////////////////////
	// network functions //
	///////////////////////
	async onConfirmation(blk, tx, conf) {
		//try {
		let txmsg = tx.returnMessage();

		if (conf == 0) {
			if (this.debug) {
				console.log('%%');
				console.log('NEW TRANSACTION RECEIVED!');
				if (txmsg.data.images) {
					let new_obj = JSON.parse(JSON.stringify(txmsg));
					new_obj.data.images = '[image tweet]';
					console.log('txmsg: ' + JSON.stringify(new_obj));
				} else {
					console.log('txmsg: ' + JSON.stringify(txmsg));
				}
			}

			if (txmsg.request === 'delete tweet') {
				await this.receiveDeleteTransaction(blk, tx, conf, this.app);
			}
			if (txmsg.request === 'edit tweet') {
				await this.receiveEditTransaction(blk, tx, conf, this.app);
			}
			if (txmsg.request === 'create tweet') {
				await this.receiveTweetTransaction(blk, tx, conf, this.app);
			}
			if (txmsg.request === 'like tweet') {
				await this.receiveLikeTransaction(blk, tx, conf, this.app);
			}
			if (txmsg.request === 'flag tweet') {
				await this.receiveFlagTransaction(blk, tx, conf, this.app);
			}
			if (txmsg.request === 'retweet') {
				await this.receiveRetweetTransaction(blk, tx, conf, this.app);
			}
		}
		//} catch (err) {
		//  console.log("ERROR in RedSquare onConfirmation: " + err);
		//}
	}

	///////////////////////////////
	// content loading functions //
	///////////////////////////////
	//
	// there are three major functions that are called to fetch more content:
	//
	// - loadProfile()
	// - loadTweets()
	// - loadNotifications()
	//
	// these will trigger calls to all of the peers that have been added and
	// fetch more content from all of them up until there is no more content
	// to fetch and display. this content will be fetched and returned in the
	// form of transactions that can be fed to addTweets() or displayed
	// via the manager.
	//

	loadTweets(created_at = 'earlier', mycallback) {
		//Count peers
		let peer_count = 0;
		//
		// Instead of just passing the txs to the callback, we count how many of these txs
		// are new to us so we can have a better UX
		//
		let count = 0;

		for (let i = 0; i < this.peers.length; i++) {
			if (
				!(
					this.peers[i].tweets_earliest_ts == 0 &&
					created_at == 'earlier'
				) &&
				!(
					created_at == 'later' &&
					this.peers[i].publicKey == this.publicKey &&
					this.peers[i].tweets_latest_ts > 0
				)
			) {
				peer_count++;
			}
		}

		//console.log(`REDSQUARE: load ${created_at} tweets with num peers: ${peer_count}`);

		for (let i = 0; i < this.peers.length; i++) {
			//
			// We have two stop conditions,
			// 1) when our peer has been tapped out on earlier (older) tweets, we stop querying them.
			// 2) if we are our own peer, don't look for later (newer) tweets
			// the second should keep the "loading" message flashing longer
			// though this is a hack and we will need to fix once we are loading from multiple remote peers
			// it is just a bit of a pain because we have triply nested callbacks...
			//

			if (
				!(
					this.peers[i].tweets_earliest_ts == 0 &&
					created_at == 'earlier'
				) &&
				!(
					created_at == 'later' &&
					this.peers[i].publicKey == this.publicKey &&
					this.peers[i].tweets_latest_ts > 0
				)
			) {
				let obj = {
					field1: 'RedSquare',
					flagged: 0,
					//tx_size_less_than: 1330000,
					limit: this.peers[i].tweets_limit
				};

				if (created_at == 'earlier') {
					obj.updated_earlier_than = this.peers[i].tweets_earliest_ts;
				} else if (created_at == 'later') {
					//
					// For "new" tweets we maybe want to look at updated, not created
					// this should allow us to pull fresh stats for tweets that aren't
					// otherwise directed at us
					//
					obj.updated_later_than = this.peers[i].tweets_latest_ts;
				} else {
					console.error('Unsupported time restraint in rS');
				}

				this.app.storage.loadTransactions(
					obj,
					(txs) => {
						peer_count--;

						if (txs.length > 0) {
							for (let z = 0; z < txs.length; z++) {
								txs[z].decryptMessage(this.app);

								if (
									txs[z].updated_at <
									this.peers[i].tweets_earliest_ts
								) {
									this.peers[i].tweets_earliest_ts =
										txs[z].updated_at;
								}
								if (
									txs[z].updated_at >
									this.peers[i].tweets_latest_ts
								) {
									this.peers[i].tweets_latest_ts =
										txs[z].updated_at;
								}

								this.addNotification(txs[z]);

								// (---------  false  --------- )
								// only add if this is a new tweet, it might be an
								// old tweet, or one of the tweets that we have sent
								// out onto the chain and then are now re-fetching
								// but have already added -- no need for the load new
								// tweet buttons in that case!
								//

								// RE: addTweet returns 0 if it isn't a "new" tweet
								// but the tweet may have been updated by other people interaction
								// with it so we want to process it in addTweet to get the new
								// number of likes/replies/retweets updated
								//
								// Trust me, this won't accidentally trigger the "load new tweets"
								// button!!!
								count += this.addTweet(
									txs[z],
									`${this.peers[i].publicKey}_${created_at}`
								);

								let tweet = this.returnTweet(txs[z].signature);

								if (tweet) {
									//
									// Update our local archive with any updated metadata
									//
									if (
										this.peers[i].publicKey !=
										this.publicKey
									) {
										//
										// Only cache top level tweets!!!!
										//
										if (!tweet.parent_id) {
											this.saveTweet(txs[z].signature, 0);
										}
									}
								} else {
									// console.warn("How did we not add the tweet????");
									// console.log(txs[z]);
									// There are several legitimate ways that a received "Tweet Tx" is not a tweet tx
									// delete is saved as a RedSquare field1 by the server to make sure that people pull the
									// delete command and scrub it from their local storage
								}
							}
						} else {
							if (created_at === 'earlier') {
								this.peers[i].tweets_earliest_ts = 0;
							}
						}

						console.log(
							`REDSQUARE-${i} (${
								this.peers[i].publicKey
							}): returned ${
								txs.length
							} ${created_at} tweets, ${count} are new to the feed. New earliest timestamp -- ${new Date(
								this.peers[i].tweets_earliest_ts
							)}`
						);

						// execute callback when all txs are fetched from all peers
						if (peer_count == 0 && mycallback) {
							mycallback(count);
						}
					},
					this.peers[i].peer
				);
			}
		}
	}

	//
	// We have two types of notifications that are slightly differently indexed, so
	// we are doing some fancy work to load all the transactions into one big list and then
	// process it at once. We are only looking at local archive storage because browsers should
	// be saving the txs that are addressed to them (i.e. notifications), but we can easily expand this
	// logic to also query remote sources (by changing return_count to the 2x number of peers)
	//
	loadNotifications(mycallback = null) {
		let notifications = [];
		let return_count = 2;

		const middle_callback = () => {
			let new_notifications = [];
			if (notifications.length > 0) {
				for (let z = 0; z < notifications.length; z++) {
					notifications[z].decryptMessage(this.app);

					if (this.addNotification(notifications[z])) {
						new_notifications.push(notifications[z]);
					}

					if (
						notifications[z].timestamp <
						this.notifications_earliest_ts
					) {
						this.notifications_earliest_ts =
							notifications[z].timestamp;
					}
				}
			} else {
				this.notifications_earliest_ts = 0;
			}

			if (mycallback) {
				mycallback(new_notifications);
			}
		};

		if (this.notifications_earliest_ts !== 0) {
			this.app.storage.loadTransactions(
				{
					field1: 'RedSquare',
					field3: this.publicKey,
					created_earlier_than: this.notifications_earliest_ts
				},
				(txs) => {
					for (let tx of txs) {
						notifications.push(tx);
					}
					return_count--;
					if (return_count == 0) {
						middle_callback();
					}
				},
				'localhost'
			);

			//
			// Okay, so using a special like tag to make profile loading easier
			// complicates notifications loading... it would be nice if our arbitrary
			// archive fields weren't completely occupied by module/from/to...
			// This will need fixing if/when we change the archive schema (13 Nov 2023)
			//
			this.app.storage.loadTransactions(
				{
					field1: 'RedSquareLike',
					field3: this.publicKey,
					created_earlier_than: this.notifications_earliest_ts
				},
				(txs) => {
					for (let tx of txs) {
						notifications.push(tx);
					}
					return_count--;
					if (return_count == 0) {
						middle_callback();
					}
				},
				'localhost'
			);
		} else {
			//
			// Just return empty array if we don't query the peers again
			//
			if (mycallback) {
				mycallback([]);
			}
		}
	}

	loadTweetThread(thread_id, mycallback = null) {
		if (!mycallback) {
			return;
		}

		for (let i = 0; i < this.peers.length; i++) {
			let obj = {
				field1: 'RedSquare',
				field3: thread_id
			};

			this.app.storage.loadTransactions(
				obj,
				(txs) => {
					if (txs.length > 0) {
						for (let z = 0; z < txs.length; z++) {
							txs[z].decryptMessage(this.app);
							this.addNotification(txs[z]);
							this.addTweet(txs[z], 'tweet_thread');
						}
					}

					if (mycallback) {
						mycallback(txs);
					}
				},
				this.peers[i].peer
			);
		}
	}

	//
	// Prioritize looking for the specific tweet
	// 1) in my tweet list
	// 2) in my local archive
	// 3) in my peer archives
	//  It would be useful if we could convert everything to async and have a return value
	//  so that we can avoid callback hell when we really want to get that tweet to process something on it
	//
	loadTweetWithSig(sig, mycallback = null) {
		let redsquare_self = this;

		if (mycallback == null) {
			return;
		}

		let t = this.returnTweet(sig);

		if (t != null) {
			mycallback([t.tx]);
			return;
		}

		this.app.storage.loadTransactions(
			{ sig, field1: 'RedSquare' },
			(txs) => {
				if (txs.length > 0) {
					for (let z = 0; z < txs.length; z++) {
						txs[z].decryptMessage(this.app);
						this.addTweet(txs[z], 'loadTweetSig_local');
					}
					mycallback(txs);
				} else {
					for (let i = 0; i < this.peers.length; i++) {
						if (this.peers[i].publicKey !== this.publicKey) {
							this.app.storage.loadTransactions(
								{ sig, field1: 'RedSquare' },
								(txs) => {
									if (txs.length > 0) {
										for (let z = 0; z < txs.length; z++) {
											txs[z].decryptMessage(this.app);
											this.addTweet(
												txs[z],
												'loadTweetSig_peer'
											);
										}
										mycallback(txs);
									}
								},
								this.peers[i].peer
							);
						}
					}
				}
			},
			'localhost'
		);
	}

	///////////////
	// add tweet //
	///////////////
	//
	// this creates the tweet and adds it to the internal list that we maintain of
	// the tweets that holds them in a structured tree (parents hold children, etc.)
	// while also maintaining a separate list of the notifications, etc. this function
	// also indexes the tweets as needed in the various hashmaps so they can be
	// retrieved by returnTweet()
	//
	// this does not DISPLAY any tweets, although it makes sure that when they are
	// added they will render into the TWEET MANAGER component.
	//
	// returns 1 if this is a new tweet that can be displayed
	//
	addTweet(tx, source) {
		//
		// if this is a like or flag tx, it isn't anything to add to the feed so stop here
		//
		let txmsg = tx.returnMessage();
		if (
			txmsg.request === 'like tweet' ||
			txmsg.request === 'flag tweet' ||
			txmsg.request === 'retweet'
		) {
			return 0;
		}

		if (txmsg.request === 'delete tweet' && this.app.BROWSER) {
			this.receiveDeleteTransaction(0, tx, 0, this.app);
			return 0;
		}

		//
		// create the tweet
		//
		let tweet = new Tweet(this.app, this, tx, '.tweet-manager');
		tweet.data_source = source;

		//
		// avoid errors
		//
		if (!tweet?.tx) {
			return 0;
		}

		if (this.tweets_sigs_hmap[tweet.tx.signature]) {
			//
			// Update the stats for this tweet we already have in memory
			//
			let t = this.returnTweet(tweet.tx.signature);
			if (!t) {
				console.warn(
					'REDSQUARE: Tweet indexed in hash, but not in memory'
				);
				console.log(tweet);
				return 0;
			}

			t.data_renewal = source;

			if (tweet.tx.optional) {
				let should_rerender = false;

				if (tweet.tx.optional.num_replies > t.tx.optional.num_replies) {
					t.tx.optional.num_replies = tweet.tx.optional.num_replies;
				}
				if (
					tweet.tx.optional.num_retweets > t.tx.optional.num_retweets
				) {
					t.tx.optional.num_retweets = tweet.tx.optional.num_retweets;
					t.tx.optional.retweeters = tweet.tx.optional.retweeters;
					should_rerender = true;
				}
				if (tweet.tx.optional.num_likes > t.tx.optional.num_likes) {
					t.tx.optional.num_likes = tweet.tx.optional.num_likes;
				}
				if (tweet.tx.optional.update_tx) {
					t.tx.optional.update_tx = tweet.tx.optional.update_tx;
					tweet.render();
				}
				if (tweet.tx.optional.link_properties) {
					t.tx.optional.link_properties =
						tweet.tx.optional.link_properties;
					tweet.render();
				}

				t.rerenderControls(should_rerender);
			}

			return 0;
		}

		//
		// this is a post
		//
		if (!tweet.tx.optional.parent_id) {
			//
			// check where we insert the tweet
			//
			let insertion_index = 0;
			for (let i = 0; i < this.tweets.length; i++) {
				if (this.tweets[i].updated_at > tweet.updated_at) {
					insertion_index++;
				} else {
					break;
				}
			}

			//
			// Insert tweet into feed
			//
			this.tweets.splice(insertion_index, 0, tweet);
			this.tweets_sigs_hmap[tweet.tx.signature] = 1;

			//
			// Check if this new tweet is the parent of any unknown children (reply tweets)
			//
			for (let i = 0; i < this.unknown_children.length; i++) {
				if (
					this.unknown_children[i].tx.optional.thread_id ===
					tweet.tx.signature
				) {
					tweet.addTweet(this.unknown_children[i]);
					this.unknown_children.splice(i, 1);
					i--;
				}
			}

			return 1; // We have a new (top-level) tweet in the feed
		} else {
			//
			// this is a comment / reply
			//

			for (let i = 0; i < this.tweets.length; i++) {
				if (
					this.tweets[i].tx.signature === tweet.tx.optional.thread_id
				) {
					this.tweets[i].addTweet(tweet);
					this.tweets_sigs_hmap[tweet.tx.signature] = 1;
					return 0;
				}
			}

			//
			// I wonder if maybe we should just add these to the feed as if they were original posts...
			//

			//console.log("RS: pushed onto unknown children: ", tweet.text);
			this.unknown_children.push(tweet);
			this.tweets_sigs_hmap[tweet.tx.signature] = 1;

			return 0;
		}
	}

	//
	// addTweets adds notifications, but we have a separate function here
	// for cached notifications, because we don't want to show all of the
	// cached notifications in the main thread automatically, and we want a
	// dedicated function that tells us if this notification is new or not
	//
	addNotification(tx) {
		if (tx.isTo(this.publicKey)) {
			if (!tx.isFrom(this.publicKey)) {
				//
				// only insert notification if doesn't already exist
				//
				if (this.notifications_sigs_hmap[tx.signature] != 1) {
					//
					// Turn TX into a "Tweet" and insert into notification array
					//
					let tweet = new Tweet(this.app, this, tx, '.tweet-manager');

					if (!tweet?.tx) {
						return 0;
					}

					let insertion_index = 0;

					for (let i = 0; i < this.notifications.length; i++) {
						if (
							tweet.updated_at > this.notifications[i].updated_at
						) {
							insertion_index = i;
							break;
						}
					}

					this.notifications.splice(insertion_index, 0, tweet);
					this.notifications_sigs_hmap[tweet.tx.signature] = 1;

					if (tx.timestamp > this.notifications_last_viewed_ts) {
						this.notifications_number_unviewed =
							this.notifications_number_unviewed + 1;
						this.menu.incrementNotifications(
							'notifications',
							this.notifications_number_unviewed
						);
					}

					return 1;
				}
			}
		}

		return 0;
	}

	returnTweet(tweet_sig = null) {
		if (tweet_sig == null) {
			return null;
		}

		if (!this.tweets_sigs_hmap[tweet_sig]) {
			return null;
		}

		for (let i = 0; i < this.tweets.length; i++) {
			if (this.tweets[i].tx.signature === tweet_sig) {
				return this.tweets[i];
			}
			if (this.tweets[i].hasChildTweet(tweet_sig)) {
				return this.tweets[i].returnChildTweet(tweet_sig);
			}
		}

		for (let j = 0; j < this.unknown_children.length; j++) {
			if (this.unknown_children[j].tx.signature === tweet_sig) {
				return this.unknown_children[j];
			}
		}

		return null;
	}

	removeTweet(tweet_sig = null) {
		if (!tweet_sig || !this.tweets_sigs_hmap[tweet_sig]) {
			return;
		}

		this.tweets_sigs_hmap[tweet_sig] = 0;

		for (let i = 0; i < this.tweets.length; i++) {
			if (this.tweets[i].tx.signature === tweet_sig) {
				this.tweets[i].remove();
				this.tweets.splice(i, 1);
				return;
			}

			if (this.tweets[i].hasChildTweet(tweet_sig)) {
				this.tweets[i].removeChildTweet(tweet_sig);
				return;
			}
		}

		for (let j = 0; j < this.unknown_children.length; j++) {
			if (this.unknown_children[j].tx.signature === tweet_sig) {
				this.unknown_children.splice(j, 1);
				return;
			}
		}
	}

	returnNotification(tweet_sig = null) {
		if (tweet_sig == null) {
			return null;
		}

		if (!this.notifications_sigs_hmap[tweet_sig]) {
			return null;
		}

		for (let i = 0; i < this.notifications.length; i++) {
			if (this.notifications[i].tx.signature === tweet_sig) {
				return this.notifications[i];
			}
		}

		return null;
	}

	returnThreadSigs(root_id, child_id) {
		let sigs = [];
		let tweet = this.returnTweet(child_id);
		if (!tweet) {
			return [root_id];
		}
		let parent_id = tweet.parent_id;

		sigs.push(child_id);
		while (parent_id != '' && parent_id != root_id) {
			let x = this.returnTweet(parent_id);
			if (!x) {
				parent_id = root_id;
			} else {
				if (x.parent_id != '') {
					sigs.push(parent_id);
					parent_id = x.parent_id;
				} else {
					parent_id = root_id;
				}
			}
		}
		if (child_id != root_id) {
			sigs.push(root_id);
		}
		return sigs;
	}

	///////////////////////
	// network functions //
	///////////////////////

	async sendLikeTransaction(app, mod, data, tx) {
		let redsquare_self = this;

		let obj = {
			module: redsquare_self.name,
			request: 'like tweet',
			data: {}
		};
		for (let key in data) {
			obj.data[key] = data[key];
		}

		let newtx = await redsquare_self.app.wallet.createUnsignedTransaction(
			tx.from[0]?.publicKey
		);

		//
		// All tweets include the sender in the to, but add the from first so they are in first position
		//
		for (let i = 0; i < tx.to.length; i++) {
			if (tx.to[i].publicKey !== this.publicKey) {
				newtx.addTo(tx.to[i].publicKey);
			}
		}

		newtx.msg = obj;
		await newtx.sign();
		await redsquare_self.app.network.propagateTransaction(newtx);

		return newtx;
	}

	async receiveLikeTransaction(blk, tx, conf, app) {
		let txmsg = tx.returnMessage();

		let liked_tweet = this.returnTweet(txmsg.data.signature);

		//
		// save optional likes
		//

		if (liked_tweet?.tx) {
			if (!liked_tweet.tx.optional) {
				liked_tweet.tx.optional = {};
			}

			if (!liked_tweet.tx.optional.num_likes) {
				liked_tweet.tx.optional.num_likes = 0;
			}

			if (tx.timestamp > liked_tweet.updated_at) {
				liked_tweet.tx.optional.num_likes++;

				await this.app.storage.updateTransaction(
					liked_tweet.tx,
					{},
					'localhost'
				);

				liked_tweet.rerenderControls();
			}
		} else {
			//
			// fetch original
			//
			// servers load from themselves
			//
			// servers update their TX.updated_at timestamps based on current_time, since they won't be
			// fetching the blockchain transiently afterwards while viewing tweets that have loaded from
			// others. this permits browsers to avoid double-liking tweets that show up with pre-calculated
			// likes, as those will also have pre-updated updated_at values.
			//
			// this isn't an ironclad way of avoiding browsers saving likes 2x, but last_updated is not a
			// consensus variable and if they're loading tweets from server-archives uncritically it is a
			// sensible set of defaults.
			//
			await this.app.storage.loadTransactions(
				{ sig: txmsg.data.signature, field1: 'RedSquare' },
				async (txs) => {
					if (txs?.length > 0) {
						let tx = txs[0];

						if (!tx.optional) {
							tx.optional = {};
						}
						if (!tx.optional.num_likes) {
							tx.optional.num_likes = 0;
						}
						tx.optional.num_likes++;

						await this.app.storage.updateTransaction(
							tx,
							{},
							'localhost'
						);
					}
				},
				'localhost'
			);
		}

		//
		// browsers
		//
		if (app.BROWSER == 1) {
			this.addNotification(tx);
		}

		//
		// Save locally -- indexed to myKey so it is accessible as a notification
		//
		// I'm not sure we really want to save these like this... but it may work out for profile views...
		//
		await this.app.storage.saveTransaction(
			tx,
			{ field1: 'RedSquareLike' },
			'localhost'
		);

		//console.log(`RS Save like from: ${tx.from[0].publicKey} to ${tx.to[0].publicKey}`);

		return;
	}

	async sendRetweetTransaction(app, mod, data, tx) {
		let redsquare_self = this;

		let obj = {
			module: redsquare_self.name,
			request: 'retweet',
			data: {}
		};
		for (let key in data) {
			obj.data[key] = data[key];
		}

		let newtx = await redsquare_self.app.wallet.createUnsignedTransaction(
			tx.from[0]?.publicKey
		);

		//
		// All tweets include the sender in the to, but add the from first so they are in first position
		//
		for (let i = 0; i < tx.to.length; i++) {
			if (tx.to[i].publicKey !== this.publicKey) {
				newtx.addTo(tx.to[i].publicKey);
			}
		}

		newtx.msg = obj;
		await newtx.sign();
		await redsquare_self.app.network.propagateTransaction(newtx);

		return newtx;
	}

	async incrementRetweets(localTx, receivedTx) {
		if (!localTx.optional) {
			localTx.optional = {};
		}

		if (!localTx.optional.num_retweets) {
			localTx.optional.num_retweets = 0;
		}
		if (!localTx.optional.retweeters) {
			localTx.optional.retweeters = [];
		}

		if (receivedTx.timestamp > localTx.updated_at) {
			localTx.optional.num_retweets++;

			if (
				!localTx.optional.retweeters.includes(
					receivedTx.from[0].publicKey
				)
			) {
				localTx.optional.retweeters.unshift(
					receivedTx.from[0].publicKey
				);
			}

			await this.app.storage.updateTransaction(localTx, {}, 'localhost');
		} else {
			console.log('Retweet transaction received after tweet fetch');
		}
	}

	async receiveRetweetTransaction(blk, tx, conf, app) {
		let txmsg = tx.returnMessage();

		let retweeted_tweet = this.returnTweet(txmsg.data.signature);

		//
		// save optional likes
		//

		if (retweeted_tweet?.tx) {
			await this.incrementRetweets(retweeted_tweet.tx, tx);
			retweeted_tweet.rerenderControls();
			retweeted_tweet.render();
		} else {
			//
			// fetch original to update
			//
			await this.app.storage.loadTransactions(
				{ sig: txmsg.data.signature, field1: 'RedSquare' },
				async (txs) => {
					if (txs?.length > 0) {
						this.incrementRetweets(txs[0], tx);
					} else {
						console.log('Original tweet not found');
					}
				},
				'localhost'
			);
		}

		//
		// browsers
		//
		if (app.BROWSER == 1) {
			this.addNotification(tx);
		}

		return;
	}

	async sendEditTransaction(app, mod, data, keys = []) {
		let redsquare_self = this;

		let obj = {
			module: redsquare_self.name,
			request: 'edit tweet',
			data: {}
		};
		for (let key in data) {
			obj.data[key] = data[key];
		}

		let newtx = await redsquare_self.app.wallet.createUnsignedTransaction();
		newtx.msg = obj;

		for (let i = 0; i < keys.length; i++) {
			newtx.addTo(keys[i]);
		}

		await newtx.sign();
		await redsquare_self.app.network.propagateTransaction(newtx);

		return newtx;
	}

	async sendDeleteTransaction(app, mod, data, keys = []) {
		let redsquare_self = this;

		let obj = {
			module: redsquare_self.name,
			request: 'delete tweet',
			data: {}
		};
		for (let key in data) {
			obj.data[key] = data[key];
		}

		let newtx = await redsquare_self.app.wallet.createUnsignedTransaction();
		newtx.msg = obj;

		for (let i = 0; i < keys.length; i++) {
			newtx.addTo(keys[i]);
		}

		await newtx.sign();
		await redsquare_self.app.network.propagateTransaction(newtx);

		return newtx;
	}

	async sendTweetTransaction(app, mod, data, keys = []) {
		let redsquare_self = this;

		let obj = {
			module: redsquare_self.name,
			request: 'create tweet',
			data: {}
		};
		for (let key in data) {
			obj.data[key] = data[key];
		}

		let newtx = await redsquare_self.app.wallet.createUnsignedTransaction();
		newtx.msg = obj;

		for (let i = 0; i < keys.length; i++) {
			if (keys[i] !== this.publicKey) {
				newtx.addTo(keys[i]);
			}
		}

		await newtx.sign();
		await redsquare_self.app.network.propagateTransaction(newtx);

		return newtx;
	}

	async receiveEditTransaction(blk, tx, conf, app) {
		let txmsg = tx.returnMessage();

		if (!txmsg.data?.tweet_id) {
			return;
		}

		await this.app.storage.loadTransactions(
			{ sig: txmsg.data.tweet_id, field1: 'RedSquare' },
			async (txs) => {
				if (txs?.length) {
					console.log('about to receive edit tx 3');

					//
					// only update first copy??
					//
					let oldtx = txs[0];

					//
					// save the tx
					//
					console.log(
						'2 publickeys: ' +
							oldtx.from[0].publicKey +
							' -- ' +
							tx.from[0].publicKey
					);
					if (oldtx.from[0].publicKey === tx.from[0].publicKey) {
						if (!oldtx.optional) {
							oldtx.optional = {};
						}
						oldtx.optional.update_tx = tx.serialize_to_web(
							this.app
						);
						console.log('UPDATING OLD TRANSACTION with edit');
						await this.app.storage.updateTransaction(
							oldtx,
							{},
							'localhost'
						);
					}
				}
			},
			'localhost'
		);
	}

	//
	// We should remove the tweet in question from memory (if we have it)
	// remove it from the archives and update the archives of linked tweets so that the stats
	// decrement accordingly
	// To-do: implement live updating of reply/retweet counts (currently requires a refresh)
	//
	async receiveDeleteTransaction(blk, tx, conf, app) {
		console.log('REDSQUARE: receive delete transaction!');

		let txmsg = tx.returnMessage();

		if (!txmsg.data) {
			return;
		}
		if (!txmsg.data.tweet_id) {
			return;
		}

		this.removeTweet(txmsg.data.tweet_id);

		await this.app.storage.loadTransactions(
			{ sig: txmsg.data.tweet_id },
			async (txs) => {
				if (txs?.length) {
					//
					// only update first copy??
					//
					let oldtx = txs[0];

					//
					// save the tx
					//
					if (oldtx.from[0].publicKey === tx.from[0].publicKey) {
						await this.app.storage.deleteTransaction(
							oldtx,
							{},
							'localhost'
						);

						let tweet = new Tweet(this.app, this, oldtx, '');

						// Delete tweet is a reply
						if (tweet.tx.optional.parent_id) {
							await this.app.storage.loadTransactions(
								{
									sig: tweet.tx.optional.parent_id,
									field1: 'RedSquare'
								},
								async (txs) => {
									if (txs?.length) {
										if (txs[0]?.optional?.num_replies) {
											txs[0].optional.num_replies--;
											await this.app.storage.updateTransaction(
												txs[0],
												{},
												'localhost'
											);
										}
									}
								},
								'localhost'
							);
						}

						// Deleted tweet is a retweet
						if (tweet.retweet_tx) {
							await this.app.storage.loadTransactions(
								{
									sig: tweet.retweet.tx.signature,
									field1: 'RedSquare'
								},
								async (txs) => {
									if (txs?.length) {
										if (txs[0].optional?.num_retweets) {
											txs[0].optional.num_retweets--;
											await this.app.storage.updateTransaction(
												txs[0],
												{},
												'localhost'
											);
										}
									}
								},
								'localhost'
							);
						}
					}
				}
			},
			'localhost'
		);

		//Save the transaction with command to delete
		if (!app.BROWSER) {
			await this.app.storage.saveTransaction(
				tx,
				{ field1: 'RedSquare' },
				'localhost'
			);
		}
	}

	async receiveTweetTransaction(blk, tx, conf, app) {
		console.log('REDSQUARE: receive tweet transaction!');

		try {
			let tweet = new Tweet(app, this, tx, '.tweet-manager');
			let other_tweet = null;
			let txmsg = tx.returnMessage();

			//
			// browsers keep a list in memory of processed tweets
			//
			if (app.BROWSER == 1) {
				this.addNotification(tx);
				this.addTweet(tx, 'receiveTweet');
			}

			//
			// save this transaction in our archives as a redsquare transaction that is owned by ME (the server), so that I
			// can deliver it to users who want to fetch RedSquare transactions from the archives instead of just through the
			// sql database -- this is done by specifying that I -- "localhost" am the peer required.
			//

			//
			// this transaction is TO me, but I may not be the tx.to[0].publicKey address, and thus the archive
			// module may not index this transaction for me in a way that makes it very easy to fetch (field3 = MY_KEY}
			// thus we override the defaults by setting field3 explicitly to our publickey so that loading transactions
			// from archives by fetching on field3 will get this.
			//
			let opt = {
				field1: 'RedSquare', //defaults to module.name, but just to make sure we match the capitalization with our loadTweets
				preserve: 1
			};

			if (tx.isTo(this.publicKey)) {
				//
				// When a browser stores tweets, it is storing tweets it sent or were sent to it
				// this will help use with notifications (to) and profile (from)
				//
				opt['field3'] = this.publicKey;
			} else {
				//
				// When the service node stores tweets, it is for general look up. We will usually
				// search for all tweets or tweets within a thread, thus we want the thread_id indexed
				//
				opt['field3'] = tweet?.thread_id;
			}

			//
			// servers -- get open graph properties
			//

			tweet = await tweet.generateTweetProperties(app, this, 1);

			//
			// Save the modified tx so we have open graph properties available
			//
			await this.app.storage.saveTransaction(tweet.tx, opt, 'localhost');

			//
			// Includes retweeted tweet
			//
			if (tweet.retweet_tx != null) {
				other_tweet = this.returnTweet(tweet.signature);

				if (other_tweet) {
					if (!other_tweet.tx.optional) {
						other_tweet.tx.optional = {};
					}
					if (!other_tweet.tx.optional.num_retweets) {
						other_tweet.tx.optional.num_retweets = 0;
					}

					if (tx.timestamp > other_tweet.updated_at) {
						other_tweet.tx.optional.num_retweets++;
						console.log(
							'REDSQUARE: Increment retweets ',
							other_tweet.tx.optional.num_retweets
						);
						await this.app.storage.updateTransaction(
							other_tweet.tx,
							{},
							'localhost'
						);
						other_tweet.rerenderControls();
					} else {
						console.log('Nope out of retweet incrementing');
					}
				} else {
					//
					// fetch archived copy
					//
					// servers load from themselves
					//
					await this.app.storage.loadTransactions(
						{ sig: tweet.signature, field1: 'RedSquare' },
						async (txs) => {
							if (txs?.length) {
								//Only update the first copy??
								let archived_tx = txs[0];

								if (!archived_tx.optional) {
									archived_tx.optional = {};
								}
								if (!archived_tx.optional.num_retweets) {
									archived_tx.optional.num_retweets = 0;
								}
								archived_tx.optional.num_retweets++;
								await this.app.storage.updateTransaction(
									archived_tx,
									{},
									'localhost'
								);
							}
						},
						'localhost'
					);
				}
			}

			//
			// Is a reply
			//
			if (tweet.parent_id && tweet.parent_id !== tweet.tx.signature) {
				//
				// if we have the parent tweet in memory...
				//
				other_tweet = this.returnTweet(tweet.parent_id);

				if (other_tweet) {
					if (!other_tweet.tx.optional) {
						other_tweet.tx.optional = {};
					}
					if (!other_tweet.tx.optional.num_replies) {
						other_tweet.tx.optional.num_replies = 0;
					}

					if (tx.timestamp > other_tweet.updated_at) {
						other_tweet.tx.optional.num_replies++;
						console.log(
							'REDSQUARE: Increment replies ',
							other_tweet.tx.optional.num_replies
						);
						other_tweet.rerenderControls();

						await this.app.storage.updateTransaction(
							other_tweet.tx,
							{},
							'localhost'
						);
					} else {
						console.log('Nope out of reply count incrementing');
					}
				} else {
					//
					// ...otherwise, hit up the archive first
					//
					await this.app.storage.loadTransactions(
						{ sig: tweet.parent_id, field1: 'RedSquare' },
						async (txs) => {
							if (txs?.length) {
								let archived_tx = txs[0];
								if (!archived_tx.optional) {
									archived_tx.optional = {};
								}
								if (!archived_tx.optional.num_replies) {
									archived_tx.optional.num_replies = 0;
								}
								archived_tx.optional.num_replies++;
								await this.app.storage.updateTransaction(
									archived_tx,
									{},
									'localhost'
								);
							}
						},
						'localhost'
					);
				}
			}
		} catch (err) {
			console.log(
				'ERROR in receiveTweetsTransaction() in RedSquare: ' + err
			);
		}
	}

	//
	// How does this work with the archive module???
	//
	async sendFlagTransaction(app, mod, data, tx) {
		let redsquare_self = this;

		let obj = {
			module: redsquare_self.name,
			request: 'flag tweet',
			data: {}
		};

		//
		// data = {signature : tx.signature }
		//
		for (let key in data) {
			obj.data[key] = data[key];
		}

		let newtx = await redsquare_self.app.wallet.createUnsignedTransaction(
			tx.from[0].publicKey
		);

		newtx.msg = obj;
		await newtx.sign();
		await redsquare_self.app.network.propagateTransaction(newtx);

		return newtx;
	}

	//
	// We have a lot of work to do here....
	// ...an interface for users to delete their own tweets
	// ...an interface for moderators to review tweets
	//
	async receiveFlagTransaction(blk, tx, conf, app) {
		let txmsg = tx.returnMessage();

		let flagged_tweet = this.returnTweet(txmsg.data.signature);

		//
		// we will "soft delete" the tweet for the person who flagged it and in the central archives
		//
		if (tx.isFrom(this.publicKey) || app.BROWSER == 0) {
			if (flagged_tweet?.tx) {
				await this.app.storage.updateTransaction(
					flagged_tweet.tx,
					{ flagged: 1 },
					'localhost'
				);
			} else {
				await this.app.storage.loadTransactions(
					{ sig: txmsg.data.signature, field1: 'RedSquare' },
					async (txs) => {
						if (txs?.length > 0) {
							let tx = txs[0];
							await this.app.storage.updateTransaction(
								tx,
								{ flagged: 1 },
								'localhost'
							);
						}
					},
					'localhost'
				);
			}
		}

		//
		// let both users know that something happened
		//
		if (app.BROWSER == 1) {
			if (tx.isTo(this.publicKey)) {
				if (tx.isFrom(this.publicKey)) {
					siteMessage('Tweet successfully flagged for review', 3000);
				} else {
					siteMessage(
						'One of your tweets was flagged for review',
						10000
					);
				}
			}
		}

		return;
	}

	/////////////////////////////////////
	// saving and loading wallet state //
	/////////////////////////////////////
	saveTweet(sig, preserve = 1) {
		// When we interact with a tweet, we want to mark it as important to us and add it to our
		// local tweet cache .... maybe????

		let tweet = this.returnTweet(sig);

		if (!tweet) {
			console.warn('Want to save a tweet not in our memory');
			return;
		}

		this.app.storage.loadTransactions(
			{ field1: 'RedSquare', sig },
			(txs) => {
				if (txs?.length > 0) {
					if (preserve) {
						this.app.storage.updateTransaction(
							tweet.tx,
							{ preserve: 1 },
							'localhost'
						);
					}
				} else {
					this.app.storage.saveTransaction(
						tweet.tx,
						{
							field1: 'RedSquare',
							field3: tweet?.thread_id,
							preserve
						},
						'localhost'
					);
				}
			},
			'localhost'
		);
	}

	loadLocalTweets() {
		if (!this.app.BROWSER) {
			return;
		}

		if (this.app.browser.returnURLParameter('tweet_id')) {
			return;
		}
		if (this.app.browser.returnURLParameter('user_id')) {
			return;
		}

		this.app.storage.loadTransactions(
			{
				field1: 'RedSquare',
				flagged: 0,
				limit: 10,
				updated_later_than: 0
			},
			(txs) => {
				if (txs.length > 0) {
					for (let z = 0; z < txs.length; z++) {
						txs[z].decryptMessage(this.app);
						this.addNotification(txs[z]);
						this.addTweet(txs[z], 'local_cache');

						if (txs[z].updated_at > this.tweets_latest_ts) {
							this.tweets_latest_ts = txs[z].updated_at;
						}
					}
				}

				//Run these regardless of results
				this.app.connection.emit('redsquare-home-render-request');
				console.log(
					`${txs.length} tweets from local DB loaded, ${this.tweets.length}`
				);
			},
			'localhost'
		);
	}

	/////////////////////////////////////
	// saving and loading wallet state //
	/////////////////////////////////////
	loadOptions() {
		if (!this.app.BROWSER) {
			return;
		}

		if (this.app.options.redsquare) {
			this.notifications_last_viewed_ts =
				this.app.options.redsquare?.notifications_last_viewed_ts || 0;
			this.notifications_number_unviewed =
				this.app.options.redsquare?.notifications_number_unviewed || 0;
			this.tweet_count = this.app.options.redsquare?.tweet_count || 0;

			if (this.app.options.redsquare.liked_tweets) {
				this.liked_tweets = this.app.options.redsquare.liked_tweets;
			}
			if (this.app.options.redsquare.retweeted_tweets) {
				this.retweeted_tweets =
					this.app.options.redsquare.retweeted_tweets;
			}
			if (this.app.options.redsquare.replied_tweets) {
				this.replied_tweets = this.app.options.redsquare.replied_tweets;
			}
		} else {
			this.saveOptions();
		}
	}

	saveOptions() {
		if (!this.app.BROWSER || !this.browser_active) {
			return;
		}

		if (!this.app.options?.redsquare) {
			this.app.options.redsquare = {};
		}

		this.app.options.redsquare.notifications_last_viewed_ts =
			this.notifications_last_viewed_ts;
		this.app.options.redsquare.notifications_number_unviewed =
			this.notifications_number_unviewed;
		this.app.options.redsquare.tweet_count = this.tweet_count;

		if (this.debug) {
			console.log('Liked: ' + this.liked_tweets.length);
			console.log('Quote: ' + this.retweeted_tweets.length);
			console.log('Reply: ' + this.replied_tweets.length);
		}

		while (this.liked_tweets.length > 100) {
			this.liked_tweets.splice(0, 1);
		}
		while (this.retweeted_tweets.length > 100) {
			this.retweeted_tweets.splice(0, 1);
		}
		while (this.replied_tweets.length > 100) {
			this.replied_tweets.splice(0, 1);
		}

		this.app.options.redsquare.liked_tweets = this.liked_tweets;
		this.app.options.redsquare.retweeted_tweets = this.retweeted_tweets;
		this.app.options.redsquare.replied_tweets = this.replied_tweets;

		this.app.storage.saveOptions();
	}

	//////////////
	// remember //
	//////////////
	likeTweet(sig = '') {
		if (sig === '') {
			return;
		}
		if (!this.liked_tweets.includes(sig)) {
			this.liked_tweets.push(sig);
			this.saveTweet(sig);
		}
		this.saveOptions();
	}
	unlikeTweet(sig = '') {
		if (sig === '') {
			return;
		}
		if (this.liked_tweets.includes(sig)) {
			for (let i = 0; i < this.liked_tweets.length; i++) {
				if (this.liked_tweets[i] === sig) {
					this.liked_tweets.splice(i, 1);
					i--;
				}
			}
		}
		this.saveOptions();
	}
	retweetTweet(sig = '') {
		if (sig === '') {
			return;
		}
		if (!this.retweeted_tweets.includes(sig)) {
			this.retweeted_tweets.push(sig);
			this.saveTweet(sig);
		}
		this.saveOptions();
	}
	unretweetTweet(sig = '') {
		if (sig === '') {
			return;
		}
		if (this.retweeted_tweets.includes(sig)) {
			for (let i = 0; i < this.retweeted_tweets.length; i++) {
				if (this.retweeted_tweets[i] === sig) {
					this.retweeted_tweets.splice(i, 1);
					i--;
				}
			}
		}
		this.saveOptions();
	}
	replyTweet(sig = '') {
		if (sig === '') {
			return;
		}
		if (!this.replied_tweets.includes(sig)) {
			this.replied_tweets.push(sig);
			this.saveTweet(sig);
		}
		this.saveOptions();
	}
	unreplyTweet(sig = '') {
		if (sig === '') {
			return;
		}
		if (this.replied_tweets.includes(sig)) {
			for (let i = 0; i < this.replied_tweets.length; i++) {
				if (this.replied_tweets[i] === sig) {
					this.replied_tweets.splice(i, 1);
					i--;
				}
			}
		}
		this.saveOptions();
	}

	//
	// writes the latest 10 tweets to tweets.js
	// --- DEPRECATED
	async updateTweetsCacheForBrowsers() {
		if (this.app.BROWSER) {
			return;
		}

		this.app.storage.loadTransactions(
			{ field1: 'RedSquare' },
			(txs) => {
				if (txs.length > 0) {
					try {
						let path = this.app.storage.returnPath();
						if (!path) {
							return;
						}

						const filename = path.join(__dirname, 'web/tweets.');
						let fs = this.app.storage.returnFileSystem();
						let html = `if (!tweets) { var tweets = [] };`;
						if (fs != null) {
							for (let i = 0; i < txs.length; i++) {
								let thisfile = filename + i + '.js';
								const fd = fs.openSync(thisfile, 'w');
								//
								// the tweets might have been edited, so we check the optional field for any edited tx
								//
								if (txs[i].optional) {
									if (txs[i].optional.update_tx) {
										console.log(
											'TXS MSG: ' +
												JSON.stringify(txs[i].msg)
										);
									}
								}
								html += `  tweets.push(\`${txs[
									i
								].serialize_to_web(this.app)}\`);   `;
								fs.writeSync(fd, html);
								fs.fsyncSync(fd);
								fs.closeSync(fd);
								html = '';
							}
						}
					} catch (err) {
						console.error(
							'ERROR 2832329: error tweet cache to disk. ',
							err
						);
					}
				}
			},
			'localhost'
		);
	}

	//
	// Instead of writing 10 tweets.js files to the server FS, we will just dynamically load the 10 most recent tweets
	// every time we get a webServer request for /redsquare and input that content directly into the index.js template
	// This should save us a lot of file I/O and the extra network requests to download those 10 js scripts
	//
	// This may be (even) faster if we ditch the general storage/archive logic and just directly use SQL
	//
	async fetchRecentTweets() {
		if (this.app.BROWSER) {
			return;
		}

		let hex_values = [];

		return this.app.storage.loadTransactions(
			{
				field1: 'RedSquare',
				flagged: 0,
				tx_size_less_than: 1000000,
				limit: 8
			},
			(txs) => {
				for (let i = 0; i < txs.length; i++) {
					try {
						hex_values.push(txs[i].serialize_to_web(this.app));
					} catch (err) {
						console.log(err);
					}
				}

				return hex_values;
			},
			'localhost'
		);
	}

	///////////////
	// webserver //
	///////////////
	webServer(app, expressapp, express) {
		console.log('this is my home');
		let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
		let redsquare_self = this;

		expressapp.get(
			'/' + encodeURI(this.returnSlug()),
			async function (req, res) {
				let reqBaseURL = req.protocol + '://' + req.headers.host + '/';

				try {
					if (Object.keys(req.query).length > 0) {
						let query_params = req.query;

						let sig =
							query_params?.tweet_id || query_params?.thread_id;

						if (sig) {
							redsquare_self.loadTweetWithSig(sig, (txs) => {
								for (let z = 0; z < txs.length; z++) {
									let tx = txs[z];

									let txmsg = tx.returnMessage();
									let text = txmsg.data.text;
									let publicKey = tx.from[0].publicKey;
									let user =
										app.keychain.returnIdentifierByPublicKey(
											publicKey,
											true
										);

									//
									// We need adequate protection here
									//
									redsquare_self.social.twitter_description =
										app.browser.stripHtml(text);
									redsquare_self.social.og_description =
										app.browser.stripHtml(text);
									redsquare_self.social.og_url =
										reqBaseURL +
										encodeURI(redsquare_self.returnSlug());

									let image = (redsquare_self.social.og_url =
										reqBaseURL +
										encodeURI(redsquare_self.returnSlug()) +
										'?og_img_sig=' +
										sig);
									redsquare_self.social.og_title =
										user + ' posted on Saito 🟥';
									redsquare_self.social.twitter_title =
										user + ' posted on Saito 🟥';
									redsquare_self.social.og_image = image;
									redsquare_self.social.og_image_url = image;
									redsquare_self.social.og_image_secure_url =
										image;
									redsquare_self.social.twitter_image = image;
								}

								res.setHeader('Content-type', 'text/html');
								res.charset = 'UTF-8';
								res.send(
									redsquareHome(
										app,
										redsquare_self,
										app.build_number
									)
								);
							});

							return;
						}

						if (typeof query_params.og_img_sig != 'undefined') {
							console.info(query_params.og_img_sig);

							let sig = query_params.og_img_sig;

							redsquare_self.loadTweetWithSig(sig, (txs) => {
								for (let i = 0; i < txs.length; i++) {
									let tx = txs[i];
									let txmsg = tx.returnMessage();
									let img = '';
									let img_type;

									if (
										typeof txmsg.data.images != 'undefined'
									) {
										let img_uri = txmsg.data?.images[0];
										img_type = img_uri.substring(
											img_uri.indexOf(':') + 1,
											img_uri.indexOf(';')
										);
										let base64Data = img_uri.replace(
											/^data:image\/(png|jpeg|jpg);base64,/,
											''
										);
										img = Buffer.from(base64Data, 'base64');
									} else {
										let publicKey = tx.from[0].publicKey;
										let img_uri =
											app.keychain.returnIdenticon(
												publicKey,
												'png'
											);
										let base64Data = img_uri.replace(
											/^data:image\/png;base64,/,
											''
										);
										img = Buffer.from(base64Data, 'base64');
										img_type = img_uri.substring(
											img_uri.indexOf(':') + 1,
											img_uri.indexOf(';')
										);
									}

									if (img_type == 'image/svg+xml') {
										img_type = 'image/svg';
									}

									console.info(
										'### write from redsquare.js:1651 (request Open Graph Image)'
									);
									res.writeHead(200, {
										'Content-Type': img_type,
										'Content-Length': img.length
									});
									res.end(img);
									return;
								}
							});

							return;
						}
					}
				} catch (err) {
					console.log('Loading OG data failed with error: ' + err);
				}

				//Insert recent tweets into the index template directly
				let recent_tweets = await redsquare_self.fetchRecentTweets();

				// fallback for default
				res.setHeader('Content-type', 'text/html');
				res.charset = 'UTF-8';
				res.send(
					redsquareHome(
						app,
						redsquare_self,
						app.build_number,
						recent_tweets
					)
				);
				return;
			}
		);

		expressapp.use(
			'/' + encodeURI(this.returnSlug()),
			express.static(webdir)
		);
	}

	//
	// servers can fetch open graph graphics
	//
	async fetchOpenGraphProperties(app, mod, link) {
		if (app.BROWSER != 1) {
			return fetch(link, { redirect: 'follow', follow: 50 })
				.then((res) => res.text())
				.then((data) => {
					let no_tags = {
						title: '',
						description: ''
					};

					let og_tags = {
						'og:exists': false,
						'og:title': '',
						'og:description': '',
						'og:url': '',
						'og:image': '',
						'og:site_name': '' //We don't do anything with this
					};

					let tw_tags = {
						'twitter:exists': false,
						'twitter:title': '',
						'twitter:description': '',
						'twitter:url': '',
						'twitter:image': '',
						'twitter:site': '', //We don't do anything with this
						'twitter:card': '' //We don't do anything with this
					};

					// prettify html - unminify html if minified
					let html = prettify(data);

					//Useful to check, don't delete until perfect
					//let testReg = /<head>.*<\/head>/gs;
					//console.log(html.match(testReg));

					// parse string html to DOM html
					let dom = HTMLParser.parse(html);

					try {
						no_tags.title =
							dom.getElementsByTagName('title')[0].textContent;
					} catch (err) {}

					// fetch meta element for og tags
					let meta_tags = dom.getElementsByTagName('meta');

					// loop each meta tag and fetch required og properties
					for (let i = 0; i < meta_tags.length; i++) {
						let property = meta_tags[i].getAttribute('property');
						let content = meta_tags[i].getAttribute('content');
						// get required og properties only, discard others
						if (property in og_tags) {
							og_tags[property] = content;
							og_tags['og:exists'] = true;
						}
						if (property in tw_tags) {
							tw_tags[property] = content;
							tw_tags['twitter:exists'] = true;
						}
						if (
							meta_tags[i].getAttribute('name') === 'description'
						) {
							no_tags.description = content;
						}
					}

					// fallback to no tags
					og_tags['og:title'] =
						og_tags['og:title'] || no_tags['title'];
					og_tags['og:description'] =
						og_tags['og:description'] || no_tags['description'];

					if (tw_tags['twitter:exists'] && !og_tags['og:exists']) {
						og_tags['og:title'] = tw_tags['twitter:title'];
						og_tags['og:description'] =
							tw_tags['twitter:description'];
						og_tags['og:url'] = tw_tags['twitter:url'];
						og_tags['og:image'] = tw_tags['twitter:image'];
						og_tags['og:site_name'] = tw_tags['twitter:site'];
					}

					return og_tags;
				})
				.catch((err) => {
					console.error('Error fetching content: ' + err);
					return '';
				});
		} else {
			return '';
		}
	}
}

module.exports = RedSquare;
