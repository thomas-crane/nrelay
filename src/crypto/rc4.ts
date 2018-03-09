export class RC4 {

    private state: number[];
    private key: Buffer;
    private i: number;
    private j: number;

    /**
     * Constructs a new RC4 cipher object and initializes
     * the Keystream State with the given key.
     * @param key The key to use in the Keystream.
     */
    constructor(key: Buffer) {
        this.key = key;
        this.reset();
    }

    /**
     * Performs an inline XOR on all bits in the data buffer with
     * the next bit of the Keystream.
     * @param data A stream of data to cipher using the Keystream.
     */
    public cipher(data: Buffer): void {
        for (let n = 0; n < data.length; n++) {
            this.i = (this.i + 1) % 256;
            this.j = (this.j + this.state[this.i]) % 256;
            const tmp = this.state[this.i];
            this.state[this.i] = this.state[this.j];
            this.state[this.j] = tmp;
            const k = this.state[(this.state[this.i] + this.state[this.j]) % 256];
            /* tslint:disable no-bitwise */
            data[n] = (data[n] ^ k);
            /* tslint:enable no-bitwise */
        }
    }

    /**
     * Initializes the Keystream State.
     */
    private reset(): void {
        this.state = new Array(256);
        this.i = 0;
        this.j = 0;
        for (let i = 0; i < 256; i++) {
            this.state[i] = i;
        }

        let j = 0;
        for (let i = 0; i < 256; i++) {
            j = (j + this.state[i] + this.key[i % this.key.length]) % 256;
            const tmp = this.state[i];
            this.state[i] = this.state[j];
            this.state[j] = tmp;
        }
    }
}

/**
 * The RC4 Private Key used to encrypt outgoing packet.
 * This key is a Hex String, so should be converted to
 * a Buffer for use.
 * @example
 * const key = Buffer.from(OUTGOING_KEY, 'hex');
 */
export const OUTGOING_KEY = '6a39570cc9de4ec71d64821894';
/**
 * The RC4 Private Key to decrypt incoming packet data.
 * This key is a Hex String, so should be converted to
 * a Buffer for use.
 * @example
 * const key = Buffer.from(INCOMING_KEY, 'hex');
 */
export const INCOMING_KEY = 'c79332b197f92ba85ed281a023';
