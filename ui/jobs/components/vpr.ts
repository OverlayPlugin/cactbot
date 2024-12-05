import EffectId from '../../../resources/effect_id';
import TimerBar from '../../../resources/timerbar';
import TimerBox from '../../../resources/timerbox';
import { JobDetail } from '../../../types/event';
import { ResourceBox } from '../bars';
import { kAbility, kComboDelay } from '../constants';
import { PartialFieldMatches } from '../event_emitter';

import { BaseComponent, ComponentInterface } from './base';

export class VPRComponent extends BaseComponent {
  rattlingCoil: ResourceBox;
  serpentOfferings: ResourceBox;
  comboTimer: TimerBar;
  huntersInstinctTimer: TimerBox;
  swiftscaledTimer: TimerBox;
  viceComboTimer: TimerBox;

  vipersight: HTMLDivElement;
  Combo = '';
  Venom = '';
  Honed = '';
  tid1 = 0;

  static comboStage: Record<string, string> = {
    [kAbility.SteelFangs]: '1',
    [kAbility.DreadFangs]: '1',
    [kAbility.HuntersSting]: '2',
    [kAbility.SwiftskinsSting]: '2',
    [kAbility.SteelMaw]: '1',
    [kAbility.DreadMaw]: '1',
    [kAbility.HuntersBite]: '2',
    [kAbility.SwiftskinsBite]: '2',
    ['']: '0',
  };

  static honedMap: Record<string, string> = {
    [EffectId.HonedSteel]: 'left',
    [EffectId.HonedReavers]: 'right',
  };

  static vipersightMap: Record<string, Record<string, 'left' | 'right'>> = {
    // Single target - first skill
    [kAbility.SteelFangs]: {
      [EffectId.FlankstungVenom]: 'left',
      [EffectId.FlanksbaneVenom]: 'left',
      [EffectId.HindstungVenom]: 'right',
      [EffectId.HindsbaneVenom]: 'right',
    },
    [kAbility.DreadFangs]: {
      [EffectId.FlankstungVenom]: 'left',
      [EffectId.FlanksbaneVenom]: 'left',
      [EffectId.HindstungVenom]: 'right',
      [EffectId.HindsbaneVenom]: 'right',
    },
    // Single target - second skill
    [kAbility.HuntersSting]: {
      [EffectId.FlankstungVenom]: 'left',
      [EffectId.FlanksbaneVenom]: 'right',
    },
    [kAbility.SwiftskinsSting]: {
      [EffectId.HindstungVenom]: 'left',
      [EffectId.HindsbaneVenom]: 'right',
    },
    // Multiple target - second skill
    [kAbility.HuntersBite]: {
      [EffectId.GrimhuntersVenom]: 'left',
      [EffectId.GrimskinsVenom]: 'right',
    },
    [kAbility.SwiftskinsBite]: {
      [EffectId.GrimhuntersVenom]: 'left',
      [EffectId.GrimskinsVenom]: 'right',
    },
  };

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

    this.huntersInstinctTimer = this.bars.addProcBox({
      id: 'vpr-timers-hunters-instinct',
      fgColor: 'vpr-color-hunters-instinct',
    });

    this.swiftscaledTimer = this.bars.addProcBox({
      id: 'vpr-timers-swiftscaled',
      fgColor: 'vpr-color-swiftscaled',
    });

    this.viceComboTimer = this.bars.addProcBox({
      id: 'vpr-timers-vicecombo',
      fgColor: 'vpr-color-vicecombo',
    });

    const stackContainer = document.createElement('div');
    stackContainer.classList.add('stacks');
    this.bars.addJobBarContainer().appendChild(stackContainer);

    this.vipersight = document.createElement('div');
    this.vipersight.id = 'vpr-stacks-vipersight';
    stackContainer.appendChild(this.vipersight);

    for (const side of ['left', 'right']) {
      const d = document.createElement('div');
      d.classList.add(side);
      this.vipersight.appendChild(d);
    }
  }

  refreshVipersight(combo: string, venom: string, honed: string): void {
    const stage = VPRComponent.comboStage[combo];
    this.vipersight.dataset.stacks = stage;
    if (stage !== '0') {
      this.vipersight.dataset.side = VPRComponent.vipersightMap[combo]?.[venom] ?? 'both';
    } else {
      this.vipersight.dataset.side = VPRComponent.honedMap[honed] ?? 'both';
    }
  }

  override onUseAbility(id: string, matches: PartialFieldMatches<'Ability'>): void {
    switch (id) {
      case kAbility.Vicewinder:
      case kAbility.Vicepit:
        if (matches.targetIndex === '0') {
          this.viceComboTimer.duration = 40 + (this.viceComboTimer.value ?? 0);
        }
        break;
      // Due to viper auto combo, combo action cannot be used out of combo.
      // It's unnecessary to use combo tracker.
      case kAbility.SteelFangs:
      case kAbility.DreadFangs:
      case kAbility.SteelMaw:
      case kAbility.DreadMaw:
      case kAbility.HuntersSting:
      case kAbility.SwiftskinsSting:
      case kAbility.HuntersBite:
      case kAbility.SwiftskinsBite:
        if (matches.targetId !== 'E0000000') {
          this.comboTimer.duration = this.comboDuration;
          this.Combo = id;
          this.refreshVipersight(this.Combo, this.Venom, this.Honed);
          window.clearTimeout(this.tid1);
          this.tid1 = window.setTimeout(() => {
            this.Combo = '';
            this.refreshVipersight(this.Combo, this.Venom, this.Honed);
          }, kComboDelay * 1000);
        } else {
          this.comboTimer.duration = 0;
          this.Combo = '';
          this.refreshVipersight(this.Combo, this.Venom, this.Honed);
        }
        break;
      case kAbility.FlankstingStrike:
      case kAbility.FlanksbaneFang:
      case kAbility.HindstingStrike:
      case kAbility.HindsbaneFang:
      case kAbility.JaggedMaw:
      case kAbility.BloodiedMaw:
        this.comboTimer.duration = 0;
        this.Combo = '';
        this.refreshVipersight(this.Combo, this.Venom, this.Honed);
        window.clearTimeout(this.tid1);
        break;
    }
  }

  override onYouGainEffect(id: string, matches: PartialFieldMatches<'GainsEffect'>): void {
    switch (id) {
      // Both buff have an animation lock, + 0.5s
      // (buff time won't go down until animation fully acted)
      // FIXME: Swiftskin's Coil has a little longer animation lock for swiftscaled
      case EffectId.Swiftscaled_E55:
        this.player.speedBuffs.swiftscaled = true;
        this.swiftscaledTimer.duration = (Number(matches.duration) || 0) + 0.5;
        break;
      case EffectId.HuntersInstinct_E54:
        this.huntersInstinctTimer.duration = (Number(matches.duration) || 0) + 0.5;
        break;
      case EffectId.HindsbaneVenom:
      case EffectId.HindstungVenom:
      case EffectId.FlanksbaneVenom:
      case EffectId.FlankstungVenom:
      case EffectId.GrimhuntersVenom:
      case EffectId.GrimskinsVenom:
        this.Venom = id;
        break;
      case EffectId.HonedSteel:
      case EffectId.HonedReavers:
        this.Honed = id;
        break;
    }
  }

  override onYouLoseEffect(id: string): void {
    switch (id) {
      case EffectId.Swiftscaled_E55:
        this.player.speedBuffs.swiftscaled = false;
        this.swiftscaledTimer.duration = 0;
        break;
      case EffectId.HuntersInstinct_E54:
        this.huntersInstinctTimer.duration = 0;
        break;
      case EffectId.HindsbaneVenom:
      case EffectId.HindstungVenom:
      case EffectId.FlanksbaneVenom:
      case EffectId.FlankstungVenom:
      case EffectId.GrimhuntersVenom:
      case EffectId.GrimskinsVenom:
        this.Venom = '';
        this.refreshVipersight(this.Combo, this.Venom, this.Honed);
        break;
      case EffectId.HonedSteel:
      case EffectId.HonedReavers:
        this.Honed = '';
        this.refreshVipersight(this.Combo, this.Venom, this.Honed);
        break;
    }
  }

  override onJobDetailUpdate(jobDetail: JobDetail['VPR']): void {
    this.rattlingCoil.innerText = jobDetail.rattlingCoilStacks.toString();
    this.rattlingCoil.parentNode.classList.toggle('pulse', jobDetail.rattlingCoilStacks === 3);

    const so = jobDetail.serpentOffering;
    this.serpentOfferings.innerText = so.toString();
    this.serpentOfferings.parentNode.classList.remove('high', 'active', 'pulse');
    if (jobDetail.anguineTribute > 0) {
      this.serpentOfferings.parentNode.classList.add('active');
      this.serpentOfferings.innerText = jobDetail.anguineTribute.toString();
    } else if (so === 100)
      this.serpentOfferings.parentNode.classList.add('high', 'pulse');
    else if (so >= 50)
      this.serpentOfferings.parentNode.classList.add('high');
  }

  override onStatChange({ gcdSkill }: { gcdSkill: number }): void {
    // Can safely use Reawaken than use Vice Combo to extend buffs
    this.huntersInstinctTimer.threshold = gcdSkill * 8 + 1;
    this.swiftscaledTimer.threshold = gcdSkill * 8 + 1;
    this.viceComboTimer.threshold = gcdSkill * 5 + 1;
  }

  override reset(): void {
    this.rattlingCoil.innerText = '0';
    this.rattlingCoil.parentNode.classList.remove('pulse');
    this.serpentOfferings.innerText = '0';
    this.serpentOfferings.parentNode.classList.remove('high', 'active', 'pulse');
    this.comboTimer.duration = 0;
    this.huntersInstinctTimer.duration = 0;
    this.swiftscaledTimer.duration = 0;
    this.viceComboTimer.duration = 0;
    this.Combo = '';
    this.Venom = '';
    this.Honed = '';
    this.refreshVipersight(this.Combo, this.Venom, this.Honed);
    window.clearTimeout(this.tid1);
  }
}
