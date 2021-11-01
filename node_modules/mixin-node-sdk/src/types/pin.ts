


export interface Turn {
  url: string
  username: string
  credential: string
}

export interface PINClientRequest {
  verifyPin(pin: string): Promise<void>
  modifyPin(pin: string, newPin: string): Promise<void>
  readTurnServers(): Promise<Turn[]>
}