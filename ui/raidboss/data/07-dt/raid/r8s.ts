import { Responses } from '../../../../../resources/responses';
import { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  // Phase 1
  decayAddCount: number;
}

const centerX = 100;
const centerY = 100;
const eminentReign1 = 'A911'; // N=>S, SW=>NE, SE=>NW
const eminentReign2 = 'A912'; // S=>N, NW=>SE, NE=>SW
const revolutionaryReign1 = 'A913'; // N=>S, SW=>NE, SE=>NW
const revolutionaryReign2 = 'A914'; // S=>N, NW=>SE, NE=>SW

const triggerSet: TriggerSet<Data> = {
  id: 'AacCruiserweightM4Savage',
  zoneId: ZoneId.AacCruiserweightM4Savage,
  timelineFile: 'r8s.txt',
  initData: () => ({
    decayAddCount: 0,
  }),
  triggers: [
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
      id: 'R8S Titanic Pursuit',
      type: 'StartsUsing',
      netRegex: { id: 'A3C7', source: 'Howling Blade', capture: false },
      response: Responses.aoe(),
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
  ],
};

export default triggerSet;
