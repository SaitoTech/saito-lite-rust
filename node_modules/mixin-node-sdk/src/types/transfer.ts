import { User } from './user'
import { Asset } from './asset'
import { Snapshot } from './snapshot'
import { TransactionInput } from '.'
export interface Payment {
  recipient: User
  asset: Asset
  asset_id: string
  amount: string
  trace_id: string
  status: string
  memo: string
  receivers: string
  threshold: string
  code_id: string
}

// export interface Transaction {
//   type: 'transaction'
//   transaction_id: string
//   transaction_hash: string
//   sender: string
//   chain_id: string
//   asset_id: string
//   amount: string
//   destination: string
//   tag: string
//   created_at: string
//   output_index: number,
//   confirmations: number,
//   threshold: number,
// }

export interface RawTransaction {
  type: string
  snapshot: string
  opponent_key: string
  asset_id: string
  amount: string
  trace_id: string
  memo: string
  state: string
  created_at: string
  transaction_hash: string
  snapshot_hash: string
  snapshot_at: string
}


export interface TransferInput {
  asset_id: string
  opponent_id: string
  amount?: string
  trace_id?: string
  memo?: string

  pin?: string
}

export interface WithdrawInput {
  address_id: string
  amount: string
  trace_id?: string
  
  memo?: string
  pin?: string
}

export interface TransferClientRequest {
  verifyPayment(params: TransferInput | TransactionInput): Promise<Payment>
  transfer(params: TransferInput, pin?: string): Promise<Snapshot>
  readTransfer(trace_id: string): Promise<Snapshot>
  transaction(params: TransactionInput, pin?: string): Promise<RawTransaction>
  withdraw(params: WithdrawInput, pin?: string): Promise<Snapshot>
}