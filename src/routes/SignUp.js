import {collection, doc, fireAuth, fireDB, query} from "../firebase";
import {createUserWithEmailAndPassword} from "firebase/auth";



function SignUp() {

    console.log(fireAuth);


    return (


        <div className="flex flex-col items-center justify-center h-screen">
            <div className=" bg-opacity-20  bg-purple-400 artboard artboard-horizontal phone-2 rounded-3xl">

            <h1 className="hero text-white font-bold text-xl py-3"> Sign up for Spaced Out </h1>

                <form className="flex flex-col items-center" onSubmit={submitUser}>
                    <div className="mt-5">
                <label className=" text-white "> Username: <input className="input input-bordered w-full" type="text" name="name" /> </label>
                    </div>

                    <div>
                        <label> Password: <input className="input input-bordered w-full max-w-xs" type="password" name="password" /> </label>
                    </div>

                    <div>
                        <label> Your Email: <input className="input input-bordered w-full max-w-xs" type="email" name="email" /> </label>
                    </div>
                <div>
                    <input className="mt-4 btn bg-blue-600-40 btn-primary" type="submit" value="Sign Up" />
                </div>

                </form>
            </div>
            </div>
    );
}


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
    const user = e.target.name.value;

    const db = fireDB;
    const auth = fireAuth;


    const ref = collection(db, "users");

    console.log("it work?")
    async function MakeAccount() {
        try {
            const user = await createUserWithEmailAndPassword(auth, email, password);
            console.log(user);
        } catch (e) {
            console.log("There was an error trying to create your account");
        }

    }

    MakeAccount();

}


export default SignUp;
