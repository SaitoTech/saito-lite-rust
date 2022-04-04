const PostCreateTemplate = require('./post-create.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

module.exports = PostCreate = {

  render(app, mod, img_src=null) {

    this.new_post = {};
    this.new_post.images = [];
    this.new_post.title = "";
    this.new_post.comment = "";
    this.new_post.link = "";
    this.new_post.forum = "";

    mod.overlay = new SaitoOverlay(app, mod);
    
    mod.overlay.show(app, mod, PostCreateTemplate(app, mod), function() {
    });

    //document.querySelector(".post-create-header").style.display = "none";
    //this.showTab("discussion");
    //document.querySelector('.post-create-header-discussion').onclick = (e) => { this.showTab("discussion"); }
    //document.querySelector('.post-create-header-link').onclick = (e) =>       { this.showTab("link"); }
    //document.querySelector('.post-create-header-image').onclick = (e) =>      { this.showTab("image"); }
    //document.querySelector('.post-create-image-link-container').onclick = (e) =>       { this.showTab("link"); }

    app.browser.addDragAndDropFileUploadToElement("post-create-container", 
      (file) => {
          console.log(file);
          this.new_post.images.push(file);
          app.browser.addElementToDom(`<div data-id="${this.new_post.images.length-1}" class="post-create-image-preview"><img src="${file}" style="top: 0px; position: relative; float: left; height: 50px; width: auto; margin-left: auto; margin-right: auto;width: auto;" /></div>`, "post-create-image-preview-container");
          this.attachEvents(app, mod);
          document.querySelector(".post-create-title").style.display = "block";
          document.querySelector(".post-create-title").placeholder = "Give Your File a Title";
          document.querySelector(".post-create-textarea").style.display = "none";
      }, 
      false);

    if (img_src != null) {
      this.new_post.images.push(img_src);
      app.browser.addElementToDom(`<div data-id="${this.new_post.images.length-1}" class="post-create-image-preview"><img src="${img_src}" style="top: 0px; position: relative; float: left; height: 50px; width: auto; margin-left: auto; margin-right: auto;width: auto;" /></div>`, "post-create-image-preview-container");
      this.attachEvents(app, mod);
      document.querySelector(".post-create-title").style.display = "block";
      document.querySelector(".post-create-title").placeholder = "Give Your Screenshot a Title";
      document.querySelector(".post-create-textarea").style.display = "none";
      //document.querySelector(".post-create-link").style.display = "none";
      //document.querySelector(".post-create-image-link-container").style.display = "none";
    }

    document.querySelector('.post-create-textarea').focus();
  },

  attachEvents(app, mod) {

    document.querySelector('.post-submit-btn').onclick = async (e) => {

      if (this.new_post.images.length > 0) {
	      alert("It may take up to a minute to update large images. Please be patient!");
      }
      // ===== USER INPUT =====
      this.new_post.title = sanitize(document.querySelector('.post-create-title').value);
      // ===== USER INPUT =====
      this.new_post.comment = sanitize(document.querySelector('.post-create-textarea').innerHTML);
      
      //this.new_post.link = document.querySelector('.post-create-link-input').value;
      this.new_post.forum = document.querySelector('.post-create-forum').value;

      //console.log("NEW POST: "+this.new_post.comment);

      if (!this.new_post.title) {
        let title = "";
        this.new_post.comment.split(/<[^<]+>/gi).forEach(line =>{
          if (!title){
            title += line.replaceAll("&nbsp;"," ");
          }
          title = title.trim(); //Doesn't help because white space is coded as &nbsp;
        });
        
      	if (title.length > 40) { title = title.substr(0, 40) + "..."; 	}
        this.new_post.title = title;
      }

      if (this.new_post.title == ""){
        salert("Cannot submit untitled/empty post!");
        return; 
      }

      document.querySelector('.post-submit-btn').style.display = "none";
      document.querySelector('#post-loader-spinner').style.display = "block";

      let newtx = mod.createPostTransaction(this.new_post.title, this.new_post.comment, this.new_post.link, this.new_post.forum, this.new_post.images);
      app.network.propagateTransaction(newtx);
      newtx.children = 0;
      newtx.id = newtx.transaction.sig;
      mod.posts.push(newtx);
      mod.render(); //this should refresh the forum?
      mod.overlay.hide();
    }


    document.querySelectorAll('.post-create-image-preview').forEach(el => {
      el.onclick = async (e) => {
        let confirm_this = await sconfirm("Do you want to delete this image?");
        if (confirm_this) {
          let array_position = el.getAttribute("data-id");
          el.destroy();
          this.new_post.images.splice(array_position, 1);
          document.querySelectorAll('.post-create-image-preview').forEach(el2 => {
            let array_position2 = el2.getAttribute("data-id");
            if (array_position2 > array_position) {
              el2.setAttribute("data-id", (array_position2-1));
            }
          });
        }
      }
    });     

  },




/*  showTab(tab) {

    if (tab === "link") {
      try {
        if (document.querySelector(".post-create-link").style.display === "block") {
	         tab = "discussion";
      	}
      } catch (err) {

      }
    }
    let classname = ".post-create-header-"+tab;

    document.querySelectorAll('.post-create-header-item').forEach(el => { el.classList.remove("post-create-active"); }); 
    document.querySelector(classname).classList.toggle("post-create-active");

    if (tab === "discussion") {
      document.querySelector(".post-create-link").style.display = "none";
      document.querySelector(".post-create-image").style.display = "none";
      document.querySelector(".post-create-textarea").style.display = "block";
    }

    if (tab === "link") {
      document.querySelector(".post-create-link").style.display = "block";
      document.querySelector(".post-create-image").style.display = "none";
      document.querySelector(".post-create-textarea").style.display = "none";
    }

    if (tab === "image") {
      document.querySelector(".post-create-link").style.display = "none";
      document.querySelector(".post-create-image").style.display = "block";
      document.querySelector(".post-create-textarea").style.display = "none";
    }

  },


  isValidURL(string) {
    let url;
  
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }

    return url.protocol === "http:" || url.protocol === "https:";
  }
*/
}

