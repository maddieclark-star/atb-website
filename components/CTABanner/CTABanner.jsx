"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import arrowIcon from "./assets/icon-arrow.svg";

/* `profile` is each lawyer's profile page. Placeholders until those pages
   exist. */
const LAWYERS = [
  {
    name: "Allanah Goodwin",
    role: "Principal, Personal Injury Law",
    photo: allanahGoodwin,
    profile: "#",
  },
  {
    name: "Lee Flanagan",
    role: "Managing Principal, Personal Injury Law",
    photo: leeFlanagan,
    profile: "#",
  },
  {
    name: "Jodie Harris",
    role: "Principal, Personal Injury Law",
    photo: jodieHarris,
    profile: "#",
  },
  {
    name: "Emily Hart",
    role: "Principal, Medical Negligence",
    photo: emilyHart,
    profile: "#",
  },
  {
    name: "Kim Price",
    role: "Deputy Managing Principal, Personal Injury Law",
    photo: kimPrice,
    profile: "#",
  },
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

/** Icon / User from the Profile button (12087:5273), in currentColor so it
    follows the Button's hover colours. */
function UserIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M10 10C9.08333 10 8.29861 9.67361 7.64583 9.02083C6.99306 8.36806 6.66667 7.58333 6.66667 6.66667C6.66667 5.75 6.99306 4.96528 7.64583 4.3125C8.29861 3.65972 9.08333 3.33333 10 3.33333C10.9167 3.33333 11.7014 3.65972 12.3542 4.3125C13.0069 4.96528 13.3333 5.75 13.3333 6.66667C13.3333 7.58333 13.0069 8.36806 12.3542 9.02083C11.7014 9.67361 10.9167 10 10 10ZM3.33333 16.6667V14.3333C3.33333 13.8611 3.45486 13.4271 3.69792 13.0312C3.94097 12.6354 4.26389 12.3333 4.66667 12.125C5.52778 11.6944 6.40278 11.3715 7.29167 11.1562C8.18056 10.941 9.08333 10.8333 10 10.8333C10.9167 10.8333 11.8194 10.941 12.7083 11.1562C13.5972 11.3715 14.4722 11.6944 15.3333 12.125C15.7361 12.3333 16.059 12.6354 16.3021 13.0312C16.5451 13.4271 16.6667 13.8611 16.6667 14.3333V16.6667H3.33333ZM5 15H15V14.3333C15 14.1806 14.9618 14.0417 14.8854 13.9167C14.809 13.7917 14.7083 13.6944 14.5833 13.625C13.8333 13.25 13.0764 12.9687 12.3125 12.7812C11.5486 12.5937 10.7778 12.5 10 12.5C9.22222 12.5 8.45139 12.5937 7.6875 12.7812C6.92361 12.9687 6.16667 13.25 5.41667 13.625C5.29167 13.6944 5.19097 13.7917 5.11458 13.9167C5.03819 14.0417 5 14.1806 5 14.3333V15ZM10 8.33333C10.4583 8.33333 10.8507 8.17014 11.1771 7.84375C11.5035 7.51736 11.6667 7.125 11.6667 6.66667C11.6667 6.20833 11.5035 5.81597 11.1771 5.48958C10.8507 5.16319 10.4583 5 10 5C9.54167 5 9.14931 5.16319 8.82292 5.48958C8.49653 5.81597 8.33333 6.20833 8.33333 6.66667C8.33333 7.125 8.49653 7.51736 8.82292 7.84375C9.14931 8.17014 9.54167 8.33333 10 8.33333Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Which lawyer is showing, which one is on its way out, and which way the
 * change runs (1 = forwards, -1 = backwards), so the photos can push in
 * either direction.
 *
 * Advances on a timer, but only while the banner is on screen and the tab is
 * visible — there's no point cycling photos nobody can see, and resuming
 * mid-slide after a background tab looks like a glitch. Using the arrows or
 * dots restarts the hold, so the chosen lawyer gets the full five seconds.
 */
function useSlideCycle(rootRef, count) {
  const [slide, setSlide] = useState({ active: 0, prev: null, dir: 1 });
  // Restarts a running timer; set by the effect below.
  const restartRef = useRef(() => {});

  const goTo = useCallback(
    (next, dir) => {
      setSlide((s) => {
        const index = (next + count) % count;
        if (index === s.active) return s;
        return { active: index, prev: s.active, dir: dir ?? (index > s.active ? 1 : -1) };
      });
      restartRef.current();
    },
    [count],
  );

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;

    let timer = null;

    const tick = () =>
      setSlide((s) => ({ active: (s.active + 1) % count, prev: s.active, dir: 1 }));

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

    restartRef.current = () => {
      if (timer === null) return;
      clearInterval(timer);
      timer = setInterval(tick, HOLD_MS);
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
      restartRef.current = () => {};
      observer.disconnect();
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [rootRef, count]);

  return { ...slide, goTo };
}

/**
 * ATB CTA banner — Figma section 12087:5453, five 1440x799 frames that are
 * identical except for the lawyer photo, name card and active dot. Built as
 * one banner that cycles through the five, with arrows either side of the
 * photo and dots underneath to move through them by hand.
 *
 * On each change the photos push across together (forwards: outgoing exits
 * left, incoming enters from the right; backwards the reverse), each photo
 * drifting at half speed inside its frame for depth. The frosted name card
 * stays put; only its copy changes, with the outgoing name rising out and
 * the incoming one rising in on the same beat as the photo.
 */
export default function CTABanner() {
  const rootRef = useRef(null);
  const { active, prev, dir, goTo } = useSlideCycle(rootRef, LAWYERS.length);
  const current = LAWYERS[active];

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

      {/* Slider carousel (12087:5071) */}
      <div
        className={styles.carousel}
        role="group"
        aria-roledescription="carousel"
        aria-label="Our lawyers"
      >
        <div className={styles.stage}>
          {/* Image (12087:5072). data-dir picks which way the slides push; it's
              left off until the first change so the opening photo doesn't
              slide in on load. */}
          <div
            className={styles.photoCard}
            data-dir={prev === null ? undefined : dir === 1 ? "next" : "back"}
          >
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
                  // Not lazy: parked off to the side, the later photos can
                  // sit outside lazy-loading's range and arrive mid-slide as
                  // an empty frame. Low priority instead, so they don't
                  // compete with the first photo.
                  fetchPriority={i === 0 ? "auto" : "low"}
                  decoding="async"
                />
              </div>
            ))}

            {/* Overlay (Top) (12087:5082) and Overlay (Bottom) (12087:5074) */}
            <div className={styles.photoFadeTop} />
            <div className={styles.photoFade} />

            {/* Name card (12087:5267) — the frosted panel and its Profile
                button never move; only the copy inside changes, and the
                button's link follows the lawyer showing. */}
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
              <Button
                className={styles.profileBtn}
                variant="primary"
                mode="light"
                size="sm"
                icon={<UserIcon />}
                href={current.profile}
                aria-label={`View ${current.name}'s profile`}
              >
                Profile
              </Button>
            </div>
          </div>

          {/* Arrows (12087:5084), centred on the card's side edges */}
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowPrev}`}
            onClick={() => goTo(active - 1, -1)}
            aria-label="Previous lawyer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={arrowIcon.src} alt="" />
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowNext}`}
            onClick={() => goTo(active + 1, 1)}
            aria-label="Next lawyer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={arrowIcon.src} alt="" />
          </button>
        </div>

        {/* Pagination (12087:5083) */}
        <div className={styles.dots}>
          {LAWYERS.map((lawyer, i) => (
            <button
              key={lawyer.name}
              type="button"
              className={`${styles.pageDot} ${i === active ? styles.pageDotActive : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Show ${lawyer.name} (${i + 1} of ${LAWYERS.length})`}
              aria-current={i === active ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
