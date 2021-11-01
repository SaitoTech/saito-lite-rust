export interface Attachment {
  attachment_id: string
  upload_url?: string
  view_url: string
}

export interface AttachmentClientRequest {
  createAttachment(): Promise<Attachment>
  showAttachment(attachment_id: string): Promise<Attachment>
  uploadFile(file: File): Promise<Attachment>
}

export interface AttachmentRequest {
  uploadAttachmentTo(uploadURL: string, file: File): Promise<void>
  uploadAttachment(): Promise<void>
}