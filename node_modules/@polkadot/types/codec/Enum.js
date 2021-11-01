import _classPrivateFieldLooseBase from "@babel/runtime/helpers/esm/classPrivateFieldLooseBase";
import _classPrivateFieldLooseKey from "@babel/runtime/helpers/esm/classPrivateFieldLooseKey";
// Copyright 2017-2021 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { assert, hexToU8a, isHex, isNumber, isObject, isString, isU8a, isUndefined, stringCamelCase, stringify, stringUpperFirst, u8aConcat, u8aToHex } from '@polkadot/util';
import { Null } from "../primitive/Null.js";
import { Struct } from "./Struct.js";
import { mapToTypeMap } from "./utils/index.js"; // export interface, this is used in Enum.with, so required as public by TS

function isRustEnum(def) {
  const defValues = Object.values(def);

  if (defValues.some(v => isNumber(v))) {
    assert(defValues.every(v => isNumber(v) && v >= 0 && v <= 255), 'Invalid number-indexed enum definition');
    return false;
  }

  return true;
}

function extractDef(registry, _def) {
  if (Array.isArray(_def)) {
    return {
      def: _def.reduce((def, key, index) => {
        def[key] = {
          Type: Null,
          index
        };
        return def;
      }, {}),
      isBasic: true,
      isIndexed: false
    };
  }

  let isBasic;
  let isIndexed;
  let def;

  if (isRustEnum(_def)) {
    def = Object.entries(mapToTypeMap(registry, _def)).reduce((def, [key, Type], index) => {
      def[key] = {
        Type,
        index
      };
      return def;
    }, {});
    isBasic = !Object.values(def).some(({
      Type
    }) => Type !== Null);
    isIndexed = false;
  } else {
    def = Object.entries(_def).reduce((def, [key, index]) => {
      def[key] = {
        Type: Null,
        index
      };
      return def;
    }, {});
    isBasic = true;
    isIndexed = true;
  }

  return {
    def,
    isBasic,
    isIndexed
  };
}

function createFromValue(registry, def, index = 0, value) {
  const entry = Object.values(def).find(e => e.index === index);
  assert(!isUndefined(entry), () => `Unable to create Enum via index ${index}, in ${Object.keys(def).join(', ')}`);
  return {
    index,
    value: value instanceof entry.Type ? value : new entry.Type(registry, value)
  };
}

function decodeFromJSON(registry, def, key, value) {
  // JSON comes in the form of { "<type (camelCase)>": "<value for type>" }, here we
  // additionally force to lower to ensure forward compat
  const keys = Object.keys(def).map(k => k.toLowerCase());
  const keyLower = key.toLowerCase();
  const index = keys.indexOf(keyLower);
  assert(index !== -1, () => `Cannot map Enum JSON, unable to find '${key}' in ${keys.join(', ')}`);

  try {
    return createFromValue(registry, def, Object.values(def)[index].index, value);
  } catch (error) {
    throw new Error(`Enum(${key}):: ${error.message}`);
  }
}

function decodeFromString(registry, def, value) {
  return isHex(value) // eslint-disable-next-line @typescript-eslint/no-use-before-define
  ? decodeFromValue(registry, def, hexToU8a(value)) : decodeFromJSON(registry, def, value);
}

function decodeFromValue(registry, def, value) {
  if (isU8a(value)) {
    // nested, we don't want to match isObject below
    if (value.length) {
      return createFromValue(registry, def, value[0], value.subarray(1));
    }
  } else if (isNumber(value)) {
    return createFromValue(registry, def, value);
  } else if (isString(value)) {
    return decodeFromString(registry, def, value.toString());
  } else if (isObject(value)) {
    const key = Object.keys(value)[0];
    return decodeFromJSON(registry, def, key, value[key]);
  } // Worst-case scenario, return the first with default


  return createFromValue(registry, def, Object.values(def)[0].index);
}

function decodeEnum(registry, def, value, index) {
  // NOTE We check the index path first, before looking at values - this allows treating
  // the optional indexes before anything else, more-specific > less-specific
  if (isNumber(index)) {
    return createFromValue(registry, def, index, value); // eslint-disable-next-line @typescript-eslint/no-use-before-define
  } else if (value instanceof Enum) {
    return createFromValue(registry, def, value.index, value.value);
  }

  return decodeFromValue(registry, def, value);
}
/**
 * @name Enum
 * @description
 * This implements an enum, that based on the value wraps a different type. It is effectively
 * an extension to enum where the value type is determined by the actual index.
 */


var _def2 = /*#__PURE__*/_classPrivateFieldLooseKey("def");

var _entryIndex = /*#__PURE__*/_classPrivateFieldLooseKey("entryIndex");

var _indexes = /*#__PURE__*/_classPrivateFieldLooseKey("indexes");

var _isBasic = /*#__PURE__*/_classPrivateFieldLooseKey("isBasic");

var _isIndexed = /*#__PURE__*/_classPrivateFieldLooseKey("isIndexed");

var _raw = /*#__PURE__*/_classPrivateFieldLooseKey("raw");

export class Enum {
  constructor(registry, def, value, index) {
    this.registry = void 0;
    this.createdAtHash = void 0;
    Object.defineProperty(this, _def2, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _entryIndex, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _indexes, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _isBasic, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _isIndexed, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _raw, {
      writable: true,
      value: void 0
    });
    const defInfo = extractDef(registry, def);
    const decoded = decodeEnum(registry, defInfo.def, value, index);
    this.registry = registry;
    _classPrivateFieldLooseBase(this, _def2)[_def2] = defInfo.def;
    _classPrivateFieldLooseBase(this, _isBasic)[_isBasic] = defInfo.isBasic;
    _classPrivateFieldLooseBase(this, _isIndexed)[_isIndexed] = defInfo.isIndexed;
    _classPrivateFieldLooseBase(this, _indexes)[_indexes] = Object.values(defInfo.def).map(({
      index
    }) => index);
    _classPrivateFieldLooseBase(this, _entryIndex)[_entryIndex] = _classPrivateFieldLooseBase(this, _indexes)[_indexes].indexOf(decoded.index) || 0;
    _classPrivateFieldLooseBase(this, _raw)[_raw] = decoded.value;
  }

  static with(Types) {
    return class extends Enum {
      constructor(registry, value, index) {
        super(registry, Types, value, index);
        Object.keys(_classPrivateFieldLooseBase(this, _def2)[_def2]).forEach(_key => {
          const name = stringUpperFirst(stringCamelCase(_key.replace(' ', '_')));
          const askey = `as${name}`;
          const iskey = `is${name}`;
          isUndefined(this[iskey]) && Object.defineProperty(this, iskey, {
            enumerable: true,
            get: () => this.type === _key
          });
          isUndefined(this[askey]) && Object.defineProperty(this, askey, {
            enumerable: true,
            get: () => {
              assert(this[iskey], () => `Cannot convert '${this.type}' via ${askey}`);
              return this.value;
            }
          });
        });
      }

    };
  }
  /**
   * @description The length of the value when encoded as a Uint8Array
   */


  get encodedLength() {
    return 1 + _classPrivateFieldLooseBase(this, _raw)[_raw].encodedLength;
  }
  /**
   * @description returns a hash of the contents
   */


  get hash() {
    return this.registry.hash(this.toU8a());
  }
  /**
   * @description The index of the enum value
   */


  get index() {
    return _classPrivateFieldLooseBase(this, _indexes)[_indexes][_classPrivateFieldLooseBase(this, _entryIndex)[_entryIndex]];
  }
  /**
   * @description true if this is a basic enum (no values)
   */


  get isBasic() {
    return _classPrivateFieldLooseBase(this, _isBasic)[_isBasic];
  }
  /**
   * @description Checks if the value is an empty value
   */


  get isEmpty() {
    return _classPrivateFieldLooseBase(this, _raw)[_raw].isEmpty;
  }
  /**
   * @description Checks if the Enum points to a [[Null]] type
   */


  get isNone() {
    return _classPrivateFieldLooseBase(this, _raw)[_raw] instanceof Null;
  }
  /**
   * @description Checks if the Enum points to a [[Null]] type
   * @deprecated use isNone
   */


  get isNull() {
    return this.isNone;
  }
  /**
   * @description The available keys for this enum
   */


  get defIndexes() {
    return _classPrivateFieldLooseBase(this, _indexes)[_indexes];
  }
  /**
   * @description The available keys for this enum
   */


  get defKeys() {
    return Object.keys(_classPrivateFieldLooseBase(this, _def2)[_def2]);
  }
  /**
   * @description The name of the type this enum value represents
   */


  get type() {
    return this.defKeys[_classPrivateFieldLooseBase(this, _entryIndex)[_entryIndex]];
  }
  /**
   * @description The value of the enum
   */


  get value() {
    return _classPrivateFieldLooseBase(this, _raw)[_raw];
  }
  /**
   * @description Compares the value of the input to see if there is a match
   */


  eq(other) {
    // cater for the case where we only pass the enum index
    if (isNumber(other)) {
      return this.toNumber() === other;
    } else if (_classPrivateFieldLooseBase(this, _isBasic)[_isBasic] && isString(other)) {
      return this.type === other;
    } else if (isU8a(other)) {
      return !this.toU8a().some((entry, index) => entry !== other[index]);
    } else if (isHex(other)) {
      return this.toHex() === other;
    } else if (other instanceof Enum) {
      return this.index === other.index && this.value.eq(other.value);
    } else if (isObject(other)) {
      return this.value.eq(other[this.type]);
    } // compare the actual wrapper value


    return this.value.eq(other);
  }
  /**
   * @description Returns a hex string representation of the value
   */


  toHex() {
    return u8aToHex(this.toU8a());
  }
  /**
   * @description Converts the Object to to a human-friendly JSON, with additional fields, expansion and formatting of information
   */


  toHuman(isExtended) {
    return _classPrivateFieldLooseBase(this, _isBasic)[_isBasic] || this.isNone ? this.type : {
      [this.type]: _classPrivateFieldLooseBase(this, _raw)[_raw].toHuman(isExtended)
    };
  }
  /**
   * @description Converts the Object to JSON, typically used for RPC transfers
   */


  toJSON() {
    return _classPrivateFieldLooseBase(this, _isBasic)[_isBasic] ? this.type : {
      [stringCamelCase(this.type)]: _classPrivateFieldLooseBase(this, _raw)[_raw].toJSON()
    };
  }
  /**
   * @description Returns the number representation for the value
   */


  toNumber() {
    return this.index;
  }
  /**
   * @description Returns a raw struct representation of the enum types
   */


  _toRawStruct() {
    if (_classPrivateFieldLooseBase(this, _isBasic)[_isBasic]) {
      return _classPrivateFieldLooseBase(this, _isIndexed)[_isIndexed] ? this.defKeys.reduce((out, key, index) => {
        out[key] = _classPrivateFieldLooseBase(this, _indexes)[_indexes][index];
        return out;
      }, {}) : this.defKeys;
    }

    const typeMap = Object.entries(_classPrivateFieldLooseBase(this, _def2)[_def2]).reduce((out, [key, {
      Type
    }]) => {
      out[key] = Type;
      return out;
    }, {});
    return Struct.typesToMap(this.registry, typeMap);
  }
  /**
   * @description Returns the base runtime type name for this instance
   */


  toRawType() {
    return stringify({
      _enum: this._toRawStruct()
    });
  }
  /**
   * @description Returns the string representation of the value
   */


  toString() {
    return this.isNull ? this.type : stringify(this.toJSON());
  }
  /**
   * @description Encodes the value as a Uint8Array as per the SCALE specifications
   * @param isBare true when the value has none of the type-specific prefixes (internal)
   */


  toU8a(isBare) {
    return u8aConcat(new Uint8Array(isBare ? [] : [this.index]), _classPrivateFieldLooseBase(this, _raw)[_raw].toU8a(isBare));
  }

}