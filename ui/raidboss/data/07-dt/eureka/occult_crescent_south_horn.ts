import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  ce?: string;
}

// List of events:
// https://github.com/xivapi/ffxiv-datamining/blob/master/csv/DynamicEvent.csv
//
// These ids are (unfortunately) gathered by hand and don't seem to correlate
// to any particular bits of data.  However, there's a game log message when you
// register for a CE and an 0x21 message with this id when you accept and
// teleport in.  This avoids having to translate all of these names and also
// guarantees that the player is actually in the CE for the purpose of
// filtering triggers.
const ceIds: { [ce: string]: string } = {
  calamityBound: '32F',
  companyOfStone: '343',
  crawlingDeath: '330',
  cursedConcern: '32B',
  eternalWatch: '329',
  flameOfDusk: '32A',
  fromTimesBygone: '323',
  noiseComplaint: '327',
  onTheHunt: '338',
  scourgeOfTheMind: '320',
  sharkAttack: '32E',
  theBlackRegiment: '322',
  theUnbridled: '348',
  trialByClaw: '349',
  withExtremePredjudice: '339',
};

const triggerSet: TriggerSet<Data> = {
  id: 'TheOccultCrescentSouthHorn',
  zoneId: ZoneId.TheOccultCrescentSouthHorn,
  comments: {
    en: 'Occult Crescent South Horn critical encounter triggers/timeline.',
    cn: '蜃景幻界新月岛 南征之章 紧急遭遇战 触发器/时间轴。',
  },
  timelineFile: 'occult_crescent_south_horn.txt',
  resetWhenOutOfCombat: false,
  triggers: [
    {
      id: 'Occult Crescent Critical Encounter',
      type: 'ActorControl',
      netRegex: { command: '80000014' },
      run: (data, matches) => {
        // This fires when you win, lose, or teleport out.
        if (matches.data0 === '00') {
          if (data.ce !== undefined && data.options.Debug)
            console.log(`Stop CE: ${data.ce}`);
          // Stop any active timelines.
          data.StopCombat();
          // Prevent further triggers for any active CEs from firing.
          delete data.ce;
          return;
        }

        delete data.ce;
        const ceId = matches.data0.toUpperCase();
        for (const key in ceIds) {
          if (ceIds[key] === ceId) {
            if (data.options.Debug)
              console.log(`Start CE: ${key} (${ceId})`);
            data.ce = key;
            return;
          }
        }

        if (data.options.Debug)
          console.log(`Start CE: ??? (${ceId})`);
      },
    },
    {
      id: 'Occult Crescent Berserker Scathing Sweep',
      type: 'StartsUsing',
      netRegex: { source: 'Crescent Berserker', id: 'A6C3', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'Occult Crescent Hinkypunk Dread Dive',
      type: 'StartsUsing',
      netRegex: { source: 'Hinkypunk', id: 'A1A4', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'Occult Crescent Hinkypunk Shades Nest',
      type: 'StartsUsing',
      // TODO: Some of these are from boss, some are not.
      netRegex: { source: 'Hinkypunk', id: ['A19C', 'A19D', 'A430', 'A431'], capture: true },
      suppressSeconds: 1,
      response: Responses.getIn(),
      run: (_data, matches) => console.log(`Shades Nest: ${matches.id}`),
    },
    {
      id: 'Occult Crescent Hinkypunk Shades Crossing',
      type: 'StartsUsing',
      // TODO: Some of these are from boss, some are not.
      netRegex: { source: 'Hinkypunk', id: ['A19F', 'A1A0', 'A432', 'A433'], capture: true },
      suppressSeconds: 1,
      response: Responses.getIntercards(),
      run: (_data, matches) => console.log(`Shades Nest: ${matches.id}`),
    },
    {
      id: 'Occult Crescent Hinkypunk Lamplight',
      type: 'StartsUsing',
      netRegex: { source: 'Hinkypunk', id: ['A1A5', 'A310'], capture: false },
      suppressSeconds: 1,
      response: Responses.aoe(),
    },
    {
      id: 'Occult Crescent Black Star Choco Windstorm',
      type: 'StartsUsing',
      netRegex: { source: 'Black Star', id: 'A0BB', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'Occult Crescent Black Star Choco Cyclone',
      type: 'StartsUsing',
      netRegex: { source: 'Black Star', id: 'A0BC', capture: false },
      response: Responses.getIn(),
    },
    {
      id: 'Occult Crescent Neo Garula Squash',
      type: 'StartsUsing',
      netRegex: { source: 'Neo Garula', id: 'A0E5', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'Occult Crescent Lion Rampant Fearsome Glint',
      type: 'StartsUsing',
      netRegex: { source: 'Lion Rampant', id: 'A1C3', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Occult Crescent Death Claw Dirty Nails',
      type: 'StartsUsing',
      netRegex: { source: 'Death Claw', id: 'A174', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'Occult Crescent Death Claw Grip of Poison',
      type: 'StartsUsing',
      netRegex: { source: 'Death Claw', id: 'A175', capture: false },
      response: Responses.bleedAoe(),
    },
    {
      id: 'Occult Crescent Death Claw Vertical Crosshatch',
      type: 'StartsUsing',
      netRegex: { source: 'Death Claw', id: ['A16B', 'A172'], capture: false },
      response: Responses.getSidesThenFrontBack('alert'),
    },
    {
      id: 'Occult Crescent Death Claw Horizontal Crosshatch',
      type: 'StartsUsing',
      netRegex: { source: 'Death Claw', id: ['A16C', 'A173'], capture: false },
      response: Responses.getFrontBackThenSides('alert'),
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Vertical Crosshatch/Horizontal Crosshatch': 'Vertical/Horizontal Crosshatch',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Ball of Fire': '火球',
        'Black Star': '黑色天星',
        'Clawmarks': '抓痕',
        'Cloister Demon': '回廊恶魔',
        'Crescent Berserker': '新月狂战士',
        'Death Claw': '死亡爪',
        'Hinkypunk': '鬼火苗',
        'Lion Rampant': '跃立狮',
        'Neo Garula': '进化加鲁拉',
        'Phantom Claw': '死亡爪的幻影',
      },
      'replaceText': {
        '\\(in\\)': '(内)',
        '\\(jump\\)': '(跳)',
        '\\(out\\)': '(外)',
        'Bedrock Uplift': '地面隆起',
        'Blazing Flare': '炽热核爆',
        'Boil Over': '发怒',
        'Channeled Rage': '燥怒',
        'Clawing Shadow': '雾霾爪',
        'Clawmarks': '抓痕',
        'Dirty Nails': '腐坏爪',
        'Explosion': '爆炸',
        'Gigaflare': '十亿核爆',
        'Great Ball of Fire': '火球',
        'Heated Outburst': '气焰',
        'Heightened Rage': '狂怒',
        'Hopping Mad': '震击怒涛',
        'Horizontal Crosshatch': '横向双重抓',
        'Karmic Drain': '生命侵蚀',
        'Lethal Nails': '死亡甲',
        'Manifold Marks': '多重抓痕',
        'Raking Scratch': '尖甲疾袭',
        'Scathing Sweep': '横砍',
        'Seal Asunder': '封印破坏',
        'Skulking Orders': '处刑令',
        'Sunderseal Roar': '破封的咆哮',
        'The Grip of Poison': '邪气的共振',
        'Threefold Marks': '三重抓痕',
        'Tidal Breath': '怒潮吐息',
        'Vertical Crosshatch': '纵向双重抓',
        'Void Thunder III': '虚空暴雷',
        'White-hot Rage': '气焰怒涛',
      },
    },
  ],
};

export default triggerSet;
