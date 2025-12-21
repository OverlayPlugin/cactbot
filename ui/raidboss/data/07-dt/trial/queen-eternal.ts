import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  shriekTargets: string[];
  seenFirstCastellation: boolean;
  playerFloating: boolean;
}

// TODO: Determine whether Regalia targeting is anywhere in the log data.
// TODO: Determine whether the Brutal Crown position is anywhere usable
// in the log data.
// TODO: Determine whether Downburst/Powerful Gust positions are anywhere
// in the log data.
// TODO: Determine whether the Castellation layout is anywhere in the log data.

// Numerous MapEffects are used throughout the encounter.
// 02000100: Floor windw gusts before Aethertithe
// 00080004: Return floow to normal after Aethertithe
// 00020001: Floor swap to X pattern

const triggerSet: TriggerSet<Data> = {
  id: 'Queen EternalNormal',
  zoneId: ZoneId.TheInterphos,
  timelineFile: 'queen-eternal.txt',
  initData: () => {
    return {
      shriekTargets: [],
      seenFirstCastellation: false,
      playerFloating: false,
    };
  },
  triggers: [
    {
      // Sphene has six total Legitimate Force casts.
      // Four of them are from high hands and are the first in line.
      // 8F22 and 8F23 are from her low hands, and are always the second in line.
      // (Hand height is irrelevant for mechanical resolution,
      // it's just a visual distinguisher for first cast vs second.)

      // The first cast in line is chosen based on what the overall mechanic will be:
      // 8F1E: Left cleave from high hand, low left follow-up
      // 8F1F: Left cleave from high hand, low right follow-up
      // 8F20: Right cleave from high hand, low right follow-up
      // 8F21: Right cleave from high hand, low left follow-up
      id: 'Queen Eternal Legitimate Force',
      type: 'StartsUsing',
      netRegex: { id: ['8F1E', '8F1F', '8F20', '8F21'], source: 'Queen Eternal', capture: true },
      alertText: (_data, matches, output) => {
        if (matches.id === '8F1E')
          return output.stayRight!();
        else if (matches.id === '8F1F')
          return output.rightThenLeft!();
        else if (matches.id === '8F20')
          return output.stayLeft!();
        else if (matches.id === '8F21')
          return output.leftThenRight!();
        return output.unknown!();
      },
      outputStrings: {
        stayRight: Outputs.right,
        rightThenLeft: Outputs.rightThenLeft,
        stayLeft: Outputs.left,
        leftThenRight: Outputs.leftThenRight,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Queen Eternal Virtual Shift',
      type: 'StartsUsing',
      netRegex: { id: ['8EFE', '8EFF', '8F00'], source: 'Queen Eternal', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Queen Eternal Aethertithe Light Repeated AOE',
      type: 'StartsUsing',
      netRegex: { id: '8EFC', source: 'Queen Eternal', capture: false },
      durationSeconds: 30,
      infoText: (_data, _matches, output) => output.repeatedAOE!(),
      outputStrings: {
        repeatedAOE: {
          en: 'Continuous light AoE',
          de: 'Durchgehende Licht AoE',
          fr: 'AoE légère continue',
          ja: '連続光属性AoE',
          cn: '连续小AoE',
          tc: '連續小AoE',
          ko: '지속적인 약한 전체 공격',
        },
      },
    },
    {
      // There aren't any StartsUsing lines for the Aethertithe cones,
      // only MapEffects.
      // 04000100 -- Left cone
      // 08000100 -- Center cone
      // 10000100 -- Right cone
      id: 'Queen Eternal Aethertithe Cones',
      type: 'MapEffect',
      netRegex: { flags: ['04000100', '08000100', '10000100'], capture: true },
      alertText: (_data, matches, output) => {
        if (matches.flags === '04000100')
          return output.goRight!();
        else if (matches.flags === '08000100')
          return output.frontCorners!();
        else if (matches.flags === '10000100')
          return output.goLeft!();
        return output.unknown!();
      },
      outputStrings: {
        frontCorners: {
          en: 'Front Corner',
          de: 'Vordere Ecken',
          fr: 'Coin devant',
          ja: '前方の角へ',
          cn: '前面角落',
          tc: '前面角落',
          ko: '앞쪽 구석으로',
        },
        goLeft: Outputs.left,
        goRight: Outputs.right,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Queen Eternal Prosecution Of War',
      type: 'HeadMarker',
      netRegex: { id: '00DA', capture: true },
      response: Responses.tankBuster(), // Non-splashing
    },
    {
      id: 'Queen Eternal Ruthless Regalia Prey',
      type: 'HeadMarker',
      netRegex: { id: '0001', capture: true },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.regaliaYou!(),
      outputStrings: {
        regaliaYou: {
          en: 'Laser tether on YOU',
          de: 'Laserverbindung auf DIR',
          fr: 'Lien laser sur VOUS',
          ja: 'レーザー線処理',
          cn: '激光连线点名',
          tc: '雷射連線點名',
          ko: '레이저 선 대상자',
        },
      },
    },
    {
      id: 'Queen Eternal Downburst',
      type: 'StartsUsing',
      netRegex: { id: '8F01', source: 'Queen Eternal', capture: false },
      response: Responses.knockback(),
    },
    {
      id: 'Queen Eternal Powerful Gust',
      type: 'StartsUsing',
      netRegex: { id: '8F03', source: 'Queen Eternal', capture: false },
      response: Responses.knockback(),
    },
    {
      id: 'Queen Eternal Gravitational Anomaly Gain',
      type: 'GainsEffect',
      netRegex: { effectId: 'EE6', capture: true },
      condition: (data, matches) => {
        return !data.seenFirstCastellation && data.me === matches.target;
      },
      infoText: (_data, _matches, output) => output.floating!(),
      run: (data) => data.playerFloating = true,
      outputStrings: {
        floating: {
          en: 'Gravitation -- Levitating',
          de: 'Gravitation -- Schweben',
          fr: 'Gravité -- Lévitation',
          ja: '重力装置 -- 浮上',
          cn: '重力 -- 上浮',
          tc: '重力 -- 上浮',
          ko: '중력 -- 상승',
        },
      },
    },
    {
      // On all but the first Castellation, it is earlier
      // to use the red instance warning rather than gains/losesEffect.
      // "Gravity increases, making you fall."
      id: 'Queen Eternal Gravity Increase',
      type: 'SystemLogMessage',
      netRegex: { id: '2940', capture: false },
      condition: (data) => data.seenFirstCastellation,
      infoText: (_data, _matches, output) => output.falling!(),
      run: (data) => data.playerFloating = false,
      outputStrings: {
        falling: {
          en: 'Gravitation -- Falling',
          de: 'Gravitation -- Fallen',
          fr: 'Gravité -- Chute',
          ja: '重力装置 -- 降下',
          cn: '重力 -- 下降',
          tc: '重力 -- 下降',
          ko: '중력 -- 하강',
        },
      },
    },
    {
      // On all but the first Castellation, it is earlier
      // to use the red instance warning rather than gains/losesEffect.
      // "Gravity decreases, making you float."
      id: 'Queen Eternal Gravity Decrease',
      type: 'SystemLogMessage',
      netRegex: { id: '2941', capture: false },
      condition: (data) => data.seenFirstCastellation,
      infoText: (_data, _matches, output) => output.floating!(),
      run: (data) => data.playerFloating = true,
      outputStrings: {
        floating: {
          en: 'Gravitation -- Levitating',
          de: 'Gravitation -- Schweben',
          fr: 'Gravité -- Lévitation',
          ja: '重力装置 -- 浮上',
          cn: '重力 -- 上浮',
          tc: '重力 -- 上浮',
          ko: '중력 -- 상승',
        },
      },
    },
    {
      id: 'Queen Eternal Castellation',
      type: 'Ability',
      netRegex: { id: '8F05', capture: false },
      alertText: (data, _matches, output) => {
        if (data.playerFloating)
          return output.floatCastle!();
        return output.fallCastle!();
      },
      run: (data) => {
        // Conditionalize in the unlikely event we run this through the raid emulator.
        if (!data.seenFirstCastellation)
          data.seenFirstCastellation = true;
      },
      outputStrings: {
        fallCastle: {
          en: 'In front of ground windows',
          de: 'Sei vor dem Fenster am Boden',
          fr: 'Devant les fenêtres à l\'avant',
          ja: '下層の窓前へ',
          cn: '正对下层空洞',
          tc: '正對下層空洞',
          ko: '아래쪽 뚫린 곳',
        },
        floatCastle: {
          en: 'In front of middle windows',
          de: 'Sei vor dem Fenster in der Mitte',
          fr: 'Devant les fenêtres du milieu',
          ja: '中層の窓前へ',
          cn: '正对上层空洞',
          tc: '正對上層空洞',
          ko: '가운데층 뚫린 곳',
        },
      },
    },
    {
      id: 'Queen Eternal Brutal Crown',
      type: 'StartsUsing',
      netRegex: { id: '8F19', source: 'Queen Eternal', capture: false },
      alertText: (_data, _matches, output) => output.getInDonut!(),
      outputStrings: {
        getInDonut: {
          en: 'Get in robot circle',
          de: 'Geh in den Roboterkreis',
          fr: 'Aller dans le cercle du robot',
          ja: 'ドローンサークルの中に',
          cn: '小月环',
          tc: '小月環',
          ko: '로봇 원 안으로',
        },
      },
    },
    {
      id: 'Queen Eternal Divide And Conquer',
      type: 'HeadMarker',
      netRegex: { id: '0209', capture: true },
      condition: (data, matches) => {
        // These markers are "targeted" on Sphene and "sourced" from the player.
        // This is a pattern we've seen with some other laser headmarker mechanics in Dawntrail.
        // Only the player ID is given.
        return data.party.nameFromId(matches.data0) === data.me;
      },
      response: Responses.spread(),
    },
    {
      id: 'Queen Eternal Authoritys Gaze Store',
      type: 'GainsEffect',
      netRegex: { effectId: 'EE7', capture: true },
      infoText: (data, matches, output) => {
        if (data.me === matches.target)
          return output.gazeLater!();
      },
      run: (data, matches) => data.shriekTargets.push(matches.target),
      outputStrings: {
        gazeLater: {
          en: 'Gaze on you soon',
          de: 'Bald: Blick auf dir',
          fr: 'Regard sur vous bientôt',
          ja: 'まもなく視線攻撃',
          cn: '石化眼点名',
          tc: '石化眼點名',
          ko: '곧 시선징 대상자',
        },
      },
    },
    {
      id: 'Queen Eternal Authoritys Gaze Resolve',
      type: 'GainsEffect',
      netRegex: { effectId: 'EE7', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 5,
      suppressSeconds: 5,
      alarmText: (data, _matches, output) => {
        if (data.shriekTargets.includes(data.me)) {
          const otherShriek = data.shriekTargets.filter((target) => target !== data.me)[0];
          return output.shriekYou!({ otherTarget: otherShriek });
        }
        const joinedTargets = data.shriekTargets.join(', ');
        return output.shriekOthers!({ comboTargets: joinedTargets });
      },
      run: (data) => data.shriekTargets = [],
      outputStrings: {
        shriekYou: {
          en: 'Gaze -- look away from ${otherTarget}',
          de: 'Blick -- schau weg von ${otherTarget}',
          fr: 'Regard -- Ne regardez pas ${otherTarget}',
          ja: '視線攻撃 -- ${otherTarget} を見ない',
          cn: '石化眼 -- 背对 ${otherTarget}',
          tc: '石化眼 -- 背對 ${otherTarget}',
          ko: '시선징 -- ${otherTarget}에게서 뒤돌기',
        },
        shriekOthers: {
          en: 'Look away from ${comboTargets}',
          de: 'Schau weg von ${comboTargets}',
          fr: 'Ne regardez pas ${comboTargets}',
          ja: '${comboTargets} を見ない',
          cn: '背对 ${comboTargets}',
          tc: '背對 ${comboTargets}',
          ko: '${comboTargets}에게서 뒤돌기',
        },
      },
    },
    {
      id: 'Queen Eternal Authoritys Hold Store',
      type: 'GainsEffect',
      netRegex: { effectId: '1022', capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.bombLater!(),
      outputStrings: {
        bombLater: {
          en: 'Acceleration Bomb soon',
          de: 'Bald: Beschleunigungsbombe',
          fr: 'Bombe d\'accélération bientôt',
          ja: 'まもなく加速度爆弾',
          cn: '稍后 加速度炸弹',
          tc: '稍後 加速度炸彈',
          ko: '곧 가속도 폭탄',
        },
      },
    },
    {
      id: 'Queen Eternal Authoritys Hold Resolve',
      type: 'GainsEffect',
      netRegex: { effectId: '1022', capture: true },
      condition: Conditions.targetIsYou(),
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 4,
      response: Responses.stopEverything(),
    },
    {
      id: 'Queen Eternal Absolute Authority Raidwide',
      type: 'StartsUsing',
      netRegex: { id: '9A6B', source: 'Queen Eternal', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Queen Eternal Absolute Authority Flares',
      type: 'HeadMarker',
      netRegex: { id: '0147', capture: true },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.flareMarker!(),
      outputStrings: {
        flareMarker: {
          en: 'Flare on YOU',
          de: 'Flare auf DIR',
          fr: 'Brasier sur VOUS',
          ja: 'フレア処理',
          cn: '核爆点名',
          tc: '核爆點名',
          ko: '플레어 대상자',
        },
      },
    },
    {
      id: 'Queen Eternal Absolute Authority Doritos',
      type: 'HeadMarker',
      netRegex: { id: '0037', capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.doritoStack(),
    },
    {
      id: 'Queen Eternal Dynastic Diadem',
      type: 'StartsUsing',
      netRegex: { id: '9C7A', source: 'Queen Eternal', capture: false },
      response: Responses.getUnder(),
    },
    {
      id: 'Queen Eternal Royal Banishment AOE',
      type: 'StartsUsing',
      netRegex: { id: '8F24', source: 'Queen Eternal', capture: false },
      durationSeconds: 30,
      infoText: (_data, _matches, output) => output.fiveAOE!(),
      outputStrings: {
        fiveAOE: {
          en: '5x AoEs',
          de: '5x AoEs',
          fr: '5x AoEs',
          ja: '5連続AoE',
          cn: 'AoE (5次)',
          tc: 'AoE (5次)',
          ko: '전체공격 (5x)',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Queen Eternal': 'Ewig(?:e|er|es|en) Königin',
      },
      'replaceText': {
        '\\(abandonment\\)': '(Rote Dreiecke sammeln)',
        '\\(all\\)': '(alle)',
        '\\(cast\\)': '(wirken)',
        '\\(cones\\)': '(Kegel)',
        '\\(flare\\)': '(Flare)',
        '\\(gaze\\)': '(Blick)',
        '\\(pre-cast\\)': '(vor-wirken)',
        '\\(puddles\\)': '(Flächen)',
        '\\(raidwide\\)': '(raidweit)',
        '\\(single\\)': '(einzel)',
        '\\(stun\\)': '(Betäubung)',
        'Absolute Authority': 'Absolute Autorität',
        'Aethertithe': 'Ätherzehnt',
        'Authority\'s Hold': 'Raumkontrolle: Ausbremsung',
        'Besiegement': 'Durchschlag',
        'Brutal Crown': 'Herrschaftsgewalt',
        'Castellation': 'Kastellierung',
        'Coronation': 'Krönung',
        'Divide and Conquer': 'Teile und Herrsche',
        'Downburst': 'Fallböe',
        'Dynastic Diadem': 'Dynastisches Diadem',
        'Legitimate Force': 'Legitime Herrschaft',
        'Morning Stars': '',
        'Powerful Gust': 'Starke Bö',
        'Prosecution Of War': 'Kriegsklagen',
        'Royal Banishment': 'Königliche Verbannung',
        'Royal Domain': 'Hoheitsgebiet',
        'Ruthless Regalia': 'Unbarmherzigkeit der Krone',
        'Virtual Shift': 'Virtueller Umschwung',
        'Waltz of the Regalia': 'Insignienwalzer',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Queen Eternal': 'Reine Éternité',
      },
      'replaceText': {
        'Absolute Authority': 'Autorité absolue',
        'Aethertithe': 'Dîme d\'éther',
        'Authority\'s Hold': 'Soumission absolue : explosion',
        'Besiegement': 'Impact intense',
        'Brutal Crown': 'Règne impitoyable',
        'Castellation': 'Fortification',
        'Coronation': 'Déploiement',
        'Divide and Conquer': 'Diviser pour mieux régner',
        'Downburst': 'Rafale descendante',
        'Dynastic Diadem': 'Diadème dynastique',
        'Legitimate Force': 'Force légitime',
        'Morning Stars': '',
        'Powerful Gust': 'Rafale latérale',
        'Prosecution Of War': 'Réquisitoire guerrier',
        'Royal Banishment': 'Bannissement royal',
        'Royal Domain': 'Domaine royal',
        'Ruthless Regalia': 'Monarchie brutale',
        'Virtual Shift': 'Transfert virtuel',
        'Waltz of the Regalia': 'Valse régalienne',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Queen Eternal': 'エターナルクイーン',
      },
      'replaceText': {
        'Absolute Authority': 'アブソリュート・オーソリティ',
        'Aethertithe': 'エーテルレヴィー',
        'Authority\'s Hold': '空間掌握：制動',
        'Besiegement': '激突',
        'Brutal Crown': 'ブルータルレガリア',
        'Castellation': 'キャスタレーション',
        'Coronation': '端末射出',
        'Divide and Conquer': 'ディバイド・アンド・コンカー',
        'Downburst': 'ダウンバースト',
        'Dynastic Diadem': 'サークレットフォース',
        'Legitimate Force': 'レジティメート・フォース',
        'Morning Stars': '',
        'Powerful Gust': '強風',
        'Prosecution Of War': 'プロセキューション・ウォー',
        'Royal Banishment': 'バニッシュレイ',
        'Royal Domain': 'ロイヤルドメイン',
        'Ruthless Regalia': 'ルースレスレガリア',
        'Virtual Shift': 'ヴァーチャルシフト',
        'Waltz of the Regalia': 'レガリア・ワルツ',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Queen Eternal': '永恒女王',
      },
      'replaceText': {
        '\\(abandonment\\)': '(孤独感)',
        '\\(all\\)': '(全体)',
        '\\(cast\\)': '(咏唱)',
        '\\(cones': '(锥形',
        '\\(flare\\)': '(核爆)',
        '\\(gaze\\)': '(石化光)',
        '\\(pre-cast\\)': '(预咏唱)',
        '\\(puddles': '(放圈',
        '\\(raidwide\\)': '(全域)',
        '\\(single\\)': '(单体)',
        '\\(stun\\)': '(眩晕)',
        'Absolute Authority': '绝对君权',
        'Aethertithe': '以太税',
        'Authority\'s Hold': '空间掌控：制动',
        'Besiegement': '激突',
        'Brutal Crown': '王权残暴',
        'Castellation': '护城墙',
        'Coronation': '终端发射',
        'Divide and Conquer': '分治法',
        'Downburst': '下行突风',
        'Dynastic Diadem': '王冠之力',
        'Legitimate Force': '合法武力',
        'Morning Stars': '黎明的群星',
        'Powerful Gust': '强风',
        'Prosecution Of War': '诉诸武力',
        'Royal Banishment': '放逐射线',
        'Royal Domain': '王土',
        'Ruthless Regalia': '王法无情',
        'Virtual Shift': '虚景切换',
        'Waltz of the Regalia': '王权圆舞曲',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Queen Eternal': '이터널 퀸',
      },
      'replaceText': {
        '\\(abandonment\\)': '(삼각형 징)',
        '\\(all\\)': '(전부)',
        '\\(cast\\)': '(시전)',
        '\\(cones': '(삼각형',
        '\\(flare\\)': '(플레어)',
        '\\(gaze\\)': '(석화)',
        '\\(pre-cast\\)': '(시전)',
        '\\(puddles': '(장판',
        '\\(raidwide\\)': '(전체공격)',
        '\\(single\\)': '(개인)',
        '\\(stun\\)': '(기절)',
        'Absolute Authority': '절대 권력',
        'Aethertithe': '에테르 징수',
        'Authority\'s Hold': '공간 장악: 제동',
        'Besiegement': '격돌',
        'Brutal Crown': '잔혹한 왕권',
        'Castellation': '성채 구축',
        'Coronation': '단말 사출',
        'Divide And Conquer': '분할 정복',
        'Downburst': '하강 기류',
        'Dynastic Diadem': '왕관의 힘',
        'Legitimate Force': '정당한 힘',
        'Morning Stars': '여명의 유성우',
        'Powerful Gust': '강풍',
        'Prosecution Of War': '전쟁 시행',
        'Royal Banishment': '추방 광선',
        'Royal Domain': '왕국령',
        'Ruthless Regalia': '무자비한 왕권',
        'Virtual Shift': '가상 공간 전환',
        'Waltz of the Regalia': '왕가의 무곡',
      },
    },
  ],
};

export default triggerSet;
