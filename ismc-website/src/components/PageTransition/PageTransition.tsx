"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";
import styles from "./PageTransition.module.css";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLDivElement[]>([]);
  const isTransitioning = useRef(false);

  const revealPage = useCallback(() => {
    gsap.set(blocksRef.current, { 
      scaleX: 1, 
      transformOrigin: "right" 
    });

    gsap.to(blocksRef.current, {
      scaleX: 0,
      duration: 0.5,
      stagger: 0.02,
      ease: "power2.out",
      transformOrigin: "right",
      onComplete: () => {
        isTransitioning.current = false;
        if (overlayRef.current) {
          overlayRef.current.style.pointerEvents = "none";
        }
      },
    });
  }, []);

  const coverPage = useCallback((url: string) => {
    if (overlayRef.current) {
      overlayRef.current.style.pointerEvents = "auto";
    }

    gsap.to(blocksRef.current, {
      scaleX: 1,
      duration: 0.5,
      stagger: 0.02,
      ease: "power2.inOut", 
      transformOrigin: "left",
      onComplete: () => {
        router.push(url);
      },
    });
  }, [router]);

  const onAnchorClick = useCallback(
    (e: MouseEvent) => {
      const target = e.currentTarget as HTMLAnchorElement;
      const href = target.getAttribute("href");

      if (
        !href ||
        href.startsWith("http") || 
        href.startsWith("#") ||   
        target.target === "_blank" || 
        isTransitioning.current
      ) {
        return;
      }

      e.preventDefault();
      const url = href;

      if (url !== pathname) {
        isTransitioning.current = true;
        coverPage(url);
      }
    },
    [pathname, coverPage]
  );

  useEffect(() => {
    const links = document.querySelectorAll("a");
    
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("/") && !href.startsWith("#")) {
        link.addEventListener("click", onAnchorClick);
      }
    });

    return () => {
      links.forEach((link) => {
        link.removeEventListener("click", onAnchorClick);
      });
    };
  }, [pathname, onAnchorClick]);

  useEffect(() => {
    revealPage();
  }, [pathname, revealPage]);

  return (
    <>
      <div ref={overlayRef} className={styles.transitionOverlay}>
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={styles.block}
            ref={(el) => {
              if (el) blocksRef.current[i] = el;
            }}
          />
        ))}
      </div>
      {children}
    </>
  );
}