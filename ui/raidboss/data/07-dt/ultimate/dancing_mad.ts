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
  isForsakenGroupA: boolean;
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
  avoid: {
    en: 'Avoid towers',
    de: 'Türme vermeiden',
    fr: 'Évitez les tours',
    ja: '塔回避',
    cn: '远离塔',
    ko: '기둥 피하기',
    tc: '遠離塔',
  },
  stackOnYou: Outputs.stackOnYou,
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
  swapTowers: {
    en: '${num}Swap Towers',
  },
  leftTower: {
    en: '${num}Left Tower',
  },
  rightTower: {
    en: '${num}Right Tower',
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
    en: '${num}${marker} + ${stacks}',
  },
  markerOnYouTower: {
    en: '${num}${marker} + ${tower}',
  },
  baitLeftConeOutOdds: {
    en: '${num}Bait Left Cone Out',
  },
  baitLeftConeEvens: {
    en: '${num}Bait Left Cone Left',
  },
  leftStack: {
    en: '${num}Left Stack + ${avoid}',
  },
  rightStack: {
    en: '${num}Right Stack + ${avoid}',
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
    en: '${num}${mech1} + ${mech2}',
  },
  bait: {
    en: '${num}Bait Cone Right or Clone Far',
  },
  baitCloneFar: {
    en: '${num}Bait Clone Far',
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
      isForsakenGroupA: false,
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

        // To track "groups"
        if (data.pathOfLightCounter === 2 && data.me === matches.target)
          data.isForsakenGroupA = true;

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
        const num = data.pathOfLightCounter;

        if (marker === 'stack') {
          if (data.triggerSetConfig.forsaken === 'kroxy-rinon') {
            if (data.role === 'healer' || data.role === 'tank')
              return output.stackOnYouTower!({
                num: output.num!({ num: num }),
                tower: output.leftTower!(),
                marker: output.stackOnYou!(),
              });
            return output.stackOnYouTower!({
              num: output.num!({ num: num }),
              tower: output.rightTower!(),
              marker: output.stackOnYou!(),
            });
          }
          return output.stackOnYouTower!({
            num: output.num!({ num: num }),
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
            num: output.num!({ num: num }),
            marker: output[marker]!(),
            stacks: output.stacksOnPlayers!({ players: msg }),
          });
        }

        // Our partner will be the role that matches us
        const possiblePartner = data.party.member(myRoleIsDPS === stack1IsDPS ? stack1 : stack2);
        return output.markerOnYouStacksOnPlayers!({
          num: output.num!({ num: num }),
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
        capture: false,
      },
      condition: (data) => data.pathOfLightCounter === 2,
      delaySeconds: 0.1, // Delay for party headmarker collect
      durationSeconds: 9,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const num = data.pathOfLightCounter;
        const marker = data.myPathOfLights.at(-1) ?? 'unknown'; // Current headmarker

        // Group A
        if (data.isForsakenGroupA) {
          // Spread Players have to be far in the tower, cones need to bait end
          const nearFar = marker === 'spread'
            ? output.beFar!()
            : output.beNear!();

          if (data.triggerSetConfig.forsaken === 'kroxy-rinon') {
            // Check our previous headmarker
            // Supports Left, DPS Right
            if (data.role === 'healer' || data.role === 'tank') {
              // Support had cone in left tower 1, moves up in tower
              if (data.myPathOfLights[0] === 'cone')
                return output.mechs!({
                  num: output.num!({ num: num }),
                  mech1: output.tower!(),
                  mech2: nearFar,
                });
              // Support with spread on right tower 1 changes to left
              if (data.myPathOfLights[0] === 'spread')
                return output.mechs!({
                  num: output.num!({ num: num }),
                  mech1: output.swapTowers!(),
                  mech2: nearFar,
                });
            }
            if (data.myPathOfLights[0] === 'cone')
              return output.mechs!({
                num: output.num!({ num: num }),
                mech1: output.swapTowers!(),
                mech2: nearFar,
              });
            if (data.myPathOfLights[0] === 'spread')
              return output.mechs!({
                num: output.num!({ num: num }),
                mech1: output.tower!(),
                mech2: nearFar,
              });
          }

          // No strategy just say the cone/spread difference
          return output.mechs!({
            num: output.num!({ num: num }),
            mech1: output.tower!(),
            mech2: nearFar,
          });
        }

        // Group B
        if (data.role === 'healer')
          return output.baitLeftConeEvens!({
            num: output.num!({ num: num }),
          });
        if (data.role === 'tank')
          return output.baitCloneFar!({
            num: output.num!({ num: num }),
          });
        // DPS Unkmown party composition
        return output.bait!({
          num: output.num!({ num: num }),
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
      // There should be two stacks, a cone and an aoe
      type: 'StartsUsing',
      netRegex: { id: ['BADC', 'BADD'], source: 'Kefka', capture: false },
      condition: (data) => data.pathOfLightCounter === 3,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        const num = data.pathOfLightCounter;
        const marker = data.myPathOfLights.at(-1) ?? 'unknown'; // Current headmarker

        // Group A
        if (data.isForsakenGroupA) {
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
              num: output.num!({ num: num }),
              marker: output.stacksOnPlayers!({ players: msg }),
              tower: output.tower!(),
            });
          }

          if (data.triggerSetConfig.forsaken === 'kroxy-rinon') {
            return output.markerOnYouTower!({
              num: output.num!({ num: num }),
              marker: output[marker]!(),
              tower: marker === 'cone'
                ? output.leftTower!()
                : output.rightTower!(),
            });
          }
          return output.markerOnYouTower!({
            num: output.num!({ num: num }),
            marker: output[marker]!(),
            tower: output.tower!(),
          });
        }

        // Group B
        // So long as it is standard party composition...
        if (data.role === 'tank')
          return output.leftStack!({
            num: output.num!({ num: num }),
            avoid: output.avoid!(),
          });
        if (data.role === 'healer')
          return output.baitLeftConeOutOdds!({
            num: output.num!({ num: num }),
          });
        // 2 DPS in stack
        return output.rightStack!({
          num: output.num!({ num: num }),
          avoid: output.avoid!(),
        });
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
        const num = data.pathOfLightCounter;
        const marker = data.myPathOfLights.at(-1) ?? 'unknown'; // Current headmarker

        // Group A
        if (data.isForsakenGroupA) {
          if (data.role === 'healer')
            return output.baitLeftConeEvens!({
              num: output.num!({ num: num }),
            });
          if (data.role === 'tank')
            return output.baitCloneFar!({
              num: output.num!({ num: num }),
            });
          // DPS Unkmown party composition
          return output.bait!({
            num: output.num!({ num: num }),
          });
        }

        // Group B
        // If someone has stack from beginning
        if (marker === 'stack' || marker === 'unknown')
          return;

        // Spread Players have to be far in the tower, cones need to bait end
        const nearFar = marker === 'spread'
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
          num: output.num!({ num: num }),
          mech1: output.tower!(),
          mech2: nearFar,
        });
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
        const num = data.pathOfLightCounter;
        const marker = data.myPathOfLights.at(-1) ?? 'unknown'; // Current headmarker

        // Group A
        if (data.isForsakenGroupA) {
          // So long as it is standard party composition...
          if (data.role === 'tank')
            return output.leftStack!({
              num: output.num!({ num: num }),
              avoid: output.avoid!(),
            });
          if (data.role === 'healer')
            return output.baitLeftConeOutOdds!({
              num: output.num!({ num: num }),
            });
          return output.rightStack!({
            num: output.num!({ num: num }),
            avoid: output.avoid!(),
          });
        }

        // Group B
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
            num: output.num!({ num: num }),
            marker: output.stacksOnPlayers!({ players: msg }),
            tower: output.tower!(),
          });
        }

        if (data.triggerSetConfig.forsaken === 'kroxy-rinon') {
          return output.markerOnYouTower!({
            num: output.num!({ num: num }),
            marker: output[marker]!(),
            tower: marker === 'cone'
              ? output.leftTower!()
              : output.rightTower!(),
          });
        }
        return output.markerOnYouTower!({
          num: output.num!({ num: num }),
          marker: output[marker]!(),
          tower: output.tower!(),
        });
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
        capture: false,
      },
      condition: (data) => data.pathOfLightCounter === 6,
      delaySeconds: 0.1, // Delay for party headmarker collect
      durationSeconds: 9,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const num = data.pathOfLightCounter;
        const marker = data.myPathOfLights.at(-1) ?? 'unknown'; // Current headmarker

        // Group A
        if (data.isForsakenGroupA) {
          if (data.role === 'healer')
            return output.baitLeftConeEvens!({
              num: output.num!({ num: num }),
            });
          if (data.role === 'tank')
            return output.baitCloneFar!({
              num: output.num!({ num: num }),
            });
          // DPS Unknown party composition
          return output.bait!({
            num: output.num!({ num: num }),
          });
        }

        // Group B
        // Spread Players have to be far in the tower, cones need to bait end
        const nearFar = marker === 'spread'
          ? output.beFar!()
          : output.beNear!();

        if (data.triggerSetConfig.forsaken === 'kroxy-rinon') {
          return output.mechs!({
            num: output.num!({ num: num }),
            mech1: data.role === 'tank' || Util.isMeleeDpsJob(data.job)
              ? output.rightTower!()
              : output.leftTower!(),
            mech2: nearFar,
          });
        }

        return output.mechs!({
          num: output.num!({ num: num }),
          mech1: output.tower!(),
          mech2: nearFar,
        });
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Towers 7',
      // BADC All Things Ending (Future)
      // BADD All Things Ending (Past)
      // There should be two stacks, a cone and an aoe
      type: 'StartsUsing',
      netRegex: { id: ['BADC', 'BADD'], source: 'Kefka', capture: false },
      condition: (data) => data.pathOfLightCounter === 7,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        const num = data.pathOfLightCounter;
        const marker = data.myPathOfLights.at(-1) ?? 'unknown'; // Current headmarker

         // Group A
         if (data.isForsakenGroupA) {
          if (data.triggerSetConfig.forsaken === 'kroxy-rinon') {
            return output.markerOnYouTower!({
              num: output.num!({ num: num }),
              marker: output[marker]!(),
              tower: marker === 'cone'
                ? output.leftTower!()
                : output.rightTower!(),
            });
          }
          return output.markerOnYouTower!({
            num: output.num!({ num: num }),
            marker: output[marker]!(),
            tower: output.tower!(),
          });
        }

        // Group B
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
            num: output.num!({ num: num }),
            marker: output.stacksOnPlayers!({ players: msg }),
            tower: output.tower!(),
          });
        }
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Towers 8',
      // There won't be headmarkers for this set in AAABBBBA or ABBAABBA
      // This set should not contain stack markers
      // If stacks exist, they came from first set
      // 2 Cones and 2 Spreads will soak towers
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
        const num = data.pathOfLightCounter;
        const marker = data.myPathOfLights.at(-1) ?? 'unknown'; // Current headmarker

        // Group A
        if (data.isForsakenGroupA) {
          if (marker === 'stack' || marker === 'unknown')
            return;

          // Spread Players have to be far in the tower, cones need to bait end
          const nearFar = marker === 'spread'
            ? output.beFar!()
            : output.beNear!();

          if (data.triggerSetConfig.forsaken === 'kroxy-rinon') {
            return output.mechs!({
              num: output.num!({ num: num }),
              mech1: data.role === 'tank' || Util.isMeleeDpsJob(data.job)
                ? output.rightTower!()
                : output.leftTower!(),
              mech2: nearFar,
            });
          }

          return output.mechs!({
            num: output.num!({ num: num }),
            mech1: output.tower!(),
            mech2: nearFar,
          });
        }

        // Group B
        if (data.role === 'healer')
          return output.baitLeftConeEvens!({
            num: output.num!({ num: num }),
          });
        if (data.role === 'tank')
          return output.baitCloneFar!({
            num: output.num!({ num: num }),
          });
        return output.bait!({
          num: output.num!({ num: num }),
        });
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
