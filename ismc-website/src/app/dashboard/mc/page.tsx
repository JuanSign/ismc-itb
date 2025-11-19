import { getTeamPageData } from "@/actions/server/mc";
import { TeamLeaveButton } from "@/components/Competition/mc/TeamLeaveButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TeamMemberDialog } from "@/components/Competition/mc/TeamMemberDialog";
import { PaymentSection } from "@/components/Competition/mc/PaymentSection";
import { DocumentsSection } from "@/components/Competition/mc/DocumentSection";
import { HealthDocsSection } from "@/components/Competition/mc/HealthDocsSection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TeamStatusBadge } from "@/components/Competition/mc/TeamStatusBadge";
import { MemberStatusBadge } from "@/components/Competition/mc/MemberStatusBadge";

// --- Helper: Initials ---
function getInitials(name: string | null, email: string) {
  if (name) {
    const names = name.split(' ');
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`
      : name.substring(0, 2);
  }
  return email.substring(0, 2);
}

// --- Helper: Locked Section ---
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

// --- Helper: Status Text ---
const getTeamStatusText = (status: number) => {
  switch (status) {
    case 0: return "Waiting for Team Member Verification";
    case 1: return "Waiting for Core Document Uploads and Verification";
    case 2: return "Waiting for Payment";
    case 3: return "Waitlisted";
    case 4: return "Accepted";
    default: return "Unknown Status";
  }
};

export default async function TeamPage() {
  const { team, members, currentUserAccountId } = await getTeamPageData();

  const teamStatus: number = team.status as number;
  const teamStatusText = getTeamStatusText(teamStatus);

  const currentUser = members.find(m => m.account_id === currentUserAccountId);
  const isManager = currentUser?.role === 'MANAGER';

  // Locking Logic based on Status
  const isDocsLocked = teamStatus === 0; 
  const isPaymentLocked = teamStatus < 2; 
  const isHealthDocsLocked = teamStatus < 3; 

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        
        {/* --- STEP 1: TEAM INFO (Blue Shadow) --- */}
        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-600 hover:bg-blue-700">STEP 1</Badge>
                        <span className="text-sm font-medium text-muted-foreground">Team Verification</span>
                    </div>
                    <CardTitle className="text-2xl">{team.name}</CardTitle>
                    <CardDescription className="mt-1">
                    Team Code: <span className="font-mono text-foreground font-bold bg-muted px-1 rounded">{team.code}</span>
                    </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="px-3 py-1 text-xs font-medium text-secondary-foreground border rounded-md bg-secondary/50">
                      {teamStatusText}
                    </div>
                    <TeamStatusBadge 
                      status={teamStatus} 
                      notes={team.notes} 
                    />
                </div>
            </div>
          </CardHeader>
          
          <Separator />

          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">
                Members
                </h4>
            </div>
            
            <div className="flex flex-col gap-3">
              {members.map((member) => (
                <div key={member.account_id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={member.fp_link || ""} alt={member.name || "Member"} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(member.name, member.email).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {member.name || member.email}
                        {member.account_id === currentUserAccountId && (
                          <span className="text-xs text-blue-600 font-bold ml-2">(You)</span>
                        )}
                        {member.role === 'MANAGER' && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-2">Manager</span>
                        )}
                      </p>
                      {member.name && (
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MemberStatusBadge status={member.status} notes={member.notes}/>
                    <TeamMemberDialog 
                      member={member}
                      isCurrentUser={member.account_id === currentUserAccountId || isManager}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>

          <Separator />

          <CardFooter className="pt-6 flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
                Need to leave? Warning: This cannot be undone if you are the last member.
            </span>
            <TeamLeaveButton />
          </CardFooter>
        </Card>


        {/* --- STEP 2: CORE DOCUMENTS (Orange Shadow) --- */}
        {isDocsLocked ? (
            <LockedSection 
              step="STEP 2"
              title="Uploading Core Documents (SP & OL)"
              description="Upload your Statement of Participants and Official Letter."
              subtext="This step will unlock after all required team member details are accepted by the admin."
              borderColorClass="border-l-orange-500"
            />
        ) : (
            <DocumentsSection 
              spLink={team.sp_link}
              olLink={team.ol_link}
              spVerified={team.sp_verified} 
              olVerified={team.ol_verified}
              step="STEP 2"
              className="border-l-orange-500 shadow-sm" 
            />
        )}

        {/* --- STEP 3: PAYMENT (Green/Teal Shadow) --- */}
        {isPaymentLocked ? (
            <LockedSection 
              step="STEP 3"
              title="Payment"
              description="Upload your proof of payment for the registration fee."
              subtext={isDocsLocked 
                  ? "This step will unlock after all member details are accepted." 
                  : "This step will unlock after your Core Documents (SP & OL) are accepted."
              }
              borderColorClass="border-l-emerald-500"
            />
        ) : (
            <PaymentSection 
              paymentProofUrl={team.pp_link}
              ppVerified={team.pp_verified}
              step="STEP 3"
              className="border-l-emerald-500 shadow-sm" 
            />
        )}
        
        {/* --- STEP 4: HEALTH DOCUMENTS (Purple Shadow) --- */}
        {isHealthDocsLocked ? (
            <LockedSection 
              step="STEP 4"
              title="Health Documents (HD)"
              description="This is the final document submission step."
              subtext={"This step will unlock after your Payment Proof is accepted."}
              borderColorClass="border-l-indigo-500"
            />
        ) : (
            <HealthDocsSection 
              hdLink={team.hd_link}
              hdVerified={team.hd_verified}
              step="STEP 4"
              className="border-l-indigo-500 shadow-sm" 
            />
        )}
      </div>
    </div>
  );
}