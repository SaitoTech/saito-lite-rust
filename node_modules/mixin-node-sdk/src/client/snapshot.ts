import { AxiosInstance } from "axios";
import { request } from "../services/request";
import { Snapshot, SnapshotClientRequest, SnapshotQuery } from "../types";


export class SnapshotClient implements SnapshotClientRequest {
  request!: AxiosInstance

  readSnapshots(params: SnapshotQuery): Promise<Snapshot[]> {
    return this.request.get(`/snapshots`, { params })
  }
  readNetworkSnapshots(params: SnapshotQuery): Promise<Snapshot[]> {
    return this.request.get(`/network/snapshots`, { params })
  }
  readSnapshot(snapshot_id: string): Promise<Snapshot> {
    return this.request.get(`/snapshots/${snapshot_id}`)
  }
  readNetworkSnapshot(snapshot_id: string): Promise<Snapshot> {
    return this.request.get(`/network/snapshots/${snapshot_id}`)
  }
}

export const readSnapshots = (token: string, params: SnapshotQuery): Promise<Snapshot[]> =>
  request(undefined, token).get("/snapshots", { params })

export const readSnapshot = (token: string, snapshot_id: string): Promise<Snapshot> =>
  request(undefined, token).get(`/snapshots/${snapshot_id}`)
