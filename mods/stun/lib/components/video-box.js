const videoBoxTemplate = require("./video-box.template");
const { setTextRange } = require("typescript");

// import {applyVideoBackground } from 'virtual-bg';

class VideoBox {
  constructor(app, mod, peer, container_class, isPresentation) {
    this.app = app;
    this.mod = mod;
    this.stream = null;
    this.stream_id = peer;
    this.containerClass = container_class;
    this.isPresentation = isPresentation;

    app.connection.on("toggle-peer-audio-status", ({ enabled, public_key }) => {
      if (public_key !== this.stream_id) return;
      const video_box = document.querySelector(`#stream${this.stream_id}`);
      if (video_box.querySelector(`#stream${this.stream_id} .video-call-info`)) {
        let element = video_box.querySelector(
          `#stream${this.stream_id} .video-call-info .fa-microphone-slash`
        );

        if (!enabled && !element) {
          video_box
            .querySelector(`#stream${this.stream_id} .video-call-info`)
            .insertAdjacentHTML("beforeend", `<i class="fa fa-microphone-slash"> </i>`);
        } else {
          if (element) {
            element.remove();
          }
        }
      }
    });
    app.connection.on("toggle-peer-video-status", ({ enabled, public_key }) => {
      if (public_key !== this.stream_id) return;
      const video_box = document.querySelector(`#stream${this.stream_id}`);
      if (video_box.querySelector(`#stream${this.stream_id} .video-call-info`)) {
        let element = video_box.querySelector(
          `#stream${this.stream_id} .video-call-info .fa-video-slash`
        );

        if (!enabled && !element) {
          video_box
            .querySelector(`#stream${this.stream_id} .video-call-info`)
            .insertAdjacentHTML("beforeend", `<i class="fas fa-video-slash"> </i>`);
        } else {
          if (element) {
            element.parentElement.removeChild(element);
          }
        }
      }
    });
  }

  attachEvents() {}

  async render(stream = null, placeholder_info = null) {
    if (stream) {
      this.stream = stream;
    }

    // this.stream = stream;
    if (this.stream !== null) {
      this.removeConnectionMessage();
      if (this.stream_id === "local") {
        this.renderStream({ muted: true });
      } else {
        this.renderStream({ muted: false });
        // console.log('rendering stream');
      }

      let key;
      if (this.stream_id === "local") {
        key = await this.app.wallet.getPublicKey();
      } else {
        key = this.stream_id;
      }
      let name = this.app.keychain.returnIdentifierByPublicKey(key, true);

      const video_box = document.querySelector(`#stream${this.stream_id}`);

      if (video_box) {
        if (video_box.querySelector(".video-call-info")) {
          video_box.querySelector(
            ".video-call-info"
          ).innerHTML = `<p class="saito-address" data-id="${key}" >${name}</p>`;
        }
      }

      if (this.stream_id === "local") return;
    } else {
      this.renderPlaceholder(placeholder_info);
    }

    this.attachEvents();
  }

  async rerender() {
    await this.remove();
    await this.render(this.stream);
  }

  renderStream({ muted }) {
    if (!document.querySelector(`#stream${this.stream_id}`)) {
      this.app.browser.addElementToClass(
        videoBoxTemplate(this.stream_id, muted, this.isPresentation),
        this.containerClass
      );
    }

    const videoBox = document.querySelector(`#stream${this.stream_id}`);
    videoBox.firstElementChild.srcObject = this.stream;
  }

  renderPlaceholder(placeholder_info = "negotiating peer connection") {
    if (!document.querySelector(`#stream${this.stream_id}`)) {
      this.app.browser.prependElementToClass(
        videoBoxTemplate(this.stream_id, false, this.isPresentation),
        this.containerClass
      );
      // this.app.browser.makeDraggable(`stream${this.stream_id}`, `stream${this.stream_id}`);
    }
    this.updateConnectionMessage(placeholder_info);
  }

  updateConnectionMessage(message) {
    const video_box = document.querySelector(`#stream${this.stream_id}`);
    if (video_box.querySelector("#connection-message")) {
      video_box.querySelector(
        "#connection-message"
      ).innerHTML = `<p>${message}</p> <span class="lds-dual-ring"> </span> `;
    } else {
      video_box.insertAdjacentHTML(
        "beforeend",
        `<div id="connection-message"> <p> ${message} </p> <span class="lds-dual-ring"> </span></div> `
      );
    }
  }

  removeConnectionMessage() {
    const video_box = document.querySelector(`#stream${this.stream_id}`);

    if (video_box && video_box.querySelector("#connection-message")) {
      video_box.querySelectorAll("#connection-message").forEach((item) => {
        item.parentElement.removeChild(video_box.querySelector("#connection-message"));
      });
    }

    // if it's in the expanded div, replace
  }

  updateVideoMuteStatus(message) {
    const video_box = document.querySelector(`#stream${this.stream_id}`);
    if (video_box.querySelector(".video-call-info")) {
      video_box.querySelector(".video-call-info").innerHTML = `<p>${message}</p>`;
    }
  }

  removeVideoMuteStatus() {
    const video_box = document.querySelector(`#stream${this.stream_id}`);
    if (video_box.querySelector(".video-call-info")) {
      video_box.querySelectorAll(".video-call-info").forEach((item) => {
        item.parentElement.removeChild(video_box.querySelector(".video-call-info"));
      });
    }
  }

  async remove(is_disconnection = false) {
    let videoBox = document.querySelector(`#stream${this.stream_id}`);
    if (videoBox) {
      if (is_disconnection) {
        if (videoBox.parentElement.classList.contains("expanded-video")) {
          videoBox.remove();
          try {
            this.mod.CallInterface.video_boxes["local"].video_box.containerClass = "expanded-video";
            await this.mod.CallInterface.video_boxes["local"].video_box.rerender();
          } catch (err) {}
          return;
        }
      }
      videoBox.remove();
    }
  }

  streamExists() {
    return this.stream;
  }
}

module.exports = VideoBox;
