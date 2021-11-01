import { MessageCategory, MessageStatus } from "./message";

export interface BlazeMessage {
  id: string
  action: string
  params?: { [key: string]: any }
  data?: MessageType
}

export type MessageType = MessageView | TransferView | SystemConversationPayload

export interface MessageView {
  type: 'message',
  representative_id: string
  quote_message_id: string
  conversation_id: string
  user_id: string
  session_id: string
  message_id: string
  category: MessageCategory
  data: string
  data_base64: string
  status: MessageStatus
  source: string
  created_at: string,
  updated_at: string,
}

export interface TransferView {
  type: 'transfer',
  snapshot_id: string
  counter_user_id: string
  asset_id: string
  amount: string
  trace_id: string
  memo: string
  created_at: string
}

export interface SystemConversationPayload {
  action: string
  participant_id: string
  user_id?: string
  role?: string
}
