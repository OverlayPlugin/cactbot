import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import Util from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { OutputStrings, TriggerSet } from '../../../../../types/trigger';

type Phase = 'p1' | 'p2' | 'p3';
const phases: { [id: string]: Phase } = {
  'C24C': 'p2', // Ultimate Embrace, God Kefka
  'C3F7': 'p3', // Aero III Assault (from Kefka), Chaos and Exdeath
};

// const centerX = 100;
// const centerY = 100;

type forsakenHeadmarker = 'cone' | 'spread' | 'stack' | 'unknown';
type forsakenHeadmarkerMap = { [key: string]: forsakenHeadmarker };
const forsakenHeadmarkerIdToName: forsakenHeadmarkerMap = {
  '02CB': 'stack',
  '02CD': 'cone',
  '02CC': 'spread',
} as const;

export interface Data extends RaidbossData {
  readonly triggerSetConfig: {
    forsaken: 'kroxy-rinon' | 'abba' | 'bowtie' | 'none';
  };
  // General
  phase: Phase | 'unknown';
  // Phase 2
  pathOfLightCounter: number;
  pathOfLightStackPlayers: string[]; // Quick lookup/listing of players with stacks
  forsakenPlayerHeadmarkers: { [id: string]: forsakenHeadmarker }; // Quickly check player's headmarker
  myPathOfLights: string[]; // History of your markers
  isForsakenGroupA: boolean; // Quick lookup for group check
  forsakenGroupA: string[]; // List of players in Group A
  forsakenGroupB: string[]; // List of players in Group B
}

const headMarkerData = {
  // Phase 2
  'sharedBuster': '0103', // Ultimate Embrace shared tankbuster
  'stackPath': '02CB', // When standing in Path of Light tower, causes BAC0 Spelldriver (3-person stack)
  'conePath': '02CD', // When standing in Path of Light tower, causes BAC2 Spellwave (cone targetting nearest player)
  'spreadPath': '02CC', // When standing in Path of Light tower, causes BAC1 Spellscatter (small aoe on the player)
} as const;

const forsakenOutputStrings: OutputStrings = {
  spreadBowtie: Outputs.spread,
  tower: Outputs.getTowers,
  leftTower: {
    en: 'Left Tower',
  },
  rightTower: {
    en: 'Right Tower',
  },
  towerOrBeNear: { // Used in even towers with no strategy
    en: '${tower} / ${near}',
  },
  avoid: {
    en: 'Avoid towers',
    de: 'Türme vermeiden',
    fr: 'Évitez les tours',
    ja: '塔回避',
    cn: '远离塔',
    ko: '기둥 피하기',
    tc: '遠離塔',
  },
  outOfHitbox: Outputs.outOfHitbox,
  cone: {
    en: 'Cone on YOU',
  },
  spread: {
    en: 'Spread on YOU',
  },
  stack: { // This generally won't get called unless there is a wrong config or missed tower
    en: 'Stack stored on YOU',
  },
  num: {
    en: '${num}: ',
    de: '${num}: ',
    fr: '${num}: ',
    ja: '${num}: ',
    cn: '${num}: ',
    ko: '${num}: ',
    tc: '${num}: ',
  },
  you: {
    en: 'YOU',
  },
  beNear: {
    en: 'Be Near',
    de: 'Sei Nahe',
    cn: '站近',
    ko: '가까이 있기',
  },
  beFar: {
    en: 'Be Far',
    de: 'Sei Fern',
    cn: '站远',
    ko: '멀리 있기',
  },
  stackOnYou: Outputs.stackOnYou,
  stackOnPlayer: { // Used only in first tower (role-based)
    en: 'Stack is on ${player}',
  },
  stacksOnPlayers: {
    en: 'Stacks on ${players}',
  },
  stacksOnPlayersTower: { // Used after first tower
    en: '${num}${stack} + ${tower}',
  },
  stackOnYouTower: { // Used in first tower only
    en: '${num}${tower} + ${marker}',
  },
  swapTowers: { // Used in second tower only
    en: '${num}Swap Towers',
  },
  markerOnYouStacksOnPlayers: { // Used only for first tower
    en: '${num}${marker} + ${stacks}',
  },
  markerOnYouTower: { // Used for Cone or Spread
    en: '${num}${marker} + ${tower}',
  },
  baitLeftConeOutOdds: {
    en: '${num}Bait Left Cone Out',
  },
  baitLeftConeLeftEvens: {
    en: '${num}Bait Left Cone Left',
  },
  leftStack: {
    en: '${num}Left Stack + ${avoid}',
  },
  rightStack: {
    en: '${num}Right Stack + ${avoid}',
  },
  mechs: {
    en: '${num}${mech1} + ${mech2}',
  },
  mechs3: {
    en: '${num}${mech1} + ${mech2} + ${mech3}',
  },
  bait: {
    en: '${num}Bait Cone Right or Clone Near',
  },
  baitConeFromPlayer: {
    en: 'Bait Cone from ${player}',
  },
  spreadWithPlayer: {
    en: 'Spread with ${player}',
  },
  baitCloneOppositeTowers: {
    en: '${num}Bait Clone Opposite Towers Near',
  },
  numBeNearSpreadBowtie: {
    en: '${num}${near} + ${spread}',
  },
  baitLeftConeOutBowtie: {
    en: '${num}Bait Left Cone Out',
  },
  baitLeftConeLeftBowtie: {
    en: '${num}Bait Left Cone Left',
  },
  getHitBySpreadRightBowtie: { // Used only in 5th tower for AAAABBBB
    en: '${num}Get Right + Hit by Spread',
  },
  spreadTowersBowtie: { // Used only in last tower for AAAABBBB
    en: '${num}${tower} + ${spread}',
  },
  markerOnYouNoStrategy: { // Odd Towers
    en: '${num}${marker}',
  },
  mechsNoStrategy: {
    en: '${num}${marker} + ${mechs}',
  },
  baitNoStrategy: { // No marker and no strategy was selected
    en: '${num}Bait Cone or Clone Near',
  },
  baitConeOrStackNoStrategy: {
    en: '${num}Bait Cone or Stack',
  },
};

const triggerSet: TriggerSet<Data> = {
  id: 'DancingMadUltimate',
  zoneId: ZoneId.DancingMadUltimate,
  config: [
    {
      id: 'forsaken',
      comment: {
        en: `There should be two groups of four players, choose tower soak order.<br \>
          Kroxy-Rinon 3/4/1: <a href="https://pastebin.com/7fs57PyQ" target="_blank">Kefka Bin</a><br \>
          Modified ABBA: <a href="https://raidplan.io/plan/b5tgewax4kb746sf" target="_blank">Raidplan</a><br \>
          Bowtie: <a href="https://raidplan.io/plan/kj2d734d36es2ugs" target="_blank">Raidplan</a> (Will require Tank LB3)<br \>
          Default will be Cones + Support Stack Left and Spread + DPS Stack Right, relative towers to facing in.`,
      },
      name: {
        en: 'P2 Forsaken Strategy',
      },
      type: 'select',
      options: {
        en: {
          'AAABBBBA (3/4/1), Kroxy-Rinon': 'kroxy-rinon',
          'ABBAABBA (1/2/2/2/1) Modified': 'abba',
          'AAAABBBB (4/4) Bowtie': 'bowtie',
          'Generic calls.': 'none',
        },
      },
      default: 'none',
    },
  ],
  timelineFile: 'dancing_mad.txt',
  initData: () => {
    return {
      phase: 'p1',
      // Phase 2
      pathOfLightCounter: 1,
      myPathOfLights: [],
      pathOfLightStackPlayers: [],
      forsakenPlayerHeadmarkers: {},
      isForsakenGroupA: false,
      forsakenGroupA: [],
      forsakenGroupB: [],
    };
  },
  triggers: [
    {
      id: 'DMU Phase Tracker',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(phases) },
      run: (data, matches) => data.phase = phases[matches.id] ?? 'unknown',
    },
    {
      id: 'DMU P2 Ultimate Embrace',
      type: 'StartsUsing',
      netRegex: { id: 'C24C', source: 'Kefka', capture: true },
      response: Responses.sharedTankBuster(),
    },
    {
      id: 'DMU P2 Forsaken',
      // 7s cast
      type: 'StartsUsing',
      netRegex: { id: 'BABC', source: 'Kefka', capture: false },
      durationSeconds: 6.7,
      response: Responses.bigAoe('alert'),
    },
    {
      id: 'DMU P2 Spell\'s Trouble Clear Current Headmarker',
      // Each player gets 4 of these, using this to track when to clear from
      // Track when last one is lost
      type: 'LosesEffect',
      netRegex: { effectId: '13DB', capture: true },
      run: (data, matches) => {
        delete data.forsakenPlayerHeadmarkers[matches.target];
      },
    },
    {
      id: 'DMU P2 Path of Light Headmarker Tracker',
      // When standing in Path of Light tower, causes BAC0 Spelldriver (3-person stack)
      // When standing in Path of Light tower, causes BAC2 Spellwave (cone targetting nearest player)
      // When standing in Path of Light tower, causes BAC1 Spellscatter (small aoe on the player)
      // Headmarkers update ~2.5s prior to 13DB Spell's Trouble debuff count decrementing
      //
      // Stacks cannot exist with Even towers, there isn't enough players for near Baits
      // However, it is still possible to do an odd tower without having stacks
      // This seems to be treated as a special case as we find tower 7 give 4 stacks
      //
      // Possible Group solutions:
      // AAABBBBA
      // ABBAABBA
      // AAAABBBB, requires Tank LB3 due to forced 4 stacks from tower 7
      type: 'HeadMarker',
      netRegex: {
        id: [
          headMarkerData['stackPath'],
          headMarkerData['conePath'],
          headMarkerData['spreadPath'],
        ],
        capture: true,
      },
      run: (data, matches) => {
        const id = matches.id;
        const target = matches.target;

        // Storing self for simple lookups later
        // This can also be used to track how many towers have been soaked
        // and what was soaked before to handle who baits where on evens
        if (data.me === target)
          data.myPathOfLights.push(forsakenHeadmarkerIdToName[id] ?? 'unknown');

        // Clear previous Headmarker if set
        data.pathOfLightStackPlayers = data.pathOfLightStackPlayers.filter((t) => t !== target);
        data.forsakenPlayerHeadmarkers[matches.target] = forsakenHeadmarkerIdToName[id] ??
          'unknown';

        // On first headmarker, start everyone in same group
        // Excluding self as this reduces number of lookups to find partner
        if (data.pathOfLightCounter === 1 && data.me !== matches.target)
          data.forsakenGroupB.push(matches.target);

        // If the groups are uneven a tower was missed and it's probably a wipe
        if (data.pathOfLightCounter === 2) {
          // Remove from Group B
          data.forsakenGroupB = data.forsakenGroupB.filter((t) => t !== target);
          if (data.me === matches.target)
            data.isForsakenGroupA = true;
          else
            data.forsakenGroupA.push(matches.target);
        }

        if (id === headMarkerData['stackPath'])
          data.pathOfLightStackPlayers.push(target);
      },
    },
    {
      id: 'DMU P2 Path of Light Towers 1',
      // First Tower:
      // 2 Soak markers
      // 3 Cone markers (same role)
      // 3 Spread markers (same role)
      // If not marked for soak, check role of soak marked players, if matches
      // player, add to output. Player will then know if they need to soak
      // Unfortunately we do not know partners until the first tower is taken
      type: 'HeadMarker',
      netRegex: {
        id: [
          headMarkerData['stackPath'],
          headMarkerData['conePath'],
          headMarkerData['spreadPath'],
        ],
        capture: true,
      },
      condition: (data, matches) => {
        return data.me === matches.target && data.pathOfLightCounter === 1;
      },
      delaySeconds: 0.1, // Delay for party headmarker collect
      durationSeconds: 9,
      infoText: (data, matches, output) => {
        const id = matches.id;
        const marker = forsakenHeadmarkerIdToName[id];
        if (marker === undefined)
          return;
        const num = output.num!({ num: data.pathOfLightCounter });
        const config = data.triggerSetConfig.forsaken;

        if (marker === 'stack') {
          // These players must get a tower
          if (config !== 'none') {
            if (data.role === 'healer' || data.role === 'tank')
              return output.stackOnYouTower!({
                num: num,
                tower: output.leftTower!(),
                marker: output.stackOnYou!(),
              });
            return output.stackOnYouTower!({
              num: num,
              tower: output.rightTower!(),
              marker: output.stackOnYou!(),
            });
          }

          // Assuming no strategy avoids stack soaking tower in first set
          return output.stackOnYouTower!({
            num: num,
            tower: output.tower!(),
            marker: output.stackOnYou!(),
          });
        }

        const stack1 = data.pathOfLightStackPlayers[0] ?? 'unknown';
        const stack2 = data.pathOfLightStackPlayers[1] ?? 'unknown';
        const stack1IsDPS = data.party.isDPS(stack1);
        const stack2IsDPS = data.party.isDPS(stack2);
        const myRoleIsDPS = data.party.isDPS(data.me);

        // If both stack players are the same role, output both players
        // This would be a non-standard composition
        if (myRoleIsDPS === stack1IsDPS && myRoleIsDPS === stack2IsDPS) {
          const players = data.pathOfLightStackPlayers.map(
            (player) => {
              return data.party.member(player);
            },
          );
          const msg = players?.join(', ');
          return output.markerOnYouStacksOnPlayers!({
            num: num,
            marker: output[marker]!(),
            stacks: output.stacksOnPlayers!({ players: msg }),
          });
        }

        // Our partner will be the role that matches us
        // If not, then assuredly the strategy used something like conga line for each role
        const possiblePartner = data.party.member(myRoleIsDPS === stack1IsDPS ? stack1 : stack2);
        return output.markerOnYouStacksOnPlayers!({
          num: num,
          marker: output[marker]!(),
          stacks: output.stackOnPlayer!({ player: possiblePartner }),
        });
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Counter',
      // Used to track which step of the paths we are own
      // 4 Players soak Odd Towers, 4 Players soak Even Towers
      // Headmarkers get applied to those hit ~0.5s after
      type: 'Ability',
      netRegex: { id: 'BABE', source: 'Kefka', capture: false },
      suppressSeconds: 1,
      run: (data) => data.pathOfLightCounter = data.pathOfLightCounter + 1,
    },
    {
      id: 'DMU P2 Path of Light Towers 2',
      // Expecting 2 Cones and 2 Spreads soak towers
      //
      // Headmarkers come out ~2s before Future's/Past's End
      type: 'HeadMarker',
      netRegex: {
        id: [
          headMarkerData['stackPath'],
          headMarkerData['conePath'],
          headMarkerData['spreadPath'],
        ],
        capture: false,
      },
      condition: (data) => data.pathOfLightCounter === 2,
      delaySeconds: 0.1, // Delay for party headmarker collect
      durationSeconds: 9,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const playerHeadmarkers = data.forsakenPlayerHeadmarkers;
        const num = output.num!({ num: data.pathOfLightCounter });
        const marker = playerHeadmarkers[data.me] ?? 'unknown'; // Current headmarker
        const config = data.triggerSetConfig.forsaken;
        const isForsakenGroupA = data.isForsakenGroupA;

        // Modified ABBA and Kroxy-Rinon Baits
        if (
          (!isForsakenGroupA && config === 'kroxy-rinon') ||
          (isForsakenGroupA && config === 'abba')
        ) {
          if (data.role === 'healer')
            return output.baitLeftConeLeftEvens!({
              num: num,
            });
          if (data.role === 'tank')
            return output.baitCloneOppositeTowers!({
              num: num,
            });
          // DPS Unknown party composition
          return output.bait!({
            num: num,
          });
        }

        // ABBA (unmodified) and AAAABBBB, Baits
        if (config === 'bowtie' && !data.isForsakenGroupA) {
          // Group A Avoids Towers (ABBA)
          // Group B Avoids Towers (AAAABBBB)
          return output.mechs!({
            num: num,
            mech1: output.beNear!(),
            mech2: output.avoid!(),
          });
        }

        // If someone has stack from beginning
        if (
          (config !== 'none') &&
          (marker === 'stack' || marker === 'unknown')
        )
          return;

        // Modified ABBA and Kroxy-Rinon Tower Soaks
        if (
          (isForsakenGroupA && config === 'kroxy-rinon') ||
          (!isForsakenGroupA && config === 'abba')
        ) {
          // Spread Players have to be far in the tower, cones need to bait end
          const nearFar = marker === 'spread'
            ? output.beFar!()
            : output.beNear!();
          // Check our previous headmarker
          // Supports Left, DPS Right
          if (data.role === 'healer' || data.role === 'tank') {
            // Support had cone in left tower 1, moves up in tower
            if (data.myPathOfLights[0] === 'cone')
              return output.mechs!({
                num: num,
                mech1: output.tower!(),
                mech2: nearFar,
              });
            // Support with spread on right tower 1 changes to left
            if (data.myPathOfLights[0] === 'spread')
              return output.mechs!({
                num: num,
                mech1: output.swapTowers!(),
                mech2: nearFar,
              });
          }
          if (data.myPathOfLights[0] === 'cone')
            return output.mechs!({
              num: num,
              mech1: output.swapTowers!(),
              mech2: nearFar,
            });
          if (data.myPathOfLights[0] === 'spread')
            return output.mechs!({
              num: num,
              mech1: output.tower!(),
              mech2: nearFar,
            });
        }

        // ABBA (unmodified) and AAAABBBB, Soaks
        if (config === 'bowtie' && isForsakenGroupA) {
          // Tower soakers don't bait ends
          // Group B Soaks Towers (ABBA)
          // Group A Soaks Towers (AAAA)
          const group = data.forsakenGroupA;
          // Partner is whoever has the same marker
          const partner = playerHeadmarkers[group[0] ?? 0] === marker
            ? group[0]
            : playerHeadmarkers[group[1] ?? 0] === marker
            ? group[1]
            : group[2]; // Or unknown matched
          const name = data.party.member(partner);
          if (marker === 'spread')
            return output.mechs3!({
              num: num,
              mech1: output.rightTower!(),
              mech2: output.spreadWithPlayer!({ player: name }),
              mech3: output.outOfHitbox!(),
            });
          if (marker === 'cone')
            return output.mechs3!({
              num: num,
              mech1: output.leftTower!(),
              mech2: output.baitConeFromPlayer!({ player: name }),
              mech3: output.outOfHitbox!(),
            });
        }

        // No strategy selected
        // Many options: Tower, Bait Cone, Share Stack?
        return output.mechsNoStrategy!({
          num: num,
          marker: output[marker]!(),
          mechs: output.towerOrBeNear!({
            tower: output.tower!(),
            near: output.beNear!(),
          }),
        });
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 All Things Ending Baits',
      // Using the following spells for timing:
      // BAD2 Future's End => Need to bait BACD All Things Ending
      // BAD3 Past's End => Need to bait BADD All Things Ending
      // There are four end casts, each 10s apart
      // BAD2 and BAD3 are the castbar, damage doesn't go out until later
      // TODO: Get Tower Locations
      type: 'Ability',
      netRegex: { id: ['BAD2', 'BAD3'], source: 'Kefka', capture: true },
      delaySeconds: 1.2, // Time until headmarker and future/past damage
      alertText: (data, matches, output) => {
        const isFuture = matches.id === 'BAD2';
        if (data.pathOfLightCounter !== 9)
          return isFuture ? output.future!() : output.past!();

        return isFuture
          ? output.lastFuture!({ action: output.behind!() })
          : output.lastPast!({ action: output.stay!() });
      },
      outputStrings: {
        behind: Outputs.getBehind,
        stay: {
          en: 'Stay',
          de: 'Bleib stehen',
          fr: 'Restez',
          cn: '停',
          ko: '대기',
          tc: '停',
        },
        future: {
          en: 'Bait Ending opposite Towers',
        },
        past: {
          en: 'Bait Ending between Towers',
        },
        lastFuture: {
          en: 'Bait Ending => ${action}',
        },
        lastPast: {
          en: 'Bait Ending => ${action}',
        },
      },
    },
    {
      id: 'DMU P2 Path of Light Towers 3',
      // BADC All Things Ending (Future)
      // BADD All Things Ending (Past)
      // Expecting 2 Stacks, 1 Cone, and 1 Spread soak towers
      type: 'StartsUsing',
      netRegex: { id: ['BADC', 'BADD'], source: 'Kefka', capture: false },
      condition: (data) => data.pathOfLightCounter === 3,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        const playerHeadmarkers = data.forsakenPlayerHeadmarkers;
        const num = output.num!({ num: data.pathOfLightCounter });
        const marker = playerHeadmarkers[data.me] ?? 'unknown'; // Current headmarker
        const config = data.triggerSetConfig.forsaken;
        const isForsakenGroupA = data.isForsakenGroupA;

        // Stacks should soak towers
        if (marker === 'stack') {
          if (
            (
              isForsakenGroupA && (config === 'kroxy-rinon' || config === 'bowtie')
            ) ||
            (!isForsakenGroupA && config === 'abba') ||
            (config === 'none')
          ) {
            // Need to know for priority
            const players = data.pathOfLightStackPlayers.map(
              (player) => {
                if (player === data.me)
                  return output.you!();
                return data.party.member(player);
              },
            );
            const msg = players?.join(', ');

            // Assuming none config soaks
            return output.stacksOnPlayersTower!({
              num: num,
              stack: output.stacksOnPlayers!({ players: msg }),
              tower: output.tower!(),
            });
          }
        }

        // Tower soakers, non stack markers
        if (
          (
            isForsakenGroupA && (config === 'kroxy-rinon' || config === 'bowtie')
          ) ||
          (!isForsakenGroupA && config === 'abba')
        ) {
          return output.markerOnYouTower!({
            num: num,
            marker: output[marker]!(),
            tower: marker === 'cone'
              ? output.leftTower!()
              : output.rightTower!(),
          });
        }

        // Baits and Stacks
        if (
          (
            !isForsakenGroupA && (config === 'kroxy-rinon' || config === 'bowtie')
          ) ||
          (isForsakenGroupA && config === 'abba')
        ) {
          // So long as it is standard party composition...
          if (data.role === 'tank')
            return output.leftStack!({
              num: num,
              avoid: output.avoid!(),
            });
          if (data.role === 'healer')
            return output.baitLeftConeOutOdds!({
              num: num,
            });
          // 2 DPS in stack
          return output.rightStack!({
            num: num,
            avoid: output.avoid!(),
          });
        }

        // No strategy selected
        return output.markerOnYouNoStrategy!({
          num: num,
          marker: output[marker]!(),
        });
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Towers 4',
      // This set should not contain stack markers
      // If stacks exist, they came from first set
      // Expecting 2 Cones and 2 Spreads soak towers
      //
      // Headmarkers come out ~2s before Future's/Past's End
      type: 'HeadMarker',
      netRegex: {
        id: [
          headMarkerData['stackPath'],
          headMarkerData['conePath'],
          headMarkerData['spreadPath'],
        ],
        capture: false,
      },
      condition: (data) => data.pathOfLightCounter === 4,
      delaySeconds: 0.1, // Delay for party headmarker collect
      durationSeconds: 9,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const playerHeadmarkers = data.forsakenPlayerHeadmarkers;
        const num = output.num!({ num: data.pathOfLightCounter });
        const marker = playerHeadmarkers[data.me] ?? 'unknown'; // Current headmarker
        const config = data.triggerSetConfig.forsaken;
        const isForsakenGroupA = data.isForsakenGroupA;

        // Baits
        if (
          (isForsakenGroupA && config === 'kroxy-rinon') ||
          (!isForsakenGroupA && config === 'abba')
        ) {
          if (data.role === 'healer')
            return output.baitLeftConeLeftEvens!({
              num: num,
            });
          if (data.role === 'tank')
            return output.baitCloneOppositeTowers!({
              num: num,
            });
          // DPS Unknown party composition
          return output.bait!({
            num: num,
          });
        }

        // AAAABBBB, Baits
        if (config === 'bowtie' && !isForsakenGroupA) {
          // Group B Avoids Towers
          return output.mechs!({
            num: num,
            mech1: output.beNear!(),
            mech2: output.avoid!(),
          });
        }

        // If someone has stack from beginning
        if (
          (config !== 'none') &&
          (marker === 'stack' || marker === 'unknown')
        )
          return;

        // AAAABBBB, Soaks
        if (config === 'bowtie' && isForsakenGroupA) {
          // Tower soakers don't bait ends
          // Group A Soaks Towers
          const group = data.forsakenGroupA;
          // Partner is whoever has the same marker
          const partner = playerHeadmarkers[group[0] ?? 0] === marker
            ? group[0]
            : playerHeadmarkers[group[1] ?? 0] === marker
            ? group[1]
            : group[2]; // Or unknown matched
          const name = data.party.member(partner);
          if (marker === 'spread')
            return output.mechs3!({
              num: num,
              mech1: output.rightTower!(),
              mech2: output.spreadWithPlayer!({ player: name }),
              mech3: output.outOfHitbox!(),
            });
          if (marker === 'cone')
            return output.mechs3!({
              num: num,
              mech1: output.leftTower!(),
              mech2: output.baitConeFromPlayer!({ player: name }),
              mech3: output.outOfHitbox!(),
            });
        }

        // Spread Players have to be far in the tower, cones need to bait end
        const nearFar = marker === 'spread'
          ? output.beFar!()
          : output.beNear!();

        // Tower Soaks
        if (config === 'kroxy-rinon' || config === 'abba') {
          if (data.role === 'healer') {
            return output.mechs3!({
              num: num,
              mech1: output[marker]!(),
              mech2: output.leftTower!(),
              mech3: nearFar,
            });
          }

          const playerHeadmarkers = data.forsakenPlayerHeadmarkers;
          const group = data.forsakenGroupB;
          const member1 = group[0] ?? '';
          const member2 = group[1] ?? '';
          const member3 = group[2] ?? '';
          if (data.role === 'tank') {
            // Need to look at what healer has in relation to us
            // Partner is whoever has the same marker
            const partner = data.party.isHealer(member1)
              ? member1
              : data.party.isHealer(member2)
              ? member2
              : data.party.isHealer(member3)
              ? member3
              : 'unknown';
            // Get partner's marker
            const pMarker = playerHeadmarkers[partner ?? 0];

            // Could not get priority
            if (
              partner === 'unknown' ||
              pMarker === undefined ||
              pMarker === 'unknown'
            )
              return output.mechs3!({
                num: num,
                mech1: output[marker]!(),
                mech2: output.tower!(),
                mech3: nearFar,
              });

            return output.mechs3!({
              num: num,
              mech1: output[marker]!(),
              mech2: pMarker === marker
                ? output.rightTower!()
                : output.leftTower!(),
              mech3: nearFar,
            });
          }

          if (Util.isMeleeDpsJob(data.job)) {
            const isRangedDPS = (
              x: string,
            ): boolean => {
              const jobName = data.party.jobName(x);
              if (jobName === undefined)
                return false;
              return Util.isRangedDpsJob(jobName) || Util.isCasterDpsJob(jobName);
            };
            // Partner should be a ranged dps, for standard comp
            const partner = isRangedDPS(member1)
              ? member1
              : isRangedDPS(member2)
              ? member2
              : isRangedDPS(member3)
              ? member3
              : 'unknown';
            // Get partner's marker
            const pMarker = playerHeadmarkers[partner ?? 0];

            // Could not find caster or phys ranged partner
            if (
              partner === 'unknown' ||
              pMarker === undefined ||
              pMarker === 'unknown'
            )
              return output.mechs3!({
                num: num,
                mech1: output[marker]!(),
                mech2: output.tower!(),
                mech3: nearFar,
              });

            return output.mechs3!({
              num: num,
              mech1: output[marker]!(),
              mech2: pMarker === marker
                ? output.leftTower!()
                : output.rightTower!(),
              mech3: nearFar,
            });
          }

          // If we find a melee in our group we are the ranged priority
          // Partner should be a melee dps, for optimal comp
          const isMeleeDPS = (
            x: string,
          ): boolean => {
            const jobName = data.party.jobName(x);
            if (jobName === undefined)
              return false;
            return Util.isMeleeDpsJob(jobName);
          };
          const partner = isMeleeDPS(member1)
            ? member1
            : isMeleeDPS(member2)
            ? member2
            : isMeleeDPS(member3)
            ? member3
            : 'unknown';
          // Get partner's marker
          const pMarker = playerHeadmarkers[partner ?? 0];

          // Could not find melee dps
          if (
            partner === 'unknown' ||
            pMarker === undefined ||
            pMarker === 'unknown'
          )
            return output.mechs3!({
              num: num,
              mech1: output[marker]!(),
              mech2: output.tower!(),
              mech3: nearFar,
            });

          // Highest priority right
          return output.mechs3!({
            num: num,
            mech1: output[marker]!(),
            mech2: output.rightTower!(),
            mech3: nearFar,
          });
        }

        // No strategy selected
        // Many options: Tower, Bait Cone, Share Stack?
        return output.mechsNoStrategy!({
          num: num,
          marker: output[marker]!(),
          mechs: output.towerOrBeNear!({
            tower: output.tower!(),
            near: output.beNear!(),
          }),
        });
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Towers 5',
      // BADC All Things Ending (Future)
      // BADD All Things Ending (Past)
      // Expecting 2 Stacks, 1 Cone, and 1 Spread soak towers
      // However, AAAABBBB has 2 Cones and 2 Spreads soak towers
      type: 'StartsUsing',
      netRegex: { id: ['BADC', 'BADD'], source: 'Kefka', capture: false },
      condition: (data) => data.pathOfLightCounter === 5,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        const playerHeadmarkers = data.forsakenPlayerHeadmarkers;
        const num = output.num!({ num: data.pathOfLightCounter });
        const marker = playerHeadmarkers[data.me] ?? 'unknown'; // Current headmarker
        const config = data.triggerSetConfig.forsaken;
        const isForsakenGroupA = data.isForsakenGroupA;

        // Baits and Stacks
        if (
          (isForsakenGroupA && config === 'kroxy-rinon') ||
          (!isForsakenGroupA && config === 'abba')
        ) {
          // So long as it is standard party composition...
          if (data.role === 'tank')
            return output.leftStack!({
              num: num,
              avoid: output.avoid!(),
            });
          if (data.role === 'healer')
            return output.baitLeftConeOutOdds!({
              num: num,
            });
          return output.rightStack!({
            num: num,
            avoid: output.avoid!(),
          });
        }

        if (config === 'bowtie') {
          // Bowtie has  people bait cones, but cones could bait eachother if they wanted
          if (!isForsakenGroupA) {
            return output.markerOnYouTower!({
              num: num,
              marker: output[marker]!(),
              tower: marker === 'cone'
                ? output.leftTower!()
                : output.rightTower!(),
            });
          }
          if (data.role === 'tank')
            return output.baitLeftConeLeftBowtie!({
              num: num,
            });
          if (data.role === 'healer')
            return output.baitLeftConeOutBowtie!({
              num: num,
            });
          return output.getHitBySpreadRightBowtie!({
            num: num,
          });
        }

        // Tower Soaks
        // In AAAABBBB, there is no stack
        if (marker === 'stack') {
          // Need to know for priority
          const players = data.pathOfLightStackPlayers.map(
            (player) => {
              if (player === data.me)
                return output.you!();
              return data.party.member(player);
            },
          );
          const msg = players?.join(', ');

          // Assuming none config soaks
          return output.stacksOnPlayersTower!({
            num: num,
            stack: output.stacksOnPlayers!({ players: msg }),
            tower: output.tower!(),
          });
        }

        // This ends up being Group B || Group A for respective config
        if (config === 'kroxy-rinon' || config === 'abba') {
          return output.markerOnYouTower!({
            num: num,
            marker: output[marker]!(),
            tower: marker === 'cone'
              ? output.leftTower!()
              : output.rightTower!(),
          });
        }

        // No strategy
        if (marker === 'unknown')
          return output.baitConeOrStackNoStrategy!({
            num: num,
          });
        return output.markerOnYouNoStrategy!({
          num: num,
          marker: output[marker]!(),
        });
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Towers 6',
      // Expecting 2 Cones and 2 Spreads soak towers
      //
      // Headmarkers come out ~2s before Future's/Past's End
      type: 'HeadMarker',
      netRegex: {
        id: [
          headMarkerData['stackPath'],
          headMarkerData['conePath'],
          headMarkerData['spreadPath'],
        ],
        capture: false,
      },
      condition: (data) => data.pathOfLightCounter === 6,
      delaySeconds: 0.1, // Delay for party headmarker collect
      durationSeconds: 9,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const playerHeadmarkers = data.forsakenPlayerHeadmarkers;
        const num = output.num!({ num: data.pathOfLightCounter });
        const marker = playerHeadmarkers[data.me] ?? 'unknown'; // Current headmarker
        const config = data.triggerSetConfig.forsaken;
        const isForsakenGroupA = data.isForsakenGroupA;

        // Baits
        if (
          isForsakenGroupA &&
          (config === 'kroxy-rinon' || config === 'abba')
        ) {
          if (data.role === 'healer')
            return output.baitLeftConeLeftEvens!({
              num: num,
            });
          if (data.role === 'tank')
            return output.baitCloneOppositeTowers!({
              num: num,
            });
          // DPS Unknown party composition
          return output.bait!({
            num: num,
          });
        }

        if (config === 'bowtie') {
          // Group A Baits Ends
          if (isForsakenGroupA)
            return output.numBeNearSpreadBowtie!({
              num: num,
              near: output.beNear!(),
              spread: output.spreadBowtie!(),
            });

          // Tower soakers don't bait ends
          // Group B Soaks Towers
          const group = data.forsakenGroupB;
          // Partner is whoever has the same marker
          const partner = playerHeadmarkers[group[0] ?? 0] === marker
            ? group[0]
            : playerHeadmarkers[group[1] ?? 0] === marker
            ? group[1]
            : group[2]; // Or unknown matched
          const name = data.party.member(partner);
          if (marker === 'spread')
            return output.mechs3!({
              num: num,
              mech1: output.rightTower!(),
              mech2: output.spreadWithPlayer!({ player: name }),
              mech3: output.outOfHitbox!(),
            });
          if (marker === 'cone')
            return output.mechs3!({
              num: num,
              mech1: output.leftTower!(),
              mech2: output.baitConeFromPlayer!({ player: name }),
              mech3: output.outOfHitbox!(),
            });
        }

        // Spread Players have to be far in the tower, cones need to bait end
        const nearFar = marker === 'spread'
          ? output.beFar!()
          : output.beNear!();

        // Group B
        if (config === 'kroxy-rinon' || config === 'abba') {
          return output.mechs!({
            num: num,
            mech1: data.role === 'tank' || Util.isMeleeDpsJob(data.job)
              ? output.rightTower!()
              : output.leftTower!(),
            mech2: nearFar,
          });
        }

        // No strategy selected
        // Many options: Tower, Bait Cone, Share Stack?
        if (marker === 'unknown')
          return output.baitNoStrategy!({
            num: num,
          });
        return output.mechsNoStrategy!({
          num: num,
          marker: output[marker]!(),
          mechs: output.towerOrBeNear!({
            tower: output.tower!(),
            near: output.beNear!(),
          }),
        });
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Towers 7',
      // BADC All Things Ending (Future)
      // BADD All Things Ending (Past)
      // Expecting 2 Stacks, 1 Cone, and 1 Spread soak towers
      type: 'StartsUsing',
      netRegex: { id: ['BADC', 'BADD'], source: 'Kefka', capture: false },
      condition: (data) => data.pathOfLightCounter === 7,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        const playerHeadmarkers = data.forsakenPlayerHeadmarkers;
        const num = output.num!({ num: data.pathOfLightCounter });
        const marker = playerHeadmarkers[data.me] ?? 'unknown'; // Current headmarker
        const config = data.triggerSetConfig.forsaken;

        // Baits and Stacks
        if (data.isForsakenGroupA && config !== 'none') {
          // So long as it is standard party composition...
          if (data.role === 'tank')
            return output.leftStack!({
              num: num,
              avoid: output.avoid!(),
            });
          if (data.role === 'healer')
            return output.baitLeftConeOutOdds!({
              num: num,
            });
          return output.rightStack!({
            num: num,
            avoid: output.avoid!(),
          });
        }

        // Tower soaks
        if (marker === 'stack') {
          // Need to know for priority
          const players = data.pathOfLightStackPlayers.map(
            (player) => {
              if (player === data.me)
                return output.you!();
              return data.party.member(player);
            },
          );
          const msg = players?.join(', ');

          // Assuming none config soaks
          return output.stacksOnPlayersTower!({
            num: num,
            stack: output.stacksOnPlayers!({ players: msg }),
            tower: output.tower!(),
          });
        }

        // Cone/Stack Tower Soaks
        // Group B
        if (config !== 'none')
          return output.markerOnYouTower!({
            num: num,
            marker: output[marker]!(),
            tower: marker === 'cone'
              ? output.leftTower!()
              : output.rightTower!(),
          });

        // No strategy
        if (marker === 'unknown')
          return output.baitConeOrStackNoStrategy!({
            num: num,
          });
        return output.markerOnYouNoStrategy!({
          num: num,
          marker: output[marker]!(),
        });
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Towers 8',
      // Shouldn't be new headmarkers from previous towers
      // This set should not contain stack markers
      // Expecting 2 Cones and 2 Spreads soak towers
      // However AAAABBBB will have 4 Stacks soak towers
      //
      // Track based on tower soak or fail
      // BABF The River of Light
      // BAC0 Spelldriver
      // BAC1 Spellscatter
      // BAC2 Spellwave
      type: 'Ability',
      netRegex: {
        id: ['BABF', 'BAC0', 'BAC1', 'BAC2'],
        source: 'Kefka',
        capture: false,
      },
      condition: (data) => data.pathOfLightCounter === 8,
      delaySeconds: 0.1, // Delay for party headmarker collect
      durationSeconds: 9,
      suppressSeconds: 9999,
      infoText: (data, _matches, output) => {
        const playerHeadmarkers = data.forsakenPlayerHeadmarkers;
        const num = output.num!({ num: data.pathOfLightCounter });
        const marker = playerHeadmarkers[data.me] ?? 'unknown'; // Current headmarker
        const config = data.triggerSetConfig.forsaken;

        if (data.isForsakenGroupA) {
          // Tower Soaks for ABBABBA and AAABBBBA
          if (config === 'kroxy-rinon' || config === 'abba') {
            // This means player from A accidentally took tower previously
            if (marker === 'stack' || marker === 'unknown')
              return;

            // Spread Players have to be far in the tower, cones need to bait end
            const nearFar = marker === 'spread'
              ? output.beFar!()
              : output.beNear!();

            if (data.role === 'healer') {
              return output.mechs3!({
                num: num,
                mech1: output[marker]!(),
                mech2: output.leftTower!(),
                mech3: nearFar,
              });
            }

            const playerHeadmarkers = data.forsakenPlayerHeadmarkers;
            const group = data.forsakenGroupA;
            const member1 = group[0] ?? '';
            const member2 = group[1] ?? '';
            const member3 = group[2] ?? '';
            if (data.role === 'tank') {
              // Need to look at what healer has in relation to us
              // Partner is whoever has the same marker
              const partner = data.party.isHealer(member1)
                ? member1
                : data.party.isHealer(member2)
                ? member2
                : data.party.isHealer(member3)
                ? member3
                : 'unknown';
              // Get partner's marker
              const pMarker = playerHeadmarkers[partner ?? 0];

              // Could not get priority
              if (
                partner === 'unknown' ||
                pMarker === undefined ||
                pMarker === 'unknown'
              )
                return output.mechs3!({
                  num: num,
                  mech1: output[marker]!(),
                  mech2: output.tower!(),
                  mech3: nearFar,
                });

              return output.mechs3!({
                num: num,
                mech1: output[marker]!(),
                mech2: pMarker === marker
                  ? output.rightTower!()
                  : output.leftTower!(),
                mech3: nearFar,
              });
            }

            if (Util.isMeleeDpsJob(data.job)) {
              const isRangedDPS = (
                x: string,
              ): boolean => {
                const jobName = data.party.jobName(x);
                if (jobName === undefined)
                  return false;
                return Util.isRangedDpsJob(jobName) || Util.isCasterDpsJob(jobName);
              };
              // Partner should be a ranged dps, for standard comp
              const partner = isRangedDPS(member1)
                ? member1
                : isRangedDPS(member2)
                ? member2
                : isRangedDPS(member3)
                ? member3
                : 'unknown';
              // Get partner's marker
              const pMarker = playerHeadmarkers[partner ?? 0];

              // Could not find caster or phys ranged partner
              if (
                partner === 'unknown' ||
                pMarker === undefined ||
                pMarker === 'unknown'
              )
                return output.mechs3!({
                  num: num,
                  mech1: output[marker]!(),
                  mech2: output.tower!(),
                  mech3: nearFar,
                });

              return output.mechs3!({
                num: num,
                mech1: output[marker]!(),
                mech2: pMarker === marker
                  ? output.leftTower!()
                  : output.rightTower!(),
                mech3: nearFar,
              });
            }

            // If we find a melee in our group we are the ranged priority
            // Partner should be a melee dps, for optimal comp
            const isMeleeDPS = (
              x: string,
            ): boolean => {
              const jobName = data.party.jobName(x);
              if (jobName === undefined)
                return false;
              return Util.isMeleeDpsJob(jobName);
            };
            const partner = isMeleeDPS(member1)
              ? member1
              : isMeleeDPS(member2)
              ? member2
              : isMeleeDPS(member3)
              ? member3
              : 'unknown';
            // Get partner's marker
            const pMarker = playerHeadmarkers[partner ?? 0];

            // Could not find melee dps
            if (
              partner === 'unknown' ||
              pMarker === undefined ||
              pMarker === 'unknown'
            )
              return output.mechs3!({
                num: num,
                mech1: output[marker]!(),
                mech2: output.tower!(),
                mech3: nearFar,
              });

            // Highest priority right
            return output.mechs3!({
              num: num,
              mech1: output[marker]!(),
              mech2: output.rightTower!(),
              mech3: nearFar,
            });
          }

          // End Baits for AAAABBBB
          if (config === 'bowtie')
            return output.numBeNearSpreadBowtie!({
              num: num,
              near: output.beNear!(),
              spread: output.spreadBowtie!(),
            });
        }

        // Baits for ABBAABBA and AAABBBBA
        if (config === 'kroxy-rinon' || config === 'abba') {
          if (data.role === 'healer')
            return output.baitLeftConeLeftEvens!({
              num: num,
            });
          if (data.role === 'tank')
            return output.baitCloneOppositeTowers!({
              num: num,
            });
          return output.bait!({
            num: num,
          });
        }
        if (config === 'bowtie') {
          // Each person in Group B will have a stack marker
          if (data.role === 'healer' || data.role === 'tank')
            return output.spreadTowersBowtie!({
              num: num,
              tower: output.leftTower!(),
              spread: output.spreadBowtie!(),
            });
          return output.spreadTowersBowtie!({
            num: num,
            tower: output.rightTower!(),
            spread: output.spreadBowtie!(),
          });
        }

        // No strategy selected
        // Many options: Tower, Bait Cone, Share Stack?
        if (marker === 'unknown')
          return output.baitNoStrategy!({
            num: num,
          });
        return output.mechsNoStrategy!({
          num: num,
          marker: output[marker]!(),
          mechs: output.towerOrBeNear!({
            tower: output.tower!(),
            near: output.beNear!(),
          }),
        });
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Tower 8 AAAABBBB Special',
      // BAD2 Future's End or BAD3 Past's End will go off same time as 4 players
      // take a 3-person stack solo
      // For some reason the phase is coded such that the 7th tower will give 4 stacks
      // under this scenario
      type: 'StartsUsing',
      netRegex: { id: ['BAD2', 'BAD3'], source: 'Kefka', capture: true },
      condition: (data) => {
        return data.role === 'tank' && data.pathOfLightCounter === 8 &&
          data.triggerSetConfig.forsaken === 'bowtie';
      },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 3, // 6.4s castTime, this is 4s before damage
      alarmText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'TANK LB!!',
          de: 'TANK LB!!',
          fr: 'LB TANK !!',
          ja: 'タンクLB!!',
          cn: '坦克LB!!',
          ko: '탱리밋!!',
          tc: '坦克LB!!',
        },
      },
    },
    {
      id: 'DMU P2 Light of Judgment',
      type: 'StartsUsing',
      netRegex: { id: 'BABD', source: 'Kefka', capture: false },
      response: Responses.bigAoe('alert'),
    },
    {
      id: 'DMU P2 Single Wing of Destruction',
      // BACD Wings of Destruction, Left wing highlight
      // BACE Wingso of Desctruction, Right wing highlight
      // Halfroom cleaves
      type: 'StartsUsing',
      netRegex: { id: ['BACD', 'BACE'], source: 'Kefka', capture: true },
      infoText: (_data, matches, output) => {
        if (matches.id === 'BACD')
          return output.right!();
        return output.left!();
      },
      outputStrings: {
        right: Outputs.right,
        left: Outputs.left,
      },
    },
    {
      id: 'DMU P2 Wings of Destruction',
      type: 'StartsUsing',
      netRegex: { id: 'C487', source: 'Kefka', capture: false },
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          maxMeleeAvoidTanks: {
            en: 'Max Melee: Avoid Tanks',
            de: 'Max Nahkampf: Weg von den Tanks',
            fr: 'Max mêlée : éloignez-vous des tanks',
            ja: '近接最大レンジ タンクから離れる',
            cn: '最大近战距离，避开坦克',
            ko: '칼끝딜: 탱커 피하기',
            tc: '最大近戰距離，避開坦克',
          },
          wingsBeNearFar: {
            en: 'Wings: Be Near/Far',
            de: 'Schwingen: Nah/Fern',
            fr: 'Ailes : Placez-vous près/loin',
            ja: '翼: めり込む/離れる',
            cn: '双翅膀：近或远',
            ko: '양날개: 가까이/멀리',
            tc: '雙翅膀：近或遠',
          },
        };
        if (data.role === 'tank')
          return { alertText: output.wingsBeNearFar!() };
        return { infoText: output.maxMeleeAvoidTanks!() };
      },
    },
    {
      id: 'DMU P2 Aero III Assault',
      // Knockback from boss that can't be resisted
      // Applies 306 Down for the Count
      type: 'StartsUsing',
      netRegex: { id: 'C3F7', source: 'Kefka', capture: false },
      response: Responses.getUnder('alert'),
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Future\'s End/Past\'s End': 'Future/Past\'s End',
        'Spelldriver/Spellscatter/Spellwave': 'Spelldriver/scatter/wave',
      },
    },
  ],
};

export default triggerSet;
