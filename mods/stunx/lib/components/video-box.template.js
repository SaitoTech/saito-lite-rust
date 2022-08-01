module.exports = (streamId, muted = false) => {
    return `
    <video id="stream${streamId}"  ${muted ? "muted" : ""}  autoplay  class="box">
    <button class="b-btngrid">2h5dt6dd678s..</button>
    </video>`
}

