import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// Pilgrim's Traverse Stones 71-80
// TODO: Forgiven Profanity Static Shock safe spot

export interface Data extends RaidbossData {
  prowlingDeath?: 'shadowOfDeath' | 'nowhereToRun';
}

const triggerSet: TriggerSet<Data> = {
  id: 'PilgrimsTraverseStones71_80',
  zoneId: ZoneId.PilgrimsTraverseStones71_80,

  triggers: [
    // ---------------- Stone 71-79 Mobs ----------------
    {
      id: 'PT 71-80 Traverse Scissorjaws Sandblast',
      type: 'StartsUsing',
      netRegex: { id: 'AEE1', source: 'Traverse Scissorjaws', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'PT 71-80 Forgiven Unbelief Gravel Shower',
      type: 'StartsUsing',
      netRegex: { id: 'AEDB', source: 'Forgiven Unbelief', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'PT 71-80 Traverse Huldu Fracture',
      type: 'StartsUsing',
      netRegex: { id: 'A712', source: 'Traverse Huldu', capture: false },
      response: Responses.outOfMelee(),
    },
    {
      id: 'PT 71-80 Traverse Huldu Self-destruct',
      // explodes in a letal PBAoE after death
      type: 'StartsUsing',
      netRegex: { id: 'A713', source: 'Traverse Huldu', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'PT 71-80 Forgiven Spite Growing Circles of Ablution',
      type: 'StartsUsing',
      netRegex: { id: 'A652', source: 'Forgiven Spite', capture: false },
      response: Responses.getOutThenIn(),
    },
    {
      id: 'PT 71-80 Forgiven Spite Shrinking Circles of Ablution',
      type: 'StartsUsing',
      netRegex: { id: 'A6FC', source: 'Forgiven Spite', capture: false },
      response: Responses.getInThenOut(),
    },
    {
      id: 'PT 71-80 Forgiven Arrogance Hail of Heels',
      type: 'StartsUsing',
      netRegex: { id: 'AED7', source: 'Forgiven Arrogance', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get Behind x4',
          cn: '去背后4次',
          ko: '뒤로 x4',
        },
      },
    },
    {
      id: 'PT 71-80 Traverse Worm Earthquake',
      type: 'StartsUsing',
      netRegex: { id: 'AEDF', source: 'Traverse Worm', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'PT 71-80 Forgiven Dissention Mighty Spin',
      type: 'StartsUsing',
      netRegex: { id: 'A618', source: 'Forgiven Dissention', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'PT 71-80 Forgiven Dissention Trounce',
      type: 'StartsUsing',
      netRegex: { id: 'A61A', source: 'Forgiven Dissention', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'PT 71-80 Forgiven Corruption Forward Barrage',
      type: 'StartsUsing',
      netRegex: { id: 'A651', source: 'Forgiven Corruption', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'PT 71-80 Forgiven Corruption Rolling Barrage',
      type: 'StartsUsing',
      netRegex: { id: 'A61B', source: 'Forgiven Corruption', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 4,
      alertText: (_data, matches, output) => output.breakLOS!({ name: matches.source }),
      outputStrings: {
        breakLOS: {
          en: 'Break line-of-sight to ${name}',
          de: 'Unterbreche Sichtlinie zu ${name}',
          fr: 'Masquez le champ de vision vers ${name}',
          ja: '${name}の視線から隠れる',
          cn: '利用掩体卡 ${name} 的视线',
          ko: '${name}의 시야 밖으로 숨기',
        },
      },
    },
    {
      id: 'PT 71-80 Traverse Amemet Topple',
      type: 'StartsUsing',
      netRegex: { id: 'AEDD', source: 'Traverse Amemet', capture: false },
      response: Responses.outOfMelee(),
    },
    {
      id: 'PT 71-80 Forgiven Slander Metamorphic Blast',
      type: 'StartsUsing',
      netRegex: { id: 'AED9', source: 'Forgiven Slander', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'PT 71-80 Forgiven Slander Orogenic Storm',
      // medium-sized AoE, locks-on to a player ground position at start of cast
      type: 'StartsUsing',
      netRegex: { id: 'AEDA', source: 'Forgiven Slander', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Avoid AoE',
          cn: '避开AoE',
          ko: '장판 피하기',
        },
      },
    },
    {
      id: 'PT 71-80 Forgiven Vanity Cross Lasers',
      type: 'StartsUsing',
      netRegex: { id: 'AED5', source: 'Forgiven Vanity', capture: false },
      response: Responses.getIntercards(),
    },
    {
      id: 'PT 71-80 Forgiven Vanity Peripheral Lasers',
      type: 'StartsUsing',
      netRegex: { id: 'AED6', source: 'Forgiven Vanity', capture: false },
      response: Responses.getIn(),
    },
    // ---------------- Stone 80 Boss: Forgiven Profanity ----------------
    // A9C9 = Roaring Ring dummy self-cast, donut + front cleave
    // A9CB = Roaring Ring dummy self-cast, donut + back cleave
    // A9CC = Roaring Ring damage cast
    // A9CD = Perilous Lair dummy self-cast, pbaoe + front cleave
    // A9CF = Perilous Lair dummy self-cast, pbaoe + back cleave
    // A9D0 = Perilous Lair damage cast
    // A9D1 = Profane Waul whiskers cleave damage cast
    // A9D3 = Prowling Death applies debuffs
    // A9D4 = Stalking Static dummy self-cast
    // AB13 = Stalking Static small line cleave
    // AC1C = Static Shock final big AoE
    {
      id: 'PT 71-80 Forgiven Profanity Roaring Ring',
      type: 'StartsUsing',
      netRegex: { id: ['A9C9', 'A9CB'], source: 'Forgiven Profanity', capture: true },
      alertText: (data, matches, output) => {
        const id = matches.id;
        let backFront;
        if (data.prowlingDeath === 'shadowOfDeath')
          backFront = id === 'A9C9' ? output.front!() : output.back!();
        else
          backFront = id === 'A9C9' ? output.back!() : output.front!();
        return output.text!({ in: output.in!(), backFront: backFront });
      },
      run: (data) => {
        delete data.prowlingDeath;
      },
      outputStrings: {
        text: {
          en: '${in} + ${backFront}',
          cn: '${in} + ${backFront}',
          ko: '${in} + ${backFront}',
        },
        back: Outputs.back,
        front: Outputs.front,
        in: Outputs.in,
      },
    },
    {
      id: 'PT 71-80 Forgiven Profanity Perilous Lair',
      type: 'StartsUsing',
      netRegex: { id: ['A9CD', 'A9CF'], source: 'Forgiven Profanity', capture: true },
      alertText: (data, matches, output) => {
        const id = matches.id;
        let backFront;
        if (data.prowlingDeath === 'shadowOfDeath')
          backFront = id === 'A9CD' ? output.front!() : output.back!();
        else
          backFront = id === 'A9CD' ? output.back!() : output.front!();
        return output.text!({ out: output.out!(), backFront: backFront });
      },
      run: (data) => {
        delete data.prowlingDeath;
      },
      outputStrings: {
        text: {
          en: '${out} + ${backFront}',
          cn: '${out} + ${backFront}',
          ko: '${out} + ${backFront}',
        },
        back: Outputs.back,
        front: Outputs.front,
        out: Outputs.out,
      },
    },
    {
      id: 'PT 71-80 Forgiven Profanity Stalking Static',
      type: 'StartsUsing',
      netRegex: { id: 'A9D4', source: 'Forgiven Profanity', capture: false },
      durationSeconds: 12,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Avoid final AoE',
          cn: '躲避终点AoE',
          ko: '마지막 장판 피하기',
        },
      },
    },
    {
      id: 'PT 71-80 Forgiven Profanity Prowling Death',
      type: 'StartsUsing',
      netRegex: { id: 'A9D3', source: 'Forgiven Profanity', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'PT 71-80 Forgiven Profanity Prowling Death Collect',
      // 11A6 = Shadow of Death, lethal on expiration, cleanse by being hit by whiskers cleave
      // en: All who deny Light are condemned to death...
      // 11A7 = Nowhere to Run, gain stacks on movement, lethal at 8 stacks
      // en: Death approaches all who dare tread forth...
      type: 'GainsEffect',
      netRegex: { effectId: ['11A6', '11A7'], capture: true },
      condition: Conditions.targetIsYou(),
      run: (data, matches) => {
        data.prowlingDeath = matches.effectId === '11A6' ? 'shadowOfDeath' : 'nowhereToRun';
      },
    },
  ],
};

export default triggerSet;
