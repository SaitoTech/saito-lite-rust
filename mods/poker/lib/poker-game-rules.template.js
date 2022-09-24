module.exports = (app, mod) => {

  let html = `<div class="rules-overlay">
    <div class="h1">Texas Hold'em</div>
    <p>This is a standard implementation of the popular poker game.</p>
    <p>Each player attempts to form the best hand with their two private cards (called "the hole") and the five public cards.</p>
    <p>Players are initially dealt their two secret cards and betting begins. The player to the left (clockwise) of the dealer is called the small blind and must bet the small blind, the player to his/her left (clockwise) is the big blind and must also bet. Any other players must fold, call the big blind, or raise the pot. Once all bets are called, the three public cards are flipped over (the "flop").</p>
    <p>Another round of betting then commences from the player to the left of the dealer. Players can fold, check (i.e. not increase the pot), raise, or call (i.e. match a raise). Another card (the "turn") is revealed followed by another round of betting, and the final card (the "river") is revealed with another round of betting. </p> 
    <p>Any remaining players after the final round of betting go into the showdown and the highest hand wins the pot.</p>
    <div class="h2">Poker Hands</div>
    <ul>
    <li><em>Straight Flush</em> is the best possible hand, where all the cards are of the same suit and continuous, with Ace high. A straight flush of A, K, Q, J, 10 is called a royal flush.</li>
    <li><em>Four of a Kind</em></li>
    <li><em>Full House</em>--three of a kind and a pair.</li>
    <li><em>Flush</em>--All five cards of of the same suit</li>
    <li><em>Straight</em>--the five cards are sequential in order (but not of the same suit)</li>
    <li><em>Three of a Kind</em></li>
    <li><em>Two Pair</em></li>
    <li><em>One Pair</em></li>
    <li><em>No Pair</em></li>
    </ul>
    </div>`;
    
  return html;

}

