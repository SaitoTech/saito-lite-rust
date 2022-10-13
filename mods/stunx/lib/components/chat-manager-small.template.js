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
          <li>
            <i class="video-chat-manager audio_control fa fa-microphone game-menu-option" aria-hidden="true"></i>
          </li>
          <li>
            <i class="video-chat-manager video_control fas fa-video game-menu-option" aria-hidden="true"></i>
          </li>
          <li>
            <button style="margin:0" class="video-chat-manager disconnect_btn game-menu-option ">Disconnect</div>
          </li>

           `
}

module.exports = ChatManagerSmallTemplate;