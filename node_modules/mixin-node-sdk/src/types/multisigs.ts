import { GhostKeys, GhostInput, RawTransactionInput } from '.'
export type UTXOState = "unspent" | "signed" | "spent"

export type MultisigAction = "sign" | "unlock"

export type MultisigState = "initial" | "signed"

export interface MultisigUTXO {
  type: string
  user_id: string
  utxo_id: string
  asset_id: string
  transaction_hash: string
  output_index: number
  amount: string
  threshold: number
  members: string[]
  memo: string
  state: UTXOState
  created_at: string
  updated_at: string
  signed_by: string
  signed_tx: string
}

export interface MultisigRequest {
  type: string
  request_id: string
  user_id: string
  asset_id: string
  amount: string
  threshold: string
  senders: string
  receivers: string
  signers: string
  memo: string
  action: MultisigAction
  state: MultisigState
  transaction_hash: string
  raw_transaction: string
  created_at: string
  updated_at: string
  code_id: string
}

export interface MultisigClientRequest {
  readMultisigs(offset: string, limit: number): Promise<MultisigUTXO[]>
  readMultisigOutputs(members: string[], threshold: number, offset: string, limit: number): Promise<MultisigUTXO[]>
  createMultisig(action: string, raw: string): Promise<MultisigRequest>
  signMultisig(request_id: string, pin: string): Promise<MultisigRequest>
  cancelMultisig(request_id: string): Promise<void>
  unlockMultisig(request_id: string, pin: string): Promise<void>
  readGhostKeys(receivers: string[], index: number): Promise<GhostKeys>
  batchReadGhostKeys(inputs: GhostInput[]): Promise<GhostKeys[]>
  makeMultisignTransaction(txInput: RawTransactionInput): Promise<string>
}