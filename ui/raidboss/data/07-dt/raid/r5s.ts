import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import {
  DirectionOutput16,
  DirectionOutputCardinal,
  Directions,
} from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { NetMatches } from '../../../../../types/net_matches';
import { TriggerSet } from '../../../../../types/trigger';

// TODOs:
// - Arcady Night Fever/Get Down - dodge followup cleave call
// - Frogtourage 1 - E+W or N+S safe
// - Frogtourage 3 - inside/outside + baits

type EastWest = 'east' | 'west';
type SnapCount = 'two' | 'three' | 'four';

// map of ids to number of hits and first safe side
const snapTwistIdMap: { [id: string]: [SnapCount, EastWest] } = {
  // 2-snap Twist & Drop the Needle
  'A728': ['two', 'west'],
  'A729': ['two', 'west'],
  'A72A': ['two', 'west'],
  'A4DB': ['two', 'west'],
  'A72B': ['two', 'east'],
  'A72C': ['two', 'east'],
  'A72D': ['two', 'east'],
  'A4DC': ['two', 'east'],
  // 3-snap Twist & Drop the Needle
  'A730': ['three', 'west'],
  'A731': ['three', 'west'],
  'A732': ['three', 'west'],
  'A4DD': ['three', 'west'],
  'A733': ['three', 'east'],
  'A734': ['three', 'east'],
  'A735': ['three', 'east'],
  'A4DE': ['three', 'east'],
  // 4-snap Twist & Drop the Needle
  'A739': ['four', 'west'],
  'A73A': ['four', 'west'],
  'A73B': ['four', 'west'],
  'A4DF': ['four', 'west'],
  'A73C': ['four', 'east'],
  'A73D': ['four', 'east'],
  'A73E': ['four', 'east'],
  'A4E0': ['four', 'east'],
};

// map of Frogtourage cast ids to safe dirs
const feverIdMap: { [id: string]: DirectionOutputCardinal } = {
  'A70A': 'dirN', // south cleave
  'A70B': 'dirS', // north cleave
  'A70C': 'dirW', // east cleave
  'A70D': 'dirE', // west cleave
};

const hustleMap: { [id: string]: 'left' | 'right' } = {
  // Frogtourage clones:
  'A775': 'right',
  'A776': 'left',
  // Boss:
  'A724': 'right',
  'A725': 'left',
};

export interface Data extends RaidbossData {
  deepCutTargets: string[];
  storedABSideMech?: 'lightParty' | 'roleGroup';
  discoInfernalCount: number;
  feverSafeDirs: DirectionOutputCardinal[];
  wavelengthCount: {
    alpha: number;
    beta: number;
  };
  storedHustleCleaves: NetMatches['StartsUsing'][];
  hustleCleaveCount: number;
}

const getSafeDirsForCloneCleave = (
  matches: NetMatches['StartsUsing'],
): DirectionOutputCardinal[] => {
  const isLeftCleave = hustleMap[matches.id] === 'left';

  // Snap the frog to the nearest cardinal in the direction of their cleave
  const headingAdjust = isLeftCleave ? -(Math.PI / 8) : (Math.PI / 8);
  let snappedHeading = (parseFloat(matches.heading) + headingAdjust) % Math.PI;
  if (snappedHeading < -Math.PI)
    snappedHeading = Math.PI - snappedHeading;
  snappedHeading = snappedHeading % Math.PI;

  // Frog's snapped heading and the next one CW or CCW depending on cleave direction are safe
  const snappedFrogDir = Directions.hdgTo4DirNum(snappedHeading);
  const otherSafeDir = ((snappedFrogDir + 4) + (isLeftCleave ? 1 : -1)) % 4;

  return [
    Directions.outputCardinalDir[snappedFrogDir] ?? 'unknown',
    Directions.outputCardinalDir[otherSafeDir] ?? 'unknown',
  ];
};

const triggerSet: TriggerSet<Data> = {
  id: 'AacCruiserweightM1Savage',
  zoneId: ZoneId.AacCruiserweightM1Savage,
  timelineFile: 'r5s.txt',
  initData: () => ({
    deepCutTargets: [],
    discoInfernalCount: 0,
    feverSafeDirs: [],
    wavelengthCount: {
      alpha: 0,
      beta: 0,
    },
    storedHustleCleaves: [],
    hustleCleaveCount: 0,
  }),
  triggers: [
    {
      // headmarkers with self-targeted cast
      id: 'R5S Deep Cut',
      type: 'HeadMarker',
      netRegex: { id: '01D7' },
      infoText: (data, matches, output) => {
        data.deepCutTargets.push(matches.target);
        if (data.deepCutTargets.length < 2)
          return;

        if (data.deepCutTargets.includes(data.me))
          return output.cleaveOnYou!();
        return output.avoidCleave!();
      },
      run: (data) => {
        if (data.deepCutTargets.length >= 2)
          data.deepCutTargets = [];
      },
      outputStrings: {
        cleaveOnYou: Outputs.tankCleaveOnYou,
        avoidCleave: Outputs.avoidTankCleave,
      },
    },
    {
      id: 'R5S Flip to AB Side',
      type: 'StartsUsing',
      netRegex: { id: ['A780', 'A781'], source: 'Dancing Green' },
      infoText: (data, matches, output) => {
        // A780 = Flip to A-side, A781 = Flip to B-side
        data.storedABSideMech = matches.id === 'A780' ? 'roleGroup' : 'lightParty';
        return output.stored!({ mech: output[data.storedABSideMech]!() });
      },
      outputStrings: {
        stored: {
          en: '(${mech} later)',
          de: '(${mech} später)',
          fr: '(${mech} après)',
          ja: '(あとで ${mech})',
          cn: '(稍后 ${mech})',
          ko: '(나중에 ${mech})',
        },
        lightParty: Outputs.healerGroups,
        roleGroup: Outputs.rolePositions,
      },
    },
    {
      id: 'R5S X-Snap Twist',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(snapTwistIdMap), source: 'Dancing Green' },
      durationSeconds: 10,
      alertText: (data, matches, output) => {
        const snapTwist = snapTwistIdMap[matches.id];
        if (!snapTwist)
          return;

        const snapCountStr = output[snapTwist[0]]!();
        const safeDirStr = output[snapTwist[1]]!();
        const mechStr = output[data.storedABSideMech ?? 'unknown']!();
        return output.combo!({ dir: safeDirStr, num: snapCountStr, mech: mechStr });
      },
      run: (data) => delete data.storedABSideMech,
      outputStrings: {
        combo: {
          en: 'Start ${dir} (${num} hits) => ${mech}',
          de: 'Start ${dir} (${num} Treffer) => ${mech}',
          fr: 'Commencez ${dir} (${num} coups) => ${mech}',
          ja: '${dir} 開始 (${num} ポイント) からの ${mech}',
          cn: '${dir} 开始 (打 ${num} 次) => ${mech}',
          ko: '${dir} 시작 (${num}번 공격) => ${mech}',
        },
        lightParty: Outputs.healerGroups,
        roleGroup: Outputs.rolePositions,
        east: Outputs.east,
        west: Outputs.west,
        two: Outputs.num2,
        three: Outputs.num3,
        four: Outputs.num4,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'R5S Celebrate Good Times',
      type: 'StartsUsing',
      netRegex: { id: 'A723', source: 'Dancing Green', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R5S Disco Inferno',
      type: 'StartsUsing',
      netRegex: { id: 'A756', source: 'Dancing Green', capture: false },
      response: Responses.bigAoe(),
      run: (data) => data.discoInfernalCount++,
    },
    {
      id: 'R5S Burn Baby Burn 1 Early',
      type: 'GainsEffect',
      netRegex: { effectId: '116D' },
      condition: (data, matches) =>
        data.discoInfernalCount === 1 &&
        data.me === matches.target,
      durationSeconds: 7,
      infoText: (_data, matches, output) => {
        // During Disco 1, debuffs are by role: 23.5s or 31.5s
        if (parseFloat(matches.duration) < 25)
          return output.shortBurn!();
        return output.longBurn!();
      },
      outputStrings: {
        shortBurn: {
          en: '(short cleanse)',
          de: '(kurze Reinigung)',
          fr: '(compteur court)',
          ja: '(先にスポットライト)',
          cn: '(短舞点名)',
          ko: '(짧은 디버프)',
        },
        longBurn: {
          en: '(long cleanse)',
          de: '(lange Reinigung)',
          fr: '(compteur long)',
          ja: '(あとでスポットライト)',
          cn: '(长舞点名)',
          ko: '(긴 디버프)',
        },
      },
    },
    {
      id: 'R5S Burn Baby Burn 1 Cleanse',
      type: 'GainsEffect',
      netRegex: { effectId: '116D' },
      condition: (data, matches) =>
        data.discoInfernalCount === 1 &&
        data.me === matches.target,
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 5,
      countdownSeconds: 5,
      alertText: (_data, _matches, output) => output.cleanse!(),
      outputStrings: {
        cleanse: {
          en: 'Cleanse in spotlight',
          de: 'Reinige im Scheinwerfer',
          fr: 'Purifiez sous le projecteur',
          ja: 'スポットライトで浄化',
          cn: '灯下跳舞',
          ko: '스포트라이트에 서기',
        },
      },
    },
    {
      id: 'R5S Burn Baby Burn 2 First',
      type: 'GainsEffect',
      netRegex: { effectId: '116D' },
      condition: (data, matches) =>
        data.discoInfernalCount === 2 &&
        data.me === matches.target,
      durationSeconds: 9,
      alertText: (_data, matches, output) => {
        // During Disco 2, debuffs are by role: 9s or 19s
        if (parseFloat(matches.duration) < 14)
          return output.cleanse!();
        return output.bait!();
      },
      outputStrings: {
        cleanse: {
          en: 'Cleanse in spotlight',
          de: 'Reinige im Scheinwerfer',
          fr: 'Purifiez sous le projecteur',
          ja: 'スポットライトで浄化',
          cn: '灯下跳舞',
          ko: '스포트라이트에 서기',
        },
        bait: {
          en: 'Bait Frog',
          de: 'Frosch ködern',
          fr: 'Prenez la grenouille',
          ja: 'カエル誘導',
          cn: '引导青蛙',
          ko: '개구리 유도',
        },
      },
    },
    {
      id: 'R5S Burn Baby Burn 2 Second',
      type: 'GainsEffect',
      netRegex: { effectId: '116D' },
      condition: (data, matches) =>
        data.discoInfernalCount === 2 &&
        data.me === matches.target,
      delaySeconds: 11,
      durationSeconds: 8,
      alertText: (_data, matches, output) => {
        // During Disco 2, debuffs are by role: 9s or 19s
        if (parseFloat(matches.duration) < 14)
          return output.bait!();
        return output.cleanse!();
      },
      outputStrings: {
        cleanse: {
          en: 'Cleanse in spotlight',
          de: 'Reinige im Scheinwerfer',
          fr: 'Purifiez sous le projecteur',
          ja: 'スポットライトで浄化',
          cn: '灯下跳舞',
          ko: '스포트라이트에 서기',
        },
        bait: {
          en: 'Bait Frog',
          de: 'Frosch ködern',
          fr: 'Prenez la grenouille',
          ja: 'カエル誘導',
          cn: '引导青蛙',
          ko: '개구리 유도',
        },
      },
    },
    {
      id: 'R5S Inside Out',
      type: 'StartsUsing',
      netRegex: { id: 'A77C', source: 'Dancing Green', capture: false },
      durationSeconds: 8.5,
      alertText: (_data, _matches, output) => output.insideOut!(),
      outputStrings: {
        insideOut: {
          en: 'Max Melee => Under',
          de: 'Max Nahkampf => Unter ihn',
          fr: 'Max mêlée => Dessous',
          ja: '外からボス下に',
          cn: '钢铁 => 月环',
          ko: '칼끝딜 => 안으로',
        },
      },
    },
    {
      id: 'R5S Outside In',
      type: 'StartsUsing',
      netRegex: { id: 'A77E', source: 'Dancing Green', capture: false },
      durationSeconds: 8.5,
      alertText: (_data, _matches, output) => output.outsideIn!(),
      outputStrings: {
        outsideIn: {
          en: 'Under => Max Melee',
          de: 'Unter ihn => Max Nahkampf',
          fr: 'Dessous => Max mêlée',
          ja: 'ボス下から外に',
          cn: '月环 => 钢铁',
          ko: '안으로 => 칼끝딜',
        },
      },
    },
    {
      // Wavelength α debuff timers are applied with 40.5, 25.5, 25.5, 30.5 or
      //  38.0, 23.0, 23.0, 28.0 durations depending on which group gets hit first
      //
      // Wavelength β debuff timers are applied with 45.5, 30.5, 20.5, 25.5 or
      //  43.0, 28.0, 18.0, 23.0 durations depending on which group gets hit first
      id: 'R5S Wavelength Merge Order',
      type: 'GainsEffect',
      netRegex: { effectId: ['116E', '116F'] },
      preRun: (data, matches) => {
        matches.effectId === '116E' ? data.wavelengthCount.alpha++ : data.wavelengthCount.beta++;
      },
      durationSeconds: (_data, matches) => parseFloat(matches.duration),
      infoText: (data, matches, output) => {
        if (matches.target === data.me) {
          if (matches.effectId === '116E') {
            const count = data.wavelengthCount.alpha;
            switch (count) {
              case 1:
                return output.merge!({ order: output.third!() });
              case 2:
                return output.merge!({ order: output.first!() });
              case 3:
                return output.merge!({ order: output.second!() });
              case 4:
                return output.merge!({ order: output.fourth!() });
              default:
                return output.merge!({ order: output.unknown!() });
            }
          } else {
            const count = data.wavelengthCount.beta;
            switch (count) {
              case 1:
                return output.merge!({ order: output.fourth!() });
              case 2:
                return output.merge!({ order: output.second!() });
              case 3:
                return output.merge!({ order: output.first!() });
              case 4:
                return output.merge!({ order: output.third!() });
              default:
                return output.merge!({ order: output.unknown!() });
            }
          }
        }
      },
      outputStrings: {
        merge: {
          en: '${order} merge',
          de: '${order} berühren',
          fr: '${order} fusion',
          ja: '${order} にペア割り',
          cn: '${order} 撞毒',
          ko: '${order} 융합',
        },
        first: {
          en: 'First',
          de: 'Erstes',
          fr: 'Première',
          ja: '最初',
          cn: '第1组',
          ko: '첫번째',
        },
        second: {
          en: 'Second',
          de: 'Zweites',
          fr: 'Seconde',
          ja: '2番目',
          cn: '第2组',
          ko: '두번째',
        },
        third: {
          en: 'Third',
          de: 'Drittes',
          fr: 'Troisième',
          ja: '3番目',
          cn: '第3组',
          ko: '세번째',
        },
        fourth: {
          en: 'Fourth',
          de: 'Viertes',
          fr: 'Quatrième',
          ja: '4番目',
          cn: '第4组',
          ko: '네번째',
        },
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'R5S Wavelength Merge Reminder',
      type: 'GainsEffect',
      netRegex: { effectId: ['116E', '116F'] },
      condition: Conditions.targetIsYou(),
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 5,
      alertText: (_data, _matches, output) => output.merge!(),
      outputStrings: {
        merge: {
          en: 'Merge debuff',
          de: 'Debuff berühren',
          fr: 'Fusionner le debuff',
          ja: 'ペア割り',
          cn: '撞毒',
          ko: '융합하기',
        },
      },
    },
    {
      id: 'R5S Quarter Beats',
      type: 'StartsUsing',
      netRegex: { id: 'A75B', source: 'Dancing Green', capture: false },
      infoText: (_data, _matches, output) => output.quarterBeats!(),
      outputStrings: {
        quarterBeats: Outputs.stackPartner,
      },
    },
    {
      id: 'R5S Eighth Beats',
      type: 'StartsUsing',
      netRegex: { id: 'A75D', source: 'Dancing Green', capture: false },
      infoText: (_data, _matches, output) => output.eighthBeats!(),
      outputStrings: {
        eighthBeats: Outputs.spread,
      },
    },
    {
      // cast order of the 8 adds is always W->E, same as firing order
      id: 'R5S Arcady Night Fever + Encore Collect',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(feverIdMap), source: 'Frogtourage' },
      run: (data, matches) => data.feverSafeDirs.push(feverIdMap[matches.id] ?? 'unknown'),
    },
    {
      id: 'R5S Let\'s Dance!',
      type: 'StartsUsing',
      // A76A - Let's Dance!; A390 - Let's Dance! Remix
      // Remix is faster, so use a shorter duration
      netRegex: { id: ['A76A', 'A390'], source: 'Dancing Green' },
      durationSeconds: (_data, matches) => matches.id === 'A76A' ? 23 : 18,
      infoText: (data, _matches, output) => {
        if (data.feverSafeDirs.length < 8)
          return output['unknown']!();
        const dirStr = data.feverSafeDirs.map((dir) => output[dir]!()).join(output.next!());
        return dirStr;
      },
      run: (data) => data.feverSafeDirs = [],
      outputStrings: {
        ...Directions.outputStringsCardinalDir,
        next: Outputs.next,
      },
    },
    {
      id: 'R5S Let\'s Pose',
      type: 'StartsUsing',
      netRegex: { id: 'A770', source: 'Dancing Green', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R5S Do the Hustle',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(hustleMap) },
      preRun: (data, matches) => data.storedHustleCleaves.push(matches),
      infoText: (data, _matches, outputs) => {
        // Order is double cleave, double cleave, single cleave, triple cleave
        const expectedCountMap = [
          2,
          2,
          1,
          3,
        ];
        if (
          data.storedHustleCleaves.length <
            (expectedCountMap[data.hustleCleaveCount] ?? 0)
        )
          return;

        const cleaves = data.storedHustleCleaves;
        const currentCleaveCount = data.hustleCleaveCount;
        data.storedHustleCleaves = [];
        ++data.hustleCleaveCount;

        // Double cleaves from clones
        if (currentCleaveCount === 0 || currentCleaveCount === 1) {
          const [cleave1, cleave2] = cleaves;
          if (cleave1 === undefined || cleave2 === undefined)
            return;

          const safeDirs1 = getSafeDirsForCloneCleave(cleave1);
          const safeDirs2 = getSafeDirsForCloneCleave(cleave2);
          for (const dir of safeDirs1) {
            if (safeDirs2.includes(dir)) {
              return outputs[dir]!();
            }
          }
          return outputs['unknown']!();
        }

        // Single boss cleave
        if (currentCleaveCount === 2) {
          const [cleave1] = cleaves;
          if (cleave1 === undefined)
            return;

          return hustleMap[cleave1.id] === 'left' ? outputs['dirE']!() : outputs['dirW']!();
        }

        // Double cleaves from clones plus boss cleave
        if (currentCleaveCount === 3) {
          const cleave3 = cleaves.find((cleave) => ['A724', 'A725'].includes(cleave.id));
          const [cleave1, cleave2] = cleaves.filter((c) => c !== cleave3);
          if (cleave1 === undefined || cleave2 === undefined || cleave3 === undefined)
            return;

          const safeDirs1 = getSafeDirsForCloneCleave(cleave1);
          const safeDirs2 = getSafeDirsForCloneCleave(cleave2);

          let safeDir: DirectionOutput16 = 'unknown';

          for (const dir of safeDirs1) {
            if (safeDirs2.includes(dir)) {
              safeDir = dir;
            }
          }

          const isBossLeftCleave = hustleMap[cleave3.id] === 'left';

          // safeDir should be either 'dirN' or 'dirS' at this point, adjust with boss left/right
          if (safeDir === 'dirN') {
            if (isBossLeftCleave)
              return outputs['dirNNE']!();
            return outputs['dirNNW']!();
          }
          if (safeDir === 'dirS') {
            if (isBossLeftCleave)
              return outputs['dirSSE']!();
            return outputs['dirSSW']!();
          }

          return outputs['unknown']!();
        }
        return outputs['unknown']!();
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        '2-snap Twist & Drop the Needle/3-snap Twist & Drop the Needle/4-snap Twist & Drop the Needle':
          '2/3/4-snap Twist',
        'Flip to A-side/Flip to B-side': 'Flip to A/B-side',
        'Play A-side/Play B-side': 'Play A/B-side',
      },
    },
    {
      'locale': 'de',
      'missingTranslations': true,
      'replaceSync': {
        'Dancing Green': 'Springhis Khan',
        'Frogtourage': 'Schenkelschwinger',
      },
      'replaceText': {
        '\\(Cleave\\)': '(Cleave)',
        '\\(Echo\\)': '(Echo)',
        '\\(In\\+Protean\\+Echo\\)': '(Rein+Himmelsrichtungen+Echo)',
        '\\(Out\\+Protean\\+Echo\\)': '(Raus+Himmelsrichtungen+Echo)',
        '\\(Out\\+Protean\\)': '(Raus+Himmelsrichtungen)',
        '\\(all\\)': '(Alle)',
        '\\(boss\\)': '(Boss)',
        '\\(dancers\\)': '(Tänzer)',
        '\\(enrage\\)': '(Finalangriff)',
        '2-snap Twist & Drop the Needle/3-snap Twist & Drop the Needle/4-snap Twist & Drop the Needle':
          '2/3/4-fachzeig, Pose, Musik ab!',
        'Arcady Night Encore': 'Tanzfieber-Zugabe',
        'Arcady Night Encore Starts': 'Tanzfieber-Zugabe startet',
        'Arcady Night Fever': 'Arkadion-Tanzfieber',
        'Back-up Dance': 'Wilde Welle',
        'Celebrate Good Times': 'Völlig losgelöst',
        'Deep Cut': 'Tiefschnitt',
        'Disco Infernal': 'Disco Pogo',
        'Do the Hustle': 'Schüttel deinen Speck',
        '(?<!& )Drop the Needle': 'Musik ab!',
        'Eighth Beats': 'Achteltakt',
        'Ensemble Assemble': 'Gruppen-Groove',
        'Fire': '',
        'Flip to A-side': 'A-Seite auflegen',
        'Flip to B-side': 'B-Seite auflegen',
        'Freak Out': 'Schallexplosion',
        'Frogtourage Finale': 'Finaler Groove',
        'Frogtourage(?! )': 'Schenkelschwinger',
        'Funky Floor': 'Tanzflächen-Tango',
        'Get Down!': 'Hoch die Hände!',
        'Hi-NRG Fever': 'Totales Tanzfieber',
        'Inside Out': 'Innerer Rhythmus',
        'Let\'s Dance!(?! )': 'Fühl\' dich Disco!',
        'Let\'s Dance! Remix': 'Fühl\' dich Disco, Disco, Disco!',
        'Let\'s Pose!': 'Perfekte Pose',
        'Moonburn': 'Mondglühen',
        'Outside In': 'Äußerer Rhythmus',
        'Play A-side': 'Spiele A-Seite',
        'Play B-side': 'Spiele B-Seite',
        'Quarter Beats': 'Vierteltakt',
        'Ride the Waves': 'Perfekte Welle',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Dancing Green': 'Dancing Green',
        'Frogtourage': 'Danceur batracien',
      },
      'replaceText': {
        '\\(Cleave\\)': '(Cleave)',
        '\\(Echo\\)': '(Echo)',
        '\\(In\\+Protean\\+Echo\\)': '(Intérieur + Position + Echo)',
        '\\(Out\\+Protean\\+Echo\\)': '(Extérieur + Position + Echo)',
        '\\(Out\\+Protean\\)': '(Extérieur + Positions)',
        '\\(all\\)': '(Tous)',
        '\\(boss\\)': '(Boss)',
        '\\(dancers\\)': '(Danceurs)',
        '\\(enrage\\)': '(Enrage)',
        '2-snap Twist & Drop the Needle': 'Doublé pointé, pose & NUIT DE FOLIE !',
        '3-snap Twist & Drop the Needle': 'Triple pointé, pose & NUIT DE FOLIE !',
        '4-snap Twist & Drop the Needle': 'Quadruple pointé, pose & NUIT DE FOLIE !',
        'Arcady Night Encore': 'Fièvre de l\'Arcadion : rappel',
        'Arcady Night Fever': 'Fièvre de l\'Arcadion',
        'Back-up Dance': 'Vague dansante',
        'Celebrate Good Times': 'Lève les bras, balance-toi !',
        'Debuffs': 'Debuffs',
        'Deep Cut': 'Entaille profonde',
        'Disco Infernal': 'Enfer du disco',
        'Do the Hustle': 'Danse le Mia !',
        '(?<!& )Drop the Needle': 'NUIT DE FOLIE !',
        'Eighth Beats': 'Tempo octuple',
        'Ensemble Assemble': 'Rassemblement des danseurs',
        'Fire': '',
        'Flip to A-side': 'Programmation : face A',
        'Flip to B-side': 'Programmation : face B',
        'Freak Out': 'Déflagration acoustique',
        'Frogtourage Finale': 'Rassemblement final',
        'Frogtourage(?! )': 'danceur batracien',
        'Funky Floor': 'Terrain de danse',
        'Get Down!': 'Bouge de là !',
        'Hi-NRG Fever': 'Fièvre de la nuit survoltée',
        'Inside Out': 'Pas extérieur',
        'Let\'s Dance!(?! )': 'Alors on danse !',
        'Let\'s Dance! Remix': 'Alors on danse, danse, danse !',
        'Let\'s Pose!': 'Prends la pose !',
        'Moonburn': 'Flambée lunaire',
        'Outside In': 'Pas intérieur',
        'Play A-side': 'Jingle fracassant A',
        'Play B-side': 'Jingle fracassant B',
        'Quarter Beats': 'Tempo quadruple',
        'Ride the Waves': 'Roulement de vagues',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Dancing Green': 'ダンシング・グリーン',
        'Frogtourage': 'フロッグダンサー',
      },
      'replaceText': {
        '2-snap Twist & Drop the Needle': '2ポイント、ポーズ＆ジングル',
        '3-snap Twist & Drop the Needle': '3ポイント、ポーズ＆ジングル',
        '4-snap Twist & Drop the Needle': '4ポイント、ポーズ＆ジングル',
        'Arcady Night Encore': 'ナイトフィーバー・アンコール',
        'Arcady Night Encore Starts': 'ナイトフィーバー・アンコール',
        'Arcady Night Fever': 'アルカディア・ナイトフィーバー',
        'Back-up Dance': 'ダンシングウェーブ',
        'Celebrate Good Times': 'セレブレート・グッドタイムズ',
        'Deep Cut': 'ディープカット',
        'Disco Infernal': 'ディスコインファーナル',
        'Do the Hustle': 'ドゥ・ザ・ハッスル',
        'Eighth Beats': '8ビート',
        'Ensemble Assemble': 'ダンサーズ・アッセンブル',
        'Flip to A-side': 'ジングル予約A',
        'Flip to B-side': 'ジングル予約B',
        'Freak Out': '音響爆発',
        'Frogtourage Finale': 'ファイナル・アッセンブル',
        'Frogtourage(?! )': 'フロッグダンサー',
        'Funky Floor': 'ダンシングフィールド',
        'Get Down!': 'ゲットダウン！',
        'Hi-NRG Fever': 'ハイエナジー・ナイトフィーバー',
        'Inside Out': 'インサイドアウト',
        'Let\'s Dance!(?! )': 'レッツダンス！',
        'Let\'s Dance! Remix': 'レッツダンス・ダンス・ダンス！',
        'Let\'s Pose!': 'レッツポーズ！',
        'Moonburn': 'ムーンバーン',
        'Outside In': 'アウトサイドイン',
        'Play A-side': 'ラウドジングルA',
        'Play B-side': 'ラウドジングルB',
        'Quarter Beats': '4ビート',
        'Ride the Waves': 'ウェーブ・オン・ウェーブ',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Dancing Green': '热舞绿光',
        'Frogtourage': '青蛙舞者',
      },
      'replaceText': {
        '\\(Cleave\\)': '(半场)',
        '\\(Echo\\)': '(重复)',
        '\\(In\\+Protean\\+Echo\\)': '(内+八方+重复)',
        '\\(Out\\+Protean\\+Echo\\)': '(外+八方+重复)',
        '\\(Out\\+Protean\\)': '(外+八方)',
        '\\(all\\)': '(全体)',
        '\\(boss\\)': '(BOSS)',
        '\\(dancers\\)': '(分身)',
        '\\(enrage\\)': '(狂暴)',
        '2-snap Twist & Drop the Needle/3-snap Twist & Drop the Needle/4-snap Twist & Drop the Needle':
          '二/三/四连指向、定格＆播放',
        'Arcady Night Encore': '返场夜狂热',
        'Arcady Night Fever': '登天夜狂热',
        'Back-up Dance': '伴舞波动',
        'Celebrate Good Times': '欢庆时刻',
        'Deep Cut': '经典铭心',
        'Debuffs': '毒',
        'Disco Infernal': '激热跳舞街',
        'Do the Hustle': '摇摆哈娑',
        '(?<!& )Drop the Needle': '播放',
        'Eighth Beats': '8拍节奏',
        'Ensemble Assemble': '伴舞团',
        'Fire': '',
        'Flip to A-side': '放入A面',
        'Flip to B-side': '放入B面',
        'Freak Out': '音频爆炸',
        'Frogtourage Finale': '舞团终演',
        'Frogtourage(?! )': '来吧！青蛙舞者！',
        'Funky Floor': '热舞场地',
        'Get Down!': '尽情舞蹈！',
        'Hi-NRG Fever': '高能夜狂热',
        'Inside Out': '内翻外转',
        'Let\'s Dance!(?! )': '放纵劲舞！',
        'Let\'s Dance! Remix': '彻夜狂欢，放纵劲舞！',
        'Let\'s Pose!': '在这停顿！',
        'Moonburn': '太空热步',
        'Outside In': '外翻内转',
        'Play A-side': '播放A面',
        'Play B-side': '播放B面',
        'Quarter Beats': '4拍节奏',
        'Ride the Waves': '舞浪全开',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Dancing Green': '댄싱 그린',
        'Frogtourage': '개구리 댄서',
      },
      'replaceText': {
        '\\(Cleave\\)': '(장판)',
        '\\(Echo\\)': '(반복)',
        '\\(In\\+Protean\\+Echo\\)': '(안+8방향+반복)',
        '\\(Out\\+Protean\\+Echo\\)': '(밖+8방향+반복)',
        '\\(Out\\+Protean\\)': '(밖+8방향)',
        '\\(all\\)': '(모두)',
        '\\(boss\\)': '(보스)',
        '\\(dancers\\)': '(분신)',
        '\\(enrage\\)': '(전멸기)',
        '2-snap Twist & Drop the Needle/3-snap Twist & Drop the Needle/4-snap Twist & Drop the Needle':
          '두/세/네 번 흔들고 포즈 후 신청곡',
        'Arcady Night Encore': '밤의 열기 앙코르',
        'Arcady Night Fever': '아르카디아의 밤의 열기',
        'Back-up Dance': '백업 댄스',
        'Celebrate Good Times': '이 순간을 즐기자',
        'Deep Cut': '숨은 명곡',
        'Debuffs': '디버프',
        'Disco Infernal': '디스코 지옥',
        'Do the Hustle': '신나게 춤추자',
        '(?<!& )Drop the Needle': '신청곡',
        'Eighth Beats': '8비트',
        'Ensemble Assemble': '댄서 집합',
        'Fire': '파이어',
        'Flip to A-side': '신청곡 A 예약',
        'Flip to B-side': '신청곡 B 예약',
        'Freak Out': '음향 폭발',
        'Frogtourage Finale': '최종 집합',
        'Frogtourage(?! )': '컴 온! 개구리 댄서',
        'Funky Floor': '댄싱 필드',
        'Get Down!': '겟 다운!',
        'Hi-NRG Fever': '광적인 밤의 열기',
        'Inside Out': '안에서 밖으로',
        'Let\'s Dance!(?! Remix)': '레츠 댄스!',
        'Let\'s Dance! Remix': '레츠 댄스, 댄스, 댄스!',
        'Let\'s Pose!': '레츠 포즈!',
        'Moonburn': '달볕 걸음',
        'Outside In': '밖에서 안으로',
        'Play A-side': '신청곡 A',
        'Play B-side': '신청곡 B',
        'Quarter Beats': '4비트',
        'Ride the Waves': '박자 타기',
      },
    },
  ],
};

export default triggerSet;
