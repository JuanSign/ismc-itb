"use client";

import { uploadTeamDocuments } from "@/actions/server/mc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Hourglass, XCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileUploaderField } from "@/components/FileUploaderField/FileUploaderField";

// --- Verification Badge Component (Dark Mode Adapted) ---
function VerificationBadge({ status }: { status: number | null }) {
  const config = {
    // Lighter colors for dark background
    0: { icon: <Hourglass className="h-4 w-4" />, className: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
    1: { icon: <XCircle className="h-4 w-4" />, className: "text-red-400 bg-red-400/10 border-red-400/20" },
    2: { icon: <CheckCircle2 className="h-4 w-4" />, className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  }[status ?? 0] || { icon: null, className: "" };

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("h-8 w-8 p-0 cursor-default hover:bg-transparent", config.className)}
      disabled
    >
      {config.icon}
    </Button>
  );
}

const PARTICIPANT_STATEMENT_URL = `${process.env.NEXT_PUBLIC_CDN_URL}/mc/participant_statement.docx`;
const OFFICIAL_STATEMENT_URL = `${process.env.NEXT_PUBLIC_CDN_URL}/mc/official_statement.docx`;

export function CoreDocumentsSection({
  spLink,
  olLink,
  spVerified,
  olVerified,
  step = "STEP 2",
  className,
}: {
  spLink: string | null;
  olLink: string | null;
  spVerified: number;
  olVerified: number;
  step?: string;
  className?: string;
}) {
  // Glass Card Style
  const cardClass = "bg-slate-950/60 backdrop-blur-md border-white/10 text-slate-100 shadow-xl";

  return (
    <Card className={cn("border-l-4", cardClass, className)}> 
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-orange-500 hover:bg-orange-400 text-white">{step}</Badge>
          <span className="text-sm font-medium text-slate-400">Core Documents</span>
        </div>
        <CardTitle className="text-white">Uploading Core Documents</CardTitle>
        <CardDescription className="text-slate-400">
          Download the templates, fill them out, and upload the PDF versions here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Download Section - Darker BG */}
        <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-lg border border-white/10 border-dashed">
          <h4 className="font-medium text-sm text-slate-300">Download Templates</h4>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm" className="bg-transparent border-white/20 text-slate-200 hover:bg-white/10 hover:text-white">
                <a href={PARTICIPANT_STATEMENT_URL} download>
                <Download className="mr-2 h-4 w-4" /> Statement of Participants
                </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="bg-transparent border-white/20 text-slate-200 hover:bg-white/10 hover:text-white">
                <a href={OFFICIAL_STATEMENT_URL} download>
                <Download className="mr-2 h-4 w-4" /> Official Letter
                </a>
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="flex flex-col gap-4">
          <FileUploaderField
            name="doc_statement_participants"
            label="Statement of Participants"
            accept=".pdf"
            currentFileUrl={spLink}
            verificationBadge={<VerificationBadge status={spVerified} />}
            uploadAction={uploadTeamDocuments}
          />
          
          <FileUploaderField
            name="doc_official_statement"
            label="Official Letter"
            accept=".pdf"
            currentFileUrl={olLink}
            verificationBadge={<VerificationBadge status={olVerified} />}
            uploadAction={uploadTeamDocuments}
          />
        </div>
      </CardContent>
    </Card>
  );
}