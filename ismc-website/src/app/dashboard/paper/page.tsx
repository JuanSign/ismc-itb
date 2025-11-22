import { getTeamPageData, leaveTeam, updateBilling } from "@/actions/server/paper";
import { TeamLeaveButton } from "@/components/Competition/general/TeamLeaveButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TeamStatusBadge } from "@/components/Competition/general/TeamStatusBadge";

// Ensure you have this component shared, or replace with the local LockedSection logic if not
import { LockedStep } from "@/components/LockedSection/LockedStep"; 

import { TeamMemberDialog } from "@/components/Competition/paper/TeamMemberDialog";
import { PaymentSection } from "@/components/Competition/general/PaymentSection";
import { MemberStatusBadge } from "@/components/Competition/general/MemberStatusBadge";
import { SubmissionSection } from "@/components/Competition/paper/SubmissionSection";

// --- Helper: Initials ---
function getInitials(name: string | null, email: string) {
  if (name) { 
    const names = name.split(' '); 
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : name.substring(0, 2); 
  }
  return email.substring(0, 2);
}

// --- Helper: Status Text ---
const getTeamStatusText = (status: number) => {
  switch (status) { 
    case 0: return "Waiting for Verification"; 
    case 1: return "Waiting for Documents"; 
    case 2: return "Waiting for Payment"; 
    case 3: return "Waitlisted"; 
    case 4: return "Accepted"; 
    default: return "Unknown"; 
  }
};

// SHARED GLASS STYLE
const GLASS_CARD = "bg-slate-950/60 backdrop-blur-md border-white/10 text-slate-100 shadow-xl";

export default async function PaperTeamPage() {
  const { team, members, currentUserAccountId } = await getTeamPageData();
  
  const teamStatus: number = team.status as number;
  const teamStatusText = getTeamStatusText(teamStatus);
  
  const currentUser = members.find(m => m.account_id === currentUserAccountId);
  const isManager = currentUser?.role === 'MANAGER';

  const isPaymentLocked = teamStatus === 0; 
  const isSubmissionLocked = teamStatus < 2;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        
        {/* --- STEP 1: TEAM INFO --- */}
        <Card className={`border-l-4 border-l-blue-600 ${GLASS_CARD}`}>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white">STEP 1</Badge>
                        <span className="text-sm font-medium text-slate-400">Team Verification</span>
                    </div>
                    <CardTitle className="text-2xl truncate text-white">{team.name}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2 flex-wrap text-slate-400">
                        Team Code: <span className="font-mono text-yellow-400 font-bold bg-white/10 px-1.5 rounded border border-white/5">{team.code}</span>
                    </CardDescription>
                </div>
                <div className="flex flex-row md:flex-col items-center md:items-end gap-2 w-full md:w-auto justify-between md:justify-start">
                    <div className="px-3 py-1 text-xs font-medium text-blue-200 border border-blue-500/30 rounded-md bg-blue-500/10 text-center">
                        {teamStatusText}
                    </div>
                    <TeamStatusBadge status={teamStatus} notes={team.notes} />
                </div>
            </div>
          </CardHeader>
          
          <Separator className="bg-white/10" />
          
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">
                    Members
                </h4>
            </div>
            <div className="flex flex-col gap-3">
              {members.map((member) => (
                <div key={member.account_id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="shrink-0 h-10 w-10 border border-white/10">
                        <AvatarImage src={member.fp_link || ""} />
                        <AvatarFallback className="bg-slate-800 text-slate-200 text-xs">
                            {getInitials(member.name, member.email).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm flex items-center gap-1.5 flex-wrap text-slate-200">
                        <span className="truncate block max-w-[120px] sm:max-w-[200px]">
                            {member.name || member.email}
                        </span>
                        {member.account_id === currentUserAccountId && (
                            <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded border border-blue-500/30 shrink-0">YOU</span>
                        )}
                        {member.role === 'MANAGER' && (
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded shrink-0">MANAGER</span>
                        )}
                      </div>
                      {member.name && (
                        <p className="text-xs text-slate-400 truncate">{member.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <MemberStatusBadge status={member.status} notes={member.notes}/>
                    <TeamMemberDialog member={member} isCurrentUser={member.account_id === currentUserAccountId || isManager} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          
          <Separator className="bg-white/10" />
          
          <CardFooter className="pt-6 flex justify-between items-center gap-4">
            <span className="text-xs text-slate-400">Need to leave?</span>
            <TeamLeaveButton action={leaveTeam} title="Paper Competition" />
          </CardFooter>
        </Card>

        {/* --- STEP 2: PAYMENT --- */}
        {isPaymentLocked ? (
            <LockedStep 
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
              step="STEP 2"
              className={`border-l-emerald-500 ${GLASS_CARD}`} 
              stepBadgeClassName="bg-emerald-600 hover:bg-emerald-700 text-white" 
              paymentMethods={[
                  {
                    bankName: "BCA",
                    accountNumber: "4490380731",
                    accountHolder: "Dippo Haryo Satriyo Ditho"
                  },
                ]}
              price="Rp150.000"
              uploadAction={updateBilling}
            />
        )}

        {/* --- STEP 3: SUBMISSION & ORIGINALITY --- */}
        {isSubmissionLocked ? (
            <LockedStep 
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
                className={`border-l-indigo-500 ${GLASS_CARD}`} 
            />
        )}

      </div>
    </div>
  );
}