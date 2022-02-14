module.exports = PostMobileHelper = (game_mod) => {
  let gamename = (game_mod.gamename)? game_mod.gamename: game_mod.name;
  return `
    <div class="post-mobile-header" id="post-mobile-header">
      ${gamename}
    </div>
    <div class="post-mobile-btn-wrapper">
     <ul class="mobile-helper">
      <li class="button tip post-return-to-main"><i class="fas fa-arrow-circle-left"></i> Forum Main</li>
      <li class="button tip post-sidebar-create-btn"><i class="fas fa-plus-circle"></i> New Post</li>
    </ul>
    </div>
  `;
}
