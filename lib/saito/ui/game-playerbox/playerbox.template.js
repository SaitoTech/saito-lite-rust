module.exports = GamePlayerBoxTemplate = (obj) => {
  return `
    <div class="game-playerbox game-playerbox-${obj.seat_num} hide-scrollbar" id="game-playerbox-${obj.seat_num}">
      <div class="game-playerbox-head game-playerbox-head-${obj.seat_num} hide-scrollbar id="game-playerbox-head-${obj.seat_num}"></div>
      <div class="game-playerbox-body game-playerbox-body-${obj.seat_num} hide-scrollbar" id="game-playerbox-head-${obj.seat_num}"></div>
      </div>
    </div>
  `;
}

