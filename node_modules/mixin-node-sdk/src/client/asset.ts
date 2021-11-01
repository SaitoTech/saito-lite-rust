import { AxiosInstance } from "axios";
import { request } from "../services/request";
import { Asset, AssetClientRequest, ExchangeRate, NetworkTicker } from "../types";


export class AssetClient implements AssetClientRequest {
  request!: AxiosInstance

  readAsset(assetID: string): Promise<Asset> {
    return this.request.get(`/assets/${assetID}`)
  }

  readAssets(): Promise<Asset[]> {
    return this.request.get('/assets')
  }

  readAssetFee(assetID: string): Promise<number> {
    return this.request.get(`/assets/${assetID}/fee`)
  }

  readExchangeRates(): Promise<ExchangeRate[]> {
    return this.request.get('/fiats')
  }

  readAssetNetworkTicker(asset_id: string, offset?: string): Promise<NetworkTicker> {
    return this.request.get(`/network/ticker`, { params: { offset, asset_id } })
  }
}

export const readAssets = (token: string): Promise<Asset[]> =>
  request(undefined, token).get('/assets')

export const readAsset = (token: string, assetID: string): Promise<Asset> =>
  request(undefined, token).get(`/assets/${assetID}`)


