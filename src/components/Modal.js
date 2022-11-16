import React, {useContext, useState} from "react";
import {fireAuth, GoogleAuthProvider} from "../firebase";
import {signInWithPopup} from "firebase/auth";

function Modal() {

    return (
        <div className="modal modal-bottom sm:modal-middle">

        <div className="modal-box">
            <label htmlFor="login" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
            <h3 className="font-bold text-lg">Log into your account!</h3>
            <p className="py-4"> whatever </p>

            {
                //Your code goes here for Login
            }

            <div className="modal-action">
                <SignIn/>
            </div>
        </div>
    </div>
    );
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