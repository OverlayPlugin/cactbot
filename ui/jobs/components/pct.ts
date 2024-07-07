import { JobDetail } from '../../../types/event';
import { ResourceBox } from '../bars';

import { BaseComponent, ComponentInterface } from './base';

export class PCTComponent extends BaseComponent {
  whitePaint: ResourceBox;
  paletteGauge: ResourceBox;
  constructor(o: ComponentInterface) {
    super(o);

    this.whitePaint = this.bars.addResourceBox({
      classList: ['pct-color-whitepaint'],
    });
    this.paletteGauge = this.bars.addResourceBox({
      classList: ['pct-color-palettegauge'],
    });

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
  }

  override reset(): void {
    super.reset();
    this.paletteGauge.innerText = '';
    this.whitePaint.innerText = '';
  }
}
