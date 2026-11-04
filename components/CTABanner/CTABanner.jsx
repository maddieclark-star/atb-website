"use client";

import { useEffect, useRef, useState } from "react";
import Button from "../Button";
import styles from "./CTABanner.module.css";
/* Each photo is cropped zoomed-out past its Figma frame (12062:7399, 7154,
   7204, 7251, 7353), down to the bottom of the source, to show more torso.
   Allanah, Jodie and Lee come from full-res Figma exports (Lee's from the
   earlier CTA frame 12062:1539). Emily's source is only 1024x461 and Kim's
   is the 604x726 Figma frame stored stretched to 1024x498 (un-stretched
   here), so those two can't show much more than the Figma frame does. */
import allanahGoodwin from "./assets/allanah-goodwin.jpg";
import leeFlanagan from "./assets/lee-flanagan.jpg";
import jodieHarris from "./assets/jodie-harris.jpg";
import emilyHart from "./assets/emily-hart.jpg";
import kimPrice from "./assets/kim-price.jpg";

const LAWYERS = [
  { name: "Allanah Goodwin", role: "Principal", photo: allanahGoodwin },
  { name: "Lee Flanagan", role: "Managing Principal", photo: leeFlanagan },
  { name: "Jodie Harris", role: "Principal", photo: jodieHarris },
  { name: "Emily Hart", role: "Principal", photo: emilyHart },
  { name: "Kim Price", role: "Deputy Managing Principal", photo: kimPrice },
];

/* Time each lawyer holds before the next slides in. The slide itself
   (--slide-duration in the CSS) runs on top of this. */
const HOLD_MS = 5000;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Same dot device as the hero, inlined so each dot can bounce on its own
 * delay.
 */
function DotDevice() {
  return (
    <svg
      className={styles.dot}
      viewBox="0 0 52 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle className={styles.dotCircle} cx="8" cy="8" r="8" fill="#bcbcbc" />
      <circle className={styles.dotCircle} cx="26" cy="8" r="8" fill="#717171" />
      <circle className={styles.dotCircle} cx="44" cy="8" r="8" fill="#f88800" />
    </svg>
  );
}

/**
 * Advances the active lawyer on a timer, but only while the banner is on
 * screen and the tab is visible — there's no point cycling photos nobody can
 * see, and resuming mid-slide after a background tab looks like a glitch.
 */
function useSlideCycle(rootRef, count) {
  // A running count rather than an index, so the outgoing slide falls out of
  // the same state as the incoming one.
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;

    let timer = null;

    const tick = () => setStep((s) => s + 1);

    const inView = () => {
      const r = root.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.bottom > 0 && r.top < vh;
    };

    // Only (re)starts the timer on a change of state, so scrolling within
    // the banner doesn't keep resetting the hold.
    const sync = () => {
      const run = inView() && !document.hidden;
      if (run && timer === null) timer = setInterval(tick, HOLD_MS);
      if (!run && timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };

    // A geometry check on scroll rather than IntersectionObserver alone: IO
    // callbacks aren't delivered when the page isn't compositing (see
    // WhyATB), which would leave the banner stuck on the first lawyer. Called
    // directly, not via rAF, since rAF starves in that same situation; it's
    // one rect read.
    const observer = new IntersectionObserver(sync);
    observer.observe(root);
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      clearInterval(timer);
      observer.disconnect();
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [rootRef, count]);

  return { active: step % count, prev: step > 0 ? (step - 1) % count : null };
}

/**
 * ATB CTA banner — Figma section 12062:7443, five 1440x799 frames that are
 * identical except for the lawyer photo and name card. Built as one banner
 * that cycles through the five.
 *
 * On each change the photos push across together (outgoing exits left,
 * incoming enters from the right, each photo drifting at half speed inside
 * its frame for depth). The frosted name card stays put; only its copy
 * changes, with the outgoing name rising out and the incoming one rising in
 * on the same beat as the photo.
 */
export default function CTABanner() {
  const rootRef = useRef(null);
  const { active, prev } = useSlideCycle(rootRef, LAWYERS.length);

  const stateClass = (i) =>
    i === active ? styles.isActive : i === prev ? styles.isPrev : "";

  return (
    <section className={styles.banner} ref={rootRef}>
      <div className={styles.content}>
        <div className={styles.headlineGroup}>
          <DotDevice />
          <div className={styles.copy}>
            <h2 className={styles.heading}>
              Meet the lawyers who will stand <span className={styles.accent}>with you.</span>
            </h2>
            <p className={styles.body}>
              Our team combines specialist legal experience with clear, compassionate advice. When
              you get in touch, you can speak directly with a lawyer who will listen, explain your
              options, and help you understand the next step.
            </p>
          </div>
        </div>

        <div className={styles.ctas}>
          <Button variant="primary" mode="light" size="lg" href="tel:1300333300">
            Call 1300 333 300
          </Button>
          <Button variant="secondary" mode="dark" size="lg" icon={false} href="#">
            Speak with a lawyer
          </Button>
        </div>
      </div>

      {/* Image (12062:7423) */}
      <div className={styles.photoCard}>
        {LAWYERS.map((lawyer, i) => (
          <div
            key={lawyer.name}
            className={`${styles.slide} ${stateClass(i)}`}
            aria-hidden={i !== active}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.slideImg}
              src={lawyer.photo.src}
              alt={lawyer.name}
              // Not lazy: parked off to the side, the later photos can sit
              // outside lazy-loading's range and arrive mid-slide as an empty
              // frame. Low priority instead, so they don't compete with the
              // first photo.
              fetchPriority={i === 0 ? "auto" : "low"}
              decoding="async"
            />
          </div>
        ))}

        {/* Overlay (Bottom) (12062:7425) */}
        <div className={styles.photoFade} />

        {/* Name card (12062:7426) — the frosted panel never moves; only the
            copy inside it changes. */}
        <div className={styles.nameCard}>
          <div className={styles.nameStack}>
            {LAWYERS.map((lawyer, i) => (
              <div
                key={lawyer.name}
                className={`${styles.nameItem} ${stateClass(i)}`}
                aria-hidden={i !== active}
              >
                <span className={styles.line}>
                  <span className={styles.name}>{lawyer.name}</span>
                </span>
                <span className={styles.line}>
                  <span className={styles.role}>{lawyer.role}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
