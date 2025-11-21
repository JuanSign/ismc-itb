"use client";

import React, { useEffect, useRef } from "react";

import styles from "./IntroductionSection.module.css";
import AnimatedText from "@/components/AnimatedText/AnimatedText";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function IntroductionSection() {
  const containerRef = useRef<HTMLElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!tagsRef.current) return;

      const tags = tagsRef.current.querySelectorAll(".what-we-do-tag");
      gsap.set(tags, { opacity: 0, x: -40 });

      ScrollTrigger.create({
        trigger: tagsRef.current,
        start: "top 90%",
        once: true,
        animation: gsap.to(tags, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        }),
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
     <section
       ref={containerRef}
       className="relative z-3 mt-[-30svh] pt-48 md:pt-64 pb-20 md:pb-40 bg-[#071A3D] text-neutral-100"
     >
      <div className="max-w-[2000px] mx-auto px-4 lg:px-8">
        <div className="mb-16 md:mb-24">
          <AnimatedText delay={0.1}>
            <h1 className="font-heading text-4xl md:text-6xl font-medium leading-tight tracking-tighter">
              <span className="inline-block w-0 md:w-80">&nbsp;</span>
              Learn about our events, competitions, and many more. Dive deeper into the biggest mining events in the country.
            </h1>
          </AnimatedText>
        </div>

        <div className={styles.content}>
          <div className={styles.columnLeft}>
            <AnimatedText delay={0.1}>
              <p className="font-sans text-neutral-400">About ISMC XV</p>
            </AnimatedText>

            <AnimatedText delay={0.15}>
              <p className="text-xl text-neutral w-full md:w-1/2">
                “We are the largest mining-focused event in Indonesia, 
                featuring a wide range of competitions. From mining contests to hackathons and photography challenges,
                as well as talk shows and many other activities.”
              </p>
            </AnimatedText>
          </div>

          <div className={styles.column}>
            <div ref={tagsRef} className="flex flex-wrap gap-2">
              <div className="what-we-do-tag inline-block px-6 py-3 md:px-8 md:py-4 border border-neutral-700 rounded-full">
                <h3 className="font-heading text-2xl md:text-4xl font-medium">
                  Mining Competition
                </h3>
              </div>
              <div className="what-we-do-tag inline-block px-6 py-3 md:px-8 md:py-4 border border-neutral-700 rounded-full">
                <h3 className="font-heading text-2xl md:text-4xl font-medium">
                  Mining Talks
                </h3>
              </div>
              <div className="what-we-do-tag inline-block px-6 py-3 md:px-8 md:py-4 border border-neutral-700 rounded-full">
                <h3 className="font-heading text-2xl md:text-4xl font-medium">
                  Paper Comp.
                </h3>
              </div>
              <div className="what-we-do-tag inline-block px-6 py-3 md:px-8 md:py-4 border border-neutral-700 rounded-full">
                <h3 className="font-heading text-2xl md:text-4xl font-medium">
                  Photo Comp.
                </h3>
              </div>
              <div className="what-we-do-tag inline-block px-6 py-3 md:px-8 md:py-4 border border-neutral-700 rounded-full">
                <h3 className="font-heading text-2xl md:text-4xl font-medium">
                  Beyond the Pit
                </h3>
              </div>              
              <div className="what-we-do-tag inline-block px-6 py-3 md:px-8 md:py-4 border border-neutral-700 rounded-full">
                <h3 className="font-heading text-2xl md:text-4xl font-medium">
                  Hackathon
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}