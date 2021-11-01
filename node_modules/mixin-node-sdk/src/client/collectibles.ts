import { AxiosInstance } from "axios"
import {
  Keystore, TransactionInput, GhostInput, GhostKeys,
  CollectiblesClientRequest, CollectiblesParams, CollectibleToken, RawCollectibleInput, Transaction, CollectibleAction, CollectibleRequest, CollectibleOutput,
} from "../types"
import { DumpOutputFromGhostKey, dumpTransaction } from '../mixin/dump_transacion'
import { hashMember } from '../mixin/tools'
import { TxVersion } from '../mixin/encoder'
import { getSignPIN } from '../mixin/sign'
import { buildMintCollectibleMemo } from '../mixin/nfo'

const MintAssetID = "c94ac88f-4671-3976-b60a-09064f1811e8"
const MintMinimumCost = "0.001"
const GroupMembers = [
  "4b188942-9fb0-4b99-b4be-e741a06d1ebf",
  "dd655520-c919-4349-822f-af92fabdbdf4",
  "047061e6-496d-4c35-b06b-b0424a8a400d",
  "acf65344-c778-41ee-bacb-eb546bacfb9f",
  "a51006d0-146b-4b32-a2ce-7defbf0d7735",
  "cf4abd9c-2cfa-4b5a-b1bd-e2b61a83fabd",
  "50115496-7247-4e2c-857b-ec8680756bee",
]
const GroupThreshold = 5
export class CollectiblesClient implements CollectiblesClientRequest {
  keystore!: Keystore
  request!: AxiosInstance
  batchReadGhostKeys!: (inputs: GhostInput[]) => Promise<GhostKeys[]>
  newMintCollectibleTransferInput(p: CollectiblesParams): TransactionInput {
    const { trace_id, collection_id, token_id, content } = p
    if (!trace_id || !collection_id || !token_id || !content) throw new Error("Missing parameters")
    let input: TransactionInput = {
      asset_id: MintAssetID,
      amount: MintMinimumCost,
      trace_id,
      memo: buildMintCollectibleMemo(collection_id, token_id, content),
      opponent_multisig: {
        receivers: GroupMembers,
        threshold: GroupThreshold,
      }
    }
    return input
  }
  readCollectibleToken(id: string): Promise<CollectibleToken> {
    return this.request.get(`/collectibles/tokens/` + id)
  }
  readCollectibleOutputs(_members: string[], threshold: number, offset: string, limit: number): Promise<CollectibleOutput[]> {
    const members = hashMember(_members)
    return this.request.get(`/collectibles/outputs`, { params: { members, threshold, offset, limit } })
  }
  async makeCollectibleTransactionRaw(txInput: RawCollectibleInput): Promise<string> {
    const { token, output, receivers, threshold } = txInput
    const tx: Transaction = {
      version: TxVersion,
      asset: token.mixin_id!,
      extra: token.nfo!,
      inputs: [
        {
          hash: output.transaction_hash!,
          index: output.output_index!
        }
      ]
    }
    const ghostInputs = await this.batchReadGhostKeys([{
      receivers,
      index: 0,
      hint: output.output_id!
    }])
    tx.outputs = [DumpOutputFromGhostKey(ghostInputs[0], output.amount!, threshold)]
    return dumpTransaction(tx)
  }
  createCollectibleRequest(action: CollectibleAction, raw: string): Promise<CollectibleRequest> {
    return this.request.post(`/collectibles/requests`, { action, raw })
  }
  signCollectibleRequest(requestId: string, pin?: string): Promise<CollectibleRequest> {
    pin = getSignPIN(this.keystore, pin)
    return this.request.post(`/collectibles/requests/${requestId}/sign`, { pin })
  }
  cancelCollectibleRequest(requestId: string): Promise<void> {
    return this.request.post(`/collectibles/requests/${requestId}/cancel`)
  }
  unlockCollectibleRequest(requestId: string, pin?: string): Promise<void> {
    pin = getSignPIN(this.keystore, pin)
    return this.request.post(`/collectibles/requests/${requestId}/unlock`, { pin })
  }
}

