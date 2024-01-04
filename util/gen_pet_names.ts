import path from 'path';

import { getCnTable, getKoTable } from './csv_util';
import { OutputFileAttributes, XivApi } from './xivapi';

const _PET_NAMES: OutputFileAttributes = {
  outputFile: 'resources/pet_names.ts',
  type: 'PetData',
  header: `import { Lang } from './languages';

type PetData = {
  [name in Lang]: readonly string[];
};
`,
  asConst: false,
};

const _ENDPOINT = 'Pet';

const _COLUMNS = [
  'ID',
  'Name_de',
  'Name_en',
  'Name_fr',
  'Name_ja',
];

const _LOCALE_TABLE = 'Pet';

const _LOCALE_COLUMNS = ['Name'];

type ResultPet = {
  Name_de: string | null;
  Name_en: string | null;
  Name_fr: string | null;
  Name_ja: string | null;
};

type XivApiPet = ResultPet[];

type OutputPetNames = {
  cn: string[];
  de: string[];
  en: string[];
  fr: string[];
  ja: string[];
  ko: string[];
};

const fetchLocaleCsvTables = async () => {
  const cnPet = await getCnTable(_LOCALE_TABLE, _LOCALE_COLUMNS);
  const koPet = await getKoTable(_LOCALE_TABLE, _LOCALE_COLUMNS);
  return {
    cn: cnPet,
    ko: koPet,
  };
};

const assembleData = async (apiData: XivApiPet): Promise<OutputPetNames> => {
  // This isn't really a locale object, and ordering is alpha in the current file, so:
  // eslint-disable-next-line rulesdir/cactbot-locale-order
  const formattedData: OutputPetNames = {
    cn: [],
    de: [],
    en: [],
    fr: [],
    ja: [],
    ko: [],
  };

  for (const pet of apiData) {
    // If no en name (or if duplicate), skip processing
    if (pet.Name_en === null || pet.Name_en === '' || formattedData.en.includes(pet.Name_en))
      continue;
    formattedData.en.push(pet.Name_en);

    if (pet.Name_de !== null)
      formattedData.de.push(pet.Name_de);
    if (pet.Name_fr !== null)
      formattedData.fr.push(pet.Name_fr);
    if (pet.Name_ja !== null)
      formattedData.ja.push(pet.Name_ja);
  }

  const localeCsvTables = await fetchLocaleCsvTables();
  for (const name of Object.keys(localeCsvTables.cn).filter((k) => k !== '')) {
    formattedData.cn.push(name);
  }
  for (const name of Object.keys(localeCsvTables.ko).filter((k) => k !== '')) {
    formattedData.ko.push(name);
  }

  return formattedData;
};

export default async (): Promise<void> => {
  const api = new XivApi(null, true);

  const apiData = await api.queryApi(
    _ENDPOINT,
    _COLUMNS,
  ) as XivApiPet;

  const outputData = await assembleData(apiData);

  await api.writeFile(
    path.basename(import.meta.url),
    _PET_NAMES,
    outputData,
  );
};
