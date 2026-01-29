import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import { motion } from "framer-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type PinTimings = {
  fadeInEnd: number;
  holdEnd: number;
  fadeOutEnd: number;
};

const TIMINGS: PinTimings = {
  fadeInEnd: 0.2,
  holdEnd: 0.7,
  fadeOutEnd: 0.9,
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function phaseOpacity(progress: number) {
  const p = clamp01(progress);
  if (p <= TIMINGS.fadeInEnd) return p / TIMINGS.fadeInEnd;
  if (p <= TIMINGS.holdEnd) return 1;
  if (p <= TIMINGS.fadeOutEnd)
    return 1 - (p - TIMINGS.holdEnd) / (TIMINGS.fadeOutEnd - TIMINGS.holdEnd);
  return 0;
}

function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
}

type UsePinnedSectionOptions = {
  id: string;
  pinRef: React.RefObject<HTMLElement | null>;
  onUpdate: (progress: number) => void;
  pinDurationVh?: number;
};

function usePinnedSection(opts: UsePinnedSectionOptions) {
  useEffect(() => {
    const el = opts.pinRef.current;
    if (!el) return;

    const st = ScrollTrigger.create({
      id: opts.id,
      trigger: el,
      start: "top top",
      end: `+=${(opts.pinDurationVh ?? 200) * (window.innerHeight / 100)}`,
      pin: true,
      pinSpacing: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        opts.onUpdate(self.progress);
      },
    });

    return () => {
      st.kill();
    };
  }, [opts]);
}

function PinnedHero() {
  const ref = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  usePinnedSection({
    id: "hero",
    pinRef: ref,
    pinDurationVh: 200,
    onUpdate: (p) => {
      const opacity = phaseOpacity(p);
      if (contentRef.current) {
        contentRef.current.style.opacity = String(opacity);
        contentRef.current.style.transform = `translateY(${(1 - opacity) * 10}px)`;
      }
    },
  });

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] bg-background text-foreground"
      data-testid="section-hero"
    >
      <div className="pointer-events-none absolute inset-0 grain" />
      <div className="mx-auto flex min-h-[100svh] max-w-6xl items-center px-6">
        <div ref={contentRef} className="w-full" style={{ opacity: 0 }}>
          <h1
            className="font-serif text-balance text-5xl leading-[1.04] tracking-[-0.02em] sm:text-6xl md:text-7xl"
            data-testid="text-hero-title"
          >
            Quiet brilliance, engineered.
          </h1>
          <p
            className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
            data-testid="text-hero-subtitle"
          >
            Lab-grown diamonds with scientific precision and ethical clarity. Calm,
            premium, and made to last.
          </p>
        </div>
      </div>
    </section>
  );
}

function PinnedDiamondReveal() {
  const ref = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  usePinnedSection({
    id: "diamond",
    pinRef: ref,
    pinDurationVh: 220,
    onUpdate: (p) => {
      const opacity = phaseOpacity(p);
      if (stageRef.current) {
        stageRef.current.style.opacity = String(opacity);
        stageRef.current.style.transform = `translateY(${(1 - opacity) * 10}px)`;
      }
    },
  });

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] bg-[#050607] text-white"
      data-testid="section-diamond"
    >
      <div className="mx-auto flex min-h-[100svh] max-w-6xl items-center px-6">
        <div className="w-full">
          <div
            className="mb-6 flex items-end justify-between gap-6"
            data-testid="block-diamond-header"
          >
            <p
              className="font-serif text-2xl tracking-[-0.01em] text-white/90"
              data-testid="text-diamond-title"
            >
              Diamond, without compromise.
            </p>
            <p
              className="max-w-xs text-sm leading-relaxed text-white/60"
              data-testid="text-diamond-caption"
            >
              One object. One moment. Controlled motion only.
            </p>
          </div>

          <div
            ref={stageRef}
            className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 bg-black"
            style={{ opacity: 0 }}
            data-testid="spline-diamond"
          >
            <div
              className="flex h-full w-full items-center justify-center"
              data-testid="fallback-diamond"
            >
              <div className="text-center">
                <p
                  className="font-serif text-2xl text-white/90"
                  data-testid="text-diamond-fallback-title"
                >
                  Diamond\u2014revealed
                </p>
                <p
                  className="mt-2 text-sm text-white/55"
                  data-testid="text-diamond-fallback-subtitle"
                >
                  (3D preview unavailable in this environment)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PinnedStory() {
  const ref = useRef<HTMLElement>(null);
  const linesRef = useRef<Array<HTMLParagraphElement | null>>([]);

  const lines = useMemo(
    () => [
      "We grow each diamond with controlled pressure, controlled heat, and measured time.",
      "The result is the same crystal structure—without the extractive cost.",
      "Luxury should feel calm. Proof should feel precise.",
    ],
    [],
  );

  usePinnedSection({
    id: "story",
    pinRef: ref,
    pinDurationVh: 200,
    onUpdate: (p) => {
      const opacity = phaseOpacity(p);

      const t = clamp01((p - 0.2) / 0.5);
      const idx = Math.min(lines.length - 1, Math.floor(t * lines.length));

      linesRef.current.forEach((node, i) => {
        if (!node) return;
        const active = i === idx;
        const o = active ? opacity : 0;
        node.style.opacity = String(o);
        node.style.transform = active ? "translateY(0px)" : "translateY(10px)";
      });
    },
  });

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] bg-background text-foreground"
      data-testid="section-story"
    >
      <div className="mx-auto flex min-h-[100svh] max-w-6xl items-center px-6">
        <div className="w-full max-w-3xl">
          <h2
            className="font-serif text-3xl tracking-[-0.01em] sm:text-4xl"
            data-testid="text-story-title"
          >
            A calm story told slowly.
          </h2>

          <div className="mt-10 space-y-8" data-testid="group-story-lines">
            {lines.map((line, i) => (
              <p
                key={line}
                ref={(el) => {
                  linesRef.current[i] = el;
                }}
                className="calm-fade text-pretty text-xl leading-relaxed text-foreground/85"
                style={{ opacity: 0, transform: "translateY(10px)" }}
                data-testid={`text-story-line-${i}`}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PinnedAIGeneratedVisuals() {
  const ref = useRef<HTMLElement>(null);
  const imagesRef = useRef<Array<HTMLImageElement | null>>([]);
  const [images] = useState(() => [
    {
      id: "v1",
      alt: "Lab-grown diamond macro photograph",
      src: "https://images.unsplash.com/photo-1602526432604-029a709e131c?auto=format&fit=crop&w=1800&q=80",
    },
    {
      id: "v2",
      alt: "Diamond facets close-up",
      src: "https://images.unsplash.com/photo-1602526432604-029a709e131c?auto=format&fit=crop&w=1800&q=70",
    },
    {
      id: "v3",
      alt: "Minimal luxury jewelry photography",
      src: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1800&q=80",
    },
  ]);

  usePinnedSection({
    id: "ai-visuals",
    pinRef: ref,
    pinDurationVh: 220,
    onUpdate: (p) => {
      const opacity = phaseOpacity(p);

      const t = clamp01((p - 0.2) / 0.5);
      const idx = Math.min(images.length - 1, Math.floor(t * images.length));

      imagesRef.current.forEach((img, i) => {
        if (!img) return;
        const active = i === idx;
        img.style.opacity = String(active ? opacity : 0);
      });
    },
  });

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] bg-[#0A0B0D] text-white"
      data-testid="section-ai-visuals"
    >
      <div className="mx-auto flex min-h-[100svh] max-w-6xl items-center px-6">
        <div className="w-full">
          <div className="flex items-end justify-between gap-8">
            <h2
              className="font-serif text-3xl tracking-[-0.01em] sm:text-4xl"
              data-testid="text-ai-title"
            >
              AI-generated visuals, restrained.
            </h2>
            <p
              className="max-w-sm text-sm leading-relaxed text-white/60"
              data-testid="text-ai-caption"
            >
              One image at a time. Cross-fade only. No grid, no carousel.
            </p>
          </div>

          <div
            className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 bg-black"
            data-testid="frame-ai-image"
          >
            {images.map((img, i) => (
              <img
                key={img.id}
                ref={(el) => {
                  imagesRef.current[i] = el;
                }}
                src={img.src}
                alt={img.alt}
                className="absolute inset-0 h-full w-full object-cover calm-fade"
                style={{ opacity: 0 }}
                data-testid={`img-ai-${img.id}`}
              />
            ))}
            <div className="absolute inset-0 bg-black/35" data-testid="overlay-ai-dim" />
          </div>
        </div>
      </div>
    </section>
  );
}

function PinnedCraftsmanship() {
  const ref = useRef<HTMLElement>(null);
  const blocksRef = useRef<Array<HTMLDivElement | null>>([]);

  const blocks = useMemo(
    () => [
      { k: "Seed", v: "A carbon seed begins the lattice." },
      { k: "Growth", v: "Pressure and heat shape the crystal—slowly." },
      { k: "Cut", v: "Angles measured to return light, not noise." },
    ],
    [],
  );

  usePinnedSection({
    id: "craft",
    pinRef: ref,
    pinDurationVh: 220,
    onUpdate: (p) => {
      const opacity = phaseOpacity(p);

      const t = clamp01((p - 0.2) / 0.5);
      const idx = Math.min(blocks.length - 1, Math.floor(t * blocks.length));

      blocksRef.current.forEach((node, i) => {
        if (!node) return;
        const active = i === idx;
        node.style.opacity = String(active ? opacity : 0);
        node.style.transform = active ? "translateY(0px)" : "translateY(10px)";
      });
    },
  });

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] bg-background text-foreground"
      data-testid="section-craft"
    >
      <div className="mx-auto flex min-h-[100svh] max-w-6xl items-center px-6">
        <div className="w-full">
          <div className="flex items-end justify-between gap-8">
            <h2
              className="font-serif text-3xl tracking-[-0.01em] sm:text-4xl"
              data-testid="text-craft-title"
            >
              Craftsmanship, diagrammed.
            </h2>
            <p
              className="max-w-sm text-sm leading-relaxed text-muted-foreground"
              data-testid="text-craft-caption"
            >
              A clean sequence. One reveal per scroll phase.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3" data-testid="grid-craft">
            {blocks.map((b, i) => (
              <div
                key={b.k}
                ref={(el) => {
                  blocksRef.current[i] = el;
                }}
                className="calm-fade rounded-2xl border bg-card p-6"
                style={{ opacity: 0, transform: "translateY(10px)" }}
                data-testid={`card-craft-${i}`}
              >
                <p
                  className="text-xs uppercase tracking-[0.18em] text-muted-foreground"
                  data-testid={`text-craft-key-${i}`}
                >
                  {b.k}
                </p>
                <p
                  className="mt-3 font-serif text-xl text-card-foreground"
                  data-testid={`text-craft-value-${i}`}
                >
                  {b.v}
                </p>
                <div className="mt-6 h-px w-full bg-border" data-testid={`divider-craft-${i}`} />
                <p
                  className="mt-4 text-sm leading-relaxed text-muted-foreground"
                  data-testid={`text-craft-note-${i}`}
                >
                  Measured steps. Minimal motion. Maximum clarity.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CollectionPreview() {
  const products = useMemo(
    () => [
      {
        id: "solitaire",
        name: "Solitaire",
        detail: "Round brilliant. Platinum setting.",
        price: "$4,800",
      },
      {
        id: "emerald",
        name: "Emerald Cut",
        detail: "Step cut. Knife-edge band.",
        price: "$5,600",
      },
      {
        id: "tennis",
        name: "Tennis",
        detail: "Even light, continuous line.",
        price: "$6,900",
      },
    ],
    [],
  );

  return (
    <section className="bg-background" data-testid="section-collection">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between gap-10">
          <div>
            <h2
              className="font-serif text-3xl tracking-[-0.01em] sm:text-4xl"
              data-testid="text-collection-title"
            >
              Collection
            </h2>
            <p
              className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground"
              data-testid="text-collection-subtitle"
            >
              Minimal preview cards. No scroll animation. Hover is subtle only.
            </p>
          </div>
          <button
            className="calm-fade rounded-full border bg-transparent px-5 py-2 text-sm text-foreground hover:shadow-sm"
            data-testid="button-collection-viewall"
            type="button"
          >
            View all
          </button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3" data-testid="grid-collection">
          {products.map((p) => (
            <article
              key={p.id}
              className="group rounded-2xl border bg-card p-6 calm-fade hover:-translate-y-0.5 hover:shadow-md"
              data-testid={`card-product-${p.id}`}
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h3
                    className="font-serif text-2xl tracking-[-0.01em]"
                    data-testid={`text-product-name-${p.id}`}
                  >
                    {p.name}
                  </h3>
                  <p
                    className="mt-2 text-sm text-muted-foreground"
                    data-testid={`text-product-detail-${p.id}`}
                  >
                    {p.detail}
                  </p>
                </div>
                <div
                  className="rounded-full border px-3 py-1 text-xs text-muted-foreground"
                  data-testid={`badge-product-price-${p.id}`}
                >
                  {p.price}
                </div>
              </div>

              <div className="mt-8 h-px w-full bg-border" data-testid={`divider-product-${p.id}`} />

              <div className="mt-5 flex items-center justify-between">
                <p
                  className="text-xs uppercase tracking-[0.18em] text-muted-foreground"
                  data-testid={`text-product-tag-${p.id}`}
                >
                  Lab-grown
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                  className="rounded-full border bg-transparent px-4 py-2 text-sm"
                  data-testid={`button-product-details-${p.id}`}
                  type="button"
                >
                  Details
                </motion.button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background" data-testid="footer">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="border-t pt-10">
          <p className="font-serif text-xl" data-testid="text-footer-brand">
            Asteria Diamonds
          </p>
          <p
            className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground"
            data-testid="text-footer-caption"
          >
            Ethical lab-grown diamonds with calm, controlled storytelling.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <a
              className="calm-fade text-sm text-muted-foreground hover:text-foreground"
              href="#"
              data-testid="link-footer-privacy"
            >
              Privacy
            </a>
            <a
              className="calm-fade text-sm text-muted-foreground hover:text-foreground"
              href="#"
              data-testid="link-footer-terms"
            >
              Terms
            </a>
            <a
              className="calm-fade text-sm text-muted-foreground hover:text-foreground"
              href="#"
              data-testid="link-footer-contact"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  useLenis();

  return (
    <main data-testid="page-home">
      <PinnedHero />
      <PinnedDiamondReveal />
      <PinnedStory />
      <PinnedAIGeneratedVisuals />
      <PinnedCraftsmanship />
      <CollectionPreview />
      <Footer />
    </main>
  );
}
