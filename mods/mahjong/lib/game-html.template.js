module.exports = (app, mod) => {
	return `
		<div class="gameboard">
			<div class="logobox">
				<img src="/mahjong/img/arcade/arcade-banner-background.png" />
				<div id="status" class="status hidable"></div>
				<div id="controls" class="controls"></div>
				<div id="tiles" class="tiles hidable"></div>
			</div>

			<div class="mahj-rowbox" id="mahj-rowbox">
				<div class="mahjong-backdrop"></div>
				<div class="invisible slot row1" id="row1_slot1"></div>
				<div class="invisible slot row1" id="row1_slot2"></div>
				<div class="invisible slot row1" id="row1_slot3"></div>
				<div class="invisible slot row1" id="row1_slot4"></div>
				<div class="invisible slot row1" id="row1_slot5"></div>
				<div class="invisible slot row1" id="row1_slot6"></div>
				<div class="invisible slot row1" id="row1_slot7"></div>
				<div class="invisible slot row1" id="row1_slot8"></div>
				<div class="invisible slot row1" id="row1_slot9"></div>
				<div class="invisible slot row1" id="row1_slot10"></div>
				<div class="invisible slot row1" id="row1_slot11"></div>
				<div class="invisible slot row1" id="row1_slot12"></div>
				<div class="invisible slot row1" id="row1_slot13"></div>
				<div class="invisible slot row1" id="row1_slot14"></div>

				<div class="invisible slot row2" id="row2_slot1"></div>
				<div class="invisible slot row2" id="row2_slot2"></div>
				<div class="invisible slot row2" id="row2_slot3"></div>
				<div class="invisible slot row2" id="row2_slot4"></div>
				<div class="invisible slot row2" id="row2_slot5"></div>
				<div class="invisible slot row2" id="row2_slot6"></div>
				<div class="invisible slot row2" id="row2_slot7"></div>
				<div class="invisible slot row2" id="row2_slot8"></div>
				<div class="invisible slot row2" id="row2_slot9"></div>
				<div class="invisible slot row2" id="row2_slot10"></div>
				<div class="invisible slot row2" id="row2_slot11"></div>
				<div class="invisible slot row2" id="row2_slot12"></div>
				<div class="invisible slot row2" id="row2_slot13"></div>
				<div class="invisible slot row2" id="row2_slot14"></div>

				<div class="invisible slot row3" id="row3_slot1"></div>
				<div class="invisible slot row3" id="row3_slot2"></div>
				<div class="invisible slot row3" id="row3_slot3"></div>
				<div class="invisible slot row3" id="row3_slot4"></div>
				<div class="invisible slot row3" id="row3_slot5"></div>
				<div class="invisible slot row3" id="row3_slot6"></div>
				<div class="invisible slot row3" id="row3_slot7"></div>
				<div class="invisible slot row3" id="row3_slot8"></div>
				<div class="invisible slot row3" id="row3_slot9"></div>
				<div class="invisible slot row3" id="row3_slot10"></div>
				<div class="invisible slot row3" id="row3_slot11"></div>
				<div class="invisible slot row3" id="row3_slot12"></div>
				<div class="invisible slot row3" id="row3_slot13"></div>
				<div class="invisible slot row3" id="row3_slot14"></div>

				<div class="invisible slot row4" id="row4_slot1"></div>
				<div class="invisible slot row4" id="row4_slot2"></div>
				<div class="invisible slot row4" id="row4_slot3"></div>
				<div class="invisible slot row4" id="row4_slot4"></div>
				<div class="invisible slot row4" id="row4_slot5"></div>
				<div class="invisible slot row4" id="row4_slot6"></div>
				<div class="invisible slot row4" id="row4_slot7"></div>
				<div class="invisible slot row4" id="row4_slot8"></div>
				<div class="invisible slot row4" id="row4_slot9"></div>
				<div class="invisible slot row4" id="row4_slot10"></div>
				<div class="invisible slot row4" id="row4_slot11"></div>
				<div class="invisible slot row4" id="row4_slot12"></div>
				<div class="invisible slot row4" id="row4_slot13"></div>
				<div class="invisible slot row4" id="row4_slot14"></div>

				<div class="invisible slot row5" id="row5_slot1"></div>
				<div class="invisible slot row5" id="row5_slot2"></div>
				<div class="invisible slot row5" id="row5_slot3"></div>
				<div class="invisible slot row5" id="row5_slot4"></div>
				<div class="invisible slot row5" id="row5_slot5"></div>
				<div class="invisible slot row5" id="row5_slot6"></div>
				<div class="invisible slot row5" id="row5_slot7"></div>
				<div class="invisible slot row5" id="row5_slot8"></div>
				<div class="invisible slot row5" id="row5_slot9"></div>
				<div class="invisible slot row5" id="row5_slot10"></div>
				<div class="invisible slot row5" id="row5_slot11"></div>
				<div class="invisible slot row5" id="row5_slot12"></div>
				<div class="invisible slot row5" id="row5_slot13"></div>
				<div class="invisible slot row5" id="row5_slot14"></div>

				<div class="invisible slot row6" id="row6_slot1"></div>
				<div class="invisible slot row6" id="row6_slot2"></div>
				<div class="invisible slot row6" id="row6_slot3"></div>
				<div class="invisible slot row6" id="row6_slot4"></div>
				<div class="invisible slot row6" id="row6_slot5"></div>
				<div class="invisible slot row6" id="row6_slot6"></div>
				<div class="invisible slot row6" id="row6_slot7"></div>
				<div class="invisible slot row6" id="row6_slot8"></div>
				<div class="invisible slot row6" id="row6_slot9"></div>
				<div class="invisible slot row6" id="row6_slot10"></div>
				<div class="invisible slot row6" id="row6_slot11"></div>
				<div class="invisible slot row6" id="row6_slot12"></div>
				<div class="invisible slot row6" id="row6_slot13"></div>
				<div class="invisible slot row6" id="row6_slot14"></div>

				<div class="invisible slot row7" id="row7_slot1"></div>
				<div class="invisible slot row7" id="row7_slot2"></div>
				<div class="invisible slot row7" id="row7_slot3"></div>
				<div class="invisible slot row7" id="row7_slot4"></div>
				<div class="invisible slot row7" id="row7_slot5"></div>
				<div class="invisible slot row7" id="row7_slot6"></div>
				<div class="invisible slot row7" id="row7_slot7"></div>
				<div class="invisible slot row7" id="row7_slot8"></div>
				<div class="invisible slot row7" id="row7_slot9"></div>
				<div class="invisible slot row7" id="row7_slot10"></div>
				<div class="invisible slot row7" id="row7_slot11"></div>
				<div class="invisible slot row7" id="row7_slot12"></div>
				<div class="invisible slot row7" id="row7_slot13"></div>
				<div class="invisible slot row7" id="row7_slot14"></div>

				<div class="invisible slot row8" id="row8_slot1"></div>
				<div class="invisible slot row8" id="row8_slot2"></div>
				<div class="invisible slot row8" id="row8_slot3"></div>
				<div class="invisible slot row8" id="row8_slot4"></div>
				<div class="invisible slot row8" id="row8_slot5"></div>
				<div class="invisible slot row8" id="row8_slot6"></div>
				<div class="invisible slot row8" id="row8_slot7"></div>
				<div class="invisible slot row8" id="row8_slot8"></div>
				<div class="invisible slot row8" id="row8_slot9"></div>
				<div class="invisible slot row8" id="row8_slot10"></div>
				<div class="invisible slot row8" id="row8_slot11"></div>
				<div class="invisible slot row8" id="row8_slot12"></div>
				<div class="invisible slot row8" id="row8_slot13"></div>
				<div class="invisible slot row8" id="row8_slot14"></div>

				<div class="invisible slot row9" id="row9_slot1"></div>
				<div class="invisible slot row9" id="row9_slot2"></div>
				<div class="invisible slot row9" id="row9_slot3"></div>
				<div class="invisible slot row9" id="row9_slot4"></div>
				<div class="invisible slot row9" id="row9_slot5"></div>
				<div class="invisible slot row9" id="row9_slot6"></div>
				<div class="invisible slot row9" id="row9_slot7"></div>
				<div class="invisible slot row9" id="row9_slot8"></div>
				<div class="invisible slot row9" id="row9_slot9"></div>
				<div class="invisible slot row9" id="row9_slot10"></div>
				<div class="invisible slot row9" id="row9_slot11"></div>
				<div class="invisible slot row9" id="row9_slot12"></div>
				<div class="invisible slot row9" id="row9_slot13"></div>
				<div class="invisible slot row9" id="row9_slot14"></div>

				<div class="invisible slot row10" id="row10_slot1"></div>
				<div class="invisible slot row10" id="row10_slot2"></div>
				<div class="invisible slot row10" id="row10_slot3"></div>
				<div class="invisible slot row10" id="row10_slot4"></div>
				<div class="invisible slot row10" id="row10_slot5"></div>
				<div class="invisible slot row10" id="row10_slot6"></div>
				<div class="invisible slot row10" id="row10_slot7"></div>
				<div class="invisible slot row10" id="row10_slot8"></div>
				<div class="invisible slot row10" id="row10_slot9"></div>
				<div class="invisible slot row10" id="row10_slot10"></div>
				<div class="invisible slot row10" id="row10_slot11"></div>
				<div class="invisible slot row10" id="row10_slot12"></div>
				<div class="invisible slot row10" id="row10_slot13"></div>
				<div class="invisible slot row10" id="row10_slot14"></div>

				<div class="invisible slot row11" id="row11_slot1"></div>
				<div class="invisible slot row11" id="row11_slot2"></div>
				<div class="invisible slot row11" id="row11_slot3"></div>
				<div class="invisible slot row11" id="row11_slot4"></div>
				<div class="invisible slot row11" id="row11_slot5"></div>
				<div class="invisible slot row11" id="row11_slot6"></div>
				<div class="invisible slot row11" id="row11_slot7"></div>
				<div class="invisible slot row11" id="row11_slot8"></div>
				<div class="invisible slot row11" id="row11_slot9"></div>
				<div class="invisible slot row11" id="row11_slot10"></div>
				<div class="invisible slot row11" id="row11_slot11"></div>
				<div class="invisible slot row11" id="row11_slot12"></div>
				<div class="invisible slot row11" id="row11_slot13"></div>
				<div class="invisible slot row11" id="row11_slot14"></div>

				<div class="invisible slot row12" id="row12_slot1"></div>
				<div class="invisible slot row12" id="row12_slot2"></div>
				<div class="invisible slot row12" id="row12_slot3"></div>
				<div class="invisible slot row12" id="row12_slot4"></div>
				<div class="invisible slot row12" id="row12_slot5"></div>
				<div class="invisible slot row12" id="row12_slot6"></div>
				<div class="invisible slot row12" id="row12_slot7"></div>
				<div class="invisible slot row12" id="row12_slot8"></div>
				<div class="invisible slot row12" id="row12_slot9"></div>
				<div class="invisible slot row12" id="row12_slot10"></div>
				<div class="invisible slot row12" id="row12_slot11"></div>
				<div class="invisible slot row12" id="row12_slot12"></div>
				<div class="invisible slot row12" id="row12_slot13"></div>
				<div class="invisible slot row12" id="row12_slot14"></div>

				<div class="invisible slot row13" id="row13_slot1"></div>
				<div class="invisible slot row13" id="row13_slot2"></div>
				<div class="invisible slot row13" id="row13_slot3"></div>
				<div class="invisible slot row13" id="row13_slot4"></div>
				<div class="invisible slot row13" id="row13_slot5"></div>
				<div class="invisible slot row13" id="row13_slot6"></div>
				<div class="invisible slot row13" id="row13_slot7"></div>
				<div class="invisible slot row13" id="row13_slot8"></div>
				<div class="invisible slot row13" id="row13_slot9"></div>
				<div class="invisible slot row13" id="row13_slot10"></div>
				<div class="invisible slot row13" id="row13_slot11"></div>
				<div class="invisible slot row13" id="row13_slot12"></div>
				<div class="invisible slot row13" id="row13_slot13"></div>
				<div class="invisible slot row13" id="row13_slot14"></div>

				<div class="invisible slot row14" id="row14_slot1"></div>
				<div class="invisible slot row14" id="row14_slot2"></div>
				<div class="invisible slot row14" id="row14_slot3"></div>
				<div class="invisible slot row14" id="row14_slot4"></div>
				<div class="invisible slot row14" id="row14_slot5"></div>
				<div class="invisible slot row14" id="row14_slot6"></div>
				<div class="invisible slot row14" id="row14_slot7"></div>
				<div class="invisible slot row14" id="row14_slot8"></div>
				<div class="invisible slot row14" id="row14_slot9"></div>
				<div class="invisible slot row14" id="row14_slot10"></div>
				<div class="invisible slot row14" id="row14_slot11"></div>
				<div class="invisible slot row14" id="row14_slot12"></div>
				<div class="invisible slot row14" id="row14_slot13"></div>
				<div class="invisible slot row14" id="row14_slot14"></div>

				<div class="invisible slot row15" id="row15_slot1"></div>
				<div class="invisible slot row15" id="row15_slot2"></div>
				<div class="invisible slot row15" id="row15_slot3"></div>
				<div class="invisible slot row15" id="row15_slot4"></div>
				<div class="invisible slot row15" id="row15_slot5"></div>
				<div class="invisible slot row15" id="row15_slot6"></div>
				<div class="invisible slot row15" id="row15_slot7"></div>
				<div class="invisible slot row15" id="row15_slot8"></div>
				<div class="invisible slot row15" id="row15_slot9"></div>
				<div class="invisible slot row15" id="row15_slot10"></div>
				<div class="invisible slot row15" id="row15_slot11"></div>
				<div class="invisible slot row15" id="row15_slot12"></div>
				<div class="invisible slot row15" id="row15_slot13"></div>
				<div class="invisible slot row15" id="row15_slot14"></div>

				<div class="invisible slot row16" id="row16_slot1"></div>
				<div class="invisible slot row16" id="row16_slot2"></div>
				<div class="invisible slot row16" id="row16_slot3"></div>
				<div class="invisible slot row16" id="row16_slot4"></div>
				<div class="invisible slot row16" id="row16_slot5"></div>
				<div class="invisible slot row16" id="row16_slot6"></div>
				<div class="invisible slot row16" id="row16_slot7"></div>
				<div class="invisible slot row16" id="row16_slot8"></div>
				<div class="invisible slot row16" id="row16_slot9"></div>
				<div class="invisible slot row16" id="row16_slot10"></div>
				<div class="invisible slot row16" id="row16_slot11"></div>
				<div class="invisible slot row16" id="row16_slot12"></div>
				<div class="invisible slot row16" id="row16_slot13"></div>
				<div class="invisible slot row16" id="row16_slot14"></div>

				<div class="invisible slot row17" id="row17_slot1"></div>
				<div class="invisible slot row17" id="row17_slot2"></div>
				<div class="invisible slot row17" id="row17_slot3"></div>
				<div class="invisible slot row17" id="row17_slot4"></div>
				<div class="invisible slot row17" id="row17_slot5"></div>
				<div class="invisible slot row17" id="row17_slot6"></div>
				<div class="invisible slot row17" id="row17_slot7"></div>
				<div class="invisible slot row17" id="row17_slot8"></div>
				<div class="invisible slot row17" id="row17_slot9"></div>
				<div class="invisible slot row17" id="row17_slot10"></div>
				<div class="invisible slot row17" id="row17_slot11"></div>
				<div class="invisible slot row17" id="row17_slot12"></div>
				<div class="invisible slot row17" id="row17_slot13"></div>
				<div class="invisible slot row17" id="row17_slot14"></div>

				<div class="invisible slot row18" id="row18_slot1"></div>
				<div class="invisible slot row18" id="row18_slot2"></div>
				<div class="invisible slot row18" id="row18_slot3"></div>
				<div class="invisible slot row18" id="row18_slot4"></div>
				<div class="invisible slot row18" id="row18_slot5"></div>
				<div class="invisible slot row18" id="row18_slot6"></div>
				<div class="invisible slot row18" id="row18_slot7"></div>
				<div class="invisible slot row18" id="row18_slot8"></div>
				<div class="invisible slot row18" id="row18_slot9"></div>
				<div class="invisible slot row18" id="row18_slot10"></div>
				<div class="invisible slot row18" id="row18_slot11"></div>
				<div class="invisible slot row18" id="row18_slot12"></div>
				<div class="invisible slot row18" id="row18_slot13"></div>
				<div class="invisible slot row18" id="row18_slot14"></div>

				<div class="invisible slot row19" id="row19_slot1"></div>
				<div class="invisible slot row19" id="row19_slot2"></div>
				<div class="invisible slot row19" id="row19_slot3"></div>
				<div class="invisible slot row19" id="row19_slot4"></div>
				<div class="invisible slot row19" id="row19_slot5"></div>
				<div class="invisible slot row19" id="row19_slot6"></div>
				<div class="invisible slot row19" id="row19_slot7"></div>
				<div class="invisible slot row19" id="row19_slot8"></div>
				<div class="invisible slot row19" id="row19_slot9"></div>
				<div class="invisible slot row19" id="row19_slot10"></div>
				<div class="invisible slot row19" id="row19_slot11"></div>
				<div class="invisible slot row19" id="row19_slot12"></div>
				<div class="invisible slot row19" id="row19_slot13"></div>
				<div class="invisible slot row19" id="row19_slot14"></div>

				<div class="invisible slot row20" id="row20_slot1"></div>
				<div class="invisible slot row20" id="row20_slot2"></div>
				<div class="invisible slot row20" id="row20_slot3"></div>
				<div class="invisible slot row20" id="row20_slot4"></div>
				<div class="invisible slot row20" id="row20_slot5"></div>
				<div class="invisible slot row20" id="row20_slot6"></div>
				<div class="invisible slot row20" id="row20_slot7"></div>
				<div class="invisible slot row20" id="row20_slot8"></div>
				<div class="invisible slot row20" id="row20_slot9"></div>
				<div class="invisible slot row20" id="row20_slot10"></div>
				<div class="invisible slot row20" id="row20_slot11"></div>
				<div class="invisible slot row20" id="row20_slot12"></div>
				<div class="invisible slot row20" id="row20_slot13"></div>
				<div class="invisible slot row20" id="row20_slot14"></div>

				<div class="invisible slot row21" id="row21_slot1"></div>
				<div class="invisible slot row21" id="row21_slot2"></div>
				<div class="invisible slot row21" id="row21_slot3"></div>
				<div class="invisible slot row21" id="row21_slot4"></div>
				<div class="invisible slot row21" id="row21_slot5"></div>
				<div class="invisible slot row21" id="row21_slot6"></div>
				<div class="invisible slot row21" id="row21_slot7"></div>
				<div class="invisible slot row21" id="row21_slot8"></div>
				<div class="invisible slot row21" id="row21_slot9"></div>
				<div class="invisible slot row21" id="row21_slot10"></div>
				<div class="invisible slot row21" id="row21_slot11"></div>
				<div class="invisible slot row21" id="row21_slot12"></div>
				<div class="invisible slot row21" id="row21_slot13"></div>
				<div class="invisible slot row21" id="row21_slot14"></div>
			</div>
		</div>
`;
}