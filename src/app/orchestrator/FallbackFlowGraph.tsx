import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Edge,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MessageSquare, CheckCircle, Network, Image as ImageIcon, Zap, Layers } from 'lucide-react';

const CustomNode = ({ data }: { data: any }) => {
  return (
    <div className={`px-4 py-3 shadow-lg rounded-xl border-2 flex flex-col items-center gap-2 min-w-[180px] backdrop-blur-sm
      ${data.tier === 1 ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''}
      ${data.tier === 2 ? 'bg-blue-900/40 border-blue-500/50 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : ''}
      ${data.tier === 3 ? 'bg-amber-900/40 border-amber-500/50 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : ''}
      ${data.tier === 4 ? 'bg-rose-900/40 border-rose-500/50 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : ''}
      ${data.tier === 5 ? 'bg-purple-900/40 border-purple-500/50 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : ''}
      ${data.tier === 0 ? 'bg-neutral-800/80 border-neutral-600/50 text-neutral-200' : ''}
    `}>
      {data.id !== 'input' && <Handle type="target" position={Position.Left} className="!bg-neutral-500" />}
      <div className="flex items-center gap-2">
        {data.icon}
        <span className="font-bold text-sm">{data.label}</span>
      </div>
      <span className="text-[10px] uppercase font-mono opacity-70 bg-black/40 px-2 py-0.5 rounded">
        {data.subLabel}
      </span>
      {data.id !== 'gen' && <Handle type="source" position={Position.Right} className="!bg-neutral-500" />}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes = [
  { id: 'input', type: 'custom', position: { x: 50, y: 200 }, data: { id: 'input', label: 'Incoming Query', subLabel: 'Studio / CLI', tier: 0, icon: <MessageSquare className="w-4 h-4 text-neutral-400" /> } },
  { id: 't1', type: 'custom', position: { x: 300, y: 200 }, data: { id: 't1', label: 'Exact Match', subLabel: 'Tier 1', tier: 1, icon: <CheckCircle className="w-4 h-4 text-emerald-400" /> } },
  { id: 't2', type: 'custom', position: { x: 550, y: 200 }, data: { id: 't2', label: 'Parent Fallback', subLabel: 'Tier 2', tier: 2, icon: <Layers className="w-4 h-4 text-blue-400" /> } },
  { id: 't3', type: 'custom', position: { x: 800, y: 200 }, data: { id: 't3', label: 'Semantic Hub', subLabel: 'Tier 3', tier: 3, icon: <Network className="w-4 h-4 text-amber-400" /> } },
  { id: 't4', type: 'custom', position: { x: 1050, y: 200 }, data: { id: 't4', label: 'Root Image Trigger', subLabel: 'Tier 4', tier: 4, icon: <ImageIcon className="w-4 h-4 text-rose-400" /> } },
  { id: 'gen', type: 'custom', position: { x: 1300, y: 200 }, data: { id: 'gen', label: 'AI Generator Worker', subLabel: 'Fallback Gen', tier: 5, icon: <Zap className="w-4 h-4 text-purple-400" /> } },
];

const initialEdges: Edge[] = [
  { id: 'e-in-t1', source: 'input', target: 't1', animated: false, style: { stroke: '#525252' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#525252' } },
  { id: 'e-t1-t2', source: 't1', target: 't2', animated: false, style: { stroke: '#525252' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#525252' } },
  { id: 'e-t2-t3', source: 't2', target: 't3', animated: false, style: { stroke: '#525252' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#525252' } },
  { id: 'e-t3-t4', source: 't3', target: 't4', animated: false, style: { stroke: '#525252' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#525252' } },
  { id: 'e-t4-gen', source: 't4', target: 'gen', animated: false, style: { stroke: '#525252' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#525252' } },
];

export default function FallbackFlowGraph({ traces }: { traces: any[] }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  // Update edge animations based on the latest trace
  useEffect(() => {
    if (Array.isArray(traces) && traces.length > 0) {
      const latestTrace = traces[0]; // traces are ordered by newest first
      const tier = latestTrace.resolutionTier || (latestTrace.isGenTriggered ? 5 : 0);
      
      const newEdges = initialEdges.map(edge => {
        let isActive = false;
        let color = '#525252';

        // Logic: if tier is 3, then it passed through t1, t2, t3. So edges up to t3 are active.
        if (edge.id === 'e-in-t1') { isActive = true; color = '#10b981'; } // Emerald
        if (edge.id === 'e-t1-t2' && tier > 1) { isActive = true; color = '#3b82f6'; } // Blue
        if (edge.id === 'e-t2-t3' && tier > 2) { isActive = true; color = '#f59e0b'; } // Amber
        if (edge.id === 'e-t3-t4' && tier > 3) { isActive = true; color = '#f43f5e'; } // Rose
        if (edge.id === 'e-t4-gen' && latestTrace.isGenTriggered) { isActive = true; color = '#a855f7'; } // Purple

        return {
          ...edge,
          animated: isActive,
          style: { stroke: color, strokeWidth: isActive ? 2 : 1 },
          markerEnd: { type: MarkerType.ArrowClosed, color: color },
        };
      });
      setEdges(newEdges);
    }
  }, [traces, setEdges]);

  return (
    <div style={{ width: '100%', height: '200px' }} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitView
        colorMode="dark"
        minZoom={0.5}
        maxZoom={1.5}
        panOnScroll={false}
        zoomOnScroll={false}
        nodesDraggable={false}
      >
        <Background gap={16} size={1} color="#333" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
