// O12N - Alphascape 4.0
Options.Triggers.push({
  id: 'AlphascapeV40',
  zoneId: ZoneId.AlphascapeV40,
  timelineFile: 'o12n.txt',
  timelineTriggers: [
    {
      id: 'O12N Knockback',
      regex: /Discharger/,
      beforeSeconds: 5,
      response: Responses.knockback(),
    },
  ],
  triggers: [
    {
      id: 'O12N Solar Ray',
      type: 'StartsUsing',
      netRegex: { id: ['330F', '3310'], source: ['Omega', 'Omega-M'] },
      suppressSeconds: 1,
      response: Responses.tankCleave('alert'),
    },
    {
      id: 'O12N Optimized Blade Dance',
      type: 'StartsUsing',
      netRegex: { id: ['3321', '3322'], source: ['Omega', 'Omega-M'] },
      suppressSeconds: 1,
      response: Responses.tankBuster(),
    },
    {
      id: 'O12N Laser Shower',
      type: 'StartsUsing',
      netRegex: { id: ['3311', '3312'], source: ['Omega', 'Omega-M'], capture: false },
      suppressSeconds: 1,
      response: Responses.aoe(),
    },
    {
      id: 'O12N Cosmo Memory',
      type: 'StartsUsing',
      netRegex: { id: ['331C', '331D'], source: ['Omega', 'Omega-M'], capture: false },
      suppressSeconds: 1,
      response: Responses.bigAoe(),
    },
    {
      id: 'O12N Efficient Bladework',
      type: 'Ability',
      // 12.1 seconds after Subject Simulation M is an untelegraphed Efficient Bladework.
      netRegex: { id: '32F4', source: 'Omega-M', capture: false },
      delaySeconds: 8,
      response: Responses.getOut(),
    },
    {
      id: 'O12N Local Resonance',
      type: 'GainsEffect',
      netRegex: { target: 'Omega', effectId: '67E', capture: false },
      condition: (data) => data.role === 'tank',
      alertText: (_data, _matches, output) => output.text(),
      outputStrings: {
        text: {
          en: 'Move bosses apart',
          de: 'Bosse auseinander ziehen',
          fr: 'Déplacez les boss séparément',
          ja: 'ボスを引き離す',
          cn: '拉开boss',
          ko: '보스 서로 떨어뜨리기',
        },
      },
    },
    {
      id: 'O12N Optimized Meteor',
      type: 'HeadMarker',
      netRegex: { id: '0057' },
      condition: Conditions.targetIsYou(),
      response: Responses.meteorOnYou(),
    },
    {
      id: 'O12N Ground Zero',
      type: 'HeadMarker',
      netRegex: { id: '008B' },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.getOut(),
      run: (data, matches) => data.groundZero = matches.target,
      outputStrings: {
        getOut: {
          en: 'Get Out',
          de: 'Raus da',
          fr: 'Sortez',
          ja: '外へ',
          cn: '远离',
          ko: '파티에서 멀어지기',
        },
      },
    },
    {
      id: 'O12N Goo Instructions',
      type: 'HeadMarker',
      netRegex: { id: '008B', capture: false },
      delaySeconds: 8,
      infoText: (_data, _matches, output) => output.text(),
      run: (data) => delete data.groundZero,
      outputStrings: {
        text: {
          en: 'Knockback from F; Away from M',
          de: 'Rückstoß von F; Weg von M',
          fr: 'Poussée depuis F; Éloignez-vous de M',
          cn: '被女性击退; 远离男性',
          ko: 'F 넉백, M 광역기',
        },
      },
    },
    {
      id: 'O12N Stack Marker',
      type: 'HeadMarker',
      netRegex: { id: '003E' },
      delaySeconds: 0.3,
      infoText: (data, matches, output) => {
        if (data.me === data.groundZero)
          return;
        // TODO: Should this say something different during the blob phase,
        // since it's stack, but also get away from Ground Zero purple marker.
        if (data.me === matches.target)
          return output.stackOnYou();
        return output.stackOnPlayer({ player: data.ShortName(matches.target) });
      },
      outputStrings: {
        stackOnYou: Outputs.stackOnYou,
        stackOnPlayer: Outputs.stackOnPlayer,
      },
    },
    {
      id: 'O12N Optimized Fire III',
      type: 'HeadMarker',
      netRegex: { id: '0060' },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'O12N Packet Filter F',
      type: 'GainsEffect',
      netRegex: { effectId: '67D' },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.text(),
      outputStrings: {
        text: {
          en: 'Attack Omega-M',
          de: 'Omega-M angreifen',
          fr: 'Attaquez Oméga-M',
          ja: 'オメガMに攻撃',
          cn: '攻击男性',
          ko: '오메가 M 공격',
        },
      },
    },
    {
      id: 'O12N Packet Filter M',
      type: 'GainsEffect',
      netRegex: { effectId: '67C' },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.text(),
      outputStrings: {
        text: {
          en: 'Attack Omega-F',
          de: 'Omega-W angreifen',
          fr: 'Attaquez Oméga-F',
          ja: 'オメガFに攻撃',
          cn: '攻击女性',
          ko: '오메가 F 공격',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Calculations indicate increased probability of defeat':
          'Warnung. Erhöhte Wahrscheinlichkeit einer Niederlage',
        'Omega(?!-)': 'Omega',
        'Omega-M': 'Omega-M',
        'Optical Unit': 'Optikmodul',
        'Progress to party combat': 'Initiiere Gruppenkampf',
        '\\\\<blip\\\\> Warning\\\\\. Calculations indicate':
          '<biep> Warnung. Erhöhte Wahrscheinlichkeit',
      },
      'replaceText': {
        'Beyond Strength': 'Schildkombo G',
        'Cosmo Memory': 'Kosmospeicher',
        'Discharger': 'Entlader',
        'Efficient Bladework': 'Effiziente Klingenführung',
        'Electric Slide': 'Elektrosturz',
        'Firewall': 'Sicherungssystem',
        'Floodlight': 'Flutlicht',
        'Ground Zero': 'Explosionszentrum',
        'Laser Shower': 'Laserschauer',
        'Optical Laser': 'Optischer Laser F',
        'Optimized Blade Dance': 'Omega-Schwertertanz',
        'Optimized Blizzard III': 'Omega-Eisga',
        'Optimized Fire III': 'Omega-Feuga',
        'Optimized Meteor': 'Omega-Meteor',
        'Optimized Passage of Arms': 'Optimierter Waffengang',
        'Optimized Sagittarius Arrow': 'Omega-Choral der Pfeile',
        'Program Alpha': 'Alpha-Programm',
        'Resonance': 'Resonanz',
        'Solar Ray': 'Sonnenstrahl',
        'Spotlight': 'Scheinwerfer',
        'Subject Simulation F': 'Transformation W',
        'Subject Simulation M': 'Transformation M',
        'Superliminal Steel': 'Klingenkombo B',
        'Suppression': 'Hilfsprogramm F',
        'Synthetic Blades': 'Synthetische Klinge',
        'Synthetic Shield': 'Synthetischer Schild',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        '\\\\<blip\\\\> Warning\\\\\. Calculations indicate':
          'Alerte... Alerte... Forte augmentation',
        'Calculations indicate increased probability of defeat':
          'Forte augmentation des probabilités de défaite',
        'Omega(?!-)': 'Oméga',
        'Omega-M': 'Oméga-M',
        'Optical Unit': 'unité optique',
        'Progress to party combat': 'Limites du combat en solitaire atteintes',
      },
      'replaceText': {
        'Beyond Strength': 'Combo bouclier G',
        'Cosmo Memory': 'Cosmomémoire',
        'Discharger': 'Déchargeur',
        'Efficient Bladework': 'Lame active',
        'Electric Slide': 'Glissement Oméga',
        'Firewall': 'Programme protecteur',
        'Floodlight': 'Projecteur',
        'Ground Zero': 'Ruée féroce',
        'Laser Shower': 'Pluie de lasers',
        'Optical Laser': 'Laser optique F',
        'Optimized Blade Dance': 'Danse de la lame Oméga',
        'Optimized Blizzard III': 'Méga Glace Oméga',
        'Optimized Fire III': 'Méga Feu Oméga',
        'Optimized Meteor': 'Météore Oméga',
        'Optimized Passage of Arms': 'Passe d\'armes Oméga',
        'Optimized Sagittarius Arrow': 'Flèche du sagittaire Oméga',
        'Program Alpha': 'Programme Alpha',
        'Resonance': 'Résonance',
        'Solar Ray': 'Rayon solaire',
        'Spotlight': 'Phare',
        'Subject Simulation F': 'Transformation F',
        'Subject Simulation M': 'Simulation de sujet M',
        'Superliminal Steel': 'Combo lame B',
        'Suppression': 'Programme d\'assistance F',
        'Synthetic Blades': 'Lame optionnelle',
        'Synthetic Shield': 'Bouclier optionnel',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Omega(?!-)': 'オメガ',
        'Omega-M': 'オメガM',
        'Optical Unit': 'オプチカルユニット',
        'Progress to party combat': '単独戦闘による限界を確認',
        '\\\\<blip\\\\> Warning\\\\\. Calculations indicate': '警告……警告……敗北の危険性が上昇……',
      },
      'replaceText': {
        'Beyond Strength': 'シールドコンボG',
        'Cosmo Memory': 'コスモメモリー',
        'Discharger': 'ディスチャージャー',
        'Efficient Bladework': 'ソードアクション',
        'Electric Slide': 'オメガスライド',
        'Firewall': 'ガードプログラム',
        'Floodlight': 'フラッドライト',
        'Ground Zero': '急襲',
        'Laser Shower': 'レーザーシャワー',
        'Optical Laser': 'オプチカルレーザーF',
        'Optimized Blade Dance': 'ブレードダンス・オメガ',
        'Optimized Blizzard III': 'ブリザガ・オメガ',
        'Optimized Fire III': 'ファイラ・オメガ',
        'Optimized Meteor': 'メテオ・オメガ',
        'Optimized Passage of Arms': 'パッセージ・オブ・オメガ',
        'Optimized Sagittarius Arrow': 'サジタリウスアロー・オメガ',
        'Program Alpha': 'プログラム・アルファ',
        'Resonance': 'レゾナンス',
        'Solar Ray': 'ソーラレイ',
        'Spotlight': 'スポットライト',
        'Subject Simulation F': 'トランスフォームF',
        'Subject Simulation M': 'トランスフォームM',
        'Superliminal Steel': 'ブレードコンボB',
        'Suppression': '援護プログラムF',
        'Synthetic Blades': 'ブレードオプション',
        'Synthetic Shield': 'シールドオプション',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Calculations indicate increased probability of defeat': '警告……警告……失败的危险性上升……',
        'Omega(?!-)': '欧米茄',
        'Omega-M': '欧米茄M',
        'Optical Unit': '视觉组',
        'Progress to party combat': '确认到单独战斗的极限',
        '\\\\<blip\\\\> Warning\\\\\. Calculations indicate': '警告……警告……失败的危险性上升……',
      },
      'replaceText': {
        'Beyond Strength': '盾连击G',
        'Cosmo Memory': '宇宙记忆',
        'Discharger': '能量放出',
        'Efficient Bladework': '剑击',
        'Electric Slide': '欧米茄滑跃',
        'Firewall': '防御程序',
        'Floodlight': '泛光灯',
        'Ground Zero': '急袭',
        'Laser Shower': '激光骤雨',
        'Optical Laser': '光学射线F',
        'Optimized Blade Dance': '欧米茄刀光剑舞',
        'Optimized Blizzard III': '欧米茄冰封',
        'Optimized Fire III': '欧米茄烈炎',
        'Optimized Meteor': '欧米茄陨石流星',
        'Optimized Passage of Arms': '欧米茄通道',
        'Optimized Sagittarius Arrow': '欧米茄射手天箭',
        'Program Alpha': '程序·阿尔法',
        'Resonance': '共鸣',
        'Solar Ray': '太阳射线',
        'Spotlight': '聚光灯',
        'Subject Simulation F': '变形F',
        'Subject Simulation M': '变形M',
        'Superliminal Steel': '剑连击B',
        'Suppression': '援护程序F',
        'Synthetic Blades': '合成剑',
        'Synthetic Shield': '合成盾',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Omega(?!-)': '오메가',
        'Omega-M': '오메가 M',
        'Optical Unit': '광학 유닛',
        'Progress to party combat': '단독 전투 한계 확인',
        'Calculations indicate increased probability of defeat': '패배 위험성 상승',
        '\\\\<blip\\\\> Warning\\\\\. Calculations indicate': '패배 위험성 상승',
      },
      'replaceText': {
        'Beyond Strength': '방패 연격 G',
        'Cosmo Memory': '세계의 기억',
        'Discharger': '방출',
        'Efficient Bladework': '검격',
        'Electric Slide': '오메가 슬라이드',
        'Firewall': '방어 프로그램',
        'Floodlight': '투광 조명',
        'Ground Zero': '급습',
        'Laser Shower': '레이저 세례',
        'Optical Laser': '광학 레이저 F',
        'Optimized Blade Dance': '쾌검난무: 오메가',
        'Optimized Blizzard III': '블리자가: 오메가',
        'Optimized Fire III': '파이라: 오메가',
        'Optimized Meteor': '메테오: 오메가',
        'Optimized Passage of Arms': '오메가의 결의',
        'Optimized Sagittarius Arrow': '궁수자리 화살: 오메가',
        'Program Alpha': '프로그램 알파',
        'Resonance': '공명',
        'Solar Ray': '태양 광선',
        'Spotlight': '집중 조명',
        'Subject Simulation F': '형태 변경 F',
        'Subject Simulation M': '형태 변경 M',
        'Superliminal Steel': '칼날 연격 B',
        'Suppression': '지원 프로그램 F',
        'Synthetic Blades': '칼날 장착',
        'Synthetic Shield': '방패 장착',
      },
    },
  ],
});