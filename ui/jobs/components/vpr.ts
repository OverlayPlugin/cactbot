import EffectId from '../../../resources/effect_id';
import TimerBox from '../../../resources/timerbox';
import { JobDetail } from '../../../types/event';
import { ResourceBox } from '../bars';
import { PartialFieldMatches } from '../event_emitter';

import { BaseComponent, ComponentInterface } from './base';

export class VPRComponent extends BaseComponent {
  rattlingCoil: ResourceBox;
  noxiousGnashTimer: TimerBox;
  huntersInstinctTimer: TimerBox;
  swiftscaledTimer: TimerBox;

  constructor(o: ComponentInterface) {
    super(o);

    this.rattlingCoil = this.bars.addResourceBox({
      classList: ['vpr-color-rattling-coil'],
    });

    this.noxiousGnashTimer = this.bars.addProcBox({
      id: 'vpr-timers-noxious-gnash',
      fgColor: 'vpr-color-noxious-gnash',
    });

    this.huntersInstinctTimer = this.bars.addProcBox({
      id: 'vpr-timers-hunters-instinct',
      fgColor: 'vpr-color-hunters-instinct',
    });

    this.swiftscaledTimer = this.bars.addProcBox({
      id: 'vpr-timers-swiftscaled',
      fgColor: 'vpr-color-swiftscaled',
    });
  }

  override onYouGainEffect(id: string, matches: PartialFieldMatches<'GainsEffect'>): void {
    switch (id) {
      case EffectId.Swiftscaled:
        this.player.speedBuffs.swiftscaled = true;
        this.swiftscaledTimer.duration = Number(matches.duration) || 0;
        break;
      case EffectId.HuntersInstinct:
        this.huntersInstinctTimer.duration = Number(matches.duration) || 0;
        break;
    }
  }

  override onYouLoseEffect(id: string): void {
    switch (id) {
      case EffectId.Swiftscaled:
        this.player.speedBuffs.swiftscaled = false;
        this.swiftscaledTimer.duration = 0;
        break;
      case EffectId.HuntersInstinct:
        this.huntersInstinctTimer.duration = 0;
        break;
    }
  }

  override onMobGainsEffectFromYou(id: string, matches: PartialFieldMatches<'GainsEffect'>): void {
    switch (id) {
      case EffectId.NoxiousGnash: {
        // FIXME:
        // Noxious Gnash can be different duration on multiple target,
        // and this condition will only monitor the longest one.
        // If you defeat a target with longer Noxious Gnash duration remains
        // and move to a new or shorter duration target,
        // This timer will not work well until new Noxious Gnash duration exceed timer.
        // For the same reason, timer will not reset when target with debuff is defeated.
        const duration = parseFloat(matches.duration ?? '0') || 0;
        if (this.noxiousGnashTimer.value < duration)
          this.noxiousGnashTimer.duration = duration;
        break;
      }
    }
  }

  override onJobDetailUpdate(jobDetail: JobDetail['VPR']): void {
    this.rattlingCoil.innerText = jobDetail.rattlingCoilStacks.toString();
  }

  override reset(): void {
    this.rattlingCoil.innerText = '0';
    this.noxiousGnashTimer.duration = 0;
    this.huntersInstinctTimer.duration = 0;
    this.swiftscaledTimer.duration = 0;
  }
}
