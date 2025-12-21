import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// Triggers applicable to all Eureka Orthos floors.

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'EurekaOrthosGeneral',
  zoneId: [
    ZoneId.EurekaOrthosFloors1_10,
    ZoneId.EurekaOrthosFloors11_20,
    ZoneId.EurekaOrthosFloors21_30,
    ZoneId.EurekaOrthosFloors31_40,
    ZoneId.EurekaOrthosFloors41_50,
    ZoneId.EurekaOrthosFloors51_60,
    ZoneId.EurekaOrthosFloors61_70,
    ZoneId.EurekaOrthosFloors71_80,
    ZoneId.EurekaOrthosFloors81_90,
    ZoneId.EurekaOrthosFloors91_100,
  ],
  zoneLabel: {
    en: 'Eureka Orthos (All Floors)',
    de: 'Eureka Orthos (Alle Ebenen)',
    fr: 'Eureka Orthos (Tout les étages)',
    ja: 'オルト・エウレカ (全層)',
    cn: '正统优雷卡 (全楼层)',
    tc: '正統優雷卡 (全樓層)',
    ko: '에우레카 오르토스 (전체 층)',
  },

  triggers: [
    // ---------------- Mimics ----------------
    {
      id: 'EO General Mimic Spawn',
      // 2566 = Mimic (appears to be same npcNameId all floors)
      // floor 1-30 bronze chests, can stun or interrupt
      // floor 31-60 silver chests, can stun or interrupt
      // floor 61+ gold chests, can interrupt, immune to stun
      // TODO: some Mimics may spawn after transference between floors and get called early before being found
      type: 'AddedCombatant',
      netRegex: { npcNameId: '2566', capture: false },
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Mimic spawned!',
          de: 'Mimik ist erschienen!',
          fr: 'Un mimic apparait !',
          ja: 'ミミック！',
          cn: '已生成 拟态怪!',
          tc: '已生成 擬態怪!',
          ko: '미믹 등장!',
        },
      },
    },
    {
      id: 'EO General Mimic Infatuation',
      // inflicts Accursed Pox (43F) if not interrupted
      type: 'StartsUsing',
      netRegex: { id: '801E', source: 'Mimic' },
      response: Responses.interruptIfPossible(),
    },
    // ---------------- Protomanders and Demiclones ----------------
    {
      id: 'EO General Protomander Duplicate',
      // duplicate protomander message: https://v2.xivapi.com/api/sheet/LogMessage/7222
      // en: You return the protomander of ${protomander} to the coffer. You cannot carry any more of that item.
      type: 'SystemLogMessage',
      netRegex: { id: '1C36' },
      infoText: (_data, matches, output) => {
        switch (parseInt(matches.param1, 16)) {
          case 20:
            return output.duplicate!({ protomander: output.lethargy!() });
          case 21:
            return output.duplicate!({ protomander: output.storms!() });
          case 22:
            return output.duplicate!({ protomander: output.dread!() });
          case 23:
            return output.duplicate!({ protomander: output.safety!() });
          case 24:
            return output.duplicate!({ protomander: output.sight!() });
          case 25:
            return output.duplicate!({ protomander: output.strength!() });
          case 26:
            return output.duplicate!({ protomander: output.steel!() });
          case 27:
            return output.duplicate!({ protomander: output.affluence!() });
          case 28:
            return output.duplicate!({ protomander: output.flight!() });
          case 29:
            return output.duplicate!({ protomander: output.alteration!() });
          case 30:
            return output.duplicate!({ protomander: output.purity!() });
          case 31:
            return output.duplicate!({ protomander: output.fortune!() });
          case 32:
            return output.duplicate!({ protomander: output.witching!() });
          case 33:
            return output.duplicate!({ protomander: output.serenity!() });
          case 34:
            return output.duplicate!({ protomander: output.intuition!() });
          case 35:
            return output.duplicate!({ protomander: output.raising!() });
          default:
            return output.duplicate!({ protomander: output.unknown!() });
        }
      },
      outputStrings: {
        duplicate: {
          en: '${protomander} duplicate',
          de: 'Doppelter ${protomander}',
          fr: '${protomander} dupliqué(e)',
          ja: '${protomander} 被り',
          cn: '${protomander} 重复',
          tc: '${protomander} 重複',
          ko: '${protomander} 중복',
        },
        // protomanders: https://v2.xivapi.com/api/sheet/DeepDungeonItem
        lethargy: {
          en: 'Lethargy',
          de: 'Trägheit',
          fr: 'Ralentissement',
          ja: 'スロウガ',
          cn: '缓速',
          tc: '緩速',
          ko: '슬로우가',
        },
        storms: {
          en: 'Storms',
          de: 'Schwäche',
          fr: 'Charybde',
          ja: 'ミールストーム',
          cn: '大漩涡',
          tc: '大漩渦',
          ko: '대소용돌이',
        },
        dread: {
          en: 'Dread',
          de: 'Macht',
          fr: 'Cuirassé Dreadnaught',
          ja: 'ドレッドノート化',
          cn: '恐慌装甲化',
          tc: '恐慌裝甲化',
          ko: '드레드노트 변신',
        },
        safety: {
          en: 'Safety',
          de: 'Siegelbruchs',
          fr: 'Désamorçage',
          ja: '呪印解除',
          cn: '咒印解除',
          tc: '咒印解除',
          ko: '함정 해제',
        },
        sight: {
          en: 'Sight',
          de: 'Sicht',
          fr: 'Localisation',
          ja: 'サイトロ',
          cn: '全景',
          tc: '全景',
          ko: '사이트로',
        },
        strength: {
          en: 'Strength',
          de: 'Stärkung',
          fr: 'Puissance',
          ja: '自己強化',
          cn: '强化自身',
          tc: '強化自身',
          ko: '자기 강화',
        },
        steel: {
          en: 'Steel',
          de: 'Abwehr',
          fr: 'Protection',
          ja: '防御強化',
          cn: '强化防御',
          tc: '強化防禦',
          ko: '방어 강화',
        },
        affluence: {
          en: 'Affluence',
          de: 'Schätze',
          fr: 'Décèlement',
          ja: '宝箱増加',
          cn: '宝箱增加',
          tc: '寶箱增加',
          ko: '보물상자 증가',
        },
        flight: {
          en: 'Flight',
          de: 'Feindtods',
          fr: 'Sécurisation',
          ja: '敵排除',
          cn: '减少敌人',
          tc: '減少敵人',
          ko: '적 감소',
        },
        alteration: {
          en: 'Alteration',
          de: 'Feindwandlung',
          fr: 'Affaiblissement',
          ja: '敵変化',
          cn: '改变敌人',
          tc: '改變敵人',
          ko: '적 대체',
        },
        purity: {
          en: 'Purity',
          de: 'Entzauberung',
          fr: 'Anti-maléfice',
          ja: '解呪',
          cn: '解咒',
          tc: '解咒',
          ko: '저주 해제',
        },
        fortune: {
          en: 'Fortune',
          de: 'Glücks',
          fr: 'Chance',
          ja: '運気上昇',
          cn: '运气上升',
          tc: '運氣上升',
          ko: '운 상승',
        },
        witching: {
          en: 'Witching',
          de: 'Wandlung',
          fr: 'Mutation',
          ja: '形態変化',
          cn: '形态变化',
          tc: '形態變化',
          ko: '적 변형',
        },
        serenity: {
          en: 'Serenity',
          de: 'Enthexung',
          fr: 'Dissipation',
          ja: '魔法効果解除',
          cn: '魔法效果解除',
          tc: '魔法效果解除',
          ko: '마법 효과 해제',
        },
        intuition: {
          en: 'Intuition',
          de: 'Finders',
          fr: 'Intuition',
          ja: '財宝感知',
          cn: '感知宝藏',
          tc: '感知寶藏',
          ko: '보물 탐지',
        },
        raising: {
          en: 'Raising',
          de: 'Lebens',
          fr: 'Résurrection',
          ja: 'リレイズ',
          cn: '重生',
          tc: '重生',
          ko: '리레이즈',
        },
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'EO General Demiclone Duplicate',
      // duplicate demiclone message: https://v2.xivapi.com/api/sheet/LogMessage/10287
      // en: You return the ${demiclone} demiclone to the coffer. You cannot carry any more of that item.
      type: 'SystemLogMessage',
      netRegex: { id: '282F' },
      infoText: (_data, matches, output) => {
        switch (parseInt(matches.param1, 16)) {
          case 1:
            return output.duplicate!({ demiclone: output.unei!() });
          case 2:
            return output.duplicate!({ demiclone: output.doga!() });
          case 3:
            return output.duplicate!({ demiclone: output.onion!() });
          default:
            return output.duplicate!({ demiclone: output.unknown!() });
        }
      },
      outputStrings: {
        duplicate: {
          en: '${demiclone} duplicate',
          de: 'Doppelter ${demiclone}',
          fr: '${demiclone} dupliqué(e)',
          ja: '${demiclone} 被り',
          cn: '${demiclone} 重复',
          tc: '${demiclone} 重複',
          ko: '${demiclone} 중복',
        },
        // demiclones: https://v2.xivapi.com/api/sheet/DeepDungeonDemiclone
        unei: {
          en: 'Unei',
          de: 'Unei',
          fr: 'Unéi',
          ja: 'ウネ',
          cn: '乌内',
          tc: '烏內',
          ko: '우네',
        },
        doga: {
          en: 'Doga',
          de: 'Doga',
          fr: 'Doga',
          ja: 'ドーガ',
          cn: '多加',
          tc: '多加',
          ko: '도가',
        },
        onion: {
          en: 'Onion Knight',
          de: 'Zwiebelritter',
          fr: 'Chevalier Oignon',
          ja: 'オニオンナイト',
          cn: '洋葱剑士',
          tc: '洋蔥劍士',
          ko: '양파 기사',
        },
        unknown: Outputs.unknown,
      },
    },
    // ---------------- Floor Notifications ----------------
    {
      id: 'EO General Pylon of Passage',
      // portal to transfer between floors
      // Pylon of Passage activation message: https://v2.xivapi.com/api/sheet/LogMessage/7245
      // en: The Pylon of Passage is activated!
      type: 'SystemLogMessage',
      netRegex: { id: '1C4D', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Pylon of Passage activated',
          de: 'Translokator aktiviert',
          fr: 'Pylone de téléportation activé',
          ja: '転移が出来ます',
          cn: '传送装置已启动',
          tc: '傳送裝置已啟動',
          ko: '전송장치 활성화',
        },
      },
    },
    // ---------------- Dread Beasts ----------------
    // 12322 = Lamia Queen
    // 12323 = Meracydian Clone
    // 12324 = Demi-Cochma
    {
      id: 'EO General Lamia Queen Petrifaction',
      // gaze, inflicts Stone Curse (1B5)
      type: 'StartsUsing',
      netRegex: { id: '7FD1', source: 'Lamia Queen', capture: false },
      response: Responses.lookAway('alert'),
    },
    {
      id: 'EO General Meracydian Clone Berserk',
      // gains Damage Up (1BB)
      type: 'StartsUsing',
      netRegex: { id: '7FCB', source: 'Meracydian Clone' },
      response: Responses.interruptIfPossible(),
    },
    {
      id: 'EO General Meracydian Clone Allagan Meteor',
      // gaze, inflicts Stone Curse (1B5)
      type: 'StartsUsing',
      netRegex: { id: '7FCE', source: 'Meracydian Clone', capture: false },
      response: Responses.getOut(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Lamia Queen': 'Lamia-Königin',
        'Meracydian Clone': 'meracydisch(?:e|er|es|en) Klon',
        'Mimic': 'Mimik',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Lamia Queen': 'Reine lamia',
        'Meracydian Clone': 'Clone de Méracydien',
        'Mimic': 'Mimic',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Lamia Queen': 'ラミアクィーン',
        'Meracydian Clone': 'メラシディアン・クローン',
        'Mimic': 'ミミック',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Lamia Queen': '拉米亚女王',
        'Meracydian Clone': '美拉西迪亚复制体',
        'Mimic': '拟态怪',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Lamia Queen': '라미아 여왕',
        'Meracydian Clone': '메라시디안 클론',
        'Mimic': '미믹',
      },
    },
  ],
};

export default triggerSet;
