import Link from "next/link";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

import { CompetitionEntry } from "@/components/Competition/CompetitionEntry";
import { PersonalEntry } from "@/components/Competition/PersonalEntry";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Pickaxe,
  Lightbulb,
  FileText,
  Presentation,
  Lock,
  AlertCircle,
  Cpu,
  Camera
} from "lucide-react";
import { Toaster } from "sonner";

import { verifySession } from "@/actions/server/session";
import { createTeam as createMC, joinTeam as joinMC } from "@/actions/server/mc";
import { createTeam as createHack, joinTeam as joinHack } from "@/actions/server/hackathon";
import { createTeam as createPaper, joinTeam as joinPaper } from "@/actions/server/paper";
import { registerPoster } from "@/actions/server/poster";
import { registerPhoto } from "@/actions/server/photo";

function LockedSection({ 
  title, 
  description, 
  subtext,
  borderColorClass 
}: { 
  title: string; 
  description: string; 
  subtext?: string;
  borderColorClass: string; 
}) {
  return (
    <Card className={cn(
        "bg-muted/40 border-dashed border-muted-foreground/25 opacity-80 border-l-4",
        borderColorClass 
    )}>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
                <Lock className="w-3 h-3 mr-1" /> Locked
            </Badge>
        </div>
        <CardTitle className="text-xl text-muted-foreground/90">
            {title}
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground/70">
          {description}
        </CardDescription>
      </CardHeader>
      {subtext && (
        <CardContent>
            <Alert variant="default" className="bg-background/50 text-muted-foreground border-muted-foreground/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                    {subtext}
                </AlertDescription>
            </Alert>
        </CardContent>
      )}
    </Card>
  );
}

export default async function CompetitionPage() {
  const session = await verifySession();
  if (!session) redirect("/");

  const insightEvents = ["PAPER", "HACK", "POSTER", "PHOTO"]; 

  // Check memberships
  const hasJoinedMC = session.events!.includes("MC");
  
  const hasJoinedHack = session.events!.includes("HACK");
  const hasJoinedPaper = session.events!.includes("PAPER");
  const hasJoinedPoster = session.events!.includes("POSTER");
  const hasJoinedPhoto = session.events!.includes("PHOTO");

  const hasJoinedInsight = session.events!.some((e) => insightEvents.includes(e));

  // Lock Logic
  const isMCLocked = hasJoinedInsight; 
  const isInsightLocked = hasJoinedMC; 

  const lockMessage = "You must choose between Mining Competition or Mining Insight.";

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
             borderColorClass="border-l-primary"
           />
        ) : (
          <Card className="border-primary/20 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Pickaxe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Mining Competition</CardTitle>
                  <CardDescription>The Main Event</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                A competition for a team of seven members and one manager. Teams
                will compete in a series of mining-related challenges, ranging
                from orienteering to written tests.
              </p>
            </CardContent>
            <CardFooter className="flex gap-3 justify-end">
              <Button variant="outline" asChild>
                <Link href="/dashboard/mc/details">Show More</Link>
              </Button>
              <CompetitionEntry 
                title="Mining Competition"
                hasJoined={hasJoinedMC}
                redirectPath="/dashboard/competition/mc/team"
                createAction={createMC}
                joinAction={joinMC}
              />
            </CardFooter>
          </Card>
        )}

        {/* --- 2. MINING INSIGHT --- */}
        {isInsightLocked ? (
           <LockedSection 
             title="Mining Insight"
             description="A broader competition open to participants beyond the mining field."
             subtext={`${lockMessage} You have already joined the Mining Competition.`}
             borderColorClass="border-l-yellow-600"
           />
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <CardTitle>Mining Insight</CardTitle>
                  <CardDescription>
                      A broader competition open to participants beyond the mining field.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              
              <Accordion type="single" collapsible className="w-full">
                
                {/* A. PAPER COMPETITION */}
                <AccordionItem value="item-1">
                  <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>Paper Competition</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 px-1 pb-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Scientific writing competition combining business cases with academic mining studies.
                    </p>
                    <p className="text-sm font-medium">Open to teams of 1-3 participants.</p>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" asChild>
                          <Link href="/dashboard/paper/details">Show More</Link>
                      </Button>
                      <CompetitionEntry 
                        title="Paper Competition"
                        hasJoined={hasJoinedPaper}
                        redirectPath="/dashboard/competition/paper/team"
                        createAction={createPaper}
                        joinAction={joinPaper}
                        teamNamePlaceholder="e.g. Innovation Squad"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* B. HACKATHON */}
                <AccordionItem value="item-2">
                  <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3">
                          <Cpu className="h-4 w-4 text-muted-foreground" />
                          <span>Hackathon</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 px-1 pb-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Innovation-based team competition using Industry 4.0 technology to solve real-world mining problems.
                    </p>
                    <p className="text-sm font-medium">Open to teams of 3-5 participants.</p>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" asChild>
                          <Link href="/dashboard/hackathon/details">Show More</Link>
                      </Button>
                      <CompetitionEntry 
                        title="Hackathon"
                        hasJoined={hasJoinedHack}
                        redirectPath="/dashboard/competition/hackathon/team"
                        createAction={createHack}
                        joinAction={joinHack}
                        teamNamePlaceholder="e.g. Tech Miners"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* C. POSTER COMPETITION */}
                <AccordionItem value="item-3">
                  <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3">
                          <Presentation className="h-4 w-4 text-muted-foreground" />
                          <span>Poster Competition</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 px-1 pb-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Visually communicate complex engineering concepts through creative design.
                    </p>
                    <p className="text-sm font-medium">Individual Competition (1 Participant).</p>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" asChild>
                          <Link href="/dashboard/poster/details">Show More</Link>
                      </Button>
                      
                      <PersonalEntry 
                        title="Poster Competition"
                        action={registerPoster}
                        hasJoined={hasJoinedPoster}
                        redirectPath="/dashboard/competition/poster"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* D. PHOTO COMPETITION */}
                <AccordionItem value="item-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3">
                          <Camera className="h-4 w-4 text-muted-foreground" />
                          <span>Photo Competition</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 px-1 pb-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Capture broad earth science perspectives and present visual works that tell a story.
                    </p>
                    <p className="text-sm font-medium">Individual Competition (1 Participant).</p>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" asChild>
                          <Link href="/dashboard/photo/details">Show More</Link>
                      </Button>
                      
                      <PersonalEntry 
                        title="Photo Competition"
                        action={registerPhoto}
                        hasJoined={hasJoinedPhoto}
                        redirectPath="/dashboard/competition/photo"
                      />
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