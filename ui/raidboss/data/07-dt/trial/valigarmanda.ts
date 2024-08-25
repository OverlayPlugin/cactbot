import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO:
// * Combine trigger output for Chilling Cataclysm + Northern Cross during ice loop phase
// * Combine trigger output for Chilling Cataclysm + Freezing Dust during ice loop phase
// * Combine trigger output for Arcane Spheres + THunderous Breath during storm loop phase?

type Phase = 'start' | 'storm' | 'ice';
export interface Data extends RaidbossData {
  phase: Phase;
  iceTalonOnYou: boolean;
  arcaneLaneSafe: ArcaneLane[];
}

const arcaneLanesConst = [
  'northFront',
  'northBack',
  'middleFront',
  'middleBack',
  'southFront',
  'southBack',
] as const;
type ArcaneLane = typeof arcaneLanesConst[number];

const headMarkerData = {
  // Offsets: 141904,234848,462721,578694,714386
  // Vfx Path: m0656_move_s5count3x
  'freezingDustMove': '00E1',
  // Offsets: 80461,507712,623762
  // Vfx Path: tank_lockonae_6m_5s_01t
  'iceTalonBuster': '0158',
} as const;

const triggerSet: TriggerSet<Data> = {
  id: 'WorquorLarDor',
  zoneId: ZoneId.WorqorLarDor,
  timelineFile: 'valigarmanda.txt',
  initData: () => ({
    phase: 'start',
    iceTalonOnYou: false,
    arcaneLaneSafe: [...arcaneLanesConst],
  }),
  triggers: [
    // ************** GENERAL ************** //
    {
      id: 'Valigarmanda Phase Tracker',
      type: 'StartsUsing',
      // 8D41: Skyruin (Ice), 95C2: Skyruin (Storm)
      netRegex: { id: ['8D41', '95C2'], source: 'Valigarmanda' },
      run: (data, matches) => data.phase = matches.id === '95C2' ? 'storm' : 'ice',
    },
    {
      id: 'Valigarmanda Strangling Coil',
      type: 'StartsUsing',
      netRegex: { id: '8D3F', source: 'Valigarmanda', capture: false },
      durationSeconds: 6.5,
      alertText: (_data, _matches, output) => output.donut!(),
      outputStrings: {
        donut: {
          en: 'Donut (In)',
          de: 'Donut (Rein)',
          fr: 'Donut (Intérieur)',
          ja: 'ドーナツの中へ',
          cn: '中间月环',
          ko: '도넛 안으로',
        },
      },
    },
    {
      id: 'Valigarmanda Slithering Strike',
      type: 'StartsUsing',
      netRegex: { id: '8D3D', source: 'Valigarmanda', capture: false },
      durationSeconds: 6.5,
      alertText: (_data, _matches, output) => output.out!(),
      outputStrings: {
        out: Outputs.outOfMelee,
      },
    },
    {
      id: 'Valigarmanda Susurrant Breath',
      type: 'StartsUsing',
      netRegex: { id: '8D3B', source: 'Valigarmanda', capture: false },
      durationSeconds: 6.5,
      alertText: (_data, _matches, output) => output.cone!(),
      outputStrings: {
        cone: {
          en: 'Front Corner',
          de: 'Vordere Ecken',
          fr: 'Coin devant',
          ja: '前方の角へ',
          cn: '前面角落',
          ko: '앞쪽 구석으로',
        },
      },
    },
    {
      id: 'Valigarmanda Ice Talon Headmarker Collect',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.iceTalonBuster },
      condition: Conditions.targetIsYou(),
      run: (data) => data.iceTalonOnYou = true,
    },
    {
      id: 'Valigarmanda Ice Talon',
      type: 'StartsUsing',
      netRegex: { id: '8D58', source: 'Valigarmanda', capture: false },
      delaySeconds: 0.2,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          busterOnYou: Outputs.tankBusterOnYou,
          avoid: Outputs.tankBusters,
        };

        if (data.iceTalonOnYou)
          return { alertText: output.busterOnYou!() };
        return { infoText: output.avoid!() };
      },
      run: (data) => data.iceTalonOnYou = false,
    },
    {
      id: 'Valigarmanda Skyruin',
      type: 'StartsUsing',
      netRegex: { id: ['8D41', '95C2'], source: 'Valigarmanda', capture: false },
      delaySeconds: 5, // total displayed cast time: ~11.5
      response: Responses.aoe(),
    },
    {
      id: 'Valigarmanda Disaster Zone',
      type: 'StartsUsing',
      netRegex: { id: ['8D44', '8D46'], source: 'Valigarmanda', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Valigarmanda Ruinfall Tower',
      type: 'StartsUsing',
      netRegex: { id: '8D5B', source: 'Valigarmanda', capture: false },
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
      id: 'Valigarmanda Ruinfall Knockback',
      type: 'StartsUsing',
      netRegex: { id: '8D5D', source: 'Valigarmanda', capture: false },
      // 8s between cast start and knockback applied
      delaySeconds: 3,
      response: Responses.knockback(),
    },

    // ************** STORM PHASE ************** //
    {
      id: 'Valigarmanda Thunderous Breath',
      type: 'StartsUsing',
      netRegex: { id: '8D4F', source: 'Valigarmanda', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Be on elevated tile',
        },
      },
    },
    {
      id: 'Valigarmanda Blighted Bolt',
      type: 'StartsUsing',
      netRegex: { id: '8D4C', source: 'Valigarmanda', capture: false },
      durationSeconds: 7,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Be on ground tile - avoid feathers',
        },
      },
    },
    {
      // NOTE: Combatants seem to get added with correct/final position data, but if this
      // ends up being stale for some people, this can be changed to a `getCombatants` call.
      id: 'Valigarmanda Storm Arcane Sphere Collect',
      type: 'AddedCombatant',
      netRegex: { name: 'Arcane Sphere' },
      condition: (data) => data.phase === 'storm',
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
      id: 'Valigarmanda Storm Arcane Sphere Safe',
      type: 'AddedCombatant',
      netRegex: { name: 'Arcane Sphere', capture: false },
      condition: (data) => data.phase === 'storm',
      delaySeconds: 1, // let Collect finish first
      suppressSeconds: 2,
      alertText: (data, _matches, output) => {
        const safe = data.arcaneLaneSafe[0];
        if (data.arcaneLaneSafe.length !== 1 || safe === undefined)
          return output.avoid!();
        return output[safe]!();
      },
      run: (data) => data.arcaneLaneSafe = [...arcaneLanesConst],
      outputStrings: {
        avoid: {
          en: 'Dodge spheres',
          de: 'Spheren ausweichen',
          fr: 'Évitez les sphères',
          ja: '玉を避ける',
          cn: '躲开球',
          ko: '장판 피하기',
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

    // ************** ICE PHASE ************** //
    {
      id: 'Valigarmanda Northern Cross',
      type: 'MapEffect',
      // 00020001 - cleaves SW half (front/right safe)
      // 00200010 - cleaves NE half (back/left safe)
      netRegex: { flags: ['00020001', '00200010'], location: '02' },
      durationSeconds: 8,
      alertText: (_data, matches, output) => {
        if (matches.flags === '00020001')
          return output.frontRight!();
        return output.backLeft!();
      },
      outputStrings: {
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
      },
    },
    {
      id: 'Valigarmanda Freezing Dust',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.freezingDustMove },
      condition: Conditions.targetIsYou(),
      durationSeconds: 8, // debuff persists after cast finishes
      response: Responses.moveAround('alert'),
    },
    {
      id: 'Valigarmanda Chilling Cataclysm',
      // The cast is too short for a trigger
      type: 'AddedCombatant',
      netRegex: { name: 'Arcane Sphere', capture: false },
      condition: (data) => data.phase === 'ice',
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Dodge star lines',
        },
      },
    },
    // ************** ADDS PHASE ************** //
    {
      id: 'Valigarmanda Ruin Foretold',
      type: 'StartsUsing',
      netRegex: { id: '9691', source: 'Valigarmanda', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Valigarmanda Calamitous Cry',
      type: 'Ability',
      // 87A2: First stack marker; 6854: Subsequent stack markers
      netRegex: { id: ['87A2', '6854'], source: 'Valigarmanda' },
      response: Responses.stackMarkerOn('info'),
    },
    // 3-hit AOE. First damage applied ~3.1s after cast finishes, then ~8.5s & ~16.5 thereafter.
    // Time these alerts so that warnings go out ~5s before each hit.
    {
      id: 'Valigarmanda Tulidisaster 1',
      type: 'StartsUsing',
      netRegex: { id: '8D65', source: 'Valigarmanda', capture: false },
      delaySeconds: 5,
      response: Responses.bigAoe(),
    },
    {
      id: 'Valigarmanda Tulidisaster 2',
      type: 'StartsUsing',
      netRegex: { id: '8D65', source: 'Valigarmanda', capture: false },
      delaySeconds: 13.5,
      response: Responses.bigAoe(),
    },
    {
      id: 'Valigarmanda Tulidisaster 3',
      type: 'StartsUsing',
      netRegex: { id: '8D65', source: 'Valigarmanda', capture: false },
      delaySeconds: 21.5,
      response: Responses.bigAoe(),
    },
    {
      id: 'Valigarmanda Eruption',
      type: 'StartsUsing',
      netRegex: { id: '8D5E', source: 'Valigarmanda', capture: false },
      durationSeconds: 12,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Bait/dodge puddles x3',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Strangling Coil/Slithering Strike/Susurrant Breath': 'Middle/Away/Front Corners',
      },
    },
  ],
};

export default triggerSet;
