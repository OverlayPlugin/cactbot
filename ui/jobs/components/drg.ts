import TimerBar from '../../../resources/timerbar';
import TimerBox from '../../../resources/timerbox';
import { JobDetail } from '../../../types/event';
import { ResourceBox } from '../bars';
import { ComboTracker } from '../combo_tracker';
import { kAbility } from '../constants';
import { computeBackgroundColorFrom, showDuration } from '../utils';

import { BaseComponent, ComponentInterface } from './base';

export class DRGComponent extends BaseComponent {
  highJumpBox: TimerBox;
  powerSergeBox: TimerBox;
  lanceChargeBox: TimerBox;
  geirskogulBox: TimerBox;
  firstmindsFocus: ResourceBox;
  comboTimer: TimerBar;
  tid1 = 0;
  tid2 = 0;

  constructor(o: ComponentInterface) {
    super(o);

    // Boxes
    this.powerSergeBox = this.bars.addProcBox({
      id: 'drg-procs-powerserge',
      fgColor: 'drg-color-powerserge',
      notifyWhenExpired: true,
    });
    this.highJumpBox = this.bars.addProcBox({
      id: 'drg-procs-highjump',
      fgColor: 'drg-color-highjump',
    });
    this.lanceChargeBox = this.bars.addProcBox({
      id: 'drg-procs-lancecharge',
      fgColor: 'drg-color-lancecharge',
      threshold: 20,
    });
    this.geirskogulBox = this.bars.addProcBox({
      id: 'drg-procs-geirskogul',
      fgColor: 'drg-color-geirskogul',
      threshold: 20,
    });

    this.comboTimer = this.bars.addTimerBar({
      id: 'drg-timers-combo',
      fgColor: 'combo-color',
    });

    // Gauge
    this.firstmindsFocus = this.bars.addResourceBox({
      classList: ['drg-color-firstmindsfocus'],
    });

    this.reset();
    this.onStatChange({ gcdSkill: this.player.gcdSkill });
  }

  override onCombo(skill: string, combo: ComboTracker): void {
    // Both Disembowel and SonicThrust apply PowerSurge for 30s,
    // but Disembowel will lock the buff duration until fully act.
    if (skill === kAbility.Disembowel)
      this.powerSergeBox.duration = 30 + 1;
    if (skill === kAbility.SpiralBlow)
      this.powerSergeBox.duration = 30 + 1; // FIXME: not sure the animation lock still 1s
    if (skill === kAbility.SonicThrust)
      this.powerSergeBox.duration = 30;
    this.comboTimer.duration = 0;
    if (combo.isFinalSkill)
      return;
    if (skill)
      this.comboTimer.duration = this.comboDuration;
  }

  override onUseAbility(id: string): void {
    switch (id) {
      case kAbility.HighJump:
      case kAbility.Jump:
        this.highJumpBox.duration = 30;
        break;
      case kAbility.LanceCharge: {
        this.tid1 = showDuration({
          tid: this.tid1,
          timerbox: this.lanceChargeBox,
          duration: 20,
          cooldown: 60,
          threshold: this.player.gcdSkill + 1,
          activecolor: 'drg-color-lancecharge.active',
          deactivecolor: 'drg-color-lancecharge',
        });
        break;
      }
      case kAbility.Geirskogul: {
        this.tid2 = showDuration({
          tid: this.tid2,
          timerbox: this.geirskogulBox,
          duration: 20,
          cooldown: 60,
          threshold: this.player.gcdSkill + 1,
          activecolor: 'drg-color-geirskogul.active',
          deactivecolor: 'drg-color-geirskogul',
        });
        break;
      }
    }
  }

  override onStatChange({ gcdSkill }: { gcdSkill: number }): void {
    this.powerSergeBox.valuescale = gcdSkill;
    this.powerSergeBox.threshold = gcdSkill * 4;
    this.highJumpBox.valuescale = gcdSkill;
    this.highJumpBox.threshold = gcdSkill + 1;
  }

  override onJobDetailUpdate(jobDetail: JobDetail['DRG']): void {
    this.firstmindsFocus.innerText = jobDetail.firstmindsFocus.toString();
  }

  override reset(): void {
    this.highJumpBox.duration = 0;
    this.powerSergeBox.duration = 0;
    this.lanceChargeBox.duration = 0;
    this.lanceChargeBox.fg = computeBackgroundColorFrom(
      this.lanceChargeBox,
      'drg-color-lancecharge',
    );
    this.geirskogulBox.duration = 0;
    this.geirskogulBox.fg = computeBackgroundColorFrom(
      this.geirskogulBox,
      'drg-color-geirskogul',
    );
    window.clearTimeout(this.tid1);
    window.clearTimeout(this.tid2);
  }
}

export class DRG6xComponent extends BaseComponent {
  highJumpBox: TimerBox;
  disembowelBox: TimerBox;
  lanceChargeBox: TimerBox;
  dragonSightBox: TimerBox;
  blood: ResourceBox;
  firstmindsFocus: ResourceBox;
  tid1 = 0;
  tid2 = 0;

  constructor(o: ComponentInterface) {
    super(o);

    // Boxes
    this.highJumpBox = this.bars.addProcBox({
      id: 'drg-procs-highjump',
      fgColor: 'drg-color-highjump',
    });

    this.disembowelBox = this.bars.addProcBox({
      id: 'drg-procs-disembowel',
      fgColor: 'drg-color-disembowel',
      notifyWhenExpired: true,
    });

    this.lanceChargeBox = this.bars.addProcBox({
      id: 'drg-procs-lancecharge',
      fgColor: 'drg-color-lancecharge',
      threshold: 20,
    });

    this.dragonSightBox = this.bars.addProcBox({
      id: 'drg-procs-dragonsight',
      fgColor: 'drg-color-dragonsight',
      threshold: 20,
    });

    // Gauge
    this.blood = this.bars.addResourceBox({
      classList: ['drg-color-blood'],
    });
    this.firstmindsFocus = this.bars.addResourceBox({
      classList: ['drg-color-firstmindsfocus'],
    });

    this.reset();
    this.onStatChange({ gcdSkill: this.player.gcdSkill });
  }

  override onCombo(skill: string): void {
    // Both Disembowel and SonicThrust apply PowerSurge for 30s,
    // but Disembowel will lock the buff duration until fully act.
    if (skill === kAbility.Disembowel)
      this.disembowelBox.duration = 30 + 1;
    if (skill === kAbility.SonicThrust)
      this.disembowelBox.duration = 30;
  }

  override onUseAbility(id: string): void {
    switch (id) {
      case kAbility.HighJump:
      case kAbility.Jump:
        this.highJumpBox.duration = 30;
        break;
      case kAbility.LanceCharge: {
        this.lanceChargeBox.duration = 20;
        this.lanceChargeBox.fg = computeBackgroundColorFrom(
          this.lanceChargeBox,
          'drg-color-lancecharge.active',
        );
        this.tid1 = window.setTimeout(() => {
          this.lanceChargeBox.duration = 40;
          this.lanceChargeBox.fg = computeBackgroundColorFrom(
            this.lanceChargeBox,
            'drg-color-lancecharge',
          );
        }, 20000);
        break;
      }
      case kAbility.DragonSight: {
        this.dragonSightBox.duration = 20;
        this.dragonSightBox.fg = computeBackgroundColorFrom(
          this.dragonSightBox,
          'drg-color-dragonsight.active',
        );
        this.tid2 = window.setTimeout(() => {
          this.dragonSightBox.duration = 100;
          this.dragonSightBox.fg = computeBackgroundColorFrom(
            this.dragonSightBox,
            'drg-color-dragonsight',
          );
        }, 20000);
        break;
      }
    }
  }

  override onStatChange({ gcdSkill }: { gcdSkill: number }): void {
    this.disembowelBox.valuescale = gcdSkill;
    this.disembowelBox.threshold = gcdSkill * 5;
    this.highJumpBox.valuescale = gcdSkill;
    this.highJumpBox.threshold = gcdSkill + 1;
  }

  override onJobDetailUpdate(jobDetail: JobDetail['DRG']): void {
    this.blood.parentNode.classList.remove('zero', 'one', 'two');
    this.blood.parentNode.classList.toggle('life', jobDetail.lifeMilliseconds > 0);
    if (jobDetail.lifeMilliseconds > 0) {
      this.blood.innerText = Math.ceil(jobDetail.lifeMilliseconds / 1000).toString();
    } else {
      this.blood.innerText = jobDetail.eyesAmount.toString();
      if (jobDetail.eyesAmount === 0)
        this.blood.parentNode.classList.add('zero');
      else if (jobDetail.eyesAmount === 1)
        this.blood.parentNode.classList.add('one');
      else if (jobDetail.eyesAmount === 2)
        this.blood.parentNode.classList.add('two');
    }

    this.firstmindsFocus.innerText = jobDetail.firstmindsFocus.toString();
  }

  override reset(): void {
    this.highJumpBox.duration = 0;
    this.disembowelBox.duration = 0;
    this.lanceChargeBox.duration = 0;
    this.lanceChargeBox.fg = computeBackgroundColorFrom(
      this.lanceChargeBox,
      'drg-color-lancecharge',
    );
    this.dragonSightBox.duration = 0;
    this.dragonSightBox.fg = computeBackgroundColorFrom(
      this.dragonSightBox,
      'drg-color-dragonsight',
    );
    window.clearTimeout(this.tid1);
    window.clearTimeout(this.tid2);
  }
}
