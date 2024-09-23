const TweetMenuTemplate = require('./tweet-menu.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');

class TweetMenu {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod, false);

		app.connection.on('rs-show-tweet-options', (tweet, elem) => {
			//let tweet_id = tweet.tx.signature;

			this.tweet = tweet;
			this.tweeter = tweet.tx.from[0].publicKey;
			this.container = elem;
			this.render();
		});
	}

	render() {

		this.overlay.remove();
		this.overlay.show(TweetMenuTemplate(this), () => {
			this.close();
			if (document.querySelector(".activated-dot-menu")){
				document.querySelector(".activated-dot-menu").classList.remove("activated-dot-menu");
			}
		});

		let reference = this.container.getBoundingClientRect();

		let new_top = Math.max(0, Math.round(reference.top) - 190);
		let new_left = Math.max(0, Math.round(reference.right) - 280);

		this.overlay.move(new_top, new_left);
		this.overlay.setBackgroundColor('#0003');
		this.attachEvents();
	}

	attachEvents() {
		Array.from(document.querySelectorAll('.tweet-menu-list-item')).forEach(
			(item) => {
				item.onclick = async (e) => {
					console.log(e.currentTarget);
					switch (e.currentTarget.getAttribute('id')) {
						case 'follow_contact':
							this.mod.sendFollowTransaction(this.tweeter);
							break;
						case 'unfollow_contact':
							this.mod.sendUnfollowTransaction(this.tweeter);
							break;
						case 'block_contact':
							this.blockContact();
							break;
						case 'report_tweet':
							await this.reportTweet();
							break;
						case 'hide_tweet':
							this.hideTweet();
					}

					this.overlay.close();
				};
			}
		);
	}

	close() {
		this.tweet = null;
		this.container = null;
	}

	blockContact() {
		this.app.connection.emit('saito-blacklist', ({ publicKey : this.tweeter, duration : -1 })); // -1 is forever
		siteMessage('User blocked... reloading feed');
		setTimeout(() => {
			setTimeout(() => {
				window.location.reload();
			}, 200);
		}, 2000);
	}

	async reportTweet() {
		let wallet_balance = await this.app.wallet.getBalance('SAITO');

		// restrict moderation
		if (wallet_balance) {
			this.mod.sendFlagTransaction(
				this.app,
				this.mod,
				{ signature: this.tweet.tx.signature },
				this.tweet.tx
			);

			siteMessage('Reporting tweet to moderators...', 3000);
		} 

		this.hideTweet();
	}

	hideTweet() {
		this.app.storage.deleteTransaction(this.tweet.tx, null, 'localhost');
		this.tweet.remove();

		this.mod.hidden_tweets.push(this.tweet.tx.signature);
		this.mod.saveOptions();
	}
}

module.exports = TweetMenu;
