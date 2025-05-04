import NetRegexes from '../../../../../resources/netregexes';
import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';
import { GetShareMistakeText, GetSoloMistakeText } from '../../../oopsy_common';

export type Data = OopsyData;

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.FuturesRewrittenUltimate,
  damageWarn: {
    'FRU Cyclonic Break': '9CD2', // P1 Cyclonic Break follow-up
    'FRU Burnt Strike': '9CE1', // P1 Burnt Strike
    'FRU Blastburn': '9CE2', // P1 Blastburn
    'FRU Blasting Zone': '9CDD', // P1 Blasting Zone
    'FRU Brightfire 1': '9CD8', // P1 Brightfire
    'FRU Brightfire 2': '9CD9', // P1 Brightfire
    'FRU Icicle Impact': '9D06', // P2 Icicle Impact
    'FRU Axe Kick': '9D0A', // P2 Axe Kick
    'FRU Scythe Kick': '9D0B', // P2 Scythe Kick
    'FRU Frigid Needle': '9D09', // P2 Frigid Needle
    'FRU Twin Stillness 1': '9D01', // P2 Twin Stillness 1st
    'FRU Twin Stillness 2': '9D04', // P2 Twin Stillness 2nd
    'FRU Twin Silence 1': '9D02', // P2 Twin Silence 1st
    'FRU Twin Silence 2': '9D03', // P2 Twin Silence 2nd
    'FRU Reflected Scythe Kick 1': '9D0C', // P2 Reflected Scythe Kick
    'FRU Reflected Scythe Kick 2': '9D0D', // P2 Reflected Scythe Kick
    'FRU Explosion': '9D1B', // P2 Explosion from Holy Light
    'FRU Hiemal Storm': '9D3F', // P2.5 Crystal of Light puddle
    'FRU Sinbound Blizzard III': '9D42', // P2.5 Crystal of Darkness cone
    'FRU Dark Blizzard III': '9D57', // P3, P4 Dark Blizzard III
    'FRU Sinbound Meltdown 1': '9D64', // P3 Hourglass beam (after 1st hit)
    'FRU Apocalypse': '9D69', // P3 Apocalypse
    'FRU Akh Rhai': '9D2D', // P4 Akh Rhai
    'FRU Hallowed Wings 1': '9D23', // P4 Dragonsong Hallowed Wings
    'FRU Hallowed Wings 2': '9D24', // P4 Dragonsong Hallowed Wings
    'FRU Maelstrom': '9D6B', // P4 Crystallize Time hourglass
    'FRU Tidal Light 1': '9D3C', // P4 Crystallize Time exaflare
    'FRU Tidal Light 2': '9D3D', // P4 Crystallize Time exaflare
    'FRU Path of Light': '9D74', // P5 Fulgent Blade exaflare
    'FRU Path of Darkness': '9D75', // P5 Fulgent Blade exaflare
    'FRU Cruel Path of Light': '9CB7', // P5 Polarizing Paths follow-up
    'FRU Cruel Path of Darkness': '9CB8', // P5 Polarizing Paths follow-up
  },
  damageFail: {
    'FRU Unmitigated Explosion 1': '9CC4', // P1 tower fail
    'FRU Unmitigated Explosion 2': '9D81', // P5 tower fail
    'FRU Refulgent Fate': '9D17', // P2, P4 tether break
    'FRU Lightsteep': '9D18', // P2, P4 debuff 5 stacks
  },
  gainsEffectFail: {
    'FRU Damage Down': 'B5F',
    'FRU Mark of Mortality': '1114', // stack fail debuff
    'FRU Doom': '9D4',
    //  There are 3 bleeding debuffs. B87 (Fatebreaker 15sec), C05 (9999sec) C06 (30sec).
    'FRU Bleeding': 'C05', // standing in the puddle.
  },
  shareWarn: {
    'FRU Sinsmite': '9CD5', // P1 spread during Cyclonic Break
    'FRU Sinbound Thunder III': '9CE0', // P1 spread during Utopian Sky
    'FRU Bow Shock': '9CCF', // P1 Bow Shock (tethered thunder)
    'FRU House of Light 1': '9D0E', // P2 House of Light during Diamond Dust, Mirror Mirror
    'FRU Banish III Divided': '9D1F', // P2 Banish III Divided (spread)
    'FRU Sinbound Meltdown 2': '9D2B', // P3 Hourglass beam 1st hit
    'FRU Dark Fire III': '9D54', // P3 Dark Fire III
    'FRU Dark Eruption': '9D52', // P3, P4 Dark Eruption
    'FRU Spirit Taker': '9D61', // P3, P4 Spirit Taker
    'FRU Longing of the Lost': '9D31', // P4 Crystallize Time dragon explosion
  },
  shareFail: {
    'FRU House of Light 2': '9CFC', // P2 House of Light after Light Rampant, P4 House of Light
    'FRU Darkest Dance': '9CF6', // P3 Darkest Dance tank buster
    'FRU Somber Dance 1': '9D5C', // P4 Somber Dance 1st
    'FRU Somber Dance 2': '9D5D', // P4 Somber Dance 2nd
    'FRU Wings Dark and Light 1': '9D7A', // P5 Wings Dark and Light cleave
    'FRU Wings Dark and Light 2': '9D7B', // P5 Wings Dark and Light cleave
    'FRU Wings Dark and Light 3': '9BC7', // P5 Wings Dark and Light tether
    'FRU Wings Dark and Light 4': '9BC8', // P5 Wings Dark and Light tether
  },
  soloWarn: {
    'FRU Sinsmoke': '9CD3', // P1 stack during Cyclonic Break
    'FRU Banish III': '9D1E', // P2 Banish III (stack)
  },
  triggers: [
    {
      id: 'FRU Stack Mistakes',
      type: 'Ability',
      // 9CDF = P1 Sinbound Fire III (stack during Utopian Sky)
      // 9CE7 = P1 Sinsmoke (stack with Floating Fetters after Utopian Sky)
      // 9CDC = P1 Sinblaze (tethered fire)
      // 9D19 = P2 Powerful Light (stack during Light Rampant)
      // 9D55 = P3, P4 Unholy Darkness
      // 9D4F = P3, P4 Dark Water III
      netRegex: NetRegexes.ability({
        id: ['9CDF', '9CE7', '9CDC', '9D19', '9D55', '9D4F'],
      }),
      mistake: (_data, matches) => {
        const expected = matches.id === '9D55' ? 5 : 4; // Unholy Darkness = 5, others = 4
        const actual = parseFloat(matches.targetCount);
        if (actual >= expected || actual === 0) {
          return;
        }
        const ability = matches.ability;
        const text = actual === 1
          ? GetSoloMistakeText(ability)
          : GetShareMistakeText(ability, actual);
        return { type: 'fail', blame: matches.target, text: text };
      },
    },
  ],
};

export default triggerSet;
