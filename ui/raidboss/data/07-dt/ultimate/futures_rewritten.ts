import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutput8, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { NetMatches } from '../../../../../types/net_matches';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  actorSetPosTracker: { [id: string]: NetMatches['ActorSetPos'] };
  p1ConcealSafeDirs: DirectionOutput8[];
  p1StackSpread?: 'stack' | 'spread';
  p1FallOfFaithTethers: ('fire' | 'lightning')[];
}

const triggerSet: TriggerSet<Data> = {
  id: 'FuturesRewrittenUltimate',
  zoneId: ZoneId.FuturesRewrittenUltimate,
  timelineFile: 'futures_rewritten.txt',
  initData: () => {
    return {
      actorSetPosTracker: {},
      p1ConcealSafeDirs: [...Directions.output8Dir],
      p1FallOfFaithTethers: [],
    };
  },
  timelineTriggers: [],
  triggers: [
    // General triggers
    {
      id: 'FRU ActorSetPos Collector',
      type: 'ActorSetPos',
      netRegex: { id: '4[0-9A-F]{7}', capture: true },
      run: (data, matches) => {
        data.actorSetPosTracker[matches.id] = matches;
      },
    },
    // P1 -- Fatebreaker
    {
      id: 'FRU P1 Cyclonic Break Fire',
      type: 'StartsUsing',
      netRegex: {
        id: ['9CD0', '9D89'],
        source: ['Fatebreaker', 'Fatebreaker\'s Image'],
        capture: false,
      },
      durationSeconds: 8,
      alertText: (_data, _matches, output) => output.clockPairs!(),
      outputStrings: {
        clockPairs: {
          en: 'Clock spots => Pairs',
          de: 'Himmelsrichtungen => Paare',
          ja: '八方向 => ペア',
          cn: '八方 => 两人分摊',
        },
      },
    },
    {
      id: 'FRU P1 Cyclonic Break Lightning',
      type: 'StartsUsing',
      netRegex: {
        id: ['9CD4', '9D8A'],
        source: ['Fatebreaker', 'Fatebreaker\'s Image'],
        capture: false,
      },
      durationSeconds: 8,
      alertText: (_data, _matches, output) => output.clockSpread!(),
      outputStrings: {
        clockSpread: {
          en: 'Clock spots => Spread',
          de: 'Himmelsrichtungen => Verteilen',
          ja: '八方向 => 散開',
          cn: '八方 => 分散',
        },
      },
    },
    {
      id: 'FRU P1 Powder Mark Trail',
      type: 'StartsUsing',
      netRegex: { id: '9CE8', source: 'Fatebreaker', capture: true },
      response: Responses.tankBusterSwap(),
    },
    {
      id: 'FRU P1 Utopian Sky Collector',
      type: 'StartsUsing',
      netRegex: { id: ['9CDA', '9CDB'], capture: true },
      run: (data, matches) => {
        data.p1StackSpread = matches.id === '9CDA' ? 'stack' : 'spread';
      },
    },
    {
      id: 'FRU Conceal Safe',
      type: 'ActorControlExtra',
      netRegex: {
        category: '003F',
        param1: '4',
        capture: true,
      },
      condition: (data) => data.p1StackSpread !== undefined,
      durationSeconds: 8,
      alertText: (data, matches, output) => {
        const clone = data.actorSetPosTracker[matches.id];
        if (clone === undefined)
          return;
        const dir1 = Directions.hdgTo8DirNum(parseFloat(clone.heading));
        const dir2 = (dir1 + 4) % 8;
        data.p1ConcealSafeDirs = data.p1ConcealSafeDirs.filter((dir) =>
          dir !== Directions.outputFrom8DirNum(dir1) && dir !== Directions.outputFrom8DirNum(dir2)
        );

        if (data.p1ConcealSafeDirs.length !== 2)
          return;

        const [dir1Out, dir2Out] = data.p1ConcealSafeDirs;

        if (dir1Out === undefined || dir2Out === undefined)
          return;

        return output.combo!({
          dir1: output[dir1Out]!(),
          dir2: output[dir2Out]!(),
          mech: output[data.p1StackSpread ?? 'unknown']!(),
        });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        combo: {
          en: '${dir1} / ${dir2} => ${mech}',
          de: '${dir1} / ${dir2} => ${mech}',
          ja: '${dir1} / ${dir2} => ${mech}',
          cn: '${dir1} / ${dir2} => ${mech}',
        },
        stack: Outputs.stacks,
        spread: Outputs.spread,
      },
    },
    {
      id: 'FRU P1 Burnished Glory',
      type: 'StartsUsing',
      netRegex: { id: '9CEA', source: 'Fatebreaker', capture: false },
      response: Responses.bleedAoe(),
    },
    {
      id: 'FRU P1 Burnt Strike Fire',
      type: 'StartsUsing',
      netRegex: { source: 'Fatebreaker', id: '9CC1', capture: false },
      durationSeconds: 8,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Line Cleave => Knockback',
          de: 'Linien AoE => Rückstoß',
          fr: 'AoE en ligne => Poussée',
          ja: '直線範囲 => ノックバック',
          cn: '直线 => 击退',
          ko: '직선 장판 => 넉백',
        },
      },
    },
    {
      id: 'FRU P1 Burnt Strike Lightning',
      type: 'StartsUsing',
      netRegex: { source: 'Fatebreaker', id: '9CC5', capture: false },
      durationSeconds: 8,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Line Cleave => Out',
          de: 'Linien AoE => Raus',
          fr: 'AoE en ligne => Extérieur',
          ja: '直線範囲 => 離れる',
          cn: '直线 => 去外侧',
          ko: '직선 장판 => 바깥으로',
        },
      },
    },
    {
      id: 'FRU P1 Turn of the Heavens Fire',
      type: 'StartsUsing',
      netRegex: { id: '9CD6', source: 'Fatebreaker\'s Image', capture: false },
      durationSeconds: 10,
      infoText: (_data, _matches, output) => output.lightningSafe!(),
      outputStrings: {
        lightningSafe: {
          en: 'Lightning Safe',
          de: 'Blitz Sicher',
          ja: '雷安置',
          cn: '雷安全',
        },
      },
    },
    {
      id: 'FRU P1 Turn of the Heavens Lightning',
      type: 'StartsUsing',
      netRegex: { id: '9CD7', source: 'Fatebreaker\'s Image', capture: false },
      durationSeconds: 10,
      infoText: (_data, _matches, output) => output.fireSafe!(),
      outputStrings: {
        fireSafe: {
          en: 'Fire Safe',
          de: 'Feuer Sicher',
          ja: '炎安置',
          cn: '火安全',
        },
      },
    },
    {
      id: 'FRU P1 Fall of Faith Collector',
      type: 'StartsUsing',
      netRegex: {
        id: ['9CC9', '9CCC'],
        source: ['Fatebreaker', 'Fatebreaker\'s Image'],
        capture: true,
      },
      durationSeconds: (data) => data.p1FallOfFaithTethers.length >= 3 ? 8.7 : 3,
      infoText: (data, matches, output) => {
        const curTether = matches.id === '9CC9' ? 'fire' : 'lightning';
        data.p1FallOfFaithTethers.push(curTether);

        if (data.p1FallOfFaithTethers.length < 4) {
          const num = data.p1FallOfFaithTethers.length === 1
            ? 'one'
            : (data.p1FallOfFaithTethers.length === 2 ? 'two' : 'three');
          return output.tether!({
            num: output[num]!(),
            elem: output[curTether]!(),
          });
        }

        const [e1, e2, e3, e4] = data.p1FallOfFaithTethers;

        if (e1 === undefined || e2 === undefined || e3 === undefined || e4 === undefined)
          return;

        return output.all!({
          e1: output[e1]!(),
          e2: output[e2]!(),
          e3: output[e3]!(),
          e4: output[e4]!(),
        });
      },
      outputStrings: {
        fire: {
          en: 'Fire',
          de: 'Feuer',
          ja: '炎',
          cn: '火',
        },
        lightning: {
          en: 'Lightning',
          de: 'Blitz',
          ja: '雷',
          cn: '雷',
        },
        one: {
          en: '1',
          de: '1',
          ja: '1',
          cn: '1',
        },
        two: {
          en: '2',
          de: '2',
          ja: '2',
          cn: '2',
        },
        three: {
          en: '3',
          de: '3',
          ja: '3',
          cn: '3',
        },
        tether: {
          en: '${num}: ${elem}',
          de: '${num}: ${elem}',
          ja: '${num}: ${elem}',
          cn: '${num}: ${elem}',
        },
        all: {
          en: '${e1} => ${e2} => ${e3} => ${e4}',
          de: '${e1} => ${e2} => ${e3} => ${e4}',
          ja: '${e1} => ${e2} => ${e3} => ${e4}',
          cn: '${e1} => ${e2} => ${e3} => ${e4}',
        },
      },
    },
    // P2 -- Usurper Of Frost

    // Crystals

    // P3 -- Oracle Of Darkness

    // P4 -- Duo

    // P5 -- Pandora
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Sinbound Fire III/Sinbound Thunder III': 'Sinbound Fire/Thunder',
      },
    },
    {
      'missingTranslations': true,
      'locale': 'de',
      'replaceSync': {
        'Fatebreaker(?!\')': 'fusioniert(?:e|er|es|en) Ascian',
        'Fatebreaker\'s Image': 'Abbild des fusionierten Ascians',
      },
      'replaceText': {
        'Blastburn': 'Brandstoß',
        'Blasting Zone': 'Erda-Detonation',
        'Burn Mark': 'Brandmal',
        'Burnished Glory': 'Leuchtende Aureole',
        'Burnout': 'Brandentladung',
        'Burnt Strike': 'Brandschlag',
        'Cyclonic Break': 'Zyklon-Brecher',
        'Explosion': 'Explosion',
        'Fall Of Faith': 'Sünden-Erdspaltung',
        'Floating Fetters': 'Schwebende Fesseln',
        'Powder Mark Trail': 'Stetes Pulvermal',
        'Sinblaze': 'Sündenglut',
        'Sinbound Fire III': 'Sünden-Feuga',
        'Sinbound Thunder III': 'Sünden-Blitzga',
        'Sinsmite': 'Sündenblitz',
        'Sinsmoke': 'Sündenflamme',
        'Turn Of The Heavens': 'Kreislauf der Wiedergeburt',
        'Utopian Sky': 'Paradiestrennung',
      },
    },
    {
      'missingTranslations': true,
      'locale': 'fr',
      'replaceSync': {
        'Fatebreaker(?!\')': 'Sabreur de destins',
        'Fatebreaker\'s Image': 'double du Sabreur de destins',
      },
      'replaceText': {
        'Blastburn': 'Explosion brûlante',
        'Blasting Zone': 'Zone de destruction',
        'Burn Mark': 'Marque explosive',
        'Burnished Glory': 'Halo luminescent',
        'Burnout': 'Combustion totale',
        'Burnt Strike': 'Frappe brûlante',
        'Cyclonic Break': 'Brisement cyclonique',
        'Explosion': 'Explosion',
        'Fall Of Faith': 'Section illuminée',
        'Floating Fetters': 'Entraves flottantes',
        'Powder Mark Trail': 'Marquage fatal enchaîné',
        'Sinblaze': 'Embrasement authentique',
        'Sinbound Fire III': 'Méga Feu authentique',
        'Sinbound Thunder III': 'Méga Foudre authentique',
        'Sinsmite': 'Éclair du péché',
        'Sinsmoke': 'Flammes du péché',
        'Turn Of The Heavens': 'Cercles rituels',
        'Utopian Sky': 'Ultime paradis',
      },
    },
    {
      'missingTranslations': true,
      'locale': 'ja',
      'replaceSync': {
        'Fatebreaker(?!\')': 'フェイトブレイカー',
        'Fatebreaker\'s Image': 'フェイトブレイカーの幻影',
      },
      'replaceText': {
        'Blastburn': 'バーンブラスト',
        'Blasting Zone': 'ブラスティングゾーン',
        'Burn Mark': '爆印',
        'Burnished Glory': '光焔光背',
        'Burnout': 'バーンアウト',
        'Burnt Strike': 'バーンストライク',
        'Cyclonic Break': 'サイクロニックブレイク',
        'Explosion': '爆発',
        'Fall Of Faith': 'シンソイルセヴァー',
        'Floating Fetters': '浮遊拘束',
        'Powder Mark Trail': '連鎖爆印刻',
        'Sinblaze': 'シンブレイズ',
        'Sinbound Fire III': 'シンファイガ',
        'Sinbound Thunder III': 'シンサンダガ',
        'Sinsmite': 'シンボルト',
        'Sinsmoke': 'シンフレイム',
        'Turn Of The Heavens': '転輪召',
        'Utopian Sky': '楽園絶技',
      },
    },
  ],
};

export default triggerSet;
