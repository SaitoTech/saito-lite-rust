// const ChatManagerSmallTemplate = () => {
//   return `
//       <div class="small-video-chatbox" id="small-video-chatbox">
//         <main>
//           <section class="footer">
//             <i class="audio_control fa fa-microphone" aria-hidden="true"></i>
//             <i class="video_control fas fa-video" aria-hidden="true"></i>
//             <button class="disconnect_btn ">Disconnect</div>
//           </section>
//         </main>
  
  
//       </div>`
// }
const ChatManagerSmallTemplate = () => {
  return `
          <li class="video-chat-manager game-menu-sub-option">
            <i class="audio_control fa fa-microphone aria-hidden="true"></i>
          </li>
          <li class="video-chat-manager game-menu-sub-option">
            <i class="video_control fas fa-video aria-hidden="true"></i>
          </li>
          <li class="video-chat-manager game-menu-sub-option">
            <span  class="disconnect_btn">Disconnect</span>
          </li>

           `
}

module.exports = ChatManagerSmallTemplate;