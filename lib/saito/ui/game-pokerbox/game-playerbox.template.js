module.exports  = (seat_num) => {
	return `
    <div class="player-box hide-scrollbar" id="player-box-${seat_num}">
      <div class="player-box-head player-box-head-${seat_num} hide-scrollbar" id="player-box-head-${seat_num}"></div>
      <div class="player-box-body player-box-body-${seat_num} hide-scrollbar" id="player-box-body-${seat_num}"></div>
      </div>
    </div>
  `;
};
