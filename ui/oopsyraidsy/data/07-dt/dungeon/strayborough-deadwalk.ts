import NetRegexes from '../../../../../resources/netregexes';
import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export type Data = OopsyData;

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.TheStrayboroughDeadwalk,
  damageWarn: {
    'Strayborough Deadwalk Stray Memory Grievous Slash': '998A', // Conal AoE
    'Strayborough Deadwalk Stray Memory Grim Remembrance': '998C', // Giant Conal AoE

    // Boss 1
    'Strayborough Deadwalk Leonogg Falling Nightmare': '8EB4', // Falling head circles
    'Strayborough Deadwalk Little Noble Overattachment': '8EB7', // Collision with noble adds
    'Strayborough Deadwalk Little Noble Falling Nightmare': '8EB8', // Falling head circles
    'Strayborough Deadwalk Leonogg Evil Scheme 1': '9B03', // Exaflares initial
    'Strayborough Deadwalk Leonogg Evil Scheme 2': '9B04', // Exaflares follow-up
    'Strayborough Deadwalk Leonogg Looming Nightmare 1': '9B06', // Chasing puddles, initial
    'Strayborough Deadwalk Leonogg Looming Nightmare 2': '9B07', // Chasing puddles, follow-ups
    'Strayborough Deadwalk Leonogg Scream': '8EB3', // Pizza slice AoEs

    'Strayborough Deadwalk Stray Memory Trick And Treat': '9796', // Circle AoEs from offscreen enemies
    'Strayborough Deadwalk Stray Rascal Ancient Aero': '998E', // Line AoE
    'Strayborough Deadwalk Stray Tiger Rush': '9991', // Line AoE
    'Strayborough Deadwalk Stray Elephant Trunk Tawse': '998F', // Conal AoE
    'Strayborough Deadwalk Skywheel Tilt-a-wheel': '998B', // Giant circle AoE, Ferris wheel environmental.

    // Boss 2
    'Strayborough Deadwalk Stray Phantagenitrix Tricksome Treat': '8F70', // Genie teacup explosion
    'Strayborough Deadwalk Jack-in-the-pot Mad Tea Party': '8F74', // Expanding teacup poison

    'Strayborough Deadwalk Stray Doll Heat Gaze Cone': '9993', // Long conal AoE
    'Strayborough Deadwalk Stray Doll Heat Gaze Dynamo': '9994', // Dynamo AoE
    'Strayborough Deadwalk Stray Glutton Dark Vomit': '9997', // Circle AoE
    'Strayborough Deadwalk Stray Table Set Impact': '8A91', // Line AoE

    // Boss 3
    'Strayborough Deadwalk Träumerei Bitter Regret Middle': '9113', // Middle line AoE
    'Strayborough Deadwalk Träumerei Bitter Regret Sides': '9114', // Side line AoEs
    'Strayborough Deadwalk Träumerei Impact': '910D', // Falling wall line AoEs
    'Strayborough Deadwalk Stray Phantagenitrix Bitter Regret': '91DC', // Small ghost line AoEs
  },
  gainsEffectWarn: {
    'Strayborough Deadwalk Stray Doll Terrifying Glance': '417', // Confused. Looking at the doll from within the gaze cone.
  },
  soloFail: {
    'Strayborough Deadwalk Träumerei Ghostcrusher Alone': '9117', // Stack laser
  },
  triggers: [
    {
      id: 'Strayborough Deadwalk Ill Intent',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: '6FD', source: 'Stray Geist' }), // Vulnerability Up
      mistake: (_data, matches) => {
        return {
          type: 'warn',
          blame: matches.target,
          reportId: matches.targetId,
          triggerType: 'GainsEffect',
          text: {
            en: 'Unstretched tether',
            de: 'Verbindung nicht langgezogen',
            fr: 'Lien non-étiré',
            cn: '连线未拉至变色',
            tc: '連線未拉至變色',
            ko: '충분히 멀어지지 않음',
          },
        };
      },
    },
    {
      id: 'Strayborough Deadwalk Ghostduster',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: '911C', source: 'Träumerei' }),
      deathReason: (_data, matches) => {
        return {
          type: 'fail',
          id: matches.targetId,
          name: matches.target,
          triggerType: 'Ability',
          text: matches.ability,
        };
      },
    },
    {
      id: 'Strayborough Deadwalk Fleshbuster',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: '911D', source: 'Träumerei' }),
      deathReason: (_data, matches) => {
        return {
          type: 'fail',
          id: matches.targetId,
          name: matches.target,
          triggerType: 'Ability',
          text: matches.ability,
        };
      },
    },
  ],
};

export default triggerSet;
