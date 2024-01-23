INTRODUCTION

This is an implement of HERE I STAND written for the open source Saito Game Engine. The game supports both the two-player and six-player game variant rules. The codebase is under community development - if you'd like ot help we could use assistance.

PURPOSE

As a fan of GMT Games and Here I Stand, our hope is that this module helps introduce new players to the company and the game. Please see the /licence directory for legalese. The code that implements the game rules is released under the MIT license for all uses atop the Saito Game Engine. All GMT-developed materials (board design, cards, gameplay text) remain owned by GMT Games and are distributed under their license which provides for gameplay and distribution under the following conditions:

    1. The game files may only be used by open source, non-commercial game engines

    2. At least ONE player in every game should have purchased a commercial copy of the game.

If you are a player or developer who enjoys playing around with this implementation, please respect the goodwill shown by GMT Games and purchase a copy of the game. Likewise, if you make this demo available for play on a public server, please make sure that any players you support can fulfill these conditions by making it easy for them to purchase commercial copies of the game.

GMT GAMES:
https://www.gmtgames.com/p-588-twilight-struggle-deluxe-edition-2016-reprint.aspx

AMAZON:
https://www.amazon.com/Here-I-Stand-Board-Game/dp/B077QTQGYQ

CODE:

//
// given a space, result an array of results
//
let res = this.returnNearestSpaceWithFilter(
// where do we start
"dijon",

    // is this what we are looking for?
    function(spacekey) {
      if (his_self.game.spaces[spacekey].type === "fortress") { return 1; }
      return 0;
    },

    // should traverse through when searching?
    function(spacekey) {
      return 1;
    }

);
