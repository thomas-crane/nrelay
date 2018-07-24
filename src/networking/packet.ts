import { PacketBuffer } from './packet-buffer';
import { PacketType } from './packet-type';

/**
 * A packet which is sent from the client to the server.
 */
export interface OutgoingPacket {
  /**
   * The type of packet.
   */
  type: PacketType;
  /**
   * Writes the packet to the `buffer` according to the packet's structure.
   * @param buffer The buffer to write to.
   */
  write(buffer: PacketBuffer): void;
}

/**
 * A packet which is sent from the server to the client.
 */
export interface IncomingPacket {
  /**
   * The type of packet.
   */
  type: PacketType;
  /**
   * Reads data from the `buffer` according to the structure of the packet.
   * @param buffer The buffer to read from.
   */
  read(buffer: PacketBuffer): void;
}

/**
 * A packet which can be both received from the server and sent to the server.
 */
export interface DataPacket {
  /**
   * Writes the packet to the `buffer` according to the packet's structure.
   * @param buffer The buffer to write to.
   */
  write(buffer: PacketBuffer): void;
  /**
   * Reads data from the `buffer` according to the structure of the packet.
   * @param buffer The buffer to read from.
   */
  read(buffer: PacketBuffer): void;
}
