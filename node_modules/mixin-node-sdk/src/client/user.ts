import { AxiosInstance } from 'axios'
import { UserClientRequest, User, UserRelationship } from '../types/user'
import forge from 'node-forge'
import { request } from '../services/request'

export class UserClient implements UserClientRequest {
  request!: AxiosInstance
  userMe(): Promise<User> {
    return this.request.get(`/me`)
  }
  readUser(userIdOrIdentityNumber: string): Promise<User> {
    return this.request.get(`/users/${userIdOrIdentityNumber}`)
  }
  readBlockUsers(): Promise<User[]> {
    return this.request.get(`/blocking_users`)
  }
  readUsers(userIDs: string[]): Promise<User[]> {
    return this.request.post(`/users/fetch`, userIDs)
  }
  readFriends(): Promise<User[]> {
    return this.request.get(`/friends`)
  }
  searchUser(identityNumberOrPhone: string): Promise<User> {
    return this.request.get(`/search/${identityNumberOrPhone}`)
  }
  async createUser(full_name: string, session_secret?: string): Promise<User> {
    if (session_secret) return this.request.post(`/users`, { full_name, session_secret })
    const { publicKey, privateKey } = forge.pki.ed25519.generateKeyPair()
    const params = { full_name, session_secret: Buffer.from(publicKey).toString('base64') }
    const u: User = await this.request.post(`/users`, params)
    u.publick_key = publicKey.toString('base64')
    u.private_key = privateKey.toString('base64')
    return u
  }
  modifyProfile(full_name: string, avatar_base64: string): Promise<User> {
    return this.request.post(`/me`, { full_name, avatar_base64 })
  }
  modifyRelationships(relationship: UserRelationship): Promise<User> {
    return this.request.post(`/relationships`, relationship)
  }
}

export const userMe = (token: string): Promise<User> =>
  request(undefined, token).get('/me')

export const readFriends = (token: string): Promise<User[]> =>
  request(undefined, token).get(`/friends`)

export const readBlockUsers = (token: string): Promise<User[]> =>
  request(undefined, token).get(`/blocking_users`)
