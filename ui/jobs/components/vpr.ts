import EffectId from '../../../resources/effect_id';
import TimerBar from '../../../resources/timerbar';
import TimerBox from '../../../resources/timerbox';
import { JobDetail } from '../../../types/event';
import { ResourceBox } from '../bars';
import { kAbility } from '../constants';
import { PartialFieldMatches } from '../event_emitter';

import { BaseComponent, ComponentInterface } from './base';

export class VPRComponent extends BaseComponent {
  rattlingCoil: ResourceBox;
  serpentOfferings: ResourceBox;
  comboTimer: TimerBar;
  noxiousGnashTimer: TimerBox;
  huntersInstinctTimer: TimerBox;
  swiftscaledTimer: TimerBox;
  dreadComboTimer: TimerBox;

  constructor(o: ComponentInterface) {
    super(o);

    this.rattlingCoil = this.bars.addResourceBox({
      classList: ['vpr-color-rattling-coil'],
    });

    this.serpentOfferings = this.bars.addResourceBox({
      classList: ['vpr-color-serpentofferings'],
    });

    this.comboTimer = this.bars.addTimerBar({
      id: 'vpr-timers-combo',
      fgColor: 'combo-color',
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

    this.dreadComboTimer = this.bars.addProcBox({
      id: 'vpr-timers-dreadcombo',
      fgColor: 'vpr-color-dreadcombo',
    });
  }

  override onUseAbility(id: string, matches: PartialFieldMatches<'Ability'>): void {
    switch (id) {
      case kAbility.Dreadwinder:
      case kAbility.PitOfDread:
        if (matches.targetIndex === '0') {
          this.dreadComboTimer.duration = 40 + (this.dreadComboTimer.value ?? 0);
        }
        break;
      // Due to viper auto combo, combo action cannot be used out of combo.
      // It's unnecessary to use combo tracker.
      case kAbility.SteelFangs:
      case kAbility.DreadFangs:
      case kAbility.HuntersSting:
      case kAbility.SwiftskinsSting:
      case kAbility.SteelMaw:
      case kAbility.DreadMaw:
      case kAbility.HuntersBite:
      case kAbility.SwiftskinsBite:
        this.comboTimer.duration = this.comboDuration;
        break;
      case kAbility.FlankstingStrike:
      case kAbility.FlanksbaneFang:
      case kAbility.HindstingStrike:
      case kAbility.HindsbaneFang:
      case kAbility.JaggedMaw:
      case kAbility.BloodiedMaw:
        this.comboTimer.duration = 0;
        break;
    }
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

    const so = jobDetail.serpentOffering;
    this.serpentOfferings.innerText = so.toString();
    this.serpentOfferings.parentNode.classList.remove('high', 'active');
    if (so >= 50)
      this.serpentOfferings.parentNode.classList.add('high');
    else if (jobDetail.anguineTribute > 0) {
      this.serpentOfferings.parentNode.classList.add('active');
      this.serpentOfferings.innerText = jobDetail.anguineTribute.toString();
    }
  }

  override reset(): void {
    this.rattlingCoil.innerText = '0';
    this.noxiousGnashTimer.duration = 0;
    this.huntersInstinctTimer.duration = 0;
    this.swiftscaledTimer.duration = 0;
  }
}
