import argparse from 'argparse';

type TimelineArgs = {
  'file': string | null;
  'force': boolean | null;
  'search_fights': number | null;
  'search_zones': number | null;
  'fight_regex': string | null;
  'zone_regex': string | null;
  'report_id': string | null;
  'report_fight': number | null;
  'key': string | null;
};

class LogUtilArgParse {
  parser = new argparse.ArgumentParser({
    // eslint-disable-next-line camelcase
    add_help: true,
  });
  // At least one argument must be selected from this group.
  fileGroup = this.parser.add_argument_group({
    title: 'File Args',
    description: 'A file, report, and/or timeline must be selected before performing operations',
  });
  // Exactly one argument should be selected from this group.
  // All arguments within this group are defined with nargs: '?',
  // so the user can call them from the command line with or without values.
  // This way, in any consuming script, a value of null means that argument
  // is not present at the command line.

  // While exactly one argument should be called from this group,
  // which ones are valid will vary on a per-script basis,
  // so we leave that level of validation to the consuming scripts.
  // The only validation done here is to ensure that at least one
  // of these arguments is present.
  requiredGroup = this.parser.add_mutually_exclusive_group();
  reportGroup = this.requiredGroup.add_argument_group({
    title: 'Report Args',
    description: 'Using an FFLogs report requires use of an API key and report information',
  });
  args?: TimelineArgs;

  constructor() {
    this.fileGroup.add_argument('-f', '--file', {
      help: 'Network log file to analyze',
    });
    this.fileGroup.add_argument('-t', '--timeline', {
      help: 'The filename of the timeline to test against, e.g. ultima_weapon_ultimate',
    });
    this.fileGroup.add_argument('-r', '--report_id', {
      nargs: '?',
      help: 'The ID of an FFLogs report',
    });
    this.parser.add_argument('--force', {
      nargs: '?',
      const: true,
      help: 'Overwrite files when exporting',
    });
    this.requiredGroup.add_argument('-lf', '--search-fights', {
      nargs: '?',
      const: -1,
      type: 'int',
      help: 'Fight in log to export, e.g. \'1\'. ' +
        'If no number is specified, returns a list of fights.',
    });
    this.requiredGroup.add_argument('-lz', '--search-zones', {
      nargs: '?',
      const: -1,
      type: 'int',
      help: 'Zone in log to export, e.g. \'1\'. ' +
        'If no number is specified, returns a list of zones.',
    });
    this.requiredGroup.add_argument('-fr', '--fight-regex', {
      nargs: '?',
      const: -1,
      type: 'string',
      help: 'Export all fights that match this regex',
    });
    this.requiredGroup.add_argument('-zr', '--zone-regex', {
      nargs: '?',
      const: -1,
      type: 'string',
      help: 'Export all zones that match this regex',
    });
    this.requiredGroup.add_argument('-a', '--adjust', {
      nargs: '?',
      const: 0,
      type: 'float',
      help: 'Adjust all entries in a timeline file by this amount',
    });
    this.reportGroup.add_argument('-k', '--key', {
      help: 'The FFLogs API key to use, from https://www.fflogs.com/profile.',
    });
    this.reportGroup.add_argument('-rf', '--report-fight', {
      help: 'Fight ID of the report to use.',
      type: 'int',
    });
  }
}

export { LogUtilArgParse, TimelineArgs };
