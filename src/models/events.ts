/**
 * A strongly typed representation of the events which the runtime can raise.
 */
export enum Events {
  /**
   * The event raised when a client has connected to a server.
   */
  ClientConnect = 'client_connect',
  /**
   * The event raised when a client has disconnected from a server.
   */
  ClientDisconnect = 'client_disconnect',
  /**
   * The event raised when a client is ready to send/receive packets.
   */
  ClientReady = 'client_ready',
}
