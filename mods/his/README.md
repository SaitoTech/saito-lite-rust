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
tries to be as faithful as possible, but makes the following simplifications:

 - browsers will "automatically" respond "no" when asked if they want to play 
   event-response cards (like Wartburg) if they do not have those cards. This 
   speeds up gameplay considerably, but the speed of response can "leak" info
   that the player does not hold that card. This feature can be disabled by 
   switching into slow gameplay move.

 - any overstacked units will be automatically returned to the Faction capital
   if said capital is under the control of the Faction itself. This is done to 
   in order to speed up the winter phrase, simplify gameplay for newer players
   and avoid excessive complexity in implementation rules required for handling
   edge-cases like equidistant. In the case of the Hapsburgs who have two capitals
   units will be split between them automatically.

 - winter attrition will automatically move overflow-units to the capital, which
   means that players concerned about regular / mercenary unit mix will lose 
   control over which units return. the current implementation keeps the oldest
   units and moves and "newer" ones back to the space.

 - the game engine will automatically arrange unit tokens on the board whenever
   the board is displayed in order to maximize the availability of small-
   denomination units. this removes most of the complexity around unit management
   at the cost of making some of the rules here less visible to new players.


BUG REPORTING

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




