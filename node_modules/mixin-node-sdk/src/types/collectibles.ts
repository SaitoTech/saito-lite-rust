import { Transaction, TransactionInput } from '.'


export type CollectibleOutputState = "unspent" | "signed" | "spent"

export type CollectibleAction = "sign" | "unlock"

export type CollectibleRequestState = "initial" | "signed"

export interface CollectibleOutput {
  type?: string
  created_at?: string
  updated_at?: string
  user_id?: string
  output_id?: string
  token_id?: string
  transaction_hash?: string
  output_index?: number
  amount?: string
  senders?: string[]
  senders_threshold?: number
  receivers?: string[]
  receivers_threshold?: number
  state?: string
  signed_by?: string
  signed_tx?: string
}

export interface CollectibleRequest {
  type?: string
  created_at?: string
  updated_at?: string
  request_id?: string
  user_id?: string
  token_id?: string
  amount?: string
  senders?: string[]
  senders_threshold?: number
  receivers?: string[]
  receivers_threshold?: number
  signers?: string
  action?: string
  state?: string
  transaction_hash?: string
  raw_transaction?: string
}

export interface CollectibleTokenMeta {
  group?: string
  name?: string
  description?: string
  icon_url?: string
  media_url?: string
  mime?: string
  hash?: string
}
export interface CollectibleToken {
  type?: string
  created_at?: string
  token_id?: string
  group?: string
  token?: string
  mixin_id?: string
  nfo?: string
  meta?: CollectibleTokenMeta
}

export interface CollectiblesParams {
  trace_id: string
  collection_id: string
  token_id: string
  content: string
}
export interface RawCollectibleInput {
  output: CollectibleOutput
  token: CollectibleToken
  receivers: string[]
  threshold: number
}

export interface CollectiblesClientRequest {
  newMintCollectibleTransferInput: (p: CollectiblesParams) => TransactionInput

  readCollectibleToken: (id: string) => Promise<CollectibleToken>
  readCollectibleOutputs: (members: string[], threshold: number, offset: string, limit: number) => Promise<CollectibleOutput[]>
  makeCollectibleTransactionRaw: (txInput: RawCollectibleInput) => Promise<string>
  createCollectibleRequest: (action: CollectibleAction, raw: string) => Promise<CollectibleRequest>
  signCollectibleRequest: (requestId: string, pin?: string) => Promise<CollectibleRequest>
  cancelCollectibleRequest: (requestId: string) => Promise<void>
  unlockCollectibleRequest: (requestId: string, pin?: string) => Promise<void>

}