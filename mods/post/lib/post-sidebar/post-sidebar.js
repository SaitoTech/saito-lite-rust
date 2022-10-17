const PostSidebarTemplate = require('./post-sidebar.template');
const PostCreate = require('./../post-overlay/post-create');

module.exports = PostSidebar = {

  render(app, mod) {

    // add parent wrapping class
    if (!document.getElementById("post-container")) {
      app.browser.addElementToDom('<div id="post-container" class="post-container"></div>');
    }
    if (!document.querySelector(".post-sidebar")) { 
      app.browser.addElementToDom(PostSidebarTemplate(app, mod), document.getElementById("post-container")); 
    }

  },


  attachEvents(app, mod) {
    Array.from(document.querySelectorAll(".post-create-btn")).forEach(btn => {
      btn.onclick = (e) => {
      PostCreate.render(app, mod);
      PostCreate.attachEvents(app, mod);
      };
    }); 
    

    //Bread crumbs
    Array.from(document.getElementsByClassName('post-return-to-main')).forEach(link => {
      link.addEventListener("click", (e) => {
        window.location = "/post";
      });
    });

  },

}

