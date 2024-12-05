import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

// TODO:
//   - Add trigger for missing Maulskull Deep Thunder stacks

export type Data = OopsyData;

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.TheSkydeepCenote,
  damageWarn: {
    // ** Adds, Pre-boss 1 ** //
    'SkydeepCenote Horror Water III': '9700', // circle aoe
    'SkydeepCenote Arrowhead Critical Bite': '9695', // conal aoe
    'SkydeepCenote Specter Surrounding Burst': '9696', // circle aoe

    // ** Feather Ray ** //
    'SkydeepCenote Feather Ray Worrisome Wave Boss': '8F78', // conal from boss
    'SkydeepCenote Feather Ray Worrisome Wave Player': '8F79', // conal from player
    'SkydeepCenote Feather Ray Hydro Ring': '8F7D', // donut, arena walls
    'SkydeepCenote Feather Ray Burst': '8F82', // Rolling Current bubble
    'SkydeepCenote Feather Ray Pop': '8F7E', // floating bubble pop

    // ** Adds, Pre-boss 2 ** //
    'SkydeepCenote Living Rock Hard Head': '9698', // conal aoe
    'SkydeepCenote Quarrier Spellsword': '9694', // conal aoe
    'SkydeepCenote Vessel Turali Thunder II': '9942', // circle aoe

    // ** Firearms ** //
    'SkydeepCenote Firearms Thunderlight Burst 1': '96B5', // mirror/orb cleave
    'SkydeepCenote Firearms Thunderlight Burst 2': '96B6', // mirror/orb cleave
    'SkydeepCenote Firearms Thunderlight Burst 3': '96B7', // mirror/orb cleave
    'SkydeepCenote Firearms Thunderlight Burst 4': '96B8', // mirror/orb cleave
    'SkydeepCenote Firearms Thunderlight Burst Orb': '8E5D', // exploding orb
    'SkydeepCenote Firearms Artillery 1': '9704', // exploding tile
    'SkydeepCenote Firearms Artillery 2': '9705', // exploding tile
    'SkydeepCenote Firearms Artillery 3': '9706', // exploding tile
    'SkydeepCenote Firearms Artillery 4': '9707', // exploding tile

    // ** Adds, Pre-boss 3 ** //
    'SkydeepCenote Packer Thunderbreak': '9693', // circle aoe

    // ** Maulskull ** //
    'SkydeepCenote Maulskull Stonecarver Initial 1': '8F3E', // half-arena cleave
    'SkydeepCenote Maulskull Stonecarver Initial 2': '8F3F', // half-arena cleave
    'SkydeepCenote Maulskull Skullcrush': '8F44', // puddle AoE (source of knockback)
    'SkydeepCenote Maulskull Landing': '8F4B', // circle AoEs
    'SkydeepCenote Maulskull Shatter Middle': '8F4C', // middle cleave
    'SkydeepCenote Maulskull Shatter Sides 1': '8F4D', // side (angled) cleave
    'SkydeepCenote Maulskull Shatter Sides 2': '8F4E', // side (angled) cleave
  },
  shareWarn: {
    'SkydeepCenote Firearms Thunderlight Flurry': '8E62', // spread aoes
    'SkydeepCenote Maulskull Destructive Heat': '8F65', // spread aoes
    'SkydeepCenote Maulskull Wrought Fire': '98D2', // tankbuster aoe
  },
};

export default triggerSet;
