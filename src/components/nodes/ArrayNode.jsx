import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './nodes.css';

const ArrayNode = memo(({ data, isConnectable }) => {
  return (
    <div className={`custom-node array-node ${data.isExpanded ? 'expanded' : ''}`}>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="node-handle"
      />
      
      <div className="node-header">
        <span className="node-icon">📋</span>
        <span className="node-label">{data.label}</span>
      </div>
      
      <div className="node-content">
        <span className="node-type">Array</span>
        <span className="node-info">{data.arrayLength} {data.arrayLength === 1 ? 'item' : 'items'}</span>
      </div>
      
      {data.hasChildren && (
        <button 
          className="expand-btn"
          onClick={(e) => {
            e.stopPropagation();
            data.onToggleExpand?.(data);
          }}
        >
          {data.isExpanded ? '−' : '+'}
        </button>
      )}
      
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="node-handle"
      />
    </div>
  );
});

ArrayNode.displayName = 'ArrayNode';

export default ArrayNode;
