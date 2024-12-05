import NetRegexes from '../../../../resources/netregexes';
import ZoneId from '../../../../resources/zone_id';
import { OopsyData } from '../../../../types/data';
import { OopsyTriggerSet } from '../../../../types/oopsy';

type AbilityTracker = {
  [abilityId: string]: {
    time: number;
    source: string;
  };
};

export interface Data extends OopsyData {
  lostFood: { [name: string]: boolean };
  originalRaiser: { [targetId: string]: string };
  lastRaisedLostTime: { [targetId: string]: string };
  raiseTargetTracker: { [sourceId: string]: string };
  targetMitTracker: {
    [targetId: string]: AbilityTracker;
  };
  partyMitTracker: AbilityTracker;
  targetDamageTracker: {
    [targetId: string]: AbilityTracker;
  };
  partyDamageTracker: AbilityTracker;
}

const raiseAbilityIds = [
  '7D', // raise
  'AD', // resurrection
  'E13', // ascend
  '1D63', // verraise
  '5EDF', // egeiro
  '478D', // angel whisper
  '7423', // variant raise
  '7426', // variant raise II
];

const targetMitAbilityIdToDuration: { [id: string]: number } = {
  // There are L98 traits that increase Reprisal, Feint, and Addle from 10s to 15s
  // TODO: Add a level check to determine duration?
  '1D6F': 15, // reprisal
  '1D7D': 15, // feint
  'B47': 10, // dismantle
  '1D88': 15, // addle
  '2C7C': 15, // bad breath
  '4781': 10, // magic hammer
  '8712': 10, // candy cane
};
const targetMitAbilityIds = Object.keys(targetMitAbilityIdToDuration);

const partyMitAbilityIdToDuration: { [id: string]: number } = {
  // tanks
  '1CDC': 30, // shake it off
  'DD4': 30, // divine veil
  '4057': 15, // dark missionary
  '3F20': 15, // heart of light
  // healers
  '4098': 20, // temperance
  '9093': 10, // divine caress
  'BC': 15, // sacred soil
  '650C': 20, // expedient
  '409A': 20, // fey/seraphic illumination (order)
  'E1D': 5, // collective unconscious
  '9087': 15, // sun sign
  '5EEA': 15, // kerachole
  '5EF6': 20, // holos
  '5EF7': 15, // panhaima
  // melee
  '41': 15, // mantra
  // ranged
  // TODO: troubadour/tactician/shield samba should match for overwriting each other
  '1CED': 15, // troubadour
  '1CF0': 15, // nature's minne
  '3E8C': 15, // shield samba
  '41F9': 15, // tactician
  // casters
  '6501': 10, // magick barrier
};
const partyMitAbilityIds = Object.keys(partyMitAbilityIdToDuration);

const shieldEffectIdToAbilityId: { [id: string]: string } = {
  '5B1': '1CDC', // shake it off
  '552': 'DD4', // divine veil
  'F3F': '9093', // divine caress
  'D25': '5EF6', // holosakos -> holos
  'A53': '5EF7', // panhaimatinon -> panhaima
};

const targetDamageAbilityIdToDuration: { [id: string]: number } = {
  '1D0C': 20, // chain stratagem
  '905D': 20, // dokumori
  '2C93': 15, // off-guard
  '2C9D': 15, // peculiar light
  '8707': 60, // breath of magic
  '8713': Number.MAX_SAFE_INTEGER, // mortal flame (infinite duration)
  '5750': 60, // lost flare star
};
const targetDamageAbilityIds = Object.keys(targetDamageAbilityIdToDuration);

const partyDamageAbilityIdToDuration: { [id: string]: number } = {
  // healers
  '40A8': 20, // divination
  // melee
  '1CE4': 20, // brotherhood
  'DE5': 20, // battle litany
  '5F55': 20, // arcane circle
  // ranged
  '76': 20, // battle voice
  '64B9': 20, // radiant finale
  '81C2': 20, // quadruple technical finish (if you overwrite dinky technical finish, good for you)
  // casters
  '64C9': 20, // searing light
  '1D60': 20, // embolden
  '8773': 20, // starry muse
};
const partyDamageAbilityIds = Object.keys(partyDamageAbilityIdToDuration);

// General mistakes; these apply everywhere.
const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.MatchAll,
  initData: () => {
    return {
      lostFood: {},
      originalRaiser: {},
      lastRaisedLostTime: {},
      raiseTargetTracker: {},
      targetMitTracker: {},
      partyMitTracker: {},
      targetDamageTracker: {},
      partyDamageTracker: {},
    };
  },
  triggers: [
    {
      // Trigger id for internally generated early pull warning.
      id: 'General Early Pull',
      comment: { cn: '抢开' },
    },
    {
      id: 'General Food Buff',
      comment: { cn: '食物消失' },
      type: 'LosesEffect',
      // Well Fed
      netRegex: NetRegexes.losesEffect({ effectId: '30' }),
      condition: (_data, matches) => {
        // Prevent "Eos loses the effect of Well Fed from Critlo Mcgee"
        return matches.target === matches.source;
      },
      mistake: (data, matches) => {
        // Well Fed buff happens repeatedly when it falls off (WHY),
        // so suppress multiple occurrences.
        if (!data.inCombat || data.lostFood[matches.target])
          return;
        data.lostFood[matches.target] = true;
        return {
          type: 'warn',
          blame: matches.target,
          reportId: matches.targetId,
          text: {
            en: 'lost food buff',
            de: 'Nahrungsbuff verloren',
            fr: 'Buff nourriture perdue',
            ja: '飯効果が失った',
            cn: '失去食物BUFF',
            ko: '음식 버프 해제',
          },
        };
      },
    },
    {
      id: 'General Well Fed',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: '30' }),
      run: (data, matches) => {
        delete data.lostFood[matches.target];
      },
    },
    {
      id: 'General Rabbit Medium',
      comment: { cn: '兔印' },
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: '8E0' }),
      condition: (data, matches) => data.IsPlayerId(matches.sourceId),
      mistake: (_data, matches) => {
        return {
          type: 'warn',
          blame: matches.source,
          reportId: matches.sourceId,
          text: {
            en: 'bunny',
            de: 'Hase',
            fr: 'lapin',
            ja: 'うさぎ',
            cn: '兔子',
            ko: '토끼',
          },
        };
      },
    },
    {
      id: 'General Raise Lost Effect Tracker',
      type: 'LosesEffect',
      netRegex: NetRegexes.losesEffect({ effectId: '94' }),
      run: (data, matches) => {
        data.lastRaisedLostTime[matches.targetId] = matches.timestamp;
      },
    },
    {
      id: 'General Double Raise',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: '94' }),
      mistake: (data, matches) => {
        const originalRaiser = data.originalRaiser[matches.targetId];
        // 30 and 26 lines having the same timestamp means effect was overwritten and the target is still dead
        const overwrittenRaise = data.lastRaisedLostTime[matches.targetId] === matches.timestamp;
        // if that's not the case, target doesn't have a raise yet
        if (!overwrittenRaise) {
          data.originalRaiser[matches.targetId] = matches.source;
          return;
        }
        // otherwise, report overwritten raise
        if (originalRaiser !== undefined) {
          delete data.lastRaisedLostTime[matches.targetId];
          const originalRaiserShort = data.party.member(originalRaiser).toString();
          return {
            type: 'warn',
            blame: matches.source,
            reportId: matches.sourceId,
            text: {
              en: `overwrote ${originalRaiserShort}'s raise`,
              de: `überschrieb ${originalRaiserShort}'s Wiederbeleben`,
              fr: `a écrasé la résurrection de ${originalRaiserShort}`,
              ja: `${originalRaiserShort}と重複蘇生`,
              cn: `顶掉了${originalRaiserShort}的复活`,
              ko: `${originalRaiserShort}의 부활과 겹침`,
            },
          };
        }
      },
    },
    {
      id: 'General Raise Cast Tracker',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: raiseAbilityIds }),
      run: (data, matches) => {
        data.raiseTargetTracker[matches.sourceId] = matches.targetId;
      },
    },
    {
      id: 'General Targetless Raise', // target raised before cast finished
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: raiseAbilityIds, targetId: 'E0000000' }),
      mistake: (data, matches) => {
        const targetId = data.raiseTargetTracker[matches.sourceId];
        if (targetId !== undefined) {
          const originalRaiser = data.originalRaiser[targetId];
          if (originalRaiser !== undefined) {
            const originalRaiserShort = data.party.member(originalRaiser).toString();
            return {
              type: 'warn',
              blame: matches.source,
              reportId: matches.sourceId,
              text: {
                en: `overwrote ${originalRaiserShort}'s raise`,
                de: `überschrieb ${originalRaiserShort}'s Wiederbeleben`,
                fr: `a écrasé la résurrection de ${originalRaiserShort}`,
                ja: `${originalRaiserShort}と重複蘇生`,
                cn: `顶掉了${originalRaiserShort}的复活`,
                ko: `${originalRaiserShort}의 부활과 겹침`,
              },
            };
          }
        }
      },
    },
    {
      id: 'General Overwritten Mit',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: targetMitAbilityIds.concat(partyMitAbilityIds) }),
      mistake: (data, matches) => {
        const isTargetMit = targetMitAbilityIds.includes(matches.id);
        const isPartyMit = partyMitAbilityIds.includes(matches.id);
        if (isTargetMit && matches.targetId === 'E0000000') // missed
          return;
        if (isPartyMit && !data.party.partyIds_.includes(matches.sourceId))
          return;
        if (isPartyMit && matches.targetId !== matches.sourceId)
          return;

        const mitTracker = isTargetMit
          ? (data.targetMitTracker[matches.targetId] ??= {})
          : data.partyMitTracker;
        const newTime = new Date(matches.timestamp).getTime();
        const newSource = matches.source;
        const lastTime = mitTracker[matches.id]?.time;
        const lastSource = mitTracker[matches.id]?.source;

        mitTracker[matches.id] = {
          time: newTime,
          source: newSource,
        };

        const duration = isTargetMit
          ? targetMitAbilityIdToDuration[matches.id]
          : partyMitAbilityIdToDuration[matches.id];
        if (lastTime !== undefined && lastSource !== undefined && duration !== undefined) {
          const diff = newTime - lastTime;
          const leeway =
            (duration * 1000 - diff) > data.options.MinimumTimeForOverwrittenMit * 1000;
          if (diff < duration * 1000 && leeway) {
            const lastSourceShort = data.party.member(lastSource).toString();
            return {
              type: 'heal',
              blame: matches.source,
              reportId: matches.sourceId,
              text: {
                en: `overwrote ${lastSourceShort}'s ${matches.ability}`,
                de: `überschrieb ${lastSourceShort}'s ${matches.ability}`,
                fr: `a écrasé ${matches.ability} de ${lastSourceShort}`,
                ja: `${lastSourceShort}の${matches.ability}を上書き`,
                cn: `顶掉了${lastSourceShort}的${matches.ability}`,
                ko: `${lastSourceShort}의 ${matches.ability} 덮어씀`,
              },
            };
          }
        }
      },
    },
    {
      id: 'General Shield Removal',
      type: 'LosesEffect',
      netRegex: NetRegexes.losesEffect({ effectId: Object.keys(shieldEffectIdToAbilityId) }),
      run: (data, matches) => {
        const abilityId = shieldEffectIdToAbilityId[matches.effectId];
        if (abilityId !== undefined)
          delete data.partyMitTracker[abilityId];
      },
    },
    {
      id: 'General Overwritten Damage Effect',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: targetDamageAbilityIds.concat(partyDamageAbilityIds) }),
      mistake: (data, matches) => {
        const isTargetDamage = targetDamageAbilityIds.includes(matches.id);
        const isPartyDamage = partyDamageAbilityIds.includes(matches.id);
        if (isTargetDamage && matches.targetId === 'E0000000') // missed
          return;
        if (isPartyDamage && !data.party.partyIds_.includes(matches.sourceId))
          return;
        if (isPartyDamage && matches.targetId !== matches.sourceId)
          return;

        const damageTracker = isTargetDamage
          ? (data.targetDamageTracker[matches.targetId] ??= {})
          : data.partyDamageTracker;
        const newTime = new Date(matches.timestamp).getTime();
        const newSource = matches.source;
        const lastTime = damageTracker[matches.id]?.time;
        const lastSource = damageTracker[matches.id]?.source;

        damageTracker[matches.id] = {
          time: newTime,
          source: newSource,
        };

        const duration = isTargetDamage
          ? targetDamageAbilityIdToDuration[matches.id]
          : partyDamageAbilityIdToDuration[matches.id];
        if (lastTime !== undefined && lastSource !== undefined && duration !== undefined) {
          const diff = newTime - lastTime;
          const leeway =
            (duration * 1000 - diff) > data.options.MinimumTimeForOverwrittenDamage * 1000;
          if (diff < duration * 1000 && leeway) {
            const lastSourceShort = data.party.member(lastSource).toString();
            return {
              type: 'warn',
              blame: matches.source,
              reportId: matches.sourceId,
              text: {
                en: `overwrote ${lastSourceShort}'s ${matches.ability}`,
                de: `überschrieb ${lastSourceShort}'s ${matches.ability}`,
                fr: `a écrasé ${matches.ability} de ${lastSourceShort}`,
                ja: `${lastSourceShort}の${matches.ability}を上書き`,
                cn: `顶掉了${lastSourceShort}的${matches.ability}`,
                ko: `${lastSourceShort}의 ${matches.ability} 덮어씀`,
              },
            };
          }
        }
      },
    },
  ],
};

export default triggerSet;
