import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

// TODO: trash triggers

export type Data = OopsyData;

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.YuweyawataFieldStation,
  damageWarn: {
    // ---------------- Lindblum Zaghnal ---------------- //
    'Yuweyawata Lindblum Zaghnal Line Voltage 1': '9EB1', // line aoes from pillar
    'Yuweyawata Lindblum Zaghnal Cell Shock': '9EB2', // circular pillar falling aoe
    'Yuweyawata Lindblum Zaghnal Line Voltage 2': '9EB3', // fat line aoes from pillar
    'Yuweyawata Lindblum Zaghnal Lightning Bolt': '9EBE', // circular ground aoe
    'Yuweyawata Lindblum Zaghnal Line Voltage 3': 'A0A2', // line aoes from pillar

    // ---------------- Overseer Kanilokka ---------------- //
    'Yuweyawata Overseer Kanilokka Soulweave 1': '9EC1', // line aoe
    'Yuweyawata Overseer Kanilokka Soulweave 2': '9EC2', // line aoe
    'Yuweyawata Overseer Kanilokka Phantom Flood': '9EC4', // donut aoe
    'Yuweyawata Overseer Kanilokka Dark II 1': '9ED0', // cone aoe
    'Yuweyawata Overseer Kanilokka Dark II 2': '9ED1', // cone aoe

    // ---------------- Lunipyati ---------------- //
    'Yuweyawata Lunipyati Leaping Earth': '9E9E', // radiating spiral aoes
    'Yuweyawata Lunipyati Boulder Dance 1': '9E9F', // source aoe
    'Yuweyawata Lunipyati Boulder Dance 2': '9EA0', // target aoe
    'Yuweyawata Lunipyati Boulder Dance 3': '9EA1', // continuous damage from standing in aoe
    'Yuweyawata Lunipyati Rock Blast': '9EA3', // chasing aoe from boss around edge of arena
    'Yuweyawata Lunipyati Raging Claw 1': '9EA5', // first frontal cleave
    'Yuweyawata Lunipyati Raging Claw 2': '9EA6', // follow-up frontal cleaves
  },
  damageFail: {
    // ---------------- Lindblum Zaghnal ---------------- //
    'Yuweyawata Lindblum Zaghnal Electrify': '9EBA', // raidwide from adds (fail to kill in time)

    // ---------------- Lunipyati ---------------- //
    'Yuweyawata Lunipyati Crater Carve': '9E9D', // creates hole in center of arena
  },
  gainsEffectFail: {
    // ---------------- Overseer Kanilokka ---------------- //
    'Yuweyawata Overseer Kanilokka Bleeding 1': 'C05', // walked into bleed wall
    'Yuweyawata Overseer Kanilokka Bleeding 2': 'C06', // walked into bleed wall
    'Yuweyawata Overseer Kanilokka Damage Down 1': '1112', // walked into bleed wall
    'Yuweyawata Overseer Kanilokka Damage Down 2': '1113', // walked into bleed wall
    'Yuweyawata Overseer Kanilokka Heavy': '10F5', // walked into bleed wall

    // ---------------- Lunipyati ---------------- //
    'Yuweyawata Lunipyati Sludge 1': 'BFF', // walked into bleed wall
    'Yuweyawata Lunipyati Sludge 2': 'C00', // walked into bleed wall
  },
  shareWarn: {
    // ---------------- Lindblum Zaghnal ---------------- //
    'Yuweyawata Lindblum Zaghnal Lightning Storm': '9EBD', // spread

    // ---------------- Overseer Kanilokka ---------------- //
    'Yuweyawata Overseer Kanilokka Telltale Tears': '9EC9', // spread

    // ---------------- Lunipyati ---------------- //
    'Yuweyawata Lunipyati Jagged Edge': '9EA7', // spread
  },
  soloWarn: {
    // ---------------- Overseer Kanilokka ---------------- //
    'Yuweyawata Overseer Kanilokka Soul Douse': '9ECB', // stack

    // ---------------- Lunipyati ---------------- //
    'Yuweyawata Lunipyati Turali Stone IV': '9EA8', // stack
  },
};

export default triggerSet;
