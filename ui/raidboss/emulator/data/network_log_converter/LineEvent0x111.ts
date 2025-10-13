import logDefinitions from '../../../../../resources/netlog_defs';

import LineEvent from './LineEvent';
import LogRepository from './LogRepository';

const fields = logDefinitions.ActorControlExtra.fields;

// ActorControlExtra line
export class LineEvent0x111 extends LineEvent {
  public readonly id: string;
  public readonly category: string;
  public readonly param1: string;
  public readonly param2: string;
  public readonly param3: string;
  public readonly param4: string;

  constructor(repo: LogRepository, networkLine: string, parts: string[]) {
    super(repo, networkLine, parts);

    this.id = parts[fields.id]?.toUpperCase() ?? '';
    this.category = parts[fields.category] ?? '';
    this.param1 = parts[fields.param1] ?? '';
    this.param2 = parts[fields.param2] ?? '';
    this.param3 = parts[fields.param3] ?? '';
    this.param4 = parts[fields.param4] ?? '';
  }
}

export class LineEvent273 extends LineEvent0x111 {}
