
module.exports = (app, mod, chat_popup_id) => {

    return `

  <div class="chat-container chat-popup-${chat_popup_id}" id="chat-popup-${chat_popup_id}">
  <div class="chat-header">
  <i class="far fa-comment-dots"></i>
  <h6>Community Chat</h6>
  <i id="chat-container-close-${chat_popup_id}" class="chat-container-close fas fa-times"></i>
</div>
<div class="chat-body">

<div class="chat-message-set chat-message-set-others chat-message-set-227ddb8f7497262225d0107f372db252a01c3c09d5fac85199dfd1b5ce42fe8c" id="chat-message-set-227ddb8f7497262225d0107f372db252a01c3c09d5fac85199dfd1b5ce42fe8c">
      <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSgyMTcsMzgsMTY5LDEpOyBzdHJva2U6cmdiYSgyMTcsMzgsMTY5LDEpOyBzdHJva2Utd2lkdGg6Mi4xOyc+PHJlY3QgIHg9JzE2OCcgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScxNjgnIHk9JzE2OCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzE2OCcgeT0nMzM2JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nODQnIHk9Jzg0JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMjUyJyB5PSc4NCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9Jzg0JyB5PScxNjgnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9JzE2OCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9Jzg0JyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9JzI1Micgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9Jzg0JyB5PSczMzYnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9JzMzNicgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzAnIHk9Jzg0JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMzM2JyB5PSc4NCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzAnIHk9JzE2OCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzMzNicgeT0nMTY4JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48L2c+PC9zdmc+" class="chat-room-message-identicon">
      <div class="chat-message-set-content chat-message-set-content-others">
        <div class="chat-message-header">
              <p class="chat-message-author"><span data-id="waqZPZuuJ9nHRBUGhNRiHnLD3YAuF7zMRLWEsxg3S9YA" class="saito-address saito-address-waqZPZuuJ9nHRBUGhNRiHnLD3YAuF7zMRLWEsxg3S9YA">waqZPZuuJ9nHRBUGhNRiHnLD3YAuF7zMRLWEsxg3S9YA</span></p>
              <p class="chat-message-timestamp">13:39</p>
        </div>
        <div class="chat-box-message-container chat-box-message-container-others" style="border-color:rgba(217,38,169);">
          
    <div class="chat-room-message chat-room-message-others" id="b10c2c286dfb1ed6775fd43e365a51cdd0d64779bf8f4bcfabe8b72c2e46030c314e7cfd839336fa648e7f6373ccf574018113d70d698d4f26b06f6010bc08c4">
      <div class="chat-message-text"><p>hey</p>
</div>
    </div>
  
    <div class="chat-room-message chat-room-message-others" id="777e746bfb6141843f35af436781255fa175c26be4b149f26c9dd6e1b5bc28671c8d6669600243896b3b7b4c90e45327b6d66e63ef62b0002a1188fec80d449a">
      <div class="chat-message-text"><p>:)</p>
</div>
    </div>
  
        </div>
      </div>
    </div>

  </div>

  <div class="chat-item other">
      <div class="chat-time">
          5:00am
      </div>
      <div class="chat-profile">
          <div class="chat-profile-dropdown">
              <div>
                  <i class="fas fa-globe"></i>
                  <p> Connect</p>
              </div>
              <div>
                  <i class="far fa-calendar"></i>
                  <p> Schedule Event</p>
              </div>
              <div>
                  <i class="fas fa-chess-board"></i>
                  <p> See Ranking</p>
              </div>
          </div>
          <img src="/saito/img/background.png" />
          <div class="chat-profile-dropdown">
              <div>
                  <i class="fas fa-globe"></i>
                  <p> Connect</p>
              </div>
              <div>
                  <i class="far fa-calendar"></i>
                  <p> Schedule Event</p>
              </div>
              <div>
                  <i class="fas fa-chess-board"></i>
                  <p> See Ranking</p>
              </div>
          </div>
      </div>
      <div class="chat-dialog">
          <div>
              sure
          </div>
          <div>
              Let's hope on
          </div>

      </div>
  </div>

</div>

<div class="chat-footer">
  <input type="text" placeholder="Type something..." />
  <i class="fas fa-paper-plane"></i>
</div>
  </div>

  `;

}





{/* <i id="chat-container-close-${chat_popup_id}" class="chat-container-close fas fa-times"></i> */ }
