import { AxiosInstance } from "axios";
import { App, AppClientRequest, FavoriteApp, UpdateAppRequest } from "../types";


export class AppClient implements AppClientRequest {
  request!: AxiosInstance

  updateApp(appID: string, params: UpdateAppRequest): Promise<App> {
    return this.request.post(`/apps/${appID}`, params)
  }

  readFavoriteApps(userID: string): Promise<FavoriteApp[]> {
    return this.request.get(`/users/${userID}/apps/favorite`)
  }

  favoriteApp(appID: string): Promise<FavoriteApp> {
    return this.request.post(`/apps/${appID}/favorite`)
  }

  unfavoriteApp(appID: string): Promise<void> {
    return this.request.post(`/apps/${appID}/unfavorite`)
  }
}