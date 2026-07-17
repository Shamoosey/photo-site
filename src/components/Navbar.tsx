import { FaGithub, FaInstagram } from "react-icons/fa";
import { Link } from "react-router";

export default function Navbar() {
  return (
    <section className="flex flex-row sm:flex-col sm:justify-between items-center sm:items-start max-w-50 sm:w-auto sm:min-h-screen sm:h-screen sm:sticky sm:top-0 p-6 sm:pr-6 gap-2">
      <div className="text-3xl">
        <span>Shamus Osler</span>
      </div>
      <div className="flex flex-row sm:flex-col sm:items-center gap-2 text-lg">
        <Link to={"about"}>
          <span className="hover:underline">About</span>
        </Link>
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
