module.exports = () => {
	let html = `

      <div class="twilight-advanced-options-container">

  <div style="top:0;left:0;">

            <label for="player1">Play As: </label>
            <select name="player1">
              <option value="random" selected>random sides</option>
              <option value="ussr">play as USSR</option>
              <option value="us">play as US</option>
            </select>

            <label for="usbonus">US bonus influence: </label>
            <select class="usbonus" name="usbonus">
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2" selected>2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>

            <label for="clock">Player Time Limit:</label>
            <select name="clock">
              <option value="0" default>no limit</option>
              <option value="10">10 minutes</option>
              <option value="20">20 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">120 minutes</option>
            </select>

            <div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button saito-button-primary">Accept</div>
  </div>

            <div id="game-wizard-advanced-box" class="game-wizard-advanced-box" >

        <style type="text/css">li { list-style: none; } .saito-select { margin-bottom: 10px; margin-top:5px; } label { text-transform: uppercase; } .removecards { grid-gap: 0.1em; } .list-header { font-weight: bold; font-size:1.5em; margin-top:0px; margin-bottom:10px; margin-left: 15px; text-transform: uppercase; } </style>
              <div class="list-header">remove cards:</div>
              <ul id="removecards" class="removecards">
              <li><input class="remove_card" type="checkbox" name="asia" /> <span> Asia Scoring</span></li>
              <li><input class="remove_card" type="checkbox" name="europe" /> <span> Europe Scoring</span></li>
              <li><input class="remove_card" type="checkbox" name="mideast" /> <span> Middle-East Scoring</span></li>
              <li><input class="remove_card" type="checkbox" name="duckandcover" /> <span> Duck and Cover</span></li>
              <li><input class="remove_card" type="checkbox" name="fiveyearplan" /> <span> Five Year Plan</span></li>
              <li><input class="remove_card" type="checkbox" name="socgov" /> <span> Socialist Governments</span></li>
              <li><input class="remove_card" type="checkbox" name="fidel" /> <span> Fidel</span></li>
              <li><input class="remove_card" type="checkbox" name="vietnamrevolts" /> <span> Vietnam Revolts</span></li>
              <li><input class="remove_card" type="checkbox" name="blockade" /> <span> Blockade</span></li>
              <li><input class="remove_card" type="checkbox" name="koreanwar" /> <span> Korean War</span></li>
              <li><input class="remove_card" type="checkbox" name="romanianab" /> <span> Romanian Abdication</span></li>
              <li><input class="remove_card" type="checkbox" name="arabisraeli" /> <span> Arab Israeli War</span></li>
              <li><input class="remove_card" type="checkbox" name="comecon" /> <span> Comecon</span></li>
              <li><input class="remove_card" type="checkbox" name="nasser" /> <span> Nasser</span></li>
              <li><input class="remove_card" type="checkbox" name="warsawpact" /> <span> Warsaw Pact</span></li>
              <li><input class="remove_card" type="checkbox" name="degaulle" /> <span> De Gaulle Leads France</span></li>
              <li><input class="remove_card" type="checkbox" name="naziscientist" /> <span> Nazi Scientists Captured</span></li>
              <li><input class="remove_card" type="checkbox" name="truman" /> <span> Truman</span></li>
              <li><input class="remove_card" type="checkbox" name="olympic" /> <span> Olympic Games</span></li>
              <li><input class="remove_card" type="checkbox" name="nato" /> <span> NATO</span></li>
              <li><input class="remove_card" type="checkbox" name="indreds" /> <span> Independent Reds</span></li>
              <li><input class="remove_card" type="checkbox" name="marshall" /> <span> Marshall Plan</span></li>
              <li><input class="remove_card" type="checkbox" name="indopaki" /> <span> Indo-Pakistani War</span></li>
              <li><input class="remove_card" type="checkbox" name="containment" /> <span> Containment</span></li>
              <li><input class="remove_card" type="checkbox" name="cia" /> <span> CIA Created</span></li>
              <li><input class="remove_card" type="checkbox" name="usjapan" /> <span> US/Japan Defense Pact</span></li>
              <li><input class="remove_card" type="checkbox" name="suezcrisis" /> <span> Suez Crisis</span></li>
              <li><input class="remove_card" type="checkbox" name="easteuropean" /> <span> East European Unrest</span></li>
              <li><input class="remove_card" type="checkbox" name="decolonization" /> <span> Decolonization</span></li>
              <li><input class="remove_card" type="checkbox" name="redscare" /> <span> Red Scare</span></li>
              <li><input class="remove_card" type="checkbox" name="unintervention" /> <span> UN Intervention</span></li>
              <li><input class="remove_card" type="checkbox" name="destalinization" /> <span> Destalinization</span></li>
              <li><input class="remove_card" type="checkbox" name="nucleartestban" /> <span> Nuclear Test Ban Treaty</span></li>
              <li><input class="remove_card" type="checkbox" name="formosan" /> <span> Formosan Resolution</span></li>
              <li><input class="remove_card optional_edition" type="checkbox" name="defectors" /> <span> Defectors</span></li>
              <li><input class="remove_card optional_edition " type="checkbox" name="specialrelation" /> <span> Special Relationship</span></li>
              <li><input class="remove_card optional_edition" type="checkbox" name="cambridge" /> <span> The Cambridge Five</span></li>
              <li><input class="remove_card optional_edition" type="checkbox" name="norad" /> <span> NORAD</span></li>
            </ul>
            <ul class="removecards" style="clear:both;margin-top:13px">
              <li><input class="remove_card" type="checkbox" name="brushwar" /> <span> Brush War</span></li>
              <li><input class="remove_card" type="checkbox" name="camerica" /> <span> Central America Scoring</span></li>
              <li><input class="remove_card" type="checkbox" name="seasia" /> <span> Southeast Asia Scoring</span></li>
              <li><input class="remove_card" type="checkbox" name="armsrace" /> <span> Arms Race</span></li>
              <li><input class="remove_card" type="checkbox" name="cubanmissile" /> <span> Cuban Missile Crisis</span></li>
              <li><input class="remove_card" type="checkbox" name="nuclearsubs" /> <span> Nuclear Subs</span></li>
              <li><input class="remove_card" type="checkbox" name="quagmire" /> <span> Quagmire</span></li>
              <li><input class="remove_card" type="checkbox" name="saltnegotiations" /> <span> Salt Negotiations</span></li>
              <li><input class="remove_card" type="checkbox" name="beartrap" /> <span> Bear Trap</span></li>
              <li><input class="remove_card" type="checkbox" name="summit" /> <span> Summit</span></li>
              <li><input class="remove_card" type="checkbox" name="howilearned" /> <span> How I Learned to Stop Worrying</span></li>
              <li><input class="remove_card" type="checkbox" name="junta" /> <span> Junta</span></li>
              <li><input class="remove_card" type="checkbox" name="kitchendebates" /> <span> Kitchen Debates</span></li>
              <li><input class="remove_card" type="checkbox" name="missileenvy" /> <span> Missile Envy</span></li>
              <li><input class="remove_card" type="checkbox" name="wwby" /> <span> We Will Bury You</span></li>
              <li><input class="remove_card" type="checkbox" name="brezhnev" /> <span> Brezhnev Doctrine</span></li>
              <li><input class="remove_card" type="checkbox" name="portuguese" /> <span> Portuguese Empire Crumbles</span></li>
              <li><input class="remove_card" type="checkbox" name="southafrican" /> <span> South African Unrest</span></li>
              <li><input class="remove_card" type="checkbox" name="allende" /> <span> Allende</span></li>
              <li><input class="remove_card" type="checkbox" name="willybrandt" /> <span> Willy Brandt</span></li>
              <li><input class="remove_card" type="checkbox" name="muslimrevolution" /> <span> Muslim Revolution</span></li>
              <li><input class="remove_card" type="checkbox" name="abmtreaty" /> <span> ABM Treaty</span></li>
              <li><input class="remove_card" type="checkbox" name="culturalrev" /> <span> Cultural Revolution</span></li>
              <li><input class="remove_card" type="checkbox" name="flowerpower" /> <span> Flower Power</span></li>
              <li><input class="remove_card" type="checkbox" name="u2" /> <span> U-2 Incident</span></li>
              <li><input class="remove_card" type="checkbox" name="opec" /> <span> OPEC</span></li>
              <li><input class="remove_card" type="checkbox" name="lonegunman" /> <span> Lone Gunman</span></li>
              <li><input class="remove_card" type="checkbox" name="colonial" /> <span> Colonial</span></li>
              <li><input class="remove_card" type="checkbox" name="panamacanal" /> <span> Panama Canal</span></li>
              <li><input class="remove_card" type="checkbox" name="campdavid" /> <span> Camp David Accords</span></li>
              <li><input class="remove_card" type="checkbox" name="puppet" /> <span> Puppet Governments</span></li>
              <li><input class="remove_card" type="checkbox" name="grainsales" /> <span> Grain Sales to Soviets</span></li>
              <li><input class="remove_card" type="checkbox" name="johnpaul" /> <span> John Paul</span></li>
              <li><input class="remove_card" type="checkbox" name="deathsquads" /> <span> Death Squads</span></li>
              <li><input class="remove_card" type="checkbox" name="oas" /> <span> OAS Founded</span></li>
              <li><input class="remove_card" type="checkbox" name="nixon" /> <span> Nixon Plays the China Card</span></li>
              <li><input class="remove_card" type="checkbox" name="sadat" /> <span> Sadat Expels Soviets</span></li>
              <li><input class="remove_card" type="checkbox" name="shuttle" /> <span> Shuttle Diplomacy</span></li>
              <li><input class="remove_card" type="checkbox" name="voiceofamerica" /> <span> Voice of America</span></li>
              <li><input class="remove_card" type="checkbox" name="liberation" /> <span> Liberation Theology</span></li>
              <li><input class="remove_card" type="checkbox" name="ussuri" /> <span> Ussuri River Skirmish</span></li>
              <li><input class="remove_card" type="checkbox" name="asknot" /> <span> Ask Not What Your Country Can Do For You</span></li>
              <li><input class="remove_card" type="checkbox" name="alliance" /> <span> Alliance for Progress</span></li>
              <li><input class="remove_card" type="checkbox" name="africa" /> <span> Africa Scoring</span></li>
              <li><input class="remove_card" type="checkbox" name="onesmallstep" /> <span> One Small Step</span></li>
              <li><input class="remove_card" type="checkbox" name="samerica" /> <span> South America</span></li>
              <li><input class="remove_card optional_edition" type="checkbox" name="che" /> <span> Che</span></li>
              <li><input class="remove_card optional_edition" type="checkbox" name="tehran" /> <span> Our Man in Tehran</span></li>
            </ul>
            <ul class="removecards" style="clear:both;margin-top:13px">
              <li><input class="remove_card" type="checkbox" name="iranianhostage" /> <span> Iranian Hostage Crisis</span></li>
              <li><input class="remove_card" type="checkbox" name="ironlady" /> <span> The Iron Lady</span></li>
              <li><input class="remove_card" type="checkbox" name="reagan" /> <span> Reagan Bombs Libya</span></li>
              <li><input class="remove_card" type="checkbox" name="starwars" /> <span> Star Wars</span></li>
              <li><input class="remove_card" type="checkbox" name="northseaoil" /> <span> North Sea Oil</span></li>
              <li><input class="remove_card" type="checkbox" name="reformer" /> <span> The Reformer</span></li>
              <li><input class="remove_card" type="checkbox" name="marine" /> <span> Marine Barracks Bombing</span></li>
              <li><input class="remove_card" type="checkbox" name="KAL007" /> <span> Soviets Shoot Down KAL-007</span></li>
              <li><input class="remove_card" type="checkbox" name="glasnost" /> <span> Glasnost</span></li>
              <li><input class="remove_card" type="checkbox" name="ortega" /> <span> Ortega Elected in Nicaragua</span></li>
              <li><input class="remove_card" type="checkbox" name="terrorism" /> <span> Terrorism</span></li>
              <li><input class="remove_card" type="checkbox" name="ironcontra" /> <span> Iran Contra Scandal</span></li>
              <li><input class="remove_card" type="checkbox" name="chernobyl" /> <span> Chernobyl</span></li>
              <li><input class="remove_card" type="checkbox" name="debtcrisis" /> <span> Latin American Debt Crisis</span></li>
              <li><input class="remove_card" type="checkbox" name="teardown" /> <span> Tear Down this Wall</span></li>
              <li><input class="remove_card" type="checkbox" name="evilempire" /> <span> An Evil Empire</span></li>
              <li><input class="remove_card" type="checkbox" name="aldrichames" /> <span> Aldrich Ames Remix</span></li>
              <li><input class="remove_card" type="checkbox" name="pershing" /> <span> Pershing II Deployed</span></li>
              <li><input class="remove_card" type="checkbox" name="wargames" /> <span> Wargames</span></li>
              <li><input class="remove_card" type="checkbox" name="solidarity" /> <span> Solidarity</span></li>
              <li><input class="remove_card optional_edition" type="checkbox" name="iraniraq" /> <span> Iran-Iraq War</span></li>
              <li><input class="remove_card optional_edition" type="checkbox" name="yuri" /> <span> Yuri and Samantha</span></li>
              <li><input class="remove_card optional_edition" type="checkbox" name="awacs" /> <span> AWACS Sale to Saudis</span></li>
            </ul>

            <div class="list-header">add cards:</div>
            <ul id="removecards" class="removecards">
              <li><input class="remove_card" type="checkbox" name="iranianultimatum" /> <span> Iranian Ultimatum (Early-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="tsarbomba" /> <span> Tsar Bomba (Early-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="unitedfruit" /> <span> United Fruit Company (Early-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="berlinagreement" /> <span> Berlin Agreement (Mid-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="carterdoctrine" /> <span> Carter Doctrine (Mid-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="energycrisis" /> <span> Energy Crisis (Mid-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="nixonshock" /> <span> Nixon Shock (Mid-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="kissinger" /> <span> Kissinger Bombs Cambodia (Mid-War)</span></li>
              <!--<li><input class="remove_card" type="checkbox" name="handshake" /> <span> Handshake in Space (Mid-War)</span></li>-->
              <li><input class="remove_card" type="checkbox" name="khruschevthaw" /> <span> Khruschev Thaw (Mid-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="bayofpigs" /> <span> Bay of Pigs (Mid-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="fallofsaigon" /> <span> Fall of Saigon (Mid-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="fischerspassky" /> <span> Fischer-Spassky (Mid-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="sudan" /> <span> Sudanese Civil War (Mid-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="revolutionsof1989" /> <span> Revolutions of 1989 (Late-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="samotlor" /> <span> Samotlor Oil Fields (Late-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="antiapartheid" /> <span> Anti-Apartheid Movement (Late-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="rustinredsquare" /> <span> Rust Lands in Red Square (Late-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="august1968" /> <span> August Protests (Late-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="argo" /> <span> Argo (Late-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="culturaldiplomacy" /> <span> Cultural Diplomacy (Early-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="gouzenkoaffair" /> <span> Gouzenko Affair (Early-War)</span></li>
              <li><input class="remove_card" type="checkbox" name="poliovaccine" /> <span> Polio Vaccine (Early-War)</span></li>
              <li><input class="remove_card endofhistory_edition" type="checkbox" name="peronism" /> <span> Peronism (Early-War)</span></li>
              <li><input class="remove_card endofhistory_edition" type="checkbox" name="manwhosavedtheworld" /> <span> The Man Who Saved the World (Mid-War)</span></li>
              <li><input class="remove_card endofhistory_edition" type="checkbox" name="breakthroughatlopnor" /> <span> Breakthrough at Lop Nor (Mid-War)</span></li>
              <li><input class="remove_card endofhistory_edition" type="checkbox" name="nationbuilding" /> <span> Nation Building (Mid-War)</span></li>
              <li><input class="remove_card endofhistory_edition" type="checkbox" name="greatsociety" /> <span> Great Society (Mid-War)</span></li>
              <li><input class="remove_card endofhistory_edition" type="checkbox" name="perestroika"  /> <span> Perestroika (Late-War)</span></li>
              <li><input class="remove_card endofhistory_edition" type="checkbox" name="eurocommunism" /> <span> Eurocommunism (Mid-War)</span></li>
              <li><input class="remove_card endofhistory_edition" type="checkbox" name="inftreaty" /> <span> INF Treaty (Late-War)</span></li>
              <li><input class="remove_card coldwarcrazies_edition" type="checkbox" name="communistrevolution" /> <span> Communist Revolution (Early-War)</span></li>
            </div>

      </div>
    </div>
          `;

	return html;
};
