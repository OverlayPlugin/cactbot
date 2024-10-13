import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import {
  DirectionOutput8,
  DirectionOutputIntercard,
  Directions,
} from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  fluffleUpCount: number;
  ryoqorAddCleaveDir: { [combatantId: string]: DirectionOutputIntercard };
  ryoqorAddTether: string[];
  ryoqorFollowupSafeDirs: DirectionOutput8[];
  seenCrystallineStorm: boolean;
  seenFirstWaterTile: boolean;
  seenFirstFireTile: boolean;
}

const ryoqorCenter = { x: -108, y: 119 };

const getFacingDir = (pos: number, hdg: number): DirectionOutputIntercard => {
  let facing: DirectionOutputIntercard = 'unknown';
  if (!(pos >= 0 && pos <= 3) || !(hdg >= 0 && hdg <= 3))
    return facing;

  // we can shortcut this, since pos + hdg =1 means NE & =5 means SW
  if (pos + hdg === 1)
    facing = 'dirNE';
  else if (pos + hdg === 5)
    facing = 'dirSW';
  else if (pos + hdg === 3) {
    if (pos === 1 || pos === 2)
      facing = 'dirSE';
    else if (pos === 0 || pos === 3)
      facing = 'dirNW';
  }
  return facing;
};

const coldFeatOutputStrings = {
  start: {
    en: 'Start ${dir}',
    fr: 'Début ${dir}',
    cn: '从 ${dir} 开始',
  },
  followup: {
    en: 'Go ${dir}',
    fr: 'Allez ${dir}',
    cn: '去 ${dir}',
  },
  avoidStart: {
    en: 'Avoid cleaves from untethered adds',
    fr: 'Évitez les cleaves des adds non-liés',
    cn: '躲避未连线的小怪攻击',
  },
  avoidFollowup: {
    en: 'Avoid cleaves from remaining adds',
    fr: 'Évitez les cleaves des adds restants',
    cn: '躲避剩余小怪攻击',
  },
  or: Outputs.or,
  ...Directions.outputStrings8Dir,
};

const triggerSet: TriggerSet<Data> = {
  id: 'Worqor Zormor',
  zoneId: ZoneId.WorqorZormor,
  timelineFile: 'worqor-zormor.txt',
  initData: () => ({
    fluffleUpCount: 0,
    ryoqorAddCleaveDir: {},
    ryoqorAddTether: [],
    ryoqorFollowupSafeDirs: [],
    seenCrystallineStorm: false,
    seenFirstWaterTile: false,
    seenFirstFireTile: false,
  }),
  triggers: [
    // ** Ryoqor Terteh ** //
    {
      id: 'WorqorZormor Ryoqor Frosting Fracas',
      type: 'StartsUsing',
      netRegex: { id: '8DB8', source: 'Ryoqor Terteh', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'WorqorZormor Ryoqor Fluffle Up Counter',
      type: 'StartsUsing',
      netRegex: { id: '8DA9', source: 'Ryoqor Terteh', capture: false },
      run: (data) => data.fluffleUpCount++,
    },
    {
      // small cardinal adds with quarter-arena cleaves
      id: 'WorqorZormor Ryoqor Ice Scream Collect',
      type: 'StartsUsing',
      netRegex: { id: '8DAE', source: 'Rorrloh Teh' },
      run: (data, matches) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const pos = Directions.xyTo4DirNum(x, y, ryoqorCenter.x, ryoqorCenter.y);
        const hdg = Directions.hdgTo4DirNum(parseFloat(matches.heading));

        const facingDir = getFacingDir(pos, hdg);
        data.ryoqorAddCleaveDir[matches.sourceId] = facingDir;
      },
    },
    {
      // large intercard adds with circle aoe cleaves
      id: 'WorqorZormor Ryoqor Frozen Swirl Collect',
      type: 'StartsUsing',
      netRegex: { id: '8DAF', source: 'Qorrloh Teh' },
      run: (data, matches) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const pos = Directions.xyToIntercardDirOutput(x, y, ryoqorCenter.x, ryoqorCenter.y);
        data.ryoqorAddCleaveDir[matches.sourceId] = pos;
      },
    },
    {
      // tethers to indicate adds with delayed resolution
      id: 'WorqorZormor Cold Feat Tether Collect',
      type: 'Tether',
      netRegex: { id: '0110', target: 'Ryoqor Terteh' },
      run: (data, matches) => data.ryoqorAddTether.push(matches.sourceId),
    },
    {
      id: 'WorqorZormor Ryoqor Cold Feat Initial',
      type: 'StartsUsing',
      netRegex: { id: '8DAA', source: 'Ryoqor Terteh', capture: false },
      durationSeconds: 9.5,
      alertText: (data, _matches, output) => {
        // always at least 2 tethered adds
        const coldAddsIds = data.ryoqorAddTether;
        if (coldAddsIds === undefined || coldAddsIds.length < 2 === undefined)
          return output.avoidStart!();

        const coldDirs = coldAddsIds.map((id) => data.ryoqorAddCleaveDir[id] ?? 'unknown');

        let firstDirs: DirectionOutput8[] = [];
        let secondDirs: DirectionOutput8[] = [];

        if (data.fluffleUpCount === 1) {
          // 2 intercards will be safe first, then the other 2
          firstDirs = [...Directions.outputIntercardDir].filter((d) => coldDirs.includes(d));
          secondDirs = [...Directions.outputIntercardDir].filter((d) => !coldDirs.includes(d));
          if (firstDirs.length !== 2 || secondDirs.length !== 2)
            return output.avoidStart!();

          data.ryoqorFollowupSafeDirs = secondDirs;
          const dirStr = firstDirs.map((d) => output[d]!()).join(output.or!());

          return output.start!({ dir: dirStr });
        } else if (data.fluffleUpCount === 2) {
          // the 2 safe intercards will alwayss be either N or S, so we can simplify
          firstDirs = [...Directions.outputIntercardDir].filter((d) => coldDirs.includes(d));
          const north: DirectionOutput8[] = ['dirNE', 'dirNW'];
          const south: DirectionOutput8[] = ['dirSE', 'dirSW'];

          if (north.every((d) => firstDirs.includes(d))) {
            data.ryoqorFollowupSafeDirs = ['dirS'];
            const dirStr = output['dirN']!();
            return output.start!({ dir: dirStr });
          } else if (south.every((d) => firstDirs.includes(d))) {
            data.ryoqorFollowupSafeDirs = ['dirN'];
            const dirStr = output['dirS']!();
            return output.start!({ dir: dirStr });
          }

          return output.avoidStart!();
        } else if (data.fluffleUpCount > 2) {
          // From this point on (loop), both types of adds are present,
          // so safe spots will always be 1 intercard => 1 adjacent intercard.
          // We can't just rely on the tethered add intercards as safe because
          // an unsafe add will cleave one of them.  Instead, we need to map
          // out all the unsafe intercards, then find the remaining safe one.
          const firstUnsafeDirs = [
            ...new Set( // to remove duplicates
              Object.keys(data.ryoqorAddCleaveDir)
                .filter((id) => !coldAddsIds.includes(id))
                .map((id) => data.ryoqorAddCleaveDir[id])
                .filter((dir): dir is DirectionOutputIntercard => dir !== undefined),
            ),
          ];
          const firstSafeDirs = [...Directions.outputIntercardDir].filter((d) =>
            !firstUnsafeDirs.includes(d)
          );

          if (firstSafeDirs.length !== 1)
            return output.avoidStart!();

          const secondUnsafeDirs = [
            ...new Set( // to remove duplicates
              Object.keys(data.ryoqorAddCleaveDir)
                .filter((id) => coldAddsIds.includes(id))
                .map((id) => data.ryoqorAddCleaveDir[id])
                .filter((dir): dir is DirectionOutputIntercard => dir !== undefined),
            ),
          ];
          const secondSafeDirs = [...Directions.outputIntercardDir].filter((d) =>
            !secondUnsafeDirs.includes(d)
          );

          if (secondSafeDirs.length === 1)
            data.ryoqorFollowupSafeDirs = secondSafeDirs;

          return output.start!({ dir: output[firstSafeDirs[0] ?? 'unknown']!() });
        }
        return output.avoidStart!();
      },
      outputStrings: coldFeatOutputStrings,
    },
    {
      id: 'WorqorZormor Ryoqor Cold Feat Followup',
      type: 'StartsUsing',
      netRegex: { id: '8DAA', source: 'Ryoqor Terteh', capture: false },
      delaySeconds: 9.5,
      infoText: (data, _matches, output) => {
        if (data.ryoqorFollowupSafeDirs.length === 0)
          return output.avoidFollowup!();

        const dirStr = data.ryoqorFollowupSafeDirs.map((d) => output[d]!()).join(output.or!());
        return output.followup!({ dir: dirStr });
      },
      run: (data) => {
        data.ryoqorAddCleaveDir = {};
        data.ryoqorAddTether = [];
        data.ryoqorFollowupSafeDirs = [];
      },
      outputStrings: coldFeatOutputStrings,
    },
    {
      id: 'WorqorZormor Ryoqor Sparkling Sprinkling',
      type: 'StartsUsing',
      netRegex: { id: '8F69', source: 'Ryoqor Terteh', capture: false },
      durationSeconds: 8,
      infoText: (_data, _matches, output) => output.avoidAndSpread!(),
      outputStrings: {
        avoidAndSpread: {
          en: 'Avoid lines => Spread after',
          fr: 'Évitez les lignes => Dispersion ensuite',
          cn: '躲避直线 => 然后散开',
        },
      },
    },

    // ** Kahderyor ** //
    {
      id: 'WorqorZormor Kahderyor Wind Unbound',
      type: 'StartsUsing',
      netRegex: { id: '8DBA', source: 'Kahderyor', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'WorqorZormor Kahderyor Crystalline Storm',
      type: 'StartsUsing',
      netRegex: { id: '8DBE', source: 'Kahderyor', capture: false },
      run: (data) => data.seenCrystallineStorm = true,
    },
    {
      id: 'WorqorZormor Kahderyor Wind Shot',
      type: 'StartsUsing',
      netRegex: { id: '8DBC', source: 'Kahderyor', capture: false },
      infoText: (data, _matches, output) => {
        if (data.seenCrystallineStorm)
          return output.stackInLines!();
        return output.stackInHole!();
      },
      outputStrings: {
        stackInHole: {
          en: 'Stack donuts in hole',
          fr: 'Pack donuts dans le trou',
          cn: '在安全环内重叠月环',
        },
        stackInLines: {
          en: 'Stack donuts in safe lines',
          fr: 'Pack donuts dans les lignes sûres',
          cn: '在安全直线内重叠月环',
        },
      },
    },
    {
      id: 'WorqorZormor Kahderyor Earthen Shot',
      type: 'StartsUsing',
      netRegex: { id: '8DBB', source: 'Kahderyor', capture: false },
      infoText: (data, _matches, output) => {
        if (data.seenCrystallineStorm)
          return output.spreadFromLines!();
        return output.spreadFromHole!();
      },
      outputStrings: {
        spreadFromHole: {
          en: 'Spread + Away from puddle',
          fr: 'Dispersion + Loin des flaques',
          cn: '分散 + 远离圈圈',
        },
        spreadFromLines: {
          en: 'Spread + Away from lines',
          fr: 'Dispersion + Loin des lignes',
          cn: '分散 + 远离直线',
        },
      },
    },
    {
      id: 'WorqorZormor Kahderyor Eye of the Fierce',
      type: 'StartsUsing',
      // 8DC5 - Stalagmite Circle
      // 8DC6 - Cyclonic Ring
      netRegex: { id: ['8DC5', '8DC6'], source: 'Kahderyor' },
      alertText: (_data, matches, output) => {
        const inOut = matches.id === '8DC5' ? output.out!() : output.in!();
        return output.combo!({ inOut: inOut, lookAway: output.lookAway!() });
      },
      outputStrings: {
        combo: {
          en: '${inOut} + ${lookAway}',
          fr: '${inOut} + ${lookAway}',
          cn: '${inOut} + ${lookAway}',
        },
        in: Outputs.in,
        out: Outputs.out,
        lookAway: Outputs.lookAway,
      },
    },
    {
      id: 'WorqorZormor Kahderyor Seed Crystals',
      type: 'StartsUsing',
      netRegex: { id: '8DC3', source: 'Kahderyor', capture: false },
      durationSeconds: 7,
      infoText: (_data, _matches, output) => output.spreadBreak!(),
      outputStrings: {
        spreadBreak: {
          en: 'Spread => Break crystals',
          fr: 'Dispersion => Cassez les cristaux',
          cn: '分散 => 击碎水晶',
        },
      },
    },

    // ** Gurfurlur ** //
    {
      id: 'WorqorZormor Gurfurlur Heaving Haymaker',
      type: 'StartsUsing',
      netRegex: { id: '8DAD', source: 'Gurfurlur', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'WorqorZormor Gurfurlur Enduring Glory',
      type: 'StartsUsing',
      netRegex: { id: '8DE0', source: 'Gurfurlur', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'WorqorZormor Gurfurlur Sledgehammer',
      type: 'StartsUsing',
      netRegex: { id: '8DD9', source: 'Gurfurlur', capture: false },
      durationSeconds: 6,
      infoText: (_data, _matches, output) => output.stack!(),
      outputStrings: {
        stack: {
          en: 'Stack (3 hits)',
          fr: 'Pack (3 coups)',
          cn: '集合 (3次)',
        },
      },
    },
    {
      id: 'WorqorZormor Arcane Stomp',
      type: 'Ability',
      netRegex: { id: '8DDF', source: 'Gurfurlur', capture: false },
      durationSeconds: 20,
      infoText: (_data, _matches, output) => output.absorb!(),
      outputStrings: {
        absorb: {
          en: 'Absorb all orbs',
          fr: 'Absorbez tous les orbes',
          cn: '吃所有球',
        },
      },
    },
    // flags: '00020001'
    // location: '1A' (fire - east), '1B' (water - west), '1D' (wind - center)
    {
      id: 'WorqorZormor Gurfurlur First Water Tile',
      type: 'MapEffect',
      // Water tile west (does not seem to be a water tile east possible in the first phase?)
      netRegex: { flags: '00020001', location: '1B', capture: false },
      condition: (data) => !data.seenFirstWaterTile,
      delaySeconds: 2,
      durationSeconds: 7,
      alertText: (_data, _matches, output) => output.kb!(),
      run: (data) => data.seenFirstWaterTile = true,
      outputStrings: {
        kb: {
          en: 'Knockback (from West)',
          fr: 'Poussée (depuis l\'ouest)',
          cn: '击退 (从左西边)',
        },
      },
    },
    {
      id: 'WorqorZormor Gurfurlur First Fire Tile',
      type: 'MapEffect',
      // Fire tile east (does not seem to be a fire tile west possible in the first phase?)
      netRegex: { flags: '00020001', location: '1A', capture: false },
      condition: (data) => !data.seenFirstFireTile,
      delaySeconds: 2,
      durationSeconds: 9,
      alertText: (_data, _matches, output) => output.dodgeSpread!(),
      run: (data) => data.seenFirstFireTile = true,
      outputStrings: {
        dodgeSpread: {
          en: 'Dodge toward fire crystal => Spread',
          fr: 'Esquivez vers le cristal de feu => Dispersion',
          cn: '向火石板移动躲避扩散攻击 => 分散',
        },
      },
    },
    {
      id: 'WorqorZormor Gurfurlur Fire/Water Combo',
      type: 'MapEffect',
      // 1A + 1B are same as original config (fire east + water west)
      // 19 + 1C mean swapped (water east + fire west - but not sure which is which)
      // These are always sent in these pairs; we only need to capture one.
      netRegex: { flags: '00020001', location: ['19', '1A'] },
      condition: (data) => data.seenFirstWaterTile && data.seenFirstFireTile,
      durationSeconds: 9,
      alertText: (_data, matches, output) => {
        return matches.location === '19' ? output.kbEast!() : output.kbWest!();
      },
      outputStrings: {
        kbEast: {
          en: 'Knockback (from East) to Fire crystal => Spread',
          fr: 'Poussée (depuis l\'est) vers le cristal de feu => Dispersion',
          cn: '从右东边 击退 到火石板 => 分散',
        },
        kbWest: {
          en: 'Knockback (from West) to Fire crystal => Spread',
          fr: 'Poussée (depuis l\'ouest) vers le cristal de feu => Dispersion',
          cn: '从左西边 击退 到火石板 => 分散',
        },
      },
    },
    {
      id: 'WorqorZormor Gurfurlur Wind Tile Initial',
      type: 'MapEffect',
      netRegex: { flags: '00020001', location: '1D', capture: false },
      delaySeconds: 4,
      infoText: (_data, _matches, output) => output.kbAoe!(),
      outputStrings: {
        kbAoe: {
          en: 'Knockback + AoE',
          fr: 'Poussée + AoE',
          cn: '击退 + AOE',
        },
      },
    },
    {
      id: 'WorqorZormor Gurfurlur Wind Tile Followup',
      type: 'MapEffect',
      netRegex: { flags: '00020001', location: '1D', capture: false },
      delaySeconds: 20.4,
      infoText: (_data, _matches, output) => output.kbAoe2!(),
      outputStrings: {
        kbAoe2: {
          en: 'Knockback + AoE (avoid tornadoes)',
          fr: 'Poussée + AoE (évitez les tornades)',
          cn: '击退 + AOE (躲避龙卷风)',
        },
      },
    },
  ],
  timelineReplace: [],
};

export default triggerSet;
