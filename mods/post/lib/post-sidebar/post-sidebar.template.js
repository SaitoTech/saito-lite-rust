module.exports = PostSidebarTemplate = (app, mod) => {
  let html = `<div id="post-sidebar" class="post-sidebar">`;

  if (app.browser.returnURLParameter("forum")){
    html += `<div id="post-sidebar-cntls">
              <button class="post-return-to-main"><i class="fas fa-arrow-circle-left"></i> Forum Main</button>
              <button class="post-create-btn"><i class="fas fa-plus-circle"></i> New Post</button>
            </div>`; 
  }

  html += `<div id="email-chat" class="email_chat"></div></div>`;
  return html;
}

