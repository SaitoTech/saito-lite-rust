import { GhostKeys, Transaction } from '../types'
import { Encoder, magic, maxEcodingInt, OperatorCmp, OperatorSum } from './encoder'




export function dumpTransaction(signed: Transaction): string {
  let enc = new Encoder(magic)
  enc.write(Buffer.from([0x00, signed.version!]))
  enc.write(Buffer.from(signed.asset, 'hex'))

  const il = signed.inputs!.length
  enc.writeInt(il)
  signed.inputs!.forEach(i => enc.encodeInput(i))

  const ol = signed.outputs!.length
  enc.writeInt(ol)
  signed.outputs!.forEach(o => enc.encodeOutput(o))

  const e = Buffer.from(signed.extra!, 'base64')
  enc.writeInt(e.byteLength)
  enc.write(e)

  if (signed.aggregated) {
    enc.encodeAggregatedSignature(signed.aggregated)
  } else {
    const sl = signed.signatures ? Object.keys(signed.signatures).length : 0
    if (sl == maxEcodingInt) throw new Error('signatures overflow')
    enc.writeInt(sl)
    if (sl > 0) {
      enc.encodeSignature(signed.signatures!)
    }
  }
  return enc.buf.toString('hex')
}


export function DumpOutputFromGhostKey(gi: GhostKeys, amount: string, threshold: number) {
  const { mask, keys } = gi
  return {
    mask, keys, amount: Number(amount).toFixed(8),
    script: Buffer.from([OperatorCmp, OperatorSum, threshold]).toString('hex')
  }
}