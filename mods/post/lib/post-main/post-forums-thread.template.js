module.exports = PostForumsThreadTemplate = (obj) => {

  let ft_ptitle = obj.ft_ptitle;
  if (ft_ptitle) {
    ft_ptitle = obj.ft_ptitle;
    if (ft_ptitle.length > 35) { ft_ptitle = ft_ptitle.substr(0, 35) + "..."; }
  } else {
    ft_ptitle = "";
  }

  return `
      <div class="forum-post-forum-topic">
        <div class="forum-post-forum-topic-image">
          <div class="forum-image-header"><a href="?forum=${obj.ft_mod}"><img class="forum-image-header-image"  src="${obj.ft_img}" /></a></div>
        </div>
        <div class="forum-post-forum-topic-center">
          <div class="forum-post-forum-topic-intro">
            <a class="forum-post-forum-link" href="?forum=${obj.ft_mod}">
            <div class="forum-post-forum-topic-title">${obj.ft_title}</div>
            <div class="forum-post-forum-topic-description">${obj.ft_desc}</div>
            </a>
          </div>
          <div class="forum-post-forum-topic-posts">
            <div class="forum-post-forum-topic-posts-num">${obj.ft_pnum}</div>
            <div class="forum-post-forum-topic-posts-text">${obj.ft_ptext}</div>
          </div>
        </div>
        <div class="forum-post-forum-topic-latest-post">
          <div class="forum-post-forum-topic-latest-post-image"><i class="fas fa-user"></i></div>
          <div class="forum-post-forum-topic-latest-post-details">
            <a class="forum-post-forum-link" href="?forum=${obj.ft_mod}">
              <div class="forum-post-forum-topic-latest-post-title">${ft_ptitle}</div>
              <div class="forum-post-forum-topic-latest-post-info">By ${obj.ft_puser}, ${obj.ft_pdate}</div>
            </a>
          </div>
        </div>
      </div>
  `;

}

