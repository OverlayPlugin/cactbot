import { LooseTimelineTrigger, TimelineReplacement } from '../../../../types/trigger';
import { RaidbossOptions } from '../../raidboss_options';
import { Timeline } from '../../timeline';
import { TimelineStyle } from '../../timeline_parser';
import RaidEmulator from '../data/RaidEmulator';

export default class RaidEmulatorTimeline extends Timeline {
  emulatedStatus = 'pause';
  emulator?: RaidEmulator;
  constructor(
    text: string,
    replacements: TimelineReplacement[],
    triggers: LooseTimelineTrigger[],
    styles: TimelineStyle[],
    options: RaidbossOptions,
    zoneId: number,
  ) {
    super(text, replacements, triggers, styles, options, zoneId);
  }

  bindTo(emulator: RaidEmulator): void {
    this.emulator = emulator;
    emulator.on('play', () => {
      this.emulatedStatus = 'play';
    });
    emulator.on('pause', () => {
      this.emulatedStatus = 'pause';
    });
  }

  emulatedSync(currentLogTime: number): void {
    if (!currentLogTime)
      return;

    // This is a bit complicated due to jumps in timelines. If we've already got a timebase,
    // fightNow needs to be calculated based off of that instead of initialOffset
    // timebase = 0 when not set
    const baseTimestamp = this.timebase ||
      this.emulator?.currentEncounter?.encounter?.initialTimestamp ||
      currentLogTime;
    const fightNow = (currentLogTime - baseTimestamp) / 1000;

    this.SyncTo(fightNow, currentLogTime);
    this._OnUpdateTimer(currentLogTime);
  }

  public override _OnUpdateTimer(currentTime: number): void {
    // The base `Timeline` class's `_RemoveExpiredTimers` has a hardcoded `Date.now()` reference
    // for keepalive timers.
    // There's not really a good way to handle this logic otherwise due to not having any other
    // time base to reference against.
    // So we treat any `currentTime` value greater than the last log line of the current encounter
    // as if it was the current timestamp
    const lastLogTimestamp = this.emulator?.currentEncounter?.encounter
      .logLines.slice(-1)[0]?.timestamp;
    if (lastLogTimestamp && currentTime > lastLogTimestamp)
      currentTime = this.emulator?.currentLogTime ?? currentTime;

    super._OnUpdateTimer(currentTime);
  }

  override _ScheduleUpdate(_fightNow: number): void {
    // Override
  }
}
