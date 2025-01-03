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
    de: 'Starte ${dir}',
    fr: 'Début ${dir}',
    cn: '从 ${dir} 开始',
    ko: '${dir}쪽 시작',
  },
  followup: {
    en: 'Go ${dir}',
    de: 'Geh nach ${dir}',
    fr: 'Allez ${dir}',
    cn: '去 ${dir}',
    ko: '${dir}쪽 으로',
  },
  avoidStart: {
    en: 'Avoid cleaves from untethered adds',
    de: 'Weiche den Cleaves der nicht verbundenen Gegner aus',
    fr: 'Évitez les cleaves des adds non-liés',
    cn: '躲避未连线的小怪攻击',
    ko: '연결 안 된 쫄 장판 피하기',
  },
  avoidFollowup: {
    en: 'Avoid cleaves from remaining adds',
    de: 'Weiche den Cleaves der übrigen Gegner aus',
    fr: 'Évitez les cleaves des adds restants',
    cn: '躲避剩余小怪攻击',
    ko: '남아있는 쫄 장판 피하기',
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
          de: 'Weiche Linien aus => danach verteilen',
          fr: 'Évitez les lignes => Dispersion ensuite',
          cn: '躲避直线 => 然后散开',
          ko: '직선 장판 피하기 => 이후 산개',
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
          de: 'Sammle Donuts im Loch',
          fr: 'Pack donuts dans le trou',
          cn: '在安全环内重叠月环',
          ko: '안전지대에서 도넛 겹치기',
        },
        stackInLines: {
          en: 'Stack donuts in safe lines',
          de: 'Sammle Donuts in einer sicheren Linie',
          fr: 'Pack donuts dans les lignes sûres',
          cn: '在安全直线内重叠月环',
          ko: '선 위에서 도넛 겹치기',
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
          de: 'Verteilen + Weg von den Flächen',
          fr: 'Dispersion + Loin des flaques',
          cn: '分散 + 远离圈圈',
          ko: '산개 + 장판 피하기',
        },
        spreadFromLines: {
          en: 'Spread + Away from lines',
          de: 'Verteilen + Weg von den Linien',
          fr: 'Dispersion + Loin des lignes',
          cn: '分散 + 远离直线',
          ko: '산개 + 직선 장판 피하기',
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
          de: '${inOut} + ${lookAway}',
          fr: '${inOut} + ${lookAway}',
          cn: '${inOut} + ${lookAway}',
          ko: '${inOut} + ${lookAway}',
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
          de: 'Verteilen => Kristall zerstören',
          fr: 'Dispersion => Cassez les cristaux',
          cn: '分散 => 击碎水晶',
          ko: '산개 => 크리스탈 부수기',
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
          de: 'Sammeln (3 Treffer)',
          fr: 'Pack (3 coups)',
          cn: '分摊 (3次)',
          ko: '쉐어 (3번)',
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
          de: 'Absorbiere alle Orbs',
          fr: 'Absorbez tous les orbes',
          cn: '吃所有球',
          ko: '모든 구슬 먹기',
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
          de: 'Rückstoß (vom Westen)',
          fr: 'Poussée (depuis l\'ouest)',
          cn: '击退 (从左边)',
          ko: '넉백 (서쪽에서)',
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
          de: 'Weiche zum Feuerkristall aus => Verteilen',
          fr: 'Esquivez vers le cristal de feu => Dispersion',
          cn: '向火石板移动躲避扩散攻击 => 分散',
          ko: '퍼지는 불 장판 피하기 => 산개',
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
          de: 'Rückstoß (vom Osten) zum ersten Feuerkristall => Verteilen',
          fr: 'Poussée (depuis l\'est) vers le cristal de feu => Dispersion',
          cn: '从右边击退到火石板 => 分散',
          ko: '불 크리스탈로 넉백 (동쪽에서) => 산개',
        },
        kbWest: {
          en: 'Knockback (from West) to Fire crystal => Spread',
          de: 'Rückstoß (vom Westen) zum Feuerkristall => Verteilen',
          fr: 'Poussée (depuis l\'ouest) vers le cristal de feu => Dispersion',
          cn: '从左边击退到火石板 => 分散',
          ko: '불 크리스탈로 넉백 (서쪽에서) => 산개',
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
          de: 'Rückstoß + AoE',
          fr: 'Poussée + AoE',
          cn: '击退 + AOE',
          ko: '넉백 + 전체공격',
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
          de: 'Rückstoß + AoE (Weiche den Tornados aus)',
          fr: 'Poussée + AoE (évitez les tornades)',
          cn: '击退 + AOE (躲避龙卷风)',
          ko: '넉백 + 전체공격 (회오리 피하기)',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Gurfurlur': 'Gurfurlur',
        'Kahderyor': 'Kahderyor',
        'Qorrloh Teh': 'Qorrloh Teh',
        'Rorrloh Teh': 'Rorrloh Teh',
        'Ryoqor Terteh': 'Ryoqor Terteh',
        'Snowball': 'Schneeball',
      },
      'replaceText': {
        'Allfire': 'Große Eruption',
        'Arcane Stomp': 'Antiker Stampfer',
        'Cold Feat': 'Kontakteis',
        'Crystalline Crush': 'Erzzerschmetterung',
        'Crystalline Storm': 'Erzregen',
        'Cyclonic Ring': 'Ringzyklon',
        'Earthen Shot': 'Erdschuss',
        'Enduring Glory': 'Stolz der Yok Huy',
        'Eye of the Fierce': 'Grimmiger Blick',
        'Fluffle Up': 'Rufe Verstärkung',
        'Frosting Fracas': 'Graupelschrei',
        'Frozen Swirl': 'Gefrorener Wirbel',
        'Great Flood': 'Sintflut',
        'Heaving Haymaker': 'Heumacher',
        'Ice Scream': 'Eisiger Schrei',
        'Lithic Impact': 'Einschlag',
        'Seed Crystals': 'Kristallsaat',
        'Sharpened Sights': 'Stechender Scharfblick',
        'Sledgehammer': 'Dreifacher Vorschlaghammer',
        'Snow Boulder': 'Schnellkugel',
        'Snowscoop': 'Forme Schneebälle',
        'Sparkling Sprinkling': 'Rauer Reif',
        'Stalagmite Circle': 'Steinrunde',
        'Stonework': 'Schieferwurf',
        'Volcanic Drop': 'Feuerbergbombe',
        'Wind Shot': 'Windschuss',
        'Wind Unbound': 'Entfesselter Wind',
        'Windswrath': 'Sturmböe',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Gurfurlur': 'Gurfurlur',
        'Kahderyor': 'Kahderyor',
        'Qorrloh Teh': 'qorrloh teh',
        'Rorrloh Teh': 'rorrloh teh',
        'Ryoqor Terteh': 'Ryoqor Terteh',
        'Snowball': 'boule de neige',
      },
      'replaceText': {
        'Allfire': 'Grande éruption',
        'Arcane Stomp': 'Appuis solides',
        'Cold Feat': 'Glacement',
        'Crystalline Crush': 'Écrasement minéral',
        'Crystalline Storm': 'Pluie minérale',
        'Cyclonic Ring': 'Anneau cyclonique',
        'Earthen Shot': 'Géo-tir',
        'Enduring Glory': 'Fierté des Yok Huy',
        'Eye of the Fierce': 'Œil de rapace',
        'Fluffle Up': 'Réunion au sommet',
        'Frosting Fracas': 'Voix des frimas',
        'Frozen Swirl': 'Cercle glacé',
        'Great Flood': 'Grande inondation',
        'Heaving Haymaker': 'Déblayage',
        'Ice Scream': 'Voix des gelées',
        'Lithic Impact': 'Impact de canon',
        'Seed Crystals': 'Piège cristallin',
        'Sharpened Sights': 'Iris perçants',
        'Sledgehammer': 'Triple horion',
        'Snow Boulder': 'Grosse boule de neige',
        'Snowscoop': 'Boules de neige à gogo',
        'Sparkling Sprinkling': 'Chute de givre',
        'Stalagmite Circle': 'Cercle pierreux',
        'Stonework': 'Dallage',
        'Volcanic Drop': 'Obus volcanique',
        'Wind Shot': 'Aéro-tir',
        'Wind Unbound': 'Relâche de vent',
        'Windswrath': 'Grosse tempête',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Gurfurlur': 'グーフールー',
        'Kahderyor': 'カデーヨー',
        'Qorrloh Teh': 'コォーロ・テー',
        'Rorrloh Teh': 'ローロ・テー',
        'Ryoqor Terteh': 'リョコー・テーテ',
        'Snowball': '雪玉',
      },
      'replaceText': {
        'Allfire': '大噴火',
        'Arcane Stomp': '大力足',
        'Cold Feat': '氷結',
        'Crystalline Crush': 'オーアクラッシュ',
        'Crystalline Storm': 'オーアレイン',
        'Cyclonic Ring': 'リングサイクロン',
        'Earthen Shot': 'アースショット',
        'Enduring Glory': 'ヨカフイの誇り',
        'Eye of the Fierce': '猛禽の眼',
        'Fluffle Up': '子分招集',
        'Frosting Fracas': '霧雪の声',
        'Frozen Swirl': '氷輪',
        'Great Flood': '大洪水',
        'Heaving Haymaker': 'ヘイメーカー',
        'Ice Scream': '凍雪の声',
        'Lithic Impact': '着弾',
        'Seed Crystals': '結晶付着',
        'Sharpened Sights': '鋭い眼光',
        'Sledgehammer': 'トリプル・スレッジハンマー',
        'Snow Boulder': '豪雪球',
        'Snowscoop': '雪玉生成',
        'Sparkling Sprinkling': '降霜',
        'Stalagmite Circle': 'ラウンドストーン',
        'Stonework': '石板投擲',
        'Volcanic Drop': '火山弾',
        'Wind Shot': 'ウィンドショット',
        'Wind Unbound': 'ウィンドアンバウンド',
        'Windswrath': '大嵐',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Gurfurlur': '固伏鲁',
        'Kahderyor': '卡德由夜鸟',
        'Qorrloh Teh': '刻洛特雪精',
        'Rorrloh Teh': '洛洛特雪精',
        'Ryoqor Terteh': '辽刻特特雪精',
        'Snowball': '雪球',
      },
      'replaceText': {
        'Allfire': '猛火喷发',
        'Arcane Stomp': '强力脚',
        'Cold Feat': '冻结',
        'Crystalline Crush': '结晶碎击',
        'Crystalline Storm': '结晶雨',
        'Cyclonic Ring': '旋风环',
        'Earthen Shot': '地击',
        'Enduring Glory': '尤卡巨人的荣耀',
        'Eye of the Fierce': '猛禽之眼',
        'Fluffle Up': '召集小弟',
        'Frosting Fracas': '雾雪之声',
        'Frozen Swirl': '冰轮',
        'Great Flood': '大洪水',
        'Heaving Haymaker': '强力震击',
        'Ice Scream': '冻雪之声',
        'Lithic Impact': '轰击',
        'Seed Crystals': '附着结晶',
        'Sharpened Sights': '锐利目光',
        'Sledgehammer': '三重猛击',
        'Snow Boulder': '大雪球',
        'Snowscoop': '生成雪球',
        'Sparkling Sprinkling': '降霜',
        'Stalagmite Circle': '震石圆',
        'Stonework': '投掷石板',
        'Volcanic Drop': '火山弹',
        'Wind Shot': '风击',
        'Wind Unbound': '无拘之风',
        'Windswrath': '狂风呼啸',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Gurfurlur': '구푸루',
        'Kahderyor': '카데요',
        'Qorrloh Teh': '코로 테',
        'Rorrloh Teh': '로로 테',
        'Ryoqor Terteh': '료코 테테',
        'Snowball': '눈덩이',
      },
      'replaceText': {
        '\\(first\\)': '(1)',
        '\\(second\\)': '(2)',
        '\\(close\\)': '(가까이)',
        '\\(mid\\)': '(중간)',
        '\\(far\\)': '(멀리)',
        '\\(fire\\)': '(불)',
        'Allfire': '대분화',
        'Arcane Stomp': '왕발 딛기',
        'Cold Feat': '빙결',
        'Crystalline Crush': '결정석 붕괴',
        'Crystalline Storm': '결정석 비',
        'Cyclonic Ring': '고리 돌개바람',
        'Earthen Shot': '대지 발사',
        'Enduring Glory': '요카후이의 긍지',
        'Eye of the Fierce': '맹금류의 눈동자',
        'Fluffle Up': '부하 소집',
        'Frosting Fracas': '눈안개의 소리',
        'Frozen Swirl': '빙륜',
        'Great Flood': '대홍수',
        'Heaving Haymaker': '묵직한 강타',
        'Ice Scream': '눈얼음의 소리',
        'Lithic Impact': '착탄',
        'Seed Crystals': '결정 부착',
        'Sharpened Sights': '예리한 눈빛',
        'Sledgehammer': '삼연속 망치 주먹',
        'Snow Boulder': '거대 눈덩이',
        'Snowscoop': '눈덩이 생성',
        'Sparkling Sprinkling': '서리',
        'Stalagmite Circle': '원형 암석 융기',
        'Stonework': '석판 투척',
        'Volcanic Drop': '화산탄',
        'Wind Shot': '바람 발사',
        'Wind Unbound': '바람 해방',
        'Windswrath': '대풍',
      },
    },
  ],
};

export default triggerSet;
