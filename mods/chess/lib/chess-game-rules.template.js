module.exports = (app, mod) => {
	let html = `<div class="rules-overlay">
        <h4>Objective</h4>
        <p>Two players command opposing armies on a square battlefield in an attempt to capture the other player's king. 
            If your king is in danger, he is said to be in CHECK and you must get him out of danger. If you cannot, then the game ends with CHECKMATE</p>
        <h4>Pieces</h4>
        <p><em>King</em> (1): can move one space in any direction. Your most important piece, keep him safe!</p>
        <p><em>Queen</em> (1): can move any number of spaces in any direction. Your most powerful piece, acts like a castle and a bishop.</p>
        <p><em>Bishop</em> (2): can move diagonally any number of spaces.</p>
        <p><em>Rook</em> (2): can move vertically or horizontally any number of spaces. Is also sometimes called a Castle</p>
        <p><em>Knight</em> (2): moves in an "L" shape, 1 space in one direction and 2 spaces in the perpendicular direction. 
            The knight is the only piece that can jump over other pieces and not be blocked.</p>
        <p><em>Pawn</em> (8): moves forward one space, but attacks on a diagonal. Can move forward 2 spaces on the first move. 
            If a pawn reaches the back row, it can be exchanged for one of the other pieces.</p>
        <h5>Special Moves</h5>
        <p><em>Castling</em>: If a player has never moved their KING or ROOK and the spaces between them are empty, 
                then the player may perform a CASTLE by moving the king the knight's starting position and the rook to the bishop's starting position.</p>
        <p><em>En passant</em>: If a player moves a pawn forward by two spaces into a position adjacent to an enemy pawn, 
            then the enemy pawn may capture said pawn as if it had only moved forward one space.</p> 
    </div>
    `;
	return html;
};
