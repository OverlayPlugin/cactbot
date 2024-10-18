import Conditions from '../../../../../resources/conditions';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO:
//   - Callout for Battery Circuit (rotating cleave + exploding circles)?
//   - Callout for Zander's Soulbane Saber (line cleave + expanding aoe)?
//   - Quadrant (directional) call for Zander's Foreguard/Rearguard?

export interface Data extends RaidbossData {
  seenFirstRush: boolean;
}

const triggerSet: TriggerSet<Data> = {
  id: 'Vanguard',
  zoneId: ZoneId.Vanguard,
  timelineFile: 'vanguard.txt',
  initData: () => ({
    seenFirstRush: false,
  }),
  triggers: [
    // ** Vanguard Commander R8 ** //
    {
      id: 'Vanguard VC-R8 Electrowave',
      type: 'StartsUsing',
      netRegex: { id: '8EDB', source: 'Vanguard Commander R8', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Vanguard VC-R8 Enhanced Mobility Inside',
      type: 'StartsUsing',
      // 8ECF - clockwise, blade right
      // 98E5 - counterclock, blade left
      netRegex: { id: ['8ECF', '98E5'], source: 'Vanguard Commander R8', capture: false },
      durationSeconds: 11,
      infoText: (_data, _matches, output) => output.corners!(),
      outputStrings: {
        corners: {
          en: 'Go outside (corners)',
          fr: 'Extérieur (coins)',
          cn: '去外面 (四角)',
          ko: '밖으로 (구석)',
        },
      },
    },
    {
      id: 'Vanguard VC-R8 Enhanced Mobility Outside',
      type: 'StartsUsing',
      // 8ED0 - counterclock, blade right
      // 98E4 - clockwise, blade left
      netRegex: { id: ['8ED0', '98E4'], source: 'Vanguard Commander R8', capture: false },
      durationSeconds: 11,
      infoText: (_data, _matches, output) => output.inside!(),
      outputStrings: {
        inside: {
          en: 'Go inside',
          fr: 'Intérieur',
          cn: '去里面',
          ko: '안으로',
        },
      },
    },
    {
      id: 'Vanguard VC-R8 Rush',
      type: 'StartsUsing',
      netRegex: { id: '8ED9', source: 'Vanguard Sentry R8', capture: false },
      durationSeconds: 6,
      suppressSeconds: 1,
      alertText: (data, _matches, output) =>
        data.seenFirstRush ? output.grid!() : output.northSouth!(),
      run: (data) => data.seenFirstRush = true,
      outputStrings: {
        northSouth: {
          en: 'Dodge North/South line cleaves',
          fr: 'Esquivez les cleaves en ligne N/S',
          cn: '躲避 南/北 直线攻击',
          ko: '남/북쪽 직선 장판 피하기',
        },
        grid: {
          en: 'Spread + dodge grid cleaves',
          fr: 'Dispersion + esquivez les cleaves en grille',
          cn: '分散 + 躲避网格攻击',
          ko: '산개 + 격자 장판 피하기',
        },
      },
    },

    // ** Protector ** //
    {
      id: 'Vanguard Protector Electrowave',
      type: 'StartsUsing',
      netRegex: { id: '9129', source: 'Protector', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Vanguard Protector Rapid Thunder',
      type: 'StartsUsing',
      netRegex: { id: '912A', source: 'Protector' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Vanguard Protector Acceleration Bomb',
      type: 'GainsEffect',
      netRegex: { effectId: 'EDA' },
      condition: Conditions.targetIsYou(),
      // 15s duration - countdown ends at 14s for safety (game lag)
      delaySeconds: 10,
      durationSeconds: 5,
      countdownSeconds: 14, // with 10s delay, countdown will not appear until 4s remaining
      response: Responses.stopMoving(),
    },
    {
      id: 'Vanguard Protector Tracking Bolt',
      type: 'StartsUsing',
      netRegex: { id: '91E4', source: 'Protector', capture: false },
      response: Responses.spread(),
    },
    {
      id: 'Vanguard Protector Heavy Blast Cannon',
      type: 'StartsUsing',
      netRegex: { id: '91E1', source: 'Protector' },
      response: Responses.stackMarkerOn(),
    },

    // ** Zander the Snakeskinner ** //
    {
      id: 'Vanguard Zander Electrothermia',
      type: 'StartsUsing',
      netRegex: { id: '8EF2', source: 'Zander The Snakeskinner', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Vanguard Zander Saber Rush',
      type: 'StartsUsing',
      netRegex: { id: '8EF3', source: 'Zander The Snakeskinner' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Vanguard Zander Soulbane Shock',
      type: 'StartsUsing',
      netRegex: { id: '9422', source: 'Zander The Snakeskinner' },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Vanguard Zander Shade Shot',
      type: 'StartsUsing',
      netRegex: { id: '8EF5', source: 'Zander The Snakeskinner' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Vanguard Zander Screech',
      type: 'StartsUsing',
      netRegex: { id: '8EF4', source: 'Zander The Snakeskinner', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Vanguard Zander Slitherbane Foreguard',
      type: 'StartsUsing',
      netRegex: { id: '8EED', source: 'Zander The Snakeskinner', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'Vanguard Zander Slitherbane Rearguard',
      type: 'StartsUsing',
      netRegex: { id: '8EEE', source: 'Zander The Snakeskinner', capture: false },
      response: Responses.goFront('alert'),
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Tracking Bolt/Heavy Blast Cannon': '(spread/stack)',
        'Slitherbane Foreguard/Slitherbane Rearguard': 'Foreguard / Rearguard',
      },
    },
  ],
};

export default triggerSet;
