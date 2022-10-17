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
          <li class="video-chat-manager">
            <i class="audio_control fa fa-microphone game-menu-option" aria-hidden="true"></i>
          </li>
          <li class="video-chat-manager">
            <i class="video_control fas fa-video game-menu-option" aria-hidden="true"></i>
          </li>
          <li class="video-chat-manager">
            <button style="margin:0; padding: .8rem;" class="disconnect_btn game-menu-option ">Disconnect</div>
          </li>

           `
}

module.exports = ChatManagerSmallTemplate;