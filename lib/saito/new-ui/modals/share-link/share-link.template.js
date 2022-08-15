module.exports = InviteFriendsLinkTemplate = (app, mod, link = null) => {
  let share_link = (link != null) ? link : app.browser.returnInviteLink();

  return `

    <div class="saito-modal saito-modal-add-contact">
      <div class="saito-modal-title">Share This Link</div>
      <div class="saito-modal-content">
        <div class="link-space">
          <input class="share-link" type="text" value="${share_link}"></input>
        </div>
      </div>
    </div>
<style>
.link-space i {
    font-size: 1.5rem;
    line-height: 1.5rem;
    margin: 0 10px;
    margin-left: 3rem;
    margin-right: 3rem;
    cursor:pointer;
}
</style>
`;

}
