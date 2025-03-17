module.exports = () => {
	let html = `
    <div class="loss-overlay">
      <div class="help"></div>
      <div class="units attacker"></div>
      <div class="units defender"></div>
      <div class="info">
	<div>
	  <div class=""></div>
	  <div class="attacker faction">attacker</div>
	  <div class="defender faction">defender</div>
	</div>
	<div>
	  <div class="">power</div>
	  <div class="attacker power"></div>
	  <div class="defender power"></div>
	</div>
	<div>
	  <div class="">roll</div>
	  <div class="attacker roll"></div>
	  <div class="defender roll"></div>
	</div>
	<div>
	  <div class="">hits</div>
	  <div class="attacker hits"></div>
	  <div class="defender hits"></div>
	</div>
      </div>
    </div>
  `;
	return html;
};
