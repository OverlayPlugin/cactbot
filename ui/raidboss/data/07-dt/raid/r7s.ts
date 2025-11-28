import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import Util from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { Job } from '../../../../../types/job';
import { TriggerSet } from '../../../../../types/trigger';

// @TODO:
// - adds interrupt callouts?
// - Demolition Deathmatch:
//   - strat-specific tether callouts?
//   - Strange Seeds counter?

const headMarkerData = {
  // Sinster Seeds marker
  'sinisterSeed': '0177',
  // Strange Seeds marker
  'strangeSeed': '01D2',
  // Pulp Smash stack marker
  'pulpSmashMarker': '00A1',
  // Abominable Blink flare marker
  'flareMarker': '0147',
  // Killer Seed pair stack marker
  'killerSeedMarker': '005D',
} as const;

const effect0x808Data = {
  // Lashing Lariat, right-hand weapon (left side looking at wall) unsafe
  // applies as the cast starts, not useful for an earlier call
  'lashingLariatRight': '377',
  // Lashing Lariat, left-hand weapon (right side looking at wall) unsafe
  // applies as the cast starts, not useful for an earlier call
  'lashingLariatLeft': '378',
  // right-hand club glowing
  'clubRight': '388',
  // left-hand club glowing
  'clubLeft': '389',
  // right-hand sword glowing
  'swordRight': '38A',
  // left-hand sword glowing
  'swordLeft': '38B',
} as const;
console.assert(effect0x808Data);

const isHealerOrRanged = (x: Job) =>
  Util.isHealerJob(x) || Util.isRangedDpsJob(x) || Util.isCasterDpsJob(x);

type LeftRight = 'left' | 'right';

const patternMap = {
  // In order, 'outer west', 'outer east', 'inner west', 'inner east'
  'outerNW': ['dirNW', 'dirSE', 'dirSW', 'dirNE'],
  'outerNE': ['dirSW', 'dirNE', 'dirNW', 'dirSE'],
} as const;
type PatternMapValues = (typeof patternMap)[keyof typeof patternMap];
const pollenFlagMap: { [location: string]: PatternMapValues } = {
  // Platform 1:
  '05': patternMap.outerNE, // 05, 06, 07, 08
  '09': patternMap.outerNE, // 09, 0A, 0B, 0C
  '0D': patternMap.outerNW, // 0D, 0E, 0F, 10
  '11': patternMap.outerNW, // 11, 12, 13, 14
  // Platform 3:
  '15': patternMap.outerNE, // 15, 16, 17, 18
  '19': patternMap.outerNE, // 19, 1A, 1B, 1C
  '1D': patternMap.outerNW, // 1D, 1E, 1F, 20
  '21': patternMap.outerNW, // 21, 22, 23, 24
};

export interface Data extends RaidbossData {
  brutalImpactCount: number;
  sinisterSeedTargets: string[];
  storedStoneringer?: 'in' | 'out';
  stoneringer2Count: number;
  stoneringer2Followup?: boolean;
  stoneringer2Weapons?: {
    sword: LeftRight;
    club: LeftRight;
  };
}

const triggerSet: TriggerSet<Data> = {
  id: 'AacCruiserweightM3Savage',
  zoneId: ZoneId.AacCruiserweightM3Savage,
  timelineFile: 'r7s.txt',
  initData: () => ({
    brutalImpactCount: 6,
    sinisterSeedTargets: [],
    stoneringer2Count: 0,
  }),
  triggers: [
    {
      id: 'R7S Brutal Impact',
      type: 'StartsUsing',
      netRegex: { id: 'A55B', source: 'Brute Abombinator', capture: false },
      infoText: (data, _matches, output) => output.text!({ count: data.brutalImpactCount }),
      run: (data) => data.brutalImpactCount = Math.min(data.brutalImpactCount + 1, 8),
      outputStrings: {
        text: {
          en: 'AoE x${count}',
          de: 'AoE x${count}',
          fr: 'AoE x${count}',
          ja: '全体攻撃 ${count} 回',
          cn: 'AoE x${count}',
          ko: '전체 공격 x${count}',
        },
      },
    },
    {
      id: 'R7S Stoneringer',
      type: 'StartsUsing',
      netRegex: {
        id: ['A55D', 'A55E', 'A57F', 'A580'],
        source: 'Brute Abombinator',
        capture: true,
      },
      durationSeconds: (_data, matches) => parseFloat(matches.castTime) + 10,
      infoText: (data, matches, output) => {
        const id = matches.id;
        switch (id) {
          case 'A55D':
            data.storedStoneringer = 'out';
            return output.out!();
          case 'A55E':
            data.storedStoneringer = 'in';
            return output.in!();
          case 'A57F':
            data.storedStoneringer = 'out';
            return output.outLater!();
          case 'A580':
            data.storedStoneringer = 'in';
            return output.inLater!();
        }
      },
      outputStrings: {
        inLater: {
          en: 'In (for later)',
          de: 'Rein (für später)',
          fr: 'Intérieur (pour après)',
          ja: 'あとで中に',
          cn: '(稍后靠近)',
          ko: '안으로 (나중에)',
        },
        outLater: {
          en: 'Out (for later)',
          de: 'Raus (für später)',
          fr: 'Extérieur (pour après)',
          ja: 'あとで外に',
          cn: '(稍后远离)',
          ko: '밖으로 (나중에)',
        },
        in: Outputs.in,
        out: Outputs.out,
      },
    },
    {
      // tanks may choose to invuln this, but that is strat specific
      id: 'R7S Smash Here/There',
      type: 'StartsUsing',
      netRegex: { id: ['A55F', 'A560'], source: 'Brute Abombinator', capture: true },
      durationSeconds: (_data, matches) => parseFloat(matches.castTime) + 2,
      alertText: (data, matches, output) => {
        const stoneringer = output[data.storedStoneringer ?? 'unknown']!();

        if (data.role === 'tank') {
          const inOut = matches.id === 'A55F' ? output.in!() : output.out!();
          return output.sharedBuster!({ stoneringer: stoneringer, inOut: inOut });
        }

        const inOut = matches.id === 'A560' ? output.in!() : output.out!();
        return output.avoidBuster!({ stoneringer: stoneringer, inOut: inOut });
      },
      run: (data) => delete data.storedStoneringer,
      outputStrings: {
        sharedBuster: {
          en: '${stoneringer} => Tanks ${inOut}, Shared tankbuster',
          de: '${stoneringer} => Tanks ${inOut}, geteilter Tankbuster',
          fr: '${stoneringer} => Tanks ${inOut}, Tankbuster partagé',
          ja: '${stoneringer} => タンク ${inOut}, タンク頭割り',
          cn: '${stoneringer} => 坦克 ${inOut}, 引导死刑',
          ko: '${stoneringer} => 탱커 ${inOut}, 쉐어 탱버',
        },
        avoidBuster: {
          en: '${stoneringer} => Party ${inOut}, Avoid tankbuster',
          de: '${stoneringer} => Party ${inOut}, vermeide Tankbuster',
          fr: '${stoneringer} => Party ${inOut}, Évitez le tankbuster',
          ja: '${stoneringer} => パーティ ${inOut}, タンク頭割りを避ける',
          cn: '${stoneringer} => 小队 ${inOut}, 远离坦克死刑',
          ko: '${stoneringer} => 본대 ${inOut}, 탱버 피하기',
        },
        in: Outputs.in,
        out: Outputs.out,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'R7S Pollen',
      type: 'MapEffect',
      netRegex: { location: Object.keys(pollenFlagMap), flags: '00020001', capture: true },
      infoText: (_data, matches, output) => {
        const safeSpots = pollenFlagMap[matches.location];
        if (safeSpots === undefined)
          return;

        const [outerSafe1, outerSafe2, innerSafe1, innerSafe2] = safeSpots;
        return output.combo!({
          outer: output.outer!({
            dir1: output[outerSafe1]!(),
            dir2: output[outerSafe2]!(),
          }),
          inner: output.inner!({
            dir1: output[innerSafe1]!(),
            dir2: output[innerSafe2]!(),
          }),
        });
      },
      outputStrings: {
        combo: {
          en: '${outer}, ${inner}',
          de: '${outer}, ${inner}',
          fr: '${outer}, ${inner}',
          cn: '${outer}, ${inner}',
          ko: '${outer}, ${inner}',
        },
        outer: {
          en: 'Outer ${dir1}/${dir2}',
          de: 'Außen ${dir1}/${dir2}',
          fr: 'Extérieur ${dir1}/${dir2}',
          cn: '外 ${dir1}/${dir2}',
          ko: '바깥쪽 ${dir1}/${dir2}',
        },
        inner: {
          en: 'Inner ${dir1}/${dir2}',
          de: 'Innen ${dir1}/${dir2}',
          fr: 'Intérieur ${dir1}/${dir2}',
          cn: '内 ${dir1}/${dir2}',
          ko: '안쪽 ${dir1}/${dir2}',
        },
        dirNW: Outputs.dirNW,
        dirNE: Outputs.dirNE,
        dirSW: Outputs.dirSW,
        dirSE: Outputs.dirSE,
      },
    },
    {
      id: 'R7S Sinister Seeds',
      type: 'StartsUsing',
      netRegex: { id: 'A56E', source: 'Brute Abombinator', capture: true },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          seed: {
            en: 'Drop seed',
            de: 'Saaten ablegen',
            fr: 'Déposez les graines',
            ja: '種捨て',
            cn: '放置冰花',
            ko: '씨앗 놓기',
          },
          puddle: {
            en: 'Bait Puddles',
            de: 'Flächen ködern',
            fr: 'Posez les puddles',
            cn: '诱导黄圈',
            ko: '장판 유도',
          },
        };

        data.sinisterSeedTargets.push(matches.target);
        if (data.me === matches.target)
          return { infoText: output.seed!() };
        if (data.sinisterSeedTargets.length < 4)
          return;
        if (!data.sinisterSeedTargets.includes(data.me))
          return { alertText: output.puddle!() };
      },
      run: (data) => {
        if (data.sinisterSeedTargets.length >= 4)
          data.sinisterSeedTargets = [];
      },
    },
    {
      // Impact is an instant cast, so trigger off of Sinister Seeds dropping
      id: 'R7S Impact',
      type: 'Ability',
      netRegex: { id: 'A56E', source: 'Brute Abombinator', capture: false },
      condition: (data) => data.brutalImpactCount < 8,
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: Outputs.healerGroups,
      },
    },
    {
      id: 'R7S Quarry Swamp',
      type: 'StartsUsing',
      netRegex: { id: 'A575', source: 'Brute Abombinator', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Line of Sight boss with adds',
          de: 'Sichtlinie Boss verhindern mit Adds',
          fr: 'Cachez vous derrière un add',
          ja: '雑魚で視線を切る',
          cn: '躲在小怪身后',
          ko: '쫄 뒤에 숨어서 시선 피하기',
        },
      },
    },
    {
      id: 'R7S Explosion',
      type: 'StartsUsing',
      netRegex: { id: 'A576', source: 'Brute Abombinator', capture: true },
      durationSeconds: (_data, matches) => parseFloat(matches.castTime) + 5,
      suppressSeconds: 10,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Rotate away from proximity markers',
          de: 'Weg rotieren von den Distanzmarkierungen',
          fr: 'Tournez loin des marqueurs de proximité',
          ja: '距離減衰マーカー 3発目から1発目に避ける',
          cn: '远离距离衰减 AoE 落点',
          ko: '회전하면서 거리감쇠 징 피하기',
        },
      },
    },
    {
      id: 'R7S Pulp Smash',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.pulpSmashMarker, capture: true },
      infoText: (_data, matches, output) => output.text!({ target: matches.target }),
      outputStrings: {
        text: {
          en: 'Stack on ${target} => Out + Protean',
          de: 'Stack on ${target} => Raus + Himmelsrichtungen',
          fr: 'Package sur ${target} =>  Extérieur + Positions',
          ja: '${target} 頭割り => 外へ + 八方向さんかい',
          cn: '${target} 分摊 => 远离 + 八方分散',
          ko: '${target} 쉐어 => 바깥 + 8방향 산개',
        },
      },
    },
    {
      id: 'R7S Neo Bombarian Special',
      type: 'StartsUsing',
      netRegex: { id: 'A57C', source: 'Brute Abombinator', capture: true },
      durationSeconds: (_data, matches) => parseFloat(matches.castTime),
      countdownSeconds: (_data, matches) => parseFloat(matches.castTime),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Go North, big AoE + Launch',
          de: 'Geh nach Norden, große AoE + Katapult',
          fr: 'Allez au Nord, grosse AoE + Projection',
          ja: '北集合、全体攻撃 + ノックバック',
          cn: '去北方准备 AoE + 击飞',
          ko: '북쪽으로, 아픈 광역 + 날아감',
        },
      },
    },
    {
      id: 'R7S Brutish Swing',
      type: 'StartsUsing',
      netRegex: {
        id: ['A592', 'A593', 'A5A3', 'A5A5'],
        source: 'Brute Abombinator',
        capture: true,
      },
      alertText: (data, matches, output) => {
        const id = matches.id;
        switch (id) {
          case 'A592':
            return output.out!();
          case 'A593':
            return output.in!();
          case 'A5A3': {
            const inOut = output.out!();
            const lariat = output[data.stoneringer2Weapons?.club ?? 'unknown']!();

            if (data.stoneringer2Count > 1) {
              if (data.stoneringer2Followup)
                return output.inOutLariat!({ inOut: inOut, lariat: lariat });
              return inOut;
            }

            const followup = data.stoneringer2Followup ? output.bigAoe!() : output.awayFromFront!();
            if (data.stoneringer2Followup)
              return output.inOutFollowupLariat!({
                inOut: inOut,
                followup: followup,
                lariat: lariat,
              });
            return output.inOutFollowup!({ inOut: inOut, followup: followup });
          }
          case 'A5A5': {
            const inOut = output.in!();
            const lariat = output[data.stoneringer2Weapons?.sword ?? 'unknown']!();

            if (data.stoneringer2Count > 1) {
              if (data.stoneringer2Followup)
                return output.inOutLariat!({ inOut: inOut, lariat: lariat });
              return inOut;
            }

            const followup = data.stoneringer2Followup ? output.bigAoe!() : output.awayFromFront!();
            if (data.stoneringer2Followup)
              return output.inOutFollowupLariat!({
                inOut: inOut,
                followup: followup,
                lariat: lariat,
              });
            return output.inOutFollowup!({ inOut: inOut, followup: followup });
          }
        }
      },
      run: (data) => {
        delete data.storedStoneringer;
        delete data.stoneringer2Followup;
        delete data.stoneringer2Weapons;
      },
      outputStrings: {
        in: {
          en: 'In at tethered wall',
          de: 'Rein zu der verbundenen Wand',
          fr: 'À l\intérieur du mur lié',
          ja: '線のある壁に近づく',
          cn: '连线墙月环',
          ko: '선 연결된 벽 안으로',
        },
        out: {
          en: 'Out from tethered wall',
          de: 'Raus von der verbundenen Wand',
          fr: 'À l\extérieur du mur lié',
          ja: '線のある壁から離れる',
          cn: '连线墙钢铁',
          ko: '선 연결된 벽 밖으로',
        },
        inOutFollowupLariat: {
          en: '${inOut} + ${followup} => ${lariat}',
          de: '${inOut} + ${followup} => ${lariat}',
          fr: '${inOut} + ${followup} => ${lariat}',
          ja: '${inOut} + ${followup} => ${lariat}',
          cn: '${inOut} + ${followup} => ${lariat}',
          ko: '${inOut} + ${followup} => ${lariat}',
        },
        inOutFollowup: {
          en: '${inOut} => ${followup}',
          de: '${inOut} => ${followup}',
          fr: '${inOut} => ${followup}',
          ja: '${inOut} => ${followup}',
          cn: '${inOut} => ${followup}',
          ko: '${inOut} => ${followup}',
        },
        inOutLariat: {
          en: '${inOut} => ${lariat}',
          de: '${inOut} => ${lariat}',
          fr: '${inOut} => ${lariat}',
          ja: '${inOut} => ${lariat}',
          cn: '${inOut} => ${lariat}',
          ko: '${inOut} => ${lariat}',
        },
        left: {
          en: 'Get Left',
          de: 'Geh Links',
          fr: 'Allez à gauche',
          ja: '左へ',
          cn: '去左边',
          ko: '왼쪽으로',
        },
        right: {
          en: 'Get Right',
          de: 'Geh Rechts',
          fr: 'Allez à droite',
          ja: '右へ',
          cn: '去右边',
          ko: '오른쪽으로',
        },
        awayFromFront: {
          en: 'Spread, Away from front',
          de: 'Verteilen, weg von Vorne',
          fr: 'Dispertion, loin du devant',
          ja: 'さんかい、ボス前から離れる',
          cn: '分散, 远离 BOSS 正面',
          ko: '산개, 보스 앞 피하기',
        },
        bigAoe: Outputs.bigAoe,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'R7S Glower Power',
      type: 'StartsUsing',
      netRegex: { id: 'A94C', source: 'Brute Abombinator', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Spread, Away from front',
          de: 'Verteilen, weg von Vorne',
          fr: 'Dispertion, loin du devant',
          ja: 'さんかい、ボス前から離れる',
          cn: '分散, 远离 BOSS 正面',
          ko: '산개, 보스 앞 피하기',
        },
      },
    },
    {
      id: 'R7S Revenge of the Vines',
      type: 'StartsUsing',
      netRegex: { id: 'A587', source: 'Brute Abombinator', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R7S Thorny Deathmatch',
      type: 'Tether',
      netRegex: { id: '0152', capture: true },
      infoText: (_data, matches, output) => output.text!({ target: matches.target }),
      outputStrings: {
        text: {
          en: 'Tank tether on ${target}',
          de: 'Tank-Verbindung auf ${target}',
          fr: 'Lien tank sur ${target}',
          ja: '${target} にタンク線',
          cn: '坦克连线 ${target}',
          ko: '${target} 탱커 선 대상자',
        },
      },
    },
    {
      id: 'R7S Abominable Blink',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.flareMarker, capture: true },
      alertText: (data, matches, output) => {
        if (matches.target === data.me)
          return output.flare!();
        return output.avoidFlare!();
      },
      outputStrings: {
        avoidFlare: {
          en: 'Away from Flare',
          de: 'Weg von dem Flare',
          fr: 'Loin du Brasier',
          ja: 'フレアマーカーから離れる',
          cn: '远离核爆',
          ko: '플레어 피하기',
        },
        flare: {
          en: 'Flare + buster on YOU, Away from party',
          de: 'Flare + Tankbuster auf DIR, Weg von der Gruppe',
          fr: 'Brasier + Tankbuster sur VOUS, Loin du groupe',
          ja: '自分にフレア、パーティから離れる',
          cn: '核爆死刑点名, 远离人群',
          ko: '플레어 + 탱버 대상자, 본대에서 멀어지기',
        },
      },
    },
    {
      // different strats have different players taking these tethers,
      // so we use a generic callout for now
      id: 'R7S Demolition Deathmatch',
      type: 'StartsUsing',
      netRegex: { id: 'A596', source: 'Brute Abombinator', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get tethers',
          de: 'Nimm Verbindungen',
          fr: 'Prenez les liens',
          ja: '線取り',
          cn: '获取连线',
          ko: '선 가져오기',
        },
      },
    },
    {
      id: 'R7S Strange Seeds',
      type: 'StartsUsing',
      netRegex: { id: 'A598', source: 'Brute Abombinator', capture: true },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Drop seed',
          de: 'Saaten ablegen',
          fr: 'Déposez les graines',
          ja: '種捨て',
          cn: '放置冰花',
          ko: '씨앗 놓기',
        },
      },
    },
    {
      id: 'R7S Tendrils of Terror',
      type: 'StartsUsing',
      netRegex: {
        id: ['A599', 'A59A', 'A59C', 'A59D'],
        source: 'Brute Abombinator',
        capture: false,
      },
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Avoid line AoEs',
          de: 'Vermeide Linien AoEs',
          fr: 'Évitez les lignes d\'AoE',
          ja: '直線 AoE を避ける',
          cn: '远离直线 AoE',
          ko: '직선 장판 피하기',
        },
      },
    },
    {
      id: 'R7S Killer Seeds',
      type: 'StartsUsing',
      netRegex: { id: 'A59B', source: 'Brute Abombinator', capture: false },
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: Outputs.stackPartner,
      },
    },
    {
      id: 'R7S Powerslam',
      type: 'StartsUsing',
      netRegex: { id: 'A59E', source: 'Brute Abombinator', capture: false },
      response: Responses.bigAoe('alert'),
    },
    {
      // A5A0 = sword left, club right
      // A5A1 = club left, sword right
      id: 'R7S Stoneringer 2: Stoneringers',
      type: 'StartsUsing',
      netRegex: { id: ['A5A0', 'A5A1'], source: 'Brute Abombinator', capture: true },
      run: (data, matches) => {
        data.stoneringer2Followup = true;
        data.stoneringer2Count++;

        const id = matches.id;
        switch (id) {
          case 'A5A0':
            data.stoneringer2Weapons = { sword: 'left', club: 'right' };
            break;
          case 'A5A1':
            data.stoneringer2Weapons = { sword: 'right', club: 'left' };
            break;
        }
      },
    },
    {
      id: 'R7S Lashing Lariat',
      type: 'StartsUsing',
      netRegex: { id: ['A5A8', 'A5AA'], source: 'Brute Abombinator', capture: true },
      alertText: (_data, matches, output) =>
        matches.id === 'A5A8' ? output.right!() : output.left!(),
      outputStrings: {
        left: {
          en: '<== Get Left',
          de: '<== Geh Links',
          fr: '<== Allez à gauche',
          ja: '<== 左へ',
          cn: '<== 左左左',
          ko: '<== 왼쪽으로',
        },
        right: {
          en: 'Get Right ==>',
          de: 'Geh Rechts ==>',
          fr: 'Allez à droite ==>',
          ja: '右へ ==>',
          cn: '右右右 ==>',
          ko: '오른쪽으로 ==>',
        },
      },
    },
    {
      // tanks may choose to invuln this, but that is strat specific
      id: 'R7S Slaminator',
      type: 'StartsUsing',
      netRegex: { id: 'A5AE', source: 'Brute Abombinator', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get tower',
          de: 'Nimm Turm',
          fr: 'Prenez une tour',
          ja: '塔踏み',
          cn: '踩塔',
          ko: '탑 밟기',
        },
      },
    },
    {
      id: 'R7S Debris Deathmatch',
      type: 'StartsUsing',
      netRegex: { id: 'A5B0', source: 'Brute Abombinator', capture: false },
      condition: (data) => isHealerOrRanged(data.job),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get tethers',
          de: 'Nimm Verbindung',
          fr: 'Prenez les liens',
          ja: '線取り',
          cn: '接线',
          ko: '선 가져오기',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Smash Here/Smash There': 'Smash Here/There',
        'Winding Wildwinds/Crossing Crosswinds': 'Wildwinds/Crosswinds',
      },
    },
    {
      'locale': 'de',
      'replaceSync': {
        'Blooming Abomination': 'Biestinator-Spross',
        'Brute Abombinator': 'Brutalo Biestinator',
      },
      'replaceText': {
        '--middile--': '--mitte--',
        '\\(adds': '(Adds',
        'cast\\)': 'Wirken)',
        '\\(enrage\\)': '(Finalangriff)',
        '\\(puddles\\)': '(Flächen)',
        '\\(seeds drop\\)': '(Saaten ablegen)',
        'Abominable Blink': 'Brutalo-Funken',
        'Brutal Impact': 'Knallender Impakt',
        'Brutal Smash': 'Brutalo-Schlag',
        'Brutish Swing': 'Brutalo-Schwung',
        'Crossing Crosswinds': 'Kreuzwind',
        'Debris Deathmatch': 'Dornenwand-Todeskampf',
        'Demolition Deathmatch': 'Dornengebäude-Todeskampf',
        'Electrogenetic Force': 'Blitzschlag',
        'Explosion': 'Explosion',
        'Glower Power': 'Brutalo-Blick',
        'Grappling Ivy': 'Efeuhaken',
        'Hurricane Force': 'Sturmgewalt',
        '(?<! )Impact': 'Impakt',
        'Killer Seeds': 'Schwerer Samen',
        'Lashing Lariat': 'Efeu-Lariat',
        'Neo Bombarian Special': 'Neo-Brutalo-Spezial',
        'Pollen': 'Pollen',
        'Powerslam': 'Bombensturz',
        'Pulp Smash': 'Dornenschlag',
        'Quarry Swamp': 'Versteinernde Welle',
        'Revenge of the Vines': 'Welt der Dornen',
        'Roots of Evil': 'Dornenglühen',
        'Sinister Seeds': 'Streusamen',
        'Slaminator': 'Brutalo-Sturz',
        'Smash Here': 'Naher Schlag',
        'Smash There': 'Ferner Schlag',
        'Special Bombarian Special': 'Ultimativer Brutalo-Spezial',
        'Spore Sac': 'Sporensack',
        'Sporesplosion': 'Sporenwolke',
        'Stoneringer(?![s ])': 'Steinwaffe',
        'Stoneringer 2: Stoneringers': 'Steinwaffen-Kombo',
        'Strange Seeds': 'Verwehte Samen',
        'Tendrils of Terror': 'Dornenzaun',
        'The Unpotted': 'Dornenwelle',
        'Thorny Deathmatch': 'Dornen-Todeskampf',
        'Winding Wildwinds': 'Kreiswind',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Blooming Abomination': 'Germe de Bombinator',
        'Brute Abombinator': 'Brute Bombinator',
      },
      'replaceText': {
        '--middile--': '-- Millieu --',
        '\\(adds': '(Adds',
        'cast\\)': 'incantation)',
        '\\(enrage\\)': '(Enrage)',
        '\\(puddles\\)': '(Puddles)',
        '\\(seeds drop\\)': '(Dépose des graines)',
        'Abominable Blink': 'Étincelle brutale',
        'Brutal Impact': 'Impact brutal',
        'Brutal Smash': 'Impact brutal',
        'Brutish Swing': 'Swing brutal',
        'Crossing Crosswinds': 'Bourrasque croisée',
        'Debris Deathmatch': 'Mise à mort épineuse emprisonnée',
        'Demolition Deathmatch': 'Mise à mort épineuse gigantesque',
        'Electrogenetic Force': 'Doigt filiforme',
        'Explosion': 'Explosion',
        'Glower Power': 'Regard brutal',
        'Grappling Ivy': 'Projection spinescente',
        'Hurricane Force': 'Grande tempête de vent',
        '(?<! )Impact(?! )': 'Ensevelissement',
        'Killer Seeds': 'Grosse graine',
        'Lashing Lariat': 'Lariat épineux',
        'Neo Bombarian Special': 'Néo-spéciale brutale',
        'Pollen': 'Pollen',
        'Powerslam': 'Explongeon',
        'Pulp Smash': 'Impact épineux',
        'Quarry Swamp': 'Vague de pétrification',
        'Revenge of the Vines': 'Règne des épines',
        'Roots of Evil': 'Poussée d\'épines',
        'Sinister Seeds': 'Éparpillement des graines',
        'Slaminator': 'Plongeon brutal',
        'Smash Here': 'Balayage proche',
        'Smash There': 'Balayage éloigné',
        'Special Bombarian Special': 'Spéciale brutale ultime',
        'Spore Sac': 'Sac de spores',
        'Sporesplosion': 'Nuage de spores',
        'Stoneringer(?![s ])': 'Arme de pierre',
        'Stoneringer 2: Stoneringers': 'Armes de pierre jumelles',
        'Strange Seeds': 'Dissémination de graines',
        'Tendrils of Terror': 'Grille épineuse',
        'The Unpotted': 'Onde épineuse',
        'Thorny Deathmatch': 'Mise à mort épineuse',
        'Winding Wildwinds': 'Bourrasque circulaire',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Blooming Abomination': 'アボミネータースプラウト',
        'Brute Abombinator': 'ブルートアボミネーター',
      },
      'replaceText': {
        'Abominable Blink': 'ブルートスパーク',
        'Brutal Impact': 'スマッシュインパクト',
        'Brutal Smash': 'ブルートスマッシュ',
        'Brutish Swing': 'ブルートスイング',
        'Crossing Crosswinds': 'クロッシングゲイル',
        'Debris Deathmatch': 'ソーンデスマッチ・ウォール',
        'Demolition Deathmatch': 'ソーンデスマッチ・ビルディング',
        'Electrogenetic Force': '雷撃',
        'Explosion': '爆発',
        'Glower Power': 'ブルートグラワー',
        'Grappling Ivy': 'アイビーグラップル',
        'Hurricane Force': '大暴風',
        '(?<! )Impact': '衝撃',
        'Killer Seeds': 'ヘビーシード',
        'Lashing Lariat': 'アイビーラリアット',
        'Neo Bombarian Special': 'ネオ・ボンバリアンスペシャル',
        'Pollen': '花粉',
        'Powerslam': 'パワーダイブ',
        'Pulp Smash': 'ソーンスマッシュ',
        'Quarry Swamp': '石化の波動',
        'Revenge of the Vines': 'ソーンワールド',
        'Roots of Evil': 'ソーングロウ',
        'Sinister Seeds': 'スキャッターシード',
        'Slaminator': 'ブルートダイブ',
        'Smash Here': 'ニア・スマッシュ',
        'Smash There': 'ファー・スマッシュ',
        'Special Bombarian Special': 'アルティメット・ボンバリアンスペシャル',
        'Spore Sac': 'スポアサック',
        'Sporesplosion': 'スポアクラウド',
        'Stoneringer(?![s ])': 'ストーンウェポン',
        'Stoneringer 2: Stoneringers': 'ストーンウェポン：ツイン',
        'Strange Seeds': 'ブロウシード',
        'Tendrils of Terror': 'ソーンフェンス',
        'The Unpotted': 'ソーンウェーブ',
        'Thorny Deathmatch': 'ソーンデスマッチ',
        'Winding Wildwinds': 'リングゲイル',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Blooming Abomination': '恨心花芽',
        'Brute Abombinator': '野蛮恨心',
      },
      'replaceText': {
        '--middile--': '--中间--',
        '\\(adds': '(小怪',
        'cast\\)': '咏唱)',
        '\\(enrage\\)': '(狂暴)',
        '\\(puddles': '(圈',
        '\\(seeds drop\\)': '(种子落下)',
        'Abominable Blink': '野蛮电火花',
        'Brutal Impact': '野蛮碎击',
        'Brutal Smash': '野蛮挥打',
        'Brutish Swing': '野蛮横扫',
        'Crossing Crosswinds': '交叉突风',
        'Debris Deathmatch': '荆棘生死战：墙面',
        'Demolition Deathmatch': '荆棘生死战：楼体',
        'Electrogenetic Force': '雷击',
        'Explosion': '爆炸',
        'Glower Power': '野蛮怒视',
        'Grappling Ivy': '藤蔓攀附',
        'Hurricane Force': '飓风',
        '(?<! )Impact': '冲击',
        'Killer Seeds': '种弹重击',
        'Lashing Lariat': '藤蔓碎颈臂',
        'Neo Bombarian Special': '新式超豪华野蛮大乱击',
        'Pollen': '花粉',
        'Powerslam': '强震冲',
        'Pulp Smash': '荆棘挥打',
        'Quarry Swamp': '石化波动',
        'Revenge of the Vines': '荆棘领域',
        'Roots of Evil': '荆棘蔓延',
        'Sinister Seeds': '种弹播撒',
        'Slaminator': '野蛮冲',
        'Smash Here': '近侧挥打',
        'Smash There': '远侧挥打',
        'Special Bombarian Special': '究极超豪华野蛮大乱击',
        'Spore Sac': '孢囊',
        'Sporesplosion': '孢子云',
        'Stoneringer(?![s ])': '石制武器',
        'Stoneringer 2: Stoneringers': '双持石制武器',
        'Strange Seeds': '种弹炸裂',
        'Tendrils of Terror': '荆棘缠缚',
        'The Unpotted': '荆棘波',
        'Thorny Deathmatch': '荆棘生死战',
        'Winding Wildwinds': '环形突风',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Blooming Abomination': '새싹 어보미네이터',
        'Brute Abombinator': '브루트 어보미네이터',
      },
      'replaceText': {
        '--middile--': '--중앙--',
        '\\(adds': '(쫄',
        'cast\\)': '시전)',
        '\\(enrage\\)': '(전멸기)',
        '\\(puddles': '(장판',
        '\\(seeds drop\\)': '(씨앗 설치)',
        'Abominable Blink': '비열한 불꽃',
        'Brutal Impact': '비열한 내리치기',
        'Brutal Smash': '비열한 타격',
        'Brutish Swing': '비열한 휘두르기',
        'Crossing Crosswinds': '십자 돌풍',
        'Debris Deathmatch': '가시 데스매치: 벽면',
        'Demolition Deathmatch': '가시 데스매치: 건물',
        'Electrogenetic Force': '뇌격',
        'Explosion': '폭발',
        'Glower Power': '비열한 노려보기',
        'Grappling Ivy': '덩굴 갈고리',
        'Hurricane Force': '대폭풍',
        '(?<! )Impact': '충격',
        'Killer Seeds': '무거운 씨앗',
        'Lashing Lariat': '덩굴 후려갈기기',
        'Neo Bombarian Special': '네오 봄버리안 스페셜',
        'Pollen': '꽃가루',
        'Powerslam': '비열한 강타',
        'Pulp Smash': '가시 타격',
        'Quarry Swamp': '석화의 파동',
        'Revenge of the Vines': '가시 확산',
        'Roots of Evil': '가시 성장',
        'Sinister Seeds': '씨앗 뿌리기',
        'Slaminator': '비열한 강하',
        'Smash Here': '근거리 타격',
        'Smash There': '원거리 타격',
        'Special Bombarian Special': '궁극의 봄버리안 스페셜',
        'Spore Sac': '포자 주머니',
        'Sporesplosion': '포자구름',
        'Stoneringer(?![s ])': '돌 무기',
        'Stoneringer 2: Stoneringers': '돌 무기: 쌍격',
        'Strange Seeds': '씨앗 내뿜기',
        'Tendrils of Terror': '가시 울타리',
        'The Unpotted': '가시 폭풍',
        'Thorny Deathmatch': '가시 데스매치',
        'Winding Wildwinds': '고리 돌풍',
      },
    },
  ],
};

export default triggerSet;
