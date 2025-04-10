import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

type Phase = 'one' | 'adds' | 'rage';

export interface Data extends RaidbossData {
  phase: Phase;
  // Phase 1
  reignDir?: number;
  decayAddCount: number;
  stoneWindCallGroup?: number;
  stoneWindDebuff?: 'stone' | 'wind';
  stoneWindTracker?: number;
  shadowchase?: number;
  // Phase 2
}

const centerX = 100;
const centerY = 100;
const eminentReign1 = 'A911'; // N=>S, SW=>NE, SE=>NW
const eminentReign2 = 'A912'; // S=>N, NW=>SE, NE=>SW
const revolutionaryReign1 = 'A913'; // N=>S, SW=>NE, SE=>NW
const revolutionaryReign2 = 'A914'; // S=>N, NW=>SE, NE=>SW

const phaseMap: { [id: string]: Phase } = {
  'A3C8': 'adds', // Tactical Pack
  'A3BE': 'rage', // Terrestrial Rage
};

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
            data.reignDir = (Directions.hdgTo8DirNum(actor.Heading) + 4) % 8;
            break;
          case revolutionaryReign1:
          case revolutionaryReign2:
            data.reignDir = Directions.hdgTo8DirNum(actor.Heading);
            break;
        }
      },
      infoText: (data, matches, output) => {
        const dir = output[Directions.outputFrom8DirNum(data.reignDir ?? -1)]!();
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
        ...Directions.outputStrings8Dir,
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
      id: 'R8S Tactical Pack Debuffs',
      // Durations could be 21s, 37s, or 54s
      type: 'GainsEffect',
      netRegex: { effectId: ['1127', '1128'], capture: true },
      condition: (data, matches) => {
        return data.me === matches.target && data.phase === 'adds';
      },
      delaySeconds: 9.7, // Duration until after first tether
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

        if (data.stoneWindCallGroup === 1) {
          return {
            alarmText: output.stoneWindNum!({
              debuff: output[data.stoneWindDebuff]!(),
              num: data.stoneWindCallGroup,
            }),
          };
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
      id: 'R8S Tactical Pack Reminders',
      // Alarms for the other groups by tracking the magic vuln from cleanse
      // Tether could come out same time, so realistically this should track tether?
      type: 'GainsEffect',
      netRegex: { effectId: 'B7D', capture: true },
      condition: (data, matches) => data.phase === 'adds' && parseFloat(matches.duration) > 3,
      preRun: (data) => data.stoneWindTracker = (data.stoneWindTracker ?? 0) + 1,
      delaySeconds: (_data, matches) => parseFloat(matches.duration),
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        if (
          data.stoneWindCallGroup === 2 && data.stoneWindTracker === 2 ||
          data.stoneWindCallGroup === 3 && data.stoneWindTracker === 3
        )
          return output.stoneWindNum!({
            debuff: output[data.stoneWindDebuff ?? 'unknown']!(),
            num: data.stoneWindCallGroup,
          });
      },
      run: (data) => {
        // Clear once 6 debuffs have been cleansed
        if (data.stoneWindTracker === 8) {
          data.stoneWindTracker = 0;
          data.stoneWindCallGroup = 0;
        }
      },
      outputStrings: stoneWindOutputStrings,
    },
    {
      id: 'R8S Shadowchase',
      // Only need one of the 5 actors to determine pattern
      // Ids are sequential, starting 2 less than the boss
      // Two patterns (in order of IDs):
      // S, WSW, NW, NE, ESE
      // N, ENE, SE, SW, WNW
      // TODO: Split the call for if have stack/spread
      type: 'StartsUsing',
      netRegex: { id: 'A3BC', source: 'Howling Blade', capture: true },
      delaySeconds: (_data, matches) =>  parseFloat(matches.castTime),
      promise: async (data, matches) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16) - 2],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `R8S Shadowchase Direction: Wrong actor count ${actors.length}`,
          );
          return;
        }

        data.shadowchase = Directions.xyTo16DirNum(actor.PosX, actor.PosY, centerX, centerY);
      },
      infoText: (data, matches, output) => {
        if (data.shadowchase === 0)
          return output.orientN!();
        if (data.shadowchase === 8)
          return output.orientNE!();
      },
      run: (data) => {
        data.shadowchase = undefined;
      },
      outputStrings: {
        orientN: {
          en: 'Orient N, Behind Clone',
        },
        orientNE: {
          en: 'Orient NE, Behind Clone',
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
  ],
};

export default triggerSet;
