import { Asset } from './asset'
export interface Snapshot {
  type: string
  snapshot_id: string
  trace_id: string
  user_id?: string
  asset_id: string
  created_at: string
  opponent_id?: string
  source: string
  amount: string
  memo: string
  chain_id?: string
  opening_balance?: string
  closing_balance?: string
  sender?: string
  receiver?: string
  transaction_hash?: string

  asset?: Asset
  data?: string
  fee?: {
    amount: string
    asset_id: string
  }
}

export interface SnapshotQuery {
  limit?: number | string
  offset?: string
  asset?: string
  opponent?: string
  tag?: string
  destination?: string // query external transactions
}


export interface SnapshotClientRequest {
  readSnapshots(params?: SnapshotQuery): Promise<Snapshot[]>
  readNetworkSnapshots(params?: SnapshotQuery): Promise<Snapshot[]>
  readSnapshot(snapshot_id: string): Promise<Snapshot>
  readNetworkSnapshot(snapshot_id: string): Promise<Snapshot>
}

export interface SnapshotRequest {
  ReadSnapshots(token: string, params?: SnapshotQuery): Promise<Snapshot[]>
  ReadSnapshot(token: string, snapshot_id: string): Promise<Snapshot>
}