import logDefinitions from '../../../../../resources/netlog_defs';

import LineEvent from './LineEvent';
import LogRepository from './LogRepository';

const fields = logDefinitions.ActorSetPos.fields;

// ActorSetPos line
export class LineEvent0x10F extends LineEvent {
  public readonly id: string;
  public readonly heading: number;
  public readonly x: number;
  public readonly y: number;
  public readonly z: number;

  constructor(repo: LogRepository, networkLine: string, parts: string[]) {
    super(repo, networkLine, parts);

    this.id = parts[fields.id]?.toUpperCase() ?? '';

    this.x = parseFloat(parts[fields.x] ?? '');
    this.y = parseFloat(parts[fields.y] ?? '');
    this.z = parseFloat(parts[fields.z] ?? '');
    this.heading = parseFloat(parts[fields.heading] ?? '');
  }
}

export class LineEvent271 extends LineEvent0x10F {}
