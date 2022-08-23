const PostTemplate = require("./post.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const JSON = require('json-bigint');

class Post {

    constructor(app, mod) {
      this.app = app;
      this.mod = mod;
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

      let post_self = this;

      app.browser.addDragAndDropFileUploadToElement("redsquare-tweet-overlay", 
      (file) => {
        if (this.images.length >= 4) {
          salert("Maximum 4 images allowed per tweet.");
        } else {
        
          this.resizeImg(file, 0.75, 0.75); // (img, dimensions, quality)
      
        }
      }, 
      false);

      document.getElementById("post-tweet-button").onclick = (e) => {

        document.getElementById("post-tweet-loader").style.display = 'block';
        e.preventDefault();

        let text = document.getElementById('post-tweet-textarea').value;
        let parent_id = document.getElementById("parent_id").value;
        let thread_id = document.getElementById("thread_id").value;

	//
	// saito-loader
	//
        post_self.overlay.hide();
        post_self.overlay.closebox = false;
        post_self.overlay.show(app, mod, '<div class="saito-loader"></div>');


        let data = { text : text };
        if (parent_id !== "") {
          data = { text : text , parent_id : parent_id , thread_id : thread_id };
        }
        if (this.images.length > 0) {
          data['images'] = this.images;
        }

	setTimeout(() => {

          let newtx = mod.sendTweetTransaction(app, mod, data);  
          mod.addTweetFromTransaction(app, mod, newtx);

          if (thread_id !== "") {
            console.log("RENDER MAIN PAGE");
            mod.renderWithChildren(app, mod, thread_id);
      	    //mod.renderMainPage(app, mod);
      	  } else {
            if (parent_id !== "") {
              console.log("RENDER WITH CHILDREN");
              mod.renderWithChildren(app, mod, parent_id);
	    } else {
              mod.renderMainPage(app, mod);
	    }
      	  }

      	  post_self.overlay.hide();
          document.getElementById("redsquare-new-tweets-banner").style.display = 'block';
	}, 1000);

      }

      document.addEventListener('click',function(e){
        if (typeof (e.target.classList) != 'undefined'){
          if (e.target.classList.contains('post-tweet-img-preview-close')){
                let array_position = e.target.getAttribute("data-id");
                e.target.parentNode.remove();
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

  resizeImg(img, dimensions, quality){
    let post_self = this;
    let canvas = document.createElement("canvas");
    let oImg = document.createElement("img");
    oImg.setAttribute('src', img);
    oImg.setAttribute('id', "uploaded-img");
    document.body.appendChild(oImg);

    let original = document.getElementById("uploaded-img");
    let img_width = 0;
    let img_height = 0;

    let resizedImg = original.onload = function() {
      img_width =  this.width;
      img_height = this.height;

      let type = original.src.split(";")[0].split(":")[1];
      let canvas = document.createElement("canvas");

      let w = 0;
      let h = 0;
      let r = 1;
      
      w = (img_width * r)*dimensions;
      h = (img_height * r)*dimensions;

      canvas.width = w;
      canvas.height = h;

      canvas.getContext("2d").drawImage(this, 0, 0, w, h);
      let result_img_uri = canvas.toDataURL('image/jpeg', quality);
      let imgSize = result_img_uri.length/1024; // in KB

      this.remove();

      if (imgSize > 970) { // 1 MB 

        let newDimensions = (dimensions < 0.95) ? dimensions+0.05 : 0.95;
        let newQuality = (quality < 0.95) ? quality+0.05 : 0.95;

        post_self.resizeImg(result_img_uri, newDimensions, newQuality);
      
      } else {

        post_self.app.browser.addElementToDom(`<div class="post-tweet-img-preview"><img src="${result_img_uri}"
         /><i data-id="${post_self.images.length-1}" class="fas fa-times-circle saito-overlay-closebox-btn post-tweet-img-preview-close"></i>
         </div>`, document.getElementById("post-tweet-img-preview-container"));  

        post_self.images.push(resizedImg);
        return result_img_uri;
      }
    };



    

    
    
  }
}

module.exports = Post;

