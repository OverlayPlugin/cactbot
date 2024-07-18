// MapEffect lines only control arena appearance
// Head Marker data for future reference
const headMarkerData = {
  // Vfx Path: tank_laser_lockon01p
  tankLines: 'E6',
  // Vfx Path: com_share3_7s0p
  stack: '13D',
  // Vfx Path: target_ae_s7k1
  spread: '177',
  // Vfx Path: m0906_tgae_s701k2
  spreadHearts: '203',
  // Vfx Path: m0906_share4_7s0k2
  lightPartyStacks: '205',
};
console.assert(headMarkerData);
Options.Triggers.push({
  id: 'AacLightHeavyweightM2',
  zoneId: ZoneId.AacLightHeavyweightM2,
  timelineFile: 'r2n.txt',
  triggers: [
    {
      id: 'R2N Call Me Honey',
      type: 'StartsUsing',
      netRegex: { id: '9164', source: 'Honey B. Lovely', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R2N Honey Beeline',
      type: 'StartsUsing',
      netRegex: { id: ['9B39', '9B3B'], source: 'Honey B. Lovely', capture: false },
      response: Responses.goSides(),
    },
    {
      id: 'R2N Tempting Twist',
      type: 'StartsUsing',
      netRegex: { id: ['9B3A', '9B3C'], source: 'Honey B. Lovely', capture: false },
      response: Responses.getUnder(),
    },
    {
      id: 'R2N Honeyed Breeze',
      type: 'StartsUsing',
      netRegex: { id: '9167', source: 'Honey B. Lovely', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'R2N Drop of Venom',
      type: 'StartsUsing',
      netRegex: { id: '9170', source: 'Honey B. Lovely', capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R2N Blow Kiss',
      type: 'StartsUsing',
      netRegex: { id: '9173', source: 'Honey B. Lovely', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'R2N Heartsore',
      type: 'StartsUsing',
      netRegex: { id: '917A', source: 'Honey B. Lovely', capture: false },
      suppressSeconds: 5,
      response: Responses.spread(),
    },
    {
      id: 'R2N Loveseeker',
      type: 'StartsUsing',
      netRegex: { id: '9AC1', source: 'Honey B. Lovely', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'R2N Honey B. Finale',
      type: 'StartsUsing',
      netRegex: { id: '917B', source: 'Honey B. Lovely', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R2N Heartsick',
      type: 'StartsUsing',
      netRegex: { id: '9B8D', source: 'Honey B. Lovely', capture: false },
      infoText: (_data, _matches, output) => output.stacks(),
      outputStrings: {
        stacks: {
          en: 'Stacks',
          de: 'Sammeln',
          fr: 'Package',
          cn: '分摊',
          ko: '쉐어',
        },
      },
    },
  ],
});
