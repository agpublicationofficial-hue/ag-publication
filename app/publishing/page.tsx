const services = [
  {
    number: "01",
    title: "Manuscript Evaluation",
    text: "We review your manuscript and help you understand its publishing potential, genre, positioning and next steps.",
  },
  {
    number: "02",
    title: "Editing & Proofreading",
    text: "Improve clarity, consistency, grammar and readability while preserving the author's unique voice.",
  },
  {
    number: "03",
    title: "Cover & Interior Design",
    text: "Create a professional visual identity for your book with thoughtful cover and interior layouts.",
  },
  {
    number: "04",
    title: "ISBN & Publishing",
    text: "Prepare your book for publication with the essential publishing processes and metadata.",
  },
  {
    number: "05",
    title: "Distribution",
    text: "Help make your published book available through relevant online and offline distribution channels.",
  },
  {
    number: "06",
    title: "Author Support",
    text: "Stay connected with a dedicated publishing workflow from manuscript submission to your finished book.",
  },
];

export default function PublishingPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#171717]">
      {/* HEADER */}
      <header className="border-b border-black/10 bg-[#f7f4ee]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <a href="/" className="group">
            <p className="text-xl font-bold tracking-[0.18em]">A&G</p>
            <p className="text-[10px] tracking-[0.32em] text-black/50">
              PUBLICATION
            </p>
          </a>

          <div className="hidden items-center gap-8 text-sm md:flex">
            <a href="/" className="hover:opacity-60">
              Home
            </a>
            <a href="/books" className="hover:opacity-60">
              Books
            </a>
            <a href="/publishing" className="font-medium">
              Publishing
            </a>
          </div>

          <a
            href="#start"
            className="rounded-full bg-[#171717] px-5 py-2.5 text-sm text-white transition hover:bg-black/75"
          >
            Start Publishing
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/45">
              Publishing Services
            </p>

            <h1 className="mt-5 max-w-5xl font-serif text-6xl leading-[0.95] tracking-[-0.04em] md:text-8xl">
              From your
              <br />
              <span className="italic font-normal">words</span> to a book.
            </h1>
          </div>

          <div>
            <p className="text-lg leading-8 text-black/60">
              Publishing a book involves much more than printing pages. A&G
              Publication brings the essential pieces together so authors can
              focus on what matters most — their story.
            </p>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-black/40">
                Step 01
              </p>
              <h3 className="mt-4 font-serif text-3xl">Create</h3>
              <p className="mt-3 text-sm leading-6 text-black/50">
                Shape your manuscript into a polished and publish-ready work.
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-black/40">
                Step 02
              </p>
              <h3 className="mt-4 font-serif text-3xl">Publish</h3>
              <p className="mt-3 text-sm leading-6 text-black/50">
                Design, prepare and publish your book professionally.
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-black/40">
                Step 03
              </p>
              <h3 className="mt-4 font-serif text-3xl">Reach</h3>
              <p className="mt-3 text-sm leading-6 text-black/50">
                Make your book accessible to readers through distribution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/45">
            What We Offer
          </p>

          <h2 className="mt-4 font-serif text-5xl leading-tight md:text-6xl">
            Everything your book needs.
          </h2>
        </div>

        <div className="mt-16 grid border-t border-black/10 md:grid-cols-2">
          {services.map((service) => (
            <article
              key={service.number}
              className="border-b border-black/10 p-8 md:p-10 md:odd:border-r"
            >
              <div className="flex items-start justify-between">
                <span className="text-sm text-black/35">{service.number}</span>

                <span className="text-xl text-black/30">↗</span>
              </div>

              <h3 className="mt-12 font-serif text-3xl">
                {service.title}
              </h3>

              <p className="mt-4 max-w-md text-sm leading-7 text-black/55">
                {service.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* WHY A&G */}
      <section className="bg-[#171717] text-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Why A&G
            </p>

            <h2 className="mt-5 font-serif text-5xl leading-tight md:text-6xl">
              Publishing should feel like a journey, not a maze.
            </h2>
          </div>

          <div className="flex flex-col justify-end">
            {[
              "Transparent publishing workflow",
              "Professional book presentation",
              "Author-focused support",
              "Clear communication throughout",
            ].map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-5 border-t border-white/15 py-5"
              >
                <span className="text-sm text-white/30">
                  0{index + 1}
                </span>

                <span className="text-lg text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="start" className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl bg-[#d9cdb9] px-8 py-20 text-center md:px-16">
          <p className="text-xs uppercase tracking-[0.3em] text-black/45">
            Ready when you are
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-5xl leading-tight md:text-6xl">
            Have a manuscript waiting?
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-black/55">
            Take the first step toward turning your manuscript into a
            professionally published book.
          </p>

          <button className="mt-9 rounded-full bg-[#171717] px-8 py-4 text-sm font-medium text-white transition hover:bg-black/75">
            Submit Your Manuscript
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-black/45 md:flex-row md:items-center md:justify-between lg:px-10">
          <p>© 2026 A&G Publication</p>

          <div className="flex gap-6">
            <a href="/" className="hover:text-black">
              Home
            </a>
            <a href="/books" className="hover:text-black">
              Books
            </a>
            <a href="/publishing" className="hover:text-black">
              Publishing
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}