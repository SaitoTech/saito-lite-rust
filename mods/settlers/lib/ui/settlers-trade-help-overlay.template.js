module.exports = (app, mod) => {
	let html = `<div class="rules-overlay saitoa">
              <div class="h1">Trading</div>
              <p>There are several mechanisms in the game to initiate trades, but two things should be noted. First, you are not technically allowed to initiate trades unless it is your turn, or at the very most, you may propose a trade to the player who turn it is. Secondly, double click anyone's name to open a chat window with them. This is a social game, and you can do all the wheeling and dealing you want simply by talking to the other players.</p>
              <div class="h2">Open Offers</div>
              <div>
                <img style="float:left; margin:1em;" src="/settlers/img/help/tradeBroadcast1.png">
                <p>On your turn, you can initiate a trade offer by selecting <em>Make Offer</em> from the Trade menu. This opens an interface where you can specify how many of which resources you want in exchange for what. Click the resource name to add resources to your tender and click the resource images to remove them. </p>
              </div>
              <img src="/settlers/img/help/tradeBroadcast2.png">
              <div>
              <img style="float:right; margin:1em;" src="/settlers/img/help/tradeBroadcast4.png">
              <p>If you have more than one opponent, you must wait until either all players have rejected your offer, or one of them has accepted it. The first player to click accept will complete the trade, and any subsequent players will be excluded from the trade. If you change your mind or are tired of waiting for your opponents to decide on the trade, you may "withdraw" the offer.</p>
              </div>
              <div class="h2">Incoming Offers</div>
              <p>In general, incoming trade offers take the following form:</p>
              <img src="/settlers/img/help/tradeBroadcast3.png">
              <p>Assuming you have the requested resources, you will have the choice to accept or reject the trade offer. If you don't have the enough resources, you still get to see the offer, and should close it so that the other player may continue with their turn.</p>
              <div>
                <img style="float:left; margin:1em;" src="/settlers/img/help/privateTrade1.png">
                <p>During an opponent's turn, when trading is allowed, you can open the private trading interface to propose an offer to them. You may only make one such offer, so it is best to communicate with them first through chat.</p>
              </div>
              <p>On your turn, you will be notified by an alert of any incoming trade offers, and the details will be summarized in your opponents player box.</p>
              <p>There may be multiple incoming offers to choose from. You may accept the trade as is, reject it, or completely ignore it and carry on with your turn. The offer automatically expires as soon as end the trading phase of your turn.</p>
              <img style="width:100%" src="/settlers/img/help/tradeIncomingOffer.png">
              <div class="h2">Passive Offers</div>
              <p>It is often the case that you desperately need a particular resource, or are flush with that resource. You are open to trading, but don't have anything in particular in mind. Nevertheless, it may be helpful for your opponents to know what you have and/or want so they can make an offer to you and you don't want to have to keep asking in the chat group "Does anyone have X?". If so, you can use the <em>Advertise</em> option from the trade menu to notify the other players about the state of your hand</p>
              <img src="/settlers/img/help/tradeAdvert2.png">
              <p>With this interface, you don't specify exact numbers, just which resources you want or have for trading.</p>
              <div>
              <img style="float:right;" src="/settlers/img/help/tradeAdvert3.png">
              <p>Your status will be reflected in your corresponding playerbox on your opponent's screen. On their turn or your turn, they may directly click your advertisement to open a "Private Trading Interface." They are under no obligation to respect your wishes and may counter your offer with any trade request. Your advertisement will persist across turns. You may select <em>Cancel</em> in the Trade menu to remove it. Note that sending a trade offer to a player on their turn will also clear your advertisment.</p>
              </div>
              
              </div>`;

	return html;
};
