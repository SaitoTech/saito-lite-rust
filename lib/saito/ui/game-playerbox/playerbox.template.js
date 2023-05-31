module.exports = GamePlayerBoxTemplate = (seat_num) => {
  return `
    <div class="playerbox playerbox-${seat_num} hide-scrollbar">
      <div class="playerbox-head playerbox-head-${seat_num} hide-scrollbar"></div>
      <div class="playerbox-body playerbox-body-${seat_num} hide-scrollbar"></div>
      </div>
    </div>
  `;
}

