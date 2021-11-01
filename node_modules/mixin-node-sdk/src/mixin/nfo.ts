

import { parse as UUIDParse } from 'uuid'
import { newHash, safeBase64 } from './tools'
import { Encoder } from './encoder'
const Prefix = "NFO"
const Version = 0x00

const DefaultChain = "43d61dcd-e413-450d-80b8-101d5e903357"
const DefaultClass = "3c8c161a18ae2c8b14fda1216fff7da88c419b5d"

export function buildMintCollectibleMemo(collection_id: string, token_id: string, content: string): string {
  const encoder = new Encoder(Buffer.from(Prefix, 'utf8'))
  encoder.write(Buffer.from([Version]))

  encoder.write(Buffer.from([1]))
  encoder.wirteUint64(BigInt(1))
  encoder.write(UUIDParse(DefaultChain) as Buffer)

  encoder.writeSlice(Buffer.from(DefaultClass, 'hex'))
  encoder.writeSlice(Buffer.from(UUIDParse(collection_id) as Buffer))
  encoder.writeSlice(Buffer.from(UUIDParse(token_id) as Buffer))

  encoder.writeSlice(Buffer.from(newHash(content), 'hex'))
  return safeBase64(encoder.buf.toString('base64'))
}