import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import Util from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  beganMonitoringHp?: boolean;
  garotte?: boolean;
  seenFinalPhase: boolean;
  dragons?: number[];
  tetherCount: number;
  naelDiveMarkerCount: number;
  naelMarks?: string[];
  safeZone?: string;
}

const diveDirections = {
  unknown: Outputs.unknown,
  north: Outputs.dirN,
  northeast: Outputs.dirNE,
  east: Outputs.dirE,
  southeast: Outputs.dirSE,
  south: Outputs.dirS,
  southwest: Outputs.dirSW,
  west: Outputs.dirW,
  northwest: Outputs.dirNW,
};

const triggerSet: TriggerSet<Data> = {
  id: 'TheSecondCoilOfBahamutTurn4',
  zoneId: ZoneId.TheSecondCoilOfBahamutTurn4,
  timelineFile: 't9.txt',
  initData: () => {
    return {
      monitoringHP: false,
      seenFinalPhase: false,
      tetherCount: 0,
      naelDiveMarkerCount: 0,
    };
  },
  timelineTriggers: [
    {
      id: 'T9 Claw',
      regex: /Bahamut's Claw x5/,
      beforeSeconds: 5,
      response: Responses.tankBuster(),
    },
    {
      id: 'T9 Dalamud Dive',
      regex: /Dalamud Dive/,
      beforeSeconds: 5,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Dive on Main Tank',
          de: 'Sturz auf den Main Tank',
          fr: 'Plongeon sur le Main Tank',
          ja: 'MTに飛んでくる',
          cn: '凶鸟跳点MT',
          ko: '광역 탱버',
        },
      },
    },
    {
      id: 'T9 Super Nova',
      regex: /Super Nova x3/,
      beforeSeconds: 4,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Bait Super Novas Outside',
          de: 'Köder Supernova draußen',
          fr: 'Attirez les Supernovas à l\'extérieur',
          ja: 'スーパーノヴァを外に設置',
          cn: '人群外放黑洞',
          ko: '초신성 외곽으로 유도',
        },
      },
    },
  ],
  triggers: [
    {
      id: 'T9 Raven Blight You',
      type: 'GainsEffect',
      netRegex: { effectId: '1CA' },
      condition: Conditions.targetIsYou(),
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 5,
      durationSeconds: 5,
      alarmText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Blight on YOU',
          de: 'Pestschwinge auf DIR',
          fr: 'Bile de rapace sur VOUS',
          ja: '自分に凶鳥毒気',
          cn: '毒气点名',
          ko: '흉조의 독 대상자',
        },
      },
    },
    {
      id: 'T9 Raven Blight Not You',
      type: 'GainsEffect',
      netRegex: { effectId: '1CA' },
      condition: Conditions.targetIsNotYou(),
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 5,
      durationSeconds: 5,
      infoText: (data, matches, output) =>
        output.text!({ player: data.party.member(matches.target) }),
      outputStrings: {
        text: {
          en: 'Blight on ${player}',
          de: 'Pestschwinge auf ${player}',
          fr: 'Bile de rapace sur ${player}',
          ja: '${player}に凶鳥毒気',
          cn: '毒气点${player}',
          ko: '${player} 흉조의 독',
        },
      },
    },
    {
      id: 'T9 Meteor',
      type: 'HeadMarker',
      netRegex: { id: '000[7A9]' },
      condition: Conditions.targetIsYou(),
      response: Responses.meteorOnYou(),
    },
    {
      id: 'T9 Meteor Stream',
      type: 'HeadMarker',
      netRegex: { id: '0008' },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'T9 Stack',
      type: 'HeadMarker',
      netRegex: { id: '000F' },
      alertText: (data, matches, output) => {
        if (data.me === matches.target)
          return output.thermoOnYou!();

        return output.stackOn!({ player: data.party.member(matches.target) });
      },
      outputStrings: {
        thermoOnYou: {
          en: 'Thermo on YOU',
          de: 'Thermo auf DIR',
          fr: 'Thermo sur VOUS',
          ja: '自分に頭割り',
          cn: '分摊点名',
          ko: '쉐어징 대상자',
        },
        stackOn: Outputs.stackOnPlayer,
      },
    },
    {
      id: 'T9 Phase 2',
      type: 'Ability',
      // Ravensclaw
      netRegex: { id: '7D5', source: 'Nael Deus Darnus' },
      condition: (data) => !data.beganMonitoringHp,
      preRun: (data) => data.beganMonitoringHp = true,
      promise: (_data, matches) =>
        Util.watchCombatant({
          ids: [parseInt(matches.sourceId, 16)],
        }, (ret) => {
          return ret.combatants.some((c) => {
            return c.CurrentHP / c.MaxHP <= 0.64;
          });
        }),
      sound: 'Long',
    },
    {
      id: 'T9 Earthshock',
      type: 'StartsUsing',
      netRegex: { id: '7F5', source: 'Dalamud Spawn', capture: false },
      condition: (data) => data.CanSilence(),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Silence Blue Golem',
          de: 'Blauen Golem verstummen',
          fr: 'Interrompez le Golem bleu',
          ja: '沈黙：青ゴーレム',
          cn: '沉默蓝色小怪',
          ko: '파란골렘 기술끊기',
        },
      },
    },
    {
      id: 'T9 Heavensfall',
      type: 'StartsUsing',
      netRegex: { id: '83B', source: 'Nael Deus Darnus', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Heavensfall',
          de: 'Himmelssturz',
          fr: 'Destruction universelle',
          ja: '天地崩壊',
          cn: '击退AOE',
          ko: '천지붕괴',
        },
      },
    },
    {
      id: 'T9 Garotte Twist Gain',
      type: 'GainsEffect',
      netRegex: { effectId: '1CE' },
      condition: (data, matches) => data.me === matches.target && !data.garotte,
      infoText: (_data, _matches, output) => output.text!(),
      run: (data) => data.garotte = true,
      outputStrings: {
        text: {
          en: 'Garotte on YOU',
          de: 'Leicht fixierbar auf DIR',
          fr: 'Sangle accélérée sur VOUS',
          ja: '自分に拘束加速',
          cn: '拘束加速点名',
          ko: '구속 가속',
        },
      },
    },
    {
      id: 'T9 Ghost Death',
      type: 'Ability',
      netRegex: { id: '7FA', source: 'The Ghost Of Meracydia', capture: false },
      condition: (data) => data.garotte,
      alarmText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Cleanse Garotte',
          de: 'reinige Leicht fixierbar',
          fr: 'Dissipez Sangle accélérée',
          ja: '白い床に乗る',
          cn: '踩白圈',
          ko: '흰색 장판 밟기',
        },
      },
    },
    {
      id: 'T9 Garotte Twist Lose',
      type: 'LosesEffect',
      netRegex: { effectId: '1CE' },
      condition: (data, matches) => data.me === matches.target && data.garotte,
      run: (data) => delete data.garotte,
    },
    {
      id: 'T9 Final Phase',
      type: 'StartsUsing',
      netRegex: { id: '7E6', source: 'Nael Deus Darnus', capture: false },
      condition: (data) => !data.seenFinalPhase,
      sound: 'Long',
      run: (data) => data.seenFinalPhase = true,
    },
    {
      id: 'T9 Dragon Locations',
      type: 'AddedCombatant',
      netRegex: { name: ['Firehorn', 'Iceclaw', 'Thunderwing'] },
      run: (data, matches) => {
        // Lowercase all of the names here for case insensitive matching.
        const allNames = {
          en: ['firehorn', 'iceclaw', 'thunderwing'],
          de: ['feuerhorn', 'eisklaue', 'donnerschwinge'],
          fr: ['corne-de-feu', 'griffe-de-glace ', 'aile-de-foudre'],
          ja: ['ファイアホーン', 'アイスクロウ', 'サンダーウィング'],
          cn: ['火角', '冰爪', '雷翼'],
          ko: ['화염뿔', '얼음발톱', '번개날개'],
        };
        const names = allNames[data.parserLang];
        const idx = names.indexOf(matches.name.toLowerCase());
        if (idx === -1)
          return;

        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);

        // Most dragons are out on a circle of radius=~28.
        // Ignore spurious dragons like "Pos: (0.000919255,0.006120025,2.384186E-07)"
        if (x * x + y * y < 20 * 20)
          return;

        // Positions are the 8 cardinals + numerical slop on a radius=28 circle.
        // N = (0, -28), E = (28, 0), S = (0, 28), W = (-28, 0)
        // Map N = 0, NE = 1, ..., NW = 7
        const dir = Math.round(4 - 4 * Math.atan2(x, y) / Math.PI) % 8;

        data.dragons ??= [0, 0, 0];
        data.dragons[idx] = dir;
      },
    },
    {
      id: 'T9 Final Phase Reset',
      type: 'StartsUsing',
      netRegex: { id: '7E6', source: 'Nael Deus Darnus', capture: false },
      run: (data) => {
        data.tetherCount = 0;
        data.naelDiveMarkerCount = 0;
        data.naelMarks = ['unknown', 'unknown'];
        data.safeZone = 'unknown';

        // Missing dragons??
        if (!data.dragons || data.dragons.length !== 3)
          return;

        // T9 normal dragons are easy.
        // The first two are always split, so A is the first dragon + 1.
        // The last one is single, so B is the last dragon + 1.

        const dragons = data.dragons.sort();
        const [d0, d1, d2] = dragons;
        if (d0 === undefined || d1 === undefined || d2 === undefined)
          return;
        const dirNames = [
          'north',
          'northeast',
          'east',
          'southeast',
          'south',
          'southwest',
          'west',
          'northwest',
        ];
        data.naelMarks = [d0, d2].map((i) => dirNames[(i + 1) % 8] ?? 'unknown');

        // Safe zone is one to the left of the first dragon, unless
        // the last dragon is diving there.  If that's true, use
        // one to the right of the second dragon.
        let possibleSafe = (d0 - 1 + 8) % 8;
        if ((d2 + 2) % 8 === possibleSafe)
          possibleSafe = (d1 + 1) % 8;
        data.safeZone = dirNames[possibleSafe];
      },
    },
    {
      id: 'T9 Dragon Marks',
      type: 'StartsUsing',
      netRegex: { id: '7E6', source: 'Nael Deus Darnus', capture: false },
      durationSeconds: 12,
      infoText: (data, _matches, output) =>
        output.marks!({
          dir1: output[data.naelMarks?.[0] ?? 'unknown']!(),
          dir2: output[data.naelMarks?.[1] ?? 'unknown']!(),
        }),
      outputStrings: {
        ...diveDirections,
        marks: {
          en: 'Marks: ${dir1}, ${dir2}',
          de: 'Markierungen : ${dir1}, ${dir2}',
          fr: 'Marques : ${dir1}, ${dir2}',
          ja: 'マーカー: ${dir1}, ${dir2}',
          cn: '标记： ${dir1}, ${dir2}',
          ko: '카탈징: ${dir1}, ${dir2}',
        },
      },
    },
    {
      id: 'T9 Tether',
      type: 'Tether',
      netRegex: { id: '0005', source: 'Firehorn' },
      preRun: (data) => {
        data.tetherCount++;
      },
      alertText: (data, matches, output) => {
        if (data.me !== matches.target)
          return;

        // Out, In, Out, In
        if (data.tetherCount % 2)
          return output.fireOutOnYou!();
        return output.fireInOnYou!();
      },
      infoText: (data, matches, output) => {
        if (data.me === matches.target)
          return;
        // Out, In, Out, In
        if (data.tetherCount % 2)
          return output.fireOutOn!({ player: data.party.member(matches.target) });
        return output.fireInOn!({ player: data.party.member(matches.target) });
      },
      outputStrings: {
        fireOutOnYou: {
          en: 'Fire Out (on YOU)',
          de: 'Feuer raus (auf DIR)',
          fr: 'Feu extérieur (sur VOUS)',
          ja: 'ファイヤ、外に (自分)',
          cn: '火球单吃点名',
          ko: '불 대상자 밖으로',
        },
        fireInOnYou: {
          en: 'Fire In (on YOU)',
          de: 'Feuer rein (auf DIR)',
          fr: 'Feu intérieur (sur VOUS)',
          ja: 'ファイヤ、頭割り (自分)',
          cn: '火球集合点名',
          ko: '불 대상자 같이맞기',
        },
        fireOutOn: {
          en: 'Fire Out (on ${player})',
          de: 'Feuer raus (auf ${player})',
          fr: 'Feu extérieur (sur ${player})',
          ja: 'ファイヤ、外に (${player})',
          cn: '火球单吃点${player}',
          ko: '${player} 불 밖으로',
        },
        fireInOn: {
          en: 'Fire In (on ${player})',
          de: 'Feuer rein (auf ${player})',
          fr: 'Feu intérieur (sur ${player})',
          ja: 'ファイヤ、頭割り (${player})',
          cn: '火球集合点${player}',
          ko: '${player} 불 같이맞기',
        },
      },
    },
    {
      id: 'T9 Thunder',
      type: 'Ability',
      netRegex: { source: 'Thunderwing', id: '7FD' },
      condition: Conditions.targetIsYou(),
      alarmText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Thunder on YOU',
          de: 'Blitz auf DIR',
          fr: 'Foudre sur VOUS',
          ja: '自分にサンダー',
          cn: '雷点名',
          ko: '번개 대상자',
        },
      },
    },
    {
      id: 'T9 Dragon Safe Zone',
      type: 'HeadMarker',
      netRegex: { id: '0014', capture: false },
      delaySeconds: 3,
      durationSeconds: 6,
      suppressSeconds: 20,
      infoText: (data, _matches, output) =>
        output.safeZone!({ dir: output[data.safeZone ?? 'unknown']!() }),
      outputStrings: {
        ...diveDirections,
        safeZone: {
          en: 'Safe zone: ${dir}',
          de: 'Sichere Zone: ${dir}',
          fr: 'Zone safe : ${dir}',
          ja: '安置: ${dir}',
          cn: '安全点在：${dir}',
          ko: '안전 지대: ${dir}',
        },
      },
    },
    {
      id: 'T9 Dragon Marker',
      type: 'HeadMarker',
      netRegex: { id: '0014' },
      condition: Conditions.targetIsYou(),
      alarmText: (data, matches, output) => {
        data.naelDiveMarkerCount ??= 0;
        if (matches.target !== data.me)
          return;
        const marker = ['A', 'B', 'C'][data.naelDiveMarkerCount];
        const dir = data.naelMarks?.[data.naelDiveMarkerCount];
        return output.goToMarkerInDir!({ marker: marker, dir: dir });
      },
      tts: (data, matches, output) => {
        data.naelDiveMarkerCount ??= 0;
        if (matches.target !== data.me)
          return;
        return output.goToMarker!({ marker: ['A', 'B', 'C'][data.naelDiveMarkerCount] });
      },
      outputStrings: {
        goToMarkerInDir: {
          en: 'Go To ${marker} (in ${dir})',
          de: 'Gehe zu ${marker} (im ${dir})',
          fr: 'Allez en ${marker} (direction ${dir})',
          ja: '${marker}に行く' + ' (あと ${dir}秒)',
          cn: '去${marker} (在 ${dir})',
          ko: '${marker}로 이동' + ' (${dir}쪽)',
        },
        goToMarker: {
          en: 'Go To ${marker}',
          de: 'Gehe zu ${marker}',
          fr: 'Allez en ${marker}',
          ja: '${marker}行くよ',
          cn: '去${marker}',
          ko: '${marker}로 이동',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Astral Debris': 'Lichtgestein',
        'Dalamud Fragment': 'Dalamud-Bruchstück',
        'Dalamud Spawn': 'Dalamud-Golem',
        'Firehorn': 'Feuerhorn',
        'Iceclaw': 'Eisklaue',
        'Nael Geminus': 'Nael Geminus',
        'Nael deus Darnus': 'Nael deus Darnus',
        'Ragnarok': 'Ragnarök',
        'The Ghost Of Meracydia': 'Geist von Meracydia',
        'Thunderwing': 'Donnerschwinge',
        'Umbral Debris': 'Schattengestein',
      },
      'replaceText': {
        '(?<! )Meteor(?! Stream)': 'Meteor',
        'Bahamut\'s Claw': 'Klauen Bahamuts',
        'Bahamut\'s Favor': 'Bahamuts Segen',
        'Binding Coil': 'Verschlungene Schatten',
        'Cauterize': 'Kauterisieren',
        'Chain Lightning': 'Kettenblitz',
        'Dalamud Dive': 'Dalamud-Sturzflug',
        'Divebomb': 'Sturzbombe',
        'Fireball': 'Feuerball',
        'Ghost': 'Geist',
        'Golem Meteors': 'Golem Meteore',
        'Heavensfall': 'Himmelssturz',
        'Iron Chariot': 'Eiserner Streitwagen',
        'Lunar Dynamo': 'Lunarer Dynamo',
        'Megaflare': 'Megaflare',
        'Meteor Stream': 'Meteorflug',
        'Raven Dive': 'Bahamuts Schwinge',
        'Ravensbeak': 'Bradamante',
        'Ravensclaw': 'Silberklauen',
        'Stardust': 'Sternenstaub',
        'Super Nova': 'Supernova',
        'Thermionic Beam': 'Thermionischer Strahl',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Astral Debris': 'Débris Astral',
        'Dalamud Fragment': 'Débris De Dalamud',
        'Dalamud Spawn': 'Golem De Dalamud',
        'Firehorn': 'Corne-De-Feu',
        'Iceclaw': 'Griffe-De-Glace',
        'Nael Geminus': 'Nael Geminus',
        'Nael deus Darnus': 'Nael Deus Darnus',
        'Ragnarok': 'Ragnarok',
        'The Ghost Of Meracydia': 'Fantôme Méracydien',
        'Thunderwing': 'Aile-De-Foudre',
        'Umbral Debris': 'Débris Ombral',
      },
      'replaceText': {
        '(?<! )Meteor(?! Stream)': 'Météore',
        'Bahamut\'s Claw': 'Griffe de Bahamut',
        'Bahamut\'s Favor': 'Auspice du dragon',
        'Binding Coil': 'Écheveau entravant',
        'Cauterize': 'Cautérisation',
        'Chain Lightning': 'Chaîne d\'éclairs',
        'Dalamud Dive': 'Chute de Dalamud',
        'Divebomb Mark': 'Bombe plongeante, marque',
        'Fireball': 'Boule de feu',
        'Ghost Add': 'Add Fantôme',
        'Golem Meteors': 'Golem de Dalamud',
        'Heavensfall': 'Destruction universelle',
        'Iron Chariot': 'Char de fer',
        'Lunar Dynamo': 'Dynamo lunaire',
        'Megaflare': 'MégaBrasier',
        'Meteor Stream': 'Rayon météore',
        'Raven Dive': 'Fonte du rapace',
        'Ravensbeak': 'Bec du rapace',
        'Ravensclaw': 'Serre du rapace',
        'Stardust': 'Poussière d\'étoile',
        'Super Nova': 'Supernova',
        'Thermionic Beam': 'Rayon thermoïonique',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Astral Debris': 'アストラルデブリ',
        'Dalamud Fragment': 'ダラガブデブリ',
        'Dalamud Spawn': 'ダラガブゴーレム',
        'Firehorn': 'ファイアホーン',
        'Iceclaw': 'アイスクロウ',
        'Nael Geminus': 'ネール・ジェミナス',
        'Nael deus Darnus': 'ネール・デウス・ダーナス',
        'Ragnarok': 'ラグナロク',
        'The Ghost Of Meracydia': 'メラシディアン・ゴースト',
        'Thunderwing': 'サンダーウィング',
        'Umbral Debris': 'アンブラルデブリ',
      },
      'replaceText': {
        '(?<! )Meteor(?! Stream)': 'メテオ',
        'Bahamut\'s Claw': 'バハムートクロウ',
        'Bahamut\'s Favor': '龍神の加護',
        'Binding Coil': 'バインディングコイル',
        'Cauterize': 'カータライズ',
        'Chain Lightning': 'チェインライトニング',
        'Dalamud Dive': 'ダラガブダイブ',
        'Divebomb': 'ダイブボム',
        'Fireball': 'ファイアボール',
        'Ghost Add': '雑魚: ゴースト',
        'Golem Meteors': 'ゴーレムメテオ',
        'Heavensfall': '天地崩壊',
        'Iron Chariot': 'アイアンチャリオット',
        'Lunar Dynamo': 'ルナダイナモ',
        '(?<= )Mark(?= \\w)': 'マーク',
        'Megaflare': 'メガフレア',
        'Meteor Stream': 'メテオストリーム',
        'Raven Dive': 'レイヴンダイブ',
        'Ravensbeak': 'レイヴェンズビーク',
        'Ravensclaw': 'レイヴェンズクロウ',
        'Stardust': 'スターダスト',
        'Super Nova': 'スーパーノヴァ',
        'Thermionic Beam': 'サーミオニックビーム',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Astral Debris': '星极岩屑',
        'Dalamud Fragment': '卫月岩屑',
        'Dalamud Spawn': '卫月巨像',
        'Firehorn': '火角',
        'Iceclaw': '冰爪',
        'Nael Geminus': '奈尔双生子',
        'Nael deus Darnus': '奈尔·神·达纳斯',
        'Ragnarok': '诸神黄昏',
        'The Ghost Of Meracydia': '美拉西迪亚幽龙',
        'Thunderwing': '雷翼',
        'Umbral Debris': '灵极岩屑',
      },
      'replaceText': {
        '(?<! )Meteor(?! Stream)': '陨石',
        'Bahamut\'s Claw': '巴哈姆特之爪',
        'Bahamut\'s Favor': '龙神的加护',
        'Binding Coil': '拘束圈',
        'Cauterize': '低温俯冲',
        'Chain Lightning': '雷光链',
        'Dalamud Dive': '月华冲',
        'Divebomb': '爆破俯冲',
        'Fireball': '烈火球',
        'Ghost': '幽灵',
        'Golem Meteors': '石头人陨石',
        'Heavensfall': '天崩地裂',
        'Iron Chariot': '钢铁战车',
        'Lunar Dynamo': '月流电圈',
        'Megaflare': '百万核爆',
        'Meteor Stream': '陨石流',
        'Raven Dive': '凶鸟冲',
        'Ravensbeak': '凶鸟尖喙',
        'Ravensclaw': '凶鸟利爪',
        'Stardust': '星尘',
        'Super Nova': '超新星',
        'Thermionic Beam': '热离子光束',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Astral Debris': '천상의 잔해',
        'Dalamud Fragment': '달라가브의 잔해',
        'Dalamud Spawn': '달라가브 골렘',
        'Firehorn': '화염뿔',
        'Iceclaw': '얼음발톱',
        'Nael Geminus': '넬 게미누스',
        'Nael deus Darnus': '넬 데우스 다르누스',
        'Ragnarok': '라그나로크',
        'The Ghost Of Meracydia': '메라시디아의 유령',
        'Thunderwing': '번개날개',
        'Umbral Debris': '저승의 잔해',
      },
      'replaceText': {
        '(?<! )Meteor(?! Stream)': '메테오',
        'Bahamut\'s Claw': '바하무트의 발톱',
        'Bahamut\'s Favor': '용신의 가호',
        'Binding Coil': '구속의 고리',
        'Cauterize': '인두질',
        'Chain Lightning': '번개 사슬',
        'Dalamud Dive': '달라가브 강하',
        'Divebomb': '급강하 폭격',
        'Fireball': '화염구',
        'Ghost Add': '유령 쫄',
        'Golem Meteors': '골렘 메테오',
        'Heavensfall': '천지붕괴',
        'Iron Chariot': '강철 전차',
        'Lunar Dynamo': '달의 원동력',
        'Megaflare': '메가플레어',
        'Meteor Stream': '유성 폭풍',
        'Raven Dive': '흉조의 강하',
        'Ravensbeak': '흉조의 부리',
        'Ravensclaw': '흉조의 발톱',
        'Stardust': '별조각',
        'Super Nova': '초신성',
        'Thermionic Beam': '열전자 광선',
        'Mark A': 'A징',
        'Mark B': 'B징',
      },
    },
  ],
};

export default triggerSet;
