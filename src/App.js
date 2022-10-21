import './App.css';
import { fireConfig } from "./firebase";
import { initializeApp } from "firebase/app";

// Initialization of Firebase application with configuration data and custom application name
const appName = "Spaced Out - Web";
const fireApp = initializeApp(fireConfig, appName);




function App() {
  return (
    <div className="App">
        <h1 className="text-3xl font-bold underline">
            Hello SpacedOut!
        </h1>
    </div>
  );
}

export default App;
