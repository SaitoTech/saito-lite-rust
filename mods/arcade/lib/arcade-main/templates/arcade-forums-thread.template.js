module.exports = ArcadeForumsThreadTemplate = (obj) => {

  /**** OBJ **** 
  let ft_link 	= "/saito/img/background.png";
  let ft_img 	= "/saito/img/background.png";
  let ft_mod  	= "twilight";
  let ft_title 	= "Saito Discussion";
  let ft_desc 	= "All about Saito and the Saito Arcade";
  let ft_pnum	= 1423;
  let ft_ptext  = "posts";
  let ft_ptitle = "Server Upgraded";
  let ft_puser  = "david@saito";
  let ft_pdate  = "Jan 15";
  *************/

  let ft_ptitle = obj.ft_ptitle;
  if (ft_ptitle) {
    ft_ptitle = obj.ft_ptitle;
    if (ft_ptitle.length > 35) { ft_ptitle = ft_ptitle.substr(0, 35) + "..."; }
  } else {
    ft_ptitle = "";
  }

  return `
      <div class="arcade-post-forum-topic">
        <div class="arcade-post-forum-topic-image">
          <div class="arcade-image-header"><a href="${obj.ft_link}"><img class="arcade-image-header-image"  src="${obj.ft_img}" /></a></div>
	</div>
	<div class="arcade-post-forum-topic-center">
          <div class="arcade-post-forum-topic-intro">
	    <a class="arcade-post-forum-link" href="${obj.ft_link}">
            <div class="arcade-post-forum-topic-title">${obj.ft_title}</div>
            <div class="arcade-post-forum-topic-description">${obj.ft_desc}</div>
	    </a>
	  </div>
          <div class="arcade-post-forum-topic-posts">
	    <div class="arcade-post-forum-topic-posts-num">${obj.ft_pnum}</div>
	    <div class="arcade-post-forum-topic-posts-text">${obj.ft_ptext}</div>
 	  </div>
        </div>
        <div class="arcade-post-forum-topic-latest-post">
          <div class="arcade-post-forum-topic-latest-post-image"><i class="fas fa-user"></i></div>
	  <div class="arcade-post-forum-topic-latest-post-details">
	    <a class="arcade-post-forum-link" href="${obj.ft_link}">
              <div class="arcade-post-forum-topic-latest-post-title">${ft_ptitle}</div>
              <div class="arcade-post-forum-topic-latest-post-info">By ${obj.ft_puser}, ${obj.ft_pdate}</div>
	    </a>
	  </div>
	</div>
      </div>
  `;
}

