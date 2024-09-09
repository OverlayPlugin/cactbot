import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Improve the Purge sequence calls to be actively timed.
// TODO: Handle overlaps between Purge and Immune Response

// TODO: Determine which direction the SuperCell Matrix triangle is facing.
// TODO: Math out the positions of the Supercell Matrix lasers and directly call safe lanes.

// TODO: Better handle overlap between Terminate and other AoEs.

export interface Data extends RaidbossData {
  interferonCalls: string[];
  disinfectTarget?: string;
}

const triggerSet: TriggerSet<Data> = {
  id: 'Alexandria',
  zoneId: ZoneId.Alexandria,
  timelineFile: 'alexandria.txt',
  initData: () => {
    return {
      interferonCalls: [],
    };
  },
  triggers: [
    {
      id: 'Alexandria AntivirusX Immune Response Front',
      type: 'StartsUsing',
      netRegex: { id: '8E1A', source: 'Antivirus X', capture: false },
      response: Responses.goSides(),
    },
    {
      id: 'Alexandria AntivirusX Immune Response Back',
      type: 'StartsUsing',
      netRegex: { id: '8E1C', source: 'Antivirus X', capture: false },
      response: Responses.goFront(),
    },
    {
      // Interferon R is 12842, Interferon C is 12843
      id: 'Alexandria AntivirusX Interferon Collect',
      type: 'AddedCombatant',
      netRegex: { npcNameId: ['12842', '12843'] },
      run: (data, matches, output) => {
        const call = matches.npcNameId === '12843' ? output.avoid!() : output.in!();
        data.interferonCalls.push(call);
      },
      outputStrings: {
        avoid: {
          en: 'Avoid',
          de: 'Weiche aus',
          fr: 'Évitez',
          ko: '피하기',
        },
        in: Outputs.in,
      },
    },
    {
      id: 'Alexandria AntivirusX Interferon Call',
      type: 'AddedCombatant',
      netRegex: { npcNameId: ['12842', '12843'], capture: false },
      delaySeconds: 0.5,
      durationSeconds: 15,
      infoText: (data, _matches, output) => {
        if (data.interferonCalls.length !== 5)
          return;
        return output.combo!({ calls: data.interferonCalls.join(output.separator!()) });
      },
      run: (data) => {
        if (data.interferonCalls.length === 5) {
          data.interferonCalls = [];
        }
      },
      outputStrings: {
        combo: {
          en: '${calls}',
          de: '${calls}',
          fr: '${calls}',
          ko: '${calls}',
        },
        separator: {
          en: ' => ',
          de: ' => ',
          fr: ' => ',
          ko: ' => ',
        },
      },
    },
    {
      id: 'Alexandria AntivirusX Disinfection',
      type: 'HeadMarker',
      netRegex: { id: '0158' },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.spreadDontStack!(),
      run: (data, matches) => data.disinfectTarget = matches.target,
      outputStrings: {
        spreadDontStack: {
          en: 'Cleave -- Don\'t stack!',
          de: 'Cleave -- Verteilen!',
          fr: 'Cleave -- Dispersion !',
          ko: '광역 탱버 -- 쉐어 맞지 말기',
        },
      },
    },
    {
      id: 'Alexandria AntivirusX Quarantine',
      type: 'HeadMarker',
      netRegex: { id: '003E' },
      condition: (data) => data.me !== data.disinfectTarget,
      delaySeconds: 0.5,
      response: Responses.stackMarkerOn(),
      run: (data) => delete data.disinfectTarget,
    },
    {
      id: 'Alexandria AntivirusX Cytolysis',
      type: 'StartsUsing',
      netRegex: { id: '8E23', source: 'Antivirus X', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Alexandria Amalgam Electrowave',
      type: 'StartsUsing',
      netRegex: { id: '8DF1', source: 'Amalgam', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Alexandria Amalgam Disassembly',
      type: 'StartsUsing',
      netRegex: { id: '8DE3', source: 'Amalgam', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Alexandria Amalgam Supercell Matrix Triangle',
      type: 'StartsUsing',
      netRegex: { id: '98E0', source: 'Amalgam', capture: false },
      alertText: (_data, _matches, output) => output.avoidLightning!(),
      outputStrings: {
        avoidLightning: {
          en: 'Out of lightning triangle',
          de: 'Raus aus dem Blitz-Dreieck',
          fr: 'Éloignez-vous du triangle de foudre',
          ko: '삼각형 밖으로',
        },
      },
    },
    {
      id: 'Alexandria Amalgam Supercell Matrix Lasers',
      type: 'StartsUsing',
      netRegex: { id: '98E2', source: 'Amalgam', capture: false },
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.avoidLasers!(),
      outputStrings: {
        avoidLasers: {
          en: 'Avoid Wall Lasers',
          de: 'Vermeide Wand-Laser',
          fr: 'Évitez les lasers des murs',
          ko: '벽 레이저 피하기',
        },
      },
    },
    {
      id: 'Alexandria Amalgam Centralized Current',
      type: 'StartsUsing',
      netRegex: { id: '8DE7', source: 'Amalgam', capture: false },
      response: Responses.goSides(),
    },
    {
      id: 'Alexandria Amalgam Split Current',
      type: 'StartsUsing',
      netRegex: { id: '8DEB', source: 'Amalgam', capture: false },
      response: Responses.goMiddle(),
    },
    {
      id: 'Alexandria Amalgam Static Spark',
      type: 'HeadMarker',
      netRegex: { id: '008B' },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Alexandria Amalgam Amalgamight',
      type: 'HeadMarker',
      netRegex: { id: '00DA' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Alexandria Amalgam Superbolt',
      type: 'HeadMarker',
      netRegex: { id: '00A1' },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Alexandria Amalgam Ternary Charge',
      type: 'StartsUsing',
      netRegex: { id: '9955', source: 'Amalgam', capture: false },
      response: Responses.getOutThenIn(),
    },
    {
      id: 'Alexandria Eliminator Disruption',
      type: 'StartsUsing',
      netRegex: { id: '8F9D', source: 'Eliminator', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Alexandria Eliminator Partition Left',
      type: 'StartsUsing',
      netRegex: { id: '9951', source: 'Eliminator', capture: false },
      response: Responses.goRight(),
    },
    {
      // It's not clear why, but there's a specific Partition 985F that's used for the
      // initial Partition cast and then never again.
      // All subsequent right-cleave Partitions use 9946.
      id: 'Alexandria Eliminator Partition Right',
      type: 'StartsUsing',
      netRegex: { id: ['985F', '9946'], source: 'Eliminator', capture: false },
      response: Responses.goLeft(),
    },
    {
      id: 'Alexandria Eliminator Terminate',
      type: 'StartsUsing',
      netRegex: { id: '9ABF', source: 'Eliminator', capture: false },
      alertText: (_data, _matches, output) => output.avoidHand!(),
      outputStrings: {
        avoidHand: {
          en: 'Avoid hand laser',
          de: 'Weiche den Hand-Laser aus',
          fr: 'Évitez le laser de la main',
          ko: '손이 쏘는 레이저 피하기',
        },
      },
    },
    {
      id: 'Alexandria Eliminator Halo of Destruction',
      type: 'StartsUsing',
      netRegex: { id: '9AC0', source: 'Eliminator', capture: false },
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.underElimbit!(),
      outputStrings: {
        underElimbit: {
          en: 'Get under Elimbit',
          de: 'Geh unter Eliminator',
          fr: 'Allez sous Annihilation',
          ko: '비트 밑으로',
        },
      },
    },
    {
      id: 'Alexandria Eliminator Electray',
      type: 'HeadMarker',
      netRegex: { id: '00DA' },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      // This is a stack laser visual, but there is no associated 27 line,
      // and this 21 line on a single target seems to stand in for it.
      id: 'Alexandria Eliminator Overexposure',
      type: 'Ability',
      netRegex: { id: '8FAA', source: 'Eliminator' },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Alexandria Eliminator Holo Ark',
      type: 'Ability',
      netRegex: { id: '8FB5', source: 'Eliminator', capture: false },
      delaySeconds: 5, // This is a wind-up, actual damage is 10s later on 8FB6.
      response: Responses.aoe(),
    },
    {
      id: 'Alexandria Eliminator Impact',
      type: 'StartsUsing',
      netRegex: { id: '8FBA', source: 'Eliminator', capture: false },
      response: Responses.knockback(),
    },
    {
      id: 'Alexandria Eliminator Light Of Salvation',
      type: 'HeadMarker',
      netRegex: { id: '0216' },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      // This is a stack laser visual, but there is no associated 27 line,
      // and this 21 line on a single target seems to stand in for it.
      id: 'Alexandria Eliminator Light Of Devotion',
      type: 'Ability',
      netRegex: { id: '8FB2', source: 'Eliminator' },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Alexandria Eliminator Elimination',
      type: 'StartsUsing',
      netRegex: { id: '8FBB', source: 'Eliminator', capture: false },
      alertText: (_data, _matches, output) => output.dodgeLasers!(),
      outputStrings: {
        dodgeLasers: {
          en: 'Dodge Multiple Lasers',
          de: 'Weiche den Lasern aus',
          fr: 'Esquivez les lasers multiples',
          ko: '다중 레이저 피하기',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Centralized Current/Split Current': 'Centralized/Split Current',
        'Pathocircuit Purge/Pathocross Purge': 'Purge',
      },
    },
    {
      'locale': 'de',
      'replaceSync': {
        'Amalgam': 'Amalgam',
        'Antivirus X': 'Antivirus X',
        'Eliminator': 'Eliminator',
        'Interferon C': 'Antivirus C',
        'Interferon R': 'Antivirus R',
      },
      'replaceText': {
        'Amalgamight': 'Amalgamacht',
        'Centralized Current': 'Zentraler Strom',
        'Cytolysis': 'Zytolyse',
        'Disassembly': 'Disassemblierung',
        'Disinfection': 'Desinfektion',
        'Disruption': 'Störung',
        'Electray': 'Elektroblitz',
        'Electrowave': 'Elektrowelle',
        'Elimination': 'Eliminierung',
        'Explosion': 'Explosion',
        'Halo of Destruction': 'Ring der Zerstörung',
        'Holo Ark': 'Holo-Arche',
        'Immune Response': 'Immunreaktion',
        'Impact': 'Impakt',
        'Light of Devotion': 'Licht der Hingabe',
        'Light of Salvation': 'Licht der Erlösung',
        'Overexposure': 'Überstrahlung',
        'Partition': 'Partition',
        'Pathocircuit Purge': 'Pathokreisende Säuberung',
        'Pathocross Purge': 'Pathokreuzende Säuberung',
        'Quarantine': 'Quarantäne',
        'Split Current': 'Geteilter Strom',
        'Static Spark': 'Statischer Schlag',
        'Subroutine': 'Unterprogramm',
        'Superbolt': 'Supra-Blitzschlag',
        'Supercell Matrix': 'Superzellen-Matrix',
        'Terminate': 'Terminierung',
        'Ternary Charge': 'Ternäre Ladung',
        'Voltburst': 'Voltastischer Knall',
        '\\(corners\\)': '(Ecken)',
        '\\(front\\)': '(Vorne)',
        '\\(lasers\\)': '(Laser)',
        '\\(sides\\)': '(Seiten)',
        '\\(triangle\\)': '(Dreieck)',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Amalgam': 'Amalgame Y',
        'Antivirus X': 'Anti-virus X',
        'Eliminator': 'Annihilation',
        'Interferon C': 'Programme anti-intrusion C',
        'Interferon R': 'Programme anti-intrusion R',
      },
      'replaceText': {
        'Amalgamight': 'Ardeur amalgamée',
        'Centralized Current': 'Courant centralisé',
        'Cytolysis': 'Cytolyse',
        'Disassembly': 'Désassemblage',
        'Disinfection': 'Désinfection',
        'Disruption': 'Perturbation',
        'Electray': 'Électrorayon',
        'Electrowave': 'Électrovague',
        'Elimination': 'Élimination',
        'Explosion': 'Explosion',
        'Halo of Destruction': 'Halo massacreur',
        'Holo Ark': 'Holo-arc',
        'Immune Response': 'Réaction immunitaire',
        'Impact': 'Impact',
        'Light of Devotion': 'Clarté de dévotion',
        'Light of Salvation': 'Clarté salvatrice',
        'Overexposure': 'Multiexposition',
        'Partition': 'Partition',
        'Pathocircuit Purge': 'Purge de circuits',
        'Pathocross Purge': 'Purge croisée',
        'Quarantine': 'Quarantaine',
        'Split Current': 'Courant divisé',
        'Static Spark': 'Étincelle statique',
        'Subroutine': 'Sous-routine',
        'Superbolt': 'Super éclair',
        'Supercell Matrix': 'Matrice supercellulaire',
        'Terminate': 'Terminaison',
        'Ternary Charge': 'Charge ternaire',
        'Voltburst': 'Éclat d\'éclair',
        '\\(corners\\)': '(Coins)',
        '\\(front\\)': '(Devant)',
        '\\(lasers\\)': '(Lasers)',
        '\\(sides\\)': '(Côtés)',
        '\\(triangle\\)': '(Triangle)',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Amalgam': 'アマルガム',
        'Antivirus X': '抗体プログラムX',
        'Eliminator': 'エリミネーター',
        'Interferon C': '抗体プログラムC',
        'Interferon R': '抗体プログラムR',
      },
      'replaceText': {
        'Amalgamight': 'アマルガムマイト',
        'Centralized Current': 'セントラルカレント',
        'Cytolysis': 'サイタリシス',
        'Disassembly': 'ディスアセンブリ',
        'Disinfection': 'ディスインフェクション',
        'Disruption': 'ディスラプション',
        'Electray': 'エレクトロレイ',
        'Electrowave': 'エレクトロウェーブ',
        'Elimination': 'エリミネーション',
        'Explosion': '爆発',
        'Halo of Destruction': 'マサカーヘイロー',
        'Holo Ark': 'ラストアーク',
        'Immune Response': 'イミューンリアクション',
        'Impact': '衝撃',
        'Light of Devotion': 'ライトネス・ディヴォーション',
        'Light of Salvation': 'ライトネス・サルベイション',
        'Overexposure': 'マルチエクスポージャー',
        'Partition': 'パーティション',
        'Pathocircuit Purge': 'サーキットパージ',
        'Pathocross Purge': 'クロスパージ',
        'Quarantine': 'クァランティン',
        'Split Current': 'スプリットカレント',
        'Static Spark': 'スポットスパーク',
        'Subroutine': 'サブルーチン',
        'Superbolt': 'スーパーボルト',
        'Supercell Matrix': 'カレントマトリクス',
        'Terminate': 'ターミネーション',
        'Ternary Charge': 'トライバースト',
        'Voltburst': 'ボルトバースト',
      },
    },
  ],
};

export default triggerSet;
