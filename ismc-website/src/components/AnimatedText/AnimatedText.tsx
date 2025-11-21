"use client";

import React, {
  useRef,
  useEffect,
  ReactNode,
  cloneElement,
  Children,
  isValidElement,
} from "react";
import styles from "./AnimatedText.module.css"; 

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(SplitText, ScrollTrigger);

type AnimatedTextProps = {
  children: ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
};

export default function AnimatedText({
  children,
  animateOnScroll = true,
  delay = 0,
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const splitRefs = useRef<SplitText[]>([]);
  const lines = useRef<HTMLElement[]>([]);
  const elementRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const initializeSplitText = async () => {
        if (!containerRef.current) return;

        splitRefs.current = [];
        lines.current = [];
        elementRefs.current = [];

        let elements: HTMLElement[] = [];
        if (containerRef.current.hasAttribute("data-copy-wrapper")) {
          elements = Array.from(
            containerRef.current.children
          ) as HTMLElement[];
        } else {
          elements = [containerRef.current];
        }

        elements.forEach((element) => {
          elementRefs.current.push(element);

          const split = SplitText.create(element, {
            type: "lines",
            mask: "lines",
            linesClass: styles.line,
            lineThreshold: 0.1,
          });

          splitRefs.current.push(split);

          const computedStyle = window.getComputedStyle(element);
          const textIndent = computedStyle.textIndent;

          if (textIndent && textIndent !== "0px") {
            if (split.lines.length > 0) {
              (split.lines[0] as HTMLElement).style.paddingLeft = textIndent;
            }
            element.style.textIndent = "0";
          }

          lines.current.push(...(split.lines as HTMLElement[]));
        });

        gsap.set(lines.current, { y: "100%" });

        const animationProps: gsap.TweenVars = {
          y: "0%",
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
          delay: delay,
        };

        if (animateOnScroll) {
          gsap.to(lines.current, {
            ...animationProps,
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 90%",
              once: true,
            },
          });
        } else {
          gsap.to(lines.current, animationProps);
        }
      };

      initializeSplitText();
    }, containerRef);

    return () => {
      ctx.revert();
      splitRefs.current.forEach((split) => {
        if (split) {
          split.revert();
        }
      });
    };
  }, [animateOnScroll, delay]); 

  if (Children.count(children) === 1 && isValidElement(children)) {
    return cloneElement(children, { ref: containerRef } as React.RefAttributes<HTMLElement>);
  }

  return (
    <div
      ref={containerRef as React.Ref<HTMLDivElement>}
      data-copy-wrapper="true"
    >
      {children}
    </div>
  );
}