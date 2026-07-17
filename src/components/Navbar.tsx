import { FaGithub, FaInstagram } from "react-icons/fa";
import { Link } from "react-router";
import { useAdmin } from "../hooks/useAdmin";

export default function Navbar() {
  const { isAdmin } = useAdmin();

  return (
    <section className="flex flex-row sm:flex-col sm:justify-between items-center sm:items-start max-w-50 sm:w-auto sm:min-h-screen sm:h-screen sm:sticky sm:top-0 p-6 sm:pr-6 gap-2">
      <div className="text-3xl">
        <Link to={"/"}>
          <span>Shamus Osler</span>
        </Link>
      </div>
      <div className="flex flex-row sm:flex-col sm:items-center gap-2 text-lg">
        <Link to={"about"}>
          <span className="hover:underline">About</span>
        </Link>
        {isAdmin ? (
          <Link to={"admin"}>
            <span className="hover:underline">Admin</span>
          </Link>
        ) : null}
        <div className="sm:flex gap-2 justify-start sm:mt-auto">
          <Link to={"https://www.instagram.com/shamus.osler"}>
            <FaInstagram />
          </Link>
          <Link to={"https://github.com/Shamoosey"}>
            <FaGithub />
          </Link>
        </div>
      </div>
    </section>
  );
}
