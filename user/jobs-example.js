// Rename this file to `jobs.js` and edit it to change the jobs ui.

// List of jobs to show an hp value for.
Options.ShowHPNumber = ['PLD', 'WAR', 'DRK', 'GNB', 'WHM', 'SCH', 'AST', 'SGE', 'BLU'];

// List of jobs to show an mp value for.
Options.ShowMPNumber = ['PLD', 'DRK', 'WHM', 'SCH', 'AST', 'SGE', 'BLM', 'BLU'];

// List of jobs to show an mp ticker for.
Options.ShowMPTicker = ['BLM'];

// The distance that mp bar turn orange for caster,
// indicating target out of range for casters.
Options.FarThresholdOffence = 24;

// When MP falls below this, the MP bar turn blue/red for for paladin.
Options.PldMediumMPThreshold = 5399;
Options.PldLowMPThreshold = 3599;

// When MP falls below this, the MP bar turn blue/red for dark knight.
Options.DrkMediumMPThreshold = 5999;
Options.DrkLowMPThreshold = 2999;

// When MP falls below this, the MP bar turn blue/red for black mage.
Options.BlmMediumMPThreshold = 3999;
Options.BlmLowMPThreshold = 2399;

const kRed =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAySURBVEhL7c0xEQAgDAAxhHSsf2d4QMJPbLnLnnNnvxIkQRIkQRIkQRIkQRIkQfoczD4cGLQ9QOmZGwAAAABJRU5ErkJggg==';

// Remove these /* and */ comment lines to enable the example code below.
/*

// Overrides for all of the "big buffs" that appear to the right of the hp/mp bars.
// See https://github.com/OverlayPlugin/cactbot/blob/main/ui/jobs/buff_tracker.ts#L293
Options.PerBuffOptions = {
  // The name of the buff to override.
  // See available names in above link.
  balance: {
    // By default everything is on the right.
    // This puts the icon on the left for better visibility.
    side: 'left',

    // The border color.  See: https://www.google.com/search?q=color+picker
    // This example sets trick to use a white border.
    borderColor: '#FFFFFF',

    // The icon to use.  This is a url or a data url like this.
    // This example sets the Balance to use a bright red icon instead.
    icon: kRed,

    // If true (instead of false here), this will hide the buff and
    // prevent it from being shown.
    hide: false,

    // sortKey controls the order of the buffs when multiple buffs are shown.
    // Smaller numbers are higher priority and will be shown closer to the middle.
    // The existing buffs are ranged from 1-9, see above link.
    // You can use any numerical value you want here, including negatives.
    // This example sets the Balance to be a very high priority.
    sortKey: -1,
  },
};

*/
