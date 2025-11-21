import React from 'react';
import Image from 'next/image';

import styles from './HeroSection.module.css';

import AnimatedText from '@/components/AnimatedText/AnimatedText';

type HeroSectionProps = {
  showIntro: boolean;
};

export default function HeroSection({ showIntro: showPreloader }: HeroSectionProps) {
  return (
    <section className={`${styles.hero} relative`}>
      
      {/* --- TOP LOGOS (Absolute) --- */}
      
      {/* Top Left: ISMC-ITB */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-30 select-none pointer-events-none">
        <Image
          src="/logo/ISMC-ITB.png"
          alt="ISMC ITB Logo"
          width={120}
          height={120}
          className="w-16 md:w-24 h-auto object-contain"
        />
      </div>

      {/* [NEW] Top Middle: Center Logo */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 md:top-10 z-30 select-none pointer-events-none">
        <Image
          src="/logo/Header.png"
          alt="ISMC Center Logo"
          width={240}   
          height={120}
          className="w-32 md:w-48 h-auto object-contain" 
        />
      </div>

      {/* Top Right: HMT-ITB */}
      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-30 select-none pointer-events-none">
        <Image
          src="/logo/HMT-ITB.png"
          alt="HMT ITB Logo"
          width={120}
          height={120}
          className="w-16 md:w-24 h-auto object-contain"
        />
      </div>

      {/* --- BACKGROUND --- */}
      <div className={styles.heroBg}>
        <Image
          src="/pages/main/hero-bg.jpg" 
          alt="Comfortable interior space"
          layout="fill"
          objectFit="cover"
          priority={true}
        />
      </div>
      <div className={styles.heroOverlay}></div>
      <div className={styles.heroGradient}></div>
      
      {/* --- MAIN CONTENT --- */}
      <div className="max-w-[2000px] mx-auto px-4 lg:px-8 relative z-10">
        <div className={styles.heroContent}>
          <AnimatedText
            animateOnScroll={false}
            delay={showPreloader ? 4 : 0.85}
          >
            <h1 className="font-heading text-neutral text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              Mine for Unity
            </h1>
          </AnimatedText>
          <AnimatedText
            animateOnScroll={false}
            delay={showPreloader ? 4.15 : 1}
          >
            <p className="font-sans text-neutral text-lg md:text-xl">
              Excavate potential, align minds, and forge our legacy at ISMC XV.
            </p>
          </AnimatedText>
        </div>
      </div>

      {/* --- STATS SECTION --- */}
      <div className={`${styles.heroStats} relative`}>
        <div className="max-w-[2000px] mx-auto px-4 lg:px-8">
          <div className={styles.statsContainer}>
            <div className={styles.stat}>
              <div className={styles.statCount}>
                <AnimatedText delay={0.1}>
                  <h2 className="font-heading text-neutral font-semibold text-4xl md:text-6xl">
                    1000+
                  </h2>
                </AnimatedText>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statInfo}>
                <AnimatedText delay={0.15}>
                  <p className="font-sans text-neutral text-lg md:text-xl">
                    Participants has joined this events
                  </p>
                </AnimatedText>
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statCount}>
                <AnimatedText delay={0.2}>
                  <h2 className="font-heading text-neutral font-semibold text-4xl md:text-6xl">
                    50+
                  </h2>
                </AnimatedText>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statInfo}>
                <AnimatedText delay={0.25}>
                  <p className="font-sans text-neutral text-lg md:text-xl">
                    Companies and Media Partners joined us in our previous events
                  </p>
                </AnimatedText>
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statCount}>
                <AnimatedText delay={0.3}>
                  <h2 className="font-heading text-neutral font-semibold text-4xl md:text-6xl">
                    7
                  </h2>
                </AnimatedText>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statInfo}>
                <AnimatedText delay={0.35}>
                  <p className="font-sans text-neutral text-lg md:text-xl">
                    Days of Unforgettable Experiences, Connecting Young Miners in Unity
                  </p>
                </AnimatedText>
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statCount}>
                <AnimatedText delay={0.4}>
                  <h2 className="font-heading text-neutral font-semibold text-4xl md:text-6xl">
                    5+
                  </h2>
                </AnimatedText>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statInfo}>
                <AnimatedText delay={0.45}>
                  <p className="font-sans text-neutral text-lg md:text-xl">
                    Competitions or events for you to join
                  </p>
                </AnimatedText>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}