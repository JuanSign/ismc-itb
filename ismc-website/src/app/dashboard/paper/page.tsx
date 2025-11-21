import { getTeamPageData, leaveTeam, updateBilling } from "@/actions/server/paper";
import { TeamLeaveButton } from "@/components/Competition/general/TeamLeaveButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TeamStatusBadge } from "@/components/Competition/general/TeamStatusBadge";

import { TeamMemberDialog } from "@/components/Competition/paper/TeamMemberDialog";
import { PaymentSection } from "@/components/Competition/general/PaymentSection";
import { MemberStatusBadge } from "@/components/Competition/general/MemberStatusBadge";
import { SubmissionSection } from "@/components/Competition/paper/SubmissionSection";

function getInitials(name: string | null, email: string) {
  if (name) { const names = name.split(' '); return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : name.substring(0, 2); }
  return email.substring(0, 2);
}

function LockedSection({ 
  step, 
  title, 
  description, 
  subtext,
  borderColorClass 
}: { 
  step: string; 
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
            <Badge variant="outline" className="bg-transparent border-muted-foreground/50 text-muted-foreground">
                {step}
            </Badge>
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
                <Clock className="h-4 w-4" />
                <AlertDescription className="text-xs">
                    {subtext}
                </AlertDescription>
            </Alert>
        </CardContent>
      )}
    </Card>
  );
}

const getTeamStatusText = (status: number) => {
  switch (status) { case 0: return "Waiting for Verification"; case 1: return "Waiting for Documents"; case 2: return "Waiting for Payment"; case 3: return "Waitlisted"; case 4: return "Accepted"; default: return "Unknown"; }
};

export default async function PaperTeamPage() {
  const { team, members, currentUserAccountId } = await getTeamPageData();
  const teamStatus: number = team.status as number;
  const currentUser = members.find(m => m.account_id === currentUserAccountId);
  const isManager = currentUser?.role === 'MANAGER';

  const isPaymentLocked = teamStatus === 0; 
  const isSubmissionLocked = teamStatus < 2;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        
        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2"><Badge className="bg-blue-600 hover:bg-blue-700">STEP 1</Badge><span className="text-sm font-medium text-muted-foreground">Team Verification</span></div>
                    <CardTitle className="text-2xl truncate">{team.name}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2 flex-wrap">Code: <span className="font-mono text-foreground font-bold bg-muted px-1.5 rounded">{team.code}</span></CardDescription>
                </div>
                <div className="flex flex-row md:flex-col items-center md:items-end gap-2 w-full md:w-auto justify-between md:justify-start">
                    <div className="px-3 py-1 text-xs font-medium text-secondary-foreground border rounded-md bg-secondary/50 text-center">{getTeamStatusText(teamStatus)}</div>
                    <TeamStatusBadge status={teamStatus} notes={team.notes} />
                </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-semibold">Members ({members.length}/3)</h4></div>
            <div className="flex flex-col gap-3">
              {members.map((member) => (
                <div key={member.account_id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="shrink-0 h-10 w-10"><AvatarImage src={member.fp_link || ""} /><AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(member.name, member.email).toUpperCase()}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm flex items-center gap-1.5 flex-wrap"><span className="truncate block max-w-[120px] sm:max-w-[200px]">{member.name || member.email}</span>{member.account_id === currentUserAccountId && <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded border border-blue-100 shrink-0">YOU</span>}{member.role === 'MANAGER' && <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-100 px-1.5 py-0.5 rounded shrink-0">MANAGER</span>}</div>
                      {member.name && <p className="text-xs text-muted-foreground truncate">{member.email}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0"><MemberStatusBadge status={member.status} notes={member.notes}/><TeamMemberDialog member={member} isCurrentUser={member.account_id === currentUserAccountId || isManager} /></div>
                </div>
              ))}
            </div>
          </CardContent>
          <Separator />
          <CardFooter className="pt-6 flex justify-between items-center gap-4"><span className="text-xs text-muted-foreground">Need to leave?</span><TeamLeaveButton action={leaveTeam} title="Paper Competition" /></CardFooter>
        </Card>

        {/* --- STEP 2: PAYMENT --- */}
        {isPaymentLocked ? (
            <LockedSection 
                step="STEP 2" 
                title="Payment" 
                description="Upload proof of payment." 
                subtext="Unlocks after member verification." 
                borderColorClass="border-l-emerald-500" 
            />
        ) : (
            <PaymentSection 
              paymentProofUrl={team.pp_link}
              ppVerified={team.pp_verified}
              step="STEP 3"
              className="border-l-emerald-500" 
              stepBadgeClassName="bg-emerald-600 hover:bg-emerald-700" 
              paymentMethods={[
                  {
                    bankName: "BCA",
                    accountNumber: "4490380731",
                    accountHolder: "Dippo Haryo Satriyo Ditho"
                  },
                  {
                    bankName: "Mandiri",
                    accountNumber: "1610015784197",
                    accountHolder: "Rihhadatul Aisy"
                  }
                ]}
              price="Rp7.500.000"
              uploadAction={updateBilling}
            />
        )}

        {/* --- STEP 3: SUBMISSION & ORIGINALITY --- */}
        {isSubmissionLocked ? (
            <LockedSection 
                step="STEP 3" 
                title="Submission & Originality" 
                description="Submit originality proof and abstract." 
                subtext="Unlocks after Payment acceptance." 
                borderColorClass="border-l-indigo-500" 
            />
        ) : (
            <SubmissionSection
                sdLink={team.sd_link} 
                sdd={team.sdd} 
                subVerified={team.sub_verified}
                odLink={team.od_link}
                odVerified={team.od_verified}
                step="STEP 3" 
                className="border-l-indigo-500 shadow-sm" 
            />
        )}

      </div>
    </div>
  );
}