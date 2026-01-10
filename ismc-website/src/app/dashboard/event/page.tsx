import React from "react";
import { Mic2, Sparkles, Users, Lightbulb } from "lucide-react";
import { verifySession } from "@/actions/server/session";
import { getRegisteredEventsDB } from "@/actions/database/event";
import { redirect } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { Toaster } from "sonner";

const eventData = [
  {
    id: "mining-talk",
    eventType: "MT" as const,
    title: "MINING TALKS",
    subtitle: "Professional Seminar & Interactive Sessions",
    date: "14 February 2026",
    location: "Institut Teknologi Bandung",
    description: [
      "Mining Talks is a professional seminar designed to provide in-depth insights into the mining industry through interactive sessions with experts.",
      "The event aims to explore participants’ potential, broaden their understanding of challenges and opportunities in the mining sector.",
      "In an engaging atmosphere, participants actively share ideas and expand professional networks."
    ],
    icon: <Mic2 className="w-8 h-8" />,
    secondaryIcon: <Users className="w-6 h-6" />,
    accent: "from-cyan-400 to-blue-600",
    bgGlow: "bg-blue-500",
  },
  {
    id: "beyond-the-pit",
    eventType: "BTP" as const,
    title: "BEYOND THE PIT",
    subtitle: "Self-Discovery & Personal Branding",
    date: "7 February 2026",
    location: "Institut Teknologi Bandung",
    description: [
      "Beyond The Pit is an inspiring seminar featuring speakers who share experiences on self-discovery and personal branding.",
      "Designed to be relaxed yet professional, the event is interactive and relevant to participants’ needs.",
      "The closing session encourages active participation and emotional connection between speakers and participants."
    ],
    icon: <Sparkles className="w-8 h-8" />,
    secondaryIcon: <Lightbulb className="w-6 h-6" />,
    accent: "from-amber-400 to-orange-600",
    bgGlow: "bg-orange-500",
  }
];

export default async function EventPage() {
  const session = await verifySession();
  if (!session) redirect("/login");

  const registeredEvents = await getRegisteredEventsDB(session.account_id);

  return (
    <div className="min-h-screen bg-[#071A3D] text-neutral-100 relative overflow-hidden font-sans">
      <Toaster richColors />
      
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <section className="pt-32 pb-16 px-4 md:px-8 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-white drop-shadow-lg">
            Main Events
          </h1>
          <div className="h-1.5 w-24 bg-linear-to-r from-cyan-400 to-purple-500 mx-auto rounded-full mb-8" />
          <p className="font-sans text-xl text-neutral-300 leading-relaxed max-w-2xl mx-auto">
            Elevate your knowledge and expand your network. Join our exclusive seminars designed for the future leaders of the mining industry.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 pb-32 flex flex-col gap-16 relative z-10">
        {eventData.map((event, index) => (
          <EventCard 
            key={event.id}
            index={index}
            event={{
                ...event,
                userEmail: session.email,
                isRegistered: registeredEvents.includes(event.eventType)
            }}
          />
        ))}
      </div>
    </div>
  );
}