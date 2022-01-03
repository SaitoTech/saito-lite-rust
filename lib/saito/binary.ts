/**
 * This class provides functions for importing and exporting binary-data.
 * It is used heavily in our serialization and deserialization functions
 * and is included in this class mostly as it does not fall cleanly into
 * the crypto class.
 */
import { Saito } from "../../apps/core";

class Binary {
  public app: Saito;

  constructor(app: Saito) {
    this.app = app;
  }

  /**
   * Converts from big-endian binary encoded u64(from the wire)
   * into a BigInt
   * @returns BigInt
   * @param value
   * @param size
   */
  hexToSizedArray(value: string | Buffer, size: number): Buffer {
    let value_buffer;
    if (value.toString() !== "0") {
      value_buffer = Buffer.from(value.toString(), "hex");
    } else {
      value_buffer = Buffer.from("");
    }
    const new_buffer = Buffer.alloc(size);
    console.assert(size >= value_buffer.length, "unhandled value ranges found");
    value_buffer.copy(new_buffer, size - value_buffer.length);
    return new_buffer;
  }

  /**
   * Converts from big-endian binary encoded u64(from the wire)
   * into a BigInt
   * @param {Array} bytes - array of bytes
   * @returns BigInt
   */
  u64FromBytes(bytes): bigint {
    const top = BigInt(this.u32FromBytes(bytes.slice(0, 4)));
    const bottom = BigInt(this.u32FromBytes(bytes.slice(4, 8)));
    const max_u32 = BigInt(4294967296);
    return top * max_u32 + bottom;
  }

  /**
   * Converts from a JS Number, treated as an integery, into
   * a big-endian binary encoded u32(for the wire)
   * @param {BigInt|number|string} bigValue - BigInt
   * @returns array of bytes
   */
  u64AsBytes(bigValue) {
    bigValue = BigInt(bigValue); // force into Big
    const max_u32 = BigInt(4294967296);
    const top = bigValue / max_u32;
    const bottom = bigValue - BigInt(max_u32 * top);
    const top_bytes = this.u32AsBytes(Number(top));
    const bottom_bytes = this.u32AsBytes(Number(bottom));
    return Buffer.concat([
      Buffer.from(new Uint8Array(top_bytes)),
      Buffer.from(new Uint8Array(bottom_bytes)),
    ]);
  }

  /**
   * Converts from big-endian binary encoded u64(from the wire)
   * into a JS Number(as an integer).
   * @param {array} bytes - array of 4 bytes
   * @returns number
   */
  u32FromBytes(bytes) {
    let val = BigInt(0);
    for (let i = 0; i < bytes.length; ++i) {
      val = BigInt(bytes[i]) + val * BigInt(256);
    }
    return Number(val);
  }

  /**
   * Converts from a JS Number, treated as an integer, into
   * a big-endian binary encoded u32(for the wire)
   * @param {number} val
   * @returns array of 4 bytes
   */
  u32AsBytes(val) {
    val = BigInt(val);
    const bytes = [];
    let i = 4;
    do {
      bytes[--i] = Number(val & BigInt(255));
      val = (val - BigInt(bytes[i])) / BigInt(256);
    } while (i);
    return bytes;
  }

  /**
   * Converts from a u8 byte(from the wire)
   * into a JS Number(as an integer).
   * @param {Uint8} byte
   * @returns number
   */
  u8FromByte(byte) {
    return 0 + byte;
  }

  /**
   * Converts from a JS Number into big-endian binary encoded
   * u8(for the wire)
   * @param {number} val
   * @returns byte
   */
  u8AsByte(val) {
    return val & 255;
  }
}

export default Binary;
