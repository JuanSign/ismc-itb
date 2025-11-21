"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mic2, Sparkles, Calendar, MapPin, ArrowRight, Users, Lightbulb } from "lucide-react";

const events = [
  {
    id: "mining-talk",
    title: "MINING TALKS",
    subtitle: "Professional Seminar & Interactive Sessions",
    description: [
      "Mining Talks is a professional seminar designed to provide in-depth insights into the mining industry through interactive sessions with experts, including academics, industry practitioners, and government representatives.",
      "The event aims to explore participants’ potential, broaden their understanding of challenges and opportunities in the mining sector, and equip them with practical knowledge to prepare for their professional careers.",
      "In an engaging and open atmosphere, participants are encouraged to actively share ideas, exchange perspectives, and expand their professional networks to better contribute to the advancement of Indonesia’s mining industry."
    ],
    icon: <Mic2 className="w-8 h-8" />,
    secondaryIcon: <Users className="w-5 h-5" />,
    accent: "from-cyan-400 to-blue-600",
    bgGlow: "bg-blue-500",
  },
  {
    id: "beyond-the-pit",
    title: "BEYOND THE PIT",
    subtitle: "Self-Discovery & Personal Branding",
    description: [
      "Beyond The Pit is an inspiring seminar featuring speakers who share experiences, insights, and tips on self-discovery, building strong personal branding, and developing essential skills for organizational involvement and future careers.",
      "Designed to be relaxed yet professional, the event is interactive and relevant to participants’ needs and life dynamics.",
      "The closing session encourages active participation and emotional connection between speakers and participants, creating a meaningful and memorable experience for everyone involved."
    ],
    icon: <Sparkles className="w-8 h-8" />,
    secondaryIcon: <Lightbulb className="w-5 h-5" />,
    accent: "from-amber-400 to-orange-600",
    bgGlow: "bg-orange-500",
  }
];

export default function EventPage() {
  return (
    <div className="min-h-screen bg-[#071A3D] text-neutral-100 relative overflow-hidden">
      
      {/* Background Ambient Elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* --- HEADER --- */}
      <section className="pt-32 pb-12 px-4 md:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          {/* Added font-heading */}
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Main Events
          </h1>
          <div className="h-1 w-24 bg-linear-to-r from-cyan-400 to-purple-500 mx-auto rounded-full mb-6" />
          {/* Added font-sans */}
          <p className="font-sans text-lg text-neutral-400 leading-relaxed">
            Join us for insightful sessions designed to elevate your knowledge, 
            network, and professional growth in the mining industry.
          </p>
        </motion.div>
      </section>

      {/* --- EVENTS CONTAINER --- */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 pb-32 flex flex-col gap-12 relative z-10">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="relative group"
          >
            {/* Card Background with Glassmorphism */}
            <div className="relative bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 overflow-hidden transition-all duration-500 hover:border-white/20 hover:bg-white/[0.07]">
              
              {/* Hover Glow Gradient */}
              <div className={`absolute -right-20 -top-20 w-64 h-64 ${event.bgGlow} opacity-10 blur-[80px] group-hover:opacity-20 transition-opacity duration-500`} />
              
              <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
                
                {/* Left Column: Header & Icon */}
                <div className="lg:w-1/3 flex flex-col items-start">
                  {/* Icon Box */}
                  <div className={`p-4 rounded-2xl bg-linear-to-br ${event.accent} text-white shadow-lg mb-6 transform group-hover:scale-110 transition-transform duration-500`}>
                    {event.icon}
                  </div>
                  
                  {/* Added font-heading */}
                  <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">
                    {event.title}
                  </h2>
                  
                  {/* Added font-sans */}
                  <h3 className={`font-sans text-lg font-medium text-transparent bg-clip-text bg-linear-to-r ${event.accent} mb-6`}>
                    {event.subtitle}
                  </h3>

                  {/* Meta Data */}
                  <div className="flex flex-col gap-3 w-full mt-auto pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 text-neutral-400 text-sm font-sans">
                      <Calendar className="w-4 h-4 text-neutral-500" />
                      <span>Date To Be Announced</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-400 text-sm font-sans">
                      <MapPin className="w-4 h-4 text-neutral-500" />
                      <span>TBA</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Description */}
                <div className="lg:w-2/3">
                  <div className="space-y-6 text-neutral-300 text-lg leading-relaxed font-light font-sans">
                    {event.description.map((paragraph, idx) => (
                      <p key={idx} className="hover:text-neutral-200 transition-colors duration-300">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  <div className="mt-10 flex items-center gap-4">
                    <button className={`px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 hover:border-white transition-all duration-300 flex items-center gap-2 group/btn font-sans`}>
                      <span>Coming Soon!</span>
                      <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    
                    {/* Decorative secondary icon */}
                    <div className="ml-auto text-neutral-600 group-hover:text-neutral-400 transition-colors">
                      {event.secondaryIcon}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}