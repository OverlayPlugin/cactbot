import NetRegexes from '../../../../../resources/netregexes';
import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export type Data = OopsyData;

// The central orange line during Flatliner
// and the outer orange lines during the Crown of Arcadia
// that closes the split platform phase do not deal any damage.
// They are purely visuals to indicate the platform is disappearing,
// similar to ARR Titan.

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.AacHeavyweightM3,
  damageWarn: {
    'R11N Smashdown Axe': 'B3BB', // chariot AoE
    'R11N Smashdown Scythe': 'B3BD', // dynamo AoE
    'R11N Smashdown Sword': 'B3BF', // cross AoE
    'R11N Cometite': 'B3CA', // Void Stardust puddle
    'R11N Assault Evolved Axe': 'B3CE', // tether chariot AoE
    'R11N Assault Evolved Scythe': 'B3CF', // tether dynamo AoE
    'R11N Assault Evolved Sword': 'B3D0', // tether cross AoE
    'R11N Explosion Sword Quiver Diagonal': 'B3D3', // line AoEs after Dance of Domination
    'R11N Charybdis Knockback': 'B3D8', // tornado puddles, Assault Apex
    'R11N Powerful Gust': 'B3D9', // tornado cones, Assault Apex
    'R11N Unmitigated Explosion 1': 'B3DF', // meteor tower failure
    'R11N Unmitigated Explosion 2': 'B3E1', // meteor explosion (tank tether failure?)
    'R11N Shockwave': 'B3E6', // LoS failure on Double Tyrannhilation
    'R11N Majestic Meteor': 'B3EA', // meteor puddles
    'R11N Majestic Meteorain': 'B3EB', // portal meteor lasers
    'R11N Unmitigated Explosion Knockback Towers': 'B3EE', // knockback tower failure
    'R11N Arcadion Avalanche West Toss South': 'B3F0', // platform toss, east platform safe, north safe
    'R11N Arcadion Avalanche West Toss North': 'B3F2', // platform toss, east platform safe, south safe
    'R11N Arcadion Avalanche East Toss North': 'B3F4', // platform toss, west platform safe, south safe
    'R11N Arcadion Avalanche East Toss South': 'B3F6', // platform toss, west platform safe, north safe
    'R11N Fire And Fury Front': 'B3F8', // conal AoE, Majestic Meteor
    'R11N Fire And Fury Back': 'B3F9', // conal AoE, Majestic Meteor
    'R11N Explosion Great Wall Of Fire': 'B3FD', // tank laser follow-up
    'R11N Assault Apex Axe': 'B540', // 6x charge sequence chariot AoE
    'R11N Assault Apex Scythe': 'B541', // 6x charge sequence dynamo AoE
    'R11N Assault Apex Sword': 'B542', // 6x charge sequence cross AoE
    'R11N Explosion Sword Quiver Orthogonal': 'B7B9', // line AoEs after Dance of Domination
  },
  shareWarn: {
    'R11N Comet Initial': 'B3C9', // first Void Stardust spread
    'R11N Comet Subsequent': 'B3CB', // second/third Void Stardust spread
    'R11N Impact': 'B3C2', // purple spread circle
  },
  soloWarn: {
    'R11N Raw Steel': 'B3C1', // shared cleave
    'R11N Massive Meteor Stack': 'B3E3', // healer stack
    'R11N Massive Heartbreak Kick Initial': 'B3FF', // stack tower hit 1
    'R11N Massive Heartbreak Kick Subsequent': 'B400', // stack tower hits 2-6
    'R11N Great Wall Of Fire': 'B3FB', // laser buster
  },
  triggers: [
    {
      id: 'R11N Flatliner Ring Out',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: ['B3E8', 'BA8F'] }),
      deathReason: (_data, matches) => {
        return {
          id: matches.targetId,
          name: matches.target,
          text: {
            en: 'Pushed off!',
            de: 'Runter gestoßen!',
            fr: 'Repoussé(e) !',
            ja: 'ノックバック',
            cn: '击退坠落',
            ko: '넉백됨!',
            tc: '擊退墜落',
          },
        };
      },
    },
    {
      id: 'R11N Explosion Ring Out',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: 'B3ED' }),
      deathReason: (_data, matches) => {
        return {
          id: matches.targetId,
          name: matches.target,
          text: {
            en: 'Pushed off!',
            de: 'Runter gestoßen!',
            fr: 'Repoussé(e) !',
            ja: 'ノックバック',
            cn: '击退坠落',
            ko: '넉백됨!',
            tc: '擊退墜落',
          },
        };
      },
    },
  ],
};

export default triggerSet;
