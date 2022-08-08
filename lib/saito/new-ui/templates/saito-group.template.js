
module.exports = SaitoGroupTemplate = (app, mod, group="") => {

  return `
    <div class="saito-group">
      <div class="saito-identicon-box"><img class="saito-identicon" src="/saito/img/david.jpeg"></div>
      <div>
        <div class="saito-groupname">Saito Community Group</div>
        <div class="saito-groupline">something below</div>
      </div>
    </div>
  `;

}

