import logDefinitions, { LogDefinition, LogDefinitionTypes } from '../../resources/netlog_defs';
import NetRegexes, { buildRegex } from '../../resources/netregexes';
import { NetParams } from '../../types/net_props';
import { CactbotBaseRegExp } from '../../types/net_trigger';

import { ignoredCombatants } from './encounter_tools';
import { Notifier } from './notifier';

// ignore auto-attacks and abilities that have no name
const _ignoredAbilities = ['Attack', 'attack', ''];

export default class Splitter {
  private logTypes: { [type: string]: LogDefinition } = {};
  private haveStarted = false;
  private haveStopped = false;
  private haveFoundFirstNonIncludeLine = false;
  private globalLines: string[] = [];
  // log type => line
  private lastInclude: { [type: string]: string } = {};
  // id -> line
  private addedCombatants: { [id: string]: string } = {};
  // rsvKey -> line
  private rsvLines: { [key: string]: string } = {};
  // log type => field #s that may contain rsv data
  private rsvLinesReceived = false;
  private rsvTypeToFieldMap: { [type: string]: readonly number[] } = {};
  private rsvSubstitutionMap: { [key: string]: string } = {};

  // log types to include/filter for analysis; defined in netlog_defs
  private includeAllTypes: string[] = [];
  private includeFilterTypes: string[] = [];
  private filtersRegex: { [lineType: string]: CactbotBaseRegExp<LogDefinitionTypes>[] } = {};

  // hardcoded list of abilities to ignore for analysis filtering
  private ignoredAbilities: string[] = [];
  private npcAbilityRegex: CactbotBaseRegExp<'Ability'>;

  // used to identify (& remove) ignored combatants based on `ignoredCombatants`
  private addNPCCombatantRegex: CactbotBaseRegExp<'AddedCombatant'>;
  private removeNPCCombatantRegex: CactbotBaseRegExp<'RemovedCombatant'>;
  private ignoredCombatantIds: string[] = [];

  // startLine and stopLine are both inclusive.
  constructor(
    private startLine: string,
    private stopLine: string,
    private notifier: Notifier,
    private includeGlobals: boolean,
    private doAnalysisFilter: boolean,
  ) {
    this.addNPCCombatantRegex = NetRegexes.addedCombatant({ id: '4.{7}' });
    this.removeNPCCombatantRegex = NetRegexes.removingCombatant({ id: '4.{7}' });
    this.npcAbilityRegex = NetRegexes.ability({ sourceId: '4.{7}' });

     this.ignoredAbilities = _ignoredAbilities;

    this.processLogDefs();
  }

  parseFilter(
    type: LogDefinitionTypes,
    def: LogDefinition,
    filter: NetParams[typeof type],
  ): void {
    const filterRegex = buildRegex(type, filter);
    (this.filtersRegex[def.type] ??= []).push(filterRegex);
    if (!this.includeFilterTypes.includes(def.type))
      this.includeFilterTypes.push(def.type);
  }

  processLogDefs(): void {
    for (
      const [name, def] of Object.entries(logDefinitions) as [LogDefinitionTypes, LogDefinition][]
    ) {
      // Remap logDefinitions from log type (#) to definition.
      this.logTypes[def.type] = def;

      // Populate rsvTypeToFieldMap
      const possibleRsvFields = def.possibleRsvFields;
      if (possibleRsvFields !== undefined)
        this.rsvTypeToFieldMap[def.type] = possibleRsvFields;

      // Populate line filtering types & filters
      if (def.includeForAnalysis === 'filter' && def.analysisFilter !== undefined) {
        const filters = Array.isArray(def.analysisFilter)
          ? def.analysisFilter
          : [def.analysisFilter];
        // netlog_defs enforces correct typing of def.analysisFilter if it is defined.
        filters.forEach((f: NetParams[typeof name]) => this.parseFilter(name, def, f));
      } else if (def.includeForAnalysis === 'all')
        this.includeAllTypes.push(def.type);
    }
  }

  decodeRsv(line: string): string {
    const splitLine = line.split('|');
    const typeField = splitLine[0];
    if (typeField === undefined)
      return line;
    const fieldsToSubstitute = this.rsvTypeToFieldMap[typeField];
    if (fieldsToSubstitute === undefined)
      return line;

    for (const idx of fieldsToSubstitute) {
      const origValue = splitLine[idx];
      if (origValue === undefined)
        continue;
      if (Object.hasOwn(this.rsvSubstitutionMap, origValue))
        splitLine[idx] = this.rsvSubstitutionMap[origValue] ?? origValue;
    }
    return splitLine.join('|');
  }

  // Returns true if line should be included (e.g. passes the filters)
  // Default is false, since the analysis filter is restrictive by design
  analysisFilter(line: string, typeField: string | undefined): boolean {
    if (typeField === undefined)
      return false;

    // If this is an 03 line, check if it's an NPC to ignore, and if so, store the id
    // so we can filter on either name or id (as some lines may only have ids)
    if (typeField === logDefinitions.AddedCombatant.type) {
      const match = this.addNPCCombatantRegex.exec(line);
      if (match?.groups && ignoredCombatants.includes(match.groups.name))
        this.ignoredCombatantIds.push(match.groups.id);
    }

    // Remove once we encounter a 04 line for that id, so we don't continue to filter erroneously
    if (typeField === logDefinitions.RemovedCombatant.type) {
      const match = this.removeNPCCombatantRegex.exec(line);
      if (match?.groups && this.ignoredCombatantIds.includes(match.groups.id))
        this.ignoredCombatantIds = this.ignoredCombatantIds.filter((id) =>
          id !== match.groups?.id
        );
    }

    if (this.includeAllTypes.includes(typeField))
      return true;

    // if it's not a type we're filtering on, we can skip further processing
    if (!this.includeFilterTypes.includes(typeField))
      return false;

    // if there is ignoredCombatant filtering for this line type, handle it first
    let npcIdFields = this.logTypes[typeField]?.filterCombatantIdFields;
    if (npcIdFields !== undefined) {
      npcIdFields = Array.isArray(npcIdFields) ? npcIdFields : [npcIdFields];
      const splitLine = line.split('|');
      for (const idx of npcIdFields) {
        const npcId = splitLine[idx];
        if (npcId !== undefined && this.ignoredCombatantIds.includes(npcId))
          return false;
      }
    }

    // if this is an ability line, check if it's an ability on the ignoredAbilities list
    if (
      typeField === logDefinitions.Ability.type ||
      typeField === logDefinitions.NetworkAOEAbility.type
    ) {
      const match = this.npcAbilityRegex.exec(line);
      if (match?.groups && this.ignoredAbilities.includes(match.groups.ability))
        return false;
    }

    // Handle the actual filtering
    const filters = this.filtersRegex[typeField];
    if (filters === undefined)
      return false;

    /* BEGIN TEMP CODE */
    // Due to the fact that ignoredCombatants includes empty-name combatants (ref #18/#19),
    // the current analysis filter is (erroneously) excluding certain lines with empty-name
    // combatants.  Tthis is a temp fix to continue to exclude those lines for comparison sake.
    // Next commit fixes this.
    const tempRegex = NetRegexes.gainsEffect({ sourceId: '[E4].{7}', source: '' });
    const tempRegex2 = NetRegexes.gainsEffect({ effectId: ['B9A', '808'] });
    const tempMatch = tempRegex.exec(line);
    const tempMatch2 = tempRegex2.exec(line);
    if (tempMatch?.groups && tempMatch2?.groups === undefined)
      return false;
    /* END TEMP CODE */

    for (const filter of filters) {
      const match = filter.exec(line);
      if (match?.groups)
        return true;
    }

    return false;
  }

  process(line: string): string | string[] | undefined {
    if (this.haveStopped)
      return;

    if (line === this.stopLine)
      this.haveStopped = true;

    const splitLine = line.split('|');
    const typeField = splitLine[0];

    // if this line type has possible RSV keys, decode it first
    const typesToDecode = Object.keys(this.rsvTypeToFieldMap);
    if (typeField !== undefined && typesToDecode.includes(typeField))
      line = this.decodeRsv(line);

    // Normal operation; emit lines between start and stop.
    if (this.haveFoundFirstNonIncludeLine)
      return this.doAnalysisFilter
        ? (this.analysisFilter(line, typeField) ? line : undefined)
        : line;

    if (typeField === undefined)
      return;
    const type = this.logTypes[typeField];
    if (type === undefined) {
      this.notifier.error(`Unknown type: ${typeField}: ${line}`);
      return;
    }

    // Hang onto every globalInclude line, and the last instance of each lastInclude line.
    if (type.globalInclude && this.includeGlobals)
      this.globalLines.push(line);
    else if (type.lastInclude)
      this.lastInclude[typeField] = line;

    // Combatant & rsv special cases:
    if (type.name === 'ChangeZone') {
      // When changing zones, reset all combatants.
      // They will get re-added again.
      this.addedCombatants = {};
      // rsv lines arrive before zone change, so mark rsv lines as completed
      this.rsvLinesReceived = true;
    } else if (type.name === 'AddedCombatant') {
      const idIdx = type.fields?.id ?? 2;
      const combatantId = splitLine[idIdx]?.toUpperCase();
      if (combatantId !== undefined)
        this.addedCombatants[combatantId] = line;
    } else if (type.name === 'RemovedCombatant') {
      const idIdx = type.fields?.id ?? 2;
      const combatantId = splitLine[idIdx]?.toUpperCase();
      if (combatantId !== undefined)
        delete this.addedCombatants[combatantId];
    } else if (type.name === 'RSVData') {
      // if we receive RSV data after a zone change, this means a new zone change is about to occur
      // so reset rsvLines/rsvSubstitutionMap and recollect
      if (this.rsvLinesReceived) {
        this.rsvLinesReceived = false;
        this.rsvLines = {};
        this.rsvSubstitutionMap = {};
      }
      // All RSVs are handled identically regardless of namespace (ability, effect, etc.)
      // At some point, we could separate rsv keys into namespace-specific objects for substitution
      // But there's virtually no risk of collision right now,
      // and we also haven't yet determined how to map a 262 line to a particular namespace.
      const idIdx = type.fields?.key ?? 4;
      const valueIdx = type.fields?.value ?? 5;
      const rsvId = splitLine[idIdx];
      const rsvValue = splitLine[valueIdx];
      if (rsvId !== undefined && rsvValue !== undefined) {
        this.rsvLines[rsvId] = line;
        this.rsvSubstitutionMap[rsvId] = rsvValue;
      }
    }

    if (!this.haveStarted && line !== this.startLine)
      return;

    // We have found the start line, but haven't necessarily started printing yet.
    // If analysisFilter is set, we'll emit the AddedCombatant lines and the start line,
    // and then the loop will continue to run as normal -- include lines will not be printed.
    // If analysisFilter is *not* set, emit all include lines as soon as we find a non-include line.
    // By waiting until we find the first non-include line, we avoid weird corner cases
    // around the startLine being an include line (ordering issues, redundant lines).
    this.haveStarted = true;
    if (!this.doAnalysisFilter && (type.globalInclude || type.lastInclude))
      return;

    // At this point we've found a real line that's not an include line
    // or analysisFilter is set, so we're just going to start looping with this start line
    this.haveFoundFirstNonIncludeLine = true;

    // don't include globalLines if analysisFilter is on
    let lines: string[] = !this.doAnalysisFilter ? this.globalLines : [];

    // if analysis filter is on, only include (filtered) addedCombatant line
    if (this.doAnalysisFilter) {
      for (const line of Object.values(this.addedCombatants)) {
        if (this.analysisFilter(line, logDefinitions.AddedCombatant.type))
          lines.push(line);
      }
    } else {
      for (const line of Object.values(this.lastInclude))
        lines.push(line);
      for (const line of Object.values(this.addedCombatants))
        lines.push(line);
      for (const line of Object.values(this.rsvLines))
        lines.push(line);
    }
    lines.push(line);

    lines = lines.sort((a, b) => {
      // Sort by earliest time first, then by the lowest-numbered type.
      // This makes the log a little bit fake but maybe it's good enough.
      const aStr = (a.split('|')[1] ?? '') + (a.split('|')[0] ?? '');
      const bStr = (b.split('|')[1] ?? '') + (b.split('|')[0] ?? '');
      return aStr.localeCompare(bStr);
    });

    // These should be unused from here on out.
    this.globalLines = [];
    this.lastInclude = {};
    this.addedCombatants = {};
    this.rsvLines = {};

    return lines;
  }

  processAll(line: string): string | undefined {
    const splitLine = line.split('|');
    const typeField = splitLine[0];

    // BUG: fixed in the next commit
    return this.doAnalysisFilter
      ? (this.analysisFilter(line, typeField) ? line : line)
      : line;
  }

  // Call callback with any emitted line.
  public processWithCallback(
    line: string,
    noSplitting: boolean,
    callback: (str: string) => void,
  ): void {
    const result = noSplitting ? this.processAll(line) : this.process(line);
    if (typeof result === 'undefined') {
      return;
    } else if (typeof result === 'string') {
      callback(result);
    } else if (typeof result === 'object') {
      for (const resultLine of result)
        callback(resultLine);
    }
  }

  public isDone(): boolean {
    return this.haveStopped;
  }

  public wasStarted(): boolean {
    return this.haveStarted;
  }
}
