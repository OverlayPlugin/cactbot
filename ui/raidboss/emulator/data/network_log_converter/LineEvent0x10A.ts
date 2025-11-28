import logDefinitions from '../../../../../resources/netlog_defs';

import LineEvent from './LineEvent';
import LogRepository from './LogRepository';

const fields = logDefinitions.NpcYell.fields;

// NpcYell line
export class LineEvent0x10A extends LineEvent {
  public readonly npcId: string;
  public readonly npcNameId: string;
  public readonly npcYellId: string;

  constructor(repo: LogRepository, networkLine: string, parts: string[]) {
    super(repo, networkLine, parts);

    this.npcId = parts[fields.npcId]?.toUpperCase() ?? '';
    this.npcNameId = parts[fields.npcNameId] ?? '';
    this.npcYellId = parts[fields.npcYellId] ?? '';
  }
}

export class LineEvent266 extends LineEvent0x10A {}
