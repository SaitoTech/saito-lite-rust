module.exports = () => {
	let html = `
    <div class="loss-overlay">

      <div class="help"></div>

      <div class="units attacker"></div>
      <div class="units defender"></div>

      <div class="info">

	<div class="info_header">
	  <div class="results_table_header">combat results</div>
	  <div class="corps_table_header">corps table</div>
	  <div class="army_table_header">army table</div>
	</div>

        <div class="results_table">
          <div class="row row-0">
            <div class="col col-0">faction</div>
            <div class="col col-1">position</div>
            <div class="col col-2">roll</div>
            <div class="col col-3">modifiers</div>
            <div class="col col-4">col-shift</div>
            <div class="col col-5">hits</div>
          </div>
          <div class="row row-1">
            <div class="col col-0 attacker_faction">central</div>
            <div class="col col-1">attacker</div>
            <div class="col col-2"><div class="dice attacker_roll">-</div></div>
            <div class="col col-3 attacker_modifiers">-</div>
            <div class="col col-4 attacker_column_shift">-</div>
            <div class="col col-5"><div class="dice attacker_damage">-</div></div>
          </div>
          <div class="row row-2">
            <div class="col col-0 defender_faction">allies</div>
            <div class="col col-1">defender</div>
            <div class="col col-2"><div class="dice defender_roll">-</div></div>
            <div class="col col-3 defender_modifiers">-</div>
            <div class="col col-4 defender_column_shift">-</div>
            <div class="col col-5"><div class="dice defender_damage">-</div></div>
          </div>
        </div>

        <div class="corps_firing_table">
          <div class="firing_table">
            <div class="row row-0">
              <div class="col col-0">roll</div>
              <div class="col col-1">0</div>
              <div class="col col-2">1</div>
              <div class="col col-3">2</div>
              <div class="col col-4">3</div>
              <div class="col col-5">4</div>
              <div class="col col-6">5</div>
              <div class="col col-7">6</div>
              <div class="col col-8">7</div>
              <div class="col col-9">8+</div>
            </div>
            <div class="row row-1">
              <div class="col col-0">1</div>
              <div class="col col-1">-</div>
              <div class="col col-2">-</div>
              <div class="col col-3">-</div>
              <div class="col col-4">1</div>
              <div class="col col-5">1</div>
              <div class="col col-6">1</div>
              <div class="col col-7">1</div>
              <div class="col col-8">1</div>
              <div class="col col-9">2</div>
            </div>
            <div class="row row-2">
              <div class="col col-0">2</div>
              <div class="col col-1">-</div>
              <div class="col col-2">-</div>
              <div class="col col-3">1</div>
              <div class="col col-4">1</div>
              <div class="col col-5">1</div>
              <div class="col col-6">1</div>
              <div class="col col-7">1</div>
              <div class="col col-8">2</div>
              <div class="col col-9">2</div>
            </div>
            <div class="row row-3">
              <div class="col col-0">3</div>
              <div class="col col-1">-</div>
              <div class="col col-2">-</div>
              <div class="col col-3">1</div>
              <div class="col col-4">1</div>
              <div class="col col-5">1</div>
              <div class="col col-6">2</div>
              <div class="col col-7">2</div>
              <div class="col col-8">2</div>
              <div class="col col-9">3</div>
            </div>
            <div class="row row-4">
              <div class="col col-0">4</div>
              <div class="col col-1">-</div>
              <div class="col col-2">1</div>
              <div class="col col-3">1</div>
              <div class="col col-4">1</div>
              <div class="col col-5">2</div>
              <div class="col col-6">2</div>
              <div class="col col-7">2</div>
              <div class="col col-8">3</div>
              <div class="col col-9">3</div>
            </div>
            <div class="row row-5">
              <div class="col col-0">5</div>
              <div class="col col-1">1</div>
              <div class="col col-2">1</div>
              <div class="col col-3">1</div>
              <div class="col col-4">2</div>
              <div class="col col-5">2</div>
              <div class="col col-6">2</div>
              <div class="col col-7">3</div>
              <div class="col col-8">3</div>
              <div class="col col-9">4</div>
            </div>
            <div class="row row-6">
              <div class="col col-0">6</div>
              <div class="col col-1">1</div>
              <div class="col col-2">1</div>
              <div class="col col-3">1</div>
              <div class="col col-4">2</div>
              <div class="col col-5">2</div>
              <div class="col col-6">3</div>
              <div class="col col-7">3</div>
              <div class="col col-8">4</div>
              <div class="col col-9">4</div>
            </div>
          </div>
        </div>

        <div class="army_firing_table">
          <div class="firing_table">
            <div class="row row-0">
              <div class="col col-0">roll</div>
              <div class="col col-1">1</div>
              <div class="col col-2">2</div>
              <div class="col col-3">3</div>
              <div class="col col-4">4</div>
              <div class="col col-5">5</div>
              <div class="col col-6">6+</div>
              <div class="col col-7">9+</div>
              <div class="col col-8">12+</div>
              <div class="col col-9">15</div>
              <div class="col col-10">16+</div>
            </div>
            <div class="row row-1">
              <div class="col col-0">1</div>
              <div class="col col-1">-</div>
              <div class="col col-2">1</div>
              <div class="col col-3">1</div>
              <div class="col col-4">2</div>
              <div class="col col-5">2</div>
              <div class="col col-6">3</div>
              <div class="col col-7">3</div>
              <div class="col col-8">4</div>
              <div class="col col-9">4</div>
              <div class="col col-10">5</div>
            </div>
            <div class="row row-2">
              <div class="col col-0">2</div>
              <div class="col col-1">1</div>
              <div class="col col-2">1</div>
              <div class="col col-3">2</div>
              <div class="col col-4">2</div>
              <div class="col col-5">3</div>
              <div class="col col-6">3</div>
              <div class="col col-7">4</div>
              <div class="col col-8">4</div>
              <div class="col col-9">5</div>
              <div class="col col-10">5</div>
            </div>
            <div class="row row-3">
              <div class="col col-0">3</div>
              <div class="col col-1">1</div>
              <div class="col col-2">2</div>
              <div class="col col-3">2</div>
              <div class="col col-4">3</div>
              <div class="col col-5">3</div>
              <div class="col col-6">4</div>
              <div class="col col-7">4</div>
              <div class="col col-8">5</div>
              <div class="col col-9">5</div>
              <div class="col col-10">7</div>
            </div>
            <div class="row row-4">
              <div class="col col-0">4</div>
              <div class="col col-1">1</div>
              <div class="col col-2">2</div>
              <div class="col col-3">3</div>
              <div class="col col-4">3</div>
              <div class="col col-5">4</div>
              <div class="col col-6">4</div>
              <div class="col col-7">5</div>
              <div class="col col-8">5</div>
              <div class="col col-9">7</div>
              <div class="col col-10">7</div>
            </div>
            <div class="row row-5">
              <div class="col col-0">5</div>
              <div class="col col-1">2</div>
              <div class="col col-2">3</div>
              <div class="col col-3">3</div>
              <div class="col col-4">4</div>
              <div class="col col-5">4</div>
              <div class="col col-6">5</div>
              <div class="col col-7">5</div>
              <div class="col col-8">7</div>
              <div class="col col-9">7</div>
              <div class="col col-10">7</div>
            </div>
            <div class="row row-6">
              <div class="col col-0">6</div>
              <div class="col col-1">2</div>
              <div class="col col-2">3</div>
              <div class="col col-3">4</div>
              <div class="col col-4">4</div>
              <div class="col col-5">5</div>
              <div class="col col-6">5</div>
              <div class="col col-7">7</div>
              <div class="col col-8">7</div>
              <div class="col col-9">7</div>
              <div class="col col-10">7</div>
            </div>
          </div>
        </div>

        <div class="terrain_effects_table">
          <div class="effects_table">
            <div class="row row-0">
              <div class="col col-1">terrain</div>
              <div class="col col-3">col-shift</div>
              <div class="col col-4">cancel retreat?</div>
              <div class="col col-5">stop advance?</div>
              <div class="col col-6">flank attack?</div>
            </div>
            <div class="row row-1 clear">
              <div class="col col-1">clear</div>
              <div class="col col-3">-</div>
              <div class="col col-4">no</div>
              <div class="col col-5">no</div>
              <div class="col col-6">yes</div>
            </div>
            <div class="row row-2 mountain">
              <div class="col col-1">mountain</div>
              <div class="col col-3">-1 / 0</div>
              <div class="col col-4">yes</div>
              <div class="col col-5">yes</div>
              <div class="col col-6">no</div>
            </div>
            <div class="row row-3 swamp">
              <div class="col col-1">swamp</div>
              <div class="col col-3">-1 / 0</div>
              <div class="col col-4">yes</div>
              <div class="col col-5">yes</div>
              <div class="col col-6">no</div>
            </div>
            <div class="row row-4 forest">
              <div class="col col-1">forest</div>
              <div class="col col-3">-</div>
              <div class="col col-4">yes</div>
              <div class="col col-5">yes</div>
              <div class="col col-6">yes</div>
            </div>
            <div class="row row-5 desert">
              <div class="col col-1">desert</div>
              <div class="col col-3">-</div>
              <div class="col col-4">yes</div>
              <div class="col col-5">yes</div>
              <div class="col col-6">yes</div>
            </div>
            <div class="row row-6 trench1">
              <div class="col col-1">trench 1</div>
              <div class="col col-3">-1 / +1</div>
              <div class="col col-4">yes</div>
              <div class="col col-5">no</div>
              <div class="col col-6">no</div>
            </div>
            <div class="row row-7 trench2">
              <div class="col col-1">trench 2</div>
              <div class="col col-3">-2 / +1</div>
              <div class="col col-4">yes</div>
              <div class="col col-5">no</div>
              <div class="col col-6">no</div>
            </div>
          </div>


        </div>

	<div class="other_effects">
	</div>

      </div>
    </div>
  `;
	return html;
};
