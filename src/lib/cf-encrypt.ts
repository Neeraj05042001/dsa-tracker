// ==================== AES-256-GCM ENCRYPTION FOR CF SESSION ====================
// JSESSIONID is treated like a password — never stored in plaintext.
// Key is stored only in Vercel environment variables, never in DB or code.

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const KEY_HEX = process.env.CF_ENCRYPTION_KEY  // ← read fresh on every call
  if (!KEY_HEX || KEY_HEX.length !== 64) {
    throw new Error('CF_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')
  }
  return Buffer.from(KEY_HEX, 'hex')
}

/**
 * Encrypts a JSESSIONID value.
 * Returns a single string: iv:authTag:ciphertext (all hex-encoded).
 */
export function encryptSession(plaintext: string): string {
  const key    = getKey()
  const iv     = randomBytes(12)               // 96-bit IV for GCM
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])

  const authTag = cipher.getAuthTag()

  // Format: iv:authTag:ciphertext
  return [
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex'),
  ].join(':')
}

/**
 * Decrypts a stored session string back to JSESSIONID.
 * Returns null if decryption fails (tampered or wrong key).
 */
export function decryptSession(stored: string): string | null {
  try {
    const [ivHex, authTagHex, ciphertextHex] = stored.split(':')

    if (!ivHex || !authTagHex || !ciphertextHex) return null

    const key        = getKey()
    const iv         = Buffer.from(ivHex, 'hex')
    const authTag    = Buffer.from(authTagHex, 'hex')
    const ciphertext = Buffer.from(ciphertextHex, 'hex')

    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ])

    return decrypted.toString('utf8')
  } catch {
    // Wrong key, tampered data, or malformed string
    return null
  }
}
