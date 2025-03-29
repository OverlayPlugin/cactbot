import TimerBox from '../../../resources/timerbox';
import { JobDetail } from '../../../types/event';
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
        this.drawBox.duration = 55;
        break;
      case kAbility.LucidDreaming:
        this.lucidBox.duration = 60;
        break;
    }
  }
  override onStatChange({ gcdSpell }: { gcdSpell: number }): void {
    this.combustBox.threshold = gcdSpell + 1;
    this.lucidBox.threshold = gcdSpell + 1;
  }

  override reset(): void {
    this.combustBox.duration = 0;
    this.drawBox.duration = 0;
    this.lucidBox.duration = 0;
  }
}
