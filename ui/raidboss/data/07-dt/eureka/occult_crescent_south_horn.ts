import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  ce?: string;
}

// List of events:
// https://github.com/xivapi/ffxiv-datamining/blob/master/csv/DynamicEvent.csv
//
// These ids are (unfortunately) gathered by hand and don't seem to correlate
// to any particular bits of data.  However, there's a game log message when you
// register for a CE and an 0x21 message with this id when you accept and
// teleport in.  This avoids having to translate all of these names and also
// guarantees that the player is actually in the CE for the purpose of
// filtering triggers.
const ceIds: { [ce: string]: string } = {
  calamityBound: '32F',
  companyOfStone: '343',
  crawlingDeath: '330',
  cursedConcern: '32B',
  eternalWatch: '329',
  flameOfDusk: '32A',
  fromTimesBygone: '323',
  noiseComplaint: '327',
  onTheHunt: '338',
  scourgeOfTheMind: '320',
  sharkAttack: '32E',
  theBlackRegiment: '322',
  theUnbridled: '348',
  trialByClaw: '349',
  withExtremePredjudice: '339',
};

const triggerSet: TriggerSet<Data> = {
  id: 'TheOccultCrescentSouthHorn',
  zoneId: ZoneId.TheOccultCrescentSouthHorn,
  comments: {
    en: 'Occult Crescent South Horn critical encounter triggers/timeline.',
  },
  timelineFile: 'occult_crescent_south_horn.txt',
  resetWhenOutOfCombat: false,
  triggers: [
    {
      id: 'Occult Crescent Critical Encounter',
      type: 'ActorControl',
      netRegex: { command: '80000014' },
      run: (data, matches) => {
        // This fires when you win, lose, or teleport out.
        if (matches.data0 === '00') {
          if (data.ce !== undefined && data.options.Debug)
            console.log(`Stop CE: ${data.ce}`);
          // Stop any active timelines.
          data.StopCombat();
          // Prevent further triggers for any active CEs from firing.
          delete data.ce;
          return;
        }

        delete data.ce;
        const ceId = matches.data0.toUpperCase();
        for (const key in ceIds) {
          if (ceIds[key] === ceId) {
            if (data.options.Debug)
              console.log(`Start CE: ${key} (${ceId})`);
            data.ce = key;
            return;
          }
        }

        if (data.options.Debug)
          console.log(`Start CE: ??? (${ceId})`);
      },
    },
    {
      id: 'Occult Crescent Berserker Scathing Sweep',
      type: 'StartsUsing',
      netRegex: { source: 'Crescent Berserker', id: 'A6C3', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'Occult Crescent Hinkypunk Dread Dive',
      type: 'StartsUsing',
      netRegex: { source: 'Hinkypunk', id: 'A1A4', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'Occult Crescent Hinkypunk Shades Nest',
      type: 'StartsUsing',
      // TODO: Some of these are from boss, some are not.
      netRegex: { source: 'Hinkypunk', id: ['A19C', 'A19D', 'A430', 'A431'], capture: true },
      suppressSeconds: 1,
      response: Responses.getIn(),
      run: (_data, matches) => console.log(`Shades Nest: ${matches.id}`),
    },
    {
      id: 'Occult Crescent Hinkypunk Shades Crossing',
      type: 'StartsUsing',
      // TODO: Some of these are from boss, some are not.
      netRegex: { source: 'Hinkypunk', id: ['A19F', 'A1A0', 'A432', 'A433'], capture: true },
      suppressSeconds: 1,
      response: Responses.getIntercards(),
      run: (_data, matches) => console.log(`Shades Nest: ${matches.id}`),
    },
    {
      id: 'Occult Crescent Hinkypunk Lamplight',
      type: 'StartsUsing',
      netRegex: { source: 'Hinkypunk', id: ['A1A5', 'A310'], capture: false },
      suppressSeconds: 1,
      response: Responses.aoe(),
    },
    {
      id: 'Occult Crescent Black Star Choco Windstorm',
      type: 'StartsUsing',
      netRegex: { source: 'Black Star', id: 'A0BB', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'Occult Crescent Black Star Choco Cyclone',
      type: 'StartsUsing',
      netRegex: { source: 'Black Star', id: 'A0BC', capture: false },
      response: Responses.getIn(),
    },
    {
      id: 'Occult Crescent Neo Garula Squash',
      type: 'StartsUsing',
      netRegex: { source: 'Neo Garula', id: 'A0E5', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'Occult Crescent Lion Rampant Fearsome Glint',
      type: 'StartsUsing',
      netRegex: { source: 'Lion Rampant', id: 'A1C3', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Occult Crescent Death Claw Dirty Nails',
      type: 'StartsUsing',
      netRegex: { source: 'Death Claw', id: 'A174', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'Occult Crescent Death Claw Grip of Poison',
      type: 'StartsUsing',
      netRegex: { source: 'Death Claw', id: 'A175', capture: false },
      response: Responses.bleedAoe(),
    },
    {
      id: 'Occult Crescent Death Claw Vertical Crosshatch',
      type: 'StartsUsing',
      netRegex: { source: 'Death Claw', id: ['A16B', 'A172'], capture: false },
      response: Responses.getSidesThenFrontBack('alert'),
    },
    {
      id: 'Occult Crescent Death Claw Horizontal Crosshatch',
      type: 'StartsUsing',
      netRegex: { source: 'Death Claw', id: ['A16C', 'A173'], capture: false },
      response: Responses.getFrontBackThenSides('alert'),
    },
  ],
  timelineReplace: [],
};

export default triggerSet;
