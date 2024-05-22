const LikeNotificationTemplate = require('./notification-like.template');
const ReplyNotificationTemplate = require('./notification-reply.template');
const saito = require('./../../../lib/saito/saito');
const Tweet = require('./tweet');
const SaitoUser = require('./../../../lib/saito/ui/saito-user/saito-user');
const Image = require('./image');

class RedSquareNotification {
	constructor(app, mod, tx = null) {
		this.app = app;
		this.mod = mod;
		this.tx = tx;
		this.user = null;
	}

	render(selector = '') {
		if (this.tx == null) {
			document.querySelector(selector).innerHTML =
				'<div class="saito-end-of-redsquare">no notifications</div>';
		} else {
			let html = '';

			let txmsg = this.tx.returnMessage();

			//
			// We put the entire render in a callback so that if we don't have the original tweet being referenced by the
			// notification, we can make a peer DB request to try to find it
			//

			if (txmsg.data?.signature) {
				this.mod.loadTweetWithSig(txmsg.data.signature, (txs) => {
					if (!txs) {
						console.log('Notification for unknown tweet');
						return null;
					}

					let tweet_tx;
					if (Array.isArray(txs)) {
						if (txs.length > 0) {
							tweet_tx = txs[0];
						} else {
							console.log('Notification for unknown tweet');
							return null;
						}
					} else {
						tweet_tx = txs;
					}

					this.renderNotificationTweet(txmsg, tweet_tx);
				});
			} else {
				this.renderNotificationTweet(txmsg, this.tx);
			}
		}
	}

	renderNotificationTweet(txmsg, tweet_tx) {
		if (
			txmsg.data?.mentions?.includes(this.mod.publicKey) ||
			txmsg.data?.mentions == 1
		) {
			this.tweet = new Tweet(this.app, this.mod, tweet_tx);
		} else {
			if (txmsg.request == 'like tweet' || txmsg.request == 'retweet') {
				//Process as normal
				let keyword =
					txmsg.request == 'like tweet' ? 'liked' : 'retweeted';

				this.tweet = new Tweet(
					this.app,
					this.mod,
					tweet_tx,
					`.tweet-notif-fav.notification-item-${this.tx.from[0].publicKey}-${txmsg.data.signature} .tweet-body .tweet-main .tweet-preview`
				);

				this.user = new SaitoUser(
					this.app,
					this.mod,
					`.notification-item-${this.tx.from[0].publicKey}-${txmsg.data.signature} > .tweet-header`,
					this.tx.from[0].publicKey
				);

				let qs = `.tweet-notif-fav.notification-item-${this.tx.from[0].publicKey}-${txmsg.data.signature}`;
				let obj = document.querySelector(qs);
				if (obj) {
					obj.innerHTML = obj.innerHTML.replace(
						`${keyword} `,
						`really ${keyword} `
					);

					//We process multiple likes from same person of same tweet, just update html in situ and quit
					return;
				} else {
					html = LikeNotificationTemplate(
						this.app,
						this.mod,
						this.tx
					);
					let msg = `${keyword} your tweet`;

					if (this.mod.publicKey != tweet_tx.from[0].publicKey) {
						msg = `${keyword} a tweet sent to you`;
					}

					this.user.notice = `</i> <span class='notification-type'>${msg}</span>`;
				}
			} else if (txmsg.request == 'create tweet') {
				this.tweet = new Tweet(
					this.app,
					this.mod,
					tweet_tx,
					`.notification-item-${this.tx.signature} .tweet-body .tweet-main .tweet-preview`
				);
				this.user = new SaitoUser(
					this.app,
					this.mod,
					`.notification-item-${this.tx.signature} > .tweet-header`,
					this.tx.from[0].publicKey
				);

				html = ReplyNotificationTemplate(this.app, this.mod, this.tx);

				//
				// retweet
				//
				if (txmsg.data.retweet_tx) {
					let msg = 'retweeted your tweet';

					if (this.mod.publicKey != tweet_tx.from[0].publicKey) {
						msg = 'retweeted a tweet concerning you';
					}

					this.user.notice = `<span class='notification-type'>${msg}</span>`;

					//
					// or reply
					//
				} else {
					let msg = 'replied to your tweet';

					if (this.mod.publicKey != tweet_tx.from[0].publicKey) {
						msg = 'replied to a tweet concerning you';
					}

					this.user.notice = `<span class='notification-type'>${msg}</span>`;
				}
			} else {
				console.log('Unknown Notification type: ', txmsg.request);
				return null;
			}

			if (!this.tweet?.noerrors) {
				return null;
			}

			//
			//
			//
			let nqs = '.notification-item-' + this.tx.signature;
			if (document.querySelector(nqs)) {
				this.app.browser.replaceElementBySelector(html, nqs);
			} else {
				this.app.browser.addElementToSelector(html, '.tweet-manager');
			}

			//
			// and render the user
			//
			if ((new Date().getTime() - this.tx.timestamp) > (24 * 60 * 60 * 100)){
				this.user.fourthelem = this.app.browser.prettifyTimeStamp(this.tx.timestamp, true);
			}else{
				this.user.fourthelem = this.app.browser.returnTime(this.tx.timestamp);
			}

			this.user.render();

			// check and render images if any in notification
			if (txmsg.data?.images) {
				let img_preview = new Image(
					this.app,
					this.mod,
					`.notification-item-${this.tx.signature} .tweet-body .tweet-main .notification-tweet`,
					txmsg.data?.images,
					tweet_tx.signature
				);

				img_preview.render();
			}
		}

		this.tweet.show_controls = 0;
		this.tweet.render();

		this.attachEvents();
	}

	attachEvents() {
		Array.from(document.querySelectorAll('.tweet')).forEach(
			(obj) => {
				obj.onclick = (e) => {
					let sig = e.currentTarget.getAttribute('data-id');
					let tweet = this.mod.returnTweet(sig);

					if (tweet) {
						this.app.connection.emit(
							'redsquare-tweet-render-request',
							tweet
						);
					} else {
						//
						// I'm not sure we would ever run into this situation
						// Besides wounldn't the this.tweet be the one we are looking for... why even go through the DOM dataset?
						//
						console.log('Notification tweet not found...');

						this.mod.loadTweetWithSig(sig, () => {
							let tweet = this.mod.returnTweet(sig);
							this.app.connection.emit(
								'redsquare-tweet-render-request',
								tweet
							);
						});
					}
				};
			}
		);
	}

	isRendered() {
		//if (document.querySelector(`.notification-item-${this.tx.signature}`)) {
		//  return true;
		//}
		return false;
	}
}

module.exports = RedSquareNotification;
