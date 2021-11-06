import { WorldPosData } from '@realmlib/net';
import { Classes } from './classes';
import { GuildRank } from './guildrank';

/**
 * The properties of a player, or other entity such as an enemy.
 *
 * Note that wherever "player" or "character" is used in these docs, those properties
 * are specific to players. But wherever "entity" is used, these properties may also
 * be present for entities other than players, such as enemies.
 */
export interface PlayerData {
  /**
   * The unique identifier of this entity. This is session-based
   * and will be different each time an entity enters a map.
   */
  objectId: number;
  /**
   * The position of the entity.
   */
  worldPos: WorldPosData;
  /**
   * The name of the player.
   */
  name: string;
  /**
   * The level of the player.
   */
  level: number;
  /**
   * The total XP points of the player.
   */
  exp: number;
  /**
   * The current character fame of the player.
   */
  currentFame: number;
  /**
   * The number of stars of the player.
   */
  stars: number;
  /**
   * The account id of the player. This will never change for any given player.
   */
  accountId: string;
  /**
   * The account fame of the player.
   */
  accountFame: number;
  /**
   * Whether or not the player has chosen a unique name.
   */
  nameChosen: boolean;
  /**
   * The name of the player's guild, if they are in one.
   */
  guildName: string;
  /**
   * The guild rank of this player, if they are in a guild.
   */
  guildRank: GuildRank;
  /**
   * The account gold of this player.
   */
  gold: number;
  /**
   * The class of the character.
   */
  class: Classes;
  /**
   * The maximum HP of the entity.
   */
  maxHP: number;
  /**
   * The increase in max HP which has been added due to bonuses (e.g. equipping a ring)
   */
  maxHPBoost: number;
  /**
   * The maximum MP of the player.
   */
  maxMP: number;
  /**
   * The increase in max MP which has been added due to bonuses (e.g. equipping a ring)
   */
  maxMPBoost: number;
  /**
   * The current HP of the entity.
   */
  hp: number;
  /**
   * The current MP of the player.
   */
  mp: number;
  /**
   * The attack stat of this player. This includes stat bonuses from equipped items.
   */
  atk: number;
  /**
   * The amount of attack which has been added due to bonuses (e.g. equipping armor).
   */
  atkBoost: number;
  /**
   * The defense stat of this player. This includes stat bonuses from equipped items.
   */
  def: number;
  /**
   * The amount of defense which has been added due to bonuses (e.g. equipping armor).
   */
  defBoost: number;
  /**
   * The speed stat of this player. This includes stat bonuses from equipped items.
   */
  spd: number;
  /**
   * The amount of speed which has been added due to bonuses (e.g. equipping armor).
   */
  spdBoost: number;
  /**
   * The dexterity stat of this player. This includes stat bonuses from equipped items.
   */
  dex: number;
  /**
   * The amount of dexterity which has been added due to bonuses (e.g. equipping armor).
   */
  dexBoost: number;
  /**
   * The wisdom stat of this player. This includes stat bonuses from equipped items.
   */
  wis: number;
  /**
   * The amount of wisdom which has been added due to bonuses (e.g. equipping armor).
   */
  wisBoost: number;
  /**
   * The vitality stat of this player. This includes stat bonuses from equipped items.
   */
  vit: number;
  /**
   * The amount of vitality which has been added due to bonuses (e.g. equipping armor).
   */
  vitBoost: number;
  /**
   * The condition flags for this entity. The number itself will be meaningless, as
   * the effects are represented with individual bits of the number.
   */
  condition: number;
  /**
   * The number of HP potions this player has stored.
   */
  hpPots: number;
  /**
   * The number of MP potions this player has stored.
   */
  mpPots: number;
  /**
   * Whether or not this player has a backpack.
   */
  hasBackpack: boolean;
  /**
   * The contents of the players inventory. Items are represented
   * by their item id, or `-1` if the slot is empty.
   */
  inventory: number[];
  /**
   * The server this entity is connected to.
   * @deprecated This is only guaranteed to be correct for players tracked
   * by the Player Tracker component. For **any** other use, this is unreliable.
   */
  server: string;
  /**
   * The size of this player.
   */
  size: number;
  /**
   * The amount of EXP required to advance to the next level.
   */
  nextLevelExp: number;
  /**
   * The clothing dye of this player.
   */
  clothingDye: number;
  /**
   * The accessory dye of this player.
   */
  accessoryDye: number;
  /**
   * The amount of fame required to achieve the next class quest.
   */
  nextClassQuestFame: number;
  /**
   * > Unknown.
   */
  legendaryRank: number;
  /**
   * Whether or not this player has an active XP booster.
   */
  xpBoosted: boolean;
  /**
   * The amount of time left of this player's XP booster.
   */
  xpBoostTime: number;
  /**
   * The skin of this player.
   */
  texture: number;
  /**
   * The number of fortune tokens this player has.
   */
  fortuneTokens: number;
  /**
   * The multiplier for projectile speed for shots from this player.
   */
  projSpeedMult: number;
  /**
   * The multiplier for projectile lifetime for shots from this player.
   */
  projLifeMult: number;
}

/**
 * Returns a `PlayerData` object with default properties.
 * @deprecated Prefer `const data = {} as PlayerData;` to create new `PlayerData` objects.
 */
export function getDefaultPlayerData(): PlayerData {
  return {
    objectId: 0,
    worldPos: undefined,
    name: undefined,
    level: 0,
    exp: 0,
    currentFame: 0,
    stars: 0,
    accountId: undefined,
    accountFame: 0,
    gold: 0,
    class: Classes.Wizard,
    nameChosen: false,
    guildName: undefined,
    guildRank: GuildRank.NoRank,
    maxHP: 0,
    maxHPBoost: 0,
    maxMP: 0,
    maxMPBoost: 0,
    hp: 0,
    mp: 0,
    atk: 0,
    atkBoost: 0,
    def: 0,
    defBoost: 0,
    spd: 0,
    spdBoost: 0,
    dex: 0,
    dexBoost: 0,
    wis: 0,
    wisBoost: 0,
    vit: 0,
    vitBoost: 0,
    condition: 0,
    hpPots: 0,
    mpPots: 0,
    hasBackpack: false,
    inventory: new Array<number>(20).fill(-1),
    server: undefined,
    size: 0,
    nextLevelExp: 0,
    clothingDye: 0,
    accessoryDye: 0,
    nextClassQuestFame: 0,
    legendaryRank: 0,
    xpBoosted: false,
    xpBoostTime: 0,
    texture: 0,
    fortuneTokens: 0,
    projSpeedMult: 0,
    projLifeMult: 0
  };
}
