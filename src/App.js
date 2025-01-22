import logo from './logo.svg';
import './App.css';
import { WebsocketProvider, socket } from './contexts/WebsocketContext';
import { WebSocket } from './component/WebSocket';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
        <WebsocketProvider value={socket}>
          <Routes>
            {/* Define routes here */}
            <Route path="/" element={<WebSocket />} />
          </Routes>
        </WebsocketProvider>
      </Router>
    </div>
  );
}

export default App;
