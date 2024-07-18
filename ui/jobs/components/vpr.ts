import EffectId from '../../../resources/effect_id';
import TimerBox from '../../../resources/timerbox';
import { PartialFieldMatches } from '../event_emitter';

import { BaseComponent, ComponentInterface } from './base';

export class VPRComponent extends BaseComponent {
  noxiousGnashTimer: TimerBox;
  huntersInstinct: TimerBox;

  constructor(o: ComponentInterface) {
    super(o);

    this.noxiousGnashTimer = this.bars.addProcBox({
      id: 'vpr-timers-noxious-gnash',
      fgColor: 'vpr-color-noxious-gnash',
    });

    this.huntersInstinct = this.bars.addProcBox({
      id: 'vpr-timers-hunters-instinct',
      fgColor: 'vpr-color-hunters-instinct',
    });
  }

  override onYouGainEffect(id: string, matches: PartialFieldMatches<'GainsEffect'>): void {
    switch (id) {
      case EffectId.Swiftscaled:
        this.player.speedBuffs.swiftscaled = true;
        break;
      case EffectId.NoxiousGnash:
        this.noxiousGnashTimer.duration = Number(matches.duration) || 0;
        break;
      case EffectId.HuntersInstinct:
        this.huntersInstinct.duration = Number(matches.duration) || 0;
        break;
    }
  }

  override onYouLoseEffect(id: string): void {
    switch (id) {
      case EffectId.Swiftscaled:
        this.player.speedBuffs.swiftscaled = false;
        break;
      case EffectId.NoxiousGnash:
        this.noxiousGnashTimer.duration = 0;
        break;
      case EffectId.HuntersInstinct:
        this.huntersInstinct.duration = 0;
        break;
    }
  }

  override reset(): void {
    this.noxiousGnashTimer.duration = 0;
    this.huntersInstinct.duration = 0;
  }
}
