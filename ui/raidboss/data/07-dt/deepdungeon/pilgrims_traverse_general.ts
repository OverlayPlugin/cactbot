import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// Triggers applicable to all Pilgrim's Traverse floors.

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'PilgrimsTraverseGeneral',
  zoneId: [
    ZoneId.PilgrimsTraverseStones1_10,
    ZoneId.PilgrimsTraverseStones11_20,
    ZoneId.PilgrimsTraverseStones21_30,
    ZoneId.PilgrimsTraverseStones31_40,
    ZoneId.PilgrimsTraverseStones41_50,
    ZoneId.PilgrimsTraverseStones51_60,
    ZoneId.PilgrimsTraverseStones61_70,
    ZoneId.PilgrimsTraverseStones71_80,
    ZoneId.PilgrimsTraverseStones81_90,
    ZoneId.PilgrimsTraverseStones91_100,
  ],
  zoneLabel: {
    en: 'Pilgrim\'s Traverse (All Stones)',
    de: 'Pilgers Pfad (Alle Steine)',
    cn: '朝圣交错路 (全朝圣路)',
    tc: '朝聖交錯路 (全朝聖路)',
    ko: '노르브란트 순례길 (전 구간)',
  },

  triggers: [
    // ---------------- Mimics ----------------
    {
      id: 'PT General Mimic Spawn',
      // 14264 = Mimic (floor 1-30 bronze chests, can stun or interrupt)
      // 14265 = Mimic (floor 31-60 silver chests, can stun or interrupt)
      // 14266 = Mimic (floor 61+ gold chests, can interrupt, immune to stun)
      // TODO: some Mimics may spawn after transference between floors and get called early before being found
      type: 'AddedCombatant',
      netRegex: { npcNameId: ['14264', '14265', '14266'], capture: false },
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
      id: 'PT General Mimic Malice',
      // inflicts Accursed Pox (43F) if not interrupted
      type: 'StartsUsing',
      netRegex: { id: 'AF34', source: 'Mimic' },
      response: Responses.interruptIfPossible(),
    },
    // ---------------- Pomanders and Juniper Incense ----------------
    {
      id: 'PT General Pomander Duplicate',
      // duplicate item message: https://v2.xivapi.com/api/sheet/LogMessage/7222
      // en: You return the pomander of ${pomander} to the coffer. You cannot carry any more of that item.
      type: 'SystemLogMessage',
      netRegex: { id: '1C36' },
      infoText: (_data, matches, output) => {
        switch (parseInt(matches.param1, 16)) {
          case 1:
            return output.duplicate!({ pomander: output.safety!() });
          case 2:
            return output.duplicate!({ pomander: output.sight!() });
          case 3:
            return output.duplicate!({ pomander: output.strength!() });
          case 4:
            return output.duplicate!({ pomander: output.steel!() });
          case 5:
            return output.duplicate!({ pomander: output.affluence!() });
          case 6:
            return output.duplicate!({ pomander: output.flight!() });
          case 7:
            return output.duplicate!({ pomander: output.alteration!() });
          case 8:
            return output.duplicate!({ pomander: output.purity!() });
          case 9:
            return output.duplicate!({ pomander: output.fortune!() });
          case 10:
            return output.duplicate!({ pomander: output.witching!() });
          case 11:
            return output.duplicate!({ pomander: output.serenity!() });
          case 14:
            return output.duplicate!({ pomander: output.intuition!() });
          case 15:
            return output.duplicate!({ pomander: output.raising!() });
          case 36:
            return output.duplicate!({ pomander: output.haste!() });
          case 37:
            return output.duplicate!({ pomander: output.purification!() });
          case 38:
            return output.duplicate!({ pomander: output.devotion!() });
          default:
            return output.duplicate!({ pomander: output.unknown!() });
        }
      },
      outputStrings: {
        duplicate: {
          en: '${pomander} duplicate',
          de: 'Doppelter ${pomander}',
          fr: '${pomander} dupliqué(e)',
          ja: '${pomander} 被り',
          cn: '${pomander} 重复',
          tc: '${pomander} 重複',
          ko: '${pomander} 중복',
        },
        // pomanders: https://v2.xivapi.com/api/sheet/DeepDungeonItem
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
        haste: {
          en: 'Haste',
          de: 'Hast',
          fr: 'Hâte',
          ja: 'ヘイスト',
          cn: '加速',
          tc: '加速',
        },
        purification: {
          en: 'Purification',
          de: 'Reinigung',
          fr: 'Purification',
          ja: '浄化の守り',
          cn: '净化护符',
          tc: '淨化護符',
        },
        devotion: {
          en: 'Devotion',
          de: 'Weisung',
          fr: 'Dévotion',
          ja: '巡礼の導き',
          cn: '朝圣的指引',
          tc: '朝聖的指引',
        },
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'PT General Incense Duplicate',
      // two different SystemLogMessage depending on which incense
      // duplicate incense message 1: https://v2.xivapi.com/api/sheet/LogMessage/9208
      // duplicate incense message 2: https://v2.xivapi.com/api/sheet/LogMessage/10287
      // en: You return the piece of ${incense} incense to the coffer. You cannot carry any more of that item.
      type: 'SystemLogMessage',
      netRegex: { id: ['23F8', '282F'] },
      infoText: (_data, matches, output) => {
        const id = matches.id;
        const param1 = parseInt(matches.param1, 16);

        // incense items are in two different tables: DeepDungeonDemiclone and DeepDungeonMagicStone
        // https://v2.xivapi.com/api/sheet/DeepDungeonDemiclone
        // https://v2.xivapi.com/api/sheet/DeepDungeonMagicStone
        if (id === '23F8' && param1 === 5) {
          // incense is from DeepDungeonMagicStone
          return output.duplicate!({ incense: output.poisonfruit!() });
        }

        if (id === '282F') {
          // incense is from DeepDungeonDemiclone
          switch (param1) {
            case 4:
              return output.duplicate!({ incense: output.mazeroot!() });
            case 5:
              return output.duplicate!({ incense: output.barkbalm!() });
          }
        }

        return output.duplicate!({ incense: output.unknown!() });
      },
      outputStrings: {
        duplicate: {
          en: '${incense} duplicate',
          de: 'Doppelter ${incense}',
          fr: '${incense} dupliqué(e)',
          ja: '${incense} 被り',
          cn: '${incense} 重复',
          tc: '${incense} 重複',
          ko: '${incense} 중복',
        },
        mazeroot: {
          en: 'Mazeroot',
          de: 'Wandelwurz',
          fr: 'Sagacité',
          ja: '明敏',
          cn: '敏慧',
          tc: '敏慧',
        },
        barkbalm: {
          en: 'Barkbalm',
          de: 'Sakralharz',
          fr: 'Quiétude',
          ja: '安寧',
          cn: '安宁',
          tc: '安寧',
        },
        poisonfruit: {
          en: 'Poisonfruit',
          de: 'Todesbeeren',
          fr: 'Fatalité',
          ja: '宿命',
          cn: '宿命',
          tc: '宿命',
        },
        unknown: Outputs.unknown,
      },
    },
    // ---------------- Floor Notifications ----------------
    {
      id: 'PT General Pylon of Passage',
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
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Mimic': 'Mimik',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Mimic': 'Mimic',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Mimic': 'ミミック',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Mimic': '拟态怪',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Mimic': '미믹',
      },
    },
  ],
};

export default triggerSet;
