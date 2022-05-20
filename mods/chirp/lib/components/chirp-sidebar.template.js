module.exports = ChirpSidebarTemplate = () => {
  return `

      <div class="sidebarOption active">
        <span class="material-icons"> home </span>
        <h2>Home</h2>
      </div>

      <div class="sidebarOption">
        <span class="material-icons"> search </span>
        <h2>Explore</h2>
      </div>

      <div class="sidebarOption">
        <span class="material-icons"> notifications_none </span>
        <h2>Notifications</h2>
      </div>

      <div class="sidebarOption">
        <span class="material-icons"> mail_outline </span>
        <h2>Messages</h2>
      </div>

      <div class="sidebarOption">
        <span class="material-icons"> games </span>
        <h2>Games</h2>
      </div>

      <div class="sidebarOption">
        <span class="material-icons"> store </span>
        <h2>Marketplace NFT</h2>
      </div>

      <div class="sidebarOption">
        <span class="material-icons"> perm_identity </span>
        <h2>Profile</h2>
      </div>

      <button class="sidebar__tweet">Saiton</button>

      <div id="email-chat" class="email-chat"></div>
  `;
}
