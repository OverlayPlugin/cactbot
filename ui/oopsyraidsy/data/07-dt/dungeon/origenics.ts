import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

// TODO:
//   - Add trigger for missing Herpekaris's Collective Agony (stack)

export type Data = OopsyData;

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.Origenics,
  damageWarn: {
    // ** Adds, Pre-boss 1 ** //
    'Origenics Eyeclops Glower': '95B4', // line cleave

    // ** Herpekaris ** //
    'Origenics Herpekaris Poison Heart Drop': '8E6C', // two puddles drop
    'Origenics Herpekaris Pod Burst 1': '9676', // initial puddles
    'Origenics Herpekaris Pod Burst 2': '9677', // subsequent puddles
    'Origenics Herpekaris Right Sweep': '8E75', // right + front cleave
    'Origenics Herpekaris Left Sweep': '8E76', // left + front cleave
    'Origenics Herpekaris Rear Sweep': '8E77', // rear cleave

    // ** Adds, Pre-boss 2 ** //
    'Origenics Sentry S10 Warning Spike': '8A62', // circle
    'Origenics Turret Diffractive Laser': '95BA', // conal
    'Origenics Aerostat Incendiary Circle': '95B8', // donut
    'Origenics Sentry G10 Grenado Shot': '8A64', // circle

    // ** Deceiver ** //
    'Origenics Deceiver Bionic Thrash': '8E12', // intercard cleaves
    'Origenics Deceiver Synchroshot': '8E14', // android line cleave (8E15 is fake cleave = good)
    'Origenics Deceiver Laser Lash': '8E0E', // side turret cleave

    // ** Adds, Pre-boss 3 ** //
    'Origenics Eyeborg Hypercharged Glower': '95B6', // line cleave
    'Origenics Eyeborg 100-tonze Swing': '95B7', // circle
    'Origenics Automatoise Hard Stomp': '98ED', // MASSIVE circle

    // ** Ambrose the Undeparted ** //
    'Origenics Ambrose Overwhelming Charge 1': '9941', // frontal cleave
    'Origenics Ambrose Overwhelming Charge 2': '98A0', // frontal cleave
    'Origenics Ambrose Psychokinesis': '8E4C', // line cleave from cage
    'Origenics Ambrose Rush': '982A', // lance zig-zag
  },
  gainsEffectWarn: {
    'Origenics Electrocution': 'C01', // knocked into 'death' wall (Deceiver or Ambrose)
  },
  shareWarn: {
    'Origenics Herpekaris Poison Heart Spread': '9421', // spreads
    'Origenics Deceiver Electray': '95B0', // spreads
    'Origenics Ambrose Whorl of the Mind': '8E56', // spreads
  },
};

export default triggerSet;
