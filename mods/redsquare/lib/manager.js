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

		this.profile = new SaitoProfile(app, mod, '.saito-main');

		this.profile.tab_container = '.tweet-manager';

		this.profile_tabs = ['posts', 'replies', /*'retweets',*/ 'likes'];

		this.profile.reset(this.mod.publicKey, 'posts', this.profile_tabs);

		//This is an in-place loader... not super useful when content is overflowing off the bottom of the screen
		this.loader = new SaitoLoader(app, mod, '#redsquare-intersection');

		//////////////////////////////
		// load more on scroll-down //
		//////////////////////////////
		this.intersectionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						console.log('IntersectionObserver');

						if (this.mode === 'tweet' || this.mode == 'loading') {
							return;
						}

						this.showLoader();

						//
						// load more tweets -- from local and remote sources
						//
						if (this.mode === 'tweets') {
							this.fetchTweets();
						}

						//
						// load more notifications
						//
						if (this.mode === 'notifications') {
							if (document.querySelector('#intersection-observer-trigger')) {
								console.log(
									'REDSQUARE: Turn off intersection observer before loading more notifications...'
								);
								this.intersectionObserver.disconnect();
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
					

						if (this.mode === "profile"){
							this.intersectionObserver.disconnect();
							this.showLoader();

							this.loadProfile((txs) => {
								if (this.mode !== 'profile') {
									return;
								}

								this.hideLoader();

								// Sort txs into posts/replies/retweets...
								this.filterAndRenderProfile(txs);

								this.profile.render();
							});

						}
					}
				});
			},
			{
				root: null,
				threshold: 1
			}
		);
	}

	clearFeed() {
		//
		// Stop observering while we rebuild the page
		//
		this.intersectionObserver.disconnect();
		let holder = document.getElementById('tweet-thread-holder');
		let managerElem = document.querySelector('.tweet-manager');

		if (holder) {
			while (holder.hasChildNodes()) {
				holder.firstChild.remove();
			}
		}
		if (managerElem) {
			while (managerElem.hasChildNodes()) {
				managerElem.firstChild.remove();
			}
		}
	}

	render(new_mode = this.mode) {

		console.log(this.mode, new_mode);
		
		this.app.connection.emit('redsquare-clear-menu-highlighting', new_mode);

		if (document.querySelector('.highlight-tweet')) {
			document.querySelector('.highlight-tweet').classList.remove('highlight-tweet');
		}

		//
		// Stop observering while we rebuild the page
		//
		this.intersectionObserver.disconnect();

		//
		// remove notification at end
		//
		if (document.querySelector('.saito-end-of-redsquare')) {
			document.querySelector('.saito-end-of-redsquare').remove();
		}

		let myqs = `.tweet-manager`;

		this.profile.remove();

		if (!document.querySelector(myqs)) {
			this.app.browser.addElementToSelector(TweetManagerTemplate(this.app, this.mod), this.container);
		}

		if (new_mode == "tweets"){
			document.querySelector(".redsquare-feed-source").classList.remove("hidden");
		}else{
			document.querySelector(".redsquare-feed-source").classList.add("hidden");
		}

		let holder = document.getElementById('tweet-thread-holder');
		let managerElem = document.querySelector(myqs);

		if (this.mode == 'tweets' && new_mode !== 'tweets') {
			//console.log('Stash rendered tweets from main feed');
			let kids = managerElem.children;
			holder.replaceChildren(...kids);
			if (document.getElementById('saito-new-tweets')) {
				holder.prepend(document.getElementById('saito-new-tweets'));
			}
			this.thread_id = null;
		} else {
			//console.log('Remove temporary content from page');
			while (managerElem.hasChildNodes()) {
				managerElem.firstChild.remove();
			}
		}

		//console.log('Redsquare manager rendering: ', this.mode);

		////////////
		// tweets //
		////////////
		if (new_mode == 'tweets') {
			// Do curation before rendering...
			this.mod.reset();

			if (holder) {
				let kids = holder.children;
				managerElem.replaceChildren(...kids);
			}

			for (let tweet of this.mod.curated_tweets) {
				if (!tweet.isRendered()) {
					tweet.renderWithCriticalChild();
				}
			}

			//Fire up the intersection observer
			this.attachEvents();
			this.mode = new_mode;

			return;
		}

		///////////////////
		// notifications //
		///////////////////
		if (new_mode == 'notifications') {
		    
		    if (this.mode !== new_mode){
		    	if (!this?.navLock){
			    	console.log("Add notification state");
				    window.history.pushState({view: "notifications"}, "", `/${this.mod.slug}#notifications`);
				    this.app.browser.pushBackFn(()=>{
				    	this.navLock = true;
				    	this.render('notifications');
				    	this.navLock = false;
				    });
		    	}
		 		this.mode = new_mode;   	
		    }

			if (this.mod.notifications.length > 0) {
				console.log(
					'Redsquare render notifications: already have ' +
						this.mod.notifications.length +
						' in memory'
				);

				for (let i = 0; i < this.mod.notifications.length; i++) {
					let notification = new Notification(this.app, this.mod, this.mod.notifications[i]);
					notification.render('.tweet-manager');
				}
			}

			this.loadNotifications();
			return;
		}

		//
		// if someone asks the manager to render with a mode that is not currently
		// set, we want to update our mode and proceed with it.
		//
		if (new_mode != this.mode) {
			this.mode = new_mode;
		}


	}

	loadNotifications() {
		this.showLoader();
		console.log('Redsquare load more notificaitons');

		this.mod.loadNotifications((new_txs) => {
			if (this.mode !== 'notifications') {
				return;
			}

			for (let i = 0; i < new_txs.length; i++) {
				let notification = new Notification(this.app, this.mod, new_txs[i]);
				notification.render('.tweet-manager');
			}

			if (new_txs.length == 0) {
				this.app.browser.addElementToSelector(
					'<div class="saito-end-of-redsquare">no further notifications</div>',
					'.tweet-manager'
				);
				if (document.querySelector('#intersection-observer-trigger')) {
					this.intersectionObserver.disconnect();
				}

				if (this.mod.notifications.length == 0) {
					//Dummy "Notification" for end of history sign
					let notification = new Notification(this.app, this.mod, null);
					notification.render('.tweet-manager');
				}

				setTimeout(() => {
					this.hideLoader();
				}, 50);
			} else {
				console.log('Redsquare turn on Intersection observer for notifications');
				//Fire up the intersection observer after the callback completes...
				this.attachEvents();
			}
		});
	}

	fetchTweets(){
		this.intersectionObserver.disconnect();

		this.numActivePeers = this.mod.loadTweets(
			'earlier',
			this.insertOlderTweets.bind(this)
		);

		if (!this.numActivePeers) {
			console.log('RS: Try again');
			this.mod.tweets_earliest_ts--;
			numActivePeers = this.mod.loadTweets('earlier', this.insertOlderTweets.bind(this));
			if (!numActivePeers) {
				console.log('RS: Give up');
				this.insertOlderTweets(0);
			}
		}
	}

	insertOlderTweets(tx_count, peer = null) {

		this.numActivePeers--;
		if (this.mode !== 'tweets') {
			console.log('Not on main feed anymore, currently on: ' + this.mode);
			return;
		}

		// Curation is done after the return so we don't care about tx_count per se 
		let acceptable_tweet_ct = this.mod.reset();

		if (acceptable_tweet_ct > 0) {
			this.hideLoader();
			for (let tweet of this.mod.curated_tweets) {
				if (!tweet.isRendered()) {
					tweet.renderWithCriticalChild();
				}
			}

			this.intersectionObserver.observe(document.getElementById('intersection-observer-trigger'));
			return;

		} else if (peer?.tweets_earliest_ts) {
			console.log(
				`${peer.publicKey} still has tweets as early as ${new Date(
					peer.tweets_earliest_ts
				)}, keep querying...`
			);
			this.mod.tweets_earliest_ts--;
			this.numActivePeers += this.mod.loadTweets('earlier', this.insertOlderTweets.bind(this), peer);
		} else {
			//If all peers have returned 0, then clear feed...

			let out_of_content = true;

			for (let i = 0; i < this.mod.peers.length; i++) {
				if (this.mod.peers[i].tweets_earliest_ts) {
					out_of_content = false;
				}
			}

			if (out_of_content) {
				this.hideLoader();

				if (!document.querySelector('.saito-end-of-redsquare')) {
					this.app.browser.addElementToSelector(
						`<div class="saito-end-of-redsquare">no more tweets</div>`,
						'.tweet-manager'
					);
				}
				this.intersectionObserver.disconnect();
				console.log("RS: Out of content");
			} 
		}
	}

	renderProfile(publicKey) {
		if (this.mode == "profile" && publicKey == this.profile?.publicKey){
			return;
		}

		this.render('profile');

		if (!document.querySelector('.tweet-manager')) {
			this.app.browser.addElementToSelector(TweetManagerTemplate(), '.saito-main');
		}

		if (!this?.navLock){
			console.log("Add profile state");
	        window.history.pushState({view: "profile"}, "", '/' + this.mod.slug + `/?user_id=${publicKey}`);
		    this.app.browser.pushBackFn(()=>{
		    	this.navLock = true;
		    	this.renderProfile(publicKey);
		    	this.navLock = false;
		    });
		}


		//Reset Profile
		if (publicKey != this.profile.publicKey) {
			this.profile.reset(publicKey, 'posts', this.profile_tabs);
		}

		this.loader.render();

		this.profile.render();

		for (let peer of this.mod.peers){
			peer.profile_ts = new Date().getTime();
		}

		this.loadProfile((txs) => {
			if (this.mode !== 'profile') {
				return;
			}

			this.hideLoader();

			// Sort txs into posts/replies/retweets...
			this.filterAndRenderProfile(txs);

			this.profile.render();
		});

	}


	// When we render the profile, we have a synchronous fetch on local archive for banner/description
	// by making this async the storage loading here should get pushed back
	async loadProfile(mycallback) {
		if (this.mod.publicKey == this.profile.publicKey) {
			// Find likes...
			// I already have a list of tweets I liked available
			this.loadLikes(this.mod.liked_tweets, 'localhost');
		} else {
			await this.app.storage.loadTransactions(
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
		if (np > 1) {
			this.app.connection.emit(
				'redsquare-insert-loading-message',
				`Checking with ${np} peers for profile tweets...`
			);
		} else {
			this.showLoader();
		}

		for (let peer of this.mod.peers) {
			await this.app.storage.loadTransactions(
				{
					field1: 'RedSquare',
					field2: this.profile.publicKey,
					limit: 100,
					created_earlier_than: peer.profile_ts
				},
				(txs) => {
					if (mycallback) {
						mycallback(txs);
					}

					//
					// Don't use processTweetsFromPeer(peer, txs)
					// because it updates the global timestamps and caches tweets in our local storage
					//
				    for (let z = 0; z < txs.length; z++) {
      					txs[z].decryptMessage(this.app);
      					this.mod.addTweet(txs[z], `${peer.publicKey}-profile`);
      					peer.profile_ts = txs[z]?.timestamp;
      				}

      				if (txs.length == 100) {
      					this.intersectionObserver.observe(document.getElementById('intersection-observer-trigger'));
      				}

					if (peer.peer !== 'localhost') {
						this.app.connection.emit(
							'redsquare-insert-loading-message',
							`Processing response from ${this.app.keychain.returnUsername(peer.publicKey)}`
						);
					}
					np--;
					setTimeout(() => {
						if (np > 0) {
							this.app.connection.emit(
								'redsquare-insert-loading-message',
								`Loading from ${np} peers...`
							);
						} else {
							this.app.connection.emit('redsquare-remove-loading-message');
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
				this.insertTweet(old_tweet, this.profile.menu.likes);
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
							this.insertTweet(tweet, this.profile.menu.likes);
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

	insertTweet(tweet, list) {
		let insertion_index = 0;

		for (let i = 0; i < list.length; i++) {
			if (list[i].tx.signature === tweet.tx.signature) {
				return;
			}

			if (tweet.created_at > list[i].created_at) {
				break;
			} else {
				insertion_index++;
			}
		}
		list.splice(insertion_index, 0, tweet);
	}

	filterAndRenderProfile(txs) {
		for (let z = 0; z < txs.length; z++) {
			let tweet = new Tweet(this.app, this.mod, txs[z]);
			if (tweet?.noerrors) {
				if (tweet.isRetweet()) {
					this.insertTweet(tweet, this.profile.menu.retweets);
					return;
				}
				if (tweet.isPost()) {
					this.insertTweet(tweet, this.profile.menu.posts);
				}
				if (tweet.isReply()) {
					this.insertTweet(tweet, this.profile.menu.replies);
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

		// query the whole thread
		let thread_id = tweet.thread_id || tweet.parent_id || tweet.tx.signature;

		console.log('Render Tweet Thread: ', thread_id);

		// show the basic tweet first
		if (!tweet.parent_id) {
			tweet.renderWithChildren();
		} else {
			let root_tweet = this.mod.returnTweet(thread_id);

			if (root_tweet) {
				root_tweet.renderWithChildrenWithTweet(tweet);
			}
		}

		if (document.querySelector(`.tweet-${tweet.tx.signature}`)) {
			document.querySelector(`.tweet-${tweet.tx.signature}`).classList.add('highlight-tweet');
		}

		if (thread_id !== this?.thread_id) {
			this.thread_id = thread_id;
			this.showLoader();

			if (!this?.navLock){
				console.log("Add tweet thread state");
			    window.history.pushState({view: "tweet"}, "", `/redsquare?tweet_id=${tweet.tx.signature}`);
			    this.app.browser.pushBackFn(()=>{
			    	this.navLock = true;
			    	this.renderTweet(tweet);
			    	this.navLock = false;
			    });
			}

			this.mod.loadTweetThread(thread_id, () => {
				//
				// This will catch you navigating back to the main feed before the callback completes
				//
				if (this.mode === 'tweet' && this.thread_id === thread_id) {
					let root_tweet = this.mod.returnTweet(thread_id);

					if (root_tweet) {
						root_tweet.renderWithChildrenWithTweet(tweet);
					}

					if (document.querySelector(`.tweet-${tweet.tx.signature}`)) {
						document.querySelector(`.tweet-${tweet.tx.signature}`).classList.add('highlight-tweet');

						if (!this.app.browser.isMobileBrowser()){
							let post = new Post(this.app, this.mod, tweet);
							post.parent_id = tweet.tx.signature;
							post.thread_id = tweet.thread_id;

							post.source = 'Reply';

							post.render(`.tweet-${tweet.tx.signature}`);
						}
					}
				}

				this.hideLoader();
			});
		} else {
			if (document.querySelector(`.tweet-${tweet.tx.signature}`)) {
				document.querySelector(`.tweet-${tweet.tx.signature}`).classList.add('highlight-tweet');

				if (!this.app.browser.isMobileBrowser()){
					let post = new Post(this.app, this.mod, tweet);
					post.parent_id = tweet.tx.signature;
					post.thread_id = tweet.thread_id;

					post.source = 'Reply';

					post.render(`.tweet-${tweet.tx.signature}`);
				}
			}
		}
	}

	attachEvents() {
		//
		// dynamic content loading
		//
		setTimeout(() => {
			this.hideLoader();
		}, 5);

		let ob = document.getElementById('intersection-observer-trigger');

		if (ob) {
			//Only set up intersection observer if we have more content than fits on the screen
			//(so we don't double tap the servers)
			if (ob.getBoundingClientRect().top > window.innerHeight) {
				this.intersectionObserver.observe(ob);
			}
		}

		if (!this?.eventsAttached){

			if (document.getElementById("curated")){ // for you
				document.getElementById("curated").onclick = (e) => {
					e.currentTarget.classList.add("active");
					document.getElementById("everything").classList.remove("active");
					this.mod.curated = true;
					this.mod.saveOptions();
					this.clearFeed();
					this.showLoader();
					setTimeout(() => {
						this.render();
					}, 10);
				}
			}
			if (document.getElementById("everything")){ // everything
				document.getElementById("everything").onclick = (e) => {
					e.currentTarget.classList.add("active");
					document.getElementById("curated").classList.remove("active");
					this.mod.curated = false;
					this.mod.saveOptions();
					this.showLoader();
					this.clearFeed();
					setTimeout(() => {
						this.render();
					}, 10);
				}
			}

			this.eventsAttached = true;
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
