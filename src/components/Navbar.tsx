import { FaGithub, FaInstagram } from "react-icons/fa";
import { Link } from "react-router";

export default function Navbar() {
  return (
    <section className="flex flex-row sm:flex-col min-w-40 my-8 mx-4 gap-2 sm:justify-start justify-between align-center">
      <div className="text-3xl">
        <span>Shamus Osler</span>
      </div>
      <div className="flex flex-row sm:flex-col gap-2 text-lg">
        <Link to={"about"}>
          <span className="hover:underline">About</span>
        </Link>
        <div className="flex gap-2 justify-start">
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
