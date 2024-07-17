import ContentType from '../../resources/content_type';
import { Job } from '../../types/job';

export const kMeleeWithMpJobs: Job[] = ['PLD', 'DRK'];

export const kMPNormalRate = 0.06;
export const kMPCombatRate = 0.02;
export const kMPUI1Rate = 0.30;
export const kMPUI2Rate = 0.45;
export const kMPUI3Rate = 0.60;
export const kMPTickInterval = 3.0;

export const kComboDelay = 30;

export const kWellFedContentTypes: number[] = [
  ContentType.Dungeons,
  ContentType.Trials,
  ContentType.Raids,
  ContentType.UltimateRaids,
];

export const kAbility = {
  // LB
  ShieldWall: 'C5', // T LB1
  Stronghold: 'C6', // T LB2
  LastBastion: 'C7', // PLD LB3
  LandWaker: '1090', // WAR LB3
  DarkForce: '1091', // DRK LB3
  GunmetalSoul: '42D1', // GNB LB3
  HealingWind: 'CE', // H LB1
  BreathoftheEarth: 'CF', // H LB2
  PulseofLife: 'D0', // WHM LB3
  AngelFeathers: '1097', // SCH LB3
  AstralStasis: '1098', // AST LB3
  Braver: 'C8', // meleeDPS LB1
  Bladedance: 'C9', // meleeDPS LB2
  FinalHeaven: 'CA', // MNK LB3
  Chimatsuri: '1093', // NIN LB3
  DragonsongDive: '1092', // DRG LB3
  DoomoftheLiving: '1EB5', // SAM LB3
  BigShot: '108E', // rangeDPS LB1
  Desperado: '108F', // rangeDPS LB2
  SagittariusArrow: '1094', // BRD LB3
  SatelliteBeam: '1095', // MCH LB3
  CrimsonLotus: '42D2', // DNC LB3
  Skyshard: 'CB', // magicDPS LB1
  Starstorm: 'CC', // magicDPS LB2
  Meteor: 'CD', // BLM LB3
  Teraflare: '1096', // SMN LB3
  VermilionScourge: '1EB6', // RDM LB3
  // PLD
  FastBlade: '09',
  RiotBlade: '0F',
  GoringBlade: 'DD2',
  RoyalAuthority: 'DD3',
  RageOfHalone: '15',
  TotalEclipse: '1CD5',
  Prominence: '4049',
  ShieldLob: '18',
  ShieldBash: '10',
  Requiescat: '1CD7',
  Imperator: '9039',
  HolySpirit: '1CD8',
  HolyCircle: '404A',
  Confiteor: '404B',
  Clemency: 'DD5',
  FightOrFlight: '14',
  SpiritsWithin: '1D',
  Expiacion: '6493',
  BladeofFaith: '6494',
  BladeofTruth: '6495',
  BladeOfValor: '6496',
  Atonement: '404C',
  CircleOfScorn: '17',
  // WAR
  HeavySwing: '1F',
  Maim: '25',
  StormsEye: '2D',
  StormsPath: '2A',
  Overpower: '29',
  MythrilTempest: '404E',
  Tomahawk: '2E',
  Berserk: '26',
  InnerRelease: '1CDD',
  Upheaval: '1CDB',
  Orogeny: '6498',
  // DRK
  HardSlash: 'E21',
  SyphonStrike: 'E27',
  Souleater: 'E30',
  Unleash: 'E25',
  StalwartSoul: '4054',
  Unmend: 'E28',
  CarveAndSpit: 'E3B',
  Plunge: 'E38',
  AbyssalDrain: 'E39',
  TheBlackestNight: '1CE1',
  BloodWeapon: 'E29',
  Delirium: '1CDE',
  LivingShadow: '4058',
  SaltedEarth: 'E37',
  // GNB
  KeenEdge: '3F09',
  BrutalShell: '3F0B',
  SolidBarrel: '3F11',
  GnashingFang: '3F12',
  SavageClaw: '3F13',
  WickedTalon: '3F16',
  DemonSlice: '3F0D',
  DemonSlaughter: '3F15',
  LightningShot: '3F0F',
  Bloodfest: '3F24',
  NoMercy: '3F0A',
  ReignOfBeasts: '9049',
  NobleBlood: '904A',
  LionHeart: '904B',
  // WHM
  Aero: '79',
  Aero2: '84',
  Dia: '4094',
  Assize: 'DF3',
  PresenceOfMind: '88',
  // SCH
  Bio: '45C8',
  Bio2: '45C9',
  Biolysis: '409C',
  Adloquium: 'B9',
  ChainStratagem: '1D0C',
  Aetherflow: 'A6',
  // AST
  Combust: 'E0F',
  Combust2: 'E18',
  Combust3: '40AA',
  AspectedBenefic: 'E0B',
  AspectedHelios: 'E11',
  Draw: 'E06',
  MinorArcana: '1D13',
  Divination: '40A8',
  AstralDraw: '9099',
  UmbralDraw: '909A',
  // SGE
  Rhizomata: '5EF5',
  Phlegma: '5EE1',
  Phlegma2: '5EF3',
  Phlegma3: '5EF9',
  // MNK
  DragonKick: '4A',
  TwinSnakes: '3D',
  Demolish: '42',
  Bootshine: '35',
  FourPointFury: '4059',
  Brotherhood: '1CE4',
  PerfectBalance: '45',
  RiddleOfFire: '1CE3',
  RiddleOfWind: '64A6',
  // DRG
  TrueThrust: '4B',
  RaidenThrust: '405F',
  VorpalThrust: '4E',
  FullThrust: '54',
  Disembowel: '57',
  ChaosThrust: '58',
  FangAndClaw: 'DE2',
  WheelingThrust: 'DE4',
  DoomSpike: '56',
  SonicThrust: '1CE5',
  CoerthanTorment: '405D',
  PiercingTalon: '5A',
  HighJump: '405E',
  Jump: '5C',
  LanceCharge: '55',
  DragonSight: '1CE6',
  BattleLitany: 'DE5',
  DraconianFury: '64AA',
  Drakesbane: '9058',
  ChaoticSpring: '64AC',
  HeavensThrust: '64AB',
  SpiralBlow: '905B',
  LanceBarrage: '905A',
  Geirskogul: 'DE3',
  // NIN
  SpinningEdge: '8C0',
  GustSlash: '8C2',
  AeolianEdge: '8CF',
  ArmorCrush: 'DEB',
  DeathBlossom: '8CE',
  HakkeMujinsatsu: '4068',
  ThrowingDagger: '8C7',
  TrickAttack: '8D2',
  RabbitMedium: '8E0',
  Bunshin: '406D',
  Hide: '8C5',
  Mug: '8C8',
  Dokumori: '905D',
  KunaisBane: '905E',
  // SAM
  Hakaze: '1D35',
  Jinpu: '1D36',
  Shifu: '1D37',
  Gekko: '1D39',
  Kasha: '1D3A',
  Yukikaze: '1D38',
  Fuga: '1D3B',
  Mangetsu: '1D3C',
  Oka: '1D3D',
  Enpi: '1D3E',
  MeikyoShisui: '1D4B',
  KaeshiHiganbana: '4064',
  KaeshiGoken: '4065',
  KaeshiSetsugekka: '4066',
  HissatsuGuren: '1D48',
  HissatsuSenei: '4061',
  Fuko: '64B4',
  Gyofu: '9063',
  Ikishoten: '4062',
  // RPR
  Slice: '5F35',
  WaxingSlice: '5F36',
  InfernalSlice: '5F37',
  SpinningScythe: '5F38',
  NightmareScythe: '5F39',
  Gluttony: '5F49',
  SoulSlice: '5F3C',
  SoulScythe: '5F3D',
  ArcaneCircle: '5F55',
  // BRD
  BattleVoice: '76',
  MagesBallad: '72',
  ArmysPaeon: '74',
  theWanderersMinuet: 'DE7',
  EmpyrealArrow: 'DE6',
  RadiantFinale: '64B9',
  // MCH
  SplitShot: 'B32',
  SlugShot: 'B34',
  CleanShot: 'B39',
  HeatedSplitShot: '1CF3',
  HeatedSlugShot: '1CF4',
  HeatedCleanShot: '1CF5',
  SpreadShot: 'B36',
  Drill: '4072',
  Bioblaster: '4073',
  HotShot: 'B38',
  AirAnchor: '4074',
  WildFire: 'B3E',
  HeatBlast: '1CF2',
  AutoCrossbow: '4071',
  ChainSaw: '64BC',
  Scattergun: '64BA',
  // DNC
  Cascade: '3E75',
  Fountain: '3E76',
  Windmill: '3E79',
  Bladeshower: '3E7A',
  QuadrupleTechnicalFinish: '3F44',
  TripleTechnicalFinish: '3F43',
  DoubleTechnicalFinish: '3F42',
  SingleTechnicalFinish: '3F41',
  TechnicalFinish: '3E84',
  StandardStep: '3E7D',
  TechnicalStep: '3E7E',
  Flourish: '3E8D',
  // BLM
  Thunder1: '90',
  Thunder2: '1D17',
  Thunder3: '99',
  Thunder4: '1CFC',
  // SMN
  EnergyDrain: '407C',
  EnergySiphon: '407E',
  SearingLight60: '64F2',
  SearingLight: '64C9',
  Aethercharge: '64C8',
  DreadwyrmTrance: 'DFD',
  SummonBahamut: '1D03',
  SummonPhoenix: '64E7',
  // RDM
  Verstone: '1D57',
  Verfire: '1D56',
  Veraero: '1D53',
  Verthunder: '1D51',
  Verholy: '1D66',
  Verflare: '1D65',
  Jolt2: '1D64',
  Jolt: '1D4F',
  Impact: '1D62',
  Scatter: '1D55',
  Verthunder2: '408C',
  Veraero2: '408D',
  Vercure: '1D5A',
  Verraise: '1D63',
  Riposte: '1D50',
  Zwerchhau: '1D58',
  Redoublement: '1D5C',
  Moulinet: '1D59',
  Reprise: '4091',
  EnchantedRiposte: '1D67',
  EnchantedZwerchhau: '1D68',
  EnchantedRedoublement: '1D69',
  EnchantedMoulinet: '1D6A',
  EnchantedReprise: '4090',
  Embolden: '1D60',
  Manafication: '1D61',
  Fleche: '1D5D',
  ContreSixte: '1D5F',
  // PCT
  PomMuse: '876E',
  WingedMuse: '876F',
  ClawedMuse: '8770',
  FangedMuse: '8771',
  StrikingMuse: '8772',
  StarryMuse: '8773',
  // BLU
  SongOfTorment: '2C7A',
  OffGuard: '2C93',
  PeculiarLight: '2C9D',
  AetherialSpark: '5AF1',
  Nightbloom: '5AFA',
  // Role Action
  LucidDreaming: '1D8A',
} as const;

// Combo actions for every jobs, this would apply to ComboTracker when
// it is initialized, for determining whether the current action is in combo.
// For upgradable skill actions, use array to represent the combo action chain.
// (Can also be used on only last skill different combo)
// For example, PLD's Fast Blade -> Riot Blade -> Royal Authority / Rage of Halone
// combo chain would be represented as
// ['Fast Blade', 'Riot Blade', ['Royal Authority', 'Rage of Halone']].
export const kComboActions: Array<Array<string | string[]>> = [
  // PLD
  [
    kAbility.FastBlade,
    kAbility.RiotBlade,
    [kAbility.RoyalAuthority, kAbility.RageOfHalone],
  ],
  [
    kAbility.TotalEclipse,
    kAbility.Prominence,
  ],
  // WAR
  [
    kAbility.HeavySwing,
    kAbility.Maim,
    [kAbility.StormsEye, kAbility.StormsPath],
  ],
  [
    kAbility.Overpower,
    kAbility.MythrilTempest,
  ],
  // DRK
  [
    kAbility.HardSlash,
    kAbility.SyphonStrike,
    kAbility.Souleater,
  ],
  [
    kAbility.Unleash,
    kAbility.StalwartSoul,
  ],
  // GNB
  [
    kAbility.KeenEdge,
    kAbility.BrutalShell,
    kAbility.SolidBarrel,
  ],
  [
    kAbility.DemonSlice,
    kAbility.DemonSlaughter,
  ],
  // DRG
  [
    [kAbility.TrueThrust, kAbility.RaidenThrust],
    [kAbility.Disembowel, kAbility.SpiralBlow],
    [kAbility.ChaosThrust, kAbility.ChaoticSpring],
    kAbility.WheelingThrust,
    kAbility.Drakesbane,
  ],
  [
    [kAbility.TrueThrust, kAbility.RaidenThrust],
    [kAbility.VorpalThrust, kAbility.LanceBarrage],
    [kAbility.FullThrust, kAbility.HeavensThrust],
    kAbility.FangAndClaw,
    kAbility.Drakesbane,
  ],
  [
    [kAbility.DoomSpike, kAbility.DraconianFury],
    kAbility.SonicThrust,
    kAbility.CoerthanTorment,
  ],
  // NIN
  [
    kAbility.SpinningEdge,
    kAbility.GustSlash,
    [kAbility.AeolianEdge, kAbility.ArmorCrush],
  ],
  [
    kAbility.DeathBlossom,
    kAbility.HakkeMujinsatsu,
  ],
  // SAM
  [
    [kAbility.Hakaze, kAbility.Gyofu],
    kAbility.Jinpu,
    kAbility.Gekko,
  ],
  [
    [kAbility.Hakaze, kAbility.Gyofu],
    kAbility.Shifu,
    kAbility.Kasha,
  ],
  [
    [kAbility.Hakaze, kAbility.Gyofu],
    kAbility.Yukikaze,
  ],
  [
    [kAbility.Fuga, kAbility.Fuko],
    [kAbility.Mangetsu, kAbility.Oka],
  ],
  // RPR
  [
    kAbility.Slice,
    kAbility.WaxingSlice,
    kAbility.InfernalSlice,
  ],
  [
    kAbility.SpinningScythe,
    kAbility.NightmareScythe,
  ],
  // MCH
  [
    [kAbility.SplitShot, kAbility.HeatedSplitShot],
    [kAbility.SlugShot, kAbility.HeatedSlugShot],
    [kAbility.CleanShot, kAbility.HeatedCleanShot],
  ],
  // DNC
  [
    kAbility.Cascade,
    kAbility.Fountain,
  ],
  [
    kAbility.Windmill,
    kAbility.Bladeshower,
  ],
];

// Full skill names of abilities that break combos.
// TODO: it's sad to have to duplicate combo abilities here to catch out-of-order usage.
export const kComboBreakers = [
  // PLD
  kAbility.FastBlade,
  kAbility.RiotBlade,
  kAbility.RageOfHalone,
  kAbility.RoyalAuthority,
  kAbility.TotalEclipse,
  kAbility.Prominence,
  kAbility.ShieldBash,
  // WAR
  kAbility.HeavySwing,
  kAbility.Maim,
  kAbility.StormsEye,
  kAbility.StormsPath,
  kAbility.Overpower,
  kAbility.MythrilTempest,
  // DRK
  kAbility.HardSlash,
  kAbility.SyphonStrike,
  kAbility.Souleater,
  kAbility.Unleash,
  kAbility.StalwartSoul,
  // GNB
  kAbility.KeenEdge,
  kAbility.BrutalShell,
  kAbility.SolidBarrel,
  kAbility.DemonSlice,
  kAbility.DemonSlaughter,
  // DRG
  kAbility.TrueThrust,
  kAbility.RaidenThrust,
  kAbility.VorpalThrust,
  kAbility.LanceBarrage,
  kAbility.FullThrust,
  kAbility.HeavensThrust,
  kAbility.Disembowel,
  kAbility.SpiralBlow,
  kAbility.ChaosThrust,
  kAbility.ChaoticSpring,
  kAbility.WheelingThrust,
  kAbility.FangAndClaw,
  kAbility.Drakesbane,
  kAbility.DoomSpike,
  kAbility.DraconianFury,
  kAbility.SonicThrust,
  kAbility.CoerthanTorment,
  // NIN
  kAbility.SpinningEdge,
  kAbility.GustSlash,
  kAbility.AeolianEdge,
  kAbility.ArmorCrush,
  kAbility.DeathBlossom,
  kAbility.HakkeMujinsatsu,
  // SAM
  kAbility.Hakaze,
  kAbility.Gyofu,
  kAbility.Jinpu,
  kAbility.Gekko,
  kAbility.Shifu,
  kAbility.Kasha,
  kAbility.Yukikaze,
  kAbility.Fuga,
  kAbility.Mangetsu,
  kAbility.Oka,
  kAbility.MeikyoShisui,
  kAbility.Fuko,
  // RPR
  kAbility.Slice,
  kAbility.WaxingSlice,
  kAbility.InfernalSlice,
  kAbility.SpinningScythe,
  kAbility.NightmareScythe,
  // MCH
  kAbility.SplitShot,
  kAbility.SlugShot,
  kAbility.CleanShot,
  kAbility.HeatedSplitShot,
  kAbility.HeatedSlugShot,
  kAbility.HeatedCleanShot,
  kAbility.SpreadShot,
  kAbility.Scattergun,
  // DNC
  kAbility.Cascade,
  kAbility.Fountain,
  kAbility.Windmill,
  kAbility.Bladeshower,
];

export const kComboBreakers630 = [
  ...kComboBreakers,
];

export const kComboBreakers620 = [
  ...kComboBreakers630,
];

// (level = index) [Sub, Div]
// Reference: https://www.akhmorning.com/allagan-studies/modifiers/levelmods/
export const kLevelMod = [
  [0, 0],
  [56, 56],
  [57, 57],
  [60, 60],
  [62, 62],
  [65, 65],
  [68, 68],
  [70, 70],
  [73, 73],
  [76, 76],
  [78, 78],
  [82, 82],
  [85, 85],
  [89, 89],
  [93, 93],
  [96, 96],
  [100, 100],
  [104, 104],
  [109, 109],
  [113, 113],
  [116, 116],
  [122, 122],
  [127, 127],
  [133, 133],
  [138, 138],
  [144, 144],
  [150, 150],
  [155, 155],
  [162, 162],
  [168, 168],
  [173, 173],
  [181, 181],
  [188, 188],
  [194, 194],
  [202, 202],
  [209, 209],
  [215, 215],
  [223, 223],
  [229, 229],
  [236, 236],
  [244, 244],
  [253, 253],
  [263, 263],
  [272, 272],
  [283, 283],
  [292, 292],
  [302, 302],
  [311, 311],
  [322, 322],
  [331, 331],
  [341, 341], // lv50
  [342, 366],
  [344, 392],
  [345, 418],
  [346, 444],
  [347, 470],
  [349, 496],
  [350, 522],
  [351, 548],
  [352, 574],
  [354, 600], // lv60
  [355, 630],
  [356, 660],
  [357, 690],
  [358, 720],
  [359, 750],
  [360, 780],
  [361, 810],
  [362, 840],
  [363, 870],
  [364, 900], // lv70
  [365, 940],
  [366, 980],
  [367, 1020],
  [368, 1060],
  [370, 1100],
  [372, 1140],
  [374, 1180],
  [376, 1220],
  [378, 1260],
  [380, 1300], // lv80
  [382, 1360],
  [384, 1420],
  [386, 1480],
  [388, 1540],
  [390, 1600],
  [392, 1660],
  [394, 1720],
  [396, 1780],
  [398, 1840],
  [400, 1900], // lv90
  [402, 1988],
  [404, 2076],
  [406, 2164],
  [408, 2252],
  [410, 2340],
  [412, 2428],
  [414, 2516],
  [416, 2604],
  [418, 2692],
  [420, 2780], // lv100
] as const;
