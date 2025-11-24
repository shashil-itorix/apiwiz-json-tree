import { useState, useEffect } from 'react';
import JsonTreeVisualizer from './components/JsonTreeVisualizer';
import './App.css';

function App() {
  const [initialJson, setInitialJson] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load testData.json
    fetch('/testData.json')
      .then(response => response.json())
      .then(data => {
        setInitialJson(JSON.stringify(data, null, 2));
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading test data:', error);
        setInitialJson('{}');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="App" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100vh',
        background: '#1e1e1e',
        color: '#d4d4d4'
      }}>
        <div>Loading test data...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <JsonTreeVisualizer defaultValue={initialJson} maxDepth={1} />
    </div>
  );
}

export default App;
