import _ from 'lodash';

import logDefinitions, {
  LogDefinition,
  LogDefinitionName,
  LogDefinitions,
  LogDefinitionType,
} from '../../resources/netlog_defs';
import NetRegexes, { buildRegex } from '../../resources/netregexes';
import { UnreachableCode } from '../../resources/not_reached';
import { NetParams } from '../../types/net_props';
import { CactbotBaseRegExp } from '../../types/net_trigger';

import { ignoredCombatants } from './encounter_tools';
import { Notifier } from './notifier';

// ignore auto-attacks and abilities that have no name
const _ignoredAbilities = ['Attack', 'attack', ''];

export type ReindexedLogDefs = {
  [K in keyof LogDefinitions as LogDefinitions[K]['type']]: LogDefinition<K>;
};
export default class Splitter {
  private logTypes: ReindexedLogDefs;
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
  private rsvSubstitutionMap: { [key: string]: string } = {};

  // log types to include/filter for analysis; defined in netlog_defs
  private includeAllTypes: LogDefinitionType[] = [];
  private includeFilterTypes: LogDefinitionType[] = [];
  private filtersRegex: { [type: string]: CactbotBaseRegExp<LogDefinitionName>[] } = {};

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

    this.logTypes = this.processAnalysisOptions();
  }

  parseFilter(
    name: LogDefinitionName,
    def: LogDefinition<typeof name>,
    filter: NetParams[typeof name],
  ): void {
    const filterRegex = buildRegex(name, filter);
    (this.filtersRegex[def.type] ??= []).push(filterRegex);
    if (!this.includeFilterTypes.includes(def.type))
      this.includeFilterTypes.push(def.type);
  }

  isLogDefinitionType(type: string | undefined): type is LogDefinitionType {
    return Object.values(logDefinitions).some((d) => d.type === type);
  }

  isLogDefinition<K extends LogDefinitionName>(def: { name: K }): def is LogDefinition<K> {
    return _.isEqual(def, logDefinitions[def.name]);
  }

  isReindexedLogDefs(remap: Partial<ReindexedLogDefs>): remap is ReindexedLogDefs {
    return Object.values(logDefinitions).every((d) => _.isEqual(remap[d.type], d));
  }

  processAnalysisOptions(): ReindexedLogDefs {
    const remap: { [type: string]: LogDefinition<LogDefinitionName> } = {};
    for (const def of Object.values(logDefinitions)) {
      if (!this.isLogDefinition(def))
        throw new UnreachableCode();

      // Reindex logDefinitions based on def.type, rather than def.name
      remap[def.type] = def;

      // Populate line filtering types & filters
      if (def.analysisOptions?.include === 'filter') {
        let filters = def.analysisOptions.filters;
        filters = Array.isArray(filters) ? filters : [filters];
        filters.forEach((f) => this.parseFilter(def.name, def, f));
      } else if (def.analysisOptions?.include === 'all')
        this.includeAllTypes.push(def.type);
    }

    if (!this.isReindexedLogDefs(remap))
      throw new UnreachableCode();
    return remap;
  }

  decodeRsv(line: string, type: LogDefinitionType): string {
    let fieldsToSubstitute = this.logTypes[type].possibleRsvFields;
    if (fieldsToSubstitute === undefined)
      return line;
    fieldsToSubstitute = Array.isArray(fieldsToSubstitute)
      ? fieldsToSubstitute
      : [fieldsToSubstitute];

    const splitLine = line.split('|');

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
  // `type` is optional, so that it can be called with global/lastInclude lines where
  // we aren't pre-parsing the type of each line.
  analysisFilter(line: string, type?: LogDefinitionType): boolean {
    if (type === undefined) {
      const lineType = line.split('|')[0];
      if (!this.isLogDefinitionType(lineType))
        return false;
      type = lineType;
    }

    // If this is an 03 line, check if it's an NPC to ignore, and if so, store the id
    // so we can filter on either name or id (as some lines may only have ids)
    if (type === logDefinitions.AddedCombatant.type) {
      const match = this.addNPCCombatantRegex.exec(line);
      if (match?.groups && ignoredCombatants.includes(match.groups.name))
        this.ignoredCombatantIds.push(match.groups.id);
    }

    // Remove once we encounter a 04 line for that id, so we don't continue to filter erroneously
    if (type === logDefinitions.RemovedCombatant.type) {
      const match = this.removeNPCCombatantRegex.exec(line);
      if (match?.groups && this.ignoredCombatantIds.includes(match.groups.id))
        this.ignoredCombatantIds = this.ignoredCombatantIds.filter((id) => id !== match.groups?.id);
    }

    if (this.includeAllTypes.includes(type))
      return true;

    // if it's not a type we're filtering on, we can skip further processing
    if (!this.includeFilterTypes.includes(type))
      return false;

    // if there is ignoredCombatant filtering for this line type, handle it first
    let npcIdFields = this.logTypes[type].analysisOptions?.combatantIdFields;
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
      type === logDefinitions.Ability.type ||
      type === logDefinitions.NetworkAOEAbility.type
    ) {
      const match = this.npcAbilityRegex.exec(line);
      if (match?.groups && this.ignoredAbilities.includes(match.groups.ability))
        return false;
    }

    // Handle the actual filtering
    const filters = this.filtersRegex[type];
    if (filters === undefined)
      return false;

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
    const type = splitLine[0];

    if (!this.isLogDefinitionType(type)) {
      this.notifier.error(`Unknown type: ${type ?? ''}: ${line}`);
      return;
    }

    // if this line type has possible RSV keys, decode it first
    line = this.decodeRsv(line, type);

    // Normal operation; emit lines between start and stop.
    if (this.haveFoundFirstNonIncludeLine)
      return this.doAnalysisFilter
        ? (this.analysisFilter(line, type) ? line : undefined)
        : line;

    const typeDef = this.logTypes[type];

    // Hang onto every globalInclude line, and the last instance of each lastInclude line.
    if (typeDef.globalInclude && this.includeGlobals)
      this.globalLines.push(line);
    else if (typeDef.lastInclude)
      this.lastInclude[type] = line;

    // Combatant & rsv special cases:
    if (typeDef.type === logDefinitions.ChangeZone.type) {
      // When changing zones, reset all combatants.
      // They will get re-added again.
      this.addedCombatants = {};
      // rsv lines arrive before zone change, so mark rsv lines as completed
      this.rsvLinesReceived = true;
    } else if (typeDef.type === logDefinitions.AddedCombatant.type) {
      const combatantId = splitLine[typeDef.fields.id]?.toUpperCase();
      if (combatantId !== undefined)
        this.addedCombatants[combatantId] = line;
    } else if (typeDef.type === logDefinitions.RemovedCombatant.type) {
      const combatantId = splitLine[typeDef.fields.id]?.toUpperCase();
      if (combatantId !== undefined)
        delete this.addedCombatants[combatantId];
    } else if (typeDef.type === logDefinitions.RSVData.type) {
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
      const rsvId = splitLine[typeDef.fields.key];
      const rsvValue = splitLine[typeDef.fields.value];
      if (rsvId !== undefined && rsvValue !== undefined) {
        this.rsvLines[rsvId] = line;
        this.rsvSubstitutionMap[rsvId] = rsvValue;
      }
    }

    if (!this.haveStarted && line !== this.startLine)
      return;

    // We have found the start line, but haven't necessarily started printing yet.
    // Emit all include lines as soon as we find a non-include line.
    // By waiting until we find the first non-include line, we avoid weird corner cases
    // around the startLine being an include line (ordering issues, redundant lines).
    this.haveStarted = true;
    if (typeDef.globalInclude || typeDef.lastInclude)
      return;

    // At this point we've found a real line that's not an include line
    this.haveFoundFirstNonIncludeLine = true;

    // Assemble all accumulated pre-start lines.
    let lines: string[] = [
      ...this.globalLines,
      ...Object.values(this.lastInclude),
      ...Object.values(this.addedCombatants),
      ...Object.values(this.rsvLines),
      line,
    ];

    if (this.doAnalysisFilter)
      lines = lines.filter((line) => this.analysisFilter(line));

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
    const type = splitLine[0];

    if (!this.isLogDefinitionType(type)) {
      this.notifier.error(`Unknown type: ${type ?? ''}: ${line}`);
      return;
    }

    // if this line type has possible RSV keys, decode it first
    line = this.decodeRsv(line, type);

    return this.doAnalysisFilter
      ? (this.analysisFilter(line, type) ? line : undefined)
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
