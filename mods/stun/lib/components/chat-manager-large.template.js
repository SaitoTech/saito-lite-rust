const ChatManagerLargeTemplate = (call_type, room_code, mode) => {
  let add_user =
    room_code && mode === "full"
      ? `<div class="add_users_container">
           <label>Invite </label>
           <i class=" add_users fa fa-plus" > </i>
         </div>`
      : "";

  let chat_control =
    mode === "full"
      ? `    <span class="chat_control_container">
      <label>Chat </label>
  <i class="chat_control fa-regular fa-comments"></i>
</span>`
      : "";

  return `
    <div class="stun-chatbox" id="stun-chatbox">
      <main>
        <section class="large-wrapper">
        <div class="video-container-large">
        <div class="expanded-video">

        </div>
        <div class="side-videos">
        </div>
    </div>
        </section>

        <section class="footer">

        <div class="control-panel">
           <div class="timer"  style="opacity: ${mode === "full" ? 1 : 0}" >
        <p class="counter"> 00.00 </p>

        <div class="users-on-call"  style="opacity: ${mode === "full" ? 1 : 0}" >
            <div class="image-list">
                
            </div>
            <p > <span class="users-on-call-count">1</span> on call </p>
        </div>
        ${add_user}
    </div>

   <div class="control-list">
   <span class="display-control">
   <label>Display</label>
   <i class="fa-solid fa-display"></i>
    </span>
          
          ${chat_control}  
          <span class="spacer"></span>  
           <span class="audio-control">
           <label>Microphone </label>
            <i class=" fa fa-microphone" > </i>
            </span>
            <span class="video-control"  style=" background-color: ${call_type === "audio" ? "grey" : "white"
    }">
            <label>Camera </label>
            <i  style=" cursor :${call_type === "audio" ? "none" : "pointer"}; color:${call_type === "audio" ? "black" : "green"
    }" class="  fas fa-video"> </i>
            </span>
            <span class="disconnect-control">
            <label>Disconnect </label>
            <i class="disconnect_btn  fas fa-phone"> </i>
            </span>
        </div>
    </div>
        </section>
      </main>

    <div class="minimizer">
    <i class=" fas fa-caret-down"></i>
    </div>
    </div>`;
};

module.exports = ChatManagerLargeTemplate;

{
  /* <div class="box">
<button class="b-btngrid">2h5dt6dd678s..</button>
</div>
<div class="box">
<button class="b-btngrid">2h5dt6dd678s..</button>
</div> */
}

// <i class="audio-control fa fa-microphone-slash" aria-hidden="true"></i>

// <video id="localStream" muted="true"  class="box" style="display: block" autoplay>
//       <button class="b-btngrid">2h5dt6dd678s..</button>
//     </video>
//     <video id="remoteStream1"   autoplay class="box">
//       <button class="b-btngrid">2h5dt6dd678s..</button>
//     </video>
//     <video id="remoteStream2"   autoplay class="box">
//       <button class="b-btngrid">2h5dt6dd678s..</button>
//     </video>
//     <video id="remoteStream3"    autoplay class="box">
//       <button class="b-btngrid">2h5dt6dd678s..</button>
//     </video>
//     <video id="remoteStream4" style="display: none"   autoplay class="box">
//       <button class="b-btngrid">2h5dt6dd678s..</button>
//     </video>

// <span> <i class="fas fa-chalkboard effects-control"></i> </span>
