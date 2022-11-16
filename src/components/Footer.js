import {Link} from "react-router-dom";

function Footer() {
    return (
        <footer className="sticky fixed text-center p-1 bg-indigo-400 bg-opacity-30">
            <div>
                <Link to = '/signup' className=" text-white hover:text-yellow-300">
                    Haven't created an account yet?
                </Link>
            </div>
        </footer>
    );
}

export default Footer;