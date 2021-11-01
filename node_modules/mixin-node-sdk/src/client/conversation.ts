import { AxiosInstance } from "axios";
import { request } from "../services/request";
import {
  ConversationClientRequest, ConversationCreateParmas, Conversation, ConversationUpdateParams, Participant, ConversationAction, Keystore
} from '../types'

export class ConversationClient implements ConversationClientRequest {
  keystore!: Keystore
  request!: AxiosInstance
  uniqueConversationID!: (userID: string, recipientID: string) => string

  createConversation(params: ConversationCreateParmas): Promise<Conversation> {
    return this.request.post('/conversations', params)
  }
  updateConversation(conversationID: string, params: ConversationUpdateParams): Promise<Conversation> {
    return this.request.put(`/conversations/${conversationID}`, params)
  }
  createContactConversation(userID: string): Promise<Conversation> {
    return this.createConversation({
      category: 'CONTACT',
      conversation_id: this.uniqueConversationID(this.keystore.client_id, userID),
      participants: [{ user_id: userID }]
    })
  }
  createGroupConversation(conversationID: string, name: string, participant: Participant[]): Promise<Conversation> {
    return this.createConversation({
      category: 'GROUP',
      conversation_id: conversationID,
      name,
      participants: participant
    })
  }
  readConversation(conversationID: string): Promise<Conversation> {
    return this.request.get(`/conversations/${conversationID}`)
  }
  managerConversation(conversationID: string, action: ConversationAction, participant: Participant[]): Promise<Conversation> {
    return this.request.post(`/conversations/${conversationID}/participants/${action}`, participant)
  }
  addParticipants(conversationID: string, userIDs: string[]): Promise<Conversation> {
    var participants: Participant[] = userIDs.map(userID => ({ user_id: userID }))
    return this.managerConversation(conversationID, 'ADD', participants)
  }
  removeParticipants(conversationID: string, userIDs: string[]): Promise<Conversation> {
    var participants: Participant[] = userIDs.map(userID => ({ user_id: userID }))
    return this.managerConversation(conversationID, 'REMOVE', participants)
  }
  adminParticipants(conversationID: string, userIDs: string[]): Promise<Conversation> {
    var participants: Participant[] = userIDs.map(userID => ({ user_id: userID, role: 'ADMIN' }))
    return this.managerConversation(conversationID, 'ROLE', participants)
  }
  rotateConversation(conversationID: string): Promise<Conversation> {
    return this.request.post(`/conversations/${conversationID}/rotate`)
  }
}

export const readConversation = (token: string, conversation_id: string): Promise<Conversation> =>
  request(undefined, token).get(`conversations/${conversation_id}`)
