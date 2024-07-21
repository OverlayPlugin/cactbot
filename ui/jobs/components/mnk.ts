import EffectId from '../../../resources/effect_id';
import TimerBar from '../../../resources/timerbar';
import TimerBox from '../../../resources/timerbox';
import { JobDetail } from '../../../types/event';
import { ResourceBox } from '../bars';
import { kAbility } from '../constants';
import { PartialFieldMatches } from '../event_emitter';
import { computeBackgroundColorFrom } from '../utils';

import { BaseComponent, ComponentInterface } from './base';

export class MNKComponent extends BaseComponent {
  formTimer: TimerBar;
  chakraBox: ResourceBox;
  perfectbalanceBox: TimerBox;
  riddleOfFireBox: TimerBox;
  riddleOfWindBox: TimerBox;
  brotherhoodBox: TimerBox;
  perfectBalanceActive = false;
  lunarStacks: HTMLDivElement[];
  beastChakraStacks: HTMLDivElement[] = [];
  solarStacks: HTMLDivElement[];
  opoopoStacks: HTMLDivElement[] = [];
  raptorStacks: HTMLDivElement[] = [];
  coeurlStacks: HTMLDivElement[] = [];

  constructor(o: ComponentInterface) {
    super(o);

    this.formTimer = this.bars.addTimerBar({
      id: 'mnk-timers-combo',
      fgColor: 'mnk-color-form',
    });

    this.chakraBox = this.bars.addResourceBox({
      classList: ['mnk-color-chakra'],
    });

    this.perfectbalanceBox = this.bars.addProcBox({
      id: 'mnk-procs-perfectbalance',
      fgColor: 'mnk-color-perfectbalance',
    });

    this.riddleOfFireBox = this.bars.addProcBox({
      id: 'mnk-procs-riddleoffire',
      fgColor: 'mnk-color-riddleoffire',
    });

    this.riddleOfWindBox = this.bars.addProcBox({
      id: 'mnk-procs-riddleofwind',
      fgColor: 'mnk-color-riddleofwind',
    });

    this.brotherhoodBox = this.bars.addProcBox({
      id: 'mnk-procs-brotherhood',
      fgColor: 'mnk-color-brotherhood',
    });

    // Fury Gauge
    const stacksContainer2 = document.createElement('div');
    stacksContainer2.id = 'mnk-stacks2';
    stacksContainer2.classList.add('stacks');
    this.bars.addJobBarContainer().appendChild(stacksContainer2);

    const opoopoStacksContainer = document.createElement('div');
    opoopoStacksContainer.id = 'mnk-stacks-opoopo';
    stacksContainer2.appendChild(opoopoStacksContainer);

    const raptorStacksContainer = document.createElement('div');
    raptorStacksContainer.id = 'mnk-stacks-raptor';
    stacksContainer2.appendChild(raptorStacksContainer);

    const coeurlStacksContainer = document.createElement('div');
    coeurlStacksContainer.id = 'mnk-stacks-coeurl';
    stacksContainer2.appendChild(coeurlStacksContainer);

    this.opoopoStacks = [];
    this.raptorStacks = [];
    this.coeurlStacks = [];

    for (let i = 0; i < 1; i++) {
      const opoopoStack = document.createElement('div');
      opoopoStacksContainer.appendChild(opoopoStack);
      this.opoopoStacks.push(opoopoStack);
    }

    for (let i = 0; i < 1; i++) {
      const raptorStack = document.createElement('div');
      raptorStacksContainer.appendChild(raptorStack);
      this.raptorStacks.push(raptorStack);
    }

    for (let i = 0; i < 2; i++) {
      const coeurlStack = document.createElement('div');
      coeurlStacksContainer.appendChild(coeurlStack);
      this.coeurlStacks.push(coeurlStack);
    }

    // Masterful Gauge
    const stacksContainer = document.createElement('div');
    stacksContainer.id = 'mnk-stacks';
    stacksContainer.classList.add('stacks');
    this.bars.addJobBarContainer().appendChild(stacksContainer);

    const lunarStacksContainer = document.createElement('div');
    lunarStacksContainer.id = 'mnk-stacks-lunar';
    stacksContainer.appendChild(lunarStacksContainer);

    const beastChakraStacksContainer = document.createElement('div');
    beastChakraStacksContainer.id = 'mnk-stacks-beastchakra';
    stacksContainer.appendChild(beastChakraStacksContainer);

    const solarStacksContainer = document.createElement('div');
    solarStacksContainer.id = 'mnk-stacks-solar';
    stacksContainer.appendChild(solarStacksContainer);

    this.lunarStacks = [];
    this.beastChakraStacks = [];
    this.solarStacks = [];

    const lunarStack = document.createElement('div');
    lunarStacksContainer.appendChild(lunarStack);
    this.lunarStacks.push(lunarStack);

    for (let i = 0; i < 3; i++) {
      const beastChakraStack = document.createElement('div');
      beastChakraStacksContainer.appendChild(beastChakraStack);
      this.beastChakraStacks.push(beastChakraStack);
    }

    const solarStack = document.createElement('div');
    solarStacksContainer.appendChild(solarStack);
    this.solarStacks.push(solarStack);

    this.reset();
  }

  override onJobDetailUpdate(jobDetail: JobDetail['MNK']): void {
    const chakra = jobDetail.chakraStacks.toString();
    if (this.chakraBox.innerText !== chakra) {
      this.chakraBox.innerText = chakra;
      this.chakraBox.parentNode.classList.toggle('dim', jobDetail.chakraStacks < 5);
    }

    this.beastChakraStacks.forEach((elem, i) => {
      elem.classList.remove('opo', 'coeurl', 'raptor');
      const beastChakra = jobDetail.beastChakra[i];
      if (beastChakra)
        elem.classList.add(beastChakra.toLowerCase());
    });
    this.lunarStacks[0]?.classList.toggle('active', jobDetail.lunarNadi);
    this.solarStacks[0]?.classList.toggle('active', jobDetail.solarNadi);

    for (let i = 0; i < 2; ++i) {
      this.opoopoStacks[i]?.classList.toggle('active', jobDetail.opoopoFury > i);
      this.raptorStacks[i]?.classList.toggle('active', jobDetail.raptorFury > i);
      this.coeurlStacks[i]?.classList.toggle('active', jobDetail.coeurlFury > i);
    }
  }

  override onUseAbility(id: string): void {
    switch (id) {
      case kAbility.PerfectBalance:
        this.perfectbalanceBox.duration = 40 + this.perfectbalanceBox.value;
        break;
      case kAbility.RiddleOfFire:
        this.riddleOfFireBox.duration = 60;
        break;
      case kAbility.RiddleOfWind:
        this.riddleOfWindBox.duration = 90;
        break;
      case kAbility.Brotherhood:
        this.brotherhoodBox.duration = 120;
        break;
    }
  }

  override onYouGainEffect(id: string, matches: PartialFieldMatches<'GainsEffect'>): void {
    switch (id) {
      case EffectId.PerfectBalance:
        if (!this.perfectBalanceActive) {
          this.formTimer.duration = 0;
          this.formTimer.duration = parseFloat(matches.duration ?? '0');
          this.formTimer.fg = computeBackgroundColorFrom(this.formTimer, 'mnk-color-pb');
          this.perfectBalanceActive = true;
        }
        break;
      case EffectId.OpoOpoForm:
      case EffectId.RaptorForm:
      case EffectId.CoeurlForm:
      case EffectId.FormlessFist:
        this.formTimer.duration = 0;
        this.formTimer.duration = parseFloat(matches.duration ?? '0');
        this.formTimer.fg = computeBackgroundColorFrom(this.formTimer, 'mnk-color-form');
        break;
    }
  }

  override onYouLoseEffect(id: string): void {
    switch (id) {
      case EffectId.PerfectBalance:
        this.formTimer.duration = 0;
        this.formTimer.fg = computeBackgroundColorFrom(this.formTimer, 'mnk-color-form');
        this.perfectBalanceActive = false;
        break;
    }
  }

  override onStatChange({ gcdSkill }: { gcdSkill: number }): void {
    this.perfectbalanceBox.valuescale = gcdSkill;
    this.perfectbalanceBox.threshold = gcdSkill + 1;
    this.riddleOfFireBox.valuescale = gcdSkill;
    this.riddleOfFireBox.threshold = gcdSkill + 1;
    this.riddleOfWindBox.valuescale = gcdSkill;
    this.riddleOfWindBox.threshold = gcdSkill + 1;
    this.brotherhoodBox.valuescale = gcdSkill;
    this.brotherhoodBox.threshold = gcdSkill + 1;
  }

  override reset(): void {
    this.perfectbalanceBox.duration = 0;
    this.riddleOfFireBox.duration = 0;
    this.riddleOfWindBox.duration = 0;
    this.brotherhoodBox.duration = 0;
    this.formTimer.duration = 0;
    this.formTimer.fg = computeBackgroundColorFrom(this.formTimer, 'mnk-color-form');
    this.perfectBalanceActive = false;
  }
}

export class MNK6xComponent extends BaseComponent {
  formTimer: TimerBar;
  chakraBox: ResourceBox;
  dragonKickBox: TimerBox;
  twinSnakesBox: TimerBox;
  demolishBox: TimerBox;
  perfectBalanceActive = false;
  lunarStacks: HTMLDivElement[];
  beastChakraStacks: HTMLDivElement[] = [];
  solarStacks: HTMLDivElement[];

  constructor(o: ComponentInterface) {
    super(o);

    this.formTimer = this.bars.addTimerBar({
      id: 'mnk-timers-combo',
      fgColor: 'mnk-color-form',
    });

    this.chakraBox = this.bars.addResourceBox({
      classList: ['mnk-color-chakra'],
    });

    this.dragonKickBox = this.bars.addProcBox({
      id: 'mnk-procs-dragonkick',
      fgColor: 'mnk-color-dragonkick',
      threshold: 6,
    });

    this.twinSnakesBox = this.bars.addProcBox({
      id: 'mnk-procs-twinsnakes',
      fgColor: 'mnk-color-twinsnakes',
      threshold: 6,
    });

    this.demolishBox = this.bars.addProcBox({
      id: 'mnk-procs-demolish',
      fgColor: 'mnk-color-demolish',
      // Slightly shorter time, to make the box not pop right as
      // you hit snap punch at t=6 (which is probably fine).
      threshold: 5,
    });

    const stacksContainer = document.createElement('div');
    stacksContainer.id = 'mnk-stacks';
    stacksContainer.classList.add('stacks');
    this.bars.addJobBarContainer().appendChild(stacksContainer);

    const lunarStacksContainer = document.createElement('div');
    lunarStacksContainer.id = 'mnk-stacks-lunar';
    stacksContainer.appendChild(lunarStacksContainer);

    const beastChakraStacksContainer = document.createElement('div');
    beastChakraStacksContainer.id = 'mnk-stacks-beastchakra';
    stacksContainer.appendChild(beastChakraStacksContainer);

    const solarStacksContainer = document.createElement('div');
    solarStacksContainer.id = 'mnk-stacks-solar';
    stacksContainer.appendChild(solarStacksContainer);

    this.lunarStacks = [];
    this.beastChakraStacks = [];
    this.solarStacks = [];

    const lunarStack = document.createElement('div');
    lunarStacksContainer.appendChild(lunarStack);
    this.lunarStacks.push(lunarStack);

    for (let i = 0; i < 3; i++) {
      const beastChakraStack = document.createElement('div');
      beastChakraStacksContainer.appendChild(beastChakraStack);
      this.beastChakraStacks.push(beastChakraStack);
    }

    const solarStack = document.createElement('div');
    solarStacksContainer.appendChild(solarStack);
    this.solarStacks.push(solarStack);

    this.reset();
  }

  override onJobDetailUpdate(jobDetail: JobDetail['MNK']): void {
    const chakra = jobDetail.chakraStacks.toString();
    if (this.chakraBox.innerText !== chakra) {
      this.chakraBox.innerText = chakra;
      this.chakraBox.parentNode.classList.toggle('dim', jobDetail.chakraStacks < 5);
    }

    this.beastChakraStacks.forEach((elem, i) => {
      elem.classList.remove('opo', 'coeurl', 'raptor');
      const beastChakra = jobDetail.beastChakra[i];
      if (beastChakra)
        elem.classList.add(beastChakra.toLowerCase());
    });
    this.lunarStacks[0]?.classList.toggle('active', jobDetail.lunarNadi);
    this.solarStacks[0]?.classList.toggle('active', jobDetail.solarNadi);
  }

  override onUseAbility(id: string): void {
    if (id === kAbility.Demolish) {
      // it start counting down when you cast demolish
      // but DOT appears on target about 1 second later
      this.demolishBox.duration = 18 + 1;
    }
  }

  override onYouLoseEffect(id: string): void {
    switch (id) {
      case EffectId.DisciplinedFist:
        this.twinSnakesBox.duration = 0;
        break;
      case EffectId.LeadenFist:
        this.dragonKickBox.duration = 0;
        break;
      case EffectId.PerfectBalance:
        this.formTimer.duration = 0;
        this.formTimer.fg = computeBackgroundColorFrom(this.formTimer, 'mnk-color-form');
        this.perfectBalanceActive = false;
        break;
    }
  }

  override onYouGainEffect(id: string, matches: PartialFieldMatches<'GainsEffect'>): void {
    switch (id) {
      case EffectId.DisciplinedFist:
        // -0.5 for logline delay
        this.twinSnakesBox.duration = parseFloat(matches.duration ?? '0') - 0.5;
        break;
      case EffectId.LeadenFist:
        this.dragonKickBox.duration = 30;
        break;
      case EffectId.PerfectBalance:
        if (!this.perfectBalanceActive) {
          this.formTimer.duration = 0;
          this.formTimer.duration = parseFloat(matches.duration ?? '0');
          this.formTimer.fg = computeBackgroundColorFrom(this.formTimer, 'mnk-color-pb');
          this.perfectBalanceActive = true;
        }
        break;
      case EffectId.OpoOpoForm:
      case EffectId.RaptorForm:
      case EffectId.CoeurlForm:
      case EffectId.FormlessFist:
        this.formTimer.duration = 0;
        this.formTimer.duration = parseFloat(matches.duration ?? '0');
        this.formTimer.fg = computeBackgroundColorFrom(this.formTimer, 'mnk-color-form');
        break;
    }
  }

  override reset(): void {
    this.twinSnakesBox.duration = 0;
    this.demolishBox.duration = 0;
    this.dragonKickBox.duration = 0;
    this.formTimer.duration = 0;
    this.formTimer.fg = computeBackgroundColorFrom(this.formTimer, 'mnk-color-form');
    this.perfectBalanceActive = false;
  }
}
