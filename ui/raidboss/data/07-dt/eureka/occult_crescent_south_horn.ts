import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  ce?: string;
  demonTabletChiselTargets: string[];
  demonTabletRotationCounter: number;
  demonTabletIsFrontSide: boolean;
  demonTabletCometeor?: 'near' | 'afar';
  demonTabletCometSouthTargets: string[];
  demonTabletCometNorthTargets: string[];
  deadStarsIsSlice2: boolean;
  deadStarsSliceTargets: string[];
  deadStarsFirestrikeTargets: string[];
  deadStarsCount: number;
  deadStarsPhobos: number[];
  deadStarsNereid: number[];
  deadStarsTriton: number[];
  deadStarsLiquifiedNereid: number[];
  deadStarsLiquifiedTriton: number[];
  deadStarsSnowballTetherDirNum?: number;
  deadStarsSnowballTetherCount: number;
  prongedPassageActLoc: { [id: string]: string };
  prongedPassageIdolCastCount: { [id: string]: number };
  marbleDragonDelugeTargets: string[];
  marbleDragonHasWickedWater: boolean;
  bossDir?: number;
  playerDir?: number;
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

const headMarkerData = {
  // Demon Tablet Occult Chisel tankbuster aoe marker
  'demonTabletTankbuster': '01F1',
  // Demon Tablet Portentous Comet Stack + Launch North marker
  'demonTabletLaunchNorthStack': '023E',
  // Demon Tablet Portentous Comet Stack + Launch South marker
  'demonTabletLaunchSouthStack': '023F',
  // Dead Stars boss tethers to each other
  'deadStarsTether': '0136',
  // Dead Stars boss tethers
  'deadStarsBossTether': '00F9',
  // Dead Stars Slice 'n' Dice tankbuster cleave
  'deadStarsTankbuster': '01D7',
  // Dead Stars Avalaunch Proximity Stack
  'deadStarsAvalaunchStack': '0064',
  // Dead Stars snowball spike tether
  'deadStarsSnowballTether': '00F6',
  // Dead Stars snowball tether
  'deadStarsSnowballTether2': '0001',
  // Tower Progenitor and Tower Progenitrix Punishing Pounce Stack
  'prongedPassageStack': '0064',
  // Marble Dragon tankbuster from Dread Deluge
  'marbleDragonTankbuster': '00DA',
  // Marble Dragon red pinwheel markers from Wicked Water
  'marbleDragonWickedWater': '0017',
} as const;

// Occult Crescent Forked Tower: Blood Demon Tablet consts
// const demonTabletCenterX = 700;
const demonTabletCenterY = 379;

// Occult Crescent Forked Tower: Blood Dead Stars consts
const deadStarsCenterX = -800;
const deadStarsCenterY = 360;

// Occult Crescent Forked Tower: Pronged Passage consts
const prongedPassageCenterY = 315;

const deadStarsOutputStrings = {
  lineStacksOnPlayers: {
    en: 'Line Stacks on ${player1}, ${player2}, ${player3}',
  },
  lineStackOnYouTankCleave: {
    en: 'Line Stack on YOU, Avoid Tank Cleave',
  },
  lineStackOnYou: {
    en: 'Line Stack on YOU',
    de: 'Linien Stack auf DIR',
    fr: 'Package en ligne sur VOUS',
    ja: '直線頭割り',
    cn: '直线分摊点名',
    ko: '직선 쉐어 대상자',
  },
};

const triggerSet: TriggerSet<Data> = {
  id: 'TheOccultCrescentSouthHorn',
  zoneId: ZoneId.TheOccultCrescentSouthHorn,
  comments: {
    en: 'Occult Crescent South Horn critical encounter triggers/timeline.',
    cn: '蜃景幻界新月岛 南征之章 紧急遭遇战 触发器/时间轴。',
  },
  config: [
    {
      id: 'demonTabletRotation',
      name: {
        en: 'Forked Tower: Blood Demon Tablet Rotation Strategy',
      },
      type: 'select',
      options: {
        en: {
          'Less movement by calling direction to go around instead of get behind.': 'optimization',
          'Early movement with get behind calls.': 'none',
        },
      },
      default: 'none',
    },
  ],
  timelineFile: 'occult_crescent_south_horn.txt',
  initData: () => ({
    demonTabletChiselTargets: [],
    demonTabletRotationCounter: 0,
    demonTabletIsFrontSide: true,
    demonTabletCometSouthTargets: [],
    demonTabletCometNorthTargets: [],
    deadStarsIsSlice2: false,
    deadStarsSliceTargets: [],
    deadStarsFirestrikeTargets: [],
    deadStarsCount: 0,
    deadStarsPhobos: [],
    deadStarsNereid: [],
    deadStarsTriton: [],
    deadStarsLiquifiedNereid: [],
    deadStarsLiquifiedTriton: [],
    deadStarsSnowballTetherCount: 0,
    prongedPassageActLoc: {},
    prongedPassageIdolCastCount: {
      'north': 0,
      'south': 0,
    },
    marbleDragonDelugeTargets: [],
    marbleDragonHasWickedWater: false,
  }),
  resetWhenOutOfCombat: false,
  timelineTriggers: [
    {
      id: 'Occult Crescent Marble Dragon Draconiform Motion Bait',
      regex: /Draconiform Motion/,
      beforeSeconds: 7,
      alertText: (_data, _matches, output) => output.baitCleave!(),
      outputStrings: {
        baitCleave: {
          en: 'Bait Cleave',
        },
      },
    },
  ],
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
      id: 'Occult Crescent Cloister Demon Tidal Breath',
      type: 'StartsUsing',
      netRegex: { source: 'Cloister Demon', id: 'A190', capture: false },
      response: Responses.getBehind(),
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
    {
      id: 'Occult Crescent Repaired Lion Holy Blaze',
      type: 'StartsUsing',
      netRegex: { source: 'Repaired Lion', id: 'A151', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Occult Crescent Repaired Lion Scratch',
      type: 'StartsUsing',
      netRegex: { source: 'Repaired Lion', id: 'A155', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'Occult Crescent Nymian Petalodus Hydrocleave',
      type: 'StartsUsing',
      netRegex: { source: 'Nymian Petalodus', id: 'A88D', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Occult Crescent Demon Tablet Demonic Dark II',
      type: 'StartsUsing',
      netRegex: { source: 'Demon Tablet', id: 'A306', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'Occult Crescent Demon Tablet Ray of Dangers Near/Expulsion Afar',
      // A2F3 Ray of Dangers Near
      // A2F4 Ray of Expulsion Afar
      type: 'StartsUsing',
      netRegex: { source: 'Demon Tablet', id: ['A2F3', 'A2F4'], capture: true },
      alertText: (_data, matches, output) => {
        if (matches.id === 'A2F3')
          return output.out!();
        return output.inKnockback!();
      },
      outputStrings: {
        out: Outputs.out,
        inKnockback: {
          en: 'In (Knockback)',
        },
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Occult Chisel',
      // Boss' top three targets targeted with A308 Occult Chisel aoe tankbuster
      // A307 Occult Chisel castbar associated
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.demonTabletTankbuster], capture: true },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          tankbustersOnPlayers: {
            en: 'Tankbusters on ${player1}, ${player2}, ${player3}',
          },
          tankBusterOnYou: Outputs.tankBusterOnYou,
        };
        data.demonTabletChiselTargets.push(matches.target);
        if (data.demonTabletChiselTargets.length < 3)
          return;

        const target1 = data.demonTabletChiselTargets[0];
        const target2 = data.demonTabletChiselTargets[1];
        const target3 = data.demonTabletChiselTargets[2];
        if (data.me === target1 || data.me === target2 || data.me === target3)
          return { alertText: output.tankBusterOnYou!() };

        return {
          infoText: output.tankbustersOnPlayers!({
            player1: data.party.member(target1),
            player2: data.party.member(target2),
            player3: data.party.member(target3),
          }),
        };
      },
      run: (data) => {
        if (data.demonTabletChiselTargets.length === 3)
          data.demonTabletChiselTargets = [];
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Demonograph of Dangears Near/Expulsion Afar',
      // A2F6 Demonograph of Dangers Near
      // A2F7 Demonograph of Expulsion Afar
      type: 'StartsUsing',
      netRegex: { source: 'Demon Tablet', id: ['A2F6', 'A2F7'], capture: true },
      alertText: (_data, matches, output) => {
        if (matches.id === 'A2F6')
          return output.out!();
        return output.inKnockback!();
      },
      outputStrings: {
        out: Outputs.out,
        inKnockback: {
          en: 'In (Knockback)',
        },
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Rotate Left/Right',
      // A302 Rotate Left
      // A301 Rotate Right
      // Configurable to use an optimization callout, skipping get behind calls
      type: 'StartsUsing',
      netRegex: { source: 'Demon Tablet', id: ['A302', 'A301'], capture: true },
      promise: async (data, matches) => {
        // Only check if in front/behind for first rotation
        if (data.demonTabletRotationCounter % 2)
          return;
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `Occult Crescent Demon Tablet Rotate Left/Right: Wrong combatants count ${combatants.length}`,
          );
          return;
        }
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `Occult Crescent Demon Tablet Rotate Left/Right: Wrong actor count ${actors.length}`,
          );
          return;
        }
        const bossDirNum = Directions.hdgTo4DirNum(actor.Heading);
        const getSide = (
          y: number,
        ): number => {
          // First Rotation is always N or S
          // N Platform
          if (y < demonTabletCenterY)
            return 0;
          // S Platform
          if (y > demonTabletCenterY)
            return 2;

          return -1;
        };
        const playerDirNum = getSide(me.PosY);
        data.demonTabletIsFrontSide = (playerDirNum === bossDirNum)
          ? true
          : false;
      },
      alertText: (data, matches, output) => {
        // First Rotation
        if (!(data.demonTabletRotationCounter % 2)) {
          if (
            data.demonTabletIsFrontSide &&
            data.triggerSetConfig.demonTabletRotation !== 'optimization'
          ) {
            if (matches.id === 'A301')
              return output.leftThenGetBehind!();
            return output.rightThenGetBehind!();
          }
          if (matches.id === 'A301')
            return output.left!();
          return output.right!();
        }

        // Second Rotation
        if (
          data.demonTabletIsFrontSide &&
          data.triggerSetConfig.demonTabletRotation === 'optimization'
        ) {
          // Optimization callout since it is faster to go with boss direction
          if (matches.id === 'A301')
            return output.goRightAround!();
          return output.goLeftAround!();
        }
        // Reminders to be behind
        if (matches.id === 'A301')
          return output.leftBehind!();
        return output.rightBehind!();
      },
      run: (data) => {
        data.demonTabletRotationCounter = data.demonTabletRotationCounter + 1;
      },
      outputStrings: {
        left: Outputs.left,
        right: Outputs.right,
        leftBehind: {
          en: 'Left (Behind Boss)',
        },
        rightBehind: {
          en: 'Right (Behind Boss)',
        },
        leftThenGetBehind: {
          en: 'Left => Get Behind',
        },
        rightThenGetBehind: {
          en: 'Right => Get Behind',
        },
        goRightAround: {
          en: 'Go Right and Around',
        },
        goLeftAround: {
          en: 'Go Left and Around',
        },
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Cometeor of Dangers Near/Expulsion Afar',
      // A2E4 Cometeor of Dangers Near
      // A2E5 Cometeor of Expulsion Afar
      // TODO: Handle meteor players separately
      // This cast happens about 0.1s before players are marked with comets
      type: 'StartsUsing',
      netRegex: { source: 'Demon Tablet', id: ['A2E4', 'A2E5'], capture: true },
      preRun: (data, matches) => {
        data.demonTabletCometeor = matches.id === 'A2E4' ? 'near' : 'afar';
      },
      delaySeconds: 0.2, // Delayed to retreive comet data
      alertText: (data, matches, output) => {
        // Do not call for those with comets
        const north1 = data.demonTabletCometNorthTargets[0];
        const north2 = data.demonTabletCometNorthTargets[1];
        const south1 = data.demonTabletCometSouthTargets[0];
        const south2 = data.demonTabletCometSouthTargets[1];
        if (
          data.me === north1 || data.me === north2 ||
          data.me === south1 || data.me === south2
        )
          return;

        if (matches.id === 'A2E4')
          return output.out!();
        return output.inKnockback!();
      },
      run: (data) => {
        // Clear comet targets for Cometeor 2
        if (
          data.demonTabletCometNorthTargets.length === 2 &&
          data.demonTabletCometSouthTargets.length === 2
        ) {
          data.demonTabletCometNorthTargets = [];
          data.demonTabletCometSouthTargets = [];
        }
      },
      outputStrings: {
        out: Outputs.out,
        inKnockback: {
          en: 'In (Knockback)',
        },
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Portentous Comet',
      // Headmarkers associated with casts A2E8 Portentous Comet
      // TODO: Find meteor location, to tell to launch over boss or to boss
      // TODO: Tell who to launch with?
      // Note: Reset of target collectors happens in Cometeor trigger
      type: 'HeadMarker',
      netRegex: {
        id: [
          headMarkerData.demonTabletLaunchSouthStack,
          headMarkerData.demonTabletLaunchNorthStack,
        ],
        capture: true,
      },
      condition: (data, matches) => {
        // Gather data for four players before continuing
        if (matches.id === headMarkerData.demonTabletLaunchSouthStack)
          data.demonTabletCometSouthTargets.push(matches.target);
        if (matches.id === headMarkerData.demonTabletLaunchNorthStack)
          data.demonTabletCometNorthTargets.push(matches.target);
        if (
          data.demonTabletCometNorthTargets.length === 2 &&
          data.demonTabletCometSouthTargets.length === 2
        )
          return true;
        return false;
      },
      delaySeconds: (data) => {
        // Delay for those without stack markers to avoid conflict with meteor/cross calls
        const north1 = data.demonTabletCometNorthTargets[0];
        const north2 = data.demonTabletCometNorthTargets[1];
        const south1 = data.demonTabletCometSouthTargets[0];
        const south2 = data.demonTabletCometSouthTargets[1];
        if (
          data.me === north1 || data.me === north2 ||
          data.me === south1 || data.me === south2
        )
          return 0;

        // castTime of Cometeor of Dangers Near / Expulsion Afar
        // Boss lands at this time, locking in the stack players to their perspective sides
        return 9.7;
      },
      durationSeconds: (data) => {
        // Additional duration for those who received call early
        const north1 = data.demonTabletCometNorthTargets[0];
        const north2 = data.demonTabletCometNorthTargets[1];
        const south1 = data.demonTabletCometSouthTargets[0];
        const south2 = data.demonTabletCometSouthTargets[1];
        if (
          data.me === north1 || data.me === north2 ||
          data.me === south1 || data.me === south2
        )
          return 16.7; // castTime of Portentous Comet
        return 7; // Time between Cometeor cast end and Portentous Comet end
      },
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          stackLaunchTowardsBoss: {
            en: 'Stack, Launch towards Boss',
          },
          goNorthOutStackOnYou: {
            en: 'Go North Out => Stack Launch Marker on You',
          },
          goNorthInStackOnYou: {
            en: 'Go North In (Knockback) => Stack Launch Marker on You',
          },
          goSouthOutStackOnYou: {
            en: 'Go South Out => Stack Launch Marker on You',
          },
          goSouthInStackOnYou: {
            en: 'Go South In (Knockback) => Stack Launch Marker on You',
          },
        };

        const north1 = data.demonTabletCometNorthTargets[0];
        const north2 = data.demonTabletCometNorthTargets[1];
        const south1 = data.demonTabletCometSouthTargets[0];
        const south2 = data.demonTabletCometSouthTargets[1];
        if (data.me === north1 || data.me === north2) {
          if (data.demonTabletCometeor === 'near')
            return { alertText: output.goSouthOutStackOnYou!() };
          return { alertText: output.goSouthInStackOnYou!() };
        }
        if (data.me === south1 || data.me === south2) {
          if (data.demonTabletCometeor === 'near')
            return { alertText: output.goNorthOutStackOnYou!() };
          return { alertText: output.goNorthInStackOnYou!() };
        }

        // TODO: Upgrade to alert if meteor player
        return { infoText: output.stackLaunchTowardsBoss!() };
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Summon',
      type: 'StartsUsing',
      netRegex: { source: 'Demon Tablet', id: 'A30D', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Add Positions and Out',
        },
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Gravity of Dangears Near/Expulsion Afar',
      // A2F6 Gravity of Dangers Near
      // A2F7 Gravity of Expulsion Afar
      // TODO: Get side that has towers
      type: 'StartsUsing',
      netRegex: { source: 'Demon Tablet', id: ['A2EA', 'AA01'], capture: true },
      alertText: (_data, matches, output) => {
        if (matches.id === 'A2EA')
          return output.goTowerSideOut!();
        return output.goTowerSideIn!();
      },
      outputStrings: {
        goTowerSideOut: {
          en: 'Go Towers Side and Out',
        },
        goTowerSideIn: {
          en: 'Go Towers Side and In (Knockback)',
        },
      },
    },
    {
      id: 'Occult Crescent Tower Manticore Left/Right Hammer',
      // Needs to be slowed by slowed by Time Mage or it is 4.2s into a 0.7s followup
      // Can be out-ranged as well
      // A7BF Left Hammer (7.8s with Slow)
      // A7C0 Right Hammer (7.8s with Slow)
      // A7E6 Left Hammer (1.5s followup with Slow)
      // A7E7 Right Hammer (1.5s followup with Slow)
      type: 'StartsUsing',
      netRegex: { source: 'Tower Manticore', id: ['A7BF', 'A7C0'], capture: true },
      infoText: (_data, matches, output) => {
        if (matches.id === 'A7BF')
          return output.rightThenLeft!();
        return output.leftThenRight!();
      },
      outputStrings: {
        leftThenRight: Outputs.leftThenRight,
        rightThenLeft: Outputs.rightThenLeft,
      },
    },
    {
      id: 'Occult Crescent Tower Manticore Left/Right Hammer Followup',
      // Cast bar can be interrupted leading to extra calls if using castTime
      type: 'Ability',
      netRegex: { source: 'Tower Manticore', id: ['A7BF', 'A7C0'], capture: true },
      suppressSeconds: 1,
      alertText: (_data, matches, output) => {
        if (matches.id === 'A7BF')
          return output.left!();
        return output.right!();
      },
      outputStrings: {
        left: Outputs.left,
        right: Outputs.right,
      },
    },
    {
      id: 'Occult Crescent Dead Stars Decisive Battle',
      // Each boss targets ground, avoid getting hit by more than one aoe
      // A5FA Decisive Battle from Triton
      // A5FB Decisive Battle from Nereid
      // A5FC Decisive Battle from Phobos
      type: 'StartsUsing',
      netRegex: { source: 'Phobos', id: 'A5FC', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Occult Crescent Dead Stars Boss Tether',
      // Status effects on players applied without NetworkBuff log lines
      // 1156 Tritonic Gravity (Purple Beta)
      // 1157 Nereidic Gravity (Red Alpha)
      // 1158 Phobosic Gravity (Green Gamma)
      type: 'Tether',
      netRegex: { id: [headMarkerData.deadStarsBossTether], capture: true },
      condition: (data, matches) => {
        // Tethers come from player
        if (data.me === matches.source)
          return true;
        return false;
      },
      infoText: (_data, matches, output) => {
        return output.boss!({ boss: matches.target });
      },
      outputStrings: {
        boss: {
          en: 'Tethered to ${boss}',
        },
      },
    },
    {
      id: 'Occult Crescent Dead Stars Slice \'n\' Dice',
      // Each boss uses tankbuster cleave on main target deadStarsSliceBuster
      // A601 Slice 'n' Dice castbar
      // A602 Slice 'n' Dice cast that does damage
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.deadStarsTankbuster], capture: true },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          tankCleavesOnPlayers: {
            en: 'Tank Cleaves on ${player1}, ${player2}, ${player3}',
          },
          tankCleaveOnYou: Outputs.tankCleaveOnYou,
          tankCleaveOnYouLineStack: {
            en: 'Tank Cleave on YOU, Avoid Line Stack',
          },
        };
        data.deadStarsSliceTargets.push(matches.target);
        if (data.deadStarsSliceTargets.length < 3)
          return;

        const target1 = data.deadStarsSliceTargets[0];
        const target2 = data.deadStarsSliceTargets[1];
        const target3 = data.deadStarsSliceTargets[2];
        if (data.me === target1 || data.me === target2 || data.me === target3) {
          if (!data.deadStarsIsSlice2)
            return { alertText: output.tankCleaveOnYou!() };
          return { alertText: output.tankCleaveOnYouLineStack!() };
        }

        // Do not call out with Firestrike 2
        if (data.deadStarsIsSlice2)
          return;

        return {
          infoText: output.tankCleavesOnPlayers!({
            player1: data.party.member(target1),
            player2: data.party.member(target2),
            player3: data.party.member(target3),
          }),
        };
      },
      run: (data) => {
        // Do not clear data for Firestrike 2 to use
        if (data.deadStarsSliceTargets.length === 3 && !data.deadStarsIsSlice2) {
          data.deadStarsSliceTargets = [];
          data.deadStarsIsSlice2 = true;
        }
      },
    },
    {
      id: 'Occult Crescent Dead Stars Three-Body Problem',
      // Each boss casts this, logs show A5B5 as 'Three-Body Probl─'
      // Only 'Three-Body Problem' text is visible in castbars
      // Primordial Chaos: A5B5 by Phobos into A9BD from Nereid + A5B9 Triton
      // Icebound Buffoon: A5B5 by Nereid into A5B8 from Phobos
      // Blazing Belligerent: A5B5 by Triton into A5B7 from Phobos
      type: 'StartsUsing',
      netRegex: { source: ['Phobos', 'Nereid', 'Triton'], id: 'A5B5', capture: false },
      infoText: (_data, _matches, output) => output.outOfHitbox!(),
      outputStrings: {
        outOfHitbox: Outputs.outOfHitbox,
      },
    },
    {
      id: 'Occult Crescent Dead Stars Primordial Chaos',
      // Each boss targets ground, avoid getting hit by more than one aoe
      // A5D9 Primordial Chaos castbar
      // A5DC Primordial Chaos damage cast for each alliance
      type: 'StartsUsing',
      netRegex: { source: 'Phobos', id: 'A5D9', capture: false },
      response: Responses.aoe(),
    }, /*
    {
      id: 'Occult Crescent Dead Stars Nova/Ice Ooze Initial',
      // This won't work until FFXIVACT Plugin captures StatusEffectListForay3
      // Applied with Primordial Chaos
      // Comes in stacks of 1, 2, or 3
      // 1159 Nova Ooze (Red)
      // 115A Ice Ooze (Blue)
      // Players need to get hit by opposite color Ooze to decrease count
      // Hits by same color Oooze will increase count
      // Four opportunities to increase/decrease stack, meaning those with lower counts can afford mistakes
      // Any stacks remaining before Noxious Nova (A5E5) result in lethal damage
      type: 'GainsEffect',
      netRegex: { effectId: ['1159', '115A'], capture: true },
      condition: (data, matches) => {
        if (data.me === matches.target)
          return true;
        return false;
      },
      suppressSeconds: 60, // Ignore during mechanic
      infoText: (_data, matches, output) => {
        const num = matches.count;
        if (matches.effectId === '1159')
          return output.blue!({ num: num });
        return output.red!({ num: num });
      },
      outputStrings: {
        red: {
          en: 'Get hit by red ${num}x',
        },
        blue: {
          en: 'Get hit by blue ${num}x',
        },
      },
    },*/
    {
      id: 'Occult Crescent Dead Stars Frozen Fallout Locations',
      // This will currently output both ooze tells
      // TODO: Change to just what player needs once status effect is logged
      // TODO: Add additional triggers to tell where to go after each cast
      // Boss casts A45DD (Frozen Fallout) and A5DF + A5E0 tells
      // Liquified Triton (Red) tells are the A5DF casts
      // Liquified Nereid (Blue) tells are the A5E0 casts
      // Invisible entities are centered in the circle aoes that they tell
      // StartsUsing can have inaccurate location, Ability seems to be correct
      type: 'Ability',
      netRegex: { source: ['Phobos', 'Triton'], id: ['A5DF', 'A5E0'], capture: true },
      preRun: (data, matches) => {
        const dirNum = Directions.xyTo8DirNum(
          parseFloat(matches.x),
          parseFloat(matches.y),
          deadStarsCenterX,
          deadStarsCenterY,
        );
        if (matches.id === 'A5DF')
          data.deadStarsLiquifiedTriton.push(dirNum);
        if (matches.id === 'A5E0')
          data.deadStarsLiquifiedNereid.push(dirNum);
      },
      durationSeconds: 18, // Time from last tell to end of mechanic is ~18.3s
      infoText: (data, matches, output) => {
        if (
          data.deadStarsLiquifiedTriton.length !== 4 &&
          data.deadStarsLiquifiedNereid.length !== 4
        )
          return;

        const dirNums = matches.id === 'A5DF'
          ? data.deadStarsLiquifiedTriton
          : data.deadStarsLiquifiedNereid;

        if (
          dirNums[0] === undefined || dirNums[1] === undefined ||
          dirNums[2] === undefined || dirNums[3] === undefined
        )
          return;

        const dirs = [
          output[Directions.outputFrom8DirNum(dirNums[0])]!(),
          output[Directions.outputFrom8DirNum(dirNums[1])]!(),
          output[Directions.outputFrom8DirNum(dirNums[2])]!(),
          output[Directions.outputFrom8DirNum(dirNums[3])]!(),
        ];

        if (matches.id === 'A5DF')
          return output.red!({ dirs: dirs });
        if (matches.id === 'A5E0')
          return output.blue!({ dirs: dirs });
      },
      tts: null, // TODO: Remove when filtered for status effect
      outputStrings: {
        ...Directions.outputStrings8Dir,
        red: {
          en: 'Red: ${dirs}',
        },
        blue: {
          en: 'Blue: ${dirs}',
        },
      },
    },
    {
      id: 'Occult Crescent Dead Stars Noxious Nova',
      // Any stack of Nova Ooze (1159), or Ice Ooze (115A) results in lethal damage
      type: 'StartsUsing',
      netRegex: { source: 'Phobos', id: 'A5E5', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Occult Crescent Dead Stars Vengeful Direction',
      // Bosses cast A5BC unique to the vengeful casts, but this doesn't have their location at cast
      // Bosses jump with A5B4 ~2s after A5BC prior to starting Vengeful casts
      // AbilityExtra lines of A5B4 include target location of where they will cast
      // Post A5E6 Noxious Nova (A637 Noisome Nuisance)
      // A5BD Vengeful Fire III (Triton)
      // A5BE Vengeful Blizzard III (Nereid)
      //
      // Post A5D5 To the Winds (A636 Icebound Buffoon)
      // A5BD Vengeful Fire III (Triton)
      // A5BF Vengeful Bio III (Phobos)
      //
      // Post A5C5 To the Winds (A635 Blazing Belligerent)
      // A5BE Vengeful Blizzard III (Nereid)
      // A5BF Vengeful Bio III (Phobos)
      type: 'Ability',
      netRegex: { source: ['Phobos', 'Nereid', 'Triton'], id: 'A5BC', capture: true },
      delaySeconds: 2.6, // Above 2s needed due to latency
      promise: async (data, matches) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `Occult Crescent Dead Stars Vengeful Direction: Wrong actor count ${actors.length}`,
          );
          return;
        }

        if (matches.source === 'Phobos')
          data.deadStarsPhobos = [actor.PosX, actor.PosY];
        if (matches.source === 'Nereid')
          data.deadStarsNereid = [actor.PosX, actor.PosY];
        if (matches.source === 'Triton')
          data.deadStarsTriton = [actor.PosX, actor.PosY];
        data.deadStarsCount = data.deadStarsCount + 1;
      },
      infoText: (data, _matches, output) => {
        if (
          data.deadStarsCount !== 2 &&
          data.deadStarsCount !== 4 &&
          data.deadStarsCount !== 6
        )
          return;

        // First and Second Use Triton, Last use Nereid
        const boss1 = (data.deadStarsCount === 2 || data.deadStarsCount === 4)
          ? data.deadStarsTriton
          : data.deadStarsNereid;
        // First use Nereid, otherwise Phobos
        const boss2 = data.deadStarsCount === 2
          ? data.deadStarsNereid
          : data.deadStarsPhobos;

        // Reset results
        data.deadStarsTriton = [];
        data.deadStarsNereid = [];
        data.deadStarsPhobos = [];

        // Calculate mid point (safe spot) and output result
        if (
          boss1[0] === undefined || boss1[1] === undefined ||
          boss2[0] === undefined || boss2[1] === undefined
        )
          return;
        const x = (boss1[0] + boss2[0]) / 2;
        const y = (boss1[1] + boss2[1]) / 2;
        const dirNum = Directions.xyTo8DirNum(
          x,
          y,
          deadStarsCenterX,
          deadStarsCenterY,
        );
        return output[Directions.outputFrom8DirNum(dirNum)]!();
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
      },
    },
    {
      id: 'Occult Crescent Dead Stars Delta Attack',
      // There are a multitude of spells in this sequence:
      // All three cast A5FD, Triton also casts A5FF and A63E (damage)
      // All three cast A5FE, Triton also casts A600
      // Nereid casts A63F (damage)
      // All three cast A5FE, Triton also casts A600
      // Phobos casts A63F (damage)
      // In total, three hits happen:
      // Triton hits at ~5.5s
      // Nereid hits at ~6.65s
      // Phobos hits at ~7.76s
      type: 'StartsUsing',
      netRegex: { source: 'Phobos', id: 'A5FD', capture: false },
      durationSeconds: 7,
      response: Responses.bigAoe(),
    },
    {
      id: 'Occult Crescent Dead Stars Firestrike',
      // This has a line stack headmarker, but does not appear in the logs
      // Each boss starts a 4.7s A603 cast on themselves which comes with A604 on a targeted player
      // ~0.13s after A603, each boss casts A606 that does the line aoe damage
      type: 'Ability',
      netRegex: { source: ['Phobos', 'Nereid', 'Triton'], id: 'A604', capture: true },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = deadStarsOutputStrings;
        data.deadStarsFirestrikeTargets.push(matches.target);
        if (data.deadStarsFirestrikeTargets.length < 3)
          return;

        const target1 = data.deadStarsFirestrikeTargets[0];
        const target2 = data.deadStarsFirestrikeTargets[1];
        const target3 = data.deadStarsFirestrikeTargets[2];

        if (data.me === target1 || data.me === target2 || data.me === target3)
          return { alertText: output.lineStackOnYou!() };

        return {
          infoText: output.lineStacksOnPlayers!({
            player1: data.party.member(target1),
            player2: data.party.member(target2),
            player3: data.party.member(target3),
          }),
        };
      },
      run: (data) => {
        if (data.deadStarsFirestrikeTargets.length === 3)
          data.deadStarsFirestrikeTargets = [];
      },
    },
    {
      id: 'Occult Crescent Dead Stars Snowball Flight Positions',
      // These are each 6.7s casts, covering 9.6s
      // Snowball Flight (A5CE)
      // Snow Boulder (A5CF) is cast 3 times, 2.5s apart
      // Snow Boulder (A5D0) Wild Charge damage is applied when hit
      // Knockback timing will vary based on charge order
      // Minimum of 4 players needed in each charge, with front person taking major damage
      // 3 pairs of soaks, knockback immune recommended to avoid getting hit more than once
      type: 'StartsUsing',
      netRegex: { source: 'Nereid', id: 'A5CE', capture: false },
      infoText: (_data, _matches, output) => {
        return output.chargePositions!();
      },
      outputStrings: {
        chargePositions: {
          en: 'Wild Charge Positions',
        },
      },
    },
    {
      id: 'Occult Crescent Dead Stars Snowball Flight Knockback',
      // CastTime is 6.7s
      // Set 1 Knockback at 7s
      // Set 2 Knocbkack at 9.6s
      // Set 3 Knockback at 12.2s
      // This will call out at 6s, covering all three knockbacks
      // TODO: Add configurator to select knockback timing
      type: 'StartsUsing',
      netRegex: { source: 'Nereid', id: 'A5CE', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 0.7,
      response: Responses.knockback(),
    },
    {
      id: 'Occult Crescent Dead Stars Snowball Tether/Knockback',
      // Three things happen here
      // 1 - Two players get marked with a Proximity Tether + Stack Marker
      // 2 - Knockback from center of room
      // 3 - Players in stack take proximity damage as if they had their own tether
      // Related Spell Ids:
      // - Players tethered are targeted by Avalaunch (A5D1)
      // - Knockback is caused by Chilling Collision (A5D4)
      // - Additional Chilling Collision casts from A5B6 Nereid and A5D3 from Frozen Triton
      // - Proximity stack damage is from Avalaunch (A5D2)
      // - Snowballs jump using Avalaunch (A89A)
      type: 'Tether',
      netRegex: { id: [headMarkerData.deadStarsSnowballTether], capture: true },
      preRun: (data) => {
        data.deadStarsSnowballTetherCount = data.deadStarsSnowballTetherCount + 1;
      },
      promise: async (data, matches) => {
        // Only calculate direction for players that are targetted
        if (data.me !== matches.target)
          return;
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `Occult Crescent Dead Stars Snowball Tether: Wrong actor count ${actors.length}`,
          );
          return;
        }

        const dirNum = Directions.xyTo8DirNum(
          actor.PosX,
          actor.PosY,
          deadStarsCenterX,
          deadStarsCenterY,
        );
        data.deadStarsSnowballTetherDirNum = (dirNum + 4) % 8;
      },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          ...Directions.outputStrings8Dir,
          knockbackTetherDir: {
            en: 'Tether: Knockback to ${dir} => Stack at Wall',
          },
          knockbackToSnowball: {
            en: 'Knockback to Snowball => Stack at Wall',
          },
        };

        if (
          data.deadStarsSnowballTetherDirNum !== undefined &&
          data.me === matches.target
        ) {
          // This will trigger for each tether a player has
          const dir = output[Directions.outputFrom8DirNum(data.deadStarsSnowballTetherDirNum)]!();
          return { alarmText: output.knockbackTetherDir!({ dir: dir }) };
        }

        // A player who has a tether should have a defined direction, but if they don't they'll get two calls
        if (
          data.deadStarsSnowballTetherDirNum === undefined &&
          data.deadStarsSnowballTetherCount === 2
        )
          return { alertText: output.knockbackToSnowball!() };
      },
    },
    {
      id: 'Occult Crescent Dead Stars Firestrike 2',
      // This has a line stack headmarker, but does not appear in the logs
      // Each boss starts a 4.7s A605 (Slice 'n' Dice) cast on themselves which comes with a607 on a targeted player
      // ~0.13s after A605, each boss casts A606 that does the line aoe damage
      // Meanwhile, boss targets main target with tankbuster cleave A602 Slice 'n' Dice
      type: 'Ability',
      netRegex: {
        source: ['Phobos', 'Nereid', 'Triton', 'Frozen Phobos'],
        id: 'A607',
        capture: true,
      },
      delaySeconds: 0.1, // Delay for Tankbuster target accummulation
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = deadStarsOutputStrings;
        data.deadStarsFirestrikeTargets.push(matches.target);
        if (data.deadStarsFirestrikeTargets.length < 3)
          return;

        const strikeTarget1 = data.deadStarsFirestrikeTargets[0];
        const strikeTarget2 = data.deadStarsFirestrikeTargets[1];
        const strikeTarget3 = data.deadStarsFirestrikeTargets[2];
        if (
          data.me === strikeTarget1 ||
          data.me === strikeTarget2 ||
          data.me === strikeTarget3
        )
          return { alertText: output.lineStackOnYouTankCleave!() };

        // Do not call out to Slice 'n' Dice targets
        const sliceTarget1 = data.deadStarsSliceTargets[0];
        const sliceTarget2 = data.deadStarsSliceTargets[1];
        const sliceTarget3 = data.deadStarsSliceTargets[2];
        if (
          data.me === sliceTarget1 ||
          data.me === sliceTarget2 ||
          data.me === sliceTarget3
        )
          return;

        return {
          infoText: output.lineStacksOnPlayers!({
            player1: data.party.member(strikeTarget1),
            player2: data.party.member(strikeTarget2),
            player3: data.party.member(strikeTarget3),
          }),
        };
      },
      run: (data) => {
        if (data.deadStarsFirestrikeTargets.length === 3) {
          data.deadStarsFirestrikeTargets = [];
          data.deadStarsSliceTargets = [];
        }
      },
    },
    {
      id: 'Occult Crescent Dead Stars Six-handed Fistfight',
      // Start of enrage sequence
      // All three bosses cast a 9.1s Six-handed Fistfight (A5E7)
      // They become "Dead Stars", which also casts the spell under A5E9 (10.2s) and A5E8 (9.7s)
      // Middle will be taken over/blocked by bosses bodying each other (A5EA Bodied)
      type: 'StartsUsing',
      netRegex: { source: 'Phobos', id: 'A5E7', capture: false },
      infoText: (_data, _matches, output) => output.outOfMiddleGroups!(),
      outputStrings: {
        outOfMiddleGroups: {
          en: 'Out of Middle, Group Positions',
        },
      },
    },
    {
      id: 'Occult Crescent Dead Stars Six-handed Fistfight AoE',
      // 10.2s cast, delay until 5s before end
      type: 'StartsUsing',
      netRegex: { source: 'Dead Stars', id: 'A5E9', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 5.2,
      suppressSeconds: 1,
      response: Responses.bigAoe(),
    },
    {
      id: 'Occult Crescent Dead Stars Collateral Damage',
      type: 'StartsUsing',
      netRegex: { source: 'Dead Stars', id: 'A5ED', capture: false },
      infoText: (_data, _matches, output) => output.jetsThenSpread!(),
      outputStrings: {
        jetsThenSpread: {
          en: 'Dodge Two Jets => Spread',
        },
      },
    },
    {
      id: 'Occult Crescent Dead Stars Collateral Damage Spread',
      // 5s to spread after last jet happens, 2s after Collateral Damage cast
      type: 'StartsUsing',
      netRegex: { source: 'Dead Stars', id: 'A5ED', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) + 2,
      alertText: (_data, _matches, output) => output.spread!(),
      outputStrings: {
        spread: Outputs.spread,
      },
    },
    {
      id: 'Occult Crescent Pronged Passage Paralyze III',
      // Triggers for both bridges on physical ranged dps
      type: 'StartsUsing',
      netRegex: { source: 'Tower Bhoot', id: 'A903', capture: true },
      promise: async (data, matches) => {
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Paralyze III: Wrong combatants count ${combatants.length}`,
          );
          return;
        }
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Paralyze III: Wrong actor count ${actors.length}`,
          );
          return;
        }
        data.prongedPassageActLoc[data.me] = me.PosY < prongedPassageCenterY
          ? 'north'
          : 'south';
        if (actor.PosY < prongedPassageCenterY)
          data.prongedPassageActLoc[matches.sourceId] = 'north';
        if (actor.PosY > prongedPassageCenterY)
          data.prongedPassageActLoc[matches.sourceId] = 'south';
      },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          interruptBhoot: {
            en: 'Interrupt Bhoot',
          },
          northInterrupt: {
            en: 'North: Interrupt Bhoot',
          },
          southInterrupt: {
            en: 'South: Interrupt Bhoot',
          },
        };
        // Tanks have 3y interrupt, only call about actor on their platform
        if (data.CanSilence() && data.role === 'tank') {
          if (data.prongedPassageActLoc[matches.sourceId] === data.prongedPassageActLoc[data.me])
            return { alarmText: output.interruptBhoot!() };
        }

        // Physical Ranged DPS can reach both platforms
        if (data.CanSilence() && data.role !== 'tank') {
          if (data.prongedPassageActLoc[matches.sourceId] === 'north')
            return { infoText: output.northInterrupt!() };
          if (data.prongedPassageActLoc[matches.sourceId] === 'south')
            return { infoText: output.southInterrupt!() };
        }
      },
    },
    {
      id: 'Occult Crescent Pronged Passage Arcane Spear',
      // Floating spears appear and light up 4 rows on each bridge
      // Tanks need to be in front
      // Phantom Samurai with Shirahadori can also block
      // A441 in first two sections, A6F4 in last section
      // A441 affects north/south bridge at different times
      type: 'StartsUsing',
      netRegex: { source: 'Trap', id: 'A441', capture: true },
      suppressSeconds: 1,
      promise: async (data, matches) => {
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Arcane Spear: Wrong combatants count ${combatants.length}`,
          );
          return;
        }
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Arcane Spear: Wrong actor count ${actors.length}`,
          );
          return;
        }
        data.prongedPassageActLoc[data.me] = me.PosY < prongedPassageCenterY
          ? 'north'
          : 'south';
        if (actor.PosY < prongedPassageCenterY)
          data.prongedPassageActLoc[matches.sourceId] = 'north';
        if (actor.PosY > prongedPassageCenterY)
          data.prongedPassageActLoc[matches.sourceId] = 'south';
      },
      alertText: (data, matches, output) => {
        if (data.prongedPassageActLoc[matches.sourceId] === data.prongedPassageActLoc[data.me])
          return output.wildChargeEast!();
      },
      outputStrings: {
        wildChargeEast: {
          en: 'Wild Charge (East), Stack in a Row',
        },
      },
    },
    {
      id: 'Occult Crescent Pronged Passage Dense Darkness',
      // TODO: Check for Phantom Time Mage Buff?
      // NOTE: will trigger for both north/south bridge by default
      type: 'StartsUsing',
      netRegex: { source: 'Tower Abyss', id: 'A3A8', capture: true },
      promise: async (data, matches) => {
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Dense Darkness: Wrong combatants count ${combatants.length}`,
          );
          return;
        }
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Dense Darkness: Wrong actor count ${actors.length}`,
          );
          return;
        }
        data.prongedPassageActLoc[data.me] = me.PosY < prongedPassageCenterY
          ? 'north'
          : 'south';
        if (actor.PosY < prongedPassageCenterY)
          data.prongedPassageActLoc[matches.sourceId] = 'north';
        if (actor.PosY > prongedPassageCenterY)
          data.prongedPassageActLoc[matches.sourceId] = 'south';
      },
      infoText: (data, matches, output) => {
        if (data.prongedPassageActLoc[matches.sourceId] === 'north')
          return output.northAoEDispel!();
        if (data.prongedPassageActLoc[matches.sourceId] === 'south')
          return output.southAoEDispel!();
      },
      outputStrings: {
        northAoEDispel: {
          en: 'North: AoE (Dispel if Possible)',
        },
        southAoEDispel: {
          en: 'South: AoE (Dispel if Possible)',
        },
      },
    },
    {
      id: 'Occult Crescent Pronged Passage Ancient Aero III',
      // TODO: Check for Phantom Bard Buff?
      // 6 Tower Idols cast Ancient Aero III at different times
      // Must interrupt with Romeo's Ballad all 6 at same time
      // This will count until all 12 have started casting
      type: 'StartsUsing',
      netRegex: { source: 'Tower Idol', id: 'A61F', capture: true },
      promise: async (data, matches) => {
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Ancient Aero III: Wrong combatants count ${combatants.length}`,
          );
          return;
        }
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Ancient Aero III: Wrong actor count ${actors.length}`,
          );
          return;
        }
        data.prongedPassageActLoc[data.me] = me.PosY < prongedPassageCenterY
          ? 'north'
          : 'south';
        const bridge = (actor.PosY < prongedPassageCenterY) ? 'north' : 'south';
        // Ignore actors on other bridge as it's not realistic to stop them
        if (data.prongedPassageActLoc[data.me] !== bridge)
          return;
        data.prongedPassageIdolCastCount[bridge] = (data.prongedPassageIdolCastCount[bridge] ?? 0) +
          1;
      },
      infoText: (data, _matches, output) => {
        const myBridge = data.prongedPassageActLoc[data.me];
        if (myBridge !== undefined && data.prongedPassageIdolCastCount[myBridge] === 6) {
          // Clear data to prevent second firing
          data.prongedPassageIdolCastCount = {};
          return output.romeo!();
        }
      },
      outputStrings: {
        romeo: {
          en: 'Romeo\'s Ballad (if possible)',
        },
      },
    },
    {
      id: 'Occult Crescent Pronged Passage Close Call to Detonate / Far Cry to Detonate',
      // Tower Progenitrix casts A620 / A622
      // Tower Progenitor casts A621 / A623
      // Both adds also get a tether and a buff describing the ability
      // Only need to capture one as it requires both adds to cast
      type: 'StartsUsing',
      netRegex: { source: 'Tower Progenitrix', id: ['A620', 'A622'], capture: true },
      promise: async (data) => {
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Close Call to Detonate / Far Cry to Detonat: Wrong combatants count ${combatants.length}`,
          );
          return;
        }
        data.prongedPassageActLoc[data.me] = me.PosY < prongedPassageCenterY
          ? 'north'
          : 'south';
      },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          topApart: {
            en: 'Top row (bosses apart)',
          },
          bottomApart: {
            en: 'Bottom row (bosses apart)',
          },
          bossesApart: {
            en: 'Move bosses apart',
          },
          topTogether: {
            en: 'Top row (bosses together)',
          },
          bottomTogether: {
            en: 'Bottom row (bosses together)',
          },
          bossesTogether: {
            en: 'Move bosses together',
          },
        };
        const myBridge = data.prongedPassageActLoc[data.me];

        // Close to Detonate => Bosses Apart
        if (matches.id === 'A620') {
          if (myBridge === 'north') {
            if (data.role === 'tank')
              return { alertText: output.topApart!() };
            return { infoText: output.topApart!() };
          }
          if (myBridge === 'south') {
            if (data.role === 'tank')
              return { alertText: output.bottomApart!() };
            return { infoText: output.bottomApart!() };
          }
          return { infoText: output.bossesApart!() };
        }

        // Far to Detonate => Bosses Together
        if (myBridge === 'north') {
          if (data.role === 'tank')
            return { alertText: output.bottomTogether!() };
          return { infoText: output.bottomTogether!() };
        }
        if (myBridge === 'south') {
          if (data.role === 'tank')
            return { alertText: output.topTogether!() };
          return { infoText: output.topTogether!() };
        }
        return { infoText: output.bossesTogether!() };
      },
    },
    {
      id: 'Occult Crescent Pronged Passage Arcane Spear 2',
      // Floating spears appear and light up 4 rows on each bridge
      // Tanks need to be in front
      // Phantom Samurai with Shirahadori can also block
      // A441 in first two sections, A6F4 in last section
      // A6F4 affects north/south bridge at same times
      type: 'StartsUsing',
      netRegex: { source: 'Trap', id: 'A6F4', capture: false },
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.wildChargeEast!(),
      outputStrings: {
        wildChargeEast: {
          en: 'Wild Charge (East), Stack in a Row',
        },
      },
    },
    {
      id: 'Occult Crescent Pronged Passage Bombshell Drop',
      type: 'StartsUsing',
      netRegex: {
        source: ['Tower Progenitrix', 'Tower Progenitor'],
        id: ['A626', 'A627'],
        capture: false,
      },
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (data.role === 'tank')
          return output.pullBossAway!();
        return output.killBombs!();
      },
      outputStrings: {
        pullBossAway: {
          en: 'Pull boss away from bombs',
        },
        killBombs: {
          en: 'Kill Bombs',
        },
      },
    },
    {
      id: 'Occult Crescent Pronged Passage Punishing Pounce',
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.prongedPassageStack], capture: true },
      promise: async (data, matches) => {
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Punishing Pounce: Wrong combatants count ${combatants.length}`,
          );
          return;
        }
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          names: [matches.target],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Punishing Pounce: Wrong actor count ${actors.length}`,
          );
          return;
        }
        data.prongedPassageActLoc[data.me] = me.PosY < prongedPassageCenterY
          ? 'north'
          : 'south';
        if (actor.PosY < prongedPassageCenterY)
          data.prongedPassageActLoc[matches.target] = 'north';
        if (actor.PosY > prongedPassageCenterY)
          data.prongedPassageActLoc[matches.target] = 'south';
      },
      infoText: (data, matches, output) => {
        if (data.prongedPassageActLoc[matches.target] === data.prongedPassageActLoc[data.me])
          return output.stackOnPlayer!({ player: data.party.member(matches.target) });
      },
      outputStrings: {
        stackOnPlayer: Outputs.stackOnPlayer,
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Imitation Star',
      // 77F1 Imitation Star is a 4.7s cast
      // 9ECC Imitation Star damage casts happen 1.8 to 2.9s after
      // This cast also applies a 15s bleed called Bleeding (828)
      type: 'StartsUsing',
      netRegex: { source: 'Marble Dragon', id: '77F1', capture: false },
      response: Responses.bleedAoe(),
    },
    {
      id: 'Occult Crescent Marble Dragon Draconiform Motion',
      // Boss turns to face random player and casts 77C1 Draconiform Motion
      // This is a 3.7s that coincides with these 4.5s casts:
      // 77E6 Draconiform Motion (knockback cleave fromm tail)
      // 77E5 Draconiform Motion (knockback cleave from head)
      // Getting hit also applies D96 Thrice-come Ruin debuff
      type: 'StartsUsing',
      netRegex: { source: 'Marble Dragon', id: '77C1', capture: false },
      response: Responses.goSides(),
    },
    {
      id: 'Occult Crescent Marble Dragon Dread Deluge',
      // Tankbuster targets one tank in each alliance party, 6 tanks total
      // Applies a heavy bleed to target
      // TODO: Determine if they are in player's party to call just that name
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.marbleDragonTankbuster], capture: true },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          tankBusterBleeds: {
            en: 'Tankbuster Bleeds',
          },
          tankBusterBleedOnYou: {
            en: 'Tankbuster bleed on YOU',
          },
        };
        data.marbleDragonDelugeTargets.push(matches.target);
        if (data.marbleDragonDelugeTargets.length < 6)
          return;

        const target1 = data.marbleDragonDelugeTargets[0];
        const target2 = data.marbleDragonDelugeTargets[1];
        const target3 = data.marbleDragonDelugeTargets[2];
        const target4 = data.marbleDragonDelugeTargets[3];
        const target5 = data.marbleDragonDelugeTargets[4];
        const target6 = data.marbleDragonDelugeTargets[6];
        if (
          data.me === target1 || data.me === target2 || data.me === target3 ||
          data.me === target4 || data.me === target5 || data.me === target6
        )
          return { alertText: output.tankBusterBleedOnYou!() };
        if (data.role === 'tank' || data.role === 'healer')
          return { alertText: output.tankBusterBleeds!() };
        return { infoText: output.tankBusterBleeds!() };
      },
      run: (data) => {
        if (data.marbleDragonDelugeTargets.length === 6)
          data.marbleDragonDelugeTargets = [];
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Wicked Water',
      // Boss casts 77E7 Wicked Water, several players get marked
      // After cast end, marked players affected the following:
      // 3AA Throttle (46s)
      // 10EE Wicked Water (46s)
      // An Imitation Blizzard hit changes Wicked Water into 10EF Gelid Gaol
      // Players must be broken out of the gaol to clear the Throttle debuff
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.marbleDragonWickedWater], capture: true },
      condition: Conditions.targetIsYou(),
      durationSeconds: 20, // Time until reminder
      infoText: (_data, _matches, output) => output.wickedWaterOnYou!(),
      run: (data) => data.marbleDragonHasWickedWater = true,
      outputStrings: {
        wickedWaterOnYou: {
          en: 'Wicked Water on YOU',
        },
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Wicked Water Reminder',
      // Need to avoid getting hit by multiple Imitation Blizzards
      // Cross Imitation Blizzards should be avoided
      // Cross Imitation Blizzards resolve at ~23s remaining on the debuff
      // Needs some delay to not conflict with Draconiform Motion callouts
      // 20s is ~2s after Draconiform Motion and gives ~3s to get hit
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.marbleDragonWickedWater], capture: true },
      condition: Conditions.targetIsYou(),
      delaySeconds: 20,
      alertText: (_data, _matches, output) => output.getHitByIceExplosion!(),
      outputStrings: {
        getHitByIceExplosion: {
          en: 'Get hit by ice explosion',
        },
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Gelid Gaol',
      // If capture someone in Gaol, trigger break Gaols
      type: 'GainsEffect',
      netRegex: { effectId: '10EF', capture: false },
      condition: (data) => {
        // Only output for those that do not have Wicked Water
        if (data.marbleDragonHasWickedWater)
          return false;
        return true;
      },
      suppressSeconds: 47, // Duration of Wicked Water + 1s
      alertText: (_data, _matches, output) => output.breakGaol!(),
      outputStrings: {
        breakGaol: {
          en: 'Break Gaols',
        },
      },
    },
    {
      id: 'Occult Crescent Magitaur Unsealed Aura',
      // A264 Unsealed Aura cast
      // 9BE7 Unsealed Aura damage
      type: 'StartsUsing',
      netRegex: { source: 'Magitaur', id: 'A264', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Occult Crescent Magitaur Unseal Tank Autos',
      // 3x near/far tank autos starts 5s after Unseal
      type: 'Ability',
      netRegex: { source: 'Magitaur', id: 'A264', capture: false },
      infoText: (_data, _matches, output) => output.tankAutos!(),
      outputStrings: {
        tankAutos: {
          en: 'Tank autos soon (3 Near/Far)',
        },
      },
    },
    {
      id: 'Occult Crescent Magitaur Critical Axeblow/Lanceblow',
      type: 'StartsUsing',
      netRegex: { source: 'Magitaur', id: ['A247', 'A24B'], capture: true },
      alertText: (_data, matches, output) => {
        if (matches.id === 'A247')
          return output.out!();
        return output.in!();
      },
      outputStrings: {
        out: Outputs.out,
        in: Outputs.in,
      },
    },
    {
      id: 'Occult Crescent Magitaur Forked Fury',
      // Hits 3 nearest and 3 furthest players with tankbuster
      // TODO: Determine close/far autos from boss buff?
      type: 'StartsUsing',
      netRegex: { source: 'Magitaur', id: 'A265', capture: false },
      alertText: (data, _matches, output) => {
        if (data.role === 'tank')
          return output.nearFarTankCleave!();
        return output.avoidCleave!();
      },
      outputStrings: {
        avoidCleave: {
          en: 'Be on boss hitbox (avoid tank cleaves)',
          de: 'Geh auf den Kreis vom Boss (vermeide Tank Cleaves)',
          fr: 'Sur la hitbox (évitez les tanks cleaves)',
          ja: 'ボス背面のサークル上に',
          cn: '站在目标圈上 (远离坦克死刑)',
          ko: '보스 히트박스 경계에 있기 (광역 탱버 피하기)',
        },
        nearFarTankCleave: {
          en: 'Near and far tank cleave => 2 tank autos',
        },
      },
    },
    {
      id: 'Occult Crescent Magitaur Aura Burst / Holy Canisters',
      // A25A Aura Burst (Yellow) cast or A25B Holy (Blue) cast
      // Tell for which canisters to focus
      type: 'StartsUsing',
      netRegex: { source: 'Magitaur', id: ['A25A', 'A25B'], capture: true },
      infoText: (_data, matches, output) => {
        if (matches.id === 'A25A')
          return output.yellowCanisters!();
        return output.blueCanisters!();
      },
      outputStrings: {
        blueCanisters: {
          en: 'Attack Blue Canisters (Lance)',
        },
        yellowCanisters: {
          en: 'Attack Yellow Canisters (Axe)',
        },
      },
    },
    {
      id: 'Occult Crescent Magitaur Aura Burst / Holy',
      // This is a long 18.7s cast + 1s damage
      // A25A Aura Burst (Yellow) cast or A25B Holy (Blue) cast
      // 9BE5 Aura Burst damage or 9BE6 Holy damage
      type: 'StartsUsing',
      netRegex: { source: 'Magitaur', id: ['A25A', 'A25B'], capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 5,
      response: Responses.aoe(),
    },
    {
      id: 'Occult Crescent Magitaur Sage\'s Staff',
      // Boss spawns three staves that will fire an untelegraphed line at nearest target
      // A25F Mana Expulsion is the untelegraphed line stack damage 14.4s after
      // There is an In/Out dodge before Mana Expulsion
      type: 'Ability',
      netRegex: { source: 'Magitaur', id: 'A25E', capture: false },
      delaySeconds: 8.5,
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.lineStackStaff!(),
      outputStrings: {
        lineStackStaff: {
          en: 'Line stack at staff',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Vertical Crosshatch/Horizontal Crosshatch': 'Vertical/Horizontal Crosshatch',
        'Ray of Dangers Near / Ray of Expulsion Afar': 'Ray Near/Far',
        'Demonograph of Dangers Near / Demonograph of Expulsion Afar': 'Deomograph Near/Far',
        'Rotate Right / Rotate Left': 'Rotate Left/Right',
        'Cometeor of Dangers Near / Cometeor of Expulsion Afar': 'Cometeor Near/Far',
        'Gravity of Dangers Near / Gravity of Expulsion Afar': 'Gravity Near/Far',
        'Close Call to Detonate / Far Cry to Detonate': 'Close/Far to Detonate',
        'Critical Axeblow / Critical Lanceblow': 'Critical Axe/Lanceblow',
      },
    },
    {
      'locale': 'cn',
      'missingTranslations': true,
      'replaceSync': {
        'Ball of Fire': '火球',
        'Black Star': '黑色天星',
        'Clawmarks': '抓痕',
        'Cloister Demon': '回廊恶魔',
        'Crescent Berserker': '新月狂战士',
        'Crystal Dragon': '水晶龙',
        'Death Claw': '死亡爪',
        'Draconic Double': '水晶龙的幻影',
        'Hinkypunk': '鬼火苗',
        'Lion Rampant': '跃立狮',
        'Neo Garula': '进化加鲁拉',
        'Nymian Petalodus': '尼姆瓣齿鲨',
        'Phantom Claw': '死亡爪的幻影',
        'Repaired Lion': '复原狮像',
      },
      'replaceText': {
        '\\(in\\)': '(内)',
        '\\(jump\\)': '(跳)',
        '\\(Lightning\\)': '(雷)',
        '\\(out\\)': '(外)',
        '\\(Wind\\)': '(风)',
        'Bedrock Uplift': '地面隆起',
        'Blazing Flare': '炽热核爆',
        'Boil Over': '发怒',
        'Channeled Rage': '燥怒',
        'Clawing Shadow': '雾霾爪',
        'Clawmarks': '抓痕',
        'Crystal Call': '生成晶石',
        'Crystal Mirror': '转移晶石',
        'Crystallized Energy': '水晶波动',
        'Dirty Nails': '腐坏爪',
        'Explosion': '爆炸',
        'Fearsome Facet': '幻影晶石',
        'Gigaflare': '十亿核爆',
        'Great Ball of Fire': '火球',
        'Heated Outburst': '气焰',
        'Heightened Rage': '狂怒',
        'Hopping Mad': '震击怒涛',
        'Horizontal Crosshatch': '横向双重抓',
        'Karmic Drain': '生命侵蚀',
        'Lethal Nails': '死亡甲',
        'Made Magic': '释放魔力',
        'Manifold Marks': '多重抓痕',
        'Primal Roar': '大咆哮',
        'Prismatic Wing': '水晶之翼',
        'Raking Scratch': '尖甲疾袭',
        'Scathing Sweep': '横砍',
        'Seal Asunder': '封印破坏',
        'Skulking Orders': '处刑令',
        'Sunderseal Roar': '破封的咆哮',
        'The Grip of Poison': '邪气的共振',
        'Threefold Marks': '三重抓痕',
        'Tidal Breath': '怒潮吐息',
        'Vertical Crosshatch': '纵向双重抓',
        'Void Thunder III': '虚空暴雷',
        'White-hot Rage': '气焰怒涛',
      },
    },
  ],
};

export default triggerSet;
