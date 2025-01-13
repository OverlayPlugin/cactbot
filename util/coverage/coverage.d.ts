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
  };
  oopsy?: {
    num: number;
  };
  translations?: {
    [lang in Lang]?: {
      [type in MissingTranslationErrorType]?: number;
    };
  };
  comments?: LocaleText;
  files: {
    name: string;
    commit?: string;
    tag?: string;
    tagHash?: string;
  }[];
  lastModified: number;
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

export type Tags = {
  [tagName: string]: {
    tagDate: number;
    tagHash: string;
    files: {
      name: string;
      hash: string;
    }[];
  };
};

export type Pulls = {
  url: string;
  number: number;
  title: string;
  files: string[];
  zones: number[];
}[];
