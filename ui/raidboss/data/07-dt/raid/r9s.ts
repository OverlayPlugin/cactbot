import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutput16, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { NetMatches } from '../../../../../types/net_matches';
import { TriggerSet } from '../../../../../types/trigger';

type CoffinfillerPosition =
  | 'outerWest'
  | 'innerWest'
  | 'innerEast'
  | 'outerEast'
  | 'inside'
  | 'outside';

export interface Data extends RaidbossData {
  flailPositions: NetMatches['StartsUsingExtra'][];
  coffinfillers: CoffinfillerPosition[];
  actorPositions: { [id: string]: { x: number; y: number; heading: number } };
  bats: {
    inner: DirectionOutput16[];
    middle: DirectionOutput16[];
    outer: DirectionOutput16[];
  };
  satisfiedCount: number;
  hasHellAwaits: boolean;
}

const headMarkerData = {
  // Vfx Path: com_share4a1
  'multiHitStack': '0131',
  // Vfx Path: tank_lockonae_0m_5s_01t
  'tankbuster': '01D4',
  // Vfx Path: lockon5_line_1p
  'aetherletting': '028C',
  // Tethers used in Hell in a Cell and Undead Deathmatch
  'tetherClose': '0161',
  'tetherFar': '0162',
} as const;

const center = {
  x: 100,
  y: 100,
};

const triggerSet: TriggerSet<Data> = {
  id: 'AacHeavyweightM1Savage',
  zoneId: ZoneId.AacHeavyweightM1Savage,
  timelineFile: 'r9s.txt',
  initData: () => ({
    flailPositions: [],
    coffinfillers: [],
    actorPositions: {},
    bats: { inner: [], middle: [], outer: [] },
    satisfiedCount: 0,
    hasHellAwaits: false,
  }),
  triggers: [
    {
      id: 'R9S ActorSetPos Tracker',
      type: 'ActorSetPos',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
          heading: parseFloat(matches.heading),
        },
    },
    {
      id: 'R9S ActorMove Tracker',
      type: 'ActorMove',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
          heading: parseFloat(matches.heading),
        },
    },
    {
      id: 'R9S Killer Voice',
      type: 'StartsUsing',
      netRegex: { id: 'B384', source: 'Vamp Fatale', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R9S Satisfied Counter',
      type: 'GainsEffect',
      netRegex: { effectId: '1277', capture: true },
      run: (data, matches) => data.satisfiedCount = parseInt(matches.count),
    },
    {
      id: 'R9S Headmarker Tankbuster',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['tankbuster'], capture: true },
      condition: Conditions.targetIsYou(),
      alertText: (data, _matches, output) => {
        if (data.satisfiedCount >= 8)
          return output.bigTankCleave!();
        return output.tankCleaveOnYou!();
      },
      outputStrings: {
        tankCleaveOnYou: Outputs.tankCleaveOnYou,
        bigTankCleave: {
          en: 'Tank Cleave on YOU (Big)',
          de: 'Tank Cleave auf DIR (Groß)',
          fr: 'Tank cleave sur VOUS (Gros)',
          ja: '自分にタンク範囲攻撃（大）',
          cn: '坦克范围死刑点名（大）',
          ko: '광역 탱버 대상자 (큰)',
        },
      },
    },
    {
      id: 'R9S Vamp Stomp',
      type: 'StartsUsing',
      netRegex: { id: 'B34A', source: 'Vamp Fatale', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'R9S Headmarker Party Multi Stack',
      // TODO: Add boss debuff tracker and indicate count
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['multiHitStack'], capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R9S Bat Tracker',
      type: 'ActorControlExtra',
      netRegex: { id: '4[0-9A-Fa-f]{7}', category: '0197', param1: '11D1', capture: true },
      run: (data, matches) => {
        const moveRads = {
          'inner': 1.5128,
          'middle': 1.5513,
          'outer': 1.5608,
        } as const;
        const actor = data.actorPositions[matches.id];
        if (actor === undefined)
          return;
        const dist = Math.hypot(actor.x - center.x, actor.y - center.y);
        const dLen = dist < 16 ? (dist < 8 ? 'inner' : 'middle') : 'outer';

        const angle = Math.atan2(actor.x - center.x, actor.y - center.y);
        let angleCW = angle - (Math.PI / 2);
        if (angleCW < -Math.PI)
          angleCW += Math.PI * 2;
        let angleDiff = Math.abs(angleCW - actor.heading);
        if (angleDiff > Math.PI * 1.75)
          angleDiff = Math.abs(angleDiff - (Math.PI * 2));

        const cw = angleDiff < (Math.PI / 2) ? 'cw' : 'ccw';
        const adjustRads = moveRads[dLen];
        let endAngle = angle + (adjustRads * ((cw === 'cw') ? -1 : 1));
        if (endAngle < -Math.PI)
          endAngle += Math.PI * 2;
        else if (endAngle > Math.PI)
          endAngle -= Math.PI * 2;

        data.bats[dLen].push(
          Directions.output16Dir[Directions.hdgTo16DirNum(endAngle)] ?? 'unknown',
        );
      },
    },
    {
      id: 'R9S Blast Beat Inner',
      type: 'ActorControlExtra',
      netRegex: { id: '4[0-9A-Fa-f]{7}', category: '0197', param1: '11D1', capture: false },
      delaySeconds: 4.1,
      durationSeconds: 5.5,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const [dir1, dir2] = data.bats.inner.sort(Directions.compareDirectionOutput);

        return output.away!({
          dir1: output[dir1 ?? 'unknown']!(),
          dir2: output[dir2 ?? 'unknown']!(),
        });
      },
      run: (data, _matches) => {
        data.bats.inner = [];
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
        away: {
          en: 'Away from bats ${dir1}/${dir2}',
          de: 'Weg von den Fledermäusen ${dir1}/${dir2}',
          fr: 'Loin des chauves-souris ${dir1}/${dir2}',
          ja: 'コウモリから離れる ${dir1}/${dir2}',
          cn: '远离 ${dir1}、${dir2} 蝙蝠',
          ko: '박쥐 피하기 ${dir1}/${dir2}',
        },
      },
    },
    {
      id: 'R9S Blast Beat Middle',
      type: 'ActorControlExtra',
      netRegex: { id: '4[0-9A-Fa-f]{7}', category: '0197', param1: '11D1', capture: false },
      delaySeconds: 9.7,
      durationSeconds: 3.4,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const [dir1, dir2, dir3] = data.bats.middle.sort(Directions.compareDirectionOutput);

        return output.away!({
          dir1: output[dir1 ?? 'unknown']!(),
          dir2: output[dir2 ?? 'unknown']!(),
          dir3: output[dir3 ?? 'unknown']!(),
        });
      },
      run: (data, _matches) => {
        data.bats.middle = [];
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
        away: {
          en: 'Away from bats ${dir1}/${dir2}/${dir3}',
          de: 'Weg von den Fledermäusen ${dir1}/${dir2}/${dir3}',
          fr: 'Loin des chauves-souris ${dir1}/${dir2}/${dir3}',
          ja: 'コウモリから離れる ${dir1}/${dir2}/${dir3}',
          cn: '远离 ${dir1}、${dir2}、${dir3} 蝙蝠',
          ko: '박쥐 피하기 ${dir1}/${dir2}/${dir3}',
        },
      },
    },
    {
      id: 'R9S Blast Beat Outer',
      type: 'ActorControlExtra',
      netRegex: { id: '4[0-9A-Fa-f]{7}', category: '0197', param1: '11D1', capture: false },
      delaySeconds: 13.2,
      durationSeconds: 3.4,
      suppressSeconds: 1,
      response: Responses.goMiddle(),
      run: (data, _matches) => {
        data.bats.outer = [];
      },
    },
    {
      id: 'R9S Sadistic Screech',
      type: 'StartsUsing',
      netRegex: { id: 'B333', source: 'Vamp Fatale', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R9S Coffinfiller',
      type: 'StartsUsingExtra',
      netRegex: { id: ['B368', 'B369', 'B36A'], capture: true },
      suppressSeconds: (data) => data.coffinfillers.length === 0 ? 0 : 5,
      run: (data, matches) => {
        let danger: CoffinfillerPosition;
        const xPos = parseFloat(matches.x);
        if (xPos < 95)
          danger = 'outerWest';
        else if (xPos < 100)
          danger = 'innerWest';
        else if (xPos < 105)
          danger = 'innerEast';
        else
          danger = 'outerEast';
        data.coffinfillers.push(danger);
      },
    },
    {
      id: 'R9S Half Moon',
      type: 'StartsUsingExtra',
      netRegex: { id: ['B377', 'B379', 'B37B', 'B37D'], capture: true },
      delaySeconds: 0.3,
      alertText: (data, matches, output) => {
        if (data.coffinfillers.length < 2) {
          if (matches.id === 'B377')
            return output.rightThenLeft!();
          if (matches.id === 'B37B')
            return output.leftThenRight!();
          return output.bigHalfmoonNoCoffin!({
            dir1: output[matches.id === 'B379' ? 'right' : 'left']!(),
            dir2: output[matches.id === 'B379' ? 'left' : 'right']!(),
          });
        }

        const attackDirNum = Directions.hdgTo4DirNum(parseFloat(matches.heading));
        const dirNum1 = (attackDirNum + 2) % 4;
        const dir1 = Directions.outputFromCardinalNum(dirNum1);
        const dirNum2 = attackDirNum;
        const dir2 = Directions.outputFromCardinalNum(dirNum2);
        const bigCleave = matches.id === 'B379' || matches.id === 'B37D';

        const insidePositions: CoffinfillerPosition[] = [
          'innerWest',
          'innerEast',
        ];

        const outsidePositions: CoffinfillerPosition[] = [
          'outerWest',
          'outerEast',
        ];

        const westPositions: CoffinfillerPosition[] = [
          'innerWest',
          'outerWest',
        ];

        const eastPositions: CoffinfillerPosition[] = [
          'innerEast',
          'outerEast',
        ];

        let coffinSafe1: CoffinfillerPosition[] = [
          'outerWest',
          'innerWest',
          'innerEast',
          'outerEast',
        ];
        coffinSafe1 = coffinSafe1.filter((pos) => !data.coffinfillers.includes(pos));

        let coffinSafe2: CoffinfillerPosition[] = [
          'outerWest',
          'innerWest',
          'innerEast',
          'outerEast',
        ];
        // Whatever gets hit first round will be safe second round
        coffinSafe2 = coffinSafe2.filter((pos) => data.coffinfillers.includes(pos));

        data.coffinfillers = [];

        let dir1Text = output[dir1]!();
        let dir2Text = output[dir2]!();

        if (dir1 === 'dirW') {
          coffinSafe1 = coffinSafe1.filter((pos) => westPositions.includes(pos));
          dir1Text = output.leftWest!();
        }

        if (dir1 === 'dirE') {
          coffinSafe1 = coffinSafe1.filter((pos) => eastPositions.includes(pos));
          dir1Text = output.rightEast!();
        }

        if (dir2 === 'dirW') {
          coffinSafe2 = coffinSafe2.filter((pos) => westPositions.includes(pos));
          dir2Text = output.leftWest!();
        }

        if (dir2 === 'dirE') {
          coffinSafe2 = coffinSafe2.filter((pos) => eastPositions.includes(pos));
          dir2Text = output.rightEast!();
        }

        let coffin1: CoffinfillerPosition | 'unknown';
        let coffin2: CoffinfillerPosition | 'unknown';

        if (coffinSafe1.every((pos) => insidePositions.includes(pos)))
          coffin1 = 'inside';
        else if (coffinSafe1.every((pos) => outsidePositions.includes(pos)))
          coffin1 = 'outside';
        else
          coffin1 = coffinSafe1.find((pos) => insidePositions.includes(pos)) ?? 'unknown';

        if (coffinSafe2.every((pos) => insidePositions.includes(pos)))
          coffin2 = 'inside';
        else if (coffinSafe2.every((pos) => outsidePositions.includes(pos)))
          coffin2 = 'outside';
        else
          coffin2 = coffinSafe2.find((pos) => insidePositions.includes(pos)) ?? 'unknown';

        if (bigCleave) {
          return output.bigHalfmoonCombined!({
            coffin1: output[coffin1]!(),
            dir1: dir1Text,
            coffin2: output[coffin2]!(),
            dir2: dir2Text,
          });
        }

        return output.combined!({
          coffin1: output[coffin1]!(),
          dir1: dir1Text,
          coffin2: output[coffin2]!(),
          dir2: dir2Text,
        });
      },
      outputStrings: {
        ...Directions.outputStringsCardinalDir,
        text: {
          en: '${first} => ${second}',
          de: '${first} => ${second}',
          fr: '${first} => ${second}',
          ja: '${first} => ${second}',
          cn: '${first} => ${second}',
          ko: '${first} => ${second}',
        },
        combined: {
          en: '${coffin1} + ${dir1} => ${coffin2} + ${dir2}',
          de: '${coffin1} + ${dir1} => ${coffin2} + ${dir2}',
          fr: '${coffin1} + ${dir1} => ${coffin2} + ${dir2}',
          ja: '${coffin1} + ${dir1} => ${coffin2} + ${dir2}',
          cn: '${coffin1} + ${dir1} => ${coffin2} + ${dir2}',
          ko: '${coffin1} + ${dir1} => ${coffin2} + ${dir2}',
        },
        bigHalfmoonCombined: {
          en: '${coffin1} + ${dir1} (big) => ${coffin2} + ${dir2} (big)',
          de: '${coffin1} + ${dir1} (groß) => ${coffin2} + ${dir2} (groß)',
          fr: '${coffin1} + ${dir1} (big) => ${coffin2} + ${dir2} (gros)',
          ja: '${coffin1} + ${dir1} (大) => ${coffin2} + ${dir2} (大)',
          cn: '${coffin1} + ${dir1} (大) => ${coffin2} + ${dir2} (大)',
          ko: '${coffin1} + ${dir1} (큰) => ${coffin2} + ${dir2} (큰)',
        },
        rightThenLeft: Outputs.rightThenLeft,
        leftThenRight: Outputs.leftThenRight,
        left: Outputs.left,
        leftWest: Outputs.leftWest,
        right: Outputs.right,
        rightEast: Outputs.rightEast,
        inside: {
          en: 'Inside',
          de: 'Innen',
          fr: 'Intérieur',
          ja: '内側',
          cn: '内侧',
          ko: '안쪽',
        },
        outside: {
          en: 'Outside',
          de: 'Außen',
          fr: 'Extérieur',
          ja: '外側',
          cn: '外侧',
          ko: '바깥쪽',
        },
        outerWest: {
          en: 'Outer West',
          de: 'Außen Westen',
          fr: 'Extérieur Ouest',
          ja: '左外',
          cn: '左外',
          ko: '바깥 서쪽',
        },
        innerWest: {
          en: 'Inner West',
          de: 'Innen Westen',
          fr: 'Intérieur Ouest',
          ja: '左内',
          cn: '左内',
          ko: '안 서쪽',
        },
        innerEast: {
          en: 'Inner East',
          de: 'Innen Osten',
          fr: 'Intérieur Est',
          ja: '右内',
          cn: '右内',
          ko: '안 동쪽',
        },
        outerEast: {
          en: 'Outer East',
          de: 'Außen Osten',
          fr: 'Extérieur Est',
          ja: '右外',
          cn: '右外',
          ko: '바깥 동쪽',
        },
        bigHalfmoonNoCoffin: {
          en: '${dir1} max melee => ${dir2} max melee',
          de: '${dir1} max Nahkämpfer => ${dir2} max Nahkämpfer',
          fr: '${dir1} max melée => ${dir2} max melée',
          ja: '${dir1} メレー最大距離 => ${dir2} メレー最大距離',
          cn: '${dir1} 最大近战距离 => ${dir2} 最大近战距离',
          ko: '${dir1} 칼끝딜 => ${dir2} 칼끝딜',
        },
      },
    },
    {
      id: 'R9S Crowd Kill',
      type: 'StartsUsing',
      netRegex: { id: 'B33E', source: 'Vamp Fatale', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R9S Insatiable Thirst',
      type: 'StartsUsing',
      netRegex: { id: 'B344', source: 'Vamp Fatale', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R9S Finale Fatale (Small)',
      type: 'StartsUsing',
      netRegex: { id: 'B340', source: 'Vamp Fatale', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R9S Finale Fatale (Big)',
      type: 'StartsUsing',
      netRegex: { id: 'B341', source: 'Vamp Fatale', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R9S Headmarker Aetherletting',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['aetherletting'], capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.aetherlettingOnYou!(),
      outputStrings: {
        aetherlettingOnYou: {
          en: 'Aetherletting on YOU',
          de: 'Ätherquell auf DIR',
          fr: 'Éthérisation sur VOUS',
          ja: '自分にエーテルレッティング',
          cn: '以太流失点名',
          ko: '에테르 해방 대상자',
        },
      },
    },
    {
      id: 'R9S Plummet',
      type: 'StartsUsingExtra',
      netRegex: { id: 'B38B', capture: true },
      preRun: (data, matches) => {
        data.flailPositions.push(matches);
      },
      infoText: (data, _matches, output) => {
        const [flail1Match, flail2Match] = data.flailPositions;

        if (flail1Match === undefined || flail2Match === undefined)
          return;

        const flail1X = parseFloat(flail1Match.x);
        const flail1Y = parseFloat(flail1Match.y);
        const flail2X = parseFloat(flail2Match.x);
        const flail2Y = parseFloat(flail2Match.y);

        const flail1Dir = Directions.xyToIntercardDirOutput(flail1X, flail1Y, center.x, center.y);
        const flail2Dir = Directions.xyToIntercardDirOutput(flail2X, flail2Y, center.x, center.y);

        const flail1Dist = Math.abs(flail1Y - center.y) < 10 ? 'near' : 'far';
        const flail2Dist = Math.abs(flail1Y - center.y) < 10 ? 'near' : 'far';

        return output.text!({
          flail1Dir: output[flail1Dir]!(),
          flail2Dir: output[flail2Dir]!(),
          flail1Dist: output[flail1Dist]!(),
          flail2Dist: output[flail2Dist]!(),
        });
      },
      run: (data) => {
        if (data.flailPositions.length < 2)
          return;
        data.flailPositions = [];
      },
      outputStrings: {
        text: {
          en: 'Flails ${flail1Dist} ${flail1Dir}/${flail2Dist} ${flail2Dir}',
          de: 'Stachelbombe ${flail1Dist} ${flail1Dir}/${flail2Dist} ${flail2Dir}',
          fr: 'Fléaux ${flail1Dist} ${flail1Dir}/${flail2Dist} ${flail2Dir}',
          ja: 'フレイル ${flail1Dist}${flail1Dir}、${flail2Dist}${flail2Dir}',
          cn: '刺锤 ${flail1Dist}${flail1Dir}、${flail2Dist}${flail2Dir}',
          ko: '철퇴 ${flail1Dist} ${flail1Dir}/${flail2Dist} ${flail2Dir}',
        },
        near: {
          en: 'Near',
          de: 'Nah',
          fr: 'proche',
          ja: '近く',
          cn: '近',
          ko: '가까이',
          tc: '近',
        },
        far: {
          en: 'Far',
          de: 'Fern',
          fr: 'loin',
          ja: '遠く',
          cn: '远',
          ko: '멀리',
          tc: '遠',
        },
        ...Directions.outputStringsIntercardDir,
      },
    },
    {
      id: 'R9S Hell Awaits Gain Debuff Collector',
      type: 'GainsEffect',
      netRegex: { effectId: '127A', capture: true },
      condition: Conditions.targetIsYou(),
      run: (data) => {
        data.hasHellAwaits = true;
      },
    },
    {
      id: 'R9S Hell Awaits Lose Debuff Collector',
      type: 'GainsEffect',
      netRegex: { effectId: '127A', capture: true },
      condition: Conditions.targetIsYou(),
      // Can't use the actual lose line, since it's after cast for 3rd spread/stack
      delaySeconds: 13,
      run: (data) => {
        data.hasHellAwaits = false;
      },
    },
    {
      id: 'R9S Ultrasonic Spread',
      type: 'StartsUsing',
      netRegex: { id: 'B39C', source: 'Vamp Fatale', capture: false },
      infoText: (data, _matches, outputs) => {
        return outputs.text!({
          avoid: data.hasHellAwaits ? `${outputs.avoid!()} ` : '',
          mech: outputs.rolePositions!(),
        });
      },
      outputStrings: {
        rolePositions: Outputs.rolePositions,
        avoid: {
          en: 'Avoid',
          de: 'Vermeide',
          fr: 'Évitez : ',
          ja: '回避',
          cn: '避开',
          ko: '피하기:',
        },
        text: {
          en: '${avoid}${mech}',
          de: '${avoid}${mech}',
          fr: '${avoid}${mech}',
          ja: '${mech}${avoid}',
          cn: '${avoid}${mech}',
          ko: '${avoid}${mech}',
        },
      },
    },
    {
      id: 'R9S Ultrasonic Amp',
      type: 'StartsUsing',
      netRegex: { id: 'B39D', source: 'Vamp Fatale', capture: false },
      infoText: (data, _matches, outputs) => {
        return outputs.text!({
          avoid: data.hasHellAwaits ? `${outputs.avoid!()} ` : '',
          mech: outputs.stack!(),
        });
      },
      outputStrings: {
        stack: Outputs.getTogether,
        avoid: {
          en: 'Avoid',
          de: 'Vermeide',
          fr: 'Évitez : ',
          ja: '回避',
          cn: '避开',
          ko: '피하기:',
        },
        text: {
          en: '${avoid}${mech}',
          de: '${avoid}${mech}',
          fr: '${avoid}${mech}',
          ja: '${mech}${avoid}',
          cn: '${avoid}${mech}',
          ko: '${avoid}${mech}',
        },
      },
    },
    {
      id: 'R9S Undead Deathmatch',
      type: 'StartsUsing',
      netRegex: { id: 'B3A0', source: 'Vamp Fatale', capture: false },
      response: Responses.getTowers('alert'),
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Ultrasonic Spread/Ultrasonic Amp': 'Ultrasonic Spread/Amp',
        'Ultrasonic Amp/Ultrasonic Spread': 'Ultrasonic Amp/Spread',
      },
    },
    {
      'locale': 'de',
      'replaceSync': {
        'Coffinmaker': 'fatal(?:e|er|es|en) Säge',
        'Fatal Flail': 'fatal(?:e|er|es|en) Stachelbombe',
        'Vamp Fatale': 'Vamp Fatale',
        'Vampette Fatale': 'fatal(?:e|er|es|en) Fledermaus',
      },
      'replaceText': {
        '--cell': '--Zelle',
        '--coffinmaker--': '--Säge--',
        '--flail': '--Stachelbombe',
        '--nail--': '--Blitzableiter--',
        'Aetherletting': 'Ätherquell',
        'Blast Beat': 'Resonanzwelle',
        'Bloody Bondage': 'Blutige Fesseln',
        'Breakdown Drop': 'Gebrochene Melodie',
        'Breakwing Beat': 'Gebrochener Rhythmus',
        'Brutal Rain': 'Schreckensherrschaft',
        'Coffinfiller': 'Sägenstich',
        'Crowd Kill': 'Massenmeuchelei',
        'Dead Wake': 'Sägenmarsch',
        'Finale Fatale': 'Finale Fatale',
        'Half Moon': 'Blutiger Halbmond',
        'Hardcore': 'Dominanz',
        'Hell in a Cell': 'Höllenkäfig',
        'Insatiable Thirst': 'Unstillbarer Durst',
        'Killer Voice': 'Todesecho',
        'Plummet': 'Abfallen',
        'Pulping Pulse': 'Zermalmender Puls',
        'Sadistic Screech': 'Henkersmahl',
        'Sanguine Scratch': 'Blutrote Kralle',
        'Ultrasonic Amp': 'Fokusschall',
        'Ultrasonic Spread': 'Streuschall',
        'Undead Deathmatch': 'Fledermaus-Todeskampf',
        'Vamp Stomp': 'Vampirstampfer',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Coffinmaker': 'torture fatale',
        'Fatal Flail': 'fléau fatal',
        'Vamp Fatale': 'Vamp Fatale',
        'Vampette Fatale': 'chauve-souris fatale',
      },
      'replaceText': {
        'Aetherletting': 'Libération d\'éther',
        'Blast Beat': 'Vague de résonance',
        'Bloody Bondage': 'Bondage sanglant',
        'Breakdown Drop': 'Fracas dévastateur',
        'Breakwing Beat': 'Rythme dévastateur',
        'Coffinfiller': 'Entaille funèbre',
        'Crowd Kill': 'Fauchage du public',
        'Dead Wake': 'Avancée',
        'Finale Fatale': 'Final fatal',
        'Half Moon': 'Demi-lunes',
        'Hardcore': 'Attaque extrême',
        'Hell in a Cell': 'Enfer carcéral',
        'Insatiable Thirst': 'Soif insatiable',
        'Killer Voice': 'Voix mortelle',
        'Plummet': 'Chute',
        'Pulping Pulse': 'Pulsation pulvérisante',
        'Sadistic Screech': 'Crissement sadique',
        'Sanguine Scratch': 'Griffure sanguine',
        'Ultrasonic Amp': '',
        'Ultrasonic Spread': '',
        'Undead Deathmatch': 'Chiroptère mortel',
        'Vamp Stomp': 'Piétinement fatal',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Coffinmaker': 'トーチャー・ファタール',
        'Fatal Flail': 'スパイク・ファタール',
        'Vamp Fatale': 'ヴァンプ・ファタール',
        'Vampette Fatale': 'ファタールバット',
      },
      'replaceText': {
        'Aetherletting(?! Proteans)': 'エーテルレッティング',
        'Aetherletting Proteans': 'エーテルレッティング 扇形',
        'Blast Beat': '共振波',
        'Bloody Bondage': 'ブラッディボンテージ',
        'Breakdown Drop': 'ブレイクダウン',
        'Breakwing Beat': 'ブレイクビーツ',
        'Coffinfiller': '突き出る',
        'Crowd Kill': 'クラウドキリング',
        'Dead Wake': '前進',
        'Finale Fatale': 'フィナーレ・ファターレ',
        'Half Moon': 'ハーフムーン',
        'Hardcore': 'ハードコア',
        'Hell in a Cell': 'ヘル・イン・ア・セル',
        'Insatiable Thirst': 'インセーシャブル・サースト',
        'Killer Voice': 'キラーボイス',
        'Plummet': '落下',
        'Pulping Pulse': 'パルピングパルス',
        'Sadistic Screech': 'サディスティック・スクリーチ',
        'Sanguine Scratch': 'サングインスクラッチ',
        'Ultrasonic Amp': '',
        'Ultrasonic Spread': '',
        'Undead Deathmatch': 'バット・デスマッチ',
        'Vamp Stomp': 'ヴァンプストンプ',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Charnel Cell': '致命棘狱',
        'Coffinmaker': '致命刑锯',
        'Deadly Doornail': '致命电杖',
        'Fatal Flail': '致命刺锤',
        'Vamp Fatale': '致命美人',
        'Vampette Fatale': '致命蝙蝠',
      },
      'replaceText': {
        '--coffinmaker--': '--致命刑锯--',
        '--cell': '--致命棘狱',
        '--flail': '--致命刺锤',
        '--nail--': '--致命电杖--',
        'Aetherletting(?! Proteans)': '以太流失',
        'Aetherletting Proteans': '以太流失扇形',
        'Blast Beat': '共振波',
        'Bloody Bondage': '血锁牢狱',
        'Breakdown Drop': '以太碎击',
        'Breakwing Beat': '以太碎拍',
        'Brutal Rain': '粗暴之雨',
        'Coffinfiller': '冲出',
        'Crowd Kill': '全场杀伤',
        'Dead Wake': '前进',
        'Finale Fatale': '致命的闭幕曲',
        'Half Moon': '月之半相',
        'Hardcore': '硬核之声',
        'Hell in a Cell': '笼中地狱',
        'Insatiable Thirst': '贪欲无厌',
        'Killer Voice': '魅亡之音',
        'Plummet': '掉落',
        'Pulping Pulse': '碎烂脉冲',
        'Sadistic Screech': '施虐的尖啸',
        'Sanguine Scratch': '嗜血抓挠',
        'Ultrasonic Amp': '音速集聚',
        'Ultrasonic Spread': '音速流散',
        'Undead Deathmatch': '血蝠死斗',
        'Vamp Stomp': '血魅的靴踏音',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Charnel Cell': '파탈 감옥',
        'Coffinmaker': '파탈 톱',
        'Deadly Doornail': '파탈 지팡이',
        'Fatal Flail': '파탈 철퇴',
        'Vamp Fatale': '뱀프 파탈',
        'Vampette Fatale': '파탈 박쥐',
      },
      'replaceText': {
        '--coffinmaker--': '--파탈 톱--',
        '--cell': '--감옥',
        '--flail': '--철퇴',
        '--nail--': '--지팡이--',
        'Aetherletting(?! Proteans)': '에테르 해방',
        'Aetherletting Proteans': '에테르 해방 부채꼴',
        'Blast Beat': '공진파',
        'Bloody Bondage': '피의 결박',
        'Breakdown Drop': '파괴 선율',
        'Breakwing Beat': '파괴 박자',
        'Brutal Rain': '잔혹한 비',
        'Coffinfiller': '톱날 돌출',
        'Crowd Kill': '생명력 갈취',
        'Dead Wake': '전진',
        'Finale Fatale': '파멸적 최후',
        'Half Moon': '반달차기',
        'Hardcore': '과격성',
        'Hell in a Cell': '헬 인 어 셀',
        'Insatiable Thirst': '채워지지 않는 갈증',
        'Killer Voice': '뇌쇄적인 목소리',
        'Plummet': '낙하',
        'Pulping Pulse': '분쇄 파동',
        'Sadistic Screech': '가학적인 웃음',
        'Sanguine Scratch': '붉은 생채기',
        'Ultrasonic Amp': '집약 음파',
        'Ultrasonic Spread': '확산 음파',
        'Undead Deathmatch': '박쥐 데스매치',
        'Vamp Stomp': '요염한 짓밟기',
      },
    },
  ],
};

export default triggerSet;
