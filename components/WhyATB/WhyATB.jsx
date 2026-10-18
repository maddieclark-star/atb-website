import { useEffect, useRef, useState } from "react";
import styles from "./WhyATB.module.css";
import noWinNoFeeLockup from "./assets/no-win-no-fee-lockup.png";
import whyAtbPhoto from "./assets/why-atb-photo.jpg";

const USPS = [
  {
    number: "1",
    title: "No win, no fee",
    body: "You won’t pay legal fees upfront, and we’ll explain costs clearly from the start.",
  },
  {
    number: "2",
    title: "We cover the costs so you don't have to",
    body: "From medical reports to expert fees, we front all the costs of your claim, with no interest charges.",
  },
  {
    number: "3",
    title: "Clear advice, in plain English",
    body: "We explain your options clearly, without legal jargon or unnecessary complexity.",
  },
  {
    number: "4",
    title: "Speak directly to a lawyer",
    body: "No call centre. When you contact us, you’ll speak to someone who understands your situation.",
  },
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The dot device, inlined rather than referenced via <img> because each of the
 * three dots animates on its own delay, which isn't reachable from inside an
 * <img>. Path data is the exported Figma vector, unmodified.
 */
function DotDevice() {
  return (
    <span className={styles.dot} aria-hidden="true">
      <svg width="52" height="16" viewBox="0 0 52 16" fill="none" overflow="visible" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M8 0C9.58239 1.32785e-07 11.1292 0.469278 12.4449 1.34847C13.7606 2.22767 14.7859 3.4773 15.3913 4.93929C15.9968 6.40129 16.155 8.00999 15.846 9.56192C15.5371 11.1139 14.7748 12.5393 13.6557 13.658C12.5365 14.7767 11.1108 15.5384 9.55871 15.8467C8.00665 16.155 6.39801 15.9961 4.93626 15.3901C3.47451 14.7841 2.22531 13.7582 1.34665 12.4422C0.467996 11.1262 -0.000647583 9.57912 6.71618e-07 7.99673C0.00173751 5.87583 0.845254 3.84234 2.34526 2.34295C3.84527 0.843558 5.8791 0.000867797 8 0Z" fill="#BCBCBC" />
        <path fillRule="evenodd" clipRule="evenodd" d="M26 0C28.1217 0 30.1566 0.842866 31.6569 2.34316C33.1571 3.84345 34 5.87827 34 8.00001C34 10.1217 33.1571 12.1566 31.6569 13.6569C30.1566 15.1571 28.1217 16 26 16C23.8783 16 21.8434 15.1571 20.3431 13.6569C18.8429 12.1566 18 10.1217 18 8.00001C18 5.87827 18.8429 3.84345 20.3431 2.34316C21.8434 0.842866 23.8783 0 26 0Z" fill="#717171" />
        <path fillRule="evenodd" clipRule="evenodd" d="M44.0012 0C46.1226 0 48.1572 0.842864 49.6572 2.34315C51.1573 3.84345 52 5.87827 52 8C52 10.1217 51.1573 12.1566 49.6572 13.6569C48.1572 15.1571 46.1226 16 44.0012 16C41.88 16 39.8456 15.1576 38.3452 13.6579C36.8449 12.1582 36.0013 10.124 36 8.00246C36.0009 5.88035 36.8441 3.84539 38.3445 2.34483C39.8448 0.844266 41.8794 0.000868652 44.0012 0Z" fill="#F88800" />
      </svg>
    </span>
  );
}

/**
 * Reveals the USP cards once the column enters the viewport.
 *
 * Pairs IntersectionObserver with a synchronous geometry check: IO callbacks
 * aren't delivered when the page isn't compositing (background tabs, headless
 * capture), which would otherwise strand the cards at opacity 0 permanently.
 * The sync pass also covers landing with the section already in view.
 */
function useCascadeReveal(listRef, enabled) {
  const [revealed, setRevealed] = useState(!enabled);

  useEffect(() => {
    if (!enabled) return undefined;
    const list = listRef.current;
    if (!list) return undefined;

    let done = false;
    let ticking = false;

    const inView = () => {
      const r = list.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      return visible > 0 && visible / Math.min(r.height, vh) >= 0.15;
    };

    const finish = () => {
      if (done) return;
      done = true;
      setRevealed(true);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (inView()) finish();
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) finish();
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(list);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    if (inView()) finish();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [listRef, enabled]);

  return revealed;
}

/**
 * Drifts the overscaled photo against the scroll so it moves slower than its
 * frame. Amplitude is 8% of frame height — exactly the headroom the 116%
 * sizing provides, so no edge can be exposed.
 */
function useParallax(frameRef, photoRef, enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    const frame = frameRef.current;
    const photo = photoRef.current;
    if (!frame || !photo) return undefined;

    let ticking = false;

    const update = () => {
      const r = frame.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.bottom < 0 || r.top > vh) return; // off-screen, skip work
      const centre = r.top + r.height / 2;
      // -1 when the frame sits below the viewport, +1 when above, 0 dead centre
      let progress = (vh / 2 - centre) / (vh / 2 + r.height / 2);
      progress = Math.max(-1, Math.min(1, progress));
      photo.style.setProperty("--parallax", `${(progress * r.height * 0.08).toFixed(1)}px`);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update(); // synchronous first pass, for the same rAF-starvation reason

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      photo.style.removeProperty("--parallax");
    };
  }, [frameRef, photoRef, enabled]);
}

/**
 * ATB "Why ATB" USP section — desktop build of Figma node 11636:18247
 * (USPs / Vertical / Desktop), authored at a 1440x992 frame.
 *
 * Layout, gaps, padding, radii and the 560:688 column proportion come from
 * that node; the container caps at 1920px and centres, per the design. Figma
 * pins the image at a fixed 560x692 — here its width holds the 560:688 ratio
 * against the USP column and its height tracks that column, so the two share a
 * flush top and bottom edge at any width.
 */
export default function WhyATB() {
  // Resolved once on first render so the cards never paint visible and then
  // snap hidden. Server-side this is false, which renders them revealed.
  const [motionEnabled] = useState(
    () => typeof window !== "undefined" && "IntersectionObserver" in window && !prefersReducedMotion()
  );

  const listRef = useRef(null);
  const frameRef = useRef(null);
  const photoRef = useRef(null);

  const revealed = useCascadeReveal(listRef, motionEnabled);
  useParallax(frameRef, photoRef, motionEnabled);

  const cardClass = [styles.uspCard, motionEnabled ? styles.armed : "", revealed ? styles.revealed : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.topRow}>
          <div className={styles.headline}>
            <DotDevice />
            <h2 className={styles.heading}>
              Why choose
              <br />
              <span className={styles.headingAccent}>Arnold Thomas &amp; Becker?</span>
            </h2>
          </div>
          <img src={noWinNoFeeLockup} alt="No win, no fee. No fear." className={styles.lockup} />
        </div>

        <div className={styles.imageAndUsps}>
          <div className={styles.imageFrame} ref={frameRef}>
            <img src={whyAtbPhoto} alt="" className={styles.photo} ref={photoRef} />
          </div>

          <div className={styles.uspList} ref={listRef}>
            {USPS.map((usp) => (
              <div className={cardClass} key={usp.number}>
                <span className={styles.uspNumber}>{usp.number}</span>
                <div className={styles.uspText}>
                  <div className={styles.uspTitleRow}>
                    <p className={styles.uspTitle}>{usp.title}</p>
                  </div>
                  <p className={styles.uspBody}>{usp.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
