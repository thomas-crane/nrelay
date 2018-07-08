export class PacketHead {

    id: number;
    length: number;

    constructor(id: number, length: number) {
        this.id = id;
        this.length = length;
    }
}
