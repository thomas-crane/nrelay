export class PacketHead {

    public id: number;
    public length: number;

    constructor(id: number, length: number) {
        this.id = id;
        this.length = length;
    }
}
