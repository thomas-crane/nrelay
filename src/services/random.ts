export class Random {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    public nextIntInRange(min: number, max: number): number {
        if (min === max) {
            return min;
        }
        return min + this.generate() % (max - min);
    }

    private generate(): number {
        // tslint:disable no-bitwise
        let hi = 0;
        let lo = 0;
        lo = 16807 * (this.seed & 65535);
        hi = 16807 * (this.seed >> 16);
        lo += (hi & 32767) << 16;
        lo += hi >> 15;
        if (lo > 2147483647) {
            lo -= 2147483647;
        }
        this.seed = lo;
        return this.seed;
        // tslint:enable no-bitwise
    }
}
