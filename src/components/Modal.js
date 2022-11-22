import React, {useContext, useState} from "react";
import {fireAuth, GoogleAuthProvider, signInWithEmailAndPassword} from "../firebase";
import {signInWithPopup} from "firebase/auth";
import {useNavigate} from "react-router-dom";
import Context from "../lib/context";

function Modal() {

    const navigate = useNavigate();
   // const [user, username] = useContext(Context);

    const SignInEmail = (e) => {

        e.preventDefault();

        const email = e.target.email.value;
        const password = e.target.password.value;

        console.log(email);
        console.log(password);

        try {
            const loginEmail = async () => {
                return await signInWithEmailAndPassword(fireAuth, email, password);
            }

            const isLogged = loginEmail();

            return navigate(`/freeroam`);

        } catch (e) {
            console.log(e.toString());
            console.log("This faled:(");
        }


    }

        return (
        <div className="modal modal-bottom sm:modal-middle ">
        <div className="modal-box w-3/12 text-white items-center justify-items-center bg-gradient-to-r from-cyan-500 to-blue-500">
            <label htmlFor="login" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
            <h3 className="font-bold text-lg text-center">Log into your account!</h3>

            <form name="login" onSubmit={SignInEmail} >

                <div className="self-center justify-center align-middle">
                    <label className=" text-white "> Email: <input className=" w-8/12 input input-bordered input-sm my-4 ml-7 text-purple-800" type="email" name="email"/> </label>
                </div>

                <div>
                    <label className=" text-balck "> Password: <input className=" w-8/12 input input-sm text-purple-800" type="password" name="password"/> </label>
                </div>



                <div className="modal-action justify-center">

                    <input type="submit" value = "Login!" className="btn" />
                    <SignInGoogle/>
                </div>



            </form>
        </div>
    </div>
    );







}
function SignInGoogle() {
    /*
        Write more complicated logic for signing in here with email password etc.
     */

    const logIn = new GoogleAuthProvider();

    const googleLogin = async () => {
        await signInWithPopup(fireAuth, logIn);

    }

    return (
        <label
            onClick={googleLogin} className="btn-md bg-white rounded hover:bg-indigo-50 py-3" htmlFor="login">
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
            </svg>
        </label>
    )
}

function SignIn() {
    /*
        Write more complicated logic for signing in here with email password etc.
     */

    const logIn = new GoogleAuthProvider();

    const googleLogin = async () => {
        await signInWithPopup(fireAuth, logIn);

    }

    return (
        <label htmlFor="login" className="btn" onClick={googleLogin}>Sign In</label>
    )
}
export default Modal;