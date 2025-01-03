import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutputIntercard, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO:
//  - Call safe tile(s) for Firearms - Artillery?

const bubbleIntercards = [...Directions.outputIntercardDir];
const featherRayCenterY = -160;
const featherRayCenterX = -105;
const featherRayWestBubblesCenterX = -113;
const featherRayEastBubblesCenterX = -97;

export interface Data extends RaidbossData {
  collectBubbles: boolean;
  eastBubbleSetSafe: DirectionOutputIntercard[];
  westBubbleSetSafe: DirectionOutputIntercard[];
  seenMirrorManeuver: boolean;
  seenDeepThunder: boolean;
  seenShatter: boolean;
}

const triggerSet: TriggerSet<Data> = {
  id: 'TheSkydeepCenote',
  zoneId: ZoneId.TheSkydeepCenote,
  timelineFile: 'skydeep-cenote.txt',
  initData: () => ({
    collectBubbles: false,
    eastBubbleSetSafe: [...bubbleIntercards],
    westBubbleSetSafe: [...bubbleIntercards],
    seenMirrorManeuver: false,
    seenDeepThunder: false,
    seenShatter: false,
  }),
  triggers: [
    // ** Feather Ray ** //
    {
      id: 'SkydeepCenote Feather Ray Immersion',
      type: 'StartsUsing',
      netRegex: { id: '8F83', source: 'Feather Ray', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'SkydeepCenote Feather Ray Nuisance Wave',
      type: 'HeadMarker',
      netRegex: { id: '0202' },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.wave!(),
      outputStrings: {
        wave: {
          en: 'Look away from party',
          de: 'Schau weg von der Gruppe',
          fr: 'Ne regardez pas le groupe',
          cn: '背对小队成员',
          ko: '파티원쪽 쳐다보지 않기',
        },
      },
    },
    {
      id: 'SkydeepCenote Feather Ray Blowing Bubbles',
      type: 'Ability',
      netRegex: { id: '8F7C', source: 'Feather Ray', capture: false },
      infoText: (_data, _matches, output) => output.avoid!(),
      outputStrings: {
        avoid: {
          en: 'Avoid bubbles',
          de: 'Weiche Blasen aus',
          fr: 'Évitez les bulles',
          cn: '躲避泡泡',
          ko: '거품 피하기',
        },
      },
    },
    {
      id: 'SkydeepCenote Feather Ray Trouble Bubbles',
      type: 'Ability',
      netRegex: { id: '9783', source: 'Feather Ray', capture: false },
      infoText: (_data, _matches, output) => output.avoid!(),
      outputStrings: {
        avoid: {
          en: 'Avoid bubbles',
          de: 'Weiche Blasen aus',
          fr: 'Évitez les bulles',
          cn: '躲避泡泡',
          ko: '거품 피하기',
        },
      },
    },
    {
      id: 'SkydeepCenote Feather Ray Bubble Bomb Tracker',
      type: 'Ability',
      netRegex: { id: '8F7F', source: 'Feather Ray', capture: false },
      run: (data) => data.collectBubbles = true,
    },
    {
      id: 'SkydeepCenote Feather Ray Bubble Bomb Collect',
      type: 'ActorSetPos',
      netRegex: {},
      condition: (data) => data.collectBubbles,
      run: (data, matches) => {
        const x = Math.round(parseFloat(matches.x));
        const y = Math.round(parseFloat(matches.y));

        // Bubbles spawn in 4 rows at y: -172 (north), -164, -156, and -148 (south)
        // and in 6 columns at x: -125 (west), -117, -109, -101, -93, and -85 (east)
        // Rolling Current will shift all bubbles one column east/west.
        // One melee intercard of the boss will always be safe after Rolling Current,
        // we can collect for the 4 east-shifted intercard spots & 4 west-shifted intercard spots,
        // and once we know the Rolling Current direction, we know which boss intercard is safe.

        // Exclude combatants in the north/south rows and the far east/west columns
        // as they don't matter.  Also, use int values rather than < > comparisons,
        // as the boss gets an ActorSetPos here too for dead center, which would mess things up.
        const middleRowsY = [-156, -164];
        const middleColsX = [-117, -109, -101, -93];
        if (!middleRowsY.includes(y) || !middleColsX.includes(x))
          return;

        const relCenterX = x < featherRayCenterX
          ? featherRayWestBubblesCenterX
          : featherRayEastBubblesCenterX;

        const bubbleSpot = Directions.xyToIntercardDirOutput(x, y, relCenterX, featherRayCenterY);
        if (x < featherRayCenterX)
          data.westBubbleSetSafe = data.westBubbleSetSafe.filter((dir) => dir !== bubbleSpot);
        else
          data.eastBubbleSetSafe = data.eastBubbleSetSafe.filter((dir) => dir !== bubbleSpot);
      },
    },
    {
      id: 'SkydeepCenote Feather Ray Rolling Current',
      type: 'StartsUsing',
      // 8F80 -> push from west to east
      // 8F81 -> push from east to west
      netRegex: { id: ['8F80', '8F81'], source: 'Feather Ray' },
      alertText: (data, matches, output) => {
        const bubbleArr = matches.id === '8F80' ? data.westBubbleSetSafe : data.eastBubbleSetSafe;
        if (bubbleArr.length === 0 || bubbleArr.length > 1)
          return output.avoid!();

        const safe = bubbleArr[0];
        if (safe === undefined)
          return output.avoid!();

        return output.avoidDir!({ dir: output[safe]!() });
      },
      run: (data) => {
        data.collectBubbles = false;
        data.eastBubbleSetSafe = [...bubbleIntercards];
        data.westBubbleSetSafe = [...bubbleIntercards];
      },
      outputStrings: {
        avoidDir: {
          en: 'Safe: ${dir} (on hitbox)',
          de: 'Sicher: ${dir} (auf der Hitbox)',
          fr: 'Sûr : ${dir} (sur la hitbox)',
          cn: '安全区: ${dir} (判定圈上)',
          ko: '안전: ${dir} (히트박스 안)',
        },
        avoid: {
          en: 'Avoid shifting bubbles',
          de: 'Weiche bewegenden Blasen aus',
          fr: 'Éviter les bulles mobiles',
          cn: '躲避被击退的泡泡',
          ko: '밀려나는 거품 피하기',
        },
        ...Directions.outputStringsIntercardDir,
      },
    },

    // ** Firearms ** //
    {
      id: 'SkydeepCenote Firearms Dynamic Dominance',
      type: 'StartsUsing',
      netRegex: { id: '8E60', source: 'Firearms', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'SkydeepCenote Firearms Pummel',
      type: 'StartsUsing',
      netRegex: { id: '8E5F', source: 'Firearms' },
      response: Responses.tankBuster(),
    },
    {
      id: 'SkydeepCenote Firearms Initial Mirror Maneuver',
      type: 'StartsUsing',
      // 8E5B - First Thunderlight Burst (cleave from boss toward mirror)
      netRegex: { id: '8E5B', source: 'Firearms', capture: false },
      durationSeconds: 8,
      infoText: (data, _matches, output) =>
        data.seenMirrorManeuver ? output.nearOrb!() : output.awayFromOrb!(),
      run: (data) => data.seenMirrorManeuver = true,
      outputStrings: {
        awayFromOrb: {
          en: 'North + Away from orb',
          de: 'Norden + Weg vom Orb',
          fr: 'Nord + Évitez les orbes',
          cn: '上 + 远离黄球',
          ko: '북쪽 + 구슬에서 멀리 떨어지기',
        },
        nearOrb: {
          en: 'Be close to North orb',
          de: 'Sei nahe beim nördlichen Orb',
          fr: 'Près de l\'orbe nord',
          cn: '靠近上半场黄球',
          ko: '북쪽 구슬에 가까이 붙기',
        },
      },
    },
    {
      id: 'SkydeepCenote Firearms Artillery',
      type: 'Ability',
      netRegex: { id: '8E5A', source: 'Firearms', capture: false },
      infoText: (_data, _matches, output) => output.tiles!(),
      outputStrings: {
        tiles: {
          en: 'Avoid exploding rows/columns',
          de: 'Weiche den explodierenden Reihen/Spalten aus',
          fr: 'Évitez les lignes/colonnes explosives',
          cn: '躲避爆炸行/列',
          ko: '가로/세로로 뻗어가는 장판 피하기',
        },
      },
    },

    // ** Maulskull ** //
    {
      id: 'SkydeepCenote Maulskull Ashlayer',
      type: 'StartsUsing',
      netRegex: { id: '8F67', source: 'Maulskull', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'SkydeepCenote Maulskull Deep Thunder',
      type: 'StartsUsing',
      netRegex: { id: '8F4F', source: 'Maulskull', capture: false },
      infoText: (data, _matches, output) =>
        data.seenDeepThunder ? output.stackFive!() : output.stackThree!(),
      run: (data) => data.seenDeepThunder = true,
      outputStrings: {
        stackThree: {
          en: 'Stack (3 hits)',
          de: 'Sammeln (3 Treffer)',
          fr: 'Pack (3 coups)',
          cn: '分摊 (3次)',
          ko: '쉐어 (3번)',
        },
        stackFive: {
          en: 'Stack (5 hits)',
          de: 'Sammeln (5 Treffer)',
          fr: 'Pack (5 coups)',
          cn: '分摊 (5次)',
          ko: '쉐어 (5번)',
        },
      },
    },
    {
      id: 'SkydeepCenote Maulskull Initial Stonecarver',
      type: 'StartsUsingExtra',
      // 8F3E is the first half-arena cleave, but the actor can be east or west.
      netRegex: { id: '8F3E' },
      durationSeconds: 10,
      alertText: (_data, matches, output) => {
        const firstCleave = parseFloat(matches.x) > 100 ? 'east' : 'west';
        return output[firstCleave]!();
      },
      outputStrings: {
        east: Outputs.leftThenRight,
        west: Outputs.rightThenLeft,
      },
    },
    {
      id: 'SkydeepCenote Maulskull Initial Skullcrush',
      type: 'StartsUsing',
      netRegex: { id: '8F43', source: 'Maulskull', capture: false },
      durationSeconds: 6,
      infoText: (_data, _matches, output) => output.kbAoeSpread!(),
      outputStrings: {
        kbAoeSpread: {
          en: 'Knockback (AoE) => Spread',
          de: 'Rückstoß (AoE) => Verteilen',
          fr: 'Poussée (AoE) => Dispersion',
          cn: '击退 (AOE) => 分散',
          ko: '넉백 => 산개',
        },
      },
    },
    {
      id: 'SkydeepCenote Maulskull Maulwork + Shatter Middle',
      type: 'Ability',
      netRegex: { id: ['8F47', '8F48'], source: 'Maulskull', capture: false },
      durationSeconds: 9,
      infoText: (_data, _matches, output) => output.dodgeSides!(),
      outputStrings: {
        dodgeSides: {
          en: 'Avoid AoEs (sides after)',
          de: 'Vermeide AoEs (danach Seiten)',
          fr: 'Évitez les AoE (côtés ensuite)',
          cn: '躲 AOE (然后去两侧)',
          ko: '장판 피하기 (이후 양옆으로)',
        },
      },
    },
    {
      id: 'SkydeepCenote Maulskull Maulwork + Shatter Middle Followup',
      type: 'Ability',
      netRegex: { id: ['8F47', '8F48'], source: 'Maulskull', capture: false },
      delaySeconds: 10,
      response: Responses.goSides(),
      run: (data) => data.seenShatter = true,
    },
    {
      id: 'SkydeepCenote Maulskull Maulwork + Shatter Sides',
      type: 'Ability',
      netRegex: { id: ['8F49', '8F4A'], source: 'Maulskull', capture: false },
      durationSeconds: 9,
      infoText: (_data, _matches, output) => output.dodgeMiddle!(),
      outputStrings: {
        dodgeMiddle: {
          en: 'Avoid AoEs (middle after)',
          de: 'Vermeide AoEs (danach Mitte)',
          fr: 'Évitez les AoE (milieu ensuite)',
          cn: '躲 AOE (然后去中间)',
          ko: '장판 피하기 (이후 중앙으로)',
        },
      },
    },
    {
      id: 'SkydeepCenote Maulskull Maulwork + Shatter Sides Followup',
      type: 'Ability',
      netRegex: { id: ['8F49', '8F4A'], source: 'Maulskull', capture: false },
      delaySeconds: 10,
      response: Responses.goMiddle(),
      run: (data) => data.seenShatter = true,
    },
    {
      id: 'SkydeepCenote Maulskull Stonecarver + Skullcrush',
      type: 'StartsUsingExtra',
      // 8F58 is the first half-arena cleave, but the actor can be east or west.
      netRegex: { id: '8F58' },
      durationSeconds: 11,
      alertText: (_data, matches, output) => {
        const firstCleave = parseFloat(matches.x) > 100 ? 'east' : 'west';
        return output[firstCleave]!();
      },
      outputStrings: {
        east: {
          en: '<== Knockback Back Left (Right After)',
          de: '<== Rückstoß hinten links (danach Rechts)',
          fr: '<== Poussée arrière gauche (Droite ensuite)',
          cn: '<== 击退到左后 (然后去右)',
          ko: '<== 왼쪽으로 넉백 (이후 오른쪽)',
        },
        west: {
          en: 'Knockback Back Right (Left After) ==>',
          de: 'Rückstoß hinten rechts (danach Links) ==>',
          fr: 'Poussée arrière droite (Gauche ensuite) ==>',
          cn: '击退到右后 (然后去左) ==>',
          ko: '오른쪽으로 넉백 (이후 왼쪽) ==>',
        },
      },
    },
    {
      id: 'SkydeepCenote Maulskull Colossal Impact',
      type: 'StartsUsing',
      netRegex: { id: ['8F60', '8F61'], source: 'Maulskull' },
      durationSeconds: 7.5,
      alertText: (_data, matches, output) => {
        const dir = matches.id === '8F60' ? output.dirNE!() : output.dirNW!();
        return output.knockback!({ dir: dir });
      },
      outputStrings: {
        knockback: {
          en: 'Knockback (to ${dir})',
          de: 'Rückstoß (nach ${dir})',
          fr: 'Poussée (vers ${dir})',
          cn: '击退 (去 ${dir})',
          ko: '넉백 (${dir}쪽으로)',
        },
        dirNE: Outputs.dirNE,
        dirNW: Outputs.dirNW,
      },
    },
    {
      id: 'SkydeepCenote Maulskull Destructive Heat',
      type: 'StartsUsing',
      netRegex: { id: '8F65', source: 'Maulskull', capture: false },
      condition: (data) => data.seenShatter,
      durationSeconds: 7,
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.spreadAfter!(),
      outputStrings: {
        spreadAfter: {
          en: '(spread after)',
          de: '(danach verteilen)',
          fr: '(dispersion ensuite)',
          cn: '(然后分散)',
          ko: '(이후 산개)',
        },
      },
    },
    {
      id: 'SkydeepCenote Maulskull Building Heat',
      type: 'StartsUsing',
      netRegex: { id: '8F66', source: 'Maulskull', capture: false },
      condition: (data) => data.seenShatter,
      durationSeconds: 7,
      infoText: (_data, _matches, output) => output.stackAfter!(),
      outputStrings: {
        stackAfter: {
          en: '(stack after)',
          de: '(danach sammeln)',
          fr: '(pack ensuite)',
          cn: '(然后集合)',
          ko: '(이후 쉐어)',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Building Heat/Destructive Heat': 'Building/Destructive Heat',
        'Destructive Heat/Building Heat': 'Destructive/Building Heat',
      },
    },
    {
      'locale': 'de',
      'replaceSync': {
        'Airy Bubble': 'Wasserblase',
        'Feather Ray': 'Federrochen',
        'Firearms': 'Steinfaust',
        'Maulskull': 'Hammerschädel',
      },
      'replaceText': {
        '\\(boss\\)': '(Boss)',
        '\\(first\\)': '(Erster)',
        '\\(party\\)': '(Gruppe)',
        '\\(second\\)': '(Zweiter)',
        'Ancient Artillery': 'Antike Artillerie',
        '(?<! )Artillery': 'Steinschloss',
        'Ashlayer': 'Hitzeentladung',
        'Blowing Bubbles': 'Pusteblasen',
        'Bubble Bomb': 'Blasenbombe',
        'Building Heat': 'Hitzeausdehnung',
        '(?<! )Burst': 'Zerschmetterung',
        'Colossal Impact': 'Kolossaler Impakt',
        'Deep Thunder': 'Bebende Walze',
        'Destructive Heat': 'Hitzezerfall',
        'Dynamic Dominance': 'Blitzender Boden',
        'Emergent Artillery': 'Artillerieaufbau',
        'Hydro Ring': 'Hydro-Ring',
        'Immersion': 'Immersion',
        '(?<! )Impact': 'Impakt',
        'Landing': 'Einschlag',
        'Maulwork': 'Wütender Steinhammer',
        'Mirror Maneuver': 'Spiegelstrahl',
        'Pummel': 'Deftige Dachtel',
        'Ringing Blows': 'Hammerschläge',
        'Rolling Current': 'Rollender Strom',
        'Shatter': 'Zerfallen',
        'Skullcrush': 'Schädelbrecher',
        'Stonecarver': 'Presslufthammer',
        'Thunderlight Burst': 'Blitzende Explosion',
        'Thunderlight Flurry': 'Blitzende Ladung',
        'Trouble Bubbles': 'Beunruhigende Blasen',
        'Troublesome Tail': 'Störender Schweif',
        'Worrisome Wave': 'Lästige Welle',
        'Wrought Fire': 'Hitzesublimierung',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Airy Bubble': 'bulle irisée',
        'Feather Ray': 'raie manta',
        'Firearms': 'artilleur lourd',
        'Maulskull': 'Cabosseur',
      },
      'replaceText': {
        '\\(boss\\)': '(Boss)',
        '\\(first\\)': '(Premier)',
        '\\(party\\)': '(groupe)',
        '\\(second\\)': '(Deuxième)',
        'Ancient Artillery': 'Activation du canon',
        '(?<! )Artillery': 'Tir d\'artillerie',
        'Ashlayer': 'Rayonnement calorifique',
        'Blowing Bubbles': 'Bulles soufflées',
        'Bubble Bomb': 'Bulle explosive',
        'Building Heat': 'Accumulation de chaleur',
        '(?<! )Burst': 'Éclatement',
        'Colossal Impact': 'Impact colossal',
        'Deep Thunder': 'Hurlement terrestre',
        'Destructive Heat': 'Chaleur destructrice',
        'Dynamic Dominance': 'Arc neutralisant',
        'Emergent Artillery': 'Déploiement d\'artillerie',
        'Hydro Ring': 'Hydro-anneau',
        'Immersion': 'Immersion',
        '(?<! )Impact': 'Impact',
        'Landing': 'Atterrissage rapide',
        'Maulwork': 'Martelage colérique',
        'Mirror Maneuver': 'Déploiement des miroirs',
        'Pummel': 'Torgnole',
        'Ringing Blows': 'Martelage continu',
        'Rolling Current': 'Courant grondant',
        'Shatter': 'Éclatement',
        'Skullcrush': 'Martelage crânien',
        'Stonecarver': 'Fracasse-roche',
        'Thunderlight Burst': 'Décharge neutralisante',
        'Thunderlight Flurry': 'Rafale neutralisante',
        'Trouble Bubbles': 'Souffle embrouillant',
        'Troublesome Tail': 'Fouettage embrouillant',
        'Worrisome Wave': 'Onde embrouillante',
        'Wrought Fire': 'Sublimation de chaleur',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Airy Bubble': '水泡',
        'Feather Ray': 'フェザーサークル',
        'Firearms': 'ヘヴィアームズ',
        'Maulskull': 'モールスカル',
      },
      'replaceText': {
        'Ancient Artillery': '火砲起動',
        '(?<! )Artillery': '火砲',
        'Ashlayer': '熱放射',
        'Blowing Bubbles': 'バブルブロワー',
        'Bubble Bomb': 'バブルボム',
        'Building Heat': '熱膨張',
        '(?<! )Burst': '飛散',
        'Colossal Impact': '衝撃拳',
        'Deep Thunder': '地ならし',
        'Destructive Heat': '熱破砕',
        'Dynamic Dominance': 'ショッキングバウ',
        'Emergent Artillery': '火砲展開',
        'Hydro Ring': 'ハイドロリング',
        'Immersion': 'イマーション',
        '(?<! )Impact': '衝撃',
        'Landing': '落着',
        'Maulwork': '怒りの石槌',
        'Mirror Maneuver': '大鏡起動',
        'Pummel': '殴打',
        'Ringing Blows': '石槌連続拳',
        'Rolling Current': 'ローリングカレント',
        'Shatter': '破砕',
        'Skullcrush': '石槌頭突き',
        'Stonecarver': '削岩拳',
        'Thunderlight Burst': 'ショックバースト',
        'Thunderlight Flurry': 'ショックストリーク',
        'Trouble Bubbles': 'メイワクブロワー',
        'Troublesome Tail': 'メイワクテイル',
        'Worrisome Wave': 'メイワクウェイブ',
        'Wrought Fire': '熱昇華',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Airy Bubble': '水泡',
        'Feather Ray': '羽环鳐',
        'Firearms': '重装大岩兵',
        'Maulskull': '锤颅巨兵',
      },
      'replaceText': {
        '\\(boss\\)': '(BOSS)',
        '\\(first\\)': '(一)',
        '\\(party\\)': '(玩家)',
        '\\(second\\)': '(二)',
        'Ancient Artillery': '火炮启动',
        '(?<! )Artillery': '火炮',
        'Ashlayer': '热能放射',
        'Blowing Bubbles': '吹气泡',
        'Bubble Bomb': '水泡炸弹',
        'Building Heat': '热能膨胀',
        '(?<! )Burst': '飞散',
        'Colossal Impact': '冲击拳',
        'Deep Thunder': '锤平',
        'Destructive Heat': '热能破碎',
        'Dynamic Dominance': '震荡压制',
        'Emergent Artillery': '火炮铺设',
        'Hydro Ring': '水环',
        'Immersion': '沉浸',
        '(?<! )Impact': '冲击',
        'Landing': '落地',
        'Maulwork': '落石怒锤',
        'Mirror Maneuver': '反射镜启动',
        'Pummel': '殴打',
        'Ringing Blows': '石锤连拳',
        'Rolling Current': '急流涌动',
        'Shatter': '破碎',
        'Skullcrush': '坚颅头锤',
        'Stonecarver': '削岩拳',
        'Thunderlight Burst': '冲击爆发',
        'Thunderlight Flurry': '冲击射线',
        'Trouble Bubbles': '添乱水泡',
        'Troublesome Tail': '添乱尾',
        'Worrisome Wave': '添乱水波',
        'Wrought Fire': '热能升华',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Airy Bubble': '물거품',
        'Feather Ray': '둥글날개',
        'Firearms': '중무장 병기',
        'Maulskull': '망치머리 거병',
      },
      'replaceText': {
        '\\(boss\\)': '(보스)',
        '\\(first\\)': '(1)',
        '\\(party\\)': '(파티)',
        '\\(second\\)': '(2)',
        'Ancient Artillery': '화포 기동',
        '(?<! )Artillery': '화포',
        'Ashlayer': '열 방사',
        'Blowing Bubbles': '거품 방울',
        'Bubble Bomb': '거품 봄',
        'Building Heat': '열 팽창',
        '(?<! )Burst': '대폭발',
        'Colossal Impact': '충격권',
        'Deep Thunder': '땅고르기',
        'Destructive Heat': '열 파쇄',
        'Dynamic Dominance': '전격 방출',
        'Emergent Artillery': '화포 전개',
        'Hydro Ring': '물 고리',
        'Immersion': '침수',
        '(?<! )Impact': '충격',
        'Landing': '착륙',
        'Maulwork': '분노의 망치질',
        'Mirror Maneuver': '거울 기동',
        'Pummel': '구타',
        'Ringing Blows': '연속 돌주먹',
        'Rolling Current': '물거품 굴리기',
        'Shatter': '갑각 파열',
        'Skullcrush': '돌망치 박치기',
        'Stonecarver': '착암권',
        'Thunderlight Burst': '전격 폭발',
        'Thunderlight Flurry': '연속 전격',
        'Trouble Bubbles': '성가신 물방울',
        'Troublesome Tail': '성가신 꼬리',
        'Worrisome Wave': '성가신 파도',
        'Wrought Fire': '열 승화',
      },
    },
  ],
};

export default triggerSet;
