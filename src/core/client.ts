import net = require('net');
import { Log, SeverityLevel } from '../services/logger';
import { HelloPacket } from './../networking/packets/outgoing/hello-packet';
import { PacketIO } from './../networking/packetio';

export class Client {

    private serverIp: string;
    private packetio: PacketIO;

    constructor(server: string) {
        this.serverIp = server;
        const clientSocket = new net.Socket({
            readable: true,
            writable: true
        });
        this.packetio = new PacketIO(clientSocket);
        Log('Client', 'Starting connection.', SeverityLevel.Info);
        clientSocket.connect(2050, this.serverIp);
        clientSocket.on('connect', this.onConnect.bind(this));
        clientSocket.on('close', this.onClose);

        this.packetio.on('packet', (data) => {
            console.log(JSON.stringify(data));
        });
    }

    onConnect(): void {
        Log('Client', 'Connected to server!', SeverityLevel.Success);
        const hp: HelloPacket = new HelloPacket();
        hp.buildVersion = 'X17.0.0';
        hp.gameId = -2;
        hp.guid = 'email';
        hp.password = 'pass';
        hp.random1 = Math.floor(Math.random() * 1000000000);
        hp.random2 = Math.floor(Math.random() * 1000000000);
        hp.secret = '';
        hp.keyTime = -1;
        hp.key = new Int8Array(0);
        hp.mapJSON = '';
        hp.entryTag = '';
        hp.gameNet = '';
        hp.gameNet = 'rotmg';
        hp.gameNetUserId = '';
        hp.playPlatform = 'rotmg';
        hp.platformToken = '';
        hp.userToken = '';

        this.packetio.sendPacket(hp);
    }

    onClose(error: boolean) {
        Log('Client', 'The connection was closed.', SeverityLevel.Warning);
        if (error) {
            Log('Client', 'An error occurred (cause of close)', SeverityLevel.Error);
        }
        process.exit(0);
    }
}
