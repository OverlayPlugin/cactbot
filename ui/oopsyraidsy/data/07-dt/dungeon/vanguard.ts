import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

// TODO:
//   - Add trigger for missing Protector's Heavy Blast Cannon (stack)

export type Data = OopsyData;

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.Vanguard,
  damageWarn: {
    // ** Adds ** //
    'Vanguard Sentry G7 Spread Shot': '9869', // conal aoe
    'Vanguard Sentry R7 Swoop': '94A3', // static line cleaves
    'Vanguard Sentry R7 Floater Turn': '9633', // static donut aoe
    'Vanguard Sentry R7 Spinning Axle': '986A', // circle aoe
    'Vanguard Turret Electrobeam': '94AC', // static line cleaves
    'Vanguard Aerostat Incendiary Ring': '9634', // donut'

    // ** Vanguard Commander R8 ** //
    'Vanguard VC-R8 Enhanced Mobility Sword CW-R': '8ECF', // sword - clockwise, blade right
    'Vanguard VC-R8 Enhanced Mobility Sword CWW-R': '8ED0', // sword - counterclock, blade right
    'Vanguard VC-R8 Enhanced Mobility Sword CW-L': '98E4', // sword - clockwise, blade left
    'Vanguard VC-R8 Enhanced Mobility Sword CWW-L': '98E5', // sword - counterclock, blade left
    'Vanguard VC-R8 Enhanced Mobility Ground CW-R': '8ED3', // ground donut - clockwise, blade right
    'Vanguard VC-R8 Enhanced Mobility Ground CWW-L': '8ED4', // ground donut - counterclock, blade left
    'Vanguard VC-R8 Enhanced Mobility Ground CWW-R': '9140', // ground donut - counterclock, blade right
    'Vanguard VC-R8 Enhanced Mobility Ground CW-L': '9147', // ground donut - clockwise, blade left
    'Vanguard VC-R8 Rapid Rotary 1': '8ED5', // rotational cleave during Enhanced Mobility
    'Vanguard VC-R8 Rapid Rotary 2': '8ED6', // rotational cleave during Enhanced Mobility
    'Vanguard VC-R8 Rapid Rotary 3': '8ED7', // rotational cleave during Enhanced Mobility
    'Vanguard VC-R8 Rush': '8ED9', // line cleaves (N/S or grid)
    'Vanguard VC-R8 Aerial Offensive': '8EDA', // big expanding circle aoe

    // ** Protector ** //
    'Vanguard Protector Shock 1': '9124', // ground aoe spam (circles)
    'Vanguard Protector Homing Cannon 2': '9123', // ground aoe spam (lines)
    'Vanguard Protector Battery Circuit Initial': '91E7', // first conal
    'Vanguard Protector Battery Circuit Followup': '91E0', // rotating conal
    'Vanguard Protector Electrowhirl Initial': '91E6', // first puddle under boss
    'Vanguard Protector Electrowhirl Followup': '9128', // later puddles under boss
    'Vanguard Protector Bombardment': '9868', // circle aoes at wall during Battery Circuit
    'Vanguard Protector Blast Cannon': '911F', // line cleaves during Acceleration Bomb
    'Vanguard Protector Electrostatic Contact': '9126', // running thru fence
    'Vanguard Protector Motion Sensor': '9125', // detonating Acceleration Bomb

    // ** Zander the Snakeskinner ** //
    'Vanguard Zander Soulbane Saber': '8EDE', // line cleave
    'Vanguard Zander Burst P1': '8EDF', // expanding half-arena cleave
    'Vanguard Zander Syntheslean': '914E', // initial conal from boss
    'Vanguard Zander Syntheslither 1': '8EE3', // conal on slither track
    'Vanguard Zander Syntheslither 2': '8EE4', // conal on slither track
    'Vanguard Zander Syntheslither 3': '8EE5', // conal on slither track
    'Vanguard Zander Syntheslither 4': '8EE6', // conal on slither track
    'Vanguard Zander Syntheslither 5': '8EE7', // conal on slither track
    'Vanguard Zander Syntheslither 6': '8EE8', // conal on slither track
    'Vanguard Zander Syntheslither 7': '8EE9', // conal on slither track
    'Vanguard Zander Syntheslither 8': '8EEA', // conal on slither track
    'Vanguard Zander Syntheslither 9': '8EEB', // conal on slither track
    'Vanguard Zander Syntheslither 10': '8EEC', // conal on slither track
    'Vanguard Zander Slitherbane Foreguard Half': '8EED', // half-arena frontal cleave
    'Vanguard Zander Slitherbane Rearguard Half': '8EEE', // full-arena backward cleave
    'Vanguard Zander Slitherbane Foreguard Line': '8EF0', // line cleave
    'Vanguard Zander Slitherbane Rearguard Line': '8EF1', // line cleave
    'Vanguard Zander Burst P2': '8EEF', // expanding half-arena cleave
  },
  shareWarn: {
    'Vanguard VC-R8 Electrosurge': '8EDD', // spreads
    'Vanguard Protector Tracking Bolt': '91E5', // spreads
    'Vanguard Zander Soulbane Shock': '9422', // spreads
  },
};

export default triggerSet;
