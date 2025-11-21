"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";     
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./DetailSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    title: "Mining Competition",
    description:
      "A prestigious team competition challenging participants across 16 technical mining skills. Teams must demonstrate expertise in areas such as Orienteering, Underground Surveying, Rescue, Blasting, Mine Design, and Resource Estimation through rigorous practical simulations and cognitive tests.",
    image: "/assets/mining_competition.jpg",
  },
  {
    title: "Mining Insight",
    description:
      "Mining Insight is ISMC's multidisciplinary competition series that bridges mining, business strategy, and earth science. Through its four branches; Paper, Hackathon, Poster, and Photo, participants tackle real industry challenges, innovate with technology, and showcase geological perspectives through visual storytelling.",
    image: "/assets/mining-insight.jpg",
  },
  {
    title: "Mining Talks",
    description:
      "A professional seminar designed to provide in-depth insights into the industry. We bring together experts, academics, and practitioners to explore challenges, opportunities, and practical knowledge to prepare you for a professional career in mining.",
    image: "/assets/mining_talk.jpg",
  },
  {
    title: "Beyond the Pit",
    description:
      "An inspiring, relaxed seminar focusing on self-discovery and personal branding. Speakers share experiences to help you develop essential soft skills, build networks, and prepare for future career dynamics in a meaningful way.",
    image: "/assets/beyond_the_pit.jpg",
  },
];

export default function DetailSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      const serviceItems = gsap.utils.toArray<HTMLElement>(`.${styles.service}`);

      serviceItems.forEach((service) => {
        const imgContainer = service.querySelector(`.${styles.imgContainer}`);

        mm.add("(min-width: 769px)", () => {
          gsap.set(service, { height: "150px" });
          gsap.set(imgContainer, { width: "30%" });

          gsap.to(imgContainer, {
            width: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: service,
              start: "bottom bottom",
              end: "top top",
              scrub: true,
            },
          });

          gsap.to(service, {
            height: "450px",
            ease: "none",
            scrollTrigger: {
              trigger: service,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          });
        });

        mm.add("(max-width: 768px)", () => {
          gsap.set(service, { height: "350px" });
          gsap.set(imgContainer, { width: "100%" });

          gsap.to(service, {
            height: "550px", 
            ease: "none",
            scrollTrigger: {
              trigger: service,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          });
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.services} ref={containerRef}>
      {services.map((service, index) => (
        <div key={index} className={styles.service}>
          <div className={styles.serviceInfo}>
            <h1 className="font-heading">{service.title}</h1>
            <p className="font-sans">{service.description}</p>
          </div>
          <div className={styles.serviceImg}>
            <div className={styles.imgContainer}>
              <Image 
                src={service.image} 
                alt={service.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={index === 0}
              />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}