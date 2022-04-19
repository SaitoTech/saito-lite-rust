import forge from 'node-forge'
//import jsSHA from 'jssha';

class Util {
  environment() {
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.MixinContext) {
      return 'iOS';
    }
    if (window.MixinContext && window.MixinContext.getContext) {
      return 'Android';
    }
    return undefined;
  }

  conversationId() {
    let ctx;
    switch (this.environment()) {
      case 'iOS':
        ctx = prompt('MixinContext.getContext()');
        return JSON.parse(ctx).conversation_id;
      case 'Android':
        ctx = window.MixinContext.getContext();
        return JSON.parse(ctx).conversation_id;
      default:
        return ctx;
    }
  }

  challenge() {
    let key = forge.random.getBytesSync(32);
    let verifier = this.base64RawURLEncode(key);

    let md = forge.md.sha256.create();
    md.update(key);
    let challenge = this.base64RawURLEncode(md.digest().getBytes());
    window.localStorage.setItem('verifier', verifier);
    return challenge;
  }

  base64RawURLEncode(buffer) {
    return buffer.toString('base64').replace(/\=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

/***
  hashMembers(ids) {
    let key = ids.sort().join('');
    let shaObj = new jsSHA('SHA3-256', 'TEXT', { encoding: 'UTF8' })
    shaObj.update(key);
    return shaObj.getHash('HEX')
  }
***/
}

export default Util;
