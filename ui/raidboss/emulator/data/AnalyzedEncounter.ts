import { UnreachableCode } from '../../../../resources/not_reached';
import Util from '../../../../resources/util';
import { LooseTrigger } from '../../../../types/trigger';
import raidbossFileData from '../../data/raidboss_manifest.txt';
import { PopupTextGenerator, TriggerHelper } from '../../popup-text';
import { RaidbossOptions } from '../../raidboss_options';
import { TimelineLoader } from '../../timeline';
import EmulatorCommon, { DataType } from '../EmulatorCommon';
import EventBus from '../EventBus';
import RaidEmulatorAnalysisTimelineUI from '../overrides/RaidEmulatorAnalysisTimelineUI';
import RaidEmulatorPopupText from '../overrides/RaidEmulatorPopupText';
import RaidEmulatorTimelineController from '../overrides/RaidEmulatorTimelineController';
import RaidEmulatorWatchCombatantsOverride from '../overrides/RaidEmulatorWatchCombatantsOverride';

import Combatant from './Combatant';
import Encounter from './Encounter';
import LineEvent from './network_log_converter/LineEvent';
import PopupTextAnalysis, { LineRegExpCache, Resolver, ResolverStatus } from './PopupTextAnalysis';
import RaidEmulator from './RaidEmulator';

export type PerspectiveTrigger = {
  triggerHelper: TriggerHelper;
  status: ResolverStatus;
  logLine: LineEvent;
  resolvedOffset: number;
};
type Perspective = {
  initialData: DataType;
  triggers: PerspectiveTrigger[];
  finalData?: DataType;
};
type Perspectives = { [id: string]: Perspective };

export default class AnalyzedEncounter extends EventBus {
  perspectives: Perspectives = {};
  constructor(
    public options: RaidbossOptions,
    public encounter: Encounter,
    public emulator: RaidEmulator,
    public watchCombatantsOverride: RaidEmulatorWatchCombatantsOverride,
  ) {
    super();
  }

  selectPerspective(id: string, popupText: PopupTextAnalysis | RaidEmulatorPopupText): void {
    if (this.encounter.combatantTracker) {
      const selectedPartyMember = this.encounter.combatantTracker.combatants[id];
      if (!selectedPartyMember)
        return;

      popupText?.getPartyTracker().onPartyChanged({
        party: this.encounter.combatantTracker.partyMembers.map((id) => {
          const partyMember = this.encounter?.combatantTracker?.combatants[id];
          if (!partyMember)
            throw new UnreachableCode();
          const initState = partyMember.nextState(0);
          return {
            id: id,
            worldId: 0,
            name: initState.Name ?? '',
            job: initState.Job ?? 0,
            inParty: true,
          };
        }),
      });
      this.updateState(selectedPartyMember, this.encounter.startTimestamp, popupText);
      popupText?.OnChangeZone({
        type: 'ChangeZone',
        zoneName: this.encounter.encounterZoneName,
        zoneID: parseInt(this.encounter.encounterZoneId, 16),
      });
    }
  }

  updateState(
    combatant: Combatant,
    timestamp: number,
    popupText: PopupTextAnalysis | RaidEmulatorPopupText,
  ): void {
    const state = combatant.getState(timestamp);
    const job = state.Job;
    if (!job)
      throw new UnreachableCode();
    popupText?.OnPlayerChange({
      detail: {
        id: state.ID ?? 0,
        name: state.Name ?? '',
        job: Util.jobEnumToJob(job),
        level: state.Level ?? 0,
        currentHP: state.CurrentHP,
        maxHP: state.MaxHP,
        currentMP: state.CurrentMP,
        maxMP: state.MaxMP,
        currentCP: 0,
        maxCP: 0,
        currentGP: 0,
        maxGP: 0,
        currentShield: 0,
        jobDetail: null,
        pos: {
          x: state.PosX,
          y: state.PosY,
          z: state.PosZ,
        },
        rotation: state.Heading,
        bait: 0,
        debugJob: '',
      },
    });
  }

  checkPartyMember(id: string): boolean {
    const partyMember = this.encounter.combatantTracker?.combatants[id];

    if (!partyMember)
      return false;

    const initState = partyMember?.nextState(0);

    if (initState.Job === 0) {
      this.perspectives[id] = {
        initialData: {},
        triggers: [],
      };
      return false;
    }

    return true;
  }

  async analyze(): Promise<void> {
    const regexCache: LineRegExpCache = new Map();

    if (this.encounter.combatantTracker) {
      const partyMembers = this.encounter.combatantTracker.partyMembers;
      const batchSize = 24;

      for (let i = 0; i < partyMembers.length; i += batchSize) {
        const batch = partyMembers.slice(i, i + batchSize);
        await this.analyzeFor(batch, regexCache);
      }
    }

    return this.dispatch('analyzed');
  }

  async analyzeFor(partyMembers: string[], regexCache: LineRegExpCache): Promise<void> {
    let currentLogIndex = 0;

    const getCurLogLine = (): LineEvent => {
      const line = this.encounter.logLines[currentLogIndex];
      if (!line)
        throw new UnreachableCode();
      return line;
    };

    const validPartyMembers = partyMembers.filter((id) => this.checkPartyMember(id));

    const timelineUI = new RaidEmulatorAnalysisTimelineUI(this.options);
    const timelineController = new RaidEmulatorTimelineController(
      this.options,
      timelineUI,
      raidbossFileData,
    );
    timelineController.bindTo(this.emulator);

    type PlayerContext = {
      popupText: PopupTextAnalysis;
      id: string;
    };

    const partyContext: PlayerContext[] = validPartyMembers.map((id) => {
      const popupText = new PopupTextAnalysis(
        this.options,
        new TimelineLoader(timelineController),
        raidbossFileData,
        regexCache,
      );

      const generator = new PopupTextGenerator(popupText);
      timelineUI.SetPopupTextInterface(generator);

      timelineController.SetPopupTextInterface(generator);

      if (timelineController.activeTimeline?.ui) {
        timelineController.activeTimeline.ui.OnTrigger = (trigger: LooseTrigger, matches) => {
          const currentLine = this.encounter.logLines[currentLogIndex];
          if (!currentLine)
            throw new UnreachableCode();

          const resolver = popupText.currentResolver = new Resolver({
            initialData: EmulatorCommon.cloneData(popupText.getData()),
            suppressed: false,
            executed: false,
          });
          resolver.triggerHelper = popupText._onTriggerInternalGetHelper(
            trigger,
            matches?.groups ?? {},
            currentLine?.timestamp,
          );
          popupText.triggerResolvers.push(resolver);

          popupText.OnTrigger(trigger, matches, currentLine.timestamp);

          resolver.setFinal(() => {
            // Get the current log line when the callback is executed instead of the line
            // when the trigger initially fires
            const resolvedLine = getCurLogLine();
            resolver.status.finalData = EmulatorCommon.cloneData(popupText.getData());
            delete resolver.triggerHelper?.resolver;
            if (popupText.callback) {
              popupText.callback(
                resolvedLine,
                resolver.triggerHelper,
                resolver.status,
                popupText.getData(),
              );
            }
          });
        };
      }

      popupText.callback = (log, triggerHelper, currentTriggerStatus) => {
        const perspective = this.perspectives[id];
        if (!perspective || !triggerHelper)
          throw new UnreachableCode();

        perspective.triggers.push({
          triggerHelper: triggerHelper,
          status: currentTriggerStatus,
          logLine: log,
          resolvedOffset: log.timestamp - this.encounter.startTimestamp,
        });
      };
      popupText.triggerResolvers = [];

      this.selectPerspective(id, popupText);

      return {
        popupText: popupText,
        id: id,
      };
    });

    for (const ctx of partyContext) {
      const popupText = ctx.popupText;
      const id = ctx.id;

      this.perspectives[id] = {
        initialData: EmulatorCommon.cloneData(popupText.getData(), []),
        triggers: [],
        finalData: popupText.getData(),
      };
    }

    for (; currentLogIndex < this.encounter.logLines.length; ++currentLogIndex) {
      const log = this.encounter.logLines[currentLogIndex];
      if (!log)
        throw new UnreachableCode();
      await this.dispatch('analyzeLine', log);

      for (const ctx of partyContext) {
        const popupText = ctx.popupText;
        const id = ctx.id;

        const combatant = this.encounter?.combatantTracker?.combatants[id];

        if (combatant && combatant.hasState(log.timestamp)) {
          this.updateState(combatant, log.timestamp, popupText);
        }

        await popupText.onEmulatorLog([log], getCurLogLine);
      }

      this.watchCombatantsOverride.tick(log.timestamp);
      timelineController.onEmulatorLogEvent([log]);
    }

    this.watchCombatantsOverride.clear();
    timelineUI.stop();
  }
}
