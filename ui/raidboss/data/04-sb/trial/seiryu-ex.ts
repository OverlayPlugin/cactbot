import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  blazing?: boolean;
  markers?: string[];
  withForce?: boolean;
}

// Seiryu Extreme
const triggerSet: TriggerSet<Data> = {
  id: 'TheWreathOfSnakesExtreme',
  zoneId: ZoneId.TheWreathOfSnakesExtreme,
  timelineFile: 'seiryu-ex.txt',
  timelineTriggers: [
    {
      id: 'SeiryuEx Split Group',
      regex: /Forbidden Arts 1/,
      beforeSeconds: 4,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'stack with your group',
          de: 'mit der Gruppe stacken',
          fr: 'Packez avec votre groupe',
          ja: 'グループ別にスタック',
          cn: '分组分摊',
          ko: '쉐어징',
        },
      },
    },
    {
      id: 'SeiryuEx Line Stack',
      regex: /Forbidden Arts$/,
      beforeSeconds: 1,
      suppressSeconds: 10,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'line stack',
          de: 'Linien-Stack',
          fr: 'Packez-vous en ligne',
          ja: 'スタック',
          cn: '直线分摊',
          ko: '직선 쉐어',
        },
      },
    },
    {
      id: 'SeiryuEx Tether',
      regex: /Kanabo/,
      beforeSeconds: 7,
      condition: (data) => data.role === 'tank' || data.job === 'BLU',
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Grab Tether, Point Away',
          de: 'Verbindung nehmen und wegdrehen',
          fr: 'Prenez le lien, pointez vers l\'extérieur',
          ja: '線を取って外に向ける',
          cn: '接线引导向场外',
          ko: '선 가로채고 구석으로 유도하기',
        },
      },
    },
  ],
  triggers: [
    {
      id: 'SeiryuEx Aramitama Tracking',
      type: 'StartsUsing',
      netRegex: { id: '37E4', source: 'Seiryu', capture: false },
      run: (data) => data.blazing = true,
    },
    {
      id: 'SeiryuEx Cursekeeper',
      type: 'StartsUsing',
      netRegex: { id: '37D2', source: 'Seiryu' },
      alertText: (data, matches, output) => {
        if (matches.target === data.me)
          return output.tankSwap!();

        if (data.role === 'tank')
          return output.swapThenBuster!();
      },
      outputStrings: {
        tankSwap: Outputs.tankSwap,
        swapThenBuster: {
          en: 'Swap, then Buster',
          de: 'Tankwechsel, danach Tankbuster',
          fr: 'Tank swap puis Tank buster',
          ja: 'スイッチ後強攻撃',
          cn: '换T+死刑',
          ko: '교대 후 탱버',
        },
      },
    },
    {
      id: 'SeiryuEx Infirm Soul',
      type: 'StartsUsing',
      netRegex: { id: '37D2', source: 'Seiryu', capture: false },
      condition: (data) => {
        // TODO: it'd be nice to figure out who the tanks are so this
        // could also apply to the person Cursekeeper was on.
        return data.role !== 'tank';
      },
      delaySeconds: 3,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Away From Tanks',
          de: 'Weg von den Tanks',
          fr: 'Éloignez-vous des Tanks',
          ja: 'タンクから離れる',
          cn: '远离坦克',
          ko: '탱커한테서 멀어지기',
        },
      },
    },
    {
      id: 'SeiryuEx Ascending Tracking',
      type: 'StartsUsing',
      netRegex: { id: '3C25', source: 'Seiryu', capture: false },
      run: (data) => data.markers = [],
    },
    {
      id: 'SeiryuEx Ascending Stack',
      type: 'StartsUsing',
      netRegex: { id: '3C25', source: 'Seiryu', capture: false },
      delaySeconds: 1,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Stack for Puddle AOEs',
          de: 'Stacken (Pfützen)',
          fr: 'Packez-vous pour l\'AoE',
          ja: 'スタック',
          cn: '集合放置AOE',
          ko: '중앙에 모이기',
        },
      },
    },
    {
      id: 'SeiryuEx Ascending Marker Tracking',
      type: 'HeadMarker',
      netRegex: { id: '00A9' },
      condition: (data) => data.blazing,
      run: (data, matches) => {
        data.markers ??= [];
        data.markers.push(matches.target);
      },
    },
    {
      id: 'SeiryuEx Ascending Marker You',
      type: 'HeadMarker',
      netRegex: { id: '00A9' },
      condition: (data, matches) => data.blazing && matches.target === data.me,
      infoText: (data, _matches, output) => {
        if (data.role === 'tank' || data.role === 'healer')
          return output.spreadDpsGetTowers!();

        return output.spreadTanksHealersGetTowers!();
      },
      outputStrings: {
        spreadDpsGetTowers: {
          en: 'Spread (dps get towers)',
          de: 'Verteilen (nicht in den Turm)',
          fr: 'Dispersion (DPS prenez les tours)',
          ja: '散開 (DPSが塔)',
          cn: '分散（DPS踩塔）',
          ko: '산개 (딜러 기둥 처리)',
        },
        spreadTanksHealersGetTowers: {
          en: 'Spread (tanks/healers get towers)',
          de: 'Verteilen (nicht in den Turm)',
          fr: 'Dispersion (Tanks/Healers prenez les tours)',
          ja: '散開 (タンクヒラが塔)',
          cn: '分散（坦克/治疗踩塔）',
          ko: '산개 (탱/힐 기둥 처리)',
        },
      },
    },
    {
      id: 'SeiryuEx Ascending Tower You',
      type: 'HeadMarker',
      netRegex: { id: '00A9', capture: false },
      condition: (data) => {
        if (!data.blazing || data.markers?.length !== 4)
          return false;
        return !data.markers.includes(data.me);
      },
      alarmText: (data, _matches, output) => {
        if (data.role === 'tank' || data.role === 'healer')
          return output.getTowerTankHealerTowers!();

        return output.getTowerDpsTowers!();
      },
      outputStrings: {
        getTowerTankHealerTowers: {
          en: 'Get Tower (tank/healer towers)',
          de: 'In den Turm',
          fr: 'Prenez votre tour (tours T/H)',
          ja: '塔 (タンクヒラが塔)',
          cn: '踩塔（坦克/治疗踩塔）',
          ko: '기둥 처리 (탱/힐)',
        },
        getTowerDpsTowers: {
          en: 'Get Tower (dps towers)',
          de: 'In den Turm',
          fr: 'Prenez votre tour (tours DPS)',
          ja: '塔 (DPSが塔)',
          cn: '踩塔（DPS踩塔）',
          ko: '기둥 처리 (딜러)',
        },
      },
    },
    {
      id: 'SeiryuEx Handprint East',
      type: 'Ability',
      netRegex: { id: '37E5', source: 'Yama-No-Shiki', capture: false },
      response: Responses.goEast(),
    },
    {
      id: 'SeiryuEx Handprint West',
      type: 'Ability',
      netRegex: { id: '37E6', source: 'Yama-No-Shiki', capture: false },
      response: Responses.goWest(),
    },
    {
      id: 'SeiryuEx Find Sneks',
      type: 'StartsUsing',
      netRegex: { id: '37F7', source: 'Seiryu', capture: false },
      alarmText: (data, _matches, output) => {
        if (data.withForce === undefined)
          return output.goToSnakes!();

        return output.outOfMiddleTowardSnakes!();
      },
      run: (data) => data.withForce = true,
      outputStrings: {
        goToSnakes: {
          en: 'Go To Snakes',
          de: 'Zu den Schlangen',
          fr: 'Allez vers les serpents',
          ja: '蛇側へ',
          cn: '靠近蛇蛇',
          ko: '뱀쪽으로 이동',
        },
        outOfMiddleTowardSnakes: {
          en: 'Out of Middle, Toward Snakes',
          de: 'Raus aus der Mitte, Zu den Schlangen',
          fr: 'Sortez du milieu, vers les serpents',
          ja: '真ん中からずれて蛇に向く',
          cn: '靠近中间，击退向蛇蛇',
          ko: '중앙 피하고 뱀쪽으로 밀리기',
        },
      },
    },
    {
      id: 'SeiryuEx Silence',
      type: 'StartsUsing',
      netRegex: { id: '37F4', source: 'Numa-No-Shiki' },
      condition: (data) => data.CanSilence(),
      response: Responses.interrupt(),
    },
    {
      id: 'SeiryuEx Stack',
      type: 'AddedCombatant',
      netRegex: { name: 'Ao-No-Shiki', capture: false },
      infoText: (data, _matches, output) => {
        if (data.role === 'tank' || data.role === 'healer')
          return output.stackSouth!();

        return output.stackIfNoTether!();
      },
      outputStrings: {
        stackSouth: {
          en: 'Stack South',
          de: 'Im Süden stacken',
          fr: 'Packez-vous au sud',
          ja: '南でスタック',
          cn: '下半场边缘分摊',
          ko: '남쪽에서 모이기',
        },
        stackIfNoTether: {
          en: 'Stack if no tether',
          de: 'Stacken, wenn keine Verbindung',
          fr: 'Packez-vous si pas de lien',
          ja: '線無しはスタック',
          cn: '无连线则去分摊',
          ko: '징 없으면 모이기',
        },
      },
    },
    {
      // This comes a good bit after the symbol on screen,
      // but it's still 2.5s of warning if you've fallen asleep.
      id: 'SeiryuEx Sigil Single Out',
      type: 'StartsUsing',
      netRegex: { id: '3A01', source: 'Seiryu', capture: false },
      response: Responses.getOut('info'),
    },
    {
      id: 'SeiryuEx Sigil In Out 1',
      type: 'StartsUsing',
      netRegex: { id: '3A05', source: 'Seiryu', capture: false },
      response: Responses.getInThenOut(),
    },
    {
      id: 'SeiryuEx Sigil In Out 2',
      type: 'StartsUsing',
      netRegex: { id: '3A05', source: 'Seiryu', capture: false },
      delaySeconds: 2.7,
      response: Responses.getOut('info'),
    },
    {
      id: 'SeiryuEx Sigil Out In 1',
      type: 'StartsUsing',
      netRegex: { id: '3A03', source: 'Seiryu', capture: false },
      response: Responses.getOutThenIn(),
    },
    {
      id: 'SeiryuEx Sigil Out In 2',
      type: 'StartsUsing',
      netRegex: { id: '3A03', source: 'Seiryu', capture: false },
      delaySeconds: 2.7,
      response: Responses.getIn('info'),
    },
    {
      id: 'SeiryuEx Swim Lessons',
      type: 'StartsUsing',
      netRegex: { id: '37CB', source: 'Seiryu', capture: false },
      delaySeconds: 28,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Pop Sprint',
          de: 'Sprinten',
          fr: 'Sprintez',
          ja: 'スプリント',
          cn: '冲刺上岸！',
          ko: '전력 질주',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Aka-no-shiki': 'Aka no Shiki',
        'Ao-no-shiki': 'Ao no Shiki',
        'Iwa-no-shiki': 'Iwa no Shiki',
        'Numa-no-shiki': 'Numa no Shiki',
        'Seiryu': 'Seiryu',
        'Yama-no-shiki': 'Yama no Shiki',
      },
      'replaceText': {
        '100-tonze Swing': '100-Tonzen-Schwung',
        'Blazing Aramitama': 'Flammende Aramitama',
        'Blue Bolt': 'Blauer Blitz',
        'Coursing River': 'Woge der Schlange',
        'Cursekeeper': 'Wächter des Fluchs',
        'Dragon\'s Wake': 'Erwachen des Drachen',
        'Fifth Element': 'Fünftes Element',
        'Forbidden Arts': 'Verbotene Künste',
        'Force of Nature': 'Naturgewalt',
        'Handprint': 'Handabdruck',
        'In/Out': 'Rein/Raus',
        'Kanabo': 'Kanabo',
        'Kuji-kiri': 'Kuji-kiri',
        'Onmyo Sigil': 'Onmyo-Siegel',
        'Out/In': 'Raus/Rein',
        'Red Rush': 'Roter Ansturm',
        'Serpent Ascending': 'Aufstieg der Schlange',
        'Serpent Descending': 'Niedergang der Schlange',
        'Serpent\'s Fang': 'Schlangengiftzahn',
        'Strength of Spirit': 'Stärke des Geistes',
        'Summon Shiki': 'Shiki-Beschwörung ',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Aka-no-shiki': 'shiki écarlate',
        'Ao-no-shiki': 'shiki céruléen',
        'Iwa-no-shiki': 'shiki rocailleux',
        'Numa-no-shiki': 'shiki uligineux',
        'Seiryu': 'Seiryû',
        'Yama-no-shiki': 'shiki montagneux',
      },
      'replaceText': {
        '100-tonze Swing': 'Swing de 100 tonz',
        'Blazing Aramitama': 'Aramitama incandescent',
        'Blue Bolt': 'Percée bleue',
        'Coursing River': 'Vague de serpents',
        'Cursekeeper': 'Katashiro',
        'Dragon\'s Wake': 'Ascension draconique',
        'Fifth Element': 'Cinq éléments',
        'Forbidden Arts': 'Lame interdite',
        'Force of Nature': 'Main écrasante',
        'Handprint': 'Main lourde',
        'In/Out': 'Intérieur/Extérieur',
        'Kanabo': 'Massue démoniaque',
        'Kuji-kiri': 'Kuji-kiri',
        'Onmyo Sigil': 'Onmyo',
        'Out/In': 'Extérieur/Intérieur',
        'Red Rush': 'Percée rouge',
        'Serpent Ascending': 'Serpent levant',
        'Serpent Descending': 'Serpent couchant',
        'Serpent\'s Fang': 'Dent de serpent',
        'Strength of Spirit': 'Chakra',
        'Summon Shiki': 'Invocation de shiki',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Aka-no-shiki': '紅の式鬼',
        'Ao-no-shiki': '蒼の式鬼',
        'Iwa-no-shiki': '岩の式鬼',
        'Numa-no-shiki': '沼の式鬼',
        'Seiryu': '青龍',
        'Yama-no-shiki': '山の式鬼',
      },
      'replaceText': {
        '100-tonze Swing': '100トンズ・スイング',
        'Blazing Aramitama': '荒魂燃焼',
        'Blue Bolt': '青の突進',
        'Coursing River': '蛇崩',
        'Cursekeeper': '呪怨の形代',
        'Dragon\'s Wake': '雲蒸龍変',
        'Fifth Element': '陰陽五行',
        'Forbidden Arts': '刀禁呪',
        'Force of Nature': '大圧殺',
        'Handprint': '圧殺掌',
        'In/Out': '中/外',
        'Kanabo': '鬼に金棒',
        'Kuji-kiri': '九字切り',
        'Onmyo Sigil': '陰陽の印',
        'Out/In': '外/中',
        'Red Rush': '赤の突進',
        'Serpent Ascending': '登り龍',
        'Serpent Descending': '降り蛇',
        'Serpent\'s Fang': '蛇牙',
        'Strength of Spirit': '霊気',
        'Summon Shiki': '式鬼召喚',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Aka-no-shiki': '红之式鬼',
        'Ao-no-shiki': '苍之式鬼',
        'Iwa-no-shiki': '岩之式鬼',
        'Numa-no-shiki': '沼之式鬼',
        'Seiryu': '青龙',
        'Yama-no-shiki': '山之式鬼',
      },
      'replaceText': {
        '100-tonze Swing': '百吨回转',
        'Blazing Aramitama': '荒魂燃烧',
        'Blue Bolt': '青突进',
        'Coursing River': '蛇崩',
        'Cursekeeper': '咒怨的替身',
        'Dragon\'s Wake': '云蒸龙变',
        'Fifth Element': '阴阳五行',
        'Forbidden Arts': '刀禁咒',
        'Force of Nature': '大压杀',
        'Handprint': '压杀掌',
        'In/Out': '靠近/远离',
        'Kanabo': '如虎添翼',
        'Kuji-kiri': '九字切',
        'Onmyo Sigil': '阴阳之印',
        'Out/In': '远离/靠近',
        'Red Rush': '赤突进',
        'Serpent Ascending': '升龙',
        'Serpent Descending': '降蛇',
        'Serpent\'s Fang': '蛇牙',
        'Strength of Spirit': '灵气',
        'Summon Shiki': '式鬼召唤',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Aka-no-shiki': '붉은 사역귀',
        'Ao-no-shiki': '푸른 사역귀',
        'Iwa-no-shiki': '바위 사역귀',
        'Numa-no-shiki': '늪 사역귀',
        'Seiryu': '청룡',
        'Yama-no-shiki': '산 사역귀',
      },
      'replaceText': {
        '100-tonze Swing': '100톤즈 휘두르기',
        'Blazing Aramitama': '아라미타마 연소',
        'Blue Bolt': '푸른 돌진',
        'Coursing River': '뱀의 행진',
        'Cursekeeper': '저주 인형',
        'Dragon\'s Wake': '운증용변',
        'Fifth Element': '음양오행',
        'Forbidden Arts': '금단의 주술검',
        'Force of Nature': '대압살',
        'Handprint': '압살장',
        'In/Out': '안/밖',
        'Kanabo': '도깨비 방망이',
        'Kuji-kiri': '구자호신법',
        'Onmyo Sigil': '음양의 인',
        'Out/In': '밖/안',
        'Red Rush': '붉은 돌진',
        'Serpent Ascending': '승천하는 뱀',
        'Serpent Descending': '강림하는 뱀',
        'Serpent\'s Fang': '뱀송곳니',
        'Strength of Spirit': '영기',
        'Summon Shiki': '사역귀 소환',
      },
    },
  ],
};

export default triggerSet;
