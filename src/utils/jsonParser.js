/**
 * Parse JSON and create nodes and edges for React Flow
 * @param {string} jsonString - JSON string to parse
 * @param {number} maxDepth - Maximum depth to show initially
 * @returns {Object} Object containing nodes and edges arrays
 */
export function parseJsonToGraph(jsonString, maxDepth = 3) {
  try {
    const data = JSON.parse(jsonString);
    const nodes = [];
    const edges = [];
    const expandedNodes = new Set();
    
    buildGraph(data, 'root', null, 0, maxDepth, nodes, edges, expandedNodes);
    
    return { nodes, edges, expandedNodes };
  } catch (error) {
    return { 
      nodes: [{
        id: 'error',
        type: 'error',
        data: { label: `Error: ${error.message}` },
        position: { x: 0, y: 0 },
      }],
      edges: [],
      expandedNodes: new Set(),
    };
  }
}

/**
 * Build graph structure recursively
 * @param {*} value - Current value to process
 * @param {string} key - Current key name
 * @param {string} parentId - Parent node ID
 * @param {number} depth - Current depth
 * @param {number} maxDepth - Maximum depth to show
 * @param {Array} nodes - Nodes array to populate
 * @param {Array} edges - Edges array to populate
 * @param {Set} expandedNodes - Set of expanded node IDs
 */
function buildGraph(value, key, parentId, depth, maxDepth, nodes, edges, expandedNodes) {
  const nodeId = parentId ? `${parentId}.${key}` : key;
  
  const nodeType = getNodeType(value);
  const hasChildren = (Array.isArray(value) && value.length > 0) || 
                      (typeof value === 'object' && value !== null && Object.keys(value).length > 0);
  
  // Mark as expanded only if we're going to process children
  const shouldExpand = depth < maxDepth && hasChildren;
  
  const nodeData = {
    label: key,
    value: value,
    type: nodeType,
    depth: depth,
    isExpanded: shouldExpand,
    hasChildren: hasChildren,
  };

  // Create node based on type
  let node;
  if (nodeType === 'object') {
    const keys = Object.keys(value);
    node = {
      id: nodeId,
      type: 'objectNode',
      data: {
        ...nodeData,
        keyCount: keys.length,
      },
      position: { x: 0, y: 0 }, // Will be calculated by layout
    };
  } else if (nodeType === 'array') {
    node = {
      id: nodeId,
      type: 'arrayNode',
      data: {
        ...nodeData,
        arrayLength: value.length,
      },
      position: { x: 0, y: 0 },
    };
  } else {
    node = {
      id: nodeId,
      type: 'primitiveNode',
      data: {
        ...nodeData,
        displayValue: formatValue(value),
      },
      position: { x: 0, y: 0 },
    };
  }

  nodes.push(node);

  // Add edge from parent if exists
  if (parentId) {
    edges.push({
      id: `${parentId}-${nodeId}`,
      source: parentId,
      target: nodeId,
      type: 'smoothstep',
      animated: false,
    });
  }

  // CRITICAL OPTIMIZATION: Only process children if we're explicitly within maxDepth
  // This prevents processing the entire tree structure upfront
  if (shouldExpand) {
    expandedNodes.add(nodeId);
    
    if (Array.isArray(value)) {
      // Limit array processing - only process first few items for very large arrays
      const itemsToProcess = depth === maxDepth - 1 ? Math.min(value.length, 10) : value.length;
      for (let i = 0; i < itemsToProcess; i++) {
        buildGraph(value[i], `[${i}]`, nodeId, depth + 1, maxDepth, nodes, edges, expandedNodes);
      }
    } else if (typeof value === 'object' && value !== null) {
      // For objects, process all keys but limit recursion depth
      const keys = Object.keys(value);
      keys.forEach(k => {
        buildGraph(value[k], k, nodeId, depth + 1, maxDepth, nodes, edges, expandedNodes);
      });
    }
  }
}

/**
 * Expand a node and add its children to the graph
 * @param {string} nodeId - Node ID to expand
 * @param {*} jsonData - Original JSON data
 * @param {Array} currentNodes - Current nodes array
 * @param {Array} currentEdges - Current edges array
 * @param {Set} expandedNodes - Set of expanded node IDs
 * @returns {Object} Updated nodes and edges
 */
export function expandNode(nodeId, jsonData, currentNodes, currentEdges, expandedNodes) {
  const node = currentNodes.find(n => n.id === nodeId);
  if (!node || !node.data.hasChildren) {
    return { nodes: currentNodes, edges: currentEdges };
  }

  // Get the value for this node from jsonData
  const pathParts = nodeId.split('.').filter(p => p !== 'root');
  let value = jsonData;
  
  for (const part of pathParts) {
    if (part.startsWith('[') && part.endsWith(']')) {
      const index = parseInt(part.slice(1, -1));
      value = value[index];
    } else {
      value = value[part];
    }
  }

  const newNodes = [...currentNodes];
  const newEdges = [...currentEdges];
  const newExpandedNodes = new Set(expandedNodes);

  // Mark node as expanded
  const nodeIndex = newNodes.findIndex(n => n.id === nodeId);
  newNodes[nodeIndex] = {
    ...node,
    data: { ...node.data, isExpanded: true },
  };
  newExpandedNodes.add(nodeId);

  // Add children
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      buildGraph(item, `[${index}]`, nodeId, node.data.depth + 1, node.data.depth + 1, newNodes, newEdges, newExpandedNodes);
    });
  } else if (typeof value === 'object' && value !== null) {
    Object.keys(value).forEach(k => {
      buildGraph(value[k], k, nodeId, node.data.depth + 1, node.data.depth + 1, newNodes, newEdges, newExpandedNodes);
    });
  }

  return { nodes: newNodes, edges: newEdges, expandedNodes: newExpandedNodes };
}

/**
 * Collapse a node and remove its children from the graph
 * @param {string} nodeId - Node ID to collapse
 * @param {Array} currentNodes - Current nodes array
 * @param {Array} currentEdges - Current edges array
 * @param {Set} expandedNodes - Set of expanded node IDs
 * @returns {Object} Updated nodes and edges
 */
export function collapseNode(nodeId, currentNodes, currentEdges, expandedNodes) {
  const node = currentNodes.find(n => n.id === nodeId);
  if (!node) {
    return { nodes: currentNodes, edges: currentEdges };
  }

  const newExpandedNodes = new Set(expandedNodes);
  newExpandedNodes.delete(nodeId);

  // Find all descendant nodes
  const descendantIds = new Set();
  const findDescendants = (id) => {
    currentEdges
      .filter(edge => edge.source === id)
      .forEach(edge => {
        descendantIds.add(edge.target);
        newExpandedNodes.delete(edge.target);
        findDescendants(edge.target);
      });
  };
  findDescendants(nodeId);

  // Remove descendant nodes and edges
  const newNodes = currentNodes
    .filter(n => !descendantIds.has(n.id))
    .map(n => n.id === nodeId ? { ...n, data: { ...n.data, isExpanded: false } } : n);
  
  const newEdges = currentEdges.filter(
    edge => !descendantIds.has(edge.source) && !descendantIds.has(edge.target)
  );

  return { nodes: newNodes, edges: newEdges, expandedNodes: newExpandedNodes };
}

/**
 * Get the type of a value
 * @param {*} value
 * @returns {string} Type name
 */
function getNodeType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return typeof value;
}

/**
 * Format a primitive value for display
 * @param {*} value
 * @returns {string} Formatted value
 */
function formatValue(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  return String(value);
}

/**
 * Search for nodes matching a term in the entire JSON structure (deep search)
 * @param {*} jsonData - The entire JSON data structure
 * @param {string} searchTerm - Search term
 * @param {number} maxResults - Maximum number of results to return (default: 100)
 * @returns {Array} Matching node paths (node IDs)
 */
export function searchNodes(jsonData, searchTerm, maxResults = 100) {
  if (!searchTerm || !jsonData) return [];
  
  const lowerSearch = searchTerm.toLowerCase();
  const matches = [];

  // Recursive function to search through entire JSON structure
  function deepSearch(value, key, parentId) {
    // Early termination if we've found enough results
    if (matches.length >= maxResults) {
      return;
    }
    
    const nodeId = parentId ? `${parentId}.${key}` : key;
    
    // Check if key matches
    if (String(key).toLowerCase().includes(lowerSearch)) {
      matches.push(nodeId);
      if (matches.length >= maxResults) return;
    }
    
    // Check if value matches (for primitives)
    if (value !== null && typeof value !== 'object') {
      if (String(value).toLowerCase().includes(lowerSearch)) {
        matches.push(nodeId);
        if (matches.length >= maxResults) return;
      }
    }
    
    // Recurse for objects and arrays
    if (matches.length < maxResults) {
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length && matches.length < maxResults; i++) {
          deepSearch(value[i], `[${i}]`, nodeId);
        }
      } else if (typeof value === 'object' && value !== null) {
        const keys = Object.keys(value);
        for (let i = 0; i < keys.length && matches.length < maxResults; i++) {
          deepSearch(value[keys[i]], keys[i], nodeId);
        }
      }
    }
  }

  // Start deep search from root
  deepSearch(jsonData, 'root', null);

  return matches;
}

/**
 * Get all ancestor node IDs for a given node
 * @param {string} nodeId - Node ID
 * @returns {Array} Array of ancestor node IDs
 */
export function getAncestorIds(nodeId) {
  const parts = nodeId.split('.');
  const ancestors = [];
  
  for (let i = 1; i < parts.length; i++) {
    ancestors.push(parts.slice(0, i + 1).join('.'));
  }
  
  return ancestors;
}
