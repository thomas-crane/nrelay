import { PacketType, Packet } from './packet';
import { ArenaDeathPacket } from './../networking/packets/incoming/arena/arena-death';
import { ImminentArenaWavePacket } from './../networking/packets/incoming/arena/imminent-arena-wave';
import { DeletePetMessage } from './../networking/packets/incoming/pets/delete-pet-message';
import { EvolvedPetMessage } from './../networking/packets/incoming/pets/evolved-pet-message';
import { HatchPetMessage } from './../networking/packets/incoming/pets/hatch-pet-message';
import { AccountListPacket } from './../networking/packets/incoming/account-list-packet';
import { AllyShootPacket } from './../networking/packets/incoming/ally-shoot-packet';
import { AoePacket } from './../networking/packets/incoming/aoe-packet';
import { BuyResultPacket } from './../networking/packets/incoming/buy-result-packet';
import { ClientStatPacket } from './../networking/packets/incoming/client-stat-packet';
import { CreateSuccessPacket } from './../networking/packets/incoming/createsuccess-packet';
import { DamagePacket } from './../networking/packets/incoming/damage-packet';
import { DeathPacket } from './../networking/packets/incoming/death-packet';
import { EnemyShootPacket } from './../networking/packets/incoming/enemy-shoot-packet';
import { FailurePacket } from './../networking/packets/incoming/failure-packet';
import { GlobalNotificationPacket } from './../networking/packets/incoming/global-notification-packet';
import { GotoPacket } from './../networking/packets/incoming/goto-packet';
import { GuildResultPacket } from './../networking/packets/incoming/guild-result-packet';
import { InvResultPacket } from './../networking/packets/incoming/inv-result-packet';
import { InvitedToGuildPacket } from './../networking/packets/incoming/invited-to-guild-packet';
import { KeyInfoResponsePacket } from './../networking/packets/incoming/key-info-response-packet';
import { MapInfoPacket } from './../networking/packets/incoming/mapinfo-packet';
import { NameResultPacket } from './../networking/packets/incoming/name-result-packet';
import { NewAbilityMessage } from './../networking/packets/incoming/new-ability-message';
import { NewTickPacket } from './../networking/packets/incoming/newtick-packet';
import { NotificationPacket } from './../networking/packets/incoming/notification-packet';
import { PasswordPromptPacket } from './../networking/packets/incoming/password-prompt-packet';
import { PingPacket } from './../networking/packets/incoming/ping-packet';
import { QuestObjectIdPacket } from './../networking/packets/incoming/quest-objectid-packet';
import { QuestRedeemResponsePacket } from './../networking/packets/incoming/quest-redeem-response-packet';
import { ReconnectPacket } from './../networking/packets/incoming/reconnect-packet';
import { ReskinUnlockPacket } from './../networking/packets/incoming/reskin-unlock-packet';
import { ServerPlayerShootPacket } from './../networking/packets/incoming/server-player-shoot-packet';
import { ShowEffectPacket } from './../networking/packets/incoming/show-effect-packet';
import { TextPacket } from './../networking/packets/incoming/text-packet';
import { TradeAcceptedPacket } from './../networking/packets/incoming/trade-accepted';
import { TradeChangedPacket } from './../networking/packets/incoming/trade-changed';
import { TradeDonePacket } from './../networking/packets/incoming/trade-done-packet';
import { TradeRequestedPacket } from './../networking/packets/incoming/trade-requested-packet';
import { TradeStartPacket } from './../networking/packets/incoming/trade-start-packet';
import { UpdatePacket } from './../networking/packets/incoming/update-packet';
import { VerifyEmailPacket } from './../networking/packets/incoming/verify-email-packet';
import { EnterArenaPacket } from './../networking/packets/outgoing/arena/enter-arena-packet';
import { QuestRedeemPacket } from './../networking/packets/outgoing/arena/quest-redeem-packet';
import { ActivePetUpdateRequestPacket } from './../networking/packets/outgoing/pets/active-pet-update-request-packet';
import { AcceptTradePacket } from './../networking/packets/outgoing/accept-trade-packet';
import { AoeAckPacket } from './../networking/packets/outgoing/aoeack-packet';
import { BuyPacket } from './../networking/packets/outgoing/buy-packet';
import { CancelTradePacket } from './../networking/packets/outgoing/cancel-trade-packet';
import { ChangeGuildRankPacket } from './../networking/packets/outgoing/change-guild-rank-packet';
import { ChangeTradePacket } from './../networking/packets/outgoing/change-trade-packet';
import { CheckCreditsPacket } from './../networking/packets/outgoing/check-credits-packet';
import { ChooseNamePacket } from './../networking/packets/outgoing/choose-name-packet';
import { CreateGuildPacket } from './../networking/packets/outgoing/create-guild-packet';
import { CreatePacket } from './../networking/packets/outgoing/create-packet';
import { EditAccountListPacket } from './../networking/packets/outgoing/edit-account-list-packet';
import { EnemyHitPacket } from './../networking/packets/outgoing/enemy-hit-packet';
import { EscapePacket } from './../networking/packets/outgoing/escape-packet';
import { GoToQuestRoomPacket } from './../networking/packets/outgoing/go-to-quest-room-packet';
import { GotoAckPacket } from './../networking/packets/outgoing/gotoack-packet';
import { GroundDamagePacket } from './../networking/packets/outgoing/ground-damage-packet';
import { GuildInvitePacket } from './../networking/packets/outgoing/guild-invite-packet';
import { GuildRemovePacket } from './../networking/packets/outgoing/guild-remove-packet';
import { HelloPacket } from './../networking/packets/outgoing/hello-packet';
import { InvDropPacket } from './../networking/packets/outgoing/inv-drop-packet';
import { InvSwapPacket } from './../networking/packets/outgoing/inv-swap-packet';
import { JoinGuildPacket } from './../networking/packets/outgoing/join-guild-packet';
import { KeyInfoRequestPacket } from './../networking/packets/outgoing/key-info-request-packet';
import { LoadPacket } from './../networking/packets/outgoing/load-packet';
import { MovePacket } from './../networking/packets/outgoing/move-packet';
import { OtherHitPacket } from './../networking/packets/outgoing/other-hit-packet';
import { PlayerHitPacket } from './../networking/packets/outgoing/player-hit-packet';
import { PlayerShootPacket } from './../networking/packets/outgoing/player-shoot-packet';
import { PlayerTextPacket } from './../networking/packets/outgoing/playertext-packet';
import { PongPacket } from './../networking/packets/outgoing/pong-packet';
import { RequestTradePacket } from './../networking/packets/outgoing/request-trade-packet';
import { ReskinPacket } from './../networking/packets/outgoing/reskin-packet';
import { SetConditionPacket } from './../networking/packets/outgoing/set-condition-packet';
import { ShootAckPacket } from './../networking/packets/outgoing/shootack-packet';
import { SquareHitPacket } from './../networking/packets/outgoing/square-hit-packet';
import { TeleportPacket } from './../networking/packets/outgoing/teleport-packet';
import { UpdateAckPacket } from './../networking/packets/outgoing/updateack-packet';
import { UseItemPacket } from './../networking/packets/outgoing/use-item-packet';
import { UsePortalPacket } from './../networking/packets/outgoing/use-portal-packet';

export class Packets {
    public static create(type: PacketType, data: Buffer): Packet {
        if (!PacketType[type]) {
            throw new Error(`Invalid packet type: ${type}`);
        }
        let packet: Packet;
        switch (type) {
            case PacketType.ARENADEATH:
                packet = new ArenaDeathPacket(data);
                break;
            case PacketType.IMMINENTARENA_WAVE:
                packet = new ImminentArenaWavePacket(data);
                break;
            case PacketType.DELETEPET:
                packet = new DeletePetMessage(data);
                break;
            case PacketType.PETCHANGE_FORM_MSG:
                packet = new EvolvedPetMessage(data);
                break;
            case PacketType.HATCHPET:
                packet = new HatchPetMessage(data);
                break;
            case PacketType.ACCOUNTLIST:
                packet = new AccountListPacket(data);
                break;
            case PacketType.ALLYSHOOT:
                packet = new AllyShootPacket(data);
                break;
            case PacketType.AOE:
                packet = new AoePacket(data);
                break;
            case PacketType.BUYRESULT:
                packet = new BuyResultPacket(data);
                break;
            case PacketType.CLIENTSTAT:
                packet = new ClientStatPacket(data);
                break;
            case PacketType.CREATESUCCESS:
                packet = new CreateSuccessPacket(data);
                break;
            case PacketType.DAMAGE:
                packet = new DamagePacket(data);
                break;
            case PacketType.DEATH:
                packet = new DeathPacket(data);
                break;
            case PacketType.ENEMYSHOOT:
                packet = new EnemyShootPacket(data);
                break;
            case PacketType.FAILURE:
                packet = new FailurePacket(data);
                break;
            case PacketType.GLOBALNOTIFICATION:
                packet = new GlobalNotificationPacket(data);
                break;
            case PacketType.GOTO:
                packet = new GotoPacket(data);
                break;
            case PacketType.GUILDRESULT:
                packet = new GuildResultPacket(data);
                break;
            case PacketType.INVRESULT:
                packet = new InvResultPacket(data);
                break;
            case PacketType.INVITEDTOGUILD:
                packet = new InvitedToGuildPacket(data);
                break;
            case PacketType.KEYINFO_RESPONSE:
                packet = new KeyInfoResponsePacket(data);
                break;
            case PacketType.MAPINFO:
                packet = new MapInfoPacket(data);
                break;
            case PacketType.NAMERESULT:
                packet = new NameResultPacket(data);
                break;
            case PacketType.NEWABILITY:
                packet = new NewAbilityMessage(data);
                break;
            case PacketType.NEWTICK:
                packet = new NewTickPacket(data);
                break;
            case PacketType.NOTIFICATION:
                packet = new NotificationPacket(data);
                break;
            case PacketType.PASSWORDPROMPT:
                packet = new PasswordPromptPacket(data);
                break;
            case PacketType.PING:
                packet = new PingPacket(data);
                break;
            case PacketType.QUESTOBJID:
                packet = new QuestObjectIdPacket(data);
                break;
            case PacketType.QUESTREDEEM_RESPONSE:
                packet = new QuestRedeemResponsePacket(data);
                break;
            case PacketType.RECONNECT:
                packet = new ReconnectPacket(data);
                break;
            case PacketType.RESKINUNLOCK:
                packet = new ReskinUnlockPacket(data);
                break;
            case PacketType.SERVERPLAYERSHOOT:
                packet = new ServerPlayerShootPacket(data);
                break;
            case PacketType.SHOWEFFECT:
                packet = new ShowEffectPacket(data);
                break;
            case PacketType.TEXT:
                packet = new TextPacket(data);
                break;
            case PacketType.TRADEACCEPTED:
                packet = new TradeAcceptedPacket(data);
                break;
            case PacketType.TRADECHANGED:
                packet = new TradeChangedPacket(data);
                break;
            case PacketType.TRADEDONE:
                packet = new TradeDonePacket(data);
                break;
            case PacketType.TRADEREQUESTED:
                packet = new TradeRequestedPacket(data);
                break;
            case PacketType.TRADESTART:
                packet = new TradeStartPacket(data);
                break;
            case PacketType.UPDATE:
                packet = new UpdatePacket(data);
                break;
            case PacketType.VERIFYEMAIL:
                packet = new VerifyEmailPacket(data);
                break;
            case PacketType.ENTERARENA:
                packet = new EnterArenaPacket(data);
                break;
            case PacketType.QUESTREDEEM:
                packet = new QuestRedeemPacket(data);
                break;
            case PacketType.ACTIVEPET_UPDATE_REQUEST:
                packet = new ActivePetUpdateRequestPacket(data);
                break;
            case PacketType.ACCEPTTRADE:
                packet = new AcceptTradePacket(data);
                break;
            case PacketType.AOEACK:
                packet = new AoeAckPacket(data);
                break;
            case PacketType.BUY:
                packet = new BuyPacket(data);
                break;
            case PacketType.CANCELTRADE:
                packet = new CancelTradePacket(data);
                break;
            case PacketType.CHANGEGUILDRANK:
                packet = new ChangeGuildRankPacket(data);
                break;
            case PacketType.CHANGETRADE:
                packet = new ChangeTradePacket(data);
                break;
            case PacketType.CHECKCREDITS:
                packet = new CheckCreditsPacket(data);
                break;
            case PacketType.CHOOSENAME:
                packet = new ChooseNamePacket(data);
                break;
            case PacketType.CREATEGUILD:
                packet = new CreateGuildPacket(data);
                break;
            case PacketType.CREATE:
                packet = new CreatePacket(data);
                break;
            case PacketType.EDITACCOUNTLIST:
                packet = new EditAccountListPacket(data);
                break;
            case PacketType.ENEMYHIT:
                packet = new EnemyHitPacket(data);
                break;
            case PacketType.ESCAPE:
                packet = new EscapePacket(data);
                break;
            case PacketType.QUESTROOM_MSG:
                packet = new GoToQuestRoomPacket(data);
                break;
            case PacketType.GOTOACK:
                packet = new GotoAckPacket(data);
                break;
            case PacketType.GROUNDDAMAGE:
                packet = new GroundDamagePacket(data);
                break;
            case PacketType.GUILDINVITE:
                packet = new GuildInvitePacket(data);
                break;
            case PacketType.GUILDREMOVE:
                packet = new GuildRemovePacket(data);
                break;
            case PacketType.HELLO:
                packet = new HelloPacket(data);
                break;
            case PacketType.INVDROP:
                packet = new InvDropPacket(data);
                break;
            case PacketType.INVSWAP:
                packet = new InvSwapPacket(data);
                break;
            case PacketType.JOINGUILD:
                packet = new JoinGuildPacket(data);
                break;
            case PacketType.KEYINFO_REQUEST:
                packet = new KeyInfoRequestPacket(data);
                break;
            case PacketType.LOAD:
                packet = new LoadPacket(data);
                break;
            case PacketType.MOVE:
                packet = new MovePacket(data);
                break;
            case PacketType.OTHERHIT:
                packet = new OtherHitPacket(data);
                break;
            case PacketType.PLAYERHIT:
                packet = new PlayerHitPacket(data);
                break;
            case PacketType.PLAYERSHOOT:
                packet = new PlayerShootPacket(data);
                break;
            case PacketType.PLAYERTEXT:
                packet = new PlayerTextPacket(data);
                break;
            case PacketType.PONG:
                packet = new PongPacket(data);
                break;
            case PacketType.REQUESTTRADE:
                packet = new RequestTradePacket(data);
                break;
            case PacketType.RESKIN:
                packet = new ReskinPacket(data);
                break;
            case PacketType.SETCONDITION:
                packet = new SetConditionPacket(data);
                break;
            case PacketType.SHOOTACK:
                packet = new ShootAckPacket(data);
                break;
            case PacketType.SQUAREHIT:
                packet = new SquareHitPacket(data);
                break;
            case PacketType.TELEPORT:
                packet = new TeleportPacket(data);
                break;
            case PacketType.UPDATEACK:
                packet = new UpdateAckPacket(data);
                break;
            case PacketType.USEITEM:
                packet = new UseItemPacket(data);
                break;
            case PacketType.USEPORTAL:
                packet = new UsePortalPacket(data);
                break;
        }
        packet.type = type;
        return packet;
    }
}
