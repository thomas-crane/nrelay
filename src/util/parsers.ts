import { ObjectData, ObjectStatusData, StatData, StatType } from '@realmlib/net';
import { PlayerData } from '../models';

/**
 * Processes the `data` and returns the resulting `PlayerData` object.
 * @param data The data to process.
 */
export function processObject(data: ObjectData): PlayerData {
  const playerData = processObjectStatus(data.status);
  playerData.class = data.objectType;
  return playerData;
}

/**
 * Processes the `data` and returns the result. If `currentData` is provided, it will be
 * used as a starting point for the returned `PlayerData`.
 * @param data The data to process.
 * @param currentData The existing `PlayerData`.
 */
export function processObjectStatus(data: ObjectStatusData, currentData?: PlayerData): PlayerData {
  const playerData = processStatData(data.stats, currentData);
  playerData.worldPos = data.pos;
  playerData.objectId = data.objectId;

  return playerData;
}

/**
 * Process a list of stats and returns the result. If `currentData` is provided, it will be
 * used as a starting point for the returned `PlayerData`.
 * @param stats The stats to process.
 * @param currentData The existing `PlayerData`.
 */
export function processStatData(stats: StatData[], currentData?: PlayerData): PlayerData {
  const playerData = currentData || {} as PlayerData;
  if (!playerData.inventory) {
    playerData.inventory = [];
  }
  for (const stat of stats) {
    switch (stat.statType) {
      case StatType.NAME_STAT:
        playerData.name = stat.stringStatValue;
        continue;
      case StatType.LEVEL_STAT:
        playerData.level = stat.statValue;
        continue;
      case StatType.EXP_STAT:
        playerData.exp = stat.statValue;
        continue;
      case StatType.CURR_FAME_STAT:
        playerData.currentFame = stat.statValue;
        continue;
      case StatType.NUM_STARS_STAT:
        playerData.stars = stat.statValue;
        continue;
      case StatType.ACCOUNT_ID_STAT:
        playerData.accountId = stat.stringStatValue;
        continue;
      case StatType.FAME_STAT:
        playerData.accountFame = stat.statValue;
        continue;
      case StatType.CREDITS_STAT:
        playerData.gold = stat.statValue;
        continue;
      case StatType.MAX_HP_STAT:
        playerData.maxHP = stat.statValue;
        continue;
      case StatType.MAX_MP_STAT:
        playerData.maxMP = stat.statValue;
        continue;
      case StatType.HP_STAT:
        playerData.hp = stat.statValue;
        continue;
      case StatType.MP_STAT:
        playerData.mp = stat.statValue;
        continue;
      case StatType.ATTACK_STAT:
        playerData.atk = stat.statValue;
        continue;
      case StatType.ATTACK_BOOST_STAT:
        playerData.atkBoost = stat.statValue;
        continue;
      case StatType.DEFENSE_STAT:
        playerData.def = stat.statValue;
        continue;
      case StatType.DEFENSE_BOOST_STAT:
        playerData.defBoost = stat.statValue;
        continue;
      case StatType.SPEED_STAT:
        playerData.spd = stat.statValue;
        continue;
      case StatType.SPEED_BOOST_STAT:
        playerData.spdBoost = stat.statValue;
        continue;
      case StatType.DEXTERITY_STAT:
        playerData.dex = stat.statValue;
        continue;
      case StatType.DEXTERITY_BOOST_STAT:
        playerData.dexBoost = stat.statValue;
        continue;
      case StatType.VITALITY_STAT:
        playerData.vit = stat.statValue;
        continue;
      case StatType.VITALITY_BOOST_STAT:
        playerData.vitBoost = stat.statValue;
        continue;
      case StatType.CONDITION_STAT:
        playerData.condition = stat.statValue;
        continue;
      case StatType.WISDOM_STAT:
        playerData.wis = stat.statValue;
        continue;
      case StatType.WISDOM_BOOST_STAT:
        playerData.wisBoost = stat.statValue;
        continue;
      case StatType.HEALTH_POTION_STACK_STAT:
        playerData.hpPots = stat.statValue;
        continue;
      case StatType.MAGIC_POTION_STACK_STAT:
        playerData.mpPots = stat.statValue;
        continue;
      case StatType.HASBACKPACK_STAT:
        playerData.hasBackpack = stat.statValue === 1;
        continue;
      case StatType.NAME_CHOSEN_STAT:
        playerData.nameChosen = stat.statValue !== 0;
        continue;
      case StatType.GUILD_NAME_STAT:
        playerData.guildName = stat.stringStatValue;
        continue;
      case StatType.GUILD_RANK_STAT:
        playerData.guildRank = stat.statValue;
        continue;
      default:
        if (stat.statType >= StatType.INVENTORY_0_STAT && stat.statType <= StatType.INVENTORY_11_STAT) {
          playerData.inventory[stat.statType - 8] = stat.statValue;
        } else if (stat.statType >= StatType.BACKPACK_0_STAT && stat.statType <= StatType.BACKPACK_7_STAT) {
          playerData.inventory[stat.statType - 59] = stat.statValue;
        }
    }
  }
  return playerData;
}
