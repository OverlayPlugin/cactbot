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
  noxiousGnashTimer: TimerBox;
  huntersInstinctTimer: TimerBox;
  swiftscaledTimer: TimerBox;
  dreadComboTimer: TimerBox;

  vipersight: HTMLDivElement;
  currentVenomEffect = '';
  currentComboAction = '';
  tid1 = 0;

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

  override onUseAbility(id: string, matches: PartialFieldMatches<'Ability'>): void {
    if (id in VPRComponent.vipersightMap && matches.targetId !== 'E0000000') {
      this.currentComboAction = id;
      const side = VPRComponent.vipersightMap[id]?.[this.currentVenomEffect];
      this.vipersight.dataset.side = side ?? 'both';
      this.vipersight.classList.add('active');
    }

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
      case kAbility.SteelMaw:
      case kAbility.DreadMaw:
        if (matches.targetId !== 'E0000000') {
          this.comboTimer.duration = this.comboDuration;
          this.vipersight.dataset.stacks = '1';
          window.clearTimeout(this.tid1);
          this.tid1 = window.setTimeout(() => {
            this.vipersight.classList.remove('active');
          }, kComboDelay * 1000);
        } else {
          this.comboTimer.duration = 0;
          this.vipersight.classList.remove('active');
        }
        break;
      case kAbility.HuntersSting:
      case kAbility.SwiftskinsSting:
      case kAbility.HuntersBite:
      case kAbility.SwiftskinsBite:
        if (matches.targetId !== 'E0000000') {
          this.comboTimer.duration = this.comboDuration;
          this.vipersight.dataset.stacks = '2';
          window.clearTimeout(this.tid1);
          this.tid1 = window.setTimeout(() => {
            this.vipersight.classList.remove('active');
          }, kComboDelay * 1000);
        } else {
          this.comboTimer.duration = 0;
          this.vipersight.classList.remove('active');
        }
        break;
      case kAbility.FlankstingStrike:
      case kAbility.FlanksbaneFang:
      case kAbility.HindstingStrike:
      case kAbility.HindsbaneFang:
      case kAbility.JaggedMaw:
      case kAbility.BloodiedMaw:
        this.comboTimer.duration = 0;
        // Disable Vipersight when player deliver any third combo skill
        this.vipersight.classList.remove('active');
        this.vipersight.dataset.stacks = '0';
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
        this.currentVenomEffect = id;
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
        this.currentVenomEffect = '';
        if (this.vipersight.dataset.stacks !== '0') {
          this.vipersight.dataset.side = 'both';
          this.vipersight.classList.add('active');
        }
        break;
    }
  }

  override onMobGainsEffectFromYou(id: string, matches: PartialFieldMatches<'GainsEffect'>): void {
    switch (id) {
      case EffectId.NoxiousGnash_E53: {
        // FIXME:
        // Noxious Gnash can be different duration on multiple target,
        // and this condition will only monitor the longest one.
        // If you defeat a target with longer Noxious Gnash duration remains
        // and move to a new or shorter duration target,
        // This timer will not work well until new Noxious Gnash duration exceed timer.
        // For the same reason, timer will not reset when target with debuff is defeated.
        const duration = parseFloat(matches.duration ?? '0') || 0;
        if (this.noxiousGnashTimer.value < duration)
          this.noxiousGnashTimer.duration = duration - 0.5; // debuff delay
        break;
      }
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
    // Can safely use Reawaken than use Dread Combo to extend buffs
    this.noxiousGnashTimer.threshold = gcdSkill * 5 + 1;
    this.huntersInstinctTimer.threshold = gcdSkill * 8 + 1;
    this.swiftscaledTimer.threshold = gcdSkill * 8 + 1;
    this.dreadComboTimer.threshold = gcdSkill * 5 + 1;
  }

  override reset(): void {
    this.rattlingCoil.innerText = '0';
    this.noxiousGnashTimer.duration = 0;
    this.huntersInstinctTimer.duration = 0;
    this.swiftscaledTimer.duration = 0;
    this.vipersight.classList.remove('active');
    this.vipersight.dataset.stacks = '0';
    this.vipersight.dataset.side = '';
    window.clearTimeout(this.tid1);
  }
}
