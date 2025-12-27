import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutputIntercard, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { PluginCombatantState } from '../../../../../types/event';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  chirurgeonSpots: chirurgeonCoords[];
  playerExecutionerId?: string;
  seenFirstStorm: boolean;
  seenFirstBombardment: boolean;
  safeTerror?: PluginCombatantState;
  orthoKerauNorth?: boolean;
  orthoKerauSouth?: boolean;
  kerauDiagSafe: DirectionOutputIntercard[];
}

type chirurgeonCoords = {
  x: number;
  y: number;
};

// List out the safe spots for diagonals.
const diagPositiveSafe: DirectionOutputIntercard[] = ['dirNW', 'dirSE'];
const diagNegativeSafe: DirectionOutputIntercard[] = ['dirSW', 'dirNE'];

const findNorthTerror = (terrors: PluginCombatantState[]): PluginCombatantState | undefined => {
  return terrors.filter((terror) => {
    // For all Bombardments, one of the north corners will have a single add present,
    // at one of (-10, -13) (10, -13) (-17, -12) (17, -12).
    // The corresponding -X point will have five adds surrounding it.
    // We can consistently identify a north safespot by finding this single add.

    // Only X gets run through abs(), since we are only calling north safe.
    const terX = Math.round(Math.abs(terror.PosX));
    const terY = Math.round(terror.PosY);
    const x1 = 10;
    const y1 = -13;
    const x2 = 17;
    const y2 = -12;
    return (terX === x1 && terY === y1) || (terX === x2 && terY === y2);
  })[0];
};

const triggerSet: TriggerSet<Data> = {
  id: 'themesoterminal',
  zoneId: ZoneId.TheMesoTerminal,
  timelineFile: 'meso-terminal.txt',
  initData: () => {
    return {
      chirurgeonSpots: [],
      playerExecutionerId: undefined,
      seenFirstStorm: false,
      seenFirstBombardment: false,
      impressionActive: false,
      safeTerror: undefined,
      orthoKerauNorth: undefined,
      orthoKerauSouth: undefined,
      kerauDiagSafe: [],
    };
  },
  triggers: [
    {
      id: 'Meso Terminal Chirurgeon Medicine Field',
      type: 'StartsUsing',
      netRegex: { id: 'AB16', source: 'Chirurgeon General', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Meso Terminal Chirurgeon Biochemical Front',
      type: 'StartsUsing',
      netRegex: { id: 'AB1A', source: 'Chirurgeon General', capture: false },
      response: Responses.getBehind(),
    },
    {
      // The origin for the Chirurgeon is (270,12).
      // Aerosol can be cast at four cardinal points,
      // each ten units along an axis from the origin.
      // (270,22), (280,12), (270,2),(260,12)
      id: 'Meso Terminal Chirurgeon Pungent Aerosol',
      type: 'StartsUsingExtra',
      netRegex: { id: 'AB1F', capture: true },
      infoText: (_data, matches, output) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const kbNum = Directions.xyTo4DirNum(x, y, 270, 12);
        const safeDir = Directions.outputFromCardinalNum(kbNum);
        return output.knockbackFrom!({ dir: output[safeDir]!() });
      },
      outputStrings: {
        knockbackFrom: {
          en: 'Knockback from ${dir}',
          de: 'Rückstoß von ${dir}',
          cn: '从 ${dir} 击退',
          tc: '從 ${dir} 擊退',
          ko: '${dir}에서 넉백',
        },
        dirN: Outputs.north,
        dirE: Outputs.east,
        dirS: Outputs.south,
        dirW: Outputs.west,
        unknown: Outputs.unknown,
      },
    },
    {
      // AB1E is the big Sterile Sphere
      // AB1D is small
      id: 'Meso Terminal Chirurgeon Sterile Sphere Collect',
      type: 'StartsUsingExtra',
      netRegex: { id: 'AB1D', capture: true },
      run: (data, matches) => {
        const location = {
          x: Math.round(parseFloat(matches.x)),
          y: Math.round(parseFloat(matches.y)),
        };
        data.chirurgeonSpots.push(location);
      },
    },
    {
      id: 'Meso Terminal Chirurgeon Sterile Sphere Call',
      type: 'StartsUsing',
      netRegex: { id: 'AB1D', source: 'Chirurgeon General', capture: false },
      delaySeconds: 1,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (!data.chirurgeonSpots[0] || !data.chirurgeonSpots[1])
          return;
        const spot1 = data.chirurgeonSpots[0];
        const spot2 = data.chirurgeonSpots[1];
        // Both spheres east or both west.
        // X value under 270 means east safe.
        if (spot1.x === spot2.x) {
          if (spot1.x < 270)
            return output.goEast!();
          return output.goWest!();
        }
        // Both spheres north or south.
        // Y values increase from north to south.
        // Y value over 12 means north safe.
        if (spot1.y === spot2.y) {
          if (spot1.y > 12)
            return output.goNorth!();
          return output.goSouth!();
        }
        return output.unknown!();
      },
      run: (data) => data.chirurgeonSpots = [],
      outputStrings: {
        goNorth: Outputs.north,
        goEast: Outputs.east,
        goSouth: Outputs.south,
        goWest: Outputs.west,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Meso Terminal Chirurgeon Concentrated Dose',
      type: 'StartsUsing',
      netRegex: { id: 'AB17', source: 'Chirurgeon General', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'Meso Terminal Chirurgeon Poison',
      type: 'GainsEffect',
      netRegex: { effectId: '838', source: 'Chirurgeon General', capture: true },
      condition: (data) => data.CanCleanse(),
      infoText: (_data, matches, output) => output.cleanse!({ target: matches.target }),
      outputStrings: {
        cleanse: {
          en: 'Cleanse ${target}',
          de: 'Reinige ${target}',
          cn: '康复 ${target}',
          tc: '康復 ${target}',
          ko: '${target} 에스나',
        },
      },
    },
    {
      id: 'Meso Terminal Executioners Shackles Of Fate Tracking',
      type: 'StartsUsing',
      netRegex: { id: 'AA3D', capture: true },
      condition: Conditions.targetIsYou(),
      run: (data, matches) => data.playerExecutionerId = matches.sourceId,
    },
    {
      id: 'Meso Terminal Executioners Head-Splitting Roar',
      type: 'StartsUsing',
      netRegex: { id: 'AA3B', source: 'Hooded Headsman', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Meso Terminal Executioners Chopping Block',
      type: 'StartsUsing',
      netRegex: { id: 'AA4B', capture: true },
      condition: (data, matches) => data.playerExecutionerId === matches.sourceId,
      response: Responses.getOut(),
    },
    {
      id: 'Meso Terminal Executioners Execution Wheel',
      type: 'StartsUsing',
      netRegex: { id: 'AA4C', capture: true },
      condition: (data, matches) => data.playerExecutionerId === matches.sourceId,
      response: Responses.getIn(),
    },
    {
      id: 'Meso Terminal Executioners Flaying Flail',
      type: 'Ability',
      netRegex: { id: 'AA47', capture: true },
      condition: (data, matches) => data.playerExecutionerId === matches.sourceId,
      delaySeconds: 1, // Wait for visuals
      infoText: (_data, _matches, output) => output.avoidFlails!(),
      outputStrings: {
        avoidFlails: {
          en: 'Away from flails',
          de: 'Weg vom Flegel',
          cn: '远离铁球',
          tc: '遠離鐵球',
          ko: '철퇴 피하기',
        },
      },
    },
    {
      id: 'Meso Terminal Executioners Hellmaker Adds',
      type: 'AddedCombatant',
      netRegex: { npcBaseId: '48D2', capture: false },
      condition: (data) => data.role === 'dps',
      suppressSeconds: 1,
      response: Responses.killAdds(),
    },
    {
      id: 'Meso Terminal Executioners Will Breaker',
      type: 'StartsUsing',
      netRegex: { id: 'AF38', capture: true },
      condition: (data, matches) => data.playerExecutionerId === matches.sourceId,
      response: Responses.interruptIfPossible(),
    },
    {
      id: 'Meso Terminal Executioners Relentless Torment',
      type: 'StartsUsing',
      netRegex: { id: 'AA45', capture: true },
      condition: (data, matches) => data.playerExecutionerId === matches.sourceId,
      response: Responses.tankBuster(),
    },
    {
      id: 'Meso Terminal Executioners Death Penalty',
      type: 'GainsEffect',
      netRegex: { effectId: '11F2', capture: true },
      condition: (data) => data.CanCleanse(),
      alarmText: (_data, matches, output) => output.cleanseDoom!({ target: matches.target }),
      outputStrings: {
        cleanseDoom: {
          en: 'Cleanse ${target}',
          de: 'Reinige ${target}',
          cn: '康复 ${target}',
          tc: '康復 ${target}',
          ko: '${target} 에스나',
        },
      },
    },
    {
      id: 'Meso Terminal Immortal Remains Recollection',
      type: 'StartsUsing',
      netRegex: { id: 'AB31', source: 'Immortal Remains', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Meso Terminal Immortal Remains Memory Of The Storm',
      type: 'StartsUsing',
      netRegex: { id: 'AB2D', source: 'Immortal Remains', capture: false },
      response: Responses.stackMarker(),
      run: (data) => data.seenFirstStorm = true,
    },
    {
      id: 'Meso Terminal Immortal Remains Memory Of The Pyre',
      type: 'StartsUsing',
      netRegex: { id: 'AB30', source: 'Immortal Remains', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'Meso Terminal Immortal Remains Turmoil Left',
      type: 'Ability',
      netRegex: { id: 'AB26', source: 'Immortal Remains', capture: false },
      response: Responses.goEast(),
    },
    {
      id: 'Meso Terminal Immortal Remains Turmoil Right',
      type: 'Ability',
      netRegex: { id: 'AB27', source: 'Immortal Remains', capture: false },
      response: Responses.goWest(),
    },

    // There aren't a lot of good indications where the Bombardments will go.
    // The mechanic places the Preserved Terror adds where the tethers are,
    // then does a very short Bombardment cast on the add locations.
    // If there is one add, it's a small circle, AB23.
    // If there are five adds, it's a large circle, AB24,
    // centered equidistant from its five adds.
    // On the second and later Bombardments,
    // we can trigger off the AB29 Impression cast, but we have nothing like that for the first.
    // The best case for finding the locations is to find all the Preserved Terrors,
    // then filter down which one is in a safe position in front.
    {
      id: 'Meso Terminal Immortal Remains First Bombardment Collect',
      type: 'GainsEffect',
      netRegex: { effectId: '9F8', capture: false },
      // The Preserved Terror adds are used for more mechanics than just Bombardment.
      // Unfortunately, we don't have any good way to separate out
      // which ones are used for which mechanics.
      // The tethers for Bombardment are also used on Electray
      // and Keraunography, so we have to be very careful how we find the adds.
      condition: (data) => {
        // The first Memory of the Storm cast immediately precedes Bombardment.
        return data.seenFirstStorm && !data.seenFirstBombardment;
      },
      suppressSeconds: 1,
      promise: async (data) => {
        const callData = await callOverlayHandler({
          call: 'getCombatants',
        });
        if (!callData.combatants.length)
          return;
        const terrors = callData.combatants.filter((actor) => actor.BNpcID === 18624);
        data.safeTerror = findNorthTerror(terrors);
      },
    },
    {
      id: 'Meso Terminal Immortal Remains Bombardment No Knockback',
      type: 'GainsEffect',
      netRegex: { effectId: '9F8', capture: false },
      condition: (data) => data.seenFirstStorm && !data.seenFirstBombardment,
      delaySeconds: 1,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (data.safeTerror === undefined)
          return output.unknown!();
        const safeDir = data.safeTerror.PosX < 0 ? 'west' : 'east';
        return output.staticBombardment!({ safe: output[safeDir]!() });
      },
      run: (data) => {
        data.seenFirstBombardment = true;
        data.safeTerror = undefined;
      },
      outputStrings: {
        staticBombardment: {
          en: 'Go ${safe}; Avoid small AoE',
          de: 'Geh nach ${safe}; Vermeide kleine AoE',
          cn: '前往 ${safe}; 避开小范围 AoE',
          tc: '前往 ${safe}; 避開小範圍 AoE',
          ko: '${safe}로 이동; 작은 장판 피하기',
        },
        west: Outputs.west,
        east: Outputs.east,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Meso Terminal Immortal Remains Bombardment Knockback',
      type: 'Ability',
      netRegex: { id: 'AB29', source: 'Immortal Remains', capture: false }, // Impression
      condition: (data) => data.seenFirstBombardment,
      delaySeconds: 1,
      suppressSeconds: 1,
      promise: async (data) => {
        const callData = await callOverlayHandler({
          call: 'getCombatants',
        });
        if (!callData.combatants.length)
          return;
        const terrors = callData.combatants.filter((actor) => actor.BNpcID === 18624);
        data.safeTerror = findNorthTerror(terrors);
      },
      alertText: (data, _matches, output) => {
        if (data.safeTerror === undefined)
          return output.unknown!();
        const safeDir = data.safeTerror.PosX < 0 ? 'northwest' : 'northeast';
        return output.knockbackBombardment!({ safe: output[safeDir]!() });
      },
      run: (data) => {
        data.safeTerror = undefined;
      },
      outputStrings: {
        knockbackBombardment: {
          en: 'Knockback to ${safe}; Avoid AoE',
          de: 'Rückstoß nach ${safe}; Vermeide AoE',
          cn: '击退到 ${safe}; 避开 AoE',
          tc: '擊退到 ${safe}; 避開 AoE',
          ko: '${safe}로 넉백; 장판 피하기',
        },
        northwest: Outputs.northwest,
        northeast: Outputs.northeast,
        unknown: Outputs.unknown,
      },
    },
    {
      // One Keraunography laser is always diagonal,
      // one is always orthogonal.
      // In all cases but front horizontal,
      // orthogonal lasers leave at least a small uptime safespot.
      id: 'Meso Terminal Immortal Remains Keraunography Collect',
      type: 'StartsUsingExtra',
      netRegex: { id: 'AB25', capture: true },
      run: (data, matches) => {
        const headingNum = Directions.hdgTo8DirNum(parseFloat(matches.heading));
        // Odd heading numbers are diagonal.
        if (headingNum % 2 === 1) {
          // Check which diagonal we're working with.
          // 1 and 5 are equivalent, as are 3 and 7.
          // In practice, only 5 and 3 will ever be seen,
          // since the diagonals always originate from the north end of the arena.
          const diagIsPositive = (headingNum + 4) % 4 === 1;
          const safeDiagonalSpots = diagIsPositive ? diagPositiveSafe : diagNegativeSafe;
          data.kerauDiagSafe = safeDiagonalSpots;
        } else if (headingNum % 4 === 0) { // Vertical
          // As with the diagonals, in practice we will only ever see a 0 heading number.
          data.orthoKerauNorth = false;
          data.orthoKerauSouth = false;
        } else { // Horizontal
          // It is possible to see both 2 and 6 in practice,
          // but it doesn't matter much.
          const isNorth = parseFloat(matches.y) < 0;
          data.orthoKerauNorth = isNorth;
          data.orthoKerauSouth = !isNorth;
        }
      },
    },
    {
      id: 'Meso Terminal Immortal Remains Keraunography Call',
      type: 'StartsUsing',
      netRegex: { id: 'AB25', source: 'Immortal Remains', capture: false },
      delaySeconds: 0.1,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (data.orthoKerauNorth === undefined || data.orthoKerauSouth === undefined)
          return;
        if (data.orthoKerauNorth) {
          // If the orthogonal laser is horizontal north,
          // the only safespots are outside the hitbox,
          // but still close enough to be handled with a GCD roll.
          const safeDir = data.kerauDiagSafe.filter((dir) => dir === 'dirSW' || dir === 'dirSE')[0];
          if (safeDir !== undefined)
            return output[safeDir]!();
          return output.unknown!();
        } else if (data.orthoKerauSouth) {
          // If the orthogonal laser is horizontal south,
          // the safespot is completely free in front.
          const safeDir = data.kerauDiagSafe.filter((dir) => dir === 'dirNW' || dir === 'dirNE')[0];
          if (safeDir !== undefined)
            return output[safeDir]!();
          return output.unknown!();
        }

        // If the orthogonal laser is vertical,
        // there is a tiny safespot in front,
        // as well as a large one on the same side south of the diagonal,
        // just outside melee range.
        const safeNW = data.kerauDiagSafe.includes('dirSW');
        if (safeNW)
          return output.leanLeft!();
        return output.leanRight!();
      },
      run: (data) => {
        data.kerauDiagSafe = [];
        data.orthoKerauNorth = undefined;
        data.orthoKerauSouth = undefined;
      },
      outputStrings: {
        leanLeft: {
          en: 'Front + Lean Left; or Southwest',
          de: 'Vorne + Links halten; oder Süd-Westen',
          cn: '前方 + 偏左; 或左下',
          tc: '前方 + 偏左; 或左下',
          ko: '앞 + 약간 왼쪽; 또는 남서',
        },
        leanRight: {
          en: 'Front + Lean Right; or Southeast',
          de: 'Vorne + Rechts halten; oder Süd-Osten',
          cn: '前方 + 偏右; 或右下',
          tc: '前方 + 偏右; 或右下',
          ko: '앞 + 약간 오른쪽; 또는 남동',
        },
        dirNW: Outputs.northwest,
        dirNE: Outputs.northeast,
        dirSW: Outputs.southwest,
        dirSE: Outputs.southeast,
        unknown: Outputs.unknown,
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Bloody Headsman': 'blutig(?:e|er|es|en) Henkersmann',
        'Bygone Aerostat': 'vergangen(?:e|er|es|en) Aerostat',
        'Chirurgeon General': 'Erinnerung eines Feldchirurgen',
        'Hooded Headsman': 'falsch(?:e|er|es|en) Henkersmann',
        'Immortal Remains': 'Erinnerungsschmelz',
        'Pale Headsman': 'blass(?:e|er|es|en) Henkersmann',
        'Pestilent Headsman': 'verderblich(?:e|er|es|en) Henkersmann',
      },
      'replaceText': {
        '\\(active\\)': '(aktiv)',
        '\\(cast\\)': '(wirken)',
        '\\(castbar\\)': '(wirken)',
        '--hellmaker adds--': '--Höllenerschaffer Adds--',
        'Biochemical Front': 'Biochemische Front',
        'Bombardment': 'Bombardement',
        'Chopping Block': 'Hackklotzhinrichtung',
        'Concentrated Dose': 'Konzentrierte Dosis',
        'Death Penalty': 'Höchststrafe',
        'Dismemberment': 'Zerstückelung',
        'Electray': 'Elektroblitz',
        'Execution Wheel': 'Folterrad',
        'Flaying Flail': 'Flegel der Sündenläuterung',
        'Head-splitting Roar': 'Schädelspaltergebrüll',
        'Impression': 'Impression',
        'Keraunography': 'Keraunographie',
        'Lawless Pursuit': 'Gesetzlosenverfolgung',
        'Medicine Field': 'Medizinstreuung',
        'Memento': 'Memento',
        'Memory of the Pyre': 'Erinnerung eines Scheiterhaufens',
        'Memory of the Storm': 'Erinnerung eines Sturms',
        'No Man\'s Land': 'Niemandsland',
        'Peal of Judgment': 'Klingen der Sündenläuterung',
        'Pungent Aerosol': 'Stechendes Aerosol',
        'Recollection': 'Rückbesinnung',
        'Relentless Torment': 'Unerbittliche Pein',
        'Sensory Deprivation': 'Sinnesberaubung',
        'Serial Torture': 'Qualen ohne Ende',
        'Shackles of Fate': 'Ketten des Schicksals',
        'Sterile Sphere': 'Sterile Spähre',
        'Turmoil': 'Aufregung',
        'Will Breaker': 'Willensbrecher',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Bloody Headsman': 'mémoire du bourreau rouge',
        'Bygone Aerostat': 'aérostat séculaire',
        'Chirurgeon General': 'mémoire d\'un chef de clinique',
        'Hooded Headsman': 'mémoire d\'un bourreau',
        'Immortal Remains': 'Memoria populi',
        'Pale Headsman': 'mémoire du bourreau jaune',
        'Pestilent Headsman': 'mémoire du bourreau vert',
      },
      'replaceText': {
        'Biochemical Front': 'Pulvérisation avant',
        'Bombardment': 'Bombardement',
        'Chopping Block': 'Lune tranchante',
        'Concentrated Dose': 'Injection concentrée',
        'Death Penalty': 'Condamnation à mort',
        'Dismemberment': 'Lames coupe-jambes',
        'Electray': 'Rayon électrique',
        'Execution Wheel': 'Éclipse tranchante',
        'Flaying Flail': 'Boulets de châtiment',
        'Head-splitting Roar': 'Cri de bourreau',
        'Impression': 'Impression terrestre',
        'Keraunography': 'Fulguration funeste',
        'Lawless Pursuit': 'Astreinte du condamné',
        'Medicine Field': 'Bain thérapeutique',
        'Memento': 'Reconstitution mémorielle',
        'Memory of the Pyre': 'Bombe mémorielle',
        'Memory of the Storm': 'Orage mémoriel',
        'No Man\'s Land': 'Activation des diffuseurs',
        'Peal of Judgment': 'Lames électriques de châtiment',
        'Pungent Aerosol': 'Solution explosive',
        'Recollection': 'Remémoration',
        'Relentless Torment': 'Volée de coups puissante',
        'Sensory Deprivation': 'Anesthésie sensorielle',
        'Serial Torture': 'Châtiments multiples',
        'Shackles of Fate': 'Enchaînement du condamné',
        'Sterile Sphere': 'Diffusion circulaire',
        'Turmoil': 'Commotion terrestre',
        'Will Breaker': 'Bombe pulvérisante',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Bloody Headsman': 'ある処刑人の記憶【緋】',
        'Bygone Aerostat': 'バイゴーン・エアロスタット',
        'Chirurgeon General': 'ある医療長の記憶',
        'Hooded Headsman': 'ある処刑人の記憶',
        'Immortal Remains': 'ある人々の記憶',
        'Pale Headsman': 'ある処刑人の記憶【黄】',
        'Pestilent Headsman': 'ある処刑人の記憶【翠】',
      },
      'replaceText': {
        'Biochemical Front': '前面噴霧',
        'Bombardment': '爆撃',
        'Chopping Block': '円月断',
        'Concentrated Dose': '高圧縮薬弾',
        'Death Penalty': '死刑宣告',
        'Dismemberment': '足切りの刃',
        'Electray': 'エレクトロレイ',
        'Execution Wheel': '月輪断',
        'Flaying Flail': '断罪の鉄球',
        'Head-splitting Roar': '処刑人の咆哮',
        'Impression': 'インプレッション',
        'Keraunography': '雷光',
        'Lawless Pursuit': '罪人捕捉',
        'Medicine Field': '広域散薬',
        'Memento': 'メモリーズ',
        'Memory of the Pyre': 'メモリーボム',
        'Memory of the Storm': 'メモリーストーム',
        'No Man\'s Land': '装置起動',
        'Peal of Judgment': '断罪の雷剣',
        'Pungent Aerosol': '爆発性薬',
        'Recollection': 'リコレクション',
        'Relentless Torment': '強連撃',
        'Sensory Deprivation': '知覚攪乱薬',
        'Serial Torture': '連刑執行',
        'Shackles of Fate': '束縛の鉄鎖',
        'Sterile Sphere': '円状散布',
        'Turmoil': 'ターモイル',
        'Will Breaker': '破砕弾',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Bloody Headsman': '某个绯红处刑人的记忆',
        'Bygone Aerostat': '旧日航空机',
        'Chirurgeon General': '某个医师长的记忆',
        'Hooded Headsman': '某个处刑人的记忆',
        'Immortal Remains': '某些人的记忆',
        'Pale Headsman': '某个黄褐处刑人的记忆',
        'Pestilent Headsman': '某个翠绿处刑人的记忆',
      },
      'replaceText': {
        '--hellmaker adds--': '--焦热刑具出现--',
        '\\(active\\)': '(生效)',
        '\\(cast\\)': '(咏唱)',
        '\\(castbar\\)': '(读条)',
        'Biochemical Front': '正面喷雾',
        'Bombardment': '轰炸',
        'Chopping Block': '圆月断',
        'Concentrated Dose': '高压缩药弹',
        'Death Penalty': '死刑宣告',
        'Dismemberment': '斩足刃',
        'Electray': '雷质射线',
        'Execution Wheel': '月环断',
        'Flaying Flail': '断罪的铁球',
        'Head-splitting Roar': '处刑人的咆哮',
        'Impression': '印象',
        'Keraunography': '雷光',
        'Lawless Pursuit': '捉拿罪犯',
        'Medicine Field': '广域撒药',
        'Memento': '记忆重现',
        'Memory of the Pyre': '记忆爆炸',
        'Memory of the Storm': '记忆风暴',
        'No Man\'s Land': '启动装置',
        'Peal of Judgment': '断罪的雷剑',
        'Pungent Aerosol': '爆炸药液',
        'Recollection': '回忆',
        'Relentless Torment': '强连击',
        'Sensory Deprivation': '知觉扰乱药',
        'Serial Torture': '连续处刑',
        'Shackles of Fate': '铁链束缚',
        'Sterile Sphere': '圆状散布',
        'Turmoil': '慌乱',
        'Will Breaker': '破碎弹',
      },
    },
    {
      'locale': 'tc',
      'missingTranslations': true,
      'replaceSync': {
        // 'Bloody Headsman': '', // FIXME '某个绯红处刑人的记忆'
        // 'Bygone Aerostat': '', // FIXME '旧日航空机'
        // 'Chirurgeon General': '', // FIXME '某个医师长的记忆'
        // 'Hooded Headsman': '', // FIXME '某个处刑人的记忆'
        // 'Immortal Remains': '', // FIXME '某些人的记忆'
        // 'Pale Headsman': '', // FIXME '某个黄褐处刑人的记忆'
        // 'Pestilent Headsman': '', // FIXME '某个翠绿处刑人的记忆'
      },
      'replaceText': {
        // '--hellmaker adds--': '', // FIXME '--焦热刑具出现--'
        // '\\(active\\)': '', // FIXME '(生效)'
        // '\\(cast\\)': '', // FIXME '(咏唱)'
        // '\\(castbar\\)': '', // FIXME '(读条)'
        // 'Biochemical Front': '', // FIXME '正面喷雾'
        'Bombardment': '轟炸',
        // 'Chopping Block': '', // FIXME '圆月断'
        // 'Concentrated Dose': '', // FIXME '高压缩药弹'
        // 'Death Penalty': '', // FIXME '死刑宣告'
        // 'Dismemberment': '', // FIXME '斩足刃'
        // 'Electray': '', // FIXME '雷质射线'
        // 'Execution Wheel': '', // FIXME '月环断'
        // 'Flaying Flail': '', // FIXME '断罪的铁球'
        // 'Head-splitting Roar': '', // FIXME '处刑人的咆哮'
        // 'Impression': '', // FIXME '印象'
        // 'Keraunography': '', // FIXME '雷光'
        // 'Lawless Pursuit': '', // FIXME '捉拿罪犯'
        // 'Medicine Field': '', // FIXME '广域撒药'
        // 'Memento': '', // FIXME '记忆重现'
        // 'Memory of the Pyre': '', // FIXME '记忆爆炸'
        // 'Memory of the Storm': '', // FIXME '记忆风暴'
        // 'No Man\'s Land': '', // FIXME '启动装置'
        // 'Peal of Judgment': '', // FIXME '断罪的雷剑'
        // 'Pungent Aerosol': '', // FIXME '爆炸药液'
        // 'Recollection': '', // FIXME '回忆'
        // 'Relentless Torment': '', // FIXME '强连击'
        // 'Sensory Deprivation': '', // FIXME '知觉扰乱药'
        // 'Serial Torture': '', // FIXME '连续处刑'
        // 'Shackles of Fate': '', // FIXME '铁链束缚'
        // 'Sterile Sphere': '', // FIXME '圆状散布'
        // 'Turmoil': '', // FIXME '慌乱'
        // 'Will Breaker': '', // FIXME '破碎弹'
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Bloody Headsman': '어느 집행인의 기억: 빨강',
        'Bygone Aerostat': '구시대 비행체',
        'Chirurgeon General': '어느 의료장의 기억',
        'Hooded Headsman': '어느 집행인의 기억',
        'Immortal Remains': '어느 사람들의 기억',
        'Pale Headsman': '어느 집행인의 기억: 노랑',
        'Pestilent Headsman': '어느 집행인의 기억: 초록',
      },
      'replaceText': {
        '--hellmaker adds--': '--초열 형구 등장--',
        '\\(active\\)': '(활성)',
        '\\(cast\\)': '(시전)',
        '\\(castbar\\)': '(시전바)',
        'Biochemical Front': '전방 분무',
        'Bombardment': '폭격',
        'Chopping Block': '만월참',
        'Concentrated Dose': '고압축 물약',
        'Death Penalty': '사형 언도',
        'Dismemberment': '발목 절단날',
        'Electray': '전기 광선',
        'Execution Wheel': '월륜참',
        'Flaying Flail': '단죄의 철퇴',
        'Head-splitting Roar': '집행인의 포효',
        'Impression': '기억 각인',
        'Keraunography': '뇌광',
        'Lawless Pursuit': '죄인 포착',
        'Medicine Field': '광역 살포제',
        'Memento': '기억 구현',
        'Memory of the Pyre': '기억 폭탄',
        'Memory of the Storm': '기억 폭풍',
        'No Man\'s Land': '장치 기동',
        'Peal of Judgment': '단죄의 뇌검',
        'Pungent Aerosol': '폭발성 약',
        'Recollection': '기억 불러오기',
        'Relentless Torment': '연속 강공격',
        'Sensory Deprivation': '감각 교란제',
        'Serial Torture': '연속 형벌 집행',
        'Shackles of Fate': '속박의 쇠사슬',
        'Sterile Sphere': '원형 살포',
        'Turmoil': '동란',
        'Will Breaker': '파쇄탄',
      },
    },
  ],
};

export default triggerSet;
