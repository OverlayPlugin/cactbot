import outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutputCardinal, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  seenFirstKhadga: boolean;
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
  initData: () => {
    return {
      seenFirstKhadga: false,
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
      response: Responses.tankBuster(),
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
    {
      id: 'Asura Face of Wrath',
      type: 'StartsUsing',
      netRegex: { id: '8C90', source: 'Asura', capture: false },
      alertText: (_data, _matches, output) => output.wrath!(),
      outputStrings: {
        'wrath': {
          en: 'Stand in blue half',
        },
      },
    },
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
    // Khadga has two fixed patterns of attacks that are used in the same order in every instance.
    // The first cast always cleaves N>W>E>N>W>E; the second cast always cleaves N>E>W>N>E>W.
    // Cleaves happen fast, and character positions  snapshot very early, so rather than call
    // movements based on delays that depend on precise reaction time, provide a single popup
    // with the entire movement sequence that remains for the duration of the mechanic.
    {
      id: 'Asura Six-bladed Khadga',
      type: 'StartsUsing',
      netRegex: { id: '8C88', source: 'Asura', capture: false },
      durationSeconds: 24,
      alertText: (data, _matches, output) => {
        if (!data.seenFirstKhadga)
          return output.text!({
            dir1: output.dirSE!(),
            dir2: output.dirSW!(),
            dir3: output.dirE!(),
            dir4: output.dirW!(),
          });
        return output.text!({
          dir1: output.dirSW!(),
          dir2: output.dirSE!(),
          dir3: output.dirW!(),
          dir4: output.dirE!(),
        });
      },
      run: (data) => data.seenFirstKhadga = true,
      outputStrings: {
        text: {
          en: '${dir1} (x2) => ${dir2} (x2) => ${dir3} => ${dir4}',
        },
        dirSE: outputs.dirSE,
        dirSW: outputs.dirSW,
        dirE: outputs.dirE,
        dirW: outputs.dirW,
      },
    },
  ],
};

export default triggerSet;
