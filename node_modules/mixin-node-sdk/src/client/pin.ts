import { AxiosInstance } from "axios";
import { getSignPIN } from "../mixin/sign";
import { Keystore } from "../types";
import { PINClientRequest, Turn } from "../types/pin";


export class PINClient implements PINClientRequest {
  keystore!: Keystore
  request!: AxiosInstance
  verifyPin(pin?: string): Promise<void> {
    pin = getSignPIN(this.keystore, pin)
    return this.request.post("/pin/verify", { pin })
  }
  modifyPin(pin: string, old_pin?: string): Promise<void> {
    pin = getSignPIN(this.keystore, pin)
    if (old_pin) old_pin = getSignPIN(this.keystore, old_pin)
    return this.request.post("/pin/update", { old_pin, pin })
  }
  readTurnServers(): Promise<Turn[]> {
    return this.request.get("/turn")
  }
}