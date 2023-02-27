import { randomBytes } from "crypto";
import Saito from "saito-js/saito";
import node_cryptojs from "node-cryptojs-aes";
import crypto from "crypto-browserify";

const CryptoJS = node_cryptojs.CryptoJS;
const JsonFormatter = node_cryptojs.JsonFormatter;

export default class Crypto {
  public hash(buffer: Uint8Array | string): string {
    if (typeof buffer === "string") {
      return Saito.getInstance().hash(Buffer.from(buffer));
    }
    // 64-bit hash
    return Saito.getInstance().hash(buffer);
  }

  public signBuffer(buffer: Uint8Array, privateKey: string): string {
    return Saito.getInstance().signBuffer(buffer, privateKey);
  }

  public verifySignature(buffer: Uint8Array, sig: string, publicKey: string): boolean {
    return Saito.getInstance().verifySignature(buffer, sig, publicKey);
  }

  public signMessage(msg: string, privateKey: string): string {
    return this.signBuffer(Buffer.from(msg, "utf-8"), privateKey);
  }

  public verifyMessage(msg: string, sig: string, publicKey: string): boolean {
    return this.verifySignature(Buffer.from(msg, "utf-8"), sig, publicKey);
  }

  ////////////////////////////////
  // AES SYMMETRICAL ENCRYPTION //
  ////////////////////////////////
  //
  // once we have a shared secret (possibly generated through the
  // Diffie-Hellman method above), we can use it to encrypt and
  // decrypt communications using a symmetrical encryption method
  // like AES.
  //

  /**
   * Encrypts with AES
   * @param {string} msg msg to encrypt
   * @param {string} secret shared secret
   * @returns {string} json object
   */
  aesEncrypt(msg, secret) {
    const rp = secret.toString("hex");
    const en = CryptoJS.AES.encrypt(msg, rp, { format: JsonFormatter });
    return en.toString();
  }

  /**
   * Decrypt with AES
   * @param {string} msg encrypted json object from aesEncrypt
   * @param {string} secret shared secret
   * @returns {string} unencrypted string
   */
  aesDecrypt(msg, secret) {
    const rp = secret.toString("hex");
    const de = CryptoJS.AES.decrypt(msg, rp, { format: JsonFormatter });
    return CryptoJS.enc.Utf8.stringify(de);
  }

  ////////////////////
  // DIFFIE HELLMAN //
  ////////////////////
  //
  // The DiffieHellman process allows two people to generate a shared
  // secret in an environment where all information exchanged between
  // the two can be observed by others.
  //
  // It is used by our encryption module to generate shared secrets,
  // but is generally useful enough that we include it in our core
  // cryptography class
  //
  // see the "encryption" module for an example of how to generate
  // a shared secret using these functions
  //

  /**
   * Creates DiffieHellman object
   * @param {string} pubkey public key
   * @param {string} privkey private key
   * @returns {DiffieHellman object} ecdh
   */
  createDiffieHellman(pubkey = "", privkey = "") {
    const ecdh = crypto.createECDH("secp256k1");
    ecdh.generateKeys();
    if (pubkey != "") {
      ecdh.setPublicKey(pubkey);
    }
    if (privkey != "") {
      ecdh.setPrivateKey(privkey);
    }
    return ecdh;
  }

  generateKeys(): string {
    return Saito.getInstance().generatePrivateKey();
  }

  generatePublicKey(privateKey: string): string {
    return Saito.getInstance().generatePublicKey(privateKey);
  }

  /**
   * Creates a random number, but not a privatekey. used for
   * XOR encryption in the game engine among other uses. public/private keypair. returns the string
   * @returns {string} private key
   */
  generateRandomNumber() {
    const randomNumber = randomBytes(32);
    return randomNumber.toString("hex");
  }
}
