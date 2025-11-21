import React from 'react';
import Image from 'next/image';

import styles from './HeroSection.module.css';

import AnimatedText from '@/components/AnimatedText/AnimatedText';

type HeroSectionProps = {
  showIntro: boolean;
};

export default function HeroSection({ showIntro: showPreloader }: HeroSectionProps) {
  return (
    <section className={styles.hero}>
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
      
      <div className="max-w-[2000px] mx-auto px-4 lg:px-8">
        <div className={styles.heroContent}>
          <AnimatedText
            animateOnScroll={false}
            delay={showPreloader ? 4 : 0.85}
          >
            <h1 className="font-heading text-neutral text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              Learn, Compete, and Explore.
            </h1>
          </AnimatedText>
          <AnimatedText
            animateOnScroll={false}
            delay={showPreloader ? 4.15 : 1}
            
          >
            <p className="font-sans text-neutral text-lg md:text-xl">
              The global stage for student mining excellence. ISMC is more than a competition.
              its the future of the industry.
            </p>
          </AnimatedText>
        </div>
      </div>

      <div className={styles.heroStats}>
        <div className="max-w-[2000px] mx-auto px-4 lg:px-8">
          <div className={styles.statsContainer}>
            <div className={styles.stat}>
              <div className={styles.statCount}>
                <AnimatedText delay={0.1}>
                  <h2 className="font-heading text-neutral font-semibold text-4xl md:text-6xl">
                    100+
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
                    5+
                  </h2>
                </AnimatedText>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statInfo}>
                <AnimatedText delay={0.25}>
                  <p className="font-sans text-neutral text-lg md:text-xl">
                    Countries all over the world
                  </p>
                </AnimatedText>
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statCount}>
                <AnimatedText delay={0.3}>
                  <h2 className="font-heading text-neutral font-semibold text-4xl md:text-6xl">
                    1
                  </h2>
                </AnimatedText>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statInfo}>
                <AnimatedText delay={0.35}>
                  <p className="font-sans text-neutral text-lg md:text-xl">
                    Whole week of excitement
                  </p>
                </AnimatedText>
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statCount}>
                <AnimatedText delay={0.4}>
                  <h2 className="font-heading text-neutral font-semibold text-4xl md:text-6xl">
                    7
                  </h2>
                </AnimatedText>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statInfo}>
                <AnimatedText delay={0.45}>
                  <p className="font-sans text-neutral text-lg md:text-xl">
                    Competitions or events for you to join.
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