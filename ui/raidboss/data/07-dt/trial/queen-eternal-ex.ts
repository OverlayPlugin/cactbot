import Conditions from '../../../../../resources/conditions';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutputCardinal, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO:
// Earth phase boulders, track the amount that hit platform and specify off for second set if 8 have already hit?
// Divide and Conquer followup trigger for the memorized lines, not sure how to word this
// Ice phase, tethers + line stack, might need a strat option for this

type CoronationLaser = {
  dir: Exclude<DirectionOutputCardinal, 'unknown'>;
  side: Exclude<DirectionOutputCardinal, 'unknown'>;
  name: string;
};

export interface Data extends RaidbossData {
  actorPositions: { [id: string]: { x: number; y: number } };
  windKnockbackDir?: 'left' | 'right';
  phase: 'p1' | 'wind' | 'earth' | 'ice' | 'p2';
  gravitationalEmpireMech: 'tower' | 'spread' | 'cone';
  absoluteAuthorityDebuff: 'stack' | 'spread';
  radicalShiftCWPlatform?: 'wind' | 'earth' | 'ice';
  radicalShiftCCWPlatform?: 'wind' | 'earth' | 'ice';
  coronationLasers: CoronationLaser[];
}

const triggerSet: TriggerSet<Data> = {
  id: 'TheMinstrelsBalladSphenesBurden',
  zoneId: ZoneId.TheMinstrelsBalladSphenesBurden,
  timelineFile: 'queen-eternal-ex.txt',
  initData: () => ({
    absoluteAuthorityDebuff: 'stack',
    gravitationalEmpireMech: 'tower',
    phase: 'p1',
    actorPositions: {},
    coronationLasers: [],
  }),
  triggers: [
    // Phase trackers
    {
      id: 'QueenEternal Ex Phase Tracker Elemental',
      type: 'StartsUsing',
      netRegex: { id: ['A019', 'A01A', 'A01B'], source: 'Queen Eternal', capture: true },
      run: (data, matches) => {
        switch (matches.id) {
          case 'A019':
            data.phase = 'wind';
            break;
          case 'A01A':
            data.phase = 'earth';
            break;
          case 'A01B':
            data.phase = 'ice';
            break;
        }
      },
    },
    {
      id: 'QueenEternal Ex Phase Tracker P1',
      type: 'StartsUsing',
      netRegex: { id: 'A01C', source: 'Queen Eternal', capture: false },
      run: (data) => data.phase = 'p1',
    },
    {
      id: 'QueenEternal Ex Phase Tracker P2',
      type: 'Ability',
      netRegex: { id: 'A04B', source: 'Queen Eternal', capture: false },
      run: (data) => data.phase = 'p2',
    },
    // General triggers
    {
      id: 'QueenEternal Ex General ActorSetPos Tracker',
      type: 'ActorSetPos',
      netRegex: { id: '4[0-9A-F]{7}', capture: true },
      run: (data, matches) => {
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
        };
      },
    },
    {
      id: 'QueenEternal Ex General Legitimate Force East Safe First',
      type: 'StartsUsing',
      netRegex: { id: 'A01E', source: 'Queen Eternal', capture: false },
      condition: (data) => ['p1', 'earth', 'ice'].includes(data.phase),
      response: Responses.goRightThenLeft(),
    },
    {
      id: 'QueenEternal Ex General Legitimate Force West Safe First',
      type: 'StartsUsing',
      netRegex: { id: 'A020', source: 'Queen Eternal', capture: false },
      condition: (data) => ['p1', 'earth', 'ice'].includes(data.phase),
      response: Responses.goLeftThenRight(),
    },
    {
      id: 'QueenEternal Ex World Shatter',
      type: 'StartsUsing',
      netRegex: { id: ['7692', 'A01C'], source: 'Queen Eternal', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'QueenEternal Ex Prosecution of War',
      type: 'StartsUsing',
      netRegex: { id: 'A00A', source: 'Queen Eternal', capture: true },
      response: Responses.tankBusterSwap(),
    },
    {
      id: 'QueenEternal Ex Royal Domain',
      type: 'StartsUsing',
      netRegex: { id: 'A04E', source: 'Queen Eternal', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'QueenEternal Ex Virtual Shift',
      type: 'StartsUsing',
      netRegex: { id: ['A019', 'A01A', 'A01B'], source: 'Queen Eternal', capture: false },
      response: Responses.bigAoe(),
    },

    // Before wind
    {
      id: 'QueenEternal Ex Aethertithe Safe Parties',
      type: 'MapEffect',
      netRegex: { flags: ['04000100', '08000100', '10000100'], location: '00', capture: true },
      infoText: (_data, matches, output) => {
        const dirMap: { [flag: string]: 'west' | 'middle' | 'east' } = {
          '04000100': 'west',
          '08000100': 'middle',
          '10000100': 'east',
        };
        const dirs: ('east' | 'middle' | 'west')[] = Object.entries(dirMap).filter((entry) =>
          entry[0] !== matches.flags
        ).map((entry) => entry[1]);

        const [dir1, dir2] = dirs;

        if (dirs.length !== 2 || dir1 === undefined || dir2 === undefined) {
          return output.unknownCombo!({
            unk: output.unknown!(),
            groups: output.healerGroups!(),
          });
        }

        return output.combo!({
          dir1: output[dir1]!(),
          dir2: output[dir2]!(),
          groups: output.healerGroups!(),
        });
      },
      outputStrings: {
        east: Outputs.east,
        middle: Outputs.middle,
        west: Outputs.west,
        healerGroups: Outputs.healerGroups,
        combo: {
          en: '${dir1}/${dir2}, ${groups}',
          de: '${dir1}/${dir2}, ${groups}',
          fr: '${dir1}/${dir2}, ${groups}',
          ja: '${dir1}/${dir2}, ${groups}',
          cn: '${dir1}/${dir2}, ${groups}',
          ko: '${dir1}/${dir2}, ${groups}',
        },
        unknown: Outputs.unknown,
        unknownCombo: {
          en: '${unk} => ${groups}',
          de: '${unk} => ${groups}',
          fr: '${unk} => ${groups}',
          ja: '${unk} => ${groups}',
          cn: '${unk} => ${groups}',
          ko: '${unk} => ${groups}',
        },
      },
    },

    // Wind phase
    {
      id: 'QueenEternal Ex Wind Phase Aeroquell',
      type: 'StartsUsing',
      netRegex: { id: 'A025', source: 'Queen Eternal', capture: false },
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.stacks!(),
      outputStrings: {
        stacks: Outputs.healerGroups,
      },
    },
    {
      id: 'QueenEternal Ex Wind Phase Debuff Collector',
      type: 'GainsEffect',
      netRegex: { effectId: ['105D', '105E'], capture: true },
      condition: Conditions.targetIsYou(),
      run: (data, matches) =>
        data.windKnockbackDir = matches.effectId === '105E' ? 'right' : 'left',
    },
    {
      id: 'QueenEternal Ex Wind Phase Legitimate Force',
      type: 'StartsUsing',
      netRegex: { id: ['A01E', 'A020'], source: 'Queen Eternal', capture: true },
      condition: (data) => data.phase === 'wind',
      delaySeconds: 0.5,
      durationSeconds: 13.3,
      infoText: (data, matches, output) => {
        const safeDir: 'leftRight' | 'rightLeft' = matches.id === 'A01E'
          ? 'rightLeft'
          : 'leftRight';
        const kbDir = data.windKnockbackDir;

        if (kbDir === undefined) {
          return output.comboUnknown!({
            break: output.break!(),
            safe: output[safeDir]!(),
            unk: output.unknown!(),
          });
        }

        return output.combo!({
          break: output.break!(),
          safe: output[safeDir]!(),
          kbDir: output[kbDir]!(),
        });
      },
      outputStrings: {
        leftRight: Outputs.leftThenRight,
        rightLeft: Outputs.rightThenLeft,
        left: {
          en: 'Knockback Left',
          fr: 'Poussée Gauche',
          cn: '向左击退',
          ko: '왼쪽 넉백',
        },
        right: {
          en: 'Knockback Right',
          fr: 'Pousée Droite',
          cn: '向右击退',
          ko: '오른쪽 넉백',
        },
        break: Outputs.breakChains,
        unknown: Outputs.unknown,
        combo: {
          en: '${break} => ${safe} => ${kbDir}',
          de: '${break} => ${safe} => ${kbDir}',
          fr: '${break} => ${safe} => ${kbDir}',
          ja: '${break} => ${safe} => ${kbDir}',
          cn: '${break} => ${safe} => ${kbDir}',
          ko: '${break} => ${safe} => ${kbDir}',
        },
        comboUnknown: {
          en: '${break} => ${safe} => ${unk}',
          de: '${break} => ${safe} => ${unk}',
          fr: '${break} => ${safe} => ${unk}',
          ja: '${break} => ${safe} => ${unk}',
          cn: '${break} => ${safe} => ${unk}',
          ko: '${break} => ${safe} => ${unk}',
        },
      },
    },

    // After wind
    {
      id: 'QueenEternal Ex Divide and Conquer',
      type: 'StartsUsing',
      netRegex: { id: 'A017', source: 'Queen Eternal', capture: false },
      response: Responses.spread(),
    },

    // Earth phase
    {
      id: 'QueenEternal Ex Earth Phase Initial Up',
      type: 'Ability',
      netRegex: { id: 'A01A', capture: false },
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.up!(),
      outputStrings: {
        up: {
          en: 'Up',
          fr: 'En haut',
          cn: '上浮',
          ko: '공중으로',
        },
      },
    },
    {
      id: 'QueenEternal Ex Earth Phase First Towers',
      type: 'Ability',
      netRegex: { id: 'A028', capture: false },
      delaySeconds: 14.3,
      infoText: (_data, _matches, output) => output.downSoak!(),
      outputStrings: {
        downSoak: {
          en: 'Down, soak tower',
          fr: 'En bas, prenez une tour',
          cn: '下降 => 踩塔',
          ko: '하강, 기둥 밟기',
        },
      },
    },
    {
      id: 'QueenEternal Ex Earth Phase Gravitational Empire Pillar Collector',
      type: 'StartsUsing',
      netRegex: { id: 'A02C', capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
      run: (data) => data.gravitationalEmpireMech = 'spread',
    },
    {
      id: 'QueenEternal Ex Earth Phase Gravitational Empire Ray Collector',
      type: 'Tether',
      netRegex: { id: '0011', capture: true },
      condition: (data, matches) => matches.source === data.me,
      infoText: (_data, _matches, output) => output.cone!(),
      run: (data) => data.gravitationalEmpireMech = 'cone',
      outputStrings: {
        cone: {
          en: 'Cone on YOU',
          fr: 'Cône sur VOUS',
          cn: '扇形点名',
          ko: '산개징 대상자',
        },
      },
    },
    {
      id: 'QueenEternal Ex Earth Phase Gravitational Empire Towers',
      type: 'StartsUsing',
      netRegex: { id: 'A02B', capture: false },
      delaySeconds: 0.5,
      infoText: (data, _matches, output) => {
        if (data.gravitationalEmpireMech !== 'tower')
          return;

        return output.downSoak!();
      },
      outputStrings: {
        downSoak: {
          en: 'Down, soak tower',
          fr: 'En bas, prenez une tour',
          cn: '下降 => 踩塔',
          ko: '하강, 기둥 밟기',
        },
      },
    },
    {
      id: 'QueenEternal Ex Earth Phase Boulder',
      type: 'HeadMarker',
      netRegex: { id: '022F', capture: false },
      suppressSeconds: 1,
      response: Responses.spread(),
    },
    {
      id: 'QueenEternal Ex Earth Phase Weighty Blow',
      type: 'StartsUsing',
      netRegex: { id: 'A033', source: 'Queen Eternal', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Hide behind rocks',
          fr: 'Cachez-vous derrière les rochers',
          cn: '躲在石头后',
          ko: '돌 뒤로 숨기',
        },
      },
    },

    // After earth
    {
      id: 'QueenEternal Ex Coronation Laser Collector',
      type: 'StartsUsing',
      netRegex: { id: 'A013', source: 'Queen Eternal', capture: false },
      promise: async (data) => {
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
        }));

        if (combatants === null) {
          console.error(`Coronation Laser Collector: null data`);
          return;
        }

        const lasers = combatants.combatants.filter((c) => c.BNpcID === 18043);

        if (lasers.length !== 4) {
          console.error(
            `Coronation Laser Collector: expected 4, got ${combatants.combatants.length}`,
          );
          return;
        }

        for (const laser of lasers) {
          data.actorPositions[laser.ID?.toString(16).toUpperCase() ?? ''] = {
            x: laser.PosX,
            y: laser.PosY,
          };
        }
      },
    },
    {
      id: 'QueenEternal Ex Coronation Laser Tether Collector',
      type: 'Tether',
      netRegex: { id: ['010E', '010F'], capture: true },
      infoText: (data, matches, output) => {
        const idToSideMap: { [id: string]: number } = {
          '010E': -1, // 'left',
          '010F': 1, // 'right',
        } as const;

        const offset = idToSideMap[matches.id];
        const pos = data.actorPositions[matches.targetId];

        if (offset === undefined || pos === undefined) {
          console.error(
            `Coronation Laser Tether Collector: ${offset ?? 'undefined'}, ${JSON.stringify(pos)}`,
          );
          return output.unknown!();
        }

        const laserDirNum = Directions.xyTo4DirNum(pos.x, pos.y, 100.0, 100.0);
        const sideDirNum = (4 + laserDirNum + offset) % 4;

        const laserDir = Directions.outputFromCardinalNum(laserDirNum);
        const sideDir = Directions.outputFromCardinalNum(sideDirNum);

        if (laserDir === 'unknown' || sideDir === 'unknown') {
          console.error(
            `Coronation Laser Tether Collector: laserDir = ${laserDir}, sideDir = ${sideDir}`,
          );
          return output.unknown!();
        }

        data.coronationLasers.push({
          dir: laserDir,
          side: sideDir,
          name: matches.source,
        });

        if (data.coronationLasers.length < 8)
          return;

        const myLaser = data.coronationLasers.find((laser) => laser.name === data.me);

        if (myLaser === undefined)
          throw new UnreachableCode();

        const partnerLaser = data.coronationLasers.find((laser) =>
          laser.dir === myLaser.dir && laser !== myLaser
        );

        return output.text!({
          laserDir: output[myLaser.dir]!(),
          sideDir: output[myLaser.side]!(),
          partner: data.party.member(partnerLaser?.name),
        });
      },
      outputStrings: {
        ...Directions.outputStringsCardinalDir,
        text: {
          en: '${laserDir} laser, ${sideDir} side, w/ ${partner}',
          fr: 'Laser ${laserDir} , côté ${sideDir}, avec ${partner}',
          cn: '${laserDir} 激光, ${sideDir} 侧, 和 ${partner}',
          ko: '${laserDir} 레이저, ${sideDir}쪽, 파트너: ${partner}',
        },
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'QueenEternal Ex Absolute Authority',
      type: 'StartsUsing',
      netRegex: { id: 'A041', source: 'Queen Eternal', capture: false },
      infoText: (_data, _matches, output) => output.bait!(),
      outputStrings: {
        bait: Outputs.baitPuddles,
      },
    },
    {
      id: 'QueenEternal Ex Absolute Authority Debuff Collector',
      type: 'GainsEffect',
      netRegex: { effectId: '105A', capture: true },
      condition: Conditions.targetIsYou(),
      run: (data) => data.absoluteAuthorityDebuff = 'spread',
    },
    {
      id: 'QueenEternal Ex Absolute Authority Debuff Mechanics',
      type: 'GainsEffect',
      netRegex: { effectId: '105A', capture: false },
      delaySeconds: 1,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        return output.combo!({
          stackSpread: output[data.absoluteAuthorityDebuff]!(),
          dorito: output.dorito!(),
        });
      },
      outputStrings: {
        spread: {
          en: 'Flare Marker Spread',
          fr: 'Dispersion marqueur Brasier',
          cn: '核爆点名分散',
          ko: '플레어 징 산개',
        },
        stack: Outputs.stackMarker,
        dorito: Outputs.doritoStack,
        combo: {
          en: '${stackSpread} => ${dorito}',
          de: '${stackSpread} => ${dorito}',
          fr: '${stackSpread} => ${dorito}',
          ja: '${stackSpread} => ${dorito}',
          cn: '${stackSpread} => ${dorito}',
          ko: '${stackSpread} => ${dorito}',
        },
      },
    },

    // Ice phase
    {
      id: 'QueenEternal Ex Ice Phase Motion Headmarker',
      type: 'HeadMarker',
      netRegex: { id: '022A', capture: false },
      suppressSeconds: 1,
      response: Responses.moveAround(),
    },
    {
      id: 'QueenEternal Ex Ice Phase Icecicles',
      type: 'Tether',
      netRegex: { id: '0039', capture: true },
      condition: Conditions.targetIsYou(),
      promise: async (data, matches) => {
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        }));

        if (combatants === null) {
          console.error(`Ice Phase Icecicles: null data`);
          return;
        }
        if (combatants.combatants.length !== 1) {
          console.error(`Ice Phase Icecicles: expected 1, got ${combatants.combatants.length}`);
          return;
        }

        const icecicle = combatants.combatants[0];
        if (!icecicle)
          return;

        data.actorPositions[matches.sourceId] = {
          x: icecicle.PosX,
          y: icecicle.PosY,
        };
      },
      infoText: (data, matches, output) => {
        const iceciclePos = data.actorPositions[matches.sourceId];

        if (iceciclePos === undefined) {
          return output.unknown!();
        }

        if (iceciclePos.x < 100.0) {
          return output.east!();
        }

        return output.west!();
      },
      outputStrings: {
        unknown: {
          en: 'Spread ???, stretch tethers',
          fr: 'Dispersion ???, étirez les liens',
          cn: '???分散, 拉线至变色',
          ko: '??? 산개, 선 늘이기',
        },
        west: {
          en: 'Spread West, stretch tethers',
          fr: 'Dispersion Est, étirez les liens',
          cn: '左分散, 拉线至变色',
          ko: '서쪽 산개, 선 늘이기',
        },
        east: {
          en: 'Spread East, stretch tethers',
          fr: 'Dispersion Ouest, étirez les liens',
          cn: '右分散, 拉线至变色',
          ko: '동쪽 산개, 선 늘이기',
        },
      },
    },

    // Phase two
    {
      id: 'QueenEternal Ex Platform Tracker',
      type: 'MapEffect',
      netRegex: { location: ['09', '0A', '0B'], capture: true },
      run: (data, matches) => {
        const flags: { [flag: string]: 'cw' | 'ccw' } = {
          '00200010': 'ccw',
          '00020001': 'cw',
        };

        const slots: { [slot: string]: 'wind' | 'earth' | 'ice' } = {
          '09': 'wind',
          '0A': 'earth',
          '0B': 'ice',
        };

        const dir = flags[matches.flags];
        const element = slots[matches.location];

        if (dir === undefined || element === undefined) {
          return;
        }

        if (dir === 'cw') {
          data.radicalShiftCWPlatform = element;
        } else {
          data.radicalShiftCCWPlatform = element;
        }
      },
    },
    {
      id: 'QueenEternal Ex Rotation Direction + Spread',
      type: 'MapEffect',
      netRegex: { flags: ['08000400', '01000080'], location: '0C', capture: true },
      infoText: (data, matches, output) => {
        const dir = matches.flags === '08000400' ? 'cw' : 'ccw';
        let elem = data.radicalShiftCWPlatform;

        if (dir === 'ccw') {
          elem = data.radicalShiftCCWPlatform;
        }

        if (elem === undefined) {
          return output.combo!({
            elem: output.unknown!(),
            spread: output.spread!(),
          });
        }

        return output.combo!({
          elem: output[elem]!(),
          spread: output.spread!(),
        });
      },
      outputStrings: {
        spread: Outputs.spread,
        unknown: Outputs.unknown,
        wind: {
          en: 'Wind/Green',
          fr: 'Vent/Vert',
          cn: '风/绿地板',
          ko: '바람/초록',
        },
        earth: {
          en: 'Earth/Yellow',
          fr: 'Terre/Jaune',
          cn: '土/黄地板',
          ko: '땅/노랑',
        },
        ice: {
          en: 'Ice/Blue',
          fr: 'Glace/Bleu',
          cn: '冰/蓝地板',
          ko: '얼음/파랑',
        },
        combo: {
          en: '${elem} => ${spread}',
          de: '${elem} => ${spread}',
          fr: '${elem} => ${spread}',
          ja: '${elem} => ${spread}',
          cn: '${elem} => ${spread}',
          ko: '${elem} => ${spread}',
        },
      },
    },
    {
      id: 'QueenEternal Ex Radical Shift',
      type: 'StartsUsing',
      netRegex: { id: 'A04F', source: 'Queen Eternal', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'QueenEternal Ex Dying Memory',
      type: 'StartsUsing',
      netRegex: { id: 'A059', source: 'Queen Eternal', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'QueenEternal Ex Royal Banishment',
      type: 'StartsUsing',
      netRegex: { id: 'A05A', source: 'Queen Eternal', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'QueenEternal Ex Tyranny\'s Grasp',
      type: 'StartsUsing',
      netRegex: { id: 'A055', source: 'Queen Eternal', capture: false },
      infoText: (_data, _matches, output) => output.back!(),
      outputStrings: {
        back: {
          en: 'Back, Tank Towers => AoE',
          fr: 'Arrière, Tours Tank => AoE',
          cn: '去后半场, 坦克踩塔 => AoE',
          ko: '뒤로, 탱커 기둥 => 전체 공격',
        },
      },
    },
  ],
};

export default triggerSet;
