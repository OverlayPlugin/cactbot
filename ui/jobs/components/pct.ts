import { JobDetail } from '../../../types/event';
import { ResourceBox } from '../bars';

import { BaseComponent, ComponentInterface } from './base';

export class PCTComponent extends BaseComponent {
  whitePaint: ResourceBox;
  paletteGauge: ResourceBox;
  livingCanvasStacks: HTMLDivElement;

  constructor(o: ComponentInterface) {
    super(o);

    this.whitePaint = this.bars.addResourceBox({
      classList: ['pct-color-whitepaint'],
    });
    this.paletteGauge = this.bars.addResourceBox({
      classList: ['pct-color-palettegauge'],
    });
    this.livingCanvasStacks = document.createElement('div');
    this.livingCanvasStacks.id = 'pct-stacks-living';
    this.livingCanvasStacks.classList.add('stacks');
    for (let i = 0; i < 4; i++) {
      const stack = document.createElement('div');
      this.livingCanvasStacks.appendChild(stack);
    }
    this.bars.addJobBarContainer().appendChild(this.livingCanvasStacks);

    this.reset();
  }

  override onJobDetailUpdate(jobDetail: JobDetail['PCT']): void {
    this.whitePaint.innerText = jobDetail.paint.toString();
    if (this.whitePaint.innerText === '5') {
      this.whitePaint.parentElement?.classList.add('pulse');
    } else {
      this.whitePaint.parentElement?.classList.remove('pulse');
    }
    this.paletteGauge.innerText = jobDetail.paletteGauge.toString();

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
  }

  override reset(): void {
    super.reset();
    this.paletteGauge.innerText = '';
    this.whitePaint.innerText = '';
    this.livingCanvasStacks.childNodes?.forEach((stack) => {
      if (stack instanceof HTMLElement)
        stack.classList.remove('active', 'pulse');
    });
  }
}

const livingCanvasObjects = ['Pom', 'Wing', 'Claw', 'Maw'] as const;
