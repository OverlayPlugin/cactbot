import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export type Data = OopsyData;

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.Alexandria,
  damageWarn: {
    'Alexandria Protocol E1 Homing Shot': '979A', // Circle AoE
    'Alexandria Protocol B9 Siphon': '9AFB', // Conal AoE
    'Alexandria Protocol B9 Trunk Smash': '9AFC', // Conal AoE

    // Boss 1
    'Alexandria AntivirusX Immune Response Front': '8E1B', // Frontal cone
    'Alexandria AntivirusX Immune Response Sides': '8E1D', // 270 degree rear cleave
    'Alexandria InterferonR Pathocircuit Purge': '8E1E', // Donut AoE
    'Alexandria InterferonC Pathocross Purge': '8E1F', // Cross AoE

    'Alexandria Protocol B3 Water II': '9AFD', // Circle AoE
    'Alexandria Protocol B8 Laserblade': '9B53', // 270 degree giant frontal cleave
    'Alexandria Electric Charge Lightning Bolt': '8F6B', // Environmental circle AoE
    'Alexandria Protocol B3 Water III': '9AFE', // Large circle AoE
    'Alexandria Protocol F1 Spinning Attack': '979B', // Line AoE

    // Boss 2
    'Alexandria Amalgam Supercell Matrix Triangle': '98E0', // Triangular half-arena cleave
    'Alexandria Amalgam Centralized Current': '8DE7', // Line AoE through hitbox
    'Alexandria Amalgam Split Current 1': '8DEA', // Twin line AoE outside hitbox
    'Alexandria Amalgam Split Current 2': '8DEB', // Twin line AoE outside hitbox
    'Alexandria Amalgam Supercell Matrix Lasers': '98E2', // Multiple wall lasers
    'Alexandria Amalgam Voltburst': '8DF0', // Baited circle AoEs
    'Alexandria Ternary Charge Inner': '9956', // Inner radiating circle AoE
    'Alexandria Ternary Charge Outer': '9957', // Middle radiating circle AoE
    'Alexandria Ternary Charge Corners': '9958', // Corner radiating circle AoE

    'Alexandria Protocol B2 Bellowing Grunt': '9B54', // Circle AoE
    'Alexandria Protocol S3 Piercing Joust': '979C', // Circle AoE
    'Alexandria Protocol S5 Thunderlance': '979D', // Line AoE

    // Boss 3
    'Alexandria Eliminator Partition Right Initial': '985F', // Half-arena cleave, right side
    'Alexandria Eliminator Partition Right Final': '9946', // Half-arena cleave, right side
    'Alexandria Eliminator Partition Left': '9951', // Half-arena cleave, left side
    'Alexandria Eliminator Terminate': '9ABF', // Hand laser. (The hand's ability is visual only)
    'Alexandria Eliminator Halo Of Destruction': '9AC0', // Dynamo AoE. (The Elembit's ability alongside is visual only)
    'Alexandria Eliminator Elimination Explosion': '9947', // Exploding criscross lasers
  },
  damageFail: {
    'Alexandria Eliminator Compression': '8FB9', // Inside blue knockback AoE, boss 3
  },
  gainsEffectWarn: {
    'Alexandria Eliminator Electrocution': 'C01', // Wall touch, boss 3
  },
  shareWarn: {
    'Alexandria AntivirusX Disinfection': '8E21', // Tank cleave, boss 1
    'Alexandria Amalgam Static Spark': '8DEE', // Spread circles, boss 2
    'Alexandria Eliminator Electray': '994B', // Spread circles, boss 3
    'Alexandria Eliminator Light Of Salvation': '8FB0', // Spread lasers, boss 3
  },
  soloWarn: {
    'Alexandria AntivirusX Quarantine': '8E22', // Stack marker, boss 1
    'Alexandria Amalgam Superbolt': '8DED', // Stack marker, boss 2
    'Alexandria Eliminator Overexposure': '8FAC', // Stack laser, boss 3
    'Alexandria Eliminator Light Of Devotion': '8FB3', // Stack laser, boss 3 (intermission only)(???)
  },
};

export default triggerSet;
