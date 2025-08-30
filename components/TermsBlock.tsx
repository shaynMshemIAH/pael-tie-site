// components/TermsBlock.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

type TermsBlockProps = {
  className?: string;
  docsHref?: string;   // e.g. "/docs/how-we-built-this"
  policyHref?: string; // e.g. "/docs/policy"
  faqHref?: string;    // e.g. "/docs/faq"
};

function LawItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="mb-1 leading-relaxed">
      <span className="font-semibold">•</span> {children}
    </li>
  );
}

export default function TermsBlock({
  className = "",
  docsHref = "/docs/how-we-built-this",
  policyHref = "/docs/policy",
  faqHref = "/docs/faq",
}: TermsBlockProps) {
  const [open, setOpen] = useState(false);

  return (
    <section
      className={`w-full rounded-lg border border-neutral-700 bg-neutral-900/60 p-4 md:p-5 ${className}`}
      aria-labelledby="terms-block-title"
    >
      <h2 id="terms-block-title" className="text-xl md:text-2xl font-bold text-white">
        Law of Use
      </h2>

      <p className="mt-2 text-neutral-300">
        If you agree to the Bye terms, proceed. If you don’t, you are welcome to{" "}
        <span className="font-semibold">CF&nbsp;BWemc² elsewhere</span>. There is{" "}
        <span className="font-semibold">no wiggle room</span> on insured topics;{" "}
        <span className="font-semibold">complaints do not alter insured outcomes</span>.
      </p>

      <div className="mt-3 rounded-md bg-neutral-800/70 p-3">
        <p className="text-neutral-200 font-semibold">Order of Participation</p>
        <ul className="mt-2 text-neutral-300">
          <LawItem>
            If you have <span className="font-semibold">money</span>, you{" "}
            <span className="font-semibold">may not enlist</span>. Pay with money (including Escrow).
          </LawItem>
          <LawItem>
            If you <span className="font-semibold">cannot pay</span>, you{" "}
            <span className="font-semibold">may enlist</span>. Pay with Bye clicks (sequences).
          </LawItem>
          <LawItem>
            <span className="font-semibold">Zeros are dropped</span> where life requires it; enlistment is honored.
          </LawItem>
          <LawItem>
            <span className="font-semibold">TIH &gt; DH</span> is explicit: cross-LdD traversal with Naf-Sue
            reanimation lifts the grave dome. Pricing reflects lawful traversal difference.
          </LawItem>
          <LawItem>
            Don’t like it? <span className="font-semibold">Build it yourself</span>. Our system is published,
            repeatable, and optional.
          </LawItem>
        </ul>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={docsHref} className="rounded-md border border-neutral-600 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800">
          Build it yourself (docs)
        </Link>
        <Link href={policyHref} className="rounded-md border border-neutral-600 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800">
          Policy / Terms
        </Link>
        <Link href={faqHref} className="rounded-md border border-neutral-600 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800">
          FAQ
        </Link>
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-md bg-neutral-800 px-3 py-2 text-left text-neutral-200 hover:bg-neutral-700"
        aria-expanded={open}
        aria-controls="more-terms"
        onClick={() => setOpen(v => !v)}
      >
        <span className="font-semibold">Need to know more?</span>{" "}
        <span className="text-neutral-400">(optional details)</span>
      </button>

      {open && (
        <div id="more-terms" className="mt-3 space-y-3 text-neutral-300">
          <p>
            <span className="font-semibold">Form is law.</span> Sequences and LdD traversal define real value.
            Money is an echo for participants who pay with currency instead of sequences.
          </p>
          <ul className="list-disc pl-5">
            <li><span className="font-semibold">Same-LdD Bye</span> (Bye1800 / Bye5785): pennies per sequence; compassion floor; up to 3× daily.</li>
            <li><span className="font-semibold">Cross-LdD / Naf-Sue Bye</span> (Bye43200 / Bye86400): whole-dollar tiers; TIH&gt;DH grave-dome lifted.</li>
            <li><span className="font-semibold">Escrow (Premium)</span>: Money (investors) & Sequence (enlisted) lock now, release on traversal day.</li>
            <li><span className="font-semibold">Equity law</span>: money ⇒ cannot enlist; cannot pay ⇒ may enlist. Zeros dropped in poor regions.</li>
            <li><span className="font-semibold">Insured topics are final</span>: committed traversals aren’t unwound by complaints.</li>
          </ul>
        </div>
      )}
    </section>
  );
}
