module.exports = (app, mod) => {
	return `
			<div class="gameboard">
			<div class="logobox">
				<img src="/solitrio/img/logo_solitrio_small.png" />
				<div id="status" class="status hidable">
					Loading the game...
				</div>
				<div id="controls" class="controls"></div>
			</div>
			<div class="rowbox" id="rowbox">
				<div class="slot" id="row1_slot1"></div>
				<div class="slot" id="row1_slot2"></div>
				<div class="slot" id="row1_slot3"></div>
				<div class="slot" id="row1_slot4"></div>
				<div class="slot" id="row1_slot5"></div>
				<div class="slot" id="row1_slot6"></div>
				<div class="slot" id="row1_slot7"></div>
				<div class="slot" id="row1_slot8"></div>
				<div class="slot" id="row1_slot9"></div>
				<div class="slot" id="row1_slot10"></div>

				<div class="slot" id="row2_slot1"></div>
				<div class="slot" id="row2_slot2"></div>
				<div class="slot" id="row2_slot3"></div>
				<div class="slot" id="row2_slot4"></div>
				<div class="slot" id="row2_slot5"></div>
				<div class="slot" id="row2_slot6"></div>
				<div class="slot" id="row2_slot7"></div>
				<div class="slot" id="row2_slot8"></div>
				<div class="slot" id="row2_slot9"></div>
				<div class="slot" id="row2_slot10"></div>

				<div class="slot" id="row3_slot1"></div>
				<div class="slot" id="row3_slot2"></div>
				<div class="slot" id="row3_slot3"></div>
				<div class="slot" id="row3_slot4"></div>
				<div class="slot" id="row3_slot5"></div>
				<div class="slot" id="row3_slot6"></div>
				<div class="slot" id="row3_slot7"></div>
				<div class="slot" id="row3_slot8"></div>
				<div class="slot" id="row3_slot9"></div>
				<div class="slot" id="row3_slot10"></div>

				<div class="slot" id="row4_slot1"></div>
				<div class="slot" id="row4_slot2"></div>
				<div class="slot" id="row4_slot3"></div>
				<div class="slot" id="row4_slot4"></div>
				<div class="slot" id="row4_slot5"></div>
				<div class="slot" id="row4_slot6"></div>
				<div class="slot" id="row4_slot7"></div>
				<div class="slot" id="row4_slot8"></div>
				<div class="slot" id="row4_slot9"></div>
				<div class="slot" id="row4_slot10"></div>
			</div>
		</div>
`;
}