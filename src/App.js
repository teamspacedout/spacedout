import './App.css';
import { fireAuth, fireDB, fireStorage, fireLytics } from "./firebase";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Root from "./routes/Root";
import Login from "./routes/Login";
import {Background} from "./components/Background";
import UserLogin from "./lib/context";


const router = createBrowserRouter([{
        path: "/",
        element: <Root />,
    },
    {
        path: "/Login",
        element: <Login />,
    }])


function App() {
  return (
      <UserLogin.provider>
          <div>
            <Background/>
            <RouterProvider router={router} />
          </div>
      </UserLogin.provider>
  );
}

export default App;
