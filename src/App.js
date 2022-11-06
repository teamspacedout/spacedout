import './App.css';
import { fireAuth, fireDB, fireStorage, fireLytics } from "./firebase";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Root from "./routes/Root";
import {Background} from "./components/Background";
import UserLogin from "./lib/context";
import {useUserAuth} from "./lib/hooks";
import Login from "./routes/Login";
import SignUp from "./routes/SignUp";
import PlanetPage from "./routes/PlanetPage";
import UserPage from "./routes/UserPage";
import Freeroam from "./routes/Freeroam";


const router = createBrowserRouter([{
    path: "/",
    element: <Root />,
}, {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/signup",
        element: <SignUp />,
    },
    {
        path: "/:user/:planet",
        element: <PlanetPage />,
    },
    {
        path: "/:user",
        element: <UserPage />,
    },
    {
        path: "/freeroam",
        element: <Freeroam />,
    },
    {
        path: "/",
        element: <Root />,
    },])


function App() {

const data = useUserAuth();

  return (
    <>
        <UserLogin.Provider value = {data}>
            <Background/>
        <RouterProvider router={router} />
        </UserLogin.Provider>
    </>
  );
}

export default App;
