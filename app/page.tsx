"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Target,
  FolderKanban,
  FileText,
  LayoutDashboard,
  ArrowRight,
  CheckCircle2,
  Zap,
  Clock,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between bg-white/80 backdrop-blur-md px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900">
          CentonisCC
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Get started — it&apos;s free
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative flex flex-col items-center px-6 pt-40 pb-24 text-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-medium text-zinc-600"
      >
        <Zap className="h-3.5 w-3.5" />
        Free forever. No catch.
      </motion.div>

      <motion.h1
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={1}
        className="max-w-3xl text-5xl font-bold leading-[1.1] tracking-tight text-zinc-900 sm:text-6xl md:text-7xl"
      >
        Your business,
        <br />
        not your to-do list.
      </motion.h1>

      <motion.p
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={2}
        className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-500"
      >
        CentonisCC is the workspace for founders who want to move fast, stay
        focused, and actually hit their goals — without drowning in tools.
      </motion.p>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={3}
      >
        <Link
          href="/signup"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Get started free
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>

      {/* App screenshot */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="mt-20 w-full max-w-5xl"
        style={{ perspective: 1200 }}
      >
        <motion.div
          className="rounded-2xl border border-zinc-200 bg-white p-1 overflow-hidden shadow-xl"
          whileHover={{ y: -8, scale: 1.01, boxShadow: "0 32px 64px -16px rgba(0,0,0,0.15)" }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <img
            src="/dashboard_screenshot.png"
            alt="CentonisCC Dashboard"
            className="w-full h-auto rounded-xl"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

function ProblemSection() {
  const problems = [
    {
      title: "Notion is overkill.",
      desc: "You spend more time building your system than running your business.",
    },
    {
      title: "ClickUp is a maze.",
      desc: "47 features you'll never use. Still can't find your tasks.",
    },
    {
      title: "Google Docs is chaos.",
      desc: "Every file everywhere and nothing connected.",
    },
  ];

  return (
    <section className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="mb-16 text-center text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl"
        >
          You&apos;ve tried everything.
        </motion.h2>

        <div className="grid gap-12 md:grid-cols-3">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              custom={i + 1}
              className="text-center"
            >
              <h3 className="text-lg font-semibold text-zinc-900">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  const features = [
    {
      icon: <Target className="h-5 w-5" />,
      title: "Goals",
      desc: "Daily, weekly, monthly, quarterly, yearly. One hierarchy, always clear.",
    },
    {
      icon: <FolderKanban className="h-5 w-5" />,
      title: "Projects",
      desc: "Track what you're building. Status, links, and nothing else you don't need.",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Notes",
      desc: "Rich text that doesn't get in your way. Write like a doc, search like a database.",
    },
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      title: "Dashboard",
      desc: "See how your week is going at a glance. No configuration required.",
    },
  ];

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="mb-4 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Just enough power. Zero waste.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-500">
            One place for your goals, your tasks, your projects, and your notes.
            <br className="hidden sm:block" />
            Set it up in 5 minutes. Actually use it.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              custom={i + 1}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-lg"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty(
                  "--x",
                  `${e.clientX - rect.left}px`
                );
                e.currentTarget.style.setProperty(
                  "--y",
                  `${e.clientY - rect.top}px`
                );
              }}
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(600px_circle_at_var(--x)_var(--y),rgba(0,0,0,0.03),transparent_80%)]" />
              <div className="relative z-10">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-zinc-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AppPreview() {
  return (
    <section className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="mb-4 text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Built for the way you actually work
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Out-of-the-box systems that
            <br className="hidden sm:block" />
            truly power growth.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-500">
            No setup, no configuration, no learning curve.
            <br className="hidden sm:block" />
            Everything you need is already there the moment you sign up.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={1}
          className="relative mt-12 mx-auto"
          style={{ height: "clamp(520px, 82vw, 1100px)" }}
        >
          <div className="absolute left-1/2 top-1/2 w-[80%] max-w-[1000px] -translate-x-[62%] -translate-y-[48%] -rotate-3 rounded-2xl border border-zinc-200 bg-white p-1 shadow-xl transition-transform duration-500 hover:-rotate-1 hover:scale-[1.02]">
            <img
              src="/Weekly.png"
              alt="CentonisCC weekly goals"
              className="w-full h-auto rounded-xl"
            />
          </div>
          <div className="absolute left-1/2 top-1/2 w-[80%] max-w-[1000px] -translate-x-[38%] -translate-y-[52%] rotate-2 rounded-2xl border border-zinc-200 bg-white p-1 shadow-2xl transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]">
            <img
              src="/Notettaking.png"
              alt="CentonisCC note-taking"
              className="w-full h-auto rounded-xl"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ManifestoSection() {
  const lines = [
    "We don't do AI features.",
    "We don't do integrations with 300 apps.",
    "We don't charge per seat.",
    "We don't have a free trial.",
  ];

  return (
    <section className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-32">
      <div className="mx-auto max-w-2xl text-center">
        {lines.map((line, i) => (
          <motion.p
            key={line}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            custom={i}
            className="mb-4 text-xl font-medium leading-relaxed text-zinc-400 sm:text-2xl"
          >
            {line}
          </motion.p>
        ))}

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          custom={lines.length}
          className="mt-10 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl"
        >
          It&apos;s just free.
        </motion.p>
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          custom={lines.length + 1}
          className="mt-4 text-base text-zinc-500"
        >
          Because small businesses deserve good tools too.
        </motion.p>
      </div>
    </section>
  );
}

function FeatureRows() {
  const rows = [
    {
      title: "Write anything. Find everything.",
      desc: "A rich text editor with slash commands, drag handles, and mentions — like the notes app you wish you had. No folders to organize, no tags to maintain.",
      image: "/water.jpg",
    },
    {
      title: "Your week at a glance. No setup needed.",
      desc: "A dashboard that shows effort, progress, and priorities the moment you open it. No widgets to configure, no dashboards to build.",
      image: "/darkmountians1.jpeg",
    },
    {
      title: "Know what you're working toward. Every day.",
      desc: "Set yearly goals, break them into quarters, months, weeks, and daily tasks. Everything cascades down so you always know why today's work matters.",
      image: "/desert.jpg",
    },
  ];

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl space-y-32">
        {rows.map((row, i) => (
          <motion.div
            key={row.title}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className={`flex flex-col items-center gap-12 md:flex-row ${
              i % 2 !== 0 ? "md:flex-row-reverse" : ""
            }`}
          >
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                {row.title}
              </h3>
              <p className="text-base leading-relaxed text-zinc-500">
                {row.desc}
              </p>
            </div>
            <div className="flex-1">
              <div className="aspect-[4/3] rounded-xl bg-transparent overflow-hidden">
                <img
                  src={row.image}
                  alt={row.title}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function WhoItsFor() {
  const audiences = [
    {
      icon: <Zap className="h-4 w-4" />,
      text: "Founders who are just getting started.",
    },
    {
      icon: <Clock className="h-4 w-4" />,
      text: "Solo operators moving too fast for spreadsheets.",
    },
    {
      icon: <CheckCircle2 className="h-4 w-4" />,
      text: "Small teams who need to stay aligned without a PM tool.",
    },
  ];

  return (
    <section className="border-t border-zinc-100 px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="mb-10 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl"
        >
          Built for builders.
        </motion.h2>

        <div className="space-y-4">
          {audiences.map((a, i) => (
            <motion.div
              key={a.text}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              custom={i + 1}
              className="inline-flex items-center gap-3 text-base text-zinc-600"
            >
              <span className="text-zinc-400">{a.icon}</span>
              {a.text}
            </motion.div>
          ))}
        </div>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          custom={audiences.length + 1}
          className="mt-8 text-sm text-zinc-400"
        >
          Not for enterprises. Not for agencies. Not for people who like
          configuring software.
        </motion.p>
      </div>
    </section>
  );
}

function CTAFooter() {
  return (
    <section className="bg-zinc-50 px-6 py-32">
      <div className="mx-auto max-w-2xl text-center">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl"
        >
          Start building your business today.
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={1}
          className="mt-4 text-base text-zinc-500"
        >
          No credit card. No complexity. No catch.
        </motion.p>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={2}
        >
          <Link
            href="/signup"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-100 px-6 py-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <span className="text-sm font-semibold text-zinc-900">CentonisCC</span>
        <span className="text-xs text-zinc-400">Made for builders.</span>
        <Link
          href="/login"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
        >
          Log in
        </Link>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Navbar />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <AppPreview />
      <ManifestoSection />
      <FeatureRows />
      <WhoItsFor />
      <CTAFooter />
      <Footer />
    </div>
  );
}
