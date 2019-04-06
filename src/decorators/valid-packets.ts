/**
 * @module decorators
 */
import * as incomingPackets from '@realmlib/net/lib/packets/incoming';

/**
 * A list of all packet types that are valid for a packet hook.
 */
export const VALID_PACKET_HOOKS = Object.keys(incomingPackets);
