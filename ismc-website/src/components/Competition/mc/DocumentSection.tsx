"use client";

import React from "react";
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

// --- Verification Badge Component ---
function VerificationBadge({ status }: { status: number | null }) {
  const config = {
    0: { icon: <Hourglass className="h-4 w-4" />, className: "text-yellow-600 bg-yellow-50 border-yellow-300" },
    1: { icon: <XCircle className="h-4 w-4" />, className: "text-destructive bg-destructive/10 border-destructive/50" },
    2: { icon: <CheckCircle2 className="h-4 w-4" />, className: "text-emerald-600 bg-emerald-50 border-emerald-400" },
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

const PARTICIPANT_STATEMENT_URL = "/files/templates/statement-of-participants.pdf";
const OFFICIAL_STATEMENT_URL = "/files/templates/official-statement.pdf";

export function DocumentsSection({
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
  return (
    <Card className={cn("border-l-4", className)}> 
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-background">{step}</Badge>
            <span className="text-sm font-medium text-muted-foreground">Required Documents</span>
        </div>
        <CardTitle>Uploading Core Documents</CardTitle>
        <CardDescription>
          Download the templates, fill them out, and upload the PDF versions here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Download Section */}
        <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-lg border border-dashed">
          <h4 className="font-medium text-sm text-muted-foreground">Download Templates</h4>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm" className="bg-background">
                <a href={PARTICIPANT_STATEMENT_URL} download>
                <Download className="mr-2 h-4 w-4" /> Statement of Participants (SP)
                </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="bg-background">
                <a href={OFFICIAL_STATEMENT_URL} download>
                <Download className="mr-2 h-4 w-4" /> Official Letter (OL)
                </a>
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="flex flex-col gap-4">
          <FileUploaderField
            name="doc_statement_participants"
            label="Statement of Participants (SP)"
            accept=".pdf"
            currentFileUrl={spLink}
            verificationBadge={<VerificationBadge status={spVerified} />}
            uploadAction={uploadTeamDocuments}
          />
          
          <FileUploaderField
            name="doc_official_statement"
            label="Official Letter (OL)"
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