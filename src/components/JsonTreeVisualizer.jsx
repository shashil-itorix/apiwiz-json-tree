import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import GraphView from './GraphView';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import {
  parseJsonToGraph,
  expandNode,
  collapseNode,
  searchNodes,
  getAncestorIds,
} from '../utils/jsonParser';
import { getLayoutedElements } from '../utils/layoutUtils';
import './JsonTreeVisualizer.css';

const JsonTreeVisualizer = ({
  defaultValue = '',
  onChange,
  theme: initialTheme = 'dark',
  maxDepth = 3
}) => {
  const reactFlowInstance = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Theme state with localStorage persistence
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('json-visualizer-theme');
    return savedTheme || initialTheme;
  });

  const [jsonText, setJsonText] = useState(defaultValue);
  const [jsonData, setJsonData] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalMatches, setTotalMatches] = useState(0);
  const [hasMoreResults, setHasMoreResults] = useState(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('json-visualizer-theme', theme);
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // Parse JSON whenever it changes
  useEffect(() => {
    if (jsonText.trim()) {
      try {
        const parsed = JSON.parse(jsonText);
        setJsonData(parsed);

        const { nodes: initialNodes, edges: initialEdges, expandedNodes: initialExpanded } =
          parseJsonToGraph(jsonText, maxDepth);

        // Apply layout
        const layoutedNodes = getLayoutedElements(initialNodes, initialEdges);

        setNodes(layoutedNodes);
        setEdges(initialEdges);
        setExpandedNodes(initialExpanded);
      } catch (error) {
        // Show error node
        setNodes([{
          id: 'error',
          type: 'primitiveNode',
          data: {
            label: 'Error',
            displayValue: error.message,
            type: 'error',
          },
          position: { x: 250, y: 100 },
          className: 'error-node',
        }]);
        setEdges([]);
      }
    } else {
      setNodes([]);
      setEdges([]);
      setJsonData(null);
    }
  }, [jsonText, maxDepth]);

  const handleEditorChange = useCallback((value) => {
    setJsonText(value || '');
    if (onChange) {
      onChange(value || '');
    }
  }, [onChange]);

  const handleToggleExpand = useCallback((nodeId, nodeData) => {
    if (!jsonData) return;

    if (nodeData.isExpanded) {
      // Collapse
      const { nodes: newNodes, edges: newEdges, expandedNodes: newExpanded } =
        collapseNode(nodeId, nodes, edges, expandedNodes);

      const layoutedNodes = getLayoutedElements(newNodes, newEdges);
      setNodes(layoutedNodes);
      setEdges(newEdges);
      setExpandedNodes(newExpanded);
    } else {
      // Expand
      const { nodes: newNodes, edges: newEdges, expandedNodes: newExpanded } =
        expandNode(nodeId, jsonData, nodes, edges, expandedNodes);

      const layoutedNodes = getLayoutedElements(newNodes, newEdges);
      setNodes(layoutedNodes);
      setEdges(newEdges);
      setExpandedNodes(newExpanded);
    }
  }, [jsonData, nodes, edges, expandedNodes]);

  const performSearch = useCallback((term) => {
    if (!term || !jsonData) {
      setSearchResults([]);
      setHighlightedNodes([]);
      setCurrentResultIndex(0);
      setTotalMatches(0);
      setHasMoreResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Use setTimeout to allow UI to update with loading state
    setTimeout(() => {
      try {
        // Search entire JSON structure with limit
        const MAX_RESULTS = 100;
        const results = searchNodes(jsonData, term, MAX_RESULTS);

        setSearchResults(results);
        setTotalMatches(results.length);
        setHasMoreResults(results.length >= MAX_RESULTS);
        setCurrentResultIndex(0);

        if (results.length > 0) {
          setHighlightedNodes(results);

          // Limit ancestor expansion to first 10 results to prevent freeze
          const resultsToExpand = results.slice(0, Math.min(10, results.length));

          // Get ALL ancestor IDs for search results
          const allAncestorIds = new Set();
          resultsToExpand.forEach(nodeId => {
            getAncestorIds(nodeId).forEach(id => allAncestorIds.add(id));
          });

          // Sort ancestors by depth (shallowest first) to expand in order
          const sortedAncestors = Array.from(allAncestorIds).sort((a, b) => {
            return a.split('.').length - b.split('.').length;
          });

          // Expand nodes that aren't already expanded, in order from root to leaf
          let currentNodes = nodes;
          let currentEdges = edges;
          let currentExpanded = new Set(expandedNodes);

          sortedAncestors.forEach(nodeId => {
            if (!currentExpanded.has(nodeId)) {
              const result = expandNode(nodeId, jsonData, currentNodes, currentEdges, currentExpanded);
              currentNodes = result.nodes;
              currentEdges = result.edges;
              currentExpanded = result.expandedNodes;
            }
          });

          // Apply layout
          const layoutedNodes = getLayoutedElements(currentNodes, currentEdges);
          setNodes(layoutedNodes);
          setEdges(currentEdges);
          setExpandedNodes(currentExpanded);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 0);
  }, [nodes, edges, expandedNodes, jsonData]);

  // Debounced search handler
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!term) {
      setSearchResults([]);
      setHighlightedNodes([]);
      setCurrentResultIndex(0);
      setTotalMatches(0);
      setHasMoreResults(false);
      return;
    }

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(term);
    }, 300);
  }, [performSearch]);

  const handleNavigateResults = useCallback((index) => {
    setCurrentResultIndex(index);
  }, []);

  const handleExpandAll = useCallback(() => {
    if (!jsonData) return;

    // Find all nodes that can be expanded
    let currentNodes = nodes;
    let currentEdges = edges;
    let currentExpanded = new Set(expandedNodes);

    // Get all expandable node IDs
    const expandableNodes = currentNodes.filter(n => n.data.hasChildren && !n.data.isExpanded);

    // Expand each node
    expandableNodes.forEach(node => {
      const result = expandNode(node.id, jsonData, currentNodes, currentEdges, currentExpanded);
      currentNodes = result.nodes;
      currentEdges = result.edges;
      currentExpanded = result.expandedNodes;
    });

    // Apply layout once at the end
    const layoutedNodes = getLayoutedElements(currentNodes, currentEdges);
    setNodes(layoutedNodes);
    setEdges(currentEdges);
    setExpandedNodes(currentExpanded);
  }, [nodes, edges, expandedNodes, jsonData]);

  const handleCollapseAll = useCallback(() => {
    if (!jsonData) return;

    // Keep only root level nodes (depth 0)
    const { nodes: initialNodes, edges: initialEdges, expandedNodes: initialExpanded } =
      parseJsonToGraph(JSON.stringify(jsonData), 1);

    const layoutedNodes = getLayoutedElements(initialNodes, initialEdges);
    setNodes(layoutedNodes);
    setEdges(initialEdges);
    setExpandedNodes(initialExpanded);
  }, [jsonData]);

  return (
    <div className="json-tree-visualizer">
      <div className="editor-panel">
        <div className="panel-header" style={{ paddingTop: 9, paddingBottom: 9 }}>
          <h3>JSON Editor</h3>
          <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
        </div>
        <Editor
          height="100%"
          defaultLanguage="json"
          theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
          value={jsonText}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>

      <div className="graph-panel">
        <div className="panel-header">
          <h3>Graph View</h3>
          {/* <div className="graph-controls">
            <button className="control-btn" onClick={handleExpandAll} title="Expand Level Nodes">
              Expand Level
            </button>
            <button className="control-btn" onClick={handleCollapseAll} title="Collapse Level Nodes">
              Collapse Level
            </button>
          </div> */}
          <SearchBar
            onSearch={handleSearch}
            searchResults={searchResults}
            currentResultIndex={currentResultIndex}
            onNavigate={handleNavigateResults}
            isSearching={isSearching}
            totalMatches={totalMatches}
            hasMoreResults={hasMoreResults}
          />
        </div>
        <div className="graph-container">
          <GraphView
            initialNodes={nodes}
            initialEdges={edges}
            onToggleExpand={handleToggleExpand}
            highlightedNodes={highlightedNodes}
            searchResults={searchResults}
            currentResultIndex={currentResultIndex}
            reactFlowInstanceRef={reactFlowInstance}
          />
        </div>
      </div>
    </div>
  );
};

export default JsonTreeVisualizer;
