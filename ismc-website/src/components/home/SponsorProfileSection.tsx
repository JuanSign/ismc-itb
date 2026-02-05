"use client";

import { useState } from 'react';
import { featuredSponsors } from './data/sponsorProfile';

export default function SponsorProfileSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === featuredSponsors.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredSponsors.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentSponsor = featuredSponsors[currentIndex];

  return (
    <section className="relative py-24 bg-ismc-darkBlue text-white border-t border-ismc-teal/10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="inline-block text-xs md:text-sm font-bold font-montserrat text-ismc-orange tracking-[0.3em] uppercase py-2 px-4 border border-ismc-orange/30 rounded-full bg-ismc-orange/10">
            Featured Sponsor Profile
          </h2>
        </div>
        
        <div className="relative">
          <div className="w-full">
            <div key={currentIndex} className="flex flex-col items-center animate-fade-in-up">
              <div className="group relative w-full max-w-5xl aspect-video rounded-3xl p-1 bg-linear-to-b from-ismc-teal/30 via-transparent to-ismc-teal/10 shadow-2xl">
                <div className="relative w-full h-full rounded-[20px] overflow-hidden bg-black border border-ismc-teal/20">
                  <iframe 
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${currentSponsor.youtubeVideoId}?rel=0&modestbranding=1&showinfo=0`}
                    title={`${currentSponsor.name} Profile Video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ border: 0 }}
                  />
                </div>
              </div>
              <h3 className="mt-8 text-2xl md:text-3xl font-bold font-montserrat text-white tracking-wide text-center">
                {currentSponsor.name}
              </h3>
            </div>
          </div>

          <button 
            onClick={prevSlide}
            className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-2 md:-translate-x-16 p-4 rounded-full border border-white/10 bg-ismc-darkBlue hover:bg-ismc-teal/20 transition-all duration-300 hover:scale-110 z-20"
            aria-label="Previous Sponsor"
          >
            <svg className="w-6 h-6 text-ismc-lightBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={nextSlide}
            className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-2 md:translate-x-16 p-4 rounded-full border border-white/10 bg-ismc-darkBlue hover:bg-ismc-teal/20 transition-all duration-300 hover:scale-110 z-20"
            aria-label="Next Sponsor"
          >
            <svg className="w-6 h-6 text-ismc-lightBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div className="flex justify-center items-center space-x-4 mt-12">
          {featuredSponsors.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`relative h-1.5 rounded-full transition-all duration-500 ${
                idx === currentIndex 
                  ? 'w-16 bg-ismc-orange' 
                  : 'w-4 bg-ismc-teal/30 hover:bg-ismc-teal/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}