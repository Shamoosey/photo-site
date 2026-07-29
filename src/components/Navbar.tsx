import { Show, UserButton } from "@clerk/react";
import { FaGithub, FaInstagram } from "react-icons/fa";
import { Link } from "react-router";

export default function Navbar() {
  return (
    <section className="flex flex-row sm:flex-col justify-between items-center sm:items-start sm:max-w-50 sm:w-auto sm:min-h-screen sm:h-screen sm:sticky sm:top-0 sm:p-6 py-6 px-2 sm:pr-6 gap-2 ">
      <div className="text-3xl">
        <Link to={"/"}>
          <span>Shamus Osler</span>
        </Link>
      </div>
      <div className="flex flex-row sm:flex-col items-center  gap-2 text-lg ">
        <Link to={"about"}>
          <span className="hover:underline">About</span>
        </Link>
        <div className="flex gap-2 justify-start sm:mt-auto ">
          <Link to={"https://www.instagram.com/shamus.osler"}>
            <FaInstagram />
          </Link>
          <Link to={"https://github.com/Shamoosey"}>
            <FaGithub />
          </Link>
        </div>
        <Show when={"signed-in"}>
          <UserButton />
        </Show>
      </div>
    </section>
  );
}
