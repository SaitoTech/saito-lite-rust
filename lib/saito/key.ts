class Key {
  public publickey: string;
  public tags: any;
  public identifiers: any;
  public watched: boolean;
  public lock_block: boolean;
  public aes_publickey: string;
  public aes_privatekey: string;
  public aes_secret: any;
  public data: any;

  constructor() {
    this.publickey = "";
    this.tags = [];
    this.identifiers = [];
    this.watched = false;
    this.lock_block = false; // after this bid, identifier is locked
    this.aes_publickey = "";
    this.aes_privatekey = "";
    this.aes_secret = "";
    this.data = {};
  }

  addTag(tag) {
    if (!this.isTagged(tag)) {
      this.tags.push(tag);
    }
  }

  addIdentifier(identifier) {
    if (!this.isIdentifier(identifier)) {
      this.identifiers.push(identifier);
    }
  }

  hasSharedSecret() {
    if (this.aes_secret != "") {
      return true;
    }
    return false;
  }

  isIdentifier(identifier) {
    for (let x = 0; x < this.identifiers.length; x++) {
      if (this.identifiers[x] == identifier) {
        return true;
      }
    }
    return false;
  }

  isPublicKey(publickey) {
    return this.publickey == publickey;
  }

  isWatched(publickey) {
    return this.watched;
  }

  isTagged(tag) {
    for (let x = 0; x < this.tags.length; x++) {
      if (this.tags[x] == tag) {
        return true;
      }
    }
    return false;
  }

  removeIdentifier(identifier) {
    if (!this.isIdentifier(identifier)) {
      return;
    }
    for (let x = this.identifiers.length - 1; x >= 0; x--) {
      if (this.identifiers[x] == identifier) {
        this.identifiers.splice(x, 1);
      }
    }
  }

  removeTag(tag) {
    if (!this.isTagged(tag)) {
      return;
    }
    for (let x = this.tags.length - 1; x >= 0; x--) {
      if (this.tags[x] == tag) {
        this.tags.splice(x, 1);
      }
    }
  }
}

export default Key;
