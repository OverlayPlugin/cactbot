import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export type Data = OopsyData;

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.WorqorLarDor,
  damageWarn: {
    // initial phase & ubiquitouos
    'Valigarmanda Susurrant Breath': '8D3C', // large conal
    'Valigarmanda Slithering Strike': '8D3E', // large point-blank circle
    'Valigarmanda Strangling Coil': '8D40', // large donut AoE
    'Valigarmanda Eruption': '8D5F', // baited AoE puddles
    // storm phase
    'Valigarmanda Thunderous Breath': '8D50', // conal; not on elevated tile
    'Valigarmanda Blighted Bolt (personal)': '8D4D', // puddle on you; not on ground tile
    'Valigarmanda Blighted Bolt (feather)': '8D4E', // hit by feather circle AoE
    'Valigarmanda Arcane Lightning': '9859', // line cleaves from spheres
    'Valigarmanda Ruinfall (puddle)': '98D9', // circle AoEs at back of arena
    // ice phase
    'Valigarmanda Northern Cross (NE)': '8D48', // avalanche, cleaves NE half
    'Valigarmanda Northern Cross (SW)': '8D49', // avalanche, cleaves SW half
    'Valigarmanda Chilling Cataclysm': '9961', // line cleaves from spheres
    // adds phase
    'Valigarmanda Calamitous Echo': '8D63', // telegraphed conal AoEs from boss
  },
  gainsEffectWarn: {
    // ice phase
    'Valigarmanda Deep Freeze': '1036', // Not moving during Freezing Dust
  },
  shareWarn: {
    // initial phase & ubiquitouos
    'Valigarmanda Ice Talon': '8D59', // tank buster AoEs
  },
  soloWarn: {
    // adds phase
    'Valigarmanda Calamitous Cry': '8D62', // shared line cleave
  },
};

export default triggerSet;
