const saito = require('./../../../lib/saito/saito');
const SaitoUser = require('./../../../lib/saito/ui/saito-user/saito-user');
const TweetTemplate = require('./tweet.template');
const Link = require('./link');
const Image = require('./image');
const Post = require('./post');
const JSON = require('json-bigint');
const Transaction = require('../../../lib/saito/transaction').default;

class Tweet {
	constructor(app, mod, tx, container = '.tweet-manager') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.name = 'Tweet';

		if (!tx) {
			console.warn('Attempting to create a tweet from a null tx');
			return null; //Doesn't actually return null
		}

		let txmsg = tx.returnMessage();

		if (txmsg.module !== mod.name) {
			console.warn(
				'Attempting to create Tweet from non-Redsquare tx, ',
				txmsg.module
			);
			return null;
		}

		//
		// the core
		//
		this.tx = tx;

		//
		// ancillary content is stored in the tx.optional array, where it
		// can be saved back to the network of archive nodes / databases and
		// preserved along with the transaction as optional (unverified) but
		// associated content.
		//
		// this includes information like the number of replies, retweets,
		// likes, and information like open graph images, etc.
		//
		if (!this.tx.optional) {
			this.tx.optional = {};
		}

		if (!this.tx.optional.num_replies) {
			this.tx.optional.num_replies = 0;
		}
		if (!this.tx.optional.num_retweets) {
			this.tx.optional.num_retweets = 0;
		}
		if (!this.tx.optional.num_likes) {
			this.tx.optional.num_likes = 0;
		}
		if (!this.tx.optional.link_properties) {
			this.tx.optional.link_properties = null;
		}
		if (!this.tx.optional.parent_id) {
			this.tx.optional.parent_id = '';
		}
		if (!this.tx.optional.thread_id) {
			this.tx.optional.thread_id = '';
		}
		if (!this.tx.optional.retweeters) {
			this.tx.optional.retweeters = [];
		}

		//
		// If I am not part of a thread, become my own thread
		// This value will get propagated to this.thread_id
		//
		this.tx.optional.thread_id = this.tx.signature;
		//
		// comments will specify parent and thread ids, so we should capture that in the optional
		// field here in the constructor so that we can guarantee they exist
		//
		if (txmsg.data) {
			if (txmsg.data.parent_id) {
				this.parent_id = this.tx.optional.parent_id =
					txmsg.data.parent_id;
			}
			if (txmsg.data.thread_id) {
				this.thread_id = this.tx.optional.thread_id =
					txmsg.data.thread_id;
			}
		}

		//
		// additional variables are created in-memory from the core transaction
		// without the need for re-saving, these are specified below.
		//
		this.text = '';
		this.youtube_id = null;
		this.created_at = this.tx.timestamp;
		// updated by tx.optional.updated_at if exists
		this.updated_at = this.tx.timestamp;

		//
		// the notice shows up at the top of the tweet BEFORE the username and
		// is used for "retweeted by X" or "liked by Y". the userline is the
		// line that goes in the tweet header below the username/address but to
		// the right of the identicon.
		//
		this.notice = '';

		this.user = new SaitoUser(
			app,
			mod,
			this.container + `> .tweet-${this.tx.signature} > .tweet-header`,
			this.tx.from[0].publicKey
		);

		//
		// Default is a new tweet
		//
		this.user.notice = 'new post on ' + this.formatDate(this.created_at);

		this.children = [];
		this.children_sigs_hmap = {};
		this.unknown_children = [];
		this.unknown_children_sigs_hmap = {};
		this.critical_child = null;
		this.render_after_selector = ''; //Used to attach replies to the original tweet

		this.retweet = null;
		this.retweet_tx = null;
		this.links = [];
		this.link = null;
		this.show_controls = 1;
		this.force_long_tweet = false;
		this.is_long_tweet = false;
		this.parent_id = '';
		this.thread_id = '';

		//
		// Read data from txmsg.data and tx.optional to populate this class
		//
		try {
			this.setKeys(txmsg.data);
		} catch (err) {}
		try {
			this.setKeys(tx.optional);
		} catch (err) {}

		//
		// maybe anything is updated
		//
		if (this.tx.optional.update_tx) {
			let newtx = new Transaction();
			newtx.deserialize_from_web(this.app, this.tx.optional.update_tx);
			let newtxmsg = newtx.returnMessage();

			this.text = newtxmsg.data.text;
			//Not updating more than text
			//this.setKeys(newtxmsg.data, true);
		}

		//
		// if the tweet has been updated, we upate the user notice to inform users that
		// there is a new reply!
		//
		//console.log(this.updated_at, this.created_at, this.tx.optional.num_replies);
		//if (this.updated_at > this.created_at) {
		if (this.tx.optional.num_replies > 0) {
			//console.log("Change user notice!");
			this.user.notice =
				'originally posted on ' + this.formatDate(this.created_at);
		}
		//}

		//
		//This is async and won't necessarily finish before running the following code!
		//

		this.generateTweetProperties(app, mod, 0);

		//
		// retweets
		//
		if (this.retweet_tx != null) {
			let newtx = new Transaction();
			newtx.deserialize_from_web(this.app, this.retweet_tx);

			this.retweet = new Tweet(
				this.app,
				this.mod,
				newtx,
				this.container +
					`> .tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-preview`
			);
			this.retweet.show_controls = 0;
		}

		//
		// image preview -- copied over from txmsg.data.images
		//
		if (this.images?.length > 0) {
			this.img_preview = new Image(
				this.app,
				this.mod,
				this.container +
					`> .tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-preview`,
				this.images,
				this.tx.signature
			);
		}

		// We will use this as a flag to know there were no breaking failures in the constructor
		this.noerrors = true;
	}

	isRetweet() {
		let txmsg = this.tx.returnMessage();
		if (txmsg.request != 'create tweet') {
			return false;
		}
		if (!txmsg.data?.text && !txmsg.data?.images) {
			return true;
		}

		return false;
	}

	isPost() {
		let txmsg = this.tx.returnMessage();
		if (txmsg.request != 'create tweet') {
			return false;
		}
		if (this.parent_id == '') {
			return true;
		}
		return false;
	}

	isReply() {
		let txmsg = this.tx.returnMessage();
		if (txmsg.request != 'create tweet') {
			return false;
		}
		if (this.parent_id != '') {
			return true;
		}
		return false;
	}

	formatDate(ts = 0) {
		let submit_ts = ts || this.updated_at;
		let dt = this.app.browser.formatDate(submit_ts);
		return `${dt.month} ${dt.day}, ${dt.year} at ${dt.hours}:${dt.minutes}`;
	}

	//
	//  This is helpful when pulling older tweets and then running through the whole list of tweets
	//
	isRendered() {
		if (
			document.querySelector(
				`.tweet-manager > .tweet-${this.tx.signature}`
			)
		) {
			return true;
		}
		return false;
	}

	remove() {
		let eqs = `.tweet-${this.tx.signature}`;
		if (document.querySelector(eqs)) {
			document.querySelector(eqs).remove();
		}
		if (this.parent_id) {
			let parent = this.mod.returnTweet(this.parent_id);
			if (parent.isRendered()) {
				parent.removeReply();
			}
		}
	}

	removeReply() {
		let myqs = this.container + `> .tweet-${this.tx.signature}`;
		let obj = document.querySelector(myqs);
		if (obj) {
			obj.classList.remove('has-reply');
		}
	}

	render(prepend = false) {
		if (this.mod.hidden_tweets.includes(this.tx.signature)) {
			console.log('Not rendering hidden tweet');
			return;
		}

		//
		// handle if link
		//
		if (this.link && !this.link_preview) {
			this.link_preview = new Link(
				this.app,
				this.mod,
				this.container +
					`> .tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-preview`,
				this
			);
		}

		//
		// in the case of a quote-or-retweet the retweet might appear on the same page
		// as the original tweet, so we check here and flag whether or not the element
		// already exists. if it does we will only render 1.
		//
		let myqs = this.container + `> .tweet-${this.tx.signature}`;
		let replace_existing_element = true;

		let has_reply = false;
		let has_reply_disconnected = false;

		//
		// we might be re-rendering when critical child is on screen, so check if the
		// class exists and flag if so. the class indicates that a critical child exists
		// and by flagging it we will be able to re-add the class to the re-rendered
		// tweet and preserve the CSS so the visual connector between the tweets does not
		// disappear.
		//
		let obj = document.querySelector(myqs);
		if (obj) {
			if (obj.classList.contains('has-reply')) {
				has_reply = true;
			}
			if (obj.classList.contains('has-reply-disconnected')) {
				has_reply_disconnected = true;
			}

			//
			// if prepend = true, remove existing element
			//
			if (prepend) {
				obj.remove();
			}
		}

		//
		// if this is a retweet but not a quote tweet we pass through the "parent" and just
		// render the child with a "retweet-notice" that shows up at the top of the tweet. we
		// then pass-through and render the sub-tweet directly.
		//
		if (this.retweet_tx && !this.text && !this.img_preview) {
			this.retweet.notice =
				'retweeted by ' +
				this.app.browser.returnAddressHTML(this.tx.from[0].publicKey) +
				' ' +
				this.formatDate();
			this.retweet.container = '.tweet-manager';
			let t = this.mod.returnTweet(this.retweet.tx.signature);
			if (t) {
				t.notice = this.retweet.notice;
				t.user.notice = t.user.notice.replace('new', 'original');
				t.render(prepend);
				t.user.render();
				t.attachEvents();
			} else {
				this.retweet.user.container =
					this.container +
					`> .tweet-${this.retweet.tx.signature} > .tweet-header`;
				this.retweet.user.notice = this.retweet.user.notice.replace(
					'new',
					'original'
				);
				this.retweet.render(prepend);
				this.retweet.user.render();
				this.retweet.attachEvents();
			}
			return;
		}

		//
		// New way for retweets we don't put the new ones in the feed, just update the originals and sort them higher up
		//
		if (this.retweeters?.length > 0 && this.container == '.tweet-manager') {
			this.notice = `retweeted by ${this.app.browser.returnAddressHTML(
				this.retweeters[0]
			)} ${this.formatDate()}`;
		}

		if (
			this.tx.isTo(this.mod.publicKey) &&
			!this.tx.isFrom(this.mod.publicKey)
		) {
			if (
				this.mentions == 1 ||
				this.mentions?.includes(this.mod.publicKey)
			) {
				this.notice = 'you were mentioned in this tweet';
			}
		}

		if (this.tx.optional?.update_tx) {
			this.notice =
				'this tweet was edited on ' + this.formatDate(this.updated_at);
		}

		if (this.render_after_selector) {
			//
			// remove if selector does not exist
			//
			if (!document.querySelector(this.render_after_selector)) {
				this.render_after_selector = '';
			}
			//
			// remove if selector is a previewed tweet, like retweet
			//
			let preview_selector =
				'.tweet-preview ' + this.render_after_selector;
			if (document.querySelector(preview_selector)) {
				//
				//
				//
				this.render_after_selector = '';
			}
		}

		if (document.querySelector(myqs)) {
			this.app.browser.replaceElementBySelector(
				TweetTemplate(this.app, this.mod, this),
				myqs
			);
		} else if (prepend) {
			this.app.browser.prependElementToSelector(
				TweetTemplate(this.app, this.mod, this),
				this.container
			);
		} else if (this.render_after_selector) {
			this.app.browser.addElementAfterSelector(
				TweetTemplate(this.app, this.mod, this),
				this.render_after_selector
			);
		} else {
			this.app.browser.addElementToSelector(
				TweetTemplate(this.app, this.mod, this),
				this.container
			);
		}

		//
		// has-reply and has-reply-disconnected
		//
		if (has_reply) {
			let obj = document.querySelector(myqs);
			if (obj) {
				obj.classList.add('has-reply');
			}
		}
		if (has_reply_disconnected) {
			let obj = document.querySelector(myqs);
			if (obj) {
				obj.classList.add('has-reply-disconnected');
			}
		}

		//
		// modify width of any iframe
		//
		if (this.youtube_id != null && this.youtube_id != 'null') {
			let tbqs = myqs + ' .tweet-body .tweet-main';
			let ytqs = myqs + ' .tweet-body .tweet-main .youtube-embed';
			if (document.querySelector(tbqs)) {
				let x = document.querySelector(tbqs).getBoundingClientRect();
				let y = document.querySelector(ytqs);
				if (x) {
					if (y) {
						y.style.width = Math.floor(x.width) + 'px';
						y.style.height = Math.floor((x.width / 16) * 9) + 'px';
					}
				}
			}
		}

		this.user.render();

		if (this.img_preview != null) {
			this.img_preview.render();
		}
		if (this.retweet) {
			this.retweet.render();
		}
		if (this.link_preview != null) {
			if (this.tx.optional.link_properties != null) {
				if (Object.keys(this.tx.optional.link_properties).length > 0) {
					this.link_preview.render();
				}
			}
		}

		this.attachEvents();
	}

	rerenderControls(complete_rerender = false) {
		//
		// just make sure our updated tx.optional values propagate to the tweet properties
		//
		//console.log(JSON.parse(JSON.stringify(this.tx.optional)));

		this.setKeys(this.tx.optional);
		//console.log(this.num_replies, this.num_retweets, this.num_likes);

		if (complete_rerender) {
			this.render();
		} else {
			// like, retweet, comment
			this.refreshStat('like', this.num_likes);
			this.refreshStat('retweet', this.num_retweets);
			this.refreshStat('comment', this.num_replies);
		}
	}

	forceRenderWithCriticalChild() {
		this.render();

		if (this.critical_child) {
			this.critical_child.render_after_selector =
				'.tweet-' + this.tx.signature;
			this.critical_child.render();

			let myqs = this.container + ` .tweet-${this.tx.signature}`;
			let obj = document.querySelector(myqs);
			if (obj) {
				if (this.critical_child.parent_id == this.tx.signature) {
					obj.classList.add('has-reply');
				} else {
					obj.classList.add('has-reply-disconnected');
				}
			}
		}

		this.attachEvents();
	}
	renderWithCriticalChild() {
		let does_tweet_already_exist_on_page = false;
		if (document.querySelector(`.tweet-${this.tx.signature}`)) {
			does_tweet_already_exist_on_page = true;
		}

		if (!does_tweet_already_exist_on_page) {
			this.render();
		}

		if (this.critical_child && does_tweet_already_exist_on_page == false) {
			//
			// does child already exist on page
			//
			if (
				document.querySelector(
					`.tweet-${this.critical_child.tx.signature}`
				)
			) {
				return;
			}

			this.critical_child.render_after_selector =
				'.tweet-' + this.tx.signature;
			this.critical_child.render();

			let myqs = this.container + ` .tweet-${this.tx.signature}`;
			let obj = document.querySelector(myqs);
			if (obj) {
				if (this.critical_child.parent_id == this.tx.signature) {
					obj.classList.add('has-reply');
				} else {
					obj.classList.add('has-reply-disconnected');
				}
			}

			//
			// if no replies are listed, but we are showing a reply... show least one to avoid confusion
			//
			if (this.tx.optional.num_replies == 0) {
				let obj = document.querySelector(
					`.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-comment .tweet-tool-comment-count`
				);
				try {
					obj.innerHTML++;
				} catch (err) {
					console.log('err: ' + err);
				}
			}
		}

		this.attachEvents();
	}

	renderWithChildren() {
		//
		// first render the tweet
		//
		this.render();

		//
		// then render its children
		//
		// it's clear we need to figure out tweet threading....
		//
		if (this.children.length > 0) {
			let myqs = this.container + ` .tweet-${this.tx.signature}`;
			let obj = document.querySelector(myqs);
			if (obj) {
				obj.classList.add('has-reply');
			}

			if (this.children.length > 1) {
				if (obj) {
					obj.classList.remove('has-reply');
				}

				for (let i = 0; i < this.children.length; i++) {
					this.children[i].container = this.container;
					this.children[
						i
					].render_after_selector = `.tweet-${this.tx.signature}`;
					this.children[i].renderChild();
				}
			} else {
				this.children[0].container = this.container;
				this.children[0].render_after_selector = `.tweet-${this.tx.signature}`;
				this.children[0].renderWithChildren();
			}
		}

		this.attachEvents();
	}

	renderChild() {
		this.render();
		let myqs = this.container + ` .tweet-${this.tx.signature}`;
		let obj = document.querySelector(myqs);
		if (obj) {
			obj.classList.add('is-reply');
		}
	}

	//
	// render this tweet with its children, but leading to a specific tweet.
	//
	renderWithChildrenWithTweet(tweet, sigs = []) {
		//
		// sigs will have list of signatures that form
		// a direct chain between parent and child that
		// we want to show.
		//
		if (sigs.length == 0) {
			// this tweet, child tweet we want to show
			sigs = this.mod.returnThreadSigs(
				this.tx.signature,
				tweet.tx.signature
			);
		}

		//
		// now render anything in the sigs list
		//
		if (sigs.includes(this.tx.signature)) {
			this.render();
		}

		//
		// then render its children
		//
		// it's clear we need to figure out tweet threading....
		//
		if (this.children.length > 0) {
			let myqs = this.container + ` .tweet-${this.tx.signature}`;
			let obj = document.querySelector(myqs);
			if (obj) {
				obj.classList.add('has-reply');
			}

			for (let i = 0; i < this.children.length; i++) {
				this.children[i].container = this.container;
				this.children[
					i
				].render_after_selector = `.tweet-${this.tx.signature}`;
				if (this.tx.signature == tweet.tx.signature) {
					if (this.children.length > 1) {
						if (obj) {
							obj.classList.remove('has-reply');
						}
						this.children[i].renderChild();
					} else {
						this.children[i].renderWithChildren();
					}
				} else {
					this.children[i].renderWithChildrenWithTweet(tweet, sigs);
				}
			}
		}

		this.attachEvents();
	}

	attachEvents() {
		let mod = this.mod;
		let app = this.app;

		if (this.show_controls == 0) {
			return;
		}

		try {
			//
			// tweet does not exist? exit
			//
			let this_tweet = document.querySelector(
				`.tweet-${this.tx.signature}`
			);

			if (!this_tweet) {
				return;
			}

			/////////////////////////////
			// Expand / Contract Tweet //
			/////////////////////////////
			//
			// if you don't want a tweet to auto-contract on display, set this.is_long_tweet
			// to be true before running attachEvents(); this will avoid it getting compressed
			// with expanded / preview toggle.
			//
			let tweet_text = document.querySelector(
				`.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-text`
			);
			if (tweet_text) {
				if (!this.force_long_tweet) {
					if (tweet_text.clientHeight < tweet_text.scrollHeight) {
						tweet_text.classList.add('preview');
						this.is_long_tweet = true;
					}
				} else {
					tweet_text.classList.add('expanded');
				}
			}

			/////////////////
			// view thread //
			/////////////////
			if (!this_tweet.dataset.hasClickEvent) {
				this_tweet.dataset.hasClickEvent = true;

				Array.from(this_tweet.querySelectorAll('a')).forEach((link) => {
					link.onclick = (e) => {
						e.stopPropagation();
						// We allow the link to redirect us (in a new tab) without
						// targeting the general tweet click event
					};
				});

				this_tweet.onclick = (e) => {
					//
					// if we have selected text, then we are trying to copy and paste and
					// the last thing we want is for the UI to update and prevent us from
					// being able to use the site.
					//
					let highlightedText = '';
					if (window.getSelection) {
						highlightedText = window.getSelection().toString();
					} else if (
						document.selection &&
						document.selection.type != 'Control'
					) {
						highlightedText = document.selection.createRange().text;
					}
					if (highlightedText != '') {
						return;
					}

					//
					// Expand tweet preview for long tweets
					//
					if (this.is_long_tweet && tweet_text) {
						if (tweet_text.classList.contains('preview')) {
							tweet_text.classList.remove('preview');
							tweet_text.classList.add('expanded');
							this.force_long_tweet = true;
							return;
						}
					}

					//
					// if we are asking to see a tweet, WE SHOULD load from parent if exists
					//
					if (e.target.tagName != 'IMG') {
						//
						// if there is a connection between us and the parent, we have all of the
						// tweets needed to display and we can emit the event that triggers the
						// redisplay directly, and then load and append any children as needed.
						//
						let sigs = this.mod.returnThreadSigs(
							this.thread_id,
							this.tx.signature
						);
						if (sigs.length > 0) {
							sigs.push(this.tx.signature);
						}

						//
						// if we have just replied, the count on the page will be higher than
						// the count in the tweet itself, so we want to catch this edge-case
						// by checking the number of replies before reload and keeping them
						//
						let parent_replies = null;
						try {
							parent_replies = document.querySelector(
								`.tweet-${this.thread_id} .tweet-body .tweet-main .tweet-controls .tweet-tool-comment .tweet-tool-comment-count`
							).innerHTML;
						} catch (err) {}

						//
						// full thread already exists
						//
						if (
							sigs.includes(this.tx.signature) &&
							sigs.includes(this.thread_id)
						) {
							app.connection.emit(
								'redsquare-tweet-render-request',
								this
							);

							setTimeout(() => {
								if (parent_replies) {
									document.querySelector(
										`.tweet-${this.thread_id} .tweet-body .tweet-main .tweet-controls .tweet-tool-comment .tweet-tool-comment-count`
									).innerHTML = parent_replies;
								}
							}, 50);
						} else {
							setTimeout(() => {
								window.location.href = `/redsquare?tweet_id=${this.thread_id}`;
							}, 300);
						}
					}
				};
			}

			////////////////////////////////////////////////
			// view preview  -- click on the retweeted post
			////////////////////////////////////////////////
			document
				.querySelectorAll(`.tweet-${this.tx.signature} .tweet`)
				.forEach((item) => {
					item.addEventListener('click', (e) => {
						e.stopImmediatePropagation();
						let sig = item.getAttribute('data-id');
						if (e.target.tagName != 'IMG' && sig) {
							let t = this.mod.returnTweet(sig);
							if (t) {
								app.connection.emit(
									'redsquare-tweet-render-request',
									t
								);
							} else {
								console.warn(
									'This is going to screw up the feed'
								);
								this.retweet.container = '.tweet-manager';
								app.connection.emit(
									'redsquare-tweet-render-request',
									this.retweet
								);
							}
						}
					});
				});

			///////////
			// reply //
			///////////
			let reply = document.querySelector(
				`.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-comment`
			);
			if (reply) {
				reply.onclick = (e) => {
					e.preventDefault();
					e.stopImmediatePropagation();

					let post = new Post(this.app, this.mod, this);
					post.parent_id = this.tx.signature;
					post.thread_id = this.thread_id;

					post.source = 'Reply';
					post.render();
					this.app.browser.prependElementToSelector(
						`<div id="post-tweet-preview-${this.tx.signature}" class="post-tweet-preview" data-id="${this.tx.signature}"></div>`,
						'.saito-overlay .tweet-overlay'
					);

					//
					//Show quoted tweet in the post
					//
					let newtx = new Transaction(undefined, this.tx.toJson());
					newtx.signature =
						this.app.crypto.hash(this.tx.signature) +
						this.app.crypto.hash(this.tx.signature);

					let new_tweet = new Tweet(
						this.app,
						this.mod,
						newtx,
						`#post-tweet-preview-${this.tx.signature}`
					);
					new_tweet.show_controls = 0;
					new_tweet.render();
					document.querySelector('#post-tweet-textarea').focus();
				};
			}

			/////////////
			// retweet //
			/////////////
			let retweet = document.querySelector(
				`.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-retweet`
			);

			if (retweet) {
				retweet.onclick = (e) => {
					e.preventDefault();
					e.stopImmediatePropagation();

					let post = new Post(this.app, this.mod, this);

					post.source = 'Retweet';
					post.render();

					this.app.browser.prependElementToSelector(
						`<div id="post-tweet-preview-${this.tx.signature}" class="post-tweet-preview" data-id="${this.tx.signature}"></div>`,
						'.saito-overlay .tweet-overlay'
					);

					//Insert this tweet as a new Tweet in the post window
					let newtx = new Transaction(undefined, this.tx.toJson());
					newtx.signature =
						this.app.crypto.hash(this.tx.signature) +
						this.app.crypto.hash(this.tx.signature);

					let new_tweet = new Tweet(
						this.app,
						this.mod,
						newtx,
						`#post-tweet-preview-${this.tx.signature}`
					);
					new_tweet.show_controls = 0;
					new_tweet.render();
				};
			}

			//////////
			// like //
			//////////
			const heartIcon = document.querySelector(
				`.tweet-${this.tx.signature} .tweet-like-button .heart-icon`
			);
			if (heartIcon) {
				heartIcon.onclick = async (e) => {
					if (!heartIcon.classList.contains('liked')) {
						heartIcon.classList.add('liked');
						this.mod.likeTweet(this.tx.signature);
					} else {
						setTimeout(() => {
							heartIcon.classList.remove('liked');
							heartIcon.classList.add('liked');
						}, 5);
					}

					e.preventDefault();
					e.stopImmediatePropagation();

					await this.mod.sendLikeTransaction(
						this.app,
						this.mod,
						{ signature: this.tx.signature },
						this.tx
					);

					//
					// increase num likes
					//
					let obj = document.querySelector(
						`.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-like .tweet-tool-like-count`
					);
					if (obj) {
						obj.innerHTML = parseInt(obj.innerHTML) + 1;
						if (!obj.classList.contains('liked')) {
							obj.classList.add('liked');
						}
					}
				};
			}

			///////////
			// share //
			///////////
			let share = document.querySelector(
				`.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-share`
			);
			if (share) {
				share.onclick = (e) => {
					e.preventDefault();
					e.stopImmediatePropagation();

					let tweetUrl =
						window.location.origin +
						window.location.pathname +
						'?tweet_id=' +
						this.tx.signature;
					navigator.clipboard.writeText(tweetUrl).then(() => {
						siteMessage('Link copied to clipboard.', 2000);
					});
				};
			}

			//////////
			// edit //
			//////////
			let edit = document.querySelector(
				`.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-edit`
			);
			if (edit) {
				edit.onclick = (e) => {
					e.preventDefault();
					e.stopImmediatePropagation();

					let post = new Post(this.app, this.mod, this);

					post.source = 'Edit';
					post.render();
				};
			}

			//////////
			// trash //
			//////////
			let trash = document.querySelector(
				`.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-delete`
			);
			if (trash) {
				trash.onclick = (e) => {
					e.preventDefault();
					e.stopImmediatePropagation();

					let post = new Post(this.app, this.mod, this);

					post.deleteTweet();
				};
			}

			let more = document.querySelector(
				`.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-more`
			);
			if (more) {
				more.onclick = (e) => {
					e.preventDefault();
					e.stopImmediatePropagation();

					this.app.connection.emit(
						'rs-show-tweet-options',
						this,
						more
					);
				};
			}

			/*/////////
			// flag //
			//////////
			let flag = document.querySelector(
				`.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-flag`
			);
			if (flag) {
				flag.onclick = async (e) => {
					e.preventDefault();
					e.stopImmediatePropagation();

				};
			}*/
		} catch (err) {
			console.log('ERROR attaching events to tweet: ' + err);
		}
	}

	//
	// I am using this function to reset the this.num_likes, etc
	// from an updated tx that we either received on chain or through an archive query
	// (both of which manually increment the stats in tx.optional)
	//
	setKeys(obj, force = false) {
		for (let key in obj) {
			if (typeof obj[key] !== 'undefined') {
				if (force) {
					if (typeof this[key] === 'number') {
						this[key] = Math.max(this[key], obj[key]);
					} else {
						this[key] = obj[key];
					}
				} else {
					if (!this[key]) {
						this[key] = obj[key];
					} else if (typeof this[key] === 'number') {
						this[key] = Math.max(this[key], obj[key]);
					}
				}
			}
		}
	}

	//
	// Add the given tweet somewhere, it may be a reply or a reply to a reply
	//
	addTweet(tweet) {
		this.updated_at = tweet.updated_at;

		//
		// if this tweet is the parent-tweet of a tweet we have already downloaded
		// and indexed here. this can happen if tweets arrive out-of-order.
		//
		for (let i = 0; i < this.unknown_children.length; i++) {
			if (this.unknown_children[i].parent_id === tweet.tx.signature) {
				this.unknown_children[i].parent_tweet = tweet;
				//
				// tweet adds its orphan
				//
				tweet.addTweet(this.unknown_children[i]);

				//
				// and delete from unknown children
				this.removeUnknownChild(this.unknown_children[i]);
			}
		}

		//
		// tweet is direct child
		//
		if (tweet.parent_id == this.tx.signature) {
			//
			// already added?
			//
			if (this.children_sigs_hmap[tweet.tx.signature]) {
				return 0;
			}

			//
			// Add back reference to myself
			//
			tweet.parent_tweet = this;
			this.children_sigs_hmap[tweet.tx.signature] == 1;
			this.removeUnknownChild(tweet);

			//
			// make critical child if needed
			//
			if (this.isCriticalChild(tweet)) {
				this.critical_child = tweet;
			}

			tweet.user.notice =
				'new reply on ' + this.formatDate(tweet.updated_at);

			//
			// prioritize tweet-threads
			//
			if (tweet.tx.from[0].publicKey === this.tx.from[0].publicKey) {
				this.children.unshift(tweet);
			} else {
				this.children.push(tweet);
			}

			return 1;

			//
			// tweet belongs to a child
			//
		} else {
			for (let i = 0; i < this.children.length; i++) {
				if (this.children[i].hasChildTweet(tweet.parent_id)) {
					this.children[i].addTweet(tweet);
					this.children_sigs_hmap[tweet.tx.signature] = 1;
					this.removeUnknownChild(tweet);

					return 1;
				}
			}

			//
			// We failed to find the immediate parent
			//
			this.addUnknownChild(tweet);
		}

		return 1;
	}

	/////////////////////
	// query children  //
	/////////////////////
	hasChildTweet(tweet_sig) {
		if (this.tx.signature == tweet_sig) {
			return 1;
		}
		for (let i = 0; i < this.children.length; i++) {
			if (this.children[i].hasChildTweet(tweet_sig)) {
				return 1;
			}
		}

		return this.unknown_children_sigs_hmap[tweet_sig];
	}

	returnChildTweet(tweet_sig) {
		if (this.tx.signature == tweet_sig) {
			return this;
		}
		for (let i = 0; i < this.children.length; i++) {
			if (this.children[i].hasChildTweet(tweet_sig)) {
				return this.children[i].returnChildTweet(tweet_sig);
			}
		}

		if (this.unknown_children_sigs_hmap[tweet_sig]) {
			for (let i = 0; i < this.unknown_children.length; i++) {
				if (this.unknown_children[i].tx.signature == tweet_sig) {
					return this.unknown_children[i];
				}
			}
		}

		return null;
	}

	removeChildTweet(tweet_sig) {
		for (let i = 0; i < this.children.length; i++) {
			if (this.children[i].tx.signature === tweet_sig) {
				this.children[i].remove();
				this.children.splice(i, 1);
				this.children_sigs_hmap[tweet_sig] = 0;
				return;
			}
		}

		if (this.unknown_children_sigs_hmap[tweet_sig]) {
			for (let i = 0; i < this.unknown_children.length; i++) {
				if (this.unknown_children[i].tx.signature == tweet_sig) {
					this.unknown_children[i].remove();
					this.unknown_children.splice(i, 1);
					this.unknown_children_sigs_hmap[tweet_sig] = 0;
					return;
				}
			}
		}

		//Recursive search if not already found and deleted
		for (let i = 0; i < this.children.length; i++) {
			if (this.children[i].hasChildTweet(tweet_sig)) {
				this.children[i].removeChildTweet(tweet_sig);
			}
		}
	}

	addUnknownChild(tweet) {
		if (!this.unknown_children_sigs_hmap[tweet.tx.signature]) {
			this.unknown_children.push(tweet);
			this.unknown_children_sigs_hmap[tweet.tx.signature] = 1;
		}
	}

	removeUnknownChild(tweet) {
		if (this.unknown_children_sigs_hmap[tweet.tx.signature]) {
			for (let i = 0; i < this.unknown_children.length; i++) {
				if (
					this.unknown_children[i].tx.signature === tweet.tx.signature
				) {
					this.unknown_children.splice(i, 0);
					delete this.unknown_children_sigs_hmap[tweet.tx.signature];
				}
			}
		}
	}

	//
	// The critical child should be the most recent direct reply to a tweet
	// but we should prioritize our replies (better to see my snarky reply than the latest from some rando)
	//
	isCriticalChild(tweet) {
		if (tweet.thread_id !== this.thread_id) {
			return false;
		}
		if (this.critical_child == null) {
			return true;
		}
		if (tweet.tx.isFrom(this.mod.publicKey)) {
			return true;
		}
		if (
			tweet.tx.timestamp > this.critical_child.tx.timestamp &&
			!this.critical_child.tx.isFrom(this.mod.publicKey)
		) {
			return true;
		}
		return false;
	}

	async generateTweetProperties(app, mod, fetch_open_graph = 0) {
		if (!this.text) {
			return this;
		}

		let links = this.text.match(app.browser.urlRegexp());

		if (links != null && links.length > 0) {
			//
			// save the first link
			//
			let first_link = links[0].toString();
			if (!first_link.startsWith('http')) {
				first_link = 'http://' + first_link;
			}
			//console.log(first_link);

			if (typeof first_link == 'undefined') {
				return this;
			}

			let urlParams = null;

			try {
				let link = new URL(first_link);
				urlParams = new URLSearchParams(link.search);
				this.link = link.toString();
			} catch (err) {
				console.error(err);
				this.link = first_link;
			}

			//
			// youtube link
			//
			if (
				this.link.indexOf('youtube.com') != -1 ||
				this.link.indexOf('youtu.be') != -1
			) {
				let videoId = '';

				if (this.link.indexOf('youtu.be') != -1) {
					videoId = this.link.split('/');
					videoId = videoId[videoId.length - 1];
				} else if (urlParams) {
					videoId = urlParams.get('v');
				}

				//check for shorts
				let split = this.link.split('/shorts/');
				if (typeof split[1] != 'undefined') {
					videoId = split[1];
				}

				if (videoId != null && videoId != 'null') {
					this.youtube_id = videoId;
				}
				return this;
			}

			//
			// normal link
			//
			if (fetch_open_graph == 1) {
				//
				// Returns "" if a browser or error
				//
				let res = await mod.fetchOpenGraphProperties(
					app,
					mod,
					this.link
				);
				if (res !== '') {
					this.tx.optional.link_properties = res;
				}
			}
		}

		return this;
	}

	// like, retweet, comment
	refreshStat(stat, newCount) {
		// some edge cases where tweet won't have rendered
		try {
			let qs = `.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-${stat} .tweet-tool-${stat}-count`;
			Array.from(document.querySelectorAll(qs)).forEach((obj) => {
				let existing = parseInt(obj.innerHTML) || 0;
				if (newCount > existing) {
					obj.innerHTML = newCount;
				}
			});
		} catch (err) {
			console.log(`ERROR UPDATING ${stat}: ` + err);
		}
	}

	returnTransactionsInThread(limit = 10) {
		let txs = [];

		for (let i = 0; i < this.children.length; i++) {
			if (i >= limit) {
				break;
			}

			txs.push(this.children[i].tx.serialize_to_web(this.app));
		}

		return txs;
	}
}

module.exports = Tweet;
