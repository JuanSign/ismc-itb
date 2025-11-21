"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, GripHorizontal } from "lucide-react";

// ... [KEEP YOUR "competitions" DATA ARRAY HERE EXACTLY AS IT IS] ...
const competitions = [
  {
    id: "orienteering",
    title: "Orienteering",
    description: "Orienteering is a competition of speed and accuracy using navigation tools such as maps and compasses. The race is held in locations with various terrains and involves finding several points in those locations. In this competition, participants must have good navigation skills, good physical abilities, as well as speed and accuracy in decision making.",
    image: "/assets/mc/orienteering.jpg",
  },
  // ... rest of your data
  {
    id: "mine-surveying",
    title: "Underground Mine Surveying",
    description: "Underground Mine Surveying is a competition that tests participants' skills in using a total station within a limited time to measure the dimensions of a tunnel. The measurement results obtained will be used to determine the direction of deformation of the rock in the tunnel. Participants will also be given the task of measuring the coordinates of a point in the tunnel and are expected to be able to solve various problems that may arise in underground mining operations using mapping methods.",
    image: "/assets/mc/surveying.jpg",
  },
  {
    id: "mine-supporting",
    title: "Underground Mine Supporting",
    description: "Underground Mine Supporting is a competition to determine the orientation of joints in a provided rock wall model, then perform calculations and analysis to determine rock stability, possible landslide directions, landslide volume, and recommended types of supports.",
    image: "/assets/mc/supporting.jpg",
  },
  {
    id: "evacuation-rescue",
    title: "Underground Evacuation Rescue",
    description: "Underground Evacuation Rescue is a competition that tests a team's ability to identify potential hazards and analyze risks through the preparation of a Job Safety Analysis (JSA), carry out evacuation and rescue of victims in underground mining accidents, and identify HIRARC (Hazard Identification, Risk Assessment, and Risk Control).",
    image: "/assets/mc/rescue.jpg",
  },
  {
    id: "tie-in",
    title: "Tie - In",
    description: "Tie-in is a branch of mining competition that tests the accuracy of participants in arranging a blasting system on a face in an underground mine. This competition is carried out in two sessions, namely the problem-solving session and the blasting pattern design session. In the problem-solving session, participants will work on problems and produce data that will be used in the blasting pattern design session. In the blasting pattern design session, each team will conduct a simulation using data from the previous problem-solving session on a wooden board by inserting the provided dummy nonnel (installing nonnel on a wooden board) and connecting it to the detonating cord to form a single blasting circuit on the blasting machine.",
    image: "/assets/mc/tie-in.jpg",
  },
  {
    id: "infiltration",
    title: "Infiltration",
    description: "Infiltration is a competition that aims to measure the infiltration rate at the specified location. Participants will independently install a double-ring infiltrometer while observing safety precautions, collect water from the provided source, and then conduct tests and calculations of the infiltration rate. Assessment is based on testing techniques and calculation accuracy, as well as the participants' ability to solve problems related to the basics of hydrology and hydrogeology.",
    image: "/assets/mc/infiltration.jpg",
  },
  {
    id: "ventilation",
    title: "Ventilation Duct Hanging",
    description: "Ventilation Duct Hanging is a competition that tests the skills of teams in installing ducts to support ventilation systems in underground mines. In this competition, each team is required to be able to install ducts optimally and analyze the air requirements that must be met in underground mines. In addition, each team is also required to complete a case study related to the dilution rate in underground mines. This competition aims to test the ability of teams to efficiently operate and regulate ventilation systems in underground mines, including mastery of air circulation concepts and expertise in performing the necessary technical calculations.",
    image: "/assets/mc/ventilation.jpg",
  },
  {
    id: "bench-blasting",
    title: "Bench Blasting",
    description: "Bench Blasting is a competition that tests participants' skills in designing and simulating surface blasting processes. This competition consists of several crucial stages, namely determining the blasting geometry, estimating the quality of the blasting results, and evaluating the results based on the applicable safety regulations and standards in Indonesia. In addition, participants will also compile the blasting geometry and ignition pattern on a bench frame model provided at a certain scale. The main objective of this competition is to provide participants with a practical understanding of blasting operational procedures in open pit mines, ensuring that they understand how to carry out blasting efficiently in order to increase productivity, while still prioritizing safety and compliance with applicable regulations.",
    image: "/assets/mc/blasting.jpg",
  },
  {
    id: "rock-drill",
    title: "Rock Drill",
    description: "Rock Drill is a competition that tests participants' skills in drilling rocks using small-scale equipment such as jack hammers and jacklegs. The competition is divided into two stages, namely technical calculations to determine the angle and depth of drilling, and the execution of drilling carried out vertically and horizontally on a simulated medium. The main objective of this competition is to provide participants with practical experience in drilling procedures in the mining industry and to train them to work efficiently, safely, and in accordance with applicable standards.",
    image: "/assets/mc/drilling.jpg",
  },
  {
    id: "track-stand",
    title: "Track Stand",
    description: "Track Stand is a competition that aims to test the team's skills in assembling rail tracks with precision. In this competition, the gauge value must be determined by the team as a reference specification for the rails to be assembled. Then, the team will assemble the rails and dismantle the previously assembled rails. This competition assesses the team's safety, accuracy, and cohesiveness in their work.",
    image: "/assets/mc/track-stand.jpg",
  },
  {
    id: "mine-design",
    title: "UG Mine Design",
    description: "UG Mine Design is a competition designed to challenge participants to create technically optimal and economically viable underground mining system designs. In this competition, participants are required to effectively apply mining planning software and be able to present their designs well. Participants are also required to adhere to Good Mining Practice principles and comply with applicable technical and legal regulations.",
    image: "/assets/mc/design.jpg",
  },
  {
    id: "hand-mucking",
    title: "Hand Mucking",
    description: "Hand Mucking is a competition that simulates productivity, particularly related to hauling and loading materials in underground mines. This competition will use lorries as the first hauling tool and wheelbarrows as the second hauling tool, as well as shovels as the loading tool. This competition trains agility, speed, and production accuracy in producing products according to buyer requirements.",
    image: "/assets/mc/mucking.jpg",
  },
  {
    id: "mineral-identification",
    title: "Rock Mineral Identification",
    description: "Rock Mineral Identification is a competition that identifies rocks and minerals both macroscopically and microscopically. This competition requires participants to be able to explain the properties of rocks or minerals. This ability is very important for mining engineers in knowing and describing rocks and minerals on the earth's surface.",
    image: "/assets/mc/identification.jpg",
  },
  {
    id: "resources-estimation",
    title: "Resources Estimation",
    description: "Resources Estimation is a competition that tests participants' skills and understanding in estimating mineral resources. In this competition, participants will be given a set of geological data. Their main task is to process and interpret the data to build a geological model and calculate the tonnage and grade of mineral deposits. Participants are required to apply relevant geostatistical methods and use geological modeling software to produce accurate and accountable estimates. The assessment will be based on the accuracy of the estimation results, the appropriateness of the methodology used, and the compliance of the final report with applicable reporting standards. The purpose of this competition is to train participants' abilities in conducting systematic resource evaluations in accordance with best practices in the mining industry.",
    image: "/assets/mc/estimation.jpg",
  },
  {
    id: "written-test",
    title: "Written Test & Smart Competition",
    description: "Written Test is held in the form of a written test consisting of multiple choice questions and case studies. The purpose of this competition was to test the participants' cognitive knowledge in terms of general knowledge, basic concepts, and calculations related to mining activities. In this competition, participants will be faced with various questions that require them to answer accurately and thoroughly, either by selecting the correct answer or writing an appropriate case study answer. Then, the top 6 teams will proceed to the Smart Competition to test their understanding and quick thinking skills. Thus, this competition provides an opportunity for participants to hone their understanding in the field of mining and test their ability to apply their knowledge practically, as well as practice decision-making under pressure.",
    image: "/assets/mc/written-test.jpg",
  },
  {
    id: "panning",
    title: "Panning & Grain Counting",
    description: "Panning & Grain Counting is a form of mineral panning implementation, similar to that found in nature, which measures participants' skills in handling samples using conventional methods to obtain the best recovery. The aim is to improve participants' competence in handling samples in the field. In addition, this competition also includes grain counting, where participants will examine samples and systematically count the number of grains present. Participants are assessed based on their ability to count grains efficiently and accurately, as well as their knowledge of grain characteristics and identification.",
    image: "/assets/mc/panning.jpg",
  },
];

export default function McDetailsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % competitions.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + competitions.length) % competitions.length);
  };

  const handleThumbnailClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Auto-scroll thumbnails to keep active one in view
  useEffect(() => {
    if (thumbnailsRef.current) {
      const activeThumb = thumbnailsRef.current.children[currentIndex] as HTMLElement;
      if (activeThumb) {
        const containerWidth = thumbnailsRef.current.offsetWidth;
        const scrollLeft = activeThumb.offsetLeft - containerWidth / 2 + activeThumb.offsetWidth / 2;
        thumbnailsRef.current.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [currentIndex]);

  // --- ANIMATION VARIANTS ---
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
    }),
  };

  const currentItem = competitions[currentIndex];

  return (
    <div className="min-h-screen bg-[#071A3D] text-white py-24 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          {/* Added font-heading */}
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-4">
            Mining Competitions
          </h1>
          {/* Added font-sans */}
          <p className="font-sans text-neutral-400 text-lg max-w-2xl mx-auto">
            Explore the various challenging categories in ISMC XV designed to test skills, accuracy, and mining knowledge.
          </p>
        </div>

        {/* Main Carousel Area */}
        <div className="relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl min-h-[600px] flex flex-col lg:flex-row">
          
          {/* LEFT: Image Display */}
          <div className="relative w-full lg:w-1/2 h-64 lg:h-auto bg-black/20 overflow-hidden">
            <AnimatePresence initial={false} mode="popLayout" custom={direction}>
              <motion.div
                key={currentItem.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={currentItem.image}
                  alt={currentItem.title}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-[#071A3D] via-transparent to-transparent opacity-60 lg:opacity-30" />
              </motion.div>
            </AnimatePresence>
            
            {/* Mobile Navigation Arrows */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 lg:hidden z-10">
              <button 
                onClick={handlePrev}
                className="p-2 bg-black/50 rounded-full backdrop-blur-sm hover:bg-white/20 transition"
              >
                <ChevronLeft />
              </button>
              <button 
                onClick={handleNext}
                className="p-2 bg-black/50 rounded-full backdrop-blur-sm hover:bg-white/20 transition"
              >
                <ChevronRight />
              </button>
            </div>
          </div>

          {/* RIGHT: Content Display */}
          <div className="w-full lg:w-1/2 p-6 md:p-12 flex flex-col relative z-10">
            {/* Counter */}
            <div className="flex items-center gap-2 mb-6 text-neutral-400 text-sm font-mono">
              <span className="text-white">{String(currentIndex + 1).padStart(2, '0')}</span>
              <div className="w-12 h-px bg-white/20"></div>
              <span>{String(competitions.length).padStart(2, '0')}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex flex-col justify-center"
              >
                {/* Added font-heading */}
                <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-linear-to-r from-white to-neutral-400">
                  {currentItem.title}
                </h2>
                
                <div className="prose prose-invert max-w-none">
                  {/* Added font-sans */}
                  <p className="font-sans text-neutral-300 text-lg leading-relaxed font-light">
                    {currentItem.description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Desktop Navigation Controls */}
            <div className="hidden lg:flex items-center gap-4 mt-8 pt-8 border-t border-white/10">
              <button
                onClick={handlePrev}
                className="p-4 rounded-full border border-white/20 hover:bg-white/10 hover:border-white transition-all duration-300 group"
              >
                <ChevronLeft className="w-6 h-6 text-neutral-400 group-hover:text-white" />
              </button>
              <button
                onClick={handleNext}
                className="p-4 rounded-full border border-white/20 hover:bg-white/10 hover:border-white transition-all duration-300 group"
              >
                <ChevronRight className="w-6 h-6 text-neutral-400 group-hover:text-white" />
              </button>
              
              <div className="ml-auto flex items-center gap-2 text-sm text-neutral-500 font-sans">
                <GripHorizontal className="w-4 h-4" />
                <span>Swipe or use arrows</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: Thumbnails Strip */}
        <div className="mt-8 relative">
          <div 
            ref={thumbnailsRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {competitions.map((comp, index) => (
              <button
                key={comp.id}
                onClick={() => handleThumbnailClick(index)}
                className={`relative shrink-0 w-48 h-28 rounded-xl overflow-hidden border transition-all duration-300 snap-start group ${
                  index === currentIndex 
                    ? "border-white ring-2 ring-white/20 scale-100 opacity-100" 
                    : "border-white/10 opacity-50 hover:opacity-80 scale-95"
                }`}
              >
                <Image
                  src={comp.image}
                  alt={comp.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors flex items-center justify-center p-2 text-center">
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-white">
                    {comp.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}