# JSON Tree Visualizer (Graph-Based)

A performant React component for visualizing JSON data with an integrated Monaco Editor and **interactive graph visualization** using React Flow.

## Features

- **Split Layout**: Monaco Editor (30%) + React Flow Graph (70%)
- **Visual Node Graph**: Flowchart-like representation with connected nodes
- **Custom Node Types**: 
  - 📦 Object nodes with key counts
  - 📋 Array nodes with item counts
  - 📝 Primitive nodes with type-specific icons
- **Auto-Layout**: Hierarchical layout using dagre algorithm
- **Expand/Collapse**: Interactive nodes with +/− buttons
- **Depth Limiting**: Shows 3 levels initially, expandable on demand
- **Search**: Find keys/values with automatic highlighting and ancestor expansion
- **Graph Controls**: Zoom, pan, fit view, and minimap
- **Performance Optimized**: Lazy loading, React.memo, efficient re-rendering

## Installation

```bash
npm install
```

## Usage

### As a Component

```jsx
import JsonTreeVisualizer from './components/JsonTreeVisualizer';

function App() {
  const [jsonValue, setJsonValue] = useState('{}');

  return (
    <JsonTreeVisualizer 
      defaultValue={jsonValue}
      onChange={setJsonValue}
      theme="vs-dark"
      maxDepth={3}
    />
  );
}
```

### Props

- `defaultValue` (string): Initial JSON string value
- `onChange` (function): Callback when JSON changes
- `theme` (string): Monaco Editor theme ('vs-dark', 'vs-light', 'hc-black')
- `maxDepth` (number): Maximum tree depth to show initially (default: 3)

## Development

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## How It Works

### Graph Visualization

The component uses **React Flow** to render JSON as an interactive node graph:
1. JSON is parsed into a tree structure
2. Each object, array, and primitive becomes a visual node
3. Dagre algorithm calculates hierarchical positions
4. Nodes are connected with edges showing relationships
5. Click +/− buttons to expand/collapse nodes dynamically

### Node Types

**Object Node (📦)**
- Shows object key
- Displays number of properties
- Blue gradient background
- Expandable to show children

**Array Node (📋)**
- Shows array key
- Displays number of items
- Orange gradient background
- Expandable to show elements

**Primitive Node (📝🔢✓∅)**
- Shows key and value
- Type-specific icons (string, number, boolean, null)
- Green gradient background
- No expansion (leaf nodes)

### Search

The search feature:
1. Searches through all keys and values
2. Highlights matching nodes with golden border and glow
3. Automatically expands ancestor nodes to reveal matches
4. Shows result count and prev/next navigation
5. Real-time filtering as you type

### Performance

- **Lazy Expansion**: Only renders visible part of tree (3 levels initially)
- **React.memo**: Prevents unnecessary re-renders of nodes
- **Dagre Layout**: Efficient hierarchical positioning
- **Smooth Interactions**: Zoom, pan, and expand operations are optimized

## Component Structure

```
src/
├── components/
│   ├── JsonTreeVisualizer.jsx  (Main component)
│   ├── GraphView.jsx            (React Flow wrapper)
│   ├── SearchBar.jsx           (Search UI)
│   └── nodes/
│       ├── ObjectNode.jsx      (Custom object node)
│       ├── ArrayNode.jsx       (Custom array node)
│       ├── PrimitiveNode.jsx   (Custom primitive node)
│       └── nodes.css           (Node styling)
├── utils/
│   ├── jsonParser.js           (JSON to graph conversion)
│   └── layoutUtils.js          (Dagre layout)
├── App.jsx                     (Demo application)
└── index.js                    (Library export)
```

## Dependencies

- `@monaco-editor/react` - JSON editor
- `reactflow` - Graph visualization library
- `dagre` - Hierarchical layout algorithm
- `react` - UI framework

## Screenshots

### Initial View
![Graph visualization with Monaco Editor](./screenshots/initial.png)

### Expanded Nodes
![Nodes expanded showing children](./screenshots/expanded.png)

### Search Results
![Search highlighting matching nodes](./screenshots/search.png)

## License

MIT
