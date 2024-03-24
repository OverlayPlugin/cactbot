import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutputCardinal, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { PluginCombatantState } from '../../../../../types/event';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  khadgaLC2Combatant?: PluginCombatantState;
  khadgaLC2Loc?: 'east' | 'west';
  iconicExecutionCount: number;
  asuraImageId?: string;
  storedIconMech?: Iconography;
}

type Iconography = 'out' | 'in' | 'sides';

const bossIconographyIds: { [id: string]: Iconography } = {
  '8C81': 'out', // Pedestal Purge
  '8C83': 'in', // Wheel of Deincarnation
  '8C85': 'sides', // Bladewise
};

const outSafeSpots: Record<DirectionOutputCardinal, DirectionOutputCardinal> = {
  'dirN': 'dirS',
  'dirE': 'dirW',
  'dirS': 'dirN',
  'dirW': 'dirE',
  'unknown': 'unknown',
};

const sidesSafeSpots: Record<DirectionOutputCardinal, DirectionOutputCardinal[]> = {
  'dirN': ['dirE', 'dirW'],
  'dirE': ['dirN', 'dirS'],
  'dirS': ['dirE', 'dirW'],
  'dirW': ['dirN', 'dirS'],
  'unknown': ['unknown', 'unknown'],
};

const centerX = 100;
const centerY = 100;

const triggerSet: TriggerSet<Data> = {
  id: 'TheGildedAraya',
  zoneId: ZoneId.TheGildedAraya,
  timelineFile: 'asura.txt',
  initData: () => {
    return {
      iconicExecutionCount: 0,
    };
  },
  triggers: [
    {
      id: 'Asura Lower Realm',
      type: 'StartsUsing',
      netRegex: { id: '8CA1', source: 'Asura', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Asura Cutting Jewel',
      type: 'StartsUsing',
      netRegex: { id: '8CA0', source: 'Asura', capture: true },
      response: Responses.tankCleave(),
    },
    {
      id: 'Asura Ephemerality',
      type: 'Ability',
      netRegex: { id: '8C96', source: 'Asura', capture: false },
      suppressSeconds: 2,
      alertText: (_data, _matches, output) => output.avoidClones!(),
      outputStrings: {
        'avoidClones': {
          en: 'Avoid clones',
          de: 'Vermeide Klone',
          fr: 'Évitez les clones',
          cn: '躲避分身',
          ko: '분신 피하기',
        },
      },
    },
    // After the first three Iconography mechanics, all future casts will be preceded by
    // the Asura Image jumping to a random(?) cardinal.
    {
      id: 'Asura Pedestal Purge',
      type: 'StartsUsing',
      netRegex: { id: '8C81', source: 'Asura', capture: false },
      alertText: (data, _matches, output) => {
        data.storedIconMech = 'out';
        if (data.iconicExecutionCount < 3)
          return output.noJump!();
        return output.withJump!();
      },
      outputStrings: {
        noJump: {
          en: 'Out => Away from Image',
          de: 'Raus => Weg von der Inkarnation',
          fr: 'Extérieur => Loin de l\'incarnation',
          cn: '远离 => 远离场边分身',
          ko: '밖으로 => 분신에서 멀리 떨어지기',
        },
        withJump: {
          en: 'Out => Away from Image After Jump',
          de: 'Raus => Weg von der Inkarnation nach dem Sprung',
          fr: 'Extérieur => Loin de l\'incarnation après le saut',
          cn: '远离 => 远离场边跳跃后的分身',
          ko: '밖으로 => 이동 이후 분신에서 멀리 떨어지기',
        },
      },
    },
    {
      id: 'Asura Wheel of Deincarnation',
      type: 'StartsUsing',
      netRegex: { id: '8C83', source: 'Asura', capture: false },
      alertText: (data, _matches, output) => {
        data.storedIconMech = 'in';
        if (data.iconicExecutionCount < 3)
          return output.noJump!();
        return output.withJump!();
      },
      outputStrings: {
        noJump: {
          en: 'In => Under Image',
          de: 'Rein => Unter die Inkarnation',
          fr: 'Intérieur => Sous l\'incarnation',
          cn: '靠近 => 靠近场边分身',
          ko: '안으로 => 분신 쪽으로',
        },
        withJump: {
          en: 'In => Under Image After Jump',
          de: 'Rein => Unter die Inkarnation nach dem Sprung',
          fr: 'Intérieur => Sous l\'incarnation après le saut',
          cn: '靠近 => 靠近场边跳跃后的分身',
          ko: '안으로 => 이동 이후 분신 쪽으로',
        },
      },
    },
    {
      id: 'Asura Bladewise',
      type: 'StartsUsing',
      netRegex: { id: '8C85', source: 'Asura', capture: false },
      alertText: (data, _matches, output) => {
        data.storedIconMech = 'sides';
        if (data.iconicExecutionCount < 3)
          return output.noJump!();
        return output.withJump!();
      },
      outputStrings: {
        noJump: {
          en: 'Avoid Cleave => Sides of Image',
          de: 'Cleave ausweichen => Seitlich der Inkarnation',
          fr: 'Évitez le cleave => Côtés de l\'incarnation',
          cn: '躲避直线AoE => 去场边分身两侧',
          ko: '직선 장판 피하기 => 분신 옆으로',
        },
        withJump: {
          en: 'Avoid Cleave => Sides of Image After Jump',
          de: 'Cleave ausweichen => Seitlich der Inkarnation nach dem Sprung',
          fr: 'Évitez le cleave => Côtés de l\'incarnation après le saut',
          cn: '躲避直线AoE => 去场边跳跃后的分身两侧',
          ko: '직선 장판 피하기 => 이동 이후 분신 옆으로',
        },
      },
    },
    {
      id: 'Asura Iconic Execution Tracker',
      type: 'Ability',
      netRegex: { id: '8CB1', source: 'Asura', capture: false },
      run: (data) => data.iconicExecutionCount++,
    },
    {
      id: 'Asura Image Combatant ID Collect',
      type: 'Ability',
      // Divine Awakening
      netRegex: { id: '8C80', source: 'Asura Image', capture: true },
      run: (data, matches) => data.asuraImageId = matches.sourceId,
    },
    {
      id: 'Asura Iconic Execution No Jump',
      type: 'Ability',
      netRegex: { id: Object.keys(bossIconographyIds), source: 'Asura', capture: false },
      condition: (data) => data.iconicExecutionCount < 3,
      delaySeconds: 2, // short delay to let boss action finish and align better with image action
      alertText: (data, _matches, output) => {
        const iconType = data.storedIconMech;
        if (iconType === undefined)
          return;

        const spotOutput = output[iconType]!();

        // For the No-Jump mechanics, the Image is always north.
        let dirsOutput: string;
        if (iconType === 'in')
          dirsOutput = output['dirN']!();
        else if (iconType === 'out')
          dirsOutput = output[outSafeSpots['dirN']]!();
        else { // sides
          const [dir1, dir2] = sidesSafeSpots['dirN'];
          const dir1Output = output[dir1 ?? 'unknown']!();
          const dir2Output = output[dir2 ?? 'unknown']!();
          dirsOutput = output.doubledirs!({ dir1: dir1Output, dir2: dir2Output });
        }

        return output.text!({ dirs: dirsOutput, spot: spotOutput });
      },
      run: (data) => delete data.storedIconMech,
      outputStrings: {
        text: {
          en: 'Go ${dirs} ${spot}',
          de: 'Geh ${dirs} ${spot}',
          fr: 'Allez ${dirs} ${spot}',
          cn: '去 ${dirs} ${spot}',
          ko: '${dirs} ${spot}',
        },
        doubledirs: {
          en: '${dir1} / ${dir2}',
          de: '${dir1} / ${dir2}',
          fr: '${dir1} / ${dir2}',
          cn: '${dir1} / ${dir2}',
          ko: '${dir1} / ${dir2}',
        },
        in: {
          en: '(under image)',
          de: '(Unter die Inkarnation)',
          fr: '(Sous l\'incarnation)',
          cn: '(靠近分身)',
          ko: '(분신 밑)',
        },
        out: {
          en: '(away from image)',
          de: '(Weg von der Inkarnation)',
          fr: '(Loin de l\'incarnation',
          cn: '(远离分身)',
          ko: '(분신과 멀리 떨어지기)',
        },
        sides: {
          en: '(sides of image)',
          de: '(Setlich der Inkarnation)',
          fr: '(Côtés de l\'incarnation',
          cn: '(分身两侧)',
          ko: '(분신 옆)',
        },
        ...Directions.outputStringsCardinalDir,
      },
    },
    {
      id: 'Asura Iconic Execution With Jump',
      type: 'ActorSetPos',
      // The Asura Image doesn't have associated ActorSetPos lines except for this mechanic.
      // Can't meaningfully filter regex as nearly all 271 lines are NPCs; but it's <100 in total.
      netRegex: {},
      condition: (data, matches) =>
        data.iconicExecutionCount >= 3 &&
        data.asuraImageId === matches.id &&
        data.storedIconMech !== undefined,
      alertText: (data, matches, output) => {
        const imageLoc = Directions.xyToCardinalDirOutput(
          parseFloat(matches.x),
          parseFloat(matches.y),
          centerX,
          centerY,
        );
        const iconType = data.storedIconMech;
        if (iconType === undefined)
          return;

        const spotOutput = output[iconType]!();

        let dirsOutput: string;

        if (iconType === 'in')
          dirsOutput = output[imageLoc]!();
        else if (iconType === 'out')
          dirsOutput = output[outSafeSpots[imageLoc]]!();
        else { // sides
          const [dir1, dir2] = sidesSafeSpots[imageLoc];
          const dir1Output = output[dir1 ?? 'unknown']!();
          const dir2Output = output[dir2 ?? 'unknown']!();
          dirsOutput = output.doubledirs!({ dir1: dir1Output, dir2: dir2Output });
        }

        return output.text!({ dirs: dirsOutput, spot: spotOutput });
      },
      run: (data) => delete data.storedIconMech,
      outputStrings: {
        text: {
          en: 'Go ${dirs} ${spot}',
          de: 'Geh ${dirs} ${spot}',
          fr: 'Allez ${dirs} ${spot}',
          cn: '去 ${dirs} ${spot}',
          ko: '${dirs} ${spot}',
        },
        doubledirs: {
          en: '${dir1} / ${dir2}',
          de: '${dir1} / ${dir2}',
          fr: '${dir1} / ${dir2}',
          cn: '${dir1} / ${dir2}',
          ko: '${dir1} / ${dir2}',
        },
        in: {
          en: '(under image)',
          de: '(Unter die Inkarnation)',
          fr: '(Sous l\'incarnation)',
          cn: '(靠近分身)',
          ko: '(분신 밑)',
        },
        out: {
          en: '(away from image)',
          de: '(Weg von der Inkarnation)',
          fr: '(Loin de l\'incarnation)',
          cn: '(远离分身)',
          ko: '(분신과 멀리 떨어지기)',
        },
        sides: {
          en: '(sides of image)',
          de: '(Setlich der Inkarnation)',
          fr: '(Côtés de l\'incarnation)',
          cn: '(分身两侧)',
          ko: '(분신 옆)',
        },
        ...Directions.outputStringsCardinalDir,
      },
    },
    // 8C90 - Red E, Blue W
    // 8C92 - Red N, Blue S
    {
      id: 'Asura Face of Wrath',
      type: 'StartsUsing',
      netRegex: { id: ['8C90', '8C92'], source: 'Asura', capture: false },
      alertText: (_data, _matches, output) => output.wrath!(),
      outputStrings: {
        'wrath': {
          en: 'Stand in blue half',
          de: 'Steh in der blauen Hälfte',
          fr: 'Restez dans la moitié bleue',
          cn: '站蓝色半场',
          ko: '파란색 위로',
        },
      },
    },
    // 8C93 - Red N, Blue S
    // 8C95 - Blue N, Red S
    {
      id: 'Asura Face of Delight',
      type: 'StartsUsing',
      netRegex: { id: ['8C93', '8C95'], source: 'Asura', capture: false },
      alertText: (_data, _matches, output) => output.delight!(),
      outputStrings: {
        'delight': {
          en: 'Stand in red half',
          de: 'Steh in der roten Hälfte',
          fr: 'Restez dans la moitié rouge',
          cn: '站红色半场',
          ko: '빨간색 위로',
        },
      },
    },
    // Khadga has two fixed patterns of attacks.
    // The first cast always cleaves N>W>E>N>W>E; the second cast always cleaves N>E>W>N>E>W.
    // There are later casts as the encounter begins to loop (3rd happens around 9:08), but
    // we have insufficient info to know which patterns future casts will use (fixed or random).
    // We can determine which pattern it is, though, by looking at the xPos of the combatant
    // who receives the 2nd limit cut headmarker (either east or west).
    // Cleaves happen fast, and character positions snapshot very early, so rather than call
    // movements based on delays that depend on precise reaction time, provide a single popup
    // with the entire movement sequence that remains for the duration of the mechanic.
    {
      id: 'Asura Six-bladed Khadga LC2 Collect',
      type: 'HeadMarker',
      netRegex: { id: '01C7', capture: true },
      // no delay needed - combatatnt is repositioned ~3s before headmarker comes out
      promise: async (data, matches) => {
        const combatantData = await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.targetId, 16)],
        });
        data.khadgaLC2Combatant = combatantData.combatants[0];
      },
      run: (data) => {
        if (data.khadgaLC2Combatant === undefined)
          return;
        const lc2SideDir = Directions.combatantStatePosTo8DirOutput(
          data.khadgaLC2Combatant,
          centerX,
          centerY,
        );
        if (lc2SideDir === 'dirW')
          data.khadgaLC2Loc = 'west';
        else if (lc2SideDir === 'dirE')
          data.khadgaLC2Loc = 'east';
        else
          console.log('Could not determine Khadga sequence.');
        return;
      },
    },
    {
      id: 'Asura Six-bladed Khadga',
      type: 'StartsUsing',
      netRegex: { id: '8C88', source: 'Asura', capture: false },
      delaySeconds: 4.5, // allow for LC2 headmarker data to be collected (~3.5s + safety margin)
      durationSeconds: 19.5,
      alertText: (data, _matches, output) => {
        if (data.khadgaLC2Loc === 'west')
          return output.text!({
            dir1: output.dirSE!(),
            dir2: output.dirSW!(),
            dir3: output.dirE!(),
            dir4: output.dirW!(),
          });
        else if (data.khadgaLC2Loc === 'east')
          return output.text!({
            dir1: output.dirSW!(),
            dir2: output.dirSE!(),
            dir3: output.dirW!(),
            dir4: output.dirE!(),
          });
        return;
      },
      run: (data) => {
        delete data.khadgaLC2Combatant;
        delete data.khadgaLC2Loc;
      },
      outputStrings: {
        text: {
          en: '${dir1} (x2) => ${dir2} (x2) => ${dir3} => ${dir4}',
          de: '${dir1} (x2) => ${dir2} (x2) => ${dir3} => ${dir4}',
          fr: '${dir1} (x2) => ${dir2} (x2) => ${dir3} => ${dir4}',
          cn: '${dir1} (x2) => ${dir2} (x2) => ${dir3} => ${dir4}',
          ko: '${dir1} (x2) => ${dir2} (x2) => ${dir3} => ${dir4}',
        },
        dirSE: Outputs.dirSE,
        dirSW: Outputs.dirSW,
        dirE: Outputs.dirE,
        dirW: Outputs.dirW,
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Pedestal Purge/Wheel Of Deincarnation/Bladewise': 'Purge/Wheel/Bladewise',
      },
    },
    {
      'locale': 'de',
      'replaceSync': {
        '(?<! )Asura(?! )': 'Asura',
        'Asura Image': 'Asuras Inkarnation',
        'Phantom Asura': 'Asura-Abbild',
      },
      'replaceText': {
        '\\(execute\\)': '(Ausführen)',
        '\\(preview\\)': '(Vorschau)',
        '\\(release\\)': '(Freilassen)',
        '\\(store\\)': '(Speichern)',
        'Asuri Chakra': 'Rad der Lehre',
        'Bladescatter': 'Klingenlicht',
        '(?<! )Bladewise': 'Klingenspitze',
        'Cutting Jewel': 'Schneidendes Juwel',
        'Divine Awakening': 'Göttliches Erwachen',
        'Divinity': 'Göttlichkeit',
        'Ephemerality': 'Vergänglichkeit',
        'Iconic Execution': 'Göttliche Klingen',
        'Iconography: Bladewise': 'Ikonografie: Klingenspitze',
        'Iconography: Pedestal Purge': 'Ikonografie: Sockelschnitt',
        'Iconography: Wheel Of Deincarnation': 'Ikonografie: Rad der Deinkarnation',
        '(?<! )Khadga': 'Khadga',
        'Laceration': 'Zerreißen',
        'Lower Realm': 'Irdene Ebene',
        'Many Faces': 'Vielgesichtig',
        'Myriad Aspects': 'Blendender Schein',
        'Ordered Chaos': 'Licht der Ordnung',
        '(?<! )Pedestal Purge': 'Sockelschnitt',
        'Six-bladed Khadga': 'Sechsklingen-Khadga',
        'The Face Of Delight': 'Antlitz des Vergnügens',
        'The Face Of Wrath': 'Antlitz des Zorns',
        '(?<! )Wheel Of Deincarnation': 'Rad der Deinkarnation',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        '(?<! )Asura(?! )': 'Asura',
        'Asura Image': 'incarnation d\'Asura',
        'Phantom Asura': 'illusion d\'Asura',
      },
      'replaceText': {
        '\\(execute\\)': '(Execute)',
        '\\(preview\\)': '(Aperçu)',
        '\\(release\\)': '(Libération)',
        '\\(store\\)': '(Sauvegarde)',
        'Asuri Chakra': 'Cercle rituel',
        'Bladescatter': 'Illumination chaotique',
        '(?<! )Bladewise': 'Entaille rayonnante',
        'Cutting Jewel': 'Illumination guerrière',
        'Divine Awakening': 'Éveil d\'incarnation',
        'Divinity': 'Incarnation',
        'Ephemerality': 'Transmigration',
        'Iconic Execution': 'Danselame incarnée',
        'Iconography: Bladewise': 'Danselame rayonnante',
        'Iconography: Pedestal Purge': 'Danselame tournoyante',
        'Iconography: Wheel Of Deincarnation': 'Danselame circulaire',
        '(?<! )Khadga': 'Éventaille',
        'Laceration': 'Lacération',
        'Lower Realm': 'Prestige de la Reine',
        'Many Faces': 'Samsâra',
        'Myriad Aspects': 'Illumination fulgurante',
        'Ordered Chaos': 'Nirvâna',
        '(?<! )Pedestal Purge': 'Entaille tournoyante',
        'Six-bladed Khadga': 'Sextuor de lames',
        'The Face Of Delight': 'Jubilation incarnée',
        'The Face Of Wrath': 'Fureur incarnée',
        '(?<! )Wheel Of Deincarnation': 'Entaille circulaire',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        '(?<! )Asura(?! )': 'アスラ',
        'Asura Image': 'アスラの化身',
        'Phantom Asura': 'アスラの幻影',
      },
      'replaceText': {
        'Asuri Chakra': '転法輪',
        'Bladescatter': '乱れ光波',
        '(?<! )Bladewise': '剣光波',
        'Cutting Jewel': '光玉',
        'Divine Awakening': '化身開眼',
        'Divinity': '化身',
        'Ephemerality': '神出鬼没',
        'Iconic Execution': '化身剣技',
        'Iconography: Bladewise': '剣技転写・剣光波',
        'Iconography: Pedestal Purge': '剣技転写・旋回斬り',
        'Iconography: Wheel Of Deincarnation': '剣技転写・輪転斬り',
        '(?<! )Khadga': '断撃',
        'Laceration': '斬撃',
        'Lower Realm': '王妃の威光',
        'Many Faces': '神気変容',
        'Myriad Aspects': '光芒一閃',
        'Ordered Chaos': '天光',
        '(?<! )Pedestal Purge': '旋回斬り',
        'Six-bladed Khadga': '三面六臂：断',
        'The Face Of Delight': '愉悦の神気',
        'The Face Of Wrath': '憤怒の神気',
        '(?<! )Wheel Of Deincarnation': '輪転斬り',
      },
    },
  ],
};

export default triggerSet;
