import crypto = require('crypto');

export class RC4 {

    private key: string;
    private encrypt: crypto.Cipher;
    private decrypt: crypto.Decipher;

    constructor(key: string) {
        this.encrypt = crypto.createCipheriv('rc4', Buffer.from(key, 'hex'), '');
        this.decrypt = crypto.createDecipheriv('rc4', key, '');
    }

    public cipher(data: Buffer): Buffer {
        const sealedBuffer = [];
        sealedBuffer.push(this.encrypt.update(data));
        sealedBuffer.push(this.encrypt.final());

        return Buffer.concat(sealedBuffer, sealedBuffer[0].length + sealedBuffer[1].length);
    }

    public decipher(data: Buffer) {
        const sealedBuffer = [];
        sealedBuffer.push(this.decrypt.update(data));
        sealedBuffer.push(this.decrypt.final());

        return Buffer.concat(sealedBuffer, sealedBuffer[0].length + sealedBuffer[1].length);
    }
}

export const OUTGOING_KEY = '311f80691451c71d09a13a2a6e';
export const INCOMING_KEY = '72c5583cafb6818995cdd74b80';
