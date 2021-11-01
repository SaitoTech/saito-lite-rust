
export interface Conversation {
  conversation_id: string
  creator_id: string
  category: string
  name: string
  icon_url: string
  announcement: string
  created_at: string
  code_id: string
  code_url: string

  participants: Participant[]
}

export type ConversationCategory = "CONTACT" | "GROUP"
export type ConversationAction = "CREATE" | "ADD" | "REMOVE" | "JOIN" | "EXIT" | "ROLE"
export type ConversationRole = "OWNER" | "ADMIN" | ""

export interface Participant {
  user_id: string
  type?: "participant"
  role?: ConversationRole
  created_at?: string
}

export interface ConversationCreateParmas {
  category: ConversationCategory
  conversation_id: string
  participants: Participant[]
  name?: string
}

export interface ConversationUpdateParams {
  name?: string
  announcement?: string
}

export interface ConversationClientRequest {
  createConversation(params: ConversationCreateParmas): Promise<Conversation>
  updateConversation(conversationID: string, params: ConversationUpdateParams): Promise<Conversation>
  createContactConversation(userID: string): Promise<Conversation>
  createGroupConversation(conversationID: string, name: string, participant: Participant[]): Promise<Conversation>
  readConversation(conversationID: string): Promise<Conversation>
  managerConversation(conversationID: string, action: ConversationAction, participant: Participant[]): Promise<Conversation>
  addParticipants(conversationID: string, userIDs: string[]): Promise<Conversation>
  removeParticipants(conversationID: string, userIDs: string[]): Promise<Conversation>
  adminParticipants(conversationID: string, userIDs: string[]): Promise<Conversation>
  rotateConversation(conversationID: string): Promise<Conversation>
}
