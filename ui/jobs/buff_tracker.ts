import EffectId from '../../resources/effect_id';
import arcaneCircleImage from '../../resources/ffxiv/status/arcane-circle.png';
import astralImage from '../../resources/ffxiv/status/astral.png';
import balanceImage from '../../resources/ffxiv/status/balance.png';
import battleLitanyImage from '../../resources/ffxiv/status/battle-litany.png';
import battleVoiceImage from '../../resources/ffxiv/status/battlevoice.png';
import brotherhoodImage from '../../resources/ffxiv/status/brotherhood.png';
import chainStratagemImage from '../../resources/ffxiv/status/chain-stratagem.png';
import devilmentImage from '../../resources/ffxiv/status/devilment.png';
import divinationImage from '../../resources/ffxiv/status/divination.png';
import dokumoriImage from '../../resources/ffxiv/status/dokumori.png';
import emboldenImage from '../../resources/ffxiv/status/embolden.png';
import mugImage from '../../resources/ffxiv/status/mug.png';
import offguardImage from '../../resources/ffxiv/status/offguard.png';
import peculiarLightImage from '../../resources/ffxiv/status/peculiar-light.png';
import physicalImage from '../../resources/ffxiv/status/physical.png';
import potionImage from '../../resources/ffxiv/status/potion.png';
import finaleImage from '../../resources/ffxiv/status/radiant-finale.png';
import searingLightImage from '../../resources/ffxiv/status/searing-light.png';
import spearImage from '../../resources/ffxiv/status/spear.png';
import standardFinishImage from '../../resources/ffxiv/status/standard-finish.png';
import starryMuseImage from '../../resources/ffxiv/status/starry-muse.png';
import technicalFinishImage from '../../resources/ffxiv/status/technical-finish.png';
import umbralImage from '../../resources/ffxiv/status/umbral.png';
import PartyTracker from '../../resources/party';
import WidgetList from '../../resources/widget_list';
import { NetMatches } from '../../types/net_matches';

import { kAbility } from './constants';
import { FfxivVersion } from './jobs';
import { JobsOptions } from './jobs_options';
import { makeAuraTimerIcon } from './utils';

export interface BuffInfo {
  name: string;
  cooldownAbility?: string[];
  gainEffect?: string[];
  loseEffect?: string[];
  mobGainsEffect?: string;
  mobLosesEffect?: string;
  durationSeconds?: number;
  useEffectDuration?: boolean;
  icon: string;
  side?: 'left' | 'right';
  borderColor: string;
  sortKey: number;
  cooldown?: number;
  sharesCooldownWith?: string[];
  hide?: boolean;
  stack?: number;
  partyOnly?: boolean;
}

export interface Aura {
  addCallback: () => void;
  removeCallback: () => void;
  addTimeout: number | null;
  /** id in `window.clearTimeout(id)` */
  removeTimeout: number | null;
}

// TODO: consider using real times and not setTimeout times as these can drift.
export class Buff {
  name: string;
  info: BuffInfo;
  options: JobsOptions;
  activeList: WidgetList;
  cooldownList: WidgetList;
  readyList: WidgetList;
  active: Aura | null;
  cooldown: { [s: string]: Aura };
  ready: { [s: string]: Aura };
  readySortKeyBase: number;
  cooldownSortKeyBase: number;

  constructor(name: string, info: BuffInfo, list: WidgetList, options: JobsOptions) {
    this.name = name;
    this.info = info;
    this.options = options;

    // TODO: these should be different ui elements.
    // TODO: or maybe add some buffer between sections?
    this.activeList = list;
    this.cooldownList = list;
    this.readyList = list;

    // tracked auras
    this.active = null;
    this.cooldown = {};
    this.ready = {};

    // Hacky numbers to sort active > ready > cooldowns by adjusting sort keys.
    this.readySortKeyBase = 1000;
    this.cooldownSortKeyBase = 2000;
  }

  addCooldown(source: string, effectSeconds: number): void {
    if (!this.info.cooldown)
      return;
    // Remove any preexisting cooldowns with the same name in case they unexpectedly exist.
    this.cooldown[source]?.removeCallback();

    const cooldownKey = `c:${this.name}:${source}`;

    let secondsUntilShow = this.info.cooldown - this.options.BigBuffShowCooldownSeconds;
    secondsUntilShow = Math.min(Math.max(effectSeconds, secondsUntilShow, 1), this.info.cooldown);
    const showSeconds = this.info.cooldown - secondsUntilShow;
    const addReadyCallback = () => {
      this.addReady(source);
    };

    this.cooldown[source] = this.makeAura(
      cooldownKey,
      this.cooldownList,
      showSeconds,
      secondsUntilShow,
      this.cooldownSortKeyBase,
      'grey',
      '',
      0.5,
      addReadyCallback,
    );
  }

  addReady(source: string): void {
    // Remove any preexisting cooldowns with the same name in case they unexpectedly exist.
    this.ready[source]?.removeCallback();

    // TODO: could consider looking at the party list to make initials unique?
    const initials = source.split(' ');
    let txt = '';
    if (initials.length === 2)
      txt = initials.map((str) => str.charAt(0)).join('');
    else
      txt = initials[0] ?? '';

    const color = this.info.borderColor;

    const readyKey = `r:${this.name}:${source}`;
    this.ready[source] = this.makeAura(
      readyKey,
      this.readyList,
      -1,
      0,
      this.readySortKeyBase,
      color,
      txt,
      0.6,
    );

    // if a readied raidbuff not be used in 3min, we can assume that
    // this player has left the battlefield, or at least his raidbuff is unexpectable.
    window.setTimeout(() => {
      this.ready[source]?.removeCallback();
    }, 3 * 60 * 1000);
  }

  makeAura(
    key: string,
    list: WidgetList,
    seconds: number,
    secondsUntilShow: number,
    adjustSort: number,
    textColor: string,
    txt: string,
    opacity: number,
    expireCallback?: () => void,
  ): Aura {
    const aura: Aura = {
      removeCallback: () => {
        list.removeElement(key);
        if (aura.addTimeout) {
          window.clearTimeout(aura.addTimeout);
          aura.addTimeout = null;
        }
        if (aura.removeTimeout) {
          window.clearTimeout(aura.removeTimeout);
          aura.removeTimeout = null;
        }
      },

      addCallback: () => {
        const elem = makeAuraTimerIcon(
          key,
          seconds,
          opacity,
          this.options.BigBuffIconWidth,
          this.options.BigBuffIconHeight,
          txt,
          this.options.BigBuffBarHeight,
          this.options.BigBuffTextHeight,
          textColor,
          this.options.BigBuffBorderSize,
          this.info.borderColor,
          this.info.borderColor,
          this.info.icon,
        );
        list.addElement(key, elem, this.info.sortKey + adjustSort);
        aura.addTimeout = null;

        if (seconds > 0) {
          aura.removeTimeout = window.setTimeout(() => {
            aura.removeCallback();
            expireCallback?.();
          }, seconds * 1000);
        }
      },

      removeTimeout: null,

      addTimeout: null,
    };

    if (secondsUntilShow > 0)
      aura.addTimeout = window.setTimeout(aura.addCallback, secondsUntilShow * 1000);
    else
      aura.addCallback();

    return aura;
  }

  clear(): void {
    this.onLose();

    Object.values(this.cooldown).forEach((aura) => {
      aura.removeCallback();
    });

    Object.values(this.ready).forEach((aura) => {
      aura.removeCallback();
    });
  }

  clearCooldown(source: string): void {
    const ready = this.ready[source];
    if (ready)
      ready.removeCallback();
    const cooldown = this.cooldown[source];
    if (cooldown)
      cooldown.removeCallback();
  }

  onGain(seconds: number): void {
    this.onLose();
    this.active = this.makeAura(this.name, this.activeList, seconds, 0, 0, 'white', '', 1);
  }

  onLose(): void {
    if (!this.active)
      return;
    this.active.removeCallback();
    this.active = null;
  }

  onCooldown(seconds: number, source: string): void {
    this.clearCooldown(source);
    this.addCooldown(source, seconds);
  }
}

export class BuffTracker {
  buffInfo: { [s: string]: Omit<BuffInfo, 'name'> };
  buffs: { [s: string]: Buff };
  gainEffectMap: { [s: string]: BuffInfo[] };
  loseEffectMap: { [s: string]: BuffInfo[] };
  cooldownAbilityMap: { [s: string]: BuffInfo[] };
  mobGainsEffectMap: { [s: string]: BuffInfo[] };
  mobLosesEffectMap: { [s: string]: BuffInfo[] };

  constructor(
    private options: JobsOptions,
    private playerName: string,
    private leftBuffDiv: WidgetList,
    private rightBuffDiv: WidgetList,
    private partyTracker: PartyTracker,
    private ffxivVersion: FfxivVersion,
  ) {
    this.options = options;
    this.playerName = playerName;
    this.leftBuffDiv = leftBuffDiv;
    this.rightBuffDiv = rightBuffDiv;
    this.buffs = {};

    this.partyTracker = partyTracker;

    this.buffInfo = {
      potion: {
        // increase main stat, equals to 8%~9% damage bonus (based on ilv)
        gainEffect: [EffectId.Medicated],
        loseEffect: [EffectId.Medicated],
        useEffectDuration: true,
        icon: potionImage,
        borderColor: '#AA41B2',
        sortKey: 2,
        cooldown: 270,
      },
      astralAttenuation: {
        // 5% damage bonus (BLU: fire, wind, and lightning)
        mobGainsEffect: EffectId.AstralAttenuation,
        mobLosesEffect: EffectId.AstralAttenuation,
        useEffectDuration: true,
        icon: astralImage,
        borderColor: '#9bdec0',
        sortKey: 9,
      },
      umbralAttenuation: {
        // 5% damage bonus (BLU: water, earth, and ice)
        mobGainsEffect: EffectId.UmbralAttenuation,
        mobLosesEffect: EffectId.UmbralAttenuation,
        useEffectDuration: true,
        icon: umbralImage,
        borderColor: '#4d8bc9',
        sortKey: 9,
      },
      physicalAttenuation: {
        // 5% damage bonus (BLU: Physical)
        mobGainsEffect: EffectId.PhysicalAttenuation,
        mobLosesEffect: EffectId.PhysicalAttenuation,
        useEffectDuration: true,
        icon: physicalImage,
        borderColor: '#fff712',
        sortKey: 9,
      },
      offguard: {
        // 5% damage bonus (BLU)
        cooldownAbility: [kAbility.OffGuard],
        mobGainsEffect: EffectId.OffGuard,
        mobLosesEffect: EffectId.OffGuard,
        useEffectDuration: true,
        icon: offguardImage,
        borderColor: '#47bf41',
        sortKey: 9,
        cooldown: 60,
        sharesCooldownWith: ['peculiar'],
      },
      peculiar: {
        // 5% damage bonus (BLU: Magic)
        cooldownAbility: [kAbility.PeculiarLight],
        mobGainsEffect: EffectId.PeculiarLight,
        mobLosesEffect: EffectId.PeculiarLight,
        useEffectDuration: true,
        icon: peculiarLightImage,
        borderColor: '#F28F7B',
        sortKey: 9,
        cooldown: 60,
        sharesCooldownWith: ['offguard'],
      },
      mug: {
        // 5% damage bonus
        cooldownAbility: [kAbility.Mug],
        mobGainsEffect: EffectId.VulnerabilityUp_27E,
        mobLosesEffect: EffectId.VulnerabilityUp_27E,
        useEffectDuration: true,
        icon: mugImage,
        // Magenta.
        borderColor: '#FC4AE6',
        sortKey: 5,
        cooldown: 120,
      },
      Dokumori: {
        // 5% damage bonus
        cooldownAbility: [kAbility.Dokumori],
        mobGainsEffect: EffectId.Dokumori_F09,
        mobLosesEffect: EffectId.Dokumori_F09,
        durationSeconds: 20 + 0.5, // This debuff has an animation lock
        icon: dokumoriImage,
        // Magenta.
        borderColor: '#FC4AE6',
        sortKey: 5,
        cooldown: 120,
      },
      litany: {
        // 10% Crit, equals to 5%~6% damage bonus (about 3k crit)
        cooldownAbility: [kAbility.BattleLitany],
        gainEffect: [EffectId.BattleLitany_312],
        loseEffect: [EffectId.BattleLitany_312],
        useEffectDuration: true,
        partyOnly: true,
        icon: battleLitanyImage,
        // Cyan.
        borderColor: '#099',
        sortKey: 4,
        cooldown: 120,
      },
      embolden: {
        // 5% damage bonus
        cooldownAbility: [kAbility.Embolden],
        // 511 for party, 4D7 for self
        gainEffect: [EffectId.Embolden_511, EffectId.Embolden_4D7],
        loseEffect: [EffectId.Embolden_511, EffectId.Embolden_4D7],
        useEffectDuration: true,
        partyOnly: true,
        icon: emboldenImage,
        // Lime.
        borderColor: '#57FC4A',
        sortKey: 5,
        cooldown: 120,
      },
      balance: {
        // 6% damage bonus for melee
        gainEffect: [EffectId.TheBalance_F2F],
        loseEffect: [EffectId.TheBalance_F2F],
        useEffectDuration: true,
        icon: balanceImage,
        // Orange.
        borderColor: '#ff9900',
        sortKey: 3,
      },
      spear: {
        // 6% damage bonus for ranged
        gainEffect: [EffectId.TheSpear_F31],
        loseEffect: [EffectId.TheSpear_F31],
        useEffectDuration: true,
        icon: spearImage,
        // Dark Blue.
        borderColor: '#4477dd',
        sortKey: 3,
      },
      devilment: {
        // 20% crit + 20% DH, equals to 15%+ damage bonus
        gainEffect: [EffectId.Devilment],
        loseEffect: [EffectId.Devilment],
        useEffectDuration: true,
        icon: devilmentImage,
        // Dark Green.
        borderColor: '#006400',
        sortKey: 1,
        cooldown: 120,
      },
      standardFinish: {
        // 5% damage bonus
        // 839 for other, 71D for self
        gainEffect: [EffectId.StandardFinish_839, EffectId.StandardFinish_71D],
        loseEffect: [EffectId.StandardFinish_839, EffectId.StandardFinish_71D],
        useEffectDuration: true,
        icon: standardFinishImage,
        // Green.
        borderColor: '#32CD32',
        sortKey: 8,
      },
      technicalFinish: {
        // 5% damage bonus
        // This tracker may not be accurate.
        // Technical Step cooldown when start dancing,
        // but raidbuff take effects on finish.
        cooldownAbility: [
          kAbility.QuadrupleTechnicalFinish,
          kAbility.TripleTechnicalFinish,
          kAbility.DoubleTechnicalFinish,
          kAbility.SingleTechnicalFinish,
          kAbility.TechnicalFinish,
        ],
        gainEffect: [EffectId.TechnicalFinish_71E],
        loseEffect: [EffectId.TechnicalFinish_71E],
        useEffectDuration: true,
        partyOnly: true,
        icon: technicalFinishImage,
        // Dark Peach.
        borderColor: '#E0757C',
        sortKey: 5,
        cooldown: 120,
      },
      battlevoice: {
        // 20% DH, equals to 4~5% damage bonus (about dh 2k)
        cooldownAbility: [kAbility.BattleVoice],
        gainEffect: [EffectId.BattleVoice],
        loseEffect: [EffectId.BattleVoice],
        useEffectDuration: true,
        partyOnly: true,
        icon: battleVoiceImage,
        // Red.
        borderColor: '#D6371E',
        sortKey: 6,
        cooldown: 120,
      },
      finale: {
        // 6% damage bonus
        cooldownAbility: [kAbility.RadiantFinale],
        // B94 for buff, AA2 for visual effect
        gainEffect: [EffectId.RadiantFinale_B94],
        loseEffect: [EffectId.RadiantFinale_B94],
        useEffectDuration: true,
        partyOnly: true,
        icon: finaleImage,
        // Yellow.
        borderColor: '#ddd044',
        sortKey: 3,
        cooldown: 110,
      },
      chain: {
        // 10% crit, equals to 5%~6% damage bonus (about 3k crit)
        cooldownAbility: [kAbility.ChainStratagem],
        mobGainsEffect: EffectId.ChainStratagem_4C5,
        mobLosesEffect: EffectId.ChainStratagem_4C5,
        useEffectDuration: true,
        icon: chainStratagemImage,
        // Blue.
        borderColor: '#4674E5',
        sortKey: 4,
        cooldown: 120,
      },
      starrymuse: {
        // 5% damage bonus
        cooldownAbility: [kAbility.StarryMuse],
        gainEffect: [EffectId.StarryMuse],
        loseEffect: [EffectId.StarryMuse],
        useEffectDuration: true,
        partyOnly: true,
        icon: starryMuseImage,
        // Dark purple.
        borderColor: '#5C1F58',
        sortKey: 5,
        cooldown: 120,
      },
      brotherhood: {
        // 5% damage bonus
        cooldownAbility: [kAbility.Brotherhood],
        gainEffect: [EffectId.Brotherhood_4A1],
        loseEffect: [EffectId.Brotherhood_4A1],
        useEffectDuration: true,
        partyOnly: true,
        icon: brotherhoodImage,
        // Dark Orange.
        borderColor: '#994200',
        sortKey: 5,
        cooldown: 120,
      },
      divination: {
        // 6% damage bonus
        cooldownAbility: [kAbility.Divination],
        gainEffect: [EffectId.Divination_756],
        loseEffect: [EffectId.Divination_756],
        useEffectDuration: true,
        partyOnly: true,
        icon: divinationImage,
        // Dark purple.
        borderColor: '#5C1F58',
        sortKey: 3,
        cooldown: 120,
      },
      arcaneCircle: {
        // 3% damage bonus
        cooldownAbility: [kAbility.ArcaneCircle],
        gainEffect: [EffectId.ArcaneCircle],
        loseEffect: [EffectId.ArcaneCircle],
        useEffectDuration: true,
        partyOnly: true,
        icon: arcaneCircleImage,
        // Light pink..
        borderColor: '#F3A6FF',
        sortKey: 7,
        cooldown: 120,
      },
      searingLight: {
        // 5% damage bonus
        cooldownAbility: [kAbility.SearingLight],
        gainEffect: [EffectId.SearingLight],
        loseEffect: [EffectId.SearingLight],
        useEffectDuration: true,
        partyOnly: true,
        icon: searingLightImage,
        // Pink.
        borderColor: '#FF4A9D',
        sortKey: 5,
        cooldown: 120,
      },
    };

    const old: { [s: string]: Omit<BuffInfo, 'name'> } = {
      // overwrite old raidbuff here
    };

    if (this.ffxivVersion < 700) {
      for (const [key, entry] of Object.entries(old))
        this.buffInfo[key] = entry;
    }

    this.gainEffectMap = {};
    this.loseEffectMap = {};
    this.cooldownAbilityMap = {};
    this.mobGainsEffectMap = {};
    this.mobLosesEffectMap = {};

    const propToMapMap = {
      gainEffect: this.gainEffectMap,
      loseEffect: this.loseEffectMap,
      cooldownAbility: this.cooldownAbilityMap,
      mobGainsEffect: this.mobGainsEffectMap,
      mobLosesEffect: this.mobLosesEffectMap,
    } as const;

    for (const [key, buffOmitName] of Object.entries(this.buffInfo)) {
      const buff = {
        ...buffOmitName,
        name: key,
      };

      const overrides = this.options.PerBuffOptions[buff.name] ?? null;
      buff.borderColor = overrides?.borderColor ?? buff.borderColor;
      buff.icon = overrides?.icon ?? buff.icon;
      buff.side = overrides?.side ?? buff.side ?? 'right';
      buff.sortKey = overrides?.sortKey || buff.sortKey;
      buff.hide = overrides?.hide ?? buff.hide ?? false;

      for (const propStr in propToMapMap) {
        const prop = propStr as keyof typeof propToMapMap;

        if (!(prop in buff))
          continue;
        const key = buff[prop];
        if (typeof key === 'undefined') {
          console.error(`undefined value for key ${prop} for buff ${buff.name}`);
          continue;
        }

        const map = propToMapMap[prop];
        if (Array.isArray(key)) {
          key.forEach((k) => map[k] = [buff, ...map[k] ?? []]);
        } else {
          map[key] ??= [];
          map[key]?.push(buff);
        }
      }
    }
  }

  onUseAbility(id: string, matches: Partial<NetMatches['Ability']>): void {
    const buffs = this.cooldownAbilityMap[id];
    if (!buffs)
      return;

    for (const b of buffs) {
      if (b.partyOnly && !this.partyTracker.inParty(matches?.source ?? '')) {
        // when solo, you are not inParty.
        if (matches?.source !== this.playerName)
          return;
      }

      // This durationSeconds is not used for countdown active time,
      // but for preventing cooldown icon appear when effect is still active and duplicated.
      // +1 for delay between ability and effect.
      // FIXME: if you miss the buff, cooldown will appear at least after normal duration end.
      let seconds = 0;
      if (b.durationSeconds)
        seconds = b.durationSeconds + 1;

      this.onBigBuff(b.name, seconds, b, matches?.source, 'cooldown');
    }
  }

  onGainEffect(
    buffs: BuffInfo[] | undefined,
    matches: Partial<NetMatches['GainsEffect']>,
  ): void {
    if (!buffs)
      return;
    for (const b of buffs) {
      let seconds = -1;
      if (b.useEffectDuration)
        seconds = parseFloat(matches?.duration ?? '0');
      else if ('durationSeconds' in b)
        seconds = b.durationSeconds ?? seconds;
      if ('stack' in b && b.stack !== parseInt(matches?.count ?? '0'))
        return;

      this.onBigBuff(b.name, seconds, b, matches?.source, 'active');
      // Some cooldowns (like potions) have no cooldownAbility, so also track them here.
      if (!b.cooldownAbility)
        this.onBigBuff(b.name, seconds, b, matches?.source, 'cooldown');
    }
  }

  onLoseEffect(
    buffs: BuffInfo[] | undefined,
    _matches: Partial<NetMatches['LosesEffect']>,
  ): void {
    if (!buffs)
      return;
    for (const b of buffs)
      this.onLoseBigBuff(b.name);
  }

  onYouGainEffect(name: string, matches: Partial<NetMatches['GainsEffect']>): void {
    this.onGainEffect(this.gainEffectMap[name], matches);
  }

  onYouLoseEffect(name: string, matches: Partial<NetMatches['LosesEffect']>): void {
    this.onLoseEffect(this.loseEffectMap[name], matches);
  }

  onMobGainsEffect(name: string, matches: Partial<NetMatches['GainsEffect']>): void {
    this.onGainEffect(this.mobGainsEffectMap[name], matches);
  }

  onMobLosesEffect(name: string, matches: Partial<NetMatches['LosesEffect']>): void {
    this.onLoseEffect(this.mobLosesEffectMap[name], matches);
  }

  onBigBuff(
    name: string,
    seconds = 0,
    info: BuffInfo,
    source = '',
    option: 'active' | 'cooldown',
  ): void {
    let list = this.rightBuffDiv;
    if (info.side === 'left')
      list = this.leftBuffDiv;

    let buff = this.buffs[name];
    if (!buff)
      buff = this.buffs[name] = new Buff(name, info, list, this.options);

    const shareList = info.sharesCooldownWith || [];
    for (const share of shareList) {
      const existingBuff = this.buffs[share];
      if (existingBuff)
        existingBuff.clearCooldown(source);
    }

    if (option === 'active' && seconds > 0)
      buff.onGain(seconds);
    else if (option === 'cooldown')
      buff.onCooldown(seconds, source);
  }

  onLoseBigBuff(name: string): void {
    this.buffs[name]?.onLose();
  }

  clear(): void {
    Object.values(this.buffs).forEach((buff) => buff.clear());
  }
}
