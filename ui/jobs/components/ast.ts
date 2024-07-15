import TimerBox from '../../../resources/timerbox';
import { JobDetail } from '../../../types/event';
import { ResourceBox } from '../bars';
import { kAbility } from '../constants';
import { computeBackgroundColorFrom } from '../utils';

import { BaseComponent, ComponentInterface } from './base';

export class ASTComponent extends BaseComponent {
  combustBox: TimerBox;
  drawBox: TimerBox;
  lucidBox: TimerBox;
  card1: HTMLDivElement;
  card2: HTMLDivElement;
  card3: HTMLDivElement;
  card4: HTMLDivElement;

  constructor(o: ComponentInterface) {
    super(o);

    this.combustBox = this.bars.addProcBox({
      id: 'ast-procs-combust',
      fgColor: 'ast-color-combust',
      notifyWhenExpired: true,
    });

    this.drawBox = this.bars.addProcBox({
      id: 'ast-procs-draw',
      fgColor: 'ast-color-draw',
    });

    this.lucidBox = this.bars.addProcBox({
      id: 'ast-procs-luciddreaming',
      fgColor: 'ast-color-lucid',
    });

    // Cards
    const stacksContainer = document.createElement('div');
    stacksContainer.id = 'ast-stacks';
    stacksContainer.classList.add('stacks');
    const cardContainer = document.createElement('div');
    cardContainer.id = 'ast-stacks-card';
    stacksContainer.appendChild(cardContainer);
    this.bars.addJobBarContainer().appendChild(stacksContainer);

    this.card1 = document.createElement('div');
    this.card2 = document.createElement('div');
    this.card3 = document.createElement('div');
    this.card4 = document.createElement('div');

    this.card1.id = 'ast-stacks-card1';
    this.card2.id = 'ast-stacks-card2';
    this.card3.id = 'ast-stacks-card3';
    this.card4.id = 'ast-stacks-card4';
    [this.card1, this.card2, this.card3, this.card4].forEach((e) => cardContainer.appendChild(e));

    this.reset();
    this.onStatChange({ gcdSpell: this.player.gcdSpell });
  }

  override onJobDetailUpdate(jobDetail: JobDetail['AST']): void {
    const card1 = jobDetail.card1;
    const card2 = jobDetail.card2;
    const card3 = jobDetail.card3;
    const card4 = jobDetail.card4;
    const nextdraw = jobDetail.nextdraw;

    const countheldcardnumber = (...strings: (string | null)[]): number => {
      return strings.filter((str) => str !== 'None').length;
    };
    const heldcardnumber = countheldcardnumber(card1, card2, card3, card4);
    this.drawBox.threshold = (heldcardnumber + 1) * 3;

    this.card1.classList.remove('balance', 'spear');
    this.card2.classList.remove('arrow', 'bole');
    this.card3.classList.remove('spire', 'ewer');
    this.card4.classList.remove('lord', 'lady');
    this.card1.classList.add(`${card1.toLocaleLowerCase()}`);
    this.card2.classList.add(`${card2.toLocaleLowerCase()}`);
    this.card3.classList.add(`${card3.toLocaleLowerCase()}`);
    this.card4.classList.add(`${card4.toLocaleLowerCase()}`);
    this.drawBox.fg = computeBackgroundColorFrom(
      this.drawBox,
      `ast-color-draw.${nextdraw.toLocaleLowerCase()}`,
    );
  }

  override onUseAbility(id: string): void {
    switch (id) {
      case kAbility.Combust:
      case kAbility.Combust2:
      case kAbility.Combust3:
        this.combustBox.duration = 30;
        break;
      case kAbility.AstralDraw:
      case kAbility.UmbralDraw:
        this.drawBox.duration = 60;
        break;
      case kAbility.LucidDreaming:
        this.lucidBox.duration = 60;
        break;
    }
  }
  override onStatChange({ gcdSpell }: { gcdSpell: number }): void {
    this.combustBox.valuescale = gcdSpell;
    this.combustBox.threshold = gcdSpell + 1;
    this.drawBox.valuescale = gcdSpell;
    this.lucidBox.valuescale = gcdSpell;
    this.lucidBox.threshold = gcdSpell + 1;
  }

  override reset(): void {
    this.combustBox.duration = 0;
    this.drawBox.duration = 0;
    this.lucidBox.duration = 0;
  }
}

export class AST6xComponent extends BaseComponent {
  combustBox: TimerBox;
  drawBox: TimerBox;
  minorDrawBox: TimerBox;
  lucidBox: TimerBox;
  cardBox: ResourceBox;
  minorBox: ResourceBox;
  signs: HTMLElement[] = [];

  constructor(o: ComponentInterface) {
    super(o);

    this.combustBox = this.bars.addProcBox({
      id: 'ast-procs-combust',
      fgColor: 'ast-color-combust',
      notifyWhenExpired: true,
    });

    this.drawBox = this.bars.addProcBox({
      id: 'ast-procs-draw',
      fgColor: 'ast-color-draw',
    });

    this.minorDrawBox = this.bars.addProcBox({
      id: 'ast-procs-minordraw',
      fgColor: 'ast-color-minordraw',
    });

    this.lucidBox = this.bars.addProcBox({
      id: 'ast-procs-luciddreaming',
      fgColor: 'ast-color-lucid',
    });

    this.cardBox = this.bars.addResourceBox({
      classList: ['ast-color-card'],
    });

    this.minorBox = this.bars.addResourceBox({
      classList: ['ast-color-card'],
    });

    // Sign
    const stacksContainer = document.createElement('div');
    stacksContainer.id = 'ast-stacks';
    stacksContainer.classList.add('stacks');
    this.bars.addJobBarContainer().appendChild(stacksContainer);
    const signContainer = document.createElement('div');
    signContainer.id = 'ast-stacks-sign';
    stacksContainer.appendChild(signContainer);

    for (let i = 0; i < 3; ++i) {
      const d = document.createElement('div');
      signContainer.appendChild(d);
      this.signs.push(d);
    }

    this.reset();
    this.onStatChange({ gcdSpell: this.player.gcdSpell });
  }

  override onJobDetailUpdate(jobDetail: JobDetail['AST']): void {
    const cardsMap = {
      'Balance': { 'bonus': 'melee', 'seal': 'Solar' },
      'Bole': { 'bonus': 'range', 'seal': 'Solar' },
      'Arrow': { 'bonus': 'melee', 'seal': 'Lunar' },
      'Ewer': { 'bonus': 'range', 'seal': 'Lunar' },
      'Spear': { 'bonus': 'melee', 'seal': 'Celestial' },
      'Spire': { 'bonus': 'range', 'seal': 'Celestial' },
    } as const;

    const minorMap = {
      'Lord': '↑',
      'Lady': '＋',
    } as const;

    // Minor Arcana, ↑ = lord, + = lady
    const minor = jobDetail.crownCard;
    this.minorBox.parentNode.classList.toggle('lord', minor === 'Lord');
    this.minorBox.parentNode.classList.toggle('lady', minor === 'Lady');
    this.minorBox.innerText = minor === 'None' ? '' : minorMap[minor];

    const card = jobDetail.heldCard;
    const sign = jobDetail.arcanums;
    // Show on which kind of jobs your card plays better by color
    // Blue on melee, purple on ranged, and grey when no card
    const cardParent = this.cardBox.parentNode;
    cardParent.classList.remove('melee', 'range');
    this.cardBox.innerText = '';
    if (card !== 'None') {
      cardParent.classList.add(cardsMap[card].bonus);

      // Show whether you already have this seal
      // ○ means it's OK to play this card
      // × means you'd better redraw if possible
      if (sign.includes(cardsMap[card].seal))
        this.cardBox.innerText = '×';
      else
        this.cardBox.innerText = '○';
    }

    this.signs.forEach((elem, i) => {
      elem.classList.remove('solar', 'lunar', 'celestial');
      const asign = sign[i];
      if (asign)
        elem.classList.add(asign.toLowerCase());
    });
  }

  override onUseAbility(id: string): void {
    switch (id) {
      case kAbility.Combust2:
      case kAbility.Combust3:
        this.combustBox.duration = 30;
        break;
      case kAbility.Combust:
        this.combustBox.duration = 30;
        break;
      case kAbility.Draw:
        this.drawBox.duration = 30 + this.drawBox.value;
        break;
      case kAbility.MinorArcana:
        this.minorDrawBox.duration = 60;
        break;
      case kAbility.LucidDreaming:
        this.lucidBox.duration = 60;
        break;
    }
  }
  override onStatChange({ gcdSpell }: { gcdSpell: number }): void {
    this.combustBox.valuescale = gcdSpell;
    this.combustBox.threshold = gcdSpell + 1;
    this.drawBox.valuescale = gcdSpell;
    this.drawBox.threshold = gcdSpell + 1;
    this.minorDrawBox.valuescale = gcdSpell;
    this.minorDrawBox.threshold = gcdSpell + 1;
    this.lucidBox.valuescale = gcdSpell;
    this.lucidBox.threshold = gcdSpell + 1;
  }

  override reset(): void {
    this.combustBox.duration = 0;
    this.drawBox.duration = 0;
    this.minorDrawBox.duration = 0;
    this.lucidBox.duration = 0;
  }
}
