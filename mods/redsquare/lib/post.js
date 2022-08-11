const PostTemplate = require("./post.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const JSON = require('json-bigint');

class Post {

    constructor(app, mod) {
      this.overlay = new SaitoOverlay(app, mod);
      this.parent_id = "";
      this.thread_id = "";
      this.images = [];
    }

    render(app, mod) {

      this.overlay.show(app, mod, '<div id="redsquare-tweet-overlay" class="redsquare-tweet-overlay"></div>');
      app.browser.addElementToSelector(PostTemplate(app, mod, app.wallet.returnPublicKey(), this.parent_id, this.thread_id), "#redsquare-tweet-overlay");
      document.getElementById("post-tweet-textarea").focus();
      this.attachEvents(app, mod);
    }

    attachEvents(app, mod) { 


      app.browser.addDragAndDropFileUploadToElement("redsquare-tweet-overlay", 
      (file) => {
          this.images.push(file);
          app.browser.addElementToDom(`<div class="post-tweet-img-preview"><img src="${file}"
             /><i data-id="${this.images.length-1}" class="fas fa-times-circle saito-overlay-closebox-btn post-tweet-img-preview-close"></i>
             </div>`, document.getElementById("post-tweet-img-preview-container"));
      }, 
      false);

      document.getElementById("post-tweet-button").onclick = (e) => {

        e.preventDefault();

        let text = document.getElementById('post-tweet-textarea').value;
        let parent_id = document.getElementById("parent_id").value;
        let thread_id = document.getElementById("thread_id").value;
        let data = { text : text };
        if (parent_id !== "") {
          data = { text : text , parent_id : parent_id , thread_id : thread_id };
        }
        if (this.images.length > 0) {
          data['images'] = this.images;
        }

        let newtx = mod.sendTweetTransaction(app, mod, data);  
      	mod.addTweetFromTransaction(app, mod, newtx);


        if (thread_id !== "") {
console.log("RENDER MAIN PAGE");
      	  mod.renderMainPage(app, mod);
      	} else {
console.log("RENDER WITH CHILDREN");
          mod.renderWithChildren(app, mod, thread_id);
      	}

      	this.overlay.hide();
        document.getElementById("redsquare-new-tweets-btn").style.display = 'block';
      }

      let post_self = this;
      document.addEventListener('click',function(e){
        console.log(e.target);
        if (typeof (e.target.classList) != 'undefined'){
          if (e.target.classList.contains('post-tweet-img-preview-close')){
                let array_position = e.target.getAttribute("data-id");
                e.target.parentNode.remove();
                console.log('images before')
                console.log(post_self.images);
                console.log(array_position);
                console.log('***********');
                (post_self.images).splice(array_position, 1);
                console.log(post_self.images);
                document.querySelectorAll('.post-tweet-img-preview-close').forEach(el2 => {
                  let array_position2 = el2.getAttribute("data-id");
                  if (array_position2 > array_position) {
                    el2.setAttribute("data-id", (array_position2-1));
                  }
                });
          }
        }
      });

    }

}

module.exports = Post;

