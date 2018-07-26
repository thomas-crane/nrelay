/**
 * @module models
 */
import { WorldPosData } from './../networking/data/world-pos-data';
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
   * The maximum MP of the player.
   */
  maxMP: number;
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
   * The defense stat of this player. This includes stat bonuses from equipped items.
   */
  def: number;
  /**
   * The speed stat of this player. This includes stat bonuses from equipped items.
   */
  spd: number;
  /**
   * The dexterity stat of this player. This includes stat bonuses from equipped items.
   */
  dex: number;
  /**
   * The wisdom stat of this player. This includes stat bonuses from equipped items.
   */
  wis: number;
  /**
   * The vitality stat of this player. This includes stat bonuses from equipped items.
   */
  vit: number;
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
}

/**
 * Returns a `PlayerData` object with default properties.
 * @deprecated Prefer `const data = {} as PlayerData;` to create new `PlayerData` objects.
 */
export function getDefaultPlayerData(): PlayerData {
  return {
    objectId: 0,
    worldPos: null,
    name: null,
    level: 0,
    exp: 0,
    currentFame: 0,
    stars: 0,
    accountId: null,
    accountFame: 0,
    gold: 0,
    class: Classes.Wizard,
    nameChosen: false,
    guildName: null,
    guildRank: GuildRank.NoRank,
    maxHP: 0,
    maxMP: 0,
    hp: 0,
    mp: 0,
    atk: 0,
    def: 0,
    spd: 0,
    dex: 0,
    wis: 0,
    vit: 0,
    condition: 0,
    hpPots: 0,
    mpPots: 0,
    hasBackpack: false,
    inventory: new Array<number>(20).fill(-1),
    server: null
  };
}
