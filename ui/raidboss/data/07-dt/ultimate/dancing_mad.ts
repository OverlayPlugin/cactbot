import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { OutputStrings, TriggerSet } from '../../../../../types/trigger';

// TODO: P1 Tethers
// TODO: P1 Halfroom Cleaves
// TODO: P1 Replace Mystery Magic Ice Only with tether combination
// TODO: P1 Tele-Portent configuration options

type Phase = 'p1' | 'p2' | 'p3';
const phases: { [id: string]: Phase } = {
  'C24C': 'p2', // Ultimate Embrace, God Kefka
  'C3F7': 'p3', // Aero III Assault (from Kefka), Chaos and Exdeath
};

// const centerX = 100;
// const centerY = 100;

export interface Data extends RaidbossData {
  // General
  phase: Phase | 'unknown';
  // Phase 1
  blueTowerIds: string[];
  yellowTowerIds: string[];
  purpleTowerIds: string[];
  tower?: 'blue' | 'yellow' | 'purple';
  fireMarker?: string;
  isFireTrue?: boolean;
  isIceTrue?: boolean;
  isThunderTrue?: boolean;
  waveCannonTargets: string[];
  doubleTroubleTrapTargets: string[];
  myTelePortent1?: 'up' | 'down' | 'right' | 'left';
  myTelePortent2?: 'up' | 'down' | 'right' | 'left';
}

const headMarkerData = {
  // Phase 1 Boss
  'fakeFire': '02A1',
  'trueFire': '02A2',
  'fakeIce': '02A3',
  'trueIce': '02A4',
  'fakeThunder': '02A5',
  'trueThunder': '02A6',
  // Phase 1 Players
  'tankbuster': '00DA', // Revolting Ruin III tankbuster
  'dorito': '007F', // spread (real) or stack (fake)
  'stack': '0080', // spread (fake) or stack (real)
} as const;

const mysteryMagicOutputStrings: OutputStrings = {
  spread: Outputs.spread,
  stack: {
    en: 'Stack',
    de: 'Stacken',
    fr: 'Packez-vous',
    ja: 'スタック',
    cn: '集合',
    ko: '집합',
    tc: '集合',
  },
  trueThunder: {
    en: 'Avoid Tell',
  },
  fakeThunder: {
    en: 'In Line',
  },
  trueIce: {
    en: 'Avoid Tell',
  },
  fakeIce: {
    en: 'In Cone',
  },
  stackTrueIce: {
    en: '${mech} + ${ice}',
  },
  stackFakeIce: {
    en: '${mech} + ${ice}',
  },
  spreadTrueIce: {
    en: '${mech} + ${ice}',
  },
  spreadFakeIce: {
    en: '${mech} + ${ice}',
  },
  trueIceTrueThunder: {
    en: 'Avoid Tells',
  },
  fakeIceTrueThunder: {
    en: 'Cone (only)',
  },
  trueIceFakeThunder: {
    en: 'Line (only)',
  },
  fakeIceFakeThunder: {
    en: 'Cone + Line',
  },
  stackTrueThunder: {
    en: '${mech} + ${thunder}',
  },
  stackFakeThunder: {
    en: '${mech} + ${thunder}',
  },
  spreadTrueThunder: {
    en: '${mech} + ${thunder}',
  },
  spreadFakeThunder: {
    en: '${mech} + ${thunder}',
  },
};

const trapOutputStrings: OutputStrings = {
  knockbackFrom: {
    en: 'Knockback from ${players}',
  },
  knockbackFromLater: {
    en: 'Knockback from ${players} (later)',
  },
};

const triggerSet: TriggerSet<Data> = {
  id: 'DancingMadUltimate',
  zoneId: ZoneId.DancingMadUltimate,
  timelineFile: 'dancing_mad.txt',
  initData: () => {
    return {
      phase: 'p1',
      // Phase 1
      blueTowerIds: [],
      yellowTowerIds: [],
      purpleTowerIds: [],
      waveCannonTargets: [],
      doubleTroubleTrapTargets: [],
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
      id: 'DMU P1 CombatantMemory Tower Tracker',
      // 1EBFBB => Wave Cannon entity (blue)
      // 1EBFBC => Gravitational Wave entity (purple)
      // 1EBFBD => Intemperate Will entity (yellow)
      // There are two of each, they are added at start of fight
      type: 'CombatantMemory',
      netRegex: {
        change: 'Add',
        pair: [{ key: 'BNpcID', value: ['1EBFBB', '1EBFBC', '1EBFBD'] }],
        capture: true,
      },
      run: (data, matches) => {
        const towerMap = {
          '1EBFBB': 'blue',
          '1EBFBC': 'purple',
          '1EBFBD': 'yellow',
          'unknown': 'unknown',
        };
        const bnpcid = matches.pairBNpcID ?? 'unknown';
        const kind = towerMap[bnpcid as keyof typeof towerMap];
        if (kind === 'blue') {
          data.blueTowerIds.push(matches.id);
          return;
        }
        if (kind === 'yellow') {
          data.yellowTowerIds.push(matches.id);
          return;
        }
        if (kind === 'purple') {
          data.purpleTowerIds.push(matches.id);
          return;
        }
      },
    },
    {
      id: 'DMU P1 Graven Image Collect',
      // Tower entity actions
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: true },
      run: (data, matches) => {
        const id = matches.id;

        if (data.yellowTowerIds.indexOf(id) !== -1) {
          data.tower = 'yellow';
          return;
        }
        if (data.purpleTowerIds.indexOf(id) !== -1) {
          data.tower = 'purple';
          return;
        }
        if (data.blueTowerIds.indexOf(id) !== -1) {
          data.tower = 'blue';
          return;
        }
      },
    },
    {
      id: 'DMU P1 Revolting Ruin III',
      // Tankbuster targets highest enmity then second highest enmity
      // A tank swap can happen to have MT take both hits
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['tankbuster'], capture: true },
      alertText: (data, matches, output) => {
        const target = matches.target;
        if (target === data.me)
          return output.cleaveOnYou!();

        if (data.role === 'tank')
          return output.cleaveSwap!({
            player: data.party.member(target),
          });

        if (data.role === 'healer')
          return output.cleaveOnPlayer!({
            player: data.party.member(target),
          });

        return output.avoidCleaves!();
      },
      outputStrings: {
        in: Outputs.in,
        out: Outputs.out,
        cleaveOnYou: Outputs.tankCleaveOnYou,
        avoidCleaves: Outputs.avoidTankCleaves,
        cleaveOnPlayer: {
          en: 'Tank Cleave on ${player}',
        },
        cleaveSwap: { // Defaulting to same output as cleaveOnPlayer
          en: 'Tank Cleave on ${player}',
        },
      },
    },
    {
      id: 'DMU P1 Mystery Magic Collect',
      type: 'HeadMarker',
      netRegex: {
        id: [
          headMarkerData['trueFire'],
          headMarkerData['trueIce'],
          headMarkerData['trueThunder'],
          headMarkerData['fakeFire'],
          headMarkerData['fakeIce'],
          headMarkerData['fakeThunder'],
        ],
        capture: true,
      },
      run: (data, matches) => {
        switch (matches.id) {
          case headMarkerData['trueFire']:
            data.isFireTrue = true;
            return;
          case headMarkerData['fakeFire']:
            data.isFireTrue = false;
            return;
          case headMarkerData['trueIce']:
            data.isIceTrue = true;
            return;
          case headMarkerData['fakeIce']:
            data.isIceTrue = false;
            return;
          case headMarkerData['trueThunder']:
            data.isThunderTrue = true;
            return;
          case headMarkerData['fakeThunder']:
            data.isThunderTrue = false;
            return;
        }
      },
    },
    {
      id: 'DMU P1 Fire Head Marker Collect',
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData['dorito'], headMarkerData['stack']], capture: true },
      suppressSeconds: 2,
      run: (data, matches) => data.fireMarker = matches.id,
    },
    {
      id: 'DMU P1 Mystery Magic Ice and Fire',
      // Set 1: Only Ice and Fire should be set
      type: 'StartsUsing',
      netRegex: { id: 'BA94', source: 'Kefka', capture: false },
      condition: (data) => {
        return data.isIceTrue !== undefined && data.isFireTrue !== undefined;
      },
      infoText: (data, _matches, output) => {
        const fireMarker = data.fireMarker;
        if (
          (fireMarker === headMarkerData['dorito'] && data.isFireTrue) ||
          (fireMarker === headMarkerData['stack'] && !data.isFireTrue)
        )
          return data.isIceTrue
            ? output.spreadTrueIce!({ mech: output.spread!(), ice: output.trueIce!() })
            : output.spreadFakeIce!({ mech: output.spread!(), ice: output.fakeIce!() });

        if (
          (fireMarker === headMarkerData['dorito'] && !data.isFireTrue) ||
          (fireMarker === headMarkerData['stack'] && data.isFireTrue)
        ) {
          return data.isIceTrue
            ? output.stackTrueIce!({ mech: output.stack!(), ice: output.trueIce!() })
            : output.stackFakeIce!({ mech: output.stack!(), ice: output.fakeIce!() });
        }
      },
      outputStrings: mysteryMagicOutputStrings,
    },
    {
      id: 'DMU P1 Mystery Magic Ice and Thunder',
      // Set 2: Only Ice and Thunder should be set
      type: 'StartsUsing',
      netRegex: { id: 'BA94', source: 'Kefka', capture: false },
      condition: (data) => {
        return data.isIceTrue !== undefined && data.isThunderTrue !== undefined;
      },
      infoText: (data, _matches, output) => {
        if (data.isThunderTrue) {
          return data.isIceTrue
            ? output.trueIceTrueThunder!()
            : output.fakeIceTrueThunder!();
        }
        return data.isIceTrue
          ? output.trueIceTrueThunder!()
          : output.fakeIceFakeThunder!();
      },
      outputStrings: mysteryMagicOutputStrings,
    },
    {
      id: 'DMU P1 Mystery Magic Ice Only',
      // Occurs between Set 2 and Set 3
      // BA95 Blizzard Blowout III cast
      type: 'StartsUsing',
      netRegex: { id: 'BA95', source: 'Kefka', capture: false },
      condition: (data) => {
        if (
          data.isIceTrue !== undefined &&
          data.isThunderTrue === undefined &&
          data.isFireTrue === undefined
        )
          return true;
        return false;
      },
      infoText: (data, _matches, output) => {
        return data.isIceTrue
          ? output.trueIce!()
          : output.fakeIce!();
      },
      outputStrings: mysteryMagicOutputStrings,
    },
    {
      id: 'DMU P1 Mystery Magic Fire and Thunder',
      // Set 3: Only Fire and Thunder should be set
      type: 'StartsUsing',
      netRegex: { id: 'BA94', source: 'Kefka', capture: false },
      condition: (data) => {
        return data.isFireTrue !== undefined && data.isThunderTrue !== undefined;
      },
      infoText: (data, _matches, output) => {
        const fireMarker = data.fireMarker;
        if (
          (fireMarker === headMarkerData['dorito'] && data.isFireTrue) ||
          (fireMarker === headMarkerData['stack'] && !data.isFireTrue)
        )
          return data.isThunderTrue
            ? output.spreadTrueThunder!({
              mech: output.spread!(),
              thunder: output.trueThunder!(),
            })
            : output.spreadFakeThunder!({
              mech: output.spread!(),
              thunder: output.fakeThunder!(),
            });

        if (
          (fireMarker === headMarkerData['dorito'] && !data.isFireTrue) ||
          (fireMarker === headMarkerData['stack'] && data.isFireTrue)
        ) {
          return data.isThunderTrue
            ? output.stackTrueThunder!({
              mech: output.stack!(),
              thunder: output.trueThunder!(),
            })
            : output.stackFakeThunder!({
              mech: output.stack!(),
              thunder: output.fakeThunder!(),
            });
        }
      },
      outputStrings: mysteryMagicOutputStrings,
    },
    {
      id: 'DMU P1 Mystery Magic Cleanup',
      // C622 Light of Judgment to reset for the Graven Image 2
      type: 'StartsUsing',
      netRegex: { id: ['BA94', 'C622'], source: 'Kefka', capture: false },
      run: (data) => {
        delete data.isFireTrue;
        delete data.isIceTrue;
        delete data.isThunderTrue;
        delete data.fireMarker;
      },
    },
    {
      id: 'DMU P1 Wave Cannon',
      // BAA8 Wave Cannon is an instant cast from Graven Image
      // This gives a ~5 second warning to spread
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: true },
      alertText: (data, matches, output) => {
        if (data.blueTowerIds.indexOf(matches.id) !== -1)
          return output.waveCannonLine!();
      },
      outputStrings: {
        waveCannonLine: {
          en: 'E/W Spread',
        },
      },
    },
    {
      id: 'DMU P1 Wave Cannon Collect',
      // Collect players hit by Wave Cannon to tell who soaks tower followup and who avoids tower
      type: 'Ability',
      netRegex: { id: 'BAA8', source: 'Graven Image', capture: true },
      run: (data, matches) => data.waveCannonTargets.push(matches.target),
    },
    {
      id: 'DMU P1 Wave Cannon Explosion Towers',
      // Wave Cannon gives a vulnerability which causes death to BAAA Explosion soaks
      // Sacraficing a player who clipped to prevent party 90% damage down from
      // BAAB Unmitigated Explosion seems ideal, although different clients may
      // get different order
      // Suprisingly the Unmitigated Explosion doesn't deal damage
      type: 'Ability',
      netRegex: { id: 'BAA8', source: 'Graven Image', capture: false },
      delaySeconds: 0.1,
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          soak: {
            en: 'Soak tower',
            de: 'Türme nehmen',
            fr: 'Prenez une tour',
            ja: '塔踏み',
            cn: '踩塔击飞',
            ko: '기둥 들어가기',
            tc: '踩塔擊飛',
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
          extra: {
            en: 'Extra Tower',
          },
        };
        const avoidedCannon = data.waveCannonTargets.indexOf(data.me) !== -1;

        // Option for player to soak the tower for p1 prog?
        if (avoidedCannon && data.waveCannonTargets.length > 4)
          return { infoText: output.extra!() };

        // Avoid the tower
        if (avoidedCannon)
          return { alertText: output.avoid!() };

        // Player didn't get hit, they will need to soak a tower
        return { alertTest: output.soak!() };
      },
    },
    {
      id: 'DMU P1 Double-trouble Trap Collect',
      // Times are 5s, 68s, and 49s
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      run: (data, matches) => data.doubleTroubleTrapTargets.push(matches.target),
    },
    {
      id: 'DMU P1 Double-trouble Trap 2 Early',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      delaySeconds: 0.1,
      suppressSeconds: 1,
      infoText: (data, matches, output) => {
        // Ignore first set and third set
        if (parseFloat(matches.duration) < 67)
          return;

        // Check if players died
        if (data.doubleTroubleTrapTargets[0] === undefined)
          return;

        const players = data.doubleTroubleTrapTargets.map(
          (player) => {
            if (player === data.me)
              return 'YOU';
            return data.party.member(player);
          }
        );
        const msg = players?.join(', ');
        return output.knockbackFromLater!({ players: msg });
      },
      outputStrings: trapOutputStrings,
    },
    {
      id: 'DMU P1 Double-trouble Trap 3 Early',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      delaySeconds: 0.1,
      suppressSeconds: 1,
      infoText: (data, matches, output) => {
        const duration = parseFloat(matches.duration);
        // Only capture 3rd set
        if (duration < 48 || duration > 50)
          return;

        // Check if players died
        if (data.doubleTroubleTrapTargets[0] === undefined)
          return;

        const players = data.doubleTroubleTrapTargets.map(
          (player) => {
            if (player === data.me)
              return 'YOU';
            return data.party.member(player);
          }
        );
        const msg = players?.join(', ');
        return output.knockbackFromLater!({ players: msg });
      },
      outputStrings: trapOutputStrings,
    },
    {
      id: 'DMU P1 Double-trouble Trap 1',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      condition: (_data, matches) => parseFloat(matches.duration) < 6,
      delaySeconds: 0.1,
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = trapOutputStrings;

        const severity = data.doubleTroubleTrapTargets.includes(data.me) ? 'alertText' : 'infoText';
        const players = data.doubleTroubleTrapTargets.map(
          (player) => {
            if (player === data.me)
              return 'YOU';
            return data.party.member(player);
          }
        );
        const msg = players?.join(', ');
        return { [severity]: output.knockbackFrom!({ players: msg }) };
      },
    },
    {
      id: 'DMU P1 Double-trouble Trap 2',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      condition: (_data, matches) => parseFloat(matches.duration) > 67,
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 5,
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = trapOutputStrings;

        // Check if players died
        if (data.doubleTroubleTrapTargets[0] === undefined)
          return;

        const severity = data.doubleTroubleTrapTargets.includes(data.me) ? 'alertText' : 'infoText';
        const players = data.doubleTroubleTrapTargets.map(
          (player) => {
            if (player === data.me)
              return 'YOU';
            return data.party.member(player);
          }
        );
        const msg = players?.join(', ');
        return { [severity]: output.knockbackFrom!({ players: msg }) };
      },
    },
    {
      id: 'DMU P1 Double-trouble Trap 3',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      condition: (_data, matches) => {
        const duration = parseFloat(matches.duration);
        return duration > 48 && duration < 50;
      },
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 5,
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = trapOutputStrings;

        // Check if players died
        if (data.doubleTroubleTrapTargets[0] === undefined)
          return;

        const severity = data.doubleTroubleTrapTargets.includes(data.me) ? 'alertText' : 'infoText';
        const players = data.doubleTroubleTrapTargets.map(
          (player) => {
            if (player === data.me)
              return 'YOU';
            return data.party.member(player);
          }
        );
        const msg = players?.join(', ');
        return { [severity]: output.knockbackFrom!({ players: msg }) };
      },
    },
    {
      id: 'DMU P1 Double-trouble Trap Cleanup',
      // Players dying will also trigger this
      type: 'LosesEffect',
      netRegex: { effectId: '13D6', capture: true },
      run: (data, matches) => {
        data.doubleTroubleTrapTargets = data.doubleTroubleTrapTargets.filter(
          (target) => target !== matches.target,
        );
      },
    },
    {
      id: 'DMU P1 Light of Judgment',
      type: 'StartsUsing',
      netRegex: { id: 'C622', source: 'Kefka', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'DMU P1 Hyperdrive',
      // This hits three times
      // Occurs 3.1s after C622 Light of Judgment, which is a 5s cast
      type: 'StartsUsing',
      netRegex: { id: 'C622', source: 'Kefka', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 2, // Result in ~5.1s warning
      response: Responses.tankBuster(),
    },
    {
      id: 'DMU P1 Impertinent Will/Gravitational Wave',
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: true },
      alertText: (data, matches, output) => {
        const id = matches.id;
        if (data.yellowTowerIds.indexOf(id) !== -1) {
          return output.goWest!();
        }
        if (data.purpleTowerIds.indexOf(id) !== -1) {
          return output.goEast!();
        }
      },
      outputStrings: {
        goWest: Outputs.getLeftAndWest,
        goEast: Outputs.getRightAndEast,
      },
    },
    {
      id: 'DMU P1 Tele-Portent Collect',
      // Debuffs distributed to 8 players:
      // Players with 2 of the same are always:
      // 130F Left  (7s) + 130F Left  (10s)
      // 130E Right (7s) + 130E Right (10s)
      // 130D Down  (7s) + 130D Down  (10s)
      // 130C Up    (7s) + 130C Up    (10s)
      //
      // The remaining players may have differing patterns:
      // Pattern 1:
      // 130D Down  (7s) + 13DA Left  (10s)
      // 13D9 Right (7s) + 130C Up    (10s)
      // 13D8 Down  (7s) + 130E Right (10s)
      // 130F Left  (7s) + 13D7 Up    (10s)
      //
      // Pattern 2:
      // 130D Down  (7s) + 13DA Left  (10s)
      // 13D9 Right (7s) + 130C Up    (10s)
      // 130E Right (7s) + 13D8 Down  (10s)
      // 13D7 Up    (7s) + 130F Left  (10s)
      //
      // Pattern 3:
      // 130D Down  (7s) + 13DA Left  (10s)
      // 13D9 Right (7s) + 130C Up    (10s)
      // 130E Right (7s) + 13D8 Down  (10s)
      // 130F Left  (7s) + 13D7 Up    (10s)
      //
      // Pattern 4:
      // 13DA Left  (7s) + 130D Down  (10s)
      // 130C Up    (7s) + 13D9 Right (10s)
      // 130E Right (7s) + 13D8 Down  (10s)
      // 130F Left  (7s) + 13D7 Up    (10s)
      //
      // Possibly More?
      // Varying strategies to resolve
      // Players with the same arrows will get a 6s 503 Confused which causes them to target nearest players
      // Players with different arrows will cause a 6s 131E Sleep aoe
      type: 'GainsEffect',
      netRegex: {
        effectId: [
          '130C', // Up
          '130D', // Down
          '130E', // Right
          '130F', // Left
          '13D7', // Up
          '13D8', // Down
          '13D9', // Right
          '13DA', // Left
        ],
        capture: true,
      },
      condition: Conditions.targetIsYou(),
      run: (data, matches) => {
        const effectMap: { [effectId: string]: typeof data.myTelePortent1 } = {
          '130C': 'up',
          '130D': 'down',
          '130E': 'right',
          '130F': 'left',
          '13D7': 'up',
          '13D8': 'down',
          '13D9': 'right',
          '13DA': 'left',
        };
        const duration = parseFloat(matches.duration);
        if (duration < 8) {
          data.myTelePortent1 = effectMap[matches.effectId];
          return;
        }
        data.myTelePortent2 = effectMap[matches.effectId];
      },
    },
    {
      id: 'DMU P1 Tele-Portents',
      type: 'GainsEffect',
      netRegex: {
        effectId: [
          '130C', // Up
          '130D', // Down
          '130E', // Right
          '130F', // Left
          '13D7', // Up
          '13D8', // Down
          '13D9', // Right
          '13DA', // Left
        ],
        capture: true,
      },
      condition: Conditions.targetIsYou(),
      durationSeconds: 7,
      infoText: (data, _matches, output) => {
        if (data.myTelePortent1 === undefined || data.myTelePortent2 === undefined)
          return;
        const portents = data.myTelePortent1 + data.myTelePortent2;
        return output[portents]!();
      },
      outputStrings: {
        upup: {
          en: 'Up Portents',
        },
        downdown: {
          en: 'Down Portents',
        },
        rightright: {
          en: 'Right Portents',
        },
        leftleft: {
          en: 'Left Portents',
        },
        downleft: {
          en: 'Down => Left Portent',
        },
        downright: {
          en: 'Down => Right Portent',
        },
        rightup: {
          en: 'Right => Up Portent',
        },
        rightdown: {
          en: 'Right => Down Portent',
        },
        leftup: {
          en: 'Left => Up Portent',
        },
        leftdown: {
          en: 'Left => Down Portent',
        },
        upright: {
          en: 'Up => Right Portent',
        },
        upleft: {
          en: 'Up => Left Portent',
        },
      },
    },
    {
      id: 'DMU P1 Tele-Portent 2',
      // Not enough time to have lengthy TTS, but could configure this to give direction instead of move
      type: 'LosesEffect',
      netRegex: {
        effectId: [
          '130C', // Up
          '130D', // Down
          '130E', // Right
          '130F', // Left
          '13D7', // Up
          '13D8', // Down
          '13D9', // Right
          '13DA', // Left
        ],
        capture: true,
      },
      condition: (data, matches) => {
        if (data.me === matches.target)
          if (data.myTelePortent1 !== undefined)
            return true;
        return false;
      },
      durationSeconds: 3,
      response: Responses.moveAway('alert'),
    },
    {
      id: 'DMU P1 Tele-Portent Cleanup',
      type: 'LosesEffect',
      netRegex: {
        effectId: [
          '130C', // Up
          '130D', // Down
          '130E', // Right
          '130F', // Left
          '13D7', // Up
          '13D8', // Down
          '13D9', // Right
          '13DA', // Left
        ],
        capture: true,
      },
      condition: Conditions.targetIsYou(),
      suppressSeconds: 1,
      run: (data) => {
        delete data.myTelePortent1;
        delete data.myTelePortent2;
      },
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
