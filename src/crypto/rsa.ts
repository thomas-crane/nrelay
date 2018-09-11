/**
 * @module crypto
 */
import * as NodeRSA from 'node-rsa';

const PUBLIC_KEY =
  '-----BEGIN PUBLIC KEY-----\n' +
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDCKFctVrhfF3m2Kes0FBL/JFeO' +
  'cmNg9eJz8k/hQy1kadD+XFUpluRqa//Uxp2s9W2qE0EoUCu59ugcf/p7lGuL99Uo' +
  'SGmQEynkBvZct+/M40L0E0rZ4BVgzLOJmIbXMp0J4PnPcb6VLZvxazGcmSfjauC7' +
  'F3yWYqUbZd/HCBtawwIDAQAB\n' +
  '-----END PUBLIC KEY-----';

/**
 * A static singleton class which provides RSA encryption methods.
 */
export class RSA {
  /**
   * Encrypts the text with a hard-coded public key.
   * @param msg The text to encrypt.
   */
  static encrypt(msg: string): string {
    if (!msg || msg.trim() === '') {
      return '';
    }

    const key = new NodeRSA(PUBLIC_KEY, 'pkcs8-public', {
      encryptionScheme: 'pkcs1'
    });

    return key.encrypt(Buffer.from(msg, 'utf8'), 'base64', 'utf8');
  }
}
