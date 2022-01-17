module.exports = ArcadeForumsTemplate = () => {
  return `
    <div class="arcade-posts" id="arcade-posts">
    </div>
    <div class="arcade-announcements" id="arcade-announcements">
<div id="arcade-announcement" class="arcade-announcement">Like large multiplayer games? See our upcoming <a href="https://docs.google.com/spreadsheets/d/1f1QrDFd8f6RaIJhV5m-pQFBoAO9WZGxpCoJmdKBaQwI/edit#gid=0" target="_community">Community Games and Events</a>.</div>
    </div>


<style>

.arcade-image-header {
  padding-top: 10px;
}
.arcade-image-header-image {
  /* width: 100%; */
  height: 66px;
  width: 100px;
  display: flex;
  justify-items: center;
}
.arcade-post-forum-link {
  text-decoration: none;
  color: whitesmoke;
}
.arcade-post-forum-link:hover {
  text-decoration: none;
  color: white;
}
.arcade-post-topic {
  border-bottom: 1px solid #F6F6F6;
  cursor: pointer;
}
.arcade-post-header {
  width: 100%;
  color: whitesmoke;
  background: var(--saito-reverse-jester);
  font-size: 1.2em;
  padding:5px;
  padding-left: 10px;
  font-weight: bold;
  cursor: pointer;
}
.arcade-post-forum-topic {
  display: grid;
  width: 100%;
  height: 90px;
  grid-template-columns: 100px 3fr minmax(300px, 1fr);
}
.arcade-post-forum-topic-image {
  cursor: pointer;
}
.arcade-post-forum-topic-center {
  display: grid;
  padding: 10px;
  grid-template-columns: 8fr minmax(50px, 1fr);
  height: inherit;
  max-height: inherit;
  overflow: hidden;
}
.arcade-post-forum-topic-intro {
  display: grid;
  grid-template-columns: 1fr;
  padding-left: 10px;
}
.arcade-post-forum-topic-title {
  display: flex;
  align-items: flex-end;
  font-size: 1.4em;
  font-weight: bold;
}
.arcade-post-forum-topic-description {
  font-size: 1.15em;
}
.arcade-post-forum-topic-posts {
  text-align: center;
}
.arcade-post-forum-topic-posts-num {
  width: 100%;
  font-size: 1.4em;
  font-weight: bold;
}
.arcade-post-forum-topic-posts-text { 
}
.arcade-post-forum-topic-latest-post {
  padding-top: 10px;
}
.arcade-post-forum-topic-latest-post-image {
  float: left;
  margin-left: auto;
  margin-right: 15px;
  margin-top: 5px;
  margin-bottom: auto;
  font-size: 2.3em;
}
.arcade-post-forum-topic-latest-post-details {
}
.arcade-post-forum-topic-latest-post-title {
  font-size: 1.4em;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: inherit;
  font-style: italic;
}
.arcade-post-forum-topic-latest-post-info {
}



@media only screen and (max-width: 900px) {
  .arcade-post-forum-topic {
    grid-template-columns: 100px 3fr;
  }
  .arcade-post-forum-topic-latest-post {
    display: none;
  }
}


</style>

  `;
}
