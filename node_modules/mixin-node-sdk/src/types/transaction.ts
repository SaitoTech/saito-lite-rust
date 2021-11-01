export interface GhostInput {
  receivers: string[]
  index: number
  hint: string
}

export interface GhostKeys {
  keys: string[]
  mask: string
}

export interface TransactionInput {
  asset_id: string
  amount?: string
  trace_id?: string
  memo?: string
  // OpponentKey used for raw transaction
  opponent_key?: string
  opponent_multisig?: {
    receivers: string[]
    threshold: number
  }

  pin?: string
}