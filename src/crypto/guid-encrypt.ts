import crypto = require('crypto');

export function encryptGUID(guid: string): string {
    const key =
    '-----BEGIN PUBLIC KEY-----\n' +
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDCKFctVrhfF3m2Kes0FBL/JFeO\n' +
    'cmNg9eJz8k/hQy1kadD+XFUpluRqa//Uxp2s9W2qE0EoUCu59ugcf/p7lGuL99Uo\n' +
    'SGmQEynkBvZct+/M40L0E0rZ4BVgzLOJmIbXMp0J4PnPcb6VLZvxazGcmSfjauC7\n' +
    'F3yWYqUbZd/HCBtawwIDAQAB\n' +
    '-----END PUBLIC KEY-----';

    const encryptedGUID = crypto.publicEncrypt(key, Buffer.from(guid, 'utf8'));

    return encryptedGUID.toString('base64');
}
