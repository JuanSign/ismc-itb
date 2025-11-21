"use client";

import { useLayoutEffect, useRef } from "react";

import gsap from "gsap";
import styles from "./IntroAnimation.module.css";

export default function IntroAnimation({ 
  onStart,
  onComplete,
}: { 
  onStart?: () => void,
  onComplete?: () => void 
}) {
  const el = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    onStart?.();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "hop" } });

      tl.to(`.${styles.word} h1`, { y: "0%", duration: 1 });
      tl.to(`.${styles.divider}`, {
        scaleY: "100%",
        duration: 1,
      }, "-=0.3");
      tl.to(`.${styles.divider}`, { 
        scaleY: "100%", duration: 0.5, 
        onComplete: () => { 
          gsap.to(`.${styles.divider}`, { 
              opacity: 0, 
              duration: 0.3, 
          }); 
        } 
      });
      tl.to(`.${styles.word1} h1`, { y: "100%", duration: 1, delay: 0.3 });
      tl.to(`.${styles.word2} h1`, { y: "-100%", duration: 1 }, "<");
      tl.to(`.${styles.block}`, {
        yPercent: -100,
        duration: 1,
        stagger: 0.1,
        delay: 0.5,
        onComplete: onComplete,
      }, "<");
    }, el);

    return () => ctx.revert();
  }, [onComplete, onStart]);

  return (
    <div className={styles.loader} ref={el}>
      <div className={styles.overlay}>
        <div className={styles.block}></div>
        <div className={styles.block}></div>
      </div>

      <div className={styles.introLogo}>
        <div className={`${styles.word} ${styles.word1}`}>
          <h1><span>ISMC</span></h1>
        </div>

        <div className={styles.divider}></div>

        <div className={`${styles.word} ${styles.word2}`}>
          <h1>XV</h1>
        </div>
      </div>

    </div>
  );
}