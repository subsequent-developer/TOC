import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  CheckCircle,
  AlertTriangle,
  Layers,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { DFAGraph } from '../components/fsm/DFAGraph';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  FSM_STATES,
  FSM_EVENTS,
  INITIAL_STATE,
  TERMINAL_STATES,
  TRANSITION_TABLE,
  EXAMPLE_TRACES,
} from '../lib/constants';
import { cn } from '../components/ui/Card';

interface StepHistory {
  step: number;
  fromState: string;
  event: string;
  toState: string;
  isValid: boolean;
  errorType?: string;
  message?: string;
}

export function DFAExplorer() {
  const [selectedExample, setSelectedExample] = useState(EXAMPLE_TRACES[0].sequence);
  const [customSequence, setCustomSequence] = useState(EXAMPLE_TRACES[0].sequence);
  const [events, setEvents] = useState<string[]>(EXAMPLE_TRACES[0].sequence.split(';'));

  // Simulation execution state
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1); // -1 = initial state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step
  const timerRef = useRef<number | null>(null);

  // Synchronize events when custom sequence or example changes
  const applySequence = (seq: string) => {
    setCustomSequence(seq);
    const parsed = seq.split(';').map((s) => s.trim()).filter(Boolean);
    setEvents(parsed);
    setCurrentStepIndex(-1);
    setIsPlaying(false);
  };

  // Compute full step simulation history
  const simulationHistory: StepHistory[] = [];
  let currState = INITIAL_STATE;
  let hasFailed = false;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    if (hasFailed) break;

    // Check 1: Terminal violation
    if (TERMINAL_STATES.has(currState)) {
      simulationHistory.push({
        step: i + 1,
        fromState: currState,
        event,
        toState: currState,
        isValid: false,
        errorType: 'TERMINAL_STATE_VIOLATION',
        message: `Order is already in terminal state '${currState}'. Further events are strictly rejected.`,
      });
      hasFailed = true;
      break;
    }

    // Check 2: Alphabet membership
    if (!FSM_EVENTS.includes(event as any)) {
      simulationHistory.push({
        step: i + 1,
        fromState: currState,
        event,
        toState: currState,
        isValid: false,
        errorType: 'UNKNOWN_EVENT',
        message: `Event '${event}' is not in alphabet Σ.`,
      });
      hasFailed = true;
      break;
    }

    // Check 3: Transition table
    const nextState = TRANSITION_TABLE[`${currState}:${event}`];
    if (!nextState) {
      simulationHistory.push({
        step: i + 1,
        fromState: currState,
        event,
        toState: currState,
        isValid: false,
        errorType: 'INVALID_TRANSITION',
        message: `Event '${event}' is undefined and illegal from state '${currState}'.`,
      });
      hasFailed = true;
      break;
    }

    simulationHistory.push({
      step: i + 1,
      fromState: currState,
      event,
      toState: nextState,
      isValid: true,
      message: `State transitioned from ${currState} to ${nextState} on ${event}.`,
    });
    currState = nextState;
  }

  // Active state at current playback step
  const activeState =
    currentStepIndex === -1
      ? INITIAL_STATE
      : currentStepIndex < simulationHistory.length
      ? simulationHistory[currentStepIndex].isValid
        ? simulationHistory[currentStepIndex].toState
        : simulationHistory[currentStepIndex].fromState
      : INITIAL_STATE;

  const errorState =
    currentStepIndex >= 0 &&
    currentStepIndex < simulationHistory.length &&
    !simulationHistory[currentStepIndex].isValid
      ? simulationHistory[currentStepIndex].fromState
      : undefined;

  const highlightedEdges = new Set<string>();
  if (currentStepIndex >= 0 && currentStepIndex < simulationHistory.length) {
    const step = simulationHistory[currentStepIndex];
    if (step.isValid) {
      highlightedEdges.add(`${step.fromState}:${step.event}`);
    }
  }

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev + 1 < simulationHistory.length) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, simulationHistory.length]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <span>DFA Explorer & State Machine</span>
            <span className="text-xs bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full font-mono">
              Q=8, Σ=8, δ=11
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Interactive visualization and step-by-step playback of the deterministic workflow automaton
          </p>
        </div>

        {/* Playback speed selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Speed:</span>
          {[
            { label: '0.5x', ms: 1600 },
            { label: '1x', ms: 1000 },
            { label: '2x', ms: 500 },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setPlaybackSpeed(s.ms)}
              className={cn(
                'px-2.5 py-1 text-xs rounded-lg font-medium transition-all',
                playbackSpeed === s.ms
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Simulator Controls & Graph View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Trace input & Stepper controls */}
        <div className="lg:col-span-1 space-y-4">
          <Card padding="md" className="space-y-4">
            <h2 className="section-title text-base flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-500" />
              Trace Simulator
            </h2>

            {/* Quick Presets */}
            <div>
              <label className="label-base">Preset Traces</label>
              <select
                className="select-base text-xs"
                value={selectedExample}
                onChange={(e) => {
                  setSelectedExample(e.target.value);
                  applySequence(e.target.value);
                }}
              >
                {EXAMPLE_TRACES.map((ex) => (
                  <option key={ex.label} value={ex.sequence}>
                    {ex.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Input */}
            <div>
              <label className="label-base">Active Event Sequence</label>
              <textarea
                value={customSequence}
                onChange={(e) => applySequence(e.target.value)}
                rows={3}
                className="textarea-base"
                placeholder="CONFIRM_PAYMENT;PACK_ITEMS;SHIP_ITEMS;DELIVER_ITEMS"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Edit sequence directly using semicolons as delimiters.
              </p>
            </div>

            {/* Playback Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex(-1);
                  }}
                  title="Reset to initial state"
                  icon={<RotateCcw size={14} />}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentStepIndex <= -1}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex((prev) => Math.max(-1, prev - 1));
                  }}
                  title="Step back"
                  icon={<SkipBack size={14} />}
                />
                <Button
                  variant={isPlaying ? 'danger' : 'primary'}
                  size="sm"
                  onClick={() => {
                    if (currentStepIndex >= simulationHistory.length - 1) {
                      setCurrentStepIndex(-1);
                    }
                    setIsPlaying(!isPlaying);
                  }}
                  icon={isPlaying ? <Pause size={14} /> : <Play size={14} />}
                >
                  {isPlaying ? 'Pause' : currentStepIndex >= simulationHistory.length - 1 ? 'Replay' : 'Play'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentStepIndex >= simulationHistory.length - 1}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex((prev) => Math.min(simulationHistory.length - 1, prev + 1));
                  }}
                  title="Step forward"
                  icon={<SkipForward size={14} />}
                />
              </div>

              <span className="text-xs font-mono text-gray-500">
                Step {currentStepIndex + 1} / {simulationHistory.length}
              </span>
            </div>

            {/* Current Step Status Card */}
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Automaton State:</span>
                <span
                  className={cn(
                    'font-mono font-bold px-2 py-0.5 rounded',
                    errorState
                      ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                      : TERMINAL_STATES.has(activeState)
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  )}
                >
                  {activeState}
                </span>
              </div>

              {currentStepIndex >= 0 && currentStepIndex < simulationHistory.length && (
                <div className="text-xs space-y-1 pt-1 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Event Evaluated:</span>
                    <code className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                      {simulationHistory[currentStepIndex].event}
                    </code>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                    {simulationHistory[currentStepIndex].isValid ? (
                      <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
                    ) : (
                      <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />
                    )}
                    <span
                      className={
                        simulationHistory[currentStepIndex].isValid
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400 font-medium'
                      }
                    >
                      {simulationHistory[currentStepIndex].message}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Step Progression Timeline */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                Trace Step Log
              </p>
              {simulationHistory.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No events in sequence</p>
              ) : (
                simulationHistory.map((step, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStepIndex(idx);
                    }}
                    className={cn(
                      'w-full text-left p-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between',
                      currentStepIndex === idx
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                    )}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-[10px] opacity-75">#{step.step}</span>
                      <span className="font-bold truncate">{step.event}</span>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded font-sans uppercase font-bold',
                        step.isValid
                          ? currentStepIndex === idx
                            ? 'bg-indigo-700 text-white'
                            : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                          : currentStepIndex === idx
                          ? 'bg-red-800 text-white'
                          : 'text-red-600 bg-red-50 dark:bg-red-950/40'
                      )}
                    >
                      {step.isValid ? 'Valid' : 'Error'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right column: Interactive React Flow Graph */}
        <div className="lg:col-span-2">
          <Card padding="none" className="h-[620px] flex flex-col overflow-hidden relative">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 z-10">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Interactive DFA Canvas
                </span>
                <span className="text-xs text-gray-400">
                  (Zoom, Pan, Drag nodes & inspect states)
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-gray-500">Initial</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-gray-500">Intermediate</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-gray-500">Terminal</span>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full h-full relative">
              <DFAGraph
                customActiveState={activeState}
                customErrorState={errorState}
                customHighlightedEdges={highlightedEdges}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Formal Automata Grammar Reference Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* State Space & Alphabet */}
        <Card padding="md" className="space-y-3">
          <h3 className="section-title text-base flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-500" />
            Formal Automaton Alphabet & States
          </h3>

          <div className="space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>State Space $Q$ (8 states):</strong>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {FSM_STATES.map((s) => (
                <span
                  key={s}
                  className={cn(
                    'text-xs font-mono px-2 py-0.5 rounded border font-medium',
                    s === INITIAL_STATE
                      ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                      : TERMINAL_STATES.has(s)
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
                  )}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>Input Alphabet $\Sigma$ (8 discrete events):</strong>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {FSM_EVENTS.map((e) => (
                <span
                  key={e}
                  className="text-xs font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Transition Table */}
        <Card padding="md" className="space-y-3">
          <h3 className="section-title text-base flex items-center gap-2">
            <Layers size={16} className="text-indigo-500" />
            Partial Transition Function $\delta: Q \times \Sigma \rightharpoonup Q$
          </h3>

          <div className="overflow-x-auto max-h-56">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 text-left">
                  <th className="pb-1">From State</th>
                  <th className="pb-1">Event ($\Sigma$)</th>
                  <th className="pb-1">Next State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {Object.entries(TRANSITION_TABLE).map(([key, next]) => {
                  const [from, ev] = key.split(':');
                  return (
                    <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="py-1 text-gray-700 dark:text-gray-300">{from}</td>
                      <td className="py-1 text-indigo-600 dark:text-indigo-400 font-semibold">{ev}</td>
                      <td className="py-1 text-emerald-600 dark:text-emerald-400 font-semibold">{next}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
