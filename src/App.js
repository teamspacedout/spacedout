import './App.css';
import { fireConfig } from "./firebase";
import { initializeApp } from "firebase/app";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Root from "./routes/Root";
import {Background} from "./components/Background";


// Initialization of Firebase application with configuration data and custom application name
const appName = "Spaced Out - Web";
const fireApp = initializeApp(fireConfig, appName);

const router = createBrowserRouter([{
    path: "/",
    element: <Root />,
}])


function App() {
  return (
    <div>
            <Background/>
        <RouterProvider router={router} />
    </div>
  );
}

export default App;
