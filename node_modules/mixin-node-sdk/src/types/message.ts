import { MessageView } from './blaze'

export type MessageCategory = "PLAIN_TEXT" |
  "PLAIN_AUDIO" |
  "PLAIN_POST" |
  "PLAIN_IMAGE" |
  "PLAIN_DATA" |
  "PLAIN_STICKER" |
  "PLAIN_LIVE" |
  "PLAIN_LOCATION" |
  "PLAIN_VIDEO" |
  "PLAIN_CONTACT" |
  "APP_CARD" |
  "APP_BUTTON_GROUP" |
  "MESSAGE_RECALL" |
  "SYSTEM_CONVERSATION" |
  "SYSTEM_ACCOUNT_SNAPSHOT"


export type MessageStatus = "SENT" | "DELIVERED" | "READ"

export interface RecallMessage {
  message_id: string
}

export interface ImageMessage {
  attachment_id: string
  mime_type: string
  width: number
  height: number
  size: number
  thumbnail?: string
}

export interface DataMessage {
  attachment_id: string
  mime_type: string
  size: number
  name: string
}

export interface StickerMessage {
  sticker_id: string
  name?: string
  album_id?: string
}

export interface ContactMesage {
  user_id: string
}

export interface AppCardMessage {
  app_id: string
  icon_url: string
  title: string
  description: string
  action: string
  shareable?: boolean
}

export interface AudioMessage {
  attachment_id: string
  mime_type: string
  size: number
  duration: number
  wave_form?: string
}

export interface LiveMessage {
  width: number
  height: number
  thumb_url: string
  url: string
  shareable?: boolean
}

export interface VideoMessage {
  attachment_id: string
  mime_type: string
  width: number
  height: number
  size: number
  duration: number
  thumbnail?: string
}

export interface LocationMessage {
  longitude: number
  latitude: number
  address?: string
  name?: string
}

export interface AppButtonMessage {
  label: string
  action: string
  color: string
}

export interface MessageRequest {
  conversation_id: string
  message_id: string
  category: MessageCategory
  data: string
  recipient_id?: string
  representative_id?: string
  quote_message_id?: string
}

export interface AcknowledgementRequest {
  message_id: string
  status: string
}

export interface MessageClientRequest {
  sendAcknowledgements(messages: AcknowledgementRequest[]): Promise<void>
  sendAcknowledgement(message: AcknowledgementRequest): Promise<void>
  sendMessage(message: MessageRequest): Promise<MessageView>
  sendMessages(messages: MessageRequest[]): Promise<undefined>

  sendMessageText(userID: string, text: string): Promise<MessageView>
  sendMessagePost(userID: string, text: string): Promise<MessageView>

  sendTextMsg(userID: string, text: string): Promise<MessageView>
  sendPostMsg(userID: string, text: string): Promise<MessageView>
  sendImageMsg(userID: string, image: ImageMessage): Promise<MessageView>
  sendDataMsg(userID: string, data: DataMessage): Promise<MessageView>
  sendStickerMsg(userID: string, sticker: StickerMessage): Promise<MessageView>
  sendContactMsg(userID: string, contact: ContactMesage): Promise<MessageView>
  sendAppCardMsg(userID: string, appCard: AppCardMessage): Promise<MessageView>
  sendAudioMsg(userID: string, audio: AudioMessage): Promise<MessageView>
  sendLiveMsg(userID: string, live: LiveMessage): Promise<MessageView>
  sendVideoMsg(userID: string, video: VideoMessage): Promise<MessageView>
  sendLocationMsg(userID: string, location: LocationMessage): Promise<MessageView>
  sendAppButtonMsg(userID: string, appButton: AppButtonMessage[]): Promise<MessageView>
  sendRecallMsg(userID: string, message: RecallMessage): Promise<MessageView>
}

