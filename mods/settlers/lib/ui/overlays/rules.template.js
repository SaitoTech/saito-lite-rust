module.exports  = (rules, theme="") => {
	return `
  <div class="rules-overlay ${theme}">
  <h4>Overview<h4>
  <p>The game mechanics should be familiar to anyone who has played resource-acquisition boardgames based on trading and building.</p>
  <h4>Set up<h4>
  <p>Each player gets to place 2 ${rules.mod.c1.name}s and 2 adjoining ${	rules.mod.r.name}s anywhere on the board during the initial setup. 
  			<em>Note: </em> ${	rules.mod.c1.name}s may not be placed on adjacent corners (i.e. only seperated by a single ${	rules.mod.r.name}, 
  			whether or not one is actually built).
  </p>
  <p>The order of placement reverses so that last player to place their first ${rules.mod.c1.name} is the first to place their second ${rules.mod.c1.name}. 
  	Each player starts with resource cards from the tiles adjacent to their second placed ${rules.mod.c1.name}.
  </p>
  <h4>Game Play</h4>
  <p>Each player's turn consists of a number of moves: roll, trade, build, buy card, play card. They begin by rolling the dice. 
  		The number of the roll determines which tiles produce resources (see section on ${rules.mod.b.name}). 
  		Players with ${	rules.mod.c1.name}s on the producing tiles collect resources from those tiles.
  </p>
  <p>Players may then trade with each other or with the "bank." 
  		Trades with the bank require 4 identical resources to be exchanged for any other resource. 
  		However, if players have a ${	rules.mod.c1.name} adjacent to a trade ship, they can get a better rate with the "bank." 
  		There are no restrictions on trades between players, who may trade any number of resources. 
  		Once a player has bought a card or built something, they may no longer make trades during their turn. 
  		All trades must involve the player whose turn it is.
  </p>
  <h4>Building and Costs</h4>
  <p>After the player is satisfied with their trades (if any), they may build something or purchase a ${	rules.mod.card.name} card. 
  		Players must have sufficient resources to afford the purchases, as defined below:
  </p>
  <ul style="margin-left:2em"> 
	  <li>A ${rules.mod.r.name} costs ${rules.mod.priceList[0].join(', ')}</li>
	  <li>A ${rules.mod.c1.name} costs ${rules.mod.priceList[1].join(', ')}</li>
	  <li>A ${rules.mod.c2.name} costs ${rules.mod.priceList[2].join(', ')}</li>
	  <li>A ${rules.mod.card.name} card costs ${rules.mod.priceList[3].join(', ')}</li>
	</ul>
  <p> A ${rules.mod.c2.name} replaces an already built ${rules.mod.c1.name} and collects double the resources of a ${rules.mod.c1.name}.</p>
  <h4 style="text-transform:capitalize">${rules.mod.b.name}</h4>
  <p>If a 7 is rolled, the ${rules.mod.b.name} comes into play. 
  	The ${rules.mod.b.name} does 3 things. First, any players with more than 7 resource cards must discard half their hand. 
  	Second, the rolling player may move the ${ rules.mod.b.name } to any tile. The ${	rules.mod.b.name } may steal one resource from 
  	any player with a ${rules.mod.c1.name} or ${ rules.mod.c2.name} adjacent to the affected tile. 
  	Third, that tile is deactivate by the presence of the ${rules.mod.b.name} and will not produce resources until 
  	the ${	rules.mod.b.name} is moved. The ${rules.mod.b.name} will be moved on the next roll of a 7 or if a player purchases 
  	and plays a ${ rules.mod.s.name} from the ${rules.mod.card.name} cards.
  </p>
  <h4 style="text-transform:capitalize">${rules.mod.card.name} cards</h4>
  <p>There are many kinds of ${	rules.mod.card.name} cards, though the aforementioned ${ rules.mod.s.name} is the most common type. 
  		Some allow the player to perform a special action (such as building additional ${	rules.mod.r.name} at no cost or 
  		collecting additional resources), while others give the player an extra ${ rules.mod.vp.name}. Players may play a 
  		${ rules.mod.card.name} card at any time during their turn (including before the roll), but may only play one per turn 
  		and only on the turn after purchasing it. ${ rules.mod.card.name} cards which give +1 ${ rules.mod.vp.name} are exempt 
  		from these restrictions.
  </p>
  <h4>Winning the Game</h4>
  <p>${	rules.mod.vp.name} are important because the first player to accumulate 10 ${	rules.mod.vp.name} is declared the winner of the game. 
  	Players earn 1 ${	rules.mod.vp.name} per ${rules.mod.c1.name} and 2 ${rules.mod.vp.name}s for every ${ rules.mod.c2.name} they have built. 
  	There are also two special achievements worth 2 ${ rules.mod.vp.name }s each.
  </p>
  <p> The player with the longest contiguous ${	rules.mod.r.name } of at least 5 is awarded the "${	rules.mod.longest.name}" badge. 
  		Similarly, if a player accumulates at least 3 ${ rules.mod.s.name}s, they are awarded the "${	rules.mod.largest.name}" badge. 
  		Only one player may hold either badge, and other players must surpass them to claim it for themselves.
  </p>
  <h4>FAQ</h4>
  <dl>
  <dt>Why can't I build a ${rules.mod.c1.name}?</dt>
  <dd>In order to build a ${rules.mod.c1.name}, you have to satisfy several requirements. 
  		Firstly, you must have all the resources required to build. 
  		Secondly, you must have an available spot on the board, 
  		which is both connected to one of your roads and not adjacent to any other 
  		${	rules.mod.c1.name}s or ${rules.mod.c2.name}s. 
  		Thirdly, you many only have up to 5 ${ rules.mod.c1.name}s on the board at any time. 
  		Try upgrading one of your ${ rules.mod.c1.name}s to a ${rules.mod.c2.name}. </dd>
  <dt>Why can't I build a ${rules.mod.c2.name}?</dt>
  <dd>See the above answer, but note that you are limited to 4 ${	rules.mod.c2.name}s on the board.</dd>
  </dl>
  </div>
  `;
};
