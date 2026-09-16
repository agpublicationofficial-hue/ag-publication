export default function TrackOrderPage() {
  const stages = [
    {
      number: "01",
      title: "Manuscript Received",
      text: "Your manuscript has reached our publishing desk.",
    },
    {
      number: "02",
      title: "Editorial Review",
      text: "The manuscript is being reviewed and prepared.",
    },
    {
      number: "03",
      title: "Design & Production",
      text: "Cover, interior formatting and production are underway.",
    },
    {
      number: "04",
      title: "Publishing",
      text: "Your book is being prepared for its publishing release.",
    },
    {
      number: "05",
      title: "Live",
      text: "Your book is published and ready for readers.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#211f1b]">

      {/* NAVBAR */}
      <nav className="border-b border-black/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <a
            href="/"
            className="shrink-0"
          >
            <img
              src="/ag-logo.png"
              alt="A&G Publication"
              className="h-auto w-[150px] object-contain"
            />
          </a>

          <div className="hidden gap-8 text-sm md:flex">
            <a href="/" className="hover:opacity-50">
              Home
            </a>
            <a href="/books" className="hover:opacity-50">
              Books
            </a>
            <a href="/authors" className="hover:opacity-50">
              Authors
            </a>
            <a href="/publishing" className="hover:opacity-50">
              Publishing
            </a>
            <a href="/packages" className="hover:opacity-50">
              Packages
            </a>
          </div>

          <a
            href="/contact"
            className="rounded-full bg-[#211f1b] px-5 py-2.5 text-sm text-white"
          >
            Contact Us
          </a>
        </div>
      </nav>


      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-20 md:pb-24 md:pt-28">

        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#827d73]">
              Publishing Journey
            </p>

            <h1 className="mt-6 text-6xl font-semibold leading-[0.94] tracking-[-0.04em] md:text-8xl">
              Know where
              <br />
              your book
              <br />
              <span className="font-serif font-normal italic">
                stands.
              </span>
            </h1>
          </div>

          <div className="flex items-end">
            <p className="max-w-sm text-sm leading-7 text-[#6f6a61]">
              Your manuscript has a journey from the first submission
              to the moment it reaches a reader. Follow every important
              stage in one place.
            </p>
          </div>

        </div>
      </section>


      {/* TRACKER */}
      <section className="border-y border-black/10 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">

          <div className="mx-auto max-w-3xl">

            <div className="mb-12 text-center">

              <p className="text-xs uppercase tracking-[0.3em] text-[#89847a]">
                Your Private Tracker
              </p>

              <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
                Enter your publishing ID
              </h2>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#777168]">
                Use the unique ID shared with you by A&G Publication
                to view your current publishing progress.
              </p>

            </div>


            {/* SEARCH BOX */}
            <div className="border border-black/10 bg-[#f5f2eb] p-3 md:p-4">

              <div className="flex flex-col gap-3 sm:flex-row">

                <input
                  type="text"
                  placeholder="Example: AG-2026-001"
                  className="min-h-[56px] flex-1 bg-white px-5 text-sm outline-none placeholder:text-[#aaa59c]"
                />

                <button
                  type="button"
                  className="min-h-[56px] bg-[#211f1b] px-8 text-sm font-medium text-white transition hover:bg-[#35322d]"
                >
                  Track Journey →
                </button>

              </div>

            </div>


            <p className="mt-4 text-center text-xs text-[#969087]">
              Don&apos;t have your publishing ID? Contact the A&G team.
            </p>

          </div>

        </div>

      </section>


      {/* SAMPLE STATUS */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">

        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#89847a]">
              Example Journey
            </p>

            <h2 className="mt-4 text-4xl font-semibold md:text-5xl">
              From manuscript
              <br />
              <span className="font-serif font-normal italic">
                to published.
              </span>
            </h2>
          </div>

          <div className="text-sm text-[#777168]">
            <p>Publishing ID</p>
            <p className="mt-1 font-medium text-[#211f1b]">
              AG-2026-001
            </p>
          </div>

        </div>


        {/* PROGRESS LINE */}
        <div className="relative">

          <div className="absolute bottom-0 left-[19px] top-0 w-px bg-black/10 md:left-1/2" />

          <div className="space-y-0">

            {stages.map((stage, index) => (
              <div
                key={stage.number}
                className={`relative grid gap-8 py-9 md:grid-cols-2 ${
                  index % 2 === 0 ? "" : "md:text-right"
                }`}
              >

                <div
                  className={`${
                    index % 2 === 0
                      ? "md:pr-20"
                      : "md:order-2 md:pl-20"
                  }`}
                >

                  <p className="text-xs uppercase tracking-[0.2em] text-[#969087]">
                    Stage {stage.number}
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold">
                    {stage.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#777168]">
                    {stage.text}
                  </p>

                </div>


                <div
                  className={`absolute left-0 top-9 flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-[#f5f2eb] text-xs font-medium md:left-1/2 md:-translate-x-1/2`}
                >
                  {index < 2 ? "✓" : stage.number}
                </div>

              </div>
            ))}

          </div>

        </div>

      </section>


      {/* HELP SECTION */}
      <section className="border-y border-black/10 bg-[#211f1b] text-white">

        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-24">

          <div>

            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Need Assistance?
            </p>

            <h2 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">
              Not sure what
              <br />
              your status means?
            </h2>

          </div>

          <div>

            <p className="max-w-md text-sm leading-7 text-white/55">
              Our publishing team can help you understand your current
              stage, upcoming steps and anything you need to complete
              from your side.
            </p>

            <a
              href="/contact"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-medium text-[#211f1b]"
            >
              Talk to A&G
              <span>→</span>
            </a>

          </div>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-black/10">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-6 py-10 md:flex-row md:items-center">

          <div>

            <a
              href="/"
              className="block w-fit"
            >
              <img
                src="/ag-logo.png"
                alt="A&G Publication"
                className="h-auto w-[150px] object-contain"
              />
            </a>

            <p className="mt-2 text-sm text-[#817c73]">
              Stories begin somewhere.
            </p>

          </div>

          <div className="flex flex-wrap gap-6 text-sm text-[#6f6a61]">
            <a href="/">Home</a>
            <a href="/books">Books</a>
            <a href="/authors">Authors</a>
            <a href="/publishing">Publishing</a>
            <a href="/packages">Packages</a>
            <a href="/contact">Contact</a>
          </div>

        </div>

      </footer>

    </main>
  );
}