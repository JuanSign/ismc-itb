import { getPhotoPageData, leavePhoto, updateBilling } from "@/actions/server/photo";
import { TeamLeaveButton } from "@/components/Competition/general/TeamLeaveButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TeamStatusBadge } from "@/components/Competition/general/TeamStatusBadge";

import { PhotoMemberDialog } from "@/components/Competition/photo/MemberDialog";
import { PaymentSection } from "@/components/Competition/general/PaymentSection";
import { PhotoSubmissionSection } from "@/components/Competition/photo/SubmissionSection";
import { MemberStatusBadge } from "@/components/Competition/general/MemberStatusBadge";

// --- SHARED GLASS STYLE ---
const GLASS_CARD = "bg-slate-950/60 backdrop-blur-md border-white/10 text-slate-100 shadow-xl";

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
        "bg-slate-950/40 border-dashed border-white/10 opacity-80 border-l-4",
        borderColorClass 
    )}>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Badge variant="outline" className="bg-transparent border-white/20 text-slate-400">
                {step}
            </Badge>
            <Badge variant="secondary" className="text-xs bg-slate-800 text-slate-300 hover:bg-slate-800">
                <Lock className="w-3 h-3 mr-1" /> Locked
            </Badge>
        </div>
        <CardTitle className="text-xl text-slate-200">
            {title}
        </CardTitle>
        <CardDescription className="text-base text-slate-500">
          {description}
        </CardDescription>
      </CardHeader>
      {subtext && (
        <CardContent>
            <Alert variant="default" className="bg-slate-900/50 text-slate-400 border-white/10">
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

const getStatusText = (status: number) => {
  switch (status) { case 0: return "Waiting for Verification"; case 1: return "Waiting for Payment"; case 2: return "Waiting for Submission"; case 3: return "Waitlisted"; case 4: return "Accepted"; default: return "Unknown"; }
};

export default async function PhotoPage() {
  const { member } = await getPhotoPageData();
  const status = member.status ?? 0;

  const isDocsVerified = member.sc_verified === 2 && member.fp_verified === 2;
  const isPaymentVerified = member.pp_verified === 2;

  const isPaymentLocked = !isDocsVerified;
  const isSubmissionLocked = !isPaymentVerified;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        
        {/* --- STEP 1: PARTICIPANT INFO --- */}
        <Card className={`border-l-4 border-l-blue-600 ${GLASS_CARD}`}>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white">STEP 1</Badge>
                        <span className="text-sm font-medium text-slate-400">Participant Verification</span>
                    </div>
                    <CardTitle className="text-2xl truncate text-white">{member.name || "Participant"}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2 flex-wrap text-slate-400">
                        {member.institution || "No Institution Set"}
                    </CardDescription>
                </div>
                <div className="flex flex-row md:flex-col items-center md:items-end gap-2 w-full md:w-auto justify-between md:justify-start">
                    <div className="px-3 py-1 text-xs font-medium text-blue-200 border border-blue-500/30 rounded-md bg-blue-500/10 text-center">
                        {getStatusText(status)}
                    </div>
                    <TeamStatusBadge status={status} notes={member.notes} />
                </div>
            </div>
          </CardHeader>
          
          <Separator className="bg-white/10" />
          
          <CardContent className="pt-6">
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
                        <span className="truncate block max-w-[120px] sm:max-w-[200px]">{member.name || member.email}</span>
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded border border-blue-500/30 shrink-0">
                            YOU
                        </span>
                      </div>
                      {member.name && <p className="text-xs text-slate-400 truncate">{member.email}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <MemberStatusBadge status={status} notes={member.notes}/>
                    <PhotoMemberDialog member={member} />
                  </div>
                </div>
          </CardContent>
          
          <Separator className="bg-white/10" />
          
          <CardFooter className="pt-6 flex justify-between items-center gap-4">
            <span className="text-xs text-slate-400">Need to leave?</span>
            <TeamLeaveButton action={leavePhoto} title="Photo Competition" />
          </CardFooter>
        </Card>

        {/* --- STEP 2: PAYMENT --- */}
        {isPaymentLocked ? (
            <LockedSection 
                step="STEP 2" 
                title="Payment" 
                description="Upload proof of payment." 
                subtext="Unlocks after verified participant details." 
                borderColorClass="border-l-emerald-500" 
            />
        ) : (
            <PaymentSection 
              paymentProofUrl={member.pp_link}
              ppVerified={member.pp_verified}
              step="STEP 2"
              className={`border-l-emerald-500 ${GLASS_CARD}`}
              stepBadgeClassName="bg-emerald-600 hover:bg-emerald-700 text-white" 
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
                description="Submit originality proof and photo." 
                subtext="Unlocks after Payment acceptance." 
                borderColorClass="border-l-indigo-500" 
            />
        ) : (
            <PhotoSubmissionSection 
                sdLink={member.sd_link} 
                sdd={member.sdd} 
                subVerified={member.sub_verified}
                odLink={member.od_link}
                odVerified={member.od_verified}
                step="STEP 3" 
                className={`border-l-indigo-500 ${GLASS_CARD}`}
            />
        )}

      </div>
    </div>
  );
}