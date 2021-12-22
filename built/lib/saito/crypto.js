"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_browserify_1 = __importDefault(require("crypto-browserify"));
var node_cryptojs_aes_1 = __importDefault(require("node-cryptojs-aes"));
var crypto_1 = require("crypto");
var secp256k1 = __importStar(require("secp256k1"));
var Base58 = __importStar(require("base-58"));
var fastest_stable_stringify_1 = __importDefault(require("fastest-stable-stringify"));
var CryptoJS = node_cryptojs_aes_1.default.CryptoJS;
var JsonFormatter = node_cryptojs_aes_1.default.JsonFormatter;
/**
 * Crypto Constructor
 */
var Crypto = /** @class */ (function () {
    function Crypto(app) {
        this.app = app;
    }
    ///////////////////////////////////
    // BASIC CRYPTOGRAPHIC FUNCTIONS //
    ///////////////////////////////////
    /**
     * Hashes a string using blake3
     *
     * over-written on init with library-specific function
     *
     * server is fast, client is slow
     *
     * @param {string} data string data
     * @returns {string} blake3 hash
     *
     * NOTE: we use different libraries for the server and in-browser clients
     * and these are initialized in /apps/core/index.js as opposed to here in
     * order to avoid compilation errors that come from the structure of the
     * libraries we are using. There may be a way to improve this, but for now
     * means that the hashing algorithm is dynamically added to the app obj on
     * initialization.
     */
    Crypto.prototype.hash = function (data) {
        if (data === void 0) { data = ""; }
        //
        // 64-bit hash
        //
        return this.app.hash(data);
    };
    //////////////////////////
    // XOR - used in gaming //
    //////////////////////////
    //
    // XOR encrypt and decrypt code taken from
    //
    // https://www.npmjs.com/package/bitwise-xor
    //
    // this needs to be replaced by a more secure commutive encryption algorithm
    //
    Crypto.prototype.xor = function (a, b) {
        var i;
        if (!Buffer.isBuffer(a))
            a = new Buffer(a);
        if (!Buffer.isBuffer(b))
            b = new Buffer(b);
        var res = [];
        if (a.length > b.length) {
            for (i = 0; i < b.length; i++) {
                res.push(a[i] ^ b[i]);
            }
        }
        else {
            for (i = 0; i < a.length; i++) {
                res.push(a[i] ^ b[i]);
            }
        }
        return new Buffer(res);
    };
    //
    // TODO - don't pad key this way as it creates attack vectors
    //
    Crypto.prototype.encodeXOR = function (plaintext, key) {
        while (plaintext.length > key.length) {
            key = key + key;
        }
        return this.xor(Buffer.from(plaintext, 'hex'), Buffer.from(key, 'hex')).toString('hex');
    };
    //
    // TODO - don't pad key this way as it creates attack vectors
    //
    Crypto.prototype.decodeXOR = function (str, key) {
        while (str.length > key.length) {
            key = key + key;
        }
        return this.xor(Buffer.from(str, 'hex'), Buffer.from(key, 'hex')).toString('hex');
    };
    Crypto.prototype.toSizedArray = function (value, size) {
        var value_buffer;
        if (value.toString() !== "0") {
            value_buffer = Buffer.from(value.toString(), "hex");
        }
        else {
            value_buffer = Buffer.from("");
        }
        var new_buffer = Buffer.alloc(size);
        console.assert(size >= value_buffer.length, "unhandled value ranges found");
        value_buffer.copy(new_buffer, size - value_buffer.length);
        return new_buffer;
    };
    Crypto.prototype.stringToHex = function (str) {
        return Buffer.from(str, 'utf-8').toString('hex');
    };
    Crypto.prototype.hexToString = function (hex) {
        return Buffer.from(hex, 'hex').toString('utf-8');
    };
    Crypto.prototype.stringToBase64 = function (str) {
        return Buffer.from(str, 'utf-8').toString('base64');
    };
    Crypto.prototype.base64ToString = function (str) {
        return Buffer.from(str, 'base64').toString('utf-8');
    };
    ///////////////////////////////////
    // ELLIPTICAL CURVE CRYPTOGRAPHY //
    ///////////////////////////////////
    /**
     * Compresses public key
     *
     * @param {string} pubkey
     * @returns {string} compressed publickey
     */
    Crypto.prototype.compressPublicKey = function (pubkey) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.toBase58(secp256k1.publicKeyConvert(Buffer.from(pubkey, 'hex'), true).toString("hex"));
    };
    /**
     * Converts base58 string to hex string
     *
     * @param {string} t string to convertches
     * @returns {string} converted string
     */
    Crypto.prototype.fromBase58 = function (t) {
        return Buffer.from(Base58.decode(t)).toString('hex');
    };
    /**
     * Converts hex string to base58 string
     *
     * @param {string} t string to convert
     * @returns {string} converted string
     */
    Crypto.prototype.toBase58 = function (t) {
        return Base58.encode(Buffer.from(t, 'hex'));
    };
    /**
     * Creates a public/private keypair. returns the string
     * of the private key from which the public key can be
     * re-generated.
     * @returns {string} private key
     */
    Crypto.prototype.generateKeys = function () {
        var privateKey;
        do {
            privateKey = (0, crypto_1.randomBytes)(32);
        } while (!secp256k1.privateKeyVerify(privateKey));
        return privateKey.toString('hex');
    };
    /**
     * Creates a random number, but not a privatekey. used for
     * XOR encryption in the game engine among other uses. public/private keypair. returns the string
     * @returns {string} private key
     */
    Crypto.prototype.generateRandomNumber = function () {
        var randomNumber = (0, crypto_1.randomBytes)(32);
        return randomNumber.toString('hex');
    };
    /**
     * Returns the public key associated with a private key
     * @param {string} privkey private key (hex)
     * @returns {string} public key (hex)
     */
    Crypto.prototype.returnPublicKey = function (privkey) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.compressPublicKey(secp256k1.publicKeyCreate(Buffer.from(privkey, 'hex'), false).toString("hex"));
    };
    /**
     * Signs a message with a private key, and returns the message
     * @param {string} msg message to sign
     * @param {string} privkey private key (hex)
     * @returns {string} hex signed message
     */
    Crypto.prototype.signMessage = function (msg, privatekey) {
        var signature = this.signBuffer(Buffer.from(msg, 'utf-8'), privatekey);
        return signature;
    };
    /**
     * Signs a message buffer
     * @param {Buffer} buffer
     * @param {Buffer} privatekey
     * @returns {string}
     */
    Crypto.prototype.signBuffer = function (buffer, privatekey) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        var signature = secp256k1.sign(Buffer.from(this.hash(buffer), 'hex'), Buffer.from(privatekey, 'hex')).signature.toString('hex');
        return signature;
    };
    /**
     * Confirms that a message was signed by the private
     * key associated with a providded public key
     * @param {string} buffer
     * @param {string} sig
     * @param {string} pubkey
     * @returns {boolean} is signature valid?
     */
    Crypto.prototype.verifyHash = function (buffer, sig, pubkey) {
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return secp256k1.verify(Buffer.from(buffer, 'hex'), Buffer.from(sig, 'hex'), Buffer.from(this.fromBase58(pubkey), 'hex'));
        }
        catch (err) {
            console.error(err);
            return false;
        }
    };
    /**
     * Confirms that a message was signed by the private
     * key associated with a providded public key
     * @param {string} msg as a string instead of a hash
     * @param {string} sig
     * @param {string} pubkey
     * @returns {boolean} is signature valid?
     */
    Crypto.prototype.verifyMessage = function (msg, sig, pubkey) {
        try {
            var hash = this.hash(Buffer.from(msg, 'utf-8').toString("hex"));
            //let hash = this.hash(Buffer.from(msg).toString('hex'));
            return this.verifyHash(hash, sig, pubkey);
        }
        catch (err) {
            console.log(err);
            return false;
        }
        return false;
    };
    /**
     * Returns an uncompressed public key from publickey
     * @param {string} pubkey public key (base-58)
     * @returns {string} public key (hex)
     */
    Crypto.prototype.uncompressPublicKey = function (pubkey) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return secp256k1.publicKeyConvert(Buffer.from(this.fromBase58(pubkey), 'hex'), false).toString();
    };
    /**
     * Checks if a publickey passed into a function
     * fits the criteria for a publickey
     * @param {string} publickey
     * @returns {boolean} does publickey fit the criteria?
     */
    Crypto.prototype.isPublicKey = function (publickey) {
        if (publickey.length == 44 || publickey.length == 45) {
            if (publickey.indexOf("@") <= 0) {
                return 1;
            }
        }
        return 0;
    };
    //////////////////
    // MERKLE TREES //
    //////////////////
    //
    // now handled in block.js
    //
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
    Crypto.prototype.createDiffieHellman = function (pubkey, privkey) {
        if (pubkey === void 0) { pubkey = ""; }
        if (privkey === void 0) { privkey = ""; }
        var ecdh = crypto_browserify_1.default.createECDH("secp256k1");
        ecdh.generateKeys();
        if (pubkey != "") {
            ecdh.setPublicKey(pubkey);
        }
        if (privkey != "") {
            ecdh.setPrivateKey(privkey);
        }
        return ecdh;
    };
    /**
     * Given a Diffie-Hellman object, fetch the keys
     * @param {DiffieHellman object} dh Diffie-Hellamn object
     * @returns {object} object with keys
     */
    Crypto.prototype.returnDiffieHellmanKeys = function (dh) {
        var keys = {};
        keys.pubkey = dh.getPublicKey(null, "compressed");
        keys.privkey = dh.getPrivateKey(null, "compressed");
        return keys;
    };
    /**
     * Given your private key and your counterparty's public
     * key and an extra piece of information, you can generate
     * a shared secret.
     *
     * @param {DiffieHellman object} counterparty DH
     * @param {string} my_publickey
     * @return {{pubkey:"", privkey:""}} object with keys
     */
    Crypto.prototype.createDiffieHellmanSecret = function (a_dh, b_pubkey) {
        return a_dh.computeSecret(b_pubkey);
    };
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
    Crypto.prototype.aesEncrypt = function (msg, secret) {
        var rp = secret.toString("hex");
        var en = CryptoJS.AES.encrypt(msg, rp, { format: JsonFormatter });
        return en.toString();
    };
    /**
     * Decrypt with AES
     * @param {string} msg encrypted json object from aesEncrypt
     * @param {string} secret shared secret
     * @returns {string} unencrypted string
     */
    Crypto.prototype.aesDecrypt = function (msg, secret) {
        var rp = secret.toString("hex");
        var de = CryptoJS.AES.decrypt(msg, rp, { format: JsonFormatter });
        return CryptoJS.enc.Utf8.stringify(de);
    };
    //////////////////////////
    // Faster Serialization //
    //////////////////////////
    //
    // Yes, this isn't a cryptographic function, but we can put it here
    // until it makes sense to create a dedicated helper class.
    //
    Crypto.prototype.fastSerialize = function (jsobj) {
        return (0, fastest_stable_stringify_1.default)(jsobj);
    };
    return Crypto;
}());
exports.default = Crypto;
//# sourceMappingURL=crypto.js.map