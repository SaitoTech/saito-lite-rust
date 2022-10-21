module.exports = ArcadeForumsThreadTemplate = (obj) => {
  let desc = obj.ft_desc;
  if (desc.length > 80) { desc = desc.substr(0, 80) + "..."; }
  
  let ft_ptitle = obj.ft_ptitle;
  if (ft_ptitle) {
    ft_ptitle = obj.ft_ptitle;
    if (ft_ptitle.length > 35) { ft_ptitle = ft_ptitle.substr(0, 35) + "..."; }
  } else {
    ft_ptitle = "";
  }

  return `
      <div class="forum-topic" id="forum-topic-${obj.ft_mod}">
        <div class="forum-topic-image">
          <div class="forum-image-header"><a href="${obj.ft_link}"><img class="forum-image-header-image"  src="${obj.ft_img}" /></a></div>
        </div>
        <div class="forum-topic-center">
          <div class="forum-topic-intro">
            <a class="forum-topic-link" href="${obj.ft_link}">
            <div class="forum-topic-title">${obj.ft_title}</div>
            <div class="forum-topic-description">${desc}</div>
            </a>
          </div>
          <div class="forum-topic-posts" id="forum-topic-posts-${obj.ft_mod}" style="visibility:hidden">
            <div class="forum-topic-posts-num" id="forum-topic-posts-num-${obj.ft_mod}">0</div>
            <div class="forum-topic-posts-text" id="forum-topic-posts-text-${obj.ft_mod}">posts</div>
          </div>
        </div>
        <div class="forum-topic-latest-post" id="forum-topic-latest-post-${obj.ft_mod}" style="visibility:hidden">
          <div class="forum-topic-latest-post-image" id="forum-topic-latest-post-image-${obj.ft_mod}"><i class="fas fa-user"></i></div>
          <div class="forum-topic-latest-post-details">
            <div class="arcade-post-title forum-topic-latest-post-title" id="forum-topic-latest-post-title-${obj.ft_mod}">Post title</div>
            <div class="forum-topic-latest-post-info" id="forum-topic-latest-post-info-${obj.ft_mod}"><span id="forum-topic-latest-post-user-${obj.ft_mod}">User</span>, <span id="forum-topic-latest-post-date-${obj.ft_mod}">Date</span></div>
          </div>
        </div>
      </div>
  `;

}

