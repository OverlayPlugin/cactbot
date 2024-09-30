import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export type Data = OopsyData;

// TODO: Add trigger for missed Kahderyor Crystalline Crush (stack)
// TODO: Figure out ground indicator damage for Wind Shot/Earthen Shot

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.WorqorZormor,
  damageWarn: {
    // ** Adds Pre-Boss 1 ** //
    'WorqorZormor Snowarbler Clasp': '94A0', // conal aoe
    'WorqorZormor Biast Levinshower': '767B', // conal aoe
    'WorqorZormor Anala Ring of Fire': '8E34', // circle aoe
    'WorqorZormor Myrrlith Orogenic Storm': '94A9', // circle aoe

    // ** Ryoqor Terteh ** //
    'WorqorZormor Ryoqor Ice Scream': '8DAE', // quarter-arena cleaves
    'WorqorZormor Ryoqor Frozen Swirl': '8DB0', // circle aoe cleaves
    'WorqorZormor Ryoqor Snowball': '8DB6', // line cleave

    // ** Adds Pre-Boss 2 ** //
    'WorqorZormor Sloth Snowdust Sweep': '94AA', // conal aoe
    'WorqorZormor Sloth Sweeping Gouge': '94AB', // conal aoe

    // ** Kahderyor ** //
    'WorqorZormor Kahderyor Wind Shot': '8DC8', // player-targeted donut aoes
    'WorqorZormor Kahderyor Crystalline Storm': '8DC2', // lines on ground
    'WorqorZormor Kahderyor Stalagmite Circle': '8DC5', // inner puddle aoe during gaze mech
    'WorqorZormor Kahderyor Cyclonic Ring': '8DC6', // outer donut aoe during gaze mech

    // ** Adds Pre-Boss 3 ** //

    // ** Gurfurlur ** //

  },
  gainsEffectWarn: {
    'WorqorZormor Kahderyor Confused': '0B', // getting hit by gaze mech
  },
  shareWarn: {
    'WorqorZormor Ryoqor Sparkling Sprinkling': '8DB9', // spreads
    'WorqorZormor Kahderyor Earthen Shot': '8DC7', // spreads
  },
};

export default triggerSet;
