export interface Asset {
  asset_id: string
  chain_id: string
  asset_key?: string
  mixin_id?: string
  symbol: string
  name: string
  icon_url: string
  price_btc: string
  change_btc: string
  price_usd: string
  change_usd: string
  balance: string
  destination: string
  tag: string
  confirmations: number
  capitalization?: number
  amount?: string
  fee?: string
  liquidity?: string
  snapshots_count: number
}

export interface ExchangeRate {
  code: string
  rate: string
}

export interface NetworkTicker {
  type: 'ticker'
  price_usd: string
  price_btc: string
}

export interface AssetClientRequest {
  readAsset(asset_id: string): Promise<Asset>
  readAssets(): Promise<Asset[]>
  readAssetFee(asset_id: string): Promise<number>
  readAssetNetworkTicker(asset_id: string, offset?: string): Promise<NetworkTicker>

  readExchangeRates(): Promise<ExchangeRate[]>
}

export interface AssetRequest {
  readAsset(asset_id: string): Promise<Asset>
  readAssets(): Promise<Asset[]>
  readAssetFee(asset_id: string): Promise<number>

  ReadExchangeRates(): Promise<ExchangeRate[]>
}

export interface AssetClient {
  readAsset(token: string, asset_id: string): Promise<Asset>
  readAssets(token: string): Promise<Asset[]>
}
