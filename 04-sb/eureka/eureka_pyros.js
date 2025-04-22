Options.Triggers.push({
  id: 'TheForbiddenLandEurekaPyros',
  zoneId: ZoneId.TheForbiddenLandEurekaPyros,
  comments: {
    en: 'Mostly incomplete',
    de: 'Größtenteils unvollständig',
    fr: 'Majoritairement incomplet',
    cn: '大部分未完成',
  },
  resetWhenOutOfCombat: false,
  triggers: [
    {
      id: 'Eureka Pyros Skoll Hoarhound Halo',
      type: 'StartsUsing',
      netRegex: { id: '36E0', source: 'Skoll', capture: false },
      response: Responses.goFrontOrSides(),
    },
    {
      id: 'Eureka Pyros Skoll Heavensward Howl',
      type: 'StartsUsing',
      netRegex: { id: '36DB', source: 'Skoll', capture: false },
      response: Responses.awayFromFront(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Skoll': 'Skalli',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Skoll': 'Sköll',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Skoll': 'スコル',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Skoll': '斯库尔',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Skoll': '스콜',
      },
    },
  ],
});
