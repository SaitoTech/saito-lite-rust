module.exports = (app, mod) => {

    return `<div class="rules-overlay">
    <div class="h1">Homestyle Blackjack</div>
    <p><strong>Homestyle Blackjack is quite different from Casino Blackjack. </strong></p>
    <p>The game is played with a single deck (shuffled between each round) and <strong>each player takes turns as dealer</strong>, acting as the house against the other players. This means the dealer stakes the bets of all the other players. <strong>Each player is dealt a single card and given the chance to place a bet.</strong> After all the players (excluding the dealer) have placed their bets, one more card is dealt face up and gameplay begins.</p>
    <p>Beginning to the left of the dealer, each player takes a turn, at which time all other players may view their full hand. Players may hit (take another card) or stand (end their turn). Players may hit as many times as they like, but they lose if they exceed 21 points (bust).
    Cards are scored as usual per the number value and with J, Q, and K counting as 10. Aces count as either 1 or 11. If the player busts, the dealer immediately collects their bet and the player loses. The dealer is the last to play and may use their discretion, i.e. no mandatory casino rule of hitting below 17. If the dealer busts, remaining players win automatically. Any player with a higher score than the dealer wins their bet. <strong>The dealer wins all ties.</strong></p>
    <p>Blackjacks--21 points with two cards--<strong>pay 2:1!</strong></p>
    </div>`;

}

