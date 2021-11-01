
export interface App {
  updated_at: string
  app_id: string
  app_number: string
  redirect_url: string
  home_url: string
  name: string
  icon_url: string
  description: string
  capabilities: string[]
  resource_patterns: string[]
  category: string
  creator_id: string
  app_secret: string
}

export interface FavoriteApp {
  user_id: string
  app_id: string
  created_at: string
}

export interface UpdateAppRequest {
  redirect_uri: string
  home_uri: string
  name: string
  description: string
  icon_base64: string
  session_secret: string
  category: string
  capabilities: string[]
  resource_patterns: string[]
}

export interface AppClientRequest {
  updateApp(appID: string, params: UpdateAppRequest): Promise<App>
  readFavoriteApps(userID: string): Promise<FavoriteApp[]>
  favoriteApp(appID: string): Promise<FavoriteApp>
  unfavoriteApp(appID: string): Promise<void>
}