import { PacketType } from './packet-type';
import { ArenaDeathPacket } from './packets/incoming/arena/arena-death';
import { ImminentArenaWavePacket } from './packets/incoming/arena/imminent-arena-wave';
import { DeletePetMessage } from './packets/incoming/pets/delete-pet-message';
import { EvolvedPetMessage } from './packets/incoming/pets/evolved-pet-message';
import { HatchPetMessage } from './packets/incoming/pets/hatch-pet-message';
import { AccountListPacket } from './packets/incoming/account-list-packet';
import { AllyShootPacket } from './packets/incoming/ally-shoot-packet';
import { AoePacket } from './packets/incoming/aoe-packet';
import { BuyResultPacket } from './packets/incoming/buy-result-packet';
import { ClientStatPacket } from './packets/incoming/client-stat-packet';
import { CreateSuccessPacket } from './packets/incoming/createsuccess-packet';
import { DamagePacket } from './packets/incoming/damage-packet';
import { DeathPacket } from './packets/incoming/death-packet';
import { EnemyShootPacket } from './packets/incoming/enemy-shoot-packet';
import { FailurePacket } from './packets/incoming/failure-packet';
import { GlobalNotificationPacket } from './packets/incoming/global-notification-packet';
import { GotoPacket } from './packets/incoming/goto-packet';
import { GuildResultPacket } from './packets/incoming/guild-result-packet';
import { InvResultPacket } from './packets/incoming/inv-result-packet';
import { InvitedToGuildPacket } from './packets/incoming/invited-to-guild-packet';
import { KeyInfoResponsePacket } from './packets/incoming/key-info-response-packet';
import { MapInfoPacket } from './packets/incoming/mapinfo-packet';
import { NameResultPacket } from './packets/incoming/name-result-packet';
import { NewAbilityMessage } from './packets/incoming/new-ability-message';
import { NewTickPacket } from './packets/incoming/newtick-packet';
import { NotificationPacket } from './packets/incoming/notification-packet';
import { PasswordPromptPacket } from './packets/incoming/password-prompt-packet';
import { PingPacket } from './packets/incoming/ping-packet';
import { QuestObjectIdPacket } from './packets/incoming/quest-objectid-packet';
import { QuestRedeemResponsePacket } from './packets/incoming/quest-redeem-response-packet';
import { ReconnectPacket } from './packets/incoming/reconnect-packet';
import { ReskinUnlockPacket } from './packets/incoming/reskin-unlock-packet';
import { ServerPlayerShootPacket } from './packets/incoming/server-player-shoot-packet';
import { ShowEffectPacket } from './packets/incoming/show-effect-packet';
import { TextPacket } from './packets/incoming/text-packet';
import { TradeAcceptedPacket } from './packets/incoming/trade-accepted';
import { TradeChangedPacket } from './packets/incoming/trade-changed';
import { TradeDonePacket } from './packets/incoming/trade-done-packet';
import { TradeRequestedPacket } from './packets/incoming/trade-requested-packet';
import { TradeStartPacket } from './packets/incoming/trade-start-packet';
import { UpdatePacket } from './packets/incoming/update-packet';
import { VerifyEmailPacket } from './packets/incoming/verify-email-packet';
import { IncomingPacket } from './packet';

/**
 * A static utility class for creating packet objects from a `PacketType`.
 */
export class Packets {
  /**
   * Creates the correct packet object for the given type.
   * @param type The type of packet to create.
   * @throws {Error} if the packet cannot be created.
   */
  static create(type: PacketType): IncomingPacket {
    if (!PacketType[type]) {
      throw new Error(`Invalid packet type: ${type}`);
    }
    let packet: IncomingPacket;
    switch (type) {
      case PacketType.ARENADEATH:
        packet = new ArenaDeathPacket();
        break;
      case PacketType.IMMINENTARENA_WAVE:
        packet = new ImminentArenaWavePacket();
        break;
      case PacketType.DELETEPET:
        packet = new DeletePetMessage();
        break;
      case PacketType.PETCHANGE_FORM_MSG:
        packet = new EvolvedPetMessage();
        break;
      case PacketType.HATCHPET:
        packet = new HatchPetMessage();
        break;
      case PacketType.ACCOUNTLIST:
        packet = new AccountListPacket();
        break;
      case PacketType.ALLYSHOOT:
        packet = new AllyShootPacket();
        break;
      case PacketType.AOE:
        packet = new AoePacket();
        break;
      case PacketType.BUYRESULT:
        packet = new BuyResultPacket();
        break;
      case PacketType.CLIENTSTAT:
        packet = new ClientStatPacket();
        break;
      case PacketType.CREATESUCCESS:
        packet = new CreateSuccessPacket();
        break;
      case PacketType.DAMAGE:
        packet = new DamagePacket();
        break;
      case PacketType.DEATH:
        packet = new DeathPacket();
        break;
      case PacketType.ENEMYSHOOT:
        packet = new EnemyShootPacket();
        break;
      case PacketType.FAILURE:
        packet = new FailurePacket();
        break;
      case PacketType.GLOBALNOTIFICATION:
        packet = new GlobalNotificationPacket();
        break;
      case PacketType.GOTO:
        packet = new GotoPacket();
        break;
      case PacketType.GUILDRESULT:
        packet = new GuildResultPacket();
        break;
      case PacketType.INVRESULT:
        packet = new InvResultPacket();
        break;
      case PacketType.INVITEDTOGUILD:
        packet = new InvitedToGuildPacket();
        break;
      case PacketType.KEYINFO_RESPONSE:
        packet = new KeyInfoResponsePacket();
        break;
      case PacketType.MAPINFO:
        packet = new MapInfoPacket();
        break;
      case PacketType.NAMERESULT:
        packet = new NameResultPacket();
        break;
      case PacketType.NEWABILITY:
        packet = new NewAbilityMessage();
        break;
      case PacketType.NEWTICK:
        packet = new NewTickPacket();
        break;
      case PacketType.NOTIFICATION:
        packet = new NotificationPacket();
        break;
      case PacketType.PASSWORDPROMPT:
        packet = new PasswordPromptPacket();
        break;
      case PacketType.PING:
        packet = new PingPacket();
        break;
      case PacketType.QUESTOBJID:
        packet = new QuestObjectIdPacket();
        break;
      case PacketType.QUESTREDEEM_RESPONSE:
        packet = new QuestRedeemResponsePacket();
        break;
      case PacketType.RECONNECT:
        packet = new ReconnectPacket();
        break;
      case PacketType.RESKINUNLOCK:
        packet = new ReskinUnlockPacket();
        break;
      case PacketType.SERVERPLAYERSHOOT:
        packet = new ServerPlayerShootPacket();
        break;
      case PacketType.SHOWEFFECT:
        packet = new ShowEffectPacket();
        break;
      case PacketType.TEXT:
        packet = new TextPacket();
        break;
      case PacketType.TRADEACCEPTED:
        packet = new TradeAcceptedPacket();
        break;
      case PacketType.TRADECHANGED:
        packet = new TradeChangedPacket();
        break;
      case PacketType.TRADEDONE:
        packet = new TradeDonePacket();
        break;
      case PacketType.TRADEREQUESTED:
        packet = new TradeRequestedPacket();
        break;
      case PacketType.TRADESTART:
        packet = new TradeStartPacket();
        break;
      case PacketType.UPDATE:
        packet = new UpdatePacket();
        break;
      case PacketType.VERIFYEMAIL:
        packet = new VerifyEmailPacket();
        break;
    }
    return packet;
  }
}
