INTRODUCTION

This is an implement of HERE I STAND written for the open source Saito Game 
Engine. The game module is under development but supports both the two-player 
and six-player game variants. If you would like to help we could use assistance.

License information as purchase instructions are listed at the bottom of this
file. Please scroll down for that or read on for information on the differences
between this implementation and the standard game and information on known bugs
in the system.


DIFFERENCES:

The original game is so complicated that it is challenging to push all of the 
richness of choice into a digital version. Some trade-offs exist. This edition
aims to be as faithful as possible, but makes the following simplifications in
order to speed-up gameplay:

 - browsers will "automatically" respond "no" when asked if they want to play 
   event-response cards (like Wartburg) if they do not have those cards. This 
   speeds up gameplay at the cost of "leaking" info that the player does not
   hold that card. This feature can be disabled by switching into slow gameplay
   mode.

 - winter retreat is heavily automated, and overstacked units are returned to 
   faction capitals automatically. this simplifies winter phase for newer 
   players and avoids excessive complexity with token management.

 - the game engine automatically handles token denomination, merging smaller 
   units into larger ones as possible. units are not destroyed when combat 
   or movement splits a larger tokens, but if smaller tokens are not available
   the faction is registered as being in a state of "over-capacity" and cannot
   construct new units until the player is back under their token limit. 

 - current priorities are on getting the 2P version as flawless as possible. Once
   this is done we can move onto 6P game. Please report issues on RedSquare as
   possible.

 - Clement VII card can show up after he is removed from the deck.




LICENSE

All game module code released under the MIT license. All GMT-developed materials 
(board design, cards, gameplay text) remain owned by GMT Games and are distributed 
under their license which provides for gameplay and distribution under the 
following conditions:

    1. The game files may only be used by open source, non-commercial game engines

    2. At least ONE player in every game should have purchased a commercial copy of the game.

If you are a player or developer who enjoys playing around with this implementation, 
please respect the goodwill shown by GMT Games and purchase a copy of the game. 
Likewise, if you make this demo available for play on a public server, please make 
sure that any players you support can fulfill these conditions by making it easy for 
them to purchase commercial copies of the game.

GMT GAMES:
https://www.gmtgames.com/p-588-twilight-struggle-deluxe-edition-2016-reprint.aspx

AMAZON:
https://www.amazon.com/Here-I-Stand-Board-Game/dp/B077QTQGYQ




