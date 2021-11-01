import { AxiosInstance } from "axios"
import { getSignPIN } from "../mixin/sign"
import { Keystore, Snapshot, TransactionInput } from "../types"
import { Payment, RawTransaction, TransferClientRequest, TransferInput, WithdrawInput } from "../types/transfer"


export class TransferClient implements TransferClientRequest {
  keystore!: Keystore
  request!: AxiosInstance

  verifyPayment(params: TransferInput | TransactionInput): Promise<Payment> {
    return this.request.post("/payments", params)
  }
  transfer(params: TransferInput, pin?: string): Promise<Snapshot> {
    params.pin = getSignPIN(this.keystore, pin)
    return this.request.post("/transfers", params)
  }
  readTransfer(trace_id: string): Promise<Snapshot> {
    return this.request.get(`/transfers/trace/${trace_id}`)
  }
  transaction(params: TransactionInput, pin?: string): Promise<RawTransaction> {
    params.pin = getSignPIN(this.keystore, pin)
    return this.request.post("/transactions", params)
  }
  withdraw(params: WithdrawInput, pin?: string): Promise<Snapshot> {
    params.pin = getSignPIN(this.keystore, pin)
    return this.request.post("/withdrawals", params)
  }
}
