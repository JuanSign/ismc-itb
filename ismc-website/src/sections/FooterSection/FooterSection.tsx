"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import styles from "./FooterSection.module.css";

const ArrowIcon = () => (
  <svg 
    width="12" 
    height="12" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="7" y1="17" x2="17" y2="7"></line>
    <polyline points="7 7 17 7 17 17"></polyline>
  </svg>
);

export default function FooterSection() {
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const titleSpans = titleRef.current?.querySelectorAll("span");
      
      if (titleSpans) {
        gsap.to(titleSpans, {
          y: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 60%",
          },
        });
      }

      if (btnRef.current) {
        gsap.fromTo(
          btnRef.current,
          { scale: 0, rotation: -15, opacity: 0 },
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 1,
            ease: "elastic.out(1, 0.5)",
            delay: 0.2,
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 60%",
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={containerRef} className={styles.footer}>
      <div className={styles.watermark}>ISMC XV</div>

      <div className={styles.ctaContainer}>
        <div ref={titleRef} className={styles.headline}>
          <span>BE PART OF</span>
          <span>THE LEGACY</span>
        </div>

        <Link 
          href="/register" 
          ref={btnRef} 
          className={styles.registerBtn}
        >
          <span>Register</span>
        </Link>
      </div>

      <div className={styles.bottomBar}>
        <p>© 2024 ISMC XV. All Rights Reserved.</p>
        
        <Link 
          href="https://instagram.com/ismc.itb" 
          target="_blank" 
          className={styles.socialLink}
        >
          Instagram <ArrowIcon />
        </Link>
      </div>
    </footer>
  );
}