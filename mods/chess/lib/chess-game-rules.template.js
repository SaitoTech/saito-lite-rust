module.exports = (app, mod) => {

    let html = `<div class="rules-overlay">
        <h1>Chess</h1>
        <p>Players attempt to box in the other player's king by sequentially moving pieces on the board. Each piece moves according to various rules (see below). When pieces move into a square occupied by an enemy piece, the enemy is captured. Except for the knight, pieces cannot pass through other pieces.</p>
        <h3>Pieces</h3>
        <ul><li>King: can move one space in any direction. Keep him safe!</li>
        <li>Queen: can move any number of spaces in any direction.</li>
        <li>Bishop: can move diagonally any number of spaces.</li>
        <li>Castle (Rook): can move vertically or horizontally any number of spaces.</li>
        <li>Knight (Horse): moves a 2+1 L shape. The knight is the only piece that can jump over other pieces.</li>
        <li>Pawn: moves forward one space. Move forward diagonally to attack an enemy piece. Can move forward 2 spaces on the first move. If a pawn reaches the back row, it can be exchanged for one of the other pieces.</li>
        </ul>
        <h3>Winning</h3>
        <p>If one of your pieces threatens the opponent's king (i.e. if your piece could move onto the king on the next turn), then the other player is said to be in a state of "CHECK" and must either move the king or another piece in order to get out of check. If a player has no legitimate move to get out of CHECK, then the game ends with CHECK MATE.</p>
        <h3>Special Moves</h3>
        <p><em>Castling.</em> If a player has never moved the king or castle (rook) piece and the spaces between them are empty, then the player may perform a castle. The king moves to the knight's starting position and the rook moves to the bishop's starting position.</p>
        <p><em>En passant.</em> If a player moves a pawn forward by two spaces into a position adjacent to an enemy pawn, then the enemy pawn may capture said pawn as if it had only moved forward one space.</p> 
    </div>
    `;
    return html;

}

