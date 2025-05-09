const SaitoUser = require('./../../../lib/saito/ui/saito-user/saito-user');
const PostTemplate = require('./post.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');
const SaitoInput = require('./../../../lib/saito/ui/saito-input/saito-input');
const JSON = require('json-bigint');

class Post {
	constructor(app, mod, tweet = null) {

		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, true, true);
		this.parent_id = '';
		this.thread_id = '';
		this.images = [];
		this.tweet = tweet; //For reply or Retweet

		this.render_after_submit = 0;
		this.file_event_added = false;
		this.source = 'Post';
	}

	render(container = '') {

		this.container = container ? '.tweet-manager ' : '.saito-overlay ';
		this.id = container ? 'tweet-overlay-embedded' : 'tweet-overlay';

		console.log('Post render: ' + this.container);

		if (container) {
			if (document.getElementById(this.id)) {
				console.log('replace');
				this.app.browser.replaceElementById(
					PostTemplate(this.app, this.mod, this),
					this.id
				);
			} else {
				console.log('Insert post form');
				this.app.browser.addElementAfterSelector(PostTemplate(this.app, this.mod, this), container);
			}
		} else {
			//console.log('overlay');
			this.overlay.show(PostTemplate(this.app, this.mod, this));
			this.overlay.blockClose();
		}

		//
		//
		//

		if (!this.input) {
			this.input = new SaitoInput(this.app, this.mod, this.container + '.tweet-overlay-content', this.id);
		}

		if (!this.user) {
			this.user = new SaitoUser(
				this.app,
				this.mod,
				this.container + `.tweet-overlay-header`,
				this.mod.publicKey,
				`create a text-tweet${
					this.app.browser.isMobileBrowser() ? '' : ' or drag-and-drop images'
				}...`
			);
		}

		this.input.display = 'large';

		this.input.placeholder = "What's happening";
		if (this.source == 'Retweet') {
			this.input.placeholder = 'optional comment';
			this.user.notice = 'add a comment to your retweet or just click submit...';
		}

		if (this.source == 'Edit') {
			this.input.placeholder = this.tweet.text || '';
			this.user.notice = 'tweets are editable for a brief period after posting...';
		}

		if (this.source == 'Reply') {
			this.input.placeholder = 'my reply...';
			this.user.notice = 'add your comment to the tweet...';
		}

		this.input.callbackOnReturn = () => {
			this.postTweet();
		};

		this.input.callbackOnUpload = async (file) => {
			if (this.images.length >= 4) {
				salert('Maximum 4 images allowed per tweet.');
			} else if (file.includes('giphy.gif')) {
				this.addImg(file);
			} else {
				let type = file.substring(file.indexOf(':') + 1, file.indexOf(';'));
				if (this.mod.allowed_upload_types.includes(type)) {
					let resized_img = await this.app.browser.resizeImg(file);
					this.addImg(resized_img);
				} else {
					salert(
						`Cannot upload ${type} image! Allowed file types: ${this.mod.allowed_upload_types.join(
							', '
						)}`
					);
				}
			}
		};

		this.user.render();
		
		this.input.render();
		
		if (!this.app.browser.isMobileBrowser() || this.container == '.saito-overlay ') {
			console.log("Focus on post");
			this.input.focus(true);
		}

		if (this.source == 'Edit') {
			document.querySelector(this.container + '.post-tweet-textarea').innerHTML = this.tweet.text;
		}

		this.attachEvents();
	}

	triggerClick(querySelector) {
		//console.log(querySelector);
		//console.log(document.querySelector(querySelector));
		if (document.querySelector(querySelector)) {
			document.querySelector(querySelector).click();
		}
	}

	attachEvents() {
		let post_self = this;
		post_self.images = [];

		if (post_self.file_event_added == false) {
			post_self.app.browser.addDragAndDropFileUploadToElement(
				this.id,
				post_self.input.callbackOnUpload,
				false
			);
			post_self.file_event_added = true;
		}

		//
		if (document.querySelector(this.container + '.saito-file-uploader')) {
			document.querySelector(this.container + '.saito-file-uploader').style.display = 'none';
		}

		try {
			if (document.querySelector(this.container + '#post-delete-button')) {
				document
					.querySelector(this.container + '#post-delete-button')
					.addEventListener('click', (e) => {
						this.deleteTweet();
					});
			}
		} catch (err) {}
		try {
			document
				.querySelector(this.container + '#post-tweet-button')
				.addEventListener('click', (e) => {
					this.postTweet();
				});
		} catch (err) {}
	}

	async deleteTweet() {
		let keys = [];
		if (this?.tweet?.tx) {
			for (let i = 0; i < this.tweet.tx.to.length; i++) {
				if (!keys.includes(this.tweet.tx.to[i].publicKey)) {
					keys.push(this.tweet.tx.to[i].publicKey);
				}
			}
		}

		this.overlay.remove();

		this.app.browser.logMatomoEvent('RedSquare', 'Post', 'deleteTweet');

		data = { tweet_id: this.tweet.tx.signature };
		this.tweet.remove();
		let newtx = await this.mod.sendDeleteTransaction(this.app, this.mod, data, keys);
	}

	async postTweet() {
		let post_self = this;
		let text = this.input.getInput(false);

		let parent_id = document.querySelector(this.container + '#parent_id').value;
		let thread_id = document.querySelector(this.container + '#thread_id').value;
		let source = document.querySelector(this.container + '#source').value;
		let keys = [];
		let identifiers = [];

		//
		// sanity check
		//
		let wallet_balance = await this.app.wallet.getBalance('SAITO');

		// restrict moderation
		console.log(text);
		console.log('TEXT LENGTH: ' + text.length);
		if (wallet_balance == 0 && this.app.BROWSER == 1 && text.length > 5000) {
			this.app.browser.logMatomoEvent('RedSquare', 'Post', 'failure');
			siteMessage('Insufficient SAITO to Enable Oversized Posts...', 3000);
			return;
		}

		//
		//don't send empty posts
		//
		if (post_self.images.length == 0 && text.trim().length == 0 && post_self.source != 'Retweet') {
			siteMessage('Post Empty', 1000);
			return;
		}

		//
		// tweet data
		//
		let data = { text: text };
		let is_reply = false;

		keys = this.input.getMentions();

		if (keys.length > 0) {
			data['mentions'] = keys;
		}

		//
		// any previous recipients get added to "to"
		//
		if (post_self?.tweet?.tx) {
			for (let i = 0; i < post_self.tweet.tx.to.length; i++) {
				if (!keys.includes(post_self.tweet.tx.to[i].publicKey)) {
					keys.push(post_self.tweet.tx.to[i].publicKey);
				}
			}
		}

		//
		// saito-loader
		//
		post_self.overlay.remove();
		if (document.querySelector(this.container + '#' + this.id)) {
			document.querySelector(this.container + '#' + this.id).remove();
		}

		//Edit
		if (source === 'Edit') {
			data = { text: text, tweet_id: this.tweet.tx.signature };

			let qs =
				`.tweet-manager > .tweet-${this.tweet.tx.signature} .tweet-body .tweet-main .tweet-text`;
			let obj = document.querySelector(qs);
			
			if (obj) {
				obj.innerHTML = text;
			}

			let newtx = await post_self.mod.sendEditTransaction(post_self.app, post_self.mod, data, keys);

			this.app.browser.logMatomoEvent('RedSquare', 'Post', 'editTweet');
			return;
		}

		post_self.overlay.closebox = false;
		post_self.overlay.show('<div class="saito-loader"></div>');

		if (post_self.images.length > 0) {
			data['images'] = post_self.images;
		}

		//Replies
		if (parent_id !== '') {
			is_reply = true;

			this.app.browser.logMatomoEvent('RedSquare', 'Post', 'replyTweet');
			this.mod.replyTweet(this.tweet.tx.signature);
			data = Object.assign(data, {
				parent_id: parent_id,
				thread_id: thread_id,
				signature: parent_id
			});

			// We temporarily increase the number of replies, this affects the next rendering
			// but only adjust tx.optional when we get confirmation from the blockchain
			this.tweet.num_replies++;
		}

		//
		// We let the loader run for a half second to show we are sending the tweet
		// Start it up here because we may nope out of some rendering code for a pure retweet
		//
		setTimeout(() => {
			post_self.overlay.remove();

			if (!this.mod.browser_active) {
				siteMessage('Tweet sent', 1000);
			}
		}, 600);

		//Retweets
		if (source == 'Retweet') {
			data.signature = post_self.tweet.tx.signature;
			//save the tweet I am retweeting or replying to to my local archive
			this.mod.retweetTweet(this.tweet.tx.signature);
			this.app.browser.logMatomoEvent('RedSquare', 'Post', 'reTweet');

			// We temporarily increase the number of retweets, this affects the next rendering
			// but only adjust tx.optional when we get confirmation from the blockchain
			this.tweet.num_retweets++;

			if (data?.text || data?.images) {
				//
				// This is a quote tweet, treat as a sendTweet and attach original tweet as part of its content
				//
				data.retweet_tx = post_self.tweet.tx.serialize_to_web(this.app);
			} else {
				//
				// This is a pure retweet, treat similar to a like and send a specialize tx to update stats only
				//

				post_self.mod.sendRetweetTransaction(post_self.app, post_self.mod, data, this.tweet.tx);

				if (!this.tweet.retweeters.includes(post_self.mod.publicKey)){
					this.tweet.retweeters.unshift(post_self.mod.publicKey);	
				}

				if (this.mod?.main?.manager?.mode?.includes('tweet')) {
					this.tweet.render();
				}

				return;
			}
		}

		let newtx = await post_self.mod.sendTweetTransaction(post_self.app, post_self.mod, data, keys);

		if (source == 'Post') {
			this.app.browser.logMatomoEvent('RedSquare', 'Post', 'newTweet');
		}


		this.app.connection.emit('redsquare-render-new-post', newtx, this.tweet);

	}

	addImg(img) {
		let post_self = this;
		let html = `<div class="post-tweet-img-preview">
        				<img src="${img}"/>
        				<i class="fa fa-times"></i>
       				</div>`;

		this.app.browser.addElementToSelector(html, this.container + '#post-tweet-img-preview-container');
		this.images.push(img);

		// attach img preview event
		// event added here because img-prievew is added dynamically
		let sel = this.container + '.post-tweet-img-preview';
		document.querySelectorAll(sel).forEach((elem) => {
			elem.addEventListener('click', function (e) {
				e.preventDefault();
				e.stopImmediatePropagation();

				let array_position = e.target.getAttribute('data-id');
				e.target.parentNode.remove();
				post_self.images.splice(array_position, 1);
				document.querySelectorAll(this.container + '.post-tweet-img-preview').forEach((el2) => {
					let array_position2 = el2.getAttribute('data-id');
					if (array_position2 > array_position) {
						el2.setAttribute('data-id', array_position2 - 1);
					}
				});
			});
		});
	}
}

module.exports = Post;
