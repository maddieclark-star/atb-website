"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Button from "../Button";
import styles from "./Hero.module.css";

/* The demo set .has-js in <head> so the headline's pre-reveal state was in
   place before the first paint. A plain effect lands after it, which flashes
   the headline sharp for a frame before it blurs; a layout effect doesn't. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const HERO_PHOTO = "/Assets/Hero banner image.jpeg";
const VIDEO_SRC = "/Assets/WorkCover 1 W_CLOSED CAPTIONS (1) (1) (1).mp4#t=0.1";

/* Weakest blur first so the strongest sits on top; the tints come after
   these so they darken the blurred result. */
const BLUR_LAYERS = ["blurL3", "blurL2", "blurL1", "blurR2", "blurR1"];

const TRUST_ITEMS = [
  { icon: "/Assets/Icons/Seal check.svg", label: "No win, no fee" },
  { icon: "/Assets/Icons/File lock.svg", label: "Confidential consultation" },
  { icon: "/Assets/Icons/Piggy bank.svg", label: "No upfront costs" },
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The dot device, inlined rather than referenced via <img> because each of
 * the three dots animates on its own delay, which isn't reachable from
 * inside an <img>.
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

function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M8 17.175V6.825C8 6.54167 8.1 6.30417 8.3 6.1125C8.5 5.92083 8.73333 5.825 9 5.825C9.08333 5.825 9.17083 5.8375 9.2625 5.8625C9.35417 5.8875 9.44167 5.925 9.525 5.975L17.675 11.15C17.825 11.25 17.9375 11.375 18.0125 11.525C18.0875 11.675 18.125 11.8333 18.125 12C18.125 12.1667 18.0875 12.325 18.0125 12.475C17.9375 12.625 17.825 12.75 17.675 12.85L9.525 18.025C9.44167 18.075 9.35417 18.1125 9.2625 18.1375C9.17083 18.1625 9.08333 18.175 9 18.175C8.73333 18.175 8.5 18.0792 8.3 17.8875C8.1 17.6958 8 17.4583 8 17.175ZM10 15.35L15.25 12L10 8.65V15.35Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Hero() {
  const heroRef = useRef(null);
  const modalRef = useRef(null);
  const videoRef = useRef(null);
  const playBtnRef = useRef(null);
  const triggerRef = useRef(null);
  const trustBarRef = useRef(null);

  // Gates the pre-reveal (blurred) headline state so the copy is never left
  // invisible if hydration never runs.
  const [hasJs, setHasJs] = useState(false);
  const [closing, setClosing] = useState(false);
  const [playing, setPlaying] = useState(false);
  // <dialog> is widely supported, but if showModal is missing leave the
  // trigger inert rather than opening a modal that can't be closed.
  const [canModal, setCanModal] = useState(true);
  const [trustRevealed, setTrustRevealed] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setHasJs(true);
    if (typeof HTMLDialogElement === "undefined" || !HTMLDialogElement.prototype.showModal) {
      setCanModal(false);
    }
  }, []);

  // --- Trust bar icon reveal on scroll ------------------------------------
  useEffect(() => {
    const bar = trustBarRef.current;
    if (!bar) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTrustRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  // --- Hero image parallax on scroll -------------------------------------
  // The image lags the page: it sits high while the hero is below the fold
  // and drifts down as the hero scrolls past, so it travels slower than the
  // surrounding content.
  // Layout effect, not a plain effect: the initial position is computed from
  // the hero's post-layout rect, and setting it before first paint (rather
  // than after) is what stops the image snapping into place as a visible
  // jump on arrival.
  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const hero = heroRef.current;
    if (!hero) return;

    const RANGE = 70;
    let ticking = false;

    const update = () => {
      const r = hero.getBoundingClientRect();
      const vh = window.innerHeight;
      // -1 when the hero is fully below the viewport, +1 when fully above.
      const n = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      const clamped = Math.max(-1, Math.min(1, n));
      // Written on .hero so the sharp photo and every blurred copy move together.
      hero.style.setProperty("--parallax-y", `${(-clamped * RANGE).toFixed(1)}px`);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // --- Video modal -------------------------------------------------------
  // Deliberately independent of the motion effect above: that one bails out
  // under prefers-reduced-motion, and the modal still has to work.

  /* Idempotent, so it's safe to run from several dismissal paths at once. */
  const teardown = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      video.controls = false;
    }
    setPlaying(false);
    document.body.style.overflow = "";
  }, []);

  const finishClose = useCallback(() => {
    setClosing(false);
    const modal = modalRef.current;
    if (modal?.open) modal.close();
    teardown();
    triggerRef.current?.focus();
  }, [teardown]);

  const closeModal = useCallback(() => {
    const modal = modalRef.current;
    if (!modal?.open) {
      teardown();
      return;
    }
    if (closing) return;

    // Cut audio straight away — the fade is purely visual, there's no reason
    // for sound to keep playing over the page while it runs.
    videoRef.current?.pause();

    if (prefersReducedMotion()) {
      finishClose();
      return;
    }
    setClosing(true);
  }, [closing, finishClose, teardown]);

  // Drives the exit fade to completion. The backstop timer matters because
  // animationend won't arrive if animations are disabled or no frame lands,
  // and the modal must never be left stuck open.
  useEffect(() => {
    if (!closing) return;
    const modal = modalRef.current;
    if (!modal) return;

    const onFadeEnd = (e) => {
      // Guard on the name: closing during the entry fade would otherwise let
      // the entry animation's own animationend cut the exit short.
      if (e.animationName.includes("videoModalOut")) finishClose();
    };

    modal.addEventListener("animationend", onFadeEnd);
    const backstop = setTimeout(finishClose, 400);

    return () => {
      modal.removeEventListener("animationend", onFadeEnd);
      clearTimeout(backstop);
    };
  }, [closing, finishClose]);

  const openModal = () => {
    const modal = modalRef.current;
    if (!modal) return;
    modal.showModal();
    document.body.style.overflow = "hidden";
    playBtnRef.current?.focus();
  };

  const startPlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    setPlaying(true);
    video.controls = true;
    const p = video.play();
    // Autoplay policies reject play() in some states; fall back to the
    // native controls rather than leaving a dead overlay.
    if (p?.catch) p.catch(() => setPlaying(false));
  };

  const heroClass = [styles.hero, hasJs ? styles.hasJs : ""].filter(Boolean).join(" ");

  const modalClass = [
    styles.modal,
    closing ? styles.isClosing : "",
    playing ? styles.isPlaying : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <section className={heroClass} ref={heroRef}>
        <div className={styles.media}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_PHOTO}
            alt="ATB lawyer client wearing hard hat and safety gear, using a tablet on a job site"
          />
        </div>

        {BLUR_LAYERS.map((layer) => (
          <div key={layer} className={`${styles.blur} ${styles[layer]}`} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HERO_PHOTO} alt="" />
          </div>
        ))}

        <div className={`${styles.tint} ${styles.tintLeft}`} />
        <div className={`${styles.tint} ${styles.tintRight}`} />

        <div className={styles.inner}>
          <div className={styles.content}>
            <div className={styles.headlineWrap}>
              <div className={styles.eyebrowGroup}>
                <DotDevice />
                <h1 className={styles.headline}>
                  <span className={styles.isAccent}>Talk to a lawyer</span>
                  <span className={styles.isMuted}>who works for you,</span>
                  <span className={styles.isPrimary}>not the system.</span>
                </h1>
              </div>
              <p className={styles.intro}>
                If you&rsquo;ve been injured, abused, or treated unfairly, our lawyers will help you
                understand your options.
              </p>
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
        </div>

        {canModal && (
          <button
            type="button"
            className={styles.play}
            aria-label="Play video"
            aria-haspopup="dialog"
            onClick={openModal}
            ref={triggerRef}
          >
            <span>Play video</span>
            <span className={styles.playIcon}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Assets/Icons/Play.svg" alt="" />
            </span>
          </button>
        )}
      </section>

      <div className={styles.trustBar} ref={trustBarRef}>
        {TRUST_ITEMS.map((item, i) => (
          <Fragment key={item.label}>
            {i > 0 && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img className={styles.trustDivider} src="/Assets/Icons/Divider dot.svg" alt="" />
            )}
            <div
              className={`${styles.trustItem} ${trustRevealed ? styles.trustItemRevealed : ""}`}
              style={{ "--reveal-delay": trustRevealed ? `${i * 120}ms` : "0ms" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.icon} alt="" />
              <span>{item.label}</span>
            </div>
          </Fragment>
        ))}
      </div>

      <dialog
        className={modalClass}
        ref={modalRef}
        aria-label="ATB video"
        /* Anything outside the video itself dismisses — the padded area
           around the stage is the dialog element, so a click landing on it
           counts. */
        onClick={(e) => {
          if (e.target === modalRef.current) closeModal();
        }}
        /* Escape is handled explicitly rather than leaning on the dialog's
           own cancel event: that's spec'd but doesn't fire in every engine,
           and if it's missed the video keeps playing with audio over the
           page. */
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            closeModal();
          }
        }}
        /* Backstop for any dismissal path that closes the dialog without
           going through closeModal. */
        onClose={teardown}
      >
        <button
          type="button"
          className={styles.modalClose}
          aria-label="Close video"
          onClick={closeModal}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Assets/Icons/Cross.svg" alt="" />
        </button>
        <div className={styles.modalStage}>
          <video
            className={styles.modalVideo}
            ref={videoRef}
            src={VIDEO_SRC}
            preload="metadata"
            playsInline
          />
          <button
            type="button"
            className={styles.modalPlay}
            aria-label="Play"
            onClick={startPlayback}
            ref={playBtnRef}
          >
            <PlayGlyph />
          </button>
        </div>
      </dialog>
    </>
  );
}
