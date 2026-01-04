import Conditions from '../../../../../resources/conditions';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: tweak trigger durations/delays
// TODO: Break IV safe look-away direction?
// TODO: Surecast/Arm's Length call for Break IV/Aero IV during Blade of Darkness?
// TODO: tile refresh reminders?
// TODO: Active-pivot Particle Beam - call move/stay based on player position?

type ThirdArtOfDarknessId = keyof typeof thirdArtOfDarknessHeadmarker;
type ThirdArtOfDarkness = 'leftCleave' | 'rightCleave' | 'pairStacks' | 'proteanSpread';

const thirdArtOfDarknessHeadmarker = {
  '00EF': 'leftCleave',
  '00F0': 'rightCleave',
  '00F1': 'pairStacks',
  '00F2': 'proteanSpread',
} as const;

const isThirdArtOfDarknessId = (id: string): id is ThirdArtOfDarknessId => {
  return id in thirdArtOfDarknessHeadmarker;
};

const center = {
  'x': 100,
  'y': 100,
} as const;

const headMarkerData = {
  // player about to be tethered
  // Vfx Path: m0005sp_09o0t
  'tetherMarker': '000C',
  // stack marker on healers
  // Offsets: 83994
  // Vfx Path: com_share2i
  'healerStack': '0064',
  // chasing AoE marker
  // Vfx Path: tracking_lockon01i
  'chasingAoe': '00C5',
  // Stygian Shadow telegraph
  // Offsets: 220975
  // Vfx Path: m0684_charge_c0x
  'leftCleave': '00EF',
  // Stygian Shadow telegraph
  // Offsets: 220975
  // Vfx Path: m0684_charge_c1x
  'rightCleave': '00F0',
  // Stygian Shadow telegraph
  // Vfx Path: m0684_charge_c2x
  'pairStacks': '00F1',
  // Stygian Shadow telegraph
  // Vfx Path: m0684_charge_c3x
  'proteanSpread': '00F2',
  // tankbuster with circular cleave
  // Vfx Path: tank_lockonae_4m_5s_01t
  'tankCleave': '0156',
  // flare marker
  // Offsets: 76147,157739
  // Vfx Path: all_at8s_0v
  'flareMarker': '015A',
  // player who will drop a bramble
  // Vfx Path: m0302_seed_8s_x
  'evilSeed': '0227',
  // countdown to hand spawning on player
  // Offsets: 86301,97364,104403,111399,145339,153274,165355
  // Vfx Path: l1rz_grasp_count5s_0x
  'handCountdown': '0228',
  // clockwise rotation
  // Vfx Path: turnright_14m_14s_c0x
  'rotateClockwise': '0234',
  // counter-clockwise rotation
  // Vfx Path: turnleft_14m_14s_c0x
  'rotateCounterClockwise': '0235',
  // bramble about to tether to a player
  // Vfx Path: exclamation_8s_x
  'exclamationMarker': '0239',
} as const;

export interface Data extends RaidbossData {
  deadlyEmbraceDodgeDirectionCollected: 'front' | 'back' | 'unknown';
  deadlyEmbraceDodgeDirection: 'front' | 'back' | 'unknown';
  bladeOfDarknessFollowup?: 'death' | 'aero';
  innerDarkness?: boolean;
  outerDarkness?: boolean;
  mySide?: 'east' | 'west';
  thirdArtOfDarkness: {
    east?: ThirdArtOfDarkness[];
    west?: ThirdArtOfDarkness[];
  };
}

const triggerSet: TriggerSet<Data> = {
  id: 'TheCloudOfDarknessChaotic',
  zoneId: ZoneId.TheCloudOfDarknessChaotic,
  timelineFile: 'cloud_of_darkness_chaotic.txt',
  initData: () => ({
    deadlyEmbraceDodgeDirectionCollected: 'unknown',
    deadlyEmbraceDodgeDirection: 'unknown',
    thirdArtOfDarkness: {},
  }),
  triggers: [
    {
      id: 'Cloud Chaotic Doom',
      type: 'GainsEffect',
      netRegex: { effectId: 'D24', capture: true },
      condition: (data, matches) => {
        // this can get very noisy if we trigger on every player that receives Doom,
        // so limit to only calling for players in your immediate party.
        return data.CanCleanse() && data.party.inParty(matches.target);
      },
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => {
        return output.text!();
      },
      outputStrings: {
        text: {
          en: 'Cleanse Doom',
          de: 'Verhängnis Reinigenm',
          fr: 'Guérissez Glas',
          ja: '死の宣告にエスナ',
          cn: '驱散死宣',
          ko: '죽음의 선고 해제',
          tc: '驅散死宣',
        },
      },
    },
    {
      id: 'Cloud Chaotic Lightning Resistance Down Swap',
      type: 'GainsEffect',
      netRegex: { effectId: '1122', capture: true },
      condition: (data, matches) => {
        const stackCount = parseInt(matches.count);
        return stackCount >= 5 && data.role === 'tank' && data.party.inParty(matches.target);
      },
      alertText: (_data, _matches, output) => {
        return output.tankSwap!();
      },
      outputStrings: {
        tankSwap: Outputs.tankSwap,
      },
    },
    {
      id: 'Cloud Chaotic Blade of Darkness',
      type: 'StartsUsing',
      netRegex: { id: ['9DFD', '9DFB', '9DFF'], source: 'Cloud of Darkness', capture: true },
      durationSeconds: (data) => data.bladeOfDarknessFollowup !== undefined ? 7 : 3,
      suppressSeconds: 2,
      infoText: (data, matches, output) => {
        const mech = matches.id === '9DFD' ? 'left' : (matches.id === '9DFB' ? 'right' : 'out');
        const mechOutput = output[mech]!();
        const followup = data.bladeOfDarknessFollowup;
        if (followup === undefined)
          return mechOutput;

        delete data.bladeOfDarknessFollowup;

        return output.combo!({
          mech: mechOutput,
          followup: output[followup]!(),
        });
      },
      outputStrings: {
        combo: {
          en: '${mech} => ${followup}',
          de: '${mech} => ${followup}',
          fr: '${mech} => ${followup}',
          ja: '${mech} => ${followup}',
          cn: '${mech} => ${followup}',
          ko: '${mech} => ${followup}',
          tc: '${mech} => ${followup}',
        },
        left: {
          en: 'Left, under hand',
          de: 'Links, unter die Hand',
          fr: 'Gauche, sous la main',
          ja: '左 手の下へ',
          cn: '左边脚下',
          ko: '왼쪽, 손 아래로',
          tc: '左邊腳下',
        },
        right: {
          en: 'Right, under hand',
          de: 'Rechts, unter die Hand',
          fr: 'Droite, sous la main',
          ja: '右 手の下へ',
          cn: '右边脚下',
          ko: '오른쪽, 손 아래로',
          tc: '右邊腳下',
        },
        aero: {
          en: 'Knockback',
          de: 'Rückstoß',
          fr: 'Poussée',
          ja: 'ノックバック',
          cn: '击退',
          ko: '넉백',
          tc: '擊退',
        },
        death: Outputs.outThenIn,
        out: Outputs.out,
      },
    },
    {
      id: 'Cloud Chaotic Deluge of Darkness',
      type: 'StartsUsing',
      netRegex: { id: ['9E3D', '9E01'], source: 'Cloud of Darkness', capture: false },
      response: Responses.bleedAoe('alert'),
    },
    {
      id: 'Cloud Chaotic Grim Embrace Collector',
      type: 'StartsUsing',
      netRegex: { id: ['9E39', '9E3A'], source: 'Cloud of Darkness', capture: true },
      run: (data, matches) => {
        data.deadlyEmbraceDodgeDirectionCollected = matches.id === '9E39' ? 'back' : 'front';
      },
    },
    {
      id: 'Cloud Chaotic Deadly Embrace',
      type: 'GainsEffect',
      netRegex: { effectId: '1055', capture: true },
      condition: Conditions.targetIsYou(),
      preRun: (data) =>
        data.deadlyEmbraceDodgeDirection = data.deadlyEmbraceDodgeDirectionCollected,
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 7,
      durationSeconds: 7,
      infoText: (data, _matches, output) => output[data.deadlyEmbraceDodgeDirection]!(),
      outputStrings: {
        back: {
          en: 'Bait hand, dodge backwards',
          de: 'Hand ködern, nach Hinten ausweichen',
          fr: 'Attirez la main, esquivez vers l\'arrière',
          ja: '手を避ける くるっとターン',
          cn: '面朝场外放手',
          ko: '손 유도, 뒤로 피하기',
          tc: '面朝場外放手',
        },
        front: {
          en: 'Bait hand, dodge forwards',
          de: 'Hand ködern, nach Vorne ausweichen',
          fr: 'Attirez la main, esquivez vers l\'avant',
          ja: '手を避ける 前に進む',
          cn: '面朝场内放手',
          ko: '손 유도, 앞으로 피하기',
          tc: '面朝場內放手',
        },
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Cloud Chaotic Rapid-sequence Particle Beam',
      type: 'StartsUsing',
      netRegex: { id: '9E40', source: 'Cloud of Darkness', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Wild Charge (alliances)',
          de: 'Wilde Rage (Allianzen)',
          fr: 'Ruée sauvage (alliances)',
          ja: '頭割り アラ単位集合',
          cn: '分队挡枪分摊',
          ko: '쉐어 (연합파티)',
          tc: '分隊擋槍分攤',
        },
      },
    },
    {
      id: 'Cloud Chaotic Unholy Darkness',
      type: 'StartsUsing',
      netRegex: { id: 'A12D', source: 'Cloud of Darkness', capture: false },
      infoText: (_data, _matches, output) => output.healerGroups!(),
      outputStrings: {
        healerGroups: Outputs.healerGroups,
      },
    },
    {
      id: 'Cloud Chaotic Flare Marker',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.flareMarker, capture: true },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.flare!(),
      outputStrings: {
        flare: {
          en: 'Flare on you',
          de: 'Flare auf DIR',
          fr: 'Brasier sur VOUS',
          ja: '自分にフレア 捨てる',
          cn: '核爆点名',
          ko: '플레어 대상자',
          tc: '核爆點名',
        },
      },
    },
    {
      id: 'Cloud Chaotic Break IV',
      type: 'StartsUsing',
      // 9E4F = dummy cast from boss (ends slightly before actual cast)
      // 9E50 = actual cast from boss (sometimes has stale source name)
      // 9E51 = dummy cast from adds (source: Sinister Eye)
      // 9E52 = actual cast from adds (sometimes has stale source name)
      netRegex: { id: '9E4F', source: 'Cloud of Darkness', capture: false },
      response: Responses.lookAway(),
    },
    {
      id: 'Cloud Chaotic Endeath IV Collector',
      type: 'StartsUsing',
      netRegex: { id: '9E53', source: 'Cloud of Darkness', capture: false },
      run: (data) => data.bladeOfDarknessFollowup = 'death',
    },
    {
      id: 'Cloud Chaotic Enaero IV Collector',
      type: 'StartsUsing',
      netRegex: { id: '9E54', source: 'Cloud of Darkness', capture: false },
      run: (data) => data.bladeOfDarknessFollowup = 'aero',
    },
    {
      id: 'Cloud Chaotic Death IV',
      type: 'StartsUsing',
      netRegex: { id: '9E43', source: 'Cloud of Darkness', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Far away => in',
          de: 'Weit weg => Rein',
          fr: 'Loin => Intérieur',
          ja: '離れて 吸い込み後 中へ',
          cn: '远离 => 中间',
          ko: '멀리 떨어지기 => 안으로',
          tc: '遠離 => 中間',
        },
      },
    },
    {
      id: 'Cloud Chaotic Aero IV',
      type: 'StartsUsing',
      netRegex: { id: '9E4C', source: 'Cloud of Darkness', capture: false },
      response: Responses.knockback(),
    },
    {
      id: 'Cloud Chaotic Flood of Darkness Raidwide',
      type: 'StartsUsing',
      netRegex: { id: ['9E3E', '9E07'], source: 'Cloud of Darkness', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Cloud Chaotic Inner/Outer Darkness Gain',
      type: 'GainsEffect',
      netRegex: { effectId: ['1051', '1052'], capture: true },
      condition: Conditions.targetIsYou(),
      run: (data, matches) => {
        switch (matches.effectId) {
          case '1051':
            data.innerDarkness = true;
            break;
          case '1052':
            data.outerDarkness = true;
            break;
        }
      },
    },
    {
      id: 'Cloud Chaotic Inner/Outer Darkness Lose',
      type: 'LosesEffect',
      netRegex: { effectId: ['1051', '1052'], capture: true },
      condition: Conditions.targetIsYou(),
      run: (data, matches) => {
        switch (matches.effectId) {
          case '1051':
            delete data.innerDarkness;
            break;
          case '1052':
            delete data.outerDarkness;
            break;
        }
      },
    },
    {
      id: 'Cloud Chaotic Dark Dominion',
      type: 'StartsUsing',
      netRegex: { id: '9E08', source: 'Cloud of Darkness', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Cloud Chaotic Side Collector',
      type: 'Ability',
      // 9E08 = Dark Dominion (from boss), occurs before The Third Art of Darkness add mechanics
      // 9E2E = unknown (from both adds), occurs before Core-lateral/Lateral-core add mechanics
      netRegex: { id: ['9E08', '9E2E'], capture: false },
      suppressSeconds: 1,
      promise: async (data) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
        })).combatants;

        const me = actors.find((actor) => actor.Name === data.me);

        if (!me) {
          console.error(`Cloud Chaotic Side Collector: can't find player ${data.me}`);
        } else {
          data.mySide = me.PosX < center.x ? 'east' : 'west';
        }
      },
    },
    {
      id: 'Cloud Chaotic Atomos Spawn',
      type: 'AddedCombatant',
      // 13626 = Atomos
      netRegex: { npcNameId: '13626', capture: false },
      suppressSeconds: 1,
      response: Responses.killAdds(),
    },
    {
      id: 'Cloud Chaotic Particle Concentration',
      type: 'Ability',
      netRegex: { id: '9E18', source: 'Cloud Of Darkness', capture: false },
      durationSeconds: 6,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get Towers',
          de: 'Türme nehmen',
          fr: 'Prenez les tours',
          ja: '塔を踏む',
          cn: '踩塔',
          ko: '기둥 들어가기',
          tc: '踩塔',
        },
      },
    },
    {
      id: 'Cloud Chaotic Ghastly Gloom',
      type: 'StartsUsing',
      netRegex: { id: ['9E09', '9E0B'], source: 'Cloud of Darkness', capture: true },
      alertText: (_data, matches, output) => {
        switch (matches.id) {
          case '9E09':
            return output.corners!();
          case '9E0B':
            return output.under!();
        }
      },
      outputStrings: {
        corners: {
          en: 'Corners',
          de: 'Ecken',
          fr: 'Coins',
          ja: '角へ',
          cn: '去四角',
          ko: '구석으로',
          tc: '去四角',
        },
        under: Outputs.getUnder,
      },
    },
    {
      id: 'Cloud Chaotic Flood of Darkness Interrupt',
      type: 'StartsUsing',
      netRegex: { id: '9E37', source: 'Stygian Shadow', capture: true },
      condition: (data, matches) => {
        const side = parseFloat(matches.x) < center.x ? 'east' : 'west';
        return data.outerDarkness && side === data.mySide;
      },
      response: Responses.interruptIfPossible(),
    },
    {
      id: 'Cloud Chaotic Chaos-condensed Particle Beam',
      type: 'StartsUsing',
      netRegex: { id: '9E0D', source: 'Cloud of Darkness', capture: false },
      // this is a Wild Charge, tanks should be in front
      response: Responses.stackMarker(),
    },
    {
      id: 'Cloud Chaotic Diffusive-force Particle Beam',
      type: 'StartsUsing',
      netRegex: { id: '9E10', source: 'Cloud of Darkness', capture: false },
      response: Responses.spread(),
    },
    {
      id: 'Cloud Chaotic Active-pivot Particle Beam',
      type: 'StartsUsing',
      // 9E13 = clockwise, 9E15 = counterclockwise
      netRegex: { id: ['9E13', '9E15'], source: 'Cloud of Darkness', capture: true },
      infoText: (_data, matches, output) => {
        const rotateStr = matches.id === '9E13' ? output.clockwise!() : output.counterClockwise!();
        return output.rotate!({ rotateStr: rotateStr });
      },
      outputStrings: {
        rotate: {
          en: 'Rotate ${rotateStr}',
          de: 'Rotiere ${rotateStr}',
          fr: 'Tournez ${rotateStr}',
          ja: '回転ビーム ${rotateStr}',
          cn: '${rotateStr} 旋转',
          ko: '${rotateStr} 회전',
          tc: '${rotateStr} 旋轉',
        },
        clockwise: Outputs.clockwise,
        counterClockwise: Outputs.counterclockwise,
      },
    },
    {
      id: 'Cloud Chaotic Curse Of Darkness AoE',
      type: 'StartsUsing',
      netRegex: { id: '9E33', source: 'Stygian Shadow', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Cloud Chaotic Curse Of Darkness Face Laser',
      type: 'GainsEffect',
      netRegex: { effectId: '953', capture: true },
      condition: Conditions.targetIsYou(),
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 3,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Face Laser Out',
          de: 'Laser nach draußen richten',
          fr: 'Orientez le laser vers l\'extérieur',
          ja: 'レーザーを外に向ける',
          cn: '面向场外放激光',
          ko: '레이저를 바깥으로 유도하기',
          tc: '面向場外放雷射',
        },
      },
    },
    {
      id: 'Cloud Chaotic Excruciate',
      type: 'StartsUsing',
      netRegex: { id: '9E36', source: 'Stygian Shadow', capture: true },
      // TODO: some strats may prefer to have this call for any party members
      // being targeted by the buster regardless of inside/outside position
      condition: (data, matches) => {
        const side = parseFloat(matches.x) < center.x ? 'east' : 'west';
        return data.me === matches.target || (data.outerDarkness && side === data.mySide);
      },
      response: Responses.tankCleave(),
    },
    {
      id: 'Cloud Chaotic Core-lateral Phaser 9E2F',
      type: 'StartsUsing',
      netRegex: { id: '9E2F', source: 'Stygian Shadow', capture: true },
      condition: (data, matches) => {
        const side = parseFloat(matches.x) < center.x ? 'east' : 'west';
        return data.outerDarkness && side === data.mySide;
      },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Sides => middle',
          de: 'Seiten => Mitte',
          fr: 'Côtés => Milieu',
          ja: 'サイド => 真ん中',
          cn: '两侧 => 中间',
          ko: '양 옆 => 중앙',
          tc: '兩側 => 中間',
        },
      },
    },
    {
      id: 'Cloud Chaotic Lateral-core Phaser 9E30',
      type: 'StartsUsing',
      netRegex: { id: '9E30', source: 'Stygian Shadow', capture: true },
      condition: (data, matches) => {
        const side = parseFloat(matches.x) < center.x ? 'east' : 'west';
        return data.outerDarkness && side === data.mySide;
      },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Middle => sides',
          de: 'Mitte => Seiten',
          fr: 'Milieu => Côtés',
          ja: '真ん中 => サイド',
          cn: '中间 => 两侧',
          ko: '중앙 => 양 옆',
          tc: '中間 => 兩側',
        },
      },
    },
    {
      id: 'Cloud Chaotic Evil Seed',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.evilSeed, capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Place Bramble',
          de: 'Dornenstrauch plazieren',
          fr: 'Placez les ronces',
          ja: '苗木を捨てる',
          cn: '放置荆棘',
          ko: '장판 유도하기',
          tc: '放置荊棘',
        },
      },
    },
    {
      id: 'Cloud Chaotic Thorny Vine',
      type: 'GainsEffect',
      netRegex: { effectId: '1BD', capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.breakChains(),
    },
    {
      id: 'Cloud Chaotic The Third Art of Darkness Collector',
      type: 'HeadMarker',
      netRegex: {
        id: Object.keys(thirdArtOfDarknessHeadmarker),
        target: 'Stygian Shadow',
        capture: true,
      },
      promise: async (data, matches) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
        })).combatants;

        const actorID = parseInt(matches.targetId, 16);
        const actor = actors.find((actor) => actor.ID === actorID);

        if (!actor) {
          console.error(
            `Cloud Chaotic The Third Art of Darkness Collector: can't find actor ${actorID}`,
          );
          return;
        }

        if (!isThirdArtOfDarknessId(matches.id)) {
          throw new UnreachableCode();
        }

        const side = actor.PosX < center.x ? 'east' : 'west';
        const mech = thirdArtOfDarknessHeadmarker[matches.id];

        if (side === 'east') {
          (data.thirdArtOfDarkness.east ??= []).push(mech);
        } else {
          (data.thirdArtOfDarkness.west ??= []).push(mech);
        }
      },
    },
    {
      id: 'Cloud Chaotic The Third Art of Darkness Initial',
      type: 'StartsUsing',
      netRegex: { id: ['9E20', '9E23'], source: 'Stygian Shadow', capture: true },
      condition: (data, matches) => {
        const side = parseFloat(matches.x) < center.x ? 'east' : 'west';
        return data.outerDarkness && side === data.mySide;
      },
      // delay enough to capture the first mechanic telegraph
      delaySeconds: 2,
      infoText: (data, matches, output) => {
        const side = parseFloat(matches.x) < center.x ? 'east' : 'west';
        const shadowData = side === 'east'
          ? data.thirdArtOfDarkness.east
          : data.thirdArtOfDarkness.west;

        if (!shadowData) {
          console.error(
            `Cloud Chaotic The Third Art of Darkness Initial: missing shadowData for side ${side}`,
          );
        }

        const [mech1] = shadowData ?? [];

        return output.text!({
          first: mech1 === undefined ? output.unknown!() : output[mech1]!(),
        });
      },
      outputStrings: {
        text: {
          en: 'Start ${first}',
          de: 'Start ${first}',
          fr: 'Commencez ${first}',
          ja: '最初は ${first} から',
          cn: '先 ${first}',
          ko: '${first} 시작',
          tc: '先 ${first}',
        },
        leftCleave: Outputs.right,
        rightCleave: Outputs.left,
        pairStacks: Outputs.stacks,
        proteanSpread: Outputs.protean,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Cloud Chaotic The Third Art of Darkness',
      type: 'StartsUsing',
      netRegex: { id: ['9E20', '9E23'], source: 'Stygian Shadow', capture: true },
      condition: (data, matches) => {
        const side = parseFloat(matches.x) < center.x ? 'east' : 'west';
        return data.outerDarkness && side === data.mySide;
      },
      // the adds take a long time to telegraph all of their upcoming mechanics
      delaySeconds: 7.5,
      alertText: (data, matches, output) => {
        const side = parseFloat(matches.x) < center.x ? 'east' : 'west';
        const shadowData = side === 'east'
          ? data.thirdArtOfDarkness.east
          : data.thirdArtOfDarkness.west;

        if (!shadowData) {
          console.error(
            `Cloud Chaotic The Third Art of Darkness: missing shadowData for side ${side}`,
          );
        }

        const [mech1, mech2, mech3] = shadowData ?? [];

        return output.text!({
          first: mech1 === undefined ? output.unknown!() : output[mech1]!(),
          second: mech2 === undefined ? output.unknown!() : output[mech2]!(),
          third: mech3 === undefined ? output.unknown!() : output[mech3]!(),
        });
      },
      outputStrings: {
        text: {
          en: '${first} => ${second} => ${third}',
          de: '${first} => ${second} => ${third}',
          fr: '${first} => ${second} => ${third}',
          ja: '${first} => ${second} => ${third}',
          cn: '${first} => ${second} => ${third}',
          ko: '${first} => ${second} => ${third}',
          tc: '${first} => ${second} => ${third}',
        },
        leftCleave: Outputs.right,
        rightCleave: Outputs.left,
        pairStacks: Outputs.stacks,
        proteanSpread: Outputs.protean,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Cloud Chaotic The Third Art of Darkness Cleanup',
      type: 'Ability',
      netRegex: { id: ['9E20', '9E23'], source: 'Stygian Shadow', capture: false },
      suppressSeconds: 1,
      run: (data) => {
        delete data.thirdArtOfDarkness.east;
        delete data.thirdArtOfDarkness.west;
      },
    },
    {
      id: 'Cloud Chaotic Looming Chaos',
      type: 'StartsUsing',
      netRegex: { id: 'A2CB', source: 'Cloud of Darkness', capture: false },
      preRun: (data) => delete data.mySide,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'AoE + player swaps',
          de: 'AoE + Spieler-Wechsel',
          fr: 'AoE + swaps joueurs',
          ja: 'AoE + プレイヤーシャッフル',
          cn: 'AoE + 换位',
          ko: '전체 공격 + 자리 교체',
          tc: 'AoE + 換位',
        },
      },
    },
    {
      id: 'Cloud Chaotic Looming Chaos Enmity Reset',
      type: 'Ability',
      netRegex: { id: 'A2CB', source: 'Cloud of Darkness', capture: false },
      condition: (data) => data.role === 'tank',
      delaySeconds: 3,
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Provoke Boss',
          de: 'Boss abspotten',
          fr: 'Provoquez le Boss',
          ja: '敵視リセット 挑発！',
          cn: '挑衅',
          ko: '보스 도발',
          tc: '挑釁',
        },
      },
    },
    {
      id: 'Cloud Chaotic Feint Particle Beam',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.chasingAoe, capture: true },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Chasing AoE on YOU',
          de: 'Verfolgende AoE auf DIR',
          fr: 'Ruée sur VOUS',
          ja: '追跡AOE',
          cn: '追踪AOE点名',
          ko: '연속장판 대상자',
          tc: '追蹤AOE點名',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Cloud Of Darkness': 'Wolke der Dunkelheit',
        'Cloud of Darkness': 'Wolke der Dunkelheit',
        'Cloudlet of Darkness': 'Zirrus der Dunkelheit',
        'Stygian Shadow': 'abyssisch(?:e|er|es|en) Abscheulichkeit',
      },
      'replaceText': {
        '--adds untargetable--': '--add nicht anvisierbar--',
        'Active-pivot Particle Beam': 'Rotierender Partikelstrahl',
        '(?<!En)Aero IV': 'Windka',
        'Blade of Darkness': 'Schwarze Schneide',
        'Break IV': 'Stillstandka',
        'Chaos-condensed Particle Beam': 'Hyperdichter Partikelstrahl',
        'Core-lateral Phaser': 'Zentral-Lateral-Phaser',
        'Curse of Darkness': 'Partikelfluch',
        'Dark Dominion': 'Dunkle Herrschaft',
        'Dark-energy Particle Beam': 'Dunkler Partikelstrahl',
        '(?<!En)Death IV': 'Todka',
        'Deluge of Darkness': 'Sintflut der Dunkelheit',
        'Diffusive-force Particle Beam': 'Diffusiver Partikelstrahl',
        'Enaero IV': 'Adwindka',
        'Endeath IV': 'Adtodka',
        'Evaporation': 'Verflüchtigung',
        'Evil Seed': 'Saatkugel',
        'Excruciate': 'Kreuzigung',
        'Feint Particle Beam': 'Schein-Partikelstrahl',
        'Flare': 'Flare',
        'Flood of Darkness': 'Dunkle Flut',
        'Ghastly Gloom': 'Schaurige Schwärze',
        'Grim Embrace': 'Grimmige Umarmung',
        'Lateral-core Phaser': 'Lateral-Zentral-Phaser',
        'Looming Chaos': 'Aufziehendes Chaos',
        '(?<! )Particle Beam': 'Partikeldetonation',
        'Particle Concentration': 'Partikelkugel',
        '(?<! )Phaser': 'Phaser',
        'Rapid-sequence Particle Beam': 'Dauerfeuer-Partikelstrahl',
        'Razing-volley Particle Beam': 'Salvenfeuer-Partikelstrahl',
        'Thorny Vine': 'Dornenranken',
        'Unholy Darkness': 'Unheiliges Dunkel',
        'Vortex': 'Einsaugen',
        'the Third Art of Darkness': 'Dunkle Taktik: Dreifach',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Cloud of Darkness': 'Nuage de Ténèbres',
        'Cloudlet of Darkness': 'stratus de Ténèbres',
        'Stygian Shadow': 'suppôt de Ténèbres',
      },
      'replaceText': {
        '--adds untargetable--': '--Adds non ciblables--',
        'Active-pivot Particle Beam': 'Canon plasma rotatif',
        '(?<!En)Aero IV': 'Giga Vent',
        'Blade of Darkness': 'Ténèbres acérées',
        'Break IV': 'Giga Brèche',
        'Chaos-condensed Particle Beam': 'Canon plasma hyperconcentré',
        'Core-lateral Phaser': 'Faisceaux centrés et latéraux',
        'Curse of Darkness': 'Malédiction particulaire',
        'Dark Dominion': 'Domaines obscurs',
        'Dark-energy Particle Beam': 'Faisceau de particules maudit',
        '(?<!En)Death IV': 'Giga Mort',
        'Deluge of Darkness': 'Grand déluge de Ténèbres',
        'Diffusive-force Particle Beam': 'Canon plasma diffus',
        'Enaero IV': 'Onction : Giga Vent',
        'Endeath IV': 'Onction : Giga Mort',
        'Evaporation': 'Évaporation',
        'Evil Seed': 'Tir semant',
        'Excruciate': 'Empalement ténébreux',
        'Feint Particle Beam': 'Rayon pénétrant',
        'Flare': 'Brasier',
        'Flood of Darkness': 'Déluge de Ténèbres',
        'Ghastly Gloom': 'Nuée calorifique',
        'Grim Embrace': 'Étreinte funèbre',
        'Lateral-core Phaser': 'Faisceaux latéraux et centrés',
        'Looming Chaos': 'Chaos rampant',
        '(?<! )Particle Beam': 'Rayon explosif',
        'Particle Concentration': 'Rayon sphérique',
        '(?<! )Phaser': 'Faisceau de particules bondissant',
        'Rapid-sequence Particle Beam': 'Rafale plasmique',
        'Razing-volley Particle Beam': 'Salve plasmique',
        'Thorny Vine': 'Sarment de ronces',
        'Unholy Darkness': 'Miracle ténébreux',
        'Vortex': 'Aspiration',
        'the Third Art of Darkness': 'Arts ténébreux triple',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Cloud of Darkness': '暗闇の雲',
        'Cloudlet of Darkness': '暗闇の片乱雲',
        'Stygian Shadow': '闇より出づる者',
      },
      'replaceText': {
        'Active-pivot Particle Beam': '旋回式波動砲',
        '(?<!En)Aero IV': 'エアロジャ',
        'Blade of Darkness': '闇の刃',
        'Break IV': 'ブレクジャ',
        'Chaos-condensed Particle Beam': '凝縮式波動砲',
        'Core-lateral Phaser': '跳躍波動砲【正撃・側撃】',
        'Curse of Darkness': '波動の呪詛',
        'Dark Dominion': '深闇領域',
        'Dark-energy Particle Beam': '呪詛式 波動砲',
        '(?<!En)Death IV': 'デスジャ',
        'Deluge of Darkness': '闇の大氾濫',
        'Diffusive-force Particle Beam': '分散式波動砲',
        'Enaero IV': 'エンエアロジャ',
        'Endeath IV': 'エンデスジャ',
        'Evaporation': '雲散',
        'Evil Seed': '種子弾',
        'Excruciate': '磔殺',
        'Feint Particle Beam': '潜地式波動砲',
        'Flare': 'フレア',
        'Flood of Darkness': '闇の氾濫',
        'Ghastly Gloom': '怖れの雲',
        'Grim Embrace': 'グリムエンブレイス',
        'Lateral-core Phaser': '跳躍波動砲【側撃・正撃】',
        'Looming Chaos': 'ルーミングカオス',
        '(?<! )Particle Beam': '波動爆発',
        'Particle Concentration': '波動球',
        '(?<! )Phaser': '跳躍波動砲',
        'Rapid-sequence Particle Beam': '連射式波動砲',
        'Razing-volley Particle Beam': '斉射式波動砲',
        'Thorny Vine': '茨の蔓',
        'Unholy Darkness': 'ダークホーリー',
        'Vortex': '吸引',
        'the Third Art of Darkness': '闇の戦技：三重',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Cloud Of Darkness': '暗黑之云',
        'Cloud of Darkness': '暗黑之云',
        'Cloudlet of Darkness': '暗黑之破片云',
        'Stygian Shadow': '生于黑暗之物',
      },
      'replaceText': {
        '--adds untargetable--': '--小怪不可选中--',
        'Active-pivot Particle Beam': '回旋式波动炮',
        '(?<!En)Aero IV': '飙风',
        'Blade of Darkness': '暗之刃',
        'Break IV': '超石化',
        'Chaos-condensed Particle Beam': '凝聚式波动炮',
        'Core-lateral Phaser': '正侧跳跃波动炮',
        'Curse of Darkness': '波动诅咒',
        'Dark Dominion': '深暗领域',
        'Dark-energy Particle Beam': '诅咒式波动炮',
        '(?<!En)Death IV': '极死',
        'Deluge of Darkness': '暗之大泛滥',
        'Diffusive-force Particle Beam': '分散式波动炮',
        'Enaero IV': '超附风',
        'Endeath IV': '超附死',
        'Evaporation': '云散',
        'Evil Seed': '种子弹',
        'Excruciate': '磔杀',
        'Feint Particle Beam': '潜地式波动炮',
        'Flare': '核爆',
        'Flood of Darkness': '暗之泛滥',
        'Ghastly Gloom': '恐惧之云',
        'Grim Embrace': '阴冷拥抱',
        'Lateral-core Phaser': '侧正跳跃波动炮',
        'Looming Chaos': '混沌迫近',
        '(?<! )Particle Beam': '波动爆炸',
        'Particle Concentration': '波动球',
        '(?<! )Phaser': '跳跃波动炮',
        'Rapid-sequence Particle Beam': '连射式波动炮',
        'Razing-volley Particle Beam': '齐射式波动炮',
        'Thorny Vine': '荆棘丛生',
        'Unholy Darkness': '黑暗神圣',
        'Vortex': '吸引',
        'the Third Art of Darkness': '三重暗之战技',
      },
    },
    {
      'locale': 'tc',
      'missingTranslations': true,
      'replaceSync': {
        'Cloud Of Darkness': '黑暗之雲',
        'Cloud of Darkness': '黑暗之雲',
        // 'Cloudlet of Darkness': '', // FIXME '暗黑之破片云'
        // 'Stygian Shadow': '', // FIXME '生于黑暗之物'
      },
      'replaceText': {
        // '--adds untargetable--': '', // FIXME '--小怪不可选中--'
        // 'Active-pivot Particle Beam': '', // FIXME '回旋式波动炮'
        '(?<!En)Aero IV': '超勁風',
        // 'Blade of Darkness': '', // FIXME '暗之刃'
        // 'Break IV': '', // FIXME '超石化'
        // 'Chaos-condensed Particle Beam': '', // FIXME '凝聚式波动炮'
        // 'Core-lateral Phaser': '', // FIXME '正侧跳跃波动炮'
        // 'Curse of Darkness': '', // FIXME '波动诅咒'
        // 'Dark Dominion': '', // FIXME '深暗领域'
        'Dark-energy Particle Beam': '詛咒式波動砲',
        // '(?<!En)Death IV': '', // FIXME '极死'
        'Deluge of Darkness': '暗之大氾濫',
        // 'Diffusive-force Particle Beam': '', // FIXME '分散式波动炮'
        // 'Enaero IV': '', // FIXME '超附风'
        // 'Endeath IV': '', // FIXME '超附死'
        // 'Evaporation': '', // FIXME '云散'
        'Evil Seed': '種子彈',
        // 'Excruciate': '', // FIXME '磔杀'
        'Feint Particle Beam': '潛地式波動砲',
        'Flare': '火光',
        // 'Flood of Darkness': '', // FIXME '暗之泛滥'
        // 'Ghastly Gloom': '', // FIXME '恐惧之云'
        // 'Grim Embrace': '', // FIXME '阴冷拥抱'
        // 'Lateral-core Phaser': '', // FIXME '侧正跳跃波动炮'
        // 'Looming Chaos': '', // FIXME '混沌迫近'
        '(?<! )Particle Beam': '波動爆炸',
        'Particle Concentration': '波動球',
        // '(?<! )Phaser': '', // FIXME '跳跃波动炮'
        // 'Rapid-sequence Particle Beam': '', // FIXME '连射式波动炮'
        // 'Razing-volley Particle Beam': '', // FIXME '齐射式波动炮'
        'Thorny Vine': '荊棘叢生',
        'Unholy Darkness': '黑暗神聖',
        'Vortex': '吸引',
        'the Third Art of Darkness': '三重暗之戰技',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Cloud Of Darkness': '어둠의 구름',
        'Cloud of Darkness': '어둠의 구름',
        'Cloudlet of Darkness': '어둠의 조각구름',
        'Stygian Shadow': '어둠에서 나타난 자',
      },
      'replaceText': {
        '\\(cast\\)': '(시전)',
        '\\(damage\\)': '(피해)',
        '\\(brambles drop\\)': '(장판 떨어짐)',
        '\\(chasing AoEs\\)': '(추적 장판)',
        '--adds untargetable--': '--쫄 타겟불가능--',
        'Active-pivot Particle Beam': '선회식 파동포',
        '(?<!En)Aero IV': '에어로쟈',
        'Blade of Darkness': '어둠의 칼날',
        'Break IV': '브레크쟈',
        'Chaos-condensed Particle Beam': '응축식 파동포',
        'Core-lateral Phaser': '도약파동포: 정면 측면',
        'Curse of Darkness': '파동의 저주',
        'Dark Dominion': '짙은 어둠의 영역',
        'Dark-energy Particle Beam': '저주식 파동포',
        '(?<!En)Death IV': '데스쟈',
        'Deluge of Darkness': '어둠의 대범람',
        'Diffusive-force Particle Beam': '분산식 파동포',
        'Enaero IV': '인에어로쟈',
        'Endeath IV': '인데스쟈',
        'Evaporation': '흩어지는 구름',
        'Evil Seed': '씨앗탄',
        'Excruciate': '책살',
        'Feint Particle Beam': '위장형 파동포',
        'Flare': '플레어',
        'Flood of Darkness': '어둠의 범람',
        'Ghastly Gloom': '공포의 구름',
        'Grim Embrace': '음산한 포옹',
        'Lateral-core Phaser': '도약파동포: 측면 정면',
        'Looming Chaos': '다가오는 혼돈',
        '(?<! )Particle Beam': '파동 폭발',
        'Particle Concentration': '파동구',
        '(?<! )Phaser': '도약파동포',
        'Rapid-sequence Particle Beam': '연사식 파동포',
        'Razing-volley Particle Beam': '일제 사격식 파동포',
        'Thorny Vine': '가시덩굴',
        'Unholy Darkness': '다크 홀리',
        'Vortex': '흡인',
        'the Third Art of Darkness': '어둠의 전투술: 삼중',
      },
    },
  ],
};

export default triggerSet;
