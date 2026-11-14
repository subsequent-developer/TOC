import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { getAllowedEvents, INITIAL_STATE, TERMINAL_STATES, TRANSITION_TABLE, EXAMPLE_TRACES } from '../../lib/constants';
import { cn } from '../ui/Card';

interface EventSequenceBuilderProps {
  value: string[];
  onChange: (events: string[]) => void;
}

const EVENT_COLORS: Record<string, string> = {
  CONFIRM_PAYMENT:  'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
  FAIL_PAYMENT:     'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
  RETRY_PAYMENT:    'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
  CANCEL_ORDER:     'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  PACK_ITEMS:       'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700',
  SHIP_ITEMS:       'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
  DELIVER_ITEMS:    'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700',
  REFUND_ORDER:     'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700',
};

function computeCurrentState(events: string[]): { state: string; isTerminal: boolean } {
  let state = INITIAL_STATE;
  for (const event of events) {
    const next = TRANSITION_TABLE[`${state}:${event}`];
    if (!next) return { state, isTerminal: false }; // invalid
    state = next;
  }
  return { state, isTerminal: TERMINAL_STATES.has(state) };
}

export function EventSequenceBuilder({ value, onChange }: EventSequenceBuilderProps) {
  const { state: currentState, isTerminal } = computeCurrentState(value);
  const allowedEvents = isTerminal ? [] : getAllowedEvents(currentState);

  const addEvent = useCallback(
    (event: string) => {
      onChange([...value, event]);
    },
    [value, onChange]
  );

  const removeEvent = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  const reset = useCallback(() => onChange([]), [onChange]);

  const loadExample = (seq: string) => {
    onChange(seq.split(';').filter(Boolean));
  };

  return (
    <div className="space-y-4">
      {/* Example quick-fills */}
      <div>
        <label className="label-base">Quick Examples</label>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_TRACES.map(({ label, sequence }) => (
            <button
              key={label}
              type="button"
              onClick={() => loadExample(sequence)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-colors font-medium"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Current FSM state indicator */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500 dark:text-gray-400">Current FSM state:</span>
        <code
          className={cn(
            'px-2 py-0.5 rounded font-mono font-bold',
            isTerminal
              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
              : value.length === 0
              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
              : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
          )}
        >
          {currentState}
        </code>
        {isTerminal && (
          <span className="text-emerald-500 text-xs font-medium">✓ Terminal</span>
        )}
      </div>

      {/* Event sequence display */}
      <div>
        <label className="label-base">Event Sequence ({value.length} events)</label>
        <div className="min-h-[60px] p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-wrap gap-1.5 items-center">
          {value.length === 0 ? (
            <span className="text-sm text-gray-400 dark:text-gray-500 italic">
              Add events below or click an example above…
            </span>
          ) : (
            <AnimatePresence>
              {value.map((event, i) => (
                <motion.div
                  key={`${event}-${i}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-mono font-medium',
                    EVENT_COLORS[event] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  )}
                >
                  <span className="text-[9px] opacity-60 mr-0.5">{i + 1}.</span>
                  {event}
                  <button
                    type="button"
                    onClick={() => removeEvent(i)}
                    className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Add event buttons */}
      <div>
        <label className="label-base">
          {isTerminal
            ? 'No events allowed (terminal state)'
            : allowedEvents.length > 0
            ? 'Allowed next events (FSM-valid)'
            : 'Invalid trace state — reset to continue'}
        </label>
        <div className="flex flex-wrap gap-2">
          {allowedEvents.map((event) => (
            <button
              key={event}
              type="button"
              onClick={() => addEvent(event)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-mono font-semibold transition-all hover:scale-105 active:scale-95',
                EVENT_COLORS[event] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
              )}
            >
              <Plus size={11} />
              {event}
            </button>
          ))}
          {!isTerminal && allowedEvents.length === 0 && (
            <p className="text-xs text-red-500 italic">Trace is in an invalid state</p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          icon={<RotateCcw size={13} />}
          onClick={reset}
          disabled={value.length === 0}
        >
          Reset
        </Button>
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto font-mono">
          {value.join(';') || '(empty)'}
        </span>
      </div>
    </div>
  );
}
