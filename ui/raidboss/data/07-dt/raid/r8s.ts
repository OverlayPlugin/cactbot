import Conditions from '../../../../../resources/conditions';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

type Phase = 'one' | 'adds' | 'rage' | 'moonlight';

export interface Data extends RaidbossData {
  phase: Phase;
  // Phase 1
  reignDir?: number;
  decayAddCount: number;
  stoneWindCallGroup?: number;
  surgeTracker: number;
  packPredationTracker: number;
  packPredationTargets: string[];
  stoneWindDebuff?: 'stone' | 'wind';
  isFirstRage: boolean;
  hasSpread?: boolean;
  stackOnPlayer?: string;
  moonbeamBites: number[];
  // Phase 2
}

const centerX = 100;
const centerY = 100;
const eminentReign1 = 'A911'; // N=>S, WSW=>ENE, ESE=>WNW
const eminentReign2 = 'A912'; // S=>N, WNW=>ESE, ENE=>WSW
const revolutionaryReign1 = 'A913'; // N=>S, WSW=>ENE, ESE=>WNW
const revolutionaryReign2 = 'A914'; // S=>N, WNW=>ESE, ENE=>WSW

const phaseMap: { [id: string]: Phase } = {
  'A3C8': 'adds', // Tactical Pack
  'A3CB': 'rage', // Ravenous Saber
  'A3C1': 'moonlight', // Beckon Moonlight
};

const headMarkerData = {
  // Shared tankbuster marker
  'tankbuster': '0256',
  // Adds red headmarker showing you will be targeted by Predation
  'predation': '0017',
  // Stony tether from Wolf of Stone
  'stoneTether': '014F',
  // Windy Tether from Wolf of Wind
  'windTether': '0150',
  // Big, pulsing, 4-arrow stack marker
  'eightHitStack': '013C',
  // Spread marker used in Terrestial Rage and Beckon Moonlight
  'spread': '008B',
  // Stack marker used in Terrestial Rage and Beckon Moonlight
  'stack': '005D',
} as const;

const stoneWindOutputStrings = {
  stoneWindNum: {
    en: '${debuff} ${num}',
  },
  stone: {
    en: 'Stone',
  },
  wind: {
    en: 'Wind',
  },
  unknown: Outputs.unknown,
};

const triggerSet: TriggerSet<Data> = {
  id: 'AacCruiserweightM4Savage',
  zoneId: ZoneId.AacCruiserweightM4Savage,
  timelineFile: 'r8s.txt',
  initData: () => ({
    phase: 'one',
    decayAddCount: 0,
    packPredationTracker: 0,
    packPredationTargets: [],
    surgeTracker: 0,
    isFirstRage: true,
    moonbeamBites: [],
  }),
  triggers: [
    {
      id: 'R8S Phase Tracker',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(phaseMap), source: 'Howling Blade' },
      suppressSeconds: 1,
      run: (data, matches) => {
        const phase = phaseMap[matches.id];
        if (phase === undefined)
          throw new UnreachableCode();

        data.phase = phase;
        data.isFirstRage = true;
      },
    },
    {
      id: 'R8S Extraplanar Pursuit',
      type: 'StartsUsing',
      netRegex: { id: 'A3DA', source: 'Howling Blade', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R8S Windfang/Stonefang',
      type: 'StartsUsing',
      netRegex: { id: ['A39E', 'A39D', 'A3A1', 'A3A2'], source: 'Howling Blade', capture: true },
      infoText: (_data, matches, output) => {
        const windfangCards = 'A39D';
        const windfangInter = 'A39E';
        const stonefangCards = 'A3A1';
        const stonefangInter = 'A3A2';
        // A39F is cast for both A39D (card windfang) and A39E (intercard windfang)
        // A3B0 is cast for both A3A1 (card stonefang) and A3A2 (intercard stonefang)
        switch (matches.id) {
          case windfangCards:
            return output.inInterCardsPartners!();
          case windfangInter:
            return output.inCardsPartners!();
          case stonefangCards:
            return output.outInterCardsProtean!();
          case stonefangInter:
            return output.outCardsProtean!();
        }
      },
      outputStrings: {
        inCardsPartners: {
          en: 'In + Cards + Partners',
        },
        inInterCardsPartners: {
          en: 'In + Intercards + Partners',
        },
        outCardsProtean: {
          en: 'Out + Cards + Protean',
        },
        outInterCardsProtean: {
          en: 'Out + InterCards + Protean',
        },
      },
    },
    {
      id: 'R8S Eminent/Revolutionary Reign',
      type: 'StartsUsing',
      netRegex: { id: ['A911', 'A912', 'A913', 'A914'], source: 'Howling Blade', capture: true },
      infoText: (_data, matches, output) => {
        switch (matches.id) {
          case eminentReign1:
          case eminentReign2:
            return output.inLater!();
          case revolutionaryReign1:
          case revolutionaryReign2:
            return output.outLater!();
        }
      },
      outputStrings: {
        inLater: {
          en: '(In Later)',
        },
        outLater: {
          en: '(Out Later)',
        },
      },
    },
    {
      id: 'R8S Eminent/Revolutionary Reign Direction',
      type: 'StartsUsing',
      netRegex: { id: ['A911', 'A912', 'A913', 'A914'], source: 'Howling Blade', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) + 1.2,
      promise: async (data, matches) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `R8S Eminent/Revolutionary Reign Direction: Wrong actor count ${actors.length}`,
          );
          return;
        }

        switch (matches.id) {
          case eminentReign1:
          case eminentReign2:
            data.reignDir = (Directions.hdgTo16DirNum(actor.Heading) + 8) % 16;
            break;
          case revolutionaryReign1:
          case revolutionaryReign2:
            data.reignDir = Directions.hdgTo16DirNum(actor.Heading);
            break;
        }
      },
      infoText: (data, matches, output) => {
        const dir = output[Directions.output16Dir[data.reignDir ?? -1] ?? 'unknown']!();
        switch (matches.id) {
          case eminentReign1:
          case eminentReign2:
            return output.inDir!({ dir: dir });
          case revolutionaryReign1:
          case revolutionaryReign2:
            return output.outDir!({ dir: dir });
        }
      },
      run: (data) => {
        data.reignDir = undefined;
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
        inDir: {
          en: 'In ${dir}',
        },
        outDir: {
          en: 'Out ${dir}',
        },
      },
    },
    {
      id: 'R8S Millenial Decay',
      type: 'StartsUsing',
      netRegex: { id: 'A3B2', source: 'Howling Blade', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R8S Aero III',
      type: 'StartsUsing',
      netRegex: { id: 'A3B7', source: 'Howling Blade', capture: false },
      response: Responses.knockback(),
    },
    {
      id: 'R8S Titanic Pursuit',
      type: 'StartsUsing',
      netRegex: { id: 'A3C7', source: 'Howling Blade', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R8S Tracking Tremors',
      type: 'StartsUsing',
      netRegex: { id: 'A3B9', source: 'Howling Blade', capture: false },
      durationSeconds: 9,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Stack x8',
          de: 'Sammeln x8',
          fr: 'Package x8',
          ja: '頭割り x8',
          cn: '8次分摊',
          ko: '쉐어 8번',
        },
      },
    },
    {
      id: 'R8S Breath of Decay Rotation',
      type: 'StartsUsing',
      netRegex: { id: 'A3B4', source: 'Wolf of Wind', capture: true },
      durationSeconds: 6,
      infoText: (data, matches, output) => {
        // 1st add always spawns N or S, and 2nd add always spawns intercardinal
        // we only need the position of the 2nd add to determine rotation
        data.decayAddCount++;
        if (data.decayAddCount !== 2)
          return;

        const addX = parseFloat(matches.x);
        const addY = parseFloat(matches.y);
        const addDir = Directions.xyTo8DirNum(addX, addY, centerX, centerY);
        if (addDir === 1 || addDir === 5)
          return output.clockwise!();
        else if (addDir === 3 || addDir === 7)
          return output.counterclockwise!();
      },
      outputStrings: {
        clockwise: {
          en: '<== Clockwise',
        },
        counterclockwise: {
          en: 'Counterclockwise ==>',
        },
      },
    },
    {
      id: 'R8S Tactical Pack Tethers',
      // TODO: Call East/West instead of add?
      type: 'Tether',
      netRegex: { id: [headMarkerData.stoneTether, headMarkerData.windTether], capture: true },
      condition: (data, matches) => data.me === matches.source,
      infoText: (_data, matches, output) => {
        if (matches.id === headMarkerData.stoneTether)
          return output.side!({ wolf: output.wolfOfWind!() });
        return output.side!({ wolf: output.wolfOfStone!() });
      },
      outputStrings: {
        wolfOfWind: {
          en: 'Green',
        },
        wolfOfStone: {
          en: 'Yellow',
        },
        side: {
          en: '${wolf} Side',
        },
      },
    },
    {
      id: 'R8S Tactical Pack Debuffs',
      // Durations could be 21s, 37s, or 54s
      type: 'GainsEffect',
      netRegex: { effectId: ['1127', '1128'], capture: true },
      condition: (data, matches) => {
        return data.me === matches.target && data.phase === 'adds';
      },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = stoneWindOutputStrings;

        // 1127 = Stone (Yellow Cube) Debuff
        // 1128 = Wind (Green Sphere) Debuff
        const cubeDebuffId = '1127';
        data.stoneWindDebuff = matches.effectId === cubeDebuffId ? 'stone' : 'wind';

        if (parseFloat(matches.duration) < 22) {
          data.stoneWindCallGroup = 1;
        } else if (parseFloat(matches.duration) < 38) {
          data.stoneWindCallGroup = 2;
        } else {
          data.stoneWindCallGroup = 3;
        }

        return {
          infoText: output.stoneWindNum!({
            debuff: output[data.stoneWindDebuff]!(),
            num: data.stoneWindCallGroup,
          }),
        };
      },
    },
    {
      // headmarkers with casts:
      // A3CF (Pack Predation) from Wolf of Wind
      // A3E4 (Pack Predation) from Wolf of Stone
      // Simultaneously highest aggro gets cleaved:
      // A3CD (Alpha Wind) from Wolf of Wind
      // A3E2 (Alpha Wind) from Wolf of Stone
      id: 'R8S Pack Predation',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.predation },
      infoText: (data, matches, output) => {
        data.packPredationTargets.push(matches.target);
        if (data.packPredationTargets.length < 2)
          return;

        // Increment count for group tracking
        data.packPredationTracker = data.packPredationTracker + 1;

        const name1 = data.party.member(data.packPredationTargets[0]);
        const name2 = data.party.member(data.packPredationTargets[1]);

        return output.predationOnPlayers!({ player1: name1, player2: name2 });
      },
      run: (data) => {
        if (data.packPredationTargets.length >= 2)
          data.packPredationTargets = [];
      },
      outputStrings: {
        predationOnPlayers: {
          en: 'Predation on ${player1} and ${player2}',
        },
      },
    },
    {
      id: 'R8S Tactical Pack First Pop',
      // infoText as we do not know who should pop first
      // These will trigger the following spells on cleanse
      // A3EE (Sand Surge) from Font of Earth Aether
      // A3ED (Wind Surge) from Font of Wind Aether
      type: 'GainsEffect',
      netRegex: { effectId: 'B7D', capture: true },
      condition: (data, matches) => data.phase === 'adds' && parseFloat(matches.duration) < 2,
      // Magic Vulnerabilities from Pack Predation and Alpha Wind are 0.96s
      delaySeconds: (_data, matches) => parseFloat(matches.duration),
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        if (data.stoneWindCallGroup === data.packPredationTracker) {
          return output.stoneWindNum!({
            debuff: output[data.stoneWindDebuff ?? 'unknown']!(),
            num: data.stoneWindCallGroup,
          });
        }
      },
      outputStrings: stoneWindOutputStrings,
    },
    {
      id: 'R8S Tactical Pack Cleanup',
      type: 'LosesEffect',
      netRegex: { effectId: ['1127', '1128'], capture: true },
      condition: Conditions.targetIsYou(),
      run: (data) => data.stoneWindCallGroup = undefined,
    },
    {
      id: 'R8S Tactical Pack Second Pop',
      // Timing based on Tether and Magic Vulnerability (3.96s)
      type: 'GainsEffect',
      netRegex: { effectId: 'B7D', capture: true },
      condition: (data, matches) => {
        return data.phase === 'adds' && parseFloat(matches.duration) > 2;
      },
      preRun: (data) => data.surgeTracker = data.surgeTracker + 1,
      delaySeconds: (_data, matches) => parseFloat(matches.duration),
      suppressSeconds: 1,
      alarmText: (data, _matches, output) => {
        const surge = data.surgeTracker;
        if (data.stoneWindCallGroup === data.packPredationTracker) {
          if (surge === 1 || surge === 3 || surge === 5) {
            return output.stoneWindNum!({
              debuff: output[data.stoneWindDebuff ?? 'unknown']!(),
              num: data.stoneWindCallGroup,
            });
          }
        }
      },
      outputStrings: stoneWindOutputStrings,
    },
    {
      id: 'R8S Spread/Stack Collect',
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.stack, headMarkerData.spread] },
      run: (data, matches) => {
        const id = matches.id;
        const target = matches.target;
        if (headMarkerData.stack === id)
          data.stackOnPlayer = target;
        if (headMarkerData.spread === id && target === data.me)
          data.hasSpread = true;
      },
    },
    {
      id: 'R8S Terrestrial Rage Spread/Stack',
      // For Shadowchase (A3BC), actors available roughly 2.9s after cast
      // Only need one of the 5 actors to determine pattern
      // Ids are sequential, starting 2 less than the boss
      // Two patterns (in order of IDs):
      // S, WSW, NW, NE, ESE
      // N, ENE, SE, SW, WNW
      // TODO: Add orientation call?
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.stack, headMarkerData.spread], capture: false },
      condition: (data) => data.phase === 'rage',
      delaySeconds: 0.1,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        if (data.hasSpread)
          return data.isFirstRage ? output.spreadThenStack!() : output.spreadBehindClones!();

        if (data.stackOnPlayer === data.me)
          return data.isFirstRage
            ? output.stackThenSpread!({
              stack: output.stackOnYou!(),
            })
            : output.stackOnYouBehindClones!();

        if (data.stackOnPlayer !== undefined) {
          const name = data.party.member(data.stackOnPlayer);
          return data.isFirstRage
            ? output.stackThenSpread!({
              stack: output.stackOnPlayer!({ player: name }),
            })
            : output.stackOnPlayerBehindClones!({ player: name });
        }
      },
      run: (data) => {
        data.stackOnPlayer = undefined;
        data.hasSpread = undefined;
        data.isFirstRage = false;
      },
      outputStrings: {
        spreadThenStack: Outputs.spreadThenStack,
        stackThenSpread: {
          en: '${stack} => Spread',
        },
        spreadBehindClones: {
          en: 'Spread (Behind Clones)',
        },
        stackOnPlayer: Outputs.stackOnPlayer,
        stackOnPlayerBehindClones: {
          en: 'Stack on ${player} (Behind Clones)',
        },
        stackOnYou: Outputs.stackOnYou,
        stackOnYouBehindClones: {
          en: 'Stack on YOU (Behind Clones)',
        },
      },
    },
    {
      id: 'R8S Shadowchase Rotate',
      // Call to move behind Dragon Head after clones dash
      type: 'StartsUsing',
      netRegex: { id: 'A3BD', source: 'Howling Blade', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime),
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => {
        return output.rotate!();
      },
      outputStrings: {
        rotate: {
          en: 'Rotate',
        },
      },
    },
    {
      id: 'R8S Weal of Stone',
      // Calls direction that the heads are firing from
      type: 'StartsUsing',
      netRegex: { id: 'A78E', source: 'Wolf of Stone', capture: true },
      suppressSeconds: 1,
      infoText: (_data, matches, output) => {
        const hdg = parseFloat(matches.heading);
        const dirOut = Directions.outputFrom8DirNum((Directions.hdgTo8DirNum(hdg) + 4) % 8);
        return output.linesFromDir!({ dir: output[dirOut]!() });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        linesFromDir: {
          en: 'Lines from ${dir}',
        },
      },
    },
     {
      id: 'R8S Beckon Moonlight Quadrants',
      type: 'Ability',
      // A3E0 => Right cleave self-cast
      // A3E1 => Left cleave self-cast
      netRegex: { id: ['A3E0', 'A3E1'], source: 'Moonlit Shadow', capture: true },
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
            `R8S Beckon Moonlight Quadrants: Wrong actor count ${actors.length}`,
          );
          return;
        }

        const dirNum = Directions.xyTo8DirNum(actor.PosX, actor.PosY, centerX, centerY);
        // Moonbeam's Bite (A3C2 Left / A3C3 Right) half-room cleaves
        // Defining the cleaved side
        if (matches.id === 'A3E0') {
          const counterclock = dirNum === 0 ? 6 : dirNum - 2;
          data.moonbeamBites.push(counterclock);
        }
        if (matches.id === 'A3E1') {
          const clockwise = (dirNum + 2) % 8;
          data.moonbeamBites.push(clockwise);
        }
      },
      infoText: (data, matches, output) => {
        if (data.moonbeamBites.length === 1 || data.moonbeamBites.length === 3)
          return;

        const quadrants = [1, 3, 5, 7];
        // When there are multiple safe spots, output cardinal
        const intersToCard = (dirNum1: number, dirNum2: number) => {
          // Northeast and Northwest
          if (dirNum1 === 1 && dirNum2 === 7 || dirNum2 === 7 && dirNum1 === 1)
            return 0;
          // Northeast and Southeast
          if (dirNum1 === 1 && dirNum2 === 3 || dirNum1 === 3 && dirNum2 === 1)
            return 2;
          // Southeast and Southwest
          if (dirNum1 === 3 && dirNum2 === 5 || dirNum1 === 5 && dirNum2 === 3)
            return 4;
          // Southwest and Northwest
          if (dirNum1 === 5 && dirNum2 === 7 || dirNum1 === 7 && dirNum2 === 5)
            return 6;
        };

        const moonbeam1 = data.moonbeamBites[0] ?? -1;
        const moonbeam2 = data.moonbeamBites[1] ?? -1;
        let safeQuads1 = quadrants.filter((quadrant) => {
          return quadrant !== moonbeam1 + 1;
        });
        safeQuads1 = safeQuads1.filter((quadrant) => {
          return quadrant !== moonbeam1 - 1;
        });
        safeQuads1 = safeQuads1.filter((quadrant) => {
          return quadrant !== moonbeam2 + 1;
        });
        safeQuads1 = safeQuads1.filter((quadrant) => {
          return quadrant !== moonbeam2 - 1;
        });

       // Early output for first two
       if (data.moonbeamBites.length === 2) {
         if (safeQuads1.length === 2) {
           if (safeQuads1[0] === undefined || safeQuads1[1] === undefined) {
            console.error(
              `R8S Beckon Moonlight Quadrants: Early safeQuad missing.`,
            );
            return;
           }
           const dirNum = intersToCard(safeQuads1[0], safeQuads1[1]);
           const half = output[Directions.outputFrom8DirNum(dirNum ?? -1)]!();
           return output.safeHalf!({ half: half });
         }
         if (safeQuads1.length === 1) {
           const quad = output[Directions.outputFrom8DirNum(safeQuads1[0] ?? -1)]!();
           return output.safeQuad!({ quad: quad });
         }
         console.error(
           `R8S Beckon Moonlight Quadrants: Early safeQuad missing.`,
         );
         return;
       }

        const moonbeam3 = data.moonbeamBites[2] ?? -1;
        const moonbeam4 = data.moonbeamBites[3] ?? -1;
        let safeQuads2 = quadrants.filter((quadrant) => {
          return quadrant !== moonbeam3 + 1;
        });
        safeQuads2 = safeQuads2.filter((quadrant) => {
          return quadrant !== moonbeam3 - 1;
        });
        safeQuads2 = safeQuads2.filter((quadrant) => {
          return quadrant !== moonbeam4 + 1;
        });
        safeQuads2 = safeQuads2.filter((quadrant) => {
          return quadrant !== moonbeam4 - 1;
        });

        if (safeQuads1[0] === undefined || safeQuads2[0] === undefined) {
          console.error(
            `R8S Beckon Moonlight Quadrants: First safeQuads missing`,
          );
          return;
        }

        if (safeQuads1.length === 2 && safeQuads2.length === 2) {
          if (safeQuads1[1] === undefined || safeQuads2[1] === undefined) {
            console.error(
              `R8S Beckon Moonlight Quadrants: Second safeQuads missing.`,
            );
            return;
          }
          const dirNum1 = intersToCard(safeQuads1[0], safeQuads1[1]);
          const dirNum2 = intersToCard(safeQuads2[0], safeQuads2[1]);
          const half1 = output[Directions.outputFrom8DirNum(dirNum1 ?? -1)]!();
          const half2 = output[Directions.outputFrom8DirNum(dirNum2 ?? -1)]!();
          return output.safeHalves!({ half1: half1, half2: half2 });
        }
        if (safeQuads1.length === 2) {
          if (safeQuads1[1] === undefined) {
            console.error(
              `R8S Beckon Moonlight Quadrants: First safeQuad missing.`,
            );
            return;
          }
          const dirNum = intersToCard(safeQuads1[0], safeQuads1[1]);
          const half = output[Directions.outputFrom8DirNum(dirNum ?? -1)]!();
          const quad = output[Directions.outputFrom8DirNum(safeQuads2[1] ?? -1)]!();
          return output.safeHalfFirst!({ half: half, quad: quad });
        }
        if (safeQuads2.length === 2) {
          if (safeQuads2[1] === undefined) {
            console.error(
              `R8S Beckon Moonlight Quadrants: Second safeQuad missing.`,
            );
            return;
          }
          const dirNum = intersToCard(safeQuads2[0], safeQuads2[1]);
          const quad = output[Directions.outputFrom8DirNum(safeQuads1[0] ?? -1)]!();
          const half = output[Directions.outputFrom8DirNum(dirNum ?? -1)]!();
          return output.safeHalfSecond!({ quad: quad, half: half });
        }

        const quad1 = output[Directions.outputFrom8DirNum(safeQuads1[0] ?? -1)]!();
        const quad2 = output[Directions.outputFrom8DirNum(safeQuads2[0] ?? -1)]!();
        return output.safeQuadrants!({ quad1: quad1, quad2: quad2 });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        safeQuad: {
          en: '${quad}',
        },
        safeQuadrants: {
          en: '${quad1} => ${quad2}',
        },
        safeHalf: {
          en: '${half}',
        },
        safeHalfFirst: {
          en: '${half} => ${quad}',
        },
        safeHalfSecond: {
          en: '${quad} => ${half}',
        },
        safeHalves: {
          en: '${half1} => ${half2}',
        },
      },
    },
    {
      id: 'R8S Beckon Moonlight Spread/Stack',
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.stack, headMarkerData.spread], capture: false },
      condition: (data) => data.phase === 'moonlight',
      delaySeconds: 0.1,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        if (data.hasSpread)
          return data.isFirstRage ? output.spreadThenStack!() : output.spread!();

        if (data.stackOnPlayer === data.me)
          return data.isFirstRage
            ? output.stackThenSpread!({
              stack: output.stackOnYou!(),
            })
            : output.stackOnYou!();

        if (data.stackOnPlayer !== undefined) {
          const name = data.party.member(data.stackOnPlayer);
          return data.isFirstRage
            ? output.stackThenSpread!({
              stack: output.stackOnPlayer!({ player: name }),
            })
            : output.stackOnPlayer!({ player: name });
        }
      },
      run: (data) => {
        data.stackOnPlayer = undefined;
        data.hasSpread = undefined;
        data.isFirstRage = false;
      },
      outputStrings: {
        spreadThenStack: Outputs.spreadThenStack,
        stackThenSpread: {
          en: '${stack} => Spread',
        },
        spread: Outputs.spread,
        stackOnPlayer: Outputs.stackOnPlayer,
        stackOnYou: Outputs.stackOnYou,
      },
    },
    {
      id: 'R8S Weal of Stone Cardinals',
      // This appears to always be cardinals safe
      type: 'StartsUsing',
      netRegex: { id: 'A792', source: 'Wolf of Stone', capture: false },
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => {
        return output.cardinals!();
      },
      outputStrings: {
        cardinals: Outputs.cardinals,
      },
    },
  ],
};

export default triggerSet;
