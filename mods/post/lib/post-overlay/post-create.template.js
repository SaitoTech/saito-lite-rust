module.exports = PostCreateTemplate = (app, mod) => {

  let subforum = "saito";
  if (app.browser.returnURLParameter("game")) {
    subforum = app.browser.returnURLParameter("game");
  }
  if (app.browser.returnURLParameter("forum")) {
    subforum = app.browser.returnURLParameter("forum");
  }

  return `
  <div id="post-create-container" class="post-create-container">
    <div id="post-create-header" class="post-create-header">
      <div id="post-create-header-link" class="post-header-active post-create-header-item post-create-header-discussion post-create-active">Discussion</div>
      <div id="post-create-header-link" class="post-create-header-item post-create-header-image">Image</div>
      <div id="post-create-header-link" class="post-create-header-item post-create-header-link">Link</div>
    </div>

    <div id="post-create" class="post-create">

      <input type="text" class="post-create-title" name="post-create-title" placeholder="Title (optional)">

      <div id="post-create-link" class="post-create-link">
        <input type="text" class="post-create-link-input" name="post-create-link-input" placeholder="https://...">
      </div>

      <div id="post-create-image" class="post-create-image" name="post-create-image" tabindex="0">drag-and-drop, click or paste image</div>

      <div id="post-create" class="post-create-textarea markdown medium-editor-element" placeholder="Your post..." contenteditable="true" spellcheck="true" data-medium-editor-element="true" role="textbox" aria-multiline="true" data-medium-editor-editor-index="1" medium-editor-index="37877e4c-7415-e298-1409-7dca41eed3b8"></div>

      <input type="hidden" class="post-create-forum" name="post-create-forum" value="${subforum}" />

      <div id="post-create-image-preview-container" class="post-create-image-preview-container">
      </div>


      <div id="post-create-image-link-container" class="post-create-image-link-container" style="
        float: right;
        font-size: 1.5em;
        border: 1px solid grey;
        margin: auto;
        padding: 10px;
        padding-bottom: 5px;
        position: relative;
      "><i class="fas fa-link"></i></div>


      <button class="post-submit-btn">Submit</button>

    </div>
  </div>
  `;
}

