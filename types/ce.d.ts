import { LocaleText } from './trigger';

export type CeInfoType = {
  [key: string]: {
    readonly directorId: string;
    readonly name: LocaleText;
  };
};

export type CEMap<CEList> = {
  [directorId: string]: keyof CEList;
};
