import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO:
//  - Beat 1: Track player hearts and only fire `Headmarker Party Stacks` based on <=2 hearts?
//     - Related: Perhaps call 'Don't stack' if player has 3 hearts?

export interface Data extends RaidbossData {
  partnersSpreadCounter: number;
  storedPartnersSpread?: 'partners' | 'spread';
  beat?: 1 | 2 | 3;
  beatTwoOneStart?: boolean;
  beatTwoSpreadCollect: string[];
  tankLaserCollect: string[];
  poisonDebuff?: 'short' | 'long';
  beelovedDebuffs: {
    alpha: string[];
    beta: string[];
  };
  beelovedType?: 'alpha' | 'beta';
}

const headMarkerData = {
  // Vfx Path: lockon6_t0t
  spreadMarker1: '00EA',
  // Vfx Path: m0676trg_tw_d0t1p
  sharedBuster: '0103',
  // Vfx Path: tank_laser_5sec_lockon_c0a1
  tankLaser: '01D7',
  // Vfx Path: m0906_tgae_s701k2
  spreadMarker2: '0203',
  // Vfx Path: m0906_share4_7s0k2
  heartStackMarker: '0205',
} as const;

const poisonOutputStrings = {
  defamationOnYou: Outputs.defamationOnYou,
  defamations: {
    en: 'Defamations',
    de: 'Große AoE auf dir',
    fr: 'Grosse AoE sur vous',
    ja: '自分に巨大な爆発',
    cn: '大圈点名',
    ko: '광역 대상자',
  },
  in: {
    en: 'In (Avoid Defamations)',
    de: 'Mitte (weiche den AoEs aus)',
    fr: 'Intérieur (évitez les AoE)',
    ja: '中央へ (巨大な爆発を避けて)',
    cn: '去脚下 (远离大圈)',
    ko: '안으로 (광역 피하기)',
  },
};

const beelovedDebuffDurationOrder = [12, 28, 44, 62];

const triggerSet: TriggerSet<Data> = {
  id: 'AacLightHeavyweightM2Savage',
  zoneId: ZoneId.AacLightHeavyweightM2Savage,
  timelineFile: 'r2s.txt',
  initData: () => ({
    partnersSpreadCounter: 0,
    beatTwoSpreadCollect: [],
    tankLaserCollect: [],
    beelovedDebuffs: {
      alpha: Array(4).map(() => ''),
      beta: Array(4).map(() => ''),
    },
  }),
  triggers: [
    {
      id: 'R2S Beat Tracker',
      type: 'StartsUsing',
      netRegex: { id: ['9C24', '9C25', '9C26'], capture: true },
      run: (data, matches) => {
        if (matches.id === '9C24')
          data.beat = 1;
        else if (matches.id === '9C25')
          data.beat = 2;
        else
          data.beat = 3;
      },
    },
    {
      id: 'R2S Heart Debuff',
      type: 'GainsEffect',
      netRegex: { effectId: ['F52', 'F53', 'F54'], capture: true },
      condition: Conditions.targetIsYou(),
      delaySeconds: (data) => data.beat === 1 ? 17 : 0,
      suppressSeconds: (data) => {
        if (data.beat === 1)
          return 120;
        if (data.beat === 2)
          return 70;

        // We don't care about heart stacks during beat 3
        return 9999;
      },
      infoText: (data, matches, output) => {
        if (data.beat === 1) {
          return output.beatOne!();
        }
        if (data.beat === 2) {
          if (matches.effectId === 'F52')
            return output.beatTwoZeroHearts!();
          if (matches.effectId === 'F53') {
            data.beatTwoOneStart = true;
            return output.beatTwoOneHearts!();
          }
        }
      },
      outputStrings: {
        beatOne: {
          en: 'Soak towers - need 2-3 hearts',
          de: 'Nimm Türme - benötigt 2-3 Herzen',
          fr: 'Prenez les tours - 2-3 cœurs nécessaires',
          ja: '塔を踏む - 2-3個のハートに調整',
          cn: '踩塔 - 踩到2-3颗心',
          ko: '기둥 들어가기 - 하트 2-3개 유지하기',
        },
        beatTwoZeroHearts: {
          en: 'Puddles & Stacks',
          de: 'Flächen + sammeln',
          fr: 'Puddles + Package',
          ja: '集合捨てと頭割り',
          cn: '集合分摊放圈',
          ko: '장판 피하기 + 쉐어',
        },
        beatTwoOneHearts: {
          en: 'Spreads & Towers',
          de: 'Verteilen + Türme',
          fr: 'Dispersion + Tours',
          ja: '散開 / 塔踏み',
          cn: '分散 / 踩塔',
          ko: '산개 / 기둥',
        },
      },
    },
    {
      id: 'R2S Headmarker Shared Tankbuster',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.sharedBuster, capture: true },
      response: Responses.sharedTankBuster(),
    },
    {
      id: 'R2S Headmarker Cone Tankbuster Collect',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.tankLaser, capture: true },
      run: (data, matches) => data.tankLaserCollect.push(matches.target),
    },
    {
      id: 'R2S Headmarker Cone Tankbuster',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.tankLaser, capture: false },
      delaySeconds: 0.1,
      suppressSeconds: 5,
      alertText: (data, _matches, output) => {
        if (data.tankLaserCollect.includes(data.me))
          return output.cleaveOnYou!();

        return output.avoidCleave!();
      },
      run: (data) => data.tankLaserCollect = [],
      outputStrings: {
        cleaveOnYou: Outputs.tankCleaveOnYou,
        avoidCleave: Outputs.avoidTankCleave,
      },
    },
    {
      id: 'R2S Headmarker Spread Collect',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.spreadMarker2, capture: true },
      run: (data, matches) => data.beatTwoSpreadCollect.push(matches.target),
    },
    {
      id: 'R2S Headmarker Spread',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.spreadMarker2, capture: false },
      delaySeconds: 0.1,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (data.beatTwoSpreadCollect.includes(data.me))
          return output.avoidTowers!();
        else if (data.beatTwoOneStart)
          return output.towers!();
      },
      run: (data) => {
        data.beatTwoSpreadCollect = [];
        data.beatTwoOneStart = false;
      },
      outputStrings: {
        avoidTowers: {
          en: 'Spread -- Avoid Towers',
          de: 'Verteilen -- Vermeide Türme',
          fr: 'Dispersion -- Évitez les tours',
          ja: '散開 -- 塔は避けて',
          cn: '分散 - 躲开塔',
          ko: '산개 -- 기둥 피하기',
        },
        towers: Outputs.getTowers,
      },
    },
    {
      id: 'R2S Headmarker Alarm Pheromones Puddle',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.spreadMarker1, capture: true },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Drop Puddle Outside',
          de: 'Lege Fläche außen ab',
          fr: 'Déposez le puddle à l\'extérieur',
          ja: '外側に捨てて',
          cn: '在场边放毒圈',
          ko: '바깥쪽에 장판 놓기',
        },
      },
    },
    {
      id: 'R2S Headmarker Party Stacks',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.heartStackMarker, capture: false },
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.stacks!(),
      outputStrings: {
        stacks: Outputs.stacks,
      },
    },
    {
      id: 'R2S Call Me Honey',
      type: 'StartsUsing',
      netRegex: { id: '9183', source: 'Honey B. Lovely', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R2S Partners/Spread Counter',
      type: 'StartsUsing',
      netRegex: { id: ['9184', '9185', '9B08', '9B09'], source: 'Honey B. Lovely', capture: false },
      run: (data) => data.partnersSpreadCounter++,
    },
    {
      id: 'R2S Drop of Venom',
      type: 'StartsUsing',
      netRegex: { id: '9185', source: 'Honey B. Lovely', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      run: (data) => data.storedPartnersSpread = 'partners',
      outputStrings: {
        text: {
          en: 'Stored: Partners',
          de: 'Gespeichert: Partner',
          fr: 'Enregistré : Partenaires',
          ja: 'あとでペア',
          cn: '存储分摊',
          ko: '나중에 쉐어',
        },
      },
    },
    {
      id: 'R2S Splash of Venom',
      type: 'StartsUsing',
      netRegex: { id: '9184', source: 'Honey B. Lovely', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      run: (data) => data.storedPartnersSpread = 'spread',
      outputStrings: {
        text: {
          en: 'Stored: Spread',
          de: 'Gespeichert: Verteilen',
          fr: 'Enregistré : Dispersion',
          ja: 'あとで散開',
          cn: '存储分散',
          ko: '나중에 산개',
        },
      },
    },
    {
      id: 'R2S Drop of Love',
      type: 'StartsUsing',
      netRegex: { id: '9B09', source: 'Honey B. Lovely', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      run: (data) => data.storedPartnersSpread = 'partners',
      outputStrings: {
        text: {
          en: 'Stored: Partners',
          de: 'Gespeichert: Partner',
          fr: 'Enregistré : Partenaires',
          ja: 'あとでペア',
          cn: '存储分摊',
          ko: '나중에 쉐어',
        },
      },
    },
    {
      id: 'R2S Spread Love',
      type: 'StartsUsing',
      netRegex: { id: '9B08', source: 'Honey B. Lovely', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      run: (data) => data.storedPartnersSpread = 'spread',
      outputStrings: {
        text: {
          en: 'Stored: Spread',
          de: 'Gespeichert: Verteilen',
          fr: 'Enregistré : Dispersion',
          ja: 'あとで散開',
          cn: '存储分散',
          ko: '나중에 산개',
        },
      },
    },
    {
      id: 'R2S Honey Beeline Initial',
      type: 'StartsUsing',
      netRegex: { id: ['9186', '9B0C'], source: 'Honey B. Lovely', capture: false },
      response: Responses.goSides(), // default is alertText, no need to specify
    },
    {
      id: 'R2S Honey Beeline After Reminder',
      type: 'StartsUsing',
      netRegex: { id: ['9186', '9B0C'], source: 'Honey B. Lovely', capture: false },
      delaySeconds: 1.5, // add a short delay to avoid overlapping alerts
      infoText: (data, _matches, output) => {
        const mech = data.storedPartnersSpread;
        return mech === undefined ? output.middle!() : output[mech]!();
      },
      outputStrings: {
        middle: {
          en: '(middle after)',
          de: '(danach mitte)',
          fr: '(milieu après)',
          ja: '(後で内側へ)',
          cn: '(稍后场中)',
          ko: '(나중에 중앙으로)',
        },
        partners: {
          en: '(middle + partners after)',
          de: '(mitte + danach mit partner sammeln)',
          fr: '(milieu + partenaires après)',
          ja: '(後で内側へ + ペア)',
          cn: '(稍后场中 + 分摊)',
          ko: '(나중에 중앙으로 + 쉐어)',
        },
        spread: {
          en: '(middle + spread after)',
          de: '(mitte + danach verteilen)',
          fr: '(milieu + dispersion après)',
          ja: '(後で内側へ + 散開)',
          cn: '(稍后场中 + 分散)',
          ko: '(나중에 중앙으로 + 산개)',
        },
      },
    },
    {
      id: 'R2S Honey Beeline Followup',
      type: 'Ability',
      netRegex: { id: ['9186', '9B0C'], source: 'Honey B. Lovely', capture: false },
      alertText: (data, _matches, output) => {
        const mech = data.storedPartnersSpread;
        const outStr = mech === undefined
          ? output.middle!()
          : output.combo!({ next: output.middle!(), mech: output[mech]!() });
        return outStr;
      },
      outputStrings: {
        middle: Outputs.middle,
        spread: {
          en: 'Spread',
          de: 'Verteilen',
          fr: 'Dispersion',
          ja: '散開',
          cn: '分散',
          ko: '산개',
        },
        partners: {
          en: 'Partners',
          de: 'Partner',
          fr: 'Partenaires',
          ja: 'ペア',
          cn: '分摊',
          ko: '쉐어',
        },
        combo: {
          en: '${next} + ${mech}',
          de: '${next} + ${mech}',
          fr: '${next} + ${mech}',
          ja: '${next} + ${mech}',
          cn: '${next} + ${mech}',
          ko: '${next} + ${mech}',
        },
      },
    },
    {
      id: 'R2S Tempting Twist Initial',
      type: 'StartsUsing',
      netRegex: { id: ['9187', '9B0D'], source: 'Honey B. Lovely', capture: false },
      response: Responses.getUnder('alert'),
    },
    {
      id: 'R2S Tempting Twist After Reminder',
      type: 'StartsUsing',
      netRegex: { id: ['9187', '9B0D'], source: 'Honey B. Lovely', capture: false },
      delaySeconds: 1.5, // add a short delay to avoid overlapping alerts
      infoText: (data, _matches, output) => {
        const mech = data.storedPartnersSpread;
        return mech === undefined ? output.out!() : output[mech]!();
      },
      outputStrings: {
        out: {
          en: '(out after)',
          de: '(danach raus)',
          fr: '(extérieur après)',
          ja: '(後で外側へ)',
          cn: '(稍后远离)',
          ko: '(나중에 밖으로)',
        },
        partners: {
          en: '(out + partners after)',
          de: '(raus + danach mit partner sammeln)',
          fr: '(extérieur + partenaires après',
          ja: '(後で外側へ + ペア)',
          cn: '(稍后远离 + 分摊)',
          ko: '(나중에 밖으로 + 쉐어)',
        },
        spread: {
          en: '(out + spread after)',
          de: '(raus + danach verteilen)',
          fr: '(extérieur + dispersion après)',
          ja: '(後で外側へ + 散開)',
          cn: '(稍后远离 + 分散)',
          ko: '(나중에 밖으로 + 산개)',
        },
      },
    },
    {
      id: 'R2S Tempting Twist Followup',
      type: 'Ability',
      netRegex: { id: ['9187', '9B0D'], source: 'Honey B. Lovely', capture: false },
      alertText: (data, _matches, output) => {
        const mech = data.storedPartnersSpread;
        const outStr = mech === undefined
          ? output.out!()
          : output.combo!({ next: output.out!(), mech: output[mech]!() });
        return outStr;
      },
      outputStrings: {
        out: Outputs.out,
        spread: {
          en: 'Spread',
          de: 'Verteilen',
          fr: 'Dispersion',
          ja: '散開',
          cn: '分散',
          ko: '산개',
        },
        partners: {
          en: 'Partners',
          de: 'Partner',
          fr: 'Partenaires',
          ja: 'ペア',
          cn: '分摊',
          ko: '쉐어',
        },
        combo: {
          en: '${next} + ${mech}',
          de: '${next} + ${mech}',
          fr: '${next} + ${mech}',
          ja: '${next} + ${mech}',
          cn: '${next} + ${mech}',
          ko: '${next} + ${mech}',
        },
      },
    },
    {
      id: 'R2S Honey B. Live: 1st Beat',
      type: 'StartsUsing',
      netRegex: { id: '9C24', source: 'Honey B. Lovely', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R2S Honey B. Live: 2nd Beat',
      type: 'StartsUsing',
      netRegex: { id: '9C25', source: 'Honey B. Lovely', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R2S Honey B. Live: 3rd Beat',
      type: 'StartsUsing',
      netRegex: { id: '9C26', source: 'Honey B. Lovely', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R2S Loveseeker',
      type: 'StartsUsing',
      netRegex: { id: '9B7D', source: 'Honey B. Lovely', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'R2S Centerstage Combo',
      type: 'StartsUsing',
      netRegex: { id: '91AC', source: 'Honey B. Lovely', capture: false },
      durationSeconds: 9,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Under Intercards => Out => Cards',
          de: 'Rein Interkardinal => Raus => Kardinal',
          fr: 'Dessous intercardinal => Extérieur => Cardinal',
          ja: '斜め内側 => 外側 => 十字',
          cn: '内斜角 => 外斜角 => 外正点',
          ko: '보스 아래 대각 => 밖으로 => 십자',
        },
      },
    },
    {
      id: 'R2S Outerstage Combo',
      type: 'StartsUsing',
      netRegex: { id: '91AD', source: 'Honey B. Lovely', capture: false },
      durationSeconds: 9,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Out Cards => Intercards => Under',
          de: 'Raus Kardinal => Interkardinal => Rein',
          fr: 'Extérieur cardinal => Intercardinal => Dessous',
          ja: '外十字 => 外斜め => 内側',
          cn: '外正点 => 外斜角 => 内斜角',
          ko: '칼끝딜 십자 => 밖으로 => 보스 아래 대각',
        },
      },
    },
    {
      id: 'R2S Poison Debuff Tracker',
      type: 'GainsEffect',
      netRegex: { effectId: 'F5E' },
      condition: Conditions.targetIsYou(),
      // short debuffs are 26s, longs are 46s
      run: (data, matches) =>
        data.poisonDebuff = parseFloat(matches.duration) > 30 ? 'long' : 'short',
    },
    {
      id: 'R2S Poison First Defamations',
      type: 'GainsEffect',
      netRegex: { effectId: 'F5E', capture: false },
      delaySeconds: 20, // 6 sec. before expiration
      durationSeconds: 6,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (data.poisonDebuff === undefined)
          return output.defamations!();
        return data.poisonDebuff === 'short' ? output.defamationOnYou!() : output.in!();
      },
      outputStrings: poisonOutputStrings,
    },
    {
      id: 'R2S Poison Second Defamations',
      type: 'GainsEffect',
      netRegex: { effectId: 'F5E', capture: false },
      delaySeconds: 40, // 6 sec. before expiration
      durationSeconds: 6,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (data.poisonDebuff === undefined)
          return output.defamations!();
        return data.poisonDebuff === 'short' ? output.in!() : output.defamationOnYou!();
      },
      outputStrings: poisonOutputStrings,
    },
    {
      id: 'R2S Poison Towers',
      type: 'GainsEffect',
      netRegex: { effectId: 'F5E' },
      // use condition instead of suppress to prevent race condition with Poison Debuff Tracker
      condition: Conditions.targetIsYou(),
      // delay until the opposite (short/long) debuff resolves
      delaySeconds: (data) => data.poisonDebuff === 'long' ? 26 : 46,
      alertText: (data, _matches, output) => {
        // if no poison debuff, there really can't be an accurate call anyway
        if (data.poisonDebuff !== undefined)
          return output.towers!();
      },
      outputStrings: {
        towers: Outputs.getTowers,
      },
    },
    {
      id: 'R2S Honey B. Finale',
      type: 'StartsUsing',
      netRegex: { id: '918F', source: 'Honey B. Lovely', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R2S Rotten Heart',
      type: 'StartsUsing',
      netRegex: { id: '91AA', source: 'Honey B. Lovely', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R2S Beeloved Venom Tracker',
      type: 'GainsEffect',
      // F5C: Alpha, F5D: Beta
      // durations are 12s, 28s, 44s, and 62s
      netRegex: { effectId: ['F5C', 'F5D'] },
      run: (data, matches) => {
        const type = matches.effectId === 'F5C' ? 'alpha' : 'beta';
        if (data.me === matches.target)
          data.beelovedType = type;

        const duration = parseFloat(matches.duration);
        const orderIdx = beelovedDebuffDurationOrder.indexOf(duration);
        if (orderIdx === -1) // should not happen
          return;
        data.beelovedDebuffs[type][orderIdx] = matches.target;
      },
    },
    {
      id: 'R2S Beeloved Venom Player Merge',
      type: 'GainsEffect',
      netRegex: { effectId: ['F5C', 'F5D'] },
      condition: Conditions.targetIsYou(),
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 10,
      alertText: (data, _matches, output) => {
        let partner = output.unknown!();
        const myType = data.beelovedType;
        if (myType === undefined)
          return output.merge!({ player: partner });

        const orderIdx = data.beelovedDebuffs[myType].indexOf(data.me);
        if (orderIdx === -1)
          return output.merge!({ player: partner });

        const partnerType = myType === 'alpha' ? 'beta' : 'alpha';
        partner = data.party.member(data.beelovedDebuffs[partnerType][orderIdx]).nick ??
          output.unknown!();
        return output.merge!({ player: partner });
      },
      outputStrings: {
        merge: {
          en: 'Merge Soon w/ ${player}',
          de: 'Bald berühren mit ${player}',
          fr: 'Fusion bientôt avec ${player}',
          ja: '${player} と重なって',
          cn: '准备和 ${player} 撞毒',
          ko: '${player} 과 융합하기',
        },
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'R2S Beeloved Venom Other Merge',
      type: 'GainsEffect',
      // only fire on the Alpha debuffs so the trigger fires once per merge
      netRegex: { effectId: 'F5C' },
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 10,
      infoText: (data, matches, output) => {
        const duration = parseFloat(matches.duration);
        const orderIdx = beelovedDebuffDurationOrder.indexOf(duration);
        if (orderIdx === -1) // should not happen
          return;

        const alpha = data.beelovedDebuffs.alpha[orderIdx] ?? output.unknown!();
        const beta = data.beelovedDebuffs.beta[orderIdx] ?? output.unknown!();

        // no alert if we're one of the players; that's handled by Player Merge
        if (alpha === data.me || beta === data.me)
          return;

        const alphaShort = data.party.member(alpha).nick ?? output.unknown!();
        const betaShort = data.party.member(beta).nick ?? output.unknown!();
        return output.merge!({ alpha: alphaShort, beta: betaShort });
      },
      outputStrings: {
        merge: {
          en: 'Merge: ${alpha} + ${beta}',
          de: 'Berühren: ${alpha} + ${beta}',
          fr: 'Fusion : ${alpha} + ${beta}',
          ja: '組み合わせ: ${alpha} + ${beta}',
          cn: '撞毒: ${alpha} + ${beta}',
          ko: '융합: ${alpha} + ${beta}',
        },
        unknown: Outputs.unknown,
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Honey B. Lovely': 'Suzie Summ Honigsüß',
        'Sweetheart': 'honigsüß(?:e|er|es|en) Herz',
      },
      'replaceText': {
        'Alarm Pheromones': 'Alarmpheromon',
        'Bee Sting': 'Bienenstich',
        'Big Burst': 'Detonation',
        'Blinding Love': 'Blinde Liebe',
        'Call Me Honey': 'Lieblicher Ruf',
        'Centerstage Combo': 'Innere Bühnenkombination',
        'Drop of Love': 'Liebestropfen',
        'Drop of Venom': 'Gifttropfen',
        'Fracture': 'Sprengung',
        'Heart-Struck': 'Herzschock',
        'Heartsick': 'Herzschmerz',
        'Heartsore': 'Herzqual',
        'Honey B. Finale': 'Honigsüßes Finale',
        'Honey B. Live: 1st Beat': 'Suzie Summ Solo: Auftakt',
        'Honey B. Live: 2nd Beat': 'Suzie Summ Solo: Refrain',
        'Honey B. Live: 3rd Beat': 'Suzie Summ Solo: Zugabe',
        'Honey Beeline': 'Honigschuss',
        'Killer Sting': 'Tödlicher Stich',
        'Laceration': 'Zerreißen',
        'Love Me Tender': 'Ein bisschen Liebe',
        'Loveseeker': 'Umwerben',
        'Outerstage Combo': 'Äußere Bühnenkombination',
        'Poison Sting': 'Giftstachel',
        'Rotten Heart': 'Schwarzes Herz',
        'Sheer Heart Attack': 'Herz ist Trumpf',
        'Splash of Venom': 'Giftregen',
        'Splinter': 'Platzen',
        'Spread Love': 'Liebesregen',
        'Stinging Slash': 'Tödlicher Schnitt',
        'Tempting Twist': 'Honigdreher',
        '\\(cast\\)': '(wirken)',
        '\\(damage\\)': '(Schaden)',
        '\\(drop\\)': '(Tropfen)',
        '\\(enrage\\)': '(Finalangriff)',
        '\\(stun for': '(Betäubung für',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Honey B. Lovely': 'Honey B. Lovely',
        'Sweetheart': 'Cœur chaleureux',
      },
      'replaceText': {
        'Alarm Pheromones': 'Phéromones d\'alerte',
        'Bee Sting': 'Dard d\'abeille',
        'Big Burst': 'Grosse explosion',
        'Blinding Love': 'Amour aveuglant',
        'Call Me Honey': 'Appelez-moi Lovely',
        'Centerstage Combo': 'Combo d\'amour central',
        'Drop of Love': 'Gouttes d\'amour',
        'Drop of Venom': 'Chute de venin',
        'Fracture': 'Fracture',
        'Heart-Struck': 'Choc de cœur',
        'Heartsick': 'Mal de cœur',
        'Heartsore': 'Peine de cœur',
        'Honey B. Finale': 'Honey B. Final',
        'Honey B. Live: 1st Beat': 'Honey B. Live - Ouverture',
        'Honey B. Live: 2nd Beat': 'Honey B. Live - Spectacle',
        'Honey B. Live: 3rd Beat': 'Honey B. Live - Conclusion',
        'Honey Beeline': 'Rayon mielleux',
        'Killer Sting': 'Dard tueur',
        'Laceration': 'Lacération',
        'Love Me Tender': 'Effusion d\'amour',
        'Loveseeker': 'Amour persistant',
        'Outerstage Combo': 'Combo d\'amour extérieur',
        'Poison Sting': 'Dard empoisonné',
        'Rotten Heart': 'Cœur cruel',
        'Sheer Heart Attack': 'Attaque au cœur pur',
        'Splash of Venom': 'Pluie de venin',
        'Splinter': 'Rupture',
        'Spread Love': 'Pluie d\'amour',
        'Stinging Slash': 'Taillade tueuse',
        'Tempting Twist': 'Tourbillon tentateur',
        '\\(cast\\)': '(Incante)',
        '\\(damage\\)': '(Dommage)',
        '\\(drop\\)': '(Goutte)',
        '\\(enrage\\)': '(Enrage)',
        '\\(stun for': '(Étourdi pour',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Honey B. Lovely': 'ハニー・B・ラブリー',
        'Sweetheart': 'ラブリーハート',
      },
      'replaceText': {
        'Alarm Pheromones': 'アラームフェロモン',
        'Bee Sting': 'ビースティング',
        'Big Burst': '大爆発',
        'Blinding Love': 'ラブ・イズ・ブラインド',
        'Call Me Honey': 'ラブリーコール',
        'Centerstage Combo': 'リング・ラブコンビネーション',
        'Drop of Love': 'ラブドロップ',
        'Drop of Venom': 'ベノムドロップ',
        'Fracture': '炸裂',
        'Heart-Struck': 'ハートショック',
        'Heartsick': 'ハートシック',
        'Heartsore': 'ハートソゥ',
        'Honey B. Finale': 'ハニー・B・フィナーレ',
        'Honey B. Live: 1st Beat': 'ハニー・B・ライヴ【1st】',
        'Honey B. Live: 2nd Beat': 'ハニー・B・ライヴ【2nd】',
        'Honey B. Live: 3rd Beat': 'ハニー・B・ライヴ【3rd】',
        'Honey Beeline': 'ハニーブラスト',
        'Killer Sting': 'キラースティング',
        'Laceration': '斬撃',
        'Love Me Tender': 'ラブ・ミー・テンダー',
        'Loveseeker': 'ラブシーカー',
        'Outerstage Combo': 'ラウンド・ラブコンビネーション',
        'Poison Sting': 'ポイズンスティング',
        'Rotten Heart': 'ブラックハート',
        'Sheer Heart Attack': 'シアー・ハート・アタック',
        'Splash of Venom': 'ベノムレイン',
        'Splinter': '破裂',
        'Spread Love': 'ラブレイン',
        'Stinging Slash': 'キラースラッシュ',
        'Tempting Twist': 'ハニーツイスター',
      },
    },
  ],
};

export default triggerSet;
