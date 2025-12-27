// import Outputs from '../../../../../resources/outputs';
import Conditions from '../../../../../resources/conditions';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Add minions?

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'HuntDTSS',
  zoneId: [
    ZoneId.Urqopacha,
    ZoneId.Kozamauka,
    ZoneId.YakTel,
    ZoneId.Shaaloani,
    ZoneId.HeritageFound,
    ZoneId.LivingMemory,
  ],
  zoneLabel: {
    en: 'SS Rank Hunts',
    de: 'SS Jagdziele',
    fr: 'Objectifs de chasse SS',
    ja: 'SSモブ',
    cn: 'SS 级狩猎怪',
    tc: 'SS 級狩獵怪',
    ko: 'SS급 마물',
  },
  comments: {
    en: 'SS Rank Hunts',
    de: 'SS Rang Hohe Jagd',
    fr: 'Chasse de rang SS',
    cn: 'SS级狩猎怪',
    tc: 'SS級狩獵怪',
    ko: 'SS급 마물',
  },
  triggers: [
    {
      id: 'Hunt Arch Aethereater Aetherodynamics',
      type: 'StartsUsing',
      // Not clear why there are four ids that can be used -- might be connected to the Soulless Stream variants?
      netRegex: {
        id: ['9A57', '9A58', '9B9F', '9BA0'],
        source: 'Arch Aethereater',
        capture: false,
      },
      response: Responses.aoe(),
    },
    {
      id: 'Hunt Arch Aethereater Obliterate',
      type: 'StartsUsing',
      netRegex: { id: '9A5B', source: 'Arch Aethereater' },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Hunt Arch Aethereater Meltdown',
      type: 'StartsUsing',
      netRegex: { id: '9A5C', source: 'Arch Aethereater', capture: false },
      durationSeconds: 3, // these are fast and they happen back to back without much of a telegraph
      response: Responses.awayFromFront(),
    },
    // There's some weirdness in the logs where the heat/cold debuffs may be reapplied.
    // Total duration doesn't change, but suppress just for safety.
    {
      id: 'Hunt Arch Aethereater Heatstroke',
      type: 'GainsEffect',
      netRegex: { effectId: '102D' },
      condition: Conditions.targetIsYou(),
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 3,
      suppressSeconds: (_data, matches) => parseFloat(matches.duration),
      response: Responses.stopMoving(),
    },
    {
      id: 'Hunt Arch Aethereater Cold Sweats',
      type: 'GainsEffect',
      netRegex: { effectId: '102E' },
      condition: Conditions.targetIsYou(),
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 3,
      suppressSeconds: (_data, matches) => parseFloat(matches.duration),
      infoText: (_data, _matches, output) => output.frozen!(),
      outputStrings: {
        frozen: {
          en: 'Frozen soon',
          de: 'Bald einfrieren',
          fr: 'Gelé bientôt',
          cn: '即将冻结',
          tc: '即將凍結',
          ko: '곧 동결',
        },
      },
    },
    {
      id: 'Hunt Arch Aethereater Blizzard IV',
      type: 'StartsUsing',
      netRegex: { id: '9B96', source: 'Arch Aethereater', capture: false },
      response: Responses.getUnder('alert'),
    },
    {
      id: 'Hunt Arch Aethereater Fire IV',
      type: 'StartsUsing',
      netRegex: { id: '9B9D', source: 'Arch Aethereater', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'Hunt Arch Aethereater Soulless Stream Ice Left',
      type: 'StartsUsing',
      netRegex: { id: '9A53', source: 'Arch Aethereater', capture: false },
      durationSeconds: 7.5,
      alertText: (_data, _matches, output) => output.iceLeft!(),
      outputStrings: {
        iceLeft: {
          en: 'Right => Get Under',
          de: 'Rechts => Geh unter den Gegner',
          fr: 'Droite => Allez dessous',
          cn: '右 => 身下',
          tc: '右 => 身下',
          ko: '오른쪽 => 보스 아래로',
        },
      },
    },
    {
      id: 'Hunt Arch Aethereater Soulless Stream Ice Right',
      type: 'StartsUsing',
      netRegex: { id: '9A56', source: 'Arch Aethereater', capture: false },
      durationSeconds: 7.5,
      alertText: (_data, _matches, output) => output.iceRight!(),
      outputStrings: {
        iceRight: {
          en: 'Left => Get Under',
          de: 'Links => Geh unter den Gegner',
          fr: 'Gauche => Allez dessous',
          cn: '左 => 身下',
          tc: '左 => 身下',
          ko: '왼쪽 => 보스 아래로',
        },
      },
    },
    {
      id: 'Hunt Arch Aethereater Soulless Stream Fire Right',
      type: 'StartsUsing',
      netRegex: { id: '9A54', source: 'Arch Aethereater', capture: false },
      durationSeconds: 7.5,
      alertText: (_data, _matches, output) => output.fireRight!(),
      outputStrings: {
        fireRight: {
          en: 'Left => Out',
          de: 'Links => Raus',
          fr: 'Droite => Extérieur',
          cn: '左 => 远离',
          tc: '左 => 遠離',
          ko: '왼쪽 => 밖으로',
        },
      },
    },
    {
      id: 'Hunt Arch Aethereater Soulless Stream Fire Left',
      type: 'StartsUsing',
      netRegex: { id: '9A55', source: 'Arch Aethereater', capture: false },
      durationSeconds: 7.5,
      alertText: (_data, _matches, output) => output.fireLeft!(),
      outputStrings: {
        fireLeft: {
          en: 'Right => Out',
          de: 'Rechts => Raus',
          fr: 'Gauche => Extérieur',
          cn: '右 => 远离',
          tc: '右 => 遠離',
          ko: '오른쪽 => 밖으로',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Arch Aethereater': 'Herr der Kristallisation',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Arch Aethereater': 'Seigneur des cristallisateurs',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Arch Aethereater': 'ロード・オブ・クリスタライザー',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Arch Aethereater': '水晶化身之王',
      },
    },
    {
      'locale': 'tc',
      'replaceSync': {
        'Arch Aethereater': '水晶化身之王',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Arch Aethereater': '크리스탈라이저 군주',
      },
    },
  ],
};

export default triggerSet;
