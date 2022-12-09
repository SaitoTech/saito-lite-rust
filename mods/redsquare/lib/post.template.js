const SaitoUserTemplate = require('./../../../lib/saito/new-ui/templates/saito-user.template');


module.exports = (app, mod, post) => {

  let userline = "create a text-tweet or drag-and-drop images...";
  let placeholder = "What's happening";

  if (post.source == 'Retweet / Share') {
    userline = 'add a comment to your retweet or just click submit...';
    placeholder = "Optional comment?"
  }

  return `

    <div class="redsquare-tweet-overlay" id="redsquare-tweet-overlay">

      ${SaitoUserTemplate(app, post.publickey, userline)}

      <textarea rows="7" class="post-tweet-textarea" name="post-tweet-textarea" id="post-tweet-textarea" placeholder="${placeholder}" cols="60"></textarea>

      <input type="hidden" id="parent_id" name="parent_id" value="${post.parent_id}" />
      <input type="hidden" id="thread_id" name="thread_id" value="${post.thread_id}" />
      <input type="hidden" id="source" name="source" value="${post.source}" />

      <div id="post-tweet-img-preview-container"></div>

      <div class="post-tweet-img-icon" id="post-tweet-img-icon"><i class="fa-solid fa-image"></i></div>
      <div class="saito-button-primary post-tweet-button" id="post-tweet-button"> ${post.source} </div>
      <div style="clear:both"></div>

      <section id="post-tweet-loader" class="post-tweet-loader">
        <span class="loading__anim"></span>
      </section>
    
    </div>

  `;

}

