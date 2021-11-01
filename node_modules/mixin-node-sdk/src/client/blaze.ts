import { Client } from "../client"
import { KeystoreAuth } from "../mixin/keystore"
import { signRequest } from "../mixin/sign"
import { Keystore } from "../types"
import WebSocket from 'ws'
import { BlazeMessage, MessageView } from "../types/blaze"
import { gzip, ungzip } from 'pako'


const zeromeshUrl = 'wss://mixin-blaze.zeromesh.net'
const oneUrl = 'wss://blaze.mixin.one/'

interface BlazeOptions {
  parse?: boolean // parse message
  syncAck?: boolean // sync ack
}

interface BlazeHandler {
  onMessage: (message: MessageView) => void
  onAckReceipt?: (message: MessageView) => void
  onTransfer?: (transfer: MessageView) => void
  onConversation?: (conversation: MessageView) => void
}

export class BlazeClient extends Client {
  ws: WebSocket | null
  h!: BlazeHandler
  url = oneUrl
  isAlive = false
  pingInterval: any
  options: BlazeOptions = {
    parse: false,
    syncAck: false
  }

  constructor(keystore?: Keystore, option?: BlazeOptions) {
    super(keystore)
    this.ws = null
    if (option) this.options = option
  }

  loopBlaze(h: BlazeHandler) {
    if (!h.onMessage) throw new Error('OnMessage not set')
    this.h = h
    this._loopBlaze()
  }

  _loopBlaze() {
    const k = new KeystoreAuth(this.keystore)
    const headers = {
      Authorization: 'Bearer ' + k.signToken(signRequest('GET', '/'), ''),
    }
    this.ws = new WebSocket(this.url, "Mixin-Blaze-1", { headers, handshakeTimeout: 3000 })
    this.ws.onmessage = async (event) => {
      let msg = await this.decode(event.data as Uint8Array)
      if (!msg) return
      if (msg.source === 'ACKNOWLEDGE_MESSAGE_RECEIPT' && this.h.onAckReceipt) await this.h.onAckReceipt(msg)
      else if (msg.category === 'SYSTEM_CONVERSATION' && this.h.onConversation) await this.h.onConversation(msg)
      else if (msg.category === 'SYSTEM_ACCOUNT_SNAPSHOT' && this.h.onTransfer) await this.h.onTransfer(msg)
      else await this.h.onMessage(msg)
      if (this.options.syncAck) {
        await this.send_raw({
          id: this.newUUID(),
          action: 'ACKNOWLEDGE_MESSAGE_RECEIPT',
          params: { message_id: msg.message_id, status: "READ" }
        })
      }
    }
    this.ws.onclose = () => {
      clearInterval(this.pingInterval)
      this._loopBlaze()
    }
    this.ws.onerror = (e) => {
      e.message === "Opening handshake has timed out" &&
        (this.url = this.url === oneUrl ? zeromeshUrl : oneUrl)
    }
    this.ws.onopen = () => {
      this.isAlive = true
      this.send_raw({ id: this.newUUID(), action: "LIST_PENDING_MESSAGES" })
    }
  }

  heartbeat() {
    this.ws!.on('pong', () => {
      this.isAlive = true
    })
    this.pingInterval = setInterval(() => {
      if (this.ws!.readyState === WebSocket.CONNECTING) return
      if (!this.isAlive) return this.ws!.terminate()
      this.isAlive = false
      this.ws!.ping()
    }, 1000 * 30)
  }


  decode(data: Uint8Array): Promise<MessageView> {
    return new Promise((resolve) => {
      const t = ungzip(data, { to: 'string' })
      const msgObj = JSON.parse(t)
      if (this.options?.parse && msgObj.data && msgObj.data.data) {
        msgObj.data.data = Buffer.from(msgObj.data.data, 'base64').toString()
        try {
          msgObj.data.data = JSON.parse(msgObj.data.data)
        } catch (e) { }
      }
      resolve(msgObj.data)

    })
  }

  send_raw(message: BlazeMessage) {
    return new Promise((resolve) => {
      const buffer = Buffer.from(JSON.stringify(message), 'utf-8')
      const zipped = gzip(buffer)
      if (this.ws!.readyState === WebSocket.OPEN) {
        this.ws!.send(zipped)
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }
}