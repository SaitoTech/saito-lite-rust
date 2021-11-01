import { Keystore, Address, AddressCreateParams, AddressClientRequest } from '../types'
import { AxiosInstance } from 'axios'
import { getSignPIN } from '../mixin/sign'

export class AddressClient implements AddressClientRequest {
  request!: AxiosInstance
  keystore!: Keystore
  createAddress(params: AddressCreateParams, pin?: string): Promise<Address> {
    params.pin = getSignPIN(this.keystore, pin)
    return this.request.post('/addresses', params)
  }
  readAddress(addressID: string): Promise<Address> {
    return this.request.get(`/addresses/${addressID}`)
  }
  readAddresses(assetID: string): Promise<Address[]> {
    return this.request.get(`/assets/${assetID}/addresses`)
  }
  deleteAddress(addressID: string, pin?: string): Promise<void> {
    pin = getSignPIN(this.keystore, pin)
    return this.request.post(`/addresses/${addressID}/delete`, { pin })
  }
}
