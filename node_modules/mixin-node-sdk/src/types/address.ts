
export interface Address {
  type?: 'address'
  address_id: string
  asset_id: string
  destination: string
  tag: string
  label: string
  fee: string
  dust: string
}

export interface AddressCreateParams {
  label: string
  asset_id: string
  destination: string
  tag?: string
  pin?: string
}

export interface AddressClientRequest {
  createAddress(params: AddressCreateParams, pin?: string): Promise<Address>
  readAddress(address_id: string): Promise<Address>
  readAddresses(asset_id: string): Promise<Address[]>
  deleteAddress(address_id: string, pin?: string): Promise<void>
}

export interface AddressRequest {
  readAddress(token: string, address_id: string): Promise<Address>
  readAddresses(token: string, asset_id: string): Promise<Address[]>
}