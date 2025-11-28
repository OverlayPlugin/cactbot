import logDefinitions from '../../../../../resources/netlog_defs';

import LineEvent from './LineEvent';
import LogRepository from './LogRepository';

const fields = logDefinitions.BattleTalk2.fields;

// NpcYell line
export class LineEvent0x10B extends LineEvent {
  public readonly npcId: string;
  public readonly npcNameId: string;
  public readonly instanceContentTextId: string;

  constructor(repo: LogRepository, networkLine: string, parts: string[]) {
    super(repo, networkLine, parts);

    this.npcId = parts[fields.npcId]?.toUpperCase() ?? '';
    this.npcNameId = parts[fields.npcNameId] ?? '';
    this.instanceContentTextId = parts[fields.instanceContentTextId] ?? '';
  }
}

export class LineEvent267 extends LineEvent0x10B {}
