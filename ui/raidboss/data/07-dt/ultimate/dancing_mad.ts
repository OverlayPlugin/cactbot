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

export interface Data extends RaidbossData {
  readonly triggerSetConfig: {
    teleportent: 'clockwise' | 'filipino' | 'none';
    forsaken: 'kroxy-rinon' | 'none';
  };
  // General
  phase: Phase | 'unknown';
  // Phase 2
  pathOfLightCounter: number;
  pathOfLightStackPlayers: string[];
  pathOfLightConePlayers: string[];
  pathOfLightSpreadPlayers: string[];
  myPathOfLights: string[];
}

const headMarkerData = {
  // Phase 2
  'sharedBuster': '0103', // Ultimate Embrace shared tankbuster
  'stackPath': '02CB', // When standing in Path of Light tower, causes BAC0 Spelldriver (3-person stack)
  'conePath': '02CD', // When standing in Path of Light tower, causes BAC2 Spellwave (cone targetting nearest player)
  'spreadPath': '02CC', // When standing in Path of Light tower, causes BAC1 Spellscatter (small aoe on the player)
} as const;

const forsakenOutputStrings: OutputStrings = {
  tower: Outputs.getTowers,
  stackOnYou: Outputs.stackOnYou,
  you: {
    en: 'YOU',
  },
  swapTowers: {
    en: 'Swap Towers',
  },
  leftTower: {
    en: 'Left Tower',
  },
  rightTower: {
    en: 'Right Tower',
  },
  groupBTowers: {
    en: 'Group B Towers',
  },
  cone: {
    en: 'Cone on YOU',
  },
  spread: {
    en: 'AOE on YOU',
  },
  stackOnYouTower: {
    en: '${tower} + ${marker}',
  },
  stackOnPlayer: {
    en: 'Stack is on ${player}',
  },
  stacksOnPlayers: {
    en: 'Stacks on ${players}',
  },
  markerOnYouStacksOnPlayers: {
    en: '${marker} + ${stacks}',
  },
  markerOnYouTower: {
    en: '${marker} + ${tower}',
  },
  leftStack: {
    en: 'Left Stack/Cone',
  },
  rightStack: {
    en: 'Right Stack',
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
  mechs: {
    en: '${mech1} + ${mech2}',
  },
  bait: {
    en: 'Bait cone Left/Right or clone far',
  },
};

const triggerSet: TriggerSet<Data> = {
  id: 'DancingMadUltimate',
  zoneId: ZoneId.DancingMadUltimate,
  config: [
    {
      id: 'forsaken',
      comment: {
        en:
          `Kroxy-Rinon 3/4/1: <a href="https://pastebin.com/7fs57PyQ" target="_blank">Kefka Bin</a>`,
      },
      name: {
        en: 'P2 Forsaken Strategy',
      },
      type: 'select',
      options: {
        en: {
          'Group soak order: AAABBBBA. Cones + Support Stack Left and Spread + DPS Stack Right, relative towers to facing in.':
            'kroxy-rinon',
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
      pathOfLightConePlayers: [],
      pathOfLightSpreadPlayers: [],
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
      id: 'DMU P2 Path of Light Headmarker Tracker',
      // When standing in Path of Light tower, causes BAC0 Spelldriver (3-person stack)
      // When standing in Path of Light tower, causes BAC2 Spellwave (cone targetting nearest player)
      // When standing in Path of Light tower, causes BAC1 Spellscatter (small aoe on the player)
      // Headmarkers update ~2.5s prior to 13DB Spell's Trouble debuff count decrementing
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
        type markerMap = {
          [key: string]: string;
        };
        const markers: markerMap = {
          '02CB': 'stack',
          '02CD': 'cone',
          '02CC': 'spread',
        };

        // Storing self for simple lookups later
        // This can also be used to track how many towers have been soaked
        // and what was soaked before to handle who baits where on evens
        if (data.me === target)
          data.myPathOfLights.push(markers[id] ?? 'unknown');

        // Clear previous Headmarker if set
        data.pathOfLightStackPlayers = data.pathOfLightStackPlayers.filter((t) => t !== target);
        data.pathOfLightConePlayers = data.pathOfLightConePlayers.filter((t) => t !== target);
        data.pathOfLightSpreadPlayers = data.pathOfLightSpreadPlayers.filter((t) => t !== target);

        if (id === headMarkerData['stackPath'])
          data.pathOfLightStackPlayers.push(target);
        else if (id === headMarkerData['conePath'])
          data.pathOfLightConePlayers.push(target);
        else
          data.pathOfLightSpreadPlayers.push(target);
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
        type markerMap = {
          [key: string]: 'stack' | 'cone' | 'spread';
        };
        const markers: markerMap = {
          '02CB': 'stack',
          '02CD': 'cone',
          '02CC': 'spread',
        };
        const marker = markers[id];
        if (marker === undefined)
          return;

        if (marker === 'stack') {
          if (data.triggerSetConfig.forsaken === 'kroxy-rinon') {
            if (data.role === 'healer' || data.role === 'tank')
              return output.stackOnYouTower!({
                tower: output.leftTower!(),
                marker: output.stackOnYou!(),
              });
            return output.stackOnYouTower!({
              tower: output.rightTower!(),
              marker: output.stackOnYou!(),
            });
          }
          return output.stackOnYouTower!({
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
        if (myRoleIsDPS === stack1IsDPS && myRoleIsDPS === stack2IsDPS) {
          const players = data.pathOfLightStackPlayers.map(
            (player) => {
              return data.party.member(player);
            },
          );
          const msg = players?.join(', ');
          return output.markerOnYouStacksOnPlayers!({
            marker: output[marker]!(),
            stacks: output.stacksOnPlayers!({ players: msg }),
          });
        }

        // Our partner will be the role that matches us
        const possiblePartner = data.party.member(myRoleIsDPS === stack1IsDPS ? stack1 : stack2);
        return output.markerOnYouStacksOnPlayers!({
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
      // This set should not contain stack markers
      // If stacks exist, they came from first set
      // 2 Cones and 2 Spreads will soak towers
      //
      // Headmarkers come out ~2s before Future's/Past's End
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
        return data.me === matches.target && data.pathOfLightCounter === 2;
      },
      delaySeconds: 0.1, // Delay for party headmarker collect
      durationSeconds: 9,
      infoText: (data, matches, output) => {
        const id = matches.id;
        type markerMap = {
          [key: string]: 'stack' | 'cone' | 'spread';
        };
        const markers: markerMap = {
          '02CB': 'stack',
          '02CD': 'cone',
          '02CC': 'spread',
        };
        const marker = markers[id];
        if (marker === undefined)
          return;

        // Stack shouldn't be possible here
        if (marker === 'stack' || data.myPathOfLights[1] === undefined)
          return;

        // Spread Players have to be far in the tower, cones need to bait end
        const nearFar = data.myPathOfLights[1] === 'spread'
          ? output.beFar!()
          : output.beNear!();

        if (data.triggerSetConfig.forsaken === 'kroxy-rinon') {
          // Check our previous headmarker
          // Supports Left, DPS Right
          if (data.role === 'healer' || data.role === 'tank') {
            // Support had cone in left tower 1, moves up in tower
            if (data.myPathOfLights[0] === 'cone')
              return output.mechs!({
                mech1: output.tower!(),
                mech2: nearFar,
              });
            // Support with spread on right tower 1 changes to left
            if (data.myPathOfLights[0] === 'spread')
              return output.mechs!({
                mech1: output.swapTowers!(),
                mech2: nearFar,
              });
          }
          if (data.myPathOfLights[0] === 'cone')
            return output.mechs!({
              mech1: output.swapTowers!(),
              mech2: nearFar,
            });
          if (data.myPathOfLights[0] === 'spread')
            return output.mechs!({
              mech1: output.tower!(),
              mech2: nearFar,
            });
        }

        // No strategy just say the cone/spread difference
        return output.mechs!({
          mech1: output.tower!(),
          mech2: nearFar,
        });
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Towers 2 Baits',
      // Players that still have the first headmarker
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
        // Ignoring stack players that didn't soak tower 1
        if (data.myPathOfLights.length !== 1 || data.myPathOfLights[0] === 'stack')
          return;

        return output.bait!();
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
      alertText: (_data, matches, output) => {
        return matches.id === 'BAD2' ? output.future!() : output.past!();
      },
      outputStrings: {
        future: {
          en: 'Bait Ending opposite Towers',
        },
        past: {
          en: 'Bait Ending between Towers',
        },
      },
    },
    {
      id: 'DMU P2 Path of Light Towers 3',
      // BADC All Things Ending (Future)
      // BADD All Things Ending (Past)
      // There should be two stacks, a cone and an aoe
      type: 'StartsUsing',
      netRegex: { id: ['BADC', 'BADD'], source: 'Kefka', capture: false },
      condition: (data) => data.pathOfLightCounter === 3,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        // Tower soak group A will be at 3
        if (data.myPathOfLights.length === 3) {
          const marker = data.myPathOfLights[2] ?? 'unknown';
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
            return output.markerOnYouTower!({
              marker: output.stacksOnPlayers!({ players: msg }),
              tower: output.tower!(),
            });
          }

          if (data.triggerSetConfig.forsaken === 'kroxy-rinon') {
            return output.markerOnYouTower!({
              marker: output[marker]!(),
              tower: marker === 'cone'
                ? output.leftTower!()
                : output.rightTower!(),
            });
          }
          return output.markerOnYouTower!({
            marker: output[marker]!(),
            tower: output.tower!(),
          });
        }

        // No tower has been soaked
        if (data.myPathOfLights.length === 1) {
          if (data.role === 'healer' || data.role === 'tank')
            return output.leftStack!();
          return output.rightStack!();
        }
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Towers 4',
      // This set should not contain stack markers
      // If stacks exist, they came from first set
      // 2 Cones and 2 Spreads will soak towers
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
        // Handle second group's first towers
        if (data.myPathOfLights.length === 1) {
          const marker = data.myPathOfLights[0];
          // If someone has stack from beginning
          if (marker === 'stack' || marker === 'unknown')
            return;

          // Spread Players have to be far in the tower, cones need to bait end
          const nearFar = data.myPathOfLights[1] === 'spread'
            ? output.beFar!()
            : output.beNear!();

          if (data.triggerSetConfig.forsaken === 'kroxy-rinon') {
            return output.mechs!({
              mech1: data.role === 'tank' || Util.isMeleeDpsJob(data.job)
                ? output.rightTower!()
                : output.leftTower!(),
              mech2: nearFar,
            });
          }

          return output.mechs!({
            mech1: output.tower!(),
            mech2: nearFar,
          });
        }

        // Group A
        return output.bait!();
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Towers 5',
      // BADC All Things Ending (Future)
      // BADD All Things Ending (Past)
      // There should be two stacks, a cone and an aoe
      type: 'StartsUsing',
      netRegex: { id: ['BADC', 'BADD'], source: 'Kefka', capture: false },
      condition: (data) => data.pathOfLightCounter === 5,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        // Tower soak group B will be at 2
        if (data.myPathOfLights.length === 2) {
          const marker = data.myPathOfLights[1] ?? 'unknown';
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
            return output.markerOnYouTower!({
              marker: output.stacksOnPlayers!({ players: msg }),
              tower: output.tower!(),
            });
          }

          if (data.triggerSetConfig.forsaken === 'kroxy-rinon') {
            return output.markerOnYouTower!({
              marker: output[marker]!(),
              tower: marker === 'cone'
                ? output.leftTower!()
                : output.rightTower!(),
            });
          }
          return output.markerOnYouTower!({
            marker: output[marker]!(),
            tower: output.tower!(),
          });
        }

        // Players that have soaked 3 towers
        if (data.myPathOfLights.length === 4) {
          if (data.role === 'healer' || data.role === 'tank')
            return output.leftStack!();
          return output.rightStack!();
        }
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Towers 6',
      // This set should not contain stack markers
      // If stacks exist, they came from first set
      // 2 Cones and 2 Spreads will soak towers
      //
      // Headmarkers come out ~2s before Future's/Past's End
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
        return data.me === matches.target && data.pathOfLightCounter === 6;
      },
      delaySeconds: 0.1, // Delay for party headmarker collect
      durationSeconds: 9,
      infoText: (data, matches, output) => {
        // If a player from Group A accidentally soaks
        if (data.myPathOfLights.length !== 3)
          return;
        const id = matches.id;
        type markerMap = {
          [key: string]: 'stack' | 'cone' | 'spread';
        };
        const markers: markerMap = {
          '02CB': 'stack',
          '02CD': 'cone',
          '02CC': 'spread',
        };
        const marker = markers[id];
        if (marker === undefined)
          return;

        // Unsure that this could happen, unless more than 4 players soaked?
        if (marker === 'stack')
          return;

        if (marker === 'cone')
          return output.mechs!({
            mech1: output.tower!(),
            mech2: output.beNear!(),
          });
        if (marker === 'spread')
          return output.mechs!({
            mech1: output.tower!(),
            mech2: output.beFar!(),
          });
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Towers 6 Baits',
      // Players that still have the first headmarker
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
        if (data.myPathOfLights.length !== 4)
          return;

        return output.bait!();
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Towers 7',
      // This set should not contain stack markers
      // If stacks exist, they came from first set
      // There should be two stacks, a cone and an aoe
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
      condition: (data) => data.pathOfLightCounter === 7,
      delaySeconds: 0.1, // Delay for party headmarker collect
      durationSeconds: 9,
      infoText: (data, _matches, output) => {
        // Both groups will be on their last soak
        // Group B will have two stacks
        const marker = data.myPathOfLights[4] ?? 'unknown';
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
          return output.markerOnYouTower!({
            marker: output.stacksOnPlayers!({ players: msg }),
            tower: output.tower!(),
          });
        }
        return output.groupBTowers!();
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Towers 8',
      // This set should not contain stack markers
      // If stacks exist, they came from first set
      // 2 Cones and 2 Spreads will soak towers
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
      condition: (data) => data.pathOfLightCounter === 8,
      delaySeconds: 0.1, // Delay for party headmarker collect
      durationSeconds: 9,
      infoText: (data, _matches, output) => {
        // Handle first group's last towers
        if (data.myPathOfLights.length === 4) {
          const marker = data.myPathOfLights[3];

          if (marker === 'stack' || marker === 'unknown')
            return;

          if (data.triggerSetConfig.forsaken === 'kroxy-rinon') {
            const tower = data.role === 'tank' || Util.isMeleeDpsJob(data.job)
              ? 'rightTower'
              : 'leftTower';
            if (marker === 'cone')
              return output.mechs!({
                mech1: output[tower]!(),
                mech2: output.beNear!(),
              });
            if (marker === 'spread')
              return output.mechs!({
                mech1: output[tower]!(),
                mech2: output.beFar!(),
              });
          }
          if (marker === 'cone')
            return output.mechs!({
              mech1: output.tower!(),
              mech2: output.beNear!(),
            });
          if (marker === 'spread')
            return output.mechs!({
              mech1: output.tower!(),
              mech2: output.beFar!(),
            });
        }
        return output.bait!();
      },
      outputStrings: forsakenOutputStrings,
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
      },
    },
  ],
};

export default triggerSet;
