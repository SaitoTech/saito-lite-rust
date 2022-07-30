const videoChatTemplate = () => {
  return `
    <div id="video-chat-box" style="left:50%; top: 50%; transform: translate(-50%, -50%)"  class="video body">
      <main>
        <section>
        <p class="heading" style="color: white;">Video Chat </p>
          
        </section>
        <section class="wrapper">
          <video id="localStream" muted="true"  autoplay class="box">
            <button class="b-btngrid">2h5dt6dd678s..</button>
          </video>
          <video id="remoteStream1"   autoplay class="box">
            <button class="b-btngrid">2h5dt6dd678s..</button>
          </video>
          <video id="remoteStream2"   autoplay class="box">
            <button class="b-btngrid">2h5dt6dd678s..</button>
          </video>
          <video id="remoteStream3"    autoplay class="box">
            <button class="b-btngrid">2h5dt6dd678s..</button>
          </video>
          <video id="remoteStream4" style="display: none"   autoplay class="box">
            <button class="b-btngrid">2h5dt6dd678s..</button>
          </video>

        </section>

        <section class="footer">
          <i class="audio_control fa fa-microphone" aria-hidden="true"></i>
          <i class="video_control fa fa-video-camera" aria-hidden="true"></i>
          <button class="disconnect_btn">Disconnect</button>
        </section>
      </main>


    </div>`
}

module.exports = videoChatTemplate;

{/* <div class="box">
<button class="b-btngrid">2h5dt6dd678s..</button>
</div>
<div class="box">
<button class="b-btngrid">2h5dt6dd678s..</button>
</div> */}

// <i class="audio_control fa fa-microphone-slash" aria-hidden="true"></i>