const TweetManagerTemplate = require('./manager.template');
const Tweet = require('./tweet');
const Post = require('./post');
const Notification = require('./notification');
const SaitoProfile = require('./../../../lib/saito/ui/saito-profile/saito-profile');
const SaitoLoader = require('./../../../lib/saito/ui/saito-loader/saito-loader');

class TweetManager {
	constructor(app, mod, container = '.saito-main') {
		this.app = app;
		this.mod = mod;
		this.container = container;

		this.mode = 'loading';
		this.profile_posts = [];
		this.profile_replies = [];

		this.profile = new SaitoProfile(app, mod, '.saito-main');



		//This is an in-place loader... not super useful when content is overflowing off the bottom of the screen
		this.loader = new SaitoLoader(app, mod, '#redsquare-intersection');

		//////////////////////////////
		// load more on scroll-down //
		//////////////////////////////
		this.intersectionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						console.log("IntersectionObserver");

						if (this.mode === 'tweet') {
							return;
						}

						this.showLoader();

						//
						// load more tweets -- from local and remote sources
						//
						if (this.mode === 'tweets') {
							let numActivePeers = this.mod.loadTweets(
								'earlier',
								this.insertOlderTweets.bind(this)
							);
							if (!numActivePeers){
								console.log("Try again");
								this.mod.tweets_earliest_ts--;
								numActivePeers = this.mod.loadTweets(
									'earlier',
									this.insertOlderTweets.bind(this)
								);
								if (!numActivePeers){
									console.log("Give up");
									this.insertOlderTweets(0);
								}	
							}
						}

						//
						// load more notifications
						//
						if (this.mode === 'notifications') {

							if (document.querySelector('#intersection-observer-trigger')) {
								console.log("REDSQUARE: Turn off intersection observer before loading more notifications...");
								this.intersectionObserver.unobserve(document.querySelector('#intersection-observer-trigger'));
							}

							this.loadNotifications();

						}

						/////////////////////////////////////////////////
						//
						// So right now, we are fetching earlier stuff from the intersection observer
						// We will fetch the 100 most recent tweets/likes, so we'll see if people start complaining
						// about not having enough history available
						//
						//////////////////////////////////////////////////

						//
						// load more profile tweets
					}
				});
			},
			{
				root: null,
				threshold: 1
			}
		);
	}

	render(new_mode = this.mode) {
		this.app.connection.emit('redsquare-clear-menu-highlighting', new_mode);

		if (document.querySelector('.highlight-tweet')) {
			document
				.querySelector('.highlight-tweet')
				.classList.remove('highlight-tweet');
		}

		//
		// remove notification at end
		//
		if (document.querySelector('.saito-end-of-redsquare')) {
			document.querySelector('.saito-end-of-redsquare').remove();
		}

		let myqs = `.tweet-manager`;

		//
		// Stop observering while we rebuild the page
		//
		this.intersectionObserver.disconnect();
		this.profile.remove();

		if (!document.querySelector(myqs)) {
			this.app.browser.addElementToSelector(
				TweetManagerTemplate(),
				this.container
			);
		} 

		let holder = document.getElementById('tweet-thread-holder');
		let managerElem = document.querySelector(myqs);

		if (this.mode == 'tweets' && new_mode !== 'tweets') {
			console.log("Stash rendered tweets from main feed");
			let kids = managerElem.children;
			holder.replaceChildren(...kids);
		} else {
			console.log("Remove temporary content from page");
			while (managerElem.hasChildNodes()) {
				managerElem.firstChild.remove();
			}
		}
	

		//
		// if someone asks the manager to render with a mode that is not currently
		// set, we want to update our mode and proceed with it.
		//
		if (new_mode != this.mode) {
			this.mode = new_mode;
		}

		console.log("Redsquare manager rendering: ", this.mode);

		this.showLoader();

		////////////
		// tweets //
		////////////
		if (this.mode == 'tweets') {
			if (holder) {
				let kids = holder.children;
				managerElem.replaceChildren(...kids);
			}

			for (let i = 0; i < this.mod.tweets.length; i++) {
				let tweet = this.mod.tweets[i];
				if (!tweet.isRendered()) {
					tweet.renderWithCriticalChild();
				}
			}

			setTimeout(() => {
				this.hideLoader();
			}, 50);

			//Fire up the intersection observer
			this.attachEvents();
			return;
		}

		///////////////////
		// notifications //
		///////////////////
		if (this.mode == 'notifications') {

			console.log("Redsquare render notifications: already have " + this.mod.notifications.length + " in memory");

			for (let i = 0; i < this.mod.notifications.length; i++) {
				let notification = new Notification(
					this.app,
					this.mod,
					this.mod.notifications[i].tx
				);
				notification.render('.tweet-manager');
			}

			this.loadNotifications();
		}
	}

	loadNotifications(){

		this.showLoader();

		this.mod.loadNotifications((new_txs) => {
			if (this.mode !== 'notifications') {
				return;
			}

			setTimeout(() => {
				this.hideLoader();
			}, 50);

			for (let i = 0; i < new_txs.length; i++) {
				let notification = new Notification(
					this.app,
					this.mod,
					new_txs[i]
				);
				notification.render('.tweet-manager');
			}

			if (new_txs.length == 0) {
				this.app.browser.addElementToSelector('<div class="saito-end-of-redsquare">no further notifications</div>', ".tweet-manager");
				if (
					document.querySelector('#intersection-observer-trigger')
				) {
					this.intersectionObserver.unobserve(
						document.querySelector(
							'#intersection-observer-trigger'
						)
					);
				}
			

				if (this.mod.notifications.length == 0){
					//Dummy "Notification" for end of history sign
					let notification = new Notification(
						this.app,
						this.mod,
						null
					);
					notification.render('.tweet-manager');

				}
			
			}else{
				console.log("Redsquare turn on Intersection observer for notifications");
				//Fire up the intersection observer after the callback completes...
				this.attachEvents();
			}

		});
	}

	insertOlderTweets(tx_count, peer = null) {
		if (this.mode !== 'tweets') {
			console.log('Not on main feed anymore, currently on: ' + this.mode);
			return;
		}

		if (tx_count){
			this.hideLoader();

			for (let i = 0; i < this.mod.tweets.length; i++) {
				let tweet = this.mod.tweets[i];
				if (!tweet.isRendered()) {
					tweet.renderWithCriticalChild();
				}
			}
		}else if (peer?.tweets_earliest_ts){
			console.log(`${peer.publicKey} still has tweets as early as ${new Date(peer.tweets_earliest_ts)}, keep querying...`);
			this.mod.tweets_earliest_ts--;
			this.mod.loadTweets('earlier', this.insertOlderTweets.bind(this), peer);
		}else{
			//If all peers have returned 0, then clear feed...

			let out_of_content = true;

			for (let i = 0; i < this.mod.peers.length; i++) {
				if (this.mod.peers[i].tweets_earliest_ts) {
					out_of_content = false;
				}
			}

			if (out_of_content){
				this.hideLoader();

				if (!document.querySelector('.saito-end-of-redsquare')) {
					this.app.browser.addElementToSelector(
						`<div class="saito-end-of-redsquare">no more tweets</div>`,
						'.tweet-manager'
					);
				}
				if (document.querySelector('#intersection-observer-trigger')) {
					this.intersectionObserver.unobserve(
						document.querySelector('#intersection-observer-trigger')
					);
				}
			}else{
				console.log("Waiting on other peers to respond");
			}
		}

	}

	renderProfile(publicKey) {

    this.render("profile")

		if (!document.querySelector('.tweet-manager')) {
			this.app.browser.addElementToSelector(
				TweetManagerTemplate(),
				'.saito-main'
			);
		}

		//Reset Profile
		if (publicKey != this.profile.publicKey) {
			this.profile.reset(publicKey);
		}

		this.profile.render();

		this.loadProfile((txs) => {
			if (this.mode !== 'profile') {
				return;
			}
			this.filterAndRenderProfile(txs);
			if (this.profile.posts.length > 0) {
				this.app.connection.emit(
					'update-profile-stats',
					'posts',
					this.profile.posts.length
				);
			}
			if (this.profile.replies.length > 0) {
				this.app.connection.emit(
					'update-profile-stats',
					'replies',
					this.profile.replies.length
				);
			}
			if (this.profile.retweets.length > 0) {
				this.app.connection.emit(
					'update-profile-stats',
					'retweets',
					this.profile.retweets.length
				);
			}

			this.hideLoader();
			this.profile.render();
		});

		this.attachEvents();
	}

	loadProfile(mycallback) {
		if (this.mod.publicKey == this.profile.publicKey) {
			// Find likes...
			// I already have a list of tweets I liked available
			this.loadLikes(this.mod.liked_tweets, 'localhost');
		}else{
			this.app.storage.loadTransactions(
				{ field1: 'RedSquareLike', field2: this.profile.publicKey },
				(txs) => {
					let liked_tweets = [];
					for (tx of txs) {
						let txmsg = tx.returnMessage();

						let sig = txmsg?.data?.signature;
						if (sig && !liked_tweets.includes(sig)) {
							liked_tweets.push(sig);
						}
					}

					this.loadLikes(liked_tweets, null);
				},
				null
			);
		}

		let np = this.mod.peers.length;
		if (np > 1){
			this.app.connection.emit("redsquare-insert-loading-message", `Checking with ${np} peers for profile tweets...`);
		}else{
			this.showLoader();
		}
		

    for (let peer of this.mod.peers) {
			this.app.storage.loadTransactions(
				{
					field1: 'RedSquare',
					field2: this.profile.publicKey,
					limit: 100
				},
				(txs) => {
					if (mycallback) {
						mycallback(txs);
					}

					//Will add them so they are cached (in array and local cache)
					this.mod.processTweetsFromPeer(peer, txs);

					if (peer.peer !== "localhost"){
						this.app.connection.emit("redsquare-insert-loading-message", `Processing response from ${this.app.keychain.returnUsername(peer.publicKey)}`);	
					}
					np--;
					setTimeout(()=>{
						if (np>0){
							this.app.connection.emit("redsquare-insert-loading-message", `Loading from ${np} peers...`);			
						}else{
							this.app.connection.emit("redsquare-remove-loading-message");
						}
					}, 1500);
				},
				peer.peer
			);
	   }		
	}

	/*
    Liked tweets are more complicated than tweets I have sent because it is a 2-step look up
    We can find the 1, 2...n txs where I liked the tweet, which contains the signature of the original 
    tweet transaction. Fortunately, if I am looking at my own profile, I should have everything stored locally
  */
	loadLikes(list_of_liked_tweet_sigs, peer) {
		if (this.mode !== 'profile') {
			return;
		}

		let likes_to_load = list_of_liked_tweet_sigs.length;

		for (let sig of list_of_liked_tweet_sigs) {
			//
			// We may already have the liked tweet in memory
			//
			let old_tweet = this.mod.returnTweet(sig);
			if (old_tweet) {
				likes_to_load--;
				this.profile.insertTweet(old_tweet, this.profile.likes);
				if (likes_to_load == 0) {
					this.app.connection.emit(
						'update-profile-stats',
						'likes',
						list_of_liked_tweet_sigs.length
					);
				}
			} else {
				//
				// Otherwise, we gotta hit up the archive
				//
				this.app.storage.loadTransactions(
					{ field1: 'RedSquare', sig },
					(txs) => {
						likes_to_load--;
						for (let z = 0; z < txs.length; z++) {
							let tweet = new Tweet(this.app, this.mod, txs[z]);
							this.profile.insertTweet(tweet, this.profile.likes);
						}
						if (likes_to_load == 0) {
							this.app.connection.emit(
								'update-profile-stats',
								'likes',
								list_of_liked_tweet_sigs.length
							);
						}
					},
					peer
				);
			}
		}
	}

	filterAndRenderProfile(txs) {
		for (let z = 0; z < txs.length; z++) {
			let tweet = new Tweet(this.app, this.mod, txs[z]);
			if (tweet?.noerrors) {
				if (tweet.isRetweet()) {
					this.profile.insertTweet(tweet, this.profile.retweets);
					return;
				}
				if (tweet.isPost()) {
					this.profile.insertTweet(tweet, this.profile.posts);
				}
				if (tweet.isReply()) {
					this.profile.insertTweet(tweet, this.profile.replies);
				}
			}
		}
	}

	//
	// this renders a tweet, loads all of its available children and adds them to the page
	// as they appear...
	//
	renderTweet(tweet) {
		this.render('tweet');
		console.log("Render Tweet");
		this.showLoader();

		let post = new Post(this.app, this.mod, tweet);
		post.parent_id = tweet.tx.signature;
		post.thread_id = tweet.thread_id;

		post.source = 'Reply';

		// show the basic tweet first
		if (!tweet.parent_id) {
			tweet.renderWithChildren();

			if (document.querySelector(`.tweet-${tweet.tx.signature}`)) {
				document
					.querySelector(`.tweet-${tweet.tx.signature}`)
					.classList.add('highlight-tweet');

				post.render(`.tweet-${tweet.tx.signature}`);			
			}
		}

		// query the whole thread
		let thread_id =
			tweet.thread_id || tweet.parent_id || tweet.tx.signature;

		this.mod.loadTweetThread(thread_id, () => {
			let root_tweet = this.mod.returnTweet(thread_id);

			if (root_tweet) {
				root_tweet.renderWithChildrenWithTweet(tweet);
			}

			if (document.querySelector(`.tweet-${tweet.tx.signature}`)) {
				document
					.querySelector(`.tweet-${tweet.tx.signature}`)
					.classList.add('highlight-tweet');

				post.render(`.tweet-${tweet.tx.signature}`);
			}


			this.hideLoader();
		});
		
	}

	attachEvents() {
		//
		// dynamic content loading
		//

		let ob = document.getElementById('intersection-observer-trigger');
		if (ob) {
			//Only set up intersection observer if we have more content than fits on the screen
			//(so we don't double tap the servers)
			if (ob.getBoundingClientRect().top > window.innerHeight) {
				this.intersectionObserver.observe(ob);
			}
		}
	}

	showLoader() {
		this.loader.show();
	}

	hideLoader() {
		this.loader.hide();
	}
}

module.exports = TweetManager;
