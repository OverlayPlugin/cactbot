import EffectId from '../../../resources/effect_id';

import { BaseComponent, ComponentInterface } from './base';

export class VPRComponent extends BaseComponent {
  constructor(o: ComponentInterface) {
    super(o);
  }

  override onYouGainEffect(id: string): void {
    if (id === EffectId.Swiftscaled)
      this.player.speedBuffs.swiftscaled = true;
  }
  override onYouLoseEffect(id: string): void {
    if (id === EffectId.Swiftscaled)
      this.player.speedBuffs.swiftscaled = false;
  }
}
