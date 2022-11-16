import {fireAuth, fireDB, setDoc} from "../firebase";
import {createUserWithEmailAndPassword} from "firebase/auth";
import {useNavigate} from "react-router-dom"
import {doc} from "firebase/firestore";



function SignUp() {

    const navigate = useNavigate();


    const submitUser = (e) => {
        e.preventDefault();
        /*

            Getting sign up should:

            1.) Check to see if username is in database
            2.) Get good password practices
            3.) Work on
         */
        const email = e.target.email.value;
        const password = e.target.password.value;
        const username = e.target.name.value;
        const db = fireDB;
        const auth = fireAuth;


        async function MakeAccount() {

            try {
                const user = await createUserWithEmailAndPassword(auth, email, password);
                const data = {
                    name: username,
                };

                await setDoc(doc(db, 'Usernames', user.user.uid), data);

                return navigate("/");
            } catch (e) {
                console.log(e.toString())
                console.log("There was an error trying to create your account");
            }

        }
        MakeAccount();
    }


    return (


        <div className="flex flex-col items-center justify-center h-screen">
            <div className=" bg-opacity-20  bg-purple-400 artboard artboard-horizontal phone-2 rounded-3xl">

                <h1 className="hero text-white font-bold text-xl py-3"> Sign up for Spaced Out </h1>

                <form className="flex flex-col items-center" onSubmit={submitUser}>
                    <div className="mt-5">
                        <label className=" text-white "> Username: <input className="input input-bordered w-full text-purple-800"
                                                                          type="text" name="name"/> </label>
                    </div>

                    <div>
                        <label className=" text-white "> Password: <input
                            className="input input-bordered w-full max-w-xs text-purple-800" type="password" name="password"/> </label>
                    </div>

                    <div>
                        <label className=" text-white "> Your Email: <input
                            className="input input-bordered w-full max-w-xs text-purple-800" type="email" name="email"/> </label>
                    </div>
                    <div>
                        <input className="mt-4 btn bg-blue-600-40 btn-primary" type="submit" value="Sign Up"/>
                    </div>

                </form>
            </div>
        </div>
    );


}









    export default SignUp;
