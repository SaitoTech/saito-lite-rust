import { mixinRequest } from "../services/request"
import { Asset, NetworkTicker, Snapshot, SnapshotQuery, Transaction } from "../types"

export const readNetworkChains = (): Promise<Asset[]> => mixinRequest.get("/network/chains")

// only support limit/offset/asset/order
export const readNetworkSnapshots = (params: SnapshotQuery): Promise<Snapshot[]> => mixinRequest.get("/network/snapshots", { params })

export const readNetworkSnapshot = (id: string): Promise<Snapshot> => mixinRequest.get(`/network/snapshots/${id}`)

export const readExternalTransactions = (params: SnapshotQuery): Promise<Transaction[]> => mixinRequest.get("/external/transactions", { params })

export const readNetworkAssetsTop = (): Promise<Asset[]> => mixinRequest.get("/network/assets/top")

export const readNetworkAssetsMultisig = (): Promise<Asset[]> => mixinRequest.get("/network/assets/multisig")

export const readNetworkAsset = (id: string): Promise<Asset> => mixinRequest.get(`/network/assets/${id}`)

export const searchNetworkAsset = (assetNameOrSymbol: string): Promise<Asset[]> => mixinRequest.get(`/network/assets/search/${assetNameOrSymbol}`)

export const readExternalAddressesCheck = (params: SnapshotQuery): Promise<boolean> => mixinRequest.get(`/external/addresses/check`, { params })

export const readNetworkTicker = (asset_id: string, offset?: string): Promise<NetworkTicker> => mixinRequest.get(`/network/ticker`, { params: { asset: asset_id, offset } })

export const sendExternalProxy = (method: string, params: any[]): Promise<any> => mixinRequest.post(`/external/proxy`, { method, params })