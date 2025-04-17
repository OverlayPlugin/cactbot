import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import Util from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { Job } from '../../../../../types/job';
import { TriggerSet } from '../../../../../types/trigger';

// @TODO:
// - Sinister Seeds - call who has puddles
// - Roots of Evil - dodge call?
// - adds interrupt calls?
// - Demolition Deathmatch - strat-specific tether callouts

const headMarkerData = {
  // Sinster Seeds marker
  'sinisterSeed': '0177',
  // Strange Seeds marker
  'strangeSeed': '01D2',
  // Pulp Smash stack marker
  'pulpSmashMarker': '00A1',
  // Abominable Blink flare marker
  'flareMarker': '0147',
  // Killer Seed pair stack marker
  'killerSeedMarker': '005D',
} as const;

const isHealerOrRanged = (x: Job) =>
  Util.isHealerJob(x) || Util.isRangedDpsJob(x) || Util.isCasterDpsJob(x);

export interface Data extends RaidbossData {
  brutalImpactCount: number;
  storedStoneringer?: 'in' | 'out';
  stoneringer2Followup?: boolean;
}

const triggerSet: TriggerSet<Data> = {
  id: 'AacCruiserweightM3Savage',
  zoneId: ZoneId.AacCruiserweightM3Savage,
  timelineFile: 'r7s.txt',
  initData: () => ({
    brutalImpactCount: 6,
  }),
  triggers: [
    {
      // @TODO: remove later
      id: 'R7S Headmarker Debug',
      type: 'HeadMarker',
      netRegex: { id: '005D', capture: true },
      durationSeconds: 10,
      suppressSeconds: 1,
      infoText: (_data, matches, output) =>
        output.text!({ id: matches.id, target: matches.target }),
      outputStrings: {
        text: {
          en: 'Headmarker ${id} on ${target}',
        },
      },
    },
    {
      id: 'R7S Brutal Impact',
      type: 'StartsUsing',
      netRegex: { id: 'A55B', source: 'Brute Abombinator', capture: false },
      infoText: (data, _matches, output) => output.text!({ count: data.brutalImpactCount }),
      run: (data) => data.brutalImpactCount = Math.min(data.brutalImpactCount + 1, 8),
      outputStrings: {
        text: {
          en: 'AoE x${count}',
        },
      },
    },
    {
      id: 'R7S Stoneringer',
      type: 'StartsUsing',
      netRegex: { id: ['A55D', 'A55E'], source: 'Brute Abombinator', capture: true },
      durationSeconds: (_data, matches) => parseFloat(matches.castTime) + 10,
      infoText: (data, matches, output) => {
        data.storedStoneringer = matches.id === 'A55D' ? 'out' : 'in';
        return output[data.storedStoneringer]!();
      },
      outputStrings: {
        in: Outputs.in,
        out: Outputs.out,
      },
    },
    {
      id: 'R7S Smash Here/There',
      type: 'StartsUsing',
      netRegex: { id: ['A55F', 'A560'], source: 'Brute Abombinator', capture: true },
      durationSeconds: (_data, matches) => parseFloat(matches.castTime) + 2,
      alertText: (data, matches, output) => {
        const stoneringer = output[data.storedStoneringer ?? 'unknown']!();

        if (data.role === 'tank') {
          const inOut = matches.id === 'A55F' ? output.in!() : output.out!();
          return output.sharedBuster!({ stoneringer: stoneringer, inOut: inOut });
        }

        const inOut = matches.id === 'A560' ? output.in!() : output.out!();
        return output.avoidBuster!({ stoneringer: stoneringer, inOut: inOut });
      },
      run: (data) => delete data.storedStoneringer,
      outputStrings: {
        sharedBuster: {
          en: '${stoneringer} => Tanks ${inOut}, Shared tankbuster',
        },
        avoidBuster: {
          en: '${stoneringer} => Party ${inOut}, Avoid tankbuster',
        },
        in: Outputs.in,
        out: Outputs.out,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'R7S Sinister Seeds',
      type: 'StartsUsing',
      netRegex: { id: 'A56E', source: 'Brute Abombinator', capture: true },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Drop seed',
        },
      },
    },
    {
      // Impact is an instant cast, so trigger off of Sinister Seeds dropping
      id: 'R7S Impact',
      type: 'Ability',
      netRegex: { id: 'A56E', source: 'Brute Abombinator', capture: false },
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: Outputs.healerGroups,
      },
    },
    {
      id: 'R7S Quarry Swamp',
      type: 'StartsUsing',
      netRegex: { id: 'A575', source: 'Brute Abombinator', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Line of Sight boss with adds',
        },
      },
    },
    {
      id: 'R7S Explosion',
      type: 'StartsUsing',
      netRegex: { id: 'A576', source: 'Brute Abombinator', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Rotate away from proximity marker',
        },
      },
    },
    {
      id: 'R7S Pulp Smash',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.pulpSmashMarker, capture: true },
      infoText: (_data, matches, output) => output.text!({ target: matches.target }),
      outputStrings: {
        text: {
          en: 'Stack on ${target} => Out + Protean',
        },
      },
    },
    {
      id: 'R7S Neo Bombarian Special',
      type: 'StartsUsing',
      netRegex: { id: 'A57C', source: 'Brute Abombinator', capture: true },
      durationSeconds: (_data, matches) => parseFloat(matches.castTime),
      countdownSeconds: (_data, matches) => parseFloat(matches.castTime),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Go North, big AoE + Launch',
        },
      },
    },
    {
      id: 'R7S Brutish Swing',
      type: 'StartsUsing',
      netRegex: {
        id: ['A58C', 'A58D', 'A58F', 'A591', 'A5A3', 'A5A5'],
        source: 'Brute Abombinator',
        capture: true,
      },
      infoText: (data, matches, output) => {
        const id = matches.id;
        switch (id) {
          case 'A58C':
            return output.in!({ id: matches.id });
          case 'A58D':
            return output.out!({ id: matches.id });
          case 'A58F':
            return output.in!({ id: matches.id });
          case 'A591':
            return output.out!({ id: matches.id });
          case 'A5A3': {
            if (data.brutalImpactCount > 7)
              return output.in!({ id: matches.id });

            const followup = data.stoneringer2Followup ? output.bigAoe!() : output.awayFromFront!();
            return output.inFollowup!({ followup: followup, id: matches.id });
          }
          case 'A5A5': {
            if (data.brutalImpactCount > 7)
              return output.out!({ id: matches.id });

            const followup = data.stoneringer2Followup ? output.bigAoe!() : output.awayFromFront!();
            return output.outFollowup!({ followup: followup, id: matches.id });
          }
          default:
            return output.unknown!({ id: matches.id });
        }
      },
      run: (data) => {
        delete data.storedStoneringer;
        delete data.stoneringer2Followup;
      },
      outputStrings: {
        in: {
          en: 'In at tethered wall ${id}',
        },
        out: {
          en: 'Out from tethered wall ${id}',
        },
        inFollowup: {
          en: 'In at tethered wall + ${followup} ${id}',
        },
        outFollowup: {
          en: 'Out from tethered wall + ${followup} ${id}',
        },
        awayFromFront: {
          en: 'Spread, Away from front',
        },
        bigAoe: Outputs.bigAoe,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'R7S Glower Power',
      type: 'StartsUsing',
      netRegex: { id: 'A585', source: 'Brute Abombinator', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Spread, Away from front',
        },
      },
    },
    {
      id: 'R7S Revenge of the Vines',
      type: 'StartsUsing',
      netRegex: { id: 'A587', source: 'Brute Abombinator', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R7S Thorny Deathmatch',
      type: 'Tether',
      netRegex: { id: '0152', capture: true },
      infoText: (_data, matches, output) => output.text!({ target: matches.target }),
      outputStrings: {
        text: {
          en: 'Tank tether on ${target}',
        },
      },
    },
    {
      id: 'R7S Abominable Blink',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.flareMarker, capture: true },
      alertText: (data, matches, output) => {
        if (matches.target === data.me)
          return output.flare!();
        return output.avoidFlare!();
      },
      outputStrings: {
        avoidFlare: {
          en: 'Away from Flare',
        },
        flare: {
          en: 'Flare on YOU',
        },
      },
    },
    {
      // different strats have different players taking these tethers,
      // so we use a generic callout for now
      id: 'R7S Demolition Deathmatch',
      type: 'StartsUsing',
      netRegex: { id: 'A596', source: 'Brute Abombinator', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get Tethers',
        },
      },
    },
    {
      id: 'R7S Strange Seeds',
      type: 'StartsUsing',
      netRegex: { id: 'A598', source: 'Brute Abombinator', capture: true },
      suppressSeconds: 1,
      alertText: (data, matches, output) => {
        if (data.me === matches.target)
          return output.dropSeed!();
        return output.avoidSeed!();
      },
      outputStrings: {
        dropSeed: {
          en: 'Drop seed => Avoid line AoEs',
        },
        avoidSeed: {
          en: 'Avoid line AoEs',
        },
      },
    },
    {
      id: 'R7S Killer Seeds',
      type: 'StartsUsing',
      netRegex: { id: 'A59B', source: 'Brute Abombinator', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: Outputs.stackPartner,
      },
    },
    {
      id: 'R7S Powerslam',
      type: 'StartsUsing',
      netRegex: { id: 'A59E', source: 'Brute Abombinator', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R7S Stoneringer 2: Stoneringers',
      type: 'StartsUsing',
      netRegex: { id: ['A5A0', 'A5A1'], source: 'Brute Abombinator', capture: true },
      durationSeconds: (_data, matches) => parseFloat(matches.castTime) + 10,
      infoText: (data, matches, output) => {
        data.storedStoneringer = matches.id === 'A5A0' ? 'out' : 'in';
        data.stoneringer2Followup = true;
        return output[data.storedStoneringer]!();
      },
      outputStrings: {
        in: Outputs.in,
        out: Outputs.out,
      },
    },
    {
      id: 'R7S Lashing Lariat',
      type: 'StartsUsing',
      netRegex: { id: ['A5A8', 'A5AA'], source: 'Brute Abombinator', capture: true },
      infoText: (_data, matches, output) =>
        matches.id === 'A5A8' ? output.right!() : output.left!(),
      outputStrings: {
        left: Outputs.left,
        right: Outputs.right,
      },
    },
    {
      id: 'R7S Slaminator',
      type: 'StartsUsing',
      netRegex: { id: 'A5AD', source: 'Brute Abombinator', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get Tower',
        },
      },
    },
    {
      id: 'R7S Debris Deathmatch',
      type: 'StartsUsing',
      netRegex: { id: 'A5B0', source: 'Brute Abombinator', capture: false },
      condition: (data) => isHealerOrRanged(data.job),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get Tethers',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Smash Here/Smash There': 'Smash Here/There',
      },
    },
  ],
};

export default triggerSet;
