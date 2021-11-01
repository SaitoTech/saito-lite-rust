import { AxiosInstance } from "axios"
import {
  AcknowledgementRequest, Keystore, MessageCategory, MessageClientRequest, MessageRequest, MessageView,
  ImageMessage, DataMessage, StickerMessage, ContactMesage, AppCardMessage, AudioMessage, LiveMessage, LocationMessage, VideoMessage, AppButtonMessage, RecallMessage,
} from "../types"

export class MessageClient implements MessageClientRequest {
  keystore!: Keystore
  request!: AxiosInstance
  newUUID!: () => string
  uniqueConversationID!: (userID: string, recipientID: string) => string
  sendAcknowledgements(messages: AcknowledgementRequest[]): Promise<void> {
    return this.request.post('/acknowledgements', messages)
  }
  sendAcknowledgement(message: AcknowledgementRequest): Promise<void> {
    return this.sendAcknowledgements([message])
  }
  sendMessage(message: MessageRequest): Promise<MessageView> {
    return this.request.post('/messages', message)
  }
  sendMessages(messages: MessageRequest[]): Promise<undefined> {
    return this.request.post('/messages', messages)
  }

  sendMsg(recipient_id: string, category: MessageCategory, data: any): Promise<MessageView> {
    if (typeof data === 'object') data = JSON.stringify(data)
    return this.sendMessage({
      category, recipient_id,
      conversation_id: this.uniqueConversationID(this.keystore.client_id, recipient_id),
      message_id: this.newUUID(),
      data: Buffer.from(data).toString('base64'),
    })
  }

  sendMessageText(userID: string, text: string): Promise<MessageView> {
    return this.sendMsg(userID, "PLAIN_TEXT", text)
  }
  sendMessagePost(userID: string, text: string): Promise<MessageView> {
    return this.sendMsg(userID, "PLAIN_POST", text)
  }
  sendTextMsg(userID: string, text: string): Promise<MessageView> {
    return this.sendMsg(userID, "PLAIN_TEXT", text)
  }
  sendPostMsg(userID: string, text: string): Promise<MessageView> {
    return this.sendMsg(userID, "PLAIN_POST", text)
  }
  sendImageMsg(userID: string, image: ImageMessage): Promise<MessageView> {
    return this.sendMsg(userID, "PLAIN_IMAGE", image)
  }
  sendDataMsg(userID: string, data: DataMessage): Promise<MessageView> {
    return this.sendMsg(userID, "PLAIN_DATA", data)
  }
  sendStickerMsg(userID: string, sticker: StickerMessage): Promise<MessageView> {
    return this.sendMsg(userID, "PLAIN_STICKER", sticker)
  }
  sendContactMsg(userID: string, contact: ContactMesage): Promise<MessageView> {
    return this.sendMsg(userID, "PLAIN_CONTACT", contact)
  }
  sendAppCardMsg(userID: string, appCard: AppCardMessage): Promise<MessageView> {
    return this.sendMsg(userID, "APP_CARD", appCard)
  }
  sendAudioMsg(userID: string, audio: AudioMessage): Promise<MessageView> {
    return this.sendMsg(userID, "PLAIN_AUDIO", audio)
  }
  sendLiveMsg(userID: string, live: LiveMessage): Promise<MessageView> {
    return this.sendMsg(userID, "PLAIN_LIVE", live)
  }
  sendVideoMsg(userID: string, video: VideoMessage): Promise<MessageView> {
    return this.sendMsg(userID, "PLAIN_VIDEO", video)
  }
  sendLocationMsg(userID: string, location: LocationMessage): Promise<MessageView> {
    return this.sendMsg(userID, "PLAIN_LOCATION", location)
  }
  sendAppButtonMsg(userID: string, appButton: AppButtonMessage[]): Promise<MessageView> {
    return this.sendMsg(userID, "APP_BUTTON_GROUP", appButton)
  }
  sendRecallMsg(userID: string, message: RecallMessage): Promise<MessageView> {
    return this.sendMsg(userID, "MESSAGE_RECALL", message)
  }
}