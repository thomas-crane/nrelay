import { Packet, PacketType } from './../networking/packet';

export class PluginManager {

    private static hooks: any;

    static addHook(packetType: PacketType, action: any): void {
        if (!this.hooks) {
            this.hooks = {};
        }
        if (!this.hooks.hasOwnProperty(packetType)) {
            this.hooks[packetType] = [];
        }
        this.hooks[packetType].push(action);
    }

    static callHooks(packetType: PacketType, packet: Packet, caller: any) {
        if (!this.hooks) {
            return;
        }
        if (this.hooks.hasOwnProperty(packetType)) {
            for (let i = 0; i < this.hooks[packetType].length; i++) {
                this.hooks[packetType][i].apply(caller, [caller, packetType]);
            }
        }
    }
}
