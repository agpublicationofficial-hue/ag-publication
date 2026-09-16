export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#211f1b]">

      {/* NAVBAR */}
      <nav className="border-b border-black/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <a href="/" className="text-xl font-semibold tracking-[0.08em]">
            A&G
            <span className="ml-2 font-light tracking-[0.18em]">
              PUBLICATION
            </span>
          </a>

          <div className="hidden items-center gap-8 text-sm md:flex">
            <a href="/" className="transition hover:opacity-50">Home</a>
            <a href="/books" className="transition hover:opacity-50">Books</a>
            <a href="/authors" className="transition hover:opacity-50">Authors</a>
            <a href="/publishing" className="transition hover:opacity-50">Publishing</a>
            <a href="/packages" className="transition hover:opacity-50">Packages</a>
          </div>

          <a
            href="/contact"
            className="rounded-full bg-[#211f1b] px-5 py-2.5 text-sm text-white"
          >
            Start Here
          </a>
        </div>
      </nav>


      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-20 md:pb-28 md:pt-28">

        <div className="grid items-end gap-12 lg:grid-cols-[1.5fr_0.5fr]">

          <div>
            <p className="mb-7 text-xs font-semibold uppercase tracking-[0.35em] text-[#777168]">
              The First Page
            </p>

            <h1 className="max-w-5xl text-6xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-8xl">
              Tell us the story
              <br />
              <span className="font-serif font-normal italic">
                behind your book.
              </span>
            </h1>
          </div>

          <div className="max-w-xs lg:pb-2">
            <div className="mb-5 h-px w-14 bg-[#211f1b]" />

            <p className="text-sm leading-6 text-[#6f6a61]">
              No complicated forms. No unnecessary questions.
              Just tell us where you are, what you are creating,
              and where you want your book to go.
            </p>
          </div>

        </div>
      </section>


      {/* EDITORIAL INTRO */}
      <section className="border-y border-black/10 bg-[#211f1b] text-[#f5f2eb]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-3 md:py-20">

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              01
            </p>

            <h2 className="mt-5 text-2xl font-medium">
              An idea
              <br />
              is enough.
            </h2>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              02
            </p>

            <h2 className="mt-5 text-2xl font-medium">
              A manuscript
              <br />
              is welcome.
            </h2>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              03
            </p>

            <h2 className="mt-5 text-2xl font-medium">
              A conversation
              <br />
              starts it all.
            </h2>
          </div>

        </div>
      </section>


      {/* MAIN AUTHOR BRIEF */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">

        <div className="grid gap-16 lg:grid-cols-[0.7fr_1.3fr]">

          {/* LEFT */}
          <div className="lg:sticky lg:top-10 lg:self-start">

            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#827d73]">
              Author Brief
            </p>

            <h2 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">
              Before we talk
              <br />
              about publishing,
              <br />
              <span className="font-serif font-normal italic">
                tell us about you.
              </span>
            </h2>

            <p className="mt-7 max-w-sm text-sm leading-7 text-[#706b62]">
              This is your space. There is no perfect answer.
              Give us enough to understand your book and we'll
              take it from there.
            </p>

            <div className="mt-12 border-l border-black/15 pl-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8a857b]">
                A&G Note
              </p>

              <p className="mt-3 font-serif text-lg italic leading-7">
                “Every published book once existed only as an idea.”
              </p>
            </div>

          </div>


          {/* RIGHT FORM */}
          <div className="border-t border-black/15">

            {/* PERSONAL */}
            <div className="border-b border-black/10 py-10">

              <div className="mb-8 flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#888278]">
                    About You
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold">
                    Let&apos;s put a name to the story.
                  </h3>
                </div>

                <span className="text-sm text-[#aaa59b]">01</span>
              </div>

              <div className="grid gap-8 md:grid-cols-2">

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-[#817c72]">
                    Your name
                  </label>

                  <input
                    type="text"
                    placeholder="What should we call you?"
                    className="mt-3 w-full border-b border-black/20 bg-transparent px-0 py-3 text-lg outline-none transition placeholder:text-[#aaa59e] focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-[#817c72]">
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="Where can we reach you?"
                    className="mt-3 w-full border-b border-black/20 bg-transparent px-0 py-3 text-lg outline-none transition placeholder:text-[#aaa59e] focus:border-black"
                  />
                </div>

              </div>

            </div>


            {/* BOOK TYPE */}
            <div className="border-b border-black/10 py-10">

              <div className="mb-8 flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#888278]">
                    Your Book
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold">
                    What kind of world are you creating?
                  </h3>
                </div>

                <span className="text-sm text-[#aaa59b]">02</span>
              </div>


              <div className="grid gap-3 sm:grid-cols-2">

                {[
                  "Fiction",
                  "Non-Fiction",
                  "Self-Help",
                  "Poetry",
                  "Biography / Memoir",
                  "Something Different",
                ].map((type) => (
                  <label
                    key={type}
                    className="group flex cursor-pointer items-center justify-between border border-black/10 bg-white/40 px-5 py-4 transition hover:border-black/40 hover:bg-white"
                  >
                    <span className="text-sm">{type}</span>

                    <input
                      type="radio"
                      name="bookType"
                      className="h-4 w-4"
                    />
                  </label>
                ))}

              </div>

            </div>


            {/* STAGE */}
            <div className="border-b border-black/10 py-10">

              <div className="mb-8 flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#888278]">
                    Your Stage
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold">
                    How far has the idea travelled?
                  </h3>
                </div>

                <span className="text-sm text-[#aaa59b]">03</span>
              </div>


              <div className="relative">

                <div className="absolute left-0 right-0 top-4 hidden h-px bg-black/10 md:block" />

                <div className="grid gap-5 md:grid-cols-4">

                  {[
                    ["01", "Just an idea"],
                    ["02", "I am writing"],
                    ["03", "Manuscript ready"],
                    ["04", "Already published"],
                  ].map(([number, stage]) => (
                    <label
                      key={number}
                      className="relative cursor-pointer"
                    >
                      <div className="relative flex items-center gap-3 md:block">

                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/20 bg-[#f5f2eb] text-xs">
                          {number}
                        </span>

                        <input
                          type="radio"
                          name="stage"
                          className="hidden"
                        />

                        <span className="mt-3 block text-sm text-[#5f5a52]">
                          {stage}
                        </span>

                      </div>
                    </label>
                  ))}

                </div>

              </div>

            </div>


            {/* STORY */}
            <div className="border-b border-black/10 py-10">

              <div className="mb-8 flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#888278]">
                    Your Story
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold">
                    Give us the first chapter.
                  </h3>
                </div>

                <span className="text-sm text-[#aaa59b]">04</span>
              </div>

              <textarea
                rows={8}
                placeholder="What is your book about? Why did you decide to write it? Tell us anything you think we should know..."
                className="w-full resize-none border border-black/10 bg-white/50 p-5 text-base leading-7 outline-none transition placeholder:text-[#aaa59e] focus:border-black/30"
              />

            </div>


            {/* CONTACT */}
            <div className="border-b border-black/10 py-10">

              <div className="mb-8 flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#888278]">
                    Next Step
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold">
                    How should we reach you?
                  </h3>
                </div>

                <span className="text-sm text-[#aaa59b]">05</span>
              </div>


              <div className="flex flex-wrap gap-3">

                {["Email", "WhatsApp", "Phone Call"].map((method) => (
                  <label
                    key={method}
                    className="cursor-pointer border border-black/15 px-6 py-3 text-sm transition hover:border-black hover:bg-white"
                  >
                    <input
                      type="radio"
                      name="contactMethod"
                      className="mr-2"
                    />

                    {method}
                  </label>
                ))}

              </div>

              <div className="mt-8">
                <label className="text-xs uppercase tracking-[0.18em] text-[#817c72]">
                  Phone / WhatsApp
                </label>

                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  className="mt-3 w-full border-b border-black/20 bg-transparent px-0 py-3 text-lg outline-none transition placeholder:text-[#aaa59e] focus:border-black"
                />
              </div>

            </div>


            {/* SUBMIT */}
            <div className="py-10">

              <button
                type="button"
                className="group flex w-full items-center justify-between bg-[#211f1b] px-7 py-5 text-left text-white transition hover:bg-[#35322d]"
              >
                <span>
                  <span className="block text-xs uppercase tracking-[0.2em] text-white/45">
                    Ready when you are
                  </span>

                  <span className="mt-1 block text-lg">
                    Send My Story
                  </span>
                </span>

                <span className="text-2xl transition-transform group-hover:translate-x-2">
                  →
                </span>
              </button>

              <p className="mt-5 text-center text-xs text-[#918c83]">
                We&apos;ll use your details only to respond to your enquiry.
              </p>

            </div>

          </div>
        </div>
      </section>


      {/* FINAL CTA */}
      <section className="border-t border-black/10 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">

          <div className="grid items-end gap-10 md:grid-cols-2">

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#89847a]">
                Still thinking?
              </p>

              <h2 className="mt-5 text-5xl font-semibold leading-[1] tracking-tight md:text-6xl">
                Your book doesn&apos;t
                <br />
                have to wait.
              </h2>
            </div>

            <div className="md:justify-self-end md:text-right">

              <p className="max-w-sm text-sm leading-7 text-[#706b62]">
                Explore our publishing options and find a path that fits
                your book, your goals and your stage.
              </p>

              <a
                href="/packages"
                className="mt-7 inline-flex items-center gap-3 border-b border-black pb-2 text-sm font-medium"
              >
                Explore Publishing Packages
                <span>→</span>
              </a>

            </div>

          </div>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-black/10 bg-[#f5f2eb]">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-6 py-10 md:flex-row md:items-center">

          <div>
            <div className="text-xl font-semibold tracking-wide">
              A&G
              <span className="ml-2 font-light">
                PUBLICATION
              </span>
            </div>

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
          </div>

        </div>

      </footer>

    </main>
  );
}