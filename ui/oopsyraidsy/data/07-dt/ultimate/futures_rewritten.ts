import NetRegexes from '../../../../../resources/netregexes';
import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';
import { GetShareMistakeText, GetSoloMistakeText } from '../../../oopsy_common';

export type Data = OopsyData;

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.FuturesRewrittenUltimate,
  damageWarn: {
    'FRU P1 Cyclonic Break': '9CD2', // P1 Cyclonic Break follow-up
    'FRU P1 Burnt Strike Boss 1': '9CC1', // P1 Burnt Strike (fire, by Fatebreaker)
    'FRU P1 Burnt Strike Boss 2': '9CC5', // P1 Burnt Strike (thunder, by Fatebreaker)
    'FRU P1 Burnt Strike Clone 1': '9CE1', // P1 Burnt Strike (fire, by Fatebreaker's Image)
    'FRU P1 Burnt Strike Clone 2': '9CE3', // P1 Burnt Strike (thunder, by Fatebreaker's Image)
    'FRU P1 Burnout Thunder Boss': '9CC6', // P1 Burnt Strike thunder follow-up (by Fatebreaker)
    'FRU P1 Burnout Thunder Clone': '9CE4', // P1 Burnt Strike thunder follow-up (by Fatebreaker's Image)
    'FRU P1 Blasting Zone': '9CDD', // P1 Blasting Zone (Utopian Sky line AOE)
    'FRU P1 Brightfire Puddle 1': '9CD8', // P1 Brightfire (fire, thunder puddle)
    'FRU P1 Brightfire Puddle 2': '9CD9', // P1 Brightfire (fire, thunder puddle)
    'FRU P2 Icicle Impact': '9D06', // P2 Icicle Impact
    'FRU P2 Axe Kick': '9D0A', // P2 Axe Kick
    'FRU P2 Scythe Kick': '9D0B', // P2 Scythe Kick
    'FRU P2 Frigid Needle': '9D09', // P2 Frigid Needle (star-shaped AOE)
    'FRU P2 Twin Stillness 1': '9D01', // P2 Twin Stillness 1st
    'FRU P2 Twin Stillness 2': '9D04', // P2 Twin Stillness 2nd
    'FRU P2 Twin Silence 1': '9D02', // P2 Twin Silence 1st
    'FRU P2 Twin Silence 2': '9D03', // P2 Twin Silence 2nd
    'FRU P2 Reflected Scythe Kick 1': '9D0C', // P2 Reflected Scythe Kick
    'FRU P2 Reflected Scythe Kick 2': '9D0D', // P2 Reflected Scythe Kick
    'FRU P2 Holy Light Explosion': '9D1B', // P2 Explosion from Holy Light
    'FRU P2.5 Crystal of Light Hiemal Storm': '9D40', // P2.5 Crystal of Light puddle
    'FRU P2.5 Crystal of Darkness Sinbound Blizzard III': '9D46', // P2.5 Crystal of Darkness cone
    'FRU Dark Blizzard III': '9D57', // P3, P4 Dark Blizzard III
    'FRU P3 Hourglass Sinbound Meltdown After 1st Hit': '9D64', // P3 Hourglass beam (after 1st hit)
    'FRU P3 Apocalypse': '9D69', // P3 Apocalypse
    'FRU P4 Akh Rhai': '9D2E', // P4 Akh Rhai
    'FRU P4 Hallowed Wings 1': '9D23', // P4 Dragonsong Hallowed Wings
    'FRU P4 Hallowed Wings 2': '9D24', // P4 Dragonsong Hallowed Wings
    'FRU P4 Hourglass Maelstrom': '9D6B', // P4 Crystallize Time hourglass
    'FRU P4 Tidal Light Exaflare 1': '9D3C', // P4 Crystallize Time exaflare
    'FRU P4 Tidal Light Exaflare 2': '9D3D', // P4 Crystallize Time exaflare
    'FRU P5 Path of Light Exaflare': '9D74', // P5 Fulgent Blade exaflare
    'FRU P5 Path of Darkness Exaflare': '9D75', // P5 Fulgent Blade exaflare
    'FRU P5 Cruel Path of Light Polarizing Paths Follow-up': '9CB7', // P5 Polarizing Paths follow-up
    'FRU P5 Cruel Path of Darkness Polarizing Paths Follow-up': '9CB8', // P5 Polarizing Paths follow-up
  },
  damageFail: {
    'FRU P1 Unmitigated Explosion': '9CC4', // P1 tower fail
    'FRU P5 Unmitigated Explosion': '9D81', // P5 tower fail
    'FRU Refulgent Fate Tether Break': '9D17', // P2, P4 tether break
  },
  gainsEffectWarn: {
    'FRU Damage Down': 'B5F',
    'FRU Bleeding': 'C05', // standing in the puddle.
    'FRU Doom': '9D4',
  },
  gainsEffectFail: {
    'FRU Mark of Mortality': '1114', // stack fail debuff
  },
  shareWarn: {
    'FRU P1 Sinsmite Spread': '9CD5', // P1 spread during Cyclonic Break
    'FRU P1 Sinbound Thunder III Spread': '9CE0', // P1 spread during Utopian Sky
    'FRU P1 Bow Shock': '9CCF', // P1 Bow Shock (tethered thunder)
    'FRU P2 House of Light': '9D0E', // P2 House of Light during Diamond Dust, Mirror Mirror
    'FRU P2 Banish III Divided Spread': '9D1F', // P2 Banish III Divided (spread)
    'FRU P3 Sinbound Meltdown 1st Hit': '9D2B', // P3 Hourglass beam 1st hit
    'FRU P3 Dark Fire III Marker': '9D54', // P3 Dark Fire III
    'FRU Dark Eruption': '9D52', // P3, P4 Dark Eruption
    'FRU Spirit Taker': '9D61', // P3, P4 Spirit Taker
    'FRU P4 Drachen Wanderer Longing of the Lost': '9D31', // P4 Crystallize Time dragon explosion
  },
  shareFail: {
    'FRU Lightsteeped House of Light': '9CFC', // P2 House of Light after Light Rampant, P4 House of Light
    'FRU P3 Darkest Dance Tank Cleave': '9CF6', // P3 Darkest Dance tank buster
    'FRU P4 Somber Dance 1st Farthest': '9D5C', // P4 Somber Dance 1st
    'FRU P4 Somber Dance 2nd Nearest': '9D5D', // P4 Somber Dance 2nd
    'FRU P5 Wings Dark and Light Cleave 1': '9D7A', // P5 Wings Dark and Light cleave
    'FRU P5 Wings Dark and Light Cleave 2': '9D7B', // P5 Wings Dark and Light cleave
    'FRU P5 Wings Dark and Light Tether 1': '9BC7', // P5 Wings Dark and Light tether
    'FRU P5 Wings Dark and Light Tether 2': '9BC8', // P5 Wings Dark and Light tether
  },
  soloWarn: {
    'FRU P1 Sinsmoke Stack': '9CD3', // P1 stack during Cyclonic Break
    'FRU P2 Banish III Stack': '9D1E', // P2 Banish III (stack)
  },
  triggers: [
    {
      id: 'FRU Knockback',
      type: 'Ability',
      // 9CC2 = P1 Blastburn (by Fatebreaker)
      // 9CE2 = P1 Blastburn (by Fatebreaker's Image)
      // 9D0F = P2 Heavenly Strike
      netRegex: NetRegexes.ability({ id: ['9CC2', '9CE2', '9D0F'] }),
      deathReason: (_data, matches) => {
        return {
          id: matches.targetId,
          name: matches.target,
          text: {
            en: 'Pushed into wall',
            de: 'Rückstoß in die Wand',
            fr: 'Poussé(e) dans le mur',
            ja: '壁へノックバック',
            cn: '击退至墙',
            ko: '벽으로 넉백',
            tc: '擊退至牆',
          },
        };
      },
    },
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
    {
      id: 'FRU Lightsteeped Count',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: '8D1', count: '05' }),
      mistake: (_data, matches) => {
        return {
          type: 'fail',
          blame: matches.target,
          reportId: matches.targetId,
          text: matches.effect,
        };
      },
    },
  ],
};

export default triggerSet;
