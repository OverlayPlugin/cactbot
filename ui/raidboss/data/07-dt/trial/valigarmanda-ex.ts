import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { LocaleText, OutputStrings, TriggerSet } from '../../../../../types/trigger';

type Phase = 'start' | 'storm' | 'ice';
export interface Data extends RaidbossData {
  phase: Phase;
  firstStormDebuff?: StormDebuff;
  arcaneLaneSafe: ArcaneLane[];
  avalancheSafe?: 'frontRight' | 'backLeft';
  iceSphereAttackCount: number;
}

// Vali uses uncasted abilities to move between left, middle, and right.
// If Vali moves left, right wedge is safe, and so on:
// 900D (middle -> left), 900E (middle -> right)
// 900F (left -> middle), 9010 (left -> right)
// 9011 (right -> middle), 9012 (right -> left)
type WedgeSafeSpot = 'leftWedgeSafe' | 'middleWedgeSafe' | 'rightWedgeSafe';
const mtFireIdToSafeMap: { [id: string]: WedgeSafeSpot } = {
  '900D': 'rightWedgeSafe',
  '900E': 'leftWedgeSafe',
  '900F': 'middleWedgeSafe',
  '9010': 'leftWedgeSafe',
  '9011': 'middleWedgeSafe',
  '9012': 'rightWedgeSafe',
};
const mtFireIds = Object.keys(mtFireIdToSafeMap);

const mtFireOutputStrings: { [K in WedgeSafeSpot]: LocaleText } = {
  leftWedgeSafe: {
    en: '<= Left Wedge Safe',
    de: '<= Linker Spalt sicher',
    fr: '<= Coin gauche sûr',
    ja: '<= 左が安地',
    cn: '<= 左侧安全',
    ko: '<= 왼쪽 안전',
  },
  middleWedgeSafe: {
    en: 'Middle Wedge Safe',
    de: 'Mittel Spalt sicher',
    ja: '中央が安地',
    cn: '中间安全',
    ko: '가운데 안전',
  },
  rightWedgeSafe: {
    en: 'Right Wedge Safe =>',
    de: 'Rechter Spalt sicher =>',
    fr: 'Coin droit sûr =>',
    ja: '右が安地 =>',
    cn: '右侧安全 =>',
    ko: '오른쪽 안전 =>',
  },
};

const bigAoeOutputStrings: OutputStrings = {
  cone: {
    en: 'Front Corner',
    de: 'Vordere Ecken',
    fr: 'Coin devant',
    ja: '前方の角へ',
    cn: '前面角落',
    ko: '앞쪽 구석으로',
  },
  donut: {
    en: 'Donut (In)',
    de: 'Donut (Rein)',
    fr: 'Donut (Intérieur)',
    ja: 'ドーナツの中へ',
    cn: '中间月环',
    ko: '도넛 안으로',
  },
  out: Outputs.outOfMelee,
};

type StormDebuff = 'ice' | 'lightning';
const stormDebuffMap: { [id: string]: StormDebuff } = {
  'EEC': 'ice',
  'EF0': 'lightning',
};
const stormDebuffIds = Object.keys(stormDebuffMap);

const arcaneLanesConst = [
  'northFront',
  'northBack',
  'middleFront',
  'middleBack',
  'southFront',
  'southBack',
] as const;
type ArcaneLane = typeof arcaneLanesConst[number];

const triggerSet: TriggerSet<Data> = {
  id: 'WorquorLarDorExtreme',
  zoneId: ZoneId.WorqorLarDorExtreme,
  timelineFile: 'valigarmanda-ex.txt',
  initData: () => {
    return {
      arcaneLaneSafe: [...arcaneLanesConst],
      phase: 'start',
      iceSphereAttackCount: 0,
    };
  },
  triggers: [
    {
      id: 'Valigarmanda Ex Phase Tracker',
      type: 'StartsUsing',
      netRegex: { id: ['95C3', '8FD1'], source: 'Valigarmanda' },
      run: (data, matches) => data.phase = matches.id === '95C3' ? 'storm' : 'ice',
    },
    {
      // The first Spikecicle MapEffect line comes shortly before Spikecicle starts casting.
      // The locations are [04, 06, 08, 0A, 0C] (starting center curving east, moving outward),
      // or [05, 07, 09, 0B, 0D] (starting center curving west, moving outward).
      // Vali always starts with '04' or '05', followed by the entire opposite sequence,
      // before resuming the original sequence, e.g., 05 -> 04 thru 0C -> 07 thru 0D.
      id: 'Valigarmanda Ex Spikesicle',
      type: 'MapEffect',
      netRegex: { flags: '00020004', location: ['04', '05'] },
      suppressSeconds: 5,
      alertText: (_data, matches, output) =>
        matches.location === '04' ? output.westSafe!() : output.eastSafe!(),
      outputStrings: {
        westSafe: Outputs.getLeftAndWest,
        eastSafe: Outputs.getRightAndEast,
      },
    },
    {
      id: 'Valigarmanda Ex Skyruin Fire',
      type: 'StartsUsing',
      netRegex: { id: '95C4', source: 'Valigarmanda', capture: false },
      // This is a long (~11s) cast bar, although logs show a 5.7s cast time,
      // followed by a 4.2 cast of '8FD4' (Skyruin) which is the actual damage.
      // Use the original cast + a delay so people can change the alert timing.
      delaySeconds: 6,
      response: Responses.bleedAoe(),
    },
    {
      id: 'Valigarmanda Ex Triscourge',
      type: 'StartsUsing',
      netRegex: { id: '8FE7', source: 'Valigarmanda', capture: false },
      response: Responses.aoe(),
    },
    {
      // 0E: east volcano, 0F: west volcano
      id: 'Valigarmanda Ex Volcano',
      type: 'MapEffect',
      netRegex: { flags: '00200010', location: ['0E', '0F'] },
      alertText: (_data, matches, output) =>
        matches.location === '0E' ? output.westSafe!() : output.eastSafe!(),
      outputStrings: {
        westSafe: Outputs.getLeftAndWest,
        eastSafe: Outputs.getRightAndEast,
      },
    },
    {
      id: 'Valigarmanda Ex Big AOE + Partners',
      type: 'StartsUsing',
      // no cast bar, and partner stacks follow
      // 8FC7: Susurrant Breath (conal)
      // 8FCB: Slithering Strike (out)
      // 8FCF: Strangling Coil (donut)
      netRegex: { id: ['8FC7', '8FCB', '8FCF'], source: 'Valigarmanda' },
      durationSeconds: 7,
      alertText: (_data, matches, output) => {
        if (matches.id === '8FC7') {
          return output.combo!({ type: output.cone!() });
        } else if (matches.id === '8FCB') {
          return output.combo!({ type: output.out!() });
        }
        return output.combo!({ type: output.donut!() });
      },
      outputStrings: {
        ...bigAoeOutputStrings,
        combo: {
          en: '${type} => Stack w/Partner',
          de: '${type} => Sammeln mit Partner',
          fr: '${type} => Package avec votre partenaire',
          ja: '${type} => ペアで頭割り',
          cn: '${type} => 和搭档分摊',
          ko: '${type} => 파트너 쉐어',
        },
      },
    },
    {
      // When this effect expires, players gain 'DC3' (Freezing Up) for 2s (the actual move-check).
      // Use a longer duration to keep the reminder up until the debuff falls off.
      id: 'Valigarmanda Ex Calamity\'s Chill',
      type: 'GainsEffect',
      netRegex: { effectId: 'EEE' },
      condition: Conditions.targetIsYou(),
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 4,
      durationSeconds: 6,
      response: Responses.moveAround('alert'),
    },
    {
      id: 'Valigarmanda Ex Calamity\'s Bolt',
      type: 'GainsEffect',
      netRegex: { effectId: 'EEF' },
      condition: Conditions.targetIsYou(),
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 6,
      durationSeconds: 6,
      response: Responses.spread(),
    },
    {
      id: 'Valigarmanda Ex Calamity\'s Inferno',
      type: 'GainsEffect',
      netRegex: { effectId: 'EEA' },
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 6,
      durationSeconds: 6,
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.healerGroups!(),
      outputStrings: {
        healerGroups: Outputs.healerGroups,
      },
    },
    {
      id: 'Valigarmanda Ex Mountain Fire Tank',
      type: 'Ability',
      netRegex: { id: '900C', source: 'Valigarmanda', capture: false },
      condition: (data) => data.role === 'tank',
      // There's ~5.5s between the end of the cast and damage applied from first tower soak.
      // The tower soak/damage happens six times; use a long duration to keep this reminder up.
      durationSeconds: 30.5,
      // use infoText to distinguish from wedge direction alert calls at the same time
      infoText: (_data, _matches, output) => output.soakSwap!(),
      outputStrings: {
        soakSwap: {
          en: 'Tank Tower (soak/swap)',
          de: 'Tank Türme (nehmen/wechseln)',
          fr: 'Tank tour (encaisser/swap)',
          ja: 'タンク塔 (踏む/スイッチ)',
          cn: '双T轮换踩塔',
          ko: '탱커 기둥 (밟기/교대)',
        },
      },
    },
    {
      id: 'Valigarmanda Ex Mountain Fire First Wedge',
      type: 'Ability',
      netRegex: { id: '900C', source: 'Valigarmanda', capture: false },
      // slight delay so as not to overlap with the tank tower call
      delaySeconds: 1,
      alertText: (_data, _matches, output) => output.firstFire!(),
      outputStrings: {
        firstFire: mtFireOutputStrings.middleWedgeSafe,
      },
    },
    {
      id: 'Valigarmanda Ex Mountain Fire Subsequent Wedge',
      type: 'Ability',
      netRegex: { id: mtFireIds, source: 'Valigarmanda' },
      alertText: (_data, matches, output) => {
        const safe = mtFireIdToSafeMap[matches.id];
        if (safe === undefined)
          return;
        return output[safe]!();
      },
      outputStrings: mtFireOutputStrings,
    },
    {
      id: 'Valigarmanda Ex Disaster Zone',
      type: 'StartsUsing',
      netRegex: { id: ['8FD5', '8FD7', '8FD9'], source: 'Valigarmanda', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'Valigarmanda Ex Ruin Foretold',
      type: 'StartsUsing',
      netRegex: { id: '9692', source: 'Valigarmanda', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Valigarmanda Ex Adds + Wild Charge Stacks',
      type: 'GainsEffect',
      netRegex: { effectId: 'B7B', capture: false },
      // This effect is continuously re-applied during the phase, so big suppress needed
      suppressSeconds: 99999,
      alertText: (data, _matches, output) => {
        const roleOutput = data.role === 'tank' ? output.tank!() : output.nonTank!();
        return output.combo!({ role: roleOutput });
      },
      outputStrings: {
        combo: {
          en: 'Kill Adds + Healer Groups ${role}',
          de: 'Adds besiegen + Heiler Gruppen ${role}',
          fr: 'Tuez les adds + groupe sur les heals ${role}',
          ja: '雑魚を倒して + ヒラグループ ${role}',
          cn: '击杀小怪 + 治疗分摊组 ${role}',
          ko: '쫄 잡기 + 힐러 그룹 ${role}',
        },
        tank: {
          en: '(be in front)',
          de: '(rein vorne)',
          fr: '(allez devant)',
          ja: '(前へ)',
          cn: '(站在最前面)',
          ko: '(앞에 서기)',
        },
        nonTank: {
          en: '(behind tank)',
          de: '(hinter den Tank)',
          fr: '(derrière le tank)',
          ja: '(タンクの後ろへ)',
          cn: '(站坦克后面)',
          ko: '(탱커 뒤에 서기)',
        },
      },
    },
    // 3-hit AOE. First damage applied ~3.1s after cast finishes, then ~8.5s & ~16.5 thereafter.
    // Time these alerts so that warnings go out ~5s before each hit.
    {
      id: 'Valigarmanda Ex Tulidisaster 1',
      type: 'StartsUsing',
      netRegex: { id: '9008', capture: false },
      delaySeconds: 5,
      response: Responses.aoe(),
    },
    {
      id: 'Valigarmanda Ex Tulidisaster 2',
      type: 'StartsUsing',
      netRegex: { id: '9008', capture: false },
      delaySeconds: 13.5,
      response: Responses.aoe(),
    },
    {
      id: 'Valigarmanda Ex Tulidisaster 3',
      type: 'StartsUsing',
      netRegex: { id: '9008', capture: false },
      delaySeconds: 21.5,
      response: Responses.aoe(),
    },

    //
    // ------------- STORM PHASE -------------
    //
    {
      id: 'Valigarmanda Ex Skyruin Storm',
      type: 'StartsUsing',
      netRegex: { id: '95C3', source: 'Valigarmanda', capture: false },
      // This is a long (~11s) cast bar, although logs show a 5.7s cast time,
      // followed by a 4.2 cast of '8FD3' (Skyruin) which is the actual damage.
      // Use the original cast + delay so people can change the alert timing.
      delaySeconds: 6,
      response: Responses.bleedAoe(),
    },
    {
      id: 'Valigarmanda Ex Storm Debuffs',
      type: 'GainsEffect',
      netRegex: { effectId: stormDebuffIds },
      condition: Conditions.targetIsYou(),
      run: (data, matches) => {
        const debuff = stormDebuffMap[matches.effectId];
        const duration = parseFloat(matches.duration);
        // each player receives both debuffs - one is 59s, the other 99s
        if (debuff === undefined || duration > 60)
          return;
        data.firstStormDebuff = debuff;
      },
    },
    {
      id: 'Valigarmanda Ex Calamity\'s Flames',
      type: 'GainsEffect',
      netRegex: { effectId: 'EE9' },
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 6,
      durationSeconds: 6,
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.healerGroups!(),
      outputStrings: {
        healerGroups: Outputs.healerGroups,
      },
    },
    // 901D is the 'Hail of Feathers' cast from the first feather to drop
    // Use 'StartsUsingExtra', as 'StartsUsing' positions can be stale.
    {
      //
      id: 'Valigarmanda Ex Hail of Feathers',
      type: 'StartsUsingExtra',
      netRegex: { id: '901D' },
      alertText: (_data, matches, output) => {
        const posX = parseFloat(matches.x);
        if (posX < 100)
          return output.startEast!();
        return output.startWest!();
      },
      outputStrings: {
        startEast: Outputs.getRightAndEast,
        startWest: Outputs.getLeftAndWest,
      },
    },
    {
      id: 'Valigarmanda Ex Feather of Ruin',
      type: 'Ability',
      netRegex: { id: '8FDE', source: 'Feather of Ruin', capture: false },
      // only need to capture one, but delay the alert for people to rotate
      delaySeconds: 5,
      durationSeconds: 8,
      suppressSeconds: 99999,
      infoText: (_data, _matches, output) => output.killFeather!(),
      outputStrings: {
        killFeather: {
          en: 'Kill Feather => Stand in safe tile',
          de: 'Feder besiegen => Auf sicherer Flächen sein',
          fr: 'Tuez la plume => restez sur la tuile sûre',
          ja: '羽を壊す => 安全な床へ',
          cn: '击杀羽毛 => 站安全格内',
          ko: '깃털 부수기 => 안전한 칸으로',
        },
      },
    },
    {
      id: 'Valigarmanda Ex Post-Feather Spread',
      type: 'Ability',
      // as soon as the feathers explode, people can spread
      // use a longer duration to better align to the mechanic
      netRegex: { id: '8FDF', source: 'Valigarmanda', capture: false },
      durationSeconds: 10,
      alertText: (data, _matches, output) => {
        if (data.firstStormDebuff === undefined)
          return;
        return output[data.firstStormDebuff]!();
      },
      outputStrings: {
        ice: {
          en: 'Spread - elevated tile',
          de: 'Verteilen - auf schwebender Flächen',
          fr: 'Dispersion - tuile surélevée',
          ja: '散開 - 高台',
          cn: '分散 - 高台格',
          ko: '산개 - 공중부양 칸',
        },
        lightning: {
          en: 'Spread - ground tile',
          de: 'Verteilen - Flächen auf dem Boden',
          fr: 'Dispersion - tuile au sol',
          ja: '散開 - 地面',
          cn: '分散 - 地面格',
          ko: '산개 - 지상 칸',
        },
      },
    },
    {
      id: 'Valigarmanda Ex Storm Big AOEs + Bait',
      type: 'StartsUsing',
      // no cast bar, and baited AOE puddles follow
      // 8FC5: Susurrant Breath (conal)
      // 8FC9: Slithering Strike (out)
      // 8FCD: Strangling Coil (donut)
      netRegex: { id: ['8FC5', '8FC9', '8FCD'], source: 'Valigarmanda' },
      durationSeconds: 7,
      alertText: (_data, matches, output) => {
        if (matches.id === '8FC5') {
          return output.combo!({ type: output.cone!() });
        } else if (matches.id === '8FC9') {
          return output.combo!({ type: output.out!() });
        }
        return output.combo!({ type: output.donut!() });
      },
      outputStrings: {
        ...bigAoeOutputStrings,
        combo: {
          en: '${type} => Bait Puddles',
          de: '${type} => Flächen ködern',
          fr: '${type} => attirez les puddles',
          ja: '${type} => 捨てて',
          cn: '${type} => 引导火圈',
          ko: '${type} => 장판 유도',
        },
      },
    },
    {
      id: 'Valigarmanda Ex Crackling Cataclysm',
      type: 'StartsUsing',
      netRegex: { id: '8FC1', source: 'Valigarmanda', capture: false },
      suppressSeconds: 2,
      response: Responses.moveAway('alarm'),
    },
    {
      // NOTE: Have not seen any logs with stale position data, but if its an issue,
      // this can be changed to a `getCombatants` call.
      id: 'Valigarmanda Ex Storm Arcane Sphere Collect',
      type: 'AddedCombatant',
      netRegex: { name: 'Arcane Sphere' },
      durationSeconds: 6,
      run: (data, matches) => {
        const posY = parseFloat(matches.y);
        // 5 spheres will spawn in 6 possible y positions: 87.5, 92.5, 97.5, 102.5, 107.5, 112.5
        if (posY < 88)
          data.arcaneLaneSafe = data.arcaneLaneSafe.filter((lane) => lane !== 'northFront');
        else if (posY < 93)
          data.arcaneLaneSafe = data.arcaneLaneSafe.filter((lane) => lane !== 'northBack');
        else if (posY < 98)
          data.arcaneLaneSafe = data.arcaneLaneSafe.filter((lane) => lane !== 'middleFront');
        else if (posY < 103)
          data.arcaneLaneSafe = data.arcaneLaneSafe.filter((lane) => lane !== 'middleBack');
        else if (posY < 108)
          data.arcaneLaneSafe = data.arcaneLaneSafe.filter((lane) => lane !== 'southFront');
        else
          data.arcaneLaneSafe = data.arcaneLaneSafe.filter((lane) => lane !== 'southBack');
      },
    },
    {
      id: 'Valigarmanda Ex Storm Arcane Sphere Safe',
      type: 'AddedCombatant',
      netRegex: { name: 'Arcane Sphere', capture: false },
      condition: (data) => data.phase === 'storm',
      delaySeconds: 1, // let Collect finish first
      suppressSeconds: 2,
      alertText: (data, _matches, output) => {
        const safeStr = data.arcaneLaneSafe[0];
        if (data.arcaneLaneSafe.length !== 1 || safeStr === undefined)
          return output.avoid!();
        return output.combo!({ dir: output[safeStr]!() });
      },
      outputStrings: {
        avoid: {
          en: 'Dodge spheres - elevated tile',
          de: 'Spheren ausweichen - schwebende Fläche',
          fr: 'Évitez les sphères - tuile surélevée',
          ja: '玉を避ける - 高台',
          ko: '장판 피하기 - 공중부양 칸',
        },
        combo: {
          en: '${dir} - elevated tile',
          de: '${dir} - schwebende Fläche',
          fr: '${dir} - tuile surélevée',
          ja: '${dir} - 高台',
          cn: '${dir} - 高台格',
          ko: '${dir} - 공중부양 칸',
        },
        northFront: {
          en: 'North Row, Front Half',
          de: 'Nördliche Reihe, Vordere Hälfte',
          fr: 'Ligne Nord, Moitié avant',
          ja: '北側の前方へ',
          cn: '上(北)行 前半',
          ko: '북쪽 줄, 앞부분',
        },
        northBack: {
          en: 'North Row, Back Half',
          de: 'Nördliche Reihe, Hintere Hälfte',
          fr: 'Ligne Nord, Moitié arrière',
          ja: '北側の後方へ',
          cn: '上(北)行 后半',
          ko: '북쪽 줄, 뒷부분',
        },
        middleFront: {
          en: 'Middle Row, Front Half',
          de: 'Mittlere Reihe, Vordere Hälfte',
          fr: 'Ligne centrale, Moitié avant',
          ja: '中央の前方へ',
          cn: '中间行 前半',
          ko: '가운데 줄, 앞부분',
        },
        middleBack: {
          en: 'Middle Row, Back Half',
          de: 'Mittlere Reihe, Hintere Hälfte',
          fr: 'Ligne centrale, Moitié arrière',
          ja: '中央の後方へ',
          cn: '中间行 后半',
          ko: '가운데 줄, 뒷부분',
        },
        southFront: {
          en: 'South Row, Front Half',
          de: 'Südliche Reihe, Vordere Hälfte',
          fr: 'Ligne Sud, Moitié avant',
          ja: '南側の前方へ',
          cn: '下(南)行 前半',
          ko: '남쪽 줄, 앞부분',
        },
        southBack: {
          en: 'South Row, Back Half',
          de: 'Südliche Reihe, Hintere Hälfte',
          fr: 'Ligne Sud, Moitié arrière',
          ja: '南側の後方へ',
          cn: '下(南)行 后半',
          ko: '남쪽 줄, 뒷부분',
        },
      },
    },
    {
      id: 'Valigarmanda Ex Post-Arcane Sphere Spread',
      type: 'Ability',
      // as soon as the arcane spheres go off, people can spread
      netRegex: { id: '985A', source: 'Arcane Sphere', capture: false },
      durationSeconds: 9,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        // This is the opposite of firstStormDebuff (as it's the second one)
        if (data.firstStormDebuff === undefined)
          return;
        if (data.firstStormDebuff === 'ice')
          return output.lightning!();
        return output.ice!();
      },
      outputStrings: {
        ice: {
          en: 'Spread - elevated tile',
          de: 'Verteilen - auf schwebender Flächen',
          fr: 'Dispersion - tuile surélevée',
          ja: '散開 - 高台',
          cn: '分散 - 高台格',
          ko: '산개 - 공중부양 칸',
        },
        lightning: {
          en: 'Spread - ground tile',
          de: 'Verteilen - Flächen auf dem Boden',
          fr: 'Dispersion - tuile au sol',
          ja: '散開 - 地面',
          cn: '分散 - 地面格',
          ko: '산개 - 지상 칸',
        },
      },
    },
    {
      id: 'Valigarmanda Ex Ruinfall Tower',
      type: 'StartsUsing',
      netRegex: { id: '8FFD', source: 'Valigarmanda', capture: false },
      infoText: (data, _matches, output) => {
        if (data.role === 'tank')
          return output.soakTower!();
        return output.avoidTower!();
      },
      outputStrings: {
        soakTower: {
          en: 'Soak Tower',
          de: 'Turm nehmen',
          fr: 'Prenez la Tour',
          ja: '塔を踏む',
          cn: '踩塔',
          ko: '기둥 밟기',
        },
        avoidTower: {
          en: 'Avoid Tower',
          de: 'Turm vermeiden',
          fr: 'Évitez la tour',
          ja: '塔を避ける',
          cn: '远离塔',
          ko: '기둥 피하기',
        },
      },
    },
    {
      id: 'Valigarmanda Ex Ruinfall Knockback',
      type: 'StartsUsing',
      netRegex: { id: '8FFF', source: 'Valigarmanda', capture: false },
      // 8s between cast start and knockback applied
      delaySeconds: 3,
      response: Responses.knockback(),
    },

    //
    // ------------- ICE PHASE -------------
    //
    {
      id: 'Valigarmanda Ex Skyruin Ice',
      type: 'StartsUsing',
      netRegex: { id: '8FD1', source: 'Valigarmanda', capture: false },
      // This is a long (~11s) cast bar, although logs show a 5.7s cast time,
      // followed by a 4.2 cast of '8FD2' (Skyruin) which is the actual damage.
      // Use the original cast + delay so people can change the alert timing.
      delaySeconds: 6,
      response: Responses.bleedAoe(),
    },
    {
      // George R.R. Martin, don't sue us.
      id: 'Valigarmanda Ex Scourge of Ice and Fire',
      type: 'GainsEffect',
      // EEB - Calamity's Embers (Fire), EED - Calamity's Bite (ice)
      // We only need one, since alerts are entirely role-based.
      netRegex: { effectId: 'EEB', capture: false },
      delaySeconds: 5,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (data.role === 'tank')
          return output.away!();
        return output.healerGroups!();
      },
      outputStrings: {
        away: Outputs.awayFromGroup,
        healerGroups: Outputs.healerGroups,
      },
    },
    {
      id: 'Valigarmanda Ex Avalanche Collect',
      type: 'MapEffect',
      // 00020001 - cleaves SW half (front/right safe)
      // 00200010 - cleaves NE half (back/left safe)
      netRegex: { flags: ['00020001', '00200010'], location: '03' },
      run: (data, matches) => {
        if (matches.flags === '00020001')
          data.avalancheSafe = 'frontRight';
        else
          data.avalancheSafe = 'backLeft';
      },
    },
    {
      id: 'Valigarmanda Ex Big AOE + Avalanche',
      type: 'StartsUsing',
      // no cast bar, paired with an avalanche
      // 8FC6: Susurrant Breath (conal)
      // 8FCA: Slithering Strike (out)
      // 8FCE: Strangling Coil (donut)
      netRegex: { id: ['8FC6', '8FCA', '8FCE'], source: 'Valigarmanda' },
      durationSeconds: 7,
      alertText: (data, matches, output) => {
        // these casts also happen in the final (no-avalanche) aoe mechanic
        // so use data.avalancheSafe to prevent this trigger from mis-firing
        if (data.avalancheSafe === undefined)
          return;

        // we can use backLeft/frontRight output as/is for donut and out,
        // but for cone, we'll need to tweak it
        let safe: 'backLeft' | 'frontRight' | 'coneNWSafe' | 'coneNESafe';
        if (matches.id === '8FC6')
          safe = data.avalancheSafe === 'backLeft' ? 'coneNWSafe' : 'coneNESafe';
        else
          safe = data.avalancheSafe;

        const safeOutput = output[safe]!();

        let typeOutput;
        if (matches.id === '8FC6')
          typeOutput = output.cone!();
        else if (matches.id === '8FCA')
          typeOutput = output.out!();
        else
          typeOutput = output.donut!();

        return output.combo!({ type: typeOutput, safe: safeOutput });
      },
      run: (data) => delete data.avalancheSafe,
      outputStrings: {
        ...bigAoeOutputStrings,
        backLeft: {
          en: 'Be Back/Left',
          de: 'Sei Hinten/Links',
          fr: 'Arrière/Gauche',
          ja: '後ろ/左へ',
          cn: '左/后 安全',
          ko: '뒤/왼쪽으로',
        },
        frontRight: {
          en: 'Be Front/Right',
          de: 'Sei Vorne/Rechts',
          fr: 'Devant/Droite',
          ja: '前/右へ',
          cn: '右/前 安全',
          ko: '앞/오른쪽으로',
        },
        coneNWSafe: {
          en: 'NW Safe',
          de: 'NW Sicher',
          fr: 'NO Sûr',
          ja: '左上(北西) 安地',
          cn: '左上(西北) 安全',
          ko: '왼쪽 위 안전',
        },
        coneNESafe: {
          en: 'NE Safe',
          de: 'NO Sicher',
          fr: 'NE Sûr',
          ja: '右上(北東) 安地',
          cn: '右上(东北) 安全',
          ko: '오른쪽 위 안전',
        },
        unknown: {
          en: 'Dodge Avalanche',
          de: 'Lawine ausweichen',
          fr: 'Esquivez l\'avalanche',
          ja: '雪崩を避けて',
          cn: '躲避雪崩',
          ko: '눈사태 피하기',
        },
        combo: {
          en: '${type} - ${safe}',
          de: '${type} - ${safe}',
          fr: '${type} - ${safe}',
          ja: '${type} - ${safe}',
          cn: '${type} - ${safe}',
          ko: '${type} - ${safe}',
        },
      },
    },
    {
      // Safe corner is opposite the northmost sphere
      // NOTE: Have not seen any logs with stale position data, but if its an issue,
      // this can be changed to a `getCombatants` call.
      id: 'Valigarmanda Ex Ice Arcane Sphere Safe',
      type: 'AddedCombatant',
      netRegex: { name: 'Arcane Sphere' },
      condition: (data) => data.phase === 'ice',
      alertText: (data, matches, output) => {
        const posY = parseFloat(matches.y);
        if (posY > 90)
          return;

        // this part of the trigger only gets reached once per set of spheres,
        // so we can increment the counter
        data.iceSphereAttackCount++;

        const posX = parseFloat(matches.x);
        if (posX > 100)
          return output.nwSafe!();
        return output.neSafe!();
      },
      outputStrings: {
        nwSafe: Outputs.northwest,
        neSafe: Outputs.northeast,
      },
    },
    {
      id: 'Valigarmanda Spikecicle + Avalanche',
      type: 'Ability',
      // Use the cast of Spikesicle during ice phase, but allow 5 seconds for Collect
      netRegex: { id: '8FF2', source: 'Valigarmanda', capture: false },
      condition: (data) => data.phase === 'ice',
      delaySeconds: 5,
      alertText: (data, _matches, output) => {
        if (data.avalancheSafe === undefined)
          return output.unknown!();
        else if (data.avalancheSafe === 'backLeft')
          return output.dodgeLeft!();
        return output.dodgeRight!();
      },
      run: (data) => delete data.avalancheSafe,
      outputStrings: {
        dodgeLeft: {
          en: '<= Go Left (Dodge Avalanche)',
          de: '<= Geh Links (Lawine ausweichen)',
          fr: '<= Allez à gauche (Esquivez l\'avalanche)',
          ja: '<= 左へ (雪崩を避けて)',
          cn: '<= 去左边 (躲避雪崩)',
          ko: '<= 왼쪽으로 (눈사태 피하기)',
        },
        dodgeRight: {
          en: 'Go Right (Dodge Avalanche) =>',
          de: 'Geh Rechts (Lawine ausweichen) =>',
          fr: 'Allez à droite (Esquivez l\'avalanche) =>',
          ja: '右へ => (雪崩を避けて)',
          cn: '去右边 (躲避雪崩) =>',
          ko: '오른쪽으로 (눈사태 피하기) =>',
        },
        unknown: {
          en: 'Dodge Avalanche',
          de: 'Lawine ausweichen',
          fr: 'Esquivez l\'avalanche',
          ja: '雪崩を避けて',
          cn: '躲避雪崩',
          ko: '눈사태 피하기',
        },
      },
    },
    {
      id: 'Valigarmanda Ex Ice Big AOE',
      type: 'StartsUsing',
      // no cast bar, and no paired mechanic for this one
      // 8FC8: Susurrant Breath (conal)
      // 8FCC: Slithering Strike (out)
      // 8FD0: Strangling Coil (donut)
      netRegex: { id: ['8FC8', '8FCC', '8FD0'], source: 'Valigarmanda' },
      // since these casts also accompany the same cast ids used for avalanche, use a condition
      condition: (data) => data.phase === 'ice' && data.avalancheSafe === undefined,
      durationSeconds: 7,
      alertText: (_data, matches, output) => {
        if (matches.id === '8FC8')
          return output.cone!();
        else if (matches.id === '8FCC')
          return output.out!();
        return output.donut!();
      },
      outputStrings: bigAoeOutputStrings,
    },
    {
      id: 'Valigarmanda Ex Ice Arcane Sphere + Avalanche',
      type: 'Ability',
      netRegex: { id: '8FC2', source: 'Arcane Sphere', capture: false },
      // Avalanche only happens on the second set of Spheres during ice phase
      condition: (data) => data.phase === 'ice' && data.iceSphereAttackCount === 2,
      suppressSeconds: 2,
      alertText: (data, _matches, output) => {
        if (data.avalancheSafe === undefined)
          return output.unknown!();
        else if (data.avalancheSafe === 'backLeft')
          return output.dodgeLeft!();
        return output.dodgeRight!();
      },
      run: (data) => delete data.avalancheSafe,
      outputStrings: {
        dodgeLeft: {
          en: '<= Go Left (Dodge Avalanche)',
          de: '<= Geh Links (Lawine ausweichen)',
          fr: '<= Allez à gauche (Esquivez l\'avalanche)',
          ja: '<= 左へ (雪崩を避けて)',
          cn: '<= 去左边 (躲避雪崩)',
          ko: '<= 왼쪽으로 (눈사태 피하기)',
        },
        dodgeRight: {
          en: 'Go Right (Dodge Avalanche) =>',
          de: 'Geh Rechts (Lawine ausweichen) =>',
          fr: 'Allez à droite (Esquivez l\'avalanche) =>',
          ja: '右へ => (雪崩を避けて)',
          cn: '去右边 (躲避雪崩) =>',
          ko: '오른쪽으로 (눈사태 피하기) =>',
        },
        unknown: {
          en: 'Dodge Avalanche',
          de: 'Lawine ausweichen',
          fr: 'Esquivez l\'avalanche',
          ja: '雪崩を避けて',
          cn: '躲避雪崩',
          ko: '눈사태 피하기',
        },
      },
    },
    {
      id: 'Valigarmanda Ex Freezing Dust',
      type: 'StartsUsing',
      netRegex: { id: '8FF0', source: 'Valigarmanda', capture: false },
      response: Responses.moveAround('alert'),
    },
    // Don't need a trigger for Ice Talon -- it's very obvious and not fast

    //
    // ------------- FINAL PHASE -------------
    //
    {
      id: 'Valigarmanda Ex Wrath Unfurled',
      type: 'StartsUsing',
      netRegex: { id: '9945', source: 'Valigarmanda', capture: false },
      response: Responses.aoe(),
    },
    // All other mechanics are repeats of earlier mechanics and handled by those triggers.
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Strangling Coil/Slithering Strike/Susurrant Breath': 'Middle/Away/Front Corners',
      },
    },
    {
      'locale': 'de',
      'replaceSync': {
        'Arcane Sphere': 'arkan(?:e|er|es|en) Sphäre',
        'Feather of Ruin': 'Feder der Geißel',
        'Flame-kissed Beacon': 'flammend(?:e|er|es|en) Omen',
        'Ice Boulder': 'Eisbrocken',
        'Thunderous Beacon': 'blitzend(?:e|er|es|en) Omen',
        'Valigarmanda': 'Valigarmanda',
      },
      'replaceText': {
        'Blighted Bolt': 'Unheilvoller Blitzschlag',
        'Calamitous Cry': 'Unheilvoller Schrei',
        'Charring Cataclysm': 'Infernales Desaster',
        'Chilling Cataclysm': 'Gefrorenes Desaster',
        'Crackling Cataclysm': 'Donnerndes Desaster',
        'Disaster Zone': 'Katastrophengebiet',
        'Freezing Dust': 'Froststaub',
        'Hail of Feathers': 'Federhagel',
        'Ice Boulder': 'Eisbrocken',
        'Ice Talon': 'Eiskralle',
        'Mountain Fire': 'Bergfeuer',
        'Northern Cross': 'Kreuz des Nordens',
        'Ruin Foretold': 'Katastrophenwarnung',
        'Ruinfall': 'Ruinsturz',
        'Scourge of Fire': 'Geißel des Feuers',
        'Scourge of Ice/Fire': 'Geißel des Eises/Feuers',
        'Scourge of Thunder': 'Geißel des Donners',
        'Skyruin': 'Geißel der Himmel',
        'Slithering Strike': 'Schlängelnder Hieb',
        'Sphere Shatter': 'Sphärensplitterung',
        'Spikesicle': 'Eislanze',
        'Strangling Coil': 'Würgewickel',
        'Susurrant Breath': 'Zischender Atem',
        'Thunderous Breath': 'Gewitteratem',
        'Triscourge': 'Dreifache Geißel',
        'Tulidisaster': 'Turalisaster',
        'Valigarmanda': 'Valigarmanda',
        'Volcanic Drop': 'Feuerbergbombe',
        'Wrath Unfurled': 'Entfalteter Zorn',
        '\\(cast\\)': '(wirken)',
        '\\(damage\\)': '(Schaden)',
        '\\(enrage\\)': '(Finalangriff)',
        '\\(fire phase\\)': '(Feuer Phase)',
        '\\(ice phase\\)': '(Eis Phase)',
        '\\(ice or storm phase?\\)': '(Eis oder Blitz Phase)',
        '\\(knockback\\)': '(Rückstoß)',
        '\\(storm phase\\)': '(Blitz Phase)',
        '\\(tower\\)': '(Turm)',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Arcane Sphere': 'sphère arcanique',
        'Feather of Ruin': 'plume de Valigarmanda',
        'Flame-kissed Beacon': 'pylône de feu',
        'Ice Boulder': 'amas de glace',
        'Thunderous Beacon': 'pylône de foudre',
        'Valigarmanda': 'Valigarmanda',
      },
      'replaceText': {
        'Blighted Bolt': 'Éclairs de foudre catastrophiques',
        'Calamitous Cry': 'Cri calamiteux',
        'Charring Cataclysm': 'Désastre brûlant',
        'Chilling Cataclysm': 'Désastre glaçant',
        'Crackling Cataclysm': 'Désastre foudroyant',
        'Disaster Zone': 'Zone de désastre',
        'Freezing Dust': 'Poussière glaçante',
        'Hail of Feathers': 'Déluge de plumes',
        'Ice Boulder': 'amas de glace',
        'Ice Talon': 'Serres de glace',
        'Mountain Fire': 'Feu de montagne',
        'Northern Cross': 'Croix du nord',
        'Ruin Foretold': 'Signe de désastre',
        'Ruinfall': 'Plongeon calamiteux',
        'Scourge of Fire': 'Fléau brûlant',
        'Scourge of Ice': 'Fléau glaçant',
        'Scourge of Thunder': 'Fléau foudroyant',
        'Skyruin': 'Désastre vivant',
        'Slithering Strike': 'Frappe sinueuse',
        'Sphere Shatter': 'Rupture glacée',
        'Spikesicle': 'Stalactopointe',
        'Strangling Coil': 'Enroulement sinueux',
        'Susurrant Breath': 'Souffle sinueux',
        'Thunderous Breath': 'Souffle du dragon',
        'Triscourge': 'Tri-fléau',
        'Tulidisaster': 'Désastre du Tural',
        'Valigarmanda': 'Valigarmanda',
        'Volcanic Drop': 'Obus volcanique',
        'Wrath Unfurled': 'Rage déployée',
        '\\(cast\\)': '(Incante)',
        '\\(damage\\)': '(Dommage)',
        '\\(enrage\\)': '(Enrage)',
        '\\(fire phase\\)': '(Phase de Feu)',
        '\\(ice phase\\)': '(Phase de Glace)',
        '\\(ice or storm phase?\\)': '(Phase de Feu ou de Glace)',
        '\\(knockback\\)': '(Poussée)',
        '\\(storm phase\\)': '(Phase Orageuse)',
        '\\(tower\\)': '(Tour)',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Arcane Sphere': '立体魔法陣',
        'Feather of Ruin': 'ヴァリガルマンダの羽根',
        'Flame-kissed Beacon': '火の徴',
        'Ice Boulder': '氷塊',
        'Thunderous Beacon': '雷の徴',
        'Valigarmanda': 'ヴァリガルマンダ',
      },
      'replaceText': {
        'Blighted Bolt': '災厄の落雷',
        'Calamitous Cry': 'カラミティクライ',
        'Charring Cataclysm': 'ファイアディザスター',
        'Chilling Cataclysm': 'コールドディザスター',
        'Crackling Cataclysm': 'ライトニングディザスター',
        'Disaster Zone': 'ディザスターゾーン',
        'Freezing Dust': 'フリジングダスト',
        'Hail of Feathers': 'フェザーヘイル',
        'Ice Boulder': '氷塊',
        'Ice Talon': 'アイスタロン',
        'Mountain Fire': 'マウンテンファイア',
        'Northern Cross': 'ノーザンクロス',
        'Ruin Foretold': 'ディザスターサイン',
        'Ruinfall': 'カラミティダイヴ',
        'Scourge of Fire': 'スカージ・オフ・ファイア',
        'Scourge of Ice': 'スカージ・オブ・アイス',
        'Scourge of Thunder': 'スカージ・オブ・サンダー',
        'Skyruin': 'リビングディザスター',
        'Slithering Strike': 'スリザーストライク',
        'Sphere Shatter': '破裂',
        'Spikesicle': 'アイシクルスパイク',
        'Strangling Coil': 'スリザーコイル',
        'Susurrant Breath': 'スリザーブレス',
        'Thunderous Breath': 'サンダーブレス',
        'Triscourge': 'トライスカージ',
        'Tulidisaster': 'トラルディザスター',
        'Valigarmanda': 'ヴァリガルマンダ',
        'Volcanic Drop': '火山弾',
        'Wrath Unfurled': 'ラース・アンファールド',
      },
    },
  ],
};

export default triggerSet;
