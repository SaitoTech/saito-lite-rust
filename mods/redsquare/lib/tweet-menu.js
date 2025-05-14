const TweetMenuTemplate = require('./tweet-menu.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');

class TweetMenu {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod, false);

		app.connection.on('rs-show-tweet-options', (tweet, elem) => {
			this.tweet = tweet;
			this.tweeter = tweet.tx.from[0].publicKey;
			this.container = elem;
			this.render();
		});
	}

	render() {

		this.overlay.remove();
		let is_tweet_mine = false;
		if (this.tweet.tx.from[0].publicKey == this.mod.publicKey) { is_tweet_mine = true; }
		this.overlay.show(TweetMenuTemplate(this, this.tweet, is_tweet_mine), () => {
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
						case 'delete_tweet':
							this.tweet.deleteTweet();
							break;
						case 'edit_tweet':
							this.tweet.editTweet();
							break;
						case 'block_contact':
							this.blockContact();
							break;
						case 'report_tweet':
							await this.reportTweet();
							break;
						case 'show_tweet_info':
							this.showTweetInfo();
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

	showTweetInfo() {
		if (!this.tweet) { alert("No Info Available"); return; }
		if (!this.tweet.source) { alert("No Info Available"); return; }
		let info = "";
		if (this.tweet.source?.text) { info += "Source: " + this.tweet.source.text + "\n"; }
		if (this.tweet.source?.type) { info += "Type: " + this.tweet.source.type + "\n"; }
		if (this.tweet.source?.peer) { info += "Node: " + this.tweet.source.peer + "\n"; }
		alert(info);
	}

	blockContact() {
		//Also flag the tweet
		this.reportTweet();
		this.app.connection.emit('saito-blacklist', ({ publicKey : this.tweeter, duration : -1 })); // -1 is forever
		siteMessage('User blocked... reloading feed');
		reloadWindow(1500);
	}

	reportTweet() {
		//let wallet_balance = await this.app.wallet.getBalance('SAITO');

		// restrict moderation
		this.mod.sendFlagTransaction(
			this.app,
			this.mod,
			{ signature: this.tweet.tx.signature },
			this.tweet.tx
		);

		siteMessage('Reporting tweet to moderators...', 3000);

		this.tweet.hideTweet();
	}

}

module.exports = TweetMenu;
