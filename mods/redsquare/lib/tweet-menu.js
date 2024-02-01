const TweetMenuTemplate = require('./tweet-menu.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');

class TweetMenu {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod, false);

		app.connection.on("rs-show-tweet-options", (tweet, elem) => {

			//let tweet_id = tweet.tx.signature;

			this.tweet = tweet;
			this.tweeter = tweet.tx.from[0].publicKey;
			this.container = elem;
			this.render();
		})
	}

	render(){

		this.overlay.remove();
		this.overlay.show(TweetMenuTemplate(this), ()=>{this.close();});

	    let reference = this.container.getBoundingClientRect();
	    console.log(reference.top, reference.left);

	    let new_top = Math.max(0, Math.round(reference.top) - 260);
	    let new_left = Math.max(0, Math.round(reference.left) - 280);

		this.overlay.move(new_top, new_left);
		this.overlay.setBackgroundColor("#0003");
		this.attachEvents();
	}

	attachEvents(){
	}

	close(){
		this.tweet = null;
		this.container = null;
	}
}

module.exports = TweetMenu;