import Link from "next/link";

const benefits = [
  {
    number: "01",
    title: "Write Freely",
    text: "Bring your ideas, experiences and imagination to the page without worrying about perfection.",
  },
  {
    number: "02",
    title: "Get Discovered",
    text: "Selected writers get an opportunity to have their work reviewed by the A&G Publication team.",
  },
  {
    number: "03",
    title: "Build Your Author Journey",
    text: "Turn your writing habit into a meaningful publishing journey with professional guidance.",
  },
];

export default function WritingChallenge() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#171717]">
      {/* NAVBAR */}
      <nav className="border-b border-black/10 bg-[#f6f3ed]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="shrink-0">
            <p className="text-xl font-bold tracking-[0.18em]">A&G</p>
            <p className="text-[10px] tracking-[0.32em] text-black/55">
              PUBLICATION
            </p>
          </Link>

          <div className="hidden items-center gap-7 text-sm md:flex">
            <Link href="/books" className="hover:text-black/50">
              Books
            </Link>

            <Link href="/publishing" className="hover:text-black/50">
              Publishing Services
            </Link>

            <Link href="/about" className="hover:text-black/50">
              About Us
            </Link>

            <Link
              href="/writing-challenge"
              className="font-medium"
            >
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
          A&G Writing Challenge
        </p>

        <h1 className="mt-5 max-w-5xl font-serif text-5xl leading-tight sm:text-6xl lg:text-8xl">
          Write the story
          <br />
          <span className="italic font-normal">only you can tell.</span>
        </h1>

        <p className="mt-8 max-w-2xl text-base leading-7 text-black/60">
          A&G Writing Challenge is an opportunity for writers to put their
          ideas into words, explore their creative voice and take the first
          step toward becoming a published author.
        </p>

        <Link
          href="/submit-manuscript"
          className="mt-9 inline-block rounded-full bg-[#171717] px-7 py-3.5 text-sm font-medium text-white"
        >
          Start Writing →
        </Link>
      </section>

      {/* INTRO */}
      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-24">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">
              The Challenge
            </p>

            <h2 className="mt-4 font-serif text-5xl leading-tight">
              Every great book begins with a page.
            </h2>
          </div>

          <div className="text-lg leading-8 text-black/65">
            <p>
              You don't need to have everything figured out before you start.
              Whether you're writing fiction, poetry, self-help, memoir,
              essays or something completely different, the first step is
              simply to begin.
            </p>

            <p className="mt-6">
              Use this challenge as a reason to write consistently, develop
              your voice and turn the ideas in your head into something
              tangible.
            </p>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">
          Why Join?
        </p>

        <h2 className="mt-4 max-w-2xl font-serif text-5xl leading-tight">
          More than a writing challenge.
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.number}
              className="border border-black/10 bg-white p-8"
            >
              <p className="text-sm text-black/35">{benefit.number}</p>

              <h3 className="mt-12 text-2xl font-medium">
                {benefit.title}
              </h3>

              <p className="mt-4 text-sm leading-6 text-black/55">
                {benefit.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#171717] text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            How It Works
          </p>

          <h2 className="mt-4 font-serif text-5xl leading-tight">
            Three simple steps.
          </h2>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              [
                "01",
                "Write",
                "Choose an idea and start writing. Focus on expressing your story.",
              ],
              [
                "02",
                "Submit",
                "When your manuscript is ready, submit it through our publishing form.",
              ],
              [
                "03",
                "Grow",
                "Our team can guide you through the next stage of your publishing journey.",
              ],
            ].map(([number, title, text]) => (
              <div
                key={number}
                className="border-t border-white/15 pt-7"
              >
                <p className="text-sm text-white/35">{number}</p>

                <h3 className="mt-8 text-2xl font-medium">{title}</h3>

                <p className="mt-4 text-sm leading-6 text-white/50">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl bg-[#d9cdb9] px-8 py-20 text-center md:px-16">
          <p className="text-xs uppercase tracking-[0.3em] text-black/45">
            Your Story Starts Here
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-5xl leading-tight md:text-6xl">
            Stop waiting for
            <br />
            the perfect time to write.
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