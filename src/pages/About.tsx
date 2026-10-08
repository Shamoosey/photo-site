export default function AboutPage() {
  const { name, photo, bio } = {
    name: "Shamus Osler",
    photo: {
      src: "https://res.cloudinary.com/shamoose/image/upload/v1791469672/photo-site-prod/about-assets/sosler.jpg",
      alt: "Portrait of me :)",
    },
    bio: [
      "I've been shooting film since I got my first camera in 2017, I love how it makes you slow down and be more intentional with each photograph. I've created this website to showcase photos I've taken over the years that including some I haven't shared anywhere.",
      "All photos featured on this site were shot on film :)",
    ],
  };

  return (
    <main className="min-h-screen bg-cream text-black-font antialiased">
      <div className="mx-auto max-w-260 px-6 pb-12 pt-14 md:px-8 md:pb-16 md:pt-24">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
          <figure className="m-0">
            <div className="relative border border-cream-border bg-cream-darker p-1">
              <img
                src={photo.src}
                alt={photo.alt}
                className="block w-full object-cover contrast-[1.02] grayscale-15% md:aspect-4/5"
              />
            </div>
          </figure>

          <section className="pt-1">
            <p className="mb-4.5 text-xs uppercase tracking-[0.16em] text-cream-font">About</p>

            <h1 className="mb-1.5 text-[34px] font-medium leading-[1.08] md:text-[44px]">{name}</h1>

            <div>
              {bio.map((paragraph, i) => (
                <p key={i} className="mb-5 max-w-[52ch] text-base leading-[1.75] text-[#3a3630]">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
