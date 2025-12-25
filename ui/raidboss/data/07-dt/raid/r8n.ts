import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  reignDir?: number;
  moonbeamBites: number[];
  moonbeamBitesTracker: number;
  moonlightQuadrant2?: string;
}

const centerX = 100;
const centerY = 100;

const headMarkerData = {
  // Shared tankbuster marker used for Great Divide
  'tankbuster': '0256',
  // Stack marker used for first two Heavensearths
  'stack': '003E',
  // Stack marker used for Heavensearth in Tactical Pack
  'stackAdds': '005D',
  // Spread marker used for Gust in Tactical Pack
  'spread': '0178',
  // Big, pulsing, 4-arrow stack marker for Tracking Tremors
  'eightHitStack': '013C',
} as const;

const moonlightOutputStrings = {
  ...Directions.outputStrings8Dir,
  safeQuad: {
    en: '${quad}',
    de: '${quad}',
    fr: '${quad}',
    ja: '${quad}',
    cn: '${quad}',
    tc: '${quad}',
    ko: '${quad}',
  },
  safeQuadrants: {
    en: '${quad1} => ${quad2}',
    de: '${quad1} => ${quad2}',
    fr: '${quad1} => ${quad2}',
    ja: '${quad1} => ${quad2}',
    cn: '${quad1} => ${quad2}',
    tc: '${quad1} => ${quad2}',
    ko: '${quad1} => ${quad2}',
  },
};

const triggerSet: TriggerSet<Data> = {
  id: 'AacCruiserweightM4',
  zoneId: ZoneId.AacCruiserweightM4,
  timelineFile: 'r8n.txt',
  initData: () => ({
    moonbeamBites: [],
    moonbeamBitesTracker: 0,
  }),
  triggers: [
    {
      id: 'R8N Extraplanar Pursuit',
      type: 'StartsUsing',
      netRegex: { id: 'A38E', source: 'Howling Blade', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R8N Great Divide',
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.tankbuster], capture: true },
      response: Responses.sharedTankBuster(),
    },
    {
      id: 'R8N Wolves\' Reign',
      type: 'StartsUsing',
      // A96D and A96E are used in first part of fight
      // A90F or A910 is used after adds
      // Normal mode is always in
      netRegex: { id: ['A96D', 'A96E', 'A90F', 'A910'], source: 'Howling Blade', capture: false },
      infoText: (_data, _matches, output) => {
        return output.inLater!();
      },
      outputStrings: {
        inLater: {
          en: '(In Later)',
          de: '(später Rein)',
          fr: '(Intérieur, plus tard)',
          ja: '(あとで内側)',
          cn: '(稍后内侧)',
          tc: '(稍後內側)',
          ko: '(나중에 안)',
        },
      },
    },
    {
      id: 'R8N Wolves\' Reign Direction',
      type: 'StartsUsing',
      netRegex: { id: ['A96D', 'A96E', 'A90F', 'A910'], source: 'Howling Blade', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) + 1.2,
      promise: async (data, matches) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `R8N Wolves' Reign Direction: Wrong actor count ${actors.length}`,
          );
          return;
        }

        data.reignDir = (Directions.hdgTo16DirNum(actor.Heading) + 8) % 16;
      },
      infoText: (data, _matches, output) => {
        const dir = output[Directions.output16Dir[data.reignDir ?? -1] ?? 'unknown']!();
        return output.inDir!({ dir: dir });
      },
      run: (data) => {
        data.reignDir = undefined;
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
        inDir: {
          en: 'In ${dir}',
          de: 'Rein ${dir}',
          fr: 'Intérieur ${dir}',
          ja: '内側 ${dir}',
          cn: '内侧 ${dir}',
          tc: '內側 ${dir}',
          ko: '${dir} 안',
        },
      },
    },
    {
      id: 'R8N Heavensearth',
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.stack, headMarkerData.stackAdds], capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R8N Beckon Moonlight Quadrants',
      type: 'Ability',
      // First set is constant, later sets use different spell ids
      // A97E/A3DE => Right cleave self-cast
      // A97F/A3DF => Left cleave self-cast
      netRegex: { id: ['A97E', 'A3DE', 'A97F', 'A3DF'], source: 'Moonlit Shadow', capture: true },
      delaySeconds: 0.1,
      durationSeconds: 10,
      promise: async (data, matches) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `R8N Beckon Moonlight Quadrants: Wrong actor count ${actors.length}`,
          );
          return;
        }

        const dirNum = Directions.xyTo8DirNum(actor.PosX, actor.PosY, centerX, centerY);
        // Moonbeam's Bite (A97C/A376 Left / A97D/A377 Right) half-room cleaves
        // Defining the cleaved side
        if (matches.id === 'A97E' || matches.id === 'A3DE') {
          const counterclock = dirNum === 0 ? 6 : dirNum - 2;
          data.moonbeamBites.push(counterclock);
        }
        if (matches.id === 'A97F' || matches.id === 'A3DF') {
          const clockwise = (dirNum + 2) % 8;
          data.moonbeamBites.push(clockwise);
        }
      },
      infoText: (data, _matches, output) => {
        if (data.moonbeamBites.length === 1 || data.moonbeamBites.length === 3)
          return;

        const quadrants = [1, 3, 5, 7];
        const moonbeam1 = data.moonbeamBites[0] ?? -1;
        const moonbeam2 = data.moonbeamBites[1] ?? -1;
        let safeQuads1 = quadrants.filter((quadrant) => {
          return quadrant !== moonbeam1 + 1;
        });
        safeQuads1 = safeQuads1.filter((quadrant) => {
          return quadrant !== (moonbeam1 === 0 ? 7 : moonbeam1 - 1);
        });
        safeQuads1 = safeQuads1.filter((quadrant) => {
          return quadrant !== moonbeam2 + 1;
        });
        safeQuads1 = safeQuads1.filter((quadrant) => {
          return quadrant !== (moonbeam2 === 0 ? 7 : moonbeam2 - 1);
        });

        // Early output for first two
        if (data.moonbeamBites.length === 2) {
          if (safeQuads1.length !== 1 || safeQuads1[0] === undefined) {
            console.error(
              `R8N Beckon Moonlight Quadrants: Invalid safeQuads1, length of ${safeQuads1.length}.`,
            );
            return;
          }
          const quad = output[Directions.outputFrom8DirNum(safeQuads1[0] ?? -1)]!();
          return output.safeQuad!({ quad: quad });
        }

        const moonbeam3 = data.moonbeamBites[2] ?? -1;
        const moonbeam4 = data.moonbeamBites[3] ?? -1;
        let safeQuads2 = quadrants.filter((quadrant) => {
          return quadrant !== moonbeam3 + 1;
        });
        safeQuads2 = safeQuads2.filter((quadrant) => {
          return quadrant !== (moonbeam3 === 0 ? 7 : moonbeam3 - 1);
        });
        safeQuads2 = safeQuads2.filter((quadrant) => {
          return quadrant !== moonbeam4 + 1;
        });
        safeQuads2 = safeQuads2.filter((quadrant) => {
          return quadrant !== (moonbeam4 === 0 ? 7 : moonbeam4 - 1);
        });

        if (safeQuads1[0] === undefined || safeQuads2[0] === undefined) {
          console.error(
            `R8N Beckon Moonlight Quadrants: First safeQuads missing`,
          );
          return;
        }
        if (safeQuads1.length !== 1) {
          console.error(
            `R8N Beckon Moonlight Quadrants: Invalid safeQuads1, length of ${safeQuads1.length}`,
          );
          return;
        }
        if (safeQuads2.length !== 1) {
          console.error(
            `R8N Beckon Moonlight Quadrants: Invalid safeQuads2, length of ${safeQuads2.length}`,
          );
          return;
        }

        // Store quadrant for move call
        data.moonlightQuadrant2 = output[Directions.outputFrom8DirNum(safeQuads2[0] ?? -1)]!();

        const quad1 = output[Directions.outputFrom8DirNum(safeQuads1[0] ?? -1)]!();
        return output.safeQuadrants!({ quad1: quad1, quad2: data.moonlightQuadrant2 });
      },
      outputStrings: moonlightOutputStrings,
    },
    {
      id: 'R8N Beckon Moonlight Quadrant Two',
      type: 'StartsUsing',
      // A97C/A376 => Moonbeam's Bite dash with Left cleave
      // A97D/A377 => Moonbeam's Bite dash with Right cleave
      netRegex: { id: ['A97C', 'A376', 'A97D', 'A377'], source: 'Moonlit Shadow', capture: true },
      condition: (data) => {
        data.moonbeamBitesTracker = data.moonbeamBitesTracker + 1;
        if (data.moonbeamBitesTracker === 2)
          return true;
        return false;
      },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime),
      infoText: (data, _matches, output) => {
        return output.safeQuad!({ quad: data.moonlightQuadrant2 });
      },
      run: (data) => {
        // Reset for additional Beckon Moonlights
        if (data.moonbeamBitesTracker === 4) {
          data.moonbeamBites = [];
          delete data.moonlightQuadrant2;
          data.moonbeamBitesTracker = 0;
        }
      },
      outputStrings: moonlightOutputStrings,
    },
    {
      id: 'R8N Shadowchase',
      // A981 cast before adds
      // A374 cast after adds
      type: 'StartsUsing',
      netRegex: { id: ['A981', 'A374'], source: 'Howling Blade', capture: false },
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => {
        return output.behindClones!();
      },
      outputStrings: {
        behindClones: {
          en: 'Behind Clones',
          de: 'Hinter den Klonen',
          fr: 'Derrière les clones',
          cn: '去分身后',
          tc: '去分身後',
          ko: '분신 뒤로',
        },
      },
    },
    {
      id: 'R8N Gust',
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.spread], capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'R8N Ravenous Saber',
      type: 'StartsUsing',
      netRegex: { id: 'A743', source: 'Howling Blade', capture: false },
      durationSeconds: 7,
      response: Responses.bigAoe(),
    },
    {
      id: 'R8N Weal of Stone',
      // TODO: Add direction such as Avoid lines from ${dir}
      // There are two casts: A989 and A988
      type: 'StartsUsing',
      netRegex: { id: 'A989', source: 'Wolf of Stone', capture: false },
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => {
        return output.lines!();
      },
      outputStrings: {
        lines: {
          en: 'Avoid Lines',
          de: 'Vermeide Linien',
          fr: 'Évitez les lignes',
          ja: '直線攻撃を避ける',
          cn: '躲避直线 AoE',
          tc: '躲避直線 AoE',
          ko: '직선장판 피하기',
        },
      },
    },
    {
      id: 'R8N Shadowchase Rotate',
      // Call to move behind Dragon Head after clones dash
      // These only spawn after adds
      // Dragon Heads cast Roaring Wind (A984 and A985)
      type: 'StartsUsing',
      netRegex: { id: 'A374', source: 'Howling Blade', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime),
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => {
        return output.rotate!();
      },
      outputStrings: {
        rotate: {
          en: 'Rotate',
          de: 'Rotieren',
          fr: 'Tournez',
          ja: '回転',
          cn: '旋转',
          tc: '旋轉',
          ko: '회전',
        },
      },
    },
    {
      id: 'R8N Tracking Tremors',
      type: 'StartsUsing',
      netRegex: { id: 'A4E2', source: 'Howling Blade', capture: false },
      durationSeconds: 10,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Stack x5',
          de: 'Sammeln x5',
          fr: 'Package x5',
          ja: '頭割り x5',
          cn: '5次分摊',
          tc: '5次分攤',
          ko: '쉐어 5번',
        },
      },
    },
    {
      id: 'R8N Weal of Stone Cardinals',
      // There are two casts and cardinals is always safe:
      // A98C Weal of Stone
      // A98D Weal of Stone
      type: 'StartsUsing',
      netRegex: { id: 'A98D', source: 'Wolf of Stone', capture: false },
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => {
        return output.cardinals!();
      },
      outputStrings: {
        cardinals: Outputs.cardinals,
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Gleaming Fang': 'Lichtreißer',
        'Howling Blade': 'Heulende Klinge',
        'Moonlit Shadow': 'heulend(?:e|er|es|en) Phantom',
        'Wolf of Stone': 'Wolf der Erde',
        'Wolf of Wind': 'Wolf des Windes',
      },
      'replaceText': {
        'Bare Fangs': 'Lichtreißer-Beschwörung',
        'Beckon Moonlight': 'Phantomwolf-Beschwörung',
        'Extraplanar Pursuit': 'Raumspalter',
        'Fanged Charge': 'Lichtreißersturm',
        'Great Divide': 'Lichtspalter',
        'Growling Wind': 'Windspalter',
        'Gust': 'Böe',
        'Heavensearth': 'Großes Beben',
        'Moonbeam\'s Bite': 'Phantomwolfsklinge',
        'Ravenous Saber': 'Wirbellichtklinge',
        'Roaring Wind': 'Jaulender Wind',
        'Shadowchase': 'Echoklinge',
        'Tactical Pack': 'Lichtwolf-Beschwörung',
        'Targeted Quake': 'Lokales Erdbeben',
        'Terrestrial Rage': 'Gaias Zorn',
        'Terrestrial Titans': 'Ruf der Erde',
        'Titanic Pursuit': 'Himmelschneider',
        'Towerfall': 'Turmsturz',
        'Tracking Tremors': 'Multi-Beben',
        'Weal of Stone': 'Erdspalter',
        'Wolves\' Reign': 'Wolfsrudel',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Gleaming Fang': 'croc de lumière',
        'Howling Blade': 'Howling Blade',
        'Moonlit Shadow': 'double de Howling Blade',
        'Wolf of Stone': 'loup de la terre',
        'Wolf of Wind': 'loup du vent',
      },
      'replaceText': {
        'Bare Fangs': 'Invocation des crocs radieux',
        'Beckon Moonlight': 'Invocation du loup spectral',
        'Extraplanar Pursuit': 'Tranchage du vide',
        'Fanged Charge': 'Assaut des crocs radieux',
        'Great Divide': 'Tranchage net',
        'Growling Wind': 'Souffle tranchant',
        'Gust': 'Bourrasque',
        'Heavensearth': 'Frappe sismique',
        'Moonbeam\'s Bite': 'Lame du loup spectral',
        'Ravenous Saber': 'Rafale du loup radieux',
        'Roaring Wind': 'Déferlante du loup tempétueux',
        'Shadowchase': 'Tranchage mirage',
        'Tactical Pack': 'Invocation du loup radieux',
        'Targeted Quake': 'Secousse ciblée',
        'Terrestrial Rage': 'Fureur tellurique',
        'Terrestrial Titans': 'Invocation tellurique',
        'Titanic Pursuit': 'Tranchage du loup spectral',
        'Towerfall': 'Écroulement',
        'Tracking Tremors': 'Secousses en cascade',
        'Weal of Stone': 'Fracas terrestre',
        'Wolves\' Reign': 'Lame de la meute',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Gleaming Fang': '光の牙',
        'Howling Blade': 'ハウリングブレード',
        'Moonlit Shadow': 'ハウリングブレードの幻影',
        'Wolf of Stone': '土の狼頭',
        'Wolf of Wind': '風の狼頭',
      },
      'replaceText': {
        'Bare Fangs': '光牙招来',
        'Beckon Moonlight': '幻狼招来',
        'Extraplanar Pursuit': '空間斬り',
        'Fanged Charge': '突進光牙',
        'Great Divide': '一刀両断',
        'Growling Wind': '風刃気',
        'Gust': '旋風',
        'Heavensearth': '大震撃',
        'Moonbeam\'s Bite': '幻狼剣',
        'Ravenous Saber': '風塵光狼斬',
        'Roaring Wind': '風狼豪波',
        'Shadowchase': '残影剣',
        'Tactical Pack': '光狼招来',
        'Targeted Quake': '局地地震',
        'Terrestrial Rage': '大地の怒り',
        'Terrestrial Titans': '大地の呼び声',
        'Titanic Pursuit': '斬空剣',
        'Towerfall': '倒壊',
        'Tracking Tremors': '連震撃',
        'Weal of Stone': '地烈波',
        'Wolves\' Reign': '群狼剣',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Gleaming Fang': '光牙',
        'Howling Blade': '剑嚎',
        'Moonlit Shadow': '剑嚎的幻影',
        'Wolf of Stone': '土狼首',
        'Wolf of Wind': '风狼首',
      },
      'replaceText': {
        '\\(castbar\\)': '(咏唱栏)',
        '\\(circles\\)': '(圆形)',
        '\\(cone\\)': '(扇形)',
        '\\(line\\)': '(直线)',
        'Bare Fangs': '光牙召唤',
        'Beckon Moonlight': '幻狼召唤',
        'Extraplanar Pursuit': '空间斩',
        'Fanged Charge': '突进光牙',
        'Great Divide': '一刀两断',
        'Growling Wind': '风刃气',
        'Gust': '狂风',
        'Heavensearth': '大震击',
        'Moonbeam\'s Bite': '幻狼剑',
        'Ravenous Saber': '风尘光狼斩',
        'Roaring Wind': '风狼豪波',
        'Shadowchase': '残影剑',
        'Tactical Pack': '光狼召唤',
        'Targeted Quake': '局部地震',
        'Terrestrial Rage': '大地之怒',
        'Terrestrial Titans': '大地的呼唤',
        'Titanic Pursuit': '斩空剑',
        'Towerfall': '崩塌',
        'Tracking Tremors': '连震击',
        'Weal of Stone': '地烈波',
        'Wolves\' Reign': '群狼剑',
      },
    },
    {
      'locale': 'tc',
      'missingTranslations': true,
      'replaceSync': {
        'Gleaming Fang': '光の牙',
        'Howling Blade': 'ハウリングブレード',
        'Moonlit Shadow': 'ハウリングブレードの幻影',
        'Wolf of Stone': '土の狼頭',
        'Wolf of Wind': '風の狼頭',
      },
      'replaceText': {
        // '\\(castbar\\)': '', // FIXME '(咏唱栏)'
        // '\\(circles\\)': '', // FIXME '(圆形)'
        // '\\(cone\\)': '', // FIXME '(扇形)'
        // '\\(line\\)': '', // FIXME '(直线)'
        'Bare Fangs': '光牙召喚',
        'Beckon Moonlight': '幻狼召喚',
        'Extraplanar Pursuit': '空間斬',
        'Fanged Charge': '突進光牙',
        'Great Divide': '一刀兩斷',
        'Growling Wind': '風刃氣',
        'Gust': '狂風',
        'Heavensearth': '大震擊',
        'Moonbeam\'s Bite': '幻狼劍',
        'Ravenous Saber': '風塵光狼斬',
        'Roaring Wind': '風狼豪波',
        'Shadowchase': '殘影劍',
        'Tactical Pack': '光狼召喚',
        'Targeted Quake': '局部地震',
        'Terrestrial Rage': '大地之怒',
        'Terrestrial Titans': '大地之喚',
        'Titanic Pursuit': '斬空劍',
        'Towerfall': '崩塌',
        'Tracking Tremors': '連震擊',
        'Weal of Stone': '地烈波',
        'Wolves\' Reign': '群狼劍',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Gleaming Fang': '빛송곳니',
        'Howling Blade': '하울링 블레이드',
        'Moonlit Shadow': '하울링 블레이드의 환영',
        'Wolf of Stone': '땅의 늑대머리',
        'Wolf of Wind': '바람의 늑대머리',
      },
      'replaceText': {
        '\\(castbar\\)': '(시전)',
        '\\(circles\\)': '(원)',
        '\\(cone\\)': '(부채꼴)',
        '\\(line\\)': '(직선)',
        'Bare Fangs': '빛송곳니 소환',
        'Beckon Moonlight': '환영 늑대 소환',
        'Extraplanar Pursuit': '공간 베기',
        'Fanged Charge': '돌진 빛송곳니',
        'Great Divide': '일도양단',
        'Growling Wind': '풍검기',
        'Gust': '선풍',
        'Heavensearth': '대지진 공격',
        'Moonbeam\'s Bite': '환랑검',
        'Ravenous Saber': '풍진광랑참',
        'Roaring Wind': '풍랑호파',
        'Shadowchase': '잔영검',
        'Tactical Pack': '빛 늑대 소환',
        'Targeted Quake': '국지 지진',
        'Terrestrial Rage': '대지의 분노',
        'Terrestrial Titans': '대지의 부름',
        'Titanic Pursuit': '참공검',
        'Towerfall': '무너짐',
        'Tracking Tremors': '연속 지진 공격',
        'Weal of Stone': '지열파',
        'Wolves\' Reign': '군랑검',
      },
    },
  ],
};

export default triggerSet;
