import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#171717]">
      {/* NAVBAR */}
      <nav className="border-b border-black/10 bg-[#f6f3ed]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          {/* A&G LOGO */}
          <Link
            href="/"
            className="shrink-0 transition-opacity hover:opacity-80"
            aria-label="A&G Publication Home"
          >
            <img
              src="/ag-logo.png"
              alt="A&G Publication"
              className="h-16 w-16 object-contain sm:h-[72px] sm:w-[72px]"
            />
          </Link>

          <div className="hidden items-center gap-7 text-sm md:flex">
            <Link href="/books" className="hover:text-black/50">
              Books
            </Link>

            <Link href="/publishing" className="hover:text-black/50">
              Publishing Services
            </Link>

            <Link href="/about" className="font-medium">
              About Us
            </Link>

            <Link href="/publishing" className="hover:text-black/50">
              Writing Challenge
            </Link>

            <Link href="/contact" className="hover:text-black/50">
              Contact
            </Link>
          </div>

          <Link
            href="/submit-manuscript"
            className="rounded-full bg-[#171717] px-5 py-2.5 text-sm font-medium text-white"
          >
            Publish With Us
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/45">
          About A&G Publication
        </p>

        <h1 className="mt-5 max-w-5xl font-serif text-5xl leading-tight sm:text-6xl lg:text-8xl">
          We help stories
          <br />
          find their readers.
        </h1>

        <p className="mt-8 max-w-2xl text-base leading-7 text-black/60">
          A&G Publication is built around a simple belief: every meaningful
          story deserves the opportunity to become a thoughtfully created book.
          We support writers from manuscript to publication with a focused,
          professional publishing experience.
        </p>
      </section>

      {/* MISSION */}
      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-24">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">
              Our Mission
            </p>

            <h2 className="mt-4 font-serif text-5xl leading-tight">
              Publishing with purpose.
            </h2>
          </div>

          <div className="space-y-6 text-lg leading-8 text-black/65">
            <p>
              We want publishing to feel less complicated and more accessible
              for writers. From first-time authors to experienced storytellers,
              our goal is to provide clear guidance and dependable support at
              every stage.
            </p>

            <p>
              Manuscript preparation, editorial support, book design,
              distribution and author guidance come together to create a
              publishing journey that puts the writer and the story first.
            </p>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">
          What We Believe
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            [
              "01",
              "The Story Comes First",
              "Every publishing decision should protect the voice, purpose and identity of the author's work.",
            ],
            [
              "02",
              "Quality Matters",
              "Professional editing, design and publishing standards help a good story become a better book.",
            ],
            [
              "03",
              "Authors Deserve Support",
              "Publishing should be a guided journey, not a process where writers are left to figure everything out alone.",
            ],
          ].map(([number, title, text]) => (
            <div
              key={number}
              className="border border-black/10 bg-white p-8"
            >
              <p className="text-sm text-black/35">{number}</p>

              <h3 className="mt-12 text-2xl font-medium">{title}</h3>

              <p className="mt-4 text-sm leading-6 text-black/55">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 lg:px-10">
        <div className="mx-auto max-w-7xl bg-[#d9cdb9] px-8 py-20 text-center md:px-16">
          <p className="text-xs uppercase tracking-[0.3em] text-black/45">
            Ready to Begin?
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-5xl leading-tight md:text-6xl">
            Your manuscript could be
            <br />
            your next book.
          </h2>

          <Link
            href="/submit-manuscript"
            className="mt-9 inline-block rounded-full bg-[#171717] px-8 py-4 text-sm font-medium text-white"
          >
            Submit Your Manuscript →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-xs text-black/40 lg:px-10">
          © 2026 A&G Publication. All rights reserved.
        </div>
      </footer>
    </main>
  );
}