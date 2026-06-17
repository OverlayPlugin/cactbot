const phases = {
  'C24C': 'p2',
  'C3F7': 'p3',
  'C2DC': 'p4',
  'BB40': 'p5', // Ultima Repeater, Ultima Kefka
};
const headMarkerData = {
  // Phase 1 Boss
  'fakeFire': '02A1',
  'trueFire': '02A2',
  'fakeIce': '02A3',
  'trueIce': '02A4',
  'fakeThunder': '02A5',
  'trueThunder': '02A6',
  // Phase 1 Players
  'tankbuster': '00DA',
  'dorito': '007F',
  'stack': '0080',
  // Phase 1 Tethers
  'imageTether': '002D',
  // Phase 2
  'sharedBuster': '0103',
  'stackPath': '02CB',
  'conePath': '02CD',
  'spreadPath': '02CC', // When standing in Path of Light tower, causes BAC1 Spellscatter (small aoe on the player)
};
const mysteryMagicOutputStrings = {
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
  stackTrueThunderLook: {
    en: '${mech} + ${thunder} + ${look}',
    ko: '${mech} + ${thunder} + ${look}',
  },
  stackFakeThunderLook: {
    en: '${mech} + ${thunder} + ${look}',
    ko: '${mech} + ${thunder} + ${look}',
  },
  spreadTrueThunderLook: {
    en: '${mech} + ${thunder} + ${look}',
    ko: '${mech} + ${thunder} + ${look}',
  },
  spreadFakeThunderLook: {
    en: '${mech} + ${thunder} + ${look}',
    ko: '${mech} + ${thunder} + ${look}',
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
  lookAway: {
    en: 'Look Away From Statue',
    de: 'Von Statue wegschauen',
    fr: 'Ne regardez pas la statue',
    ja: '塔を見ない！',
    cn: '背对神像',
    ko: '시선 피하기',
    tc: '背對神像',
  },
  lookAt: {
    en: 'Look At Statue',
    de: 'Statue anschauen',
    fr: 'Regardez la statue',
    ja: '像を見る！',
    cn: '面对神像',
    ko: '시선 바라보기',
    tc: '面對神像',
  },
};
const trapOutputStrings = {
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
Options.Triggers.push({
  id: 'DancingMadUltimate',
  zoneId: ZoneId.DancingMadUltimate,
  config: [
    {
      id: 'teleportent',
      comment: {
        en:
          `Outputs up to 12 locations to drop first arrow. Second call will be relative to first<br />
          Clockwise: <a href="https://pastebin.com/7fs57PyQ" target="_blank">Kefka Bin</a><br />
          Filipino Box: <a href="https://raidplan.io/plan/5rf2uhud5ztsbud5" target="_blank">Raidplan</a><br />`,
        ko: `최대 12곳의 후보 장소 중에서 첫 번째 화살표를 설치할 위치를 알립니다. 두 번째 호출은 첫 번째 위치를 기준으로 합니다.<br />
          시계 방향: <a href="https://pastebin.com/7fs57PyQ" target="_blank">Kefka Bin</a><br />
          Filipino Box: <a href="https://raidplan.io/plan/5rf2uhud5ztsbud5" target="_blank">Raidplan</a><br />`,
      },
      name: {
        en: 'P1 Graven Image 3 Tele-Portent Strategy',
        ko: '1페이즈 신들의 상 3 텔레포 전략',
      },
      type: 'select',
      options: {
        en: {
          'Clockwise Big Box': 'clockwise',
          'Filipino Box (Intercardinals)': 'filipino',
          'Call Debuffs only': 'none',
        },
        ko: {
          '시계 방향 큰 네모': 'clockwise',
          'Filipino Box (대각선)': 'filipino',
          '디버프만 알림': 'none',
        },
      },
      default: 'none',
    },
  ],
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
      // Phase 2
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
          return output.cleaveOnYou();
        if (data.role === 'tank')
          return output.cleaveSwap({
            player: data.party.member(target),
          });
        if (data.role === 'healer')
          return output.cleaveOnPlayer({
            player: data.party.member(target),
          });
        return output.avoidCleaves();
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
        cleaveSwap: {
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
      delaySeconds: 0.1,
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
      delaySeconds: 0.1,
      durationSeconds: 7,
      infoText: (data, matches, output) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined)
          return output.tetherOnYou();
        const x = actor.x;
        // Graven Image 1: Pulse Wave target
        if (x < 101 && x > 99)
          return output.pulse();
        return output.tetherOnYou();
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
            ? output.spreadTrueIce({ mech: output.spread(), ice: output.trueIce() })
            : output.spreadFakeIce({ mech: output.spread(), ice: output.fakeIce() });
        if (
          (fireMarker === headMarkerData['dorito'] && !data.isFireTrue) ||
          (fireMarker === headMarkerData['stack'] && data.isFireTrue)
        ) {
          return data.isIceTrue
            ? output.stackTrueIce({ mech: output.stack(), ice: output.trueIce() })
            : output.stackFakeIce({ mech: output.stack(), ice: output.fakeIce() });
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
        const toStringId = (id) => {
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
      suppressSeconds: 99999,
      alertText: (_data, _matches, output) => output.waveCannonLine(),
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
          return { infoText: output.extra() };
        // Avoid the tower
        if (avoidedCannon)
          return { alertText: output.avoid() };
        // Player didn't get hit, they will need to soak a tower
        return { alertText: output.getTowers() };
      },
    },
    {
      id: 'DMU P1 Double-trouble Trap Knockback',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 3.9,
      durationSeconds: 3.9,
      suppressSeconds: 1,
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = trapOutputStrings;
        // If players died before the duration ended
        if (data.doubleTroubleTrapTargets.length === 0)
          return;
        const severity = data.doubleTroubleTrapTargets.includes(data.me) ? 'alertText' : 'infoText';
        const players = data.doubleTroubleTrapTargets.map((player) => {
          if (player === data.me)
            return output.you();
          return data.party.member(player);
        });
        const msg = players?.join(', ');
        const duration = parseFloat(matches.duration);
        if (duration < 6)
          return { [severity]: output.knockbackFrom1({ players: msg }) };
        if (duration > 67)
          return { [severity]: output.knockbackFrom2({ players: msg }) };
        if (data.gravenImageTether === 'idyllic')
          return { [severity]: output.knockbackFrom3Sleep({ players: msg }) };
        if (data.gravenImageTether === 'indulgent')
          return { [severity]: output.knockbackFrom3Confuse({ players: msg }) };
        return { [severity]: output.knockbackFrom3({ players: msg }) };
      },
    },
    {
      id: 'DMU P1 Double-trouble Trap Cleanup',
      // Players dying will also trigger this
      type: 'LosesEffect',
      netRegex: { effectId: '13D6', capture: true },
      run: (data, matches) => {
        data.doubleTroubleTrapTargets = data.doubleTroubleTrapTargets.filter((target) =>
          target !== matches.target
        );
      },
    },
    {
      id: 'DMU P1 Double-trouble Trap 2 Early',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      delaySeconds: 0.3,
      suppressSeconds: 1,
      infoText: (data, matches, output) => {
        // Ignore first set and third set
        if (parseFloat(matches.duration) < 67)
          return;
        // Check if players died
        if (data.doubleTroubleTrapTargets.length === 0)
          return;
        const players = data.doubleTroubleTrapTargets.map((player) => {
          if (player === data.me)
            return output.you();
          return data.party.member(player);
        });
        const msg = players?.join(', ');
        return output.knockbackFromLater({ players: msg });
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
            ? output.trueIceTrueThunder()
            : output.fakeIceTrueThunder();
        }
        return data.isIceTrue
          ? output.trueIceFakeThunder()
          : output.fakeIceFakeThunder();
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
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 2,
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
          ? output.trueIcePuddle({
            mech1: output.trueIce(),
            mech2: output.puddle(),
            mech3: hasVitrophyre ? output.spread() : output.middle(),
          })
          : output.fakeIcePuddle({
            mech1: output.fakeIce(),
            mech2: output.puddle(),
            mech3: hasVitrophyre ? output.spread() : output.middle(),
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
          return output.spread();
        return output.avoidTethers();
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
      delaySeconds: 0.3,
      suppressSeconds: 1,
      infoText: (data, matches, output) => {
        const duration = parseFloat(matches.duration);
        // Only capture 3rd set
        if (duration < 48 || duration > 50)
          return;
        // Check if players died
        if (data.doubleTroubleTrapTargets.length === 0)
          return;
        const players = data.doubleTroubleTrapTargets.map((player) => {
          if (player === data.me)
            return output.you();
          return data.party.member(player);
        });
        const msg = players?.join(', ');
        return output.knockbackFromLater({ players: msg });
      },
      outputStrings: trapOutputStrings,
    },
    {
      id: 'DMU P1 Impertinent Will',
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: true },
      condition: (data, matches) => data.yellowTowerIds.includes(matches.id),
      alertText: (_data, _matches, output) => output.goWest(),
      outputStrings: {
        goWest: Outputs.getLeftAndWest,
      },
    },
    {
      id: 'DMU P1 Gravitational Wave',
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: true },
      condition: (data, matches) => data.purpleTowerIds.includes(matches.id),
      alertText: (_data, _matches, output) => output.goEast(),
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
          return output.tetherOnYou();
        const x = actor.x;
        if (x < 103 && x > 101) // Graven Image 2: Gravitas target
          return output.gravitas({
            mech1: output.puddle(),
            mech2: output.middle(),
          });
        if (x > 125) // Graven Image 2: Vitrophyre target
          return output.vitrophyre({
            mech1: output.puddle(),
            mech2: output.spread(),
          });
        return output.tetherOnYou();
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
          '130C',
          '130D',
          '130E',
          '130F',
          '13D7',
          '13D8',
          '13D9',
          '13DA', // Left
        ],
        capture: true,
      },
      condition: Conditions.targetIsYou(),
      run: (data, matches) => {
        const effectMap = {
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
          '130C',
          '130D',
          '130E',
          '130F',
          '13D7',
          '13D8',
          '13D9',
          '13DA', // Left
        ],
        capture: true,
      },
      condition: Conditions.targetIsYou(),
      durationSeconds: 7,
      infoText: (data, _matches, output) => {
        const tp1 = data.myTelePortent1;
        const tp2 = data.myTelePortent2;
        if (tp1 === undefined || tp2 === undefined)
          return;
        const portents = tp1 + tp2;
        if (data.triggerSetConfig.teleportent === 'clockwise') {
          // Relative to center of arena
          const dir1Map = {
            'upup': 'west',
            'downdown': 'east',
            'rightright': 'north',
            'leftleft': 'south',
            'downleft': 'dirESE',
            'downright': 'northeast',
            'rightup': 'northwest',
            'rightdown': 'dirNNE',
            'leftup': 'dirSSW',
            'leftdown': 'southeast',
            'upright': 'dirWNW',
            'upleft': 'southwest',
          };
          // Relative to where player is
          const dir2Map = {
            'upup': 'south',
            'downdown': 'north',
            'rightright': 'west',
            'leftleft': 'east',
            'downleft': 'south',
            'downright': 'west',
            'rightup': 'south',
            'rightdown': 'east',
            'leftup': 'west',
            'leftdown': 'north',
            'upright': 'north',
            'upleft': 'east',
          };
          const dir1 = dir1Map[portents];
          const dir2 = dir2Map[portents];
          return output.clockwise({
            dir1: output[dir1 ?? 'unknown'](),
            dir2: output[dir2 ?? 'unknown'](),
          });
        }
        if (data.triggerSetConfig.teleportent === 'filipino') {
          const dir1Map = {
            'upup': 'southeastOut',
            'downdown': 'northwestOut',
            'rightright': 'southwestOut',
            'leftleft': 'northeastOut',
            'downleft': 'dirWSW',
            'downright': 'southeastIn',
            'rightup': 'northeastIn',
            'rightdown': 'dirSSE',
            'leftup': 'dirNNW',
            'leftdown': 'southwestIn',
            'upright': 'dirENE',
            'upleft': 'northwestIn',
          };
          const dir2Map = {
            'upup': 'north',
            'downdown': 'south',
            'rightright': 'east',
            'leftleft': 'west',
            'downleft': 'east',
            'downright': 'south',
            'rightup': 'east',
            'rightdown': 'north',
            'leftup': 'south',
            'leftdown': 'west',
            'upright': 'west',
            'upleft': 'north',
          };
          const dir1 = dir1Map[portents];
          const dir2 = dir2Map[portents];
          return output.filipino({
            dir1: output[dir1 ?? 'unknown'](),
            dir2: output[dir2 ?? 'unknown'](),
          });
        }
        return output[portents]();
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
        north: Outputs.north,
        northeast: Outputs.northeast,
        east: Outputs.east,
        southeast: Outputs.southeast,
        south: Outputs.south,
        southwest: Outputs.southwest,
        west: Outputs.west,
        northwest: Outputs.northwest,
        unknown: Outputs.unknown,
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
        clockwise: {
          en: '${dir1} => ${dir2}',
          ko: '${dir1} => ${dir2}',
        },
        filipino: {
          en: '${dir1} => ${dir2}',
          ko: '${dir1} => ${dir2}',
        },
        southeastOut: {
          en: 'Southeast Out',
          ko: '남동쪽 밖',
        },
        northwestOut: {
          en: 'Northwest Out',
          ko: '북서쪽 밖',
        },
        southwestOut: {
          en: 'Southwest Out',
          ko: '남서쪽 밖',
        },
        northeastOut: {
          en: 'Northeast Out',
          ko: '북동쪽 밖',
        },
        southeastIn: {
          en: 'Southeast In',
          ko: '남동쪽 안',
        },
        northeastIn: {
          en: 'Northeast In',
          ko: '북동쪽 안',
        },
        southwestIn: {
          en: 'Southwest In',
          ko: '남서쪽 안',
        },
        northwestIn: {
          en: 'Northwest In',
          ko: '북서쪽 안',
        },
      },
    },
    {
      id: 'DMU P1 Tele-Portent 2',
      // Not enough time to have lengthy TTS, but could configure this to give direction instead of move
      type: 'LosesEffect',
      netRegex: {
        effectId: [
          '130C',
          '130D',
          '130E',
          '130F',
          '13D7',
          '13D8',
          '13D9',
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
          '130C',
          '130D',
          '130E',
          '130F',
          '13D7',
          '13D8',
          '13D9',
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
      id: 'DMU P1 Indulgent Will and Idyllic Will Tethers (Early)',
      // There is 9.6s (not including 0.1s delay) until 503 Confuse or 131E
      // Sleep Applied. Corresponding Abilities are at ~9s (not including 0.1s delay)
      // Double-trouble Trap TTS comes out ~1s prior to the tethers
      type: 'Tether',
      netRegex: { id: headMarkerData['imageTether'], capture: true },
      condition: (data, matches) => {
        return data.me === matches.target && data.gravenImageCount === 3;
      },
      delaySeconds: 0.1,
      durationSeconds: 5.5,
      infoText: (data, matches, output) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined)
          return output.tetherOnYou();
        const x = actor.x;
        if (x < 100) // Graven Image 3: Indulgent Will target
          return output.indulgent();
        if (x < 108 && x > 106) // Graven Image 3: Idyllic Will target
          return output.idyllic();
        return output.tetherOnYou();
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
      id: 'DMU P1 Indulgent Will and Idyllic Will Tethers Reminder',
      type: 'Tether',
      netRegex: { id: headMarkerData['imageTether'], capture: true },
      condition: (data, matches) => {
        return data.me === matches.target && data.gravenImageCount === 3;
      },
      delaySeconds: 5.6,
      durationSeconds: 4,
      alertText: (data, matches, output) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined)
          return output.tetherOnYou();
        const x = actor.x;
        if (x < 100) // Graven Image 3: Indulgent Will target
          return output.indulgent();
        if (x < 108 && x > 106) // Graven Image 3: Idyllic Will target
          return output.idyllic();
        return output.tetherOnYou();
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
      id: 'DMU P1 Ave Maria (Early)',
      // BAB3 Ave Maria
      // The animation is visible ~9.89s before cast goes off, however
      // When animation becomes visible, the players will be asleep or
      // confused for another ~3.4s. Once the debuff ends the players have
      // ~6.4s to turn character
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: true },
      condition: (data, matches) => data.fakeEyeTowerIds.includes(matches.id),
      durationSeconds: 4.7,
      infoText: (_data, _matches, output) => output.lookAtLater(),
      outputStrings: {
        lookAtLater: {
          en: 'Look At Statue (later)',
          ko: '시선 바라보기 (나중에)',
        },
      },
    },
    {
      id: 'DMU P1 Indolent Will (Early)',
      // BAB4 Indolent Will
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: true },
      condition: (data, matches) => data.eyeTowerIds.includes(matches.id),
      durationSeconds: 4.7,
      infoText: (_data, _matches, output) => output.lookAwayLater(),
      outputStrings: {
        lookAwayLater: {
          en: 'Look Away From Statue (later)',
          ko: '시선 피하기 (나중에)',
        },
      },
    },
    {
      id: 'DMU P1 Mystery Magic Fire and Thunder',
      // Set 3: Only Fire and Thunder should be set
      type: 'StartsUsing',
      netRegex: { id: 'BA94', source: 'Kefka', capture: false },
      condition: (data) => {
        if (
          data.isFireTrue !== undefined &&
          data.isThunderTrue !== undefined &&
          data.phase === 'p1'
        )
          return true;
        return false;
      },
      infoText: (data, _matches, output) => {
        const fireMarker = data.fireMarker;
        const look = data.isTowerLookAway ? output.lookAway() : output.lookAt();
        if (
          (fireMarker === headMarkerData['dorito'] && data.isFireTrue) ||
          (fireMarker === headMarkerData['stack'] && !data.isFireTrue)
        )
          return data.isThunderTrue
            ? output.spreadTrueThunderLook({
              mech: output.spread(),
              thunder: output.trueThunder(),
              look: look,
            })
            : output.spreadFakeThunderLook({
              mech: output.spread(),
              thunder: output.fakeThunder(),
              look: look,
            });
        if (
          (fireMarker === headMarkerData['dorito'] && !data.isFireTrue) ||
          (fireMarker === headMarkerData['stack'] && data.isFireTrue)
        ) {
          return data.isThunderTrue
            ? output.stackTrueThunderLook({
              mech: output.stack(),
              thunder: output.trueThunder(),
              look: look,
            })
            : output.stackFakeThunderLook({
              mech: output.stack(),
              thunder: output.fakeThunder(),
              look: look,
            });
        }
      },
      outputStrings: mysteryMagicOutputStrings,
    },
    {
      id: 'DMU P4 Mystery Magic Fire and Thunder',
      type: 'StartsUsing',
      netRegex: { id: 'BA94', source: 'Kefka', capture: false },
      condition: (data) => {
        if (
          data.isFireTrue !== undefined &&
          data.isThunderTrue !== undefined &&
          data.phase === 'p4'
        )
          return true;
        return false;
      },
      infoText: (data, _matches, output) => {
        const fireMarker = data.fireMarker;
        if (
          (fireMarker === headMarkerData['dorito'] && data.isFireTrue) ||
          (fireMarker === headMarkerData['stack'] && !data.isFireTrue)
        )
          return data.isThunderTrue
            ? output.spreadTrueThunder({
              mech: output.spread(),
              thunder: output.trueThunder(),
            })
            : output.spreadFakeThunder({
              mech: output.spread(),
              thunder: output.fakeThunder(),
            });
        if (
          (fireMarker === headMarkerData['dorito'] && !data.isFireTrue) ||
          (fireMarker === headMarkerData['stack'] && data.isFireTrue)
        ) {
          return data.isThunderTrue
            ? output.stackTrueThunder({
              mech: output.stack(),
              thunder: output.trueThunder(),
            })
            : output.stackFakeThunder({
              mech: output.stack(),
              thunder: output.fakeThunder(),
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
      id: 'DMU P2 Path of Light Headmarker',
      type: 'HeadMarker',
      netRegex: {
        id: [
          headMarkerData['stackPath'],
          headMarkerData['conePath'],
          headMarkerData['spreadPath'],
        ],
        capture: true,
      },
      condition: Conditions.targetIsYou(),
      infoText: (_data, matches, output) => {
        const id = matches.id;
        const markers = {
          '02CB': 'stack',
          '02CD': 'cone',
          '02CC': 'spread',
        };
        const marker = markers[id];
        if (marker === undefined)
          return;
        return output[marker]();
      },
      outputStrings: {
        stack: {
          en: 'Stack Path on YOU',
          ko: '쉐어징 대상자',
        },
        cone: {
          en: 'Cone Path on YOU',
          ko: '부채꼴징 대상자',
        },
        spread: {
          en: 'Spread Path on YOU',
          ko: '산개징 대상자',
        },
      },
    },
    {
      id: 'DMU P2 Future\'s End/Past\'s End',
      // There are four end casts
      type: 'StartsUsing',
      netRegex: { id: ['BAD2', 'BAD3'], source: 'Kefka', capture: true },
      infoText: (_data, matches, output) => {
        return matches.id === 'BAD2' ? output.future() : output.past();
      },
      outputStrings: {
        future: {
          en: 'Future',
          ko: '미래',
        },
        past: {
          en: 'Past',
          ko: '과거',
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
      id: 'DMU Single Wing of Destruction',
      // BACD Wings of Destruction, Left wing highlight
      // BACE Wingso of Desctruction, Right wing highlight
      // Halfroom cleaves
      type: 'StartsUsing',
      netRegex: { id: ['BACD', 'BACE'], source: 'Kefka', capture: true },
      infoText: (_data, matches, output) => {
        if (matches.id === 'BACD')
          return output.right();
        return output.left();
      },
      outputStrings: {
        right: Outputs.right,
        left: Outputs.left,
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
    {
      id: 'DMU P3 Epic Hero/Fated Hero Debuffs',
      // Applied to 4 nearest players when Chaos and Exdeath finish casting
      // C2E2/C2E3 The Decisive Battle
      // 1060 Epic Hero: Can only damage Chaos, preferred by Melee DPS
      // 1062 Fated Hero: Can only damage Exdeath, preferred by Ranged DPS
      // These fall off once Exdeath casts BB12 Thunder III
      type: 'GainsEffect',
      netRegex: { effectId: ['1060', '1062'], capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, matches, output) => {
        return matches.effectId === '1060' ? output.epic() : output.fated();
      },
      outputStrings: {
        epic: {
          en: 'Attack Chaos',
          ko: '카오스 공격',
        },
        fated: {
          en: 'Attack Exdeath',
          ko: '엑스데스 공격',
        },
      },
    },
    {
      id: 'DMU P3 Bowels of Agony',
      type: 'StartsUsing',
      netRegex: { id: 'BAF2', source: 'Chaos', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'DMU P3 Headwind/Tailwind Debuffs',
      // Applied at BAF2 Bowels of Agony
      // Debuffs trigger if hit by certain sources, causing a knockback
      // 642 Headwind: Face away from damage source
      // 643 Tailwind: Face towards damage source
      type: 'GainsEffect',
      netRegex: { effectId: ['642', '643'], capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, matches, output) => {
        return matches.effectId === '642' ? output.headwind() : output.tailwind();
      },
      outputStrings: {
        headwind: {
          en: 'Headwind on YOU',
          ko: '혼돈의 바람 대상자',
        },
        tailwind: {
          en: 'Tailwind on You',
          ko: '혼돈의 역풍 대상자',
        },
      },
    },
    {
      id: 'DMU P3 Longitudinal Implosion',
      type: 'StartsUsing',
      netRegex: { id: 'BAFD', source: 'Chaos', capture: false },
      infoText: (_data, _matches, output) => output.sides(),
      outputStrings: {
        sides: Outputs.sidesThenFrontBack,
      },
    },
    {
      id: 'DMU P3 Latitudinal Implosion',
      type: 'StartsUsing',
      netRegex: { id: 'BAFE', source: 'Chaos', capture: false },
      infoText: (_data, _matches, output) => output.frontBack(),
      outputStrings: {
        frontBack: Outputs.frontBackThenSides,
      },
    },
    {
      id: 'DMU P3 Vaccuum Wave',
      type: 'StartsUsing',
      netRegex: { id: 'BB13', source: 'Chaos', capture: true },
      infoText: (_data, matches, output) => {
        return output.knockbackFromBoss({ chaos: matches.source });
      },
      outputStrings: {
        knockbackFromBoss: {
          en: 'Knockback from ${chaos}',
          ko: '${chaos}에서 넉백',
        },
      },
    },
    {
      id: 'DMU P3 Damning Edict',
      type: 'StartsUsing',
      netRegex: { id: 'BB01', source: 'Chaos', capture: true },
      infoText: (_data, matches, output) => {
        return output.getBehindTarget({ target: matches.source });
      },
      outputStrings: {
        getBehindTarget: {
          en: 'Get Behind ${target}',
          ko: '${target} 뒤로',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Future\'s End/Past\'s End': 'Future/Past\'s End',
        'Spelldriver/Spellscatter/Spellwave': 'Spelldriver/scatter/wave',
        'Longitudinal Implosion/Latitudinal Implosion': 'Long/Lat Implosion',
      },
    },
    {
      'locale': 'de',
      'missingTranslations': true,
      'replaceSync': {
        'Black Hole': 'schwarz(?:e|er|es|en) Loch',
        'Chaos': 'Chaos',
        '(?<! )Exdeath': 'Exdeath',
        'Graven Image': 'heilig(?:e|er|es|en) Statue',
        'Kefka': 'Kefka',
        'Neo Exdeath': 'Neo Exdeath',
      },
      'replaceText': {
        'Aero III Assault': 'Wallendes Windga',
        'Aetherlink': 'Ätherbund',
        'All Things Ending': 'Ende aller Dinge',
        'Ave Maria': 'Ave Maria',
        'Big Bang': 'Quantengravitation',
        'Black Antilight': 'Dunkellicht des Toten',
        'Black Hole': 'Schwarzes Loch',
        'Black Spark': 'Schwarzer Funke',
        'Blizzard III(?! Blowout)': 'Eisga',
        'Blizzard III Blowout': 'Expandierendes Eisga',
        'Bowels of Agony': 'Quälende Eingeweide',
        'Catastrophic Choice': 'Katastrophenwahl',
        'Celestriad': 'Dreigestirn',
        'Chaotic Flare': 'Chaotische Flare',
        'Chaotic Flood': 'Chaotische Flut',
        'Chaotic Holy': 'Chaotisches Sanctus',
        'Cyclone': 'Tornado',
        'Damning Edict': 'Verdammendes Edikt',
        'Death Bolt': 'Todeskeil',
        'Death Bomb': 'Todesbombe',
        'Death Shriek': 'Todesschrei',
        'Death Surge': 'Todeswallung',
        'Death Wave': 'Todeswelle',
        'Definition of Insanity': 'Rekonstruktion',
        'Double-Trouble Trap': 'Fiese Falle',
        '(?<! )Earthquake': 'Erdbeben',
        'Edge of Death': 'Abgrund des Todes',
        'Explosion': 'Explosion',
        'Fell Forces': 'Magieangriff',
        '(?<! )Fire III': 'Feuga',
        'Flagrant Fire III': 'Flammendes Feuga',
        '(?<! )Flare(?! )': 'Flare',
        'Flare Diffusion': 'Flare-Diffusion',
        '(?<! )Flood(?! )': 'Flut',
        'Flood of Naught': 'Flut der Leere',
        'Forsaken(?! [BGN])': 'Verloren',
        'Forsaken Bonds': 'Verlorene Bunde',
        'Forsaken Ground': 'Verlorener Boden',
        'Forsaken Null': 'Verlorenes Sein',
        'Future\'s End': 'Ende der Zukunft',
        'Grand Cross': 'Supernova',
        'Graven Image': 'Göttliche Statue',
        'Gravitas': 'Gravitas',
        'Gravitational Wave': 'Gravitationswelle',
        'Gravity III': 'Graviga',
        '(?<! )Holy': 'Sanctus',
        'Hyperdrive': 'Hyperantrieb',
        'Idyllic Will': 'Idyllischer Wille',
        'Indolent Will': 'Träger Wille',
        'Indulgent Will': 'Nachsichtiger Wille',
        'Inferno': 'Flamme',
        'Intemperate Will': 'Unmäßiger Wille',
        'Kefka Says': 'Schelmische Seele',
        'Knock Down': 'Einschlag',
        'Latitudinal Implosion': 'Horizontale Implosion',
        'Light of Judgment': 'Licht des Urteils',
        'Longitudinal Implosion': 'Vertikale Implosion',
        'Look upon Me and Despair': 'Voller Körpereinsatz',
        'Maddening Orchestra': 'Symphonie des Wahns',
        'Mana Charge': 'Mana-Aufladung',
        'Mana Release': 'Mana-Entladung',
        'Max': 'Riese',
        'Meteor': 'Meteo',
        'Mystery Magic': 'Mysteriöse Magie',
        'Nothingness': 'Welle der Leere',
        'Past\'s End': 'Ende der Vergangenheit',
        'Pulse Wave': 'Pulswelle',
        '(?<![ h])Quake': 'Beben',
        'Revolting Ruin III': 'Revoltierendes Ruinga',
        'Shocking Impact': 'Heftiger Impakt',
        'Shockwave': 'Schockwelle',
        'Slap Happy': 'Kolossale Klatsche',
        'Spelldriver': 'Risikofaktor: Antrieb',
        'Spellscatter': 'Risikofaktor: Streuung',
        'Spellwave': 'Risikofaktor: Welle',
        'Stomp-a-Mole': 'Schallender Stampfer',
        'Stray Apocalypse': 'Chaosende',
        'Stray Entropy': 'Chaoswirbel',
        'Stray Flames': 'Chaosflammen',
        'Stray Spray': 'Chaosspritzer',
        'Tele-trouncing': 'Tückischer Teleport',
        'The Decisive Battle': 'Entscheidungsschlacht',
        'The Path of Light': 'Pfad des Lichts',
        'Thrumming Thunder III': 'Brachiales Blitzga',
        '(?<! )Thunder III': 'Blitzga',
        'Tornado': 'Tornado',
        'Trance': 'Trance',
        'Trine': 'Trine',
        'Tsunami': 'Tsunami',
        'Ultima Blaster': 'Ultima-Kanone',
        'Ultima Repeater': 'Multi-Ultima',
        'Ultima Upsurge': 'Ultima-Wallung',
        'Ultimate Embrace': 'Ultima-Umarmung',
        'Umbra Smash': 'Schattenschlag',
        'Vacuum Wave': 'Vakuumwelle',
        'Vitrophyre': 'Vitrophyr',
        'Wave Cannon': 'Wellenkanone',
        'White Antilight': 'Dunkellicht des Lebenden',
        'White Hole': 'Weißes Loch',
        'Wings of Destruction': 'Vernichtungsschwinge',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Black Hole': 'trou noir',
        'Chaos': 'Chaos',
        '(?<! )Exdeath': 'Exdeath',
        'Graven Image': 'statue divine',
        'Kefka': 'Kefka',
        'Neo Exdeath': 'Néo-Exdeath',
      },
      'replaceText': {
        'Aero III Assault': 'Méga Vent véhément',
        'Aetherlink': 'Lien éthéré',
        'All Things Ending': 'Fin de toutes choses',
        'Ave Maria': 'Ave Maria',
        'Big Bang': 'Saillie',
        'Black Antilight': 'Lumière sombre du défunt',
        'Black Hole': 'Trou noir',
        'Black Spark': 'Étincelle noire',
        'Blizzard III(?! Blowout)': 'Méga Glace',
        'Blizzard III Blowout': 'Méga Glace propagatrice',
        'Bowels of Agony': 'Entrailles de l\'agonie',
        'Catastrophic Choice': 'Catastrophe double',
        'Celestriad': 'Tristella',
        'Chaotic Flare': 'Brasier chaotique',
        'Chaotic Flood': 'Déluge chaotique',
        'Chaotic Holy': 'Miracle chaotique',
        'Cyclone': 'Tornade',
        'Damning Edict': 'Décret accablant',
        'Death Bolt': 'Éclair fatal',
        'Death Bomb': 'Bombe fatale',
        'Death Shriek': 'Hurlement fatal',
        'Death Surge': 'Poussée fatale',
        'Death Wave': 'Vague fatale',
        'Definition of Insanity': 'Reconstruction',
        'Double-Trouble Trap': 'Pièges successifs',
        '(?<! )Earthquake': 'Séisme',
        'Edge of Death': 'Lisière de la mort',
        'Explosion': 'Explosion',
        'Fell Forces': 'Frappe maléfique',
        '(?<! )Fire III': 'Méga Feu',
        'Flagrant Fire III': 'Méga Feu faufilant',
        '(?<! )Flare(?! )': 'Brasier',
        'Flare Diffusion': 'Brasier diffuseur',
        '(?<! )Flood(?! )': 'Déluge',
        'Flood of Naught': 'Crue du néant',
        'Forsaken(?! [BGN])': 'Cataclysme',
        'Forsaken Bonds': 'Cataclysme lié',
        'Forsaken Ground': 'Cataclysme tellurique',
        'Forsaken Null': 'Cataclysme initial',
        'Future\'s End': 'Fin du futur',
        'Grand Cross': 'Croix suprême',
        'Graven Image': 'Statue divine',
        'Gravitas': 'Tir gravitationnel',
        'Gravitational Wave': 'Onde gravitationnelle',
        'Gravity III': 'Méga Gravité',
        '(?<! )Holy': 'Miracle',
        'Hyperdrive': 'Colonne de feu',
        'Idyllic Will': 'Volonté idyllique',
        'Indolent Will': 'Volonté indolente',
        'Indulgent Will': 'Volonté indulgente',
        'Inferno': 'Flammes',
        'Intemperate Will': 'Volonté intempérante',
        'Kefka Says': 'Âmes facétieuses',
        'Knock Down': 'Impact de canon',
        'Latitudinal Implosion': 'Implosion horizontale',
        'Light of Judgment': 'Triade guerrière',
        'Longitudinal Implosion': 'Implosion verticale',
        'Look upon Me and Despair': 'Moi, au naturel',
        'Maddening Orchestra': 'Symphonie de la démence',
        'Mana Charge': 'Concentration de mana',
        'Mana Release': 'Décharge de mana',
        'Max': 'Maxi',
        'Meteor': 'Météore',
        'Mystery Magic': 'Magie énigmatique',
        'Nothingness': 'Rayon du néant',
        'Past\'s End': 'Fin du passé',
        'Primordial Crust Quake': '',
        'Pulse Wave': 'Pulsation spirituelle',
        '(?<![ h])Quake': 'Séisme',
        'Revolting Ruin III': 'Méga Ruine ravageuse',
        'Shocking Impact': 'Impact puissant',
        'Shockwave': 'Onde de choc',
        'Slap Happy': 'Gifle cinglante',
        'Spelldriver': 'Péril magique chargé',
        'Spellscatter': 'Peril magique dispersé',
        'Spellwave': 'Peril magique ondulé',
        'Stomp-a-Mole': 'Piétinement frénétique',
        'Stray Apocalypse': 'Crépuscule chaotique',
        'Stray Entropy': 'Tourbillon chaotique',
        'Stray Flames': 'Flammes du chaos',
        'Stray Spray': 'Eaux du chaos',
        'Tele-trouncing': 'Téléportation perfide',
        'The Decisive Battle': 'Combat décisif',
        'The Path of Light': 'Voie de Lumière',
        'Thrumming Thunder III': 'Méga Foudre fourmillante',
        '(?<! )Thunder III': 'Méga Foudre',
        'Tornado': 'Tornade',
        'Trance': 'Transe',
        'Trine': 'Trine',
        'Tsunami': 'Raz-de-marée',
        'Ultima Blaster': 'Ultima fulgurante',
        'Ultima Repeater': 'Ultima en pagaille',
        'Ultima Upsurge': 'Ultima ulcérante',
        'Ultimate Embrace': 'Étreinte fatidique',
        'Umbra Smash': 'Fracas ombral',
        'Vacuum Wave': 'Vague de vide',
        'Vitrophyre': 'Vitrophyre',
        'Wave Cannon': 'Canon plasma',
        'White Antilight': 'Lumière sombre du vivant',
        'White Hole': 'Trou blanc',
        'Wings of Destruction': 'Aile de la destruction',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Black Hole': 'ブラックホール',
        'Chaos': 'カオス',
        '(?<! )Exdeath': 'エクスデス',
        'Graven Image': '神々の像',
        'Kefka': 'ケフカ',
        'Neo Exdeath': 'ネオエクスデス',
      },
      'replaceText': {
        'Aero III Assault': 'ずんずんエアロガ',
        'Aetherlink': 'エーテルリンク',
        'All Things Ending': '消滅の脚',
        'Ave Maria': 'アヴェ・マリア',
        'Big Bang': '突出',
        'Black Antilight': '死者の暗黒光',
        'Black Hole': 'ブラックホール',
        'Black Spark': 'ブラックスパーク',
        'Blizzard III(?! Blowout)': 'ブリザガ',
        'Blizzard III Blowout': 'ひろげるブリザガ',
        'Bowels of Agony': 'バウル・オブ・アゴニー',
        'Catastrophic Choice': '二択のカタストロフ',
        'Celestriad': 'スリースターズ',
        'Chaotic Flare': 'カオティックフレア',
        'Chaotic Flood': 'カオティックフラッド',
        'Chaotic Holy': 'カオティックホーリー',
        'Cyclone': 'たつまき',
        'Damning Edict': 'ダミングイーディクト',
        'Death Bolt': 'デスボルト',
        'Death Bomb': 'デスボム',
        'Death Shriek': 'デスシュリーク',
        'Death Surge': 'デスサージ',
        'Death Wave': 'デスウェーブ',
        'Definition of Insanity': '再構築',
        'Double-Trouble Trap': 'つぎつぎトラップ',
        '(?<! )Earthquake': 'じしん',
        'Edge of Death': '生死の境界',
        'Explosion': '爆発',
        'Fell Forces': '魔撃',
        '(?<! )Fire III': 'ファイガ',
        'Flagrant Fire III': 'めらめらファイガ',
        '(?<! )Flare(?! )': 'フレア',
        'Flare Diffusion': 'フレアディフュージョン',
        '(?<! )Flood(?! )': 'フラッド',
        'Flood of Naught': '無の氾濫',
        'Forsaken(?! [BGN])': 'ミッシング',
        'Forsaken Bonds': 'ミッシング・ボンド',
        'Forsaken Ground': 'ミッシング・グラウンド',
        'Forsaken Null': 'ミッシング・ゼロ',
        'Future\'s End': '未来の終焉',
        'Grand Cross': 'グランドクロス',
        'Graven Image': '神々の像',
        'Gravitas': '重力弾',
        'Gravitational Wave': '重力波',
        'Gravity III': 'グラビガ',
        '(?<! )Holy': 'ホーリー',
        'Hyperdrive': 'ハイパードライブ',
        'Idyllic Will': '睡魔の神気',
        'Indolent Will': '惰眠の神気',
        'Indulgent Will': '聖母の神気',
        'Inferno': 'ほのお',
        'Intemperate Will': '撲殺の神気',
        'Kefka Says': 'おちょくりソウル',
        'Knock Down': '着弾',
        'Latitudinal Implosion': 'ホリゾンタルインプロージョン',
        'Light of Judgment': '裁きの光',
        'Longitudinal Implosion': 'ヴァーティカルインプロージョン',
        'Look upon Me and Despair': 'ありのままのボクチン',
        'Maddening Orchestra': '狂気のオーケストラ',
        'Mana Charge': 'マジックチャージ',
        'Mana Release': 'マジックアウト',
        'Max': 'マキシマム',
        'Meteor': 'メテオ',
        'Mystery Magic': 'なぞなぞマジック',
        'Nothingness': '無の波動',
        'Past\'s End': '過去の終焉',
        'Pulse Wave': '波動弾',
        '(?<![ h])Quake': 'クエイク',
        'Revolting Ruin III': 'ばりばりルインガ',
        'Shocking Impact': '重衝撃',
        'Shockwave': '衝撃波',
        'Slap Happy': 'びんびんビンタ',
        'Spelldriver': 'スペルハザード・ドライブ',
        'Spellscatter': 'スペルハザード・スキャッター',
        'Spellwave': 'スペルハザード・ウェーブ',
        'Stomp-a-Mole': 'どんどこ地団駄',
        'Stray Apocalypse': '混沌の終末',
        'Stray Entropy': '混沌の渦',
        'Stray Flames': '混沌の炎',
        'Stray Spray': '混沌の水',
        'Tele-trouncing': 'ずびずばテレポ',
        'The Decisive Battle': '決戦',
        'The Path of Light': '光の波動',
        'Thrumming Thunder III': 'もりもりサンダガ',
        '(?<! )Thunder III': 'サンダガ',
        'Tornado': 'トルネド',
        'Trance': 'トランス',
        'Trine': 'トライン',
        'Tsunami': 'つなみ',
        'Ultima Blaster': 'アルテマブラスター',
        'Ultima Repeater': '連続アルテマ',
        'Ultima Upsurge': 'どきどきアルテマ',
        'Ultimate Embrace': '終末の双腕',
        'Umbra Smash': 'アンブラスマッシュ',
        'Vacuum Wave': '真空波',
        'Vitrophyre': '岩石弾',
        'Wave Cannon': '波動砲',
        'White Antilight': '生者の暗黒光',
        'White Hole': 'ホワイトホール',
        'Wings of Destruction': '破壊の翼',
      },
    },
    {
      'locale': 'cn',
      'missingTranslations': true,
      'replaceSync': {
        'Black Hole': '黑洞',
        'Chaos': '卡奥斯',
        '(?<! )Exdeath': '艾克斯迪司',
        'Graven Image': '众神之像',
        'Kefka': '凯夫卡',
        'Neo Exdeath': '新生艾克斯迪司',
      },
      'replaceText': {
        'Aero III Assault': '疼飕飕暴风',
        'All Things Ending': '消灭之脚',
        'Ave Maria': '圣母颂',
        'Big Bang': '顶起',
        'Black Antilight': '死者暗黑光',
        'Black Hole': '黑洞',
        'Black Spark': '暗黑火花',
        'Blizzard III(?! Blowout)': '冰封',
        'Blizzard III Blowout': '扩大大冰封',
        'Bowels of Agony': '深层痛楚',
        'Celestriad': '三星',
        'Damning Edict': '诅咒敕令',
        'Death Bolt': '死亡落雷',
        'Death Bomb': '死亡爆弹',
        'Death Shriek': '死亡尖叫',
        'Death Surge': '死亡波涛',
        'Death Wave': '死亡波纹',
        'Double-Trouble Trap': '连环环陷阱',
        '(?<! )Earthquake': '地震',
        'Edge of Death': '生死之境',
        'Explosion': '爆炸',
        'Fell Forces': '魔击',
        '(?<! )Fire III': '爆炎',
        'Flagrant Fire III': '呼啦啦爆炎',
        '(?<! )Flare(?! )': '核爆',
        '(?<! )Flood(?! )': '洪水',
        'Flood of Naught': '无之泛滥',
        'Forsaken(?! [BGN])': '遗弃末世',
        'Future\'s End': '未来终结',
        'Grand Cross': '大十字',
        'Graven Image': '众神之像',
        'Gravitas': '重力弹',
        'Gravitational Wave': '重力波',
        'Gravity III': '强重力',
        '(?<! )Holy': '神圣',
        'Hyperdrive': '超驱动',
        'Idyllic Will': '睡魔的神气',
        'Indolent Will': '懒惰的神气',
        'Indulgent Will': '圣母的神气',
        'Intemperate Will': '扑杀的神气',
        'Knock Down': '轰击',
        'Latitudinal Implosion': '纬度聚爆',
        'Light of Judgment': '制裁之光',
        'Longitudinal Implosion': '经度聚爆',
        'Mana Charge': '魔法储存',
        'Mana Release': '魔法放出',
        'Max': '放大',
        'Meteor': '陨石',
        'Mystery Magic': '玄乎乎魔法',
        'Nothingness': '无之波动',
        'Past\'s End': '过去终结',
        'Pulse Wave': '波动弹',
        '(?<![ h])Quake': '地震',
        'Revolting Ruin III': '恶狠狠毁荡',
        'Shockwave': '冲击波',
        'Spelldriver': '咏唱危机·驱动',
        'Spellscatter': '咏唱危机·散碎',
        'Spellwave': '咏唱危机·波动',
        'Stray Flames': '混沌之炎',
        'Stray Spray': '混沌之水',
        'Tele-trouncing': '唰啦啦传送',
        'The Decisive Battle': '决战',
        'The Path of Light': '光之波动',
        'Thrumming Thunder III': '劈啪啪暴雷',
        '(?<! )Thunder III': '暴雷',
        'Tornado': '龙卷',
        'Trine': '异三角',
        'Ultima Upsurge': '扑腾腾究极',
        'Ultimate Embrace': '终末双腕',
        'Umbra Smash': '本影爆碎',
        'Vacuum Wave': '真空波',
        'Vitrophyre': '岩石弹',
        'Wave Cannon': '波动炮',
        'White Antilight': '生者暗黑光',
        'White Hole': '白洞',
        'Wings of Destruction': '破坏之翼',
      },
    },
    {
      'locale': 'ko',
      'missingTranslations': true,
      'replaceSync': {
        'Black Hole': '블랙홀',
        'Chaos': '카오스',
        '(?<! )Exdeath': '엑스데스',
        'Graven Image': '신들의 상',
        'Kefka': '케프카',
        'Neo Exdeath': '네오 엑스데스',
      },
      'replaceText': {
        '\\(Pop Window\\)': '(활성화)',
        '\\(castbar\\)': '(시전바)',
        '\\(Chaos': '(카오스',
        '\\(Exdeath': '(엑스데스',
        '--numbers--': '--숫자--',
        '--accretion\\?--': '--혼돈의 진흙?--',
        '--untargetable\\?--': '--타겟 불가능?--',
        '--middle\\?--': '--중앙?--',
        '--Chaos untargetable\\?--': '--카오스 타겟 불가능?--',
        '--Exdeath untargetable\\?--': '--엑스데스 타겟 불가능?--',
        'Accretion Earthquake': '혼돈의 진흙 지진',
        'Aero III Assault': '갈기갈기 에어로가',
        'Aetherlink': '에테르 연결',
        'All Things Ending': '소멸의 발차기',
        'Ave Maria': '아베 마리아',
        'Big Bang': '돌출',
        'Black Antilight': '죽은 자의 암흑광',
        'Black Hole': '블랙홀',
        'Black Spark': '검은 불꽃',
        'Blackblood': '흑혈',
        'Blizzard III(?! Blowout)': '블리자가',
        'Blizzard III Blowout': '널리널리 블리자가',
        'Bowels of Agony': '고통의 심핵',
        'Catastrophic Choice': '두 가지 선택의 참사',
        'Celestriad': '세 개의 별',
        'Chaotic Flare': '혼돈의 플레어',
        'Chaotic Flood': '혼돈의 홍수',
        'Chaotic Holy': '혼돈의 홀리',
        'Cyclone': '회오리',
        'Damning Edict': '파멸 포고',
        'Death Bolt': '죽음의 번개',
        'Death Bomb': '죽음의 폭탄',
        'Death Shriek': '죽음의 비명',
        'Death Surge': '죽음의 격동',
        'Death Wave': '죽음의 파도',
        'Definition of Insanity': '재구성',
        'Double-Trouble Trap': '줄줄이 함정',
        'Down for the Count': '행동 불가',
        '(?<! )Earthquake': '지진',
        'Edge of Death': '생사의 갈림길',
        'Explosion': '폭발',
        'Fell Forces': '마격',
        '(?<! )Fire III': '파이가',
        'Flagrant Fire III': '이글이글 파이가',
        '(?<! )Flare(?! )': '플레어',
        'Flare Diffusion': '확산 플레어',
        '(?<! )Flood(?! )': '플러드',
        'Flood of Naught': '무의 범람',
        'Forsaken(?! [BGN])': '행방불명',
        'Forsaken Bonds': '행방불명: 유대',
        'Forsaken Ground': '행방불명: 지면',
        'Forsaken Null': '행방불명: 소실',
        'Future\'s End/Past\'s End': '과거/미래의 종언',
        'Grand Cross': '그랜드크로스',
        'Graven Image': '신들의 상',
        'Gravitas': '중력탄',
        'Gravitational Wave': '중력파',
        'Gravity III': '그라비가',
        '(?<! )Holy': '홀리',
        'Hyperdrive': '하이퍼드라이브',
        'Idyllic Will': '수마의 신기',
        'Indolent Will': '태만의 신기',
        'Indulgent Will': '성모의 신기',
        'Inferno': '화염',
        'Intemperate Will': '박살의 신기',
        'Kefka Says': '꼭두각시 영혼',
        'Knock Down': '착탄',
        'Light of Judgment': '심판의 빛',
        'Longitudinal Implosion/Latitudinal Implosion': '가로/세로 내파',
        'Look upon Me and Despair': '있는 그대로의 나',
        'Maddening Orchestra': '광기의 오케스트라',
        'Mana Charge': '마력 충전',
        'Mana Release': '마력 방출',
        'Max': '맥시멈',
        'Meteor': '메테오',
        'Mystery Magic': '알쏭달쏭 마법',
        'Nothingness': '무의 파동',
        'Primordial Crust Quake': '혼돈의 흙 퀘이크',
        'Pulse Wave': '파동탄',
        '(?<![ h])Quake': '퀘이크',
        'Revolting Ruin III': '파삭파삭 루인가',
        'Shocking Impact': '겹충격',
        'Shockwave': '충격파',
        'Slap Happy': '철썩철썩 따귀',
        'Spelldriver/Spellscatter/Spellwave': '위험한 주문: 집중/분산/파동',
        'Stomp-a-Mole': '쿵쿵 발 구르기',
        'Stray Apocalypse': '혼돈의 종말',
        'Stray Entropy': '혼돈의 와류',
        'Stray Flames': '혼돈의 불',
        'Stray Spray': '혼돈의 물',
        'Tele-trouncing': '성큼성큼 텔레포',
        'The Decisive Battle': '결전',
        'The Path of Light': '빛의 파동',
        'Thrumming Thunder III': '찌릿찌릿 선더가',
        '(?<! )Thunder III': '선더가',
        'Tornado': '토네이도',
        'Trance': '자아도취',
        'Trine': '트라인',
        'Tsunami': '해일',
        'Ultima Blaster': '알테마 블래스터',
        'Ultima Repeater': '연속 알테마',
        'Ultima Upsurge': '두근두근 알테마',
        'Ultimate Embrace': '종말의 포옹',
        'Umbra Smash': '그림자 타격',
        'Vacuum Wave': '진공파',
        'Vitrophyre': '암석탄',
        'Wave Cannon': '파동포',
        'White Antilight': '산 자의 암흑광',
        'White Hole': '화이트홀',
        'Wings of Destruction': '파괴의 날개 ',
      },
    },
  ],
});
