import { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// Pilgrim's Traverse Stones 01-10
// TODO: Ornamental Leafman Leafmash jump order/safe spots

// center of room for Ornamental Leafman encounter
const leafmanCenter = {
  'x': -300,
  'y': -300,
} as const;

export interface Data extends RaidbossData {
  shrubDir?: number[];
}

const triggerSet: TriggerSet<Data> = {
  id: 'PilgrimsTraverseStones1_10',
  zoneId: ZoneId.PilgrimsTraverseStones1_10,

  triggers: [
    // ---------------- Stone 01-09 Mobs ----------------
    // intentionally blank
    // ---------------- Stone 10 Boss: Ornamental Leafman ----------------
    {
      id: 'PT 01-10 Ornamental Leafman Hedge Mazing',
      // Branch Out/Hedge Mazing: boss faces south during the entire mechanic
      // two adds explode 180° from each other, third add explodes 45° from one of the other two
      // adds can be on cardinals or intercardinals
      // creates two safe spots; one larger (called out) and one smaller
      type: 'StartsUsingExtra',
      netRegex: { id: 'AF37', capture: true },
      durationSeconds: 13.2,
      infoText: (data, matches, output) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const dirNum = Directions.xyTo8DirNum(x, y, leafmanCenter.x, leafmanCenter.y);

        (data.shrubDir ??= []).push(dirNum);

        if (data.shrubDir.length < 3)
          return;

        let safeDirNum = -1;
        const dirs = data.shrubDir.sort((a, b) => a - b);
        const [dir1, dir2, dir3] = [dirs[0], dirs[1], dirs[2]];
        if (dir1 === undefined || dir2 === undefined || dir3 === undefined)
          return output.unknownSafe!();
        if (dir2 - dir1 === 4) {
          // ex: dir1 = N, dir2 = S, dir3 = NW, safe = E
          safeDirNum = (dir1 + 2) % 8;
        } else if (dir3 - dir2 === 4) {
          // ex: dir1 = N, dir2 = NE, dir3 = SW, safe = SE
          safeDirNum = (dir2 + 2) % 8;
        } else if (dir3 - dir1 === 4) {
          // ex: dir1 = N, dir2 = NE, dir3 = S, safe = W
          safeDirNum = (dir3 + 2) % 8;
        }

        if (safeDirNum === -1)
          return output.unknownSafe!();

        const safeDir = Directions.output8Dir[safeDirNum];
        if (safeDir === undefined)
          return output.unknownSafe!();

        return output.safe!({ safe: output[safeDir]!() });
      },
      outputStrings: {
        safe: {
          en: 'Go ${safe} + Out',
          de: 'Geh nach ${safe} + Raus',
          fr: 'Allez ${safe} + Extérieur',
          cn: '去 ${safe} + 外',
          ko: '${safe} + 밖으로',
          tc: '去 ${safe} + 外',
        },
        unknownSafe: {
          en: 'Out + Avoid shrublet explosions',
          de: 'Raus + Vermeide Blumling Explosionen',
          fr: 'Extérieur + Évitez les explosions de buissons',
          cn: '外 + 避开花小人爆炸',
          ko: '밖으로 + 꼬마 꽃인간 폭발 피하기',
          tc: '外 + 避開花小人爆炸',
        },
        ...Directions.outputStrings8Dir,
      },
    },
    {
      id: 'PT 01-10 Ornamental Leafman Hedge Mazing Cleanup',
      type: 'Ability',
      netRegex: { id: 'AF36', source: 'Ornamental Leafman', capture: false },
      run: (data) => {
        delete data.shrubDir;
      },
    },
    {
      id: 'PT 01-10 Ornamental Leafman Leafmash',
      type: 'StartsUsing',
      netRegex: { id: 'AC17', source: 'Ornamental Leafman', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 5,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Away from jump x4',
          de: 'Weg vom Sprung x4',
          fr: 'Loin des sauts x4',
          cn: '远离跳跃 x4',
          ko: '점프에서 멀어지기 x4',
          tc: '遠離跳躍 x4',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Ornamental Leafman': 'Blumerich',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Ornamental Leafman': 'Enfleuri',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Ornamental Leafman': '花人',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Ornamental Leafman': '꽃인간',
      },
    },
  ],
};

export default triggerSet;
