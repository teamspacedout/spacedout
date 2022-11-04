import './App.css';
import { fireAuth, fireDB, fireStorage, fireLytics } from "./firebase";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Root from "./routes/Root";
import {Background} from "./components/Background";
import UserLogin from "./lib/context";
import {useUserAuth} from "./lib/hooks";


const router = createBrowserRouter([{
    path: "/",
    element: <Root />,
}])


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
