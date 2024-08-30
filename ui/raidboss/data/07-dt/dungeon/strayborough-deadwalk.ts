import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Add basically anything to help with the doll charges.
// TODO: Warning for the falling Ferris wheel.
// TODO: Determine safe spots for Tea Awhirl
// TODO: Determine safe spots for Toiling Teapots

export interface Data extends RaidbossData {
  playerIsGhost: boolean;
  solidBitterLinesNext: boolean;
}

const triggerSet: TriggerSet<Data> = {
  id: 'The Strayborough Deadwalk',
  zoneId: ZoneId.TheStrayboroughDeadwalk,
  timelineFile: 'strayborough-deadwalk.txt',
  initData: () => {
    return {
      playerIsGhost: false,
      solidBitterLinesNext: false,
    };
  },
  triggers: [
    {
      id: 'Strayborough Deadwalk Leonogg Malicious Mist',
      type: 'StartsUsing',
      netRegex: { id: '8EB1', source: 'His Royal Headness Leonogg I', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Strayborough Deadwalk Falling Nightmare',
      type: 'Ability',
      netRegex: { id: '8EAE', source: 'His Royal Headness Leonogg I', capture: false },
      infoText: (_data, _matches, output) => output.nightmare!(),
      outputStrings: {
        nightmare: {
          en: 'Avoid nightmare puddles',
          de: 'Weiche den Alptraum-Flächen aus',
          fr: 'Évitez les puddles des cauchemards',
          ko: '악몽 장판 피하기',
        },
      },
    },
    {
      id: 'Strayborough Deadwalk Spirited Charge',
      type: 'StartsUsing',
      netRegex: { id: '8EF6', source: 'His Royal Headness Leonogg I', capture: false },
      infoText: (_data, _matches, output) => output.charge!(),
      outputStrings: {
        charge: {
          en: 'Avoid charging dolls',
          de: 'Weiche den verfolgenden Puppen aus',
          fr: 'Évitez les poupées',
          ko: '돌진하는 인형 피하기',
        },
      },
    },
    {
      id: 'Strayborough Deadwalk Evil Scheme',
      type: 'StartsUsing',
      netRegex: { id: '9B02', source: 'His Royal Headness Leonogg I', capture: false },
      infoText: (_data, _matches, output) => output.exaflares!(),
      outputStrings: {
        exaflares: {
          en: 'Avoid exaflares',
          de: 'Weiche den Exaflares aus',
          fr: 'Évitez les brasiers',
          ko: '엑사플레어 피하기',
        },
      },
    },
    {
      id: 'Strayborough Deadwalk Looming Nightmare',
      type: 'HeadMarker',
      netRegex: { id: '00C5' },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.chasingPuddles!(),
      outputStrings: {
        chasingPuddles: {
          en: 'Chasing puddles on YOU',
          de: 'Verfolgende Flächen auf DIR',
          fr: 'Puddles sur VOUS',
          ko: '따라오는 장판 피하기',
        },
      },
    },
    {
      id: 'Strayborough Deadwalk Last Drop',
      type: 'HeadMarker',
      netRegex: { id: '00DA' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Strayborough Deadwalk Sordid Steam',
      type: 'StartsUsing',
      netRegex: { id: '8F75', source: 'Jack-in-the-Pot', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Strayborough Deadwalk Ghostly Guise Gain',
      type: 'GainsEffect',
      netRegex: { effectId: 'F6D' },
      condition: Conditions.targetIsYou(),
      run: (data) => data.playerIsGhost = true,
    },
    {
      id: 'Strayborough Deadwalk Ghostly Guise Lose',
      type: 'LosesEffect',
      netRegex: { effectId: 'F6D' },
      condition: Conditions.targetIsYou(),
      run: (data) => data.playerIsGhost = false,
    },
    {
      id: 'Strayborough Deadwalk Bitter Regret Middle',
      type: 'StartsUsing',
      netRegex: { id: '9113', source: 'Träumerei', capture: false },
      response: Responses.goSides(),
    },
    {
      id: 'Strayborough Deadwalk Bitter Regret Sides',
      type: 'StartsUsing',
      netRegex: { id: '9114', source: 'Träumerei', capture: false },
      response: Responses.goMiddle(),
    },
    {
      id: 'Strayborough Deadwalk Ill Intent',
      type: 'StartsUsing',
      netRegex: { id: '9AB7', source: 'Stray Geist' },
      condition: Conditions.targetIsYou(),
      alertText: (data, _matches, output) => {
        if (data.playerIsGhost)
          return output.ghostTether!();
        return output.fleshTether!();
      },
      outputStrings: {
        ghostTether: {
          en: 'Stretch tether',
          de: 'Verbindungen langziehen',
          fr: 'Étirez le lien',
          ko: '선 늘이기',
        },
        fleshTether: {
          en: 'Become ghost => stretch tether',
          de: 'Werde ein Geist => Verbindungen langzeiehen',
          fr: 'Transformez-vous en fantôme => Étirez lien',
          ko: '유령 변신 => 선 늘이기',
        },
      },
    },
    {
      id: 'Strayborough Deadwalk Fleshbuster',
      type: 'StartsUsing',
      netRegex: { id: '911C', source: 'Träumerei', capture: false },
      alertText: (data, _matches, output) => {
        if (data.playerIsGhost)
          return;
        return output.becomeGhost!();
      },
      infoText: (data, _matches, output) => {
        if (!data.playerIsGhost)
          return;
        return output.stayGhost!();
      },
      outputStrings: {
        becomeGhost: {
          en: 'Become a ghost',
          de: 'Werde ein Geist',
          fr: 'Transformez-vous en fantôme',
          ko: '유령 변신',
        },
        stayGhost: {
          en: 'Stay a ghost',
          de: 'Bleib ein Geist',
          fr: 'Restez en fantôme',
          ko: '유령 유지',
        },
      },
    },
    {
      // Despite this attack having spread marker visuals,
      // it doesn't actually do any damage if done correctly,
      // and stacking two or more has no effect.
      id: 'Strayborough Deadwalk Ghostduster',
      type: 'StartsUsing',
      netRegex: { id: '9119', source: 'Träumerei', capture: false },
      alertText: (data, _matches, output) => {
        if (!data.playerIsGhost)
          return;
        return output.becomeFlesh!();
      },
      infoText: (data, _matches, output) => {
        if (data.playerIsGhost)
          return;
        return output.stayFlesh!();
      },
      outputStrings: {
        becomeFlesh: {
          en: 'Clear ghost status',
          de: 'Reinige Geist Status',
          fr: 'Effacez le status de fantôme',
          ko: '유령 해제',
        },
        stayFlesh: {
          en: 'Avoid ghost tiles',
          de: 'Vermeide Geist-Flächen',
          fr: 'Évitez les marques de fantôme',
          ko: '유령 장판 피하기',
        },
      },
    },
    {
      id: 'Strayborough Deadwalk Träumerei Malicious Mist',
      type: 'StartsUsing',
      netRegex: { id: '9130', source: 'Träumerei', capture: false },
      response: Responses.bleedAoe(),
    },
    {
      // There are two different Bitter Regret mechanics from adds,
      // both of which use ID 91DC.
      // Fortunately, the two different mechanics are always bracketed by
      // Fleshbuster/Ghostduster and by Impact.
      // Thus, we look for any usage of these three skills and turn
      // the solid lines flag on or off as appropriate.
      id: 'Strayborough Deadwalk Alternate Lines Next',
      type: 'Ability',
      netRegex: { id: ['9119', '911C'], source: 'Träumerei', capture: false },
      run: (data) => data.solidBitterLinesNext = false,
    },
    {
      id: 'Strayborough Deadwalk Solid Lines Next',
      type: 'Ability',
      netRegex: { id: '910D', source: 'Träumerei', capture: false },
      run: (data) => data.solidBitterLinesNext = true,
    },
    {
      id: 'Strayborough Deadwalk Bitter Regret Alternate Lines',
      type: 'StartsUsing',
      netRegex: { id: '91DC', source: 'Stray Phantagenitrix', capture: false },
      condition: (data) => !data.solidBitterLinesNext,
      suppressSeconds: 10, // Don't warn on second set.
      infoText: (_data, _matches, output) => output.dodgeLines!(),
      outputStrings: {
        dodgeLines: {
          en: 'Start mid => Dodge lines',
          de: 'Starte Mittig => Weiche Linien aus',
          fr: 'Démarrez au milieu => Évitez les lignes',
          ko: '가운데 => 줄 피하기',
        },
      },
    },
    {
      // The lines are 4 units apart on center, in the range 130-166.
      // Centerline is 148 and never has a ghost. Lower values are left, higher values are right.
      id: 'Strayborough Deadwalk Bitter Regret Solid Lines',
      type: 'StartsUsing',
      netRegex: { id: '91DC', source: 'Stray Phantagenitrix' },
      condition: (data) => data.solidBitterLinesNext,
      suppressSeconds: 1, // Multiple instances start casting simultaneously.
      infoText: (_data, matches, output) => {
        const rightUnsafe = Math.round(parseFloat(matches.x)) > 149;
        if (rightUnsafe)
          return output.goLeft!();
        return output.goRight!();
      },
      outputStrings: {
        goRight: Outputs.right,
        goLeft: Outputs.left,
      },
    },
    {
      // As with some other stack lasers in 7.0 content,
      // this doesn't use the head marker log line,
      // instead simply insta-casting an unknown ability on the target.
      // The actual damage ability starts casting alongside.

      // Despite its name, this doesn't seem to be affected
      // by whether or not the targets are ghosts.
      id: 'Strayborough Deadwalk Ghostcrusher',
      type: 'Ability',
      netRegex: { id: '9118', source: 'Träumerei' },
      response: Responses.stackMarkerOn(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'His Royal Headness Leonogg I': 'S.K.H Leokopf I.',
        'Jack-in-the-Pot': 'Polteegeist',
        'Noble Noggin': 'selbstlos(?:e|er|es|en) Schönkopf',
        'Spectral Samovar': 'Samowaah',
        'Stray Geist': 'mahrtastisch(?:e|er|es|en) Geist',
        'Stray Phantagenitrix': 'mahrtastisch(?:e|er|es|en) Genetrix',
        'Träumerei': 'Träumerei',
      },
      'replaceText': {
        '\\(cast\\)': '(wirken)',
        '\\(lines\\)': '(Linien)',
        '\\(middle/sides\\)': '(Mitte/Seiten)',
        '\\(plonk\\)': '(fallen)',
        '\\(sides\\)': '(Seiten)',
        '\\(solid lines\\)': '(feste Linien)',
        'Bitter Regret': 'Bittere Erinnerung',
        'Evil Scheme': 'Verruchtes Vorhaben',
        'Falling Nightmare': 'Albtraum-Stoff',
        'Fleshbuster': 'Lebendes Hack',
        'Ghostcrusher': 'Schwellende Sehnsucht',
        'Ghostduster': 'Geisterbereinigung',
        'Ill Intent': 'Böse Absichten',
        'Impact': 'Begraben',
        'Last Drop': 'Letzter Tropfen',
        'Looming Nightmare': 'Alberner Albtraum',
        'Malicious Mist': 'Niederträchtiger Nebel',
        'Memorial March': 'Parade der Vergessenen',
        'Piping Pour': 'Einschenken',
        'Poltergeist': 'Poltergeist',
        'Scream': 'Schrei',
        'Sordid Steam': 'Dreckiger Dampf',
        'Spirited Charge': 'Mit dem Kopf durch die Wand',
        'Tea Awhirl': 'Gerührt, nicht geschüttelt',
        'Team Spirit': 'Teamgeist',
        'Toiling Teapots': 'Trubel mit Tassen',
        'Tricksome Treat': 'Hinterhältiger Hochgenuss',
        'Troubling Teacups': 'Trubel mit Tassen',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'His Royal Headness Leonogg I': 'Sa Cabochesté Boubouille Ier',
        'Jack-in-the-Pot': 'Diablothé',
        'Noble Noggin': 'Bonne bouille',
        'Spectral Samovar': 'Théière spectrale',
        'Stray Geist': 'Fantôme errant',
        'Stray Phantagenitrix': 'Maman fantôme errante',
        'Träumerei': 'Träumerei',
      },
      'replaceText': {
        '\\(cast\\)': '(Incante)',
        '\\(lines\\)': '(Lignes)',
        '\\(middle/sides\\)': '(Milieu/Côtés)',
        '\\(plonk\\)': '(Tombe)',
        '\\(sides\\)': '(Côtés)',
        '\\(solid lines\\)': '(Lignes solides)',
        'Bitter Regret': 'Souvenirs amers',
        'Evil Scheme': 'Plan machiavélique',
        'Falling Nightmare': 'Chute cauchemardesque',
        'Fleshbuster': 'Hachoir à chair',
        'Ghostcrusher': 'Lourde réminiscence',
        'Ghostduster': 'Purgation de spectre',
        'Ill Intent': 'Paire fatale',
        'Impact': 'Impact',
        'Last Drop': 'Dernière goutte',
        'Looming Nightmare': 'Terrain cauchemardesque',
        'Malicious Mist': 'Brume malfaisante',
        'Memorial March': 'Parade mémoriale',
        'Piping Pour': 'Service',
        'Poltergeist': 'Esprit frappeur',
        'Scream': 'Cri',
        'Sordid Steam': 'Plan machiavélique',
        'Spirited Charge': 'Ordre d\'attaque',
        'Tea Awhirl': 'Tasses tournantes',
        'Team Spirit': 'Esprit d\'équipe',
        'Toiling Teapots': 'Théières meurtrières',
        'Tricksome Treat': 'Diable en tasse',
        'Troubling Teacups': 'Tasses d\'ectoplasme',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'His Royal Headness Leonogg I': 'ノッギン・ザ・ナイスヘッド',
        'Jack-in-the-Pot': 'ジャック・イン・ザ・ポット',
        'Noble Noggin': 'ナイスヘッド',
        'Spectral Samovar': 'スペクトラル・サモワール',
        'Stray Geist': 'ストレイ・ゴースト',
        'Stray Phantagenitrix': 'ストレイ・マザーゴースト',
        'Träumerei': 'トロイメライ',
      },
      'replaceText': {
        'Bitter Regret': 'ビターメモリーズ',
        'Evil Scheme': 'イービルスキーム',
        'Falling Nightmare': 'ナイトメアフォール',
        'Fleshbuster': 'リビングスライサー',
        'Ghostcrusher': 'ヘビーメモリーズ',
        'Ghostduster': 'ゴーストダスター',
        'Ill Intent': 'イービルソート',
        'Impact': '衝撃',
        'Last Drop': 'ラストドロップ',
        'Looming Nightmare': 'ナイトメアルーム',
        'Malicious Mist': 'イービルミスト',
        'Memorial March': 'メモリアルパレード',
        'Piping Pour': 'サーブ',
        'Poltergeist': 'ポルターガイスト',
        'Scream': 'スクリーム',
        'Sordid Steam': 'イービルスチーム',
        'Spirited Charge': '突撃命令',
        'Tea Awhirl': 'ティーアホワール',
        'Team Spirit': 'チームスピリット',
        'Toiling Teapots': 'ティーポット',
        'Tricksome Treat': 'トリックサム・トリート',
        'Troubling Teacups': 'ティーカップ',
      },
    },
  ],
};

export default triggerSet;
