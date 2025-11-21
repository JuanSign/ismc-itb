// Utils
import { redirect } from "next/navigation";
import Link from "next/link";

// UI
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CompetitionEntry } from "@/components/Competition/CompetitionEntry";
import { LockedSection } from "@/components/LockedSection/LockedSection";
import { PersonalEntry } from "@/components/Competition/PersonalEntry";
import { Pickaxe, Lightbulb, FileText, Presentation, Cpu, Camera } from "lucide-react";
import { Toaster } from "sonner";

// Actions
import { createTeam as createHack, joinTeam as joinHack } from "@/actions/server/hackathon";
import { createTeam as createMC, joinTeam as joinMC } from "@/actions/server/mc";
import { createTeam as createPaper, joinTeam as joinPaper } from "@/actions/server/paper";
import { registerPhoto } from "@/actions/server/photo";
import { registerPoster } from "@/actions/server/poster";
import { verifySession } from "@/actions/server/session";

export default async function CompetitionPage() {
  const session = await verifySession();
  if (!session) redirect("/register");

  const insightEvents = ["PAPER", "HACK", "POSTER", "PHOTO"]; 

  const hasJoinedMC = session.events!.includes("MC");
  const hasJoinedInsight = session.events!.some((e) => insightEvents.includes(e));
  
  const hasJoinedHack = session.events!.includes("HACK");
  const hasJoinedPaper = session.events!.includes("PAPER");
  const hasJoinedPoster = session.events!.includes("POSTER");
  const hasJoinedPhoto = session.events!.includes("PHOTO");

  const isMCLocked = hasJoinedInsight; 
  const isInsightLocked = hasJoinedMC; 

  const lockMessage = "You must choose between Mining Competition or Mining Insight.";

  const glassCardClass = "bg-slate-950/70 backdrop-blur-md border-white/10 text-slate-100 shadow-2xl";

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Toaster richColors/>
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        
        {/* --- 1. MINING COMPETITION --- */}
        {isMCLocked ? (
           <LockedSection 
             title="Mining Competition"
             description="A competition for a team of seven members and one manager."
             subtext={`${lockMessage} You have already joined a Mining Insight competition.`}
             borderColorClass="border-l-blue-500"
           />
        ) : (
          <Card className={glassCardClass}>
            <CardHeader>
              <div className="flex items-center gap-3">
                {/* Icon container: semi-transparent white */}
                <div className="p-2 bg-white/10 rounded-lg border border-white/5">
                  <Pickaxe className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl tracking-wide">Mining Competition</CardTitle>
                  <CardDescription className="text-slate-300">The Main Event</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed">
                A competition for a team of seven members and one manager. Teams
                will compete in a series of mining-related challenges, ranging
                from orienteering to written tests.
              </p>
            </CardContent>
            <CardFooter className="flex gap-3 justify-end">
              <Button variant="outline" className="border-white/20 bg-transparent hover:bg-white/10 hover:text-white text-slate-200" asChild>
                <Link href="/dashboard/mc/details">Show More</Link>
              </Button>
              <div className="brightness-110">
                <CompetitionEntry 
                  title="Mining Competition"
                  hasJoined={hasJoinedMC}
                  redirectPath="/dashboard/mc"
                  createAction={createMC}
                  joinAction={joinMC}
                />
              </div>
            </CardFooter>
          </Card>
        )}

        {/* --- 2. MINING INSIGHT --- */}
        {isInsightLocked ? (
           <LockedSection 
             title="Mining Insight"
             description="A broader competition open to participants beyond the mining field."
             subtext={`${lockMessage} You have already joined the Mining Competition.`}
             borderColorClass="border-l-yellow-500"
           />
        ) : (
          <Card className={glassCardClass}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg border border-white/5">
                  <Lightbulb className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl tracking-wide">Mining Insight</CardTitle>
                  <CardDescription className="text-slate-300">
                      A broader competition open to participants beyond the mining field.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              
              <Accordion type="single" collapsible className="w-full border-white/10">
                
                {/* A. PAPER COMPETITION */}
                <AccordionItem value="item-1" className="border-white/10">
                  <AccordionTrigger className="hover:no-underline hover:bg-white/5 px-3 py-4 rounded-md transition-all data-[state=open]:bg-white/5">
                      <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-300" />
                          <span className="text-slate-100">Paper Competition</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 px-3 pb-6 pt-4">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Scientific writing competition combining business cases with academic mining studies.
                    </p>
                    <p className="text-sm font-medium text-yellow-400">Open to teams of 1-3 participants.</p>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" className="border-white/20 bg-transparent hover:bg-white/10 hover:text-white text-slate-200" asChild>
                          <Link href="/dashboard/paper/details">Show More</Link>
                      </Button>
                      <div className="brightness-110">
                        <CompetitionEntry 
                            title="Paper Competition"
                            hasJoined={hasJoinedPaper}
                            redirectPath="/dashboard/competition/paper/team"
                            createAction={createPaper}
                            joinAction={joinPaper}
                            teamNamePlaceholder="e.g. Innovation Squad"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* B. HACKATHON */}
                <AccordionItem value="item-2" className="border-white/10">
                  <AccordionTrigger className="hover:no-underline hover:bg-white/5 px-3 py-4 rounded-md transition-all data-[state=open]:bg-white/5">
                      <div className="flex items-center gap-3">
                          <Cpu className="h-5 w-5 text-purple-300" />
                          <span className="text-slate-100">Hackathon</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 px-3 pb-6 pt-4">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Innovation-based team competition using Industry 4.0 technology to solve real-world mining problems.
                    </p>
                    <p className="text-sm font-medium text-yellow-400">Open to teams of 3-5 participants.</p>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" className="border-white/20 bg-transparent hover:bg-white/10 hover:text-white text-slate-200" asChild>
                          <Link href="/dashboard/hackathon/details">Show More</Link>
                      </Button>
                      <div className="brightness-110">
                        <CompetitionEntry 
                            title="Hackathon"
                            hasJoined={hasJoinedHack}
                            redirectPath="/dashboard/competition/hackathon/team"
                            createAction={createHack}
                            joinAction={joinHack}
                            teamNamePlaceholder="e.g. Tech Miners"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* C. POSTER COMPETITION */}
                <AccordionItem value="item-3" className="border-white/10">
                  <AccordionTrigger className="hover:no-underline hover:bg-white/5 px-3 py-4 rounded-md transition-all data-[state=open]:bg-white/5">
                      <div className="flex items-center gap-3">
                          <Presentation className="h-5 w-5 text-teal-300" />
                          <span className="text-slate-100">Poster Competition</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 px-3 pb-6 pt-4">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Visually communicate complex engineering concepts through creative design.
                    </p>
                    <p className="text-sm font-medium text-yellow-400">Individual Competition (1 Participant).</p>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" className="border-white/20 bg-transparent hover:bg-white/10 hover:text-white text-slate-200" asChild>
                          <Link href="/dashboard/poster/details">Show More</Link>
                      </Button>
                      <div className="brightness-110">
                        <PersonalEntry 
                            title="Poster Competition"
                            action={registerPoster}
                            hasJoined={hasJoinedPoster}
                            redirectPath="/dashboard/competition/poster"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* D. PHOTO COMPETITION */}
                <AccordionItem value="item-4" className="border-transparent">
                  <AccordionTrigger className="hover:no-underline hover:bg-white/5 px-3 py-4 rounded-md transition-all data-[state=open]:bg-white/5">
                      <div className="flex items-center gap-3">
                          <Camera className="h-5 w-5 text-pink-300" />
                          <span className="text-slate-100">Photo Competition</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 px-3 pb-6 pt-4">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Capture broad earth science perspectives and present visual works that tell a story.
                    </p>
                    <p className="text-sm font-medium text-yellow-400">Individual Competition (1 Participant).</p>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" className="border-white/20 bg-transparent hover:bg-white/10 hover:text-white text-slate-200" asChild>
                          <Link href="/dashboard/photo/details">Show More</Link>
                      </Button>
                      <div className="brightness-110">
                        <PersonalEntry 
                            title="Photo Competition"
                            action={registerPhoto}
                            hasJoined={hasJoinedPhoto}
                            redirectPath="/dashboard/competition/photo"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

              </Accordion>

            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}