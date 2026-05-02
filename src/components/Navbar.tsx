import { Link } from "react-router";

export default function Navbar() {
  return (
    <section className="flex flex-col min-w-30">
      <div className="my-8 mx-4">
        <div className="text-2xl">
          <span>Shamus Osler</span>
        </div>
      </div>
      <div className="mx-4">
        <div className="flex flex-col gap-1 text-lg">
          <Link to={"https://github.com/Shamoosey"}>
            <span className="hover:underline">Projects</span>
          </Link>
          <Link to={""}>
            <span className="hover:underline">Photos</span>
          </Link>
          <Link to={""}>
            <span className="hover:underline">About</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
