module.exports = (app, mod) => {
	let html = `
      <div class="rules-overlay">
      <div class="intro">
      <div class="h1">Wordblocks</div>
      <p>Wordblocks is a crossword puzzle spelling game, similar to the classic boardgame.</p> 
      <p>Players take turns spelling words using the seven letters in their tile rack and available space on the game board. The game ends when one player finishes all the letters in their rack and there are no remaining tiles to draw. The player with the highest score wins!</p>
      <p>Words must be at least two letters in length and connect to an already played letter. Players may discard any number of tiles from their rack in lieu of playing a word.</p>
      <p>Words are checked against a dictionary for validity. You may select the dictionary in the advanced options.</p>
      <div class="h2">Scoring</div>
      <p>Each letter is worth the number of points indicated on the tile. The score for the word is the sum of point values of its letters, which may be affected by playing the word over bonus spaces on the board. There are bonus spaced that double or triple the point value of a single letter or the entire word.</p>
      <p>If you use all 7 tiles in one play, you receive 10 additional points to the letter score and a +1 multiple on the overall word score.</p>
      <p>Good luck and happy spelling!</p>
      </div></div>`;
	return html;
};
