import { SHA3 } from 'sha3'

export const delay = (n = 500) => new Promise<void>(resolve => {
  setTimeout(() => {
    resolve()
  }, n)
})

export function toBuffer(content: any, encoding: any = 'utf8') {
  if (typeof content === 'object') {
    content = JSON.stringify(content)
  }
  return Buffer.from(content, encoding)
}

export const hashMember = (ids: string[]) =>
  newHash(ids.sort((a, b) => a > b ? 1 : -1).join(''))


export const newHash = (str: string) => new SHA3(256).update(str).digest('hex')

export const safeBase64 = (msg: string) =>
  msg.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
