module.exports = PostMobileHelper = (game_mod) => {
  let forumname = (game_mod.gamename)? game_mod.gamename: game_mod.name;
  return `
   <div id="post-return-to-main" class="post-return-to-main"><i class="fas fa-arrow-circle-left"></i> ${forumname}</div>
   <div class="post-create-btn">[add post]</div>
  `;
}
