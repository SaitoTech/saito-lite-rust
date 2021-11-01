import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Attachment, AttachmentClientRequest } from "../types/attachment";


export class AttachmentClient implements AttachmentClientRequest {
  request!: AxiosInstance
  createAttachment(): Promise<Attachment> {
    return this.request.post(`/attachments`)
  }
  showAttachment(attachment_id: string): Promise<Attachment> {
    return this.request.get(`/attachments/${attachment_id}`)
  }
  async uploadFile(file: File): Promise<Attachment> {
    const { view_url, upload_url, attachment_id } = await this.createAttachment()
    await uploadAttachmentTo(upload_url!, file)
    return { view_url, attachment_id }
  }
}


export async function uploadAttachmentTo(uploadURL: string, file: File): Promise<AxiosResponse> {
  return axios.create()({
    url: uploadURL,
    method: "PUT",
    data: file,
    headers: {
      'x-amz-acl': 'public-read',
      'Content-Type': 'application/octet-stream',
    },
    maxContentLength: 2147483648,
  })
}

export function uploadAttachment(attachment: Attachment, file: File): Promise<AxiosResponse> {
  if (!attachment.upload_url) return Promise.reject(new Error("No upload URL"))
  return uploadAttachmentTo(attachment.upload_url!, file)
}
