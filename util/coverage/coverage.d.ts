import { Lang } from '../../resources/languages';
import { LocaleText } from '../../types/trigger';
import { MissingTranslationErrorType } from '../find_missing_translations';

export type CoverageEntry = {
  label?: LocaleText;
  triggers: {
    num: number;
  };
  timeline: {
    hasFile?: boolean;
    timelineNeedsFixing?: boolean;
    hasNoTimeline?: boolean;
    duration?: number;
    entries?: number;
  };
  oopsy?: {
    num: number;
  };
  translationCount?: {
    [type in MissingTranslationErrorType]?: number;
  };
  translations?: {
    [lang in Lang]?: {
      [type in MissingTranslationErrorType]?: number;
    };
  };
  comments: LocaleText[];
  files?: {
    name: string;
    commit?: string;
    tag?: string;
    tagHash?: string;
  }[];
  lastModified: number;
  openPRs: number[];
  allTags: string[];
};

export type Coverage = { [zoneId: string]: CoverageEntry };

export type CoverageTotalEntry = {
  raidboss: number;
  oopsy: number;
  total: number;
};

export type CoverageTotals = {
  byExpansion: {
    [exVersion: string]: {
      byContentType: { [contentType: string]: CoverageTotalEntry };
      overall: CoverageTotalEntry;
    };
  };
  byContentType: { [contentType: string]: CoverageTotalEntry };
  overall: CoverageTotalEntry;
};

export type TranslationTotals = {
  [lang in Exclude<Lang, 'en'>]: {
    translatedFiles: number;
    totalFiles: number;
    missingFiles: number;
    errors: number;
  };
};

export type Tag = {
  tagName: string;
  tagDate: number;
  tagHash: string;
  tagTitle?: string;
  files?: {
    name: string;
    hash: string;
  }[];
};

export type Tags = {
  [tagName: string]: Tag;
};

export type Pull = {
  url: string;
  number: number;
  title: string;
  files?: string[];
  zones: number[];
};

export type Pulls = Pull[];
