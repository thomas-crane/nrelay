import { PacketBuffer } from './packet-buffer';
import { PacketType } from './packet-type';

export interface OutgoingPacket {
  type: PacketType;
  write(buffer: PacketBuffer): void;
}

export interface IncomingPacket {
  type: PacketType;
  read(buffer: PacketBuffer): void;
}

export interface DataPacket {
  write(buffer: PacketBuffer): void;
  read(buffer: PacketBuffer): void;
}
