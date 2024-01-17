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
}

type Iconography = 'out' | 'in' | 'sides';

const imageIconographyIds: { [id: string]: Iconography } = {
  '8C82': 'out', // Pedestal Purge
  '8C84': 'in', // Wheel of Deincarnation
  '8C86': 'sides', // Bladewise
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
        },
      },
    },
    {
      id: 'Asura Pedestal Purge',
      type: 'StartsUsing',
      netRegex: { id: '8C81', source: 'Asura', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'Asura Wheel of Deincarnation',
      type: 'StartsUsing',
      netRegex: { id: '8C83', source: 'Asura', capture: false },
      response: Responses.getIn(),
    },
    // TODO: Possibly fire the Iconic Execution alert sooner using the tether
    // or 8CB2 (Iconic Execution image jump to new cardinal). But it's not much of a gain,
    // especially for the jumps.
    {
      id: 'Asura Iconic Execution',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(imageIconographyIds), source: 'Asura Image', capture: true },
      alertText: (_data, matches, output) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const imageLoc = Directions.xyToCardinalDirOutput(x, y, centerX, centerY);
        const iconType = imageIconographyIds[matches.id];

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
      outputStrings: {
        text: {
          en: 'Go ${dirs} ${spot}',
        },
        doubledirs: {
          en: '${dir1} / ${dir2}',
        },
        in: {
          en: '(under image)',
        },
        out: {
          en: '(away from image)',
        },
        sides: {
          en: '(sides of image)',
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
        },
        dirSE: Outputs.dirSE,
        dirSW: Outputs.dirSW,
        dirE: Outputs.dirE,
        dirW: Outputs.dirW,
      },
    },
  ],
};

export default triggerSet;
