import { isLang, Lang } from '../../resources/languages';
import { buildNetRegexForTrigger } from '../../resources/netregexes';
import { UnreachableCode } from '../../resources/not_reached';
import PartyTracker from '../../resources/party';
import Regexes from '../../resources/regexes';
import { triggerOutputFunctions } from '../../resources/responses';
import { translateRegex, translateRegexBuildParam } from '../../resources/translations';
import UserConfig, {
  ConfigEntry,
  ConfigEntryToDivMap,
  ConfigIdToValueMap,
  ConfigValue,
  OptionsTemplate,
  UserFileCallback,
} from '../../resources/user_config';
import { BaseOptions, RaidbossData } from '../../types/data';
import { SavedConfigEntry } from '../../types/event';
import { Job, Role } from '../../types/job';
import { Matches } from '../../types/net_matches';
import {
  LocaleText,
  LooseTrigger,
  Output,
  OutputStrings,
  RaidbossFileData,
  TimelineField,
  TriggerAutoConfig,
  TriggerSetAutoConfig,
} from '../../types/trigger';
import {
  CactbotConfigurator,
  ConfigLooseTrigger,
  ConfigLooseTriggerSet,
  ConfigProcessedFileMap,
} from '../config/config';
import { ConfigSearch } from '../config/config_search';

import raidbossFileData from './data/raidboss_manifest.txt';
import { RaidbossTriggerField, RaidbossTriggerOutput } from './popup-text';
import raidbossOptions, { RaidbossOptions } from './raidboss_options';
import { TimelineParser } from './timeline_parser';

const kOptionKeys = {
  output: 'Output',
  duration: 'Duration',
  beforeSeconds: 'BeforeSeconds',
  delayAdjust: 'DelayAdjust',
  outputStrings: 'OutputStrings',
  // folder for all trigger options
  triggers: 'triggers',
  // folder for all trigger set options
  triggerSets: 'triggerSets',
  // folder for options in trigger set config ui
  triggerSetConfig: 'TriggerSetConfig',
} as const;

type TriggerSoundOption = {
  label: LocaleText;
  debugOnly?: boolean;
};

// No sound only option, because that's silly.
const kTriggerOptions = {
  default: {
    label: {
      en: '✔ Defaults',
      de: '✔ Standards',
      fr: '✔ Défauts',
      ja: '✔ 初期設定',
      cn: '✔ 默认设置',
      ko: '✔ 기본',
      tc: '✔ 默認設置',
    },
  },
  textAndSound: {
    label: {
      en: '🆙🔊 Text and Sound',
      de: '🆙🔊 Text und Ton',
      fr: '🆙🔊 Texte et son',
      ja: '🆙🔊 テキストと音声',
      cn: '🆙🔊 文本显示与提示音',
      ko: '🆙🔊 텍스트와 소리',
      tc: '🆙🔊 文本顯示與提示音',
    },
  },
  ttsAndText: {
    label: {
      en: '🆙💬 Text and TTS',
      de: '🆙💬 Text und TTS',
      fr: '🆙💬 Texte et TTS',
      ja: '🆙💬 テキストとTTS',
      cn: '🆙💬 文本显示与TTS',
      ko: '🆙💬 텍스트와 TTS',
      tc: '🆙💬 文本顯示與TTS',
    },
  },
  ttsOnly: {
    label: {
      en: '💬 TTS Only',
      de: '💬 Nur TTS',
      fr: '💬 TTS Seulement',
      ja: '💬 TTSのみ',
      cn: '💬 只使用TTS',
      ko: '💬 TTS만',
      tc: '💬 只使用TTS',
    },
  },
  textOnly: {
    label: {
      en: '🆙 Text Only',
      de: '🆙 Nur Text',
      fr: '🆙 Texte seulement',
      ja: '🆙 テキストのみ',
      cn: '🆙 只使用文本显示',
      ko: '🆙 텍스트만',
      tc: '🆙 只使用文本顯示',
    },
  },
  disabled: {
    label: {
      en: '❌ Disabled',
      de: '❌ Deaktiviert',
      fr: '❌ Désactivé',
      ja: '❌ 無効',
      cn: '❌ 禁用',
      ko: '❌ 비활성화',
      tc: '❌ 禁用',
    },
  },
} as const;

const triggerSoundOptions: { [key: string]: TriggerSoundOption } = kTriggerOptions;

type DetailKey = {
  label: LocaleText;
  cls: string;
  debugOnly?: boolean;
  generatedManually?: boolean;
};

const kDetailKeys = {
  'triggerRegex': {
    label: {
      en: 'regex',
      de: 'regex',
      fr: 'regex',
      ja: '正規表現',
      cn: '正则表达式',
      ko: '정규식',
      tc: '正則表達式',
    },
    cls: 'regex-text',
    debugOnly: true,
  },
  'triggerNetRegex': {
    label: {
      en: 'netregex',
      de: 'netregex',
      fr: 'netregex',
      ja: 'ネット正規表現',
      cn: '网络日志正则表达式',
      ko: '정규표현식',
      tc: '網路日誌正則表達式',
    },
    cls: 'regex-text',
    debugOnly: true,
  },
  'timelineRegex': {
    label: {
      en: 'timeline',
      de: 'timeline',
      fr: 'timeline',
      ja: 'タイムライン',
      cn: '时间轴',
      ko: '타임라인',
      tc: '時間軸',
    },
    cls: 'regex-text',
    debugOnly: true,
  },
  'beforeSeconds': {
    label: {
      en: 'before (sec)',
      de: 'Vorher (Sekunden)',
      fr: 'avant (seconde)',
      ja: 'その前に (秒)',
      cn: '提前 (秒)',
      ko: '앞당김 (초)',
      tc: '提前 (秒)',
    },
    cls: 'before-seconds-text',
    generatedManually: true,
  },
  'condition': {
    label: {
      en: 'condition',
      de: 'condition',
      fr: 'condition',
      ja: '条件',
      cn: '条件',
      ko: '조건',
      tc: '條件',
    },
    cls: 'condition-text',
    debugOnly: true,
  },
  'delayAdjust': {
    label: {
      // Note: delay adjusting is both dangerous (delays can be functional in terms of
      // needing to happen after/before a particular time to collect the state of the world)
      // as well as confusing (you can adjust some but not many things negatively as
      // delay can't go below zero). Therefore, this is a developer/debug mode only for
      // people who know what they're doing.
      en: 'DEBUG delay adjust (sec)',
      de: 'DEBUG Verzögerungseinstellung (sec)',
      fr: 'Délai d\'ajustement DEBUG (s)',
      ja: 'DEBUGの待機調整 (秒)',
      cn: 'DEBUG 延时调整 (秒)',
      ko: '"디버그" 딜레이 조절 (초)',
      tc: 'DEBUG 延時調整 (秒)',
    },
    cls: 'delay-adjust-text',
    generatedManually: true,
    debugOnly: true,
  },
  'duration': {
    label: {
      en: 'duration (sec)',
      de: 'Dauer (Sekunden)',
      fr: 'Durée (secondes)',
      ja: '存続時間 (秒)',
      cn: '显示时长 (秒)',
      ko: '지속 시간 (초)',
      tc: '顯示時長 (秒)',
    },
    cls: 'duration-text',
    generatedManually: true,
  },
  'preRun': {
    label: {
      en: 'preRun',
      de: 'preRun',
      fr: 'preRun',
      ja: 'プレ実行',
      cn: '预运行',
      ko: '사전 실행',
      tc: '預運行',
    },
    cls: 'prerun-text',
    debugOnly: true,
  },
  'alarmText': {
    label: {
      en: 'alarm',
      de: 'alarm',
      fr: 'alarme',
      ja: '警報',
      cn: '致命级',
      ko: '경고',
      tc: '致命級',
    },
    cls: 'alarm-text',
  },
  'alertText': {
    label: {
      en: 'alert',
      de: 'alert',
      fr: 'alerte',
      ja: '警告',
      cn: '严重级',
      ko: '주의',
      tc: '嚴重級',
    },
    cls: 'alert-text',
  },
  'infoText': {
    label: {
      en: 'info',
      de: 'info',
      fr: 'info',
      ja: '情報',
      cn: '一般级',
      ko: '안내',
      tc: '一般級',
    },
    cls: 'info-text',
  },
  'tts': {
    label: {
      en: 'tts',
      de: 'tts',
      fr: 'tts',
      ja: 'TTS',
      cn: 'TTS',
      ko: 'TTS',
      tc: 'TTS',
    },
    cls: 'tts-text',
  },
  'sound': {
    label: {
      en: 'sound',
      de: 'sound',
      fr: 'son',
      ja: '音声',
      cn: '提示音',
      ko: '소리',
      tc: '提示音',
    },
    cls: 'sound-text',
  },
  'run': {
    label: {
      en: 'run',
      de: 'run',
      fr: 'run',
      ja: '実行',
      cn: '运行',
      ko: '실행',
      tc: '運行',
    },
    cls: 'run-text',
    debugOnly: true,
  },
} as const;

// Ordered set of headers in the timeline edit table.
const kTimelineTableHeaders = {
  shouldDisplayText: {
    en: 'Show',
    de: 'Anzeigen',
    fr: 'Afficher',
    ja: '表示',
    cn: '显示',
    ko: '표시',
    tc: '顯示',
  },
  text: {
    en: 'Timeline Text',
    de: 'Timeline Text',
    fr: 'Texte de la timeline',
    ja: 'タイムラインテキスト',
    cn: '时间轴文本',
    ko: '타임라인 텍스트',
    tc: '時間軸文本',
  },
  overrideText: {
    en: 'Rename',
    de: 'Umbenennen',
    fr: 'Renommer',
    ja: 'テキスト変更',
    cn: '修改文本',
    ko: '텍스트 변경',
    tc: '修改文本',
  },
} as const;

const detailKeys: { [key in keyof LooseTrigger]: DetailKey } = kDetailKeys;

const kMiscTranslations = {
  // Shows up for un-set values.
  valueDefault: {
    en: '(default)',
    de: '(Standard)',
    fr: '(Défaut)',
    ja: '(初期値)',
    cn: '(默认值)',
    ko: '(기본값)',
    tc: '(預設值)',
  },
  // Shown when the UI can't decipher the output of a function.
  valueIsFunction: {
    en: '(function)',
    de: '(Funktion)',
    fr: '(Fonction)',
    ja: '(関数)',
    cn: '(函数)',
    ko: '(함수)',
    tc: '(函數)',
  },
  // Warning label for triggers without ids or overridden triggers.
  warning: {
    en: '⚠️ warning',
    de: '⚠️ Warnung',
    fr: '⚠️ Attention',
    ja: '⚠️ 警告',
    cn: '⚠️ 警告',
    ko: '⚠️ 주의',
    tc: '⚠️ 警告',
  },
  // Shows up for triggers without ids.
  missingId: {
    en: 'missing id field',
    de: 'Fehlendes ID Feld',
    fr: 'Champ ID manquant',
    ja: 'idがありません',
    cn: '缺少id属性',
    ko: 'ID 필드값 없음',
    tc: '缺少id屬性',
  },
  // Shows up for triggers that are overridden by other triggers.
  overriddenByFile: {
    en: 'overridden by "${file}"',
    de: 'Überschrieben durch "${file}"',
    fr: 'Écrasé(e) par "${file}"',
    ja: '"${file}"に上書きました',
    cn: '被"${file}"文件覆盖',
    ko: '"${file}" 파일에서 덮어씌움',
    tc: '被"${file}"文件覆蓋',
  },
  // Opens trigger file on Github.
  viewTriggerSource: {
    en: 'View Trigger Source',
    de: 'Zeige Trigger Quelle',
    fr: 'Afficher la source du Trigger',
    ja: 'トリガーのコードを表示',
    cn: '显示触发器源码',
    ko: '트리거 소스코드 보기',
    tc: '顯示觸發器原始碼',
  },
  // The header for the editing timeline section inside a trigger file.
  editTimeline: {
    en: 'Edit Timeline',
    de: 'Timeline bearbeiten',
    fr: 'Éditer la timeline',
    ja: 'タイムラインを編集',
    cn: '编辑时间轴',
    ko: '타임라인 편집',
    tc: '編輯時間軸',
  },
  // The header inside the Edit Timeline section on top of the reference timeline text.
  timelineListing: {
    en: 'Reference Text (uneditable)',
    de: 'Referenztext (nicht editierbar)',
    fr: 'Texte de référence (non éditable)',
    ja: '参考タイムライン (編集不可)',
    cn: '参考文本 (不可编辑)',
    ko: '원본 타임라인 (수정 불가능)',
    tc: '參考文本 (不可編輯)',
  },
  // The header inside the Edit Timeline section on top of the add entries section.
  addCustomTimelineEntries: {
    en: 'Add Custom Timeline Entries',
    de: 'Eigene Timeline Einträge hinzufügen',
    fr: 'Ajouter une entrée de timeline personnalisée',
    ja: 'カスタマイズタイムライン追加',
    cn: '添加自定义时间轴条目',
    ko: '사용자 지정 타임라인 항목 추가',
    tc: '添加自訂時間軸條目',
  },
  // The button text for the Edit Timeline add entries section.
  addMoreRows: {
    en: 'Add more rows',
    de: 'Mehr Reihen hinzufügen',
    fr: 'Ajouter une ligne',
    ja: '行追加',
    cn: '添加更多行',
    ko: '행 추가',
    tc: '添加更多行',
  },
  customEntryTime: {
    en: 'Time',
    de: 'Zeit',
    fr: 'Temps',
    ja: '時間',
    cn: '时间',
    ko: '시간',
    tc: '時間',
  },
  customEntryText: {
    en: 'Text',
    de: 'Text',
    fr: 'Texte',
    ja: 'テキスト',
    cn: '文本',
    ko: '텍스트',
    tc: '文本',
  },
  customEntryDuration: {
    en: 'Duration (seconds)',
    de: 'Dauer (Sekunden)',
    fr: 'Durée (s)',
    ja: '持続時間 (秒)',
    cn: '显示时长 (秒)',
    ko: '지속시간 (초)',
    tc: '顯示時長 (秒)',
  },
  customEntryRemove: {
    en: 'Remove',
    de: 'Entfernen',
    fr: 'Supprimer',
    ja: '削除',
    cn: '移除',
    ko: '삭제',
    tc: '移除',
  },
};

const validDurationOrUndefined = (valEntry?: SavedConfigEntry) => {
  if (typeof valEntry !== 'string' && typeof valEntry !== 'number')
    return undefined;
  const val = parseFloat(valEntry.toString());
  if (!isNaN(val) && val >= 0)
    return val;
  return undefined;
};

const validDelayAdjustOrUndefined = (valEntry?: SavedConfigEntry) => {
  if (typeof valEntry !== 'string' && typeof valEntry !== 'number')
    return undefined;
  const val = parseFloat(valEntry.toString());
  if (!isNaN(val))
    return val;
  return undefined;
};

const canBeConfigured = (trig: ConfigLooseTrigger) =>
  !trig.isMissingId && trig.overriddenByFile === undefined;

const addTriggerDetail = (
  container: HTMLElement,
  labelText: string,
  detailText: string,
  detailCls?: string[],
): void => {
  const label = document.createElement('div');
  label.innerText = labelText;
  label.classList.add('trigger-label');
  container.appendChild(label);

  const detail = document.createElement('div');
  detail.classList.add('trigger-detail');
  detail.innerText = detailText;
  container.appendChild(detail);

  if (detailCls)
    detail.classList.add(...detailCls);
};

// This is used both for top level Options and for PerTriggerAutoConfig settings.
// Unfortunately due to poor decisions in the past, PerTriggerOptions has different
// fields here.  This should be fixed.
const setOptionsFromOutputValue = (
  value: SavedConfigEntry,
  options: BaseOptions | TriggerAutoConfig | TriggerSetAutoConfig,
) => {
  if (value === 'default') {
    // Nothing.
  } else if (value === 'textAndSound') {
    options.TextAlertsEnabled = true;
    options.SoundAlertsEnabled = true;
    options.SpokenAlertsEnabled = false;
  } else if (value === 'ttsAndText') {
    options.TextAlertsEnabled = true;
    options.SoundAlertsEnabled = true;
    options.SpokenAlertsEnabled = true;
  } else if (value === 'ttsOnly') {
    options.TextAlertsEnabled = false;
    options.SoundAlertsEnabled = true;
    options.SpokenAlertsEnabled = true;
  } else if (value === 'textOnly') {
    options.TextAlertsEnabled = true;
    options.SoundAlertsEnabled = false;
    options.SpokenAlertsEnabled = false;
  } else if (value === 'disabled') {
    options.TextAlertsEnabled = false;
    options.SoundAlertsEnabled = false;
    options.SpokenAlertsEnabled = false;
  } else {
    // FIXME: handle lint error here
    // ref: https://github.com/OverlayPlugin/cactbot/pull/274#discussion_r1692375852
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    console.error(`unknown output type: ${value.toString()}`);
  }
};

// Helper for doing nothing during trigger eval, but still recording any
// calls to `output.responseOutputStrings = x;` via callback.
class DoNothingFuncProxy {
  constructor(outputStringsCallback: (outputStrings: OutputStrings) => void) {
    return new Proxy(this, {
      set(_target, property, value): boolean {
        if (property === 'responseOutputStrings') {
          // TODO: need some way of verifying that a value is an OutputStrings.
          outputStringsCallback(value as OutputStrings);
          return true;
        }

        // Ignore other property setting here.
        return false;
      },

      get(_target, _name) {
        return () => {/* noop */};
      },
    });
  }
}

const makeLink = (href: string) => {
  return `<a href="${href}" target="_blank">${href}</a>`;
};

const langOrEn = (lang: ConfigValue): Lang => {
  return typeof lang === 'string' && isLang(lang) ? lang : 'en';
};

class RaidbossConfigurator {
  private base: CactbotConfigurator;
  private alertsLang: Lang;
  private timelineLang: Lang;

  constructor(cactbotConfigurator: CactbotConfigurator) {
    this.base = cactbotConfigurator;

    // TODO: is it worth adding the complexity to reflect this change in triggers that use it?
    // This is probably where using something like vue or react would be easier.
    // For the moment, folks can just reload, for real.
    this.alertsLang = langOrEn(this.base.getOption('raidboss', 'AlertsLanguage', this.base.lang));
    this.timelineLang = langOrEn(
      this.base.getOption('raidboss', 'TimelineLanguage', this.base.lang),
    );
  }

  buildUI(container: HTMLElement, raidbossFiles: RaidbossFileData, userOptions: RaidbossOptions) {
    const fileMap = this.processRaidbossFiles(raidbossFiles, userOptions);

    new ConfigSearch(this.base, container);

    const expansionDivs: { [expansion: string]: HTMLElement } = {};

    for (const [key, info] of Object.entries(fileMap)) {
      // "expansion" here is technically section, which includes "general triggers"
      // and one section per user file.
      const expansion = info.section;

      // This isn't perfect, but skip trigger sets that are no-ops.
      const hasTriggers = Object.keys(info.triggers ?? []).length !== 0;
      const hasTimeline = info.triggerSet.timeline !== undefined;
      const hasTriggerSetConfig = (info.triggerSet.config ?? []).length > 0;
      if (!hasTriggers && !hasTimeline && !hasTriggerSetConfig)
        continue;

      let expansionDiv = expansionDivs[expansion];
      if (!expansionDiv) {
        const expansionContainer = document.createElement('div');
        expansionContainer.classList.add('trigger-expansion-container', 'collapsed');
        container.appendChild(expansionContainer);

        const expansionHeader = document.createElement('div');
        expansionHeader.classList.add('trigger-expansion-header');
        expansionHeader.onclick = () => {
          expansionContainer.classList.toggle('collapsed');
        };
        expansionHeader.innerText = expansion;
        expansionContainer.appendChild(expansionHeader);

        expansionDiv = expansionDivs[expansion] = expansionContainer;
      }

      const triggerContainer = document.createElement('div');
      triggerContainer.classList.add('trigger-file-container', 'collapsed');

      ConfigSearch.setContainerData(triggerContainer, { title: info.title });

      expansionDiv.appendChild(triggerContainer);

      const headerDiv = document.createElement('div');
      headerDiv.classList.add('trigger-file-header');
      headerDiv.onclick = () => {
        triggerContainer.classList.toggle('collapsed');
      };

      const parts = [info.title, info.type, info.prefix];
      for (const part of parts) {
        if (part === undefined)
          continue;
        const partDiv = document.createElement('div');
        partDiv.classList.add('trigger-file-header-part');
        // Use innerHTML here because of <Emphasis>Whorleater</Emphasis>.
        partDiv.innerHTML = part;
        headerDiv.appendChild(partDiv);
      }

      triggerContainer.appendChild(headerDiv);

      // TODO: print a warning if config exists without triggerset id??
      if (info.triggerSet.id !== undefined) {
        const triggerSetConfig = document.createElement('div');
        triggerSetConfig.classList.add('overlay-options');
        triggerContainer.appendChild(triggerSetConfig);

        const triggerSetAlertOutput = {
          ...defaultTriggerSetAlertOutput,
          id: kOptionKeys.output,
          default: this.base.getStringOption(
            'raidboss',
            defaultAlertOutput.id,
            defaultAlertOutput.default.toString(),
          ),
        } as const;
        this.base.buildConfigEntry(
          userOptions,
          triggerSetConfig,
          triggerSetAlertOutput,
          'raidboss',
          [
            kOptionKeys.triggerSets,
            info.triggerSet.id,
          ],
        );

        // Track the values of and html elements associated with each config entry,
        // to be used for updating visibility/enablement of config entries.
        // These are reset for each trigger set.
        const values: ConfigIdToValueMap = {};
        const elements: ConfigEntryToDivMap = new Map();

        for (const opt of info.triggerSet.config ?? []) {
          if (!this.base.developerOptions && opt.debugOnly)
            continue;
          const ret = this.base.buildConfigEntry(
            userOptions,
            triggerSetConfig,
            opt,
            'raidboss',
            [
              kOptionKeys.triggerSetConfig,
              info.triggerSet.id,
            ],
            elements,
            values,
          );

          if (!ret)
            continue;
          elements.set(opt, ret.elements);
          values[opt.id] = ret.value;
        }
        // Once the group is fully created, process visibility settings.
        this.base.updateVisibility(elements, values);
      }

      // Timeline editing is tied to a single, specific zoneId per file for now.
      // We could add more indirection (via fileKey?) and look up zoneId -> fileKey[]
      // and fileKey -> timeline edits if needed.
      if (info.triggerSet.timeline !== undefined && typeof info.zoneId === 'number')
        this.buildTimelineUIContainer(info.zoneId, info.triggerSet, triggerContainer, userOptions);

      const triggerOptions = document.createElement('div');
      triggerOptions.classList.add('trigger-file-options');
      triggerContainer.appendChild(triggerOptions);

      for (const [trigId, trig] of Object.entries(info.triggers ?? {})) {
        // Don't construct triggers that won't show anything.
        let hasOutputFunc = false;
        for (const func of triggerOutputFunctions) {
          if (func in trig) {
            hasOutputFunc = true;
            break;
          }
        }
        if (!hasOutputFunc && !this.base.developerOptions)
          continue;

        const triggerDiv = document.createElement('div');
        triggerDiv.classList.add('trigger');

        ConfigSearch.setTriggerData(triggerDiv, trig);

        // Build the trigger label.
        const triggerId = document.createElement('div');
        triggerId.classList.add('trigger-id');
        triggerId.innerHTML = trig.isMissingId ? '(???)' : trigId;
        triggerId.classList.add('trigger-id');
        triggerDiv.appendChild(triggerId);

        // Build the trigger comment
        if (trig.comment) {
          const trigComment = trig.comment[this.base.lang] ?? trig.comment?.en ?? '';
          const triggerCommentDiv = document.createElement('div');
          triggerCommentDiv.innerHTML = trigComment;
          triggerCommentDiv.classList.add('comment');
          triggerDiv.appendChild(triggerCommentDiv);
        }

        triggerOptions.appendChild(triggerDiv);

        // Container for the right side ui (select boxes, all of the info).
        const triggerDetails = document.createElement('div');
        triggerDetails.classList.add('trigger-details');
        triggerOptions.appendChild(triggerDetails);

        if (canBeConfigured(trig))
          triggerDetails.appendChild(this.buildTriggerOptions(trig, triggerDiv));

        if (trig.isMissingId) {
          addTriggerDetail(
            triggerDetails,
            this.base.translate(kMiscTranslations.warning),
            this.base.translate(kMiscTranslations.missingId),
          );
        }
        if (trig.overriddenByFile !== undefined) {
          const baseText = this.base.translate(kMiscTranslations.overriddenByFile);
          const detailText = baseText.replace('${file}', trig.overriddenByFile);
          addTriggerDetail(
            triggerDetails,
            this.base.translate(kMiscTranslations.warning),
            detailText,
          );
        }

        // Append some details about the trigger so it's more obvious what it is.
        for (const [detailStringKey, opt] of Object.entries(detailKeys)) {
          // Object.entries coerces to a string, but the detailKeys definition makes this true.
          const detailKey = detailStringKey as keyof LooseTrigger;

          if (opt.generatedManually)
            continue;
          if (!this.base.developerOptions && opt.debugOnly)
            continue;
          const trigOutput = trig.configOutput?.[detailKey];
          const trigFunc = trig[detailKey];
          if (trigFunc === undefined || trigFunc === null)
            continue;

          const detailCls = [opt.cls];
          let detailText: string | undefined;
          if (trigOutput !== undefined) {
            detailText = trigOutput;
          } else if (typeof trigFunc === 'function') {
            detailText = this.base.translate(kMiscTranslations.valueIsFunction);
            detailCls.push('function-text');
          } else {
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            detailText = trigFunc.toString();
          }

          addTriggerDetail(
            triggerDetails,
            this.base.translate(opt.label),
            detailText,
            detailCls,
          );
        }

        if (!canBeConfigured(trig))
          continue;

        // Add beforeSeconds manually for timeline triggers.
        if (trig.isTimelineTrigger) {
          const detailKey = 'beforeSeconds';
          const optionKey = kOptionKeys.beforeSeconds;

          const label = document.createElement('div');
          label.innerText = this.base.translate(kDetailKeys[detailKey].label);
          label.classList.add('trigger-label');
          triggerDetails.appendChild(label);

          const div = document.createElement('div');
          div.classList.add('option-input-container', 'trigger-before-seconds');

          const input = document.createElement('input');
          div.appendChild(input);
          input.type = 'text';
          input.step = 'any';

          // Say "(default)" for more complicated things like functions.
          let defaultValue = this.base.translate(kMiscTranslations.valueDefault);
          if (trig.beforeSeconds === undefined)
            defaultValue = '0';
          else if (typeof trig.beforeSeconds === 'number')
            defaultValue = trig.beforeSeconds.toString();

          input.placeholder = defaultValue;
          input.value = this.base.getStringOption('raidboss', [
            kOptionKeys.triggers,
            trigId,
            optionKey,
          ], '');
          const setFunc = () => {
            const val = validDurationOrUndefined(input.value) || '';
            this.base.setOption('raidboss', [kOptionKeys.triggers, trigId, optionKey], val);
          };
          input.onchange = setFunc;
          input.oninput = setFunc;

          triggerDetails.appendChild(div);
        }

        // Add delay adjust manually, as this isn't a trigger field.
        if (this.base.developerOptions) {
          const detailKey = 'delayAdjust';
          const optionKey = kOptionKeys.delayAdjust;

          const label = document.createElement('div');
          label.innerText = this.base.translate(kDetailKeys[detailKey].label);
          label.classList.add('trigger-label');
          triggerDetails.appendChild(label);

          const div = document.createElement('div');
          div.classList.add('option-input-container', 'trigger-delay-adjust');

          const input = document.createElement('input');
          div.appendChild(input);
          input.type = 'text';
          input.step = 'any';
          input.placeholder = `0`;
          input.value = this.base.getStringOption('raidboss', [
            kOptionKeys.triggers,
            trigId,
            optionKey,
          ], '');
          const setFunc = () => {
            const val = validDelayAdjustOrUndefined(input.value) || '';
            this.base.setOption('raidboss', [kOptionKeys.triggers, trigId, optionKey], val);
          };
          input.onchange = setFunc;
          input.oninput = setFunc;

          triggerDetails.appendChild(div);
        }

        // Add duration manually with an input to override.
        if (hasOutputFunc) {
          const detailKey = 'duration';
          const optionKey = kOptionKeys.duration;

          const label = document.createElement('div');
          label.innerText = this.base.translate(kDetailKeys[detailKey].label);
          label.classList.add('trigger-label');
          triggerDetails.appendChild(label);

          const div = document.createElement('div');
          div.classList.add('option-input-container', 'trigger-duration');

          const input = document.createElement('input');
          div.appendChild(input);
          input.type = 'text';
          input.step = 'any';
          if (typeof trig.durationSeconds === 'number')
            input.placeholder = `${trig.durationSeconds}`;
          else
            input.placeholder = this.base.translate(kMiscTranslations.valueDefault);
          input.value = this.base.getStringOption('raidboss', [
            kOptionKeys.triggers,
            trigId,
            optionKey,
          ], '');
          const setFunc = () => {
            const val = validDurationOrUndefined(input.value) || '';
            this.base.setOption('raidboss', [kOptionKeys.triggers, trigId, optionKey], val);
          };
          input.onchange = setFunc;
          input.oninput = setFunc;

          triggerDetails.appendChild(div);
        }

        // Add output strings manually
        const outputStrings = trig.outputStrings || {};

        for (const [key, outputString] of Object.entries(outputStrings)) {
          const optionKey = kOptionKeys.outputStrings;
          const template = typeof outputString === 'string'
            ? outputString
            : this.base.translate(outputString);

          const label = document.createElement('div');
          label.innerText = key;
          label.classList.add('trigger-outputstring-label');
          triggerDetails.appendChild(label);

          const div = document.createElement('div');
          div.classList.add('option-input-container', 'trigger-outputstring');

          const input = document.createElement('input');
          div.appendChild(input);
          input.type = 'text';
          input.placeholder = template;
          input.value = this.base.getStringOption(
            'raidboss',
            [kOptionKeys.triggers, trigId, optionKey, key],
            '',
          );
          const setFunc = () =>
            this.base.setOption(
              'raidboss',
              [kOptionKeys.triggers, trigId, optionKey, key],
              input.value,
            );
          input.onchange = setFunc;
          input.oninput = setFunc;

          triggerDetails.appendChild(div);
        }

        const label = document.createElement('div');
        triggerDetails.appendChild(label);

        const path = key.split('-');
        const [p0, p1, p2] = path;
        if (p0 !== undefined && p1 !== undefined && p2 !== undefined) {
          const div = document.createElement('div');
          div.classList.add('option-input-container', 'trigger-source');
          const baseUrl = 'https://github.com/OverlayPlugin/cactbot/blob/triggers';
          let urlFilepath;
          if (path.length === 3) {
            // 00-misc/general.js
            urlFilepath = `${p0}-${p1}/${[...path].slice(2).join('-')}`;
          } else {
            // 02-arr/raids/t1.js
            urlFilepath = `${p0}-${p1}/${p2}/${[...path].slice(3).join('-')}`;
          }
          const escapedTriggerId = trigId.replace(/'/g, '\\\'');
          const uriComponent = encodeURIComponent(`id: '${escapedTriggerId}'`).replace(/'/g, '%27');
          const urlString = `${baseUrl}/${urlFilepath}.js#:~:text=${uriComponent}`;
          div.innerHTML = `<a href="${urlString}" target="_blank">(${
            this.base.translate(kMiscTranslations.viewTriggerSource)
          })</a>`;

          triggerDetails.appendChild(div);
        }
      }
    }
  }

  // Build the top level timeline editing expandable container.
  buildTimelineUIContainer(
    zoneId: number,
    set: ConfigLooseTriggerSet,
    parent: HTMLElement,
    options: RaidbossOptions,
  ): void {
    const container = document.createElement('div');
    container.classList.add('timeline-edit-container', 'collapsed');
    parent.appendChild(container);

    let hasEverBeenExpanded = false;

    const headerDiv = document.createElement('div');
    headerDiv.classList.add('timeline-edit-header');
    headerDiv.onclick = () => {
      container.classList.toggle('collapsed');
      // Build the rest of this UI on demand lazily.
      if (!hasEverBeenExpanded) {
        const text = this.timelineTextFromSet(set);
        const timeline = new TimelineParser(text, set.timelineReplace ?? [], [], [], options);
        this.buildTimelineListingUI(timeline, text, container);
        this.buildTimelineAddUI(zoneId, container);
        this.buildTimelineTextUI(zoneId, timeline, container);
      }
      hasEverBeenExpanded = true;
    };
    headerDiv.innerText = this.base.translate(kMiscTranslations.editTimeline);
    container.appendChild(headerDiv);
  }

  timelineTextFromSet(set: ConfigLooseTriggerSet): string {
    let text = '';

    // Recursively turn the timeline array into a string.
    const addTimeline = (obj?: TimelineField) => {
      if (obj === undefined)
        return;
      if (Array.isArray(obj)) {
        for (const objVal of obj)
          addTimeline(objVal);
      } else if (typeof obj === 'function') {
        // Hack, pass blank data in, as we don't have a real data here.
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const blankData: RaidbossData = {} as RaidbossData;
        try {
          addTimeline(obj(blankData));
        } catch (e) {
          // Do nothing if this fails.
          // Functions are pretty uncommon in built-in timelines.
          // If user functions do funky things, those extra lines will be skipped.
        }
      } else if (typeof obj === 'string') {
        text = `${text}\n${obj}`;
      }
    };
    addTimeline(set.timeline);
    return text;
  }

  buildTimelineListingUI(
    timeline: TimelineParser,
    timelineText: string,
    parent: HTMLElement,
  ): void {
    const header = document.createElement('div');
    header.classList.add('timeline-listing-header');
    header.innerText = this.base.translate(kMiscTranslations.timelineListing);
    parent.appendChild(header);

    // Add timeline text itself
    const scroller = document.createElement('div');
    scroller.classList.add('timeline-scroller');
    parent.appendChild(scroller);

    const timelineContents = document.createElement('pre');
    scroller.classList.add('timeline-scroller-contents');
    scroller.appendChild(timelineContents);

    const translated = TimelineParser.Translate(timeline, timelineText);
    timelineContents.innerText = translated.join('\n');
  }

  buildTimelineAddUI(
    zoneId: number,
    parent: HTMLElement,
  ): void {
    const addId = ['timeline', zoneId.toString(), 'add'];

    const header = document.createElement('div');
    header.classList.add('timeline-add-header');
    header.innerText = this.base.translate(kMiscTranslations.addCustomTimelineEntries);
    parent.appendChild(header);

    const container = document.createElement('div');
    container.classList.add('timeline-add-container');
    parent.appendChild(container);

    const headerTime = document.createElement('div');
    headerTime.innerText = this.base.translate(kMiscTranslations.customEntryTime);
    container.appendChild(headerTime);

    const headerText = document.createElement('div');
    headerText.innerText = this.base.translate(kMiscTranslations.customEntryText);
    container.appendChild(headerText);

    const headerDuration = document.createElement('div');
    headerDuration.innerText = this.base.translate(kMiscTranslations.customEntryDuration);
    container.appendChild(headerDuration);

    // Spacer div in the grid for Remove, which needs no header.
    container.appendChild(document.createElement('div'));

    // Get the current SavedConfigEntry for these saved entries.
    // We will modify `rows` in place and then store it back as needed.
    const defaultRow = { time: '', text: '' };
    const defaultValue: SavedConfigEntry = [defaultRow];
    const rowsOrObj = this.base.getJsonOption('raidboss', addId, defaultValue);
    const rows = Array.isArray(rowsOrObj) ? rowsOrObj : defaultValue;

    const storeRows = () => this.base.setJsonOption('raidboss', addId, rows);

    const addRow = (obj: { [name: string]: SavedConfigEntry }): void => {
      const setFunc = () => {
        obj.time = timeInput.value;
        obj.text = textInput.value;
        obj.duration = durationInput.value;
        storeRows();
      };

      const timeInput = document.createElement('input');
      timeInput.type = 'text';
      if (typeof obj.time === 'string')
        timeInput.value = obj.time;
      timeInput.classList.add('timeline-add-row-time');
      timeInput.onchange = setFunc;
      timeInput.oninput = setFunc;
      container.appendChild(timeInput);

      const textInput = document.createElement('input');
      textInput.type = 'text';
      if (typeof obj.text === 'string')
        textInput.value = obj.text;
      textInput.classList.add('timeline-add-row-text');
      textInput.onchange = setFunc;
      textInput.oninput = setFunc;
      container.appendChild(textInput);

      const durationInput = document.createElement('input');
      durationInput.type = 'text';
      if (typeof obj.duration === 'string')
        durationInput.value = obj.duration;
      durationInput.classList.add('timeline-add-row-duration');
      durationInput.onchange = setFunc;
      durationInput.oninput = setFunc;
      container.appendChild(durationInput);

      const remove = document.createElement('button');
      remove.classList.add('timeline-add-row-remove');
      remove.innerText = this.base.translate(kMiscTranslations.customEntryRemove);
      container.appendChild(remove);

      remove.addEventListener('click', () => {
        container.removeChild(timeInput);
        container.removeChild(textInput);
        container.removeChild(durationInput);
        container.removeChild(remove);

        // Update rows in place, as it has been captured by a closure above.
        const idx = rows.indexOf(obj);
        if (idx === -1) {
          console.error(`Failed to remove row`);
          return;
        }
        rows.splice(idx, 1);

        storeRows();
      });
    };

    const addMoreRows = document.createElement('button');
    addMoreRows.classList.add('timeline-add-button');
    addMoreRows.innerText = this.base.translate(kMiscTranslations.addMoreRows);
    addMoreRows.addEventListener('click', () => {
      // No need to call storeRows here.  Blank rows will only get saved
      // if somebody makes other changes.
      const obj = { ...defaultRow };
      rows.push(obj);
      addRow(obj);
    });
    parent.appendChild(addMoreRows);

    for (const row of rows) {
      if (typeof row !== 'object' || Array.isArray(row))
        continue;
      addRow(row);
    }
  }

  buildTimelineTextUI(
    zoneId: number,
    timeline: TimelineParser,
    parent: HTMLElement,
  ): void {
    const container = document.createElement('div');
    container.classList.add('timeline-text-container');
    parent.appendChild(container);

    for (const header of Object.values(kTimelineTableHeaders)) {
      const div = document.createElement('div');
      div.innerText = this.base.translate(header);
      container.appendChild(div);
    }

    const uniqEvents: { [key: string]: string } = {};

    for (const event of timeline.events) {
      if (event.name in uniqEvents)
        continue;
      if (event.name in timeline.ignores)
        continue;
      // name = original timeline text
      // text = replaced text in current language
      uniqEvents[event.name] = event.text;
    }

    const keys = Object.keys(uniqEvents).sort();
    for (const key of keys) {
      const event = uniqEvents[key];
      if (event === undefined)
        continue;

      const checkInput = document.createElement('input');
      checkInput.classList.add('timeline-text-enable');
      checkInput.type = 'checkbox';
      container.appendChild(checkInput);

      // Enable/disable here behaves identically to `hideall "key"`, where this text will
      // not be shown, but timeline triggers related to it will still fire.
      const enableId = ['timeline', zoneId.toString(), 'enable', key];
      const defaultValue = true;
      checkInput.checked = this.base.getBooleanOption('raidboss', enableId, defaultValue);
      checkInput.onchange = () => this.base.setOption('raidboss', enableId, checkInput.checked);

      const timelineText = document.createElement('div');
      timelineText.classList.add('timeline-text-text');
      timelineText.innerHTML = event;
      container.appendChild(timelineText);

      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.classList.add('timeline-text-edit');
      textInput.placeholder = event;

      // Any changes are tied to the original timeline text (key), but the config ui will
      // display the current language's text with replacements (event) as the placeholder above.
      const textId = ['timeline', zoneId.toString(), 'globalReplace', key];
      textInput.value = this.base.getStringOption('raidboss', textId, '');
      const setFunc = () => this.base.setOption('raidboss', textId, textInput.value);
      textInput.onchange = setFunc;
      textInput.oninput = setFunc;

      container.appendChild(textInput);
    }
  }

  // This duplicates the raidboss function of the same name.
  valueOrFunction(
    f: RaidbossTriggerField,
    data: RaidbossData,
    matches: Matches,
    output: Output,
  ): RaidbossTriggerOutput {
    const result = typeof f === 'function' ? f(data, matches, output) : f;
    if (result !== Object(result))
      return result;
    if (typeof result !== 'object' || result === null)
      return result;
    if (result[this.alertsLang] !== undefined)
      return this.valueOrFunction(result[this.alertsLang], data, matches, output);
    if (result[this.timelineLang] !== undefined)
      return this.valueOrFunction(result[this.timelineLang], data, matches, output);
    // For partially localized results where this localization doesn't
    // exist, prefer English over nothing.
    return this.valueOrFunction(result['en'], data, matches, output);
  }

  processTrigger(trig: ConfigLooseTrigger, set: ConfigLooseTriggerSet): ConfigLooseTrigger {
    // TODO: with some hackiness (e.g. regexes?) we could figure out which
    // output string came from which alert type (alarm, alert, info, tts).
    // See `makeOutput` comments for why this needs a type assertion to be an Output.
    const fakeOutputProxy = new DoNothingFuncProxy((outputStrings: OutputStrings) => {
      trig.outputStrings = trig.outputStrings || {};
      Object.assign(trig.outputStrings, outputStrings);
    }) as Output;

    const baseFakeData: RaidbossData = {
      me: '',
      job: 'NONE',
      role: 'none',
      party: new PartyTracker(raidbossOptions),
      lang: this.base.lang,
      currentHP: 1000,
      options: this.base.configOptions,
      inCombat: true,
      triggerSetConfig: {},
      ShortName: (x?: string) => x ?? '???',
      StopCombat: () => {/* noop */},
      ParseLocaleFloat: parseFloat,
      CanStun: () => false,
      CanSilence: () => false,
      CanSleep: () => false,
      CanCleanse: () => false,
      CanFeint: () => false,
      CanAddle: () => false,
      parserLang: this.base.lang,
      displayLang: this.base.lang,
    };

    type PartialFakeDataEntry = { me: string; job: Job; role: Role };
    const partialFakeDataEntries: PartialFakeDataEntry[] = [
      {
        me: 'Tini Poutini',
        job: 'GNB',
        role: 'tank',
      },
      {
        me: 'Potato Chippy',
        job: 'WHM',
        role: 'healer',
      },
      {
        me: 'Tater Tot',
        job: 'BLM',
        role: 'dps',
      },
      {
        me: 'Hash Brown',
        job: 'DRG',
        role: 'dps',
      },
      {
        me: 'Aloo Gobi',
        job: 'BLU',
        role: 'dps',
      },
    ];
    const fakeDataEntries: RaidbossData[] = partialFakeDataEntries.map((x) => {
      return Object.assign({}, x, baseFakeData);
    });
    const firstData = fakeDataEntries[0];
    if (!firstData)
      throw new UnreachableCode();

    const kFakeMatches = {
      // TODO: really should convert all triggers to use regexes.js.
      // Mooooost triggers use matches[1] to be a name.
      1: firstData.me,

      sourceId: '41234567',
      source: 'Enemy',
      id: '1234',
      ability: 'Ability',
      targetId: '1234567',
      target: firstData.me,
      flags: '',
      x: '100',
      y: '100',
      z: '0',
      heading: '0',
      npcId: '',
      effect: 'Effect',
      duration: '30',
      code: '00',
      line: '',
      name: 'Name',
    };

    const output: { [key in keyof LooseTrigger]: string } = {};

    const outputKeys = ['alarmText', 'alertText', 'infoText', 'tts', 'sound'] as const;
    type OutputKey = typeof outputKeys[number];

    // Try to determine some sample output?
    // This could get much more complicated if we wanted it to.
    const evalTrigger = (trig: LooseTrigger, key: OutputKey, data: RaidbossData) => {
      try {
        const result = this.valueOrFunction(trig[key], data, kFakeMatches, fakeOutputProxy);
        if (result === null || result === undefined)
          return false;

        // FIXME: Super hack:
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const resultStr = result.toString();
        if (resultStr.includes('undefined') || resultStr.includes('NaN'))
          return false;

        output[key] = resultStr;
        return true;
      } catch (e) {
        // This is all totally bogus.  Many triggers assume fields on data
        // are properly defined when these calls happen, so will throw errors.
        // So just silently ignore.
        return false;
      }
    };

    // Handle 'response' first.
    if (trig.response) {
      const r = trig.response;
      for (const data of fakeDataEntries) {
        try {
          // Can't use ValueOrFunction here as r returns a non-localizable object.
          // FIXME: this hackily replicates some raidboss logic too.
          let response: typeof trig.response | undefined = r;
          while (typeof response === 'function') {
            // TODO: check if this has builtInResponseStr first.
            response = response(data, kFakeMatches, fakeOutputProxy);
          }
          if (!response)
            continue;

          if (!trig.outputStrings) {
            for (const key of outputKeys)
              evalTrigger(response, key, data);
          }
          break;
        } catch (e) {
          continue;
        }
      }
    }

    // Only evaluate fields if there are not outputStrings.
    // outputStrings will indicate more clearly what the trigger says.
    if (!trig.outputStrings) {
      for (const key of outputKeys) {
        if (!(key in trig))
          continue;
        for (const data of fakeDataEntries) {
          if (evalTrigger(trig, key, data))
            break;
        }
      }
    }

    trig.configOutput = output;

    // TODO: this shows the regexes in the display language.
    // Should we show them in the parser language instead?
    const lang = this.base.lang;

    const getRegex = () => {
      const regex = trig.regex;
      if (regex === undefined)
        return;
      return Regexes.parse(translateRegex(regex, lang, set.timelineReplace));
    };

    const getNetRegex = () => {
      const regex = trig.netRegex;
      if (regex === undefined)
        return;

      if (regex instanceof RegExp)
        return Regexes.parse(translateRegex(regex, lang, set.timelineReplace));

      if (trig.type === undefined)
        return;

      return Regexes.parse(
        buildNetRegexForTrigger(
          trig.type,
          translateRegexBuildParam(regex, lang, set.timelineReplace).params,
        ),
      );
    };

    if (trig.isTimelineTrigger) {
      trig.timelineRegex = getRegex();
    } else {
      trig.triggerRegex = getRegex();
      trig.triggerNetRegex = getNetRegex();
    }

    return trig;
  }

  processRaidbossFiles(
    files: RaidbossFileData,
    userOptions: RaidbossOptions,
  ): ConfigProcessedFileMap<ConfigLooseTriggerSet> {
    // `files` is map of filename => triggerSet (for trigger files)
    // `map` is a sorted map of shortened zone key => { various fields, triggerSet }
    const triggerFiles: { [filename: string]: ConfigLooseTriggerSet } = {};
    const timelineFiles: { [filename: string]: string } = {};
    for (const [filename, triggerSetOrString] of Object.entries(files)) {
      if (typeof triggerSetOrString === 'string')
        timelineFiles[filename] = triggerSetOrString;
      else
        triggerFiles[filename] = triggerSetOrString;
    }

    const map = this.base.processFiles<ConfigLooseTriggerSet>(triggerFiles, userOptions.Triggers);
    let triggerIdx = 0;

    // While walking through triggers, record any previous triggers with the same
    // id so that the ui can disable overriding information.
    const previousTriggerWithId: { [id: string]: ConfigLooseTrigger } = {};

    for (const item of Object.values(map)) {
      // TODO: maybe each trigger set needs a zone name, and we should
      // use that instead of the filename???
      const rawTriggers: { trigger: LooseTrigger[]; timeline: LooseTrigger[] } = {
        trigger: [],
        timeline: [],
      };
      const triggerSet = item.triggerSet;
      if (triggerSet.triggers)
        rawTriggers.trigger.push(...triggerSet.triggers);
      if (triggerSet.timelineTriggers)
        rawTriggers.timeline.push(...triggerSet.timelineTriggers);

      if (!triggerSet.isUserTriggerSet && triggerSet.filename !== undefined)
        flattenTimeline(triggerSet, triggerSet.filename, timelineFiles);

      item.triggers = {};
      for (const [key, triggerArr] of Object.entries(rawTriggers)) {
        for (const baseTrig of triggerArr) {
          const trig: ConfigLooseTrigger = baseTrig;
          triggerIdx++;
          if (trig.id === undefined) {
            // Give triggers with no id some "unique" string so that they can
            // still be added to the set and show up in the ui.
            trig.id = `!!NoIdTrigger${triggerIdx}`;
            trig.isMissingId = true;
          }

          // Track if this trigger overrides any previous trigger.
          const previous = previousTriggerWithId[trig.id];
          if (previous)
            previous.overriddenByFile = triggerSet.filename;
          previousTriggerWithId[trig.id] = trig;

          trig.isTimelineTrigger = key === 'timeline';
          // Also, if a user has two of the same id in the same triggerSet (?!)
          // then only the second trigger will show up.
          item.triggers[trig.id] = this.processTrigger(trig, triggerSet);
        }
      }
    }
    return map;
  }

  buildTriggerOptions(trig: LooseTrigger, labelDiv: HTMLElement) {
    // This shouldn't happen, as all triggers should be processed with a unique id.
    const trigId = trig.id;
    if (trigId === undefined)
      throw new UnreachableCode();

    const optionKey = kOptionKeys.output;
    const div = document.createElement('div');
    div.classList.add('trigger-options');

    const updateLabel = (input: HTMLOptionElement | HTMLSelectElement) => {
      if (input.value === 'hidden' || input.value === 'disabled')
        labelDiv.classList.add('disabled');
      else
        labelDiv.classList.remove('disabled');
    };

    const input = document.createElement('select');
    div.appendChild(input);

    const selectValue = this.base.getOption(
      'raidboss',
      [kOptionKeys.triggers, trigId, optionKey],
      'default',
    );

    for (const [key, opt] of Object.entries(triggerSoundOptions)) {
      // Hide debug only options unless they are selected.
      // Otherwise, it will look weird to pick something like 'Disabled',
      // but then not show it when developer options are turned off.
      if (!this.base.developerOptions && opt.debugOnly && key !== selectValue)
        continue;
      const elem = document.createElement('option');
      elem.innerHTML = this.base.translate(opt.label);
      elem.value = key;
      elem.selected = key === selectValue;
      input.appendChild(elem);

      updateLabel(input);

      input.onchange = () => {
        updateLabel(input);
        let value = input.value;
        if (value.includes('default'))
          value = 'default';
        this.base.setOption('raidboss', [kOptionKeys.triggers, trigId, optionKey], input.value);
      };
    }

    return div;
  }
}

const flattenTimeline = (
  set: ConfigLooseTriggerSet,
  filename: string,
  files: { [filename: string]: string },
) => {
  // Convert set.timelineFile to set.timeline.
  if (set.timelineFile === undefined)
    return;
  const lastIndex = Math.max(filename.lastIndexOf('/'), filename.lastIndexOf('\\'));
  // If lastIndex === -1, truncate name to the empty string.
  // if lastIndex > -1, truncate name after the final slash.
  const dir = filename.slice(0, Math.max(0, lastIndex + 1));

  const timelineFile = `${dir}${set.timelineFile}`;
  delete set.timelineFile;

  if (!(timelineFile in files)) {
    console.log(`ERROR: '${filename}' specifies non-existent timeline file '${timelineFile}'.`);
    return;
  }

  // set.timeline is processed recursively.
  set.timeline = [set.timeline, files[timelineFile]];
};

// Raidboss needs to do some extra processing of user files.
const userFileHandler: UserFileCallback = (
  name: string,
  files: { [filename: string]: string },
  baseOptions: BaseOptions & Partial<RaidbossOptions>,
  basePath: string,
) => {
  // TODO: Rewrite user_config to be templated on option type so that this function knows
  // what type of options it is using.
  if (!baseOptions.Triggers)
    return;

  for (const baseTriggerSet of baseOptions.Triggers) {
    const set: ConfigLooseTriggerSet = baseTriggerSet;

    // Annotate triggers with where they came from.  Note, options is passed in repeatedly
    // as multiple sets of user files add triggers, so only process each file once.
    if (set.isUserTriggerSet)
      continue;

    // `filename` here is just cosmetic for better debug printing to make it more clear
    // where a trigger or an override is coming from.
    set.filename = `${basePath}${name}`;
    set.isUserTriggerSet = true;

    flattenTimeline(set, name, files);
  }
};

const processPerTriggerAutoConfig = (options: RaidbossOptions, savedConfig: SavedConfigEntry) => {
  // raidboss will look up this.options.PerTriggerAutoConfig to find these values.
  const optionName = 'PerTriggerAutoConfig';

  const perTriggerAutoConfig = options[optionName] ??= {};
  if (typeof savedConfig !== 'object' || Array.isArray(savedConfig))
    return;
  const triggers = savedConfig[kOptionKeys.triggers];
  if (typeof triggers !== 'object' || Array.isArray(triggers))
    return;

  const outputObjs: { [key: string]: TriggerAutoConfig } = {};
  const keys = Object.keys(kTriggerOptions);
  for (const key of keys) {
    const obj = outputObjs[key] = {};
    setOptionsFromOutputValue(key, obj);
  }

  for (const [id, entry] of Object.entries(triggers)) {
    if (typeof entry !== 'object' || Array.isArray(entry))
      return;

    const autoConfig: TriggerAutoConfig = {};

    const output = entry[kOptionKeys.output];
    if (typeof output === 'string')
      Object.assign(autoConfig, outputObjs[output]);

    const duration = validDurationOrUndefined(entry[kOptionKeys.duration]);
    if (duration)
      autoConfig[kOptionKeys.duration] = duration;

    const beforeSeconds = validDurationOrUndefined(entry[kOptionKeys.beforeSeconds]);
    if (beforeSeconds)
      autoConfig[kOptionKeys.beforeSeconds] = beforeSeconds;

    const delayAdjustSeconds = validDelayAdjustOrUndefined(entry[kOptionKeys.delayAdjust]);
    if (delayAdjustSeconds)
      autoConfig[kOptionKeys.delayAdjust] = delayAdjustSeconds;

    const outputStrings = entry[kOptionKeys.outputStrings];
    // Validate that the SavedConfigEntry is an an object with string values,
    // which is a subset of the OutputStrings type.
    if (
      ((entry?: SavedConfigEntry): entry is { [key: string]: string } => {
        if (typeof entry !== 'object' || Array.isArray(entry))
          return false;
        for (const value of Object.values(entry)) {
          if (typeof value !== 'string')
            return false;
        }
        return true;
      })(outputStrings)
    )
      autoConfig[kOptionKeys.outputStrings] = outputStrings;

    if (typeof output === 'string' || duration || outputStrings !== undefined)
      perTriggerAutoConfig[id] = autoConfig;
  }
};

const processPerTriggerSetAutoConfig = (
  options: RaidbossOptions,
  savedConfig: SavedConfigEntry,
) => {
  // raidboss will look up this.options.PerTriggerSetAutoConfig to find these values.
  const optionName = 'PerTriggerSetAutoConfig';

  const perTriggerSetAutoConfig = options[optionName] ??= {};
  if (typeof savedConfig !== 'object' || Array.isArray(savedConfig))
    return;
  const triggerSets = savedConfig[kOptionKeys.triggerSets];
  if (typeof triggerSets !== 'object' || Array.isArray(triggerSets))
    return;

  const outputObjs: { [key: string]: TriggerSetAutoConfig } = {};
  const keys = Object.keys(kTriggerOptions);
  for (const key of keys) {
    const obj = outputObjs[key] = {};
    setOptionsFromOutputValue(key, obj);
  }

  for (const [id, entry] of Object.entries(triggerSets)) {
    if (typeof entry !== 'object' || Array.isArray(entry))
      return;

    const output = entry[kOptionKeys.output];
    if (typeof output === 'string')
      perTriggerSetAutoConfig[id] = { ...outputObjs[output] };
  }
};

const processPerZoneTimelineConfig = (options: RaidbossOptions, savedConfig: SavedConfigEntry) => {
  const optionName = 'PerZoneTimelineConfig';
  // SavedConfig uses this key structure:
  // * 'timeline', zoneId (as string), 'enable', text, boolean
  // * 'timeline', zoneId (as string), 'globalReplace', text, string
  // ...and this function transforms it into a `PerZoneTimelineConfig`.

  const perZoneTimelineConfig = options[optionName] ??= {};
  if (typeof savedConfig !== 'object' || Array.isArray(savedConfig))
    return;
  const timeline = savedConfig['timeline'];
  if (typeof timeline !== 'object' || Array.isArray(timeline))
    return;

  for (const [zoneKey, zoneEntry] of Object.entries(timeline)) {
    const zoneId = parseInt(zoneKey);
    if (!zoneId)
      continue;
    const timelineConfig = perZoneTimelineConfig[zoneId] ??= {};

    if (typeof zoneEntry !== 'object' || Array.isArray(zoneEntry))
      continue;

    const enableEntry = zoneEntry['enable'];
    const replaceEntry = zoneEntry['globalReplace'];
    const addEntry = zoneEntry['add'];

    if (typeof enableEntry === 'object' && !Array.isArray(enableEntry)) {
      for (const [key, value] of Object.entries(enableEntry)) {
        if (typeof value === 'boolean' && !value)
          (timelineConfig.Ignore ??= []).push(key);
      }
    }

    if (typeof replaceEntry === 'object' && !Array.isArray(replaceEntry)) {
      for (const [key, value] of Object.entries(replaceEntry)) {
        if (typeof value === 'string')
          (timelineConfig.Rename ??= {})[key] = value;
      }
    }

    if (addEntry !== undefined && typeof addEntry === 'object' && Array.isArray(addEntry)) {
      for (const row of addEntry) {
        if (typeof row !== 'object' || Array.isArray(row))
          continue;
        const time = typeof row.time === 'string' ? parseFloat(row.time) : NaN;
        const text = typeof row.text === 'string' ? row.text : '';
        const durationOrNaN = typeof row.duration === 'string' ? parseFloat(row.duration) : NaN;
        const duration = isNaN(durationOrNaN) ? undefined : durationOrNaN;

        if (text.trim() === '' || isNaN(time))
          continue;

        (timelineConfig.Add ??= []).push({ time, text, duration });
      }
    }
  }
};

const processTriggerSetConfig = (options: RaidbossOptions, savedConfig: SavedConfigEntry) => {
  // Note: this function is just for providing the raw values for TriggerSetConfig.
  // popuptext handles the loading of triggersets at runtime (maybe this should be merged?)
  // and so it has to do the work of using this info to set defaults, apply overrides, and
  // run setter functions via `processOptions`.
  const optionName = 'TriggerSetConfig';
  const outputTriggerSetConfig = options[optionName] ??= {};
  if (typeof savedConfig !== 'object' || Array.isArray(savedConfig))
    return;

  // raidboss > TriggerSetConfig > [triggerSetId] > [key] > [leaf ConfigValue]
  const triggerSetConfig = savedConfig[kOptionKeys.triggerSetConfig];
  if (
    triggerSetConfig === undefined || typeof triggerSetConfig !== 'object' ||
    Array.isArray(triggerSetConfig)
  )
    return;

  for (const [triggerSetId, configDict] of Object.entries(triggerSetConfig)) {
    if (typeof configDict !== 'object' || Array.isArray(configDict))
      continue;

    for (const [key, value] of Object.entries(configDict)) {
      if (typeof value !== 'boolean' && typeof value !== 'string' && typeof value !== 'number')
        continue;
      (outputTriggerSetConfig[triggerSetId] ??= {})[key] = value;
    }
  }
};

// Reused for both top level UI and trigger set config UI.
const defaultAlertOutput: ConfigEntry = {
  id: 'DefaultAlertOutput',
  name: {
    en: 'Default alert output',
    de: 'Standard Alert Ausgabe',
    fr: 'Alerte par défaut',
    ja: '警告情報出力既定値',
    cn: '默认触发器提示输出模式',
    ko: '기본 알람 출력 방식',
    tc: '默認觸發器提示輸出模式',
  },
  type: 'select',
  options: {
    en: {
      '🆙🔊 Text and Sound': 'textAndSound',
      '🆙💬 Text and TTS': 'ttsAndText',
      '💬 TTS Only': 'ttsOnly',
      '🆙 Text Only': 'textOnly',
      '❌ Disabled': 'disabled',
    },
    de: {
      '🆙🔊 Text und Ton': 'textAndSound',
      '🆙💬 Text und TTS': 'ttsAndText',
      '💬 Nur TTS': 'ttsOnly',
      '🆙 Nur Text': 'textOnly',
      '❌ Deaktiviert': 'disabled',
    },
    fr: {
      '🆙🔊 Texte et son': 'textAndSound',
      '🆙💬 Texte et TTS': 'ttsAndText',
      '💬 TTS seulement': 'ttsOnly',
      '🆙 Texte seulement': 'textOnly',
      '❌ Désactivé': 'disabled',
    },
    ja: {
      '🆙🔊 テキストと音声': 'textAndSound',
      '🆙💬 テキストとTTS': 'ttsAndText',
      '💬 TTSのみ': 'ttsOnly',
      '🆙 テキストのみ': 'textOnly',
      '❌ 無効': 'disabled',
    },
    cn: {
      '🆙🔊 文本显示与提示音': 'textAndSound',
      '🆙💬 文本显示与TTS': 'ttsAndText',
      '💬 只使用TTS': 'ttsOnly',
      '🆙 只使用文本显示': 'textOnly',
      '❌ 禁用': 'disabled',
    },
    ko: {
      '🆙🔊 텍스트와 소리': 'textAndSound',
      '🆙💬 텍스트와 TTS': 'ttsAndText',
      '💬 TTS만': 'ttsOnly',
      '🆙 텍스트만': 'textOnly',
      '❌ 비활성화': 'disabled',
    },
    tc: {
      '🆙🔊 文本顯示與提示音': 'textAndSound',
      '🆙💬 文本顯示與TTS': 'ttsAndText',
      '💬 只使用TTS': 'ttsOnly',
      '🆙 只使用文本顯示': 'textOnly',
      '❌ 禁用': 'disabled',
    },
  },
  default: 'textAndSound',
  setterFunc: setOptionsFromOutputValue,
} as const;

const defaultTriggerSetAlertOutput = {
  ...defaultAlertOutput,
  name: {
    en: 'Default trigger set alert output',
    de: 'Standard trigger-Set Alert Ausgabe',
    fr: 'Sortie par défaut des déclencheurs',
    ja: '基本トリガーセットの通知方法',
    cn: '默认触发器集合提示输出模式',
    ko: '기본 트리거 세트 알람 출력 방식',
    tc: '默認觸發器集合提示輸出模式',
  },
} as const;

const templateOptions: OptionsTemplate = {
  buildExtraUI: (base, container) => {
    const builder = new RaidbossConfigurator(base);
    const userOptions = { ...raidbossOptions };
    UserConfig.loadUserFiles('raidboss', userOptions, () => {
      builder.buildUI(container, raidbossFileData, userOptions);
    }, false);
  },
  processExtraOptions: (baseOptions, savedConfig) => {
    // TODO: Rewrite user_config to be templated on option type so that this function knows
    // what type of options it is using.  Without this, perTriggerAutoConfig is unknown.
    const options = baseOptions as RaidbossOptions;

    processPerTriggerAutoConfig(options, savedConfig);
    processPerTriggerSetAutoConfig(options, savedConfig);
    processPerZoneTimelineConfig(options, savedConfig);
    processTriggerSetConfig(options, savedConfig);
  },
  options: [
    {
      id: 'Coverage',
      name: {
        en: 'Supported content (latest version)',
        de: 'Unterstützte Inhalte (aktuellste Version)',
        fr: 'Contenu supporté (dernière version)',
        ja: '対応コンテンツ一覧 (最新バージョン)',
        cn: '支持副本一览 (含未发布更新)',
        ko: '지원하는 컨텐츠 (릴리즈버전보다 최신)',
        tc: '支持副本一覽 (含未發布更新)',
      },
      type: 'html',
      html: {
        // TODO: it'd be nice if OverlayPlugin could open links on the system outside of ACT.
        en: makeLink('https://overlayplugin.github.io/cactbot/util/coverage/coverage.html?lang=en'),
        de: makeLink('https://overlayplugin.github.io/cactbot/util/coverage/coverage.html?lang=de'),
        fr: makeLink('https://overlayplugin.github.io/cactbot/util/coverage/coverage.html?lang=fr'),
        ja: makeLink('https://overlayplugin.github.io/cactbot/util/coverage/coverage.html?lang=ja'),
        cn: makeLink('https://overlayplugin.github.io/cactbot/util/coverage/coverage.html?lang=cn'),
        ko: makeLink('https://overlayplugin.github.io/cactbot/util/coverage/coverage.html?lang=ko'),
        tc: makeLink('https://overlayplugin.github.io/cactbot/util/coverage/coverage.html?lang=tc'),
      },
      default: makeLink(
        'https://overlayplugin.github.io/cactbot/util/coverage/coverage.html?lang=en',
      ),
    },
    {
      id: 'Debug',
      name: {
        en: 'Enable debug mode',
        de: 'Aktiviere Debugmodus',
        fr: 'Activer le mode debug',
        ja: 'デバッグモードを有効にする',
        cn: '启用调试模式',
        ko: '디버그 모드 활성화',
        tc: '啟用除錯模式',
      },
      type: 'checkbox',
      debugOnly: true,
      default: false,
    },
    defaultAlertOutput,
    {
      id: 'AlertsLanguage',
      name: {
        en: 'Alerts language',
        de: 'Alert Sprache',
        fr: 'Langue des alertes',
        ja: '警告情報の言語',
        cn: '触发器提示语言',
        ko: '알람 언어',
        tc: '觸發器提示語言',
      },
      type: 'select',
      options: {
        en: {
          'Use Display Language': 'default',
          'English (en)': 'en',
          'Chinese (cn)': 'cn',
          'German (de)': 'de',
          'French (fr)': 'fr',
          'Japanese (ja)': 'ja',
          'Korean (ko)': 'ko',
          'Traditional Chinese (tc)': 'tc',
        },
        de: {
          'Anzeigesprache verwenden': 'default',
          'Englisch (en)': 'en',
          'Chinesisch (cn)': 'cn',
          'Deutsch (de)': 'de',
          'Französisch (fr)': 'fr',
          'Japanisch (ja)': 'ja',
          'Koreanisch (ko)': 'ko',
          'Traditionelles Chinesisch (tc)': 'tc',
        },
        fr: {
          'Utiliser la langue d\'affichage': 'default',
          'Anglais (en)': 'en',
          'Chinois (cn)': 'cn',
          'Allemand (de)': 'de',
          'Français (fr)': 'fr',
          'Japonais (ja)': 'ja',
          'Coréen (ko)': 'ko',
          'Chinois traditionnel (tc)': 'tc',
        },
        ja: {
          '表示言語既定値': 'default',
          '英語 (en)': 'en',
          '中国語 (cn)': 'cn',
          'ドイツ語 (de)': 'de',
          'フランス語 (fr)': 'fr',
          '日本語 (ja)': 'ja',
          '韓国語 (ko)': 'ko',
          '繁体字中国語 (tc)': 'tc',
        },
        cn: {
          '使用显示语言': 'default',
          '英文 (en)': 'en',
          '中文 (cn)': 'cn',
          '德文 (de)': 'de',
          '法文 (fr)': 'fr',
          '日文 (ja)': 'ja',
          '韩文 (ko)': 'ko',
          '繁体中文 (tc)': 'tc',
        },
        ko: {
          '주 사용 언어 사용': 'default',
          '영어 (en)': 'en',
          '중국어 (cn)': 'cn',
          '독일어 (de)': 'de',
          '프랑스어 (fr)': 'fr',
          '일본어 (ja)': 'ja',
          '한국어 (ko)': 'ko',
          '중국어 번체 (tc)': 'tc',
        },
        tc: {
          '使用顯示語言': 'default',
          '英文 (en)': 'en',
          '中文 (cn)': 'cn',
          '德文 (de)': 'de',
          '法文 (fr)': 'fr',
          '日文 (ja)': 'ja',
          '韓文 (ko)': 'ko',
          '繁體中文 (tc)': 'tc',
        },
      },
      default: 'default',
      debug: true,
      setterFunc: (value) => {
        if (typeof value !== 'string')
          return;
        if (value === 'default')
          return;
        return value;
      },
    },
    {
      id: 'TimelineLanguage',
      name: {
        en: 'Timeline language',
        de: 'Timeline Sprache',
        fr: 'Langue de la timeline',
        ja: 'タイムラインの言語',
        cn: '时间轴文本的语言',
        ko: '타임라인 언어',
        tc: '時間軸文本的語言',
      },
      type: 'select',
      options: {
        en: {
          'Use FFXIV Plugin Language': 'default',
          'English (en)': 'en',
          'Chinese (cn)': 'cn',
          'German (de)': 'de',
          'French (fr)': 'fr',
          'Japanese (ja)': 'ja',
          'Korean (ko)': 'ko',
        },
        de: {
          'Benutze FFXIV Plugin Sprache': 'default',
          'Englisch (en)': 'en',
          'Chinesisch (cn)': 'cn',
          'Deutsch (de)': 'de',
          'Französisch (fr)': 'fr',
          'Japanisch (ja)': 'ja',
          'Koreanisch (ko)': 'ko',
        },
        fr: {
          'Utiliser la langue du Plugin FFXIV': 'default',
          'Anglais (en)': 'en',
          'Chinois (cn)': 'cn',
          'Allemand (de)': 'de',
          'Français (fr)': 'fr',
          'Japonais (ja)': 'ja',
          'Coréen (ko)': 'ko',
        },
        ja: {
          'FFXIV Pluginの言語設定': 'default',
          '英語 (en)': 'en',
          '中国語 (cn)': 'cn',
          'ドイツ語 (de)': 'de',
          'フランス語 (fr)': 'fr',
          '日本語 (ja)': 'ja',
          '韓国語 (ko)': 'ko',
        },
        cn: {
          '使用最终幻想XIV解析插件设置的语言': 'default',
          '英文 (en)': 'en',
          '中文 (cn)': 'cn',
          '德文 (de)': 'de',
          '法文 (fr)': 'fr',
          '日文 (ja)': 'ja',
          '韩文 (ko)': 'ko',
          '繁体中文 (tc)': 'tc',
        },
        ko: {
          'FFXIV Plugin 언어 사용': 'default',
          '영어 (en)': 'en',
          '중국어 (cn)': 'cn',
          '독일어 (de)': 'de',
          '프랑스어 (fr)': 'fr',
          '일본어 (ja)': 'ja',
          '한국어 (ko)': 'ko',
        },
        tc: {
          '使用最終幻想XIV解析插件設置的語言': 'default',
          '英文 (en)': 'en',
          '中文 (cn)': 'cn',
          '德文 (de)': 'de',
          '法文 (fr)': 'fr',
          '日文 (ja)': 'ja',
          '韓文 (ko)': 'ko',
          '繁体中文 (tc)': 'tc',
        },
      },
      default: 'default',
      debug: true,
      setterFunc: (value) => {
        if (typeof value !== 'string')
          return;
        if (value === 'default')
          return;
        return value;
      },
    },
    {
      id: 'Skin',
      name: {
        en: 'Raidboss Skin',
        de: 'Raidboss Skin',
        fr: 'Raidboss Skin',
        ja: 'Raidbossのスキン',
        cn: 'Raidboss皮肤',
        ko: 'Raidboss 스킨',
        tc: 'Raidboss皮膚',
      },
      type: 'select',
      options: {
        en: {
          'Default': 'default',
          'lippe': 'lippe',
          'jwidea': 'jwidea',
          'dorgrin': 'dorgrin',
        },
        de: {
          'Default': 'default',
          'lippe': 'lippe',
          'jwidea': 'jwidea',
          'dorgrin': 'dorgrin',
        },
        fr: {
          'Défaut': 'default',
          'lippe': 'lippe',
          'jwidea': 'jwidea',
          'dorgrin': 'dorgrin',
        },
        ja: {
          '初期設定': 'default',
          'lippe': 'lippe',
          'jwidea': 'jwidea',
          'dorgrin': 'dorgrin',
        },
        cn: {
          '默认': 'default',
          'lippe': 'lippe',
          'jwidea': 'jwidea',
          'dorgrin': 'dorgrin',
        },
        ko: {
          '기본': 'default',
          'lippe': 'lippe',
          'jwidea': 'jwidea',
          'dorgrin': 'dorgrin',
        },
        tc: {
          '默認': 'default',
          'lippe': 'lippe',
          'jwidea': 'jwidea',
          'dorgrin': 'dorgrin',
        },
      },
      default: 'default',
    },
    {
      id: 'TimelineEnabled',
      name: {
        en: 'Timeline enabled',
        de: 'Timeline aktiviert',
        fr: 'Timeline activée',
        ja: 'タイムラインを有効にする',
        cn: '启用时间轴',
        ko: '타임라인 활성화',
        tc: '啟用時間軸',
      },
      type: 'checkbox',
      default: true,
    },
    {
      id: 'AlertsEnabled',
      name: {
        en: 'Alerts enabled',
        de: 'Alerts aktiviert',
        fr: 'Alertes activées',
        ja: '警告情報を有効にする',
        cn: '启用触发器提示',
        ko: '알람 활성화',
        tc: '啟用觸發器提示',
      },
      type: 'checkbox',
      default: true,
    },
    {
      id: 'ReverseTimeline',
      name: {
        en: 'Reverse timeline order (bottom-to-top)',
        de: 'Umgekehrte Timeline Reihenfolge (unten-nach-oben)',
        fr: 'Timeline inversée (de bas en haut)',
        ja: 'タイムラインを下から表示',
        cn: '反转时间轴顺序 (从下到上)',
        ko: '타임라인 순서 반전 (아래에서 위)',
        tc: '反轉時間軸順序 (從下到上)',
      },
      type: 'checkbox',
      default: false,
    },
    {
      id: 'DefaultPlayerLabel',
      comment: {
        en: `The default way to specify players in trigger output. By default, it will use
             nicknames/first names. This can be used to print out player jobs instead.
             If you are not in a party or players are out of a party (or there are bugs),
             it will default to the player's nickname if there's no other information.`,
        de: `Die Standardmethode zur Angabe von Spielern in der Triggerausgabe. Standardmäßig werden
             Spitznamen/Vornamen verwendet. Dies kann verwendet werden, um stattdessen Spieler-Jobs darzustellen.
             Wenn Sie nicht in einer Gruppe sind oder Spieler nicht in einer Gruppe sind (oder es Fehler gibt),
             wird standardmäßig der Spitzname des Spielers verwendet, wenn es keine anderen Informationen gibt.`,
        fr: `Méthode par défaut pour afficher les joueurs lors des annonces. Par défaut,
             on utilise surnom/prénom. Vous pouvez afficher les jobs à la place.
             Si vous n'êtes pas dans une équipe ou si des joueurs sont déconnectés (ou s'il y a des bugs),
             on bascule l'affichage sur le surnom s'il n'y a pas d'autres informations.`,
        ja: `トリガーでプレイヤーの名前を表示する方法です。基本であだ名・ファストネームをつかいます。
             あなたがパティに入ってない場合とパティ以外のプレイヤーはあだ名とファストネームが表示されます。`,
        cn: `在触发器输出中指定玩家的默认方式。默认选项为输出昵称/名字。
             使用此选项可将输出方式更改为玩家的职能名或职业名。
             若你不在小队中或玩家离开小队 (或出现错误时), 将默认输出玩家昵称。
             (注：国服对于昵称和全名不做区分)`,
        ko: `트리거 출력에서 플레이어를 언급하는 방법입니다. 기본값으로 닉네임/이름을 사용합니다.
             이 옵션은 이름 대신 플레이어의 직업이나 역할을 출력하고 싶을 때 사용할 수 있습니다.
             당신이 파티에 있지 않거나 파티 밖에 있는 플레이어에 대해서는
             기본값인 플레이어의 닉네임이 사용됩니다.
             (한국 서버에서 '이름 전체' 옵션은 '닉네임'과 같습니다.)`,
        tc: `在觸發器輸出中指定玩家的默認方式。默認選項為輸出暱稱/名字。
             使用此選項可將輸出方式更改為玩家的職能名或職業名。
             若你不在小隊中或玩家離開小隊 (或出現錯誤時), 將默認輸出玩家暱稱。
             (註：繁中服對於暱稱和全名不做區分)`,
      },
      name: {
        en: 'Default Player Label',
        de: 'Standard Spieler Label',
        fr: 'Affichage par défaut des joueurs',
        ja: '基本プレイヤーラベル',
        cn: '默认玩家代称',
        ko: '플레이어를 언급하는 기본 방법',
        tc: '默認玩家代稱',
      },
      type: 'select',
      options: {
        en: {
          'Nickname (Tini)': 'nick',
          'Role (Tank)': 'role',
          'Job (WAR)': 'job',
          'Full Job (Warrior)': 'jobFull',
          'Full Name (Tini Poutini)': 'name',
        },
        de: {
          'Spitzname (Tini)': 'nick',
          'Rolle (Tank)': 'role',
          'Job (WAR)': 'job',
          'Job ausgeschrieben (Warrior)': 'jobFull',
          'Kompletter Name (Tini Poutini)': 'name',
        },
        fr: {
          'Surnom (Tini)': 'nick',
          'Rôle (Tank)': 'role',
          'Job (WAR)': 'job',
          'Job complet (Warrior)': 'jobFull',
          'Nom complet (Tini Poutini)': 'name',
        },
        ja: {
          'あだ名 (Tini)': 'nick',
          'ロール (ヒーラー)': 'role',
          '簡略ジョブ (白魔)': 'job',
          'ジョブ (白魔導士)': 'jobFull',
          '名前 (Tini Poutini)': 'name',
        },
        cn: {
          '昵称 (弗雷)': 'nick',
          '职能 (坦克)': 'role',
          '职业简称 (暗骑)': 'job',
          '职业全称 (暗黑骑士)': 'jobFull',
          '全名 (弗雷)': 'name',
        },
        ko: {
          '닉네임 (Tini)': 'nick',
          '역할 (탱커)': 'role',
          '직업 (암기)': 'job',
          '직업 전체 (암흑기사)': 'jobFull',
          '이름 전체 (Tini Poutini)': 'name',
        },
        tc: {
          '暱稱 (弗雷)': 'nick',
          '職能 (坦克)': 'role',
          '職業簡稱 (暗騎)': 'job',
          '職業全稱 (暗黑騎士)': 'jobFull',
          '全名 (弗雷)': 'name',
        },
      },
      default: 'nick',
    },
    {
      id: 'ShowTimerBarsAtSeconds',
      name: {
        en: 'Timer bar show window (seconds)',
        de: 'Timer-Bar Anzeigedauer (in Sekunden)',
        fr: 'Fenêtre d\'affichage de la barre de temps (secondes)',
        ja: 'タイムバーに時間表示 (秒)',
        cn: '计时条显示时长 (秒)',
        ko: '타임라인을 표시할 기준 시간 (초 이하)',
        tc: '計時條顯示時長 (秒)',
      },
      type: 'float',
      default: 30,
    },
    {
      id: 'KeepExpiredTimerBarsForSeconds',
      name: {
        en: 'Keep expired timer bar (seconds)',
        de: 'Behalte abgelaufene Timer-Bar (in Sekunden)',
        fr: 'Garder la barre de temps expirée (secondes)',
        ja: '終了したタイムバーが消えるまでの待ち時間 (秒)',
        cn: '归零计时条滞留时长 (秒)',
        ko: '만료된 타임라인이 사라지기까지의 시간 (초)',
        tc: '歸零計時條滯留時長 (秒)',
      },
      type: 'float',
      default: 0.7,
    },
    {
      id: 'BarExpiresSoonSeconds',
      name: {
        en: 'Time to recolor timer as expiring soon (seconds)',
        de: 'Zeit bis ein bald auslaufender Timer umgefärbt wird (in Sekunden)',
        fr: 'Recolorisation de la barre de temps avant expiration (secondes)',
        ja: 'タイムバーが終了前に再度色付けの残り時間 (秒)',
        cn: '倒计时小于该值时当前计时条变色 (秒)',
        ko: '타임라인의 색상을 바꿀 기준 시간 (초 이하)',
        tc: '倒數計時小於該值時當前計時條變色 (秒)',
      },
      type: 'integer',
      default: 6,
    },
    {
      id: 'MaxNumberOfTimerBars',
      name: {
        en: 'Max number of timer bars',
        de: 'Max Anzahl an Timer-Bars',
        fr: 'Nombre max de barres de temps',
        ja: 'タイムバーの最大数',
        cn: '计时条最大数量',
        ko: '표시할 타임라인의 최대 개수',
        tc: '計時條最大數量',
      },
      type: 'integer',
      default: 6,
    },
    {
      id: 'DisplayAlarmTextForSeconds',
      name: {
        en: 'Alarm text display duration (seconds)',
        de: 'Alarm-Text Anzeigedauer (in Sekunden)',
        fr: 'Durée d\'affichage du texte d\'alarme (secondes)',
        ja: '警報テキスト表示時間の長さ (秒)',
        cn: '致命级提示文本显示时长 (秒)',
        ko: '경고 텍스트를 표시할 시간 (초)',
        tc: '致命級提示文本顯示時長 (秒)',
      },
      type: 'float',
      default: 3,
    },
    {
      id: 'DisplayAlertTextForSeconds',
      name: {
        en: 'Alert text display duration (seconds)',
        de: 'Alert-Text Anzeigedauer (in Sekunden)',
        fr: 'Durée d\'affichage du texte d\'alerte (secondes)',
        ja: '警告テキスト表示時間の長さ (秒)',
        cn: '严重级提示文本显示时长 (秒)',
        ko: '주의 텍스트를 표시할 시간 (초)',
        tc: '嚴重級提示文本顯示時長 (秒)',
      },
      type: 'float',
      default: 3,
    },
    {
      id: 'DisplayInfoTextForSeconds',
      name: {
        en: 'Info text display duration (seconds)',
        de: 'Info-Text Anzeigedauer (in Sekunden)',
        fr: 'Durée d\'affichage du texte d\'information (secondes)',
        ja: '情報テキスト表示時間の長さ (秒)',
        cn: '一般级提示文本显示时长 (秒)',
        ko: '안내 텍스트를 표시할 시간 (초)',
        tc: '一般級提示文本顯示時長 (秒)',
      },
      type: 'float',
      default: 3,
    },
    {
      id: 'AlarmSoundVolume',
      name: {
        en: 'Alarm sound volume (0-1)',
        de: 'Alarm Lautstärke (0-1)',
        fr: 'Volume de l\'alarme (0-1)',
        ja: '警報音声の音量 (0-1)',
        cn: '致命级提示音量 (0-1)',
        ko: '경고 소리 크기 (0-1)',
        tc: '致命級提示音量 (0-1)',
      },
      type: 'float',
      default: 1,
    },
    {
      id: 'AlertSoundVolume',
      name: {
        en: 'Alert sound volume (0-1)',
        de: 'Alert Lautstärke (0-1)',
        fr: 'Volume de l\'alerte (0-1)',
        ja: '警告音声の音量 (0-1)',
        cn: '严重级提示音量 (0-1)',
        ko: '주의 소리 크기 (0-1)',
        tc: '嚴重級提示音量 (0-1)',
      },
      type: 'float',
      default: 1,
    },
    {
      id: 'InfoSoundVolume',
      name: {
        en: 'Info sound volume (0-1)',
        de: 'Info Lautstärke (0-1)',
        fr: 'Volume de l\'info (0-1)',
        ja: '情報音声の音量 (0-1)',
        cn: '一般级提示音量 (0-1)',
        ko: '안내 소리 크기 (0-1)',
        tc: '一般級提示音量 (0-1)',
      },
      type: 'float',
      default: 1,
    },
    {
      id: 'LongSoundVolume',
      name: {
        en: 'Long sound volume (0-1)',
        de: 'Langer Ton Lautstärke (0-1)',
        fr: 'Volume du son long (0-1)',
        ja: '長い音声の音量 (0-1)',
        cn: '长提示音量 (0-1)',
        ko: '긴 소리 크기 (0-1)',
        tc: '長提示音量 (0-1)',
      },
      type: 'float',
      default: 1,
    },
    {
      id: 'PullSoundVolume',
      name: {
        en: 'Pull sound volume (0-1)',
        de: 'Pull Lautstärke (0-1)',
        fr: 'Volume du son de pull (0-1)',
        ja: 'タゲ取る効果音の音量 (0-1)',
        cn: '开怪提示音量 (0-1)',
        ko: '풀링 소리 크기 (0-1)',
        tc: '開怪提示音量 (0-1)',
      },
      type: 'float',
      default: 1,
    },
    {
      id: 'RumbleEnabled',
      name: {
        en: 'Enable gamepad rumble for triggers',
        de: 'Gamepad-Vibration für Trigger aktivieren',
        fr: 'Activer la vibration de la manette de jeu pour les triggers',
        ja: 'トリガーによるゲームパッド振動を有効にする',
        cn: '触发器活动时使手柄振动',
        ko: '트리거에 대해 게임패드 진동 활성화',
        tc: '觸發器活動時使手把振動',
      },
      type: 'checkbox',
      default: false,
    },
    {
      id: 'InfoRumbleDuration',
      name: {
        en: 'Duration (milliseconds) of rumble for info triggers',
        de: 'Zeit (in Millisekunden) der Vibration bei info trigger',
        fr: 'Durée (millisecondes) de la vibration pour les triggers d\'informations',
        ja: '情報トリガーによる振動の長さ (ミリ秒)',
        cn: '一般级触发器振动时长 (毫秒)',
        ko: '안내 트리거의 진동 지속 시간 (밀리초)',
        tc: '一般級觸發器振動時長 (毫秒)',
      },
      type: 'float',
      default: 400,
    },
    {
      id: 'InfoRumbleWeak',
      name: {
        en: 'Magnitude (0-1) of weak rumble for info triggers',
        de: 'Stärke (0-1) der leichten Vibration bei info trigger',
        fr: 'Intensité de la vibration faible pour les triggers d\'informations (0-1)',
        ja: '情報トリガーによる振動にモーターの弱い方の強さ (0-1)',
        cn: '一般级触发器弱电机振动强度 (0-1)',
        ko: '안내 트리거의 약한 진동 세기 (0-1)',
        tc: '一般級觸發器弱電機振動強度 (0-1)',
      },
      type: 'float',
      default: 0.5,
    },
    {
      id: 'InfoRumbleStrong',
      name: {
        en: 'Magnitude (0-1) of strong rumble for info triggers',
        de: 'Stärke (0-1) der starken Vibration bei info trigger',
        fr: 'Intensité de la vibration forte pour les triggers d\'informations (0-1)',
        ja: '情報トリガーによる振動にモーターの強い方の強さ (0-1)',
        cn: '一般级触发器强电机振动强度 (0-1)',
        ko: '안내 트리거의 강한 진동 세기 (0-1)',
        tc: '一般級觸發器強電機振動強度 (0-1)',
      },
      type: 'float',
      default: 0,
    },
    {
      id: 'AlertRumbleDuration',
      name: {
        en: 'Duration (milliseconds) of rumble for alert triggers',
        de: 'Zeit (in Millisekunden) der Vibration bei alert trigger',
        fr: 'Durée (millisecondes) de la vibration pour les triggers d\'alertes',
        ja: '警告トリガーによる振動の長さ (ミリ秒)',
        cn: '严重级触发器振动时长 (毫秒)',
        ko: '주의 트리거의 진동 지속 시간 (밀리초)',
        tc: '嚴重級觸發器振動時長 (毫秒)',
      },
      type: 'float',
      default: 500,
    },
    {
      id: 'AlertRumbleWeak',
      name: {
        en: 'Magnitude (0-1) of weak rumble for alert triggers',
        de: 'Stärke (0-1) der leichten Vibration bei alert trigger',
        fr: 'Intensité de la vibration faible pour les triggers d\'alertes (0-1)',
        ja: '警告トリガーによる振動にモーターの弱い方の強さ (0-1)',
        cn: '严重级触发器弱电机振动强度 (0-1)',
        ko: '주의 트리거의 약한 진동 세기 (0-1)',
        tc: '嚴重級觸發器弱電機振動強度 (0-1)',
      },
      type: 'float',
      default: 0,
    },
    {
      id: 'AlertRumbleStrong',
      name: {
        en: 'Magnitude (0-1) of strong rumble for alert triggers',
        de: 'Stärke (0-1) der starken Vibration bei alert trigger',
        fr: 'Intensité de la vibration forte pour les triggers d\'alertes (0-1)',
        ja: '警告トリガーによる振動にモーターの強い方の強さ (0-1)',
        cn: '严重级触发器强电机振动强度 (0-1)',
        ko: '주의 트리거의 강한 진동 세기 (0-1)',
        tc: '嚴重級觸發器強電機振動強度 (0-1)',
      },
      type: 'float',
      default: 0.5,
    },
    {
      id: 'AlarmRumbleDuration',
      name: {
        en: 'Duration (milliseconds) of rumble for alarm triggers',
        de: 'Zeit (in Millisekunden) der Vibration bei alarm trigger',
        fr: 'Durée (millisecondes) de la vibration pour les triggers d\'alarmes',
        ja: '警報トリガーによる振動の長さ (ミリ秒)',
        cn: '致命级触发器振动时长 (毫秒)',
        ko: '경고 트리거의 진동 지속 시간 (밀리초)',
        tc: '致命級觸發器振動時長 (毫秒)',
      },
      type: 'float',
      default: 750,
    },
    {
      id: 'AlarmRumbleWeak',
      name: {
        en: 'Magnitude (0-1) of weak rumble for alarm triggers',
        de: 'Stärke (0-1) der leichten Vibration bei alarm trigger',
        fr: 'Intensité de la vibration faible pour les triggers d\'alarmes (0-1)',
        ja: '警報トリガーによる振動にモーターの弱い方の強さ (0-1)',
        cn: '致命级触发器弱电机振动强度 (0-1)',
        ko: '경고 트리거의 약한 진동 세기 (0-1)',
        tc: '致命級觸發器弱電機振動強度 (0-1)',
      },
      type: 'float',
      default: 0.75,
    },
    {
      id: 'AlarmRumbleStrong',
      name: {
        en: 'Magnitude (0-1) of strong rumble for alarm triggers',
        de: 'Stärke (0-1) der starken Vibration bei alarm trigger',
        fr: 'Intensité de la vibration forte pour les triggers d\'alarmes (0-1)',
        ja: '警報トリガーによる振動にモーターの強い方の強さ (0-1)',
        cn: '致命级触发器强电机振动强度 (0-1)',
        ko: '경고 트리거의 강한 진동 세기 (0-1)',
        tc: '致命級觸發器強電機振動強度 (0-1)',
      },
      type: 'float',
      default: 0.75,
    },
  ],
};

UserConfig.registerOptions('raidboss', templateOptions, userFileHandler);
