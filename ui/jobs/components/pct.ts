import EffectId from '../../../resources/effect_id';
import TimerBar from '../../../resources/timerbar';
import TimerBox from '../../../resources/timerbox';
import { JobDetail } from '../../../types/event';
import { ResourceBox } from '../bars';
import { kAbility } from '../constants';
import { PartialFieldMatches } from '../event_emitter';

import { BaseComponent, ComponentInterface } from './base';

export class PCTComponent extends BaseComponent {
  whitePaint: ResourceBox;
  paletteGauge: ResourceBox;
  livingCanvasStacks: HTMLDivElement;
  portraitStacks: HTMLDivElement;

  livingMuseBox: TimerBox;
  steelMuseBox: TimerBox;
  scenicMuseBox: TimerBox;
  hammerTimer: TimerBar;

  constructor(o: ComponentInterface) {
    super(o);

    this.paletteGauge = this.bars.addResourceBox({
      classList: ['pct-color-palettegauge'],
    });
    this.whitePaint = this.bars.addResourceBox({
      classList: ['pct-color-whitepaint'],
    });

    this.hammerTimer = this.bars.addTimerBar({
      id: 'pct-timers-hammer',
      fgColor: 'pct-color-steelmuse',
    });

    this.livingCanvasStacks = document.createElement('div');
    this.livingCanvasStacks.id = 'pct-stacks-living';
    this.livingCanvasStacks.classList.add('stacks');
    for (let i = 0; i < 4; i++) {
      const stack = document.createElement('div');
      this.livingCanvasStacks.appendChild(stack);
    }
    this.bars.addJobBarContainer().appendChild(this.livingCanvasStacks);

    this.portraitStacks = document.createElement('div');
    this.portraitStacks.id = 'pct-stacks-portrait';
    this.portraitStacks.classList.add('stacks');
    for (let i = 0; i < 2; i++) {
      const stack = document.createElement('div');
      this.portraitStacks.appendChild(stack);
    }
    this.bars.addJobBarContainer().appendChild(this.portraitStacks);

    this.livingMuseBox = this.bars.addProcBox({
      id: 'pct-procs-livingmuses',
      fgColor: 'pct-color-livingmuse',
    });
    this.steelMuseBox = this.bars.addProcBox({
      id: 'pct-procs-steelmuses',
      fgColor: 'pct-color-steelmuse',
    });
    this.scenicMuseBox = this.bars.addProcBox({
      id: 'pct-procs-scenicmuses',
      fgColor: 'pct-color-scenicmuse',
    });

    this.reset();
  }

  override onYouGainEffect(id: string, _effect: PartialFieldMatches<'GainsEffect'>): void {
    switch (id) {
      case EffectId.MonochromeTones:
        this.whitePaint.parentElement?.classList.add('black');
        break;
    }
  }

  override onYouLoseEffect(id: string, _effect: PartialFieldMatches<'LosesEffect'>): void {
    switch (id) {
      case EffectId.MonochromeTones:
        this.whitePaint.parentElement?.classList.remove('black');
        break;
      case EffectId.HammerTime:
        this.hammerTimer.duration = 0;
    }
  }

  override onUseAbility(id: string, matches: PartialFieldMatches<'Ability'>): void {
    switch (id) {
      // Living Muses
      case kAbility.PomMuse:
      case kAbility.WingedMuse:
      case kAbility.ClawedMuse:
      case kAbility.FangedMuse:
        if (matches.targetIndex === '0') {
          this.livingMuseBox.duration = 40 + (this.livingMuseBox.value ?? 0);
        }
        break;
      case kAbility.StrikingMuse:
        this.steelMuseBox.duration = 60 + (this.steelMuseBox.value ?? 0);
        this.hammerTimer.stylefill = 'empty';
        this.hammerTimer.duration = 30;
        break;
      case kAbility.StarryMuse:
        this.scenicMuseBox.duration = 120;
        break;
    }
  }

  override onJobDetailUpdate(jobDetail: JobDetail['PCT']): void {
    this.paletteGauge.innerText = jobDetail.paletteGauge.toString();
    this.paletteGauge.parentNode.classList.toggle('full', jobDetail.paletteGauge === 100);

    this.whitePaint.innerText = jobDetail.paint.toString();

    // Light up the rendered stacks for the current living canvas objects.
    livingCanvasObjects.forEach((obj, i) => {
      if (jobDetail.depictions?.includes(obj as typeof jobDetail.depictions[number])) {
        this.livingCanvasStacks.children[i]?.classList.add('active');
      } else if (obj === jobDetail.creatureMotif) {
        this.livingCanvasStacks.children[i]?.classList.add('active', 'pulse');
      } else {
        this.livingCanvasStacks.children[i]?.classList.remove('active', 'pulse');
      }
    });
    if (!jobDetail.creatureMotif || jobDetail.creatureMotif === 'None') {
      for (let i = 0; i < livingCanvasObjects.length; i++) {
        const obj = livingCanvasObjects[i];
        if (jobDetail.depictions?.includes(obj as typeof jobDetail.depictions[number])) {
          continue;
        }
        this.livingCanvasStacks.children[i]?.classList.add('pulse');
        break;
      }
    }

    // Portrait
    this.portraitStacks.children[0]?.classList.toggle('active', jobDetail.mooglePortrait);
    this.portraitStacks.children[1]?.classList.toggle('active', jobDetail.madeenPortrait);

    // when set on fill, inactive timer is full, indicate availble weapon motif, vise versa.
    if (jobDetail.weaponMotif === true)
      this.hammerTimer.stylefill = 'fill';
    else
      this.hammerTimer.stylefill = 'empty';
  }

  override onStatChange({ gcdSpell }: { gcdSpell: number }): void {
    this.livingMuseBox.threshold = gcdSpell * 3;
    this.steelMuseBox.threshold = gcdSpell * 3;
    this.scenicMuseBox.threshold = gcdSpell * 3;
  }

  override reset(): void {
    this.paletteGauge.innerText = '';
    this.whitePaint.innerText = '';
    this.whitePaint.parentElement?.classList.remove('black');
    this.livingCanvasStacks.childNodes?.forEach((stack) => {
      if (stack instanceof HTMLElement)
        stack.classList.remove('active', 'pulse');
    });
    this.livingMuseBox.duration = 0;
    this.steelMuseBox.duration = 0;
    this.scenicMuseBox.duration = 0;
    this.hammerTimer.stylefill = 'empty';
  }
}

const livingCanvasObjects = ['Pom', 'Wing', 'Claw', 'Maw'] as const;
