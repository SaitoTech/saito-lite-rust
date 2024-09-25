//import E73 from "../../web/img/Event73.png";
//import E16 from "../../web/img/Event16.svg";
export default (app, mod) => {
	return `<div id="main" class="main" style="display: all">
			<div class="gameboard" id="gameboard">
				<div class="china_card_status" id="china_card_status"></div>

				<div class="active_events" style="float: right">
					<img
						src=""
						id="eventtile_warsaw"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event17.svg"
						id="eventtile_degaulle"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event21.svg"
						id="eventtile_nato"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event23.svg"
						id="eventtile_marshall"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event27.svg"
						id="eventtile_usjapan"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event35.svg"
						id="eventtile_formosan"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event42.svg"
						id="eventtile_quagmire"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event44.svg"
						id="eventtile_beartrap"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event55.svg"
						id="eventtile_willybrandt"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event59.svg"
						id="eventtile_flowerpower"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event65.svg"
						id="eventtile_campdavid"
						class="event_tile"
					/>
					<img
						src=""
						id="eventtile_shuttlediplomacy"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event68.svg"
						id="eventtile_johnpaul"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event82.svg"
						id="eventtile_iranianhostagecrisis"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event83.svg"
						id="eventtile_ironlady"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event86.svg"
						id="eventtile_northseaoil"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event87.svg"
						id="eventtile_reformer"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event96.svg"
						id="eventtile_teardown"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event97.svg"
						id="eventtile_evilempire"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event106.svg"
						id="eventtile_norad"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event110.svg"
						id="eventtile_awacs"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event218.png"
						id="eventtile_kissinger"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event208.png"
						id="eventtile_tsarbomba"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event210.png"
						id="eventtile_carterdoctrine"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event212.png"
						id="eventtile_nixonshock"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event213.png"
						id="eventtile_berlinagreement"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event219.png"
						id="eventtile_sudan"
						class="event_tile"
					/>
					<img
						src="/twilight/img/Event224.png"
						id="eventtile_argo"
						class="event_tile"
					/>
				</div>

				<div
					class="scoring_card"
					id="europe"
				></div>
				<div
					class="display_card"
					id="europe"
				>
					<div
						class="display_vp"
						id="europe"
					></div>
				</div>

				<div
					class="scoring_card"
					id="mideast"
				></div>
				<div
					class="display_card"
					id="mideast"
				>
					<div
						class="display_vp"
						id="mideast"
					></div>
				</div>

				<div
					class="scoring_card"
					id="asia"
				></div>
				<div
					class="display_card"
					id="asia"
				>
					<div
						class="display_vp"
						id="asia"
					></div>
				</div>

				<div
					class="scoring_card"
					id="seasia"
				></div>
				<div
					class="display_card"
					id="seasia"
				>
					<div
						class="display_vp"
						id="seasia"
					></div>
				</div>

				<div
					class="scoring_card"
					id="camerica"
				></div>
				<div
					class="display_card"
					id="camerica"
				>
					<div
						class="display_vp"
						id="camerica"
					></div>
				</div>

				<div
					class="scoring_card"
					id="samerica"
				></div>
				<div
					class="display_card"
					id="samerica"
				>
					<div
						class="display_vp"
						id="samerica"
					></div>
				</div>

				<div
					class="scoring_card"
					id="africa"
				></div>
				<div
					class="display_card"
					id="africa"
				>
					<div
						class="display_vp"
						id="africa"
					></div>
				</div>

				<div class="formosan_resolution" id="formosan_resolution"></div>
				<div class="kissinger_colombia" id="kissinger_colombia"></div>
				<div class="kissinger_guatemala" id="kissinger_guatemala"></div>
				<div
					class="kissinger_elsalvador"
					id="kissinger_elsalvador"
				></div>
				<div class="kissinger_nicaragua" id="kissinger_nicaragua"></div>
				<div class="kissinger_haiti" id="kissinger_haiti"></div>
				<div
					class="kissinger_dominicanrepublic"
					id="kissinger_dominicanrepublic"
				></div>
				<div
					class="kissinger_saharanstates"
					id="kissinger_saharanstates"
				></div>
				<div class="kissinger_sudan" id="kissinger_sudan"></div>
				<div class="civil_war_sudan" id="civil_war_sudan"></div>
				<div class="kissinger_ethiopia" id="kissinger_ethiopia"></div>
				<div class="kissinger_cameroon" id="kissinger_cameroon"></div>
				<div
					class="kissinger_seafricanstates"
					id="kissinger_seafricanstates"
				></div>
				<div class="kissinger_zimbabwe" id="kissinger_zimbabwe"></div>
				<div class="kissinger_lebanon" id="kissinger_lebanon"></div>
				<div class="kissinger_laos" id="kissinger_laos"></div>
				<div class="kissinger_vietnam" id="kissinger_vietnam"></div>
				<div class="kissinger_indonesia" id="kissinger_indonesia"></div>
				<div class="round" id="round"></div>
				<div class="action_round_us" id="action_round_us"></div>
				<div class="action_round_ussr" id="action_round_ussr"></div>
				<div
					class="action_round_cover action_round_8_cover"
					id="action_round_7_cover"
				></div>
				<div
					class="action_round_cover action_round_7_cover"
					id="action_round_8_cover"
				></div>
				<div class="defcon" id="defcon"></div>
				<div
					class="vp"
					id="vp"
					style="top: 2740px, left: 3570px;"
				></div>
				<div class="space_race_us" id="space_race_us"></div>
				<div class="space_race_ussr" id="space_race_ussr"></div>
				<div class="milops_us" id="milops_us"></div>
				<div class="milops_ussr" id="milops_ussr"></div>
				<div class="country" id="canada">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="uk">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="france">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="benelux">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="italy">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="westgermany">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="eastgermany">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="poland">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="spain">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="greece">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="turkey">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="yugoslavia">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="bulgaria">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="hungary">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="romania">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="austria">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="czechoslovakia">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="denmark">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="norway">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="sweden">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="finland">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>

				<div class="country" id="libya">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="egypt">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="lebanon">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="syria">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="israel">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="iraq">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="iran">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="jordan">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="gulfstates">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="saudiarabia">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>

				<div class="country" id="afghanistan">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="pakistan">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="india">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="burma">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="laos">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="thailand">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="vietnam">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="malaysia">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="australia">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="indonesia">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="philippines">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="taiwan">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="japan">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="southkorea">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="northkorea">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>

				<div class="country" id="mexico">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="guatemala">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="elsalvador">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="honduras">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="nicaragua">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="costarica">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="panama">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="cuba">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="haiti">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="dominicanrepublic">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>

				<div class="country" id="venezuela">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="colombia">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="ecuador">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="peru">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="chile">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="bolivia">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="argentina">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="paraguay">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="uruguay">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="brazil">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>

				<div class="country" id="morocco">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="algeria">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="saharanstates">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="tunisia">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="westafricanstates">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="sudan">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="ivorycoast">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="nigeria">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="ethiopia">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="somalia">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="cameroon">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="zaire">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="kenya">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="angola">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="seafricanstates">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="zimbabwe">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="botswana">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
				<div class="country" id="southafrica">
					<div class="us"></div>
					<div class="ussr"></div>
				</div>
			</div>
		</div>`;
};
