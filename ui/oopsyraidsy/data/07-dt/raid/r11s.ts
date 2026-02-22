import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export type Data = OopsyData;

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.AacHeavyweightM3Savage,
  damageWarn: {
    'R11S Assault Evolved Axe Chariot': 'B418',
    'R11S Assault Evolved Scythe Donut': 'B419',
    'R11S Assault Evolved Sword Cross AoE': 'B41A',
    'R11S Cometite': 'B413',
    'R11S Dance of Domination Explosion': 'B420', // White line AoE
    'R11S Great Wall of Fire Explosion': 'B42E', // Great Wall of Fire follow-up
    'R11S Fire and Fury 1': 'B430',
    'R11S Fire and Fury 2': 'B431',
    'R11S Orbital Omen': 'B433',
    'R11S Comet Explosion': 'B438',
    'R11S Shockwave': 'B43D', // Triple Tyrannhilation damage
    'R11S Majestic Meteor 1': 'B441',
    'R11S Majestic Meteor 2': 'B455', // Majestic Meteor during Ecliptic Stampede
    'R11S Majestic Meteorain': 'B442',
    'R11S Arcadion Avalanche 1': 'B44B',
    'R11S Arcadion Avalanche 2': 'B44D',
    'R11S Arcadion Avalanche 3': 'B44F',
    'R11S Arcadion Avalanche 4': 'B451',
  },
  shareWarn: {
    'R11S Impact': 'B40C', // Raw Steel Trophy axe spread
    'R11S Sweeping Victory': 'B41C', // Assault Evolved scythe protean
    'R11S Comet': 'B414',
    'R11S Powerful Gust': 'B427',
    'R11S Majestic Meteowrath 1': 'B443',
    'R11S Majestic Meteowrath 2': 'B459', // Majestic Meteowrath during Ecliptic Stampede
    'R11S Fire Breath': 'B447',
    'R11S Atomic Impact': 'B454',
    'R11S Cosmic Kiss': 'B456', // Solo tower during Ecliptic Stampede
  },
  shareFail: {
    'R11S Raw Steel Scythe': 'B40F', // Raw Steel scythe tankbuster
  },
  soloWarn: {
    'R11S Knockback Tower Explosion': 'B444',
    'R11S Weighty Impact': 'B457', // Duo tower during Ecliptic Stampede
  },
};

export default triggerSet;
