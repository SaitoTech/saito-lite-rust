let saito = require("./../../../../lib/saito/saito");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const PostViewTemplate = require("./post-view.template");
const PostViewCommentTemplate = require("./post-view-comment.template");
//const JSON = require("json-bigint");

module.exports = PostView = {
  render(app, mod, sig = "") {
    mod.overlay = new SaitoOverlay(app);
    mod.comments = []; //For threaded replies

    this.images = [];   //For uploading multiple images
    
    //
    // fetch comments from server
    //
    // we now fetch parent to show images and stuff
    //
    let sql = `SELECT id, tx FROM posts WHERE thread_id = "${sig}" ORDER BY ts ASC`;

    mod.originalSig = sig;

    try{
      mod.overlay.show(app, mod, PostViewTemplate(app, mod, sig));  
    }catch(err){
      console.error(err);
      return;
    }
        
    mod.sendPeerDatabaseRequestWithFilter(
      "Post",
      sql,
      (res) => {
        try {
          document.getElementById("post-loader-spinner").style.display = "none";
        } catch (err) {}
        if (res) {
          if (res.rows) {
            for (let i = 0; i < res.rows.length; i++) {
              let add_this_comment = 1;
              let tx = new saito.default.transaction(JSON.parse(res.rows[i].tx));
              //console.log(tx);
              let txmsg = tx.returnMessage();
              //console.log(txmsg);
              for (let z = 0; z < mod.comments.length; z++) {
                if (mod.comments[z].transaction.sig == tx.transaction.sig) {
                  add_this_comment = 0;
                }
              }
              //console.log(tx.transaction.sig, sig);
              if (tx.transaction.sig == sig || res.rows[i].id == sig) {
                add_this_comment = 0;
                try {
                  document.getElementById("post-view-parent-comment").innerHTML = sanitize(txmsg.comment);
                  let gallery = document.getElementById("post-view-gallery");
                  let html = "";
                  if (txmsg.images.length > 0) {
                    for (let i = 0; i < tx.msg.images.length; i++) {
                      html += `<img class="post-view-gallery-image" src="${tx.msg.images[i]}" />`;
                    }
                    gallery.innerHTML = sanitize(html);
                    gallery.style.display = "block";
                  }
                } catch (err) {
                  console.error(err);
                  console.log("error showing comment or gallery");
                }
              }
              if (add_this_comment == 1) {
                mod.comments.push(tx);
              }
            }
            for (let i = 0; i < mod.comments.length; i++) {
              this.addComment(app, mod, mod.comments[i]);
            }
            this.attachEvents(app, mod, sig);
          }
        }
      }
    );


    app.browser.addDragAndDropFileUploadToElement(
      "post-view-leave-comment",
      (file) => {
        console.log(file);
        this.images.push(file);
        app.browser.addElementToDom(
          `<div data-id="${
            this.images.length - 1
          }" class="post-create-image-preview"><img src="${file}" style="top: 0px; position: relative; float: left; height: 50px; width: auto; margin-left: auto; margin-right: auto;width: auto;" /></div>`,
          "post-create-image-preview-container"
        );
        this.attachEvents(app, mod);
      },
      false
    );
  },

  attachEvents(app, mod, sig = "") {
    try {
      document.querySelector(".post-submit-btn").onclick = (e) => {
        let comment = sanitize(document.querySelector(".post-view-textarea").innerHTML).replaceAll("&nbsp;"," ").trim();
        
        if (comment != "" || this.images.length > 0) {
          let newtx = mod.createCommentTransaction(mod.originalSig, comment, this.images);
          app.network.propagateTransaction(newtx);
          newtx.children = 0;
          mod.comments.push(newtx);
          this.addComment(app, mod, newtx);
          this.attachEvents(app, mod, sig);
          mod.overlay.hide();
          mod.render();
        }
      };
    } catch (err) {
      console.error(err);
    }

    try {
      document.querySelectorAll(".post-view-edit").forEach((el) => {
        el.onclick = (e) => {
          let post_sig = el.getAttribute("data-id");
          console.log("********* post-view-edit onclick ********" + post_sig);

          document.querySelectorAll(".post-view-gallery").forEach((e) => e.remove());
          document.querySelectorAll(".post-view-leave-comment").forEach((e) => e.remove());
          
          document.querySelectorAll(".post-view-parent-comment").forEach((el2) => {
            if (el2.getAttribute("data-id") === post_sig) {
              if (el2.getAttribute("mode") != "edit") {
                el2.setAttribute("mode", "edit"); // already in edit mode
                let replacement_html = `
                <div id="textedit-field-${post_sig}" class="post-create-textarea post-view-comment-text markdown medium-editor-element" contenteditable="true" spellcheck="true" data-medium-editor-element="true" role="textbox" aria-multiline="true" data-medium-editor-editor-index="1" medium-editor-index="37877e4c-7415-e298-1409-7dca41eed3b8">${el2.innerHTML}</div>
                <button id="edit-button-${post_sig}" data-id="${post_sig}" type="button" class="comment-edit-button" value="Edit Post">edit</button>
              `;

                el2.innerHTML = replacement_html;
                //el2.setAttribute("contentEditable", "true");
                document.getElementById(`edit-button-${post_sig}`).onclick = (e) => {
                  // ===== USER INPUT =====
                  let revised_text = sanitize(document.querySelector(`#textedit-field-${post_sig}`).innerHTML);
                  
                  let this_post = null;

                  for (let i = 0; i < mod.posts.length; i++) {
                    if (mod.posts[i].transaction.sig === post_sig || mod.posts[i].id === post_sig) {
                      this_post = mod.posts[i];
                    }
                  }
                  for (let i = 0; i < mod.forums.length; i++) {
                    if (mod.forums[i].transaction.sig === post_sig || mod.forums[i].id === post_sig) {
                      this_post = mod.forums[i];
                    }
                  }
                  if (!this_post){
                    console.error("Cannot find post we are editing!  "+post_sig);
                    mod.overlay.hide();
                    salert("Post id error");
                    return;
                  }


                  
                  let newTitle = "";
                  revised_text.split(/<[^<]+>/gi).forEach(line =>{
                    if (!newTitle){
                        newTitle += line.replaceAll("&nbsp;"," ");
                      }
                      newTitle = newTitle.trim();
                    });
                    
                  if (newTitle.length > 40) { newTitle = newTitle.substr(0, 40) + "...";  }
                
                  let newtx = mod.createEditPostTransaction(post_sig, newTitle, revised_text, this_post.msg.link, this_post.msg.forum, this_post.msg.images);
                  app.network.propagateTransaction(newtx);

                  for (let i = 0; i < mod.posts.length; i++) {
                    if (mod.posts[i].transaction.sig === post_sig || mod.posts[i].id === post_sig) {
                      newtx.children = mod.posts[i].children;
                      newtx.id = post_sig;
                      mod.posts[i] = newtx;
                    }
                  }
                  for (let i = 0; i < mod.forums.length; i++) {
                   if (mod.forums[i].transaction.sig === post_sig || mod.forums[i].id === post_sig) {
                      newtx.children = mod.forums[i].children;
                      newtx.id = post_sig;
                      newtx.post_num = mod.forums[i].post_num;
                      mod.forums[i] = newtx;
                    }
                  }

                  el2.setAttribute("mode", "read");

                  el2.innerHTML = revised_text;
                    /*document.querySelectorAll(".post-view-parent-comment, .post-view-edit").forEach((el2) => {
                      // This is necessary so that the edit button has the new sig, i.e. data-id
                      // need to be correct for the edit button to work again...
                      el2.setAttribute("data-id", newtx.transaction.sig);
                    });
                    */
                  mod.render();
                  //this.render(app, mod, post_sig);
                };
              }
            }
          });
        };
      });
    } catch (err) {
      console.error(err);
    }

    try {
      document.querySelectorAll(".post-view-comment-edit").forEach((el) => {
        el.onclick = (e) => {
          let comment_sig = el.getAttribute("data-id");

          // remove gallery
          document.querySelectorAll(".post-view-gallery").forEach((e) => e.remove());
          document.querySelectorAll(".post-view-leave-comment").forEach((e) => e.remove());

          document.querySelectorAll(".post-view-comment-text").forEach((el2) => {
            if (el2.getAttribute("data-id") === comment_sig) {
              if (el2.getAttribute("mode") != "edit") {
                el2.setAttribute("mode", "edit"); // already in edit mode
         
                let replacement_html = `
                  <div id="textedit-field-${comment_sig}" data-id="${comment_sig}" class="post-create-textarea post-view-comment-textarea markdown medium-editor-element" contenteditable="true" spellcheck="true" data-medium-editor-element="true" role="textbox" aria-multiline="true" data-medium-editor-editor-index="1" medium-editor-index="37877e4c-7415-e298-1409-7dca41eed3b8">${el2.innerHTML}</div>
                  <button id="edit-button-${comment_sig}" data-id="${comment_sig}" type="button" class="comment-edit-button" value="Edit Comment">edit comment</button>
                `;
                el2.innerHTML = replacement_html;
                //el2.setAttribute("contentEditable", "true");
                document.getElementById(`edit-button-${comment_sig}`).onclick = (e) => {
                  // ===== USER INPUT =====
                  let revised_text = sanitize(document.querySelector(`#textedit-field-${comment_sig}`).innerHTML);

                  let newtx = mod.createEditReplyTransaction(comment_sig, revised_text);
                  app.network.propagateTransaction(newtx);

                  for (let i = 0; i < mod.comments.length; i++) {
                    if (mod.comments[i].transaction.sig === comment_sig) {
                      newtx.children = mod.comments[i].children;
                      mod.comments[i] = newtx;
                    }
                  }
                  for (let i = 0; i < mod.posts.length; i++) {
                    if (mod.posts[i].transaction.sig === comment_sig) {
                      newtx.children = mod.posts[i].children;
                      mod.comments[i] = newtx;
                    }
                  }
                
                el2.setAttribute("mode", "read");
                el2.innerHTML = revised_text;
                mod.render();
                };
              }
            }
          });
        };
      });
    } catch (err) {
      console.error(err);
    }

    try {
      document.querySelectorAll(".post-view-report").forEach((el) => {
        el.onclick = async (e) => {
          let title = "";
          let text = "";
          const reportit = await sconfirm("Report this post or comments to the mods?");
          if (reportit) {
            const sig = el.getAttribute("data-id");

            //Remove post/comment from the POSt data structures (just to hide it for now)
            for (let i = 0; i < mod.posts.length; i++) {
              if (mod.posts[i].id === sig) {
                title = mod.posts[i].msg.title;
                text = mod.posts[i].msg.comment; 
                mod.posts.splice(i, 1);
              }
            }
            for (let i = 0; i < mod.comments.length; i++) {
              if (mod.comments[i].id === sig) {
                text = mod.comments[i].msg.comment; 
                mod.comments.splice(i, 1);
              }
            }

            const newtx = mod.createReportTransaction(sig, title, text);
            app.network.propagateTransaction(newtx);

            mod.render();
            mod.overlay.hide();
          }
        };
      });
    } catch (err) {}
  },

  addComment(app, mod, comment) {
    comment.originalSig = mod.originalSig;

    app.browser.addElementToDom(PostViewCommentTemplate(app, mod, comment), "post-view-comments");
  },
};
