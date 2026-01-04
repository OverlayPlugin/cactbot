import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { PluginCombatantState } from '../../../../../types/event';
import { TriggerSet } from '../../../../../types/trigger';

// Todo:
// Could call the exact safe spot during Aerial Ambush

type MoveAfter = 'moveAfterLaser' | 'moveAfterOrb';

export interface Data extends RaidbossData {
  turretLocations: string[];
  tetherMap: { [id: string]: string };
  lastClone?: PluginCombatantState;
  orbLocations: string[];
  marchMove?: MoveAfter;
}

const soldierLaserLocations: { [loc: string]: string } = {
  '1F': 'W',
  '21': 'E',
  '23': 'N',
  '25': 'S',
};

const coordinateBitMapEffects = [
  '0D',
  '0E',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '1A',
  '1C',
];

type MarchOutputDirs = 'NE' | 'NW' | 'SE' | 'SW';
type MarchOutput = {
  first: MarchOutputDirs;
  second: MarchOutputDirs;
  move: MoveAfter | '';
};
const marchPatterns: { [locs: string]: MarchOutput } = {
  '16,1A': { first: 'SE', second: 'NE', move: '' },
  '0E,17': { first: 'NW', second: 'NE', move: '' },
  '15,16': { first: 'NW', second: 'NE', move: '' },
  '13,15': { first: 'SW', second: 'NW', move: '' },
  '0E,10,19': { first: 'SE', second: 'NE', move: 'moveAfterLaser' },
  '11,16,18': { first: 'NE', second: 'SE', move: 'moveAfterOrb' },
  '12,14,15': { first: 'SE', second: 'NE', move: 'moveAfterOrb' },
  '0D,1A,1C': { first: 'NE', second: 'SE', move: 'moveAfterLaser' },
};

const triggerSet: TriggerSet<Data> = {
  id: 'TheUnderkeep',
  zoneId: ZoneId.TheUnderkeep,
  timelineFile: 'the_underkeep.txt',
  initData: () => {
    return {
      turretLocations: [],
      tetherMap: {},
      lastClone: undefined,
      orbLocations: [],
      marchMove: undefined,
    };
  },
  triggers: [
    // Gargant
    {
      id: 'Underkeep Gargant Chilling Chirp',
      type: 'StartsUsing',
      netRegex: { id: 'A633', source: 'Gargant', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Underkeep Gargant Almighty Racket',
      type: 'StartsUsing',
      netRegex: { id: 'A632', source: 'Gargant', capture: false },
      response: Responses.getBehind(),
    },
    // boss leaves to sneak around before dashing
    {
      id: 'Underkeep Gargant Untargetable',
      type: 'ActorControlExtra',
      netRegex: { category: '003F', param1: '1C', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Watch boss for dash',
          de: 'Boss anschauen für Ansturm',
          fr: 'Regardez la position du boss pour la ruée',
          cn: '观察 BOSS 冲锋',
          ko: '보스 돌진 위치 확인하기',
          tc: '觀察 BOSS 衝鋒',
        },
      },
    },
    {
      id: 'Underkeep Gargant Sedimentary Debris',
      type: 'StartsUsing',
      netRegex: { id: 'A898', source: 'Gargant' },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Underkeep Gargant Trap Jaws',
      type: 'StartsUsing',
      netRegex: { id: 'A634', source: 'Gargant' },
      response: Responses.tankBuster(),
    },
    // Soldier S0
    {
      id: 'Underkeep Soldier S0 Field of Scorn',
      type: 'StartsUsing',
      netRegex: { id: 'A653', source: 'Soldier S0', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Underkeep Soldier S0 Thunderous Slash',
      type: 'StartsUsing',
      netRegex: { id: 'A880', source: 'Soldier S0' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Underkeep Soldier S0 Ordered Fire Adds',
      type: 'MapEffect',
      netRegex: { flags: '00020001', location: Object.keys(soldierLaserLocations) },
      run: (data, matches) => data.turretLocations.push(matches.location),
    },
    {
      id: 'Underkeep Soldier S0 Ordered Fire',
      type: 'StartsUsing',
      netRegex: { id: 'A64C', source: 'Soldier S0', capture: false },
      delaySeconds: 0.5,
      alertText: (data, _matches, output) => {
        const lasers = data.turretLocations.map((i) => soldierLaserLocations[i]);
        let quad = output.unknown!();
        if (lasers.includes('N') && lasers.includes('E')) {
          quad = output.dirSW!();
        } else if (lasers.includes('N') && lasers.includes('W')) {
          quad = output.dirSE!();
        } else if (lasers.includes('S') && lasers.includes('E')) {
          quad = output.dirNW!();
        } else if (lasers.includes('S') && lasers.includes('W')) {
          quad = output.dirNE!();
        }
        return output.spread!({ quad: quad });
      },
      run: (data) => data.turretLocations = [],
      outputStrings: {
        spread: {
          en: 'Spread in ${quad} quadrant',
          de: 'Im ${quad} Quadranten verteilen',
          fr: 'Écartez-vous dans le quandrant ${quad}',
          cn: '在 ${quad} 象限分散',
          ko: '${quad}쪽 사분면에서 산개',
          tc: '在 ${quad} 象限分散',
        },
        dirNE: Outputs.dirNE,
        dirSE: Outputs.dirSE,
        dirSW: Outputs.dirSW,
        dirNW: Outputs.dirNW,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Underkeep Soldier S0 Sector Bisector Tether Collect',
      type: 'Tether',
      netRegex: { id: '0147', target: 'Soldier S0' },
      run: (data, matches) => {
        data.tetherMap[matches.sourceId] = matches.targetId;
      },
    },
    // This is the cast the soldier clones cast (to disappear I guess?) during the mechanic.
    // capture the first one and check who it was tethered to, that will be the clone cleaving.
    {
      id: 'Underkeep Soldier S0 Sector Bisector Call',
      type: 'Ability',
      netRegex: { id: ['A89B', 'A89C'], source: 'Soldier S0' },
      suppressSeconds: 8,
      promise: async (data, matches) => {
        const lastClone = data.tetherMap[matches.sourceId];
        if (lastClone === undefined) {
          console.error('Soldier Sector Bisector: could not get last clone');
          return;
        }
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(lastClone, 16)],
        })).combatants;
        if (combatants === null || combatants.length !== 1) {
          return;
        }
        data.lastClone = combatants[0];
      },
      alertText: (data, matches, output) => {
        const clone = data.lastClone;
        if (clone === undefined) {
          return;
        }
        const dirNum = Directions.hdgTo8DirNum(clone.Heading);
        //      0
        //    7   1
        //  6       2
        //    5   3
        //      4
        let safeSpot;
        if (matches.id === 'A89B') {
          // boss is cleaving left
          safeSpot = (dirNum + 2) % 8;
        } else {
          // A89C boss is cleaving right
          safeSpot = (dirNum + 8 - 2) % 8;
        }
        data.tetherMap = {};
        return output.cleave!({ dir: output[Directions.outputFrom8DirNum(safeSpot)]!() });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        cleave: {
          en: '${dir} half safe',
          de: '${dir} Hälfte sicher',
          fr: '${dir} moitié sûre',
          cn: '${dir} 半安全',
          ko: '${dir}쪽 절반 안전',
          tc: '${dir} 半安全',
        },
      },
    },
    // Valia Pira
    {
      id: 'Underkeep Valia Pira Entropic Sphere',
      type: 'StartsUsing',
      netRegex: { id: 'A61D', source: 'Valia Pira', capture: false },
      response: Responses.aoe(),
      run: (data) => {
        data.orbLocations = [];
      },
    },
    {
      id: 'Underkeep Valia Pira Electray',
      type: 'StartsUsing',
      netRegex: { id: 'A87A', source: 'Coordinate Turret', capture: false },
      condition: (data) => data.marchMove === undefined,
      suppressSeconds: 2,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Dodge wall turrets',
          de: 'Wand-Geschützturm ausweichen',
          fr: 'Esquivez les tourelles murales',
          cn: '躲避墙壁炮台',
          ko: '벽 포탑 피하기',
          tc: '躲避牆壁炮台',
        },
      },
    },
    {
      id: 'Underkeep Valia Pira Electric Field',
      type: 'StartsUsing',
      netRegex: { id: 'A617', source: 'Valia Pira', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Spread (all cones expand!)',
          de: 'Verteilen (Alle Kegel langziehen!)',
          fr: 'Écartez-vous (les cônes s\'agrandissent)',
          cn: '分散 (所有扇形扩大!)',
          ko: '산개 (모든 부채꼴 장판 커짐!)',
          tc: '分散 (所有扇形擴大!)',
        },
      },
    },
    {
      id: 'Underkeep Valia Pira Neutralize Front Lines',
      type: 'StartsUsing',
      netRegex: { id: 'A6F2', source: 'Valia Pira', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get behind + Spread',
          de: 'geh Hinter + Verteilen',
          fr: 'Allez derrière + Dispersion',
          cn: '后 + 分散',
          ko: '보스 뒤로 + 산개',
          tc: '後 + 分散',
        },
      },
    },
    {
      id: 'Underkeep Valia Pira Deterrent Pulse',
      type: 'StartsUsing',
      netRegex: { id: 'A62C', source: 'Valia Pira', capture: true },
      condition: (data, matches) => matches.target !== data.me,
      infoText: (data, matches, output) =>
        output.lineStackOn!({ player: data.party.member(matches.target) }),
      outputStrings: {
        lineStackOn: {
          en: 'Line stack on ${player}',
          de: 'In einer Linie auf ${player} sammeln',
          fr: 'Packez-vous en ligne sur ${player}',
          ja: '${player}に直線頭割り',
          cn: '${player} 直线分摊',
          ko: '${player} 직선 쉐어',
          tc: '${player} 直線分攤',
        },
      },
    },
    {
      id: 'Underkeep Valia Pira Coordinate March Collect',
      type: 'MapEffect',
      netRegex: {
        flags: '00020001',
        location: coordinateBitMapEffects,
      },
      run: (data, matches) => {
        data.orbLocations.push(matches.location);
      },
    },
    {
      id: 'Underkeep Valia Pira Coordinate March',
      type: 'StartsUsing',
      netRegex: { id: 'A611', source: 'Valia Pira', capture: false },
      delaySeconds: 0.5,
      durationSeconds: 9,
      alertText: (data, _matches, output) => {
        // 2 moving bits trigger "+" aoes when it collides with pink orbs.
        // boss spawns 2 or 3, which can sometimes be moved but only the initial spots matter.
        // there are several ways to dodge this but there is always a simple 2-step dodge in the inner squares.
        //        -13.5|-4.5|4.5 |13.5|
        //        |----|----|----|----|
        // -344.5 | 0D | 0E | 0F | 10 |
        //        |----|----|----|----|
        // -335.5 | 11 | 12 | 13 | 14 |
        //        |----|----x----|----|
        // -326.5 | 15 | 16 | 17 | 18 |
        //        |----|----|----|----|
        // -317.5 | 19 | 1A | 1B | 1C |
        //        |----|----|----|----|
        /*
            ((-13.5, -326.5), ( 4.5, -335.5)) ('13', '15') - Inner SW => Inner NW
            (( -4.5, -344.5), ( 4.5, -326.5)) ('0E', '17') - Inner NW => Inner NE
            ((-13.5, -326.5), (-4.5, -326.5)) ('15', '16') - Inner NW => Inner NE
            (( -4.5, -326.5), (-4.5, -317.5)) ('16', '1A') - Inner SE => Inner NE
            ((-13.5, -317.5), (-4.5, -344.5), (13.5, -344.5)) ('0E', '10', '19')
                - Inner SE => Inner NE (move after wall laser)
            ((-13.5, -326.5), (-4.5, -335.5), (13.5, -335.5)) ('12', '14', '15')
                - Inner SE => Inner NE (move after orb explosion)
            ((-13.5, -335.5), (-4.5, -326.5), (13.5, -326.5)) ('11', '16', '18')
                - Inner NE => Inner SE (move after orb explosion)
            ((-13.5, -344.5), (-4.5, -317.5), (13.5, -317.5)) ('0D', '1A', '1C')
                - Inner NE => Inner SE (move after wall laser)
         */
        const bitLocations = data.orbLocations.sort();
        if (!(bitLocations.length === 2 || bitLocations.length === 3)) {
          console.error(
            'Valia Pira CoordinateMarch: unexpected amount of bits found',
            bitLocations,
          );
          return;
        }

        const pattern = marchPatterns[bitLocations.join()];
        if (pattern === undefined) {
          console.error('Valia Pira CoordinateMarch: unknown pattern!', bitLocations);
          return output.unknown!();
        }

        data.marchMove = pattern.move !== '' ? pattern.move : undefined;
        return output.dodge!({
          first: output[pattern.first]!(),
          second: output[pattern.second]!(),
          move: pattern.move !== '' ? output[pattern.move]!() : '',
        });
      },
      run: (data) => {
        data.orbLocations = [];
      },
      outputStrings: {
        NE: Outputs.northeast,
        NW: Outputs.northwest,
        SE: Outputs.southeast,
        SW: Outputs.southwest,
        unknown: Outputs.unknown,
        dodge: {
          en: 'Inner ${first} => Inner ${second} ${move}',
          de: 'Innen ${first} => Innen ${second} ${move}',
          fr: 'Intérieur ${first} => Intérieur ${second} ${move}',
          cn: '内 ${first} => 内 ${second} ${move}',
          ko: '안쪽 ${first} => 안쪽 ${second} ${move}',
          tc: '內 ${first} => 內 ${second} ${move}',
        },
        moveAfterLaser: {
          en: '(after wall laser)',
          de: '(nach dem Wand-Laser)',
          fr: '(après les lasers)',
          cn: '(然后墙壁激光)',
          ko: '(벽면 레이저 이후)',
          tc: '(然後牆壁雷射)',
        },
        moveAfterOrb: {
          en: '(after orb explosion)',
          de: '(nach Orb-Explosion)',
          fr: '(après les explosions des orbes)',
          cn: '(然后球爆炸)',
          ko: '(구슬 폭발 이후)',
          tc: '(然後球爆炸)',
        },
      },
    },
    // wall turret laser
    {
      id: 'Underkeep Valia Pira Electray Move',
      type: 'Ability',
      netRegex: { id: 'A87A', source: 'Coordinate Turret', capture: false },
      condition: (data) => data.marchMove === 'moveAfterLaser',
      response: Responses.moveAway(),
      run: (data) => data.marchMove = undefined,
    },
    // pink orb/bit explosion
    {
      id: 'Underkeep Valia Pira Enforcement Ray Move',
      type: 'Ability',
      netRegex: { id: 'A6F1', source: 'Coordinate Bit', capture: false },
      condition: (data) => data.marchMove === 'moveAfterOrb',
      response: Responses.moveAway(),
      run: (data) => data.marchMove = undefined,
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Coordinate Bit': 'Monolith-Drohne',
        'Coordinate Turret': 'Monolith-Geschütz',
        'Gargant': 'Gargant',
        'Sand Sphere': 'Sandwirbel',
        'Soldier S0': 'Soldat S0',
        'Valia Pira': 'Mechalith',
      },
      'replaceText': {
        'Aerial Ambush': 'Hinterhalt',
        'Almighty Racket': 'Mächtiger Schall',
        'Bloodmarch': 'Purpursphären-Übertragung',
        'Chilling Chirp': 'Donnergebrüll',
        'Coordinate March': 'Weckruf',
        'Deterrent Pulse': 'Monolithischer Strahl',
        'Earthsong': 'Erdgesänge',
        'Electray': 'Elektroblitz',
        'Electric Excess': 'Funkenentladung',
        'Electric Field': 'Monolithischer Funkenregen',
        'Enforcement Ray': 'Verstärkungs-Strahl',
        'Entropic Sphere': 'Entropische Sphäre',
        'Field of Scorn': 'Schicksalsschlag',
        'Hypercharged Light': 'Elektrisiertes Licht',
        'Neutralize Front Lines': 'Front-Neutralisierung',
        'Ordered Fire': 'Unterstützungsfeuer',
        'Sector Bisector': 'Illusionsspalter',
        'Sedimentary Debris': 'Säuleneinschlag',
        'Sphere Shatter': 'Sphärensplitterung',
        'Static Force': 'Hiebwelle',
        'Thunderous Slash': 'Blitzfunkenhieb',
        'Trap Jaws': 'Fangkiefer',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Coordinate Bit': 'drone monolithique',
        'Coordinate Turret': 'tourelle monolithique',
        'Gargant': 'gargant',
        'Sand Sphere': 'sphère de sable',
        'Soldier S0': 'soldate S0',
        'Valia Pira': 'Obélisk',
      },
      'replaceText': {
        'Aerial Ambush': 'Embûche profonde',
        'Almighty Racket': 'Son puissant',
        'Bloodmarch': 'Transposition écarlate',
        'Chilling Chirp': 'Chant tonitruant',
        'Coordinate March': 'Ordre de démarrage',
        'Deterrent Pulse': 'Rayon monolithique',
        'Earthsong': 'Chant de la terre',
        'Electray': 'Rayon électrique',
        'Electric Excess': 'Étincelle survoltée',
        'Electric Field': 'Étincelle monolithique',
        'Enforcement Ray': 'Rayon amélioré',
        'Entropic Sphere': 'Sphère monolithique',
        'Field of Scorn': 'Foudre du destin',
        'Hypercharged Light': 'Miracle monolithique',
        'Neutralize Front Lines': 'Neutralisation frontale',
        'Ordered Fire': 'Frappe de soutien',
        'Sector Bisector': 'Section illusoire',
        'Sedimentary Debris': 'Chute',
        'Sphere Shatter': 'Rupture',
        'Static Force': 'Onde tranchante',
        'Thunderous Slash': 'Taillade foudroyante',
        'Trap Jaws': 'Mandibules piégeantes',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Coordinate Bit': 'ヴァリアビット',
        'Coordinate Turret': 'ヴァリア・タレット',
        'Gargant': 'ガルガント',
        'Sand Sphere': '砂球',
        'Soldier S0': 'ソルジャーS0',
        'Valia Pira': 'ヴァリア・ピラ',
      },
      'replaceText': {
        'Aerial Ambush': 'アンブッシュ',
        'Almighty Racket': 'マイティサウンド',
        'Bloodmarch': '妖紅珠移送',
        'Chilling Chirp': 'チリングチャープ',
        'Coordinate March': '起動指令',
        'Deterrent Pulse': 'ヴァリアレイ',
        'Earthsong': 'アースシング',
        'Electray': 'エレクトロレイ',
        'Electric Excess': 'エレクトロスパーク',
        'Electric Field': 'ヴァリアスパーク',
        'Enforcement Ray': 'リーンフォース・レイ',
        'Entropic Sphere': 'エントロピックスフィア',
        'Field of Scorn': 'ショック・オブ・ドゥーム',
        'Hypercharged Light': 'エレクトロライト',
        'Neutralize Front Lines': 'フロントニュートライズ',
        'Ordered Fire': '支援砲撃',
        'Sector Bisector': 'イリュージョン・ハーフカット',
        'Sedimentary Debris': '崩落',
        'Sphere Shatter': '破裂',
        'Static Force': 'スラッシュウェーブ',
        'Thunderous Slash': 'サンダースラッシュ',
        'Trap Jaws': 'トラップジョーズ',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Coordinate Bit': '灵变块',
        'Coordinate Turret': '灵变炮塔',
        'Gargant': '高康特',
        'Sand Sphere': '沙球',
        'Soldier S0': '士兵S0',
        'Valia Pira': '灵变柱',
      },
      'replaceText': {
        '\\(cast\\)': '(咏唱)',
        'Aerial Ambush': '伏击',
        'Almighty Racket': '强力之声',
        'Bloodmarch': '转移妖红珠',
        'Chilling Chirp': '恐吓虫鸣',
        'Coordinate March': '启动指令',
        'Deterrent Pulse': '灵变射线',
        'Earthsong': '大地之歌',
        'Electric Excess': '雷转质电火花',
        'Electric Field': '灵变电火花',
        'Electray': '雷转质射线',
        'Enforcement Ray': '增援射线',
        'Entropic Sphere': '熵球',
        'Field of Scorn': '厄运冲击',
        'Hypercharged Light': '雷转质光',
        'Neutralize Front Lines': '前方电中和',
        'Ordered Fire': '支援炮击',
        'Sector Bisector': '幻影半斩',
        'Sedimentary Debris': '崩落',
        'Sphere Shatter': '碎裂',
        'Static Force': '裂斩波',
        'Thunderous Slash': '闪雷斩',
        'Trap Jaws': '捕猎钳',
      },
    },
    {
      'locale': 'tc',
      'missingTranslations': true,
      'replaceSync': {
        'Coordinate Bit': 'ヴァリアビット',
        'Coordinate Turret': 'ヴァリア・タレット',
        'Gargant': '高康特',
        'Sand Sphere': '沙球',
        'Soldier S0': 'ソルジャーS0',
        'Valia Pira': 'ヴァリア・ピラ',
      },
      'replaceText': {
        // '\\(cast\\)': '', // FIXME '(咏唱)'
        'Aerial Ambush': '伏擊',
        'Almighty Racket': '強力之聲',
        'Bloodmarch': '轉移妖紅珠',
        'Chilling Chirp': '恐嚇顫音',
        'Coordinate March': '啟動指令',
        'Deterrent Pulse': '靈變射線',
        'Earthsong': '大地之歌',
        'Electric Excess': '雷轉質電火花',
        'Electric Field': '靈變電火花',
        'Electray': '雷轉質射線',
        'Enforcement Ray': '增援射線',
        'Entropic Sphere': '熵球',
        'Field of Scorn': '末日衝擊',
        'Hypercharged Light': '雷轉質光',
        'Neutralize Front Lines': '前方電中和',
        'Ordered Fire': '支援炮擊',
        'Sector Bisector': '幻影半斬',
        'Sedimentary Debris': '崩落',
        'Sphere Shatter': '碎裂',
        'Static Force': '裂斬波',
        'Thunderous Slash': '閃雷斬',
        'Trap Jaws': '捕獵鉗',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Coordinate Bit': '발리아 비트',
        'Coordinate Turret': '발리아 포탑',
        'Gargant': '가르간트',
        'Sand Sphere': '모래 구체',
        'Soldier S0': '병사 S0',
        'Valia Pira': '발리아 피라',
      },
      'replaceText': {
        '\\(cast\\)': '(시전)',
        'Aerial Ambush': '매복',
        'Almighty Racket': '굉음',
        'Bloodmarch': '요홍주 전송',
        'Chilling Chirp': '오싹한 울음소리',
        'Coordinate March': '기동 지령',
        'Deterrent Pulse': '발리아 광선',
        'Earthsong': '흙노래',
        'Electric Excess': '일렉트로 스파크',
        'Electric Field': '발리아 스파크',
        'Electray': '일렉트로레이',
        'Enforcement Ray': '강화 광선',
        'Entropic Sphere': '엔트로피 영역',
        'Field of Scorn': '파멸의 충격파',
        'Hypercharged Light': '일렉트로라이트',
        'Neutralize Front Lines': '전방 상쇄',
        'Ordered Fire': '지원 포격',
        'Sector Bisector': '환영 절반베기',
        'Sedimentary Debris': '낙하',
        'Sphere Shatter': '파열',
        'Static Force': '참격파',
        'Thunderous Slash': '번개 참격',
        'Trap Jaws': '날카로운 턱',
      },
    },
  ],
};

export default triggerSet;
