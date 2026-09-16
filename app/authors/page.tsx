export default function AuthorsPage() {
  const authors = [
    {
      name: "Aarav Mehta",
      role: "Fiction & Contemporary",
      books: "3 Published Books",
      initials: "AM",
    },
    {
      name: "Riya Sharma",
      role: "Self-Help & Wellness",
      books: "5 Published Books",
      initials: "RS",
    },
    {
      name: "Kabir Malhotra",
      role: "Poetry & Literature",
      books: "2 Published Books",
      initials: "KM",
    },
    {
      name: "Ananya Verma",
      role: "Romance & Fiction",
      books: "4 Published Books",
      initials: "AV",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#24231f]">
      {/* Navbar */}
      <nav className="border-b border-[#dedbd3] bg-[#f8f6f1]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="text-2xl font-bold tracking-tight">
            A&G <span className="font-light">PUBLICATION</span>
          </a>

          <div className="hidden gap-8 text-sm md:flex">
            <a href="/" className="hover:opacity-60">Home</a>
            <a href="/books" className="hover:opacity-60">Books</a>
            <a href="/authors" className="font-medium">Authors</a>
            <a href="/publishing" className="hover:opacity-60">Publishing</a>
            <a href="/packages" className="hover:opacity-60">Packages</a>
          </div>

          <a
            href="/publishing"
            className="rounded-full bg-[#24231f] px-5 py-2.5 text-sm text-white transition hover:opacity-85"
          >
            Publish With Us
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-24">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-[#77736a]">
            Our Authors
          </p>

          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Voices that deserve
            <br />
            <span className="font-serif italic font-normal">
              to be heard.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#69665f]">
            Behind every remarkable book is an author with a story to tell.
            A&G Publication works with emerging and established writers to
            transform ideas into meaningful books.
          </p>
        </div>
      </section>

      {/* Authors */}
      <section className="border-y border-[#dedbd3] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#77736a]">
                Featured Writers
              </p>
              <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
                Meet our authors
              </h2>
            </div>

            <p className="hidden max-w-sm text-right text-sm leading-6 text-[#77736a] md:block">
              A growing community of writers creating stories, ideas and
              books that connect with readers.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {authors.map((author) => (
              <div
                key={author.name}
                className="group border border-[#dedbd3] bg-[#f8f6f1] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#24231f] text-xl font-semibold text-white">
                  {author.initials}
                </div>

                <h3 className="mt-7 text-xl font-semibold">
                  {author.name}
                </h3>

                <p className="mt-2 text-sm text-[#77736a]">
                  {author.role}
                </p>

                <div className="mt-6 border-t border-[#dedbd3] pt-5 text-sm">
                  {author.books}
                </div>

                <button className="mt-6 text-sm font-semibold underline underline-offset-4">
                  View Author →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Author CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid overflow-hidden bg-[#24231f] text-white md:grid-cols-2">
          <div className="p-10 md:p-16">
            <p className="text-sm uppercase tracking-[0.2em] text-white/50">
              Your Story Matters
            </p>

            <h2 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">
              Your name could be
              <br />
              <span className="font-serif italic font-normal">
                next on the list.
              </span>
            </h2>

            <p className="mt-6 max-w-lg leading-7 text-white/65">
              Have a manuscript, an unfinished idea, or simply a story you
              believe should exist? Take the first step toward becoming a
              published author.
            </p>

            <a
              href="/publishing"
              className="mt-8 inline-block rounded-full bg-white px-7 py-3.5 text-sm font-medium text-[#24231f] transition hover:bg-white/90"
            >
              Start Your Publishing Journey
            </a>
          </div>

          <div className="flex min-h-[300px] items-center justify-center bg-[#d8d1c4] p-10">
            <div className="text-center text-[#24231f]">
              <div className="text-7xl font-serif">A&G</div>
              <p className="mt-3 text-sm uppercase tracking-[0.3em]">
                Your Story • Your Voice
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#dedbd3] bg-[#f8f6f1]">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-6 py-10 md:flex-row md:items-center">
          <div>
            <div className="text-xl font-bold">
              A&G <span className="font-light">PUBLICATION</span>
            </div>
            <p className="mt-2 text-sm text-[#77736a]">
              Bringing stories to life.
            </p>
          </div>

          <div className="flex gap-6 text-sm text-[#77736a]">
            <a href="/books" className="hover:text-[#24231f]">Books</a>
            <a href="/authors" className="hover:text-[#24231f]">Authors</a>
            <a href="/publishing" className="hover:text-[#24231f]">
              Publishing
            </a>
            <a href="/packages" className="hover:text-[#24231f]">
              Packages
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}