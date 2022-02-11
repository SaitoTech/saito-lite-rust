module.exports = PostSidebarTemplate = (app, mod) => {
  return `
    <div id="post-sidebar" class="post-sidebar">
      <div id="post-sidebar-cntls">
        <button class="post-return-to-main"><i class="fas fa-arrow-circle-left"></i> Forum Main</button>
        <button class="post-sidebar-create-btn"><i class="fas fa-plus-circle"></i> New Post</button>
      </div>
    <div id="email-chat" class="email_chat"></div>
    </div>
    `;
}

