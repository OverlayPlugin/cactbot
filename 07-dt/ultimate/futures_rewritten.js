Options.Triggers.push({
  id: 'FuturesRewrittenUltimate',
  zoneId: ZoneId.FuturesRewrittenUltimate,
  timelineFile: 'futures_rewritten.txt',
  timelineTriggers: [],
  triggers: [],
  timelineReplace: [
    {
      locale: 'en',
      replaceText: {
        'Sinbound Fire III/Sinbound Thunder III': 'Sinbound Fire/Thunder',
      },
    },
  ],
});
