import { isEqual } from 'lodash';

import logDefinitions, {
  LogDefFieldIdx,
  LogDefFieldName,
  LogDefinition,
  LogDefinitionTypeCode,
  LogDefinitionTypes,
} from '../../resources/netlog_defs';
import { UnreachableCode } from '../../resources/not_reached';

import FakeNameGenerator from './fake_name_generator';
import { Notifier } from './notifier';
import { ReindexedLogDefs } from './splitter';

// TODO: is the first byte of ids always flags, such that "..000000" is always empty?
const emptyIds = ['E0000000', '80000000'];
export default class Anonymizer {
  private logTypes: ReindexedLogDefs;

  private nameGenerator = new FakeNameGenerator();

  // uppercase hex id -> name
  private playerMap: { [id: string]: string } = {};
  // uppercase hex real player id -> uppercase hex fake player id
  private anonMap: { [id: string]: string } = {};

  // About 20% of any log is hashes, so just clear instead of faking.
  private fakeHash = '';

  private lastPlayerIdx = 0x10FF0000;

  constructor() {
    this.logTypes = this.processLogDefs();

    for (const id of emptyIds) {
      // Empty ids have already been anonymized (to themselves).
      this.anonMap[id] = id;
      // Empty ids have no name.
      this.playerMap[id] = '';
    }
  }

  isLogDefinitionFieldIdx<K extends LogDefinitionTypes>(
    fieldId: number | null | undefined,
    name: K,
  ): fieldId is LogDefFieldIdx<K> {
    return (fieldId === null || fieldId === undefined)
      ? false
      : (Object.values(logDefinitions[name].fields) as number[]).includes(fieldId);
  }

  isLogDefinitionField<K extends LogDefinitionTypes>(
    field: string,
    name: K,
  ): field is LogDefFieldName<K> {
    return Object.keys(logDefinitions[name].fields).includes(field);
  }

  isLogDefinitionType(type: string | undefined): type is LogDefinitionTypeCode {
    return Object.values(logDefinitions).some((d) => d.type === type);
  }

  isLogDefinition<K extends LogDefinitionTypes>(def: { name: K }): def is LogDefinition<K> {
    return isEqual(def, logDefinitions[def.name]);
  }

  isReindexedLogDefs(remap: Partial<ReindexedLogDefs>): remap is ReindexedLogDefs {
    return Object.values(logDefinitions).every((d) => isEqual(remap[d.type], d));
  }

  processLogDefs(): ReindexedLogDefs {
    const remap: { [type: string]: LogDefinition<LogDefinitionTypes> } = {};
    for (const def of Object.values(logDefinitions)) {
      if (!this.isLogDefinition(def))
        throw new UnreachableCode();
      remap[def.type] = def;
    }
    if (!this.isReindexedLogDefs(remap))
      throw new UnreachableCode();
    return remap;
  }

  public process(line: string, notifier: Notifier): string | undefined {
    const splitLine = line.split('|');

    // Improperly closed files can leave a blank line.
    const type = splitLine[0];

    if (!this.isLogDefinitionType(type) || splitLine.length <= 1)
      return;

    // Always replace the hash.
    if (splitLine[splitLine.length - 1]?.trimEnd().length === 16)
      splitLine[splitLine.length - 1] = this.fakeHash;
    else
      notifier.warn(`missing hash ${splitLine.length}`, splitLine);

    const typeDef = this.logTypes[type];
    if (typeDef.isUnknown) {
      notifier.warn('unknown type', splitLine);
      return;
    }

    // Check subfields first before canAnonymize.
    // Subfields override the main type, if present.
    let canAnonymizeSubField = false;
    if (typeDef.subFields) {
      for (const subFieldName in typeDef.subFields) {
        if (!this.isLogDefinitionField(subFieldName, typeDef.name)) {
          notifier.warn(`internal error: invalid subfield: ${subFieldName}`, splitLine);
          return;
        }

        const fieldIdx = typeDef.fields[subFieldName];
        const value = splitLine[fieldIdx];
        if (value === undefined) {
          notifier.warn(`internal error: missing subfield: ${subFieldName}`, splitLine);
          return;
        }
        const subValues = typeDef.subFields[subFieldName];

        // Unhandled values inherit the field's value.
        const subType = subValues?.[value];
        if (subType !== undefined) {
          canAnonymizeSubField = subType.canAnonymize;
          if (!canAnonymizeSubField)
            return;
        }
      }
    }

    // Drop any lines that can't be handled.
    if (!canAnonymizeSubField && !typeDef.canAnonymize)
      return;

    // If nothing to anonymize, we're done.
    const playerIds = typeDef.playerIds;
    if (playerIds === undefined)
      return splitLine.join('|');

    // Anonymize fields.
    for (const [idIdxStr, nameIdx] of Object.entries(playerIds)) {
      const idIdx = parseInt(idIdxStr);
      if (!this.isLogDefinitionFieldIdx(idIdx, typeDef.name)) {
        notifier.warn(`internal error: invalid field index: ${idIdx}`, splitLine);
        return;
      }

      const isOptional = typeDef.firstOptionalField !== undefined &&
        idIdx >= typeDef.firstOptionalField;

      // Check for ids that are out of range, possibly optional.
      // The last field is always the hash, so don't include that either.
      if (idIdx > splitLine.length - 2) {
        // Some ids are optional and may not exist, these are ok to skip.
        if (isOptional)
          continue;

        notifier.warn(`unexpected missing field ${idIdx}`, splitLine);
        continue;
      }

      // TODO: keep track of uppercase/lowercase??
      const field = splitLine[idIdx];
      if (field === undefined) {
        notifier.warn(`line is missing data at index ${idIdx}`, splitLine);
        return;
      }
      const playerId = field.toUpperCase();

      // Cutscenes get added combatant messages with ids such as 'FF000006' and no name.
      const isCutsceneId = playerId.startsWith('FF');

      // Handle weirdly shaped ids.
      if (playerId.length !== 8 || isCutsceneId) {
        // Also, sometimes ids are '0000' or '0'.  Treat these the same as implicitly optional.
        const isZero = parseInt(playerId) === 0;
        if (isOptional || isZero || isCutsceneId) {
          // If we have an invalid player id, it is fine if it has been marked optional or is zero.
          // However, in these cases, it should have an empty name (or no name field).
          // e.g. 21|2019-09-07T10:18:11.4390000-07:00|10FF007E|X'xzzrmk Tia|01|Key Item|793E69||
          if (typeof nameIdx === 'number' && splitLine[nameIdx] !== '')
            notifier.warn(`invalid id with valid name at index ${idIdx}`, splitLine);
          continue;
        }

        notifier.warn(`expected id field at index ${idIdx}`, splitLine);
        continue;
      }

      // Ignore monsters.
      if (playerId.startsWith('4'))
        continue;

      // Replace the id at this index with a fake player id.
      const fakePlayerId = this.anonMap[playerId] ??= this.addNewPlayer();

      splitLine[idIdx] = fakePlayerId;

      // Replace the corresponding name, if there's a name mapping.
      if (this.isLogDefinitionFieldIdx(nameIdx, typeDef.name)) {
        const fakePlayerName = this.playerMap[fakePlayerId];
        if (fakePlayerName === undefined) {
          notifier.warn(`internal error: missing fake player name for ${fakePlayerId}`, splitLine);
          continue;
        }
        splitLine[nameIdx] = fakePlayerName;
      }
    }

    // For unknown fields, just clear them, as they may have ids.
    if (typeDef.firstUnknownField !== undefined) {
      for (let idx = typeDef.firstUnknownField; idx < splitLine.length - 1; ++idx)
        splitLine[idx] = '';
    }

    return splitLine.join('|');
  }

  private addNewPlayer(): string {
    this.lastPlayerIdx++;
    const playerName = this.nameGenerator.makeName(this.lastPlayerIdx);
    const playerId = this.lastPlayerIdx.toString(16).toUpperCase();
    this.playerMap[playerId] = playerName;
    return playerId;
  }

  // Once a log has been anonymized, this validates fake ids don't collide with real.
  validateIds(notifier: Notifier): boolean {
    let success = true;

    // valid player ids
    const playerIds = Object.keys(this.anonMap);
    // made up anon ids
    const anonIds = Object.keys(this.playerMap);

    for (const anonId of anonIds) {
      if (emptyIds.includes(anonId))
        continue;
      if (playerIds.includes(anonId)) {
        notifier.warn(`player id collision ${anonId}`);
        success = false;
      }
    }

    return success;
  }

  // Once a log has been anonymized, call it with all the lines again to verify.
  validateLine(line: string, notifier: Notifier): boolean {
    const splitLine = line.split('|');

    let success = true;

    const playerIds = Object.keys(this.anonMap);

    splitLine.forEach((field, idx) => {
      if (emptyIds.includes(field))
        return;
      if (playerIds.includes(field)) {
        notifier.error(`uncaught player id ${field}, idx: ${idx}`, splitLine);
        success = false;
      }
    });

    return success;
  }
}
