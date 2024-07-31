import TimerBox from '../../../resources/timerbox';
import { JobDetail } from '../../../types/event';
import { ResourceBox } from '../bars';
import { kAbility } from '../constants';

import { BaseComponent, ComponentInterface } from './base';

export class SCHComponent extends BaseComponent {
  aetherflowStackBox: ResourceBox;
  fairyGaugeBox: ResourceBox;
  bioBox: TimerBox;
  aetherflowBox: TimerBox;
  lucidBox: TimerBox;
  tid1 = 0;

  constructor(o: ComponentInterface) {
    super(o);
    this.aetherflowStackBox = this.bars.addResourceBox({
      classList: ['sch-color-aetherflow'],
    });

    this.fairyGaugeBox = this.bars.addResourceBox({
      classList: ['sch-color-fairygauge'],
    });

    this.bioBox = this.bars.addProcBox({
      id: 'sch-procs-bio',
      fgColor: 'sch-color-bio',
      notifyWhenExpired: true,
    });

    this.aetherflowBox = this.bars.addProcBox({
      id: 'sch-procs-aetherflow',
      fgColor: 'sch-color-aetherflow',
    });

    this.lucidBox = this.bars.addProcBox({
      id: 'sch-procs-luciddreaming',
      fgColor: 'sch-color-lucid',
    });

    this.reset();
  }

  RefreshAFthreholds(): void {
    // dynamically adjust alert threholds depends on aetherflow stacks
    this.aetherflowBox.threshold = this.player.gcdSpell * (
          +this.aetherflowStackBox.innerText || 1
        ) + 1;
    if (
      +this.aetherflowStackBox.innerText * 5 >=
        (this.aetherflowBox.duration ?? 0) - this.aetherflowBox.elapsed
    ) {
      this.aetherflowStackBox.parentNode.classList.add('pulse');
    } else {
      this.aetherflowStackBox.parentNode.classList.remove('pulse');
    }
  }

  override onJobDetailUpdate(jobDetail: JobDetail['SCH']): void {
    const aetherflow = jobDetail.aetherflowStacks;
    const fairygauge = jobDetail.fairyGauge;
    const milli = Math.ceil(jobDetail.fairyMilliseconds / 1000);
    this.aetherflowStackBox.innerText = aetherflow.toString();
    this.fairyGaugeBox.innerText = fairygauge.toString();
    const f = this.fairyGaugeBox.parentNode;
    if (jobDetail.fairyMilliseconds !== 0) {
      f.classList.add('bright');
      this.fairyGaugeBox.innerText = milli.toString();
    } else {
      f.classList.remove('bright');
      this.fairyGaugeBox.innerText = fairygauge.toString();
    }
    this.RefreshAFthreholds();
  }

  override onUseAbility(id: string): void {
    switch (id) {
      case kAbility.Bio:
      case kAbility.Bio2:
      case kAbility.Biolysis:
        this.bioBox.duration = 30;
        break;
      case kAbility.Aetherflow:
        this.aetherflowBox.duration = 60;
        this.aetherflowStackBox.parentNode.classList.remove('pulse');
        // check at -15s, -10s, -5s and 0s
        this.tid1 = window.setTimeout(() => {
          const now = new Date().getTime();
          this.RefreshAFthreholds();
          const timer = window.setInterval(() => {
            if (new Date().getTime() - now >= 15 * 1000) {
              window.clearInterval(timer);
            }
            this.RefreshAFthreholds();
          }, 5 * 1000);
        }, 45 * 1000);
        break;
      case kAbility.LucidDreaming:
        this.lucidBox.duration = 60;
        break;
    }
  }

  override onStatChange({ gcdSpell }: { gcdSpell: number }): void {
    this.bioBox.threshold = gcdSpell + 1;
    this.lucidBox.threshold = gcdSpell + 1;
  }

  override reset(): void {
    this.bioBox.duration = 0;
    this.aetherflowBox.duration = 0;
    this.aetherflowStackBox.innerText = '0';
    this.lucidBox.duration = 0;
    window.clearTimeout(this.tid1);
  }
}
