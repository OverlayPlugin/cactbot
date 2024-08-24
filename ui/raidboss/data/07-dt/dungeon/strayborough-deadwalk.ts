import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Add basically anything to help with the doll charges.
// TODO: Warning for the falling Ferris wheel.
// TODO: Determine safe spots for Tea Awhirl
// TODO: Determine safe spots for Toiling Teapots

export interface Data extends RaidbossData {
  playerIsGhost: boolean;
  solidBitterLinesNext: boolean;
}

const triggerSet: TriggerSet<Data> = {
  id: 'The Strayborough Deadwalk',
  zoneId: ZoneId.TheStrayboroughDeadwalk,
  timelineFile: 'strayborough-deadwalk.txt',
  initData: () => {
    return {
      playerIsGhost: false,
      solidBitterLinesNext: false,
    };
  },
  triggers: [
    {
      id: 'Strayborough Deadwalk Leonogg Malicious Mist',
      type: 'StartsUsing',
      netRegex: { id: '8EB1', source: 'His Royal Headness Leonogg I', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Strayborough Deadwalk Falling Nightmare',
      type: 'Ability',
      netRegex: { id: '8EAE', source: 'His Royal Headness Leonogg I', capture: false },
      infoText: (_data, _matches, output) => output.nightmare!(),
      outputStrings: {
        nightmare: {
          en: 'Avoid nightmare puddles',
        },
      },
    },
    {
      id: 'Strayborough Deadwalk Spirited Charge',
      type: 'StartsUsing',
      netRegex: { id: '8EF6', source: 'His Royal Headness Leonogg I', capture: false },
      infoText: (_data, _matches, output) => output.charge!(),
      outputStrings: {
        charge: {
          en: 'Avoid charging dolls',
        },
      },
    },
    {
      id: 'Strayborough Deadwalk Evil Scheme',
      type: 'StartsUsing',
      netRegex: { id: '9B02', source: 'His Royal Headness Leonogg I', capture: false },
      infoText: (_data, _matches, output) => output.exaflares!(),
      outputStrings: {
        exaflares: {
          en: 'Avoid exaflares',
        },
      },
    },
    {
      id: 'Strayborough Deadwalk Looming Nightmare',
      type: 'HeadMarker',
      netRegex: { id: '00C5' },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.chasingPuddles!(),
      outputStrings: {
        chasingPuddles: {
          en: 'Chasing puddles on YOU',
        },
      },
    },
    {
      id: 'Strayborough Deadwalk Last Drop',
      type: 'HeadMarker',
      netRegex: { id: '00DA' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Strayborough Deadwalk Sordid Steam',
      type: 'StartsUsing',
      netRegex: { id: '8F75', source: 'Jack-in-the-Pot', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Strayborough Deadwalk Ghostly Guise Gain',
      type: 'GainsEffect',
      netRegex: { effectId: 'F6D' },
      condition: Conditions.targetIsYou(),
      run: (data) => data.playerIsGhost = true,
    },
    {
      id: 'Strayborough Deadwalk Ghostly Guise Lose',
      type: 'LosesEffect',
      netRegex: { effectId: 'F6D' },
      condition: Conditions.targetIsYou(),
      run: (data) => data.playerIsGhost = false,
    },
    {
      id: 'Strayborough Deadwalk Bitter Regret Middle',
      type: 'StartsUsing',
      netRegex: { id: '9113', source: 'Träumerei', capture: false },
      response: Responses.goSides(),
    },
    {
      id: 'Strayborough Deadwalk Bitter Regret Sides',
      type: 'StartsUsing',
      netRegex: { id: '9114', source: 'Träumerei', capture: false },
      response: Responses.goMiddle(),
    },
    {
      id: 'Strayborough Deadwalk Ill Intent',
      type: 'StartsUsing',
      netRegex: { id: '9AB7', source: 'Stray Geist' },
      condition: Conditions.targetIsYou(),
      alertText: (data, _matches, output) => {
        if (data.playerIsGhost)
          return output.ghostTether!();
        return output.fleshTether!();
      },
      outputStrings: {
        ghostTether: {
          en: 'Stretch tether',
        },
        fleshTether: {
          en: 'Become ghost => stretch tether',
        },
      },
    },
    {
      id: 'Strayborough Deadwalk Fleshbuster',
      type: 'StartsUsing',
      netRegex: { id: '911C', source: 'Träumerei', capture: false },
      alertText: (data, _matches, output) => {
        if (data.playerIsGhost)
          return;
        return output.becomeGhost!();
      },
      infoText: (data, _matches, output) => {
        if (!data.playerIsGhost)
          return;
        return output.stayGhost!();
      },
      outputStrings: {
        becomeGhost: {
          en: 'Become a ghost',
        },
        stayGhost: {
          en: 'Stay a ghost',
        },
      },
    },
    {
      // Despite this attack having spread marker visuals,
      // it doesn't actually do any damage if done correctly,
      // and stacking two or more has no effect.
      id: 'Strayborough Deadwalk Ghostduster',
      type: 'StartsUsing',
      netRegex: { id: '9119', source: 'Träumerei', capture: false },
      alertText: (data, _matches, output) => {
        if (!data.playerIsGhost)
          return;
        return output.becomeFlesh!();
      },
      infoText: (data, _matches, output) => {
        if (data.playerIsGhost)
          return;
        return output.stayFlesh!();
      },
      outputStrings: {
        becomeFlesh: {
          en: 'Clear ghost status',
        },
        stayFlesh: {
          en: 'Avoid ghost tiles',
        },
      },
    },
    {
      id: 'Strayborough Deadwalk Träumerei Malicious Mist',
      type: 'StartsUsing',
      netRegex: { id: '9130', source: 'Träumerei', capture: false },
      response: Responses.aoe(),
    },
    {
      // There are two different Bitter Regret mechanics from adds,
      // both of which use ID 91DC.
      // Fortunately, the two different mechanics are always bracketed by
      // Fleshbuster/Ghostduster and by Impact.
      // Thus, we look for any usage of these three skills and turn
      // the solid lines flag on or off as appropriate.
      id: 'Strayborough Deadwalk Alternate Lines Next',
      type: 'Ability',
      netRegex: { id: ['9119', '911C'], source: 'Träumerei', capture: false },
      run: (data) => data.solidBitterLinesNext = false,
    },
    {
      id: 'Strayborough Deadwalk Solid Lines Next',
      type: 'Ability',
      netRegex: { id: '910D', source: 'Träumerei', capture: false },
      run: (data) => data.solidBitterLinesNext = true,
    },
    {
      id: 'Strayborough Deadwalk Bitter Regret Alternate Lines',
      type: 'StartsUsing',
      netRegex: { id: '91DC', source: 'Stray Phantagenitrix', capture: false },
      condition: (data) => !data.solidBitterLinesNext,
      suppressSeconds: 10, // Don't warn on second set.
      infoText: (_data, _matches, output) => output.dodgeLines!(),
      outputStrings: {
        dodgeLines: {
          en: 'Start mid => Dodge lines',
        },
      },
    },
    {
      // The lines are 4 units apart on center, in the range 130-166.
      // Centerline is 148 and never has a ghost. Lower values are left, higher values are right.
      id: 'Strayborough Deadwalk Bitter Regret Solid Lines',
      type: 'StartsUsing',
      netRegex: { id: '91DC', source: 'Stray Phantagenitrix' },
      condition: (data) => data.solidBitterLinesNext,
      suppressSeconds: 1, // Multiple instances start casting simultaneously.
      infoText: (_data, matches, output) => {
        const rightUnsafe = Math.round(parseFloat(matches.x)) > 149;
        if (rightUnsafe)
          return output.goLeft!();
        return output.goRight!();
      },
      outputStrings: {
        goRight: Outputs.right,
        goLeft: Outputs.left,
      },
    },
    {
      // As with some other stack lasers in 7.0 content,
      // this doesn't use the head marker log line,
      // instead simply insta-casting an unknown ability on the target.
      // The actual damage ability starts casting alongside.

      // Despite its name, this doesn't seem to be affected
      // by whether or not the targets are ghosts.
      id: 'Strayborough Deadwalk Ghostcrusher',
      type: 'Ability',
      netRegex: { id: '9118', source: 'Träumerei' },
      response: Responses.stackMarkerOn(),
    },
  ],
};

export default triggerSet;
