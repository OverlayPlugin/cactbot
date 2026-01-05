import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

type TagTeamClone = {
  dir: number;
  cleave: number;
};

export interface Data extends RaidbossData {
  readonly triggerSetConfig: {
    barbarousBarrageKnockback: 'none' | 'first' | 'two' | 'all';
  };
  phaseTracker: number;
  tagTeamCloneTethered?: number;
  tagTeamClones: TagTeamClone[];
}

// TODO: <foo>boom Special delayed in/out triggers?

const getSafeSpotsFromClones = (
  myClone: TagTeamClone,
  otherClone: TagTeamClone,
  murderousMistDir?: number,
): [number[], number] => {
  let safeSpots = [...Array(8).keys()];

  const lastSafeSpots = Array<number>(8).fill(0);

  // Trim the three dirs that aren't getting hit by myClone
  for (let idx = 0; idx < 3; ++idx) {
    const dir = (myClone.cleave + 3 + idx) % 8;
    safeSpots = safeSpots.filter((spot) => dir !== spot);
  }

  // Trim the five dirs that are getting hit by otherClone
  for (let idx = 0; idx < 5; ++idx) {
    const dir = (otherClone.cleave + 6 + idx) % 8;
    safeSpots = safeSpots.filter((spot) => dir !== spot);
    // Track that this spot is getting hit for the last safe spot calc
    lastSafeSpots[dir]++;
  }

  // Handle Murderous Mist if that's getting passed in
  if (murderousMistDir !== undefined) {
    // Invert to get the "safe" spot behind boss
    murderousMistDir = (murderousMistDir + 4) % 8;
    safeSpots = safeSpots.filter((spot) => murderousMistDir !== spot);
  }

  // Figure out where our final safe spot is
  for (let idx = 0; idx < 5; ++idx) {
    const dir = (myClone.cleave + 6 + idx) % 8;
    lastSafeSpots[dir]++;
  }

  const lastSafeSpot = (lastSafeSpots.findIndex((count) => count === 0) + 4) % 8;

  return [safeSpots, lastSafeSpot];
};

const tagTeamOutputStrings = {
  ...Directions.outputStrings8Dir,
  safeDirs: {
    en: 'Safe: ${dirs} => ${last}',
    de: 'Sicher: ${dirs} => ${last}',
    fr: 'Sur : ${dirs} => ${last}',
    ja: '安地: ${dirs} => ${last}',
    cn: '安全区: ${dirs} => ${last}',
    ko: '안전: ${dirs} => ${last}',
    tc: '安全區: ${dirs} => ${last}',
  },
  separator: {
    en: '/',
    de: '/',
    fr: '/',
    ja: '/',
    cn: '/',
    ko: '/',
    tc: '/',
  },
} as const;

const triggerSet: TriggerSet<Data> = {
  id: 'AacLightHeavyweightM3Savage',
  zoneId: ZoneId.AacLightHeavyweightM3Savage,
  config: [
    {
      id: 'barbarousBarrageKnockback',
      name: {
        en: 'Barbarous Barrage Uptime Knockback',
        de: 'Brutalo-Bomben Uptime Rückstoß',
        fr: 'Bombardement Brutal Anti-poussée Uptime',
        ja: 'ボンバリアンボムのアムレン/堅実 限界タイミング通知',
        cn: '击退塔uptime打法击退提示时机调整功能',
        ko: '봄바리안 봄 업타임 넉백 설정',
        tc: '擊退塔uptime打法擊退提示時機調整功能',
      },
      comment: {
        en: 'Select towers to dodge with knockback immunity.',
        de: 'Wähle welche Türme mit Rückstoß-Immunität genommen werden.',
        fr: 'Sélectionnez les tours à esquiver avec l\'anti-repoussement.',
        ja: '吹き飛ばし無効で避ける塔を選択してください',
        cn: '选择防击退覆盖的塔。',
        ko: '넉백 무효기술로 처리할 기둥을 선택하세요.',
        tc: '選擇防擊退覆蓋的塔。',
      },
      type: 'select',
      options: {
        en: {
          'None (No Callout)': 'none',
          'First Tower': 'first',
          'First Two Towers (Recommended)': 'two',
          'All three towers': 'all',
        },
        de: {
          'Keine (keine Ansage)': 'none',
          'Erster Turm': 'first',
          'Ersten zwei Türme (empfohlen)': 'two',
          'Alle drei Türme': 'all',
        },
        fr: {
          'Aucune': 'none',
          'Première tour': 'first',
          'Seconde tour (Recommandé)': 'two',
          'Les trois tours': 'all',
        },
        ja: {
          'なし (コールなし)': 'none',
          '最初の塔': 'first',
          '最初の2つ (推奨)': 'two',
          '全ての塔': 'all',
        },
        cn: {
          '关闭功能': 'none',
          '第一个塔': 'first',
          '前两个塔 (推荐)': 'two',
          '全部塔': 'all',
        },
        ko: {
          '없음 (알림 없음)': 'none',
          '1번째 기둥': 'first',
          '1, 2번째 기둥 (권장)': 'two',
          '세 기둥 전부': 'all',
        },
        tc: {
          '關閉功能': 'none',
          '第一個塔': 'first',
          '前兩個塔 (推薦)': 'two',
          '全部塔': 'all',
        },
      },
      default: 'none',
    },
  ],
  timelineFile: 'r3s.txt',
  initData: () => ({
    phaseTracker: 0,
    tagTeamClones: [],
  }),
  triggers: [
    {
      id: 'R3S Phase Tracker',
      type: 'GainsEffect',
      netRegex: { effectId: 'FB6', capture: true },
      run: (data, matches) => data.phaseTracker = parseInt(matches.count, 16),
    },
    {
      id: 'R3S Knuckle Sandwich',
      type: 'StartsUsing',
      netRegex: { id: '9423', source: 'Brute Bomber' },
      response: Responses.sharedTankBuster(),
    },
    {
      id: 'R3S Brutal Impact',
      type: 'StartsUsing',
      netRegex: { id: '9425', source: 'Brute Bomber', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R3S Octuple Lariat Out',
      type: 'StartsUsing',
      netRegex: { id: '93D8', source: 'Brute Bomber', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Out + Spread',
          de: 'Raus + Verteilen',
          fr: 'Extérieur + Dispersion',
          ja: '外側 + 散開',
          cn: '钢铁 + 八方分散',
          ko: '밖으로 + 산개',
          tc: '鋼鐵 + 八方分散',
        },
      },
    },
    {
      id: 'R3S Octuple Lariat In',
      type: 'StartsUsing',
      netRegex: { id: '93D9', source: 'Brute Bomber', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'In + Spread',
          de: 'Rein + Verteilen',
          fr: 'Intérieur + Dispersion',
          ja: '内側 + 散開',
          cn: '月环 + 八方分散',
          ko: '안으로 + 산개',
          tc: '月環 + 八方分散',
        },
      },
    },
    {
      id: 'R3S Octoboom Dive Proximity',
      type: 'StartsUsing',
      netRegex: { id: '93DE', source: 'Brute Bomber', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Away + Spread',
          de: 'Weg + Verteilen',
          fr: 'Loin + Dispersion',
          ja: '離れて + 散開',
          cn: '远离 + 分散',
          ko: '멀리 + 산개',
          tc: '遠離 + 分散',
        },
      },
    },
    {
      id: 'R3S Octoboom Dive Knockback',
      type: 'StartsUsing',
      netRegex: { id: '93DF', source: 'Brute Bomber', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Knockback + Spread',
          de: 'Rückstoß + Verteilen',
          fr: 'Poussée + Dispersion',
          ja: 'ノックバック + 散開',
          cn: '击退 + 分散',
          ko: '넉백 + 산개',
          tc: '擊退 + 分散',
        },
      },
    },
    {
      id: 'R3S Barbarous Barrage Uptime Knockback',
      type: 'StartsUsing',
      netRegex: { id: '93FB', source: 'Brute Bomber', capture: false },
      delaySeconds: (data) => {
        switch (data.triggerSetConfig.barbarousBarrageKnockback) {
          case 'first':
            return 9;
          case 'two':
            return 12;
          case 'all':
            return 15;
          case 'none':
            return 0;
        }
      },
      infoText: (data, _matches, output) => {
        if (data.triggerSetConfig.barbarousBarrageKnockback !== 'none')
          return output.knockback!();
      },
      outputStrings: {
        knockback: Outputs.knockback,
      },
    },
    {
      id: 'R3S Murderous Mist',
      type: 'StartsUsing',
      netRegex: { id: '93FE', source: 'Brute Bomber', capture: false },
      infoText: (_data, _matches, output) => output.getBehind!(),
      outputStrings: {
        getBehind: Outputs.getBehind,
      },
    },
    {
      id: 'R3S Quadroboom Dive Proximity',
      type: 'StartsUsing',
      netRegex: { id: '93E0', source: 'Brute Bomber', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Away + Partners',
          de: 'Weg + Partner',
          fr: 'Loin + Partenaires',
          ja: '離れて + ペア',
          cn: '远离 + 双人分摊',
          ko: '멀리 + 쉐어',
          tc: '遠離 + 雙人分攤',
        },
      },
    },
    {
      id: 'R3S Quadroboom Dive Knockback',
      type: 'StartsUsing',
      netRegex: { id: '93E1', source: 'Brute Bomber', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Knockback + Partners',
          de: 'Rückstoß + Partner',
          fr: 'Poussée + Partenaires',
          ja: 'ノックバック + ペア',
          cn: '击退 + 双人分摊',
          ko: '넉백 + 쉐어',
          tc: '擊退 + 雙人分攤',
        },
      },
    },
    {
      id: 'R3S Quadruple Lariat Out',
      type: 'StartsUsing',
      netRegex: { id: '93DA', source: 'Brute Bomber', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Out + Partners',
          de: 'Raus + Partner',
          fr: 'Extérieur + Partenaires',
          ja: '外側 + ペア',
          cn: '钢铁 + 双人分摊',
          ko: '밖으로 + 쉐어',
          tc: '鋼鐵 + 雙人分攤',
        },
      },
    },
    {
      id: 'R3S Quadruple Lariat In',
      type: 'StartsUsing',
      netRegex: { id: '93DB', source: 'Brute Bomber', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'In + Partners',
          de: 'Rein + Partner',
          fr: 'Intérieur + Partenaires',
          ja: '内側 + ペア',
          cn: '月环 + 双人分摊',
          ko: '안으로 + 쉐어',
          tc: '月環 + 雙人分攤',
        },
      },
    },
    {
      id: 'R3S Short Fuse',
      type: 'GainsEffect',
      netRegex: { effectId: 'FB8', capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Short Fuse',
          de: 'Kurze Lunte',
          fr: 'Mèche courte',
          ja: '短い導火線',
          cn: '短引线点名',
          ko: '짧은 도화선',
          tc: '短引線點名',
        },
      },
    },
    {
      id: 'R3S Long Fuse',
      type: 'GainsEffect',
      netRegex: { effectId: 'FB9', capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Long Fuse',
          de: 'Lange Lunte',
          fr: 'Mèche longue',
          ja: '長い導火線',
          cn: '长引线点名',
          ko: '긴 도화선',
          tc: '長引線點名',
        },
      },
    },
    {
      id: 'R3S Fuse Field',
      type: 'GainsEffect',
      netRegex: { effectId: 'FB4' },
      condition: Conditions.targetIsYou(),
      alertText: (_data, matches, output) => {
        if (parseFloat(matches.duration) < 30)
          return output.short!();
        return output.long!();
      },
      outputStrings: {
        short: {
          en: 'Short Fuse',
          de: 'Kurze Lunte',
          fr: 'Mèche courte',
          ja: '短い導火線',
          cn: '短引线点名',
          ko: '짧은 도화선',
          tc: '短引線點名',
        },
        long: {
          en: 'Long Fuse',
          de: 'Lange Lunte',
          fr: 'Mèche longue',
          ja: '長い導火線',
          cn: '长引线点名',
          ko: '긴 도화선',
          tc: '長引線點名',
        },
      },
    },
    {
      id: 'R3S Octoboom Bombarian Special',
      type: 'StartsUsing',
      netRegex: { id: '9752', source: 'Brute Bomber', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Out => In => Knockback => Spread',
          de: 'Raus => Rein => Rückstoß => Verteilen',
          fr: 'Extérieur => Intérieur => Poussée => Dispersion',
          ja: '外側 => 内側 => ノックバック => 散開',
          cn: '钢铁 => 月环 => 击退 => 分散',
          ko: '밖으로 => 안으로 => 넉백 => 산개',
          tc: '鋼鐵 => 月環 => 擊退 => 分散',
        },
      },
    },
    {
      id: 'R3S Octoboom Bombarian Special Reminder',
      type: 'StartsUsing',
      netRegex: { id: '9752', source: 'Brute Bomber', capture: false },
      delaySeconds: 20,
      durationSeconds: 7,
      alertText: (_data, _matches, output) => output.spread!(),
      outputStrings: {
        spread: Outputs.spread,
      },
    },
    {
      id: 'R3S Quadroboom Bombarian Special',
      type: 'StartsUsing',
      netRegex: { id: '940A', source: 'Brute Bomber', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Out => In => Knockback => Partners',
          de: 'Raus => Rein => Rückstoß => Partner',
          fr: 'Extérieur => Intérieur => Poussée => Partenaires',
          ja: '外側 => 内側 => ノックバック => ペア',
          cn: '钢铁 => 月环 => 击退 => 双人分摊',
          ko: '밖으로 => 안으로 => 넉백 => 쉐어',
          tc: '鋼鐵 => 月環 => 擊退 => 雙人分攤',
        },
      },
    },
    {
      id: 'R3S Quadroboom Bombarian Special Reminder',
      type: 'StartsUsing',
      netRegex: { id: '940A', source: 'Brute Bomber', capture: false },
      delaySeconds: 20,
      durationSeconds: 7,
      response: Responses.stackPartner('alert'),
    },
    {
      id: 'R3S Tag Team Tether',
      type: 'Tether',
      // The clone uses ID `0112`, the boss uses ID `0113`.
      netRegex: { id: '0112', capture: true },
      condition: Conditions.targetIsYou(),
      promise: async (data, matches) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;

        const actor = actors[0];

        if (actors.length !== 1 || actor === undefined) {
          console.error(`R3S Tag Team Tether: Wrong actor count ${actors.length}`);
          return;
        }

        data.tagTeamCloneTethered = Directions.xyTo8DirNum(actor.PosX, actor.PosY, 100, 100);
      },
      infoText: (data, _matches, output) => {
        const dir = output[Directions.outputFrom8DirNum(data.tagTeamCloneTethered ?? -1)]!();
        return output.tetheredTo!({ dir: dir });
      },
      outputStrings: {
        ...Directions.outputStringsCardinalDir,
        tetheredTo: {
          en: 'Tethered to ${dir} clone',
          de: 'Vrebindung zum ${dir} Klon',
          fr: 'Lié au clone ${dir}',
          ja: '${dir} の分身に繋がれた',
          cn: '连线分身: ${dir}',
          ko: '${dir}쪽 분신과 선 연결',
          tc: '連線分身: ${dir}',
        },
      },
    },
    {
      id: 'R3S Tag Team Clone',
      type: 'StartsUsing',
      /*
        Clones spawn on a random cardinal. They do one lariat dash across, then another one back.
        There are two sets of IDs, one for Tag Team 1, and one for Tag Team 2.
        IDs:
        9B2C - TT1, Right -> Left
        9B2E - TT1, Left -> Right
        9BD8 - TT2, Right -> Left
        9BDA - TT2, Left -> Right
      */
      netRegex: { id: ['9B2C', '9B2E', '9BD8', '9BDA'], source: 'Brute Distortion', capture: true },
      condition: (data, matches) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const cloneDir = Directions.xyTo8DirNum(x, y, 100, 100);
        // Increment clockwise from our starting position to get the cleave direction.
        // If this is a right cleave, increment by 6 (South + 6 = East)
        // Otherwise, increment 2 positions (South + 2 = West)
        const cleaveAdjust = ['9B2C', '9BD8'].includes(matches.id) ? 6 : 2;
        const cleaveDir = (cloneDir + cleaveAdjust) % 8;
        data.tagTeamClones.push({
          cleave: cleaveDir,
          dir: cloneDir,
        });
        if (data.phaseTracker === 1 && data.tagTeamClones.length === 2)
          return true;
        return false;
      },
      durationSeconds: 10.7,
      infoText: (data, _matches, output) => {
        const myClone = data.tagTeamClones.find((clone) => clone.dir === data.tagTeamCloneTethered);
        const otherClone = data.tagTeamClones.find((clone) =>
          clone.dir !== data.tagTeamCloneTethered
        );

        if (myClone === undefined) {
          console.error('R3S Tag Team Clone: Missing myClone', data.tagTeamClones);
          return;
        }

        if (otherClone === undefined) {
          console.error('R3S Tag Team Clone: Missing otherClone', data.tagTeamClones);
          return;
        }

        const [safeSpots, lastSafeSpot] = getSafeSpotsFromClones(myClone, otherClone);

        return output.safeDirs!({
          dirs: safeSpots
            .map((dir) => output[Directions.outputFrom8DirNum(dir)]!())
            .join(output.separator!()),
          last: output[Directions.outputFrom8DirNum(lastSafeSpot)]!(),
        });
      },
      run: (data) => {
        data.tagTeamCloneTethered = undefined;
        data.tagTeamClones = [];
      },
      outputStrings: tagTeamOutputStrings,
    },
    {
      id: 'R3S Tag Team Murderous Mist',
      type: 'StartsUsingExtra',
      netRegex: { id: '9BD7', capture: true },
      // Sometimes this MM cast is before the clones, sometimes it's after
      delaySeconds: 0.1,
      durationSeconds: 12.7,
      infoText: (data, matches, output) => {
        const myClone = data.tagTeamClones.find((clone) => clone.dir === data.tagTeamCloneTethered);
        const otherClone = data.tagTeamClones.find((clone) =>
          clone.dir !== data.tagTeamCloneTethered
        );

        if (myClone === undefined) {
          console.error('R3S Tag Team Clone: Missing myClone', data.tagTeamClones);
          return;
        }

        if (otherClone === undefined) {
          console.error('R3S Tag Team Clone: Missing otherClone', data.tagTeamClones);
          return;
        }

        const murderousMistDir = Directions.hdgTo8DirNum(parseFloat(matches.heading));

        const [safeSpots, lastSafeSpot] = getSafeSpotsFromClones(
          myClone,
          otherClone,
          murderousMistDir,
        );

        return output.safeDirs!({
          dirs: safeSpots
            .map((dir) => output[Directions.outputFrom8DirNum(dir)]!())
            .join(output.separator!()),
          last: output[Directions.outputFrom8DirNum(lastSafeSpot)]!(),
        });
      },
      run: (data) => {
        data.tagTeamCloneTethered = undefined;
        data.tagTeamClones = [];
      },
      outputStrings: tagTeamOutputStrings,
    },
    {
      id: 'R3S KB Towers 2 Lariat Combo',
      type: 'StartsUsing',
      /*
        Boss jumps to a random cardinal. Does one lariat dash across, then another one back.
        IDs:
        9AE8 - Right cleave, then right cleave again.
             - If north, then east safe, then west. (go)
        9AE9 - Right cleave, then left cleave.
             - If north, then east safe, then east. (stay)
        9AEA - Left cleave, then left cleave again.
             - If north, then west safe, then east. (go)
        9AEB - Left cleave, then right cleave.
             - If north, then west safe, then west. (stay)
      */
      netRegex: { id: ['9AE8', '9AE9', '9AEA', '9AEB'], source: 'Brute Bomber', capture: true },
      durationSeconds: 11,
      infoText: (_data, matches, output) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const bossDir = Directions.xyTo8DirNum(x, y, 100, 100);

        const firstCleaveDir = ['9AE8', '9AE9'].includes(matches.id) ? 'right' : 'left';
        const secondCleaveDir = ['9AE8', '9AEB'].includes(matches.id) ? 'right' : 'left';

        let firstSafeSpots = [...Array(8).keys()];
        let secondSafeSpots = [...firstSafeSpots];

        for (let idx = 0; idx < 5; ++idx) {
          // Starting at boss position, treat the 5 positions clockwise as unsafe
          // If this is a right cleave instead, then start opposite of boss
          const dir = (bossDir + (firstCleaveDir === 'left' ? 0 : 4) + idx) % 8;
          firstSafeSpots = firstSafeSpots.filter((spot) => spot !== dir);
        }

        for (let idx = 0; idx < 5; ++idx) {
          // Starting opposite boss position, treat the 5 positions clockwise as unsafe
          // If this is a right cleave instead, then start at boss
          const dir = (bossDir + (secondCleaveDir === 'right' ? 0 : 4) + idx) % 8;
          secondSafeSpots = secondSafeSpots.filter((spot) => spot !== dir);
        }

        // Filter cards from first spots, need to get KB'd to intercard
        firstSafeSpots = firstSafeSpots.filter((spot) => (spot % 2) !== 0);

        // Only include card for second spot
        secondSafeSpots = secondSafeSpots.filter((spot) => (spot % 2) === 0);

        const [firstDir1, firstDir2] = firstSafeSpots;

        const secondDir = secondSafeSpots[0];

        if (firstDir1 === undefined || firstDir2 === undefined || secondDir === undefined) {
          console.error(
            'Failed to find safe dirs for second KB towers',
            matches,
            firstSafeSpots,
            secondSafeSpots,
          );
          return output['unknown']!();
        }

        if (firstCleaveDir === secondCleaveDir) {
          return output.comboGo!({
            firstDir1: output[Directions.outputFrom8DirNum(firstDir1)]!(),
            firstDir2: output[Directions.outputFrom8DirNum(firstDir2)]!(),
            secondDir: output[Directions.outputFrom8DirNum(secondDir)]!(),
          });
        }
        return output.comboStay!({
          firstDir1: output[Directions.outputFrom8DirNum(firstDir1)]!(),
          firstDir2: output[Directions.outputFrom8DirNum(firstDir2)]!(),
          secondDir: output[Directions.outputFrom8DirNum(secondDir)]!(),
        });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        comboGo: {
          en: 'Knockback ${firstDir1}/${firstDir2} => Go ${secondDir}',
          de: 'Rückstoß ${firstDir1}/${firstDir2} => Geh nach ${secondDir}',
          fr: 'Poussée ${firstDir1}/${firstDir2} => Allez ${secondDir}',
          ja: 'ノックバック ${firstDir1}/${firstDir2} => ${secondDir} へ移動',
          cn: '击退 ${firstDir1}/${firstDir2} => 穿 ${secondDir}',
          ko: '${firstDir1}/${firstDir2} 넉백 => ${secondDir} 으로 이동',
          tc: '擊退 ${firstDir1}/${firstDir2} => 穿 ${secondDir}',
        },
        comboStay: {
          en: 'Knockback ${firstDir1}/${firstDir2}, Stay ${secondDir}',
          de: 'Rückstoß ${firstDir1}/${firstDir2} => Bleibe im ${secondDir}',
          fr: 'Poussée ${firstDir1}/${firstDir2} => Restez ${secondDir}',
          ja: 'ノックバック ${firstDir1}/${firstDir2} => ${secondDir} で待機',
          cn: '击退 ${firstDir1}/${firstDir2}, 停 ${secondDir}',
          ko: '${firstDir1}/${firstDir2} 넉백 => ${secondDir} 그대로 있기',
          tc: '擊退 ${firstDir1}/${firstDir2}, 停 ${secondDir}',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Brute Bomber': 'Brutalo Bomber',
        'Brute Distortion': 'Brutalo Bomber-Phantom',
        'Lit Fuse': 'Zündschnurbombe',
      },
      'replaceText': {
        '\\(cast\\)': '(wirken)',
        '\\(damage\\)': '(Schaden)',
        '\\(enrage\\)': '(Finalangriff)',
        'Barbarous Barrage': 'Brutalo-Bomben',
        'Blazing Lariat': 'Flammende Lariat',
        'Bombarian Flame': 'Bomben-Feuer',
        '(?<! )Bombarian Special': 'Brutalo-Spezial',
        'Bombariboom': 'Brutalo-Schockwelle',
        'Brutal Impact': 'Knallender Impakt',
        'Chain Deathmatch': 'Ketten-Todeskampf',
        'Diveboom': 'Bombensturz',
        'Doping Draught': 'Aufputschen',
        'Explosion': 'Explosion',
        'Explosive Rain': 'Bombenregen',
        'Final Fusedown': 'Epische Zündschnurbomben',
        'Fuse or Foe': 'Klebrige Bombe',
        'Fusefield': 'Luntenfeld',
        'Fuses of Fury': 'Zündschnurbomben',
        'Infernal Spin': 'Ultimativer Feuertornado',
        'Knuckle Sandwich': 'Knöchelschlag',
        'Lariat Combo': 'Lariat-Kombination',
        'Murderous Mist': 'Grüner Nebel',
        'Octoboom Bombarian Special': 'Okto-Brutalo-Spezial',
        'Octoboom Dive': 'Okto-Bombensturz',
        'Octuple Lariat': 'Okto-Lariat',
        'Quadroboom Dive': 'Quattro-Bombensturz',
        'Quadruple Lariat': 'Quattro-Lariat',
        'Self-Destruct': 'Selbstzerstörung',
        'Special Bombarian Special': 'Ultimativer Brutalo-Spezial',
        'Tag Team': 'Wechselspiel',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Brute Bomber': 'Brute Bomber',
        'Brute Distortion': 'Double de Brute Bomber',
        'Lit Fuse': 'Bombo à mèche',
      },
      'replaceText': {
        '\\(cast\\)': '(Incante)',
        '\\(damage\\)': '(Dommage)',
        '\\(enrage\\)': '(Enrage)',
        'Barbarous Barrage': 'Bombardement brutal',
        'Blazing Lariat': 'Lariat embrasé',
        'Bombarian Flame': 'Feu brutal',
        '(?<! )Bombarian Special': 'Spéciale brutale',
        'Bombariboom': 'Onde de choc brutale',
        'Brutal Impact': 'Impact brutal',
        'Chain Deathmatch': 'Chaîne de la mort',
        'Diveboom': 'Explongeon',
        'Doping Draught': 'Dopage',
        'Explosion': 'Explosion',
        'Explosive Rain': 'Pluie explosive',
        'Final Fusedown': 'Bombos à méche sadiques',
        'Fuse or Foe': 'Fixation de bombo à mèche',
        'Fusefield': 'Champs de mèches',
        'Fuses of Fury': 'Bombos à mèche',
        'Infernal Spin': 'Toupie infernale',
        'Knuckle Sandwich': 'Sandwich de poings',
        'Lariat Combo': 'Combo de lariats',
        'Murderous Mist': 'Vapeur venimeuse',
        'Octoboom Bombarian Special': 'Octuple spéciale brutale',
        'Octoboom Dive': 'Octuple explongeon',
        'Octuple Lariat': 'Octuple lariat',
        'Quadroboom Dive': 'Quadruple explongeon',
        'Quadruple Lariat': 'Quadruple lariat',
        'Self-Destruct': 'Auto-destruction',
        'Special Bombarian Special': 'Spéciale brutale ultime',
        'Tag Team': 'Combat d\'équipe',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Brute Bomber': 'ブルートボンバー',
        'Brute Distortion': 'ブルートボンバーの幻影',
        'Lit Fuse': 'フューズボム',
      },
      'replaceText': {
        'Barbarous Barrage': 'ボンバリアンボム',
        'Blazing Lariat': 'ラリアット・ブレイザー',
        'Bombarian Flame': 'ボンバリアンファイヤー',
        '(?<! )Bombarian Special': 'ボンバリアンスペシャル',
        'Bombariboom': 'ボンバリアン・ショック',
        'Brutal Impact': 'スマッシュインパクト',
        'Chain Deathmatch': 'チェーンデスマッチ',
        'Diveboom': 'パワーダイブ・ショック',
        'Doping Draught': 'ドーピング',
        'Explosion': '爆発',
        'Explosive Rain': 'ボムレイン',
        'Final Fusedown': '零式フューズボム',
        'Fuse or Foe': 'アタッチ・フューズボム',
        'Fusefield': 'フューズフィールド',
        'Fuses of Fury': 'フューズボム',
        'Infernal Spin': '極盛り式スピニングファイヤー',
        'Knuckle Sandwich': 'ナックルパート',
        'Lariat Combo': 'ラリアットコンビネーション',
        'Murderous Mist': 'グリーンミスト',
        'Octoboom Bombarian Special': '8ショック・ボンバリアンスペシャル',
        'Octoboom Dive': '8ショック・パワーダイブ',
        'Octuple Lariat': '8ウェイ・ダブルラリアット',
        'Quadroboom Dive': '4ショック・パワーダイブ',
        'Quadruple Lariat': '4ウェイ・ダブルラリアット',
        'Self-Destruct': '自爆',
        'Special Bombarian Special': 'アルティメット・ボンバリアンスペシャル',
        'Tag Team': 'タッグマッチ',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Brute Bomber': '野蛮爆弹',
        'Brute Distortion': '野蛮爆弹的幻影',
        'Lit Fuse': '导火线爆弹怪',
      },
      'replaceText': {
        '\\(cast\\)': '(咏唱)',
        '\\(damage\\)': '(伤害)',
        '\\(enrage\\)': '(狂暴)',
        'Barbarous Barrage': '野蛮爆炸',
        'Blazing Lariat': '怒焰碎颈臂',
        'Bombarian Flame': '野蛮火焰',
        '(?<! )Bombarian Special': '超豪华野蛮大乱击',
        'Bombariboom': '野蛮爆震',
        'Brutal Impact': '野蛮碎击',
        'Chain Deathmatch': '锁链生死战',
        'Diveboom': '强震冲',
        'Doping Draught': '打药',
        'Explosion': '爆炸',
        'Explosive Rain': '爆弹雨',
        'Final Fusedown': '零式导火线爆弹',
        'Fuse or Foe': '设置导火线',
        'Fusefield': '导火线区域',
        'Fuses of Fury': '导火线爆弹',
        'Infernal Spin': '超华丽野蛮旋火',
        'Knuckle Sandwich': '拳面猛击',
        'Lariat Combo': '碎颈臂连击',
        'Murderous Mist': '致命毒雾',
        'Octoboom Bombarian Special': '八分超豪华野蛮大乱击',
        'Octoboom Dive': '八分强震冲',
        'Octuple Lariat': '八分双重碎颈臂',
        'Quadroboom Dive': '四分强震冲',
        'Quadruple Lariat': '四分双重碎颈臂',
        'Self-Destruct': '自爆',
        'Special Bombarian Special': '究极超豪华野蛮大乱击',
        'Tag Team': '组队战',
      },
    },
    {
      'locale': 'tc',
      'missingTranslations': true,
      'replaceSync': {
        // 'Brute Bomber': '', // FIXME '野蛮爆弹'
        // 'Brute Distortion': '', // FIXME '野蛮爆弹的幻影'
        // 'Lit Fuse': '', // FIXME '导火线爆弹怪'
      },
      'replaceText': {
        // '\\(cast\\)': '', // FIXME '(咏唱)'
        // '\\(damage\\)': '', // FIXME '(伤害)'
        // '\\(enrage\\)': '', // FIXME '(狂暴)'
        // 'Barbarous Barrage': '', // FIXME '野蛮爆炸'
        // 'Blazing Lariat': '', // FIXME '怒焰碎颈臂'
        // 'Bombarian Flame': '', // FIXME '野蛮火焰'
        // '(?<! )Bombarian Special': '', // FIXME '超豪华野蛮大乱击'
        // 'Bombariboom': '', // FIXME '野蛮爆震'
        'Brutal Impact': '野蠻碎擊',
        // 'Chain Deathmatch': '', // FIXME '锁链生死战'
        // 'Diveboom': '', // FIXME '强震冲'
        // 'Doping Draught': '', // FIXME '打药'
        'Explosion': '爆炸',
        // 'Explosive Rain': '', // FIXME '爆弹雨'
        // 'Final Fusedown': '', // FIXME '零式导火线爆弹'
        // 'Fuse or Foe': '', // FIXME '设置导火线'
        // 'Fusefield': '', // FIXME '导火线区域'
        // 'Fuses of Fury': '', // FIXME '导火线爆弹'
        // 'Infernal Spin': '', // FIXME '超华丽野蛮旋火'
        // 'Knuckle Sandwich': '', // FIXME '拳面猛击'
        // 'Lariat Combo': '', // FIXME '碎颈臂连击'
        // 'Murderous Mist': '', // FIXME '致命毒雾'
        // 'Octoboom Bombarian Special': '', // FIXME '八分超豪华野蛮大乱击'
        // 'Octoboom Dive': '', // FIXME '八分强震冲'
        // 'Octuple Lariat': '', // FIXME '八分双重碎颈臂'
        // 'Quadroboom Dive': '', // FIXME '四分强震冲'
        // 'Quadruple Lariat': '', // FIXME '四分双重碎颈臂'
        'Self-Destruct': '自爆',
        'Special Bombarian Special': '究極超豪華野蠻大亂擊',
        // 'Tag Team': '', // FIXME '组队战'
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Brute Bomber': '브루트 봄버',
        'Brute Distortion': '브루트 봄버의 환영',
        'Lit Fuse': '불붙은 봄',
      },
      'replaceText': {
        '\\(cast\\)': '(시전)',
        '\\(damage\\)': '(피해)',
        '\\(enrage\\)': '(전멸기)',
        'Barbarous Barrage': '봄버리안 봄',
        'Blazing Lariat': '불타는 후려갈기기',
        'Bombarian Flame': '봄버리안 파이어',
        '(?<! )Bombarian Special': '봄버리안 스페셜',
        'Bombariboom': '봄버리안 폭발',
        'Brutal Impact': '비열한 내리치기',
        'Chain Deathmatch': '체인 데스매치',
        'Diveboom': '강타 폭발',
        'Doping Draught': '도핑',
        '(?<! )Explosion': '폭발',
        'Explosive Rain': '봄 세례',
        'Final Fusedown': '0식 불붙은 봄',
        'Fuse or Foe': '불붙은 봄 부착',
        'Fusefield': '도화선 지옥',
        'Fuses of Fury': '불붙은 봄',
        'Infernal Spin': '회전 지옥불 뿜기',
        'Knuckle Sandwich': '비열한 주먹질',
        'Lariat Combo': '연속 후려갈기기',
        'Mana Explosion': '마력 폭발',
        'Murderous Mist': '녹색 안개',
        'Octoboom Bombarian Special': '8폭발 봄버리안 스페셜',
        'Octoboom Dive': '8폭발 강타',
        'Octuple Lariat': '8갈래 양팔 후려갈기기',
        'Quadroboom Dive': '4폭발 강타',
        'Quadruple Lariat': '4갈래 양팔 후려갈기기',
        'Self-Destruct': '자폭',
        'Special Bombarian Special': '궁극의 봄버리안 스페셜',
        'Tag Team': '태그매치',
      },
    },
  ],
};

export default triggerSet;
