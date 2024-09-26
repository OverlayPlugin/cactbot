import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export type Data = OopsyData;

// TODO: Add trigger for missing Duty's Edge (party stack)

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.Everkeep,
  damageWarn: {
    'ZoraalJa Double-Edged Swords': '9352', // half-room cleave
    'ZoraalJa Shadow Burst': '934D', // exploding adds - circle AoEs
    'ZoraalJa Vorpal Trail 1': '9528', // collapsing swords - first set
    'ZoraalJa Vorpal Trail 2': '9350', // collapsing swords - subsequent cleaves

    'ZoraalJa Smiting Circuit Outside': '9366', // conut AoE
    'ZoraalJa Smiting Circuit Inside': '9367', // point-blank circle AoE
    'ZoraalJa Chasm of Vollok': '9358', // sword on main platform
    'ZoraalJa Chasm of Vollok Mirror': '935A', // sword from mirror platform
    'ZoraalJa Forged Track': '9361', // sword line cleave from mirror platform

    'ZoraalJa Half Full': '936A', // half-room cleave
    'ZoraalJa Half Circuit Left/Right': '936D', // half-room cleave
    'ZoraalJa Half Circuit Dynamo': '936E', // donut AoE
    'ZoraalJa Half Circuit Chariot': '936F', // point-blank circle AoE
  },
  shareWarn: {
    'ZoraalJa Fire III': '9378', // spread AoEs
  },
  soloWarn: {},
};

export default triggerSet;
