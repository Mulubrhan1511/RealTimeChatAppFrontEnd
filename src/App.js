import logo from './logo.svg';
import './App.css';
import { WebsocketProvider, socket } from './contexts/WebsocketContext';
import { WebSocket } from './component/WebSocket';

function App() {
  return (
    <div className="App">
      <WebsocketProvider value={socket}>
        <WebSocket />
      </WebsocketProvider>
    </div>
  );
}

export default App;
