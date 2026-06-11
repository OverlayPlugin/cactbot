import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { OutputStrings, TriggerSet } from '../../../../../types/trigger';

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
  actorPositions: { [id: string]: { x: number; y: number; heading: number } };
  gravenImageCount: number;
  blueTowerIds: string[];
  purpleTowerIds: string[];
  yellowTowerIds: string[];
  eyeTowerIds: string[];
  fakeEyeTowerIds: string[];
  gravenImageTether?:
    | 'pulse'
    | 'gravitas'
    | 'vitrophyre'
    | 'indulgent'
    | 'idyllic'
    | 'unknown';
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
  // Phase 1 Tethers
  'imageTether': '002D',
} as const;

const mysteryMagicOutputStrings: OutputStrings = {
  puddle: {
    en: 'Bait Puddle',
    de: 'Fläche ködern',
    fr: 'Déposez',
    ja: 'AOE誘導',
    cn: '诱导AOE',
    ko: '장판 유도',
    tc: '誘導AOE',
  },
  spread: Outputs.spread,
  middle: Outputs.goIntoMiddle,
  stack: {
    en: 'Stack',
    de: 'Stacken',
    fr: 'Packez-vous',
    ja: 'スタック',
    cn: '集合',
    ko: '쉐어',
    tc: '集合',
  },
  trueThunder: {
    en: 'Avoid Tell',
    ko: '예고 피하기',
  },
  fakeThunder: {
    en: 'In Line',
    ko: '직선 안으로',
  },
  trueIce: {
    en: 'Avoid Tell',
    ko: '예고 피하기',
  },
  fakeIce: {
    en: 'In Cone',
    ko: '부채꼴 안으로',
  },
  trueIcePuddle: {
    en: '${mech1} + ${mech2} => ${mech3}',
    ko: '${mech1} + ${mech2} => ${mech3}',
  },
  fakeIcePuddle: {
    en: '${mech1} + ${mech2} => ${mech3}',
    ko: '${mech1} + ${mech2} => ${mech3}',
  },
  stackTrueIce: {
    en: '${mech} + ${ice}',
    ko: '${mech} + ${ice}',
  },
  stackFakeIce: {
    en: '${mech} + ${ice}',
    ko: '${mech} + ${ice}',
  },
  spreadTrueIce: {
    en: '${mech} + ${ice}',
    ko: '${mech} + ${ice}',
  },
  spreadFakeIce: {
    en: '${mech} + ${ice}',
    ko: '${mech} + ${ice}',
  },
  trueIceTrueThunder: {
    en: 'Avoid Tells',
    ko: '예고 다 피하기',
  },
  fakeIceTrueThunder: {
    en: 'Cone (only)',
    ko: '부채꼴만',
  },
  trueIceFakeThunder: {
    en: 'Line (only)',
    ko: '직선만',
  },
  fakeIceFakeThunder: {
    en: 'Cone + Line',
    ko: '부채꼴 + 직선',
  },
  stackTrueThunder: {
    en: '${mech} + ${thunder}',
    ko: '${mech} + ${thunder}',
  },
  stackFakeThunder: {
    en: '${mech} + ${thunder}',
    ko: '${mech} + ${thunder}',
  },
  spreadTrueThunder: {
    en: '${mech} + ${thunder}',
    ko: '${mech} + ${thunder}',
  },
  spreadFakeThunder: {
    en: '${mech} + ${thunder}',
    ko: '${mech} + ${thunder}',
  },
};

const trapOutputStrings: OutputStrings = {
  you: {
    en: 'YOU',
    ko: '나',
  },
  knockbackFrom1: {
    en: 'Knockback from ${players}',
    ko: '${players}에서 넉백',
  },
  knockbackFrom2: {
    en: 'Knockback from ${players}',
    ko: '${players}에서 넉백',
  },
  knockbackFrom3: {
    en: 'Knockback from ${players} => Debuffs',
    ko: '${players}에서 넉백 => 디버프',
  },
  knockbackFrom3Sleep: {
    en: 'Knockback from ${players} => Sleep',
    ko: '${players}에서 넉백 => 수면',
  },
  knockbackFrom3Confuse: {
    en: 'Knockback from ${players} => Confuse',
    ko: '${players}에서 넉백 => 혼란',
  },
  knockbackFromLater: {
    en: 'Knockback from ${players} (later)',
    ko: '${players}에서 넉백 (나중에)',
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
      actorPositions: {},
      gravenImageCount: 0,
      blueTowerIds: [],
      purpleTowerIds: [],
      yellowTowerIds: [],
      eyeTowerIds: [],
      fakeEyeTowerIds: [],
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
      id: 'DMU ActorSetPos Tracker',
      // Only in use for P1 Graven Image tethers
      type: 'ActorSetPos',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
          heading: parseFloat(matches.heading),
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
          ko: '${player}에게 광역 탱버',
        },
        cleaveSwap: { // Defaulting to same output as cleaveOnPlayer
          en: 'Tank Cleave on ${player}',
          ko: '${player}에게 광역 탱버',
        },
      },
    },
    {
      id: 'DMU P1 Graven Image Counter',
      // Used for timing of tether triggers
      type: 'StartsUsing',
      netRegex: { id: 'BCF2', source: 'Kefka', capture: false },
      run: (data) => data.gravenImageCount = data.gravenImageCount + 1,
    },
    {
      id: 'DMU P1 Graven Image Tether Collect',
      // 271 ActorSetPos lines indicate where the tether is coming from
      // 261 CombatantMemory lines may also indicate this
      // Graven Image 1:
      // (100, 56, 18.5) Center Tether, Will be target of BAA9 Pulse Wave (knockback)
      // Graven Image 2:
      // (102.5, 27, 22.5) Center Tether, Will be target of BAAC Gravitas (puddles)
      // (126, 41.5, 7) Right Tether, Will be target of BAB0 Vitrophyre (rocks)
      // Graven Image 3:
      // (95, 25, 27) Left Tether, Will be target of BAB5 Indulgent Will which causes 503 Confused
      // (107, 43, 8.5) Right tether, Will be target of BAB6 Idyllic Will which causes 131E Sleep
      type: 'Tether',
      netRegex: { id: headMarkerData['imageTether'], capture: true },
      condition: Conditions.targetIsYou(),
      delaySeconds: 0.1, // Actor position data can come after tether in log
      run: (data, matches) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined) {
          data.gravenImageTether = 'unknown';
          return;
        }

        const x = actor.x;
        // Graven Image 1: Pulse Wave target
        if (x < 101 && x > 99)
          data.gravenImageTether = 'pulse';
        else if (x < 103 && x > 101) // Graven Image 2: Gravitas target
          data.gravenImageTether = 'gravitas';
        else if (x > 125) // Graven Image 2: Vitrophyre target
          data.gravenImageTether = 'vitrophyre';
        else if (x < 100) // Graven Image 3: Indulgent Will target
          data.gravenImageTether = 'indulgent';
        else if (x < 108 && x > 106) // Graven Image 3: Idyllic Will target
          data.gravenImageTether = 'idyllic';
        else
          data.gravenImageTether = 'unknown';
      },
    },
    {
      id: 'DMU P1 Pulse Wave Tethers',
      type: 'Tether',
      netRegex: { id: headMarkerData['imageTether'], capture: true },
      condition: (data, matches) => {
        return data.me === matches.target && data.gravenImageCount === 1;
      },
      delaySeconds: 0.1, // Actor position data can come after tether in log
      durationSeconds: 7,
      infoText: (data, matches, output) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined)
          return output.tetherOnYou!();

        const x = actor.x;
        // Graven Image 1: Pulse Wave target
        if (x < 101 && x > 99)
          return output.pulse!();
        return output.tetherOnYou!();
      },
      outputStrings: {
        tetherOnYou: {
          en: 'Tether on YOU',
          de: 'Verbindung auf DIR',
          fr: 'Lien sur VOUS',
          ja: '線ついた',
          cn: '连线点名',
          ko: '선 대상자 지정됨',
          tc: '連線點名',
        },
        pulse: Outputs.knockback, // Cannot be immuned, happens within 6s of tether
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
      id: 'DMU P1 Graven Image Tether Cleanup',
      // Clear on Ability:
      // BAA9 Pulse Wave
      // BAAC Gravitas
      // BAB0 vitrophyre
      // BAB5 Indulgent Will
      // BAB6 Idyllic Will
      type: 'Ability',
      netRegex: {
        id: ['BAA9', 'BAAC', 'BAB0', 'BAB5', 'BAB6'],
        source: 'Graven Image',
        capture: true,
      },
      suppressSeconds: 1,
      run: (data, matches) => {
        // Player could die and this ability then not target them
        // Need intelligent way to remove once related ability has executed
        // Clear data if ability matches our tether
        const abilityMap = {
          'pulse': 'BAAC',
          'gravitas': 'BAA9',
          'vitrophyre': 'BAB0',
          'indulgent': 'BAB5',
          'idyllic': 'BAB6',
          'unknown': 'unknown',
        };
        const tether = data.gravenImageTether ?? 'unknown';
        const tetherAbilityId = abilityMap[tether];
        if (tetherAbilityId === matches.id || tether === 'unknown')
          delete data.gravenImageTether;
      },
    },
    {
      id: 'DMU P1 Graven Image Collect',
      // Tower entity actions
      // The CombatantMemory Add lines are added prior to combat
      // OverlayPlugin can retrieve the matching BNpcID
      // However, these entities seem to always spawn in the same order and the
      // first tower is the highest ID and the towers are in sequential order
      // These are the BNpcID values:
      // 1EBFBB (2015163) => Wave Cannon entity (blue)
      // 1EBFBC (2015164) => Gravitational Wave entity (purple)
      // 1EBFBD (2015165) => Intemperate Will entity (yellow)
      // 1EBFBE (2015166) => Indolent Will entity (eye)
      // 1EBFBF (2015167) => Ave Maria entity (fake eye)
      // There are two of each, they are added at start of fight
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: true },
      preRun: (data, matches) => {
        const id = parseInt(matches.id, 16);
        const blueTowers = [id, id - 1]; // First tower is blue and highest ID
        const purpleTowers = [id - 2, id - 4]; // Next are in pair with yellow
        const yellowTowers = [id - 3, id - 5];
        const eyeTowers = [id - 7, id - 9]; // Next are in paire with fake
        const fakeEyeTowers = [id - 6, id - 8];

        const toStringId = (id: number): string => {
          return id.toString(16).toUpperCase();
        };
        data.blueTowerIds = blueTowers.map((id) => toStringId(id));
        data.purpleTowerIds = purpleTowers.map((id) => toStringId(id));
        data.yellowTowerIds = yellowTowers.map((id) => toStringId(id));
        data.eyeTowerIds = eyeTowers.map((id) => toStringId(id));
        data.fakeEyeTowerIds = fakeEyeTowers.map((id) => toStringId(id));
      },
      suppressSeconds: 99999,
    },
    {
      id: 'DMU P1 Wave Cannon',
      // BAA8 Wave Cannon is an instant cast from Graven Image
      // This gives a ~5 second warning to spread
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: false },
      suppressSeconds: 99999, // First instance is a blue tower
      alertText: (_data, _matches, output) => output.waveCannonLine!(),
      outputStrings: {
        waveCannonLine: {
          en: 'E/W Spread',
          ko: '동/서 산개',
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
      id: 'DMU P1 Double-trouble Trap Collect',
      // Times are 5s, 68s, and 49s
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      run: (data, matches) => data.doubleTroubleTrapTargets.push(matches.target),
    },
    {
      id: 'DMU P1 Wave Cannon Explosion Towers',
      // Wave Cannon gives a vulnerability which causes death to BAAA Explosion soaks
      // Sacraficing a player who clipped to prevent party 90% damage down from
      // BAAB Unmitigated Explosion seems ideal, although different clients may
      // get different order
      // Suprisingly the Unmitigated Explosion doesn't deal damage
      // Players have ~4s to soak the tower
      type: 'Ability',
      netRegex: { id: 'BAA8', source: 'Graven Image', capture: false },
      delaySeconds: 0.1,
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          getTowers: Outputs.getTowers,
          avoid: {
            en: 'Avoid towers',
            de: 'Türme vermeiden',
            fr: 'Évitez les tours',
            ja: '塔回避',
            cn: '远离塔',
            ko: '탑 피하기',
            tc: '遠離塔',
          },
          extra: {
            en: 'Extra Tower',
            ko: '남는 탑',
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
        return { alertText: output.getTowers!() };
      },
    },
    {
      id: 'DMU P1 Double-trouble Trap Knockback',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 3.9, // First one needs 0.1 delay for collect
      durationSeconds: 3.9,
      suppressSeconds: 1,
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = trapOutputStrings;

        // If players died before the duration ended
        if (data.doubleTroubleTrapTargets.length === 0)
          return;

        const severity = data.doubleTroubleTrapTargets.includes(data.me) ? 'alertText' : 'infoText';
        const players = data.doubleTroubleTrapTargets.map(
          (player) => {
            if (player === data.me)
              return output.you!();
            return data.party.member(player);
          },
        );
        const msg = players?.join(', ');

        const duration = parseFloat(matches.duration);
        if (duration < 6)
          return { [severity]: output.knockbackFrom1!({ players: msg }) };
        if (duration > 67)
          return { [severity]: output.knockbackFrom2!({ players: msg }) };

        if (data.gravenImageTether === 'idyllic')
          return { [severity]: output.knockbackFrom3Sleep!({ players: msg }) };
        if (data.gravenImageTether === 'indulgent')
          return { [severity]: output.knockbackFrom3Confuse!({ players: msg }) };
        return { [severity]: output.knockbackFrom3!({ players: msg }) };
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
      id: 'DMU P1 Double-trouble Trap 2 Early',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      delaySeconds: 0.3, // Time between debuff and dying from the application
      suppressSeconds: 1,
      infoText: (data, matches, output) => {
        // Ignore first set and third set
        if (parseFloat(matches.duration) < 67)
          return;

        // Check if players died
        if (data.doubleTroubleTrapTargets.length === 0)
          return;

        const players = data.doubleTroubleTrapTargets.map(
          (player) => {
            if (player === data.me)
              return output.you!();
            return data.party.member(player);
          },
        );
        const msg = players?.join(', ');
        return output.knockbackFromLater!({ players: msg });
      },
      outputStrings: trapOutputStrings,
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
          ? output.trueIceFakeThunder!()
          : output.fakeIceFakeThunder!();
      },
      outputStrings: mysteryMagicOutputStrings,
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
      id: 'DMU P1 Mystery Magic Ice, and Gravitas and Vitrophyre Tethers 1',
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
        const hasVitrophyre = data.gravenImageTether === 'vitrophyre';
        return data.isIceTrue
          ? output.trueIcePuddle!({
            mech1: output.trueIce!(),
            mech2: output.puddle!(),
            mech3: hasVitrophyre ? output.spread!() : output.middle!(),
          })
          : output.fakeIcePuddle!({
            mech1: output.fakeIce!(),
            mech2: output.puddle!(),
            mech3: hasVitrophyre ? output.spread!() : output.middle!(),
          });
      },
      outputStrings: mysteryMagicOutputStrings,
    },
    {
      id: 'DMU P1 Vitrophyre',
      // Trigger on BAAC Gravitas, ~4s to get away
      type: 'Ability',
      netRegex: { id: 'BAAC', source: 'Graven Image', capture: false },
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (data.gravenImageTether === 'vitrophyre')
          return output.spread!();
        return output.avoidTethers!();
      },
      outputStrings: {
        avoidTethers: {
          en: 'Avoid Tethered Players',
          ko: '선 대상자 피하기',
        },
        spread: {
          en: 'Spread (avoid puddles)',
          ko: '산개 (장판 피하기)',
        },
      },
    },
    {
      id: 'DMU P1 Double-trouble Trap 3 Early',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      delaySeconds: 0.3, // Time between debuff and dying from the application
      suppressSeconds: 1,
      infoText: (data, matches, output) => {
        const duration = parseFloat(matches.duration);
        // Only capture 3rd set
        if (duration < 48 || duration > 50)
          return;

        // Check if players died
        if (data.doubleTroubleTrapTargets.length === 0)
          return;

        const players = data.doubleTroubleTrapTargets.map(
          (player) => {
            if (player === data.me)
              return output.you!();
            return data.party.member(player);
          },
        );
        const msg = players?.join(', ');
        return output.knockbackFromLater!({ players: msg });
      },
      outputStrings: trapOutputStrings,
    },
    {
      id: 'DMU P1 Impertinent Will',
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: true },
      condition: (data, matches) => data.yellowTowerIds.includes(matches.id),
      alertText: (_data, _matches, output) => output.goWest!(),
      outputStrings: {
        goWest: Outputs.getLeftAndWest,
      },
    },
    {
      id: 'DMU P1 Gravitational Wave',
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: true },
      condition: (data, matches) => data.purpleTowerIds.includes(matches.id),
      alertText: (_data, _matches, output) => output.goEast!(),
      outputStrings: {
        goEast: Outputs.getRightAndEast,
      },
    },
    {
      id: 'DMU P1 Gravitas and Vitrophyre Tethers 2',
      type: 'Tether',
      netRegex: { id: headMarkerData['imageTether'], capture: true },
      condition: (data, matches) => {
        return data.me === matches.target &&
          data.isIceTrue !== undefined &&
          data.isThunderTrue === undefined &&
          data.isFireTrue === undefined;
      },
      delaySeconds: 2,
      durationSeconds: 6,
      infoText: (data, matches, output) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined)
          return output.tetherOnYou!();

        const x = actor.x;
        if (x < 103 && x > 101) // Graven Image 2: Gravitas target
          return output.gravitas!({
            mech1: output.puddle!(),
            mech2: output.middle!(),
          });
        if (x > 125) // Graven Image 2: Vitrophyre target
          return output.vitrophyre!({
            mech1: output.puddle!(),
            mech2: output.spread!(),
          });
        return output.tetherOnYou!();
      },
      outputStrings: {
        puddle: {
          en: 'Bait Puddle',
          de: 'Fläche ködern',
          fr: 'Déposez',
          ja: 'AOE誘導',
          cn: '诱导AOE',
          ko: '장판 유도',
          tc: '誘導AOE',
        },
        middle: Outputs.goIntoMiddle,
        spread: Outputs.spread,
        tetherOnYou: {
          en: 'Tether on YOU',
          de: 'Verbindung auf DIR',
          fr: 'Lien sur VOUS',
          ja: '線ついた',
          cn: '连线点名',
          ko: '선 대상자 지정됨',
          tc: '連線點名',
        },
        gravitas: {
          en: '${mech1} => ${mech2}',
          ko: '${mech1} => ${mech2}',
        },
        vitrophyre: {
          en: '${mech1} => ${mech2}',
          ko: '${mech1} => ${mech2}',
        },
        indulgent: {
          en: 'Confuse Tether on YOU',
          ko: '혼란 선 대상자',
        },
        idyllic: {
          en: 'Sleep Tether on YOU',
          ko: '수면 선 대상자',
        },
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
          ko: '위쪽 화살표',
        },
        downdown: {
          en: 'Down Portents',
          ko: '아래쪽 화살표',
        },
        rightright: {
          en: 'Right Portents',
          ko: '오른쪽 화살표',
        },
        leftleft: {
          en: 'Left Portents',
          ko: '왼쪽 화살표',
        },
        downleft: {
          en: 'Down => Left Portent',
          ko: '아래 => 왼쪽 화살표',
        },
        downright: {
          en: 'Down => Right Portent',
          ko: '아래 => 오른쪽 화살표',
        },
        rightup: {
          en: 'Right => Up Portent',
          ko: '오른쪽 => 위 화살표',
        },
        rightdown: {
          en: 'Right => Down Portent',
          ko: '오른쪽 => 아래 화살표',
        },
        leftup: {
          en: 'Left => Up Portent',
          ko: '왼쪽 => 위 화살표',
        },
        leftdown: {
          en: 'Left => Down Portent',
          ko: '왼쪽 => 아래 화살표',
        },
        upright: {
          en: 'Up => Right Portent',
          ko: '위 => 오른쪽 화살표',
        },
        upleft: {
          en: 'Up => Left Portent',
          ko: '위 => 왼쪽 화살표',
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
    {
      id: 'DMU P1 Indulgent Will and Idyllic Will Tethers',
      type: 'Tether',
      netRegex: { id: headMarkerData['imageTether'], capture: true },
      condition: (data, matches) => {
        return data.me === matches.target && data.gravenImageCount === 3;
      },
      delaySeconds: 0.1, // Delay for collect of tower type
      infoText: (data, matches, output) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined)
          return output.tetherOnYou!();

        const x = actor.x;
        if (x < 100) // Graven Image 3: Indulgent Will target
          return output.indulgent!();
        if (x < 108 && x > 106) // Graven Image 3: Idyllic Will target
          return output.idyllic!();
        return output.tetherOnYou!();
      },
      outputStrings: {
        tetherOnYou: {
          en: 'Tether on YOU',
          de: 'Verbindung auf DIR',
          fr: 'Lien sur VOUS',
          ja: '線ついた',
          cn: '连线点名',
          ko: '선 대상자 지정됨',
          tc: '連線點名',
        },
        indulgent: {
          en: 'Confuse Tether on YOU',
          ko: '혼란 선 대상자',
        },
        idyllic: {
          en: 'Sleep Tether on YOU',
          ko: '수면 선 대상자',
        },
      },
    },
    {
      id: 'DMU P1 Ave Maria',
      // BAB3 Ave Maria
      // The animation is visible ~9.89s before cast goes off, however
      // When animation becomes visible, the players will be asleep or
      // confused for another ~3.4s. Once the debuff ends the players have
      // ~6.4s to turn character
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: true },
      condition: (data, matches) => data.fakeEyeTowerIds.includes(matches.id),
      durationSeconds: 9.5,
      countdownSeconds: 3.4, // Estimated time debuff would expire
      infoText: (_data, _matches, output) => output.lookAt!(),
      outputStrings: {
        lookAt: {
          en: 'Look At Statue',
          de: 'Statue anschauen',
          fr: 'Regardez la statue',
          ja: '像を見る！',
          cn: '面对神像',
          ko: '시선 바라보기',
          tc: '面對神像',
        },
      },
    },
    {
      id: 'DMU P1 Indolent Will',
      // BAB4 Indolent Will
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: true },
      condition: (data, matches) => data.eyeTowerIds.includes(matches.id),
      durationSeconds: 9.5,
      countdownSeconds: 3.4, // Estimated time debuff would expire
      infoText: (_data, _matches, output) => output.lookAway!(),
      outputStrings: {
        lookAway: {
          en: 'Look Away From Statue',
          de: 'Von Statue wegschauen',
          fr: 'Ne regardez pas la statue',
          ja: '塔を見ない！',
          cn: '背对神像',
          ko: '시선 피하기',
          tc: '背對神像',
        },
      },
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
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Future\'s End/Past\'s End': 'Future/Past\'s End',
      },
    },
    {
      'locale': 'ko',
      'missingTranslations': true,
      'replaceSync': {
        'Chaos': '카오스',
        'Exdeath': '엑스데스',
        'Graven Image': '신들의 상',
        'Kefka': '케프카',
      },
      'replaceText': {
        '\\(Pop Window\\)': '(활성화)',
        '\\(castbar\\)': '(시전바)',
        'Aero III Assault': '갈기갈기 에어로가',
        'All Things Ending': '소멸의 발차기',
        'Ave Maria': '아베 마리아',
        'Blizzard III Blowout': '널리널리 블리자가',
        'Bowels of Agony': '고통의 심핵',
        'Cyclone': '회오리',
        'Definition of Insanity': '재구성',
        'Double-Trouble Trap': '줄줄이 함정',
        'Explosion': '폭발',
        'Flagrant Fire III': '이글이글 파이가',
        'Forsaken': '행방불명',
        'Future\'s End/Past\'s End': '과거/미래의 종언',
        'Graven Image': '신들의 상',
        'Gravitas': '중력탄',
        'Gravitational Wave': '중력파',
        'Gravity III': '그라비가',
        'Hyperdrive': '하이퍼드라이브',
        'Idyllic Will': '수마의 신기',
        'Indolent Will': '태만의 신기',
        'Indulgent Will': '성모의 신기',
        'Inferno': '화염',
        'Intemperate Will': '박살의 신기',
        'Light of Judgment': '심판의 빛',
        'Longitudinal Implosion': '세로 내파',
        'Mystery Magic': '알쏭달쏭 마법',
        'Pulse Wave': '파동탄',
        'Revolting Ruin III': '파삭파삭 루인가',
        'Shockwave': '충격파',
        'Spelldriver': '위험한 주문: 집중',
        'Spellscatter': '위험한 주문: 분산',
        'Spellwave': '위험한 주문: 파동',
        'Stray Flames': '혼돈의 불',
        'Stray Spray': '혼돈의 물',
        'Tele-trouncing': '성큼성큼 텔레포',
        'The Path of Light': '빛의 파동',
        'Thrumming Thunder III': '찌릿찌릿 선더가',
        '(?<! )Thunder III': '선더가',
        'Trance': '자아도취',
        'Trine': '트라인',
        'Tsunami': '해일',
        'Ultimate Embrace': '종말의 포옹',
        'Vitrophyre': '암석탄',
        'Wave Cannon': '파동포',
        'Wings of Destruction': '파괴의 날개',
        'the Decisive Battle': '결전',
      },
    },
  ],
};

export default triggerSet;
