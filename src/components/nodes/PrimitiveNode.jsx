import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './nodes.css';

const PrimitiveNode = memo(({ data, isConnectable }) => {
  const getTypeClass = () => {
    return `primitive-${data.type}`;
  };

  const getTypeIcon = () => {
    switch (data.type) {
      case 'string': return '📝';
      case 'number': return '🔢';
      case 'boolean': return '✓';
      case 'null': return '∅';
      default: return '•';
    }
  };

  return (
    <div className={`custom-node primitive-node ${getTypeClass()}`}>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="node-handle"
      />
      
      <div className="node-header">
        <span className="node-icon">{getTypeIcon()}</span>
        <span className="node-label">{data.label}</span>
      </div>
      
      <div className="node-content">
        <span className="node-value">{data.displayValue}</span>
      </div>
    </div>
  );
});

PrimitiveNode.displayName = 'PrimitiveNode';

export default PrimitiveNode;
