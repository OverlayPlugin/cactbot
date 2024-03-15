import logDefinitions, { LogDefinition, LogDefinitionMap } from '../../resources/netlog_defs';
import NetRegexes from '../../resources/netregexes';
import { CactbotBaseRegExp } from '../../types/net_trigger';

import { ignoredCombatants } from './encounter_tools';
import { Notifier } from './notifier';

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

  private filterRegex: {
    addNPCCombatant: CactbotBaseRegExp<'AddedCombatant'>;
    startsUsingNPC: CactbotBaseRegExp<'StartsUsing'>;
    abilityNPC: CactbotBaseRegExp<'Ability'>;
    gainsEffectPlayerFromNPCOrEnv: CactbotBaseRegExp<'GainsEffect'>;
    gainsEffectSpecificIds: CactbotBaseRegExp<'GainsEffect'>;
    losesEffectPlayerFromNPCOrEnv: CactbotBaseRegExp<'GainsEffect'>;
    losesEffectSpecificIds: CactbotBaseRegExp<'GainsEffect'>;
  };

  // All logline types to be included without a specifici filterRegex
  private catchAlls: string[] = [];

  private ignoredAbilities: string[];

  // startLine and stopLine are both inclusive.
  constructor(
    private startLine: string,
    private stopLine: string,
    private notifier: Notifier,
    private includeGlobals: boolean,
    private doAnalysisFilter: boolean,
  ) {
    this.filterRegex = {
      addNPCCombatant: NetRegexes.addedCombatant({ id: '4.{7}' }),
      startsUsingNPC: NetRegexes.startsUsing({ sourceId: '4.{7}' }),
      abilityNPC: NetRegexes.ability({ sourceId: '4.{7}' }),
      gainsEffectPlayerFromNPCOrEnv: NetRegexes.gainsEffect({
        sourceId: '[E4].{7}',
        targetId: '1.{7}',
      }),
      gainsEffectSpecificIds: NetRegexes.gainsEffect({ effectId: ['B9A', '808'] }),
      losesEffectPlayerFromNPCOrEnv: NetRegexes.gainsEffect({
        sourceId: '[E4].{7}',
        targetId: '1.{7}',
      }),
      losesEffectSpecificIds: NetRegexes.gainsEffect({ effectId: ['B9A', '808'] }),
    };

    this.catchAlls = [
      logDefinitions.HeadMarker.type,
      logDefinitions.Tether.type,
      logDefinitions.MapEffect.type,
      logDefinitions.NpcYell.type,
      logDefinitions.BattleTalk2.type,
      logDefinitions.ActorSetPos.type,
      logDefinitions.SpawnNpcExtra.type,
      logDefinitions.ActorControlExtra.type,
    ];

    this.ignoredAbilities = ['Attack', 'attack', ''];

    const defs: LogDefinitionMap = logDefinitions;
    for (const def of Object.values(defs)) {
      // Remap logDefinitions from log type (instead of name) to definition.
      this.logTypes[def.type] = def;
      // Populate rsvTypeToFieldMap
      const possibleRsvFields = def.possibleRsvFields;
      if (possibleRsvFields !== undefined)
        this.rsvTypeToFieldMap[def.type] = possibleRsvFields;
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

  analysisFilter(line: string, typeField: string | undefined): string | undefined {
    // Only the following types of lines will be returned by this func and included in the log:
    // * NPC AddedCombatant (03)
    // * NPC StartsUsing (20)
    // * NPC Ability(21)/NetworkAOEAbility(22)
    // * GainsEffect (26)/LosesEffect (30) applied to players by NPC or environment
    // * GainsEffect (26)/LosesEffect (30) with a known effectId of interest
    // * Headmarker (27)
    // * Tether (35)
    // * MapEffect (257)
    // * NpcYell (266)
    // * BattleTalk2 (267)
    // * ActorSetPos (271)
    // * SpawnNpcExtra (272)
    // * ActorControExtra (273) (although should be revisited if/when categories expand)

    if (typeField === undefined)
      return;

    let match;
    if (typeField === logDefinitions.AddedCombatant.type) {
      match = this.filterRegex.addNPCCombatant.exec(line);
      if (match?.groups) {
        if (!ignoredCombatants.includes(match.groups.name))
          return line;
      }
      return;
    }

    if (typeField === logDefinitions.StartsUsing.type) {
      match = this.filterRegex.startsUsingNPC.exec(line);
      if (match?.groups) {
        if (!ignoredCombatants.includes(match.groups.source))
          return line;
      }
      return;
    }

    if (
      typeField === logDefinitions.Ability.type ||
      typeField === logDefinitions.NetworkAOEAbility.type
    ) {
      match = this.filterRegex.abilityNPC.exec(line);
      if (match?.groups) {
        if (
          !ignoredCombatants.includes(match.groups.source) &&
          !this.ignoredAbilities.includes(match.groups.ability)
        )
          return line;
      }
      return;
    }

    // TODO?: We could filter out known but uninteresting effectIds, like vulns and damage downs.
    // But that might become bloated and difficult to maintain,
    // particularly as ids & importance can change between fights.
    if (typeField === logDefinitions.GainsEffect.type) {
      match = this.filterRegex.gainsEffectPlayerFromNPCOrEnv.exec(line);
      if (match?.groups) {
        if (!ignoredCombatants.includes(match.groups?.source))
          return line;
      }

      match = this.filterRegex.gainsEffectSpecificIds.exec(line);
      if (match?.groups)
        return line;
      return;
    }

    if (typeField === logDefinitions.LosesEffect.type) {
      match = this.filterRegex.losesEffectPlayerFromNPCOrEnv.exec(line);
      if (match?.groups) {
        if (!ignoredCombatants.includes(match.groups?.source))
          return line;
      }

      match = this.filterRegex.losesEffectSpecificIds.exec(line);
      if (match?.groups)
        return line;
      return;
    }

    if (this.catchAlls.includes(typeField))
      return line;

    return;
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
      return this.doAnalysisFilter ? this.analysisFilter(line, typeField) : line;

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
        if (this.analysisFilter(line, logDefinitions.AddedCombatant.type) !== undefined)
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

  processWithAnalysisOnly(line: string): string {
    const splitLine = line.split('|');
    const typeField = splitLine[0];
    const filteredLine = this.doAnalysisFilter ? this.analysisFilter(line, typeField) : line;
    return filteredLine ?? line;
  }

  // Call callback with any emitted line.
  public processWithCallback(
    line: string,
    analysisOnly: boolean,
    callback: (str: string) => void,
  ): void {
    const result = analysisOnly ? this.processWithAnalysisOnly(line) : this.process(line);
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
