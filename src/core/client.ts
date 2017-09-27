import { encryptGUID } from '../crypto/guid-encrypt';
import net = require('net');
import { Log, SeverityLevel } from '../services/logger';
import { HelloPacket } from './../networking/packets/hello-packet';
import { PacketIO } from './../networking/packetio';

export class Client {

    private clientSocket: net.Socket;
    private serverIp: string;

    constructor(server: string) {
        this.serverIp = server;
        this.clientSocket = new net.Socket({
            readable: true,
            writable: true
        });
        Log('Client', 'Starting connection.', SeverityLevel.Info);
        this.clientSocket.connect(2050, this.serverIp);
        this.clientSocket.on('connect', this.onConnect);
        this.clientSocket.on('close', this.onClose);
        this.clientSocket.on('data', this.onData);
    }

    onConnect(): void {
        Log('Client', 'Connected to server!', SeverityLevel.Success);
        const hp: HelloPacket = new HelloPacket();
        hp.buildVersion = 'X17.0.0';
        hp.gameId = -2;
        hp.guid = encryptGUID('email');
        hp.password = encryptGUID('pass');
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

        const packetio = new PacketIO();
        this.write(packetio.sendPacket(hp));
    }

    onClose(error: boolean) {
        Log('Client', 'The connection was closed.', SeverityLevel.Warning);
        if (error) {
            Log('Client', 'An error occurred (cause of close)', SeverityLevel.Error);
        }
    }
    private onData(data: Buffer) {
        Log('Client', 'Data received');
        console.log(data);
    }
}
