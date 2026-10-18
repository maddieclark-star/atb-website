"use client";

import { useEffect, useRef, useState } from "react";
import Button from "../Button";
import styles from "./USPSection.module.css";

const CLAIM_TYPES = [
  { title: "Institutional & Sexual Abuse", icon: "/Assets/Icons/Stop.svg" },
  { title: "Road Accidents & TAC", icon: "/Assets/Icons/Car.svg" },
  { title: "Workers Compensation", icon: "/Assets/Icons/Construction.svg" },
  { title: "Public Place Injury", icon: "/Assets/Icons/Fall.svg" },
  { title: "Medical Negligence", icon: "/Assets/Icons/Medical.svg" },
  { title: "Superannuation", icon: "/Assets/Icons/Superannuation.svg" },
  { title: "Class Action", icon: "/Assets/Icons/Gavel.svg" },
  { title: "Asbestos / Silicosis Claims", icon: "/Assets/Icons/Warning.svg" },
];

const DOT_COLORS = ["#bcbcbc", "#717171", "#f88800"];

function UspCard({ title, icon, revealed, revealDelay }) {
  return (
    <div
      className={`${styles.card} ${revealed ? styles.cardRevealed : ""}`}
      style={{ "--reveal-delay": revealed ? `${revealDelay}ms` : "0ms" }}
    >
      <span
        className={styles.cardIcon}
        style={{ WebkitMaskImage: `url(${icon})`, maskImage: `url(${icon})` }}
      />
      <div className={styles.cardBody}>
        <p className={styles.cardTitle}>{title}</p>
        <Button
          variant="primary"
          size="sm"
          mode="light"
          icon={false}
          href="#"
          className={styles.cardCta}
        >
          Learn more
        </Button>
      </div>
    </div>
  );
}

function StepDots() {
  return (
    <svg className={styles.dot} viewBox="0 0 52 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      {DOT_COLORS.map((color, i) => (
        <circle
          key={color}
          className={styles.dotCircle}
          cx={8 + i * 18}
          cy="8"
          r="8"
          fill={color}
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
    </svg>
  );
}

export default function USPSection() {
  const [rowOne, rowTwo] = [CLAIM_TYPES.slice(0, 4), CLAIM_TYPES.slice(4, 8)];
  const [revealed, setRevealed] = useState(false);
  const gridRef = useRef(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <StepDots />
          <h2 className={styles.title}>Services we offer.</h2>
          <p className={styles.subtitle}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent fringilla
            ante non luctus pretium. Nam purus lectus, ultrices sed luctus nec.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          mode="light"
          href="#"
          className={styles.headerCta}
        >
          View all claim types
        </Button>
      </div>

      <div className={styles.cardsWrap} ref={gridRef}>
        <div className={styles.cardsRow}>
          {rowOne.map((card, i) => (
            <UspCard key={card.title} {...card} revealed={revealed} revealDelay={i * 100} />
          ))}
        </div>
        <div className={styles.cardsRow}>
          {rowTwo.map((card, i) => (
            <UspCard
              key={card.title}
              {...card}
              revealed={revealed}
              revealDelay={(i + rowOne.length) * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
