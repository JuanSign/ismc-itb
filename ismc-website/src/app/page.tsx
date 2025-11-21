"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { ReactLenis, useLenis } from "lenis/react";

import IntroAnimation from "@/components/IntroAnimation/IntroAnimation";
import HeroSection from "@/sections/HeroSection/HeroSection";
import IntroductionSection from "@/sections/IntroductionSection/IntroductionSection";
import DetailSection from "@/sections/DetailSection/DetailSection";
import FooterSection from "@/sections/FooterSection/FooterSection";

let isInitialLoad = true;

gsap.registerPlugin(ScrollTrigger, CustomEase);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

export default function Home() {
  const lenis = useLenis();
  const [showIntro, setShowIntro] = useState<boolean>(isInitialLoad);
  const [introAnimating, setIntroAnimating] = useState<boolean>(showIntro);

  useEffect(() => {
    return () => {
      isInitialLoad = false;
    };
  }, []);

  useEffect(() => {
    if (!lenis) return;
    if (introAnimating) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [lenis, introAnimating]);

  return (
    <ReactLenis root>
      {showIntro && (
        <IntroAnimation
          onComplete={() => {
            setIntroAnimating(false);
            setShowIntro(false);
          }}
        />
      )}
      <HeroSection showIntro={isInitialLoad} />
      <IntroductionSection />
      <DetailSection />
      <FooterSection/>
    </ReactLenis>
  );
}