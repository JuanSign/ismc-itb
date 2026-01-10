"use client";

import React, { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Phone, User, Calendar, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerEventAction, EventRegistrationState } from "@/actions/server/event";
import { toast } from "sonner";
import { EventType } from "@/actions/database/event";

type EventCardData = {
    id: string;
    eventType: EventType;
    title: string;
    subtitle: string;
    description: string[];
    date: string;      
    location: string;  
    icon: React.ReactNode;
    secondaryIcon: React.ReactNode;
    accent: string;
    bgGlow: string;
    isRegistered: boolean;
    userEmail: string;
};

export function EventCard({ event, index }: { event: EventCardData, index: number }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleRegister = async (formData: FormData) => {
        startTransition(async () => {
            const initialState: EventRegistrationState = {};
            const res = await registerEventAction(initialState, formData);
            
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(res.message);
                setOpen(false);
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="relative group"
        >
            <div className="relative bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 overflow-hidden transition-all duration-500 hover:border-white/20 hover:bg-white/[0.07] flex flex-col lg:flex-row gap-10 lg:gap-16">
                
                {/* Dynamic Glow */}
                <div className={`absolute -right-20 -top-20 w-64 h-64 ${event.bgGlow} opacity-10 blur-[80px] group-hover:opacity-20 transition-opacity duration-500`} />

                {/* Left Side: Header & Icon */}
                <div className="lg:w-1/3 flex flex-col items-start">
                    <div className={`p-4 rounded-2xl bg-linear-to-br ${event.accent} text-white shadow-lg mb-6 transform group-hover:scale-110 transition-transform duration-500`}>
                        {event.icon}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight font-heading">
                        {event.title}
                    </h2>
                    <h3 className={`text-lg font-medium text-transparent bg-clip-text bg-linear-to-r ${event.accent} mb-6 font-sans`}>
                        {event.subtitle}
                    </h3>

                    {/* Meta Data (Date & Location) - Updated to use props */}
                    <div className="flex flex-col gap-3 w-full mt-auto pt-8 border-t border-white/10">
                        <div className="flex items-center gap-3 text-neutral-300 text-sm font-sans font-medium">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-3 text-neutral-300 text-sm font-sans font-medium">
                            <MapPin className="w-4 h-4 text-red-400" />
                            <span>{event.location}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Content & Action */}
                <div className="lg:w-2/3 flex flex-col">
                    <div className="space-y-4 text-neutral-300 text-lg leading-relaxed font-light font-sans mb-8">
                        {event.description.map((p, i) => (
                            <p key={i} className="hover:text-neutral-100 transition-colors">{p}</p>
                        ))}
                    </div>

                    <div className="mt-auto pt-8 border-t border-white/10 flex items-center justify-between gap-4">
                        
                        {event.isRegistered ? (
                             <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-base font-medium">
                                <CheckCircle2 className="w-5 h-5" />
                                Registration Confirmed
                            </div>
                        ) : (
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button 
                                        className="h-12 px-8 rounded-full text-base font-medium bg-white text-blue-900 hover:bg-blue-50 hover:scale-105 transition-all duration-300 flex items-center gap-2 font-sans"
                                    >
                                        Register Now
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </DialogTrigger>
                                
                                <DialogContent className="bg-slate-950 border-white/10 text-white sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold">Register for {event.title}</DialogTitle>
                                        <DialogDescription className="text-slate-400">
                                            {event.date} • {event.location}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <form action={handleRegister} className="space-y-6 mt-4">
                                        <input type="hidden" name="event_type" value={event.eventType} />
                                        
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Email Address</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                                                <Input disabled value={event.userEmail} className="pl-10 bg-slate-900 border-white/10 text-slate-400" />
                                            </div>
                                            <p className="text-xs text-slate-500">Email matches your account session.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                                                <Input id="name" name="name" placeholder="Enter your full name" required className="pl-10 bg-slate-900 border-white/10 text-white focus:border-blue-500" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-slate-300">WhatsApp / Phone</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                                                <Input id="phone" name="phone" placeholder="e.g. 08123456789" required className="pl-10 bg-slate-900 border-white/10 text-white focus:border-blue-500" />
                                            </div>
                                        </div>

                                        <Button type="submit" disabled={isPending} className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold h-11">
                                            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</> : "Confirm Registration"}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}

                        <div className="text-white/30 hidden sm:block">
                            {event.secondaryIcon}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}