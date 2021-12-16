/**
 * This class provides functions for importing and exporting binary-data.
 * It is used heavily in our serialization and deserialization functions
 * and is included in this class mostly as it does not fall cleanly into
 * the crypto class.
 */

export default class Binary {
    app: {}

    constructor(app) {
        this.app = app;
    }

    public hexToSizedArray = (value: Uint8Array | string, size: number): Buffer => {
        let value_buffer: Buffer;
        if (value.toString() !== "0") {
            value_buffer = Buffer.from(value.toString(), "hex");
        } else {
            value_buffer = Buffer.from("");
        }
        let new_buffer = Buffer.alloc(size);
        console.assert(size >= value_buffer.length, "unhandled value ranges found");
        value_buffer.copy(new_buffer, size - value_buffer.length);
        return new_buffer;
    };


    /**
     * Converts from big-endian binary encoded u64(from the wire)
     * into a BigInt
     * @param {Array} bytes - array of bytes
     * @returns BigInt
     */
    u64FromBytes(bytes: Uint8Array): bigint {
        let top = BigInt(this.u32FromBytes(bytes.slice(0, 4)));
        let bottom = BigInt(this.u32FromBytes(bytes.slice(4, 8)));
        let max_u32 = BigInt(4294967296);
        return ((top * max_u32) + bottom);
    }

    /**
     * Converts from a JS Number, treated as an integery, into
     * a big-endian binary encoded u32(for the wire)
     * @param {BigInt|number|string} bigValue - BigInt
     * @returns array of bytes
     */
    u64AsBytes = (bigValue: number | bigint | string): Buffer => {
        bigValue = BigInt(bigValue); // force into Big
        let max_u32 = BigInt(4294967296);
        let top = bigValue / max_u32;
        let bottom = bigValue - BigInt(max_u32 * top);
        let top_bytes = this.u32AsBytes(Number(top));
        let bottom_bytes = this.u32AsBytes(Number(bottom));
        return Buffer.concat([
            Buffer.from(new Uint8Array(top_bytes)),
            Buffer.from(new Uint8Array(bottom_bytes)),
        ]);
    };

    /**
     * Converts from big-endian binary encoded u64(from the wire)
     * into a JS Number(as an integer).
     * @param {array} bytes - array of 4 bytes
     * @returns number
     */
    u32FromBytes = (bytes: Uint8Array): number => {
        let val = BigInt(0);
        for (let i = 0; i < bytes.length; ++i) {
            val = BigInt(bytes[i]) + val * BigInt(256);
        }
        return Number(val);
    };

    /**
     * Converts from a JS Number, treated as an integer, into
     * a big-endian binary encoded u32(for the wire)
     * @param {number} val
     * @returns array of 4 bytes
     */
    u32AsBytes(val: number | bigint) {
        val = BigInt(val);
        let bytes: Uint8Array = new Uint8Array();
        let i = 4;
        do {
            bytes[--i] = Number(val & BigInt(255));
            val = (val - BigInt(bytes[i])) / BigInt(256);
        } while (i)
        return bytes;
    }

    /**
     * Converts from a u8 byte(from the wire)
     * into a JS Number(as an integer).
     * @param {Uint8} byte
     * @returns number
     */
    u8FromByte(byte: number) {
        return byte;
    }

    /**
     * Converts from a JS Number into big-endian binary encoded
     * u8(for the wire)
     * @param {number} val
     * @returns byte
     */
    u8AsByte(val) {
        return val & (255);
    }
}

