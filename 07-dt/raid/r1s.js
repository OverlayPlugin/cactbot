// MapEffect tile map:
// 00 01 02 03
// 04 05 06 07
// 08 09 0A 0B
// 0C 0D 0E 0F
// +0x10 is a duplicate used for E&E knockback display
const mapEffectTileState = {
  'cracked': '00020001',
  'clear': '00040004',
  'broken': '00200010',
  'refreshing': '00800004',
  'rebuilding': '01000004', // rebuilding from broken
};
const mapEffectTileOverlay = {
  'clear': '00040004',
  'willBreak': '00080010',
  'willCrack': '00200004',
};
const mapEffectData = {
  '00': {
    'location': '00',
    'centerX': 85,
    'centerY': 85,
    ...mapEffectTileState,
  },
  '01': {
    'location': '01',
    'centerX': 95,
    'centerY': 85,
    ...mapEffectTileState,
  },
  '02': {
    'location': '02',
    'centerX': 105,
    'centerY': 85,
    ...mapEffectTileState,
  },
  '03': {
    'location': '03',
    'centerX': 115,
    'centerY': 85,
    ...mapEffectTileState,
  },
  '04': {
    'location': '04',
    'centerX': 85,
    'centerY': 95,
    ...mapEffectTileState,
  },
  '05': {
    'location': '05',
    'centerX': 95,
    'centerY': 95,
    ...mapEffectTileState,
  },
  '06': {
    'location': '06',
    'centerX': 105,
    'centerY': 95,
    ...mapEffectTileState,
  },
  '07': {
    'location': '07',
    'centerX': 115,
    'centerY': 95,
    ...mapEffectTileState,
  },
  '08': {
    'location': '08',
    'centerX': 85,
    'centerY': 105,
    ...mapEffectTileState,
  },
  '09': {
    'location': '09',
    'centerX': 95,
    'centerY': 105,
    ...mapEffectTileState,
  },
  '0A': {
    'location': '0A',
    'centerX': 105,
    'centerY': 105,
    ...mapEffectTileState,
  },
  '0B': {
    'location': '0B',
    'centerX': 115,
    'centerY': 105,
    ...mapEffectTileState,
  },
  '0C': {
    'location': '0C',
    'centerX': 85,
    'centerY': 115,
    ...mapEffectTileState,
  },
  '0D': {
    'location': '0D',
    'centerX': 95,
    'centerY': 115,
    ...mapEffectTileState,
  },
  '0E': {
    'location': '0E',
    'centerX': 105,
    'centerY': 115,
    ...mapEffectTileState,
  },
  '0F': {
    'location': '0F',
    'centerX': 115,
    'centerY': 115,
    ...mapEffectTileState,
  },
  '10': {
    'location': '10',
    'centerX': 85,
    'centerY': 85,
    ...mapEffectTileOverlay,
  },
  '11': {
    'location': '11',
    'centerX': 95,
    'centerY': 85,
    ...mapEffectTileOverlay,
  },
  '12': {
    'location': '12',
    'centerX': 105,
    'centerY': 85,
    ...mapEffectTileOverlay,
  },
  '13': {
    'location': '13',
    'centerX': 115,
    'centerY': 85,
    ...mapEffectTileOverlay,
  },
  '14': {
    'location': '14',
    'centerX': 85,
    'centerY': 95,
    ...mapEffectTileOverlay,
  },
  '15': {
    'location': '15',
    'centerX': 95,
    'centerY': 95,
    ...mapEffectTileOverlay,
  },
  '16': {
    'location': '16',
    'centerX': 105,
    'centerY': 95,
    ...mapEffectTileOverlay,
  },
  '17': {
    'location': '17',
    'centerX': 115,
    'centerY': 95,
    ...mapEffectTileOverlay,
  },
  '18': {
    'location': '18',
    'centerX': 85,
    'centerY': 105,
    ...mapEffectTileOverlay,
  },
  '19': {
    'location': '19',
    'centerX': 95,
    'centerY': 105,
    ...mapEffectTileOverlay,
  },
  '1A': {
    'location': '1A',
    'centerX': 105,
    'centerY': 105,
    ...mapEffectTileOverlay,
  },
  '1B': {
    'location': '1B',
    'centerX': 115,
    'centerY': 105,
    ...mapEffectTileOverlay,
  },
  '1C': {
    'location': '1C',
    'centerX': 85,
    'centerY': 115,
    ...mapEffectTileOverlay,
  },
  '1D': {
    'location': '1D',
    'centerX': 95,
    'centerY': 115,
    ...mapEffectTileOverlay,
  },
  '1E': {
    'location': '1E',
    'centerX': 105,
    'centerY': 115,
    ...mapEffectTileOverlay,
  },
  '1F': {
    'location': '1F',
    'centerX': 115,
    'centerY': 115,
    ...mapEffectTileOverlay,
  },
};
const headMarkerData = {
  // Vfx Path: tank_lockon02k1
  tankbuster: '00DA',
  // Vfx Path: lockon8_t0w
  lineStack: '00F4',
  // Vfx Path: loc05sp_05a_se_p
  spreadMarker: '0178',
  // Vfx Path: m0884_vanish_7sec_p1
  pawprint: '021A',
};
Options.Triggers.push({
  id: 'AacLightHeavyweightM1Savage',
  zoneId: ZoneId.AacLightHeavyweightM1Savage,
  timelineFile: 'r1s.txt',
  initData: () => ({
    actorSetPosTracker: {},
  }),
  triggers: [
    {
      id: 'R1S One-two Paw Right Left',
      type: 'StartsUsing',
      netRegex: { id: '9436', source: 'Black Cat', capture: false },
      durationSeconds: 9.5,
      response: Responses.goLeftThenRight(),
    },
    {
      id: 'R1S One-two Paw Left Right',
      type: 'StartsUsing',
      netRegex: { id: '9439', source: 'Black Cat', capture: false },
      durationSeconds: 9.5,
      response: Responses.goRightThenLeft(),
    },
    {
      id: 'R1S Biscuit Maker',
      type: 'StartsUsing',
      netRegex: { id: '9495', source: 'Black Cat', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'R1S Bloody Scratch',
      type: 'StartsUsing',
      netRegex: { id: '9494', source: 'Black Cat', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R1S ActorSetPos Collector',
      type: 'ActorSetPos',
      netRegex: { id: '4[0-9A-F]{7}', capture: true },
      run: (data, matches) => {
        data.actorSetPosTracker[matches.id] = matches;
      },
    },
    {
      id: 'R1S Mouser',
      type: 'StartsUsing',
      netRegex: { id: '996C', capture: true },
      condition: (data, matches) => {
        const actorSetPosLine = data.actorSetPosTracker[matches.sourceId];
        if (actorSetPosLine === undefined)
          return false;
        const x = parseFloat(actorSetPosLine.x);
        const y = parseFloat(actorSetPosLine.y);
        const loc = Object.values(mapEffectData)
          .find((tile) =>
            tile.location.startsWith('0') && Math.abs(tile.centerX - x) < 1 &&
            Math.abs(tile.centerY - y) < 1
          );
        if (loc === undefined)
          return false;
        const tile = loc.location;
        if (tile !== '09' && tile !== '0A')
          return false;
        data.mouserMatchedTile = tile;
        return true;
      },
      // We don't need a suppressSeconds since only one of the SW/SE tiles will get hit twice
      durationSeconds: 11,
      infoText: (data, _matches, output) => {
        const dangerTile = data.mouserMatchedTile;
        if (dangerTile === undefined)
          return false;
        // Danger tile is SW, so safe movement is SW => SE (Stay)
        if (dangerTile === '09') {
          return output.swSeStay({
            dir1: output['dirSW'](),
            sep: output.separator(),
            dir2: output['dirSE'](),
          });
        }
        const dirs = ['dirSW', 'dirSE', 'dirSW'].map((e) => output[e]());
        return output.combo({ dirs: dirs.join(output.separator()) });
      },
      run: (data) => delete data.mouserMatchedTile,
      outputStrings: {
        ...Directions.outputStrings8Dir,
        swSeStay: {
          en: '${dir1} ${sep} ${dir2} (Stay)',
        },
        separator: {
          en: ' => ',
          de: ' => ',
          ja: ' => ',
          cn: ' => ',
        },
        combo: {
          en: '${dirs}',
          de: '${dirs}',
          ja: '${dirs}',
          cn: '${dirs}',
        },
      },
    },
    {
      id: 'R1S Headmarker Line Stack',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.lineStack, capture: true },
      suppressSeconds: 5,
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R1S Headmarker Spread Markers',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.spreadMarker, capture: false },
      suppressSeconds: 5,
      response: Responses.spread(),
    },
    {
      id: 'R1S Headmarker Pawprint Collector',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.pawprint, capture: true },
      run: (data, matches) => data.lastPawprintTarget = matches.target,
    },
    {
      id: 'R1S Elevate and Eviscerate Launch Self',
      type: 'StartsUsing',
      netRegex: { id: '9446', source: 'Copy Cat', capture: false },
      condition: (data) => data.me === data.lastPawprintTarget,
      infoText: (_data, _matches, output) => output.text(),
      outputStrings: {
        text: {
          en: 'Launch Forward (Aim for uncracked tile)',
        },
      },
    },
    {
      id: 'R1S Elevate and Eviscerate Launch Other',
      type: 'StartsUsing',
      netRegex: { id: '9446', source: 'Copy Cat', capture: false },
      condition: (data) => data.me !== data.lastPawprintTarget,
      infoText: (data, _matches, output) => output.text({ target: data.lastPawprintTarget }),
      outputStrings: {
        text: {
          en: '${target} Launch',
        },
      },
    },
    {
      id: 'R1S Elevate and Eviscerate Stun Self',
      type: 'StartsUsing',
      netRegex: { id: '9448', source: 'Copy Cat', capture: false },
      condition: (data) => data.me === data.lastPawprintTarget,
      infoText: (_data, _matches, output) => output.text(),
      outputStrings: {
        text: {
          en: 'Stand on uncracked tile',
        },
      },
    },
    {
      id: 'R1S Elevate and Eviscerate Stun Other',
      type: 'StartsUsing',
      netRegex: { id: '9448', source: 'Copy Cat', capture: false },
      condition: (data) => data.me !== data.lastPawprintTarget,
      infoText: (data, _matches, output) => output.text({ target: data.lastPawprintTarget }),
      outputStrings: {
        text: {
          en: '${target} Stun',
        },
      },
    },
    {
      id: 'R1S Quadruple Swipe',
      type: 'StartsUsing',
      netRegex: { id: '945D', source: 'Black Cat', capture: false },
      infoText: (_data, _matches, output) => output.partner(),
      outputStrings: {
        partner: {
          en: 'Partner Stacks',
          de: 'Partner sammeln',
          fr: 'Package partenaire',
          ja: 'ペア',
          cn: '和搭档分摊',
          ko: '파트너 쉐어',
        },
      },
    },
    {
      id: 'R1S Delayed Quadruple Swipe',
      type: 'StartsUsing',
      netRegex: { id: '945D', source: 'Black Cat', capture: false },
      delaySeconds: 24.4,
      infoText: (_data, _matches, output) => output.partner(),
      outputStrings: {
        partner: {
          en: 'Partner Stacks',
          de: 'Partner sammeln',
          fr: 'Package partenaire',
          ja: 'ペア',
          cn: '和搭档分摊',
          ko: '파트너 쉐어',
        },
      },
    },
    {
      id: 'R1S Double Swipe',
      type: 'StartsUsing',
      netRegex: { id: '945F', source: 'Black Cat', capture: false },
      infoText: (_data, _matches, output) => output.healerStacks(),
      outputStrings: {
        healerStacks: Outputs.healerGroups,
      },
    },
    {
      id: 'R1S Delayed Double Swipe',
      type: 'StartsUsing',
      netRegex: { id: '945F', source: 'Black Cat', capture: false },
      delaySeconds: 24.4,
      infoText: (_data, _matches, output) => output.healerStacks(),
      outputStrings: {
        healerStacks: Outputs.healerGroups,
      },
    },
    {
      id: 'R1S Overshadow',
      type: 'StartsUsing',
      netRegex: { id: '9497', source: 'Black Cat', capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R1S Splintering Nails',
      type: 'StartsUsing',
      netRegex: { id: '9499', source: 'Black Cat', capture: false },
      infoText: (_data, _matches, output) => output.rolePositions(),
      outputStrings: {
        rolePositions: {
          en: 'Role positions',
          de: 'Rollenposition',
          fr: 'Positions par rôle',
          ja: 'ロール特定位置へ',
          cn: '去指定位置',
          ko: '직업별 산개위치로',
        },
      },
    },
  ],
});
