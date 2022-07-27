const videoChatTemplate = () => {
  return `
    <div class="videocall-chatbox" id="videocall-chatbox">
      <main>
        <section>
        <h6 class="heading" style="color: white;">Video Chat </h6>
        </section>
        <section class="wrapper">
          <video id="localStream" muted="true"  class="box" style="display: block" autoplay>
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
          <i class="video_control fas fa-video" aria-hidden="true"></i>
          <div class="disconnect_btn saito-button-secondary">Disconnect</div>
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