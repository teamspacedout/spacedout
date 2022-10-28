import './App.css';
import { fireAuth, fireDB, fireStorage, fireLytics } from "./firebase";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Root from "./routes/Root";
import {Background} from "./components/Background";


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
