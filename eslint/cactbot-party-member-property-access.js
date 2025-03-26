module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'no use of data.party.member().nick or .toString() in raidboss triggers',
      category: 'Best Practices',
      recommended: true,
      url:
        'https://github.com/OverlayPlugin/cactbot/blob/main/docs/RaidbossGuide.md#trigger-properties',
    },
    fixable: 'code',
    schema: [],
  },

  create(context) {
    return {
      'Property[key.name=/(timelineTriggers|triggers)/] > ArrayExpression > ObjectExpression': (
        node,
      ) => {
        // Look for any use of data.party.member().nick or .toString within a trigger,
        const matchRegex = /data\.party\.member\(([^)]+)\)\.(nick|toString\(\))/;

        const trigger = context.getSourceCode().getText(node);
        const lines = trigger.split('\n').map((l) => l.trim());
        lines.forEach((line) => {
          const match = matchRegex.exec(line);
          if (match) {
            context.report({
              node,
              message: `"${line}"
              Use data.party.member(); do not add .nick or .toString().`,
            });
          }
        });
      },
    };
  },
};
