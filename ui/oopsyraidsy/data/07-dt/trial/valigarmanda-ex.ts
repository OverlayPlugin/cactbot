import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export type Data = OopsyData;

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.WorqorLarDorExtreme,
  damageWarn: {
    // initial phase & ubiquitouos
    'ValigarmandaEx Spikecicle 1': '8FF5', // curved cleave
    'ValigarmandaEx Spikecicle 2': '8FF6', // curved cleave
    'ValigarmandaEx Spikecicle 3': '8FF7', // curved cleave
    'ValigarmandaEx Spikecicle 4': '8FF8', // curved cleave
    'ValigarmandaEx Spikecicle 5': '8FF9', // curved cleave
    'ValigarmandaEx Ice Boulder Sphere Shatter': '995D', // ice boulder aoe
    'ValigarmandaEx Susurrant Breath': '8FC8', // conal
    'ValigarmandaEx Slithering Strike': '8FCC', // point-blank AOE
    'ValigarmandaEx Strangling Coil': '8FD0', // donut
    'ValigarmandaEx Scourge of Thunder': '8FEA', // lightning spreads
    // fire + adds mini-phase
    'ValigarmandaEx Volcanic Drop Big': '8FE6', // half-room lava puddle
    'ValigarmandaEx Volcanic Drop Puddle': '8FE4', // small lava puddle
    'ValigarmandaEx Mountain Fire Cleave': '901A', // all but a small safe wedge
    // storm phase
    'ValigarmandaEx Blighted Bolt': '8FE1', // exploding feather
    'ValigarmandaEx Crackling Cataclysm': '8FC1', // baited AOE puddles
    'ValigarmandaEx Arcane Sphere Arcane Lightning': '985A', // line cleaves from spheres
    // ice phase
    'ValigarmandaEx Northern Cross 1': '8FDB', // avalanche, cleaves NE half
    'ValigarmandaEx Northern Cross 2': '8FDC', // avalanche, cleaves SW half
    'ValigarmandaEx Chilling Caataclysm': '8FC3', // line cleaves from spheres
  },
  gainsEffectWarn: {
    // storm phase
    // 8FE3 hits everyone, but if you're on a bad tile, you gain D87
    'ValigarmandaEx Thunderous Breath': 'D87', // Paralysis
    // ice phase
    'ValigarmandaEx Deep Freeze': '1036', // Not moving during Freezing Dust
  },
  shareWarn: {
    // fire + adds mini-phase
    'ValigarmandaEx Mountain Fire Tower': '9019', // solo tank tower
    // storm phase
    'ValigarmandaEx Scourge of Thunder (Storm)': '8FE9', // lightning spreads
    // ice phase
    'ValigarmandaEx Scourge of Ice': '8FEC', // tank spreads
    'ValigarmandaEx Ice Talon': '8FFB', // tank buster spreads
  },
  soloWarn: {
    // fire + adds mini-phase
    'ValigarmandaEx Charring Cataclysm': '8FC4', // partner stacks
    'ValigarmandaEx Scourge of Fire': '8FEF', // healer stacks
    'ValigarmandaEx Calamitous Cry': '9005', // healer stacks
    // storm phase
    'ValigarmandaEx Scourge of Fire (Storm)': '8FED', // healer stacks
    // ice phase
    'ValigarmandaEx Scourge of Fire (Ice)': '8FEE', // healer stacks
  },
};

export default triggerSet;
