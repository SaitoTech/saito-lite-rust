import { Asset } from '.'


export interface NetworkChain {
  chain_id: string
  icon_url: string
  name: string
  type: string
  withdrawal_fee: string
  withdrawal_timestamp: string
  withdrawal_pending_count: string
  deposit_block_height: string
  external_block_height: string
  managed_block_height: string
  is_synchronized: string
}

export interface NetworkAsset {
  amount: string
  asset_id: string
  icon_url: string
  symbol: string

  // populated only at ReadNetworkAsset
  chain_id?: string
  mixin_id?: string
  name?: string
  snapshot_count?: number
}

export interface NetworkInfo {
  assets: NetworkAsset[]
  chains: NetworkChain[]
  assets_count: string
  peak_throughput: string
  snapshots_count: string
  type: string
}

export interface ExternalTransaction {
  transaction_id: string
  created_at: string
  transaction_hash: string
  sender: string
  chain_id: string
  asset_id: string
  amount: string
  destination: string
  tag: string
  confirmations: string
  threshold: string
}

export interface NetworkRequest {
  readNetworkInfo(): Promise<NetworkInfo>
  readNetworkAsset(asset_id: string): Promise<NetworkAsset>
  readTopNetworkAssets(): Promise<Asset[]>

  ReadExternalTransactions(asset_id: string, destination: string, tag: string): Promise<ExternalTransaction[]>
  sendExternalProxy(method: string, params: any[]): Promise<any>
}

