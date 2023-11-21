module.exports = (app, mod, post) => {
  let placeholder = "What's happening";


  return `

    <div class="tweet-overlay hide-scrollbar" id="tweet-overlay">
      <div class="tweet-overlay-content">
        <div class="tweet-overlay-header"></div>

        <!-- ***************************************************
             TEXT AREA and controls are inserted by saito-input 
        *******************************************************-->
        
        <div id="post-tweet-img-preview-container" class="post-tweet-img-preview-container"></div>


          <div class="saito-button-primary post-tweet-button" id="post-tweet-button">${post.source}</div>
      </div>

      <input type="hidden" id="parent_id" name="parent_id" value="${post.parent_id}" />
      <input type="hidden" id="thread_id" name="thread_id" value="${post.thread_id}" />
      <input type="hidden" id="source" name="source" value="${post.source}" />

      <section id="post-tweet-loader" class="post-tweet-loader">
        <span class="loading__anim"></span>
      </section>
    
    </div>

  `;
};
