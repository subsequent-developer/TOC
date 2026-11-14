import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '../ui/Card';
import type { DFANodeData } from '../../lib/fsmGraph';

function DFANodeComponent({ data, selected }: NodeProps<Node<DFANodeData>>) {
  const { label, nodeType, isActive, isError } = data;

  const baseClass = cn(
    'px-4 py-3 rounded-xl border-2 shadow-lg min-w-[160px] text-center transition-all duration-300',
    isError
      ? 'border-red-400 bg-red-900 text-white dfa-node-error'
      : isActive
      ? 'border-yellow-400 text-white dfa-node-active'
      : nodeType === 'initial'
      ? 'border-blue-400 bg-gradient-to-br from-blue-600 to-blue-800 text-white'
      : nodeType === 'terminal'
      ? 'border-emerald-400 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white'
      : 'border-indigo-400 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white',
    Boolean(selected) && 'ring-2 ring-yellow-400 ring-offset-1'
  );

  return (
    <div className={baseClass}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0.6 }} />

      {/* Node type badge */}
      <div className="flex justify-center mb-1.5">
        {nodeType === 'initial' && (
          <span className="text-[9px] bg-blue-400/30 border border-blue-300/50 text-blue-100 px-1.5 py-0.5 rounded-full font-semibold tracking-wide">
            INITIAL q₀
          </span>
        )}
        {nodeType === 'terminal' && (
          <span className="text-[9px] bg-emerald-400/30 border border-emerald-300/50 text-emerald-100 px-1.5 py-0.5 rounded-full font-semibold tracking-wide">
            TERMINAL ✓
          </span>
        )}
        {nodeType === 'intermediate' && (
          <span className="text-[9px] bg-indigo-400/30 border border-indigo-300/50 text-indigo-100 px-1.5 py-0.5 rounded-full font-semibold tracking-wide">
            STATE
          </span>
        )}
      </div>

      {/* State name */}
      <div
        className="font-mono font-bold text-xs leading-snug break-all"
        style={{ wordBreak: 'break-word' }}
      >
        {label.replace(/_/g, '_\u200B')}
      </div>

      {/* Active indicator */}
      {isActive && !isError && (
        <div className="mt-1.5 flex justify-center">
          <span className="flex items-center gap-1 text-[9px] bg-yellow-400/20 border border-yellow-300/50 text-yellow-200 px-1.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            ACTIVE
          </span>
        </div>
      )}
      {isError && (
        <div className="mt-1.5 flex justify-center">
          <span className="text-[9px] bg-red-400/30 border border-red-300/50 text-red-100 px-1.5 py-0.5 rounded-full">
            ❌ ERROR HERE
          </span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0.6 }} />
    </div>
  );
}

export const DFANode = memo(DFANodeComponent);
