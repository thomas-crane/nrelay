import { Packet } from './../packet';

export class StatData {

    static MAX_HP_STAT = 0;
    static HP_STAT = 1;
    static SIZE_STAT = 2;
    static MAX_MP_STAT = 3;
    static MP_STAT = 4;
    static NEXT_LEVEL_EXP_STAT = 5;
    static EXP_STAT = 6;
    static LEVEL_STAT = 7;
    static ATTACK_STAT = 20;
    static DEFENSE_STAT = 21;
    static SPEED_STAT = 22;
    static INVENTORY_0_STAT = 8;
    static INVENTORY_1_STAT = 9;
    static INVENTORY_2_STAT = 10;
    static INVENTORY_3_STAT = 11;
    static INVENTORY_4_STAT = 12;
    static INVENTORY_5_STAT = 13;
    static INVENTORY_6_STAT = 14;
    static INVENTORY_7_STAT = 15;
    static INVENTORY_8_STAT = 16;
    static INVENTORY_9_STAT = 17;
    static INVENTORY_10_STAT = 18;
    static INVENTORY_11_STAT = 19;
    static VITALITY_STAT = 26;
    static WISDOM_STAT = 27;
    static DEXTERITY_STAT = 28;
    static CONDITION_STAT = 29;
    static NUM_STARS_STAT = 30;
    static NAME_STAT = 31;
    static TEX1_STAT = 32;
    static TEX2_STAT = 33;
    static MERCHANDISE_TYPE_STAT = 34;
    static CREDITS_STAT = 35;
    static MERCHANDISE_PRICE_STAT = 36;
    static ACTIVE_STAT = 37;
    static ACCOUNT_ID_STAT = 38;
    static FAME_STAT = 39;
    static MERCHANDISE_CURRENCY_STAT = 40;
    static CONNECT_STAT = 41;
    static MERCHANDISE_COUNT_STAT = 42;
    static MERCHANDISE_MINS_LEFT_STAT = 43;
    static MERCHANDISE_DISCOUNT_STAT = 44;
    static MERCHANDISE_RANK_REQ_STAT = 45;
    static MAX_HP_BOOST_STAT = 46;
    static MAX_MP_BOOST_STAT = 47;
    static ATTACK_BOOST_STAT = 48;
    static DEFENSE_BOOST_STAT = 49;
    static SPEED_BOOST_STAT = 50;
    static VITALITY_BOOST_STAT = 51;
    static WISDOM_BOOST_STAT = 52;
    static DEXTERITY_BOOST_STAT = 53;
    static OWNER_ACCOUNT_ID_STAT = 54;
    static RANK_REQUIRED_STAT = 55;
    static NAME_CHOSEN_STAT = 56;
    static CURR_FAME_STAT = 57;
    static NEXT_CLASS_QUEST_FAME_STAT = 58;
    static LEGENDARY_RANK_STAT = 59;
    static SINK_LEVEL_STAT = 60;
    static ALT_TEXTURE_STAT = 61;
    static GUILD_NAME_STAT = 62;
    static GUILD_RANK_STAT = 63;
    static BREATH_STAT = 64;
    static XP_BOOSTED_STAT = 65;
    static XP_TIMER_STAT = 66;
    static LD_TIMER_STAT = 67;
    static LT_TIMER_STAT = 68;
    static HEALTH_POTION_STACK_STAT = 69;
    static MAGIC_POTION_STACK_STAT = 70;
    static BACKPACK_0_STAT = 71;
    static BACKPACK_1_STAT = 72;
    static BACKPACK_2_STAT = 73;
    static BACKPACK_3_STAT = 74;
    static BACKPACK_4_STAT = 75;
    static BACKPACK_5_STAT = 76;
    static BACKPACK_6_STAT = 77;
    static BACKPACK_7_STAT = 78;
    static HASBACKPACK_STAT = 79;
    static TEXTURE_STAT = 80;
    static PET_INSTANCEID_STAT = 81;
    static PET_NAME_STAT = 82;
    static PET_TYPE_STAT = 83;
    static PET_RARITY_STAT = 84;
    static PET_MAXABILITYPOWER_STAT = 85;
    static PET_FAMILY_STAT = 86;
    static PET_FIRSTABILITY_POINT_STAT = 87;
    static PET_SECONDABILITY_POINT_STAT = 88;
    static PET_THIRDABILITY_POINT_STAT = 89;
    static PET_FIRSTABILITY_POWER_STAT = 90;
    static PET_SECONDABILITY_POWER_STAT = 91;
    static PET_THIRDABILITY_POWER_STAT = 92;
    static PET_FIRSTABILITY_TYPE_STAT = 93;
    static PET_SECONDABILITY_TYPE_STAT = 94;
    static PET_THIRDABILITY_TYPE_STAT = 95;
    static NEW_CON_STAT = 96;
    static FORTUNE_TOKEN_STAT = 97;

    statType = 0;
    statValue: number;
    stringStatValue: string;

    public read(packet: Packet): void {
        this.statType = packet.readUnsignedByte();
        if (this.isStringStat()) {
            this.stringStatValue = packet.readString();
        } else {
            this.statValue = packet.readInt32();
        }
    }

    public write(packet: Packet): void {
        packet.writeByte(this.statType);
        if (this.isStringStat()) {
            packet.writeString(this.stringStatValue);
        } else {
            packet.writeInt32(this.statValue);
        }
    }

    private isStringStat(): boolean {
        switch (this.statType) {
            case StatData.NAME_STAT:
            case StatData.GUILD_NAME_STAT:
            case StatData.PET_NAME_STAT:
            case StatData.ACCOUNT_ID_STAT:
            case StatData.OWNER_ACCOUNT_ID_STAT:
                return true;
            default:
                return false;
        }
    }
}
