Options.Triggers.push({
  id: 'Yanxia',
  zoneId: ZoneId.Yanxia,
  comments: {
    en: 'A Rank Hunts: Angada only',
    de: 'A Rang Hohe Jagd: Nur Angada',
    fr: 'Chasse Rang A : Angada uniquement',
    cn: '只有A级狩猎怪: 安迦达',
    ko: 'A급 마물: 앙가다만',
  },
  triggers: [
    {
      id: 'Angada Scythe Tail',
      type: 'StartsUsing',
      netRegex: { id: '1FFE', source: 'Angada', capture: false },
      condition: (data) => data.inCombat,
      response: Responses.getOut(),
    },
    {
      id: 'Angada Butcher',
      type: 'StartsUsing',
      netRegex: { id: '1FFF', source: 'Angada', capture: false },
      condition: (data) => data.inCombat,
      response: Responses.getBehind(),
    },
  ],
});
