 const books = [
  {
    title: "The Soul Recovery",
    author: "Adarsh Pal",
    category: "Self Growth",
  },
  {
    title: "You Are Not Alone",
    author: "A&G Author",
    category: "Mental Wellness",
  },
  {
    title: "The Writer Within",
    author: "A&G Author",
    category: "Literature",
  },
];

const services = [
  {
    number: "01",
    title: "Manuscript Publishing",
    text: "Turn your manuscript into a professionally published book with editorial, design and publishing support.",
  },
  {
    number: "02",
    title: "Book Design",
    text: "Professional cover and interior design crafted to give your book a distinctive identity.",
  },
  {
    number: "03",
    title: "Distribution",
    text: "Make your book available across leading online and offline publishing channels.",
  },
  {
    number: "04",
    title: "Author Support",
    text: "Get guidance throughout your publishing journey, from manuscript to your finished book.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#171717]">
      {/* NAVBAR */}
      <nav className="border-b border-black/10 bg-[#f6f3ed]">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">

    {/* Logo */}
    <a href="/" className="shrink-0">
      <p className="text-xl font-bold tracking-[0.18em]">A&G</p>
      <p className="text-[10px] tracking-[0.32em] text-black/55">
        PUBLICATION
      </p>
    </a>

    {/* Navigation */}
    <div className="hidden items-center gap-7 text-sm md:flex">
      <a href="/books" className="transition hover:text-black/50">
        Books
      </a>

      <a href="/publishing" className="transition hover:text-black/50">
        Publishing Services
      </a>

      <a href="/about" className="transition hover:text-black/50">
        About Us
      </a>

      <a href="/writing-challenge" className="transition hover:text-black/50">
        Writing Challenge
      </a>

      <a href="/contact" className="transition hover:text-black/50">
        Contact
      </a>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-3">
      <a
        href="/author-login"
        className="hidden rounded-full border border-black/20 px-5 py-2.5 text-sm font-medium transition hover:bg-white sm:inline-flex"
      >
        Author Login
      </a>

      <a
        href="/submit-manuscript"
        className="rounded-full bg-[#171717] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black/75"
      >
        Publish With Us
      </a>
    </div>

  </div>
</nav>

      {/* HERO */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-28">
        <div className="flex flex-col justify-center">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-black/50">
            Independent Publishing House
          </p>

          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
            Your story
            <br />
            deserves
            <br />
            <span className="italic font-normal">to be read.</span>
          </h1>

          <p className="mt-8 max-w-xl text-base leading-7 text-black/60">
            A&G Publication helps writers transform their ideas and
            manuscripts into beautifully crafted books and meaningful
            publishing journeys.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="/submit-manuscript"
              className="rounded-full bg-[#171717] px-7 py-3.5 text-sm font-medium text-white transition hover:bg-black/75"
            >
              Start Publishing
            </a>

            <a
              href="/books"
              className="rounded-full border border-black/20 px-7 py-3.5 text-sm font-medium transition hover:bg-white"
            >
              Explore Books
            </a>
          </div>
        </div>

        {/* BOOK VISUAL */}
        <div className="flex items-center justify-center">
          <div className="relative flex h-[500px] w-full max-w-[430px] items-center justify-center overflow-hidden bg-[#ded7ca]">
            <div className="absolute left-8 top-8 text-[100px] font-serif leading-none text-black/10">
              A&G
            </div>

            <div className="relative h-[350px] w-[235px] rotate-[-5deg] bg-[#191919] p-7 text-white shadow-2xl">
              <div className="flex h-full flex-col justify-between border border-white/20 p-5">
                <div>
                  <p className="text-[9px] tracking-[0.3em] text-white/50">
                    A&G PUBLICATION
                  </p>
                  <div className="mt-16 h-px w-12 bg-white/50" />
                </div>

                <div>
                  <h2 className="font-serif text-4xl leading-tight">
                    The
                    <br />
                    Writer
                    <br />
                    Within
                  </h2>
                  <p className="mt-5 text-[10px] uppercase tracking-[0.2em] text-white/50">
                    A collection of stories
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
          {[
            ["100+", "Authors"],
            ["150+", "Books"],
            ["20+", "Genres"],
            ["24/7", "Support"],
          ].map(([number, label]) => (
            <div
              key={label}
              className="border-r border-black/10 px-6 py-10 last:border-r-0"
            >
              <p className="text-3xl font-semibold">{number}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-black/45">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* BOOKS */}
      <section id="books" className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/45">
              Our Library
            </p>
            <h2 className="mt-3 font-serif text-5xl">Featured Books</h2>
          </div>

          <a href="#" className="text-sm underline underline-offset-4">
            View all books
          </a>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {books.map((book, index) => (
            <article key={book.title} className="group">
              <div className="flex h-[390px] items-center justify-center bg-[#e4ded3]">
                <div
                  className={`h-[285px] w-[190px] bg-[#${index === 0 ? "332f2b" : index === 1 ? "242b35" : "41352b"}] p-5 shadow-xl transition duration-500 group-hover:-translate-y-2`}
                >
                  <div className="flex h-full flex-col justify-between border border-white/20 p-4 text-white">
                    <p className="text-[8px] tracking-[0.25em]">
                      A&G PUBLICATION
                    </p>
                    <h3 className="font-serif text-3xl leading-tight">
                      {book.title}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="pt-5">
                <p className="text-xs uppercase tracking-[0.18em] text-black/40">
                  {book.category}
                </p>
                <h3 className="mt-2 text-xl font-medium">{book.title}</h3>
                <p className="mt-1 text-sm text-black/50">{book.author}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-[#171717] text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              What We Do
            </p>
            <h2 className="mt-4 font-serif text-5xl leading-tight">
              From manuscript
              <br />
              to published book.
            </h2>
          </div>

          <div className="mt-16 grid md:grid-cols-2">
            {services.map((service) => (
              <div
                key={service.number}
                className="border-t border-white/15 p-8 md:p-10"
              >
                <p className="text-sm text-white/35">{service.number}</p>
                <h3 className="mt-8 text-2xl font-medium">{service.title}</h3>
                <p className="mt-4 max-w-md text-sm leading-6 text-white/50">
                  {service.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">
              About A&G
            </p>
            <h2 className="mt-4 font-serif text-5xl">Built for writers.</h2>
          </div>

          <div>
            <p className="text-2xl leading-relaxed text-black/75">
              We believe every meaningful idea deserves a chance to become a
              book. A&G Publication brings together writers, editors,
              designers and publishing professionals to help turn manuscripts
              into finished works.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="publish" className="px-6 pb-24 lg:px-10">
        <div className="mx-auto max-w-7xl bg-[#d9cdb9] px-8 py-20 text-center md:px-16">
          <p className="text-xs uppercase tracking-[0.3em] text-black/45">
            Your Publishing Journey Starts Here
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-5xl leading-tight md:text-6xl">
            Have a manuscript?
            <br />
            Let&apos;s bring it to life.
          </h2>

          <a
           href="/submit-manuscript"
            className="mt-9 inline-block rounded-full bg-[#171717] px-8 py-4 text-sm font-medium text-white"
          >
            Submit Your Manuscript
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="border-t border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3 lg:px-10">
          <div>
            <p className="text-xl font-bold tracking-[0.18em]">A&G</p>
            <p className="mt-1 text-[10px] tracking-[0.32em] text-black/50">
              PUBLICATION
            </p>
            <p className="mt-5 max-w-xs text-sm leading-6 text-black/50">
              Publishing stories, ideas and voices that deserve to be heard.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">
              Explore
            </p>
            <div className="mt-5 space-y-3 text-sm text-black/60">
              <a className="block hover:text-black" href="/books">
                Books
              </a>
              <a className="block hover:text-black" href="/publishing">
                Publishing Services
              </a>
              <a className="block hover:text-black" href="/about">
                About Us
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">
              Contact
            </p>
            <div className="mt-5 space-y-3 text-sm text-black/60">
              <p>hello@agpublication.com</p>
              <p>India</p>
              <p>Mon–Sat · 10:00 AM–6:00 PM</p>
            </div>
          </div>
        </div>

        <div className="border-t border-black/10 px-6 py-5 text-center text-xs text-black/40">
          © 2026 A&G Publication. All rights reserved.
        </div>
      </footer>
    </main>
  );
}         
