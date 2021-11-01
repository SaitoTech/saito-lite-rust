// @ts-ignore
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { KeystoreAuth } from '../mixin/keystore'
import { signRequest } from '../mixin/sign'
import { delay } from '../mixin/tools'
import { v4 as uuid } from 'uuid'
import { Keystore } from '../types'

const hostURL = ['https://mixin-api.zeromesh.net', 'https://api.mixin.one']

export const request = (keystore?: Keystore, token = ''): AxiosInstance => {
  const ins = axios.create({
    baseURL: hostURL[0],
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    timeout: 3000,
  })

  let k: KeystoreAuth
  if (keystore) k = new KeystoreAuth(keystore)

  ins.interceptors.request.use((config: AxiosRequestConfig) => {
    const { method, data } = config
    const uri = ins.getUri(config)
    const requestID = uuid()
    config.headers['x-request-id'] = requestID
    let jwtToken = ''
    if (token) jwtToken = token
    else if (k) jwtToken = k.signToken(signRequest(method!, uri, data), requestID)
    config.headers.Authorization = 'Bearer ' + jwtToken
    return config
  })

  ins.interceptors.response.use((res: AxiosResponse) => {
    let { data, error } = res.data
    if (error) {
      error.request_id = res.headers['x-request-id']
      return error
    }
    return data
  }, async (e: any) => {
    if (['ETIMEDOUT', 'ECONNABORTED'].includes(e.code)) {
      ins.defaults.baseURL = e.config.baseURL = e.config.baseURL === hostURL[0] ? hostURL[1] : hostURL[0]
    }
    await delay()
    return ins(e.config)
  })
  return ins
}

export const mixinRequest = request()
