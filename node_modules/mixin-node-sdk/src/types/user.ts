import { App } from './app'
export interface User {
  type: 'user'
  user_id: string
  identity_number: string
  phone: string
  full_name: string
  biography: string
  avatar_url: string
  relationship: string
  mute_until: string
  created_at: string
  is_verified: boolean
  app?: App
  session_id?: string
  pin_token?: string
  pin_token_base64?: string
  code_id?: string
  code_url?: string
  has_pin?: boolean
  has_emergency_contact?: boolean
  receive_message_source?: string
  accept_conversation_source?: string
  accept_search_source?: string
  fiat_currency?: string
  device_status?: string

  publick_key?: string
  private_key?: string
}

export interface UserClientRequest {
  userMe(): Promise<User>
  readUser(userIdOrIdentityNumber: string): Promise<User>
  readBlockUsers(): Promise<User[]>
  readUsers(userIDs: string[]): Promise<User[]>
  searchUser(identityNumberOrPhone: string): Promise<User>
  readFriends(): Promise<User[]>
  createUser(full_name: string, session_secret?: string): Promise<User>
  modifyProfile(full_name: string, avatar_base64: string): Promise<User>
  modifyRelationships(relationship: UserRelationship): Promise<User>
}

export type operation = "ADD" | "REMOVE" | "BLOCK" | "UNBLOCK"
export interface UserRelationship {
  user_id: string
  action: operation
  full_name?: string
}
