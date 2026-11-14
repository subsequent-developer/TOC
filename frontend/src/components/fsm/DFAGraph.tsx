import { useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DFANode } from './DFANode';
import { buildDFANodes, buildDFAEdges } from '../../lib/fsmGraph';
import type { AnalysisRecord } from '../../types/analysis';

const nodeTypes: NodeTypes = { dfaNode: DFANode as never };

interface DFAGraphProps {
  traceResult?: AnalysisRecord | null;
  activeStep?: number;
  customActiveState?: string;
  customErrorState?: string;
  customHighlightedEdges?: Set<string>;
  className?: string;
}

export function DFAGraph({
  traceResult,
  activeStep,
  customActiveState,
  customErrorState,
  customHighlightedEdges,
  className,
}: DFAGraphProps) {
  // Determine which state is active and which has an error
  const activeState = useMemo(() => {
    if (customActiveState !== undefined) return customActiveState;
    if (!traceResult) return undefined;
    if (activeStep !== undefined) return undefined;
    return traceResult.fsm_evaluation.final_state;
  }, [traceResult, activeStep, customActiveState]);

  const errorState = useMemo(() => {
    if (customErrorState !== undefined) return customErrorState;
    if (!traceResult) return undefined;
    const err = traceResult.fsm_evaluation.error;
    if (!err) return undefined;
    return err.state_at_failure;
  }, [traceResult, customErrorState]);

  // Highlighted edges (the path taken)
  const highlightedEdges = useMemo(() => {
    if (customHighlightedEdges !== undefined) return customHighlightedEdges;
    if (!traceResult) return undefined;
    const err = traceResult.fsm_evaluation.error;
    if (err) {
      return new Set([`${err.state_at_failure}:${err.failed_event}`]);
    }
    return undefined;
  }, [traceResult, customHighlightedEdges]);

  const initialNodes = useMemo(() => buildDFANodes(activeState, errorState), [activeState, errorState]);
  const initialEdges = useMemo(() => buildDFAEdges(highlightedEdges), [highlightedEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state when props change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.4}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-gray-50 dark:bg-gray-950 rounded-xl"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#374151"
          className="opacity-30"
        />
        <Controls
          className="[&>button]:bg-white dark:[&>button]:bg-gray-800 [&>button]:border-gray-200 dark:[&>button]:border-gray-700"
        />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as { nodeType: string };
            if (data.nodeType === 'initial') return '#3b82f6';
            if (data.nodeType === 'terminal') return '#10b981';
            return '#6366f1';
          }}
          className="!bg-gray-100 dark:!bg-gray-900 !border-gray-200 dark:!border-gray-800"
        />
      </ReactFlow>
    </div>
  );
}
