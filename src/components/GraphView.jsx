import React, { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ObjectNode from './nodes/ObjectNode';
import ArrayNode from './nodes/ArrayNode';
import PrimitiveNode from './nodes/PrimitiveNode';

const nodeTypes = {
  objectNode: ObjectNode,
  arrayNode: ArrayNode,
  primitiveNode: PrimitiveNode,
};

const GraphView = ({ 
  initialNodes = [], 
  initialEdges = [],
  onToggleExpand,
  highlightedNodes = [],
  searchResults = [],
  currentResultIndex = 0,
  reactFlowInstanceRef,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when initialNodes change
  React.useEffect(() => {
    setNodes(initialNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onToggleExpand: (nodeData) => onToggleExpand?.(node.id, nodeData),
      },
      className: highlightedNodes.includes(node.id) ? 'highlighted' : '',
    })));
  }, [initialNodes, onToggleExpand, highlightedNodes, setNodes]);

  // Update edges when initialEdges change
  React.useEffect(() => {
    setEdges(initialEdges.map(edge => ({
      ...edge,
      type: 'smoothstep',
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#555',
      },
      style: {
        stroke: '#555',
        strokeWidth: 2,
      },
    })));
  }, [initialEdges, setEdges]);

  // Auto-focus on current search result
  React.useEffect(() => {
    if (searchResults.length > 0 && reactFlowInstanceRef?.current) {
      const currentNodeId = searchResults[currentResultIndex];
      const currentNode = nodes.find(n => n.id === currentNodeId);
      
      if (currentNode) {
        // Center and zoom to the node
        reactFlowInstanceRef.current.fitView({
          nodes: [currentNode],
          duration: 400,
          padding: 0.5,
          maxZoom: 1.2,
        });
      }
    }
  }, [searchResults, currentResultIndex, nodes, reactFlowInstanceRef]);

  const onInit = useCallback((instance) => {
    if (reactFlowInstanceRef) {
      reactFlowInstanceRef.current = instance;
    }
  }, [reactFlowInstanceRef]);

  const defaultEdgeOptions = {
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#555', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#555',
    },
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        className="react-flow-graph"
      >
        <Background color="#404040" gap={16} />
        <Controls 
          showInteractive={false}
          style={{
            button: {
              backgroundColor: '#2d2d30',
              color: '#d4d4d4',
              borderColor: '#555',
            }
          }}
        />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'objectNode') return '#569cd6';
            if (node.type === 'arrayNode') return '#ce9178';
            return '#4ec9b0';
          }}
          maskColor="rgba(0, 0, 0, 0.6)"
          style={{
            backgroundColor: '#1e1e1e',
          }}
        />
      </ReactFlow>
    </div>
  );
};

export default GraphView;
