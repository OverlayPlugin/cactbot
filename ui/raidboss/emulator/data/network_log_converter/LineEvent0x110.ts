import logDefinitions from '../../../../../resources/netlog_defs';

import LineEvent from './LineEvent';
import LogRepository from './LogRepository';

const fields = logDefinitions.SpawnNpcExtra.fields;

// SpawnNpcExtra line
export class LineEvent0x110 extends LineEvent {
  public readonly id: string;
  public readonly parentId: string;
  public readonly tetherId: string;
  public readonly animationState: string;

  constructor(repo: LogRepository, networkLine: string, parts: string[]) {
    super(repo, networkLine, parts);

    this.id = parts[fields.id]?.toUpperCase() ?? '';
    this.parentId = parts[fields.parentId]?.toUpperCase() ?? '';
    this.tetherId = parts[fields.tetherId] ?? '';
    this.animationState = parts[fields.animationState] ?? '';
  }
}

export class LineEvent272 extends LineEvent0x110 {}
