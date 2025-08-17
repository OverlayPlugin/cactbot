import Conditions from '../../../../../resources/conditions';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutput8, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO:
// Party adds phase stuff?
// Individual adds phase mechs for non-healer?

export type ReapingSafeDir = 'out' | 'in' | 'mid' | 'sides';
const reapingHeadmarkerMap: { [id: string]: ReapingSafeDir } = {
  '025C': 'out',
  '025D': 'in',
  '025E': 'mid',
  '025F': 'sides',
} as const;

export type LoomingSpecterDir = 'north' | 'middle' | 'south';

export interface Data extends RaidbossData {
  macabreTowerCount: number;
  circleOfLivesCounter: number;
  cropCircleOrder: ReapingSafeDir[];
  cropCircleActors: { [effectId: string]: number };
  specterCount: number;
  reapingSafeDirs: ReapingSafeDir[];
  reapingCounter: number;
  mementoMoriCount: number;
  grandCrossSpreads: string[];
  actorPositions: { [id: string]: { x: number; y: number; heading: number } };
  loomingSpecterLocs: LoomingSpecterDir[];
}

const triggerSet: TriggerSet<Data> = {
  id: 'TheMinstrelsBalladNecronsEmbrace',
  zoneId: ZoneId.TheMinstrelsBalladNecronsEmbrace,
  timelineFile: 'necron-ex.txt',
  initData: () => ({
    actorPositions: {},
    mementoMoriCount: 0,
    reapingCounter: 0,
    reapingSafeDirs: [],
    grandCrossSpreads: [],
    loomingSpecterLocs: [],
    specterCount: 0,
    cropCircleActors: {},
    cropCircleOrder: [],
    circleOfLivesCounter: 0,
    macabreTowerCount: 0,
  }),
  triggers: [
    {
      id: 'NecronEx ActorSetPos Tracker',
      type: 'ActorSetPos',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
          heading: parseFloat(matches.heading),
        },
    },
    {
      id: 'NecronEx AddedCombatant Tracker',
      type: 'AddedCombatant',
      netRegex: { npcNameId: '14095', capture: true },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
          heading: parseFloat(matches.heading),
        },
    },
    {
      id: 'NecronEx Blue Shockwave',
      type: 'HeadMarker',
      netRegex: { id: '0267', capture: true },
      // Annoyingly, the "target" of this headmarker is the boss, and the actual player ID is stored
      // in `data0`. So we need to map back to party info to determine if target is self or another
      condition: (data, matches) => {
        if (data.me === data.party?.idToName_?.[matches.data0])
          return true;
        return data.role === 'tank';
      },
      infoText: (_data, _matches, output) => output.tankBuster!(),
      outputStrings: {
        tankBuster: Outputs.tankBuster,
      },
    },
    {
      id: 'NecronEx Fear of Death Damage',
      type: 'StartsUsing',
      netRegex: { id: 'AE06', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'NecronEx Fear of Death Bait',
      type: 'StartsUsing',
      netRegex: { id: 'AE06', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 2,
      infoText: (_data, _matches, output) => output.baitHand!(),
      outputStrings: {
        baitHand: {
          en: 'Bait Hand',
        },
      },
    },
    {
      id: 'NecronEx Cold Grip',
      type: 'StartsUsing',
      netRegex: { id: ['AE09', 'AE0A'], capture: true },
      infoText: (_data, matches, output) =>
        output.text!({
          mid: output.middle!(),
          side: output[matches.id === 'AE0A' ? 'east' : 'west']!(),
        }),
      outputStrings: {
        middle: Outputs.middle,
        east: Outputs.east,
        west: Outputs.west,
        text: {
          en: '${mid} => ${side}',
        },
      },
    },
    {
      id: 'NecronEx Memento Mori',
      type: 'StartsUsing',
      netRegex: { id: ['AE15', 'AE16'] },
      condition: (data) => {
        return ++data.mementoMoriCount !== 2;
      },
      infoText: (_data, matches, output) => {
        return output[matches.id === 'AE15' ? 'lightWest' : 'lightEast']!();
      },
      outputStrings: {
        lightWest: {
          en: 'Light West => Spread',
        },
        lightEast: {
          en: 'Light East => Spread',
        },
      },
    },
    {
      id: 'NecronEx Soul Reaping Collector',
      type: 'StartsUsing',
      netRegex: { id: ['AE0C', 'AE14'], capture: false },
      run: (data) => data.reapingCounter++,
    },
    {
      id: 'NecronEx Reaping Headmarker Collector',
      type: 'HeadMarker',
      netRegex: { id: ['025C', '025D', '025E', '025F'], capture: true },
      preRun: (data, matches) => {
        const dir = reapingHeadmarkerMap[matches.id];

        if (dir === undefined)
          throw new UnreachableCode();

        data.reapingSafeDirs.push(dir);
      },
    },
    {
      id: 'NecronEx Soul Reaping Immediate',
      type: 'HeadMarker',
      netRegex: { id: ['025C', '025D', '025E', '025F'], capture: false },
      infoText: (data, _matches, output) => {
        const dir = data.reapingSafeDirs[0];
        if (dir === undefined)
          throw new UnreachableCode();

        if (data.reapingCounter === 1) {
          return output[dir]!();
        } else if (data.reapingCounter === 2) {
          return output.stored!({ dir: output[dir]!() });
        }
      },
      outputStrings: {
        in: Outputs.in,
        out: Outputs.out,
        sides: Outputs.sides,
        mid: Outputs.middle,
        stored: {
          en: 'Stored ${dir}',
        },
      },
    },
    {
      id: 'NecronEx Twofold/Fourfold Blight',
      type: 'StartsUsing',
      netRegex: { id: ['AE0D', 'AE0E'], capture: true },
      infoText: (data, matches, output) => {
        const dir = data.reapingSafeDirs[0] ?? 'unknown';
        const mech = matches.id === 'AE0D' ? 'healerStacks' : 'partners';

        return output.text!({
          dir: output[dir]!(),
          mech: output[mech]!(),
        });
      },
      run: (data) => {
        data.reapingSafeDirs = [];
      },
      outputStrings: {
        in: Outputs.in,
        out: Outputs.out,
        sides: Outputs.sides,
        mid: Outputs.middle,
        unknown: Outputs.unknown,
        healerStacks: Outputs.healerGroups,
        partners: Outputs.stackPartner,
        text: {
          en: '${dir} + ${mech}',
        },
      },
    },
    {
      id: 'NecronEx End\'s Embrace',
      type: 'HeadMarker',
      netRegex: { id: '0266', capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.bait!(),
      outputStrings: {
        bait: {
          en: 'Drop hand => Bait hand',
        },
      },
    },
    {
      id: 'NecronEx Grand Cross',
      type: 'StartsUsing',
      netRegex: { id: 'AE18', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'NecronEx Grand Cross Puddle Bait Initial',
      type: 'Ability',
      netRegex: { id: 'AE18', capture: false },
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.bait!(),
      outputStrings: {
        bait: {
          en: 'Bait puddles',
        },
      },
    },
    {
      id: 'NecronEx Grand Cross Puddle Bait End',
      type: 'Ability',
      netRegex: { id: 'AE18', capture: false },
      delaySeconds: 26.5,
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.bait!(),
      outputStrings: {
        bait: {
          en: 'Bait puddles => Intercardinals',
        },
      },
    },
    {
      id: 'NecronEx Grand Cross Spread/Tower',
      type: 'HeadMarker',
      netRegex: { id: '0263', capture: true },
      preRun: (data, matches) => data.grandCrossSpreads.push(matches.target),
      infoText: (data, _matches, output) => {
        if (data.grandCrossSpreads.length < 4)
          return;

        const spread = data.grandCrossSpreads.includes(data.me);
        data.grandCrossSpreads = [];
        return output[spread ? 'spread' : 'tower']!();
      },
      outputStrings: {
        spread: Outputs.spread,
        tower: {
          en: 'Tower',
        },
      },
    },
    {
      id: 'NecronEx Neutron Ring',
      type: 'StartsUsing',
      netRegex: { id: 'AE1F', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'NecronEx Darkness of Eternity',
      type: 'StartsUsing',
      netRegex: { id: 'AE24', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'NecronEx Cleanse Slow',
      type: 'GainsEffect',
      netRegex: { effectId: 'D88', capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.cleanse!(),
      outputStrings: {
        cleanse: 'Cleanse Slow',
      },
    },
    {
      id: 'NecronEx Looming Specter Collector',
      type: 'Tether',
      netRegex: { id: '0066', capture: true },
      // 0.3s delay to ensure `ActorSetPos` has fired properly
      delaySeconds: 0.3,
      run: (data, matches) => {
        const pos = data.actorPositions[matches.sourceId];

        if (pos === undefined) {
          console.error(
            `Looming Specter Collector: Missing actor data for ${matches.sourceId}`,
            data.actorPositions,
          );
          return;
        }

        let dir: LoomingSpecterDir;

        if (pos.y < 99)
          dir = 'north';
        else if (pos.y > 101)
          dir = 'south';
        else
          dir = 'middle';

        data.loomingSpecterLocs.push(dir);
      },
    },
    {
      id: 'NecronEx Specter of Death Counter',
      type: 'StartsUsing',
      netRegex: { id: 'AE3E', capture: false },
      run: (data) => data.specterCount++,
    },
    {
      id: 'NecronEx Specter of Death First',
      type: 'StartsUsing',
      netRegex: { id: 'AE3E', capture: false },
      condition: (data) => data.specterCount === 1,
      delaySeconds: 1,
      infoText: (data, _matches, output) => {
        let rows: LoomingSpecterDir[] = ['middle', 'north', 'south'];
        rows = rows.filter((r) => !data.loomingSpecterLocs.includes(r));
        const row = rows[0];

        if (row === undefined || rows.length > 1) {
          console.error(`Specter of Death First: Invalid row info`, row, rows);
          return;
        }

        return output.text!({
          row: output[row]!(),
          spread: output.spread!(),
        });
      },
      run: (data) => data.loomingSpecterLocs = [],
      outputStrings: {
        spread: Outputs.spread,
        middle: {
          en: 'Middle Row',
        },
        north: {
          en: 'North Row',
        },
        south: {
          en: 'South Row',
        },
        text: {
          en: '${row} + ${spread}',
        },
      },
    },
    {
      id: 'NecronEx The End\'s Embrace Bait',
      type: 'Ability',
      netRegex: { id: 'AE36', capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.bait!(),
      outputStrings: {
        bait: {
          en: 'Bait Hand => Dodge',
        },
      },
    },
    {
      id: 'NecronEx Crop Circle Collector',
      type: 'GainsEffect',
      netRegex: { effectId: '808', count: ['3B8', '3B9', '3BA', '3BB'], capture: true },
      condition: (data, matches) => {
        data.cropCircleActors[matches.count] = parseInt(matches.targetId, 16);

        if (Object.keys(data.cropCircleActors).length < 4)
          return false;

        return true;
      },
      suppressSeconds: 60,
      promise: async (data) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: Object.values(data.cropCircleActors),
        })).combatants;

        const filteredActors = actors.filter((a) => a.PosZ < 5);

        const bottomActor = filteredActors[0];

        if (filteredActors.length !== 1 || bottomActor === undefined) {
          console.error(
            `Crop Circle Collector: Wrong combatants count ${actors.length}`,
            actors,
          );
          return;
        }

        const bottomActorCount =
          Object.entries(data.cropCircleActors).filter((e) => e[1] === bottomActor.ID)[0];

        if (bottomActorCount === undefined) {
          console.error(
            `Crop Circle Collector: Missing bottomActorCount match`,
            data.cropCircleActors,
            bottomActor,
          );
          return;
        }

        const offset = parseInt(bottomActorCount[0], 16) - 0x3B8;

        data.cropCircleOrder = [...data.reapingSafeDirs, ...data.reapingSafeDirs].slice(
          offset,
          offset + 4,
        );
      },
    },
    {
      id: 'NecronEx The Second/Fourth Season',
      type: 'StartsUsing',
      netRegex: { id: ['B06F', 'B070'], capture: true },
      durationSeconds: 18,
      infoText: (data, matches, output) => {
        const [dir1, dir2, dir3, dir4] = data.cropCircleOrder;

        if (
          data.cropCircleOrder.length !== 4 || dir1 === undefined || dir2 === undefined ||
          dir3 === undefined || dir4 === undefined
        ) {
          console.error(
            `Crop Circle Collector: Invalid safe dir info`,
            data.cropCircleOrder,
          );
          return;
        }
        const mech = matches.id === 'B06F' ? 'healerStacks' : 'partners';

        return output.text!({
          dir1: output[dir1]!(),
          dir2: output[dir2]!(),
          dir3: output[dir3]!(),
          dir4: output[dir4]!(),
          mech: output[mech]!(),
        });
      },
      run: (data) => {
        data.cropCircleActors = {};
        data.cropCircleActors = {};
        data.reapingSafeDirs = [];
        data.cropCircleOrder = [];
        data.cropCircleActors = {};
      },
      outputStrings: {
        in: Outputs.in,
        out: Outputs.out,
        sides: Outputs.sides,
        mid: Outputs.middle,
        healerStacks: Outputs.healerGroups,
        partners: Outputs.stackPartner,
        text: {
          en: '${dir1} => ${dir2} => ${dir3} => ${dir4} + ${mech}',
        },
      },
    },
    {
      id: 'NecronEx Circle of Lives',
      type: 'StartsUsing',
      netRegex: { id: 'AE38', capture: true },
      preRun: (data) => data.circleOfLivesCounter++,
      delaySeconds: 0.2,
      durationSeconds: 6.5,
      infoText: (data, matches, output) => {
        const pos = data.actorPositions[matches.sourceId];

        if (pos === undefined) {
          console.error(
            `Circle of Lives: Missing actor data for ${matches.sourceId}`,
            data.actorPositions,
          );
          return;
        }

        let safe: DirectionOutput8 | 'middle';

        if (Math.abs(pos.x - 100) < 1)
          safe = 'middle';
        else
          safe = Directions.xyTo8DirOutput(pos.x, pos.y, 100, 100);

        // First 5 are part of the first set of mechs
        if (data.circleOfLivesCounter <= 5) {
          const handRow = data.loomingSpecterLocs[0];
          const circleRow: LoomingSpecterDir = safe === 'middle'
            ? 'middle'
            : (pos.y < 99 ? 'north' : 'south');
          // If this is the 2nd circle, and the hand is in line with the circle, warn to move quickly after the hit
          if (data.circleOfLivesCounter === 2 && handRow === circleRow)
            return output.dodge!({ dir: output[safe]!() });

          // If this is the 3rd circle, and the hand is in line with the circle, warn to wait for hand first
          if (data.circleOfLivesCounter === 3 && handRow === circleRow)
            return output.delay!({ dir: output[safe]!() });

          // Otherwise, indicate safe spot
          return output[safe]!();
        }

        // 6 and 8 are part of the second set, no hands going off during these
        if (data.circleOfLivesCounter === 6 || data.circleOfLivesCounter === 8) {
          return output[safe]!();
        }

        // Deal with the hands for 7 and 9
        const row = data.loomingSpecterLocs[0];

        if (row === undefined || data.loomingSpecterLocs.length > 2) {
          console.error(`Circle of Lives: Invalid row info`, row, data.loomingSpecterLocs);
          return;
        }

        let towards: 'dirN' | 'dirS' | 'middle';

        if (row === 'middle') {
          if (pos.y < 100)
            towards = 'dirN';
          else
            towards = 'dirS';
        } else
          towards = 'middle';

        // Clean up data.loomingSpecterLocs here instead of in run to avoid duplicating
        // condition logic
        data.loomingSpecterLocs = [];

        return output.lean!({
          dir: output[safe]!(),
          to: output[towards]!(),
        });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        middle: Outputs.middle,
        delay: {
          en: 'Wait for hand => ${dir}',
        },
        lean: {
          en: '${dir}, lean ${to}',
        },
        dodge: {
          en: '${dir} => Dodge Hand',
        },
      },
    },
    {
      id: 'NecronEx Mass Macabre Initial',
      type: 'StartsUsing',
      netRegex: { id: 'AE33', capture: false },
      infoText: (_data, _matches, output) => output.towerPos!(),
      outputStrings: {
        towerPos: {
          en: 'Preposition for LP towers',
        },
      },
    },
    {
      id: 'NecronEx Mass Macabre Counter',
      type: 'Ability',
      netRegex: { id: 'AF13', capture: true },
      condition: Conditions.targetIsYou(),
      run: (data) => data.macabreTowerCount++,
    },
    {
      id: 'NecronEx Mass Macabre Next',
      type: 'Ability',
      netRegex: { id: 'AF13', capture: true },
      condition: (data, matches) =>
        Conditions.targetIsYou()(data, matches) && data.macabreTowerCount < 5,
      delaySeconds: 4,
      alertText: (data, _matches, output) => {
        if (data.role === 'tank' && data.macabreTowerCount > 2) {
          // Tanks deal with buster after 2nd tower
          return;
        }
        return output.soakNext!();
      },
      outputStrings: {
        soakNext: {
          en: 'Soak Next Tower',
        },
        tankBuster: Outputs.tankBuster,
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Twofold Blight/Fourfold Blight': 'Twofold/Fourfold Blight',
        'The Second Season/The Fourth Season': 'The Second/Fourth Season',
      },
    },
    {
      'locale': 'de',
      'missingTranslations': true,
      'replaceSync': {
        'Azure Aether': 'azur(?:e|er|es|en) Äther',
        'Beckoning Hands': 'lockend(?:e|er|es|en) Hand',
        'Icy Hands': 'eiskalt(?:e|er|es|en) Hand',
        'Necron': 'Ewig(?:e|er|es|en) Dunkel',
      },
      'replaceText': {
        'Aetherblight': 'Ätherische Verderbnis',
        'Blue Shockwave': 'Blaue Schockwelle',
        'Choking Grasp': 'Würgegriff',
        'Circle of Lives': 'Lebenszirkel',
        'Cold Grip': 'Dunkelhieb',
        'Crop Rotation': 'Fruchtfolge der Dunkelheit',
        'Darkness of Eternity': 'Ewige Dunkelheit',
        'Existential Dread': 'Existenzielle Angst',
        'Fear of Death': 'Todesfurcht',
        'Fourfold Blight': 'Vierfaches Verderben',
        'Grand Cross': 'Supernova',
        'Inevitability': 'Unumgänglichkeit',
        'Mass Macabre': 'Massenfurcht',
        'Memento Mori': 'Memento Mori',
        'Muted Struggle': 'Stiller Kampf',
        'Neutron Ring': 'Neutronenring',
        'Relentless Reaping': 'Andauernde Labung',
        'Shock(?!wave)': 'Entladung',
        '(?<!Blue )Shockwave': 'Schockwelle',
        'Smite of Gloom': 'Schlag der Schwermut',
        'Soul Reaping': 'Seelenlabung',
        'Specter of Death': 'Gesandte des Todes',
        'The End\'s Embrace': 'Letzte Umarmung',
        'The Fourth Season': 'Vierte Saison',
        'The Second Season': 'Zweite Saison',
        'Twofold Blight': 'Doppeltes Verderben',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Azure Aether': 'sphère d\'énergie bleue',
        'Beckoning Hands': 'grand attrape-mort',
        'Icy Hands': 'attrape-mort',
        'Necron': 'Darkness',
      },
      'replaceText': {
        'Aetherblight': 'Voie bleue',
        'Blue Shockwave': 'Onde bleue',
        'Choking Grasp': 'Pression écrasante',
        'Circle of Lives': 'Sphères d\'énergie bleues',
        'Cold Grip': 'Fouet létal',
        'Crop Rotation': 'Rotation des âmes',
        'Darkness of Eternity': 'Obscurité éternelle',
        'Existential Dread': 'Jaillissement obscur',
        'Fear of Death': 'Thanatophobie',
        'Fourfold Blight': 'Voie bleue quadruplée',
        'Grand Cross': 'Croix suprême',
        'Inevitability': 'Déluge de mort',
        'Mass Macabre': 'Panique collective',
        'Memento Mori': 'Memento mori',
        'Muted Struggle': 'Frappe écrasante',
        'Neutron Ring': 'Anneau de neutrons',
        'Relentless Reaping': 'Âmes bleues enchaînées',
        'Shock(?!wave)': 'Décharge électrostatique',
        '(?<!Blue )Shockwave': 'Onde de choc',
        'Smite of Gloom': 'Coup des ténèbres',
        'Soul Reaping': 'Âme bleue',
        'Specter of Death': 'Agrippe-morts',
        'The End\'s Embrace': 'Aile guide',
        'The Fourth Season': 'Motifs bleus quadruplés',
        'The Second Season': 'Motifs bleus doublés',
        'Twofold Blight': 'Voie bleue doublée',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Azure Aether': '青の魂塊',
        'Beckoning Hands': '死に誘う手',
        'Icy Hands': '死を招く手',
        'Necron': '永遠の闇',
      },
      'replaceText': {
        'Aetherblight': '青の波動',
        'Blue Shockwave': '青の衝撃',
        'Choking Grasp': '圧し潰す',
        'Circle of Lives': '青の輪波',
        'Cold Grip': '暗き死の腕',
        'Crop Rotation': '魂の輪転',
        'Darkness of Eternity': 'エターナルダークネス',
        'Existential Dread': '暗気流',
        'Fear of Death': '死の恐怖',
        'Fourfold Blight': '青の四重波',
        'Grand Cross': 'グランドクロス',
        'Inevitability': '死の氾濫',
        'Mass Macabre': '集団恐慌',
        'Memento Mori': 'メメント・モリ',
        'Muted Struggle': '叩き潰す',
        'Neutron Ring': 'ニュートンリング',
        'Relentless Reaping': '連なる青き魂',
        'Shock(?!wave)': '放電',
        '(?<!Blue )Shockwave': '衝撃波',
        'Smite of Gloom': '闇の一撃',
        'Soul Reaping': '青き魂',
        'Specter of Death': '闇の巨腕',
        'The End\'s Embrace': '導きの翼',
        'The Fourth Season': '青の式波・四重',
        'The Second Season': '青の式波・二重',
        'Twofold Blight': '青の二重波',
      },
    },
  ],
};

export default triggerSet;
