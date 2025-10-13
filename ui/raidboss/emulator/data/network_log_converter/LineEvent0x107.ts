import logDefinitions from '../../../../../resources/netlog_defs';

import LineEvent from './LineEvent';
import LogRepository from './LogRepository';

const fields = logDefinitions.StartsUsingExtra.fields;

// StartsUsingExtra line
export class LineEvent0x107 extends LineEvent {
  public readonly abilityIdHex: string;
  public readonly abilityId: number;
  public readonly id: string;
  public readonly x: number;
  public readonly y: number;
  public readonly z: number;
  public readonly heading: number;

  constructor(repo: LogRepository, networkLine: string, parts: string[]) {
    super(repo, networkLine, parts);

    this.abilityIdHex = parts[fields.id]?.toUpperCase() ?? '';
    this.abilityId = parseInt(this.abilityIdHex, 16);
    this.id = parts[fields.sourceId]?.toUpperCase() ?? '';

    this.x = parseFloat(parts[fields.x] ?? '');
    this.y = parseFloat(parts[fields.y] ?? '');
    this.z = parseFloat(parts[fields.z] ?? '');
    this.heading = parseFloat(parts[fields.heading] ?? '');
  }
}

export class LineEvent263 extends LineEvent0x107 {}
