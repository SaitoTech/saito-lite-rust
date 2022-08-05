module.exports = ForumLeagueTemplate = (app, mod, league) => {

  if (!league){
    return "";
  }

  return `<div class="forum-topic-league" data-sig="${league.id}">
          #${league.myRank} / ${league.playerCnt}
          </div>`;


}