import dagre from 'dagre';

/**
 * Calculate node positions using dagre hierarchical layout
 * @param {Array} nodes - React Flow nodes
 * @param {Array} edges - React Flow edges
 * @returns {Array} Nodes with calculated positions
 */
export function getLayoutedElements(nodes, edges) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Set graph properties for horizontal layout
  dagreGraph.setGraph({ 
    rankdir: 'LR', // Left to Right (horizontal)
    nodesep: 60,   // Vertical spacing between nodes
    ranksep: 150,  // Horizontal spacing between ranks (levels)
    marginx: 30,
    marginy: 30,
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { 
      width: node.width || 200, 
      height: node.height || 80 
    });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate the layout
  dagre.layout(dagreGraph);

  // Apply the calculated positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - (node.width || 200) / 2,
        y: nodeWithPosition.y - (node.height || 80) / 2,
      },
    };
  });

  return layoutedNodes;
}

/**
 * Calculate positions for a subset of nodes while keeping others fixed
 * @param {Array} allNodes - All nodes including fixed ones
 * @param {Array} newNodeIds - IDs of new nodes to position
 * @param {Array} edges - All edges
 * @returns {Array} Nodes with calculated positions
 */
export function getIncrementalLayout(allNodes, newNodeIds, edges) {
  // For now, just recalculate the entire layout
  // Future optimization: only layout the affected subgraph
  return getLayoutedElements(allNodes, edges);
}
